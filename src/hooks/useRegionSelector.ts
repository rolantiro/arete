"use client";

import { useEffect, useState, useCallback } from "react";
import type { Province, Regency, District, Village } from "@/types/region";

const BASE_URL = "https://emsifa.github.io/api-wilayah-indonesia/api";

/**
 * Cascading Indonesia region selector state (provinsi -> kota/
 * kabupaten -> kecamatan -> kelurahan), backed by the free,
 * keyless emsifa/api-wilayah-indonesia static API. Each level
 * only fetches once its parent is selected, and resets all
 * descendant selections whenever a parent changes.
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

  // Load provinces once on mount
  useEffect(() => {
    setLoading((s) => ({ ...s, provinces: true }));
    fetch(`${BASE_URL}/provinces.json`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load provinces");
        return res.json();
      })
      .then((data: Province[]) => setProvinces(data))
      .catch(() => setFetchError(true))
      .finally(() => setLoading((s) => ({ ...s, provinces: false })));
  }, []);

  const selectProvince = useCallback((id: string) => {
    setProvinceId(id);
    setRegencyId("");
    setDistrictId("");
    setVillageId("");
    setRegencies([]);
    setDistricts([]);
    setVillages([]);

    if (!id) return;
    setLoading((s) => ({ ...s, regencies: true }));
    fetch(`${BASE_URL}/regencies/${id}.json`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load regencies");
        return res.json();
      })
      .then((data: Regency[]) => setRegencies(data))
      .catch(() => setFetchError(true))
      .finally(() => setLoading((s) => ({ ...s, regencies: false })));
  }, []);

  const selectRegency = useCallback((id: string) => {
    setRegencyId(id);
    setDistrictId("");
    setVillageId("");
    setDistricts([]);
    setVillages([]);

    if (!id) return;
    setLoading((s) => ({ ...s, districts: true }));
    fetch(`${BASE_URL}/districts/${id}.json`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load districts");
        return res.json();
      })
      .then((data: District[]) => setDistricts(data))
      .catch(() => setFetchError(true))
      .finally(() => setLoading((s) => ({ ...s, districts: false })));
  }, []);

  const selectDistrict = useCallback((id: string) => {
    setDistrictId(id);
    setVillageId("");
    setVillages([]);

    if (!id) return;
    setLoading((s) => ({ ...s, villages: true }));
    fetch(`${BASE_URL}/villages/${id}.json`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load villages");
        return res.json();
      })
      .then((data: Village[]) => setVillages(data))
      .catch(() => setFetchError(true))
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
  };
}
