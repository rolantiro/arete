-- =========================================================
-- ARÉTÉ — Sold status (archived but still visible)
--
-- Distinct from stock=0: a product can be marked is_sold by an
-- admin to permanently retire it from purchase while keeping it
-- visible in the catalog as a record of past monthly collections.
-- Unlike running out of stock (which can be restocked), is_sold is
-- a deliberate, admin-set archival flag — the storefront shows a
-- "Sold" badge instead of "Stok Habis" and disables purchase
-- regardless of the stock count underneath it.
-- =========================================================

alter table public.products
  add column if not exists is_sold boolean not null default false;

comment on column public.products.is_sold is
  'Admin-set archival flag: product stays visible in the catalog as a record of past collections, but cannot be purchased. Independent of stock — a restock does not clear this.';
