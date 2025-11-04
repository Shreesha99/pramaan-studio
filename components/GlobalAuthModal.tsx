"use client";

import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/context/AuthContext";

export default function GlobalAuthModal() {
  const { showAuthModal, closeAuthModal } = useAuth();
  return <AuthModal isOpen={showAuthModal} onClose={closeAuthModal} />;
}
