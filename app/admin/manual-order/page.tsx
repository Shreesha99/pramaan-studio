"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useToast } from "@/context/ToastContext";
import GsapButton from "@/components/GsapButton";

type ProductDoc = {
  id: string;
  name: string;
  price: number;
  images?: string[];
  hasColors?: boolean;
  variants?: Record<
    string,
    {
      images?: string[];
      sizes?: Record<string, number>;
    }
  >;
  gst?: { total?: number; cgst?: number; sgst?: number };
  [k: string]: any;
};

export default function ManualOrderPage() {
  const { showToast } = useToast();

  // products
  const [products, setProducts] = useState<ProductDoc[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // selection
  const [selectedProductId, setSelectedProductId] = useState("");
  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) || null,
    [products, selectedProductId]
  );

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState<number>(1);

  // customer
  const [customer, setCustomer] = useState({ name: "", phone: "" });

  // item customization & items list
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [items, setItems] = useState<any[]>([]);

  // UI states
  const [addingItem, setAddingItem] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // fetch products
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingProducts(true);
        const snap = await getDocs(collection(db, "products"));
        const docs: ProductDoc[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));
        if (!mounted) return;
        setProducts(docs);
      } catch (err) {
        console.error("Failed to load products", err);
        showToast("Failed to load products", "error");
      } finally {
        if (mounted) setLoadingProducts(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [showToast]);

  // derived lists
  const filteredProducts = products.filter((p) =>
    `${p.name}`.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  const availableColors = useMemo(() => {
    if (!selectedProduct?.variants) return [];
    return Object.keys(selectedProduct.variants);
  }, [selectedProduct]);

  const availableSizes = useMemo(() => {
    if (!selectedProduct || !selectedColor) return [];
    const sizesMap = selectedProduct.variants?.[selectedColor]?.sizes || {};
    return Object.keys(sizesMap);
  }, [selectedProduct, selectedColor]);

  const currentStock = useMemo(() => {
    if (!selectedProduct || !selectedColor || !selectedSize) return 0;
    return (
      selectedProduct.variants?.[selectedColor]?.sizes?.[selectedSize] ?? 0
    );
  }, [selectedProduct, selectedColor, selectedSize]);

  const priceForSelected = selectedProduct ? Number(selectedProduct.price) : 0;

  // helper: upload custom image and return URL
  const uploadCustomImage = async (file: File | null) => {
    if (!file) return "";
    const fileRef = ref(
      storage,
      `customized-orders/${Date.now()}-${file.name.replace(/\s+/g, "_")}`
    );
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  };

  // add item
  const handleAddItem = async () => {
    if (!selectedProduct) return showToast("Select a product", "error");
    if (!selectedColor) return showToast("Select a color", "error");
    if (!selectedSize) return showToast("Select a size", "error");
    if (!quantity || quantity <= 0) return showToast("Enter quantity", "error");
    if (quantity > currentStock)
      return showToast("Quantity exceeds available stock", "error");

    setAddingItem(true);
    try {
      const customUrl = await uploadCustomImage(customFile);
      const item: any = {
        productId: selectedProduct.id,
        name: selectedProduct.name,
        color: selectedColor,
        size: selectedSize,
        qty: quantity,
        price: priceForSelected,
        img:
          selectedProduct.variants?.[selectedColor]?.images?.[0] ??
          selectedProduct.images?.[0] ??
          "",
        customizedImage: customUrl || "", // NO undefined
        gst: selectedProduct.gst || { total: 0, cgst: 0, sgst: 0 }, // NO undefined
      };

      // 🔥 Only add customizedImage if actually there
      if (customUrl && customUrl !== "") {
        item.customizedImage = customUrl;
      }

      setItems((s) => [...s, item]);

      // reset selection for next item
      setSelectedProductId("");
      setSelectedColor("");
      setSelectedSize("");
      setQuantity(1);
      setCustomFile(null);

      showToast("Item added to order", "success");
    } catch (err) {
      console.error("Failed to add item", err);
      showToast("Failed to add item", "error");
    } finally {
      setAddingItem(false);
    }
  };

  // remove item
  const removeItem = (idx: number) =>
    setItems((s) => s.filter((_, i) => i !== idx));

  // find or create user by phone
  const getOrCreateUser = async () => {
    const phoneTrim = customer.phone.trim();
    const q = query(collection(db, "users"), where("phone", "==", phoneTrim));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return { id: snap.docs[0].id, data: snap.docs[0].data() };
    }
    const newUser = {
      name: customer.name.trim(),
      phone: phoneTrim,
      createdAt: new Date().toISOString(),
      adminCreated: true,
    };
    const docRef = await addDoc(collection(db, "users"), newUser);
    return { id: docRef.id, data: newUser };
  };

  // create order + deduct stock automatically
  const handleCreateOrder = async () => {
    if (!customer.name.trim()) return showToast("Enter customer name", "error");
    if (!customer.phone.trim())
      return showToast("Enter customer phone", "error");
    if (items.length === 0) return showToast("Add at least one item", "error");

    setSaving(true);
    try {
      // create or fetch user
      const { id: userId } = await getOrCreateUser();

      // totals
      const subTotal = items.reduce((s, it) => s + it.price * it.qty, 0);
      const gstTotal = items.reduce((s, it) => {
        const gstPercent = it.gst?.total ?? 0;
        return s + (it.price * it.qty * gstPercent) / 100;
      }, 0);
      const totalAmount = Number((subTotal + gstTotal).toFixed(2));

      const orderPayload: any = {
        userId,
        amount: totalAmount,
        currency: "INR",
        orderId: "M-" + Date.now(),
        createdAt: new Date().toISOString(),
        status: "Paid to Self",
        payment: {
          status: "Paid to Self",
          method: "Cash",
        },
        items: items.map((it) => {
          const cleaned: {
            productId: any;
            name: any;
            img: any;
            color: any;
            size: any;
            qty: any;
            price: any;
            gst: any;
            customizedImage?: string; // 👈 add this
          } = {
            productId: it.productId,
            name: it.name,
            img: it.img,
            color: it.color,
            size: it.size,
            qty: it.qty,
            price: it.price,
            gst: it.gst,
          };

          if (it.customizedImage) {
            cleaned.customizedImage = it.customizedImage;
          }

          return cleaned;
        }),

        shipping: {
          name: customer.name.trim(),
          phone: customer.phone.trim(),
          address: "Manual Entry",
          city: "Manual Entry",
          state: "Manual Entry",
          pincode: "000000",
        },

        meta: { manual: true, adminCreated: true },
        totals: {
          subTotal,
          gstTotal,
          totalAmount,
        },
      };

      // 🔥 Remove undefined in root
      Object.keys(orderPayload).forEach((k) => {
        if (orderPayload[k] === undefined) delete orderPayload[k];
      });

      // write order
      await addDoc(collection(db, "users", userId, "orders"), orderPayload);

      // deduct stock automatically
      for (const it of items) {
        const productRef = doc(db, "products", it.productId);
        const fieldPath = `variants.${it.color}.sizes.${it.size}`;
        await updateDoc(productRef, { [fieldPath]: increment(-it.qty) });
      }

      showToast("Order saved and stock updated (Paid to Self).", "success");

      // reset
      setCustomer({ name: "", phone: "" });
      setItems([]);
      setShowReviewModal(false);
    } catch (err) {
      console.error("Create order failed", err);
      showToast("Failed to create order", "error");
    } finally {
      setSaving(false);
    }
  };

  // summary numbers
  const subTotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const gstTotal = items.reduce((s, it) => {
    const gstPercent = it.gst?.total ?? 0;
    return s + (it.price * it.qty * gstPercent) / 100;
  }, 0);
  const totalAmount = Number((subTotal + gstTotal).toFixed(2));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">
        ➕ Manual Order (Paid to Self)
      </h1>

      {/* CUSTOMER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">
            Customer Name
          </label>
          <input
            value={customer.name}
            onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
            className="border px-3 py-2 rounded w-full"
            placeholder="Customer name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            value={customer.phone}
            onChange={(e) =>
              setCustomer({ ...customer, phone: e.target.value })
            }
            className="border px-3 py-2 rounded w-full"
            placeholder="Phone number"
          />
        </div>
      </div>

      {/* PRODUCT SELECT */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <h2 className="font-semibold mb-3">Select Product</h2>

        <div className="flex gap-3 items-center mb-3">
          <input
            className="border px-3 py-2 rounded w-full"
            placeholder="Search product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="text-sm text-gray-500">
            {loadingProducts ? "Loading..." : `${products.length} products`}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            value={selectedProductId}
            onChange={(e) => {
              setSelectedProductId(e.target.value);
              setSelectedColor("");
              setSelectedSize("");
            }}
            className="border px-3 py-2 rounded"
          >
            <option value="">-- Choose product --</option>
            {filteredProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — ₹{p.price}
              </option>
            ))}
          </select>

          <select
            value={selectedColor}
            onChange={(e) => {
              setSelectedColor(e.target.value);
              setSelectedSize("");
            }}
            className="border px-3 py-2 rounded"
            disabled={!selectedProduct || availableColors.length === 0}
          >
            <option value="">-- Color --</option>
            {availableColors.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="border px-3 py-2 rounded"
            disabled={!selectedColor || availableSizes.length === 0}
          >
            <option value="">-- Size --</option>
            {availableSizes.map((s) => (
              <option key={s} value={s}>
                {s} (
                {selectedProduct?.variants?.[selectedColor]?.sizes?.[s] ?? 0} in
                stock)
              </option>
            ))}
          </select>

          <input
            type="number"
            className="border px-3 py-2 rounded md:col-span-1"
            value={quantity}
            min={1}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />

          <div className="flex items-center gap-2">
            <div className="text-sm">
              Price: <strong>₹{priceForSelected?.toFixed(2)}</strong>
            </div>
            <div className="text-sm text-gray-500">
              Stock: <strong>{currentStock}</strong>
            </div>
          </div>

          <div className="md:col-span-3">
            <label className="block mb-1 text-sm">
              Custom design (optional)
            </label>
            <input
              type="file"
              onChange={(e) => setCustomFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="md:col-span-3 flex items-center gap-3">
            <div className="ml-auto">
              <GsapButton
                onClick={handleAddItem}
                loading={addingItem}
                disabled={!selectedProductId}
                text="Add Item"
                loadingText="Adding..."
                className="px-5 py-2 rounded-full bg-black text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ITEMS LIST */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Items ({items.length})</h3>
        {items.length === 0 && (
          <p className="text-sm text-gray-500">No items added yet.</p>
        )}
        <div className="space-y-3">
          {items.map((it, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 border rounded bg-white"
            >
              <div className="flex items-center gap-3">
                <img
                  src={it.img}
                  alt={it.name}
                  className="w-14 h-14 object-cover rounded"
                />
                <div>
                  <div className="font-medium">{it.name}</div>
                  <div className="text-sm text-gray-500">
                    {it.color} — {it.size} • {it.qty} × ₹{it.price}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm font-semibold">
                  ₹{(it.price * it.qty).toFixed(2)}
                </div>
                <button
                  onClick={() => removeItem(idx)}
                  className="text-sm text-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SUMMARY + REVIEW */}
      <div className="mb-6 bg-white border rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="text-sm">Subtotal: ₹{subTotal.toFixed(2)}</div>
          <div className="text-sm">GST: ₹{gstTotal.toFixed(2)}</div>
          <div className="font-semibold text-lg">
            Total: ₹{totalAmount.toFixed(2)}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setItems([]);
              showToast("Cleared items", "info");
            }}
            className="px-4 py-2 border rounded"
          >
            Clear items
          </button>

          <GsapButton
            onClick={() => {
              // validation before review
              if (!customer.name.trim())
                return showToast("Enter customer name", "error");
              if (!customer.phone.trim())
                return showToast("Enter customer phone", "error");
              if (items.length === 0)
                return showToast("Add at least one item", "error");
              setShowReviewModal(true);
            }}
            loading={false}
            text="Review Order"
            loadingText="Please wait..."
            className="px-5 py-2 rounded-full bg-black text-white"
          />
        </div>
      </div>

      {/* REVIEW MODAL */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowReviewModal(false)}
          />

          <div className="relative max-w-3xl w-full bg-white rounded-lg shadow-lg p-6 z-10">
            <h3 className="text-lg font-semibold mb-4">Confirm Manual Order</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium">Customer</h4>
                <p>{customer.name}</p>
                <p className="text-sm text-gray-500">{customer.phone}</p>
              </div>

              <div>
                <h4 className="font-medium">Totals</h4>
                <p>Subtotal: ₹{subTotal.toFixed(2)}</p>
                <p>GST: ₹{gstTotal.toFixed(2)}</p>
                <p className="font-semibold">
                  Total: ₹{totalAmount.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="mt-4 max-h-64 overflow-auto border rounded p-3 bg-gray-50">
              {items.map((it, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 border-b last:border-b-0"
                >
                  <div>
                    <div className="font-medium">{it.name}</div>
                    <div className="text-sm text-gray-500">
                      {it.color} • {it.size}
                    </div>
                    {it.customizedImage && (
                      <div className="text-xs text-gray-500">Customized</div>
                    )}
                  </div>
                  <div className="text-sm font-semibold">
                    ₹{(it.price * it.qty).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 border rounded"
                disabled={saving}
              >
                Cancel
              </button>

              <GsapButton
                onClick={handleCreateOrder}
                loading={saving}
                text="Confirm & Save Order"
                loadingText="Saving..."
                className="px-6 py-2 rounded-full bg-green-600 text-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
