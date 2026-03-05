-- Create Products Table
create table products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  category text not null,
  price numeric not null,
  cost numeric not null,
  stock numeric not null,
  min_stock numeric default 0,
  unit text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Customers Table
create table customers (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  phone text,
  email text,
  loyalty_points numeric default 0,
  total_spent numeric default 0,
  join_date timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Sales Table
create table sales (
  id uuid default uuid_generate_v4() primary key,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
  total numeric not null,
  customer_id uuid references customers(id),
  points_earned numeric default 0,
  points_redeemed numeric default 0,
  discount_amount numeric default 0
);

-- Create Sale Items Table (Junction)
create table sale_items (
  id uuid default uuid_generate_v4() primary key,
  sale_id uuid references sales(id) on delete cascade not null,
  product_id uuid references products(id) not null,
  quantity numeric not null,
  price_at_sale numeric not null,
  product_name text -- Snapshot of name in case it changes
);

-- RLS Policies (Optional but recommended - Basic Open Access for Admin App)
alter table products enable row level security;
alter table customers enable row level security;
alter table sales enable row level security;
alter table sale_items enable row level security;

-- Policy to allow all access (since it's a single-user admin app)
-- Note: In a real multi-tenant app, you'd restrict this.
create policy "Enable all access for authenticated users" on products for all using (true) with check (true);
create policy "Enable all access for authenticated users" on customers for all using (true) with check (true);
create policy "Enable all access for authenticated users" on sales for all using (true) with check (true);
create policy "Enable all access for authenticated users" on sale_items for all using (true) with check (true);
