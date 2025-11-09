"use client";
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
}: any) {
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
