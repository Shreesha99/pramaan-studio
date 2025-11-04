// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyA9_2ywOmk4QhF0gBg2-bGT1zFX3tf5heg",
  authDomain: "pramaan-shop.firebaseapp.com",
  projectId: "pramaan-shop",
  storageBucket: "pramaan-shop.firebasestorage.app",
  messagingSenderId: "424180784069",
  appId: "1:424180784069:web:2405aa391f6e50f276c9ac",
  measurementId: "G-PPXEPDJ5EQ",
};

// Ensure we don't reinitialize Firebase on hot reload
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);

// Analytics only runs in browser
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) getAnalytics(app);
  });
}

export { db };
