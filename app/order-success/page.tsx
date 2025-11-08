"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// ✅ Dynamically import the client-side component
const OrderSuccessClient = dynamic(
  () => import("@/components/OrderSuccessClient"),
  {
    ssr: false, // prevent any server rendering or prerendering
  }
);

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <OrderSuccessClient />
    </Suspense>
  );
}
