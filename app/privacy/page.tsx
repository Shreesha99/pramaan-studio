// app/privacy/page.tsx
export const metadata = {
  title: "Privacy Policy | PraMaan",
  description: "Official privacy policy for PraMaan.",
};

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-gray-700 leading-relaxed mb-4">
        Last updated: January 2025
      </p>

      <p className="text-gray-700 leading-relaxed mb-6">
        PraMaan is committed to protecting your privacy. This policy describes
        how we collect, use, and safeguard your information.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-3">
        Information We Collect
      </h2>
      <ul className="list-disc ml-6 text-gray-700 leading-relaxed">
        <li>Name, email, phone number</li>
        <li>Billing & shipping address</li>
        <li>Device and usage data</li>
        <li>Payment information (processed securely by Razorpay)</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-3">How We Use Your Data</h2>
      <ul className="list-disc ml-6 text-gray-700 leading-relaxed">
        <li>To process and deliver orders</li>
        <li>To send updates & confirmations</li>
        <li>To improve user experience</li>
        <li>For fraud prevention and security</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-3">Payment Security</h2>
      <p className="text-gray-700 leading-relaxed">
        We use Razorpay, which is PCI-DSS compliant. PraMaan never stores credit
        card, UPI, or banking details.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-3">Your Rights</h2>
      <ul className="list-disc ml-6 text-gray-700 leading-relaxed">
        <li>Request data deletion</li>
        <li>Request correction of personal details</li>
        <li>Opt out of marketing communication</li>
      </ul>
    </main>
  );
}
