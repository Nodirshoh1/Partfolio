create or replace function is_admin() returns boolean language sql stable as
$$ select coalesce(auth.jwt()->>'email','') = 'k.nodirshoh1@gmail.com' $$;  -- ваш email администратора

create table projects(id uuid primary key default gen_random_uuid(), title text not null, description text,
 category text not null check (category in ('graphic','branding','social','motion','3d')), year int,
 cover_url text, media jsonb not null default '[]', behance_url text, sort_order int default 0,
 published boolean default false, created_at timestamptz default now());
create table reviews(id uuid primary key default gen_random_uuid(), name text not null, text text not null,
 rating int not null check (rating between 1 and 5), contact text, status text not null default 'pending'
 check (status in ('pending','approved','hidden')), created_at timestamptz default now());
create table messages(id uuid primary key default gen_random_uuid(), name text, contact text, project_type text,
 message text, created_at timestamptz default now());
create table settings(key text primary key, value text);
create table submissions(id bigserial primary key, ip_hash text, kind text, created_at timestamptz default now());

alter table projects enable row level security; alter table reviews enable row level security;
alter table messages enable row level security; alter table settings enable row level security;
alter table submissions enable row level security;
create policy "public read published" on projects for select using (published or is_admin());
create policy "admin all projects" on projects for all using (is_admin()) with check (is_admin());
create policy "public read approved" on reviews for select using (status='approved' or is_admin());
create policy "admin all reviews" on reviews for all using (is_admin()) with check (is_admin());
create policy "admin read messages" on messages for select using (is_admin());
create policy "admin delete messages" on messages for delete using (is_admin());
create policy "public read settings" on settings for select using (true);
create policy "admin all settings" on settings for all using (is_admin()) with check (is_admin());
-- submissions/inserts в reviews и messages выполняются только сервером (service role)

insert into storage.buckets(id,name,public) values('media','media',true) on conflict do nothing;
create policy "public read media" on storage.objects for select using (bucket_id='media');
create policy "admin write media" on storage.objects for all using (bucket_id='media' and is_admin()) with check (bucket_id='media' and is_admin());
