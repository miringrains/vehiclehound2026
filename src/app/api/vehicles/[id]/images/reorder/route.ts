import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(
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
    const { order } = body as { order: { id: string; display_order: number }[] };

    if (!Array.isArray(order)) {
      return NextResponse.json({ error: "order array is required" }, { status: 400 });
    }

    for (const item of order) {
      await supabase
        .from("vehicle_images")
        .update({ display_order: item.display_order })
        .eq("id", item.id)
        .eq("vehicle_id", vehicleId);
    }

    if (order.length > 0) {
      const firstImage = order.find((o) => o.display_order === 0);
      if (firstImage) {
        const { data: img } = await supabase
          .from("vehicle_images")
          .select("file_path")
          .eq("id", firstImage.id)
          .single();

        if (img) {
          const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
          const publicUrl = `${projectUrl}/storage/v1/object/public/vehicle-images/${img.file_path}`;

          await supabase
            .from("vehicles")
            .update({ preview_image: publicUrl, updated_at: new Date().toISOString() })
            .eq("id", vehicleId);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
