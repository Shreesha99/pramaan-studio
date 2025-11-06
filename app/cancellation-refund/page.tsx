// app/cancellation-refund/page.tsx
export const metadata = {
  title: "Cancellation & Refund Policy | PraMaan",
  description: "Refund and return policy for PraMaan.",
};

export default function RefundPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold mb-6">Cancellation & Refund Policy</h1>
      <p className="text-gray-700 mb-4">Last updated: January 2025</p>

      <h2 className="text-2xl font-semibold mt-8 mb-3">Order Cancellation</h2>
      <p className="text-gray-700 leading-relaxed">
        Orders can be cancelled within 2 hours of placing the order.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-3">Refund Eligibility</h2>
      <ul className="ml-6 list-disc text-gray-700 leading-relaxed">
        <li>Wrong or defective product received</li>
        <li>Product damaged in transit</li>
        <li>Package lost by courier</li>
      </ul>
    </main>
  );
}
