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
  const [timer, setTimer] = useState(90);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);

  // ✅ Reset all fields whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setStep("phone");
      setPhone("");
      setOtp("");
      setConfirmation(null);
      setError("");
      setTimer(90);
      setIsResendDisabled(true);
    }
  }, [isOpen]);

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

  // ✅ Correct Recaptcha initialization order
  // Initialize reCAPTCHA fresh every time modal opens
  useEffect(() => {
    if (!isOpen || typeof window === "undefined" || !auth) return;

    // ✅ Destroy old recaptcha
    if ((window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier.clear();
      } catch {}
      (window as any).recaptchaVerifier = null;
    }

    // ✅ Create fresh verifier
    const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
      callback: () => console.log("✅ reCAPTCHA solved"),
      "expired-callback": () => console.warn("⚠️ reCAPTCHA expired"),
    });

    (window as any).recaptchaVerifier = verifier;

    verifier.render().catch((err) => console.error("Render error:", err));
  }, [isOpen]);

  // Countdown logic for resend
  useEffect(() => {
    let interval: any;
    if (isResendDisabled && step === "otp") {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResendDisabled, step]);

  // Send OTP
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
        setError("Recaptcha is still initializing. Please wait a moment.");
        return;
      }

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        fullPhone,
        appVerifier
      );

      setConfirmation(confirmationResult);
      setStep("otp");
      setIsResendDisabled(true);
      setTimer(90);
      console.log("📩 OTP sent to", fullPhone);
    } catch (err: any) {
      console.error("OTP Error →", err);
      setError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
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

  // Resend OTP
  const handleResendOtp = async () => {
    if (!phone) return;
    setError("");
    try {
      setIsResendDisabled(true);
      setTimer(90);
      const fullPhone = `+91${phone}`;
      const appVerifier = (window as any).recaptchaVerifier;
      const newConfirmation = await signInWithPhoneNumber(
        auth,
        fullPhone,
        appVerifier
      );
      setConfirmation(newConfirmation);
      console.log("🔁 OTP resent to", fullPhone);
    } catch (err) {
      console.error("Resend OTP failed:", err);
      setError("Failed to resend OTP. Please try again.");
      setIsResendDisabled(false);
    }
  };

  // Google login
  // Google login (redirect based)
  const handleGoogleLogin = async () => {
    setError("");
    try {
      await login(); // now uses redirect from AuthContext
      onClose(); // modal closes before redirect happens
    } catch {
      setError("Google login failed. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div id="recaptcha-container" className="absolute opacity-0" />
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
        {/* <button
          onClick={handleGoogleLogin}
          className="w-full py-2 bg-black text-white rounded-full font-semibold hover:bg-gray-900 transition mb-3"
        >
          Continue with Google
        </button> */}

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

            {/* Resend OTP Button + Timer */}
            <div className="text-center mt-4 text-xs text-gray-500">
              Didn’t get OTP?{" "}
              <button
                onClick={handleResendOtp}
                disabled={isResendDisabled}
                className={`font-semibold ${
                  isResendDisabled
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-black hover:underline"
                }`}
              >
                Resend OTP
              </button>
              {isResendDisabled && (
                <p className="mt-1 text-gray-400">
                  Resend available in {Math.floor(timer / 60)}:
                  {String(timer % 60).padStart(2, "0")}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
