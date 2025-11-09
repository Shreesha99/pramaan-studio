"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  TruckIcon,
  CreditCardIcon,
  ArrowPathIcon,
  TrashIcon,
  MinusIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/formatCurrency";
import GsapButton from "@/components/GsapButton";
import ErrorText from "@/components/ErrorText";

export default function CheckoutPage() {
  const {
    cart,
    removeFromCart,
    increaseQty,
    decreaseQty,
    totalAmount,
    clearCart,
  } = useCart();
  const { user } = useAuth();

  const [shipping, setShipping] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPaying, setIsPaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const leftRef = useRef<HTMLDivElement | null>(null);
  const rightRef = useRef<HTMLDivElement | null>(null);
  const payBtnRef = useRef<HTMLButtonElement | null>(null);

  // Animate entrance
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.from(leftRef.current, {
        x: -40,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
      });
      tl.from(
        rightRef.current,
        {
          x: 40,
          opacity: 0,
          duration: 0.6,
          ease: "power3.out",
        },
        "-=0.45"
      );
      tl.from(payBtnRef.current, {
        scale: 0.9,
        opacity: 0,
        duration: 0.4,
      });
    });
    return () => ctx.revert();
  }, []);

  // Validation
  function validate() {
    const e: Record<string, string> = {};
    if (!shipping.name.trim()) e.name = "Name is required";
    if (!shipping.address.trim()) e.address = "Address is required";
    if (!shipping.city.trim()) e.city = "City is required";
    if (!/^[0-9]{6}$/.test(shipping.pincode))
      e.pincode = "Enter valid 6-digit pincode";
    if (!/^[6-9][0-9]{9}$/.test(shipping.phone))
      e.phone = "Enter valid 10-digit phone";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // 🔹 Track payment failures
  const [failedAttempts, setFailedAttempts] = useState(0);

  async function handlePay() {
    if (cart.length === 0) return setErrors({ general: "Your cart is empty." });
    if (!validate()) return;

    // ✅ Immediately show loading animation
    setIsPaying(true);

    try {
      const amountInPaise = Math.round(total * 100);

      // 🔹 Step 1: Create Razorpay order
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountInPaise }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed to create order");

      const { order } = data;

      // 🔹 Step 2: Load Razorpay script if not already loaded
      if (!document.getElementById("razorpay-script")) {
        await new Promise((resolve) => {
          const s = document.createElement("script");
          s.id = "razorpay-script";
          s.src = "https://checkout.razorpay.com/v1/checkout.js";
          s.onload = resolve;
          document.body.appendChild(s);
        });
      }

      // 🔹 Step 3: Open Razorpay modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "PraMaan Studio",
        description: "Order Payment",
        order_id: order.id,

        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const verifyData = await verifyRes.json();

            if (verifyData.ok) {
              const orderData = {
                orderId: verifyData.orderId,
                paymentId: response.razorpay_payment_id,
                amount: total,
                currency: "INR",
                items: cart,
                shipping,
                status: "Paid",
                createdAt: new Date().toISOString(),
                userId: user?.uid || shipping.phone || "guest",
              };

              await fetch("/api/orders/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData),
              });

              await fetch("/api/products/update-stock", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items: cart }),
              });

              clearCart();

              gsap.to(document.body, {
                opacity: 0,
                duration: 0.4,
                onComplete: () => {
                  window.location.href = `/order-success?orderId=${verifyData.orderId}`;
                },
              });
            } else {
              window.location.href = `/order-failed?reason=signature`;
            }
          } catch (err) {
            console.error("Error verifying payment:", err);
            window.location.href = `/order-failed?reason=verify-error`;
          }
        },

        prefill: {
          name: shipping.name,
          contact: shipping.phone,
        },

        theme: { color: "#000000" },

        // 🔹 When user closes Razorpay popup
        modal: {
          ondismiss: () => {
            setIsPaying(false);

            setFailedAttempts((prev) => {
              const next = prev + 1;

              if (next >= 3) {
                // Too many failed attempts
                gsap.to(document.body, {
                  opacity: 0.5,
                  duration: 0.4,
                  onComplete: () => {
                    window.location.href = `/order-failed?reason=too-many-failures`;
                  },
                });
              } else {
                // Allow retry
                setErrorMessage(
                  `Payment was not completed. Attempt ${next}/3.`
                );
              }

              return next;
            });
          },
        },
      };

      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error(err);
      setErrors({ general: err.message || "Payment failed to start." });
      setIsPaying(false);
    }
  }

  const subtotal = totalAmount;
  const shippingCharge = subtotal > 2000 || subtotal === 0 ? 0 : 49;
  const discount = subtotal > 5000 ? Math.round(subtotal * 0.05) : 0;
  const total = subtotal + shippingCharge - discount;

  return (
    <>
      <Header />

      <main className="min-h-screen bg-linear-to-b from-white to-gray-50 p-6 md:p-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-6">Checkout</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* LEFT: shipping form */}
            <div
              ref={leftRef}
              className="md:col-span-2 bg-white rounded-2xl p-6 shadow-md"
            >
              <form onSubmit={(e) => e.preventDefault()}>
                <h2 className="font-semibold text-lg mb-4">Shipping Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {renderInput(
                    "Full name",
                    "name",
                    shipping,
                    setShipping,
                    errors
                  )}
                  {renderInput(
                    "Phone",
                    "phone",
                    shipping,
                    setShipping,
                    errors,
                    "9876543210"
                  )}
                  {renderInput(
                    "Address",
                    "address",
                    shipping,
                    setShipping,
                    errors,
                    "House, Street, Landmark",
                    true
                  )}
                  {renderInput("City", "city", shipping, setShipping, errors)}
                  {renderInput(
                    "State",
                    "state",
                    shipping,
                    setShipping,
                    errors,
                    "Karnataka"
                  )}
                  {renderInput(
                    "Pincode",
                    "pincode",
                    shipping,
                    setShipping,
                    errors
                  )}

                  <div className="md:col-span-2 mt-3 flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <TruckIcon className="w-5 h-5" />
                      <span>Standard delivery — 8–14 business days</span>
                    </div>
                    <div>
                      Est. delivery: <strong>8–14 days</strong>
                    </div>
                  </div>

                  {(errorMessage || errors.general) && (
                    <div className="md:col-span-2">
                      <ErrorText message={errorMessage || errors.general} />
                      <FailureProgressBar failedAttempts={failedAttempts} />
                    </div>
                  )}

                  <div className="md:col-span-2 mt-6">
                    <GsapButton
                      onClick={() => handlePay()}
                      loading={isPaying}
                      disabled={cart.length === 0}
                      text={`Pay ${formatCurrency(total)}`}
                      loadingText="Processing..."
                      className="w-full py-3 rounded-xl bg-black text-white font-semibold shadow-lg hover:bg-gray-800"
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* RIGHT: order summary */}
            <aside
              ref={rightRef}
              className="bg-white rounded-2xl p-6 shadow-md h-fit"
            >
              <h3 className="font-semibold text-lg mb-4">Order Summary</h3>

              {cart.length === 0 ? (
                <div className="text-sm text-gray-500">Your cart is empty.</div>
              ) : (
                <div className="space-y-4">
                  {cart.map((it) => (
                    <div
                      key={`${it.id}-${it.color || "default"}`}
                      className="flex items-center gap-3 border-b border-gray-100 pb-3"
                    >
                      <img
                        src={it.img}
                        alt={it.name}
                        className="w-16 h-16 rounded-md object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium text-sm">{it.name}</p>
                          <span className="text-sm font-medium">
                            {formatCurrency(it.price * it.qty)}
                          </span>
                        </div>

                        <div className="mt-2 flex items-center gap-2">
                          <button
                            onClick={() => decreaseQty(it.id, it.color)}
                            disabled={it.qty <= 1}
                            className="p-1 border rounded-md disabled:opacity-50"
                          >
                            <MinusIcon className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-sm">{it.qty}</span>
                          <button
                            onClick={() => increaseQty(it.id, it.color)}
                            className="p-1 border rounded-md"
                          >
                            <PlusIcon className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => removeFromCart(it.id, it.color)}
                            className="ml-2 text-red-500 hover:text-red-600 text-xs flex items-center gap-1"
                          >
                            <TrashIcon className="w-4 h-4" /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 border-t pt-4 space-y-1">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span>{formatCurrency(shippingCharge)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-700">
                    <span>Discount</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg pt-2">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

function FailureProgressBar({ failedAttempts }: { failedAttempts: number }) {
  const barRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!barRef.current) return;
    const progress = Math.min((failedAttempts / 3) * 100, 100);
    gsap.to(barRef.current, {
      width: `${progress}%`,
      duration: 0.6,
      ease: "power2.out",
    });
  }, [failedAttempts]);

  return (
    <div className="mt-2 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        ref={barRef}
        className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full"
        style={{ width: "0%" }}
      />
    </div>
  );
}

// 🔹 Input helper
function renderInput(
  label: string,
  field: keyof typeof initialShipping,
  shipping: typeof initialShipping,
  setShipping: React.Dispatch<React.SetStateAction<typeof initialShipping>>,
  errors: Record<string, string>,
  placeholder = "",
  full = false
) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="block text-sm font-medium">{label}</label>
      <input
        value={shipping[field]}
        onChange={(e) =>
          setShipping((s) => ({ ...s, [field]: e.target.value }))
        }
        className={`mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black ${
          errors[field] ? "border-red-400" : "border-gray-200"
        }`}
        placeholder={placeholder}
      />
      {errors[field] && (
        <p className="text-xs text-red-500 mt-1">{errors[field]}</p>
      )}
    </div>
  );
}

const initialShipping = {
  name: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  phone: "",
};
