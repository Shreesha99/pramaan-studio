"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import ShopNowButton from "@/components/ShopNowButton";

const heroImages = [
  "/assets/img/Hoodies-with-Zip/model.png",
  "/assets/img/round-neck/bundle.png",
  "/assets/img/Sweatshirts/model.png",
  "/assets/img/mugs.png",
  "/assets/img/Hoodies/model.png",
];

export default function Hero() {
  const stripRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const line3Ref = useRef<HTMLSpanElement>(null);

  const tickerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const mouseIconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const l1 = line1Ref.current;
    const l2 = line2Ref.current;
    const l3 = line3Ref.current;

    if (!l1 || !l2 || !l3) return;

    const lines = [
      { el: l1, text: "Create.", color: "#000000", bg: "#FFFFFF" }, // white bg, black text
      { el: l2, text: "Customize.", color: "#FFFFFF", bg: "#b69253" }, // gold bg, white text
      { el: l3, text: "Express.", color: "#FFFFFF", bg: "#146032" }, // green bg, white text
    ];

    const typeLine = (el: HTMLElement, text: string, duration = 0.05) =>
      new Promise<void>((resolve) => {
        const obj = { i: 0 };
        el.textContent = "";
        gsap.to(obj, {
          i: text.length,
          duration: text.length * duration,
          ease: "none",
          onUpdate: () => {
            el.textContent = text.slice(0, obj.i);
          },
          onComplete: resolve,
        });
      });

    const eraseAll = () =>
      new Promise<void>((resolve) => {
        const total = lines.reduce((max, l) => Math.max(max, l.text.length), 0);
        const obj = { i: total };

        gsap.to(obj, {
          i: 0,
          duration: total * 0.04,
          ease: "none",
          onUpdate: () => {
            lines.forEach(
              (l) =>
                (l.el.textContent = l.el.textContent?.slice(0, obj.i) ?? "")
            );
          },
          onComplete: () => {
            lines.forEach((l) => (l.el.textContent = ""));
            resolve();
          },
        });
      });

    const run = async () => {
      while (true) {
        for (let line of lines) {
          line.el.style.color = line.color;
          line.el.style.backgroundColor = line.bg;
          line.el.style.padding = "0px 12px ";
          await typeLine(line.el, line.text);
          await new Promise((res) => setTimeout(res, 300));
        }

        await new Promise((res) => setTimeout(res, 500));
        await eraseAll();
        await new Promise((res) => setTimeout(res, 300));
      }
    };

    run();
  }, []);

  // --- FIX 1: Marquee / Ticker animation (must be inside useEffect)
  useEffect(() => {
    const ticker = tickerRef.current;
    if (!ticker) return;

    // duplicate content once
    const original = ticker.innerHTML;
    ticker.innerHTML = original + original;

    const totalWidth = ticker.scrollWidth / 2;
    const tween = gsap.to(ticker, {
      x: `-=${totalWidth}`,
      duration: 30,
      ease: "none",
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize((x: string) => parseFloat(x) % -totalWidth),
      },
    });

    const pause = () => gsap.globalTimeline.pause();
    const resume = () => gsap.globalTimeline.resume();
    ticker.addEventListener("mouseenter", pause);
    ticker.addEventListener("mouseleave", resume);

    return () => {
      tween.kill();
      ticker.removeEventListener("mouseenter", pause);
      ticker.removeEventListener("mouseleave", resume);
      // restore original to avoid exponential duplication on remounts
      ticker.innerHTML = original;
    };
  }, []);

  // --- Typing animation (kept as-is)
  useEffect(() => {
    const el = titleRef.current;
    const caret = caretRef.current;
    if (!el || !caret) return;

    const phrases = ["Discover", "Clothes", "Unique Style"];
    let phraseIndex = 0;

    const type = (text: string, onDone: () => void) => {
      const obj = { i: 0 };
      el.textContent = "";
      gsap.to(obj, {
        i: text.length,
        duration: Math.max(0.8, text.length * 0.06),
        ease: "none",
        onUpdate: () => {
          el.textContent = text.slice(0, Math.floor(obj.i));
        },
        onComplete: onDone,
      });
    };

    const erase = (onDone: () => void) => {
      const current = el.textContent || "";
      const obj = { i: current.length };
      gsap.to(obj, {
        i: 0,
        duration: Math.max(0.6, current.length * 0.04),
        ease: "none",
        onUpdate: () => {
          el.textContent = current.slice(0, Math.floor(obj.i));
        },
        onComplete: onDone,
      });
    };

    const blink = gsap.to(caret, {
      opacity: 0,
      duration: 0.6,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
    });

    let killed = false;
    const loop = () => {
      if (killed) return;
      const text = phrases[phraseIndex % phrases.length];
      type(text, () => {
        gsap.delayedCall(0.8, () => {
          erase(() => {
            phraseIndex += 1;
            gsap.delayedCall(0.2, loop);
          });
        });
      });
    };
    loop();

    return () => {
      killed = true;
      blink.kill();
    };
  }, []);

  // --- Image strip expand/collapse autoplay (unchanged)
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;

    const panels = Array.from(strip.querySelectorAll<HTMLElement>(".panel"));

    // initial sizes
    panels.forEach((p) => {
      p.style.flexBasis = "20vw";
      p.style.flexGrow = "0";
      p.style.flexShrink = "0";
      p.style.minWidth = "0";
    });

    const EXPANDED = 50; // vw
    const OTHERS = (100 - EXPANDED) / (panels.length - 1);

    let current = 0;
    const goTo = (idx: number) => {
      panels.forEach((p, i) => {
        gsap.to(p, {
          flexBasis: i === idx ? `${EXPANDED}vw` : `${OTHERS}vw`,
          duration: 1.0,
          ease: "power3.inOut",
        });
        const img = p.querySelector(".panel-img") as HTMLElement | null;
        if (img) {
          gsap.to(img, {
            scale: i === idx ? 1.05 : 1.0,
            duration: 1.0,
            ease: "power3.inOut",
          });
        }
        const shade = p.querySelector(".shade") as HTMLElement | null;
        if (shade) {
          gsap.to(shade, {
            opacity: i === idx ? 0.0 : 0.25,
            duration: 1.0,
            ease: "power3.inOut",
          });
        }
      });
    };

    const ticker = gsap.timeline({ repeat: -1 });
    goTo(current);
    ticker.call(() => {
      current = (current + 1) % panels.length;
      goTo(current);
    });
    ticker.to({}, { duration: 2.6 });

    panels.forEach((p, i) => {
      const onEnter = () => {
        current = i;
        goTo(current);
      };
      p.addEventListener("mouseenter", onEnter);
      // cleanup per-panel listeners
      (p as any)._onEnter = onEnter;
    });

    return () => {
      ticker.kill();
      panels.forEach((p) => {
        const onEnter = (p as any)._onEnter as (() => void) | undefined;
        if (onEnter) p.removeEventListener("mouseenter", onEnter);
      });
    };
  }, []);

  useEffect(() => {
    if (!mouseIconRef.current) return;

    gsap.to(mouseIconRef.current, {
      y: 4,
      duration: 0.8,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
    });
  }, []);

  // --- FIX 2: Custom cursor that replaces default inside the section
  useEffect(() => {
    const cursor = cursorRef.current;
    const section = sectionRef.current;
    if (!cursor || !section) return;

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const mouse = { x: pos.x, y: pos.y };

    const xSet = gsap.quickSetter(cursor, "x", "px");
    const ySet = gsap.quickSetter(cursor, "y", "px");

    const move = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    gsap.ticker.add(() => {
      pos.x += (mouse.x - pos.x) * 0.15;
      pos.y += (mouse.y - pos.y) * 0.15;
      // center 40px (half of 80px cursor)
      xSet(pos.x - 40);
      ySet(pos.y - 40);
    });

    const onEnter = () => {
      gsap.to(cursor, {
        opacity: 1,
        scale: 1,
        duration: 0.2,
        ease: "power2.out",
      });
      document.body.style.cursor = "none";
    };
    const onLeave = () => {
      gsap.to(cursor, {
        opacity: 0,
        scale: 0.7,
        duration: 0.2,
        ease: "power2.out",
      });
      document.body.style.cursor = "auto";
    };

    section.addEventListener("mousemove", move);
    section.addEventListener("mouseenter", onEnter);
    section.addEventListener("mouseleave", onLeave);

    return () => {
      section.removeEventListener("mousemove", move);
      section.removeEventListener("mouseenter", onEnter);
      section.removeEventListener("mouseleave", onLeave);
      document.body.style.cursor = "auto";
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-screen h-screen overflow-hidden"
    >
      {/* Custom Black Cursor (visible on all sizes; acts as cursor inside section) */}
      <div
        ref={cursorRef}
        className="hero-cursor fixed z-70 top-0 left-0 h-20 w-auto bg-black text-white 
             flex items-center justify-center 
             pointer-events-none opacity-0 scale-0 p-2 rounded-full"
      >
        <div ref={mouseIconRef}>
          <svg
            width="50"
            height="50"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            transform="rotate(0 0 0)"
          >
            <path
              d="M11.4698 16.2776C11.7626 16.5702 12.2372 16.5702 12.5301 16.2776L14.7801 14.0291C15.0731 13.7363 15.0733 13.2614 14.7805 12.9684C14.4877 12.6754 14.0129 12.6753 13.7199 12.9681L11.9999 14.6868L10.2802 12.9681C9.98718 12.6753 9.5123 12.6754 9.2195 12.9684C8.9267 13.2614 8.92685 13.7363 9.21984 14.0291L11.4698 16.2776Z"
              fill="#ffffff"
            />
            <path
              d="M12 9.05488C11.5582 9.05488 11.2 8.69671 11.2 8.25488C11.2 7.81306 11.5582 7.45478 12 7.45478C12.4418 7.45478 12.8 7.81295 12.8 8.25478C12.8 8.69661 12.4418 9.05488 12 9.05488Z"
              fill="#ffffff"
            />
            <path
              d="M11.2 11.0713C11.2 11.5131 11.5582 11.8713 12 11.8713C12.4418 11.8713 12.8 11.5131 12.8 11.0713C12.8 10.6295 12.4418 10.2712 12 10.2712C11.5582 10.2712 11.2 10.6295 11.2 11.0713Z"
              fill="#ffffff"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2.00098C7.85786 2.00098 4.5 5.35884 4.5 9.50098V14.501C4.5 18.6431 7.85786 22.001 12 22.001C16.1421 22.001 19.5 18.6431 19.5 14.501V9.50098C19.5 5.35884 16.1421 2.00098 12 2.00098ZM6 9.50098C6 6.18727 8.68629 3.50098 12 3.50098C15.3137 3.50098 18 6.18727 18 9.50098V14.501C18 17.8147 15.3137 20.501 12 20.501C8.68629 20.501 6 17.8147 6 14.501V9.50098Z"
              fill="#ffffff"
            />
          </svg>
        </div>
      </div>

      {/* 🔥 Scrolling Strip */}
      <div className="absolute top-0 left-0 w-full bg-black text-white py-3 sm:py-4 overflow-hidden z-6 shadow-md">
        <div
          ref={tickerRef}
          className="flex whitespace-nowrap font-semibold text-sm sm:text-lg uppercase tracking-widest gap-20 px-10 opacity-90"
        >
          {[
            "✦ New Drop Every Month ✦",
            "✦ Exclusive Clothing Arrivals ✦",
            "✦ Unique Apparels ✦",
            "✦ Limited Collections ✦",
            "✦ Don’t Miss Out ✦",
          ].map((text, i) => (
            <span key={i}>{text}</span>
          ))}
          {[
            "✦ New Drop Every Month ✦",
            "✦ Exclusive Clothing Arrivals ✦",
            "✦ Unique Apparels ✦",
            "✦ Limited Collections ✦",
            "✦ Don’t Miss Out ✦",
          ].map((text, i) => (
            <span key={i + 4}>{text}</span>
          ))}
        </div>
        <div className="absolute inset-y-0 left-0 w-20 bg-linear-to-r from-black via-black/70 to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-20 bg-linear-to-l from-black via-black/70 to-transparent pointer-events-none" />
      </div>

      {/* Image strip */}
      <div
        ref={stripRef}
        className="absolute inset-0 flex overflow-x-hidden"
        style={{ willChange: "transform" }}
      >
        {heroImages.map((src, i) => (
          <div key={i} className="panel relative h-220 overflow-hidden">
            <Image
              src={src}
              alt={`Hero ${i + 1}`}
              fill
              sizes="400px"
              priority={i === 0}
              className="panel-img object-cover"
            />
            <div
              className="shade absolute inset-0 bg-black pointer-events-none"
              style={{ opacity: 0.25 }}
            />
          </div>
        ))}
      </div>

      {/* Typing title (no glow, clean) */}
      <div className="absolute bottom-20 left-0 sm:left-10 sm:bottom-30 inset-0 flex flex-col justify-center items-center sm:inset-auto sm:block z-3 pointer-events-none">
        <h1
          className="
      uppercase font-extrabold tracking-tight leading-[0.9] space-y-3 text-center sm:text-left"
        >
          <div className="text-[2.5rem] sm:text-[8rem]">
            <span ref={line1Ref}></span>
          </div>
          <div className="text-[2.5rem] sm:text-[8rem]">
            <span ref={line2Ref}></span>
          </div>
          <div className="text-[2.5rem] sm:text-[8rem]">
            <span ref={line3Ref}></span>
          </div>
        </h1>
      </div>
      <div className="absolute bottom-30 right-25 sm:bottom-30 sm:right-40 z-30 pointer-cursor">
        <ShopNowButton />
      </div>
    </section>
  );
}
