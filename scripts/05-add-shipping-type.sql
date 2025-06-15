-- Add shipping_type column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS shipping_type VARCHAR(50) DEFAULT 'standard';

-- Update existing products to have standard shipping
UPDATE products SET shipping_type = 'standard' WHERE shipping_type IS NULL;
