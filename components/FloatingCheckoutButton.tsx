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
  const barRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const shouldShow =
      totalQty > 0 &&
      !pathname.startsWith("/checkout") &&
      !pathname.startsWith("/order-success");
    setVisible(shouldShow);
  }, [pathname, totalQty]);

  // GSAP animation
  useEffect(() => {
    if (!barRef.current) return;
    gsap.to(barRef.current, {
      y: visible ? 0 : 100,
      opacity: visible ? 1 : 0,
      duration: 0.5,
      ease: "power3.out",
    });
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      ref={barRef}
      className={`fixed bottom-0 left-0 w-full bg-black text-white z-100 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] ${
        isCartOpen ? "pointer-events-none opacity-50" : "opacity-100"
      }`}
    >
      <button
        disabled={isCartOpen}
        onClick={() => !isCartOpen && router.push("/checkout")}
        className="w-full flex items-center justify-center gap-3 py-4 md:py-5 font-semibold text-base md:text-lg hover:bg-neutral-900 active:scale-[0.98] transition-all duration-300 cursor-pointer"
      >
        <ShoppingCartIcon className="w-5 h-5 md:w-6 md:h-6" />
        <span>
          Checkout • {formatCurrency(totalAmount)}{" "}
          <span className="text-sm text-gray-300">
            ({totalQty} item{totalQty > 1 ? "s" : ""})
          </span>
        </span>
      </button>
    </div>
  );
}
