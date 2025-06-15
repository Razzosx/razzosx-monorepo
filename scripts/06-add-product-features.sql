-- Add new columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_best_seller BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_type VARCHAR(20) DEFAULT 'physical';
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_limited BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_limit INTEGER DEFAULT NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS current_stock INTEGER DEFAULT NULL;

-- Create cart table
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, product_id)
);

-- Add shipping address to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address_id UUID REFERENCES user_addresses(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS items_count INTEGER DEFAULT 1;

-- Update existing products
UPDATE products SET 
    is_best_seller = false,
    product_type = 'physical',
    is_limited = false
WHERE is_best_seller IS NULL;
