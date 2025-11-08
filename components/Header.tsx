// "use client";

// import { useEffect, useRef, useState } from "react";
// import { usePathname } from "next/navigation";
// import Image from "next/image";
// import { gsap } from "gsap";
// import {
//   Bars3Icon,
//   XMarkIcon,
//   MagnifyingGlassIcon,
//   ShoppingBagIcon,
//   UserCircleIcon,
// } from "@heroicons/react/24/outline";
// import { useCart } from "@/context/CartContext";
// import { useAuth } from "@/context/AuthContext";
// import Fuse from "fuse.js";
// import { db } from "@/lib/firebase";
// import { collection, getDocs } from "firebase/firestore";
// import CartDrawer from "@/components/CartDrawer";
// import ProfileDropdown from "@/components/ProfileDropdown";
// import Link from "next/link";

// export default function Header() {
//   const { totalQty } = useCart();
//   const { user, logout, openAuthModal } = useAuth();
//   const pathname = usePathname();

//   const [cartOpen, setCartOpen] = useState(false);
//   const [searchOpen, setSearchOpen] = useState(false);
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const [mobileNavOpen, setMobileNavOpen] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchResults, setSearchResults] = useState<any[]>([]);
//   const [allProducts, setAllProducts] = useState<any[]>([]);

//   const searchRef = useRef<HTMLDivElement>(null);
//   const dropdownRef = useRef<HTMLDivElement>(null);
//   const mobileNavRef = useRef<HTMLDivElement>(null);
//   const searchTlRef = useRef<gsap.core.Timeline | null>(null);

//   const isCheckoutPage =
//     pathname.startsWith("/checkout") || pathname.startsWith("/order-success");

//   // 🔹 Load products once for searching
//   useEffect(() => {
//     const fetchProducts = async () => {
//       const snapshot = await getDocs(collection(db, "products"));
//       const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//       setAllProducts(data);
//     };
//     fetchProducts();
//   }, []);

//   // 🔹 Fuzzy search with Fuse.js
//   useEffect(() => {
//     if (!searchQuery.trim()) {
//       setSearchResults([]);
//       return;
//     }

//     const fuse = new Fuse(allProducts, {
//       keys: ["name", "category"],
//       threshold: 0.4,
//     });

//     const results = fuse.search(searchQuery.trim()).map((r) => r.item);
//     setSearchResults(results);
//   }, [searchQuery, allProducts]);

//   const headerRef = useRef(null);
//   useEffect(() => {
//     if (!headerRef.current) return;

//     const played = sessionStorage.getItem("headerAnimPlayed");
//     if (played) return;

//     gsap.from(headerRef.current, {
//       y: -40,
//       opacity: 0,
//       duration: 0.8,
//       ease: "power3.out",
//     });

//     sessionStorage.setItem("headerAnimPlayed", "true");
//   }, []);

//   // Animate search drawer
//   useEffect(() => {
//     const searchBar = searchRef.current;
//     if (!searchBar) return;

//     if (!searchTlRef.current) {
//       gsap.set(searchBar, { y: -80, opacity: 0 });
//       const tl = gsap.timeline({ paused: true });
//       tl.to(searchBar, {
//         y: 0,
//         opacity: 1,
//         duration: 0.4,
//         ease: "power3.out",
//       });
//       searchTlRef.current = tl;
//     }

//     if (searchOpen) searchTlRef.current.play();
//     else searchTlRef.current.reverse();
//   }, [searchOpen]);

//   // Animate mobile nav
//   useEffect(() => {
//     if (!mobileNavRef.current) return;
//     if (mobileNavOpen) {
//       gsap.fromTo(
//         mobileNavRef.current,
//         { y: -20, opacity: 0 },
//         { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" }
//       );
//     } else {
//       gsap.to(mobileNavRef.current, {
//         y: -20,
//         opacity: 0,
//         duration: 0.3,
//         ease: "power2.in",
//       });
//     }
//   }, [mobileNavOpen]);

//   // Animate dropdown
//   useEffect(() => {
//     if (!dropdownRef.current) return;
//     if (dropdownOpen) {
//       gsap.fromTo(
//         dropdownRef.current,
//         { opacity: 0, y: -5 },
//         { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }
//       );
//     } else {
//       gsap.to(dropdownRef.current, {
//         opacity: 0,
//         y: -5,
//         duration: 0.2,
//         ease: "power2.in",
//       });
//     }
//   }, [dropdownOpen]);

//   // Close dropdown on outside click
//   useEffect(() => {
//     const handleClickOutside = (e: MouseEvent) => {
//       if (
//         dropdownRef.current &&
//         !(dropdownRef.current as HTMLElement).contains(e.target as Node)
//       ) {
//         setDropdownOpen(false);
//       }
//     };
//     if (dropdownOpen) document.addEventListener("click", handleClickOutside);
//     return () => document.removeEventListener("click", handleClickOutside);
//   }, [dropdownOpen]);

//   return (
//     <>
//       <header
//         ref={headerRef}
//         className="py-5 border-b border-gray-100 bg-white sticky top-0 backdrop-blur-md z-[100]"
//       >
//         <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
//           {/* ✅ Brand Logo */}
//           <Link href="/">
//             <div className="flex items-center gap-2">
//               <Image
//                 src="/assets/img/nav-logo.png"
//                 alt="PraMaan Logo"
//                 width={36}
//                 height={36}
//                 priority
//                 className="w-9 h-9 object-contain"
//               />
//               <span className="hidden md:inline text-xl tracking-tight">
//                 PraMaan
//               </span>
//             </div>
//           </Link>

//           {/* 🧭 Desktop Navigation */}
//           <nav className="hidden md:flex items-center gap-10 text-sm font-medium text-gray-700">
//             <Link href="/products">Products</Link>
//             <a href="#products">Our range</a>
//             <a href="#our-work">Our work</a>
//           </nav>

//           {/* 🧰 Icons + Auth + Cart */}
//           <div className="flex items-center gap-5 relative">
//             {/* 🍔 Mobile Menu Button */}
//             <button
//               className="md:hidden"
//               onClick={() => setMobileNavOpen((s) => !s)}
//             >
//               {mobileNavOpen ? (
//                 <XMarkIcon className="w-6 h-6 text-gray-700" />
//               ) : (
//                 <Bars3Icon className="w-6 h-6 text-gray-700" />
//               )}
//             </button>

//             {/* 🔍 Search Icon */}
//             <button onClick={() => setSearchOpen(!searchOpen)}>
//               <MagnifyingGlassIcon className="w-5 h-5 text-gray-700" />
//             </button>

//             {/* 👤 Auth Section */}
//             {user ? (
//               <div className="relative">
//                 <button
//                   onClick={() => setDropdownOpen((s) => !s)}
//                   className="flex items-center gap-1"
//                 >
//                   {user.photoURL ? (
//                     <Image
//                       src={user.photoURL}
//                       alt="User avatar"
//                       width={28}
//                       height={28}
//                       className="rounded-full border border-gray-300"
//                     />
//                   ) : (
//                     <UserCircleIcon className="w-7 h-7 text-gray-700" />
//                   )}
//                 </button>

//                 {dropdownOpen && (
//                   <ProfileDropdown
//                     user={user}
//                     onClose={() => setDropdownOpen(false)}
//                     logout={logout}
//                   />
//                 )}
//               </div>
//             ) : (
//               <button
//                 onClick={openAuthModal}
//                 className="text-sm font-semibold text-gray-700 border px-3 py-1 rounded-full hover:bg-gray-100 transition hidden sm:inline"
//               >
//                 Login
//               </button>
//             )}

//             {/* 🛒 Cart Button */}
//             <button
//               onClick={() => {
//                 if (!isCheckoutPage) setCartOpen(true);
//               }}
//               disabled={isCheckoutPage}
//               title={
//                 isCheckoutPage
//                   ? "Cart is disabled on checkout"
//                   : "View your cart"
//               }
//               className={`relative transition ${
//                 isCheckoutPage
//                   ? "opacity-40 cursor-not-allowed"
//                   : "hover:scale-110"
//               }`}
//             >
//               <ShoppingBagIcon className="w-5 h-5 text-gray-700" />
//               {totalQty > 0 && (
//                 <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
//                   {totalQty}
//                 </span>
//               )}
//             </button>
//           </div>
//         </div>

//         {/* 📱 Mobile Dropdown Navigation */}
//         {mobileNavOpen && (
//           <div
//             ref={mobileNavRef}
//             className="md:hidden bg-white border-t border-gray-200 absolute w-full left-0 top-[72px] z-[90] shadow-xl"
//           >
//             <nav className="flex flex-col items-start p-5 space-y-4 text-gray-800 text-sm font-medium">
//               <Link
//                 href="/products"
//                 onClick={() => setMobileNavOpen(false)}
//                 className="w-full text-left hover:text-black"
//               >
//                 Products
//               </Link>
//               <a
//                 href="#products"
//                 onClick={() => setMobileNavOpen(false)}
//                 className="w-full text-left hover:text-black"
//               >
//                 Our range
//               </a>
//               <a
//                 href="#our-work"
//                 onClick={() => setMobileNavOpen(false)}
//                 className="w-full text-left hover:text-black"
//               >
//                 Our work
//               </a>
//             </nav>
//           </div>
//         )}
//       </header>

//       {/* 🛒 Cart Drawer */}
//       <CartDrawer cartOpen={cartOpen} setCartOpen={setCartOpen} />

//       {/* 🖤 Overlay */}
//       {(cartOpen || searchOpen || mobileNavOpen) && (
//         <div
//           className="fixed inset-0 bg-black/30 backdrop-blur-[1px] z-[80]"
//           onClick={() => {
//             setCartOpen(false);
//             setSearchOpen(false);
//             setMobileNavOpen(false);
//           }}
//         />
//       )}
//     </>
//   );
// }
