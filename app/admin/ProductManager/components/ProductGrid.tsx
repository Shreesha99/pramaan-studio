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
}: any) {
  if (!products.length)
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
        />
      ))}
    </div>
  );
}
