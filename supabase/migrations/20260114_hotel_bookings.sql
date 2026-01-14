-- Hotel Bookings Table
-- Stores user booking references when they click to book on Booking.com

CREATE TABLE IF NOT EXISTS "public"."hotel_bookings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "text" NOT NULL,
    "trip_id" "uuid",
    "hotel_id" "text" NOT NULL,
    "hotel_name" "text" NOT NULL,
    "hotel_address" "text",
    "city" "text",
    "country" "text",
    "photo_url" "text",
    "rating" numeric(2,1),
    "review_score" numeric(3,1),
    "price_per_night" numeric(10,2),
    "total_price" numeric(10,2),
    "currency" "text" DEFAULT 'USD',
    "check_in_date" "date",
    "check_out_date" "date",
    "booking_url" "text",
    "destination" "text",
    "status" "text" DEFAULT 'clicked',
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE "public"."hotel_bookings" OWNER TO "postgres";

-- Primary key
ALTER TABLE ONLY "public"."hotel_bookings"
    ADD CONSTRAINT "hotel_bookings_pkey" PRIMARY KEY ("id");

-- Foreign key to profiles
ALTER TABLE ONLY "public"."hotel_bookings"
    ADD CONSTRAINT "hotel_bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;

-- Optional foreign key to trips (if booking is associated with a trip)
ALTER TABLE ONLY "public"."hotel_bookings"
    ADD CONSTRAINT "hotel_bookings_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE SET NULL;

-- Row Level Security
ALTER TABLE "public"."hotel_bookings" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see and manage their own bookings
CREATE POLICY "Users can CRUD own hotel bookings" ON "public"."hotel_bookings" 
    USING (("public"."request_user_id"() = "user_id"));

-- Grants
GRANT ALL ON TABLE "public"."hotel_bookings" TO "anon";
GRANT ALL ON TABLE "public"."hotel_bookings" TO "authenticated";
GRANT ALL ON TABLE "public"."hotel_bookings" TO "service_role";

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS "hotel_bookings_user_id_idx" ON "public"."hotel_bookings" ("user_id");
CREATE INDEX IF NOT EXISTS "hotel_bookings_created_at_idx" ON "public"."hotel_bookings" ("created_at" DESC);

-- Comment
COMMENT ON TABLE "public"."hotel_bookings" IS 'Stores hotel booking clicks/references made by users through the Booking.com integration';
