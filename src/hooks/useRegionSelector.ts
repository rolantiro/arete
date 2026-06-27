"use client";

import { useEffect, useState, useCallback } from "react";
import type { Province, Regency, District, Village } from "@/types/region";

/**
 * Fetches region data through our own /api/regions proxy (see
 * src/app/api/regions/route.ts) rather than calling
 * emsifa.github.io directly from the browser. The proxy handles
 * retries and caching server-side and can't be blocked by a CORS
 * issue the way a direct browser fetch could.
 */
async function fetchRegion<T>(type: string, parent?: string): Promise<T> {
  const params = new URLSearchParams({ type });
  if (parent) params.set("parent", parent);

  const res = await fetch(`/api/regions?${params.toString()}`);
  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const detail = body?.details ? ` (${body.details})` : "";
    throw new Error((body?.error ?? `HTTP ${res.status}`) + detail);
  }
  return body.data as T;
}

/**
 * Cascading Indonesia region selector state (provinsi -> kota/
 * kabupaten -> kecamatan -> kelurahan). Each level only fetches
 * once its parent is selected, and resets all descendant
 * selections whenever a parent changes.
 */
export function useRegionSelector() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [regencies, setRegencies] = useState<Regency[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);

  const [provinceId, setProvinceId] = useState("");
  const [regencyId, setRegencyId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [villageId, setVillageId] = useState("");

  const [loading, setLoading] = useState({
    provinces: false,
    regencies: false,
    districts: false,
    villages: false,
  });
  const [fetchError, setFetchError] = useState(false);
  const [lastErrorMessage, setLastErrorMessage] = useState<string | null>(null);

  const loadProvinces = useCallback(() => {
    setFetchError(false);
    setLastErrorMessage(null);
    setLoading((s) => ({ ...s, provinces: true }));
    fetchRegion<Province[]>("provinces")
      .then((data) => setProvinces(data))
      .catch((err) => {
        setFetchError(true);
        setLastErrorMessage(err instanceof Error ? err.message : String(err));
      })
      .finally(() => setLoading((s) => ({ ...s, provinces: false })));
  }, []);

  // Load provinces once on mount
  useEffect(() => {
    loadProvinces();
  }, [loadProvinces]);

  const selectProvince = useCallback((id: string) => {
    setProvinceId(id);
    setRegencyId("");
    setDistrictId("");
    setVillageId("");
    setRegencies([]);
    setDistricts([]);
    setVillages([]);

    if (!id) return;
    setFetchError(false);
    setLoading((s) => ({ ...s, regencies: true }));
    fetchRegion<Regency[]>("regencies", id)
      .then((data) => setRegencies(data))
      .catch((err) => {
        setFetchError(true);
        setLastErrorMessage(err instanceof Error ? err.message : String(err));
      })
      .finally(() => setLoading((s) => ({ ...s, regencies: false })));
  }, []);

  const selectRegency = useCallback((id: string) => {
    setRegencyId(id);
    setDistrictId("");
    setVillageId("");
    setDistricts([]);
    setVillages([]);

    if (!id) return;
    setFetchError(false);
    setLoading((s) => ({ ...s, districts: true }));
    fetchRegion<District[]>("districts", id)
      .then((data) => setDistricts(data))
      .catch((err) => {
        setFetchError(true);
        setLastErrorMessage(err instanceof Error ? err.message : String(err));
      })
      .finally(() => setLoading((s) => ({ ...s, districts: false })));
  }, []);

  const selectDistrict = useCallback((id: string) => {
    setDistrictId(id);
    setVillageId("");
    setVillages([]);

    if (!id) return;
    setFetchError(false);
    setLoading((s) => ({ ...s, villages: true }));
    fetchRegion<Village[]>("villages", id)
      .then((data) => setVillages(data))
      .catch((err) => {
        setFetchError(true);
        setLastErrorMessage(err instanceof Error ? err.message : String(err));
      })
      .finally(() => setLoading((s) => ({ ...s, villages: false })));
  }, []);

  const selectVillage = useCallback((id: string) => {
    setVillageId(id);
  }, []);

  const selectedNames = {
    province: provinces.find((p) => p.id === provinceId)?.name ?? "",
    regency: regencies.find((r) => r.id === regencyId)?.name ?? "",
    district: districts.find((d) => d.id === districtId)?.name ?? "",
    village: villages.find((v) => v.id === villageId)?.name ?? "",
  };

  return {
    provinces,
    regencies,
    districts,
    villages,
    provinceId,
    regencyId,
    districtId,
    villageId,
    selectProvince,
    selectRegency,
    selectDistrict,
    selectVillage,
    selectedNames,
    loading,
    fetchError,
    lastErrorMessage,
    retryLoadProvinces: loadProvinces,
  };
}
