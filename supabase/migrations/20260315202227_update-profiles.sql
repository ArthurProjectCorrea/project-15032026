-- Update handle_new_user function to sync role to auth.users metadata
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

  -- Assign 'Clients' role and update JWT metadata
  if default_role_id is not null then
    insert into public.user_roles (user_id, role_id)
    values (new.id, default_role_id);
    
    -- Update auth.users metadata to include role
    -- This allows the middleware to check the role via JWT (app_metadata) without a DB query
    update auth.users 
    set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'Clients')
    where id = new.id;
  end if;

  return new;
end;
$$;
