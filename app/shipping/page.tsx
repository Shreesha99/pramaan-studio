// app/shipping/page.tsx
export const metadata = {
  title: "Shipping Policy | PraMaan",
  description: "Shipping policy for PraMaan orders.",
};

export default function ShippingPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold mb-6">Shipping Policy</h1>
      <p className="text-gray-700 mb-4">Last updated: January 2025</p>

      <h2 className="text-2xl font-semibold mt-8 mb-3">Delivery Time</h2>
      <ul className="ml-6 list-disc text-gray-700 leading-relaxed">
        <li>Standard delivery: 3–7 business days</li>
        <li>Metro cities: 2–4 days</li>
        <li>Remote areas: 5–10 days</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-3">Order Tracking</h2>
      <p className="text-gray-700 leading-relaxed">
        You will receive tracking details once your order is shipped.
      </p>
    </main>
  );
}
