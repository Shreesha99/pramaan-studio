import "./globals.css";
import { Poppins } from "next/font/google";
import LenisProvider from "./providers/LenisProvider"; // 👈 import the wrapper
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`{${poppins.className}} bg-white text-gray-900`}>
        <ToastProvider>
          <CartProvider>
            <LenisProvider>{children}</LenisProvider>{" "}
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
