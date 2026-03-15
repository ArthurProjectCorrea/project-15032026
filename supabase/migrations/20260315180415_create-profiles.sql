-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  name text,
  document text,
  phone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Set up Row Level Security
alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using ( auth.uid() = id );

create policy "Users can update their own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, document, phone)
  values (
    new.id,
    initcap(new.raw_user_meta_data->>'full_name'),
    new.raw_user_meta_data->>'document',
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
