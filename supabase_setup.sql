-- 1. Create the `leads` table
create table if not exists public.leads (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    name text not null,
    clinic_name text not null,
    email text not null,
    phone text not null,
    practice_size text not null
);

-- 2. Enable Row Level Security (RLS) on the `leads` table
alter table public.leads enable row level security;

-- 3. Create a policy that allows anyone to insert a new lead (anon access)
create policy "Allow anonymous inserts" on public.leads
    for insert
    to anon
    with check (true);

-- 4. Create a policy that allows only authenticated users (you) to view leads
create policy "Allow authenticated selects" on public.leads
    for select
    to authenticated
    using (true);

-- 5. Create a private storage bucket for the installers
insert into storage.buckets (id, name, public) 
values ('installers', 'installers', false);

-- 6. Policy to allow reading from the bucket via signed URLs (Supabase handles signed URL validation automatically)
create policy "Allow signed URL reads" on storage.objects
    for select
    to anon
    using (bucket_id = 'installers');
