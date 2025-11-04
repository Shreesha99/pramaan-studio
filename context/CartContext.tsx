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
  getDocs,
  collection,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

interface CartItem {
  id: string;
  name: string;
  price: number;
  img: string;
  qty: number;
  stock?: number;
}

interface CartContextType {
  cart: CartItem[];
  totalQty: number;
  totalAmount: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  increaseQty: (id: string) => void;
  decreaseQty: (id: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);

  // --- Derived values ---
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalAmount = cart.reduce(
    (sum, item) => sum + item.qty * item.price,
    0
  );

  // --- Firestore Sync Helpers ---
  const userCartRef = user ? collection(db, "users", user.uid, "cart") : null;

  // Load user cart on login
  // Load user cart on login
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

  // --- Local Update + Firestore Sync ---
  const syncToFirestore = useCallback(
    async (item: CartItem) => {
      if (!userCartRef) return;
      const docRef = doc(userCartRef, item.id);
      await setDoc(docRef, item);
    },
    [userCartRef]
  );

  const deleteFromFirestore = useCallback(
    async (id: string) => {
      if (!userCartRef) return;
      await deleteDoc(doc(userCartRef, id));
    },
    [userCartRef]
  );

  // --- Cart Actions ---
  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const exists = prev.find((p) => p.id === item.id);
      if (exists) {
        const updated = prev.map((p) =>
          p.id === item.id ? { ...p, qty: p.qty + 1 } : p
        );
        syncToFirestore({ ...exists, qty: exists.qty + 1 });
        return updated;
      } else {
        syncToFirestore(item);
        return [...prev, item];
      }
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((p) => p.id !== id));
    deleteFromFirestore(id);
  };

  const increaseQty = (id: string) => {
    setCart((prev) => {
      const updated = prev.map((p) =>
        p.id === id ? { ...p, qty: p.qty + 1 } : p
      );
      const item = updated.find((i) => i.id === id);
      if (item) syncToFirestore(item);
      return updated;
    });
  };

  const decreaseQty = (id: string) => {
    setCart((prev) => {
      const updated = prev
        .map((p) => (p.id === id ? { ...p, qty: p.qty - 1 } : p))
        .filter((p) => p.qty > 0);
      const item = updated.find((i) => i.id === id);
      if (item) syncToFirestore(item);
      else deleteFromFirestore(id);
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
    if (userCartRef) {
      cart.forEach((i) => deleteFromFirestore(i.id));
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
