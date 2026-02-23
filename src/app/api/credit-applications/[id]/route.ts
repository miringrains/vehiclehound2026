import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notifyCreditAppStatusChange } from "@/lib/email/credit-application-email";

type RouteContext = { params: Promise<{ id: string }> };

/* ────────────────────────────────────────────────
   GET /api/credit-applications/:id
   ──────────────────────────────────────────────── */
export async function GET(_request: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("credit_applications")
      .select("*, vehicle:vehicles(year, make, model, stock_number, trim, inventory_type)")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

/* ────────────────────────────────────────────────
   PATCH /api/credit-applications/:id
   Updates status or other mutable fields
   ──────────────────────────────────────────────── */
export async function PATCH(request: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const allowedFields = ["status"];
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    for (const key of allowedFields) {
      if (body[key] !== undefined) updates[key] = body[key];
    }

    if (updates.status) {
      const valid = ["new", "reviewed", "approved", "denied"];
      if (!valid.includes(updates.status as string)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
    }

    const { data, error } = await supabase
      .from("credit_applications")
      .update(updates)
      .eq("id", id)
      .select("id, status, updated_at, first_name, last_name, email")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (data.email && ["approved", "denied", "reviewed"].includes(data.status)) {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("dealership_id")
          .eq("id", user.id)
          .single();
        let dealershipName = "the dealership";
        if (profile?.dealership_id) {
          const { data: dlr } = await supabase.from("dealerships").select("name").eq("id", profile.dealership_id).single();
          if (dlr?.name) dealershipName = dlr.name;
        }
        await notifyCreditAppStatusChange({
          applicantEmail: data.email,
          applicantName: `${data.first_name} ${data.last_name}`.trim(),
          status: data.status as "approved" | "denied" | "reviewed",
          dealershipName,
        });
      } catch {
        // Email is non-critical
      }
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
