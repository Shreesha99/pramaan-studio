"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { gsap } from "gsap";
import { XMarkIcon } from "@heroicons/react/24/outline";
import ErrorText from "@/components/ErrorText";
import { useToast } from "@/context/ToastContext";

export default function AuthModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { login } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<"phone" | "otp" | "email">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(90);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);

  /* ✅ Reset on Open */
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  /* ✅ Animate Modal */
  useEffect(() => {
    if (isOpen && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35, ease: "power3.out" }
      );
    }
  }, [isOpen]);

  /* ✅ Setup reCAPTCHA for Phone Login */
  useEffect(() => {
    if (!isOpen || typeof window === "undefined" || !auth) return;

    if ((window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier.clear();
      } catch {}
      (window as any).recaptchaVerifier = null;
    }

    const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
      "expired-callback": () => console.warn("⚠️ reCAPTCHA expired"),
    });

    (window as any).recaptchaVerifier = verifier;
    verifier.render().catch((err) => console.error("Render error:", err));
  }, [isOpen]);

  /* ✅ Countdown for OTP resend */
  useEffect(() => {
    let interval: any;
    if (isResendDisabled && mode === "otp") {
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
  }, [isResendDisabled, mode]);

  /* ✅ Reset all fields */
  const resetForm = () => {
    setMode("phone");
    setPhone("");
    setOtp("");
    setEmail("");
    setPassword("");
    setConfirmation(null);
    setError("");
    setTimer(90);
    setIsResendDisabled(true);
  };

  /* ✅ Reset error on tab switch */
  const handleModeChange = (newMode: "phone" | "email") => {
    setMode(newMode);
    setError("");
    setPhone("");
    setOtp("");
    setEmail("");
    setPassword("");
  };

  /* ✅ Phone Login (Send OTP) */
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
      if (!appVerifier) throw new Error("Recaptcha not ready");

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        fullPhone,
        appVerifier
      );
      setConfirmation(confirmationResult);
      setMode("otp");
      setIsResendDisabled(true);
      setTimer(90);
    } catch (err) {
      console.error("OTP Error:", err);
      setError("Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ✅ Verify OTP */
  const handleVerifyOtp = async () => {
    setError("");
    if (!otp || otp.length !== 6) {
      setError("Enter the 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);
      await confirmation.confirm(otp);
      showToast("Welcome back!", "success");
      onClose();
    } catch {
      setError("Invalid OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ✅ Resend OTP */
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
    } catch (err) {
      console.error("Resend Error:", err);
      setError("Resend failed. Try again.");
      setIsResendDisabled(false);
    }
  };

  /* ✅ Google Login */
  const handleGoogleLogin = async () => {
    setError("");
    try {
      await login();
      showToast("Welcome back!", "success");
      onClose();
    } catch {
      setError("Google login failed.");
    }
  };

  /* ✅ Email + Password Login/Register */
  const handleEmailPasswordLogin = async () => {
    setError("");

    if (!email || !email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Try to sign in
      await signInWithEmailAndPassword(auth, email, password);
      showToast("Welcome back!", "success");
      onClose();
    } catch (err: any) {
      console.error("Email sign-in error:", err);

      // Handle wrong password or deleted user (Firebase merged both)
      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/wrong-password"
      ) {
        try {
          // 2️⃣ Check if user exists in Firebase
          const methods = await fetchSignInMethodsForEmail(auth, email);

          if (methods.length > 0) {
            // Existing user, wrong password
            setError("Incorrect password. Please try again.");
            setLoading(false);
            return;
          } else {
            // Deleted/non-existent user → create new one
            await createUserWithEmailAndPassword(auth, email, password);
            showToast(
              "Welcome to PraMaan! Account created successfully.",
              "success"
            );
            onClose();
            return;
          }
        } catch (checkErr) {
          console.warn("fetchSignInMethodsForEmail failed:", checkErr);
          setError(
            "Something went wrong verifying this email. Try again later."
          );
          setLoading(false);
          return;
        }
      }

      // If user not found explicitly
      if (err.code === "auth/user-not-found") {
        await createUserWithEmailAndPassword(auth, email, password);
        showToast(
          "Welcome to PraMaan! Account created successfully.",
          "success"
        );
        onClose();
        return;
      }

      if (err.code === "auth/invalid-email") {
        setError("Invalid email format. Please enter a correct one.");
        setLoading(false);
        return;
      }

      // Generic fallback
      setError("Login failed. Please try again later.");
    } finally {
      setLoading(false);
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
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black transition"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        <h2 className="text-center text-2xl font-semibold mb-5">Sign In</h2>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-4 text-sm font-semibold">
          {["phone", "email"].map((m) => (
            <button
              key={m}
              onClick={() => handleModeChange(m as any)}
              className={`px-3 py-1 mx-1 rounded-full ${
                mode === m
                  ? "bg-black text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {m === "phone" ? "Phone" : "Email"}
            </button>
          ))}
        </div>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          className="w-full py-2 bg-black text-white rounded-full font-semibold hover:bg-gray-900 transition mb-3"
        >
          Continue with Google
        </button>

        {/* Phone Login */}
        {mode === "phone" && (
          <>
            <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden shadow-sm mb-3">
              <div className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold border-r border-gray-300">
                +91
              </div>
              <input
                type="tel"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                className="flex-1 px-4 py-2 text-gray-800 text-sm focus:outline-none"
              />
            </div>
            <ErrorText message={error} />
            <GsapButton
              text="Send OTP"
              loadingText="Sending..."
              loading={loading}
              disabled={phone.length !== 10}
              onClick={handlePhoneLogin}
            />
          </>
        )}

        {/* OTP Verification */}
        {mode === "otp" && (
          <>
            <OTPInput otp={otp} setOtp={setOtp} length={6} />
            <ErrorText message={error} />
            <GsapButton
              text="Verify OTP"
              loadingText="Verifying..."
              loading={loading}
              disabled={otp.length !== 6}
              onClick={handleVerifyOtp}
            />
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
                  Resend in {Math.floor(timer / 60)}:
                  {String(timer % 60).padStart(2, "0")}
                </p>
              )}
            </div>
          </>
        )}

        {/* Email Login */}
        {mode === "email" && (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl mb-3 text-sm"
            />
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl mb-3 text-sm"
            />
            <ErrorText message={error} />
            <GsapButton
              text="Continue"
              loadingText="Processing..."
              loading={loading}
              disabled={!email || !password}
              onClick={handleEmailPasswordLogin}
            />
          </>
        )}
      </div>
    </div>
  );
}

/* ✅ GSAP Animated Button */
function GsapButton({
  text,
  loadingText,
  loading,
  disabled,
  onClick,
}: {
  text: string;
  loadingText: string;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading) {
      gsap.fromTo(
        bar.current,
        { x: "-100%" },
        { x: "100%", duration: 1.2, ease: "linear", repeat: -1 }
      );
    } else {
      gsap.killTweensOf(bar.current);
      gsap.set(bar.current, { x: "-100%" });
    }
  }, [loading]);

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`relative w-full py-3 mt-3 rounded-xl font-semibold overflow-hidden transition
      ${
        disabled || loading
          ? "bg-gray-300 text-gray-600"
          : "bg-black text-white hover:bg-neutral-900"
      }`}
    >
      <div
        ref={bar}
        className="absolute inset-0 bg-white/20 pointer-events-none"
      />
      <span className="relative z-10">{loading ? loadingText : text}</span>
    </button>
  );
}

/* ✅ OTP Input */
function OTPInput({
  otp,
  setOtp,
  length,
}: {
  otp: string;
  setOtp: (v: string) => void;
  length: number;
}) {
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;
    const updated = otp.substring(0, index) + value + otp.substring(index + 1);
    setOtp(updated);
    if (value && index < length - 1) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e: any, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex gap-3 w-full justify-center my-3">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            if (el) inputs.current[i] = el;
          }}
          type="text"
          maxLength={1}
          value={otp[i] || ""}
          onChange={(e) => handleChange(e.target.value, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className="w-11 h-14 text-center text-xl font-semibold border border-gray-300 rounded-xl focus:ring-1 focus:ring-black"
        />
      ))}
    </div>
  );
}
