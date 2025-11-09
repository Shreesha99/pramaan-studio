"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { label: "Products", href: "/admin/products" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Customers", href: "/admin/customers" },
  { label: "Settings", href: "/admin/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-black text-white flex flex-col py-6">
      <h1 className="text-2xl font-bold text-center mb-8">PraMaan Admin</h1>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`px-6 py-3 block transition rounded-l-lg ${
            pathname.startsWith(item.href)
              ? "bg-white text-black font-semibold"
              : "hover:bg-white/10"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </aside>
  );
}
