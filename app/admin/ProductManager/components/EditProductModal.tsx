"use client";

import GsapButton from "@/components/GsapButton";

export default function EditProductModal({
  editingProduct,
  setEditingProduct,
  editFiles,
  setEditFiles,
  editUploading,
  setEditUploading,
  categories,
  handleUpdateProduct,
}: any) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-[400px]">
        <h2 className="text-lg font-semibold mb-4 text-center">Edit Product</h2>

        {/* 🏷 Product Name */}
        <input
          type="text"
          value={editingProduct.name}
          onChange={(e) =>
            setEditingProduct({ ...editingProduct, name: e.target.value })
          }
          className="w-full px-3 py-2 border rounded-md text-sm mb-2"
        />

        {/* 💰 Base Price */}
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

        {/* 📝 Description */}
        <textarea
          placeholder="Enter or edit product description"
          value={editingProduct.description ?? ""}
          onChange={(e) =>
            setEditingProduct({
              ...editingProduct,
              description: e.target.value,
            })
          }
          className="w-full px-3 py-2 border rounded-md text-sm mb-3"
          rows={3}
        />

        {/* 🧾 GST Fields */}
        <div className="flex gap-2 mb-3">
          <div className="flex-1">
            <label className="text-xs text-gray-600">CGST (%)</label>
            <input
              type="number"
              value={editingProduct.gst?.cgst ?? 0}
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  gst: {
                    ...editingProduct.gst,
                    cgst: Number(e.target.value),
                    total:
                      Number(e.target.value) +
                      Number(editingProduct.gst?.sgst ?? 0),
                  },
                })
              }
              className="w-full px-2 py-1 border rounded-md text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-600">SGST (%)</label>
            <input
              type="number"
              value={editingProduct.gst?.sgst ?? 0}
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  gst: {
                    ...editingProduct.gst,
                    sgst: Number(e.target.value),
                    total:
                      Number(e.target.value) +
                      Number(editingProduct.gst?.cgst ?? 0),
                  },
                })
              }
              className="w-full px-2 py-1 border rounded-md text-sm"
            />
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-3">
          Total GST: <b>{editingProduct.gst?.total ?? 0}%</b>
        </p>

        {/* 🧵 GSM Field */}
        <div className="mb-3">
          <label className="block text-xs text-gray-600 mb-1">GSM</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={editingProduct.gsm ?? ""}
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  gsm: e.target.value ? Number(e.target.value) : null,
                })
              }
              placeholder="e.g. 180"
              className="flex-1 px-2 py-1 border rounded-md text-sm"
            />
            {editingProduct.gsm && (
              <button
                onClick={() =>
                  setEditingProduct((prev: any) => ({ ...prev, gsm: null }))
                }
                className="text-xs text-red-500 hover:text-red-700"
                title="Remove GSM"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        {/* 🧮 Stock (for non-color items) */}
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

        {/* 📁 Images */}
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

        {/* 📂 Category */}
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
          {categories.map((c: string) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        {/* ⚙️ Flags */}
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

        {/* 🧾 Buttons */}
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
  );
}
