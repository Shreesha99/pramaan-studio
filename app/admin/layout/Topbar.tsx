"use client";
import { useEffect, useState } from "react";

export default function Topbar() {
  const [admin, setAdmin] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("pramaan_admin");
    if (saved) setAdmin(JSON.parse(saved));
  }, []);

  const logout = () => {
    localStorage.removeItem("pramaan_admin");
    window.location.href = "/admin";
  };

  return (
    <header className="bg-white shadow flex justify-between items-center px-6 py-3">
      <h2 className="font-semibold text-lg">Dashboard</h2>
      {admin && (
        <div className="flex items-center gap-3">
          <span className="text-gray-600">{admin.displayName}</span>
          <button
            onClick={logout}
            className="text-sm bg-black text-white px-3 py-1 rounded-full hover:bg-gray-800"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
