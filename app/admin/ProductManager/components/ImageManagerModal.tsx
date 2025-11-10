// app/admin/ProductManager/components/ImageManagerModal.tsx
"use client";
import { useState } from "react";

export default function ImageManagerModal({
  product,
  setImageManagerProduct,
  handleDeleteImage,
}: any) {
  if (!product) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 shadow-xl w-[90%] max-w-3xl">
        <h3 className="text-lg font-semibold mb-4">Images — {product.name}</h3>
        <div className="grid grid-cols-3 gap-3">
          {(product.images || []).map((img: string, idx: number) => (
            <div key={idx} className="relative">
              <img
                src={img}
                alt={`img-${idx}`}
                className="w-full h-28 object-cover rounded"
              />
              <button
                onClick={() => handleDeleteImage(product.id, img)}
                className="absolute top-2 right-2 bg-white rounded-full p-1 text-red-500 border"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setImageManagerProduct(null)}
            className="px-4 py-2 border rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
