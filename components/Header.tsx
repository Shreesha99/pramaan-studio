"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import {
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  XMarkIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/formatCurrency";
import { useAuth } from "@/context/AuthContext";
import Fuse from "fuse.js";
import { auth, db, storage } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useToast } from "@/context/ToastContext";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { updateEmail, updateProfile } from "firebase/auth";

export default function Header() {
  const {
    cart,
    removeFromCart,
    increaseQty,
    decreaseQty,
    totalQty,
    totalAmount,
  } = useCart();

  const { user, logout, openAuthModal } = useAuth();

  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const { showToast } = useToast();

  const drawerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const cartTlRef = useRef<gsap.core.Timeline | null>(null);
  const searchTlRef = useRef<gsap.core.Timeline | null>(null);

  // 🔹 Load products once for searching
  useEffect(() => {
    const fetchProducts = async () => {
      const snapshot = await getDocs(collection(db, "products"));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAllProducts(data);
    };
    fetchProducts();
  }, []);

  // 🔹 Fuzzy search with Fuse.js
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const fuse = new Fuse(allProducts, {
      keys: ["name", "category"],
      threshold: 0.4, // fuzzy tolerance
    });

    const results = fuse.search(searchQuery.trim()).map((r) => r.item);
    setSearchResults(results);
  }, [searchQuery, allProducts]);
  // Animate header entrance
  useEffect(() => {
    gsap.from("header", {
      y: -40,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
    });
  }, []);

  // Animate cart drawer
  useEffect(() => {
    const drawer = drawerRef.current;
    if (!drawer) return;

    const drawerWidth = drawer.offsetWidth;
    if (!cartTlRef.current) {
      gsap.set(drawer, { x: drawerWidth, willChange: "transform" });
      const tl = gsap.timeline({ paused: true });
      tl.to(drawer, { x: 0, duration: 0.55, ease: "power4.out" });
      cartTlRef.current = tl;
    }

    if (cartOpen) cartTlRef.current.play();
    else cartTlRef.current.reverse();
  }, [cartOpen]);

  // Animate search drawer
  useEffect(() => {
    const searchBar = searchRef.current;
    if (!searchBar) return;

    if (!searchTlRef.current) {
      gsap.set(searchBar, { y: -80, opacity: 0 });
      const tl = gsap.timeline({ paused: true });
      tl.to(searchBar, {
        y: 0,
        opacity: 1,
        duration: 0.4,
        ease: "power3.out",
      });
      searchTlRef.current = tl;
    }

    if (searchOpen) searchTlRef.current.play();
    else searchTlRef.current.reverse();
  }, [searchOpen]);

  // Animate dropdown
  useEffect(() => {
    if (!dropdownRef.current) return;
    if (dropdownOpen) {
      gsap.fromTo(
        dropdownRef.current,
        { opacity: 0, y: -5 },
        { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }
      );
    } else {
      gsap.to(dropdownRef.current, {
        opacity: 0,
        y: -5,
        duration: 0.2,
        ease: "power2.in",
      });
    }
  }, [dropdownOpen]);

  // ✅ Show welcome toast on login, but only once per session
  useEffect(() => {
    if (!user) return;

    // Prevent duplicate toasts on refresh
    const shownKey = `toastShownFor_${user.uid}`;
    const hasShown = sessionStorage.getItem(shownKey);

    if (hasShown) return; // already welcomed in this session

    const creationTime = user.metadata?.creationTime;
    const lastSignInTime = user.metadata?.lastSignInTime;

    if (creationTime && creationTime === lastSignInTime) {
      // New user
      showToast("Welcome to PraMaan! 🎉", "success");
    } else {
      // Returning user
      showToast(`Welcome back, ${user.displayName || "User"}!`, "success");
    }

    // Mark as shown for this session
    sessionStorage.setItem(shownKey, "true");
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !(dropdownRef.current as HTMLElement).contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [dropdownOpen]);

  return (
    <>
      <header className="py-5 border-b border-gray-100 bg-white sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
          {/* ✅ Brand Logo */}
          <div className="flex items-center gap-2">
            <Image
              src="/assets/img/nav-logo.png"
              alt="PraMaan Logo"
              width={36}
              height={36}
              priority
              className="w-9 h-9 object-contain"
            />
            <span className="hidden md:inline text-xl tracking-tight">
              PraMaan
            </span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-10 text-sm font-medium text-gray-700">
            <a href="#">Shop</a>
            <a href="#">On Sale</a>
            <a href="#">New Arrivals</a>
          </nav>

          {/* Icons + Auth + Cart */}
          <div className="flex items-center gap-6 relative">
            {/* 🔍 Search Icon */}
            <button onClick={() => setSearchOpen(!searchOpen)}>
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-700" />
            </button>

            {/* Auth Section */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen((s) => !s)}
                  className="flex items-center gap-1"
                >
                  {user.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt="User avatar"
                      width={28}
                      height={28}
                      className="rounded-full border border-gray-300"
                    />
                  ) : (
                    <UserCircleIcon className="w-7 h-7 text-gray-700" />
                  )}
                </button>

                {dropdownOpen && (
                  <div
                    ref={dropdownRef}
                    className="absolute right-0 mt-2 w-[340px] bg-white border border-gray-200 rounded-2xl shadow-2xl z-[150] p-5"
                  >
                    {/* Prefetch & form state */}
                    {/* NOTE: these state variables & effects are defined inside Header component scope */}
                    <ProfileDropdownContent
                      user={user}
                      onClose={() => setDropdownOpen(false)}
                      logout={logout}
                      showToast={showToast}
                    />
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="text-sm font-semibold text-gray-700 border px-3 py-1 rounded-full hover:bg-gray-100 transition"
              >
                Login
              </button>
            )}

            {/* Cart Button */}
            <button className="relative" onClick={() => setCartOpen(true)}>
              <ShoppingBagIcon className="w-5 h-5 text-gray-700" />
              {totalQty > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {totalQty}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 🔎 Search Drawer */}
      {/* 🔍 Floating Smart Search Box */}
      {searchOpen && (
        <div
          ref={searchRef}
          className="fixed top-[15%] left-1/2 -translate-x-1/2 w-[90%] sm:w-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-[120] p-5"
        >
          <div className="flex items-center gap-3">
            <MagnifyingGlassIcon className="w-6 h-6 text-gray-600" />
            <input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 text-gray-800 placeholder-gray-400 text-base outline-none"
              autoFocus
            />
            <button onClick={() => setSearchOpen(false)}>
              <XMarkIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* 🧩 Search Results */}
          {searchQuery && (
            <div className="mt-4 max-h-[250px] overflow-y-auto space-y-2">
              {searchResults.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-2">
                  No matching products.
                </p>
              ) : (
                searchResults.map((p) => {
                  const variantColors = p.hasColors
                    ? Object.keys(p.variants || {})
                    : [];
                  const img =
                    p.hasColors && variantColors.length
                      ? p.variants[variantColors[0]].images?.[0]
                      : p.images?.[0];

                  return (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                    >
                      {img ? (
                        <img
                          src={img}
                          alt={p.name}
                          className="w-12 h-12 rounded-md object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-md" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{p.name}</p>
                        <p className="text-xs text-gray-500">{p.category}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* 🛒 Cart Drawer */}
      <div
        ref={drawerRef}
        className="cart-drawer fixed top-0 right-0 h-full w-[90%] sm:w-[400px] bg-white shadow-2xl z-[100] flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Your Cart</h2>
          <button onClick={() => setCartOpen(false)}>
            <XMarkIcon className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Your cart is empty.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cart.map((item) => {
              const atMax = item.stock !== undefined && item.qty >= item.stock;
              return (
                <div
                  key={`${item.id}-${item.color || "default"}`}
                  className="flex gap-4 border-b border-gray-100 pb-4"
                >
                  {item.img ? (
                    <img
                      src={item.img}
                      alt={item.name}
                      className="w-16 h-16 rounded-md object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs">
                      No Image
                    </div>
                  )}

                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">
                      {item.name}
                      {item.color && (
                        <span className="ml-1 text-xs text-gray-400">
                          ({item.color})
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(item.price)}
                    </p>

                    <div className="flex items-center mt-2">
                      <button
                        className="p-1 border border-gray-300 rounded-l disabled:opacity-50"
                        onClick={() => decreaseQty(item.id, item.color)}
                        disabled={item.qty <= 1}
                      >
                        <MinusIcon className="w-3 h-3 text-gray-700" />
                      </button>
                      <span className="px-3 border-t border-b border-gray-300 text-sm">
                        {item.qty}
                      </span>
                      <button
                        className={`p-1 border border-gray-300 rounded-r ${
                          atMax
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-gray-100"
                        }`}
                        onClick={() =>
                          !atMax && increaseQty(item.id, item.color)
                        }
                        disabled={atMax}
                      >
                        <PlusIcon className="w-3 h-3 text-gray-700" />
                      </button>
                    </div>

                    {atMax && (
                      <p className="text-[10px] text-red-500 mt-1">
                        Max stock reached
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id, item.color)}
                    title="Remove from cart"
                  >
                    <TrashIcon className="w-4 h-4 text-gray-500 hover:text-red-500" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-between text-sm font-medium mb-4">
            <span>Total</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>
          <button className="w-full bg-black text-white py-3 rounded-full font-semibold hover:bg-gray-900 transition">
            Checkout
          </button>
        </div>
      </div>

      {/* Overlay */}
      {(cartOpen || searchOpen) && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-[1px] z-[90]"
          onClick={() => {
            setCartOpen(false);
            setSearchOpen(false);
          }}
        />
      )}
    </>
  );
}

function ProfileDropdownContent({
  user,
  onClose,
  logout,
  showToast,
}: {
  user: any;
  onClose: () => void;
  logout: () => Promise<void>;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}) {
  const [name, setName] = useState(user.displayName || "");
  const [emailLocal, setEmailLocal] = useState(user.email || "");
  const [billing, setBilling] = useState("");
  const [delivery, setDelivery] = useState("");
  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoURL, setPhotoURL] = useState(user.photoURL || "");
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingFetch, setLoadingFetch] = useState(false);

  // 🧠 Fetch saved Firestore profile data
  useEffect(() => {
    if (!user?.uid) return;
    const fetchProfile = async () => {
      setLoadingFetch(true);
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          if (data.name) setName(data.name);
          if (data.email) setEmailLocal(data.email);
          if (data.billingAddress) setBilling(data.billingAddress);
          if (data.deliveryAddress) setDelivery(data.deliveryAddress);
          if (
            data.billingAddress &&
            data.deliveryAddress &&
            data.billingAddress === data.deliveryAddress
          )
            setSameAsBilling(true);
          if (data.photoURL) setPhotoURL(data.photoURL);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoadingFetch(false);
      }
    };
    fetchProfile();
  }, [user?.uid]);

  // 🧩 Auto-sync delivery if sameAsBilling
  useEffect(() => {
    if (sameAsBilling) setDelivery(billing);
  }, [sameAsBilling, billing]);

  // 📸 Upload Photo to Firebase Storage
  const handlePhotoUpload = async () => {
    if (!photoFile || !user?.uid) return null;
    try {
      const fileRef = ref(storage, `users/${user.uid}/profile.jpg`);
      await uploadBytes(fileRef, photoFile);
      const downloadURL = await getDownloadURL(fileRef);
      setPhotoURL(downloadURL);
      return downloadURL;
    } catch (err) {
      console.error("Photo upload error:", err);
      showToast("Failed to upload photo", "error");
      return null;
    }
  };

  // 💾 Save Profile to Firestore + Firebase Auth
  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!user?.uid) return;

    setLoadingSave(true);
    try {
      let uploadedPhotoURL = photoURL;

      if (photoFile) {
        uploadedPhotoURL = await handlePhotoUpload();
      }

      // 🔹 Update Firestore
      await setDoc(
        doc(db, "users", user.uid),
        {
          name,
          email: emailLocal,
          billingAddress: billing,
          deliveryAddress: sameAsBilling ? billing : delivery,
          photoURL: uploadedPhotoURL,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      // 🔹 Update Firebase Auth profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: name,
          photoURL: uploadedPhotoURL || undefined,
        });
        if (emailLocal && emailLocal !== auth.currentUser.email) {
          try {
            await updateEmail(auth.currentUser, emailLocal);
          } catch {
            console.warn("Email update requires recent login; skipped.");
          }
        }
      }

      showToast("Profile updated successfully!", "success");
      onClose();
    } catch (err) {
      console.error("Save error:", err);
      showToast("Failed to save profile. Please try again.", "error");
    } finally {
      setLoadingSave(false);
    }
  };

  // 🖼️ Handle image select
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoURL(URL.createObjectURL(file)); // preview
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-14 h-14">
          {photoURL ? (
            <img
              src={photoURL}
              alt="Profile"
              className="w-14 h-14 rounded-full object-cover border"
            />
          ) : (
            <UserCircleIcon className="w-14 h-14 text-gray-600" />
          )}
          <label className="absolute bottom-0 right-0 bg-black text-white text-xs rounded-full p-1 cursor-pointer hover:bg-gray-800">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            📷
          </label>
        </div>
        <div>
          <p className="font-semibold text-gray-800">{name || "User"}</p>
          <p className="text-xs text-gray-500 truncate">
            {emailLocal || "No email added"}
          </p>
        </div>
      </div>

      {loadingFetch ? (
        <div className="text-center text-gray-500 py-3 text-sm">
          Loading profile…
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-3">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-black"
          />

          <input
            type="email"
            placeholder="Email Address"
            value={emailLocal}
            onChange={(e) => setEmailLocal(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-black"
          />

          <textarea
            placeholder="Billing Address"
            value={billing}
            onChange={(e) => setBilling(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-black resize-none h-20"
          />

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={sameAsBilling}
              onChange={(e) => setSameAsBilling(e.target.checked)}
            />
            <label>Use billing address as delivery address</label>
          </div>

          <textarea
            placeholder="Delivery Address"
            value={delivery}
            onChange={(e) => setDelivery(e.target.value)}
            disabled={sameAsBilling}
            className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-black resize-none h-20 ${
              sameAsBilling ? "bg-gray-50 cursor-not-allowed" : ""
            }`}
          />

          <button
            type="submit"
            disabled={loadingSave}
            className={`w-full py-2 rounded-full font-semibold ${
              loadingSave
                ? "bg-gray-300 text-gray-700"
                : "bg-black text-white hover:bg-gray-900"
            }`}
          >
            {loadingSave ? "Saving..." : "Save Changes"}
          </button>
        </form>
      )}

      {/* Logout */}
      <div className="mt-4 border-t border-gray-200 pt-3">
        <button
          onClick={async () => {
            try {
              await logout();
              showToast("Logged out successfully.", "success");
              onClose();
            } catch (err) {
              console.error("Logout error:", err);
              showToast("Logout failed. Try again.", "error");
            }
          }}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-full border border-gray-300 hover:bg-gray-50 text-sm font-medium"
        >
          🚪 Logout
        </button>
      </div>
    </>
  );
}
