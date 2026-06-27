-- =========================================================
-- ARÉTÉ — Multi-image banner & about section
--
-- website_images previously stored exactly one url per slot. The
-- homepage banner and "Tentang Kami" image now need to support a
-- *set* of images (rendered as a slideshow/carousel). Rather than
-- replacing the single `url` column (which would break the
-- existing single-image slots like `logo` that should stay
-- single-image), we add a sibling `urls` jsonb column that holds
-- an ordered array of { url, alt } and is only used by slots that
-- opt into multi-image behavior (banner_home, about_image).
--
-- `url` is kept for backward compatibility (e.g. `logo`, and as a
-- fallback/first-image mirror for existing rows) — application
-- code reads `urls` when present and non-empty, else falls back
-- to wrapping the single `url` in a one-item array.
-- =========================================================

alter table public.website_images
  add column if not exists urls jsonb not null default '[]'::jsonb;

comment on column public.website_images.urls is
  'Ordered array of {url, alt} objects for multi-image slots (banner_home, about_image). Slots like "logo" leave this empty and use the single `url` column instead.';

-- Backfill: copy any existing single-image rows into `urls` so
-- slots that get upgraded to multi-image behavior in the app
-- immediately show their pre-existing image as the first slide
-- instead of appearing empty.
update public.website_images
set urls = jsonb_build_array(jsonb_build_object('url', url, 'alt', alt))
where url is not null and url <> '' and (urls is null or urls = '[]'::jsonb);
