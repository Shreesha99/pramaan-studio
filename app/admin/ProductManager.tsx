"use client";

import { useEffect, useState, useRef } from "react";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, getStorage } from "firebase/storage";
import { db } from "@/lib/firebase";
import { useToast } from "@/context/ToastContext";
import gsap from "gsap";

const storage = getStorage();

/** Reusable GSAP Loading Button */
function GsapButton({
  onClick,
  loading,
  disabled,
  text,
  loadingText,
  className = "",
}: {
  onClick: () => void | Promise<void>;
  loading: boolean;
  disabled?: boolean;
  text: string;
  loadingText: string;
  className?: string;
}) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading && barRef.current) {
      gsap.fromTo(
        barRef.current,
        { x: "-100%" },
        { x: "100%", duration: 1.2, ease: "linear", repeat: -1 }
      );
    } else {
      gsap.killTweensOf(barRef.current);
      gsap.set(barRef.current, { x: "-100%" });
    }
  }, [loading]);

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`relative overflow-hidden rounded-full font-semibold transition
        ${disabled || loading ? "opacity-70 cursor-not-allowed" : ""}
        ${className}
      `}
    >
      {/* sliding fill */}
      <div
        ref={barRef}
        className="absolute inset-0 bg-white/20 pointer-events-none"
        aria-hidden
      />
      <span className="relative z-10">{loading ? loadingText : text}</span>
    </button>
  );
}

export default function ProductManager() {
  const { showToast } = useToast();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ New product form
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category: "",
    featured: false,
    hasColors: false,
    showProduct: true,
  });

  const [activeProduct, setActiveProduct] = useState<any | null>(null);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // 🎨 Color Management
  const [colorName, setColorName] = useState("");
  const [stock, setStock] = useState<number>(0);
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);

  const [availableColors, setAvailableColors] = useState<string[]>([
    "Red",
    "Green",
    "Yellow",
    "Blue",
    "Maroon",
    "White",
    "Black",
  ]);
  const [addingNewColor, setAddingNewColor] = useState(false);
  const [newColorInput, setNewColorInput] = useState("");

  // 🏷️ Category Management
  const [categories, setCategories] = useState<string[]>([
    "T-Shirts",
    "Pants",
    "Shoes",
    "Accessories",
  ]);
  const [addingNewCategory, setAddingNewCategory] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [editFiles, setEditFiles] = useState<FileList | null>(null);
  const [editUploading, setEditUploading] = useState(false);

  // 🔁 Button loading states (for GSAP)
  const [addingProductLoading, setAddingProductLoading] = useState(false);
  const [addingCategoryLoading, setAddingCategoryLoading] = useState(false);
  const [addingColorLoading, setAddingColorLoading] = useState(false);

  // 🧾 Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      const q = await getDocs(collection(db, "products"));
      const list = q.docs.map((d) => ({ id: d.id, ...d.data() }));
      setProducts(list);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  // ➕ Add Product
  const handleAddProduct = async () => {
    if (!newProduct.name.trim() || !newProduct.price) {
      showToast("Please fill product name and price.", "info");
      return;
    }

    if (!newProduct.category) {
      showToast("Please select a category.", "info");
      return;
    }

    try {
      setAddingProductLoading(true);
      const docRef = await addDoc(collection(db, "products"), {
        ...newProduct,
        price: Number(newProduct.price),
        variants: {},
      });

      showToast("Product added successfully!", "success");
      setProducts((prev) => [
        ...prev,
        { id: docRef.id, ...newProduct, variants: {} },
      ]);
      setNewProduct({
        name: "",
        price: "",
        category: "",
        featured: false,
        hasColors: false,
        showProduct: true,
      });
    } catch (err) {
      console.error(err);
      showToast("Failed to add product.", "error");
    } finally {
      setAddingProductLoading(false);
    }
  };

  // 🗑️ Delete Product (NO animation per your request)
  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, "products", id));
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast("Product deleted successfully.", "success");
    } catch {
      showToast("Failed to delete product.", "error");
    }
  };

  // ✏️ Update Product Name
  const handleUpdateName = async (p: any, newName: string) => {
    try {
      const refDoc = doc(db, "products", p.id);
      await updateDoc(refDoc, { name: newName });
      setProducts((prev) =>
        prev.map((item) =>
          item.id === p.id ? { ...item, name: newName } : item
        )
      );
      showToast("Product name updated!", "success");
    } catch {
      showToast("Failed to update product.", "error");
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    try {
      setEditUploading(true);
      let uploadedUrls: string[] = editingProduct.images || [];

      if (editFiles && editFiles.length > 0) {
        const urls: string[] = [];
        for (const file of Array.from(editFiles)) {
          const path = `products/${editingProduct.id}/main/${file.name}`;
          const storageRef = ref(storage, path);
          await uploadBytes(storageRef, file);
          const url = await getDownloadURL(storageRef);
          urls.push(url);
        }
        uploadedUrls = urls;
      }

      const refDoc = doc(db, "products", editingProduct.id);
      await updateDoc(refDoc, {
        name: editingProduct.name,
        price: Number(editingProduct.price),
        category: editingProduct.category,
        featured: editingProduct.featured,
        hasColors: editingProduct.hasColors,
        showProduct: editingProduct.showProduct,
        stock: Number(editingProduct.stock || 0),
        images: uploadedUrls,
      });

      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? { ...editingProduct, images: uploadedUrls }
            : p
        )
      );
      setEditingProduct(null);
      setEditFiles(null);
      setEditUploading(false);
      showToast("Product updated successfully!", "success");
    } catch (err) {
      console.error(err);
      setEditUploading(false);
      showToast("Failed to update product.", "error");
    }
  };

  // ➕ Add New Category
  const handleAddNewCategory = async () => {
    if (!newCategoryInput.trim()) {
      showToast("Please enter a category name.", "info");
      return;
    }
    const cat = newCategoryInput.trim();
    if (categories.includes(cat)) {
      showToast("Category already exists.", "info");
      return;
    }

    try {
      setAddingCategoryLoading(true);
      // (If you later persist categories to Firestore, do it here)
      setCategories((prev) => [...prev, cat]);
      setNewProduct((prev) => ({ ...prev, category: cat }));
      setNewCategoryInput("");
      setAddingNewCategory(false);
      showToast(`${cat} added to category list!`, "success");
    } finally {
      setAddingCategoryLoading(false);
    }
  };

  // ➕ Add New Color
  const handleAddNewColor = async () => {
    if (!newColorInput.trim()) {
      showToast("Please enter a color name.", "info");
      return;
    }
    const color = newColorInput.trim();
    if (availableColors.includes(color)) {
      showToast("Color already exists.", "info");
      return;
    }

    try {
      setAddingColorLoading(true);
      setAvailableColors((prev) => [...prev, color]);
      setColorName(color);
      setNewColorInput("");
      setAddingNewColor(false);
      showToast(`${color} added to color list!`, "success");
    } finally {
      setAddingColorLoading(false);
    }
  };

  // 🎨 Add Color Variant
  const handleAddColorVariant = async () => {
    if (!activeProduct) return;
    if (!colorName.trim() || !stock || !files?.length) {
      showToast("Please select color, stock, and upload image.", "info");
      return;
    }

    try {
      setUploading(true);
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const path = `products/${activeProduct.id}/${colorName}/${file.name}`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        uploadedUrls.push(url);
      }

      const productRef = doc(db, "products", activeProduct.id);
      await updateDoc(productRef, {
        [`variants.${colorName}`]: { stock, images: uploadedUrls },
      });

      setProducts((prev) =>
        prev.map((p) =>
          p.id === activeProduct.id
            ? {
                ...p,
                variants: {
                  ...p.variants,
                  [colorName]: { stock, images: uploadedUrls },
                },
              }
            : p
        )
      );

      showToast(`${colorName} variant added successfully!`, "success");
      setColorName("");
      setStock(0);
      setFiles(null);
      setUploading(false);
    } catch (err) {
      console.error(err);
      showToast("Failed to upload variant.", "error");
      setUploading(false);
    }
  };

  // 🧾 Update Stock of Existing Color
  const handleUpdateStock = async (
    productId: string,
    color: string,
    newStock: number
  ) => {
    try {
      const refDoc = doc(db, "products", productId);
      const product = products.find((p) => p.id === productId);
      if (!product) return;
      const updatedVariants = {
        ...product.variants,
        [color]: { ...product.variants[color], stock: newStock },
      };
      await updateDoc(refDoc, { variants: updatedVariants });
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, variants: updatedVariants } : p
        )
      );
      showToast(`${color} stock updated!`, "success");
    } catch {
      showToast("Failed to update stock.", "error");
    }
  };

  const handleDeleteColor = async (productId: string, color: string) => {
    try {
      const refDoc = doc(db, "products", productId);
      const product = products.find((p) => p.id === productId);
      if (!product) return;

      const updatedVariants = { ...product.variants };
      delete updatedVariants[color];

      await updateDoc(refDoc, { variants: updatedVariants });

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, variants: updatedVariants } : p
        )
      );

      showToast(`${color} variant deleted successfully.`, "success");
    } catch {
      showToast("Failed to delete color.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <h1 className="text-3xl font-bold mb-8 text-center">
        🧩 Product Management
      </h1>

      {/* ➕ Add Product */}
      <div className="max-w-3xl mx-auto mb-10 bg-white shadow-md p-6 rounded-xl border">
        <h2 className="text-xl font-semibold mb-4">Add New Product</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Product Name"
            value={newProduct.name}
            onChange={(e) =>
              setNewProduct({ ...newProduct, name: e.target.value })
            }
            className="px-3 py-2 border rounded-md text-sm"
          />
          <input
            type="number"
            placeholder="Price"
            value={newProduct.price}
            onChange={(e) =>
              setNewProduct({ ...newProduct, price: e.target.value })
            }
            className="px-3 py-2 border rounded-md text-sm"
          />
        </div>

        {/* Category Dropdown */}
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={newProduct.category}
            onChange={(e) => {
              if (e.target.value === "__new__") {
                setAddingNewCategory(true);
              } else {
                setNewProduct({ ...newProduct, category: e.target.value });
                setAddingNewCategory(false);
              }
            }}
            className="w-full px-3 py-2 border rounded-md text-sm"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            <option value="__new__">➕ Add New Category</option>
          </select>

          {addingNewCategory && (
            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                placeholder="New category name"
                value={newCategoryInput}
                onChange={(e) => setNewCategoryInput(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md text-sm"
              />
              <GsapButton
                onClick={handleAddNewCategory}
                loading={addingCategoryLoading}
                disabled={!newCategoryInput.trim()}
                text="Add"
                loadingText="Adding..."
                className="px-4 py-2 bg-black text-white text-sm"
              />
            </div>
          )}
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 mt-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={newProduct.featured}
              onChange={(e) =>
                setNewProduct({ ...newProduct, featured: e.target.checked })
              }
            />
            Featured
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={newProduct.hasColors}
              onChange={(e) =>
                setNewProduct({ ...newProduct, hasColors: e.target.checked })
              }
            />
            Has Colors
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={newProduct.showProduct}
              onChange={(e) =>
                setNewProduct({ ...newProduct, showProduct: e.target.checked })
              }
            />
            Show Product
          </label>
        </div>

        <GsapButton
          onClick={handleAddProduct}
          loading={addingProductLoading}
          disabled={
            !newProduct.name.trim() || !newProduct.price || !newProduct.category
          }
          text="Add Product"
          loadingText="Adding..."
          className="mt-5 px-6 py-2 bg-black text-white text-sm"
        />
      </div>

      {/* 🧱 Product Grid */}
      {loading ? (
        <p className="text-center text-gray-500">Loading products...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white p-6 rounded-xl shadow-sm border flex flex-col relative"
            >
              <button
                onClick={() => handleDeleteProduct(p.id)}
                className="absolute top-3 right-3 text-xs text-red-500 hover:text-red-700"
                title="Delete product"
              >
                ✕
              </button>

              <input
                type="text"
                defaultValue={p.name}
                onBlur={(e) => handleUpdateName(p, e.target.value)}
                className="font-semibold text-lg mb-3 border-b border-gray-200 focus:outline-none focus:border-black"
              />

              <p className="text-sm text-gray-600 mb-1">
                Category: <b>{p.category}</b>
              </p>
              <p className="text-sm text-gray-500 mb-2">₹{p.price}</p>
              <p className="text-xs text-gray-400 mb-3">
                {p.featured ? "🌟 Featured" : ""}{" "}
                {p.showProduct ? "🟢 Visible" : "🔴 Hidden"}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => setEditingProduct(p)}
                  className="flex-1 border border-gray-200 text-xs rounded-full py-1 hover:bg-gray-100"
                >
                  Edit
                </button>
                {p.hasColors && (
                  <button
                    onClick={() => setActiveProduct(p)}
                    className="flex-1 bg-black text-white rounded-full text-xs py-1 hover:bg-gray-900"
                  >
                    Colors
                  </button>
                )}
              </div>

              {p.variants && (
                <div className="mt-4 space-y-2">
                  {Object.entries(p.variants).map(([color, v]: any) => (
                    <div
                      key={color}
                      className="text-sm flex justify-between items-center"
                    >
                      <span>
                        <b>{color}</b> —{" "}
                        <input
                          type="number"
                          defaultValue={v.stock}
                          onBlur={(e) =>
                            handleUpdateStock(p.id, color, +e.target.value)
                          }
                          className="w-12 border rounded px-1 text-xs"
                        />{" "}
                        in stock
                      </span>
                      <button
                        onClick={() => handleDeleteColor(p.id, color)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ✏️ Product Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-[400px]">
            <h2 className="text-lg font-semibold mb-4 text-center">
              Edit Product
            </h2>

            <input
              type="text"
              value={editingProduct.name}
              onChange={(e) =>
                setEditingProduct({ ...editingProduct, name: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md text-sm mb-2"
            />

            <input
              type="number"
              value={editingProduct.price}
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  price: e.target.value,
                })
              }
              className="w-full px-3 py-2 border rounded-md text-sm mb-2"
            />

            {!editingProduct.hasColors && (
              <input
                type="number"
                placeholder="Stock"
                value={editingProduct.stock || 0}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    stock: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border rounded-md text-sm mb-2"
              />
            )}

            {/* ✅ Upload product images */}
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setEditFiles(e.target.files)}
              className="hidden"
              id="edit-product-images"
            />
            <label
              htmlFor="edit-product-images"
              className="block w-full text-center border-2 border-dashed border-gray-300 py-3 rounded-md cursor-pointer hover:border-black transition text-sm text-gray-600 mb-4"
            >
              📁 Choose Product Images
            </label>

            {editFiles && editFiles.length > 0 && (
              <p className="mt-2 text-xs text-gray-500 text-center mb-2">
                {editFiles.length} file{editFiles.length > 1 ? "s" : ""}{" "}
                selected
              </p>
            )}

            <select
              value={editingProduct.category}
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  category: e.target.value,
                })
              }
              className="w-full px-3 py-2 border rounded-md text-sm mb-2"
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <label className="text-xs">
                <input
                  type="checkbox"
                  checked={editingProduct.featured}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      featured: e.target.checked,
                    })
                  }
                />{" "}
                Featured
              </label>
              <label className="text-xs">
                <input
                  type="checkbox"
                  checked={editingProduct.hasColors}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      hasColors: e.target.checked,
                    })
                  }
                />{" "}
                Has Colors
              </label>
              <label className="text-xs">
                <input
                  type="checkbox"
                  checked={editingProduct.showProduct}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      showProduct: e.target.checked,
                    })
                  }
                />{" "}
                Show Product
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEditingProduct(null)}
                disabled={editUploading}
                className={`flex-1 border border-gray-300 rounded-full py-2 text-sm ${
                  editUploading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-100"
                }`}
              >
                Cancel
              </button>

              <GsapButton
                onClick={handleUpdateProduct}
                loading={editUploading}
                disabled={false}
                text="Save"
                loadingText="Saving..."
                className="flex-1 bg-black text-white rounded-full py-2 text-sm font-medium"
              />
            </div>
          </div>
        </div>
      )}

      {/* 🎨 Color Modal */}
      {activeProduct && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 shadow-xl w-[95%] sm:w-[500px]">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Add Color for {activeProduct.name}
            </h2>

            <label className="block text-sm font-medium mb-1">Color</label>
            <select
              value={colorName}
              onChange={(e) => {
                if (e.target.value === "__new__") {
                  setAddingNewColor(true);
                  setColorName("");
                } else {
                  setColorName(e.target.value);
                  setAddingNewColor(false);
                }
              }}
              className="w-full mb-3 px-3 py-2 border rounded-md text-sm"
            >
              <option value="">Select Color</option>
              {availableColors.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value="__new__">➕ Add New Color</option>
            </select>

            {addingNewColor && (
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  placeholder="New color name"
                  value={newColorInput}
                  onChange={(e) => setNewColorInput(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md text-sm"
                />
                <GsapButton
                  onClick={handleAddNewColor}
                  loading={addingColorLoading}
                  disabled={!newColorInput.trim()}
                  text="Add"
                  loadingText="Adding..."
                  className="px-3 py-2 bg-black text-white rounded-md text-sm"
                />
              </div>
            )}

            <label className="block text-sm font-medium mb-1">
              Stock Quantity
            </label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
              className="w-full mb-4 px-3 py-2 border rounded-md text-sm"
            />

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setFiles(e.target.files)}
              className="hidden"
              id="color-images"
            />
            <label
              htmlFor="color-images"
              className="block w-full text-center border-2 border-dashed border-gray-300 py-3 rounded-md cursor-pointer hover:border-black transition text-sm text-gray-600 mb-4"
            >
              📁 Choose Images
            </label>

            {files && files.length > 0 && (
              <p className="mt-2 text-xs text-gray-500 text-center mb-4">
                {files.length} file{files.length > 1 ? "s" : ""} selected
              </p>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setActiveProduct(null)}
                className="flex-1 border border-gray-300 rounded-full py-2 text-sm hover:bg-gray-100"
              >
                Cancel
              </button>

              <GsapButton
                onClick={handleAddColorVariant}
                loading={uploading}
                disabled={!colorName || !stock || !files?.length}
                text="Save Color"
                loadingText="Uploading..."
                className="flex-1 bg-black text-white rounded-full py-2 text-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
