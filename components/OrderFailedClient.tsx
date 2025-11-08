"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { XCircleIcon } from "@heroicons/react/24/outline";

export default function OrderFailedClient() {
  const params = useSearchParams();
  const reason = params.get("reason");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-center p-6">
      <XCircleIcon className="w-20 h-20 text-red-500 mb-4" />
      <h1 className="text-3xl font-bold mb-2">Payment Failed</h1>
      <p className="text-gray-700 mb-4">
        Unfortunately, your payment could not be completed.
      </p>
      {reason && <p className="text-xs text-gray-500 mb-4">Reason: {reason}</p>}
      <Link
        href="/checkout"
        className="inline-block mt-4 bg-black text-white py-2 px-6 rounded-full hover:bg-gray-900"
      >
        Try Again
      </Link>
    </div>
  );
}
