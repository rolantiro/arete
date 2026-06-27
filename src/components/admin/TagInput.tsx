"use client";

import { useState } from "react";
import { X } from "lucide-react";

export function TagInput({
  label,
  placeholder,
  values,
  onChange,
}: {
  label: string;
  placeholder: string;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function addTag() {
    const trimmed = draft.trim();
    if (!trimmed || values.includes(trimmed)) {
      setDraft("");
      return;
    }
    onChange([...values, trimmed]);
    setDraft("");
  }

  function removeTag(tag: string) {
    onChange(values.filter((v) => v !== tag));
  }

  return (
    <div>
      <p className="tracked mb-3 text-xs text-[var(--color-grey-500)]">{label}</p>
      <div className="flex flex-wrap items-center gap-2 border border-[var(--color-grey-300)] p-2">
        {values.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1.5 bg-[var(--color-grey-100)] px-3 py-1.5 text-xs"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`Hapus ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addTag();
            }
          }}
          onBlur={addTag}
          placeholder={placeholder}
          className="min-w-[120px] flex-1 bg-transparent px-2 py-1.5 text-sm focus:outline-none"
        />
      </div>
    </div>
  );
}
