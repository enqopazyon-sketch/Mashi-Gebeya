-- ============================================================================
-- ማሺ ገበያ (MASH GEBEYA) - SUPABASE DATABASE SCHEMA MIGRATION SCRIPT
-- ============================================================================
-- Copy and run this script in Supabase Dashboard -> SQL Editor -> Run
-- ============================================================================

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC NOT NULL,
    image TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    description TEXT,
    in_stock BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    customer_email TEXT,
    telegram_username TEXT,
    address TEXT,
    payment_method TEXT DEFAULT 'Direct Order',
    notes TEXT,
    total_amount NUMERIC NOT NULL,
    items JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    bot_token TEXT,
    admin_chat_id TEXT,
    store_name TEXT DEFAULT 'ማሺ ገበያ (Mashi Gebeya)',
    store_phone TEXT DEFAULT '0911305530',
    store_address TEXT DEFAULT 'ጀሞ 1 ብሎክ 157',
    store_map_url TEXT DEFAULT 'https://maps.app.goo.gl/qu1soae2p3Xeydiq9',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Default Settings Row if empty
INSERT INTO public.settings (id, store_name, store_phone, store_address)
VALUES (1, 'ማሺ ገበያ (Mashi Gebeya)', '0911305530', 'ጀሞ 1 ብሎክ 157')
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS) and Allow Public Access
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update access on products" ON public.products FOR ALL USING (true);

CREATE POLICY "Allow public read access on orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update access on orders" ON public.orders FOR ALL USING (true);

CREATE POLICY "Allow public read access on settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update access on settings" ON public.settings FOR ALL USING (true);
