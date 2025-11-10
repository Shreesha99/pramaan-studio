"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/context/ToastContext";

export default function CustomersManager() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const [searchName, setSearchName] = useState("");

  useEffect(() => {
    setLoading(true);
    const usersRef = collection(db, "users");

    const orderListeners: Record<string, () => void> = {};

    const unsubUsers = onSnapshot(
      usersRef,
      (userSnap) => {
        const userList = userSnap.docs.map((u) => ({
          id: u.id,
          ...u.data(),
        }));

        userList.forEach((user) => {
          if (!orderListeners[user.id]) {
            const ordersRef = collection(db, "users", user.id, "orders");

            const unsubOrders = onSnapshot(
              ordersRef,
              (orderSnap) => {
                const orders = orderSnap.docs.map((d) => ({
                  id: d.id,
                  ...d.data(),
                }));

                setCustomers((prev) => {
                  const existing = prev.find((c) => c.id === user.id);
                  if (existing) {
                    return prev.map((c) =>
                      c.id === user.id ? { ...c, orders } : c
                    );
                  } else {
                    return [...prev, { ...user, orders }];
                  }
                });
              },
              (err) =>
                console.error(`orders listener error for ${user.id}`, err)
            );

            orderListeners[user.id] = unsubOrders;
          }
        });

        Object.keys(orderListeners).forEach((uid) => {
          if (!userList.find((u) => u.id === uid)) {
            orderListeners[uid]?.();
            delete orderListeners[uid];
          }
        });

        setCustomers((prev) =>
          userList.map((u) => {
            const existing = prev.find((c) => c.id === u.id);
            return existing ? { ...existing, ...u } : { ...u, orders: [] };
          })
        );

        setLoading(false);
      },
      (err) => {
        console.error("users listener error:", err);
        showToast("Failed to listen to users", "error");
        setLoading(false);
      }
    );

    return () => {
      unsubUsers();
      Object.values(orderListeners).forEach((unsub) => unsub());
    };
    // ✅ no dependencies — we only run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Update order status (works same as before)
  const handleUpdateStatus = async (
    userId: string,
    orderId: string,
    newStatus: string
  ) => {
    try {
      const orderRef = doc(db, `users/${userId}/orders/${orderId}`);
      await updateDoc(orderRef, { status: newStatus });
      showToast(`Order status updated to ${newStatus}`, "success");
    } catch (err) {
      console.error("Failed to update order status:", err);
      showToast("Failed to update status", "error");
    }
  };

  const visibleCustomers = customers
    .filter((c) =>
      (c.name || "").toLowerCase().includes(searchName.trim().toLowerCase())
    )
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

  if (loading)
    return <p className="text-center text-gray-500">Loading customers...</p>;

  if (visibleCustomers.length === 0)
    return (
      <p className="text-gray-500 text-center mt-10">
        No customers or orders found yet.
      </p>
    );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">👥 Customers</h1>
        <div className="flex items-center gap-2">
          <input
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="Search customer name"
            className="border px-3 py-2 rounded-md text-sm"
          />
        </div>
      </div>

      <div className="grid gap-8">
        {visibleCustomers.map((customer) => (
          <div
            key={customer.id}
            className="bg-white rounded-xl shadow-md border p-6"
          >
            {/* 🧑 Customer Info */}
            <div className="flex items-center gap-4 mb-4">
              {customer.photoURL ? (
                <img
                  src={customer.photoURL}
                  alt={customer.name}
                  className="w-14 h-14 rounded-full object-cover border"
                />
              ) : (
                <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold">
                  {customer.name?.[0] || "?"}
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold">{customer.name}</h2>
                <p className="text-sm text-gray-600">{customer.email}</p>
              </div>
            </div>

            {/* 🧾 Orders */}
            <div className="mt-4 border-t pt-4">
              <h3 className="font-semibold text-gray-700 mb-2">
                Orders ({customer.orders?.length || 0})
              </h3>

              {customer.orders?.length === 0 ? (
                <p className="text-sm text-gray-500">No orders placed yet.</p>
              ) : (
                <div className="space-y-6">
                  {customer.orders.map((order: any) => (
                    <div
                      key={order.id}
                      className="border rounded-lg bg-gray-50 p-4"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">
                          Order ID:{" "}
                          <span className="text-sm text-gray-600">
                            {order.orderId || order.id}
                          </span>
                        </h4>
                        <select
                          value={order.status || "Paid"}
                          onChange={(e) =>
                            handleUpdateStatus(
                              customer.id,
                              order.id,
                              e.target.value
                            )
                          }
                          className="border text-sm px-2 py-1 rounded-md bg-white"
                        >
                          <option value="Paid">Paid</option>
                          <option value="Dispatched">Dispatched</option>
                          <option value="Out for Delivery">
                            Out for Delivery
                          </option>
                          <option value="shipped">Shipped</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>

                      <div className="text-sm text-gray-600">
                        <p>
                          <span className="font-medium">Amount:</span> ₹
                          {order.amount} {order.currency || ""}
                        </p>
                        <p>
                          <span className="font-medium">Placed On:</span>{" "}
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleString()
                            : "—"}
                        </p>
                      </div>

                      {/* 📦 Shipping Info */}
                      {order.shipping && (
                        <div className="mt-3 bg-white rounded-md border p-3">
                          <h5 className="font-semibold mb-1 text-gray-700">
                            Shipping Info:
                          </h5>
                          <p className="text-sm">
                            {order.shipping.name} —{" "}
                            {order.shipping.phone || "N/A"}
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.shipping.address}, {order.shipping.city},{" "}
                            {order.shipping.state} - {order.shipping.pincode}
                          </p>
                        </div>
                      )}

                      {/* 🛍️ Items */}
                      {order.items?.length > 0 && (
                        <div className="mt-3">
                          <h5 className="font-semibold mb-2 text-gray-700">
                            Items:
                          </h5>
                          <div className="space-y-2">
                            {order.items.map((item: any, idx: number) => (
                              <div
                                key={idx}
                                className="flex items-center gap-3 border rounded-md bg-white p-2"
                              >
                                <img
                                  src={item.img}
                                  alt={item.name}
                                  className="w-14 h-14 rounded-md object-cover border"
                                />
                                <div className="text-sm">
                                  <p className="font-semibold">{item.name}</p>
                                  <p className="text-gray-500">
                                    Color: {item.color || "—"} | Size:{" "}
                                    {item.size || "—"}
                                  </p>
                                  <p className="text-gray-500">
                                    Qty: {item.qty} × ₹{item.price}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
