"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

// ✅ Reliable 1920x1080 Unsplash images (direct IDs, no weird params)
const heroImages = [
  "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1920&h=1080&q=80",
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1920&h=1080&q=80",
  "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1920&h=1080&q=80",
  "https://images.unsplash.com/photo-1514995428455-447d4443fa7f?auto=format&fit=crop&w=1920&h=1080&q=80",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1920&h=1080&q=80",
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

  useEffect(() => {
    const l1 = line1Ref.current;
    const l2 = line2Ref.current;
    const l3 = line3Ref.current;

    if (!l1 || !l2 || !l3) return;

    const lines = [
      { el: l1, text: "Create.", color: "#FFFFFF" },
      { el: l2, text: "Customize.", color: "#b69253" },
      { el: l3, text: "Express.", color: "#146032" },
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
        className="fixed z-[70] top-0 left-0 w-20 h-20 rounded-full bg-black text-white 
                   flex items-center justify-center text-[16px]
                   pointer-events-none opacity-0 scale-0"
      >
        Scroll
        <br />
        Down
      </div>

      {/* 🔥 Scrolling Strip */}
      <div className="absolute top-0 left-0 w-full bg-black text-white py-3 sm:py-4 overflow-hidden z-[6] shadow-md">
        <div
          ref={tickerRef}
          className="flex whitespace-nowrap font-semibold text-sm sm:text-lg uppercase tracking-widest gap-20 px-10 opacity-90"
        >
          {[
            "✦ New Drop Every Month",
            "✦ Exclusive Streetwear Arrivals",
            "✦ Limited Collections",
            "✦ Don’t Miss Out",
          ].map((text, i) => (
            <span key={i}>{text}</span>
          ))}
          {[
            "✦ New Drop Every Month",
            "✦ Exclusive Streetwear Arrivals",
            "✦ Limited Collections",
            "✦ Don’t Miss Out",
          ].map((text, i) => (
            <span key={i + 4}>{text}</span>
          ))}
        </div>
        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black via-black/70 to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black via-black/70 to-transparent pointer-events-none" />
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
      <div className="absolute bottom-20 left-10 z-[3] pointer-events-none">
        <h1 className="uppercase font-extrabold tracking-tight leading-[0.9] space-y-3">
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
    </section>
  );
}
