-- =========================================================
-- ARÉTÉ — Collaboration Instagram link
-- Lets an admin attach an Instagram post/profile URL to a
-- collaboration item, shown on the collaboration detail page as
-- a "Lihat di Instagram" link.
-- =========================================================

alter table public.collaborations
  add column if not exists instagram_url text;

comment on column public.collaborations.instagram_url is
  'Optional Instagram post or profile URL related to this collaboration, shown on its detail page.';
