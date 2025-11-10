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

export interface GSTInfo {
  cgst?: number;
  sgst?: number;
  total?: number;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  img: string;
  qty: number;
  color?: string;
  size?: string;
  stock?: number;
  gst?: GSTInfo;
}

interface CartContextType {
  cart: CartItem[];
  totalQty: number;
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  totalAmount: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, color?: string, size?: string) => void;
  increaseQty: (id: string, color?: string, size?: string) => void;
  decreaseQty: (id: string, color?: string, size?: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const userCartRef = user ? collection(db, "users", user.uid, "cart") : null;

  // --- Load user cart ---
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

  // --- Helpers ---
  const getFirestoreId = (id: string, color?: string, size?: string) => {
    const parts = [id];
    if (color && color !== "default") parts.push(color);
    if (size) parts.push(size);
    return parts.join("__");
  };

  const syncToFirestore = useCallback(
    async (item: CartItem) => {
      if (!userCartRef) return;
      const docRef = doc(
        userCartRef,
        getFirestoreId(item.id, item.color, item.size)
      );
      await setDoc(docRef, item);
    },
    [userCartRef]
  );

  const deleteFromFirestore = useCallback(
    async (id: string, color?: string, size?: string) => {
      if (!userCartRef) return;
      const docRef = doc(userCartRef, getFirestoreId(id, color, size));
      await deleteDoc(docRef);
    },
    [userCartRef]
  );

  // --- Cart Actions ---
  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find(
        (p) =>
          p.id === item.id && p.color === item.color && p.size === item.size
      );

      if (existing) {
        if (existing.stock && existing.qty >= existing.stock) return prev;
        const updated = prev.map((p) =>
          p.id === item.id && p.color === item.color && p.size === item.size
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

  const removeFromCart = (id: string, color?: string, size?: string) => {
    setCart((prev) =>
      prev.filter((p) => !(p.id === id && p.color === color && p.size === size))
    );
    deleteFromFirestore(id, color, size);
  };

  const increaseQty = (id: string, color?: string, size?: string) => {
    setCart((prev) => {
      const updated = prev.map((p) =>
        p.id === id && p.color === color && p.size === size
          ? { ...p, qty: p.qty + 1 }
          : p
      );
      const item = updated.find(
        (i) => i.id === id && i.color === color && i.size === size
      );
      if (item) syncToFirestore(item);
      return updated;
    });
  };

  const decreaseQty = (id: string, color?: string, size?: string) => {
    setCart((prev) => {
      const updated = prev
        .map((p) =>
          p.id === id && p.color === color && p.size === size
            ? { ...p, qty: p.qty - 1 }
            : p
        )
        .filter((p) => p.qty > 0);
      const item = updated.find(
        (i) => i.id === id && i.color === color && i.size === size
      );
      if (item) syncToFirestore(item);
      else deleteFromFirestore(id, color, size);
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
    if (userCartRef) {
      cart.forEach((i) => deleteFromFirestore(i.id, i.color, i.size));
    }
  };

  // --- Derived Totals ---
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.qty * item.price, 0);

  // per-item tax based on gst fields
  const taxTotal = cart.reduce((sum, item) => {
    const taxRate = item.gst?.total ?? 0;
    return sum + item.qty * item.price * (taxRate / 100);
  }, 0);

  const grandTotal = subtotal + taxTotal;

  return (
    <CartContext.Provider
      value={{
        cart,
        totalQty,
        subtotal,
        taxTotal,
        grandTotal,
        totalAmount: subtotal, // alias for backward compatibility
        addToCart,
        removeFromCart,
        increaseQty,
        decreaseQty,
        clearCart,
        isCartOpen,
        setIsCartOpen,
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
