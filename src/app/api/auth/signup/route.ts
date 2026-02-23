import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { signupSchema } from "@/lib/validators/auth";
import { slugify } from "@/lib/utils/slugify";
import { TRIAL_DAYS } from "@/lib/constants";
import { sendEmail } from "@/lib/email/mailgun";
import { welcomeEmail } from "@/lib/email/templates";

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
        plan: "starter",
        max_users: 2,
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

    try {
      const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://vehiclehound.com"}/login`;
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

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
