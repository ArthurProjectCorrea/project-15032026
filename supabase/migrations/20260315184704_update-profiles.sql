-- Update handle_new_user function to normalize names
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
