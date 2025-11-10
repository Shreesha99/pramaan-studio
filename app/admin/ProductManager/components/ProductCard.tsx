// app/admin/ProductManager/components/ProductCard.tsx
"use client";
import { TrashIcon, PencilIcon, PhotoIcon } from "@heroicons/react/24/outline";

export default function ProductCard({
  product,
  handleDeleteProduct,
  handleUpdateName,
  setEditingProduct,
  setActiveProduct,
  handleUpdateStock,
  handleDeleteColor,
  setImageManagerProduct,
  setEditingColorVariant,
}: // sizes handlers will be passed via modal / edit modal, product card uses handleUpdateStock for legacy stock
any) {
  // compute MRP (base + GST)
  const gstPercent = product?.gst?.total ?? 0;
  const basePrice = Number(product.price ?? 0);
  const finalPrice = basePrice + (basePrice * gstPercent) / 100;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border flex flex-col relative">
      <button
        onClick={() => handleDeleteProduct(product.id)}
        className="absolute top-3 right-3 text-xs text-red-500 hover:text-red-700"
        title="Delete product"
      >
        <TrashIcon className="w-4 h-4" />
      </button>

      <input
        type="text"
        defaultValue={product.name}
        onBlur={(e) => handleUpdateName(product, e.target.value)}
        className="font-semibold text-lg mb-3 border-b border-gray-200 focus:outline-none focus:border-black"
      />

      <p className="text-sm text-gray-600 mb-1">
        Category: <b>{product.category}</b>
      </p>

      {product.description && (
        <p className="text-sm text-gray-700 mb-3 whitespace-pre-line">
          {product.description}
        </p>
      )}

      {product.gsm && (
        <p className="text-xs text-gray-500 mb-2">
          Fabric GSM: <b>{product.gsm}</b>
        </p>
      )}

      <div className="mb-2 text-sm text-gray-700">
        <p>
          Base Price: <b>₹{basePrice.toFixed(2)}</b>
        </p>
        {gstPercent > 0 && (
          <>
            <p className="text-gray-500">
              GST: {product.gst?.cgst ?? 0}% + {product.gst?.sgst ?? 0}% (
              {gstPercent}%)
            </p>
            <p className="font-semibold text-gray-900">
              Total (with GST): ₹{finalPrice.toFixed(2)}
            </p>
          </>
        )}
      </div>

      <p className="text-xs text-gray-400 mb-3">
        {product.featured ? "🌟 Featured" : ""}{" "}
        {product.showProduct ? "🟢 Visible" : "🔴 Hidden"}
      </p>

      <div className="flex flex-wrap gap-2 mb-3">
        <button
          onClick={() => setEditingProduct(product)}
          className="flex-1 border border-gray-200 text-xs rounded-full py-1 hover:bg-gray-100 flex items-center justify-center gap-1"
        >
          <PencilIcon className="w-3 h-3" /> Edit
        </button>

        {product.images?.length > 0 && (
          <button
            onClick={() => setImageManagerProduct(product)}
            className="flex-1 border border-gray-200 text-xs rounded-full py-1 hover:bg-gray-100 flex items-center justify-center gap-1"
          >
            <PhotoIcon className="w-3 h-3" /> Images
          </button>
        )}

        {product.hasColors && (
          <button
            onClick={() => setActiveProduct(product)}
            className="flex-1 bg-black text-white rounded-full text-xs py-1 hover:bg-gray-900"
          >
            + Add Color
          </button>
        )}
      </div>

      {/* variants */}
      {product.variants && Object.keys(product.variants).length > 0 && (
        <div className="mt-3 space-y-4">
          {Object.entries(product.variants).map(([color, v]: any) => (
            <div
              key={color}
              className="border rounded-md p-3 text-sm flex flex-col gap-2"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">
                  {color} — {/* legacy single-stock fallback */}
                  {typeof v.stock !== "undefined" ? (
                    <>
                      <input
                        type="number"
                        defaultValue={v.stock}
                        onBlur={(e) =>
                          handleUpdateStock(product.id, color, +e.target.value)
                        }
                        className="w-12 border rounded px-1 text-xs"
                      />{" "}
                      in stock
                    </>
                  ) : (
                    <>
                      sizes: {v.sizes ? Object.keys(v.sizes).join(", ") : "—"}
                    </>
                  )}
                </span>

                <div className="flex gap-2">
                  {v.images?.length > 0 && (
                    <button
                      onClick={() => setEditingColorVariant({ product, color })}
                      className="text-gray-500 hover:text-black text-xs flex items-center gap-1"
                      title="Manage color images"
                    >
                      <PhotoIcon className="w-3 h-3" /> View
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteColor(product.id, color)}
                    className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                    title="Delete color"
                  >
                    <TrashIcon className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>

              {/* show images inline */}
              {v.images && v.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {v.images.map((img: string, idx: number) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`${color}-${idx}`}
                      className="w-full h-20 object-cover rounded-md border"
                    />
                  ))}
                </div>
              )}

              {/* show sizes summary */}
              {v.sizes && (
                <div className="text-xs text-gray-600 mt-2">
                  Sizes:{" "}
                  {Object.entries(v.sizes)
                    .map(([s, q]: any) => `${s}(${q})`)
                    .join(" • ")}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
