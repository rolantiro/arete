import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const productSchema = z.object({
  name: z.string().min(2, "Nama produk minimal 2 karakter"),
  slug: z
    .string()
    .min(2, "Slug minimal 2 karakter")
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan tanda hubung"),
  description: z.string().default(""),
  price: z.coerce.number().min(0, "Harga tidak boleh negatif"),
  compare_at_price: z.coerce.number().min(0).nullable().optional(),
  sku: z.string().nullable().optional(),
  stock: z.coerce.number().int().min(0, "Stok tidak boleh negatif"),
  category_id: z.string().uuid().nullable().optional(),
  sizes: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
  is_preorder: z.boolean().default(false),
  is_sold: z.boolean().default(false),
  preorder_days: z.coerce
    .number()
    .int()
    .min(1, "Estimasi pre-order minimal 1 hari")
    .max(20, "Estimasi pre-order maksimal 20 hari")
    .nullable()
    .optional(),
});
export type ProductInput = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  name: z.string().min(2, "Nama kategori minimal 2 karakter"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan tanda hubung"),
  description: z.string().nullable().optional(),
  sort_order: z.coerce.number().int().default(0),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const checkoutSchema = z.object({
  full_name: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  whatsapp: z
    .string()
    .min(9, "Nomor WhatsApp tidak valid")
    .regex(/^[0-9+\-\s]+$/, "Nomor WhatsApp hanya boleh angka"),
  notes: z.string().optional().or(z.literal("")),

  province_id: z.string().min(1, "Provinsi wajib dipilih"),
  province_name: z.string().min(1),
  regency_id: z.string().min(1, "Kota/Kabupaten wajib dipilih"),
  regency_name: z.string().min(1),
  district_id: z.string().min(1, "Kecamatan wajib dipilih"),
  district_name: z.string().min(1),
  village_id: z.string().min(1, "Kelurahan wajib dipilih"),
  village_name: z.string().min(1),
  postal_code: z.string().optional().or(z.literal("")),
  address_detail: z.string().min(10, "Alamat lengkap minimal 10 karakter"),
  landmark: z.string().optional().or(z.literal("")),

  agreed_to_terms: z.literal(true, {
    message: "Anda harus menyetujui syarat pengiriman",
  }),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const collaborationSchema = z.object({
  title: z.string().min(2, "Judul minimal 2 karakter"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan tanda hubung"),
  description: z.string().default(""),
  status: z.enum(["selesai", "coming_soon"]).default("selesai"),
  is_for_sale: z.boolean().default(false),
  product_id: z.string().uuid().nullable().optional(),
  partner_name: z.string().nullable().optional(),
  instagram_url: z
    .string()
    .trim()
    .refine((v) => v === "" || /^https?:\/\/.+/i.test(v), {
      message: "Link Instagram harus berupa URL yang valid (diawali http:// atau https://)",
    })
    .nullable()
    .optional(),
  sort_order: z.coerce.number().int().default(0),
  is_published: z.boolean().default(true),
});
export type CollaborationInput = z.infer<typeof collaborationSchema>;

export const voucherSchema = z
  .object({
    code: z
      .string()
      .min(3, "Kode minimal 3 karakter")
      .max(30, "Kode maksimal 30 karakter")
      .regex(/^[A-Za-z0-9_-]+$/, "Kode hanya boleh huruf, angka, - dan _")
      .transform((v) => v.toUpperCase()),
    description: z.string().nullable().optional(),
    discount_type: z.enum(["amount", "percent", "free_shipping"]),
    discount_amount: z.coerce.number().min(0).nullable().optional(),
    discount_percent: z.coerce.number().min(0.01).max(100).nullable().optional(),
    min_purchase: z.coerce.number().min(0).default(0),
    max_uses: z.coerce.number().int().min(1).nullable().optional(),
    starts_at: z.string().nullable().optional(),
    expires_at: z.string().nullable().optional(),
    is_active: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    if (data.discount_type === "amount" && !data.discount_amount) {
      ctx.addIssue({
        code: "custom",
        path: ["discount_amount"],
        message: "Nominal potongan wajib diisi untuk tipe ini",
      });
    }
    if (data.discount_type === "percent" && !data.discount_percent) {
      ctx.addIssue({
        code: "custom",
        path: ["discount_percent"],
        message: "Persentase potongan wajib diisi untuk tipe ini",
      });
    }
  });
export type VoucherInput = z.infer<typeof voucherSchema>;
