"use client";

import CartDrawer from "@/components/CartDrawer";
import FloatingCheckoutButton from "@/components/FloatingCheckoutButton";
import { useCart } from "@/context/CartContext";

export default function ClientCartWrapper() {
  const { isCartOpen, setIsCartOpen } = useCart();

  return (
    <>
      {/* Pass props to CartDrawer */}
      <CartDrawer cartOpen={isCartOpen} setCartOpen={setIsCartOpen} />

      {/* Floating Checkout CTA */}
      <FloatingCheckoutButton />
    </>
  );
}
