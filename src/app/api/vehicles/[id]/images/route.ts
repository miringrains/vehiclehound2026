import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: vehicleId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { file_path, display_order } = body;

    if (!file_path) {
      return NextResponse.json({ error: "file_path is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("vehicle_images")
      .insert({
        vehicle_id: vehicleId,
        file_path,
        display_order: display_order ?? 0,
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (display_order === 0) {
      const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const publicUrl = `${projectUrl}/storage/v1/object/public/vehicle-images/${file_path}`;

      await supabase
        .from("vehicles")
        .update({ preview_image: publicUrl, updated_at: new Date().toISOString() })
        .eq("id", vehicleId);
    }

    return NextResponse.json({ id: data.id });
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: vehicleId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("vehicle_images")
      .select("*")
      .eq("vehicle_id", vehicleId)
      .order("display_order", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ images: data });
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
