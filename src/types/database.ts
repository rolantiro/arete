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
  is_preorder: boolean;
  preorder_days: number | null;
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
  urls: ProductImage[];
  updated_at: string;
};

// =========================================================
// Collaborations / showcase gallery
// =========================================================
export type CollaborationStatus = "selesai" | "coming_soon";

export type Collaboration = {
  id: string;
  title: string;
  slug: string;
  description: string;
  images: ProductImage[];
  status: CollaborationStatus;
  is_for_sale: boolean;
  product_id: string | null;
  partner_name: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  product?: Product | null;
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
// Orders / Checkout
// =========================================================
export type OrderStatus =
  | "menunggu_verifikasi"
  | "diproses"
  | "dikirim"
  | "selesai"
  | "dibatalkan";

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image_url: string | null;
  size: string | null;
  color: string | null;
  quantity: number;
  price_at_purchase: number;
  created_at: string;
};

export type Order = {
  id: string;
  order_number: string;
  full_name: string;
  email: string | null;
  whatsapp: string;
  notes: string | null;
  province_id: string;
  province_name: string;
  regency_id: string;
  regency_name: string;
  district_id: string;
  district_name: string;
  village_id: string;
  village_name: string;
  postal_code: string | null;
  address_detail: string;
  landmark: string | null;
  payment_method: string;
  payment_proof_url: string | null;
  payment_verified: boolean;
  payment_verified_at: string | null;
  shipping_estimate_label: string | null;
  shipping_cost: number | null;
  subtotal: number;
  total: number;
  status: OrderStatus;
  agreed_to_terms: boolean;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
};

// =========================================================
// Helper shape: website copy flattened into a nested object,
// e.g. content.hero.title, content.footer.email
// =========================================================
export type WebsiteContentMap = Record<string, Record<string, string>>;
export type WebsiteImageMap = Record<string, { url: string; alt: string; urls: ProductImage[] }>;
