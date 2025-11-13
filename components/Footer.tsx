"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import IndiaFlag from "./IndianFlag";

/* ==========================
          FOOTER
========================== */
export default function Footer() {
  const marqueeRef = useRef<HTMLDivElement>(null);

  // ✅ Smooth Marquee Animation
  useEffect(() => {
    const el = marqueeRef.current;
    if (!el) return;

    const distance = el.scrollWidth / 2;
    gsap.to(el, {
      x: `-=${distance}`,
      duration: 15,
      ease: "none",
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize((x: any) => parseFloat(x) % -distance),
      },
    });
  }, []);

  return (
    <footer className="border-t border-gray-200 mt-20 bg-white">
      {/* Main Grid */}
      <div className="max-w-[1200px] mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-10 text-sm text-gray-600 text-center md:text-left">
        {/* Help */}
        <div>
          <h4 className="font-semibold mb-4 text-black text-lg tracking-wide">
            Help
          </h4>
          <ul className="space-y-2">
            <li>
              <a href="/contact" className="hover:text-black">
                Contact us
              </a>
            </li>
            <li>
              <a href="/shipping" className="hover:text-black">
                Shipping
              </a>
            </li>
            <li>
              <a href="/privacy" className="hover:text-black">
                Privacy Policy
              </a>
            </li>
          </ul>
        </div>

        {/* FAQ */}
        <div>
          <h4 className="font-semibold mb-4 text-black text-lg tracking-wide">
            FAQ
          </h4>
          <ul className="space-y-2">
            <li>
              <a href="/faq" className="hover:text-black">
                Account
              </a>
            </li>
            <li>
              <a href="/cancellation-refund" className="hover:text-black">
                Cancellation and refunds
              </a>
            </li>
            <li>
              <a href="/payments-faq" className="hover:text-black">
                Payments
              </a>
            </li>
          </ul>
        </div>

        {/* Resources */}
        <div className="col-span-2 md:col-span-1">
          <h4 className="font-semibold mb-4 text-black text-lg tracking-wide">
            Resources
          </h4>
          <ul className="space-y-2">
            <li>
              <a href="/terms" className="hover:text-black">
                Terms & Conditions
              </a>
            </li>
            <li>
              <a
                href="https://www.instagram.com/pramaan_print_studio/"
                target="_blank"
                className="hover:text-black"
              >
                Instagram
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Marquee */}
      <div className="w-full overflow-hidden border-t border-gray-200 relative">
        <div
          ref={marqueeRef}
          className="flex whitespace-nowrap text-[2.5rem] sm:text-[3.5rem] font-extrabold uppercase tracking-[0.3em] py-6 text-black justify-center"
        >
          <span className="px-8">PRAMAAN • PRAMAAN • PRAMAAN • PRAMAAN •</span>
          <span className="px-8">PRAMAAN • PRAMAAN • PRAMAAN • PRAMAAN •</span>
        </div>
      </div>

      {/* Made with ❤️ in India */}
      <div className="py-6 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-gray-600 text-sm text-center">
        <div className="flex items-center gap-1">
          Made with <span className="text-red-500">❤️</span> in
          <span className="ml-1">
            <IndiaFlag />
          </span>
        </div>
        <span className="text-gray-400">|</span>
        <a
          href="https://shreesha99.github.io/personal-website/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-black hover:underline"
        >
          Shreesha Venkatram
        </a>
      </div>
    </footer>
  );
}
