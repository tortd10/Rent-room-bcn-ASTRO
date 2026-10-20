-- Migración 002: traducciones EN, leads (formularios) e imágenes en Storage.
-- Ejecutar en Supabase > SQL Editor (idempotente).

-- ============ 16. Traducciones EN de habitaciones ============
alter table public.rooms add column if not exists "metaTitle_en" text;
alter table public.rooms add column if not exists "metaDescription_en" text;
alter table public.rooms add column if not exists "imageAlt_en" text;

update public.rooms set "imageAlt_en"='Furnished single room with desk in Zona Franca, Barcelona', "metaTitle_en"='Room for rent in Zona Franca, Barcelona | RentRoomBcn', "metaDescription_en"='Furnished room in Zona Franca, Sants-Montjuïc. 90x200 bed, desk, fibre WiFi, bills included. Minimum stay 2 months. Ask for information.' where slug='FFCC71-HAB1';
update public.rooms set "imageAlt_en"='Single room with wardrobe and window in a shared flat in Barcelona', "metaTitle_en"='Room in shared flat in Sants-Montjuïc, Barcelona | RentRoomBcn', "metaDescription_en"='Room in a quiet shared flat in Zona Franca, Barcelona. Furnished, WiFi included, shared bills. Contracts from 2 months. Check availability.' where slug='FFCC71-HAB2';
update public.rooms set "imageAlt_en"='Bright room with desk in a shared flat in Zona Franca', "metaTitle_en"='Room for rent near Barcelona airport | RentRoomBcn', "metaDescription_en"='Furnished room near Barcelona airport, in Zona Franca. Fibre WiFi, equipped kitchen, quiet flat. Minimum 2 months. Request information.' where slug='FFCC71-HAB3';
update public.rooms set "imageAlt_en"='Room with single bed and wardrobe in Zona Franca, Barcelona', "metaTitle_en"='Affordable room for rent in Zona Franca, Barcelona | RentRoomBcn', "metaDescription_en"='Affordable room in a shared flat in Zona Franca, Barcelona. Furnished, WiFi, shared bills included. Ideal for students and workers.' where slug='FFCC71-HAB4';
update public.rooms set "imageAlt_en"='Furnished single room in a shared flat near the port of Barcelona', "metaTitle_en"='Monthly room rental in Sants, Barcelona, no long commitment | RentRoomBcn', "metaDescription_en"='Monthly room rental in Sants-Montjuïc, Barcelona. Quiet, furnished flat with fibre WiFi. Flexible contract. Ask for information now.' where slug='FFCC71-HAB5';
update public.rooms set "imageAlt_en"='Furnished single room in Sants-Montjuïc, 10 minutes from central Barcelona', "metaTitle_en"='Room for rent in Sants, Barcelona, 10 minutes from the centre | RentRoomBcn', "metaDescription_en"='Single room in Sants-Montjuïc, 10 minutes from all services. Furnished, WiFi, equipped kitchen. Check availability.' where slug='RB219-HAB1';
update public.rooms set "imageAlt_en"='Room with desk and wardrobe in a shared flat in Sants, Barcelona', "metaTitle_en"='Room in shared flat in Sants, Barcelona | RentRoomBcn', "metaDescription_en"='Furnished room in a shared flat in Sants, Barcelona. Desk, fibre WiFi, equipped kitchen. Minimum stay 2 months. Ask for information.' where slug='RB219-HAB2';
update public.rooms set "imageAlt_en"='Bright room with an outside window in Sants, Barcelona', "metaTitle_en"='Room for rent for students in Sants-Montjuïc, Barcelona | RentRoomBcn', "metaDescription_en"='Ideal room for students or workers in Sants, Barcelona. Quiet, furnished flat, WiFi included. Request information with no obligation.' where slug='RB219-HAB3';
update public.rooms set "imageAlt_en"='Single room in a quiet shared flat in L''Hospitalet, Barcelona', "metaTitle_en"='Well-connected room for rent in L''Hospitalet de Llobregat | RentRoomBcn', "metaDescription_en"='Furnished room in L''Hospitalet de Llobregat, very well connected to Barcelona. WiFi, equipped kitchen, quiet flat. Check availability.' where slug='RB219-HAB4';
update public.rooms set "imageAlt_en"='Room with bed and desk in a shared flat near the metro in Barcelona', "metaTitle_en"='Room for rent near Sants metro, Barcelona | RentRoomBcn', "metaDescription_en"='Room in Sants-Montjuïc with excellent metro connections. Furnished, fibre WiFi, quiet flat. Flexible contract from 2 months.' where slug='RB219-HAB5';
update public.rooms set "imageAlt_en"='Furnished room near the Granvia 2 shopping centre, Barcelona', "metaTitle_en"='Room for rent in Zona Franca near Granvia 2, Barcelona | RentRoomBcn', "metaDescription_en"='Room in a shared flat in Zona Franca, next to the Granvia 2 shopping centre. Furnished, WiFi, equipped kitchen. Ask for information with no obligation.' where slug='AAFF33-HAB1';
update public.rooms set "imageAlt_en"='Single room with wardrobe in a modern flat in Zona Franca, Barcelona', "metaTitle_en"='Room in shared flat in Zona Franca, Barcelona | RentRoomBcn', "metaDescription_en"='Furnished room in a shared flat, Zona Franca, Barcelona. Single bed, wardrobe, fibre WiFi, shared bills. Minimum stay 2 months.' where slug='AAFF33-HAB2';
update public.rooms set "imageAlt_en"='Room with desk and window in Alts Forns, Barcelona', "metaTitle_en"='Room for rent for workers in Zona Franca, Barcelona | RentRoomBcn', "metaDescription_en"='Room for workers in Zona Franca, Barcelona. Quiet, well-connected flat. WiFi, equipped kitchen. Check availability now.' where slug='AAFF33-HAB3';
update public.rooms set "imageAlt_en"='Bright room in a modern shared flat in Barcelona', "metaTitle_en"='Monthly room rental in Barcelona, no long commitment | RentRoomBcn', "metaDescription_en"='Monthly room rental in Zona Franca, Barcelona. Furnished, WiFi included, shared bills. Flexible contract. Request information.' where slug='AAFF33-HAB4';
update public.rooms set "imageAlt_en"='Furnished single room in a quiet shared flat in Barcelona', "metaTitle_en"='Room available in shared flat in Zona Franca, Barcelona | RentRoomBcn', "metaDescription_en"='Room available in Zona Franca, Barcelona. Quiet, furnished shared flat with WiFi. Flexible contract. Contact us for more information!' where slug='AAFF33-HAB5';

-- ============ 17. Leads (consultas de los formularios) ============
create table if not exists public.leads (
  id             bigint generated by default as identity primary key,
  created_at     timestamptz not null default now(),
  room_slug      text references public.rooms(slug) on update cascade on delete set null,
  name           text not null check (char_length(name) between 1 and 120),
  email          text not null check (char_length(email) between 3 and 200),
  phone          text check (phone is null or char_length(phone) <= 40),
  delivery_date  date,
  message        text not null check (char_length(message) between 1 and 3000),
  lang           text not null default 'es',
  status         text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  notes          text
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);

alter table public.leads enable row level security;
drop policy if exists "leads public insert" on public.leads;
drop policy if exists "leads auth all" on public.leads;
-- Cualquier visitante puede enviar una consulta (solo insertar); leer/gestionar, solo admins.
create policy "leads public insert" on public.leads for insert to anon, authenticated with check (status = 'new');
create policy "leads auth all" on public.leads for all to authenticated using (true) with check (true);

-- ============ 18. Imágenes (Storage + tabla room_images) ============
create table if not exists public.room_images (
  id         bigint generated by default as identity primary key,
  room_id    bigint references public.rooms(id) on delete cascade,
  flat_id    text references public.flats(flat_id) on update cascade on delete cascade,
  path       text not null unique,
  position   int not null default 0,
  created_at timestamptz not null default now(),
  -- una imagen es de una habitación o es "extra" de un piso (zonas comunes)
  check ((room_id is not null) <> (flat_id is not null))
);

create index if not exists room_images_room_idx on public.room_images (room_id, position);
create index if not exists room_images_flat_idx on public.room_images (flat_id, position);

alter table public.room_images enable row level security;
drop policy if exists "room_images public read" on public.room_images;
drop policy if exists "room_images auth write" on public.room_images;
create policy "room_images public read" on public.room_images for select using (true);
create policy "room_images auth write" on public.room_images for all to authenticated using (true) with check (true);

-- Bucket público para las fotos
insert into storage.buckets (id, name, public) values ('room-images', 'room-images', true)
on conflict (id) do update set public = true;

drop policy if exists "room-images public read" on storage.objects;
drop policy if exists "room-images auth insert" on storage.objects;
drop policy if exists "room-images auth update" on storage.objects;
drop policy if exists "room-images auth delete" on storage.objects;
create policy "room-images public read" on storage.objects for select using (bucket_id = 'room-images');
create policy "room-images auth insert" on storage.objects for insert to authenticated with check (bucket_id = 'room-images');
create policy "room-images auth update" on storage.objects for update to authenticated using (bucket_id = 'room-images');
create policy "room-images auth delete" on storage.objects for delete to authenticated using (bucket_id = 'room-images');
