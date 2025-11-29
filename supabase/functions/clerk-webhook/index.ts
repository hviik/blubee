import { serve } from "https://deno.land/std@0.177.1/http/server.ts";
import { Webhook } from "npm:svix";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const SIGNING_SECRET = Deno.env.get("CLERK_WEBHOOK_SECRET");
  if (!SIGNING_SECRET) {
    return new Response("Missing webhook secret", { status: 500 });
  }

  const body = await req.text();
  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing headers", { status: 400 });
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
    return new Response("Invalid signature", { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("PROJECT_URL")!,
    Deno.env.get("SERVICE_ROLE_KEY")!
  );

  if (event.type === "user.created") {
    const user = event.data;
    const email = user.email_addresses?.[0]?.email_address;
    const fullName = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();

    const { error } = await supabase.from("users").insert({
      id: user.id,
      email,
      full_name: fullName,
    });

    if (error) {
      return new Response("DB insert error", { status: 500 });
    }
  }

  return new Response("OK", { status: 200 });
});
