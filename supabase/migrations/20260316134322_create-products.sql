-- Create products table
create table public.products (
  id uuid default gen_random_uuid() primary key,
  gtin bigint unique,
  name text not null,
  brand_id uuid references public.brands(id),
  net_weight numeric,
  gross_weight numeric,
  avg_price numeric,
  ncm_code text,
  thumbnail text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.products enable row level security;

-- Add policies
create policy "Allow public read access"
  on public.products for select
  to authenticated
  using (true);
