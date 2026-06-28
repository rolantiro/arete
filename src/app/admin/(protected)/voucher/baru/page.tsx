import { VoucherForm } from "@/components/admin/VoucherForm";

export default function NewVoucherPage() {
  return (
    <div className="max-w-2xl">
      <p className="tracked mb-3 text-xs text-[var(--color-grey-500)]">Voucher</p>
      <h1 className="font-display mb-10 text-3xl md:text-4xl">Tambah Voucher</h1>
      <VoucherForm />
    </div>
  );
}
