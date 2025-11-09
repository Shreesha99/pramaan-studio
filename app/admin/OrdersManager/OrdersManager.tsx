"use client";
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  getFirestore,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/context/ToastContext";
import GsapButton from "@/components/GsapButton";

interface Order {
  id: string;
  userId: string;
  amount: number;
  createdAt: string;
  currency: string;
  paymentId: string;
  orderId: string;
  items: any[];
  shipping: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  status: string;
}

export default function OrdersManager() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const allOrders: Order[] = [];

        // Loop through each user → get their orders subcollection
        for (const userDoc of usersSnapshot.docs) {
          const userId = userDoc.id;
          const ordersRef = collection(db, "users", userId, "orders");
          const ordersSnap = await getDocs(ordersRef);

          ordersSnap.forEach((o) => {
            allOrders.push({
              userId,
              id: o.id,
              ...(o.data() as any),
            });
          });
        }

        // Sort by newest
        allOrders.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setOrders(allOrders);
      } catch (err) {
        console.error("Error fetching orders:", err);
        showToast("Failed to fetch orders", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const updateStatus = async (
    userId: string,
    orderId: string,
    status: string
  ) => {
    try {
      const orderRef = doc(db, "users", userId, "orders", orderId);
      await updateDoc(orderRef, { status });

      setOrders((prev) =>
        prev.map((o) =>
          o.userId === userId && o.id === orderId ? { ...o, status } : o
        )
      );
      showToast(`Order marked as ${status}`, "success");
    } catch (err) {
      console.error("Failed to update status:", err);
      showToast("Failed to update order.", "error");
    }
  };

  if (loading)
    return <p className="text-center text-gray-500">Loading orders...</p>;

  if (orders.length === 0)
    return <p className="text-center text-gray-500 mt-10">No orders found.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">📦 Orders</h1>

      <div className="grid gap-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white p-6 rounded-xl shadow border flex flex-col"
          >
            {/* 🧾 Order Header */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg">
                  {order.shipping?.name || "Unknown Customer"}
                </h3>
                <p className="text-sm text-gray-500">
                  {order.shipping?.phone} — {order.shipping?.city}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-700">
                  ₹{order.amount.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* 🧳 Shipping Details */}
            <p className="text-sm text-gray-600 mb-2">
              <b>Shipping:</b>{" "}
              {order.shipping
                ? `${order.shipping.address}, ${order.shipping.city}, ${order.shipping.state} - ${order.shipping.pincode}`
                : "N/A"}
            </p>

            {/* 🧩 Items */}
            <div className="border-t mt-3 pt-3 space-y-3">
              {order.items?.map((item, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <img
                        src={item.img}
                        alt={item.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                      <span>
                        {item.name} — {item.color} ×{item.qty}
                      </span>
                    </div>
                    <span>₹{item.price}</span>
                  </div>

                  {/* 🎨 Show Custom Design if available */}
                  {item.customizedImage && (
                    <div className="ml-10">
                      <p className="text-xs text-gray-500 mb-1">
                        Customized Design:
                      </p>
                      <img
                        src={item.customizedImage}
                        alt="Customized Design"
                        className="w-32 h-32 object-contain border rounded shadow-sm"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 🏷️ Status */}
            <div className="mt-3">
              <p className="text-sm">
                Status:{" "}
                <span
                  className={`font-medium ${
                    order.status === "shipped"
                      ? "text-green-600"
                      : order.status === "cancelled"
                      ? "text-red-600"
                      : order.status === "Paid"
                      ? "text-blue-600"
                      : "text-gray-500"
                  }`}
                >
                  {order.status}
                </span>
              </p>
            </div>

            {/* 🧰 Actions */}
            <div className="flex gap-2 mt-4">
              <GsapButton
                onClick={() => updateStatus(order.userId, order.id, "shipped")}
                loading={false}
                text="Mark Shipped"
                loadingText="Updating..."
                className="flex-1 bg-green-600 text-white py-1 text-sm"
              />
              <GsapButton
                onClick={() =>
                  updateStatus(order.userId, order.id, "cancelled")
                }
                loading={false}
                text="Cancel"
                loadingText="Updating..."
                className="flex-1 bg-red-600 text-white py-1 text-sm"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
