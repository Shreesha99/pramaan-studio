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
import { ref, uploadBytes, getDownloadURL, getStorage } from "firebase/storage";
import { db } from "@/lib/firebase";
import { useToast } from "@/context/ToastContext";

// Components
import AddProductForm from "./components/AddProductForm";
import ProductGrid from "./components/ProductGrid";
import EditProductModal from "./components/EditProductModal";
import ColorModal from "./components/ColorModal";

const storage = getStorage();

export default function ProductManager() {
  const { showToast } = useToast();

  // 🧾 Products
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ➕ New Product Form
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category: "",
    featured: false,
    hasColors: false,
    showProduct: true,
  });

  const [activeProduct, setActiveProduct] = useState<any | null>(null);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // 🎨 Color Management
  const [colorName, setColorName] = useState("");
  const [stock, setStock] = useState<number>(0);
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);

  const [availableColors, setAvailableColors] = useState<string[]>([
    "Red",
    "Green",
    "Yellow",
    "Blue",
    "Maroon",
    "White",
    "Black",
  ]);
  const [addingNewColor, setAddingNewColor] = useState(false);
  const [newColorInput, setNewColorInput] = useState("");

  // 🏷️ Category Management
  const [categories, setCategories] = useState<string[]>([
    "T-Shirts",
    "Pants",
    "Shoes",
    "Accessories",
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
      const docRef = await addDoc(collection(db, "products"), {
        ...newProduct,
        price: Number(newProduct.price),
        variants: {},
      });

      showToast("Product added successfully!", "success");
      setProducts((prev) => [
        ...prev,
        { id: docRef.id, ...newProduct, variants: {} },
      ]);
      setNewProduct({
        name: "",
        price: "",
        category: "",
        featured: false,
        hasColors: false,
        showProduct: true,
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
        for (const file of Array.from(editFiles)) {
          const path = `products/${editingProduct.id}/main/${file.name}`;
          const storageRef = ref(storage, path);
          await uploadBytes(storageRef, file);
          const url = await getDownloadURL(storageRef);
          urls.push(url);
        }
        uploadedUrls = urls;
      }

      const refDoc = doc(db, "products", editingProduct.id);
      await updateDoc(refDoc, {
        name: editingProduct.name,
        price: Number(editingProduct.price),
        category: editingProduct.category,
        featured: editingProduct.featured,
        hasColors: editingProduct.hasColors,
        showProduct: editingProduct.showProduct,
        stock: Number(editingProduct.stock || 0),
        images: uploadedUrls,
      });

      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? { ...editingProduct, images: uploadedUrls }
            : p
        )
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
      setNewProduct((prev) => ({ ...prev, category: cat }));
      setNewCategoryInput("");
      setAddingNewCategory(false);
      showToast(`${cat} added to category list!`, "success");
    } finally {
      setAddingCategoryLoading(false);
    }
  };

  // ➕ Add New Color
  const handleAddNewColor = async () => {
    if (!newColorInput.trim()) {
      showToast("Please enter a color name.", "info");
      return;
    }
    const color = newColorInput.trim();
    if (availableColors.includes(color)) {
      showToast("Color already exists.", "info");
      return;
    }

    try {
      setAddingColorLoading(true);
      setAvailableColors((prev) => [...prev, color]);
      setColorName(color);
      setNewColorInput("");
      setAddingNewColor(false);
      showToast(`${color} added to color list!`, "success");
    } finally {
      setAddingColorLoading(false);
    }
  };

  // 🎨 Add Color Variant
  const handleAddColorVariant = async () => {
    if (!activeProduct) return;
    if (!colorName.trim() || !stock || !files?.length) {
      showToast("Please select color, stock, and upload image.", "info");
      return;
    }

    try {
      setUploading(true);
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const path = `products/${activeProduct.id}/${colorName}/${file.name}`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        uploadedUrls.push(url);
      }

      const productRef = doc(db, "products", activeProduct.id);
      await updateDoc(productRef, {
        [`variants.${colorName}`]: { stock, images: uploadedUrls },
      });

      setProducts((prev) =>
        prev.map((p) =>
          p.id === activeProduct.id
            ? {
                ...p,
                variants: {
                  ...p.variants,
                  [colorName]: { stock, images: uploadedUrls },
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

  // 🧾 Update Stock of Existing Color
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
        [color]: { ...product.variants[color], stock: newStock },
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

  // 🗑️ Delete Color Variant
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

  // ✅ UI
  return (
    <div className="min-h-screen bg-gray-50">
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
            colorName,
            setColorName,
            stock,
            setStock,
            files,
            setFiles,
            uploading,
            handleAddColorVariant,
          }}
        />
      )}
    </div>
  );
}
