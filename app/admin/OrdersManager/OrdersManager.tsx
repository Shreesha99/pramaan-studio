"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/context/ToastContext";
import GsapButton from "@/components/GsapButton";

interface Order {
  id: string;
  userId: string;
  amount: number;
  createdAt: string;
  currency: string;
  paymentId?: string;
  orderId?: string;
  items: any[];
  shipping?: {
    name?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  status?: string;
}

export default function OrdersManager() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOrderId, setFilterOrderId] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const allOrders: Order[] = [];

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
  }, [showToast]);

  // Cancel order
  const cancelOrder = async (userId: string, orderId: string) => {
    try {
      const orderRef = doc(db, "users", userId, "orders", orderId);
      await updateDoc(orderRef, { status: "cancelled" });
      setOrders((prev) =>
        prev.map((o) =>
          o.userId === userId && o.id === orderId
            ? { ...o, status: "cancelled" }
            : o
        )
      );
      showToast("Order cancelled successfully", "success");
    } catch (err) {
      console.error("Error cancelling order:", err);
      showToast("Failed to cancel order", "error");
    }
  };

  // Apply search + filter
  const visibleOrders = orders.filter((o) => {
    const searchTerm = filterOrderId.trim().toLowerCase();
    const statusMatch =
      filterStatus === "All" ||
      (o.status || "unknown").toLowerCase() === filterStatus.toLowerCase();
    const idMatch =
      !searchTerm ||
      o.id.toLowerCase().includes(searchTerm) ||
      (o.orderId || "").toLowerCase().includes(searchTerm);
    return statusMatch && idMatch;
  });

  if (loading)
    return <p className="text-center text-gray-500">Loading orders...</p>;

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">📦 Orders</h1>
        <div className="flex flex-wrap gap-3 items-center">
          <input
            value={filterOrderId}
            onChange={(e) => setFilterOrderId(e.target.value)}
            placeholder="Search by Order ID"
            className="border px-3 py-2 rounded-md text-sm"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border px-2 py-2 rounded-md text-sm"
          >
            <option value="All">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="shipped">Shipped</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <GsapButton
            onClick={() => {
              setFilterOrderId("");
              setFilterStatus("All");
            }}
            loading={false}
            text="Clear"
            loadingText="..."
            className="px-3 py-2 text-sm"
          />
        </div>
      </div>

      {visibleOrders.length === 0 ? (
        <p className="text-center text-gray-400">No matching orders found.</p>
      ) : (
        <div className="grid gap-6">
          {visibleOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white p-6 rounded-xl shadow border flex flex-col"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">
                    {order.shipping?.name || "Unknown Customer"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {order.shipping?.phone || "—"} —{" "}
                    {order.shipping?.city || "—"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Order ID: {order.orderId || order.id}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-gray-700">
                    ₹{Number(order.amount || 0).toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-gray-400">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString()
                      : "—"}
                  </p>
                </div>
              </div>

              {/* Shipping Details */}
              {order.shipping && (
                <div className="bg-gray-50 border rounded-md p-3 mb-4 text-sm text-gray-700">
                  <p>
                    <b>Name:</b> {order.shipping.name}
                  </p>
                  <p>
                    <b>Phone:</b> {order.shipping.phone}
                  </p>
                  <p>
                    <b>Address:</b> {order.shipping.address},{" "}
                    {order.shipping.city}, {order.shipping.state} -{" "}
                    {order.shipping.pincode}
                  </p>
                </div>
              )}

              {/* Items */}
              <div className="border-t pt-3 space-y-4">
                {order.items?.map((item, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-2 border rounded-md bg-gray-50 p-3"
                  >
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <img
                          src={item.img}
                          alt={item.name}
                          className="w-12 h-12 rounded object-cover border"
                        />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-gray-500 text-xs">
                            Color: {item.color || "—"} | Size:{" "}
                            {item.size || "—"}
                          </p>
                          <p className="text-gray-500 text-xs">
                            Qty: {item.qty} × ₹{item.price}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-gray-800">
                        ₹{(item.price * item.qty).toFixed(2)}
                      </span>
                    </div>

                    {item.customizedImage && (
                      <div className="ml-14">
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

              {/* Footer Actions */}
              <div className="mt-4 flex justify-between items-center">
                <p className="text-sm">
                  Status:{" "}
                  <span
                    className={`font-medium ${
                      order.status === "cancelled"
                        ? "text-red-600"
                        : order.status === "shipped"
                        ? "text-green-600"
                        : order.status === "Paid"
                        ? "text-blue-600"
                        : "text-gray-600"
                    }`}
                  >
                    {order.status || "Unknown"}
                  </span>
                </p>

                {order.status !== "cancelled" && (
                  <GsapButton
                    onClick={() => cancelOrder(order.userId, order.id)}
                    loading={false}
                    text="Cancel Order"
                    loadingText="Cancelling..."
                    className="bg-red-600 text-white text-sm py-1 px-2 "
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
