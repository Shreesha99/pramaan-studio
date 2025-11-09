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

        {/* Upload product images */}
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
            {editFiles.length} file{editFiles.length > 1 ? "s" : ""} selected
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
          {categories.map((c: string) => (
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
  );
}
