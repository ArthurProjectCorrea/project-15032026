-- Create roles table
create table public.roles (
  id bigint generated always as identity primary key,
  name text not null unique
);

-- Insert default roles
insert into public.roles (name)
values ('Admin'), ('Clients');
