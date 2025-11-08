import "./globals.css";
import { Poppins } from "next/font/google";
import LenisProvider from "./providers/LenisProvider";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import GlobalAuthModal from "@/components/GlobalAuthModal";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import ScrollToTop from "@/components/ScrollToTop";
import Preloader from "@/components/Preloader";
import FloatingCheckoutButton from "@/components/FloatingCheckoutButton";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "PraMaan",
  description: "Shop the finest fashion collections.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${poppins.className} bg-white text-gray-900 overflow-x-hidden overflow-y-auto overscroll-none`}
      >
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <LenisProvider>
                <Preloader />
                {children}
                <FloatingCheckoutButton />
                <GlobalAuthModal />
                <FloatingWhatsApp />
                <ScrollToTop />
              </LenisProvider>{" "}
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
