"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      const isView = document.body.classList.contains("cursor-view");
      const isArrow = (e.target as HTMLElement)?.closest(".no-cursor-zone"); // ✅ detect arrows
      setPosition({ x: e.clientX, y: e.clientY });
      setVisible(isView && !isArrow); // ✅ hide cursor when over arrows
    };

    const enter = () => {
      const isView = document.body.classList.contains("cursor-view");
      setVisible(isView);
    };

    const leave = () => setVisible(false);

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseenter", enter);
    window.addEventListener("mouseleave", leave);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseenter", enter);
      window.removeEventListener("mouseleave", leave);
    };
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 z-[9999] pointer-events-none flex items-center justify-center rounded-full bg-black text-white text-[10px] font-semibold uppercase tracking-wide"
      style={{
        width: 90,
        height: 90,
        x: position.x - 45,
        y: position.y - 45,
        opacity: visible ? 1 : 0,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: visible ? 1 : 0,
        opacity: visible ? 1 : 0,
        transition: { type: "spring", stiffness: 250, damping: 20 },
      }}
    >
      View
      <br />
      Product
    </motion.div>
  );
}
