-- ==============================================================================
-- THE PLATTER HOUSE — SUPABASE DATABASE SETUP SCRIPT
-- ==============================================================================
-- Run this in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Enable UUID generator
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create the Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  fulfillment_type TEXT DEFAULT 'delivery',
  address TEXT,
  preferred_date TEXT,
  notes TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  delivery_fee NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT DEFAULT 'paystack',
  payment_status TEXT DEFAULT 'paid',
  payment_reference TEXT,
  order_status TEXT DEFAULT 'confirmed',
  status_history JSONB DEFAULT '[]'::jsonb
);

-- 3. Create the Products Table (Menu Catalog)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  in_stock BOOLEAN DEFAULT true,
  description TEXT,
  image TEXT,
  serves TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 5. Open Access Policies for Public Storefront & Merchant Operations
DROP POLICY IF EXISTS "Public full access to orders" ON public.orders;
CREATE POLICY "Public full access to orders" ON public.orders
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access to products" ON public.products;
CREATE POLICY "Public full access to products" ON public.products
  FOR ALL USING (true) WITH CHECK (true);

-- 6. Enable Realtime Broadcasting for both tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'products'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
  END IF;
END $$;
