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
import { getDefaultGST } from "../utils/getDefaultGST";

const storage = getStorage();

export const useProducts = () => {
  const { showToast } = useToast();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const q = await getDocs(collection(db, "products"));
      const list = q.docs.map((d) => ({ id: d.id, ...d.data() }));
      setProducts(list);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  // 🧾 Add Product
  const addProduct = async (newProduct: any) => {
    if (!newProduct.name.trim() || !newProduct.price) {
      showToast("Please fill product name and price.", "info");
      return false;
    }
    if (!newProduct.category) {
      showToast("Please select a category.", "info");
      return false;
    }

    try {
      const gst = getDefaultGST(newProduct.category);
      const docRef = await addDoc(collection(db, "products"), {
        ...newProduct,
        price: Number(newProduct.price),
        gst,
        variants: {},
      });
      setProducts((prev) => [
        ...prev,
        { id: docRef.id, ...newProduct, gst, variants: {} },
      ]);
      showToast("Product added successfully!", "success");
      return true;
    } catch (err) {
      console.error(err);
      showToast("Failed to add product.", "error");
      return false;
    }
  };

  // 🗑 Delete Product
  const deleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, "products", id));
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast("Product deleted successfully.", "success");
    } catch {
      showToast("Failed to delete product.", "error");
    }
  };

  // ✏️ Update Product
  const updateProduct = async (
    editingProduct: any,
    editFiles: FileList | null
  ) => {
    try {
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
        gst: editingProduct.gst || getDefaultGST(editingProduct.category),
        images: uploadedUrls,
      });

      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? { ...editingProduct, images: uploadedUrls }
            : p
        )
      );
      showToast("Product updated successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to update product.", "error");
    }
  };

  return {
    products,
    loading,
    addProduct,
    deleteProduct,
    updateProduct,
    setProducts,
  };
};
