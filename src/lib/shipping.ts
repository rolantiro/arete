/**
 * Shipping cost estimates shown to the customer at checkout.
 * These are informational ranges only — the exact shipping cost
 * is filled in by an admin during order verification (see
 * shipping_cost on the orders table). Province names from the
 * region API are matched (case-insensitively, substring) against
 * `provinces` below to pick the right estimate row.
 */
export type ShippingEstimate = {
  zone: string;
  label: string;
  min: number;
  max: number;
  /** Province name fragments (uppercase) that belong to this zone */
  provinces: string[];
};

export const SHIPPING_ESTIMATES: ShippingEstimate[] = [
  {
    zone: "lampung",
    label: "Dalam Lampung",
    min: 10000,
    max: 25000,
    provinces: ["LAMPUNG"],
  },
  {
    zone: "sumatera",
    label: "Sumatera",
    min: 20000,
    max: 45000,
    provinces: [
      "ACEH",
      "SUMATERA UTARA",
      "SUMATERA BARAT",
      "RIAU",
      "KEPULAUAN RIAU",
      "JAMBI",
      "SUMATERA SELATAN",
      "BANGKA BELITUNG",
      "BENGKULU",
    ],
  },
  {
    zone: "jawa",
    label: "Pulau Jawa",
    min: 20000,
    max: 40000,
    provinces: [
      "DKI JAKARTA",
      "JAWA BARAT",
      "JAWA TENGAH",
      "JAWA TIMUR",
      "BANTEN",
      "DAERAH ISTIMEWA YOGYAKARTA",
      "DI YOGYAKARTA",
    ],
  },
  {
    zone: "bali",
    label: "Bali",
    min: 30000,
    max: 50000,
    provinces: ["BALI"],
  },
  {
    zone: "kalimantan",
    label: "Kalimantan",
    min: 35000,
    max: 60000,
    provinces: [
      "KALIMANTAN BARAT",
      "KALIMANTAN TENGAH",
      "KALIMANTAN SELATAN",
      "KALIMANTAN TIMUR",
      "KALIMANTAN UTARA",
    ],
  },
  {
    zone: "sulawesi",
    label: "Sulawesi",
    min: 40000,
    max: 70000,
    provinces: [
      "SULAWESI UTARA",
      "SULAWESI TENGAH",
      "SULAWESI SELATAN",
      "SULAWESI TENGGARA",
      "GORONTALO",
      "SULAWESI BARAT",
    ],
  },
  {
    zone: "nusa_tenggara",
    label: "Nusa Tenggara",
    min: 45000,
    max: 75000,
    provinces: ["NUSA TENGGARA BARAT", "NUSA TENGGARA TIMUR"],
  },
  {
    zone: "maluku",
    label: "Maluku",
    min: 50000,
    max: 90000,
    provinces: ["MALUKU", "MALUKU UTARA"],
  },
  {
    zone: "papua",
    label: "Papua",
    min: 60000,
    max: 120000,
    provinces: [
      "PAPUA",
      "PAPUA BARAT",
      "PAPUA TENGAH",
      "PAPUA PEGUNUNGAN",
      "PAPUA SELATAN",
      "PAPUA BARAT DAYA",
    ],
  },
];

const DEFAULT_ESTIMATE: ShippingEstimate = {
  zone: "lainnya",
  label: "Wilayah Lainnya",
  min: 20000,
  max: 90000,
  provinces: [],
};

export function getShippingEstimate(provinceName: string): ShippingEstimate {
  const upper = provinceName.toUpperCase();
  for (const estimate of SHIPPING_ESTIMATES) {
    if (estimate.provinces.some((p) => upper.includes(p) || p.includes(upper))) {
      return estimate;
    }
  }
  return DEFAULT_ESTIMATE;
}
