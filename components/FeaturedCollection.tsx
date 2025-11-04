"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { TrashIcon } from "@heroicons/react/24/outline";
import { gsap } from "gsap";
import { formatCurrency } from "@/lib/formatCurrency";

export default function FeaturedCollection() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { cart, addToCart, removeFromCart, increaseQty, decreaseQty } =
    useCart();
  const { showToast } = useToast();
  const { user, openAuthModal } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(
          collection(db, "products"),
          where("featured", "==", true)
        );
        const querySnapshot = await getDocs(q);
        setProducts(
          querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      } catch (err) {
        showToast("Failed to load products.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [showToast]);

  const getCartItem = (id: string) => cart.find((item) => item.id === id);

  const handleAddToCart = async (p: any) => {
    try {
      if (!user) {
        showToast("Please sign in to add to cart.", "info");
        openAuthModal();
        return;
      }

      const existing = getCartItem(p.id);
      const availableStock = p.stock ?? 0;

      if (existing && existing.qty >= availableStock) {
        showToast(`Only ${availableStock} available in stock.`, "info");
        gsap.fromTo(
          `#qty-${p.id}`,
          { scale: 1 },
          { scale: 1.2, yoyo: true, repeat: 1, duration: 0.2 }
        );
        return;
      }

      if (existing) {
        increaseQty(p.id);
        gsap.fromTo(
          `#qty-${p.id}`,
          { scale: 1.3 },
          { scale: 1, duration: 0.25, ease: "back.out(2)" }
        );
        showToast(`Increased ${p.name} quantity`, "success");
      } else {
        addToCart({ ...p, qty: 1 });
        showToast(`${p.name} added to cart!`, "success");
      }
    } catch {
      showToast("Something went wrong.", "error");
    }
  };

  const handleRemoveFromCart = (id: string, name: string) => {
    removeFromCart(id);
    showToast(`${name} removed from cart.`, "info");
  };

  return (
    <section className="max-w-[1200px] mx-auto px-6 py-16">
      <h2 className="text-3xl font-bold uppercase mb-8 text-center">
        Our Brand Featured Collection
      </h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((p) => {
            const item = getCartItem(p.id);
            const availableStock = p.stock ?? 0;

            return (
              <div
                key={p.id}
                className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition flex flex-col"
              >
                <div className="w-full h-[400px] overflow-hidden">
                  <Image
                    src={p.img}
                    alt={p.name}
                    width={400}
                    height={500}
                    className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                  />
                </div>

                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div className="text-center">
                    <h3 className="font-medium text-lg">{p.name}</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      {formatCurrency(p.price)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {availableStock > 0
                        ? `In stock: ${availableStock}`
                        : "Out of stock"}
                    </p>
                  </div>

                  <div className="mt-4 relative min-h-[48px] flex items-center justify-center">
                    {availableStock === 0 ? (
                      <span className="text-red-500 text-sm font-semibold">
                        Out of Stock
                      </span>
                    ) : !item ? (
                      <button
                        onClick={() => handleAddToCart(p)}
                        className="px-5 py-2 bg-black text-white rounded-full text-sm hover:bg-gray-900 transition"
                      >
                        Add to Cart
                      </button>
                    ) : (
                      <>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => decreaseQty(item.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-lg font-semibold hover:bg-gray-100 transition"
                          >
                            −
                          </button>
                          <span
                            id={`qty-${p.id}`}
                            className="w-8 text-center font-semibold text-sm select-none"
                          >
                            {item.qty}
                          </span>
                          <button
                            onClick={() => handleAddToCart(p)}
                            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-lg font-semibold hover:bg-gray-100 transition"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemoveFromCart(p.id, p.name)}
                          className="absolute right-0 w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 hover:bg-red-100 transition"
                          title="Remove from cart"
                        >
                          <TrashIcon className="w-4 h-4 text-red-500" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
