import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";

const storage = getStorage();

export async function uploadProductImages(
  productId: string,
  files: File[],
  color?: string
) {
  const uploadedUrls: string[] = [];

  for (const file of files) {
    const filePath = color
      ? `products/${productId}/${color}/${file.name}`
      : `products/${productId}/${file.name}`;
    const storageRef = ref(storage, filePath);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    uploadedUrls.push(url);
  }

  // Store URLs in Firestore
  const productRef = doc(db, "products", productId);

  if (color) {
    // store inside `variants: { color: [urls...] }`
    await updateDoc(productRef, {
      [`variants.${color}`]: arrayUnion(...uploadedUrls),
    });
  } else {
    // fallback (no color)
    await updateDoc(productRef, {
      images: arrayUnion(...uploadedUrls),
    });
  }

  return uploadedUrls;
}
