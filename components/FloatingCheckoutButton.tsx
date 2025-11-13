"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { formatCurrency } from "@/lib/formatCurrency";
import gsap from "gsap";

export default function FloatingCheckoutButton() {
  const { totalAmount, totalQty, isCartOpen } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const fabRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // Check screen width for mobile mode
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 380); // tweak breakpoint as needed
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // When to show the button
  useEffect(() => {
    const shouldShow =
      totalQty > 0 &&
      !pathname.startsWith("/checkout") &&
      !pathname.startsWith("/order-success") &&
      !pathname.startsWith("/order-failed") &&
      !pathname.startsWith("/admin");

    setVisible(shouldShow);
  }, [pathname, totalQty]);

  // GSAP animation
  useEffect(() => {
    if (!fabRef.current) return;
    gsap.to(fabRef.current, {
      y: visible ? 0 : 120,
      opacity: visible ? 1 : 0,
      scale: visible ? 1 : 0.8,
      duration: 0.45,
      ease: "power3.out",
    });
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      ref={fabRef}
      className={`
        fixed bottom-6 inset-x-0
        flex justify-center
        z-100
        ${isCartOpen ? "opacity-50 pointer-events-none" : "opacity-100"}
        transition-all duration-300
      `}
    >
      <button
        disabled={isCartOpen}
        onClick={() => !isCartOpen && router.push("/checkout")}
        className={`
          flex items-center gap-2
          rounded-full shadow-xl shadow-black/40
          active:scale-95 transition whitespace-nowrap
          ${
            isSmallScreen
              ? "px-4 py-3 bg-black text-white text-sm"
              : "px-6 py-3 md:px-7 md:py-4 bg-black text-white"
          }
        `}
      >
        {/* ICON (hide on very small screens if needed) */}
        {!isSmallScreen && (
          <ShoppingCartIcon className="w-5 h-5 md:w-6 md:h-6" />
        )}

        {/* TEXT (hide on small screens) */}
        {!isSmallScreen && (
          <span className="font-semibold text-base md:text-lg">
            Checkout • {formatCurrency(totalAmount)}
          </span>
        )}

        {/* MOBILE: show ONLY amount */}
        {isSmallScreen && (
          <span className="font-semibold">
            Checkout •{formatCurrency(totalAmount)}
          </span>
        )}

        {/* Qty badge — ALWAYS visible */}
        <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
          {totalQty}
        </span>
      </button>
    </div>
  );
}
