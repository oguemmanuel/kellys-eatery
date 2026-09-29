"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav({ isOwner }: { isOwner: boolean }) {
  const pathname = usePathname();
  const items = [
    { href: "/admin", label: "Orders" },
    { href: "/admin/menu", label: "Menu" },
    ...(isOwner ? [{ href: "/admin/bulk", label: "Bulk" }] : []),
    { href: "/admin/choices", label: "Choices" },
  ];

  return (
    <nav
      aria-label="Admin"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-cream-dark bg-white pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex max-w-3xl">
        {items.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-14 items-center justify-center text-sm font-semibold ${
                  active ? "text-brand" : "text-muted"
                }`}
              >
                <span
                  className={
                    active ? "border-b-2 border-brand pb-0.5" : "pb-0.5"
                  }
                >
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
