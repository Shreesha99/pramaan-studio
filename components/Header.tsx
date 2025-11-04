"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import {
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  XMarkIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
} from "@heroicons/react/24/outline";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/formatCurrency";

export default function Header() {
  const {
    cart,
    removeFromCart,
    increaseQty,
    decreaseQty,
    totalQty,
    totalAmount,
  } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.from("header", {
      y: -40,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
    });
  }, []);

  useEffect(() => {
    if (drawerRef.current)
      gsap.to(drawerRef.current, {
        x: cartOpen ? 0 : "100%",
        duration: 0.6,
        ease: cartOpen ? "power3.out" : "power3.in",
      });
  }, [cartOpen]);

  return (
    <>
      <header className="py-6 border-b border-gray-100 bg-white sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
          <div className="text-2xl font-bold tracking-tight">C.</div>

          <nav className="hidden md:flex items-center gap-10 text-sm font-medium text-gray-700">
            <a href="#">Shop</a>
            <a href="#">On Sale</a>
            <a href="#">New Arrivals</a>
          </nav>

          <div className="flex items-center gap-6">
            <button>
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-700" />
            </button>

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

      {/* Cart Drawer */}
      <div
        ref={drawerRef}
        className="fixed top-0 right-0 h-full w-[90%] sm:w-[400px] bg-white shadow-2xl z-[100] translate-x-full flex flex-col"
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
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 border-b border-gray-100 pb-4"
              >
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-16 h-16 rounded-md object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{item.name}</h3>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(item.price)}
                  </p>
                  <div className="flex items-center mt-2">
                    <button
                      className="p-1 border border-gray-300 rounded-l"
                      onClick={() => decreaseQty(item.id)}
                    >
                      <MinusIcon className="w-3 h-3 text-gray-700" />
                    </button>
                    <span className="px-3 border-t border-b border-gray-300 text-sm">
                      {item.qty}
                    </span>
                    <button
                      className="p-1 border border-gray-300 rounded-r"
                      onClick={() => increaseQty(item.id)}
                    >
                      <PlusIcon className="w-3 h-3 text-gray-700" />
                    </button>
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.id)}>
                  <TrashIcon className="w-4 h-4 text-gray-500 hover:text-red-500" />
                </button>
              </div>
            ))}
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

      {cartOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-[1px] z-[90]"
          onClick={() => setCartOpen(false)}
        />
      )}
    </>
  );
}
