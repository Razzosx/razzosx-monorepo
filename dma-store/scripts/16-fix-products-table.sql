-- Ensure the products table exists with all required columns
DO $$
BEGIN
    -- Check if the products table exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products') THEN
        -- Create the products table with all required columns
        CREATE TABLE public.products (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            description TEXT,
            price DECIMAL(10, 2) NOT NULL,
            stock INTEGER NOT NULL DEFAULT 0,
            image_url TEXT,
            category TEXT,
            featured BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );

        -- Enable Row Level Security
        ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

        -- Create policies
        CREATE POLICY "Allow public read access" ON public.products
            FOR SELECT USING (true);

        CREATE POLICY "Allow admin full access" ON public.products
            FOR ALL USING (auth.uid() IN (SELECT id FROM public.users WHERE is_admin = true));

        RAISE NOTICE 'Created products table with all required columns';
    ELSE
        -- Table exists, check for required columns
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'category') THEN
            ALTER TABLE public.products ADD COLUMN category TEXT;
            RAISE NOTICE 'Added category column to products table';
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'featured') THEN
            ALTER TABLE public.products ADD COLUMN featured BOOLEAN DEFAULT false;
            RAISE NOTICE 'Added featured column to products table';
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'image_url') THEN
            ALTER TABLE public.products ADD COLUMN image_url TEXT;
            RAISE NOTICE 'Added image_url column to products table';
        END IF;
    END IF;

    -- Force refresh of schema cache
    NOTIFY pgrst, 'reload schema';
END $$;

-- Verify the table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'products'
ORDER BY ordinal_position;

-- Verify RLS policies
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'products';
