"use client";

import AdminProtectedProductManager from "./AdminProtectedProductManager";

export default function AdminProductsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <AdminProtectedProductManager />
    </div>
  );
}
