import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { planSlugFromPriceId } from "@/config/stripe-prices";
import { getPlan } from "@/config/plans";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("[WEBHOOK] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription" || !session.subscription) break;

        const dealershipId = session.metadata?.dealership_id;
        const planSlug = session.metadata?.plan_slug;
        if (!dealershipId) break;

        const plan = planSlug ? getPlan(planSlug as "starter" | "professional" | "enterprise") : null;

        await admin
          .from("dealerships")
          .update({
            stripe_subscription_id: typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id,
            subscription_status: "active",
            plan: planSlug || "starter",
            max_users: plan?.maxUsers ?? 2,
            trial_ends_at: null,
          })
          .eq("id", dealershipId);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

        const { data: dealership } = await admin
          .from("dealerships")
          .select("id, is_free_account")
          .eq("stripe_customer_id", customerId)
          .single();

        if (!dealership || dealership.is_free_account) break;

        const priceId = subscription.items.data[0]?.price?.id;
        const newPlanSlug = priceId ? planSlugFromPriceId(priceId) : null;
        const plan = newPlanSlug ? getPlan(newPlanSlug) : null;

        const statusMap: Record<string, string> = {
          active: "active",
          trialing: "trialing",
          past_due: "past_due",
          canceled: "canceled",
          unpaid: "unpaid",
          incomplete: "incomplete",
          incomplete_expired: "incomplete_expired",
          paused: "active",
        };

        const update: Record<string, unknown> = {
          subscription_status: statusMap[subscription.status] || subscription.status,
          stripe_subscription_id: subscription.id,
        };

        if (newPlanSlug) {
          update.plan = newPlanSlug;
          if (plan) update.max_users = plan.maxUsers;
        }

        await admin
          .from("dealerships")
          .update(update)
          .eq("id", dealership.id);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

        const { data: dealership } = await admin
          .from("dealerships")
          .select("id, is_free_account")
          .eq("stripe_customer_id", customerId)
          .single();

        if (!dealership || dealership.is_free_account) break;

        await admin
          .from("dealerships")
          .update({
            subscription_status: "canceled",
            stripe_subscription_id: null,
          })
          .eq("id", dealership.id);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === "string"
          ? invoice.customer
          : invoice.customer?.id;
        if (!customerId) break;

        const { data: dealership } = await admin
          .from("dealerships")
          .select("id, is_free_account")
          .eq("stripe_customer_id", customerId)
          .single();

        if (!dealership || dealership.is_free_account) break;

        await admin
          .from("dealerships")
          .update({ subscription_status: "past_due" })
          .eq("id", dealership.id);
        break;
      }
    }
  } catch (err) {
    console.error(`[WEBHOOK] Error processing ${event.type}:`, err);
    return NextResponse.json({ error: "Webhook handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
