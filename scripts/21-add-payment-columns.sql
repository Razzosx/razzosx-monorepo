-- Script to add 'payment_id' and 'payment_status' columns to 'orders' table if they don't exist
-- This fixes the error: "Could not find the 'payment_id' column of 'orders' in the schema cache"

-- Check if the orders table exists
DO $$
DECLARE
    table_exists BOOLEAN;
    payment_id_exists BOOLEAN;
    payment_status_exists BOOLEAN;
    updated_at_exists BOOLEAN;
BEGIN
    -- Check if the table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'orders'
    ) INTO table_exists;

    IF table_exists THEN
        -- Check if the payment_id column exists
        SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'orders' 
            AND column_name = 'payment_id'
        ) INTO payment_id_exists;

        -- Check if the payment_status column exists
        SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'orders' 
            AND column_name = 'payment_status'
        ) INTO payment_status_exists;
        
        -- Check if the updated_at column exists
        SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'orders' 
            AND column_name = 'updated_at'
        ) INTO updated_at_exists;

        -- Add the payment_id column if it doesn't exist
        IF NOT payment_id_exists THEN
            EXECUTE 'ALTER TABLE public.orders ADD COLUMN payment_id TEXT DEFAULT NULL';
            RAISE NOTICE 'Added payment_id column to orders table';
        ELSE
            RAISE NOTICE 'payment_id column already exists in orders table';
        END IF;

        -- Add the payment_status column if it doesn't exist
        IF NOT payment_status_exists THEN
            EXECUTE 'ALTER TABLE public.orders ADD COLUMN payment_status TEXT DEFAULT NULL';
            RAISE NOTICE 'Added payment_status column to orders table';
        ELSE
            RAISE NOTICE 'payment_status column already exists in orders table';
        END IF;
        
        -- Add the updated_at column if it doesn't exist
        IF NOT updated_at_exists THEN
            EXECUTE 'ALTER TABLE public.orders ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()';
            RAISE NOTICE 'Added updated_at column to orders table';
        ELSE
            RAISE NOTICE 'updated_at column already exists in orders table';
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
