-- Drop existing table and recreate with int ID
drop table if exists public.roles;

create table public.roles (
  id bigint generated always as identity primary key,
  name text not null unique
);

-- Re-insert default roles
insert into public.roles (name)
values ('Admin'), ('Clients');
