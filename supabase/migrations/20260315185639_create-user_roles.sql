-- Create user_roles table
create table public.user_roles (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users on delete cascade not null,
  role_id bigint references public.roles on delete cascade not null,
  unique(user_id, role_id)
);

-- Update handle_new_user function to assign 'Clients' role
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  default_role_id bigint;
begin
  -- Insert profile
  insert into public.profiles (id, name, document, phone)
  values (
    new.id,
    initcap(new.raw_user_meta_data->>'full_name'),
    new.raw_user_meta_data->>'document',
    new.raw_user_meta_data->>'phone'
  );

  -- Get 'Clients' role ID
  select id into default_role_id from public.roles where name = 'Clients';

  -- Assign 'Clients' role
  if default_role_id is not null then
    insert into public.user_roles (user_id, role_id)
    values (new.id, default_role_id);
  end if;

  return new;
end;
$$;
