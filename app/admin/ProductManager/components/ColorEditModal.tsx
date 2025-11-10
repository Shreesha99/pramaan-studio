// app/admin/ProductManager/components/ColorEditModal.tsx
"use client";
import { useEffect, useState } from "react";
import GsapButton from "@/components/GsapButton";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
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
}: any) {
  if (!editingColorVariant) return null;
  const { product, color } = editingColorVariant;
  const prod = products.find((p: any) => p.id === product.id) || product;
  const variant = prod.variants?.[color] || {};
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const [newSizeInput, setNewSizeInput] = useState("");

  // small helper to update variant images (append)
  const handleUploadImages = async () => {
    if (!files || files.length === 0) return;
    try {
      setUploading(true);
      const urls: string[] = [];
      for (const f of Array.from(files)) {
        // upload to storage path products/{id}/{color}/{name}
        const path = `products/${prod.id}/${color}/${f.name}`;
        const storageRef = ref(getStorage(), path);
        await uploadBytes(storageRef, f);
        const url = await getDownloadURL(storageRef);
        urls.push(url);
      }

      const updVariants = {
        ...prod.variants,
        [color]: {
          ...variant,
          images: [...(variant.images || []), ...urls],
        },
      };

      await updateDoc(doc(db, "products", prod.id), { variants: updVariants });
      setProducts((prev: any) =>
        prev.map((p: any) =>
          p.id === prod.id ? { ...p, variants: updVariants } : p
        )
      );
      setFiles(null);
      showToast("Images uploaded", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed upload", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 shadow-xl w-[95%] max-w-2xl max-h-[90vh] overflow-auto">
        <h3 className="text-lg font-semibold mb-4">
          Edit {color} — {prod.name}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-600 mb-2">Images</p>
            <div className="grid grid-cols-3 gap-2">
              {(variant.images || []).map((img: string, idx: number) => (
                <div key={idx} className="relative">
                  <img src={img} className="w-full h-20 object-cover rounded" />
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
