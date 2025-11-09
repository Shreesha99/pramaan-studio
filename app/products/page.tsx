"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { gsap } from "gsap";
import { formatCurrency } from "@/lib/formatCurrency";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer";
import CustomCursor from "@/components/CustomCursor";

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
  const [selectedColor, setSelectedColor] = useState<{ [key: string]: string }>(
    {}
  );

  // 🧭 NEW STATES
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFilterColor, setSelectedFilterColor] = useState("All");

  // ✅ Fetch visible products
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

  // 🌀 Carousel (unchanged)
  useEffect(() => {
    const paused: Record<string, boolean> = {};
    const intervals: Record<string, NodeJS.Timeout> = {};

    const pauseHandler = (e: any) => (paused[e.detail] = true);
    const resumeHandler = (e: any) => (paused[e.detail] = false);

    window.addEventListener("pause-carousel", pauseHandler);
    window.addEventListener("resume-carousel", resumeHandler);

    products.forEach((p) => {
      const color =
        selectedColor[p.id] ||
        (p.hasColors ? Object.keys(p.variants || {})[0] : "default");

      const images = p.hasColors
        ? p.variants?.[color]?.images || []
        : p.images || [];

      if (images.length > 1) {
        intervals[p.id] = setInterval(() => {
          if (paused[p.id]) return;
          setActiveImageIndex((prev) => {
            const next = ((prev[p.id] ?? 0) + 1) % images.length;
            const imgEl = document.querySelector(
              `#img-${p.id}`
            ) as HTMLElement | null;
            if (imgEl) {
              gsap.fromTo(
                imgEl,
                { opacity: 0, scale: 1.05 },
                { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out" }
              );
            }
            return { ...prev, [p.id]: next };
          });
        }, 3500);
      }
    });

    return () => {
      Object.values(intervals).forEach(clearInterval);
      window.removeEventListener("pause-carousel", pauseHandler);
      window.removeEventListener("resume-carousel", resumeHandler);
    };
  }, [products, selectedColor]);

  // 🧠 Filtered Products (computed with search + category + color)
  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term);

      const matchesCategory =
        selectedCategory === "All" || p.category === selectedCategory;

      const matchesColor =
        selectedFilterColor === "All" ||
        (p.hasColors &&
          Object.keys(p.variants || {}).some(
            (clr) => clr.toLowerCase() === selectedFilterColor.toLowerCase()
          ));

      return matchesSearch && matchesCategory && matchesColor;
    });
  }, [products, searchTerm, selectedCategory, selectedFilterColor]);

  // 🧩 Extract category/color lists for filters
  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(products.map((p) => p.category).filter(Boolean))
    );
    return ["All", ...unique];
  }, [products]);

  const colors = useMemo(() => {
    const clrSet = new Set<string>();
    products.forEach((p) => {
      if (p.hasColors) {
        Object.keys(p.variants || {}).forEach((c) => clrSet.add(c));
      }
    });
    return ["All", ...Array.from(clrSet)];
  }, [products]);

  const getCartItem = (id: string, color?: string) =>
    cart.find((i) => i.id === id && i.color === color);

  // 🛒 Add to Cart logic (unchanged)
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

  // 🖼️ Navigation between images
  const handleNextImage = (pid: string, total: number) => {
    const imgEl = document.querySelector(`#img-${pid}`) as HTMLElement | null;
    if (imgEl) {
      gsap.fromTo(
        imgEl,
        { opacity: 0, x: 40 },
        { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }
      );
    }
    setActiveImageIndex((prev) => ({
      ...prev,
      [pid]: ((prev[pid] ?? 0) + 1) % total,
    }));
  };

  const handlePrevImage = (pid: string, total: number) => {
    const imgEl = document.querySelector(`#img-${pid}`) as HTMLElement | null;
    if (imgEl) {
      gsap.fromTo(
        imgEl,
        { opacity: 0, x: -40 },
        { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }
      );
    }
    setActiveImageIndex((prev) => ({
      ...prev,
      [pid]: ((prev[pid] ?? 0) - 1 + total) % total,
    }));
  };

  // 🧭 Animate result refresh
  useEffect(() => {
    gsap.fromTo(
      ".product-card",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, stagger: 0.05, duration: 0.4, ease: "power2.out" }
    );
  }, [filteredProducts]);

  return (
    <>
      <Header />

      <main className="flex flex-col items-center justify-center w-full min-h-screen px-2 py-20 bg-white">
        <div className="w-full max-w-[1300px] mx-auto">
          <h1 className="text-4xl font-bold uppercase mb-10 text-center tracking-tight">
            All Products
          </h1>

          {/* 🧭 Search + Filters + Clear */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-10 bg-gray-50 p-4 rounded-lg border relative">
            {/* Search Bar */}
            <div className="flex items-center gap-2 w-full md:w-1/2">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent outline-none px-2 py-1 text-sm"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3 flex-wrap justify-center md:justify-end items-center">
              <div className="flex items-center gap-2">
                <FunnelIcon className="w-4 h-4 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border rounded-md px-2 py-1 text-sm"
                >
                  {categories.map((cat) => (
                    <option key={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">Color</span>
                <select
                  value={selectedFilterColor}
                  onChange={(e) => setSelectedFilterColor(e.target.value)}
                  className="border rounded-md px-2 py-1 text-sm"
                >
                  {colors.map((clr) => (
                    <option key={clr}>{clr}</option>
                  ))}
                </select>
              </div>

              {/* 🧹 Clear Filters Button */}
              {(searchTerm ||
                selectedCategory !== "All" ||
                selectedFilterColor !== "All") && (
                <button
                  onClick={() => {
                    gsap.fromTo(
                      "#clear-filters-btn",
                      { opacity: 0, y: -5 },
                      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
                    );
                    setSearchTerm("");
                    setSelectedCategory("All");
                    setSelectedFilterColor("All");
                  }}
                  id="clear-filters-btn"
                  className="text-sm text-gray-600 border border-gray-300 rounded-full px-3 py-1 hover:bg-gray-100 transition"
                >
                  Clear Filters ✕
                </button>
              )}
            </div>
          </div>

          {/* 🧱 Products */}
          {loading ? (
            <p className="text-center text-gray-500">Loading products...</p>
          ) : filteredProducts.length === 0 ? (
            <p className="text-center text-gray-400">
              No matching products found.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 justify-center items-stretch mx-auto w-full">
              {filteredProducts.map((p) => {
                // ✅ Smart default + dynamic stock behavior
                const hasDefaultImage =
                  Array.isArray(p.images) && p.images.length > 0;
                const hasColors =
                  p.hasColors &&
                  p.variants &&
                  Object.keys(p.variants).length > 0;

                let color = selectedColor[p.id] || "default";
                let variant = null;
                let images: string[] = [];
                let availableStock = p.stock ?? 0;

                // ✅ If product has color variants
                if (hasColors) {
                  const colorKeys = Object.keys(p.variants || {});

                  if (hasDefaultImage) {
                    // Product has a main bundle/default image
                    if (!selectedColor[p.id]) {
                      // No color selected → show default image + total stock
                      images = p.images;
                      availableStock = colorKeys.reduce(
                        (sum, clr) => sum + (p.variants?.[clr]?.stock || 0),
                        0
                      );
                    } else {
                      // Color selected → show that color’s images + color stock
                      color = selectedColor[p.id];
                      variant = p.variants[color];
                      images = variant?.images || [];
                      availableStock = variant?.stock ?? 0;
                    }
                  } else {
                    // No default image → pick first color or selected color
                    const defaultClr = selectedColor[p.id] || colorKeys[0];
                    color = defaultClr;
                    variant = p.variants[defaultClr];
                    images = variant?.images || [];
                    availableStock = variant?.stock ?? 0;
                  }
                } else {
                  // No colors → fallback
                  images = Array.isArray(p.images) ? p.images : [];
                  availableStock = p.stock ?? 0;
                }

                const activeIndex = activeImageIndex[p.id] ?? 0;
                const displayImg =
                  images.length > 0 ? images[activeIndex] : "/placeholder.png";
                const item = getCartItem(p.id, color);

                return (
                  <div
                    key={p.id + color}
                    className="product-card group relative bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 max-w-[380px] w-full mx-auto flex flex-col"
                    style={{ minHeight: "560px" }}
                  >
                    {/* Product Image */}
                    <Link
                      href={`/product/${p.id}`}
                      className="relative block shrink-0"
                      onMouseEnter={() =>
                        window.dispatchEvent(
                          new CustomEvent("pause-carousel", { detail: p.id })
                        )
                      }
                      onMouseLeave={() =>
                        window.dispatchEvent(
                          new CustomEvent("resume-carousel", { detail: p.id })
                        )
                      }
                    >
                      <div
                        className="relative h-80 w-full overflow-hidden cursor-none" // hides default cursor
                        onMouseEnter={() =>
                          document.body.classList.add("cursor-view")
                        }
                        onMouseLeave={() =>
                          document.body.classList.remove("cursor-view")
                        }
                      >
                        <Image
                          id={`img-${p.id}`}
                          key={displayImg}
                          src={displayImg}
                          alt={p.name}
                          width={500}
                          height={500}
                          className="object-cover w-full h-full"
                        />

                        {images.length > 1 && (
                          <>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handlePrevImage(p.id, images.length);
                              }}
                              className="cursor-pointer no-cursor-zone absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition"
                            >
                              <ChevronLeftIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleNextImage(p.id, images.length);
                              }}
                              className="cursor-pointer no-cursor-zone absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition"
                            >
                              <ChevronRightIcon className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </Link>

                    {/* Product Info (unchanged) */}
                    <div className="p-5 flex flex-col text-center flex-1 justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{p.name}</h3>
                        {p.featured && (
                          <div className="flex justify-center items-center gap-1 mt-1 text-[13px] text-yellow-600 font-medium">
                            <span>⭐</span> <span>Featured</span>
                          </div>
                        )}
                        <p className="text-gray-500 text-sm mt-2">
                          {formatCurrency(p.price)}
                        </p>
                        <p
                          className={`text-xs mt-1 ${
                            availableStock > 0
                              ? "text-gray-400"
                              : "text-red-500 font-semibold"
                          }`}
                        >
                          {availableStock > 0
                            ? `In Stock: ${availableStock}`
                            : "Out of Stock"}
                        </p>
                      </div>

                      {/* Color Selector (unchanged) */}
                      {p.hasColors && (
                        <div className="flex justify-center gap-2 mt-3 flex-wrap">
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

                      {/* Cart Buttons */}
                      <div className="mt-5 min-h-[60px] flex justify-center items-center">
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
      <CustomCursor />
    </>
  );
}
