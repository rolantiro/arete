-- =========================================================
-- ARÉTÉ — Pre-order support
-- Lets an admin mark a product as pre-order and set how many
-- days production/shipping is expected to take (1-20 days).
-- When is_preorder is false, preorder_days is irrelevant and the
-- storefront shows normal in-stock behavior.
-- =========================================================

alter table public.products
  add column if not exists is_preorder boolean not null default false;

alter table public.products
  add column if not exists preorder_days integer
    check (preorder_days is null or (preorder_days >= 1 and preorder_days <= 20));

comment on column public.products.is_preorder is
  'When true, the storefront shows a pre-order badge and estimated wait time instead of normal stock messaging.';
comment on column public.products.preorder_days is
  'Estimated number of days (1-20) until a pre-ordered item ships, set by an admin.';
