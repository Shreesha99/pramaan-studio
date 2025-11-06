"use client";

import { useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useGsapAnimations() {
  useLayoutEffect(() => {
    // SECTION REVEALS
    gsap.utils.toArray<HTMLElement>(".reveal-section").forEach((section) => {
      gsap.from(section, {
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        y: 80,
        opacity: 0,
        duration: 1.2,
        ease: "power2.out",
      });
    });

    // PRODUCT CARD STAGGER
    gsap.utils.toArray<HTMLElement>(".product-card").forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: "top 85%",
        },
        y: 60,
        opacity: 0,
        delay: i * 0.1,
        duration: 0.8,
        ease: "power3.out",
      });
    });
  }, []);
}
