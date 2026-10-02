"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "Início" },
  { href: "/academy", label: "Academy" },
  { href: "/icp", label: "ICP" },
  { href: "/studio", label: "Gerador" },
  { href: "/auditor", label: "Auditor" },
  { href: "/library", label: "Biblioteca" },
];

export function Nav() {
  const path = usePathname();
  if (path.startsWith("/teleprompter")) return null;

  return (
    <nav className="border-b border-stone-200 bg-white md:w-56 md:shrink-0 md:border-r md:border-b-0">
      <div className="flex items-center gap-1 overflow-x-auto px-4 py-3 md:sticky md:top-0 md:flex-col md:items-stretch md:gap-1 md:py-6">
        <Link href="/" className="mr-4 shrink-0 md:mr-0 md:mb-6 md:px-3">
          <span className="block text-sm font-black uppercase tracking-tight text-brand-600">Hook & Lock-In</span>
          <span className="hidden text-xs text-stone-500 md:block">Engine para vídeo ads</span>
        </Link>
        {ITEMS.map((item) => {
          const active = item.href === "/" ? path === "/" : path.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium ${
                active ? "bg-brand-50 text-brand-700" : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
