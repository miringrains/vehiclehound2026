import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const { id: vehicleId, imageId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: image, error: fetchError } = await supabase
      .from("vehicle_images")
      .select("file_path")
      .eq("id", imageId)
      .eq("vehicle_id", vehicleId)
      .single();

    if (fetchError || !image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    await supabase.storage.from("vehicle-images").remove([image.file_path]);

    const { error } = await supabase
      .from("vehicle_images")
      .delete()
      .eq("id", imageId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
