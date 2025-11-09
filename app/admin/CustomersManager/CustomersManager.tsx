"use client";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function CustomersManager() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      const q = await getDocs(collection(db, "customers"));
      const list = q.docs.map((d) => ({ id: d.id, ...d.data() }));
      setCustomers(list);
      setLoading(false);
    };
    fetchCustomers();
  }, []);

  if (loading)
    return <p className="text-center text-gray-500">Loading customers...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">👥 Customers</h1>
      {customers.length === 0 ? (
        <p className="text-gray-500 text-center">No customers yet.</p>
      ) : (
        <div className="grid gap-4">
          {customers.map((c) => (
            <div key={c.id} className="bg-white p-6 rounded-xl shadow border">
              <h3 className="font-semibold">{c.name}</h3>
              <p className="text-sm text-gray-600">{c.email}</p>
              <p className="text-xs text-gray-400 mt-1">
                Total Orders: {c.totalOrders || 0}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
