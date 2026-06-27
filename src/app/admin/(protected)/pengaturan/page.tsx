"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/types/database";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      setCategories(data.categories ?? []);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setName("");
    setSlug("");
    setSlugTouched(false);
    setFormOpen(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setSlugTouched(true);
    setFormOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const endpoint = editing
        ? `/api/admin/categories/${editing.id}`
        : "/api/admin/categories";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, sort_order: editing?.sort_order ?? categories.length }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Gagal menyimpan kategori");
        return;
      }
      toast.success(editing ? "Kategori diperbarui" : "Kategori ditambahkan");
      setFormOpen(false);
      loadCategories();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/categories/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      toast.success("Kategori dihapus");
      setDeleteTarget(null);
    } catch {
      toast.error("Gagal menghapus kategori");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="border border-[var(--color-grey-300)] p-7">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-xl">Kategori Produk</h2>
        <Button type="button" size="sm" variant="outline" onClick={openCreate}>
          <Plus className="h-3.5 w-3.5" />
          Tambah
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-[var(--color-grey-500)]" />
        </div>
      ) : (
        <div className="flex flex-col">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="hairline flex items-center justify-between py-3 first:border-t-0"
            >
              <div>
                <p className="text-sm">{cat.name}</p>
                <p className="text-xs text-[var(--color-grey-500)]">/{cat.slug}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => openEdit(cat)}
                  aria-label="Edit kategori"
                  className="text-[var(--color-grey-500)] hover:text-[var(--color-ink)]"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget(cat)}
                  aria-label="Hapus kategori"
                  className="text-[var(--color-grey-500)] hover:text-[var(--color-error)]"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="py-6 text-center text-sm text-[var(--color-grey-500)]">
              Belum ada kategori
            </p>
          )}
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-6">
          <div className="relative w-full max-w-sm bg-[var(--color-paper)] p-8">
            <button
              onClick={() => setFormOpen(false)}
              aria-label="Tutup"
              className="absolute right-4 top-4 text-[var(--color-grey-500)] hover:text-[var(--color-ink)]"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="font-display mb-6 text-xl">
              {editing ? "Edit Kategori" : "Tambah Kategori"}
            </h3>
            <div className="flex flex-col gap-4">
              <Input
                label="Nama Kategori"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slugTouched) setSlug(slugify(e.target.value));
                }}
              />
              <Input
                label="Slug"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
              />
            </div>
            <Button
              type="button"
              className="mt-6 w-full"
              isLoading={saving}
              onClick={handleSave}
            >
              Simpan
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus Kategori"
        description={`Apakah Anda yakin ingin menghapus kategori "${deleteTarget?.name}"? Produk dalam kategori ini tidak akan terhapus.`}
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function PasswordManager() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password tidak cocok");
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError) {
        setError(updateError.message);
        return;
      }
      toast.success("Password berhasil diubah");
      setNewPassword("");
      setConfirmPassword("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleChangePassword}
      className="border border-[var(--color-grey-300)] p-7"
    >
      <h2 className="font-display mb-6 text-xl">Ubah Password</h2>
      {error && (
        <p className="mb-4 text-sm text-[var(--color-error)]">{error}</p>
      )}
      <div className="flex flex-col gap-4">
        <Input
          label="Password Baru"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
        />
        <Input
          label="Konfirmasi Password Baru"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
        />
      </div>
      <Button type="submit" className="mt-6" isLoading={saving}>
        Simpan Password
      </Button>
    </form>
  );
}

export default function AdminSettingsPage() {
  return (
    <div className="max-w-2xl">
      <p className="tracked mb-3 text-xs text-[var(--color-grey-500)]">Kelola</p>
      <h1 className="font-display mb-10 text-3xl md:text-4xl">Pengaturan</h1>

      <div className="flex flex-col gap-10">
        <CategoryManager />
        <PasswordManager />
      </div>
    </div>
  );
}
