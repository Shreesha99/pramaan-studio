"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";

const IndiaFlag = () => {
  const flagRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!flagRef.current) return;

    // ✅ GSAP "flag wave" animation (subtle cloth-like motion)
    gsap.to(flagRef.current, {
      duration: 2.8,
      rotate: -2,
      skewY: -4,
      transformOrigin: "left center",
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    });
  }, []);

  return (
    <svg
      ref={flagRef}
      viewBox="0 0 900 600"
      className="w-7 h-4 object-cover"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Saffron */}
      <rect width="900" height="200" fill="#FF9933" />
      {/* White */}
      <rect y="200" width="900" height="200" fill="#FFFFFF" />
      {/* Green */}
      <rect y="400" width="900" height="200" fill="#138808" />

      {/* Ashoka Chakra */}
      <circle
        cx="450"
        cy="300"
        r="60"
        fill="none"
        stroke="#000080"
        strokeWidth="8"
      />
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i * 360) / 24;
        return (
          <line
            key={i}
            x1="450"
            y1="300"
            x2={450 + 60 * Math.cos((angle * Math.PI) / 180)}
            y2={300 + 60 * Math.sin((angle * Math.PI) / 180)}
            stroke="#000080"
            strokeWidth="4"
          />
        );
      })}
    </svg>
  );
};

export default function Footer() {
  const marqueeRef = useRef<HTMLDivElement>(null);

  // ✅ GSAP Marquee Animation
  useEffect(() => {
    const el = marqueeRef.current;
    if (!el) return;

    const contentWidth = el.scrollWidth;
    const windowWidth = window.innerWidth;

    const distance = contentWidth / 2; // Because text is duplicated

    gsap.to(el, {
      x: `-=${distance}`,
      duration: 12,
      ease: "none",
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize((value: any) => parseFloat(value) % -distance),
      },
    });
  }, []);

  return (
    <footer className="border-t border-gray-200 mt-20 bg-white">
      {/* Main Footer Grid */}
      <div className="max-w-[1200px] mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-10 text-sm text-gray-600">
        <div>
          <h4 className="font-semibold mb-4 text-black text-lg tracking-wide">
            Company
          </h4>
          <ul className="space-y-2">
            <li className="hover:text-black cursor-pointer">About</li>
            <li className="hover:text-black cursor-pointer">Careers</li>
            <li className="hover:text-black cursor-pointer">Blog</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-black text-lg tracking-wide">
            Help
          </h4>
          <ul className="space-y-2">
            <li className="hover:text-black cursor-pointer">
              Customer Support
            </li>
            <li className="hover:text-black cursor-pointer">Delivery Info</li>
            <li className="hover:text-black cursor-pointer">Privacy Policy</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-black text-lg tracking-wide">
            FAQ
          </h4>
          <ul className="space-y-2">
            <li className="hover:text-black cursor-pointer">Account</li>
            <li className="hover:text-black cursor-pointer">Returns</li>
            <li className="hover:text-black cursor-pointer">Payments</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-black text-lg tracking-wide">
            Resources
          </h4>
          <ul className="space-y-2">
            <li className="hover:text-black cursor-pointer">Developers</li>
            <li className="hover:text-black cursor-pointer">
              Terms & Conditions
            </li>
            <li className="hover:text-black cursor-pointer">Instagram</li>
          </ul>
        </div>
      </div>

      {/* ✅ GSAP Marquee */}
      <div className="w-full overflow-hidden border-t border-gray-200 relative">
        <div
          ref={marqueeRef}
          className="flex whitespace-nowrap text-[2.5rem] sm:text-[3.5rem] font-extrabold uppercase tracking-[0.3em] py-6 text-black"
        >
          {/* Duplicate content for smooth loop */}
          <span className="px-8">PRAMAAN • PRAMAAN • PRAMAAN • PRAMAAN •</span>
          <span className="px-8">PRAMAAN • PRAMAAN • PRAMAAN • PRAMAAN •</span>
        </div>
      </div>

      {/* ✅ Made With Love */}
      <div className="text-center text-gray-500 text-sm py-6 flex items-center justify-center gap-1">
        Made with <span className="text-red-500">❤️</span> in
        <span className="ml-1">
          <IndiaFlag />
        </span>
        by{" "}
        <a
          href="https://shreesha99.github.io/personal-website/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-black hover:underline ml-1"
        >
          Shreesha Venkatram
        </a>
      </div>
    </footer>
  );
}
