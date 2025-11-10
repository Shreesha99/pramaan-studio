// app/admin/ProductManager/components/ColorModal.tsx
"use client";
import GsapButton from "@/components/GsapButton";
import { useState } from "react";

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
  handleDeleteColorFromList,
  colorHex,
  setColorHex,
  colorName,
  setColorName,
  stock,
  setStock,
  files,
  setFiles,
  uploading,
  handleAddColorVariant,
  // sizes handlers
  handleAddSizeToVariant,
  handleUpdateVariantSize,
  handleDeleteSizeFromVariant,
}: any) {
  const [addSizeInput, setAddSizeInput] = useState("");

  if (!activeProduct) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 shadow-xl w-[95%] sm:w-[700px] max-h-[90vh] overflow-auto">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Manage Colors — {activeProduct.name}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Choose Color
            </label>
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
              {availableColors.map((c: any) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
              <option value="__new__">➕ Add New Color</option>
            </select>

            {addingNewColor && (
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Color name"
                  value={newColorInput}
                  onChange={(e) => setNewColorInput(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md text-sm"
                />
                <input
                  type="text"
                  placeholder="#hex"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  className="w-28 px-2 py-2 border rounded-md text-sm"
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

            <label className="block text-sm font-medium mb-1">
              Stock (legacy)
            </label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-md text-sm mb-3"
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
              className="block w-full text-center border-2 border-dashed border-gray-300 py-3 rounded-md cursor-pointer hover:border-black transition text-sm text-gray-600 mb-3"
            >
              📁 Choose Images
            </label>

            {files && files.length > 0 && (
              <p className="mt-2 text-xs text-gray-500 text-center mb-4">
                {files.length} file{files.length > 1 ? "s" : ""} selected
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setActiveProduct(null)}
                className="flex-1 border border-gray-300 rounded-full py-2 text-sm hover:bg-gray-100"
              >
                Cancel
              </button>
              <GsapButton
                onClick={handleAddColorVariant}
                loading={uploading}
                disabled={!colorName || !files?.length}
                text="Save Color"
                loadingText="Uploading..."
                className="flex-1 bg-black text-white rounded-full py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Existing Variants</h3>
            {!activeProduct.variants ||
            Object.keys(activeProduct.variants).length === 0 ? (
              <p className="text-xs text-gray-500">No variants yet</p>
            ) : (
              Object.entries(activeProduct.variants).map(([c, v]: any) => (
                <div key={c} className="mb-3 border rounded p-2">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{
                          background:
                            availableColors.find((ac: any) => ac.name === c)
                              ?.hex || "#ccc",
                        }}
                      />
                      <b>{c}</b>
                    </div>
                    <div className="text-xs text-gray-500">
                      Images: {v.images?.length ?? 0}
                    </div>
                  </div>

                  {/* sizes table */}
                  <div className="mb-2">
                    <div className="flex gap-2 items-center mb-2">
                      <input
                        type="text"
                        placeholder="Add size (e.g. XXL)"
                        className="px-2 py-1 border rounded text-sm flex-1"
                        value={addSizeInput}
                        onChange={(e) => setAddSizeInput(e.target.value)}
                      />
                      <button
                        onClick={() => {
                          handleAddSizeToVariant(
                            activeProduct.id,
                            c,
                            addSizeInput.trim()
                          );
                          setAddSizeInput("");
                        }}
                        className="text-xs px-3 py-1 border rounded bg-gray-100"
                      >
                        Add Size
                      </button>
                    </div>

                    {v.sizes ? (
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(v.sizes).map(([sizeKey, qty]: any) => (
                          <div
                            key={sizeKey}
                            className="flex items-center gap-2"
                          >
                            <div className="w-12 text-xs">{sizeKey}</div>
                            <input
                              type="number"
                              defaultValue={qty}
                              onBlur={(e) =>
                                handleUpdateVariantSize(
                                  activeProduct.id,
                                  c,
                                  sizeKey,
                                  Number(e.target.value)
                                )
                              }
                              className="w-20 px-2 py-1 border rounded text-sm"
                            />
                            <button
                              onClick={() =>
                                handleDeleteSizeFromVariant(
                                  activeProduct.id,
                                  c,
                                  sizeKey
                                )
                              }
                              className="text-xs text-red-500"
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">
                        No sizes (legacy). You can add sizes above.
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
