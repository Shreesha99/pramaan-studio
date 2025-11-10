// app/admin/ProductManager/components/AddProductForm.tsx
"use client";
import { useEffect } from "react";
import GsapButton from "@/components/GsapButton";

export default function AddProductForm({
  newProduct,
  setNewProduct,
  categories,
  addingNewCategory,
  setAddingNewCategory,
  newCategoryInput,
  setNewCategoryInput,
  addingCategoryLoading,
  handleAddNewCategory,
  handleAddProduct,
  addingProductLoading,
  handleDeleteCategory,
}: any) {
  // default descriptions by category
  const defaultDescriptions: Record<string, string> = {
    "t-shirts":
      "Comfortable and breathable cotton t-shirt suitable for everyday wear.",
    hoodie:
      "Premium fleece hoodie with a warm interior. Perfect for layering or wearing on cool days.",
    jacket:
      "Stylish and durable jacket designed for both comfort and protection during chilly days.",
    pants: "Durable and stretchable pants perfect for casual or sports wear.",
    shoes: "Comfortable and lightweight shoes made for long-lasting wear.",
    accessories:
      "A versatile accessory to elevate your outfit and add a touch of style.",
  };

  // auto assign GST/GSM/default description
  useEffect(() => {
    const name = (newProduct.name || "").toString().toLowerCase();
    const category = (newProduct.category || "").toString().toLowerCase();

    const clothingKeywords = [
      "t-shirt",
      "shirt",
      "hoodie",
      "jacket",
      "jersey",
      "pant",
      "clothing",
      "apparel",
      "t-shirts",
    ];
    const isClothing = clothingKeywords.some(
      (w) => category.includes(w) || name.includes(w)
    );

    const gst = isClothing
      ? { cgst: 2.5, sgst: 2.5, total: 5 }
      : { cgst: 6, sgst: 6, total: 12 };

    let gsm: number | null = null;
    if (name.includes("hoodie") || name.includes("jacket")) gsm = 320;
    else if (name.includes("round neck")) gsm = 120;
    else if (name.includes("collar") || name.includes("collared")) gsm = 180;
    else if (isClothing) gsm = 200;

    const matched = Object.keys(defaultDescriptions).find(
      (k) => category.includes(k) || name.includes(k)
    );
    const defaultDesc = matched ? defaultDescriptions[matched] : "";

    setNewProduct((prev: any) => {
      const shouldUpdateDesc =
        !prev.description ||
        Object.values(defaultDescriptions).includes(prev.description);

      return {
        ...prev,
        gst: prev.gst?.total ? prev.gst : gst,
        gsm: prev.gsm ?? gsm,
        description: shouldUpdateDesc ? defaultDesc : prev.description,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newProduct.category, newProduct.name]);

  const handleGSTChange = (field: "cgst" | "sgst", value: number) => {
    const otherField = field === "cgst" ? "sgst" : "cgst";
    const otherValue = newProduct.gst?.[otherField] ?? 0;
    const total = field === "cgst" ? value + otherValue : otherValue + value;
    setNewProduct((prev: any) => ({
      ...prev,
      gst: { ...prev.gst, [field]: value, total },
    }));
  };

  return (
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

      <textarea
        placeholder="Enter product description (optional)"
        value={newProduct.description ?? ""}
        onChange={(e) =>
          setNewProduct({ ...newProduct, description: e.target.value })
        }
        className="w-full px-3 py-2 border rounded-md text-sm mt-4"
        rows={3}
      />

      <div className="grid grid-cols-3 sm:grid-cols-3 gap-3 mt-4">
        <div>
          <label className="block text-xs text-gray-600">CGST (%)</label>
          <input
            type="number"
            value={newProduct.gst?.cgst ?? ""}
            onChange={(e) => handleGSTChange("cgst", Number(e.target.value))}
            placeholder="2.5"
            className="w-full px-2 py-2 border rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600">SGST (%)</label>
          <input
            type="number"
            value={newProduct.gst?.sgst ?? ""}
            onChange={(e) => handleGSTChange("sgst", Number(e.target.value))}
            placeholder="2.5"
            className="w-full px-2 py-2 border rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600">Total GST</label>
          <input
            type="number"
            value={newProduct.gst?.total ?? ""}
            disabled
            className="w-full px-2 py-2 border rounded-md text-sm bg-gray-50"
          />
        </div>
      </div>

      {(newProduct.category?.toLowerCase()?.includes("shirt") ||
        newProduct.category?.toLowerCase()?.includes("hoodie") ||
        newProduct.category?.toLowerCase()?.includes("jacket") ||
        newProduct.category?.toLowerCase()?.includes("t-shirt")) && (
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Fabric GSM</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="e.g. 180"
              value={newProduct.gsm ?? ""}
              onChange={(e) =>
                setNewProduct({ ...newProduct, gsm: Number(e.target.value) })
              }
              className="flex-1 px-3 py-2 border rounded-md text-sm"
            />
            <button
              onClick={() =>
                setNewProduct((prev: any) => ({ ...prev, gsm: null }))
              }
              className="text-xs text-red-500 hover:text-red-700"
              title="Remove GSM"
            >
              Remove
            </button>
          </div>
          {newProduct.gsm && (
            <p className="text-xs text-gray-500 mt-1">
              Default GSM applied based on category (editable)
            </p>
          )}
        </div>
      )}

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
          {categories.map((c: string) => (
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

      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 mt-4">
        {["featured", "hasColors", "showProduct"].map((key) => (
          <label key={key} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={(newProduct as any)[key]}
              onChange={(e) =>
                setNewProduct({ ...newProduct, [key]: e.target.checked })
              }
            />
            {key === "featured"
              ? "Featured"
              : key === "hasColors"
              ? "Has Colors"
              : "Show Product"}
          </label>
        ))}
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
  );
}
