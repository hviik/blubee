import { serve } from "https://deno.land/std@0.177.1/http/server.ts";
import { Webhook } from "npm:svix@1.15.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, svix-id, svix-timestamp, svix-signature",
      },
    });
  }

  try {
    const SIGNING_SECRET = Deno.env.get("CLERK_WEBHOOK_SECRET");
    if (!SIGNING_SECRET) {
      return new Response(JSON.stringify({ error: "Missing webhook secret configuration" }), { status: 500 });
    }

    const body = await req.text();
    const svixId = req.headers.get("svix-id");
    const svixTimestamp = req.headers.get("svix-timestamp");
    const svixSignature = req.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response(JSON.stringify({ error: "Missing required headers" }), { status: 400 });
    }

    const wh = new Webhook(SIGNING_SECRET);

    let event: any;
    try {
      event = wh.verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      });
    } catch {
      return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
    }

    const supabaseUrl = Deno.env.get("PROJECT_URL");
    const supabaseServiceKey = Deno.env.get("SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: "Missing Supabase configuration" }), { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (event.type === "user.created") {
      const user = event.data;
      const email = user.email_addresses?.[0]?.email_address ?? null;
      const fullName = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || null;

      const { error } = await supabase.from("profiles").insert({
        id: user.id,
        email,
        full_name: fullName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        return new Response(JSON.stringify({ error: "Database insert failed", details: error.message }), { status: 500 });
      }
    }

    if (event.type === "user.updated") {
      const user = event.data;
      const email = user.email_addresses?.[0]?.email_address ?? null;
      const fullName = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || null;

      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        email,
        full_name: fullName,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        return new Response(JSON.stringify({ error: "Database update failed", details: error.message }), { status: 500 });
      }
    }

    if (event.type === "user.deleted") {
      const user = event.data;

      const { error } = await supabase.from("profiles").delete().eq("id", user.id);

      if (error) {
        return new Response(JSON.stringify({ error: "Database delete failed", details: error.message }), { status: 500 });
      }
    }

    return new Response(JSON.stringify({ success: true, event: event.type }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error", details: String(err) }), { status: 500 });
  }
});
