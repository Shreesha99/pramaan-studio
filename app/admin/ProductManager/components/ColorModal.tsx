"use client";

import GsapButton from "@/components/GsapButton";

export default function ColorModal({
  activeProduct,
  setActiveProduct,
  availableColors,
  addingNewColor,
  setAddingNewColor,
  newColorInput,
  setNewColorInput,
  addingColorLoading,
  handleAddNewColor,
  colorName,
  setColorName,
  stock,
  setStock,
  files,
  setFiles,
  uploading,
  handleAddColorVariant,
}: any) {
  return (
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
          {availableColors.map((c: string) => (
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

        <label className="block text-sm font-medium mb-1">Stock Quantity</label>
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
  );
}
