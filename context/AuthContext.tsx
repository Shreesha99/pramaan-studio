"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { auth } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { useToast } from "./ToastContext";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  showAuthModal: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { showToast } = useToast();

  // ✅ Load user from Firebase listener — this always runs when auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          setUser(result.user);
          localStorage.setItem("pramaan_user", JSON.stringify(result.user));
        }
      } catch (err) {
        console.error("Google redirect error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ✅ Fallback: restore user from localStorage in case Firebase is slow to rehydrate
  useEffect(() => {
    const saved = localStorage.getItem("pramaan_user");
    if (saved && !user) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed);
      } catch {
        localStorage.removeItem("pramaan_user");
      }
    }
  }, [user]);

  // 🔹 Login via redirect
  const login = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    await signInWithRedirect(auth, provider);
  };

  // 🔹 Logout
  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("pramaan_user");
      setUser(null);
      showToast("Logged out successfully.", "success");
    } catch (err) {
      console.error("Logout error:", err);
      showToast("Logout failed. Please try again.", "error");
    }
  };

  const openAuthModal = () => setShowAuthModal(true);
  const closeAuthModal = () => setShowAuthModal(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        showAuthModal,
        openAuthModal,
        closeAuthModal,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
