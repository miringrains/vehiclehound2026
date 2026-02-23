import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("dealership_id, dealership_role")
      .eq("id", user.id)
      .single();

    if (!profile?.dealership_id || profile.dealership_role !== "owner") {
      return NextResponse.json({ error: "Only dealership owners can manage billing" }, { status: 403 });
    }

    const admin = createAdminClient();
    const { data: dealership } = await admin
      .from("dealerships")
      .select("stripe_customer_id")
      .eq("id", profile.dealership_id)
      .single();

    if (!dealership?.stripe_customer_id) {
      return NextResponse.json({ error: "No billing account found. Subscribe to a plan first." }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.billingPortal.sessions.create({
      customer: dealership.stripe_customer_id,
      return_url: `${appUrl}/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[BILLING PORTAL]", err);
    return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 });
  }
}
