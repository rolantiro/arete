-- =========================================================
-- ARÉTÉ — Seed data
-- Populates categories, sample products, and default website
-- copy/images so the storefront isn't empty on first run.
-- =========================================================

-- Storage bucket for product & site media (public read)
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "Public read media bucket" on storage.objects;
create policy "Public read media bucket"
  on storage.objects for select
  using (bucket_id = 'media');

drop policy if exists "Admins upload media" on storage.objects;
create policy "Admins upload media"
  on storage.objects for insert
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "Admins update media" on storage.objects;
create policy "Admins update media"
  on storage.objects for update
  using (bucket_id = 'media' and public.is_admin());

drop policy if exists "Admins delete media" on storage.objects;
create policy "Admins delete media"
  on storage.objects for delete
  using (bucket_id = 'media' and public.is_admin());

-- ---------------------------------------------------------
-- Categories
-- ---------------------------------------------------------
insert into public.categories (name, slug, description, sort_order) values
  ('Outerwear', 'outerwear', 'Mantel dan jaket dengan potongan presisi.', 1),
  ('Atasan', 'atasan', 'Kemeja dan blus berbahan premium.', 2),
  ('Bawahan', 'bawahan', 'Celana dan rok dengan jatuhan kain yang sempurna.', 3),
  ('Aksesori', 'aksesori', 'Detail penutup yang menyempurnakan tampilan.', 4)
on conflict (slug) do nothing;

-- ---------------------------------------------------------
-- Sample products
-- ---------------------------------------------------------
insert into public.products (name, slug, description, price, compare_at_price, sku, stock, category_id, images, sizes, colors, is_featured, is_active)
select
  'Wool Tailored Coat',
  'wool-tailored-coat',
  'Mantel wol dengan potongan tailored, dilapisi sutra di bagian dalam. Dibuat untuk menemani musim dingin dengan gaya yang tidak lekang waktu.',
  2890000, 3450000, 'ART-OW-001', 12,
  (select id from public.categories where slug = 'outerwear'),
  '[{"url":"https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=1200","alt":"Wool Tailored Coat","sort_order":0}]'::jsonb,
  '["S","M","L","XL"]'::jsonb,
  '["Black","Camel"]'::jsonb,
  true, true
on conflict (slug) do nothing;

insert into public.products (name, slug, description, price, compare_at_price, sku, stock, category_id, images, sizes, colors, is_featured, is_active)
select
  'Silk Blend Shirt',
  'silk-blend-shirt',
  'Kemeja silk-blend dengan jatuhan ringan dan kerah minimalis. Cocok untuk acara formal maupun santai.',
  1290000, null, 'ART-AT-002', 25,
  (select id from public.categories where slug = 'atasan'),
  '[{"url":"https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1200","alt":"Silk Blend Shirt","sort_order":0}]'::jsonb,
  '["XS","S","M","L"]'::jsonb,
  '["White","Ivory"]'::jsonb,
  true, true
on conflict (slug) do nothing;

insert into public.products (name, slug, description, price, compare_at_price, sku, stock, category_id, images, sizes, colors, is_featured, is_active)
select
  'Straight Cut Trousers',
  'straight-cut-trousers',
  'Celana straight cut berbahan wol ringan, dirancang untuk siluet yang bersih dan elegan.',
  1590000, null, 'ART-BW-003', 18,
  (select id from public.categories where slug = 'bawahan'),
  '[{"url":"https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=1200","alt":"Straight Cut Trousers","sort_order":0}]'::jsonb,
  '["S","M","L","XL"]'::jsonb,
  '["Black","Grey"]'::jsonb,
  false, true
on conflict (slug) do nothing;

insert into public.products (name, slug, description, price, compare_at_price, sku, stock, category_id, images, sizes, colors, is_featured, is_active)
select
  'Leather Belt Classic',
  'leather-belt-classic',
  'Sabuk kulit asli dengan gesper logam matte, detail jahitan tangan.',
  690000, 850000, 'ART-AC-004', 40,
  (select id from public.categories where slug = 'aksesori'),
  '[{"url":"https://images.unsplash.com/photo-1624222247344-550fb60583dc?q=80&w=1200","alt":"Leather Belt Classic","sort_order":0}]'::jsonb,
  '["S","M","L"]'::jsonb,
  '["Black","Brown"]'::jsonb,
  false, true
on conflict (slug) do nothing;

insert into public.products (name, slug, description, price, compare_at_price, sku, stock, category_id, images, sizes, colors, is_featured, is_active)
select
  'Cashmere Sweater',
  'cashmere-sweater',
  'Sweater cashmere lembut dengan rajutan rapat, hangat tanpa terasa berat.',
  2190000, null, 'ART-AT-005', 15,
  (select id from public.categories where slug = 'atasan'),
  '[{"url":"https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1200","alt":"Cashmere Sweater","sort_order":0}]'::jsonb,
  '["S","M","L"]'::jsonb,
  '["Beige","Charcoal"]'::jsonb,
  true, true
on conflict (slug) do nothing;

insert into public.products (name, slug, description, price, compare_at_price, sku, stock, category_id, images, sizes, colors, is_featured, is_active)
select
  'Pleated Midi Skirt',
  'pleated-midi-skirt',
  'Rok midi plisket dengan jatuhan dinamis saat bergerak, berbahan satin ringan.',
  1450000, null, 'ART-BW-006', 0,
  (select id from public.categories where slug = 'bawahan'),
  '[{"url":"https://images.unsplash.com/photo-1583496661160-fb5886a13d77?q=80&w=1200","alt":"Pleated Midi Skirt","sort_order":0}]'::jsonb,
  '["XS","S","M"]'::jsonb,
  '["Black"]'::jsonb,
  false, true
on conflict (slug) do nothing;

-- ---------------------------------------------------------
-- Website content (editable copy)
-- ---------------------------------------------------------
insert into public.website_content (section, key, value) values
  ('hero', 'eyebrow', 'Koleksi 2026'),
  ('hero', 'title', 'Kemewahan Yang Tenang'),
  ('hero', 'subtitle', 'Pakaian premium untuk mereka yang memilih detail di atas kebisingan.'),
  ('hero', 'cta_label', 'Jelajahi Koleksi'),
  ('about', 'title', 'Filosofi Kami'),
  ('about', 'body', 'ARÉTÉ lahir dari satu keyakinan sederhana: kualitas tidak pernah berteriak. Setiap potongan dirancang dengan presisi, menggunakan material yang dipilih secara cermat dan dijahit untuk bertahan lebih dari satu musim tren.'),
  ('footer', 'tagline', 'Pakaian premium untuk keseharian yang penuh arti.'),
  ('footer', 'address', 'Jakarta, Indonesia'),
  ('footer', 'email', 'hello@arete.id'),
  ('footer', 'phone', '+62 812 0000 0000'),
  ('navbar', 'brand_name', 'ARÉTÉ'),
  ('seo', 'site_title', 'ARÉTÉ — Premium Fashion House'),
  ('seo', 'site_description', 'ARÉTÉ adalah rumah mode premium yang menghadirkan koleksi pakaian dengan desain bersih, bahan pilihan, dan detail yang tak tergesa.')
on conflict (section, key) do nothing;

-- ---------------------------------------------------------
-- Website images (banner, logo placeholders)
-- ---------------------------------------------------------
insert into public.website_images (slot, url, alt) values
  ('logo', '', 'ARÉTÉ'),
  ('banner_home', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000', 'Koleksi ARÉTÉ'),
  ('about_image', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1400', 'Studio ARÉTÉ')
on conflict (slot) do nothing;
