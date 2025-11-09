"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function SearchDrawer({
  searchOpen,
  setSearchOpen,
  searchQuery,
  setSearchQuery,
  searchResults,
}: any) {
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTlRef = useRef<gsap.core.Timeline | null>(null);
  const router = useRouter();

  // ✅ GSAP animation for drawer entrance/exit
  useEffect(() => {
    if (!searchRef.current) return;

    if (!searchTlRef.current) {
      gsap.set(searchRef.current, { y: -80, opacity: 0 });
      const tl = gsap.timeline({ paused: true });
      tl.to(searchRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.4,
        ease: "power3.out",
      });
      searchTlRef.current = tl;
    }

    if (searchOpen) searchTlRef.current.play();
    else searchTlRef.current.reverse();
  }, [searchOpen]);

  if (!searchOpen) return null;

  // ✅ Navigate to products page and close drawer
  const handleResultClick = (product: any) => {
    setSearchOpen(false);
    setSearchQuery("");
    router.push("/products");
  };

  return (
    <div
      ref={searchRef}
      className="fixed top-[15%] left-1/2 -translate-x-1/2 w-[90%] sm:w-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-120 p-5"
    >
      {/* 🔍 Input Header */}
      <div className="flex items-center gap-3">
        <MagnifyingGlassIcon className="w-6 h-6 text-gray-600" />
        <input
          type="text"
          placeholder="Search for products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 text-gray-800 placeholder-gray-400 text-base outline-none"
          autoFocus
        />
        <button onClick={() => setSearchOpen(false)}>
          <XMarkIcon className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* 🧩 Search Results */}
      {searchQuery && (
        <div className="mt-4 max-h-[250px] overflow-y-auto space-y-2">
          {searchResults.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-2">
              No matching products.
            </p>
          ) : (
            searchResults.map((p: any) => {
              const variantColors = p.hasColors
                ? Object.keys(p.variants || {})
                : [];
              const img =
                p.hasColors && variantColors.length
                  ? p.variants[variantColors[0]].images?.[0]
                  : p.images?.[0];

              return (
                <div
                  key={p.id}
                  onClick={() => handleResultClick(p)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                >
                  {img ? (
                    <img
                      src={img}
                      alt={p.name}
                      className="w-12 h-12 rounded-md object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-md" />
                  )}
                  <div>
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.category}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
