"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Link from "next/link";
import {
  XMarkIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
} from "@heroicons/react/24/outline";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/formatCurrency";

interface CartDrawerProps {
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
}

export default function CartDrawer({ cartOpen, setCartOpen }: CartDrawerProps) {
  const {
    cart,
    totalAmount,
    removeFromCart,
    increaseQty,
    decreaseQty,
    totalQty,
  } = useCart();

  const drawerRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // 🌀 Animate Drawer
  useEffect(() => {
    const drawer = drawerRef.current;
    if (!drawer) return;

    const width = drawer.offsetWidth;
    if (!tlRef.current) {
      gsap.set(drawer, { x: width });
      const tl = gsap.timeline({ paused: true });
      tl.to(drawer, { x: 0, duration: 0.55, ease: "power4.out" });
      tlRef.current = tl;
    }

    if (cartOpen) tlRef.current.play();
    else tlRef.current.reverse();
  }, [cartOpen]);

  const isCartEmpty = cart.length === 0;

  return (
    <>
      <div
        ref={drawerRef}
        className="fixed top-0 right-0 h-full w-[90%] sm:w-[400px] bg-white shadow-2xl z-150 flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Your Cart</h2>
          <button onClick={() => setCartOpen(false)}>
            <XMarkIcon className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* 🛍 Cart Content */}
        {isCartEmpty ? (
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
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-16 h-16 rounded-md object-cover"
                  />

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

        {/* ✅ Checkout Button */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-between text-sm font-medium mb-4">
            <span>Total</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>

          <Link href={isCartEmpty ? "#" : "/checkout"}>
            <button
              onClick={() => {
                if (!isCartEmpty) setCartOpen(false);
              }}
              disabled={isCartEmpty}
              className={`w-full py-3 rounded-full font-semibold transition ${
                isCartEmpty
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-black text-white hover:bg-gray-900"
              }`}
            >
              Checkout
            </button>
          </Link>
        </div>
      </div>

      {/* Overlay */}
      {cartOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-[1px] z-140"
          onClick={() => setCartOpen(false)}
        />
      )}
    </>
  );
}
