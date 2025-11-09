"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductManager from "@/app/admin/ProductManager/ProductManager"; // ✅ not page.tsx
import { useToast } from "@/context/ToastContext";
import GsapButton from "@/components/GsapButton";
import ErrorText from "@/components/ErrorText";
import AdminLayout from "./layout/AdminLayout";

export default function AdminProtectedProductManager() {
  const { showToast } = useToast();

  const [admin, setAdmin] = useState<any | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔁 Check saved session once
  useEffect(() => {
    const saved = localStorage.getItem("pramaan_admin");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAdmin(parsed);
      } catch {
        localStorage.removeItem("pramaan_admin");
      }
    }
    setLoading(false);
  }, []);

  // 🔐 Handle login
  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setAuthError("Enter username and password");
      return;
    }

    setAuthError("");

    try {
      // ✅ Correct collection name: "admins"
      const q = query(
        collection(db, "admin"),
        where("username", "==", username.trim())
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        setAuthError("Invalid credentials");
        console.warn("⚠️ No admin found for username:", username.trim());
        return;
      }

      const adminData = snap.docs[0].data();

      if (adminData.password !== password.trim()) {
        console.warn("⚠️ Password mismatch:", {
          entered: password.trim(),
          actual: adminData.password,
        });
        setAuthError("Invalid credentials");
        return;
      }

      const loggedAdmin = {
        username: adminData.username,
        displayName: adminData.displayName || adminData.username,
      };

      localStorage.setItem("pramaan_admin", JSON.stringify(loggedAdmin));
      setAdmin(loggedAdmin);
      showToast(`Welcome, ${loggedAdmin.displayName}!`, "success");
    } catch (err) {
      console.error("Login error:", err);
      setAuthError("Login failed. Try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("pramaan_admin");
    setAdmin(null);
    showToast("Logged out successfully", "info");
  };

  if (loading)
    return (
      <div className="text-center py-10 text-gray-600">Checking session...</div>
    );

  // 🔒 If not logged in → show login
  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-sm">
          <h2 className="text-2xl font-bold text-center mb-2">Admin Login</h2>
          <p className="text-sm text-gray-500 text-center mb-4">
            Secure access to product management
          </p>

          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border rounded-md mb-3"
          />

          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md mb-3"
          />

          {authError && <ErrorText message={authError} />}

          <GsapButton
            onClick={handleLogin}
            loading={false}
            disabled={!username || !password}
            text="Login"
            loadingText="Verifying..."
            className="w-full bg-black text-white py-2 rounded-md mt-2"
          />
        </div>
      </div>
    );
  }

  // ✅ Logged in → show ProductManager (original)
  return (
    <AdminLayout>
      <ProductManager />
    </AdminLayout>
  );
}
