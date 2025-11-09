"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer";

gsap.registerPlugin(ScrollTrigger);

// 💳 PAYMENTS FAQ DATA
const paymentFaqs = [
  {
    q: "What payment methods do you accept?",
    a: "We accept all major debit and credit cards, UPI, Google Pay, PhonePe, Paytm, and net banking. For bulk or corporate orders, we also support bank transfers and invoicing.",
  },
  {
    q: "Is my payment information secure?",
    a: "Yes, absolutely. All transactions are processed through trusted gateways like Razorpay and Stripe using end-to-end encryption. We never store your card or UPI data.",
  },
  {
    q: "Do you offer Cash on Delivery (COD)?",
    a: "Yes, COD is available for select products and pin codes. For custom or personalized orders, we require advance payment to begin production.",
  },
  {
    q: "Can I get a GST invoice for my order?",
    a: "Yes, all business and bulk orders automatically include a GST invoice. For individual purchases, you can request a GST bill during checkout.",
  },
  {
    q: "What if my payment fails?",
    a: "If your payment fails, please wait a few minutes and retry. In case the amount is debited but the order doesn’t show up, contact our support team — refunds are auto-processed within 3–5 working days.",
  },
  {
    q: "Do you charge any additional transaction fees?",
    a: "No, there are no hidden charges. The total you see at checkout is the final payable amount including taxes.",
  },
];

export default function PaymentsFAQPage() {
  const titleRef = useRef(null);

  // ✅ GSAP Animations for page entrance
  useEffect(() => {
    if (!titleRef.current) return;

    gsap.from(titleRef.current, {
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
    });

    gsap.utils.toArray(".faq-card").forEach((el: any, i: number) => {
      gsap.from(el, {
        opacity: 0,
        y: 30,
        duration: 0.7,
        delay: i * 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
        },
      });
    });
  }, []);

  return (
    <main className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="fixed top-0 left-0 z-[200] w-full">
        <Header />
      </div>

      {/* Hero Section */}
      <section className="pt-28 pb-16 text-center">
        <h1
          ref={titleRef}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight uppercase"
        >
          Payments & Billing FAQ
        </h1>
        <p className="text-gray-600 mt-4 text-sm sm:text-base">
          Learn about payment options, invoices, and refund processes.
        </p>
      </section>

      {/* FAQ List */}
      <section className="max-w-[900px] mx-auto px-6">
        {paymentFaqs.map((item, i) => (
          <FAQItem key={i} faq={item} />
        ))}
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}

// 💬 Reusable FAQ Item Component
function FAQItem({ faq }: { faq: { q: string; a: string } }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="faq-card border-b border-gray-200 py-5 cursor-pointer group"
      onClick={() => setOpen(!open)}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg sm:text-xl font-semibold group-hover:text-black transition">
          {faq.q}
        </h3>

        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
        >
          <ChevronDownIcon className="w-5 h-5 text-gray-600" />
        </motion.div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="text-gray-600 text-sm sm:text-base mt-3 leading-relaxed pr-6"
          >
            {faq.a}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
