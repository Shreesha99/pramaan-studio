"use client";

import { useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useLenis } from "@/app/providers/LenisProvider";
import { ChevronUpIcon } from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation"; // ✅ for route detection

gsap.registerPlugin(ScrollToPlugin);

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const lenis = useLenis();
  const pathname = usePathname(); // ✅ detect current route

  // Show button only after scroll threshold
  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll logic
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

  // ✅ Detect admin pages ("/admin" or nested routes)
  const isAdminPage = pathname.startsWith("/admin");

  // ✅ Dynamic colors based on route
  const baseClasses = `
    fixed bottom-10 left-6 z-[200]
    px-6 py-3 rounded-full
    shadow-lg hover:shadow-xl
    transition-all duration-300
    active:scale-95
    ${
      visible
        ? "opacity-100 scale-100 translate-y-0"
        : "opacity-0 scale-50 translate-y-6 pointer-events-none"
    }
  `;

  const colorClasses = isAdminPage
    ? "bg-white text-black hover:bg-gray-200"
    : "bg-black text-white hover:bg-neutral-900";

  return (
    <button onClick={scrollToTop} className={`${baseClasses} ${colorClasses}`}>
      <span className="flex items-center gap-2">
        {/* Desktop text */}
        <span className="hidden md:inline">Scroll to Top</span>
        {/* Mobile arrow */}
        <ChevronUpIcon className="w-6 h-6 md:hidden" />
      </span>
    </button>
  );
}
