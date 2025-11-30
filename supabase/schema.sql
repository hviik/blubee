


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."day_item_type" AS ENUM (
    'flight',
    'self_drive',
    'hotel',
    'activity',
    'car_rental',
    'tour_package'
);


ALTER TYPE "public"."day_item_type" OWNER TO "postgres";


CREATE TYPE "public"."transport_mode_type" AS ENUM (
    'flight',
    'self_drive',
    'train',
    'bus',
    'other'
);


ALTER TYPE "public"."transport_mode_type" OWNER TO "postgres";


CREATE TYPE "public"."trip_status_type" AS ENUM (
    'planned',
    'completed',
    'wishlist'
);


ALTER TYPE "public"."trip_status_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."request_user_id"() RETURNS "text"
    LANGUAGE "sql" STABLE
    SET "search_path" TO ''
    AS $$
  SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::text;
$$;


ALTER FUNCTION "public"."request_user_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_trips_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_trips_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."day_accommodations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "day_id" "uuid" NOT NULL,
    "name" "text",
    "price" numeric(10,2) DEFAULT 0.00,
    "overview" "text",
    "booking_link" "text",
    "details" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."day_accommodations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."day_activities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "day_id" "uuid" NOT NULL,
    "title" "text",
    "price" numeric(10,2) DEFAULT 0.00,
    "overview" "text",
    "booking_link" "text",
    "details" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."day_activities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."day_car_rentals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "day_id" "uuid" NOT NULL,
    "company_name" "text",
    "price" numeric(10,2) DEFAULT 0.00,
    "overview" "text",
    "booking_link" "text",
    "details" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."day_car_rentals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."day_tours" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "day_id" "uuid" NOT NULL,
    "package_name" "text",
    "price" numeric(10,2) DEFAULT 0.00,
    "overview" "text",
    "booking_link" "text",
    "details" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."day_tours" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."day_transports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "day_id" "uuid" NOT NULL,
    "mode" "public"."transport_mode_type" DEFAULT 'flight'::"public"."transport_mode_type",
    "is_self_drive" boolean DEFAULT false,
    "price" numeric(10,2) DEFAULT 0.00,
    "overview" "text",
    "booking_link" "text",
    "details" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."day_transports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "text" NOT NULL,
    "full_name" "text",
    "email" "text",
    "sensitivities" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trip_days" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "trip_id" "uuid" NOT NULL,
    "day_date" "date",
    "day_index" integer,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."trip_days" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trips" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "text" NOT NULL,
    "title" "text" NOT NULL,
    "start_date" "date",
    "end_date" "date",
    "trip_type" "text",
    "number_of_people" integer DEFAULT 1,
    "preferences" "jsonb" DEFAULT '{}'::"jsonb",
    "total_budget" numeric(10,2),
    "status" "public"."trip_status_type" DEFAULT 'planned'::"public"."trip_status_type",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."trips" OWNER TO "postgres";


ALTER TABLE ONLY "public"."day_accommodations"
    ADD CONSTRAINT "day_accommodations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."day_activities"
    ADD CONSTRAINT "day_activities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."day_car_rentals"
    ADD CONSTRAINT "day_car_rentals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."day_tours"
    ADD CONSTRAINT "day_tours_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."day_transports"
    ADD CONSTRAINT "day_transports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trip_days"
    ADD CONSTRAINT "trip_days_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trips"
    ADD CONSTRAINT "trips_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."day_accommodations"
    ADD CONSTRAINT "day_accommodations_day_id_fkey" FOREIGN KEY ("day_id") REFERENCES "public"."trip_days"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."day_activities"
    ADD CONSTRAINT "day_activities_day_id_fkey" FOREIGN KEY ("day_id") REFERENCES "public"."trip_days"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."day_car_rentals"
    ADD CONSTRAINT "day_car_rentals_day_id_fkey" FOREIGN KEY ("day_id") REFERENCES "public"."trip_days"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."day_tours"
    ADD CONSTRAINT "day_tours_day_id_fkey" FOREIGN KEY ("day_id") REFERENCES "public"."trip_days"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."day_transports"
    ADD CONSTRAINT "day_transports_day_id_fkey" FOREIGN KEY ("day_id") REFERENCES "public"."trip_days"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trip_days"
    ADD CONSTRAINT "trip_days_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trips"
    ADD CONSTRAINT "trips_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



CREATE POLICY "Service role can insert profile" ON "public"."profiles" FOR INSERT WITH CHECK (true);



CREATE POLICY "Users can CRUD accommodations via day" ON "public"."day_accommodations" USING ((EXISTS ( SELECT 1
   FROM ("public"."trip_days"
     JOIN "public"."trips" ON (("trips"."id" = "trip_days"."trip_id")))
  WHERE (("trip_days"."id" = "day_accommodations"."day_id") AND ("trips"."user_id" = "public"."request_user_id"())))));



CREATE POLICY "Users can CRUD activities via day" ON "public"."day_activities" USING ((EXISTS ( SELECT 1
   FROM ("public"."trip_days"
     JOIN "public"."trips" ON (("trips"."id" = "trip_days"."trip_id")))
  WHERE (("trip_days"."id" = "day_activities"."day_id") AND ("trips"."user_id" = "public"."request_user_id"())))));



CREATE POLICY "Users can CRUD car rentals via day" ON "public"."day_car_rentals" USING ((EXISTS ( SELECT 1
   FROM ("public"."trip_days"
     JOIN "public"."trips" ON (("trips"."id" = "trip_days"."trip_id")))
  WHERE (("trip_days"."id" = "day_car_rentals"."day_id") AND ("trips"."user_id" = "public"."request_user_id"())))));



CREATE POLICY "Users can CRUD days via trip" ON "public"."trip_days" USING ((EXISTS ( SELECT 1
   FROM "public"."trips"
  WHERE (("trips"."id" = "trip_days"."trip_id") AND ("trips"."user_id" = "public"."request_user_id"())))));



CREATE POLICY "Users can CRUD own trips" ON "public"."trips" USING (("public"."request_user_id"() = "user_id"));



CREATE POLICY "Users can CRUD tours via day" ON "public"."day_tours" USING ((EXISTS ( SELECT 1
   FROM ("public"."trip_days"
     JOIN "public"."trips" ON (("trips"."id" = "trip_days"."trip_id")))
  WHERE (("trip_days"."id" = "day_tours"."day_id") AND ("trips"."user_id" = "public"."request_user_id"())))));



CREATE POLICY "Users can CRUD transports via day" ON "public"."day_transports" USING ((EXISTS ( SELECT 1
   FROM ("public"."trip_days"
     JOIN "public"."trips" ON (("trips"."id" = "trip_days"."trip_id")))
  WHERE (("trip_days"."id" = "day_transports"."day_id") AND ("trips"."user_id" = "public"."request_user_id"())))));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE USING (("public"."request_user_id"() = "id"));



CREATE POLICY "Users can view own profile" ON "public"."profiles" FOR SELECT USING (("public"."request_user_id"() = "id"));



ALTER TABLE "public"."day_accommodations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."day_activities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."day_car_rentals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."day_tours" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."day_transports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trip_days" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trips" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."request_user_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."request_user_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."request_user_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_trips_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_trips_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_trips_updated_at"() TO "service_role";



GRANT ALL ON TABLE "public"."day_accommodations" TO "anon";
GRANT ALL ON TABLE "public"."day_accommodations" TO "authenticated";
GRANT ALL ON TABLE "public"."day_accommodations" TO "service_role";



GRANT ALL ON TABLE "public"."day_activities" TO "anon";
GRANT ALL ON TABLE "public"."day_activities" TO "authenticated";
GRANT ALL ON TABLE "public"."day_activities" TO "service_role";



GRANT ALL ON TABLE "public"."day_car_rentals" TO "anon";
GRANT ALL ON TABLE "public"."day_car_rentals" TO "authenticated";
GRANT ALL ON TABLE "public"."day_car_rentals" TO "service_role";



GRANT ALL ON TABLE "public"."day_tours" TO "anon";
GRANT ALL ON TABLE "public"."day_tours" TO "authenticated";
GRANT ALL ON TABLE "public"."day_tours" TO "service_role";



GRANT ALL ON TABLE "public"."day_transports" TO "anon";
GRANT ALL ON TABLE "public"."day_transports" TO "authenticated";
GRANT ALL ON TABLE "public"."day_transports" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."trip_days" TO "anon";
GRANT ALL ON TABLE "public"."trip_days" TO "authenticated";
GRANT ALL ON TABLE "public"."trip_days" TO "service_role";



GRANT ALL ON TABLE "public"."trips" TO "anon";
GRANT ALL ON TABLE "public"."trips" TO "authenticated";
GRANT ALL ON TABLE "public"."trips" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







