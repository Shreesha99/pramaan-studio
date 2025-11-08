"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { gsap } from "gsap";
import { formatCurrency } from "@/lib/formatCurrency";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ProductsPage() {
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

  // ✅ Fetch all visible products (not just featured)
  useEffect(() => {
    const q = query(
      collection(db, "products"),
      where("showProduct", "==", true)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(data);
        setLoading(false);
      },
      (error) => {
        console.error("Product sync error:", error);
        showToast("Failed to load products.", "error");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [showToast]);

  const getCartItem = (id: string, color?: string) =>
    cart.find((i) => i.id === id && i.color === color);

  const handleAddToCart = (p: any) => {
    const hasColors = p.hasColors;
    const selectedClr = selectedColor[p.id];
    const color = hasColors ? selectedClr : "default";
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
      showToast("Select a color first.", "info");
      return;
    }

    if (availableStock <= 0) {
      showToast("Out of stock.", "error");
      return;
    }

    const existing = getCartItem(p.id, color);
    if (existing) {
      if (existing.qty >= availableStock) {
        showToast(`Only ${availableStock} available.`, "info");
        gsap.fromTo(
          `#qty-${p.id}-${color}`,
          { scale: 1 },
          { scale: 1.2, yoyo: true, repeat: 1, duration: 0.2 }
        );
        return;
      }

      increaseQty(p.id, color);
      showToast("Quantity updated.", "success");
      return;
    }

    addToCart({
      id: p.id,
      name: p.name,
      price: p.price,
      qty: 1,
      color,
      stock: availableStock,
      img: image,
    });

    showToast(`${p.name} added to cart!`, "success");
  };

  const handleRemoveFromCart = (id: string, name: string, color?: string) => {
    removeFromCart(id, color);
    showToast(`${name} removed from cart.`, "info");
  };

  const handlePrevImage = (pid: string, total: number) => {
    setActiveImageIndex((prev) => ({
      ...prev,
      [pid]: ((prev[pid] ?? 0) - 1 + total) % total,
    }));
  };

  const handleNextImage = (pid: string, total: number) => {
    setActiveImageIndex((prev) => ({
      ...prev,
      [pid]: ((prev[pid] ?? 0) + 1) % total,
    }));
  };

  return (
    <>
      <Header />

      <main className="relative flex flex-col items-center justify-center w-full min-h-screen px-6 py-20 bg-white">
        <div className="w-full max-w-[1300px] mx-auto">
          <h1 className="text-4xl font-bold uppercase mb-10 text-center tracking-tight">
            All Products
          </h1>

          {loading ? (
            <p className="text-center text-gray-500">Loading products...</p>
          ) : products.length === 0 ? (
            <p className="text-center text-gray-400">No products available.</p>
          ) : (
            <div
              className="
          grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 
          gap-10 justify-center items-center
          mx-auto w-full
        "
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
                    className="group relative bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 max-w-[400px] w-full mx-auto"
                  >
                    {p.featured && (
                      <div className="absolute top-4 -right-10 bg-black text-white text-xs font-semibold rotate-45 px-14 py-1 shadow-md">
                        Featured
                      </div>
                    )}

                    <Link href={`/product/${p.id}`}>
                      <div className="relative h-[400px] w-full overflow-hidden">
                        <Image
                          src={displayImg}
                          alt={p.name}
                          width={500}
                          height={500}
                          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                        />

                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition text-white font-semibold text-lg">
                          View Product
                        </div>

                        {images.length > 1 && (
                          <>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handlePrevImage(p.id, images.length);
                              }}
                              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition"
                            >
                              <ChevronLeftIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleNextImage(p.id, images.length);
                              }}
                              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition"
                            >
                              <ChevronRightIcon className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </Link>

                    <div className="p-5 flex flex-col text-center">
                      <h3 className="font-semibold text-lg">{p.name}</h3>
                      <p className="text-gray-500 text-sm mt-1">
                        {formatCurrency(p.price)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {availableStock > 0
                          ? `In Stock: ${availableStock}`
                          : "Out of Stock"}
                      </p>

                      {p.hasColors && (
                        <div className="flex justify-center gap-2 mt-3">
                          {Object.keys(p.variants || {}).map((clr) => (
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

                      <div className="mt-5 min-h-[50px] flex justify-center items-center">
                        {availableStock === 0 ? (
                          <span className="text-red-500 font-semibold text-sm">
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
                          <div className="flex items-center gap-2 relative">
                            <button
                              onClick={() => decreaseQty(item.id, color)}
                              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-lg font-semibold hover:bg-gray-100"
                            >
                              −
                            </button>
                            <span
                              id={`qty-${p.id}-${color}`}
                              className="w-8 text-center font-semibold text-sm"
                            >
                              {item.qty}
                            </span>
                            <button
                              onClick={() => handleAddToCart(p)}
                              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-lg font-semibold hover:bg-gray-100"
                            >
                              +
                            </button>
                            <button
                              onClick={() =>
                                handleRemoveFromCart(p.id, p.name, color)
                              }
                              className="absolute -right-10 w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-red-100"
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
        </div>
      </main>

      <Footer />
    </>
  );
}
