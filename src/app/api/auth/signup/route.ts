import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { signupSchema } from "@/lib/validators/auth";
import { slugify } from "@/lib/utils/slugify";
import { TRIAL_DAYS } from "@/lib/constants";
import { sendEmail } from "@/lib/email/mailgun";
import { welcomeEmail } from "@/lib/email/templates";
import { stripe } from "@/lib/stripe";
import { getPriceId } from "@/config/stripe-prices";
import { getPlan, type PlanSlug } from "@/config/plans";
import type { BillingInterval } from "@/config/stripe-prices";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { dealershipName, name, email, password, phone } = parsed.data;
    const planSlug: PlanSlug = parsed.data.plan || "starter";
    const interval: BillingInterval = parsed.data.interval || "monthly";
    const planDef = getPlan(planSlug);

    const supabase = createAdminClient();

    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    let slug = slugify(dealershipName);
    const { data: existingSlug } = await supabase
      .from("dealerships")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS);

    const { data: dealership, error: dealershipError } = await supabase
      .from("dealerships")
      .insert({
        name: dealershipName,
        slug,
        phone: phone || null,
        subscription_status: "trialing",
        plan: planSlug,
        max_users: planDef?.maxUsers ?? 2,
        trial_ends_at: trialEndsAt.toISOString(),
        active_users_count: 1,
      })
      .select()
      .single();

    if (dealershipError) {
      return NextResponse.json(
        { error: "Failed to create dealership." },
        { status: 500 }
      );
    }

    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name },
      });

    if (authError) {
      await supabase.from("dealerships").delete().eq("id", dealership.id);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    await supabase
      .from("profiles")
      .update({
        name,
        dealership_id: dealership.id,
        dealership_role: "owner",
        joined_at: new Date().toISOString(),
      })
      .eq("id", authData.user.id);

    // Create Stripe customer
    const customer = await stripe.customers.create({
      email,
      name: dealershipName,
      metadata: {
        dealership_id: dealership.id,
        user_id: authData.user.id,
      },
    });

    await supabase
      .from("dealerships")
      .update({ stripe_customer_id: customer.id })
      .eq("id", dealership.id);

    // Create Stripe Checkout Session with trial
    const priceId = getPriceId(planSlug, interval);
    const origin = request.headers.get("origin")
      || request.headers.get("referer")?.replace(/\/[^/]*$/, "")
      || process.env.NEXT_PUBLIC_APP_URL
      || "https://portal.vehiclehound.com";

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: TRIAL_DAYS,
        metadata: {
          dealership_id: dealership.id,
          plan_slug: planSlug,
        },
      },
      metadata: {
        dealership_id: dealership.id,
        plan_slug: planSlug,
      },
      payment_method_collection: "always",
      allow_promotion_codes: true,
      success_url: `${origin}/dashboard?welcome=true`,
      cancel_url: `${origin}/billing?setup=true`,
    });

    try {
      const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://portal.vehiclehound.com"}/login`;
      await sendEmail({
        to: email,
        subject: `Welcome to Vehicle Hound — ${dealershipName} is all set`,
        html: welcomeEmail({
          ownerName: name,
          dealershipName,
          loginUrl,
        }),
      });
    } catch {
      // Non-critical
    }

    return NextResponse.json({ success: true, checkoutUrl: session.url });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
