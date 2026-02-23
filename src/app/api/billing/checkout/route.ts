import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import { getPriceId, type BillingInterval } from "@/config/stripe-prices";
import type { PlanSlug } from "@/config/plans";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("dealership_id, dealership_role, email, name")
      .eq("id", user.id)
      .single();

    if (!profile?.dealership_id || profile.dealership_role !== "owner") {
      return NextResponse.json({ error: "Only dealership owners can manage billing" }, { status: 403 });
    }

    const admin = createAdminClient();
    const { data: dealership } = await admin
      .from("dealerships")
      .select("id, name, is_free_account, stripe_customer_id")
      .eq("id", profile.dealership_id)
      .single();

    if (!dealership) {
      return NextResponse.json({ error: "Dealership not found" }, { status: 404 });
    }

    if (dealership.is_free_account) {
      return NextResponse.json({ error: "This account is permanently free" }, { status: 400 });
    }

    const body = await request.json();
    const { planSlug, interval } = body as { planSlug: PlanSlug; interval: BillingInterval };

    if (!["starter", "professional", "enterprise"].includes(planSlug)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }
    if (!["monthly", "yearly"].includes(interval)) {
      return NextResponse.json({ error: "Invalid interval" }, { status: 400 });
    }

    const priceId = getPriceId(planSlug, interval);

    let stripeCustomerId = dealership.stripe_customer_id;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: profile.email ?? user.email ?? undefined,
        name: dealership.name,
        metadata: {
          dealership_id: dealership.id,
          user_id: user.id,
        },
      });
      stripeCustomerId = customer.id;

      await admin
        .from("dealerships")
        .update({ stripe_customer_id: customer.id })
        .eq("id", dealership.id);
    }

    const origin = request.headers.get("origin") || request.headers.get("referer")?.replace(/\/[^/]*$/, "") || process.env.NEXT_PUBLIC_APP_URL || "https://vehiclehound.com";

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/billing?success=true`,
      cancel_url: `${origin}/billing?canceled=true`,
      subscription_data: {
        metadata: {
          dealership_id: dealership.id,
          plan_slug: planSlug,
        },
      },
      metadata: {
        dealership_id: dealership.id,
        plan_slug: planSlug,
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[BILLING CHECKOUT]", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
