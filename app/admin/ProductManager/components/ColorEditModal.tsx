"use client";
import { useState } from "react";
import GsapButton from "@/components/GsapButton";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
  deleteObject,
} from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ColorEditModal({
  editingColorVariant,
  setEditingColorVariant,
  showToast,
  products,
  setProducts,
  handleAddSizeToVariant,
  handleUpdateVariantSize,
  handleDeleteSizeFromVariant,

  // NEW HANDLERS passed from ProductManager
  handleUpdateColorMeta,
  handleDeleteVariantImage,
  handleAddVariantImages,
}: any) {
  if (!editingColorVariant) return null;
  const { product, color } = editingColorVariant;

  const prod = products.find((p: any) => p.id === product.id) || product;
  const variant = prod.variants?.[color] || {};

  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);

  // NEW STATE for color editing
  const [newColorName, setNewColorName] = useState(color);
  const [hex, setHex] = useState(variant.hex || "#000000");

  const [newSizeInput, setNewSizeInput] = useState("");

  // KEEP your upload logic the same → but now use handleAddVariantImages
  const handleUploadImages = async () => {
    if (!files || files.length === 0) return;
    setUploading(true);

    await handleAddVariantImages(prod.id, color, files);

    setFiles(null);
    setUploading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 shadow-xl w-[95%] max-w-2xl max-h-[90vh] overflow-auto">
        <h3 className="text-lg font-semibold mb-4">
          Edit {color} — {prod.name}
        </h3>

        {/* ---------------- COLOR META EDIT ---------------- */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold mb-2">Color Details</h4>

          <div className="flex gap-3 mb-3">
            <div className="flex-1">
              <label className="text-xs">Color Name</label>
              <input
                type="text"
                value={newColorName}
                onChange={(e) => setNewColorName(e.target.value)}
                className="w-full px-2 py-1 border rounded text-sm"
              />
            </div>

            <div>
              <label className="text-xs">Hex</label>
              <input
                type="color"
                value={hex}
                onChange={(e) => setHex(e.target.value)}
                className="h-10 w-16 border rounded"
              />
            </div>
          </div>

          <button
            onClick={() => {
              handleUpdateColorMeta(prod.id, color, newColorName, hex);
              setEditingColorVariant(null);
            }}
            className="px-4 py-2 bg-black text-white rounded text-sm"
          >
            Save Color Details
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ---------------- IMAGES ---------------- */}
          <div>
            <p className="text-xs text-gray-600 mb-2">Images</p>

            <div className="grid grid-cols-3 gap-2">
              {(variant.images || []).map((img: string, idx: number) => (
                <div key={idx} className="relative group">
                  <img src={img} className="w-full h-20 object-cover rounded" />

                  {/* DELETE BUTTON */}
                  <button
                    onClick={() =>
                      handleDeleteVariantImage(prod.id, color, img)
                    }
                    className="absolute top-1 right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setFiles(e.target.files)}
              className="hidden"
              id="color-edit-images"
            />

            <label
              htmlFor="color-edit-images"
              className="block mt-3 text-sm border-2 border-dashed py-2 rounded text-center cursor-pointer"
            >
              📁 Choose Images
            </label>

            {files && (
              <p className="text-xs mt-2">{files.length} file(s) selected</p>
            )}

            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setEditingColorVariant(null)}
                className="px-3 py-2 border rounded"
              >
                Close
              </button>

              <GsapButton
                onClick={handleUploadImages}
                loading={uploading}
                disabled={!files || files.length === 0}
                text="Upload"
                loadingText="Uploading..."
                className="bg-black text-white px-3 py-2 rounded"
              />
            </div>
          </div>

          {/* ---------------- SIZES ---------------- */}
          <div>
            <p className="text-xs text-gray-600 mb-2">Sizes</p>

            <div className="flex gap-2 mb-2">
              <input
                type="text"
                className="flex-1 px-2 py-1 border rounded text-sm"
                placeholder="Add size e.g. XXL"
                value={newSizeInput}
                onChange={(e) => setNewSizeInput(e.target.value)}
              />
              <button
                onClick={() => {
                  handleAddSizeToVariant(prod.id, color, newSizeInput.trim());
                  setNewSizeInput("");
                }}
                className="px-3 py-1 text-sm border rounded"
              >
                Add
              </button>
            </div>

            {variant.sizes ? (
              <div className="space-y-2">
                {Object.entries(variant.sizes).map(([sizeKey, qty]: any) => (
                  <div key={sizeKey} className="flex items-center gap-2">
                    <div className="w-12 text-sm">{sizeKey}</div>
                    <input
                      type="number"
                      defaultValue={qty}
                      onBlur={(e) =>
                        handleUpdateVariantSize(
                          prod.id,
                          color,
                          sizeKey,
                          Number(e.target.value)
                        )
                      }
                      className="w-20 px-2 py-1 border rounded text-sm"
                    />
                    <button
                      onClick={() =>
                        handleDeleteSizeFromVariant(prod.id, color, sizeKey)
                      }
                      className="text-xs text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">No sizes defined</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
