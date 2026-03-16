-- Brands
create policy "Allow authenticated insert"
  on public.brands for insert
  to authenticated
  with check (true);

create policy "Allow authenticated update"
  on public.brands for update
  to authenticated
  using (true);

-- Products
create policy "Allow authenticated insert"
  on public.products for insert
  to authenticated
  with check (true);

create policy "Allow authenticated update"
  on public.products for update
  to authenticated
  using (true);

-- Stocks
create policy "Allow authenticated insert"
  on public.stocks for insert
  to authenticated
  with check (true);

create policy "Allow authenticated update"
  on public.stocks for update
  to authenticated
  using (true);
