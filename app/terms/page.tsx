// app/terms/page.tsx
export const metadata = {
  title: "Terms & Conditions | PraMaan",
  description: "Official terms & conditions for PraMaan.",
};

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold mb-6">Terms & Conditions</h1>
      <p className="text-gray-700 mb-4">Last updated: January 2025</p>

      <p className="text-gray-700 leading-relaxed mb-6">
        By using this website, you agree to the terms outlined here. These terms
        apply to all visitors, customers, and users of PraMaan.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-3">Products & Orders</h2>
      <ul className="ml-6 list-disc text-gray-700 leading-relaxed">
        <li>Many products are custom-made and may vary slightly.</li>
        <li>We reserve the right to cancel or refuse any order.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-3">Pricing & Payments</h2>
      <p className="text-gray-700 leading-relaxed">
        All prices include applicable taxes. Payments are processed securely via
        Razorpay.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-3">Shipping</h2>
      <p className="text-gray-700 leading-relaxed">
        Delivery timelines are estimates and may vary due to logistic delays.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-3">Returns & Refunds</h2>
      <p className="text-gray-700 leading-relaxed">
        Refer to our dedicated Cancellation & Refund page.
      </p>
    </main>
  );
}
