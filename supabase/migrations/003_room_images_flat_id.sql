-- Migración 003: room_images.flat_id siempre indica el piso.
--   · foto de habitación: room_id = habitación, flat_id = piso de esa habitación
--   · foto de zona común : room_id = null,      flat_id = piso
-- Ejecutar en Supabase > SQL Editor (idempotente).

-- 1. Quitar el check antiguo ("una u otra")
alter table public.room_images drop constraint if exists room_images_check;

-- 2. Rellenar flat_id en las filas existentes con el piso de su habitación
update public.room_images ri
set flat_id = r.flat_id
from public.rooms r
where ri.room_id = r.id and ri.flat_id is distinct from r.flat_id;

-- 3. flat_id obligatorio
alter table public.room_images alter column flat_id set not null;

-- 4. El piso se copia solo desde la habitación (los clientes no tienen que enviarlo)
create or replace function public.room_images_set_flat() returns trigger
language plpgsql as $$
begin
  if new.room_id is not null then
    select flat_id into new.flat_id from public.rooms where id = new.room_id;
  end if;
  return new;
end;
$$;

drop trigger if exists room_images_set_flat on public.room_images;
create trigger room_images_set_flat
before insert or update of room_id, flat_id on public.room_images
for each row execute function public.room_images_set_flat();

-- 5. Si una habitación cambia de piso, sus fotos la siguen
create or replace function public.rooms_sync_image_flat() returns trigger
language plpgsql as $$
begin
  update public.room_images set flat_id = new.flat_id where room_id = new.id;
  return new;
end;
$$;

drop trigger if exists rooms_sync_image_flat on public.rooms;
create trigger rooms_sync_image_flat
after update of flat_id on public.rooms
for each row when (old.flat_id is distinct from new.flat_id)
execute function public.rooms_sync_image_flat();
