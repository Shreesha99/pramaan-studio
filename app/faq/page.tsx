"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import React from "react";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer";

gsap.registerPlugin(ScrollTrigger);

// FAQ DATA
const faqs = [
  {
    q: "What types of custom apparel do you offer?",
    a: "We specialize in custom t-shirts, hoodies, sweatshirts, jerseys, caps, and full merch kits for brands, teams, events, and businesses.",
  },
  {
    q: "Do you offer bulk pricing?",
    a: "Yes! Bulk orders come with heavily discounted rates after quantity 10, 25, 50, 100+ units.",
  },
  {
    q: "Can I get a sample before bulk ordering?",
    a: "Absolutely. You can order a single custom sample to confirm fabric, print quality, and fit.",
  },
  {
    q: "What printing methods do you use?",
    a: "We offer screen printing, DTF, embroidery, vinyl, puff print, and premium stitched patches.",
  },
  {
    q: "How long does delivery take?",
    a: "Standard orders take 6–8 days. Bulk orders may vary based on quantity but we always deliver on time.",
  },
  {
    q: "Do you design the artwork for us?",
    a: "Yes. Our design team can create artwork, branding layouts, and mockups based on your ideas.",
  },
  {
    q: "Can we place orders for corporate or college events?",
    a: "Definitely! We specialize in teams, clubs, festivals, startups, and enterprise-level corporate merch.",
  },
];

export default function FAQPage() {
  const titleRef = useRef(null);

  // ✅ GSAP page entrance animation
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
      {/* Header Section */}
      <section className="pt-28 pb-16 text-center">
        <h1
          ref={titleRef}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight uppercase"
        >
          Frequently Asked Questions
        </h1>
        <p className="text-gray-600 mt-4 text-sm sm:text-base">
          Everything you need to know about our products, process & service.
        </p>
      </section>

      {/* FAQ List */}
      <section className="max-w-[900px] mx-auto px-6">
        {faqs.map((item, i) => (
          <FAQItem key={i} faq={item} />
        ))}
      </section>
    </main>
  );
}

function FAQItem({ faq }: { faq: { q: string; a: string } }) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <div className="w-full fixed top-0 left-0 z-200">
        <Header />
      </div>
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
    </>
  );
}
