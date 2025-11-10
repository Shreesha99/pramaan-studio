// app/admin/ProductManager/components/ProductGrid.tsx
"use client";
import ProductCard from "./ProductCard";

export default function ProductGrid({
  products,
  handleDeleteProduct,
  handleUpdateName,
  setEditingProduct,
  setActiveProduct,
  handleUpdateStock,
  handleDeleteColor,
  setImageManagerProduct,
  setEditingColorVariant,
}: any) {
  if (!products || products.length === 0)
    return <p className="text-center text-gray-500">No products found.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((p: any) => (
        <ProductCard
          key={p.id}
          product={p}
          handleDeleteProduct={handleDeleteProduct}
          handleUpdateName={handleUpdateName}
          setEditingProduct={setEditingProduct}
          setActiveProduct={setActiveProduct}
          handleUpdateStock={handleUpdateStock}
          handleDeleteColor={handleDeleteColor}
          setImageManagerProduct={setImageManagerProduct}
          setEditingColorVariant={setEditingColorVariant}
        />
      ))}
    </div>
  );
}
