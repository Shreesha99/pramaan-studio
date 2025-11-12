"use client";

import Image, { StaticImageData } from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { SparklesIcon } from "@heroicons/react/24/solid";

interface ProfileSlide {
  username: string;
  name: string;
  bio: string;
  img: string | StaticImageData;
  link: string;
}

export default function InstagramShowcaseMobile() {
  const profile: ProfileSlide = {
    username: "pramaan_print_studio",
    name: "PraMaan Print Studio",
    bio: "Custom Apparel • Branding • Merch\n🎨 We bring your ideas to life.\n📍Bangalore, India",
    img: "/assets/img/logo.jpg",
    link: "https://www.instagram.com/pramaan_print_studio/",
  };

  return (
    <section
      id="instagram-showcase-mobile"
      className="block md:hidden relative w-screen items-center justify-center bg-[#fafafa] px-6 py-20"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative flex flex-col items-center text-center bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        {/* 🌈 Soft Gradient Background Glow */}
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

        {/* 🖼️ Profile Image */}
        <div className="relative z-10 flex flex-col items-center">
          <Image
            src={profile.img}
            alt={profile.username}
            width={150}
            height={150}
            className="rounded-full border-4 border-pink-500 shadow-lg object-cover mb-4"
          />
        </div>

        {/* 🧠 Profile Info */}
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-center gap-2">
            <SparklesIcon className="w-5 h-5 text-pink-500 animate-pulse" />
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              {profile.name}
            </h2>
          </div>
          <p className="text-gray-600 whitespace-pre-line leading-relaxed text-base">
            {profile.bio}
          </p>
          <Link
            href={profile.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-linear-to-r from-pink-500 to-yellow-500 text-white font-semibold px-6 py-3 rounded-full hover:opacity-90 transition-all shadow-md mt-4"
          >
            Follow on Instagram →
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
