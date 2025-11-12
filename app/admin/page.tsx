"use client";

import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // ✅ Detect screen size once on mount
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // treat <1024px as mobile/tablet
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      // ✅ Only redirect on desktop
      redirect("/admin/products");
    }
  }, [isMobile]);

  if (isMobile) {
    // ✅ Show friendly message instead of redirect
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-6">
        <h1 className="text-2xl font-semibold mb-3 text-gray-800">
          Admin Panel Unavailable on Mobile 📵
        </h1>
        <p className="text-gray-600 max-w-sm leading-relaxed">
          The admin dashboard is optimized for desktop use. Please open this
          link on a larger screen to continue managing products and orders.
        </p>
      </div>
    );
  }

  // ✅ Avoid flashing content
  return null;
}
