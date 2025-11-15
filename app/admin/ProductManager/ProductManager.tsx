// app/admin/ProductManager/ProductManager.tsx
"use client";
import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  getStorage,
} from "firebase/storage";
import { db } from "@/lib/firebase";
import { useToast } from "@/context/ToastContext";

// Components
import AddProductForm from "./components/AddProductForm";
import ProductGrid from "./components/ProductGrid";
import EditProductModal from "./components/EditProductModal";
import ColorModal from "./components/ColorModal";
import ImageManagerModal from "./components/ImageManagerModal";
import ColorEditModal from "./components/ColorEditModal";

const storage = getStorage();

export default function ProductManager() {
  const { showToast } = useToast();

  // 🧾 Products
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ➕ New Product Form (including gst/gsm/description)
  const [newProduct, setNewProduct] = useState<any>({
    name: "",
    price: "",
    category: "",
    featured: false,
    hasColors: false,
    showProduct: true,
    gst: { cgst: 0, sgst: 0, total: 0 },
    gsm: null,
    description: "",
  });

  const [activeProduct, setActiveProduct] = useState<any | null>(null);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [imageManagerProduct, setImageManagerProduct] = useState<any | null>(
    null
  );
  const [editingColorVariant, setEditingColorVariant] = useState<{
    product: any;
    color: string;
  } | null>(null);

  // 🎨 Color Management
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#000000");
  const [stock, setStock] = useState<number>(0);
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);

  const [availableColors, setAvailableColors] = useState<
    { name: string; hex: string }[]
  >([
    { name: "Red", hex: "#FF0000" },
    { name: "Green", hex: "#00FF00" },
    { name: "Yellow", hex: "#FFFF00" },
    { name: "Blue", hex: "#0000FF" },
    { name: "Maroon", hex: "#800000" },
    { name: "White", hex: "#FFFFFF" },
    { name: "Black", hex: "#000000" },
  ]);
  const [addingNewColor, setAddingNewColor] = useState(false);
  const [newColorInput, setNewColorInput] = useState("");

  // 🏷️ Category Management
  const [categories, setCategories] = useState<string[]>([
    "T-Shirts",
    "Pants",
    "Shoes",
    "Accessories",
    "Hoodies",
    "Jackets",
  ]);
  const [addingNewCategory, setAddingNewCategory] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState("");

  // ✏️ Edit Product Modal
  const [editFiles, setEditFiles] = useState<FileList | null>(null);
  const [editUploading, setEditUploading] = useState(false);

  // 🔁 Button Loading States
  const [addingProductLoading, setAddingProductLoading] = useState(false);
  const [addingCategoryLoading, setAddingCategoryLoading] = useState(false);
  const [addingColorLoading, setAddingColorLoading] = useState(false);

  // 🧾 Fetch products on load
  useEffect(() => {
    const fetchProducts = async () => {
      const q = await getDocs(collection(db, "products"));
      const list = q.docs.map((d) => ({ id: d.id, ...d.data() }));
      setProducts(list);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  // ➕ Add Product
  const handleAddProduct = async () => {
    if (!newProduct.name.trim() || !newProduct.price) {
      showToast("Please fill product name and price.", "info");
      return;
    }
    if (!newProduct.category) {
      showToast("Please select a category.", "info");
      return;
    }

    try {
      setAddingProductLoading(true);
      const payload = {
        ...newProduct,
        price: Number(newProduct.price),
        gst: newProduct.gst ?? { cgst: 0, sgst: 0, total: 0 },
        gsm: newProduct.gsm ?? null,
        description: newProduct.description ?? "",
        variants: {},
      };
      const docRef = await addDoc(collection(db, "products"), payload);

      showToast("Product added successfully!", "success");
      setProducts((prev) => [...prev, { id: docRef.id, ...payload }]);
      setNewProduct({
        name: "",
        price: "",
        category: "",
        featured: false,
        hasColors: false,
        showProduct: true,
        gst: { cgst: 0, sgst: 0, total: 0 },
        gsm: null,
        description: "",
      });
    } catch (err) {
      console.error(err);
      showToast("Failed to add product.", "error");
    } finally {
      setAddingProductLoading(false);
    }
  };

  // 🗑️ Delete Product
  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, "products", id));
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast("Product deleted successfully.", "success");
    } catch {
      showToast("Failed to delete product.", "error");
    }
  };

  // ✏️ Update Color Name & Hex
  const handleUpdateColorMeta = async (
    productId: string,
    oldColor: string,
    newName: string,
    newHex: string
  ) => {
    try {
      const product = products.find((p) => p.id === productId);
      if (!product) return;

      const oldVariant = product.variants?.[oldColor];
      if (!oldVariant) return;

      // Re-map variant
      const updatedVariants = {
        ...product.variants,
      };
      delete updatedVariants[oldColor];

      updatedVariants[newName] = {
        ...oldVariant,
        hex: newHex, // store hex inside variant
      };

      await updateDoc(doc(db, "products", productId), {
        variants: updatedVariants,
      });

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, variants: updatedVariants } : p
        )
      );

      showToast("Color updated successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to update color.", "error");
    }
  };

  // ➕ Add new images to variant
  const handleAddVariantImages = async (
    productId: string,
    color: string,
    files: FileList
  ) => {
    if (!files || files.length === 0) return;

    try {
      const product = products.find((p) => p.id === productId);
      if (!product) return;

      const variant = product.variants?.[color];
      if (!variant) return;

      const newUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files.item(i);
        if (!file) continue;

        const uniqueName = `${Date.now()}-${Math.random()}-${file.name}`;
        const path = `products/${productId}/${color}/${uniqueName}`;

        const uploadRef = ref(storage, path);
        await uploadBytes(uploadRef, file);

        const url = await getDownloadURL(uploadRef);
        newUrls.push(url);
      }

      const updatedVariants = {
        ...product.variants,
        [color]: {
          ...variant,
          images: [...variant.images, ...newUrls],
        },
      };

      await updateDoc(doc(db, "products", productId), {
        variants: updatedVariants,
      });

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, variants: updatedVariants } : p
        )
      );

      showToast("New images added to variant!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to upload images.", "error");
    }
  };

  const handleDeleteVariantImage = async (
    productId: string,
    color: string,
    imageUrl: string
  ) => {
    try {
      const product = products.find((p) => p.id === productId);
      if (!product) return;

      const variant = product.variants?.[color];
      if (!variant) return;

      // remove from storage
      const path = decodeURIComponent(imageUrl.split("/o/")[1].split("?")[0]);
      await deleteObject(ref(storage, path));

      const updatedImages = variant.images.filter(
        (i: string) => i !== imageUrl
      );

      const updatedVariants = {
        ...product.variants,
        [color]: { ...variant, images: updatedImages },
      };

      await updateDoc(doc(db, "products", productId), {
        variants: updatedVariants,
      });

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, variants: updatedVariants } : p
        )
      );

      showToast("Image removed from variant.", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to remove image.", "error");
    }
  };

  // ✏️ Update Product Name
  const handleUpdateName = async (p: any, newName: string) => {
    try {
      const refDoc = doc(db, "products", p.id);
      await updateDoc(refDoc, { name: newName });
      setProducts((prev) =>
        prev.map((item) =>
          item.id === p.id ? { ...item, name: newName } : item
        )
      );
      showToast("Product name updated!", "success");
    } catch {
      showToast("Failed to update product.", "error");
    }
  };

  // 🧾 Update Full Product (edit modal)
  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    try {
      setEditUploading(true);
      let uploadedUrls: string[] = editingProduct.images || [];

      if (editFiles && editFiles.length > 0) {
        const urls: string[] = [];
        for (let i = 0; i < editFiles.length; i++) {
          const file = editFiles.item(i);
          if (!file) continue;

          const uniqueName = `${Date.now()}-${Math.random()}-${file.name}`;
          const path = `products/${editingProduct.id}/main/${uniqueName}`;

          const storageRef = ref(storage, path);
          await uploadBytes(storageRef, file);
          const url = await getDownloadURL(storageRef);
          urls.push(url);
        }

        uploadedUrls = urls;
      }

      const refDoc = doc(db, "products", editingProduct.id);
      const payload = {
        name: editingProduct.name,
        price: Number(editingProduct.price),
        category: editingProduct.category,
        featured: editingProduct.featured,
        hasColors: editingProduct.hasColors,
        showProduct: editingProduct.showProduct,
        stock: Number(editingProduct.stock || 0),
        gst: editingProduct.gst ?? { cgst: 0, sgst: 0, total: 0 },
        gsm: editingProduct.gsm ?? null,
        description: editingProduct.description ?? "",
        images: uploadedUrls,
      };
      await updateDoc(refDoc, payload);

      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? { ...p, ...payload } : p))
      );
      setEditingProduct(null);
      setEditFiles(null);
      showToast("Product updated successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to update product.", "error");
    } finally {
      setEditUploading(false);
    }
  };

  // ➕ Add New Category
  const handleAddNewCategory = async () => {
    if (!newCategoryInput.trim()) {
      showToast("Please enter a category name.", "info");
      return;
    }
    const cat = newCategoryInput.trim();
    if (categories.includes(cat)) {
      showToast("Category already exists.", "info");
      return;
    }

    try {
      setAddingCategoryLoading(true);
      setCategories((prev) => [...prev, cat]);
      setNewProduct((prev: any) => ({ ...prev, category: cat }));
      setNewCategoryInput("");
      setAddingNewCategory(false);
      showToast(`${cat} added to category list!`, "success");
    } finally {
      setAddingCategoryLoading(false);
    }
  };

  // 🗑 Delete Category
  const handleDeleteCategory = (cat: string) => {
    if (confirm(`Delete category "${cat}"?`)) {
      setCategories((prev) => prev.filter((c) => c !== cat));
      showToast(`${cat} deleted`, "info");
    }
  };

  // ➕ Add New Color (with hex)
  const handleAddNewColor = async () => {
    if (!newColorInput.trim()) {
      showToast("Please enter a color name.", "info");
      return;
    }
    const color = newColorInput.trim();
    if (availableColors.find((c) => c.name === color)) {
      showToast("Color already exists.", "info");
      return;
    }

    try {
      setAddingColorLoading(true);
      setAvailableColors((prev) => [...prev, { name: color, hex: colorHex }]);
      setColorName(color);
      setNewColorInput("");
      setColorHex("#000000");
      setAddingNewColor(false);
      showToast(`${color} added to color list!`, "success");
    } finally {
      setAddingColorLoading(false);
    }
  };

  // 🗑 Delete color from list
  const handleDeleteColorFromList = (colorName: string) => {
    setAvailableColors((prev) => prev.filter((c) => c.name !== colorName));
    showToast(`${colorName} removed`, "info");
  };

  // 🎨 Add Color Variant (creates variant entry with images + sizes default)
  const handleAddColorVariant = async () => {
    if (!activeProduct) return;
    if (!colorName.trim() || !files?.length) {
      showToast("Please select color and upload image(s).", "info");
      return;
    }

    try {
      setUploading(true);
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files.item(i);
        if (!file) continue;

        const uniqueName = `${Date.now()}-${Math.random()}-${file.name}`;
        const path = `products/${activeProduct.id}/${colorName}/${uniqueName}`;
        const storageRef = ref(storage, path);

        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        uploadedUrls.push(url);
      }

      // default sizes
      const defaultSizes = { S: 0, M: 0, L: 0, XL: 0 };

      const productRef = doc(db, "products", activeProduct.id);
      await updateDoc(productRef, {
        [`variants.${colorName}`]: {
          images: uploadedUrls,
          sizes: defaultSizes,
        },
      });

      setProducts((prev) =>
        prev.map((p) =>
          p.id === activeProduct.id
            ? {
                ...p,
                variants: {
                  ...p.variants,
                  [colorName]: { images: uploadedUrls, sizes: defaultSizes },
                },
              }
            : p
        )
      );

      showToast(`${colorName} variant added successfully!`, "success");
      setColorName("");
      setStock(0);
      setFiles(null);
    } catch (err) {
      console.error(err);
      showToast("Failed to upload variant.", "error");
    } finally {
      setUploading(false);
    }
  };

  // 🧾 Update stock of a single size (auto-save)
  const handleUpdateVariantSize = async (
    productId: string,
    color: string,
    sizeKey: string,
    qty: number
  ) => {
    try {
      const product = products.find((p) => p.id === productId);
      if (!product) return;
      const existing = product.variants?.[color] || {};
      const sizes = { ...(existing.sizes || {}) };
      sizes[sizeKey] = qty;

      const updatedVariants = {
        ...product.variants,
        [color]: { ...existing, sizes },
      };

      // update firestore
      await updateDoc(doc(db, "products", productId), {
        variants: updatedVariants,
      });

      // update local state
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, variants: updatedVariants } : p
        )
      );

      showToast(`Saved ${color} ${sizeKey} = ${qty}`, "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to save size stock.", "error");
    }
  };

  // ➕ Add custom size to a variant (auto-save)
  const handleAddSizeToVariant = async (
    productId: string,
    color: string,
    newSize: string
  ) => {
    if (!newSize || !newSize.trim()) return;
    try {
      const product = products.find((p) => p.id === productId);
      if (!product) return;
      const existing = product.variants?.[color] || {};
      const sizes = { ...(existing.sizes || {}) };

      if (sizes[newSize]) {
        showToast("Size already exists", "info");
        return;
      }
      sizes[newSize] = 0;

      const updatedVariants = {
        ...product.variants,
        [color]: { ...existing, sizes },
      };

      await updateDoc(doc(db, "products", productId), {
        variants: updatedVariants,
      });

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, variants: updatedVariants } : p
        )
      );

      showToast(`Added size ${newSize}`, "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to add size.", "error");
    }
  };

  // 🗑 Delete a size from a variant
  const handleDeleteSizeFromVariant = async (
    productId: string,
    color: string,
    sizeKey: string
  ) => {
    try {
      const product = products.find((p) => p.id === productId);
      if (!product) return;
      const existing = product.variants?.[color] || {};
      const sizes = { ...(existing.sizes || {}) };
      delete sizes[sizeKey];

      const updatedVariants = {
        ...product.variants,
        [color]: { ...existing, sizes },
      };

      await updateDoc(doc(db, "products", productId), {
        variants: updatedVariants,
      });

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, variants: updatedVariants } : p
        )
      );

      showToast(`Removed size ${sizeKey}`, "info");
    } catch (err) {
      console.error(err);
      showToast("Failed to delete size.", "error");
    }
  };

  // 🧾 Update Stock number fallback (legacy single stock per color)
  const handleUpdateStock = async (
    productId: string,
    color: string,
    newStock: number
  ) => {
    try {
      const refDoc = doc(db, "products", productId);
      const product = products.find((p) => p.id === productId);
      if (!product) return;
      const updatedVariants = {
        ...product.variants,
        [color]: { ...(product.variants?.[color] || {}), stock: newStock },
      };
      await updateDoc(refDoc, { variants: updatedVariants });
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, variants: updatedVariants } : p
        )
      );
      showToast(`${color} stock updated!`, "success");
    } catch {
      showToast("Failed to update stock.", "error");
    }
  };

  // 🗑️ Delete Color Variant (keeps behavior)
  const handleDeleteColor = async (productId: string, color: string) => {
    try {
      const refDoc = doc(db, "products", productId);
      const product = products.find((p) => p.id === productId);
      if (!product) return;
      const updatedVariants = { ...product.variants };
      delete updatedVariants[color];

      await updateDoc(refDoc, { variants: updatedVariants });

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, variants: updatedVariants } : p
        )
      );

      showToast(`${color} variant deleted successfully.`, "success");
    } catch {
      showToast("Failed to delete color.", "error");
    }
  };

  // 🖼 Delete Image from product
  const handleDeleteImage = async (productId: string, imageUrl: string) => {
    try {
      const path = decodeURIComponent(imageUrl.split("/o/")[1].split("?")[0]);
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
      const product = products.find((p) => p.id === productId);
      if (!product) return;
      const updated = (product.images || []).filter(
        (img: string) => img !== imageUrl
      );
      await updateDoc(doc(db, "products", productId), { images: updated });
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, images: updated } : p))
      );
      showToast("Image deleted.", "success");
    } catch {
      showToast("Failed to delete image.", "error");
    }
  };

  // ✅ UI
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <h1 className="text-3xl font-bold mb-8 text-center">
        🧩 Product Management
      </h1>

      <AddProductForm
        {...{
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
          handleDeleteCategory,
        }}
      />

      {loading ? (
        <p className="text-center text-gray-500">Loading products...</p>
      ) : (
        <ProductGrid
          {...{
            products,
            handleDeleteProduct,
            handleUpdateName,
            setEditingProduct,
            setActiveProduct,
            handleUpdateStock,
            handleDeleteColor,
            setImageManagerProduct,
            setEditingColorVariant,
          }}
        />
      )}

      {editingProduct && (
        <EditProductModal
          {...{
            editingProduct,
            setEditingProduct,
            editFiles,
            setEditFiles,
            editUploading,
            setEditUploading,
            categories,
            handleUpdateProduct,
          }}
        />
      )}

      {activeProduct && (
        <ColorModal
          {...{
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
            // sizes management (passed down)
            handleAddSizeToVariant,
            handleUpdateVariantSize,
            handleDeleteSizeFromVariant,
          }}
        />
      )}

      {imageManagerProduct && (
        <ImageManagerModal
          {...{
            product: imageManagerProduct,
            setImageManagerProduct,
            handleDeleteImage,
          }}
        />
      )}

      {editingColorVariant && (
        <ColorEditModal
          {...{
            editingColorVariant,
            setEditingColorVariant,
            showToast,
            products,
            setProducts,
            handleAddSizeToVariant,
            handleUpdateVariantSize,
            handleDeleteSizeFromVariant,
            handleUpdateColorMeta,
            handleDeleteVariantImage,
            handleAddVariantImages,
          }}
        />
      )}
    </div>
  );
}
