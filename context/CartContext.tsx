"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  img: string;
  qty: number;
  color?: string; // ✅ added for variant color
  stock?: number;
}

interface CartContextType {
  cart: CartItem[];
  totalQty: number;
  totalAmount: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, color?: string) => void;
  increaseQty: (id: string, color?: string) => void;
  decreaseQty: (id: string, color?: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);

  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalAmount = cart.reduce(
    (sum, item) => sum + item.qty * item.price,
    0
  );

  const userCartRef = user ? collection(db, "users", user.uid, "cart") : null;

  // --- Load user cart from Firestore ---
  useEffect(() => {
    if (!userCartRef) {
      setCart([]);
      return;
    }

    const unsub = onSnapshot(userCartRef, (snapshot) => {
      const items: CartItem[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as Omit<CartItem, "id">;
        items.push({ id: d.id, ...data });
      });
      setCart(items);
    });

    return () => unsub();
  }, [user]);

  // --- Firestore helpers ---
  const getFirestoreId = (id: string, color?: string) =>
    color && color !== "default" ? `${id}__${color}` : id;

  const syncToFirestore = useCallback(
    async (item: CartItem) => {
      if (!userCartRef) return;
      const docRef = doc(userCartRef, getFirestoreId(item.id, item.color));
      await setDoc(docRef, item);
    },
    [userCartRef]
  );

  const deleteFromFirestore = useCallback(
    async (id: string, color?: string) => {
      if (!userCartRef) return;
      const docRef = doc(userCartRef, getFirestoreId(id, color));
      await deleteDoc(docRef);
    },
    [userCartRef]
  );

  // --- Cart Actions ---
  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find(
        (p) => p.id === item.id && p.color === item.color
      );

      // 🧠 Respect stock limit
      if (existing) {
        if (existing.stock && existing.qty >= existing.stock) return prev;
        const updated = prev.map((p) =>
          p.id === item.id && p.color === item.color
            ? { ...p, qty: p.qty + 1 }
            : p
        );
        syncToFirestore({ ...existing, qty: existing.qty + 1 });
        return updated;
      } else {
        syncToFirestore(item);
        return [...prev, item];
      }
    });
  };

  const removeFromCart = (id: string, color?: string) => {
    setCart((prev) => prev.filter((p) => !(p.id === id && p.color === color)));
    deleteFromFirestore(id, color);
  };

  const increaseQty = (id: string, color?: string) => {
    setCart((prev) => {
      const updated = prev.map((p) =>
        p.id === id && p.color === color ? { ...p, qty: p.qty + 1 } : p
      );
      const item = updated.find((i) => i.id === id && i.color === color);
      if (item) syncToFirestore(item);
      return updated;
    });
  };

  const decreaseQty = (id: string, color?: string) => {
    setCart((prev) => {
      const updated = prev
        .map((p) =>
          p.id === id && p.color === color ? { ...p, qty: p.qty - 1 } : p
        )
        .filter((p) => p.qty > 0);
      const item = updated.find((i) => i.id === id && i.color === color);
      if (item) syncToFirestore(item);
      else deleteFromFirestore(id, color);
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
    if (userCartRef) {
      cart.forEach((i) => deleteFromFirestore(i.id, i.color));
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        totalQty,
        totalAmount,
        addToCart,
        removeFromCart,
        increaseQty,
        decreaseQty,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
