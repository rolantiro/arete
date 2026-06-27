-- =========================================================
-- ARÉTÉ — Premium Fashion Store
-- Initial schema migration
-- =========================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =========================================================
-- TABLE: admins
-- Profile table linked 1:1 to Supabase Auth users (auth.users)
-- =========================================================
create table if not exists public.admins (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default 'Admin',
  role text not null default 'admin' check (role in ('admin', 'super_admin')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.admins is 'Admin profiles linked to Supabase Auth users. Only rows here may manage the store.';

-- =========================================================
-- TABLE: categories
-- =========================================================
create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- TABLE: products
-- =========================================================
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  price numeric(12,2) not null default 0 check (price >= 0),
  compare_at_price numeric(12,2) check (compare_at_price is null or compare_at_price >= 0),
  sku text unique,
  stock integer not null default 0 check (stock >= 0),
  category_id uuid references public.categories(id) on delete set null,
  images jsonb not null default '[]'::jsonb, -- array of { url, alt, sort_order }
  sizes jsonb not null default '[]'::jsonb,  -- array of size strings, e.g. ["S","M","L","XL"]
  colors jsonb not null default '[]'::jsonb, -- array of color strings/hex
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_active on public.products(is_active);
create index if not exists idx_products_featured on public.products(is_featured);

-- =========================================================
-- TABLE: website_content
-- Generic key-value store for all editable site copy
-- (hero title, hero subtitle, about text, footer text, etc.)
-- =========================================================
create table if not exists public.website_content (
  id uuid primary key default uuid_generate_v4(),
  section text not null,        -- e.g. 'hero', 'about', 'footer', 'navbar'
  key text not null,            -- e.g. 'title', 'subtitle', 'cta_label'
  value text not null default '',
  updated_at timestamptz not null default now(),
  unique (section, key)
);

-- =========================================================
-- TABLE: website_images
-- Generic store for all editable images (banner, logo, etc.)
-- =========================================================
create table if not exists public.website_images (
  id uuid primary key default uuid_generate_v4(),
  slot text not null unique,    -- e.g. 'logo', 'banner_home', 'about_image'
  url text not null,
  alt text not null default '',
  updated_at timestamptz not null default now()
);

-- =========================================================
-- TABLE: cart_items
-- Carts are keyed by a session_id (cookie) for guests,
-- so checkout works without forcing customer login.
-- =========================================================
create table if not exists public.cart_items (
  id uuid primary key default uuid_generate_v4(),
  session_id text not null,
  product_id uuid not null references public.products(id) on delete cascade,
  size text,
  color text,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, product_id, size, color)
);

create index if not exists idx_cart_session on public.cart_items(session_id);

-- =========================================================
-- TABLE: wishlist_items
-- =========================================================
create table if not exists public.wishlist_items (
  id uuid primary key default uuid_generate_v4(),
  session_id text not null,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (session_id, product_id)
);

create index if not exists idx_wishlist_session on public.wishlist_items(session_id);

-- =========================================================
-- updated_at auto-touch trigger
-- =========================================================
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_admins_updated_at on public.admins;
create trigger trg_admins_updated_at before update on public.admins
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_categories_updated_at on public.categories;
create trigger trg_categories_updated_at before update on public.categories
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at before update on public.products
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_website_content_updated_at on public.website_content;
create trigger trg_website_content_updated_at before update on public.website_content
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_website_images_updated_at on public.website_images;
create trigger trg_website_images_updated_at before update on public.website_images
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_cart_items_updated_at on public.cart_items;
create trigger trg_cart_items_updated_at before update on public.cart_items
  for each row execute function public.touch_updated_at();
