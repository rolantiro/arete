"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/database";

export function CategoryFilter({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("kategori");

  function setCategory(slug: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("kategori", slug);
    } else {
      params.delete("kategori");
    }
    router.push(`/katalog?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={() => setCategory(null)}
        className={cn(
          "tracked border px-5 py-2.5 text-xs transition-colors",
          !activeCategory
            ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-paper)]"
            : "border-[var(--color-grey-300)] hover:border-[var(--color-ink)]"
        )}
      >
        Semua
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => setCategory(cat.slug)}
          className={cn(
            "tracked border px-5 py-2.5 text-xs transition-colors",
            activeCategory === cat.slug
              ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-paper)]"
              : "border-[var(--color-grey-300)] hover:border-[var(--color-ink)]"
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
