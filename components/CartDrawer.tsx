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

export interface CartItem {
  id: string;
  name: string;
  price: number;
  img: string;
  qty: number;
  color?: string;
  stock?: number;
  size?: string;
  // Optional gst info (backwards compatible if not present)
  gst?: {
    cgst?: number;
    sgst?: number;
    total?: number;
  };
}

export default function CartDrawer({ cartOpen, setCartOpen }: CartDrawerProps) {
  const {
    cart,
    totalAmount, // still available (based on price*qty)
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

  // --- Pricing calculations ---
  const subtotal = cart.reduce(
    (sum, item) => sum + (item.price || 0) * item.qty,
    0
  );

  // Compute CGST / SGST totals from items if they contain gst info.
  // If an item doesn't contain gst info, treat as 0% tax for that item.
  const cgstTotal = cart.reduce((sum, item) => {
    const cgst = item.gst?.cgst ?? 0;
    return sum + ((item.price || 0) * item.qty * cgst) / 100;
  }, 0);

  const sgstTotal = cart.reduce((sum, item) => {
    const sgst = item.gst?.sgst ?? 0;
    return sum + ((item.price || 0) * item.qty * sgst) / 100;
  }, 0);

  const totalTax = cgstTotal + sgstTotal;
  const grandTotal = subtotal + totalTax;

  return (
    <>
      <div
        ref={drawerRef}
        className="fixed top-0 right-0 h-full w-[90%] sm:w-[400px] bg-white shadow-2xl z-150 flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Your Cart</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {totalQty} item{totalQty !== 1 ? "s" : ""}
            </span>
            <button onClick={() => setCartOpen(false)} aria-label="Close cart">
              <XMarkIcon className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>

        {/* 🛍 Cart Content */}
        {isCartEmpty ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Your cart is empty.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cart.map((item: CartItem) => {
              const atMax = item.stock !== undefined && item.qty >= item.stock;

              // ✅ Use base price from Firestore
              const basePrice = Number(item.price || 0);

              // ✅ GST info
              const gstRate = item.gst?.total ?? 0;
              const cgst = item.gst?.cgst ?? 0;
              const sgst = item.gst?.sgst ?? 0;

              // ✅ Final price same logic as admin
              const finalPrice = basePrice + (basePrice * gstRate) / 100;
              const lineTotal = finalPrice * item.qty;

              return (
                <div
                  key={`${item.id}-${item.color || "default"}-${
                    item.size || "nosize"
                  }`}
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
                      {item.size && (
                        <span className="ml-2 text-xs text-gray-400">
                          Size: {item.size}
                        </span>
                      )}
                    </h3>

                    {/* ✅ Price breakdown same as admin */}
                    <div className="text-xs text-gray-500 mt-1">
                      <p>
                        Base: ₹{basePrice.toFixed(2)} × {item.qty}
                      </p>
                      {gstRate > 0 && (
                        <p className="text-gray-400">
                          GST: {cgst}% + {sgst}% ({gstRate}%)
                        </p>
                      )}
                      <p className="font-medium text-gray-800">
                        Total (with GST): ₹{lineTotal.toFixed(2)}
                      </p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center mt-2">
                      <button
                        className="p-1 border border-gray-300 rounded-l disabled:opacity-50"
                        onClick={() =>
                          decreaseQty(item.id, item.color, item.size)
                        }
                        disabled={item.qty <= 1}
                        aria-label="Decrease quantity"
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
                          !atMax && increaseQty(item.id, item.color, item.size)
                        }
                        disabled={atMax}
                        aria-label="Increase quantity"
                      >
                        <PlusIcon className="w-3 h-3 text-gray-700" />
                      </button>
                      {atMax && (
                        <p className="text-[10px] text-red-500 ml-3">
                          Max stock reached
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      removeFromCart(item.id, item.color, item.size)
                    }
                    title="Remove from cart"
                    className="self-start"
                  >
                    <TrashIcon className="w-4 h-4 text-gray-500 hover:text-red-500" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* ✅ Checkout / Summary */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>

          {/* Tax breakdown only shown if any tax exists */}
          <div className="space-y-1 mb-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>CGST</span>
              <span>{formatCurrency(cgstTotal)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>SGST</span>
              <span>{formatCurrency(sgstTotal)}</span>
            </div>
            <div className="flex justify-between text-xs font-medium">
              <span>Total Tax</span>
              <span>{formatCurrency(totalTax)}</span>
            </div>
          </div>

          <div className="flex justify-between text-sm font-semibold mb-4">
            <span>Grand Total</span>
            <span>{formatCurrency(grandTotal)}</span>
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
