import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VoucherForm } from "@/components/admin/VoucherForm";
import type { Voucher } from "@/types/database";

type Params = Promise<{ id: string }>;

export default async function EditVoucherPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: voucher } = await supabase.from("vouchers").select("*").eq("id", id).single();

  if (!voucher) notFound();

  return (
    <div className="max-w-2xl">
      <p className="tracked mb-3 text-xs text-[var(--color-grey-500)]">Voucher</p>
      <h1 className="font-display mb-10 text-3xl md:text-4xl">Edit Voucher</h1>
      <VoucherForm initial={voucher as Voucher} />
    </div>
  );
}
