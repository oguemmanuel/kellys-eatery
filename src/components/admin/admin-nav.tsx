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
    ...(isOwner ? [{ href: "/admin/reports", label: "Reports" }] : []),
  ];

  return (
    <nav aria-label="Admin" className="border-t border-line">
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
                className={`relative flex min-h-12 items-center justify-center text-sm font-semibold transition-colors duration-(--duration-fast) ${
                  active ? "text-brand" : "text-muted active:text-brand"
                }`}
              >
                {item.label}
                <span
                  aria-hidden
                  className={`absolute inset-x-3 bottom-0 h-[3px] origin-center rounded-t-full bg-brand transition-transform duration-(--duration-base) ease-(--ease-out) ${
                    active ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
