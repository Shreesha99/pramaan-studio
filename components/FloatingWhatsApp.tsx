"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import Image from "next/image";

export default function FloatingWhatsApp() {
  const pathname = usePathname();

  const arrowRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const guideGroupRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const chatBubbleRef = useRef<HTMLDivElement>(null);

  const [showGuide, setShowGuide] = useState(true);
  const [openChat, setOpenChat] = useState(false);

  // ✅ Always run hooks, even if component will render nothing
  useEffect(() => {
    // disappear animation
    const timer = setTimeout(() => {
      if (guideGroupRef.current) {
        gsap.to(guideGroupRef.current, {
          opacity: 0,
          y: 20,
          duration: 0.6,
          ease: "power2.inOut",
          onComplete: () => setShowGuide(false),
        });
      }
    }, 4000);

    // arrow bounce
    if (arrowRef.current) {
      gsap.fromTo(
        arrowRef.current,
        { y: 0, opacity: 1 },
        { y: 12, repeat: -1, yoyo: true, duration: 0.55, ease: "power1.inOut" }
      );
    }

    // icon pulse
    if (iconRef.current) {
      gsap.fromTo(
        iconRef.current,
        { scale: 1 },
        {
          scale: 1.08,
          repeat: -1,
          yoyo: true,
          duration: 1.4,
          ease: "power1.inOut",
        }
      );
    }

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (openChat && chatBubbleRef.current) {
      gsap.fromTo(
        chatBubbleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }
      );
    }
  }, [openChat]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        openChat &&
        chatBubbleRef.current &&
        !chatBubbleRef.current.contains(e.target as Node) &&
        !iconRef.current?.contains(e.target as Node)
      ) {
        setOpenChat(false);
      }
    };
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [openChat]);

  // ✅ Instead of returning early, conditionally hide inside JSX
  const shouldHide =
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/order-success") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/order-failed");

  if (shouldHide) return null; // ✅ safe return AFTER all hooks

  return (
    <>
      {/* Guide bubble */}
      {showGuide && (
        <div
          ref={guideGroupRef}
          className="fixed bottom-[100px] right-[-10px] z-[9999] flex flex-col items-center"
        >
          <div
            ref={bubbleRef}
            className="bg-black text-white text-xs px-4 py-2 mb-2 rounded-lg shadow-lg opacity-95"
          >
            Talk to us for customization!
          </div>

          <div
            ref={arrowRef}
            className="text-3xl select-none"
            style={{
              transform: "rotate(-25deg)",
              transformOrigin: "center",
            }}
          >
            👇
          </div>
        </div>
      )}

      {/* Chat bubble */}
      {openChat && (
        <div
          ref={chatBubbleRef}
          className="fixed bottom-28 right-6 w-64 bg-white rounded-2xl shadow-xl p-4 border border-gray-200 z-[9999]"
        >
          <p className="text-gray-800 text-sm font-medium">
            Hi! 👋
            <br />
            Need help with customization?
          </p>

          <button
            className="mt-4 w-full bg-[#25D366] text-white font-semibold py-2 rounded-full hover:bg-[#1ebe5d] transition"
            onClick={() => window.open("https://wa.me/919606239247", "_blank")}
          >
            Chat with us
          </button>
        </div>
      )}

      {/* WhatsApp Floating Button */}
      <div
        ref={iconRef}
        className="fixed bottom-6 right-6 z-[9999] cursor-pointer"
        onClick={() => setOpenChat((prev) => !prev)}
      >
        <div className="bg-[#25D366] w-16 h-16 rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform">
          <Image
            src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
            alt="WhatsApp"
            width={34}
            height={34}
            className="drop-shadow-lg"
          />
        </div>
      </div>
    </>
  );
}
