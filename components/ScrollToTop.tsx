"use client";

import { useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useLenis } from "@/app/providers/LenisProvider";
import { ChevronUpIcon } from "@heroicons/react/24/outline";

gsap.registerPlugin(ScrollToPlugin);

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const lenis = useLenis();

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    if (lenis) {
      lenis.scrollTo(0, {
        duration: 1.2,
        easing: (t: number) => 1 - Math.pow(1 - t, 3),
      });
    } else {
      gsap.to(window, { scrollTo: { y: 0 }, duration: 1 });
    }
  };

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed bottom-10 left-6 z-[200]
        bg-black text-white
        px-6 py-3 rounded-full
        shadow-lg hover:shadow-xl
        transition-all duration-300
        hover:bg-neutral-900 active:scale-95

        ${
          visible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-50 translate-y-6 pointer-events-none"
        }
      `}
    >
      <span className="flex items-center gap-2">
        {/* ✅ Desktop text */}
        <span className="hidden md:inline">Scroll to Top</span>

        {/* ✅ Mobile arrow only */}
        <ChevronUpIcon className="w-6 h-6 md:hidden" />
      </span>
    </button>
  );
}
