"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { XCircleIcon } from "@heroicons/react/24/outline";
import { useCallback } from "react";

export default function OrderFailedClient() {
  const params = useSearchParams();
  const router = useRouter();
  const reason = params.get("reason");

  const handleTryAgain = useCallback(() => {
    // ✅ Clear stored data so checkout resets fully
    localStorage.removeItem("failedAttempts");
    localStorage.removeItem("paymentInProgress");
    localStorage.removeItem("lastRazorpayOrder");

    // ✅ Smoothly go back to checkout
    router.push("/checkout");
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-center p-6">
      <XCircleIcon className="w-20 h-20 text-red-500 mb-4" />
      <h1 className="text-3xl font-bold mb-2">Payment Failed</h1>
      <p className="text-gray-700 mb-4">
        Unfortunately, your payment could not be completed.
      </p>
      {reason && <p className="text-xs text-gray-500 mb-4">Reason: {reason}</p>}

      <button
        onClick={handleTryAgain}
        className="inline-block mt-4 bg-black text-white py-2 px-6 rounded-full hover:bg-gray-900 transition-all duration-200"
      >
        Try Again
      </button>
    </div>
  );
}
