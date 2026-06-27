-- =========================================================
-- ARÉTÉ — Checkout & Orders schema
-- Adds tables to support the checkout flow: buyer info,
-- shipping address, manual bank-transfer payment proof, and
-- the admin verification workflow.
-- =========================================================

-- =========================================================
-- TABLE: orders
-- One row per checkout submission. Shipping cost starts as an
-- estimate range string (informational) and is finalized by an
-- admin as a numeric value during verification.
-- =========================================================
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text not null unique,

  -- Buyer info
  full_name text not null,
  email text,
  whatsapp text not null,
  notes text,

  -- Shipping address (region API ids stored alongside their
  -- resolved names, so the order remains readable even if the
  -- upstream region API or ids ever change)
  province_id text not null,
  province_name text not null,
  regency_id text not null,
  regency_name text not null,
  district_id text not null,
  district_name text not null,
  village_id text not null,
  village_name text not null,
  postal_code text,
  address_detail text not null,
  landmark text,

  -- Payment (manual bank transfer)
  payment_method text not null default 'bank_transfer',
  payment_proof_url text,
  payment_verified boolean not null default false,
  payment_verified_at timestamptz,

  -- Shipping cost: customer sees an estimate range at checkout;
  -- admin fills in the exact amount during verification.
  shipping_estimate_label text,
  shipping_cost numeric(12,2),

  subtotal numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,

  status text not null default 'menunggu_verifikasi'
    check (status in (
      'menunggu_verifikasi',
      'diproses',
      'dikirim',
      'selesai',
      'dibatalkan'
    )),

  agreed_to_terms boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created_at on public.orders(created_at desc);

-- =========================================================
-- TABLE: order_items
-- Snapshot of product name/price/size/color at time of order,
-- so later edits to the product catalog never rewrite history.
-- =========================================================
create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_image_url text,
  size text,
  color text,
  quantity integer not null check (quantity > 0),
  price_at_purchase numeric(12,2) not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_order_items_order on public.order_items(order_id);

-- =========================================================
-- Auto-generate a human-friendly order number, e.g. ARETE-20260627-A1B2
-- =========================================================
create or replace function public.generate_order_number()
returns trigger as $$
begin
  if new.order_number is null or new.order_number = '' then
    new.order_number := 'ARETE-' || to_char(now(), 'YYYYMMDD') || '-' ||
      upper(substr(replace(uuid_generate_v4()::text, '-', ''), 1, 4));
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_orders_order_number on public.orders;
create trigger trg_orders_order_number
  before insert on public.orders
  for each row execute function public.generate_order_number();

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at before update on public.orders
  for each row execute function public.touch_updated_at();
