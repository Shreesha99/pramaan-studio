"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import { gsap } from "gsap";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContextType {
  showToast: (message: string, type?: Toast["type"]) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const lastToastRef = useRef<{ message: string; timestamp: number } | null>(
    null
  );

  const showToast = (message: string, type: Toast["type"] = "success") => {
    const now = Date.now();

    // 🧠 Avoid spamming same toast within 500ms
    if (
      lastToastRef.current &&
      lastToastRef.current.message === message &&
      now - lastToastRef.current.timestamp < 500
    ) {
      return;
    }

    lastToastRef.current = { message, timestamp: now };

    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    // 🎉 Confetti trigger if it's the new-user toast
    if (type === "success" && message.includes("Welcome to PraMaan")) {
      // Delay slightly so confetti appears where toast is rendered
      setTimeout(() => {
        const toastEl = document.getElementById(`toast-${id}`);
        if (toastEl) {
          const rect = toastEl.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          triggerConfetti(centerX, centerY);
        }
      }, 150);
    }

    // Auto remove after 3 seconds
    setTimeout(() => removeToast(id), 3000);
  };

  const removeToast = (id: number) => {
    gsap.to(`#toast-${id}`, {
      y: 40,
      opacity: 0,
      duration: 0.4,
      ease: "power3.inOut",
      onComplete: () => setToasts((prev) => prev.filter((t) => t.id !== id)),
    });
  };

  // Animate new toasts without overlap
  useEffect(() => {
    if (toasts.length > 0) {
      gsap.fromTo(
        ".toast-item:last-child",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          ease: "power3.out",
        }
      );
    }
  }, [toasts]);

  const getIcon = (type: Toast["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case "error":
        return <ExclamationCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-blue-500" />;
    }
  };

  // 🎉 Confetti animation for new users
  const triggerConfetti = (x: number, y: number) => {
    const colors = ["#FFC700", "#FF0000", "#2E3192", "#41BBC7", "#7F00FF"];
    const numParticles = 20;
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "0";
    container.style.top = "0";
    container.style.pointerEvents = "none";
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.overflow = "hidden";
    container.style.zIndex = "10000";
    document.body.appendChild(container);

    for (let i = 0; i < numParticles; i++) {
      const el = document.createElement("div");
      el.style.position = "absolute";
      el.style.width = "6px";
      el.style.height = "10px";
      el.style.backgroundColor =
        colors[Math.floor(Math.random() * colors.length)];
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.borderRadius = "2px";
      container.appendChild(el);

      const dx = gsap.utils.random(-120, 120);
      const dy = gsap.utils.random(-180, -60);
      const rot = gsap.utils.random(0, 720);

      gsap.to(el, {
        x: dx,
        y: dy,
        rotation: rot,
        duration: gsap.utils.random(1.2, 1.8),
        ease: "power3.out",
        opacity: 0,
        onComplete: () => el.remove(),
      });
    }

    // Remove container after particles are gone
    setTimeout(() => container.remove(), 2000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-3 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            id={`toast-${t.id}`}
            className={`toast-item pointer-events-auto flex items-center gap-3 bg-white shadow-lg rounded-full px-5 py-3 border border-gray-200 min-w-[280px] justify-center`}
          >
            {getIcon(t.type)}
            <span className="text-gray-800 text-sm font-medium">
              {t.message}
            </span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
