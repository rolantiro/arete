// =========================================================
// Core domain types — mirrors the Supabase schema in
// supabase/migrations/0001_init_schema.sql
// =========================================================

export type ProductImage = {
  url: string;
  alt: string;
  sort_order: number;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  sku: string | null;
  stock: number;
  category_id: string | null;
  images: ProductImage[];
  sizes: string[];
  colors: string[];
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Populated via join when fetched with category info
  category?: Category | null;
};

export type Admin = {
  id: string;
  full_name: string;
  role: "admin" | "super_admin";
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type WebsiteContentRow = {
  id: string;
  section: string;
  key: string;
  value: string;
  updated_at: string;
};

export type WebsiteImageRow = {
  id: string;
  slot: string;
  url: string;
  alt: string;
  updated_at: string;
};

export type CartItem = {
  id: string;
  session_id: string;
  product_id: string;
  size: string | null;
  color: string | null;
  quantity: number;
  created_at: string;
  updated_at: string;
  product?: Product;
};

export type WishlistItem = {
  id: string;
  session_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
};

// =========================================================
// Helper shape: website copy flattened into a nested object,
// e.g. content.hero.title, content.footer.email
// =========================================================
export type WebsiteContentMap = Record<string, Record<string, string>>;
export type WebsiteImageMap = Record<string, { url: string; alt: string }>;
