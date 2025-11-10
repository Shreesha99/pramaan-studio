"use client";

import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import ProfileDropdown from "@/components/ProfileDropdown";

export default function HeaderIcons({
  user,
  logout,
  openAuthModal,
  totalQty,
  isCheckoutPage,
  setCartOpen,
  setSearchOpen,
  setDropdownOpen,
  dropdownOpen,
  mobileNavOpen,
  setMobileNavOpen,
}: any) {
  return (
    <div className="flex items-center gap-5 relative">
      {/* 🍔 Mobile Menu */}
      <button
        className="md:hidden"
        onClick={() => setMobileNavOpen(!mobileNavOpen)}
      >
        {mobileNavOpen ? (
          <XMarkIcon className="w-6 h-6 text-gray-700" />
        ) : (
          <Bars3Icon className="w-6 h-6 text-gray-700" />
        )}
      </button>

      {/* 🔍 Search */}
      <button onClick={() => setSearchOpen((s: boolean) => !s)}>
        <MagnifyingGlassIcon className="w-6 h-6 text-gray-700" />
      </button>

      {/* 👤 Auth */}
      {user ? (
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((s: boolean) => !s)}
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
            <ProfileDropdown
              user={user}
              onClose={() => setDropdownOpen(false)}
              logout={logout}
            />
          )}
        </div>
      ) : (
        <button
          onClick={openAuthModal}
          className="text-sm font-semibold text-gray-700 border px-3 py-1 rounded-full hover:bg-gray-100 transition hidden sm:inline"
        >
          Login
        </button>
      )}

      {/* 🛒 Cart */}
      <button
        onClick={() => {
          if (!isCheckoutPage) setCartOpen(true);
        }}
        disabled={isCheckoutPage}
        title={
          isCheckoutPage ? "Cart is disabled on checkout" : "View your cart"
        }
        className={`relative transition ${
          isCheckoutPage ? "opacity-40 cursor-not-allowed" : "hover:scale-110"
        }`}
      >
        <ShoppingBagIcon className="w-5 h-5 text-gray-700" />
        {totalQty > 0 && (
          <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
            {totalQty}
          </span>
        )}
      </button>
    </div>
  );
}
