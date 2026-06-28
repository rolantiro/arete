-- =========================================================
-- ARÉTÉ — Voucher / discount codes
--
-- A voucher is exactly one of three types:
--   - discount_amount: a fixed Rupiah amount off the product subtotal
--   - discount_percent: a percentage off the product subtotal
--   - free_shipping: shipping cost becomes 0 once an admin sets it
--     during order verification (shipping isn't known precisely at
--     checkout time — see orders.shipping_cost — so a free-shipping
--     voucher is "promised" at checkout and actually zeroes out the
--     shipping line when the admin fills in the real shipping cost)
--
-- Percent and fixed-amount discounts are mutually exclusive on a
-- single voucher (one type per code) rather than stackable fields,
-- matching how the admin will configure a code: pick ONE discount
-- mechanism per voucher, not several behaviors bundled together.
-- =========================================================

create table if not exists public.vouchers (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  description text,

  discount_type text not null
    check (discount_type in ('amount', 'percent', 'free_shipping')),

  -- Only one of these is meaningful, depending on discount_type:
  discount_amount numeric(12,2) check (discount_amount is null or discount_amount >= 0),
  discount_percent numeric(5,2) check (discount_percent is null or (discount_percent > 0 and discount_percent <= 100)),

  min_purchase numeric(12,2) not null default 0 check (min_purchase >= 0),
  max_uses integer check (max_uses is null or max_uses > 0),
  used_count integer not null default 0 check (used_count >= 0),

  starts_at timestamptz,
  expires_at timestamptz,

  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_vouchers_code on public.vouchers(code);
create index if not exists idx_vouchers_active on public.vouchers(is_active);

drop trigger if exists trg_vouchers_updated_at on public.vouchers;
create trigger trg_vouchers_updated_at before update on public.vouchers
  for each row execute function public.touch_updated_at();

-- =========================================================
-- Atomic usage counter increment, called from the checkout API
-- after an order is successfully created. Using an RPC instead of
-- a read-then-write from the application avoids a race condition
-- where two simultaneous checkouts both read used_count=N and
-- both write N+1, silently losing one increment.
-- =========================================================
create or replace function public.increment_voucher_usage(voucher_id uuid)
returns void as $$
  update public.vouchers
  set used_count = used_count + 1
  where id = voucher_id;
$$ language sql security definer;

-- =========================================================
-- Link a voucher to the order it was used on, and record exactly
-- what discount it produced — so a later change/deletion of the
-- voucher itself never rewrites the historical order total.
-- =========================================================
alter table public.orders
  add column if not exists voucher_id uuid references public.vouchers(id) on delete set null;
alter table public.orders
  add column if not exists voucher_code text;
alter table public.orders
  add column if not exists discount_amount numeric(12,2) not null default 0;
alter table public.orders
  add column if not exists free_shipping boolean not null default false;

comment on column public.orders.voucher_code is
  'Snapshot of the voucher code text at order time, kept even if the voucher row is later deleted.';
comment on column public.orders.discount_amount is
  'Rupiah amount deducted from the product subtotal by a voucher (0 if none applied).';
comment on column public.orders.free_shipping is
  'When true, shipping_cost is forced to 0 once an admin fills it in during verification.';

-- =========================================================
-- RLS: public can read active vouchers ONLY to validate a code at
-- checkout (no listing — see the validate API route, which never
-- exposes the full table, just a yes/no + computed discount for
-- one specific code). Only admins can manage vouchers.
-- =========================================================
alter table public.vouchers enable row level security;

drop policy if exists "Public can read active vouchers for validation" on public.vouchers;
create policy "Public can read active vouchers for validation"
  on public.vouchers for select
  using (is_active = true or public.is_admin());

drop policy if exists "Admins can insert vouchers" on public.vouchers;
create policy "Admins can insert vouchers"
  on public.vouchers for insert
  with check (public.is_admin());

drop policy if exists "Admins can update vouchers" on public.vouchers;
create policy "Admins can update vouchers"
  on public.vouchers for update
  using (public.is_admin());

drop policy if exists "Admins can delete vouchers" on public.vouchers;
create policy "Admins can delete vouchers"
  on public.vouchers for delete
  using (public.is_admin());
