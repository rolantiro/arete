"use client";

import { Loader2 } from "lucide-react";
import { useRegionSelector } from "@/hooks/useRegionSelector";

type RegionSelectorProps = {
  onComplete: (region: {
    province_id: string;
    province_name: string;
    regency_id: string;
    regency_name: string;
    district_id: string;
    district_name: string;
    village_id: string;
    village_name: string;
  }) => void;
  error?: string;
};

export function RegionSelector({ onComplete, error }: RegionSelectorProps) {
  const region = useRegionSelector();

  function handleVillageSelect(id: string) {
    region.selectVillage(id);
    if (!id) return;

    const village = region.villages.find((v) => v.id === id);
    if (!village) return;

    onComplete({
      province_id: region.provinceId,
      province_name: region.selectedNames.province,
      regency_id: region.regencyId,
      regency_name: region.selectedNames.regency,
      district_id: region.districtId,
      district_name: region.selectedNames.district,
      village_id: id,
      village_name: village.name,
    });
  }

  if (region.fetchError) {
    return (
      <p className="text-sm text-[var(--color-error)]">
        Gagal memuat data wilayah. Periksa koneksi internet Anda dan muat ulang
        halaman.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <RegionField
        label="Provinsi"
        value={region.provinceId}
        onChange={region.selectProvince}
        options={region.provinces}
        loading={region.loading.provinces}
        placeholder="Pilih Provinsi"
      />
      <RegionField
        label="Kota/Kabupaten"
        value={region.regencyId}
        onChange={region.selectRegency}
        options={region.regencies}
        loading={region.loading.regencies}
        placeholder="Pilih Kota/Kabupaten"
        disabled={!region.provinceId}
      />
      <RegionField
        label="Kecamatan"
        value={region.districtId}
        onChange={region.selectDistrict}
        options={region.districts}
        loading={region.loading.districts}
        placeholder="Pilih Kecamatan"
        disabled={!region.regencyId}
      />
      <RegionField
        label="Kelurahan"
        value={region.villageId}
        onChange={handleVillageSelect}
        options={region.villages}
        loading={region.loading.villages}
        placeholder="Pilih Kelurahan"
        disabled={!region.districtId}
      />
      {error && <p className="md:col-span-2 text-xs text-[var(--color-error)]">{error}</p>}
    </div>
  );
}

function RegionField({
  label,
  value,
  onChange,
  options,
  loading,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (id: string) => void;
  options: Array<{ id: string; name: string }>;
  loading: boolean;
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="tracked text-[11px] text-[var(--color-grey-500)]">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || loading}
          required
          className="w-full appearance-none border border-[var(--color-grey-300)] bg-transparent px-4 py-3 text-sm focus:border-[var(--color-ink)] focus:outline-none disabled:opacity-40"
        >
          <option value="">{loading ? "Memuat..." : placeholder}</option>
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.name}
            </option>
          ))}
        </select>
        {loading && (
          <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[var(--color-grey-500)]" />
        )}
      </div>
    </div>
  );
}
