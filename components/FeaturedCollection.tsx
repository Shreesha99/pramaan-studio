"use client";

import Image from "next/image";
import { Key, useEffect, useState } from "react";
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import {
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { gsap } from "gsap";
import { formatCurrency } from "@/lib/formatCurrency";
import Link from "next/link";

export default function FeaturedCollection() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { cart, addToCart, removeFromCart, increaseQty, decreaseQty } =
    useCart();
  const { showToast } = useToast();
  const { user, openAuthModal } = useAuth();

  const [activeImageIndex, setActiveImageIndex] = useState<{
    [key: string]: number;
  }>({});
  const [selectedColor, setSelectedColor] = useState<{
    [key: string]: string;
  }>({});

  // ✅ Load featured + visible products
  useEffect(() => {
    const q = query(
      collection(db, "products"),
      where("featured", "==", true),
      where("showProduct", "==", true)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(items);
        setLoading(false);
      },
      (error) => {
        console.error("Realtime product listener failed:", error);
        showToast("Failed to sync products.", "error");
        setLoading(false);
      }
    );

    return () => unsubscribe(); // cleanup on unmount
  }, [showToast]);

  const getCartItem = (id: string, color?: string) =>
    cart.find((item) => item.id === id && item.color === color);

  // ✅ Add to cart with correct variant image & stock
  const handleAddToCart = (p: any) => {
    const hasColors = p.hasColors;
    const selectedClr = selectedColor[p.id];
    const color = hasColors ? selectedClr : "default";

    // 🧠 Pick correct variant or base product
    const variant = hasColors ? p.variants?.[color] : null;
    const availableStock = hasColors ? variant?.stock ?? 0 : p.stock ?? 0;

    const image = hasColors
      ? variant?.images?.[0] || "/placeholder.png"
      : p.images?.[0] || "/placeholder.png";

    if (!user) {
      showToast("Please sign in to add to cart.", "info");
      openAuthModal();
      return;
    }

    if (hasColors && !selectedClr) {
      showToast("Please select a color before adding to cart.", "info");
      return;
    }

    if (availableStock <= 0) {
      showToast("This item is out of stock.", "info");
      return;
    }

    const existing = getCartItem(p.id, color);

    if (existing) {
      // 🧠 Prevent exceeding stock
      if (existing.qty >= availableStock) {
        showToast(`Only ${availableStock} in stock.`, "info");
        gsap.fromTo(
          `#qty-${p.id}-${color}`,
          { scale: 1 },
          { scale: 1.2, yoyo: true, repeat: 1, duration: 0.2 }
        );
        return;
      }

      increaseQty(p.id, color);
      gsap.fromTo(
        `#qty-${p.id}-${color}`,
        { scale: 1.3 },
        { scale: 1, duration: 0.25, ease: "back.out(2)" }
      );
      showToast(`${p.name} (${color}) quantity increased`, "success");
      return;
    }

    // 🧩 Add new cart item
    addToCart({
      id: p.id,
      name: p.name,
      price: p.price,
      img: image,
      qty: 1,
      color,
      stock: availableStock,
    });
    showToast(
      `${p.name}${color !== "default" ? ` (${color})` : ""} added to cart!`,
      "success"
    );
  };

  const handleRemoveFromCart = (id: string, name: string, color?: string) => {
    removeFromCart(id, color);
    showToast(`${name} (${color}) removed from cart.`, "info");
  };

  const handlePrevImage = (productId: string, total: number) => {
    setActiveImageIndex((prev) => ({
      ...prev,
      [productId]: ((prev[productId] ?? 0) - 1 + total) % total,
    }));
  };

  const handleNextImage = (productId: string, total: number) => {
    setActiveImageIndex((prev) => ({
      ...prev,
      [productId]: ((prev[productId] ?? 0) + 1) % total,
    }));
  };

  return (
    <section className="max-w-[1200px] mx-auto px-6 py-16">
      <h2 className="text-3xl font-bold uppercase mb-8 text-center">
        Our Featured Collection
      </h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : products.length === 0 ? (
        <p className="text-center text-gray-400">No featured products yet.</p>
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3
        gap-6"
        >
          {products.map((p) => {
            const color =
              selectedColor[p.id] ||
              (p.hasColors ? Object.keys(p.variants || {})[0] : "default");
            const variant = p.variants?.[color];
            const availableStock = p.hasColors
              ? variant?.stock ?? 0
              : p.stock ?? 0;

            const images =
              Array.isArray(variant?.images) && variant.images.length > 0
                ? variant.images
                : Array.isArray(p.images)
                ? p.images
                : [];

            const activeIndex = activeImageIndex[p.id] ?? 0;
            const displayImg =
              images.length > 0 ? images[activeIndex] : "/placeholder.png";

            const item = getCartItem(p.id, color);

            return (
              <div
                key={p.id + color}
                className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition flex flex-col"
              >
                {/* Product Image Carousel */}
                {/* Product Image Carousel */}
                <Link href={`/product/${p.id}`} className="block">
                  <div className="relative w-full h-[400px] overflow-hidden group cursor-pointer">
                    <Image
                      src={displayImg}
                      alt={p.name}
                      width={400}
                      height={500}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* ✅ Hover “View Product” overlay */}
                    <div
                      className="
      absolute inset-0 flex items-center justify-center 
      opacity-0 group-hover:opacity-100 
      transition bg-black/40 backdrop-blur-sm
      text-white text-lg font-semibold
      pointer-events-none
    "
                    >
                      View Product
                    </div>

                    {/* ✅ Image carousel arrows (your existing code stays same) */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handlePrevImage(p.id, images.length);
                          }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
                        >
                          <ChevronLeftIcon className="w-5 h-5" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleNextImage(p.id, images.length);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
                        >
                          <ChevronRightIcon className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </Link>

                {/* Product Info */}
                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div className="text-center">
                    <h3 className="font-medium text-lg">{p.name}</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      {formatCurrency(p.price)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {availableStock > 0
                        ? `In stock: ${availableStock}`
                        : p.hasColors
                        ? "No variants available"
                        : "Out of stock"}
                    </p>

                    {/* Color selector */}
                    {p.hasColors && p.variants && (
                      <div className="flex justify-center gap-2 mt-3">
                        {Object.keys(p.variants).map((clr) => (
                          <button
                            key={clr}
                            onClick={() =>
                              setSelectedColor((prev) => ({
                                ...prev,
                                [p.id]: clr,
                              }))
                            }
                            className={`w-6 h-6 rounded-full border-2 ${
                              selectedColor[p.id] === clr
                                ? "border-black scale-110"
                                : "border-gray-300"
                            } transition-transform`}
                            style={{ backgroundColor: clr }}
                            title={clr}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add to cart section */}
                  <div className="mt-4 relative min-h-12 flex items-center justify-center">
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
                      <div className="flex items-center justify-center gap-2 relative">
                        <button
                          onClick={() => decreaseQty(item.id, color)}
                          className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-lg font-semibold hover:bg-gray-100 transition"
                        >
                          −
                        </button>
                        <span
                          id={`qty-${p.id}-${color}`}
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
                        <button
                          onClick={() =>
                            handleRemoveFromCart(p.id, p.name, color)
                          }
                          className="absolute -right-10 w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 hover:bg-red-100 transition"
                          title="Remove from cart"
                        >
                          <TrashIcon className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
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
