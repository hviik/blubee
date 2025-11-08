-- Create trips table for Clerk-authenticated users
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Clerk user ID
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_trips_created_at ON trips(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only read their own trips
CREATE POLICY "Users can view own trips"
  ON trips
  FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Create policy: Users can only insert their own trips
CREATE POLICY "Users can create own trips"
  ON trips
  FOR INSERT
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Create policy: Users can only update their own trips
CREATE POLICY "Users can update own trips"
  ON trips
  FOR UPDATE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Create policy: Users can only delete their own trips
CREATE POLICY "Users can delete own trips"
  ON trips
  FOR DELETE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_trips_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_trips_updated_at_trigger
  BEFORE UPDATE ON trips
  FOR EACH ROW
  EXECUTE FUNCTION update_trips_updated_at();

-- Grant permissions (if needed)
-- This allows the service role to bypass RLS
GRANT ALL ON trips TO service_role;

