-- =========================================================
-- ARÉTÉ — Brand collaborations / showcase gallery
-- Lets an admin publish photos of past collabs, events, and
-- upcoming ("coming soon") projects. Each item is independently
-- either purely a showcase (no purchase link) or linked to a real
-- product for sale.
-- =========================================================

create table if not exists public.collaborations (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text not null unique,
  description text not null default '',
  images jsonb not null default '[]'::jsonb, -- array of { url, alt, sort_order }, same shape as products.images

  status text not null default 'selesai'
    check (status in ('selesai', 'coming_soon')),

  -- When is_for_sale is true, product_id should point at a real
  -- product so the storefront can link "Beli Sekarang" to it.
  -- When false, the item is showcase-only and product_id is
  -- ignored even if set.
  is_for_sale boolean not null default false,
  product_id uuid references public.products(id) on delete set null,

  partner_name text, -- e.g. the brand/event collaborated with
  sort_order integer not null default 0,
  is_published boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_collaborations_published on public.collaborations(is_published);
create index if not exists idx_collaborations_status on public.collaborations(status);

drop trigger if exists trg_collaborations_updated_at on public.collaborations;
create trigger trg_collaborations_updated_at before update on public.collaborations
  for each row execute function public.touch_updated_at();

-- =========================================================
-- RLS: public read of published items, admin-only write
-- =========================================================
alter table public.collaborations enable row level security;

drop policy if exists "Public can read published collaborations" on public.collaborations;
create policy "Public can read published collaborations"
  on public.collaborations for select
  using (is_published = true or public.is_admin());

drop policy if exists "Admins can insert collaborations" on public.collaborations;
create policy "Admins can insert collaborations"
  on public.collaborations for insert
  with check (public.is_admin());

drop policy if exists "Admins can update collaborations" on public.collaborations;
create policy "Admins can update collaborations"
  on public.collaborations for update
  using (public.is_admin());

drop policy if exists "Admins can delete collaborations" on public.collaborations;
create policy "Admins can delete collaborations"
  on public.collaborations for delete
  using (public.is_admin());
