import { SHIPPING_ESTIMATES, getShippingEstimate } from "@/lib/shipping";
import { formatPrice, cn } from "@/lib/utils";

export function ShippingEstimateTable({ provinceName }: { provinceName: string }) {
  const activeZone = provinceName ? getShippingEstimate(provinceName).zone : null;

  return (
    <div className="overflow-x-auto border border-[var(--color-grey-300)]">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="hairline border-b bg-[var(--color-grey-100)] text-xs text-[var(--color-grey-500)]">
            <th className="px-4 py-3 font-normal">Tujuan</th>
            <th className="px-4 py-3 text-right font-normal">Perkiraan Ongkir</th>
          </tr>
        </thead>
        <tbody>
          {SHIPPING_ESTIMATES.map((est) => (
            <tr
              key={est.zone}
              className={cn(
                "hairline border-b last:border-b-0",
                activeZone === est.zone && "bg-[var(--color-grey-100)]"
              )}
            >
              <td className="px-4 py-3">{est.label}</td>
              <td className="px-4 py-3 text-right font-medium">
                {formatPrice(est.min)}–{formatPrice(est.max)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="px-4 py-3 text-xs text-[var(--color-grey-500)]">
        Ongkos kirim ditanggung pembeli saat barang sampai. Nominal pasti akan
        dikonfirmasi admin setelah pesanan diverifikasi.
      </p>
    </div>
  );
}
