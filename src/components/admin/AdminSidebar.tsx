"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Image as ImageIcon,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/produk", label: "Produk", icon: Package },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/halaman", label: "Halaman Website", icon: FileText },
  { href: "/admin/pengaturan", label: "Pengaturan", icon: Settings },
];

export function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    // Hard navigation clears any in-memory client state and
    // guarantees the next request to /admin/login sees the cleared
    // auth cookie rather than racing a client-side transition.
    window.location.href = "/admin/login";
  }

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="px-6 py-8">
        <span className="font-display text-xl tracking-[0.15em]">ARÉTÉ</span>
        <p className="tracked mt-1 text-[10px] text-[var(--color-grey-500)]">
          Admin Panel
        </p>
      </div>

      <nav className="flex-1 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "mb-1 flex items-center gap-3 px-4 py-3 text-sm transition-colors",
                isActive
                  ? "bg-[var(--color-ink)] text-[var(--color-paper)]"
                  : "text-[var(--color-ink)] hover:bg-[var(--color-grey-100)]"
              )}
            >
              <item.icon className="h-4 w-4" strokeWidth={1.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="hairline px-3 py-4">
        <div className="px-4 py-2 text-xs text-[var(--color-grey-500)]">
          Masuk sebagai
          <p className="truncate text-sm text-[var(--color-ink)]">{adminName}</p>
        </div>
        <button
          onClick={handleLogout}
          className="mt-2 flex w-full items-center gap-3 px-4 py-3 text-sm text-[var(--color-ink)] transition-colors hover:bg-[var(--color-grey-100)]"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.5} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="glass hairline sticky top-0 z-40 flex items-center justify-between px-6 py-4 md:hidden">
        <span className="font-display text-lg tracking-[0.15em]">ARÉTÉ</span>
        <button onClick={() => setMobileOpen(true)} aria-label="Buka menu">
          <Menu className="h-5 w-5" strokeWidth={1.5} />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 bg-[var(--color-paper)]">
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Tutup menu"
              className="absolute right-4 top-4"
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hairline-r sticky top-0 hidden h-screen w-72 shrink-0 border-r border-[var(--color-grey-300)] md:block">
        {sidebarContent}
      </aside>
    </>
  );
}
