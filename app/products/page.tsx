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
  const {
    cart,
    addToCart,
    removeFromCart,
    increaseQty,
    decreaseQty,
    setIsCartOpen,
  } = useCart();
  const { showToast } = useToast();
  const { user, openAuthModal } = useAuth();

  const [activeImageIndex, setActiveImageIndex] = useState<{
    [key: string]: number;
  }>({});
  const [selectedColor, setSelectedColor] = useState<{ [key: string]: string }>(
    {}
  );
  const [selectedSize, setSelectedSize] = useState<{ [key: string]: string }>(
    {}
  );

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFilterColor, setSelectedFilterColor] = useState("All");

  // Fetch visible products
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

  // Carousel
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

  // Filtered products
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

  // Extract categories/colors for filters
  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(products.map((p) => p.category).filter(Boolean))
    );
    return ["All", ...unique];
  }, [products]);

  const colors = useMemo(() => {
    const clrSet = new Set<string>();
    products.forEach((p) => {
      if (p.hasColors)
        Object.keys(p.variants || {}).forEach((c) => clrSet.add(c));
    });
    return ["All", ...Array.from(clrSet)];
  }, [products]);

  const getCartItem = (id: string, color?: string, size?: string) =>
    cart.find((i) => i.id === id && i.color === color && i.size === size);

  // Add to cart
  const handleAddToCart = (p: any) => {
    const hasColors = p.hasColors;
    const selectedClr = selectedColor[p.id];
    const selectedSz = selectedSize[p.id];
    const color = hasColors ? selectedClr : "default";
    const variant = hasColors ? p.variants?.[color] : null;

    // 🧾 Determine stock
    let availableStock: number | null = 0;

    if (hasColors && selectedClr) {
      // ✅ Color selected → variant-level stock
      if (variant?.sizes) {
        if (selectedSz) {
          availableStock = variant.sizes[selectedSz] ?? 0;
        } else {
          const sizeValues = Object.values(variant.sizes || {}) as number[];
          availableStock = sizeValues.reduce((a, b) => a + (b || 0), 0);
        }
      } else {
        availableStock = variant?.stock ?? 0;
      }
    } else if (!hasColors) {
      // ✅ No colors → use base product stock
      availableStock = p.stock ?? 0;
    } else {
      // ✅ Has colors but no color selected yet → "not determined"
      availableStock = null;
    }

    const image = hasColors ? variant?.images?.[0] : p.images?.[0];

    // ✅ Use only base price (exclude GST)
    const basePrice = Number(p.price);
    const gst = p.gst ?? { cgst: 0, sgst: 0, total: 0 };

    if (!user) {
      showToast("Please sign in to add to cart.", "info");
      openAuthModal();
      return;
    }
    if (hasColors && !selectedClr) {
      showToast("Select a color first.", "info");
      return;
    }
    if (variant?.sizes && !selectedSz) {
      showToast("Select a size first.", "info");
      return;
    }
    if (availableStock === null) {
      showToast("Select a color to view stock first.", "info");
      return;
    }

    if (availableStock <= 0) {
      showToast("Out of stock.", "error");
      return;
    }

    const existing = getCartItem(p.id, color, selectedSz);
    if (existing) {
      if (existing.qty >= (availableStock ?? 0)) {
        showToast(`Only ${availableStock} available.`, "info");
        gsap.fromTo(
          `#qty-${p.id}-${color}-${selectedSz}`,
          { scale: 1 },
          { scale: 1.2, yoyo: true, repeat: 1, duration: 0.2 }
        );
        return;
      }
      increaseQty(p.id, color, selectedSz);
      showToast("Quantity updated.", "success");
      return;
    }

    // ✅ Add to cart with base price
    addToCart({
      id: p.id,
      name: p.name,
      price: basePrice, // ✅ base price only
      qty: 1,
      color,
      size: selectedSz,
      stock: availableStock,
      img: image,
      gst, // ✅ pass gst info for later calculation
    });

    showToast(`${p.name} added to cart!`, "success");
  };

  const handleRemoveFromCart = (
    id: string,
    name: string,
    color?: string,
    size?: string
  ) => {
    removeFromCart(id, color, size);
    showToast(`${name} removed from cart.`, "info");
  };

  // Image navigation
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

  // Animate products
  useEffect(() => {
    if (loading) return;
    gsap.fromTo(
      ".product-card:not(.gsap-animated)",
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.05,
        duration: 0.4,
        ease: "power2.out",
        onComplete: () => {
          document
            .querySelectorAll(".product-card")
            .forEach((el) => el.classList.add("gsap-animated"));
        },
      }
    );
  }, [loading, selectedCategory, selectedFilterColor, searchTerm]);

  return (
    <>
      <Header />
      <main className="flex flex-col items-center justify-center w-full min-h-screen px-2 py-20 bg-white">
        <div className="w-full max-w-[1300px] mx-auto">
          <h1 className="text-4xl font-bold uppercase mb-10 text-center tracking-tight">
            All Products
          </h1>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-10 bg-gray-50 p-4 rounded-lg border relative">
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

          {/* Products */}
          {loading ? (
            <p className="text-center text-gray-500">Loading products...</p>
          ) : filteredProducts.length === 0 ? (
            <p className="text-center text-gray-400">
              No matching products found.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 justify-center items-stretch mx-auto w-full">
              {filteredProducts.map((p) => {
                const hasColors =
                  p.hasColors &&
                  p.variants &&
                  Object.keys(p.variants).length > 0;
                const color =
                  selectedColor[p.id] ||
                  (hasColors ? Object.keys(p.variants)[0] : "default");
                const variant =
                  hasColors && selectedColor[p.id]
                    ? p.variants[selectedColor[p.id]]
                    : null;
                const images =
                  hasColors && selectedColor[p.id]
                    ? variant?.images || []
                    : p.images || [];
                const activeIndex = activeImageIndex[p.id] ?? 0;
                const displayImg = images.length > 0 ? images[activeIndex] : "";
                const gst = p?.gst?.total ?? 0;
                const finalPrice = p.price + (p.price * gst) / 100;

                // 🧾 Stock calculation
                let availableStock = 0;

                if (hasColors && selectedColor[p.id]) {
                  // ✅ A color is selected → check variant-level stock
                  if (variant?.sizes) {
                    if (selectedSize[p.id]) {
                      availableStock = variant.sizes[selectedSize[p.id]] ?? 0;
                    } else {
                      // sum of all sizes in that color
                      availableStock = Object.values(
                        variant.sizes as Record<string, number>
                      ).reduce((a, b) => a + (b || 0), 0);
                    }
                  } else {
                    availableStock = variant?.stock ?? 0;
                  }
                } else {
                  // ✅ No color selected → show base product stock
                  availableStock = p.stock ?? 0;
                }

                const item = getCartItem(p.id, color, selectedSize[p.id]);

                return (
                  <div
                    key={p.id + color}
                    className="product-card group relative bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 max-w-[380px] w-full mx-auto flex flex-col"
                    style={{ minHeight: "560px" }}
                  >
                    {/* Image */}
                    <Link
                      href={`/product/${p.id}`}
                      className="relative block shrink-0 group"
                      onMouseEnter={() => {
                        document.body.classList.add("cursor-view");
                        window.dispatchEvent(
                          new CustomEvent("pause-carousel", { detail: p.id })
                        );
                      }}
                      onMouseLeave={() => {
                        document.body.classList.remove("cursor-view");
                        window.dispatchEvent(
                          new CustomEvent("resume-carousel", { detail: p.id })
                        );
                      }}
                    >
                      <div className="relative h-80 w-full overflow-hidden">
                        <Image
                          id={`img-${p.id}`}
                          key={displayImg}
                          src={displayImg}
                          alt={p.name}
                          width={500}
                          height={500}
                          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                        />

                        {/* 🧭 Image Nav Arrows (Mark as no-cursor-zone so the cursor hides) */}
                        {images.length > 1 && (
                          <>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handlePrevImage(p.id, images.length);
                              }}
                              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition no-cursor-zone"
                            >
                              <ChevronLeftIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleNextImage(p.id, images.length);
                              }}
                              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition no-cursor-zone"
                            >
                              <ChevronRightIcon className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </Link>

                    <div className="p-5 flex flex-col flex-1 justify-between">
                      {/* --- Top Info Row --- */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        {/* Left: Title, Featured, Price */}
                        <div className="text-left flex-1">
                          <h3 className="font-semibold text-[17px] text-gray-900 leading-tight line-clamp-2">
                            {p.name}
                          </h3>
                          {p.featured && (
                            <span className="inline-block mt-1 text-[12px] text-yellow-700 font-medium bg-yellow-50 px-2 py-px rounded-full">
                              ⭐ Featured
                            </span>
                          )}
                          <p className="text-lg font-semibold text-gray-900 mt-1">
                            {formatCurrency(p.price)}{" "}
                            <span className="text-xs text-gray-400">
                              (Excl. GST)
                            </span>
                          </p>
                        </div>

                        {/* Right: GSM + Stock */}
                        <div className="text-right text-xs text-gray-500 flex flex-col justify-end">
                          {p.gsm && <p>GSM: {p.gsm}</p>}
                          <p
                            className={`font-medium ${
                              availableStock > 0
                                ? "text-green-600"
                                : "text-red-500"
                            }`}
                          >
                            {hasColors && !selectedColor[p.id]
                              ? "Select a color to view stock"
                              : availableStock > 0
                              ? `In Stock: ${availableStock}`
                              : "Out of Stock"}
                          </p>
                        </div>
                      </div>

                      {/* --- Description (full width) --- */}
                      {p.description && (
                        <p className="text-xs text-gray-500 mt-3 leading-snug text-center sm:text-left">
                          {p.description.slice(0, 100)}
                          {p.description.length > 100 && "..."}
                        </p>
                      )}

                      {/* --- Divider --- */}
                      <div className="w-full h-px bg-gray-100 my-3" />

                      {/* --- Middle Row: Color + Size side by side --- */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        {/* Colors */}
                        {p.hasColors && (
                          <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                            {Object.keys(p.variants || {}).map((clr) => (
                              <button
                                key={clr}
                                onClick={() =>
                                  setSelectedColor((prev) => ({
                                    ...prev,
                                    [p.id]: clr,
                                  }))
                                }
                                className={`w-6 h-6 rounded-full border-2 transition-all ${
                                  selectedColor[p.id] === clr
                                    ? "border-black scale-110 shadow-sm"
                                    : "border-gray-300 hover:border-gray-400"
                                }`}
                                style={{
                                  backgroundColor:
                                    p?.variants?.[clr]?.hex || clr,
                                }}
                                title={clr}
                              />
                            ))}
                          </div>
                        )}

                        {/* Sizes */}
                        {variant?.sizes && (
                          <div className="flex flex-wrap justify-center sm:justify-end gap-2">
                            {Object.keys(variant.sizes).map((sz) => (
                              <button
                                key={sz}
                                onClick={() =>
                                  setSelectedSize((prev) => ({
                                    ...prev,
                                    [p.id]: sz,
                                  }))
                                }
                                className={`px-3 py-1 text-xs rounded-full border transition-all ${
                                  selectedSize[p.id] === sz
                                    ? "bg-black text-white border-black shadow-sm"
                                    : "border-gray-300 text-gray-700 hover:bg-black hover:text-white"
                                }`}
                              >
                                {sz}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* --- Bottom Row: Cart Actions --- */}
                      <div className="mt-5 flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-4">
                        {p.hasColors && !selectedColor[p.id] ? (
                          <button
                            disabled
                            className="px-6 py-2 bg-gray-300 text-gray-600 rounded-full text-sm font-medium cursor-not-allowed"
                          >
                            Select a Color
                          </button>
                        ) : availableStock !== null && availableStock <= 0 ? (
                          <span className="text-red-500 font-semibold text-sm">
                            Out of Stock
                          </span>
                        ) : !item ? (
                          <button
                            onClick={() => handleAddToCart(p)}
                            className="px-6 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-900 transition-all"
                          >
                            Add to Cart
                          </button>
                        ) : (
                          <div className="flex items-center gap-4">
                            {/* QTY + REMOVE GROUP */}
                            <div className="flex items-center gap-3">
                              {/* - */}
                              <button
                                onClick={() =>
                                  decreaseQty(
                                    item.id,
                                    color,
                                    selectedSize[p.id]
                                  )
                                }
                                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-lg font-semibold hover:bg-gray-100"
                              >
                                −
                              </button>

                              {/* quantity */}
                              <span
                                id={`qty-${p.id}-${color}-${
                                  selectedSize[p.id]
                                }`}
                                className="w-8 text-center font-semibold text-sm"
                              >
                                {item.qty}
                              </span>

                              {/* + */}
                              <button
                                onClick={() => handleAddToCart(p)}
                                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-lg font-semibold hover:bg-gray-100"
                              >
                                +
                              </button>

                              {/* DELETE BUTTON — FIXED (NO ABSOLUTE) */}
                              <button
                                onClick={() =>
                                  handleRemoveFromCart(
                                    p.id,
                                    p.name,
                                    color,
                                    selectedSize[p.id]
                                  )
                                }
                                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-red-100 ml-3 text-gray-500 hover:text-red-600 transition-all"
                              >
                                <TrashIcon className="w-4 h-4 text-red-500" />
                              </button>
                            </div>

                            {/* ⭐ OPEN CART DRAWER BUTTON */}
                            <button
                              onClick={() => setIsCartOpen(true)}
                              className="px-5 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-900 transition-all whitespace-nowrap"
                            >
                              Go to Cart
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
