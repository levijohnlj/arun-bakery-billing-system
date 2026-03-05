-- ============================================================
-- FIX: Drop old policies and recreate with proper auth check
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

-- Drop existing policies (may error if they don't exist - that's OK)
drop policy if exists "Enable all access for authenticated users" on products;
drop policy if exists "Enable all access for authenticated users" on customers;
drop policy if exists "Enable all access for authenticated users" on sales;
drop policy if exists "Enable all access for authenticated users" on sale_items;

-- Recreate policies that allow authenticated users full access
create policy "Allow authenticated users full access to products"
  on products for all
  to authenticated
  using (true)
  with check (true);

create policy "Allow authenticated users full access to customers"
  on customers for all
  to authenticated
  using (true)
  with check (true);

create policy "Allow authenticated users full access to sales"
  on sales for all
  to authenticated
  using (true)
  with check (true);

create policy "Allow authenticated users full access to sale_items"
  on sale_items for all
  to authenticated
  using (true)
  with check (true);
