-- Function to handle updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create stocks table
create table public.stocks (
  id bigint generated always as identity primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  quantity numeric not null default 0,
  unit_price numeric not null default 0,
  expiration_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.stocks enable row level security;

-- Add policies
create policy "Allow public read access"
  on public.stocks for select
  to authenticated
  using (true);

-- Trigger for updated_at
create trigger update_stocks_updated_at
  before update on public.stocks
  for each row execute procedure public.handle_updated_at();
