import Link from "next/link";
import { gsap } from "gsap";

export default function ShopNowButton() {
  return (
    <Link href="/products" className="no-underline">
      <button
        ref={(el) => {
          if (!el) return;
          const arrow = el.querySelector(".arrow-icon");

          // GSAP Hover Animation
          el.addEventListener("mouseenter", () => {
            gsap.to(arrow, {
              rotate: 0,
              duration: 0.3,
              ease: "power3.out",
            });
          });

          el.addEventListener("mouseleave", () => {
            gsap.to(arrow, {
              rotate: 45,
              duration: 0.3,
              ease: "power3.out",
            });
          });
        }}
        className="group flex items-center gap-3 px-8 py-3 rounded-full font-semibold text-base 
                   bg-white text-black border border-black transition-all duration-300
                   hover:bg-black hover:text-white shadow-lg hover:shadow-2xl"
      >
        <span>Shop Now</span>

        <svg
          className="arrow-icon w-5 h-5 transition-transform duration-300"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ rotate: "45deg" }}
        >
          <path
            d="M5 19L19 5M19 5H9M19 5V15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </Link>
  );
}
