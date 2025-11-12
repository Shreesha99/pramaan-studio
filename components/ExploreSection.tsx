"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image, { StaticImageData } from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { SparklesIcon } from "@heroicons/react/24/solid";

gsap.registerPlugin(ScrollTrigger);
gsap.ticker.lagSmoothing(1000, 16);
interface ProfileSlide {
  type: "profile";
  username: string;
  name: string;
  bio: string;
  // followers: string;
  img: string | StaticImageData;
  link: string;
}

interface PostSlide {
  type: "post";
  embed: string;
}

type Slide = ProfileSlide | PostSlide;

export default function InstagramShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const slides: Slide[] = [
    {
      type: "profile",
      username: "pramaan_print_studio",
      name: "PraMaan Print Studio",
      bio: "Custom Apparel • Branding • Merch\n🎨 We bring your ideas to life.\n📍Bangalore, India",
      img: "/assets/img/logo.jpg",
      link: "https://www.instagram.com/pramaan_print_studio/",
    },
    {
      type: "post",
      embed: "https://www.instagram.com/p/DQWAZMoEjVc/embed",
    },
  ];

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const ctx = gsap.context(() => {
      const setup = () => {
        const viewportWidth = window.innerWidth;
        const slideCount = slides.length;
        const slideWidth = viewportWidth;
        const totalWidth = slideCount * slideWidth - viewportWidth;

        // prevent fractional pixel scroll overflow
        const clampedWidth = Math.max(0, Math.floor(totalWidth));

        // Kill existing triggers safely
        ScrollTrigger.getAll().forEach((t) => {
          if (t.vars?.id === "insta-showcase") t.kill(true);
        });
        gsap.killTweensOf(track);

        const tl = gsap.timeline({ defaults: { ease: "none" } });
        tl.to(track, { x: -clampedWidth, duration: 1, immediateRender: false });

        ScrollTrigger.create({
          id: "insta-showcase",
          trigger: section,
          animation: tl,
          pin: true,
          scrub: 0.3,
          anticipatePin: 1,
          start: "top top",
          end: `+=${clampedWidth}`,
          invalidateOnRefresh: true,
          fastScrollEnd: true,
          // markers: true,
        });
      };

      // ✅ Call setup after defining it
      setup();
      ScrollTrigger.refresh();

      // Refresh on resize with debounce
      let resizeTimeout: any;
      const onResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          ScrollTrigger.refresh(true);
        }, 200);
      };
      window.addEventListener("resize", onResize);

      return () => {
        window.removeEventListener("resize", onResize);
        ScrollTrigger.getById("insta-showcase")?.kill(true);
      };
    }, section);

    return () => {
      try {
        ctx.revert();
        ScrollTrigger.getById("insta-showcase")?.kill(true);
      } catch {
        // Safe fallback — ignore already removed nodes
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="instagram-showcase"
      className="hidden md:block relative w-screen h-svh overflow-hidden bg-[#fafafa]"
    >
      <div
        ref={trackRef}
        className="absolute top-0 left-0 h-svh flex will-change-transform"
        style={{
          width: `${slides.length * 100}vw`,
          transform: "translate3d(0,0,0)",
        }}
      >
        {slides.map((s, i) => (
          <div
            key={i}
            className="w-screen h-full flex items-center justify-center px-6 md:px-20"
          >
            {/* =================== PROFILE SLIDE =================== */}
            {s.type === "profile" && (
              <motion.div
                initial={{ opacity: 0.7, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="relative flex flex-col md:flex-row items-center justify-center gap-10 bg-white/90 p-10 rounded-3xl shadow-2xl max-w-6xl overflow-hidden"
              >
                {/* 🌈 Animated Gradient Glow */}
                <motion.div
                  className="absolute -inset-10 bg-linear-to-r from-pink-400 via-yellow-400 to-purple-500 blur-3xl opacity-20"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />

                {/* Left: Profile Image */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 120 }}
                  className="relative z-10 flex flex-col items-center"
                >
                  <Image
                    src={s.img}
                    alt={s.username}
                    width={220}
                    height={220}
                    className="rounded-full border-4 border-pink-500 shadow-lg object-cover"
                  />
                  {/* <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      ease: "easeInOut",
                    }}
                    className="absolute bottom-2 right-0 bg-gradient-to-r from-pink-500 to-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md"
                  >
                    {s.followers}
                  </motion.div> */}
                </motion.div>

                {/* Right: Info */}
                <div className="relative z-10 text-center md:text-left space-y-4 max-w-md">
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <SparklesIcon className="w-5 h-5 text-pink-500 animate-pulse" />
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                      {s.name}
                    </h2>
                  </div>
                  <p className="text-gray-600 whitespace-pre-line leading-relaxed text-base md:text-lg">
                    {s.bio}
                  </p>
                  <Link
                    href={s.link as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-linear-to-r from-pink-500 to-yellow-500 text-white font-semibold px-6 py-3 rounded-full hover:opacity-90 transition-all shadow-md mt-4"
                  >
                    Follow on Instagram →
                  </Link>
                </div>
              </motion.div>
            )}

            {/* =================== POST SLIDE =================== */}
            {s.type === "post" && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden"
              >
                <div className="aspect-4/5 w-full">
                  <iframe
                    loading="lazy"
                    src={s.embed}
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    className="w-full h-full border-none overflow-hidden rounded-2xl"
                    title="Instagram post"
                  ></iframe>
                </div>
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
