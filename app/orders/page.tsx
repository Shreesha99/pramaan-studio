"use client";

import { useEffect, useState, useMemo } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer";
import { formatCurrency } from "@/lib/formatCurrency";
import HeaderNav from "@/components/Header/HeaderNav";
import GsapButton from "@/components/GsapButton";

export default function MyOrdersPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, `users/${user.uid}/orders`),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setOrders(data);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        showToast("Failed to load orders.", "error");
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user?.uid, showToast]);

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-lg">Please sign in to view orders.</p>
        <GsapButton
          onClick={() => {
            window.location.href = "/";
          }}
          loading={false}
          text="← Go to Home"
          loadingText="Redirecting..."
          className="w-full bg-black text-white py-2.5 rounded-md font-medium hover:bg-gray-900 transition"
        />
      </div>
    );

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-10">My Orders 🛍️</h1>

          {loading ? (
            <p className="text-center text-gray-500">Loading your orders...</p>
          ) : orders.length === 0 ? (
            <p className="text-center text-gray-500">
              You haven’t placed any orders yet.
            </p>
          ) : (
            <div className="space-y-8">
              <AnimatePresence>
                {orders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="bg-white rounded-xl shadow-md p-6 border"
                  >
                    {/* 🧾 Order Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5">
                      <div>
                        <h2 className="font-semibold text-lg break-all">
                          Order ID: {order.orderId || order.id}
                        </h2>
                        <p className="text-sm text-gray-500">
                          Placed on{" "}
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleString(
                                "en-IN",
                                {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                }
                              )
                            : "—"}
                        </p>
                      </div>
                      <p className="text-lg font-semibold mt-3 sm:mt-0">
                        {formatCurrency(order.amount)}{" "}
                        <span className="text-gray-500 text-sm">
                          ({order.currency})
                        </span>
                      </p>
                    </div>

                    {/* 🧱 Items */}
                    <div className="divide-y border-y py-3 mb-6">
                      {order.items?.map((item: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-center gap-4 py-3 flex-wrap"
                        >
                          <img
                            src={item.img}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg border"
                          />
                          <div className="flex-1 min-w-[200px]">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-gray-500 text-sm">
                              Color: {item.color || "—"} | Size:{" "}
                              {item.size || "—"}
                            </p>
                            <p className="text-gray-500 text-sm">
                              Qty: {item.qty} × ₹{item.price}
                            </p>
                            {item.customizedImage && (
                              <div className="mt-2">
                                <p className="text-xs text-gray-500">
                                  Customized Design:
                                </p>
                                <img
                                  src={item.customizedImage}
                                  alt="custom"
                                  className="w-20 h-20 object-contain border rounded-md mt-1"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* 📦 Shipping Info */}
                    {order.shipping && (
                      <div className="bg-gray-50 border rounded-lg p-4 mb-5">
                        <h3 className="font-semibold text-gray-700 mb-1">
                          Shipping Address
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {order.shipping.name}
                          <br />
                          {order.shipping.address}, {order.shipping.city},{" "}
                          {order.shipping.state} - {order.shipping.pincode}
                          <br />
                          📞 {order.shipping.phone}
                        </p>
                      </div>
                    )}

                    {/* 🚚 Animated Order Status */}
                    <OrderStatusTracker key={order.id} status={order.status} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

/* ✅ Live-Animated Order Status Component */
function OrderStatusTracker({ status = "Paid" }: { status: string }) {
  const steps = useMemo(
    () => [
      { label: "Paid", key: "Paid" },
      { label: "Dispatched", key: "Dispatched" },
      { label: "Out for Delivery", key: "Out for Delivery" },
      { label: "Delivered", key: "Delivered" },
    ],
    []
  );

  const currentIndex = steps.findIndex((s) => s.key === status);
  const progress =
    status === "cancelled" ? 0 : ((currentIndex + 1) / steps.length) * 100;

  return (
    <div className="mt-6">
      {/* Step Labels */}
      <div className="flex justify-between mb-2">
        {steps.map((step, index) => (
          <div
            key={step.key}
            className={`text-xs sm:text-sm font-medium ${
              index <= currentIndex ? "text-black" : "text-gray-400"
            }`}
          >
            {step.label}
          </div>
        ))}
      </div>

      {/* 🟩 Animated progress bar */}
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className={`absolute top-0 left-0 h-2 ${
            status === "cancelled" ? "bg-red-500" : "bg-black"
          } rounded-full`}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
      </div>

      {/* 🔵 Dots */}
      <div className="flex justify-between mt-2">
        {steps.map((_, i) => (
          <motion.div
            key={i}
            className={`w-4 h-4 rounded-full border-2 ${
              i <= currentIndex && status !== "cancelled"
                ? "bg-black border-black"
                : "bg-white border-gray-400"
            }`}
            animate={{
              scale: i === currentIndex && status !== "cancelled" ? 1.2 : 1,
              backgroundColor:
                i <= currentIndex && status !== "cancelled"
                  ? "rgb(0,0,0)"
                  : "rgb(255,255,255)",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          />
        ))}
      </div>

      {/* ❌ Cancelled Message */}
      {status === "cancelled" && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-red-600 mt-3 font-medium text-center"
        >
          ❌ Order cancelled from our side. Contact us on WhatsApp for further
          details.
        </motion.p>
      )}
    </div>
  );
}
