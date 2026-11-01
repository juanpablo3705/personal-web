-- =============================================================================
-- SCRIPT DE CONFIGURACIÓN AUTOMÁTICA DE SUPABASE (BASE DE DATOS + STORAGE + RLS)
-- Proyecto: Sitio Web Personal (Blog, Proyectos y CV)
-- Instrucciones: Copia todo este contenido, pégalo en el "SQL Editor" de tu
-- panel de Supabase y haz clic en el botón "Run".
-- =============================================================================

-- 1. EXTENSIÓN PARA GENERACIÓN DE UUIDs
create extension if not exists "pgcrypto";

-- =============================================================================
-- 2. TABLA PRINCIPAL: public.posts (Blog y Proyectos)
-- =============================================================================
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

-- Índices para optimizar catálogos públicos, vista de detalle por slug y panel admin
create index if not exists idx_posts_slug
  on public.posts (slug);

create index if not exists idx_posts_type_status_created_at
  on public.posts (type, status, created_at desc);

create index if not exists idx_posts_created_at_desc
  on public.posts (created_at desc);

-- Función y Trigger para actualizar automáticamente updated_at en cada edición
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

-- =============================================================================
-- 3. POLÍTICAS DE SEGURIDAD RLS PARA LA TABLA public.posts
-- =============================================================================
alter table public.posts enable row level security;

-- 3.1. SELECT público: Cualquier visitante puede leer únicamente posts publicados
drop policy if exists "Lectura pública de posts publicados" on public.posts;
create policy "Lectura pública de posts publicados"
  on public.posts
  for select
  to public
  using (status = 'published');

-- 3.2. SELECT autenticado: El administrador puede leer todos los posts (draft y published)
drop policy if exists "Lectura completa para usuario autenticado" on public.posts;
create policy "Lectura completa para usuario autenticado"
  on public.posts
  for select
  to authenticated
  using (true);

-- 3.3. INSERT autenticado: Solo el administrador puede crear posts
drop policy if exists "Creación de posts solo para usuario autenticado" on public.posts;
create policy "Creación de posts solo para usuario autenticado"
  on public.posts
  for insert
  to authenticated
  with check (true);

-- 3.4. UPDATE autenticado: Solo el administrador puede editar posts
drop policy if exists "Edición de posts solo para usuario autenticado" on public.posts;
create policy "Edición de posts solo para usuario autenticado"
  on public.posts
  for update
  to authenticated
  using (true)
  with check (true);

-- 3.5. DELETE autenticado: Solo el administrador puede eliminar posts
drop policy if exists "Eliminación de posts solo para usuario autenticado" on public.posts;
create policy "Eliminación de posts solo para usuario autenticado"
  on public.posts
  for delete
  to authenticated
  using (true);

-- =============================================================================
-- 4. BUCKETS PÚBLICOS DE SUPABASE STORAGE: 'media' Y 'documents'
-- =============================================================================
insert into storage.buckets (id, name, public)
values
  ('media', 'media', true),
  ('documents', 'documents', true)
on conflict (id) do update
  set public = excluded.public;

-- =============================================================================
-- 5. POLÍTICAS DE SEGURIDAD RLS PARA STORAGE (storage.objects)
-- =============================================================================

-- 5.1. SELECT público: Cualquiera puede ver y descargar imágenes ('media') y el CV ('documents')
drop policy if exists "Lectura pública de archivos en media y documents" on storage.objects;
create policy "Lectura pública de archivos en media y documents"
  on storage.objects
  for select
  to public
  using (bucket_id in ('media', 'documents'));

-- 5.2. INSERT autenticado: Solo el administrador puede subir nuevos archivos
drop policy if exists "Subida de archivos solo para usuario autenticado" on storage.objects;
create policy "Subida de archivos solo para usuario autenticado"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id in ('media', 'documents'));

-- 5.3. UPDATE autenticado: Necesario para permitir sobrescribir archivos con upsert: true (ej. cv_actual.pdf)
drop policy if exists "Actualización de archivos solo para usuario autenticado" on storage.objects;
create policy "Actualización de archivos solo para usuario autenticado"
  on storage.objects
  for update
  to authenticated
  using (bucket_id in ('media', 'documents'))
  with check (bucket_id in ('media', 'documents'));

-- 5.4. DELETE autenticado: Solo el administrador puede eliminar archivos de los buckets
drop policy if exists "Eliminación de archivos solo para usuario autenticado" on storage.objects;
create policy "Eliminación de archivos solo para usuario autenticado"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id in ('media', 'documents'));
