"use client";

import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ConfirmDialog({
  open,
  title,
  description,
  isLoading,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-6">
      <div className="relative w-full max-w-sm bg-[var(--color-paper)] p-8">
        <button
          onClick={onCancel}
          aria-label="Tutup"
          className="absolute right-4 top-4 text-[var(--color-grey-500)] hover:text-[var(--color-ink)]"
        >
          <X className="h-4 w-4" />
        </button>
        <h3 className="font-display text-xl">{title}</h3>
        <p className="mt-3 text-sm text-[var(--color-grey-500)]">{description}</p>
        <div className="mt-8 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onCancel}>
            Batal
          </Button>
          <Button variant="danger" className="flex-1" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Hapus"}
          </Button>
        </div>
      </div>
    </div>
  );
}
