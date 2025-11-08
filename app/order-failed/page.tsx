"use client";
import dynamic from "next/dynamic";

const OrderFailedClient = dynamic(
  () => import("@/components/OrderFailedClient"),
  {
    ssr: false, // ✅ disables server-side rendering entirely
  }
);

export default function OrderFailedPage() {
  return <OrderFailedClient />;
}
