"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import {
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  XMarkIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/formatCurrency";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const {
    cart,
    removeFromCart,
    increaseQty,
    decreaseQty,
    totalQty,
    totalAmount,
  } = useCart();

  const { user, logout, openAuthModal } = useAuth();

  const [cartOpen, setCartOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const drawerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // Animate header
  useEffect(() => {
    gsap.from("header", {
      y: -40,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
    });
  }, []);

  // Animate cart drawer
  useEffect(() => {
    const drawer = drawerRef.current;
    if (!drawer) return;

    const drawerWidth = drawer.offsetWidth;
    if (!tlRef.current) {
      gsap.set(drawer, { x: drawerWidth, willChange: "transform" });
      const tl = gsap.timeline({ paused: true });
      tl.to(drawer, {
        x: 0,
        duration: 0.55,
        ease: "power4.out",
      });
      tlRef.current = tl;
    }

    if (cartOpen) tlRef.current.play();
    else tlRef.current.reverse();
  }, [cartOpen]);

  // Animate dropdown
  useEffect(() => {
    if (!dropdownRef.current) return;
    if (dropdownOpen) {
      gsap.fromTo(
        dropdownRef.current,
        { opacity: 0, y: -5 },
        { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }
      );
    } else {
      gsap.to(dropdownRef.current, {
        opacity: 0,
        y: -5,
        duration: 0.2,
        ease: "power2.in",
      });
    }
  }, [dropdownOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !(dropdownRef.current as HTMLElement).contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [dropdownOpen]);

  return (
    <>
      <header className="py-5 border-b border-gray-100 bg-white sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
          {/* ✅ Brand Logo */}
          <div className="flex items-center gap-2">
            <Image
              src="/assets/img/nav-logo.png"
              alt="PraMaan Logo"
              width={36}
              height={36}
              priority
              className="w-9 h-9 object-contain"
            />
            <span className="hidden md:inline text-xl font-bold tracking-tight">
              PraMaan
            </span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-10 text-sm font-medium text-gray-700">
            <a href="#">Shop</a>
            <a href="#">On Sale</a>
            <a href="#">New Arrivals</a>
          </nav>

          {/* Icons + Auth + Cart */}
          <div className="flex items-center gap-6 relative">
            <button>
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-700" />
            </button>

            {/* Auth Section */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1"
                >
                  {user.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt="User avatar"
                      width={28}
                      height={28}
                      className="rounded-full border border-gray-300"
                    />
                  ) : (
                    <UserCircleIcon className="w-7 h-7 text-gray-700" />
                  )}
                </button>

                {dropdownOpen && (
                  <div
                    ref={dropdownRef}
                    className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-[150]"
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-800">
                        {user.displayName || "User"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email || "Google User"}
                      </p>
                    </div>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="text-sm font-semibold text-gray-700 border px-3 py-1 rounded-full hover:bg-gray-100 transition"
              >
                Login
              </button>
            )}

            {/* Cart Button */}
            <button className="relative" onClick={() => setCartOpen(true)}>
              <ShoppingBagIcon className="w-5 h-5 text-gray-700" />
              {totalQty > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {totalQty}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 🛒 Cart Drawer */}
      <div
        ref={drawerRef}
        className="cart-drawer fixed top-0 right-0 h-full w-[90%] sm:w-[400px] bg-white shadow-2xl z-[100] flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Your Cart</h2>
          <button onClick={() => setCartOpen(false)}>
            <XMarkIcon className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Your cart is empty.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cart.map((item) => {
              const atMax = item.stock !== undefined && item.qty >= item.stock;

              return (
                <div
                  key={`${item.id}-${item.color || "default"}`}
                  className="flex gap-4 border-b border-gray-100 pb-4"
                >
                  {item.img ? (
                    <img
                      src={item.img}
                      alt={item.name}
                      className="w-16 h-16 rounded-md object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs">
                      No Image
                    </div>
                  )}

                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">
                      {item.name}
                      {item.color && (
                        <span className="ml-1 text-xs text-gray-400">
                          ({item.color})
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(item.price)}
                    </p>

                    <div className="flex items-center mt-2">
                      <button
                        className="p-1 border border-gray-300 rounded-l disabled:opacity-50"
                        onClick={() => decreaseQty(item.id, item.color)}
                        disabled={item.qty <= 1}
                      >
                        <MinusIcon className="w-3 h-3 text-gray-700" />
                      </button>
                      <span className="px-3 border-t border-b border-gray-300 text-sm">
                        {item.qty}
                      </span>
                      <button
                        className={`p-1 border border-gray-300 rounded-r ${
                          atMax
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-gray-100"
                        }`}
                        onClick={() =>
                          !atMax && increaseQty(item.id, item.color)
                        }
                        disabled={atMax}
                      >
                        <PlusIcon className="w-3 h-3 text-gray-700" />
                      </button>
                    </div>

                    {atMax && (
                      <p className="text-[10px] text-red-500 mt-1">
                        Max stock reached
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id, item.color)}
                    title="Remove from cart"
                  >
                    <TrashIcon className="w-4 h-4 text-gray-500 hover:text-red-500" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-between text-sm font-medium mb-4">
            <span>Total</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>
          <button className="w-full bg-black text-white py-3 rounded-full font-semibold hover:bg-gray-900 transition">
            Checkout
          </button>
        </div>
      </div>

      {/* Overlay */}
      {cartOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-[1px] z-[90]"
          onClick={() => setCartOpen(false)}
        />
      )}
    </>
  );
}
