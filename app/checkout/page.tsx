"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/formatCurrency";
import GsapButton from "@/components/GsapButton";
import ErrorText from "@/components/ErrorText";

async function getDistanceKm(pincode: string): Promise<number | null> {
  try {
    const res = await fetch("/api/distance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pincode }),
    });

    const json = await res.json();
    if (!json.ok) return null;

    const distanceText = json.data?.rows?.[0]?.elements?.[0]?.distance?.text;
    if (!distanceText) return null;
    const km = parseFloat(distanceText.replace(" km", ""));
    return isNaN(km) ? null : km;
  } catch (err) {
    console.error("Proxy distance fetch failed:", err);
    return null;
  }
}

export default function CheckoutPage() {
  const {
    cart,
    removeFromCart,
    increaseQty,
    decreaseQty,
    subtotal,
    taxTotal,
    grandTotal,
    clearCart,
  } = useCart();
  const { user } = useAuth();

  const [billing, setBilling] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });

  const [shipping, setShipping] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });

  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPaying, setIsPaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);

  // 🚚 Dynamic shipping
  const [shippingCharge, setShippingCharge] = useState(0);
  const [shippingNotice, setShippingNotice] = useState<string | null>(null);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [shippingStatus, setShippingStatus] = useState<
    "idle" | "success" | "warning" | "error"
  >("idle");

  const leftRef = useRef<HTMLDivElement | null>(null);
  const rightRef = useRef<HTMLDivElement | null>(null);
  const payBtnRef = useRef<HTMLButtonElement | null>(null);

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

  // 🔹 Copy billing → shipping if “Same as Billing”
  useEffect(() => {
    if (sameAsBilling) setShipping(billing);
  }, [billing, sameAsBilling]);

  // ✅ Auto-calc shipping cost based on distance
  useEffect(() => {
    const activePincode = sameAsBilling
      ? billing.pincode.trim()
      : shipping.pincode.trim();

    if (!/^\d{6}$/.test(activePincode)) {
      setShippingCharge(0);
      setShippingNotice(null);
      setShippingStatus("idle");
      return;
    }

    const timeout = setTimeout(async () => {
      setIsCalculatingShipping(true);
      setShippingStatus("idle");
      setShippingNotice("Calculating delivery distance...");

      const distance = await getDistanceKm(activePincode);
      setIsCalculatingShipping(false);

      if (distance === null) {
        setShippingCharge(0);
        setShippingStatus("error");
        setShippingNotice(
          "❌ Could not determine distance — charges may vary."
        );
        return;
      }

      console.log("📏 Distance (km):", distance);

      if (distance <= 5) {
        setShippingCharge(0);
        setShippingNotice("✅ Free delivery within 5 km!");
        setShippingStatus("success");
      } else if (distance <= 10) {
        setShippingCharge(100);
        setShippingNotice(
          "✅ ₹100 delivery charge (calculated based on distance)"
        );
        setShippingStatus("success");
      } else if (distance <= 20) {
        setShippingCharge(150);
        setShippingNotice(
          "✅ ₹150 delivery charge (calculated based on distance)"
        );
        setShippingStatus("success");
      } else if (distance <= 30) {
        setShippingCharge(180);
        setShippingNotice(
          "✅ ₹180 delivery charge (calculated based on distance)"
        );
        setShippingStatus("success");
      } else if (distance <= 40) {
        setShippingCharge(250);
        setShippingNotice(
          "✅ ₹250 delivery charge (calculated based on distance)"
        );
        setShippingStatus("success");
      } else {
        setShippingCharge(0);
        setShippingStatus("warning");
        setShippingNotice(
          "⚠️ Outside Bangalore — extra delivery charges will be confirmed via WhatsApp 📞"
        );
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [sameAsBilling, billing.pincode, shipping.pincode]);

  // Validation
  function validate() {
    const e: Record<string, string> = {};
    const fields = sameAsBilling ? billing : shipping;
    if (!fields.name.trim()) e.name = "Name is required";
    if (!fields.address.trim()) e.address = "Address is required";
    if (!fields.city.trim()) e.city = "City is required";
    if (!/^[0-9]{6}$/.test(fields.pincode))
      e.pincode = "Enter valid 6-digit pincode";
    if (!/^[6-9][0-9]{9}$/.test(fields.phone))
      e.phone = "Enter valid 10-digit phone";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // 🧾 Razorpay Integration
  async function handlePay() {
    if (cart.length === 0) return setErrors({ general: "Your cart is empty." });
    if (!validate()) return;

    setIsPaying(true);
    try {
      const amountInPaise = Math.round(total * 100);
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountInPaise }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed to create order");

      const { order } = data;

      if (!document.getElementById("razorpay-script")) {
        await new Promise((resolve) => {
          const s = document.createElement("script");
          s.id = "razorpay-script";
          s.src = "https://checkout.razorpay.com/v1/checkout.js";
          s.onload = resolve;
          document.body.appendChild(s);
        });
      }

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
                billing,
                shipping: sameAsBilling ? billing : shipping,
                status: "Paid",
                createdAt: new Date().toISOString(),
                userId: user?.uid || billing.phone || "guest",
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

  const discount = subtotal > 5000 ? Math.round(subtotal * 0.05) : 0;
  const total = grandTotal + shippingCharge - discount;

  return (
    <>
      <Header />

      <main className="min-h-screen bg-linear-to-b from-white to-gray-50 p-6 md:p-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-6">Checkout</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* LEFT: billing + shipping form */}
            <div
              ref={leftRef}
              className="md:col-span-2 bg-white rounded-2xl p-6 shadow-md"
            >
              <form onSubmit={(e) => e.preventDefault()}>
                <h2 className="font-semibold text-lg mb-4">
                  🧾 Billing Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  {renderInput(
                    "Full Name",
                    "name",
                    billing,
                    setBilling,
                    errors
                  )}
                  {renderInput(
                    "Phone",
                    "phone",
                    billing,
                    setBilling,
                    errors,
                    "9876543210"
                  )}
                  {renderInput(
                    "Address",
                    "address",
                    billing,
                    setBilling,
                    errors,
                    "House, Street, Landmark",
                    true
                  )}
                  {renderInput("City", "city", billing, setBilling, errors)}
                  {renderInput("State", "state", billing, setBilling, errors)}
                  {renderInput(
                    "Pincode",
                    "pincode",
                    billing,
                    setBilling,
                    errors
                  )}
                </div>

                <h2 className="font-semibold text-lg mb-2">
                  🚚 Shipping Details
                </h2>
                <label className="flex items-center gap-2 mb-3 text-sm">
                  <input
                    type="checkbox"
                    checked={sameAsBilling}
                    onChange={(e) => setSameAsBilling(e.target.checked)}
                  />
                  Same as Billing Details
                </label>

                {!sameAsBilling && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    {renderInput(
                      "Full Name",
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
                      errors
                    )}
                    {renderInput(
                      "Pincode",
                      "pincode",
                      shipping,
                      setShipping,
                      errors
                    )}
                  </div>
                )}

                {(errorMessage || errors.general) && (
                  <div className="md:col-span-2">
                    <ErrorText message={errorMessage || errors.general} />
                    <FailureProgressBar failedAttempts={failedAttempts} />
                  </div>
                )}

                <div className="mt-6">
                  <GsapButton
                    onClick={() => handlePay()}
                    loading={isPaying}
                    disabled={cart.length === 0}
                    text={`Pay ${formatCurrency(total)}`}
                    loadingText="Processing..."
                    className="w-full py-3 rounded-xl bg-black text-white font-semibold shadow-lg hover:bg-gray-800"
                  />
                </div>
              </form>
            </div>

            {/* RIGHT: Order Summary */}
            <aside
              ref={rightRef}
              className="bg-white rounded-2xl p-6 shadow-md h-fit"
            >
              <h3 className="font-semibold text-lg mb-4">Order Summary</h3>

              {cart.length === 0 ? (
                <div className="text-sm text-gray-500">Your cart is empty.</div>
              ) : (
                <div className="space-y-4">
                  {cart.map((it) => {
                    const gstRate = it.gst?.total ?? 0; // e.g. 12 for 12%
                    const gstAmountPerItem = (it.price * gstRate) / 100;
                    const finalPrice = it.price + gstAmountPerItem;
                    const lineTotal = finalPrice * it.qty;

                    return (
                      <div
                        key={`${it.id}-${it.color || "default"}-${
                          it.size || "default"
                        }`}
                        className="flex items-center gap-3 border-b border-gray-100 pb-3"
                      >
                        <img
                          src={it.img}
                          alt={it.name}
                          className="w-16 h-16 rounded-md object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-sm">
                                {it.name}
                                {it.color && (
                                  <span className="ml-1 text-xs text-gray-400">
                                    ({it.color})
                                  </span>
                                )}
                                {it.size && (
                                  <span className="ml-2 text-xs text-gray-400">
                                    Size: {it.size}
                                  </span>
                                )}
                              </p>

                              {/* ✅ Base price (pre-GST from Firebase) */}
                              <p className="text-xs text-gray-500 mt-1">
                                Base: {formatCurrency(it.price)} × {it.qty}
                              </p>

                              {/* Small tax info line */}
                              {gstRate > 0 && (
                                <p className="text-[11px] text-gray-400 mt-0.5">
                                  GST: {gstRate}% ({it.gst?.cgst ?? 0}% +{" "}
                                  {it.gst?.sgst ?? 0}%)
                                </p>
                              )}
                            </div>

                            {/* ✅ Final price including GST */}
                            <span className="text-sm font-medium text-gray-800">
                              {formatCurrency(lineTotal)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Totals section */}
              <div className="mt-6 border-t pt-4 space-y-1">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>

                {taxTotal > 0 && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>GST</span>
                    <span>{formatCurrency(taxTotal)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm text-gray-600 items-center">
                  <span>Shipping</span>

                  {isCalculatingShipping ? (
                    <span className="flex items-center gap-2 text-gray-500 text-xs">
                      <svg
                        className="animate-spin h-4 w-4 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                        ></path>
                      </svg>
                      Calculating...
                    </span>
                  ) : (
                    <span className="font-medium">
                      {formatCurrency(shippingCharge)}
                    </span>
                  )}
                </div>

                {shippingNotice && (
                  <p
                    className={`text-xs mt-2 transition-all duration-300 ${
                      shippingStatus === "success"
                        ? "text-green-600"
                        : shippingStatus === "warning"
                        ? "text-amber-600"
                        : shippingStatus === "error"
                        ? "text-red-600"
                        : "text-gray-500"
                    }`}
                  >
                    {shippingNotice}
                  </p>
                )}

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

function renderInput(
  label: string,
  field: keyof typeof initialShipping,
  data: typeof initialShipping,
  setData: React.Dispatch<React.SetStateAction<typeof initialShipping>>,
  errors: Record<string, string>,
  placeholder = "",
  full = false
) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="block text-sm font-medium">{label}</label>
      <input
        value={data[field]}
        onChange={(e) => setData((s) => ({ ...s, [field]: e.target.value }))}
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
