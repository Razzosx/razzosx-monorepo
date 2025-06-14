-- Script to add 'quantity' column to 'orders' table if it doesn't exist
-- This fixes the error: "Could not find the 'quantity' column of 'orders' in the schema cache"

-- Check if the orders table exists
DO $$
DECLARE
    table_exists BOOLEAN;
    column_exists BOOLEAN;
BEGIN
    -- Check if the table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'orders'
    ) INTO table_exists;

    IF table_exists THEN
        -- Check if the quantity column exists
        SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'orders' 
            AND column_name = 'quantity'
        ) INTO column_exists;

        IF NOT column_exists THEN
            -- Add the quantity column if it doesn't exist
            EXECUTE 'ALTER TABLE public.orders ADD COLUMN quantity INTEGER NOT NULL DEFAULT 1';
            RAISE NOTICE 'Added quantity column to orders table';
        ELSE
            RAISE NOTICE 'quantity column already exists in orders table';
        END IF;
    ELSE
        RAISE NOTICE 'orders table does not exist';
    END IF;
END $$;

-- Force schema cache refresh
SELECT pg_notify('pgrst', 'reload schema');

-- Verify the table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'orders'
ORDER BY ordinal_position;

-- Verify RLS policies
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'orders';

-- Add a test order if the table is empty (for verification)
DO $$
DECLARE
    order_count INTEGER;
    user_exists BOOLEAN;
    product_exists BOOLEAN;
    user_id UUID;
    product_id UUID;
BEGIN
    -- Check if there are any orders
    SELECT COUNT(*) FROM public.orders INTO order_count;
    
    -- Check if there are any users
    SELECT EXISTS (SELECT 1 FROM auth.users LIMIT 1) INTO user_exists;
    
    -- Check if there are any products
    SELECT EXISTS (SELECT 1 FROM public.products LIMIT 1) INTO product_exists;
    
    IF order_count = 0 AND user_exists AND product_exists THEN
        -- Get a user ID
        SELECT id INTO user_id FROM auth.users LIMIT 1;
        
        -- Get a product ID
        SELECT id INTO product_id FROM public.products LIMIT 1;
        
        -- Insert a test order
        INSERT INTO public.orders (
            user_id, 
            product_id, 
            quantity, 
            status, 
            payment_method, 
            created_at
        ) VALUES (
            user_id,
            product_id,
            2,
            'pending',
            'credit_card',
            NOW()
        );
        
        RAISE NOTICE 'Added test order for verification';
    END IF;
END $$;
