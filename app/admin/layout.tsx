"use client";

import { useEffect, useState } from "react";
import Sidebar from "./layout/Sidebar";
import Topbar from "./layout/Topbar";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import GsapButton from "@/components/GsapButton";
import ErrorText from "@/components/ErrorText";
import { useToast } from "@/context/ToastContext";
import { usePathname } from "next/navigation";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { showToast } = useToast();
  const pathname = usePathname();

  const [isMobile, setIsMobile] = useState(false);
  const [admin, setAdmin] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // ✅ Detect screen width
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ✅ Check localStorage for saved admin session
  useEffect(() => {
    const saved = localStorage.getItem("pramaan_admin");
    if (saved) {
      try {
        setAdmin(JSON.parse(saved));
      } catch {
        localStorage.removeItem("pramaan_admin");
      }
    }
    setLoading(false);
  }, []);

  // ✅ Handle login
  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setAuthError("Enter username and password");
      return;
    }

    setAuthError("");
    try {
      const q = query(
        collection(db, "admin"),
        where("username", "==", username.trim())
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        setAuthError("Invalid credentials");
        return;
      }

      const adminData = snap.docs[0].data();
      if (adminData.password !== password.trim()) {
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
      console.error("Login failed:", err);
      setAuthError("Login failed. Try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("pramaan_admin");
    setAdmin(null);
    showToast("Logged out successfully", "info");
  };

  // ✅ Mobile block
  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-6">
        <h1 className="text-2xl font-semibold mb-3 text-gray-800">
          Admin Panel Unavailable on Mobile 📵
        </h1>
        <p className="text-gray-600 max-w-sm leading-relaxed">
          Please open this page on a larger screen to manage products and
          orders.
        </p>
      </div>
    );
  }

  // ✅ While checking session
  if (loading) {
    return (
      <div className="text-center py-10 text-gray-600">Checking session...</div>
    );
  }

  // ✅ Not logged in → show login form
  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-sm">
          <h2 className="text-2xl font-bold text-center mb-2">Admin Login</h2>
          <p className="text-sm text-gray-500 text-center mb-4">
            Secure access to management dashboard
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

  // ✅ Logged in → Show Admin layout + children
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar onLogout={handleLogout} admin={admin} />
        <main className="p-6 overflow-y-auto">
          {pathname === "/admin" ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-600">
              <h2 className="text-2xl font-semibold mb-2">
                Welcome, {admin.displayName} 👋
              </h2>
              <p>Select a page from the sidebar to begin managing the store.</p>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
