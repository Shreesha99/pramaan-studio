// app/contact/page.tsx
export const metadata = {
  title: "Contact Us | PraMaan",
  description: "Get in touch with PraMaan support.",
};

export default function ContactPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold mb-6">Contact Us</h1>

      <p className="text-gray-700 leading-relaxed mb-4">
        If you need assistance with orders, refunds, or support, feel free to
        contact us.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-2">Email</h2>
      <p className="text-gray-700">support@pramaan.in</p>

      <h2 className="text-2xl font-semibold mt-8 mb-2">Address</h2>
      <p className="text-gray-700">
        PraMaan Clothing Bangalore, Karnataka, India
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-2">Support Hours</h2>
      <p className="text-gray-700">
        Monday – Saturday: 10:00 AM – 6:00 PM Sunday: Closed
      </p>
    </main>
  );
}
