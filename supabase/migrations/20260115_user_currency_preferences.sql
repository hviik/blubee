-- Migration: Add currency preferences to user profiles
-- Purpose: Store user currency override for single-currency invariant enforcement
-- Date: 2026-01-15

-- Add currency preference columns to profiles table
ALTER TABLE "public"."profiles" 
ADD COLUMN IF NOT EXISTS "preferred_currency" VARCHAR(3) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS "preferred_country" VARCHAR(2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS "currency_source" VARCHAR(20) DEFAULT 'default',
ADD COLUMN IF NOT EXISTS "currency_updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add constraint to ensure valid currency source values
-- Note: Can't use CHECK constraint on existing table easily, so we'll validate in application layer

-- Add comment for documentation
COMMENT ON COLUMN "public"."profiles"."preferred_currency" IS 'ISO-4217 currency code - user override for currency display';
COMMENT ON COLUMN "public"."profiles"."preferred_country" IS 'ISO-3166-1 alpha-2 country code - detected or user-specified';
COMMENT ON COLUMN "public"."profiles"."currency_source" IS 'Source of currency setting: user_override, geo, or default';
COMMENT ON COLUMN "public"."profiles"."currency_updated_at" IS 'Timestamp when currency preference was last updated';

-- Create index for quick lookups
CREATE INDEX IF NOT EXISTS "idx_profiles_currency" ON "public"."profiles" ("preferred_currency") WHERE "preferred_currency" IS NOT NULL;

-- Function to update currency_updated_at timestamp
CREATE OR REPLACE FUNCTION "public"."update_currency_timestamp"() 
RETURNS "trigger"
LANGUAGE "plpgsql"
AS $$
BEGIN
  IF OLD.preferred_currency IS DISTINCT FROM NEW.preferred_currency THEN
    NEW.currency_updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to auto-update currency_updated_at
DROP TRIGGER IF EXISTS "profiles_currency_update" ON "public"."profiles";
CREATE TRIGGER "profiles_currency_update"
BEFORE UPDATE ON "public"."profiles"
FOR EACH ROW
EXECUTE FUNCTION "public"."update_currency_timestamp"();

-- Grant permissions
GRANT ALL ON FUNCTION "public"."update_currency_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_currency_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_currency_timestamp"() TO "service_role";
