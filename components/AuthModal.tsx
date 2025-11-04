"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { gsap } from "gsap";
import { XMarkIcon } from "@heroicons/react/24/outline";
import ErrorText from "@/components/ErrorText";

export default function AuthModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmation, setConfirmation] = useState<any>(null);
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  // Animate modal
  useEffect(() => {
    if (isOpen && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, ease: "power3.out" }
      );
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || typeof window === "undefined" || !auth) return;

    const initRecaptcha = async () => {
      try {
        // If already exists, reuse
        if ((window as any).recaptchaVerifier) return;

        const verifier = new RecaptchaVerifier(
          auth, // ✅ Auth FIRST for Firebase v10+
          "recaptcha-container",
          {
            size: "invisible",
            callback: (response: any) => {
              console.log("✅ reCAPTCHA solved", response);
            },
            "expired-callback": () => {
              console.warn("⚠️ reCAPTCHA expired, resetting...");
            },
          }
        );

        (window as any).recaptchaVerifier = verifier;

        await verifier.render(); // ✅ ensure it’s fully ready before usage
        console.log("✅ reCAPTCHA initialized successfully");
      } catch (err) {
        console.error("❌ reCAPTCHA setup failed:", err);
      }
    };

    initRecaptcha();
  }, [isOpen]);

  const handlePhoneLogin = async () => {
    setError("");

    if (!phone.match(/^\d{10}$/)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    try {
      setLoading(true);
      const fullPhone = `+91${phone}`;
      const appVerifier = (window as any).recaptchaVerifier;

      if (!appVerifier) {
        setError(
          "Recaptcha is still initializing. Please wait a moment and retry."
        );
        console.warn("⚠️ Tried login before recaptcha ready");
        return;
      }

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        fullPhone,
        appVerifier
      );

      setConfirmation(confirmationResult);
      setStep("otp");
      console.log("📩 OTP sent to", fullPhone);
    } catch (err: any) {
      console.error("OTP Error →", err);
      setError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    if (!otp.trim()) {
      setError("Please enter OTP.");
      return;
    }

    try {
      setLoading(true);
      await confirmation.confirm(otp);
      onClose();
    } catch {
      setError("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      await login();
      onClose();
    } catch {
      setError("Google login failed. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div id="recaptcha-container" className="hidden" />
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl p-6 w-[90%] max-w-sm relative"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black transition"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        <h2 className="text-center text-2xl font-semibold mb-5">Sign In</h2>

        {/* GOOGLE LOGIN */}
        <button
          onClick={handleGoogleLogin}
          className="w-full py-2 bg-black text-white rounded-full font-semibold hover:bg-gray-900 transition mb-3"
        >
          Continue with Google
        </button>

        {/* PHONE LOGIN */}
        {step === "phone" ? (
          <>
            <div className="flex items-center border rounded-full overflow-hidden mb-2">
              <span className="px-3 text-sm font-semibold text-gray-600 bg-gray-100 border-r">
                +91
              </span>
              <input
                type="tel"
                placeholder="Enter 10-digit number"
                value={phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setPhone(value);
                }}
                className="flex-1 px-4 py-2 text-sm outline-none"
              />
            </div>
            <ErrorText message={error} />
            {/* recaptcha container is required even if invisible */}
            <div id="recaptcha-container" />
            <button
              onClick={handlePhoneLogin}
              disabled={loading}
              className="w-full py-2 mt-2 bg-gray-800 text-white rounded-full font-semibold hover:bg-gray-900 transition"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border rounded-full px-4 py-2 text-sm outline-none mb-2"
            />
            <ErrorText message={error} />
            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full py-2 mt-2 bg-gray-800 text-white rounded-full font-semibold hover:bg-gray-900 transition"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
