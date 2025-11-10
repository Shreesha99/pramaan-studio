"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/formatCurrency";
import { TrashIcon } from "@heroicons/react/24/outline";
import gsap from "gsap";

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [activeImg, setActiveImg] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const { cart, addToCart, increaseQty, decreaseQty, removeFromCart } =
    useCart();
  const { showToast } = useToast();
  const { user, openAuthModal } = useAuth();

  const whatsappRef = useRef<HTMLDivElement>(null);

  // ✅ Load product data
  useEffect(() => {
    const load = async () => {
      const ref = doc(db, "products", id as string);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data() as any;
        setProduct({ id, ...data });

        if (data.hasColors && data.variants) {
          const firstColor = Object.keys(data.variants)[0];
          setSelectedColor(firstColor);
          setActiveImg(data.variants[firstColor]?.images?.[0] || "");
        } else {
          setActiveImg(Array.isArray(data.images) ? data.images[0] : "");
        }
      }
      setLoading(false);
    };

    load();
  }, [id]);

  // ✅ WhatsApp customization blink
  useEffect(() => {
    if (whatsappRef.current) {
      gsap.to(whatsappRef.current, {
        opacity: 0.3,
        repeat: -1,
        yoyo: true,
        duration: 0.8,
        ease: "power2.inOut",
      });
    }
  }, []);

  if (loading) return <p className="p-10 text-center">Loading…</p>;
  if (!product) return <p className="p-10 text-center">Not found</p>;

  const colorVariant = product.hasColors
    ? product.variants[selectedColor]
    : null;
  const images = product.hasColors
    ? colorVariant?.images || []
    : product.images || [];
  const variantSizes = colorVariant?.sizes || null;

  let stock = 0;
  let stockStatusMessage = "";

  if (variantSizes) {
    if (selectedSize) {
      stock = variantSizes[selectedSize] ?? 0;
      stockStatusMessage = stock > 0 ? `In stock: ${stock}` : "Out of stock";
    } else {
      stockStatusMessage = "Select a size to view stock";
    }
  } else {
    stock = colorVariant?.stock ?? product.stock ?? 0;
    stockStatusMessage = stock > 0 ? `In stock: ${stock}` : "Out of stock";
  }

  const colorKey = product.hasColors ? selectedColor : "default";
  const sizeKey = selectedSize || "default";

  const existingCartItem = cart.find(
    (item) =>
      item.id === product.id && item.color === colorKey && item.size === sizeKey
  );
  const currentQtyInCart = existingCartItem?.qty || 0;

  const basePrice = Number(product.price);

  // 🛒 Add-to-cart logic
  const handleAdd = () => {
    if (!user) {
      showToast("Please sign in first.", "info");
      openAuthModal();
      return;
    }

    if (product.hasColors && !selectedColor) {
      showToast("Please select a color first.", "info");
      return;
    }

    if (variantSizes && !selectedSize) {
      showToast("Please select a size first.", "info");
      return;
    }

    if (stock <= 0) {
      showToast("Out of stock.", "error");
      return;
    }

    const existing = existingCartItem;
    if (existing) {
      if (existing.qty >= stock) {
        showToast("Maximum stock reached.", "info");
        return;
      }
      increaseQty(product.id, colorKey, sizeKey);
      showToast("Quantity updated.", "success");
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: basePrice, // ✅ base price only
      qty: 1,
      color: colorKey,
      size: sizeKey,
      stock,
      img: activeImg,
      gst: product.gst, // keep gst in cart for backend calc
    });

    showToast("Added to cart.", "success");
  };

  const handleDecrease = () => {
    if (!existingCartItem) return;
    decreaseQty(product.id, colorKey, sizeKey);
  };

  const handleRemove = () => {
    removeFromCart(product.id, colorKey, sizeKey);
    showToast("Removed from cart.", "info");
  };

  return (
    <>
      <Header />

      <main className="flex flex-col justify-center items-center min-h-screen bg-gray-50 py-16 px-6">
        <div className="max-w-5xl w-full bg-white rounded-2xl shadow-lg overflow-hidden grid md:grid-cols-2">
          {/* ✅ Left: Product Images */}
          <div className="p-6 border-r flex flex-col items-center justify-center">
            <div className="relative w-full h-[460px] border rounded-xl overflow-hidden bg-white shadow-sm">
              <Image
                src={activeImg}
                alt={product.name}
                fill
                sizes="400px"
                className="object-cover"
                unoptimized
              />
            </div>

            <div className="flex gap-3 mt-4 flex-wrap justify-center">
              {images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(img)}
                  className={`border rounded-lg overflow-hidden ${
                    activeImg === img ? "ring-2 ring-black" : "border-gray-300"
                  }`}
                >
                  <Image src={img} alt="thumb" width={70} height={70} />
                </button>
              ))}
            </div>
          </div>

          {/* ✅ Right: Product Info */}
          <div className="p-8 flex flex-col justify-center">
            <h1 className="text-3xl font-bold">{product.name}</h1>

            <p className="mt-3 text-gray-700 text-lg">
              Base Price:{" "}
              <span className="font-semibold">{formatCurrency(basePrice)}</span>
            </p>

            <p
              className={`text-sm mt-1 ${
                stockStatusMessage.includes("In stock")
                  ? "text-green-600"
                  : stockStatusMessage.includes("Out")
                  ? "text-red-500"
                  : "text-gray-500"
              }`}
            >
              {stockStatusMessage}
            </p>

            {/* ✅ Color Selection */}
            {product.hasColors && (
              <div className="mt-6">
                <p className="text-sm mb-2">Select Color:</p>
                <div className="flex gap-3 flex-wrap">
                  {Object.keys(product.variants).map((clr: string) => (
                    <button
                      key={clr}
                      onClick={() => {
                        setSelectedColor(clr);
                        setSelectedSize("");
                        setActiveImg(product.variants[clr]?.images?.[0]);
                      }}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor === clr
                          ? "border-black scale-110"
                          : "border-gray-300"
                      }`}
                      style={{ backgroundColor: clr }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ✅ Size Selection */}
            {variantSizes && (
              <div className="mt-6">
                <p className="text-sm mb-2">Select Size:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(variantSizes).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`px-4 py-[6px] text-sm rounded-full border transition-all ${
                        selectedSize === sz
                          ? "bg-black text-white border-black"
                          : "border-gray-300 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 🛒 Cart Controls */}
            {currentQtyInCart > 0 ? (
              <div className="mt-8 flex flex-col gap-5">
                <div className="flex items-center gap-5">
                  <button
                    onClick={handleDecrease}
                    className="w-10 h-10 border rounded-full flex items-center justify-center text-xl font-semibold hover:bg-gray-100"
                  >
                    –
                  </button>
                  <span className="text-lg font-medium w-6 text-center">
                    {currentQtyInCart}
                  </span>
                  <button
                    onClick={handleAdd}
                    className="w-10 h-10 border rounded-full flex items-center justify-center text-xl font-semibold hover:bg-gray-100"
                  >
                    +
                  </button>
                  <button
                    onClick={handleRemove}
                    className="ml-3 text-gray-500 hover:text-red-600 transition-all"
                    title="Remove from cart"
                  >
                    <TrashIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleAdd}
                className="mt-8 bg-black text-white px-8 py-3 rounded-full hover:bg-gray-900 transition-all font-medium"
              >
                Add to Cart
              </button>
            )}

            {/* ✅ Description */}
            {product.description && (
              <p className="mt-6 text-sm text-gray-600 leading-relaxed border-t pt-4">
                {product.description}
              </p>
            )}

            {/* ✅ Blinking WhatsApp Notice */}
            <div
              ref={whatsappRef}
              className="mt-8 text-center text-amber-600 font-medium text-sm"
            >
              ⚡ Get in touch with us via whatsapp for Product customization.
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
