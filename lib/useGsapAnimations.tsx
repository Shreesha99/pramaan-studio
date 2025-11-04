"use client";

import { useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useGsapAnimations() {
  useLayoutEffect(() => {
    // HERO ANIMATION
    const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
    heroTl
      .from(".hero-title", { y: 80, opacity: 0, duration: 1 })
      .from(".hero-text", { y: 40, opacity: 0, duration: 0.8 }, "-=0.5")
      .from(
        ".hero-btn",
        { scale: 0.9, opacity: 0, duration: 0.6, ease: "back.out(1.7)" },
        "-=0.4"
      )
      .from(".hero-img", { scale: 0.95, opacity: 0, duration: 1 }, "-=0.8");

    // PARALLAX HERO IMAGE
    gsap.to(".hero-img", {
      yPercent: 15,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero-img",
        start: "top bottom",
        scrub: true,
      },
    });

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

    // BRAND STRIP SLIDE-IN
    gsap.from(".brand-item", {
      x: 60,
      opacity: 0,
      stagger: 0.1,
      duration: 0.8,
      scrollTrigger: {
        trigger: ".brand-strip",
        start: "top 85%",
      },
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
