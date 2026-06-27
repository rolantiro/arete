import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CollaborationForm } from "@/components/admin/CollaborationForm";
import type { Collaboration } from "@/types/database";

type Params = Promise<{ id: string }>;

export default async function EditCollaborationPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: collaboration } = await supabase
    .from("collaborations")
    .select("*")
    .eq("id", id)
    .single();

  if (!collaboration) notFound();

  return (
    <div className="max-w-3xl">
      <p className="tracked mb-3 text-xs text-[var(--color-grey-500)]">Kolaborasi</p>
      <h1 className="font-display mb-10 text-3xl md:text-4xl">Edit Kolaborasi</h1>
      <CollaborationForm initial={collaboration as Collaboration} />
    </div>
  );
}
