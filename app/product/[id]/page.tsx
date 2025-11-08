"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";
import Header from "@/components/Header/Header";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/formatCurrency";
import ProductCustomizer from "./ProductCustomizer";

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [activeImg, setActiveImg] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // ✅ CALL useCart ONLY ONCE
  const { addToCart, cart } = useCart();
  const { showToast } = useToast();
  const { user, openAuthModal } = useAuth();

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      const ref = doc(db, "products", id as string);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data() as any;
        setProduct({ id, ...data });

        if (data.hasColors && data.variants) {
          const first = Object.keys(data.variants)[0];
          setSelectedColor(first);
          setActiveImg(data.variants[first]?.images?.[0] || "");
        } else {
          setActiveImg(Array.isArray(data.images) ? data.images[0] : "");
        }
      }
      setLoading(false);
    };

    load();
  }, [id]);

  if (loading) return <p className="p-10 text-center">Loading…</p>;
  if (!product) return <p className="p-10 text-center">Not found</p>;

  const colorVariant = product.hasColors
    ? product.variants[selectedColor]
    : null;

  const images = product.hasColors
    ? colorVariant?.images || []
    : product.images || [];

  const stock = product.hasColors
    ? colorVariant?.stock ?? 0
    : product.stock ?? 0;

  const isTShirt =
    product?.type?.toLowerCase() === "tshirt" ||
    product?.category?.toLowerCase()?.includes("t-shirt");

  // ✅ GET EXISTING ITEM FROM CART SAFELY
  const existingCartItem = cart.find(
    (item) =>
      item.id === product.id &&
      (product.hasColors ? item.color === selectedColor : true)
  );

  const currentQtyInCart = existingCartItem?.qty || 0;

  // ✅ FIXED handleAdd
  const handleAdd = () => {
    if (!user) {
      showToast("Please sign in first.", "info");
      openAuthModal();
      return;
    }

    if (stock <= 0) {
      showToast("Out of stock.", "info");
      return;
    }

    // ✅ BLOCK adding beyond stock (NO BUTTON CHANGE)
    if (currentQtyInCart >= stock) {
      showToast("You already added the maximum available stock.", "info");
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      img: activeImg,
      qty: 1,
      color: product.hasColors ? selectedColor : "default",
      stock,
    });

    showToast("Added to cart.", "success");
  };

  return (
    <>
      <Header />

      <div className="max-w-[1200px] mx-auto px-6 py-12 grid md:grid-cols-2 gap-12">
        <div>
          <div
            ref={containerRef}
            className="relative w-full h-[500px] border rounded-xl overflow-hidden bg-white"
          >
            <Image
              src={activeImg}
              alt={product.name}
              fill
              sizes="400px"
              className="object-cover pointer-events-none"
              unoptimized
            />

            {isTShirt && <ProductCustomizer containerRef={containerRef} />}
          </div>

          <div className="flex gap-3 mt-4">
            {images.map((img: string, i: number) => (
              <button
                key={i}
                onClick={() => setActiveImg(img)}
                className={`border rounded-lg overflow-hidden ${
                  activeImg === img ? "ring-2 ring-black" : ""
                }`}
              >
                <Image src={img} alt="thumb" width={70} height={70} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>

          <p className="text-gray-500 text-lg mt-2">
            {formatCurrency(product.price)}
          </p>

          <p className="text-sm text-gray-400 mt-1">
            {stock > 0 ? `In stock: ${stock}` : "Out of stock"}
          </p>

          {product.hasColors && (
            <div className="mt-6">
              <p className="text-sm mb-2">Colors:</p>
              <div className="flex gap-3">
                {Object.keys(product.variants).map((clr: string) => (
                  <button
                    key={clr}
                    onClick={() => {
                      setSelectedColor(clr);
                      setActiveImg(product.variants[clr]?.images?.[0]);
                    }}
                    className={`w-8 h-8 rounded-full border-2 ${
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

          {/* ✅ ORIGINAL BUTTON RESTORED -- NO CHANGES */}
          <button
            onClick={handleAdd}
            className="mt-8 bg-black text-white px-6 py-3 rounded-full hover:bg-gray-900"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </>
  );
}
