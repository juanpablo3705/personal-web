-- 1. extensión para generación de uuids
create extension if not exists "pgcrypto";

-- 2. tabla principal: public.posts
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('blog', 'project')),
  status text not null default 'draft' check (status in ('draft', 'published')),
  title text not null,
  slug text not null unique,
  summary text,
  thumbnail_url text,
  content text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- eliminar índice duplicado (slug unique ya crea posts_slug_key)
drop index if exists public.idx_posts_slug;
drop index if exists public.idx_posts_type_status_created_at;

create index if not exists idx_posts_type_status_created_id
  on public.posts (type, status, created_at desc, id desc);

create index if not exists idx_posts_created_at_desc
  on public.posts (created_at desc);

create or replace function public.handle_posts_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_posts_updated_at on public.posts;
create trigger set_posts_updated_at
  before update on public.posts
  for each row
  execute function public.handle_posts_updated_at();

-- helper de autorización admin: reemplazar el correo antes de ejecutar en supabase sql editor
create or replace function public.is_site_admin()
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select
    auth.role() = 'authenticated'
    and lower(coalesce(auth.jwt() ->> 'email', '')) = lower('juanpablo3705@gmail.com');
$$;

-- 3. rls en public.posts
alter table public.posts enable row level security;

drop policy if exists "Lectura pública de posts publicados" on public.posts;
create policy "Lectura pública de posts publicados"
  on public.posts
  for select
  to public
  using (status = 'published');

drop policy if exists "Lectura completa para usuario autenticado" on public.posts;
create policy "Lectura completa para usuario autenticado"
  on public.posts
  for select
  to authenticated
  using (public.is_site_admin());

drop policy if exists "Creación de posts solo para usuario autenticado" on public.posts;
create policy "Creación de posts solo para usuario autenticado"
  on public.posts
  for insert
  to authenticated
  with check (public.is_site_admin());

drop policy if exists "Edición de posts solo para usuario autenticado" on public.posts;
create policy "Edición de posts solo para usuario autenticado"
  on public.posts
  for update
  to authenticated
  using (public.is_site_admin())
  with check (public.is_site_admin());

drop policy if exists "Eliminación de posts solo para usuario autenticado" on public.posts;
create policy "Eliminación de posts solo para usuario autenticado"
  on public.posts
  for delete
  to authenticated
  using (public.is_site_admin());

-- 4. buckets de storage con límites de tamaño y lista blanca de mime (bloquea svg y html)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'media',
    'media',
    true,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
  ),
  (
    'documents',
    'documents',
    true,
    15728640,
    array['application/pdf']
  )
on conflict (id) do update
  set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- 5. rls en storage.objects
-- los buckets con public = true sirven descargas por url directa sin necesidad de política select pública;
-- quitar select público impide listar/enumerar archivos del bucket vía api.
drop policy if exists "Lectura pública de archivos en media y documents" on storage.objects;

drop policy if exists "Lectura admin de archivos en media y documents" on storage.objects;
create policy "Lectura admin de archivos en media y documents"
  on storage.objects
  for select
  to authenticated
  using (bucket_id in ('media', 'documents') and public.is_site_admin());

drop policy if exists "Subida de archivos solo para usuario autenticado" on storage.objects;
create policy "Subida de archivos solo para usuario autenticado"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id in ('media', 'documents') and public.is_site_admin());

drop policy if exists "Actualización de archivos solo para usuario autenticado" on storage.objects;
create policy "Actualización de archivos solo para usuario autenticado"
  on storage.objects
  for update
  to authenticated
  using (bucket_id in ('media', 'documents') and public.is_site_admin())
  with check (bucket_id in ('media', 'documents') and public.is_site_admin());

drop policy if exists "Eliminación de archivos solo para usuario autenticado" on storage.objects;
create policy "Eliminación de archivos solo para usuario autenticado"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id in ('media', 'documents') and public.is_site_admin());
