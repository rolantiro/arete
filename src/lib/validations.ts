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
