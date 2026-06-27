"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type ContentMap = Record<string, Record<string, string>>;

const SECTIONS: Array<{
  key: string;
  title: string;
  fields: Array<{ key: string; label: string; type: "input" | "textarea" }>;
}> = [
  {
    key: "navbar",
    title: "Navigasi",
    fields: [{ key: "brand_name", label: "Nama Brand", type: "input" }],
  },
  {
    key: "hero",
    title: "Hero / Banner Utama",
    fields: [
      { key: "eyebrow", label: "Label Kecil", type: "input" },
      { key: "title", label: "Judul Utama", type: "input" },
      { key: "subtitle", label: "Subjudul", type: "textarea" },
      { key: "cta_label", label: "Teks Tombol", type: "input" },
    ],
  },
  {
    key: "about",
    title: "Tentang Kami",
    fields: [
      { key: "title", label: "Judul", type: "input" },
      { key: "body", label: "Isi Teks", type: "textarea" },
    ],
  },
  {
    key: "footer",
    title: "Footer",
    fields: [
      { key: "tagline", label: "Tagline", type: "textarea" },
      { key: "address", label: "Alamat", type: "input" },
      { key: "email", label: "Email", type: "input" },
      { key: "phone", label: "Telepon", type: "input" },
    ],
  },
  {
    key: "seo",
    title: "SEO",
    fields: [
      { key: "site_title", label: "Judul Situs (Meta Title)", type: "input" },
      { key: "site_description", label: "Deskripsi Situs (Meta Description)", type: "textarea" },
    ],
  },
];

export default function AdminContentPage() {
  const [content, setContent] = useState<ContentMap>({});
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/content")
      .then((res) => res.json())
      .then((data) => {
        const map: ContentMap = {};
        for (const row of data.content ?? []) {
          if (!map[row.section]) map[row.section] = {};
          map[row.section][row.key] = row.value;
        }
        setContent(map);
      })
      .finally(() => setLoading(false));
  }, []);

  function updateField(section: string, key: string, value: string) {
    setContent((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  }

  async function saveSection(sectionKey: string) {
    setSavingSection(sectionKey);
    try {
      const sectionData = content[sectionKey] ?? {};
      const items = Object.entries(sectionData).map(([key, value]) => ({
        section: sectionKey,
        key,
        value,
      }));

      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) throw new Error();
      toast.success("Perubahan tersimpan dan langsung tampil di website");
    } catch {
      toast.error("Gagal menyimpan perubahan");
    } finally {
      setSavingSection(null);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--color-grey-500)]" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <p className="tracked mb-3 text-xs text-[var(--color-grey-500)]">Kelola</p>
      <h1 className="font-display mb-10 text-3xl md:text-4xl">Halaman Website</h1>

      <div className="flex flex-col gap-10">
        {SECTIONS.map((section) => (
          <div key={section.key} className="border border-[var(--color-grey-300)] p-7">
            <h2 className="font-display mb-6 text-xl">{section.title}</h2>
            <div className="flex flex-col gap-5">
              {section.fields.map((field) =>
                field.type === "textarea" ? (
                  <Textarea
                    key={field.key}
                    label={field.label}
                    rows={3}
                    value={content[section.key]?.[field.key] ?? ""}
                    onChange={(e) => updateField(section.key, field.key, e.target.value)}
                  />
                ) : (
                  <Input
                    key={field.key}
                    label={field.label}
                    value={content[section.key]?.[field.key] ?? ""}
                    onChange={(e) => updateField(section.key, field.key, e.target.value)}
                  />
                )
              )}
            </div>
            <Button
              type="button"
              className="mt-6"
              size="sm"
              isLoading={savingSection === section.key}
              onClick={() => saveSection(section.key)}
            >
              Simpan {section.title}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
