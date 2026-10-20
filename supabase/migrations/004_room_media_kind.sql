-- Migración 004: room_images admite también vídeos (kind = 'video').
-- Ejecutar en Supabase > SQL Editor (idempotente).
alter table public.room_images add column if not exists kind text not null default 'image';
alter table public.room_images drop constraint if exists room_images_kind_check;
alter table public.room_images add constraint room_images_kind_check check (kind in ('image', 'video'));
create index if not exists room_images_kind_idx on public.room_images (flat_id, kind, position);
