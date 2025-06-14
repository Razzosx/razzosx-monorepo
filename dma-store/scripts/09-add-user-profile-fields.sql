-- Add user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can read their own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow admins to read all profiles
CREATE POLICY "Admins can read all profiles"
  ON user_profiles
  FOR SELECT
  USING ((SELECT is_admin FROM users WHERE id = auth.uid()));

-- Allow admins to update all profiles
CREATE POLICY "Admins can update all profiles"
  ON user_profiles
  FOR UPDATE
  USING ((SELECT is_admin FROM users WHERE id = auth.uid()));

-- Add user_addresses table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL,
  email TEXT,
  mobile TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for user_addresses
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own addresses
CREATE POLICY "Users can read their own addresses"
  ON user_addresses
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to update their own addresses
CREATE POLICY "Users can update their own addresses"
  ON user_addresses
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to insert their own addresses
CREATE POLICY "Users can insert their own addresses"
  ON user_addresses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own addresses
CREATE POLICY "Users can delete their own addresses"
  ON user_addresses
  FOR DELETE
  USING (auth.uid() = user_id);

-- Allow admins to read all addresses
CREATE POLICY "Admins can read all addresses"
  ON user_addresses
  FOR SELECT
  USING ((SELECT is_admin FROM users WHERE id = auth.uid()));

-- Allow admins to update all addresses
CREATE POLICY "Admins can update all addresses"
  ON user_addresses
  FOR UPDATE
  USING ((SELECT is_admin FROM users WHERE id = auth.uid()));

-- Add shipping_address_id to orders table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'shipping_address_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN shipping_address_id UUID REFERENCES user_addresses(id);
  END IF;
END $$;

-- Add user_notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for user_notifications
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own notifications
CREATE POLICY "Users can read their own notifications"
  ON user_notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to update their own notifications
CREATE POLICY "Users can update their own notifications"
  ON user_notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow admins to insert user notifications
CREATE POLICY "Admins can insert user notifications"
  ON user_notifications
  FOR INSERT
  WITH CHECK ((SELECT is_admin FROM users WHERE id = auth.uid()));

-- Allow admins to read all user notifications
CREATE POLICY "Admins can read all user notifications"
  ON user_notifications
  FOR SELECT
  USING ((SELECT is_admin FROM users WHERE id = auth.uid()));
