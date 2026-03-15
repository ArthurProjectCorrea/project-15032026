-- Fix document column length in profiles table
alter table public.profiles 
  alter column document type text;
