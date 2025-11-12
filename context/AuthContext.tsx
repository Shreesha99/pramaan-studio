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
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  User,
  UserCredential,
} from "firebase/auth";
import { useToast } from "./ToastContext";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  showAuthModal: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: () => Promise<UserCredential>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { showToast } = useToast();

  // Initialize persistence once
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch((err) =>
      console.warn("[Auth] setPersistence failed:", err)
    );
  }, []);

  // Utility: safe serializable user object
  const safeUserObj = (u: User | null) =>
    u
      ? {
          uid: u.uid,
          email: u.email ?? null,
          displayName: u.displayName ?? null,
          photoURL: u.photoURL ?? null,
        }
      : null;

  // Write small user token to localStorage (called on local auth change)
  const writeLocalAuth = (u: User | null) => {
    try {
      if (u) {
        localStorage.setItem("pramaan_user", JSON.stringify(safeUserObj(u)));
        // small sync token to trigger storage event across tabs
        localStorage.setItem("auth-sync", Date.now().toString());
      } else {
        localStorage.removeItem("pramaan_user");
        localStorage.setItem("auth-sync", Date.now().toString());
      }
    } catch (err) {
      console.warn("[Auth] localStorage write failed:", err);
    }
  };

  // listen to Firebase auth state changes (single listener)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        writeLocalAuth(firebaseUser);
      } else {
        setUser(null);
        writeLocalAuth(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Cross-tab: BroadcastChannel (if available) + localStorage fallback
  useEffect(() => {
    let bc: BroadcastChannel | null = null;

    const handleBroadcast = async (msg: any) => {
      if (!msg) return;
      const { type, user: serializedUser } = msg;
      if (type === "LOGIN") {
        // setUser from auth.currentUser if available else use serializedUser
        // Prefer auth.currentUser so Firebase internals are consistent
        if (auth.currentUser) {
          setUser(auth.currentUser);
        } else if (serializedUser) {
          // set minimal placeholder (UI will update once Firebase rehydrates)
          try {
            // If we only have serialized user, create a fake minimal object for UI until auth.currentUser is ready
            setUser((prev) => {
              // keep prev if already set
              return prev ?? ({ uid: serializedUser.uid } as any);
            });
          } catch {}
        }
      } else if (type === "LOGOUT") {
        setUser(null);
      } else if (type === "SYNC") {
        // forced sync — read localStorage.pramaan_user
        try {
          const raw = localStorage.getItem("pramaan_user");
          if (raw) {
            const parsed = JSON.parse(raw);
            // we can't construct a full Firebase User; prefer to ask Firebase for currentUser
            if (auth.currentUser) setUser(auth.currentUser);
            else {
              // temporarily set placeholder; onAuthStateChanged will correct it
              setUser((prev) => prev ?? ({ uid: parsed.uid } as any));
            }
          } else {
            setUser(null);
          }
        } catch (err) {
          console.warn("[Auth] SYNC parse error:", err);
        }
      }
    };

    // Try BroadcastChannel first
    try {
      bc = new BroadcastChannel("pramaan_auth");
      bc.onmessage = (ev) => {
        handleBroadcast(ev.data);
      };
    } catch (err) {
      // BroadcastChannel not available; we'll rely on storage events
      bc = null;
    }

    // Storage event fallback
    const storageHandler = (ev: StorageEvent) => {
      if (!ev.key) return;
      if (ev.key === "auth-sync" || ev.key === "pramaan_user") {
        // read latest pramaan_user
        try {
          const raw = localStorage.getItem("pramaan_user");
          if (raw) {
            const parsed = JSON.parse(raw);
            // prefer firebase auth.currentUser if present
            if (auth.currentUser) setUser(auth.currentUser);
            else setUser((prev) => prev ?? ({ uid: parsed.uid } as any));
          } else {
            setUser(null);
          }
        } catch (err) {
          console.warn("[Auth] storageHandler error:", err);
        }
      }
    };

    window.addEventListener("storage", storageHandler);

    return () => {
      window.removeEventListener("storage", storageHandler);
      if (bc) bc.close();
    };
  }, []);

  // login (popup) — broadcasts only small serializable payload via BroadcastChannel/localStorage
  const login = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      await setPersistence(auth, browserLocalPersistence);
      const result = await signInWithPopup(auth, provider);

      // result.user will be handled by onAuthStateChanged listener,
      // but we also proactively broadcast a small message for speed
      const small = safeUserObj(result.user);

      try {
        const bc = new BroadcastChannel("pramaan_auth");
        bc.postMessage({ type: "LOGIN", user: small });
        bc.close();
      } catch {
        // fallback to localStorage sync token
        try {
          localStorage.setItem("pramaan_user", JSON.stringify(small));
          localStorage.setItem("auth-sync", Date.now().toString());
        } catch {}
      }

      // ✅ return result so AuthModal can check if new user
      return result;
    } catch (err: any) {
      console.error("[Auth] login error:", err);
      showToast(
        err?.code === "auth/popup-closed-by-user"
          ? "Sign-in popup closed."
          : "Google login failed.",
        "error"
      );
      throw err;
    }
  };

  // logout
  const logout = async () => {
    try {
      await signOut(auth);

      showToast("Logged out successfully!", "info");

      const small = null;
      try {
        const bc = new BroadcastChannel("pramaan_auth");
        bc.postMessage({ type: "LOGOUT", user: small });
        bc.close();
      } catch {
        try {
          localStorage.removeItem("pramaan_user");
          localStorage.setItem("auth-sync", Date.now().toString());
        } catch {}
      }
    } catch (err) {
      console.error("[Auth] logout failed:", err);
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
