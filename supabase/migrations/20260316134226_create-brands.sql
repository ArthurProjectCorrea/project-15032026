-- Create brands table
create table public.brands (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  picture text
);

-- Enable RLS
alter table public.brands enable row level security;

-- Add policies
create policy "Allow public read access"
  on public.brands for select
  to authenticated
  using (true);
