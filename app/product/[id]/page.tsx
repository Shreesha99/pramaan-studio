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
// import ProductCustomizer from "./ProductCustomizer";
import { TrashIcon } from "@heroicons/react/24/outline";

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [activeImg, setActiveImg] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const { cart, addToCart, increaseQty, decreaseQty, removeFromCart } =
    useCart();
  const { showToast } = useToast();
  const { user, openAuthModal } = useAuth();

  const containerRef = useRef<HTMLDivElement>(null);

  // ✅ Load product once
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

  // ✅ Get current item from cart
  const colorKey = product.hasColors ? selectedColor : "default";
  const existingCartItem = cart.find(
    (item) => item.id === product.id && item.color === colorKey
  );
  const currentQtyInCart = existingCartItem?.qty || 0;

  // 🛒 Add-to-cart (like in ProductsPage)
  const handleAdd = async () => {
    if (!user) {
      showToast("Please sign in first.", "info");
      openAuthModal();
      return;
    }

    if (stock <= 0) {
      showToast("Out of stock.", "info");
      return;
    }

    const item = existingCartItem;
    if (item) {
      if (item.qty >= stock) {
        showToast("Maximum stock reached.", "info");
        return;
      }
      increaseQty(product.id, colorKey);
      showToast("Quantity updated.", "success");
      return;
    }

    let customizedImage = localStorage.getItem("latestCustomization");

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      qty: 1,
      color: colorKey,
      stock,
      img: activeImg,
      ...(customizedImage ? { customizedImage } : {}),
    });

    showToast("Added to cart.", "success");
  };

  const handleDecrease = () => {
    if (!existingCartItem) return;
    decreaseQty(product.id, colorKey);
  };

  const handleRemove = () => {
    removeFromCart(product.id, colorKey);
    showToast("Removed from cart.", "info");
  };

  return (
    <>
      <Header />

      <div className="max-w-[1200px] mx-auto px-6 py-12 grid md:grid-cols-2 gap-12 transition-opacity duration-150 ease-in-out">
        {/* ✅ Left: Product Image + Carousel */}
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

            {/* {isTShirt && <ProductCustomizer containerRef={containerRef} />} */}
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

        {/* ✅ Right: Product Info + Cart Controls */}
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

          {/* ✅ Cart Controls */}
          {currentQtyInCart > 0 ? (
            <div className="mt-8 flex flex-col gap-5 transition-all duration-200 ease-in-out">
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
              className="mt-8 bg-black text-white px-6 py-3 rounded-full hover:bg-gray-900 transition-all duration-200 ease-in-out"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </>
  );
}
