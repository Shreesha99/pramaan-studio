"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { gsap } from "gsap";
import Fuse from "fuse.js";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import CartDrawer from "@/components/CartDrawer";
import Link from "next/link";
import HeaderNav from "./HeaderNav";
import HeaderIcons from "./HeaderIcons";
import SearchDrawer from "./SearchDrawer";

export default function Header() {
  const { totalQty } = useCart();
  const { user, logout, openAuthModal } = useAuth();
  const pathname = usePathname();

  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);

  const headerRef = useRef(null);
  const isCheckoutPage =
    pathname.startsWith("/checkout") || pathname.startsWith("/order-success");

  // 🔹 Load products once
  useEffect(() => {
    const fetchProducts = async () => {
      const snapshot = await getDocs(collection(db, "products"));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAllProducts(data);
    };
    fetchProducts();
  }, []);

  // 🔹 Fuzzy search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const fuse = new Fuse(allProducts, {
      keys: ["name", "category"],
      threshold: 0.4,
    });
    const results = fuse.search(searchQuery.trim()).map((r) => r.item);
    setSearchResults(results);
  }, [searchQuery, allProducts]);

  // 🔹 Animate header entrance
  useEffect(() => {
    if (!headerRef.current) return;
    const played = sessionStorage.getItem("headerAnimPlayed");
    if (played) return;

    gsap.from(headerRef.current, {
      y: -40,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
    });

    sessionStorage.setItem("headerAnimPlayed", "true");
  }, []);

  return (
    <>
      <header
        ref={headerRef}
        className="py-5 border-b border-gray-100 bg-white sticky top-0 backdrop-blur-md z-100"
      >
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
          {/* ✅ Brand */}
          <Link href="/">
            <div className="flex items-center gap-2">
              <Image
                src="/assets/img/nav-logo.png"
                alt="PraMaan Logo"
                width={36}
                height={36}
                priority
                className="w-9 h-9 object-contain"
              />
              <span className="hidden md:inline text-xl tracking-tight">
                PraMaan
              </span>
            </div>
          </Link>

          {/* 🧭 Nav (Desktop + Mobile) */}
          <HeaderNav
            mobileNavOpen={mobileNavOpen}
            setMobileNavOpen={setMobileNavOpen}
          />

          {/* 🔍 Icons + Cart + Auth */}
          <HeaderIcons
            user={user}
            logout={logout}
            openAuthModal={openAuthModal}
            totalQty={totalQty}
            isCheckoutPage={isCheckoutPage}
            setCartOpen={setCartOpen}
            setSearchOpen={setSearchOpen}
            setDropdownOpen={setDropdownOpen}
            dropdownOpen={dropdownOpen}
            mobileNavOpen={mobileNavOpen}
            setMobileNavOpen={setMobileNavOpen}
          />
        </div>
      </header>

      {/* 🔎 Search Drawer */}
      <SearchDrawer
        searchOpen={searchOpen}
        setSearchOpen={setSearchOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchResults={searchResults}
      />

      {/* 🛒 Cart Drawer */}
      <CartDrawer cartOpen={cartOpen} setCartOpen={setCartOpen} />

      {/* 🖤 Overlay */}
      {(cartOpen || searchOpen || mobileNavOpen) && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-[1px] z-80"
          onClick={() => {
            setCartOpen(false);
            setSearchOpen(false);
            setMobileNavOpen(false);
          }}
        />
      )}
    </>
  );
}
