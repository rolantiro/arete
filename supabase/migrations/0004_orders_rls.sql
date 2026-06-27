-- =========================================================
-- ARÉTÉ — RLS for orders & order_items
--
-- Customers never authenticate, so an order can't be scoped to a
-- user the way cart_items/wishlist_items are scoped to a guest
-- session. Instead: anyone can INSERT a new order (submitting
-- checkout), but only admins can SELECT/UPDATE/DELETE — a
-- customer has no way to read order data back, by design, which
-- avoids leaking other customers' names/addresses/payment proof
-- through a guessable order id.
-- =========================================================

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- ORDERS
drop policy if exists "Anyone can create an order" on public.orders;
create policy "Anyone can create an order"
  on public.orders for insert
  with check (true);

drop policy if exists "Admins can read orders" on public.orders;
create policy "Admins can read orders"
  on public.orders for select
  using (public.is_admin());

drop policy if exists "Admins can update orders" on public.orders;
create policy "Admins can update orders"
  on public.orders for update
  using (public.is_admin());

drop policy if exists "Admins can delete orders" on public.orders;
create policy "Admins can delete orders"
  on public.orders for delete
  using (public.is_admin());

-- ORDER_ITEMS
drop policy if exists "Anyone can create order items" on public.order_items;
create policy "Anyone can create order items"
  on public.order_items for insert
  with check (true);

drop policy if exists "Admins can read order items" on public.order_items;
create policy "Admins can read order items"
  on public.order_items for select
  using (public.is_admin());

drop policy if exists "Admins can delete order items" on public.order_items;
create policy "Admins can delete order items"
  on public.order_items for delete
  using (public.is_admin());

-- =========================================================
-- Storage: payment proof uploads (separate folder within the
-- existing `media` bucket, public-read so admins can view proof
-- images directly via URL, but only the checkout API — using the
-- service role — is allowed to write here, never the browser
-- directly with the anon key.
-- =========================================================
drop policy if exists "Public read payment proofs" on storage.objects;
create policy "Public read payment proofs"
  on storage.objects for select
  using (bucket_id = 'media');
