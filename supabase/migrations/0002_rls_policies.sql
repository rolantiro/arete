-- =========================================================
-- ARÉTÉ — Row Level Security policies
-- Rule of thumb:
--   - Public (anon) can READ catalog data (products, categories,
--     website_content, website_images) and manage their OWN
--     cart/wishlist rows (scoped by session_id, enforced at the
--     API layer since session_id is an app-generated cookie, not
--     a Supabase Auth uid).
--   - Only authenticated admins (rows present in public.admins)
--     can WRITE products, categories, website_content,
--     website_images, and read/manage the admins table itself.
-- =========================================================

alter table public.admins enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.website_content enable row level security;
alter table public.website_images enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlist_items enable row level security;

-- ---------------------------------------------------------
-- Helper: is the current auth.uid() a registered admin?
-- ---------------------------------------------------------
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.admins where id = auth.uid()
  );
$$ language sql stable security definer;

-- =========================================================
-- ADMINS
-- =========================================================
drop policy if exists "Admins can read own profile" on public.admins;
create policy "Admins can read own profile"
  on public.admins for select
  using (auth.uid() = id or public.is_admin());

drop policy if exists "Admins can update own profile" on public.admins;
create policy "Admins can update own profile"
  on public.admins for update
  using (auth.uid() = id);

-- Inserting new admin rows is intentionally NOT exposed to clients.
-- Create admins via Supabase Dashboard / service role only.

-- =========================================================
-- CATEGORIES — public read, admin write
-- =========================================================
drop policy if exists "Public can read categories" on public.categories;
create policy "Public can read categories"
  on public.categories for select
  using (true);

drop policy if exists "Admins can insert categories" on public.categories;
create policy "Admins can insert categories"
  on public.categories for insert
  with check (public.is_admin());

drop policy if exists "Admins can update categories" on public.categories;
create policy "Admins can update categories"
  on public.categories for update
  using (public.is_admin());

drop policy if exists "Admins can delete categories" on public.categories;
create policy "Admins can delete categories"
  on public.categories for delete
  using (public.is_admin());

-- =========================================================
-- PRODUCTS — public read active products, admin full access
-- =========================================================
drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
  on public.products for select
  using (is_active = true or public.is_admin());

drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products"
  on public.products for insert
  with check (public.is_admin());

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products"
  on public.products for update
  using (public.is_admin());

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products"
  on public.products for delete
  using (public.is_admin());

-- =========================================================
-- WEBSITE_CONTENT — public read, admin write
-- =========================================================
drop policy if exists "Public can read website content" on public.website_content;
create policy "Public can read website content"
  on public.website_content for select
  using (true);

drop policy if exists "Admins can upsert website content" on public.website_content;
create policy "Admins can insert website content"
  on public.website_content for insert
  with check (public.is_admin());

create policy "Admins can update website content"
  on public.website_content for update
  using (public.is_admin());

create policy "Admins can delete website content"
  on public.website_content for delete
  using (public.is_admin());

-- =========================================================
-- WEBSITE_IMAGES — public read, admin write
-- =========================================================
drop policy if exists "Public can read website images" on public.website_images;
create policy "Public can read website images"
  on public.website_images for select
  using (true);

drop policy if exists "Admins can insert website images" on public.website_images;
create policy "Admins can insert website images"
  on public.website_images for insert
  with check (public.is_admin());

drop policy if exists "Admins can update website images" on public.website_images;
create policy "Admins can update website images"
  on public.website_images for update
  using (public.is_admin());

drop policy if exists "Admins can delete website images" on public.website_images;
create policy "Admins can delete website images"
  on public.website_images for delete
  using (public.is_admin());

-- =========================================================
-- CART_ITEMS — open read/write (session-scoped at API layer).
-- Anonymous customers never authenticate, so RLS can only gate
-- by row shape; the API routes enforce session_id ownership
-- using an httpOnly cookie that the client cannot forge.
-- =========================================================
drop policy if exists "Anyone can manage cart items" on public.cart_items;
create policy "Anyone can read cart items"
  on public.cart_items for select using (true);
create policy "Anyone can insert cart items"
  on public.cart_items for insert with check (true);
create policy "Anyone can update cart items"
  on public.cart_items for update using (true);
create policy "Anyone can delete cart items"
  on public.cart_items for delete using (true);

-- =========================================================
-- WISHLIST_ITEMS — same pattern as cart_items
-- =========================================================
drop policy if exists "Anyone can manage wishlist items" on public.wishlist_items;
create policy "Anyone can read wishlist items"
  on public.wishlist_items for select using (true);
create policy "Anyone can insert wishlist items"
  on public.wishlist_items for insert with check (true);
create policy "Anyone can update wishlist items"
  on public.wishlist_items for update using (true);
create policy "Anyone can delete wishlist items"
  on public.wishlist_items for delete using (true);
