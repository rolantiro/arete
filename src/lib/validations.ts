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
