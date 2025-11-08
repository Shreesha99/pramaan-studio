"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

export default function OrderSuccessPage() {
  const params = useSearchParams();
  const orderId = params.get("orderId");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-green-50 to-white text-center p-6">
      <CheckCircleIcon className="w-20 h-20 text-green-500 mb-4 animate-bounce" />

      <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-gray-800">
        Order Placed Successfully 🎉
      </h1>

      <p className="text-gray-700 mt-2 max-w-md">
        Your order <strong>#{orderId}</strong> has been placed and is now being
        processed. <br />
        <span className="text-sm text-gray-600">
          Please <strong>save this Order ID</strong> for future reference.
        </span>
      </p>

      <div className="mt-6">
        <Link
          href="/"
          className="inline-block bg-black text-white py-2 px-6 rounded-full hover:bg-gray-900 transition"
        >
          Continue Shopping
        </Link>
      </div>

      <div className="mt-10 text-sm text-gray-600">
        <p>Need help with your order?</p>
        <p className="mt-1">
          📩 Email us at{" "}
          <a
            href="mailto:help@pramaanstudio.com"
            className="text-black font-medium hover:underline"
          >
            help@pramaanstudio.com
          </a>
        </p>
        <p className="mt-1">
          💬 WhatsApp:{" "}
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="text-black font-medium hover:underline"
          >
            +91 98765 43210
          </a>
        </p>
        <p className="mt-1">
          📷 Instagram:{" "}
          <a
            href="https://instagram.com/pramaan.studio"
            target="_blank"
            rel="noopener noreferrer"
            className="text-black font-medium hover:underline"
          >
            @pramaan.studio
          </a>
        </p>
      </div>

      <p className="mt-8 text-xs text-gray-400">
        Thank you for shopping with <strong>PraMaan Studio</strong> 💚
      </p>
    </div>
  );
}
