import { CollaborationForm } from "@/components/admin/CollaborationForm";

export default function NewCollaborationPage() {
  return (
    <div className="max-w-3xl">
      <p className="tracked mb-3 text-xs text-[var(--color-grey-500)]">Kolaborasi</p>
      <h1 className="font-display mb-10 text-3xl md:text-4xl">Tambah Kolaborasi</h1>
      <CollaborationForm />
    </div>
  );
}
