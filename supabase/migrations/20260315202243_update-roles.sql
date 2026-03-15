-- Enable RLS on roles and user_roles if not already enabled
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;

-- Allow authenticated users to read roles
create policy "Allow authenticated users to read roles"
  on public.roles for select
  to authenticated
  using (true);

-- Allow users to read their own role assignments
create policy "Users can view their own roles"
  on public.user_roles for select
  to authenticated
  using ( auth.uid() = user_id );

-- Allow the system/trigger to insert user roles (trigger uses security definer, but self-repair needs this)
-- Since self-repair runs in the API route with the user's context, it needs permission to insert.
create policy "Users can insert their own initial role"
  on public.user_roles for insert
  to authenticated
  with check ( auth.uid() = user_id );
