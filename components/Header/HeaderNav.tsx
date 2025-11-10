"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import Link from "next/link";

interface Props {
  mobileNavOpen: boolean;
  setMobileNavOpen: (v: boolean) => void;
}

export default function HeaderNav({ mobileNavOpen, setMobileNavOpen }: Props) {
  const mobileNavRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mobileNavRef.current) return;
    if (mobileNavOpen) {
      gsap.fromTo(
        mobileNavRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" }
      );
    } else {
      gsap.to(mobileNavRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
      });
    }
  }, [mobileNavOpen]);

  return (
    <>
      <nav className="hidden md:flex items-center gap-10 text-sm font-medium text-gray-700">
        {/* <Link href="/products">Products</Link> */}
        {/* <a href="#products">Our range</a>
        <a href="#our-work">Our work</a> */}
      </nav>

      {/* 📱 Mobile Dropdown */}
      {mobileNavOpen && (
        <div
          ref={mobileNavRef}
          className="md:hidden bg-white border-t border-gray-200 absolute w-full left-0 top-[72px] z-90 shadow-xl"
        >
          <nav className="flex flex-col items-start p-5 space-y-4 text-gray-800 text-sm font-medium">
            <Link
              href="/products"
              onClick={() => setMobileNavOpen(false)}
              className="w-full text-left hover:text-black"
            >
              Products
            </Link>
            <a
              href="#products"
              onClick={() => setMobileNavOpen(false)}
              className="w-full text-left hover:text-black"
            >
              Our range
            </a>
            <a
              href="#our-work"
              onClick={() => setMobileNavOpen(false)}
              className="w-full text-left hover:text-black"
            >
              Our work
            </a>
          </nav>
        </div>
      )}
    </>
  );
}
