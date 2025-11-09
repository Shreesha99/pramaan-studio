"use client";

export default function ProductCard({
  product,
  handleDeleteProduct,
  handleUpdateName,
  setEditingProduct,
  setActiveProduct,
  handleUpdateStock,
  handleDeleteColor,
}: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border flex flex-col relative">
      <button
        onClick={() => handleDeleteProduct(product.id)}
        className="absolute top-3 right-3 text-xs text-red-500 hover:text-red-700"
      >
        ✕
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
      <p className="text-sm text-gray-500 mb-2">₹{product.price}</p>
      <p className="text-xs text-gray-400 mb-3">
        {product.featured ? "🌟 Featured" : ""}{" "}
        {product.showProduct ? "🟢 Visible" : "🔴 Hidden"}
      </p>

      <div className="flex gap-2">
        <button
          onClick={() => setEditingProduct(product)}
          className="flex-1 border border-gray-200 text-xs rounded-full py-1 hover:bg-gray-100"
        >
          Edit
        </button>
        {product.hasColors && (
          <button
            onClick={() => setActiveProduct(product)}
            className="flex-1 bg-black text-white rounded-full text-xs py-1 hover:bg-gray-900"
          >
            Colors
          </button>
        )}
      </div>

      {product.variants && (
        <div className="mt-4 space-y-2">
          {Object.entries(product.variants).map(([color, v]: any) => (
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
                    handleUpdateStock(product.id, color, +e.target.value)
                  }
                  className="w-12 border rounded px-1 text-xs"
                />{" "}
                in stock
              </span>
              <button
                onClick={() => handleDeleteColor(product.id, color)}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
