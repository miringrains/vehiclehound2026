import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getGeminiClient } from "@/lib/gemini";
import { isFeatureAvailable } from "@/config/features";
import type { PlanSlug } from "@/config/plans";
import sharp from "sharp";

export const maxDuration = 60;

type SocialFormat = "instagram-post" | "instagram-story" | "facebook-post";

const FORMAT_SPECS: Record<
  SocialFormat,
  { label: string; dimensions: string; layout: string }
> = {
  "instagram-post": {
    label: "Instagram Post",
    dimensions: "1080x1080 (1:1 square)",
    layout:
      "Square format. Position the car in the lower two-thirds of the frame, viewed from a low 3/4 front angle to convey power and presence. The car should be grounded on a reflective surface with perspective depth behind it. Place the typography lockup in the upper-left or upper-right area, anchored to the top margin with generous padding. The upper third is reserved for text, the lower two-thirds for the car — they should not overlap.",
  },
  "instagram-story": {
    label: "Instagram Story",
    dimensions: "1080x1920 (9:16 vertical)",
    layout:
      "Tall vertical format. Position the car in the center of the frame, viewed from a dramatic low angle looking slightly upward to make the car feel imposing in the vertical space. Place the typography lockup in the lower quarter of the frame, stacked vertically (price above vehicle name). Leave the top 20% as open atmospheric space — this is where the background gradient or lighting blooms. The vertical format should feel cinematic, like a movie poster.",
  },
  "facebook-post": {
    label: "Facebook Post",
    dimensions: "1200x630 (landscape 1.91:1)",
    layout:
      "Wide landscape format. Position the car on the right two-thirds of the frame, viewed from a classic profile or 3/4 angle that stretches across the width. Place the typography lockup on the left third, vertically centered, creating a clean split composition — text left, car right. The wide format should feel panoramic and editorial, like a magazine spread.",
  },
};

function buildPrompt(
  format: SocialFormat,
  vehicle: Record<string, unknown>,
  dealershipName: string,
  brandColor: string
): string {
  const year = vehicle.year ?? "";
  const make = vehicle.make ?? "";
  const model = vehicle.model ?? "";
  const trim = vehicle.trim ?? "";
  const exterior = String(vehicle.exterior_color ?? "Unknown");
  const interior = String(vehicle.interior_color ?? "Unknown");
  const isLease = vehicle.inventory_type === "lease";

  let priceInfo: string;
  if (isLease) {
    const payment = vehicle.lease_payment
      ? `$${vehicle.lease_payment}/mo`
      : "Contact for pricing";
    const term = vehicle.lease_term ? `${vehicle.lease_term} months` : "";
    const mileage = vehicle.lease_annual_mileage
      ? `${Number(vehicle.lease_annual_mileage).toLocaleString()} mi/yr`
      : "";
    const down = vehicle.lease_down_payment
      ? `$${Number(vehicle.lease_down_payment).toLocaleString()} down`
      : "";
    priceInfo = [payment, term, mileage, down].filter(Boolean).join(", ");
  } else {
    const price =
      vehicle.sale_price || vehicle.online_price || vehicle.msrp;
    priceInfo = price
      ? `$${Number(price).toLocaleString()}`
      : "Contact for pricing";
  }

  const mileageInfo = vehicle.mileage
    ? `${Number(vehicle.mileage).toLocaleString()} miles`
    : "";

  const spec = FORMAT_SPECS[format];

  const vehicleName = `${year} ${make} ${model}${trim ? ` ${trim}` : ""}`;

  return `Generate a ${spec.label} (${spec.dimensions}) cinematic editorial automotive advertisement photograph.

LAYOUT — FORMAT-SPECIFIC PLACEMENT:
${spec.layout}

SCENE & LIGHTING:
The car is the hero — it must feel three-dimensional, grounded, and physically present in the scene. Use dramatic studio lighting: a strong key light from a 45-degree angle sculpting the body panels with deep shadows, plus subtle rim lighting along the roofline and wheel arches that separates the car from the background. Add a faint reflection of the car on the floor surface beneath it for depth. The overall mood is high-contrast, moody, and aspirational — like a luxury car commercial frozen in a single frame.

BACKGROUND & ENVIRONMENT:
Create a vast, atmospheric studio environment. The floor should be a dark reflective surface (polished concrete or wet asphalt) that catches faint light and the car's reflection. The background should transition from deep ${exterior === "Unknown" ? "navy" : exterior.toLowerCase().includes("white") ? "slate" : "charcoal"} into darkness with smooth gradients — never a hard edge or flat wall. Add one subtle environmental detail for depth: a soft diagonal light beam cutting through atmospheric haze, or a faint geometric line on the floor converging toward the car. No clutter, no complex environments, no cheesy overlays.

BRAND COLOR INTEGRATION:
Incorporate ${brandColor} exclusively as one of these: a subtle ambient light reflection on the floor beneath the car, a singular thin geometric accent line in the composition, or a faint color cast in the rim lighting. Do not use it as a large fill, banner, or background color.

TYPOGRAPHY & TEXT DESIGN — THIS IS WHAT MAKES OR BREAKS THE GRAPHIC:
The text is not an afterthought — it is a designed visual element integrated into the composition. Think of how Nike, Apple, or Porsche design their ads: the typography IS the design.

There are exactly TWO text lockups. Render only these exact strings:

1. HERO LOCKUP — "${isLease ? priceInfo : priceInfo}"${isLease ? ' with a "LEASE" label' : ""}
This is a designed typographic element, not plain text. Render the price in an ultra-bold condensed sans-serif typeface at a dramatically oversized scale. The price should feel architectural — like it was built, not typed. Pair it with a visual treatment: a sleek horizontal accent bar in ${brandColor} running beneath or beside the price, or place the price inside a minimal frosted glass panel with subtle blur, or render the numbers with a faint metallic sheen. The price must pop instantly — if someone scrolls past in 0.3 seconds, this is the only thing they register.${isLease ? ' The "LEASE" label should appear as a small, sharp, uppercase tag — either inside a thin rounded pill shape or as a clean all-caps label with extreme letter-spacing positioned just above or beside the payment amount.' : ""}

2. VEHICLE NAME — "${vehicleName}"
Render in a thin or light weight of the same typeface family as the price, creating dramatic weight contrast (ultra-bold price vs ultra-light vehicle name). Use wide letter-spacing and uppercase. Position it directly adjacent to the price lockup — they should feel like one cohesive typographic unit, not two separate floating labels.

ABSOLUTE TEXT RULES:
- Do NOT render any other words — no dealership name, no taglines, no "call now," no URLs, no watermarks.
- All text must be white or near-white against the dark background. Guarantee contrast.
- Text must feel designed and intentional — anchored to a grid, aligned with visual elements, not randomly floating.

SPATIAL RULES — NON-NEGOTIABLE:
- The car and the text must occupy SEPARATE zones of the frame as defined in the LAYOUT section above. They must never overlap or crowd each other.
- The car must appear WHOLE — no cropping of bumpers, wheels, or roof. Show the full vehicle including all four wheels, the complete front/rear, and the roofline. The car should sit naturally on the floor surface, grounded with visible shadows beneath.
- Maintain generous margins from all edges — nothing should touch or feel pressed against the frame boundary.
- The eye should flow naturally: car → price → vehicle name. The car commands attention first, then the price, then the vehicle name.
- If a dealership logo image is attached, place it very small (no more than 5% of frame area) and semi-transparent in whichever corner is furthest from the text lockup.

FINAL OUTPUT:
Produce only the finished image. No borders, no extra text, no annotations.`;
}

const RASTER_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

async function fetchImageAsBase64(
  url: string
): Promise<{ data: string; mimeType: string } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const contentType = (res.headers.get("content-type") || "image/jpeg")
      .split(";")[0]
      .trim();
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (contentType === "image/svg+xml") {
      const pngBuffer = await sharp(buffer).resize(512).png().toBuffer();
      return { data: pngBuffer.toString("base64"), mimeType: "image/png" };
    }

    if (!RASTER_MIME_TYPES.has(contentType)) return null;
    return { data: buffer.toString("base64"), mimeType: contentType };
  } catch {
    return null;
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: vehicleId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("dealership_id")
      .eq("id", user.id)
      .single();
    if (!profile?.dealership_id) {
      return NextResponse.json({ error: "No dealership" }, { status: 403 });
    }

    const { data: dealership } = await supabase
      .from("dealerships")
      .select("id, name, logo_url, phone, plan")
      .eq("id", profile.dealership_id)
      .single();
    if (!dealership) {
      return NextResponse.json(
        { error: "Dealership not found" },
        { status: 404 }
      );
    }

    if (
      !isFeatureAvailable(
        "social_post_generator",
        dealership.plan as PlanSlug
      )
    ) {
      return NextResponse.json(
        { error: "This feature requires an Enterprise plan." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const format: SocialFormat = body.format || "instagram-post";
    if (!FORMAT_SPECS[format]) {
      return NextResponse.json({ error: "Invalid format" }, { status: 400 });
    }

    const { data: vehicle } = await supabase
      .from("vehicles")
      .select("*")
      .eq("id", vehicleId)
      .eq("dealership_id", dealership.id)
      .single();
    if (!vehicle) {
      return NextResponse.json(
        { error: "Vehicle not found" },
        { status: 404 }
      );
    }

    let imageUrl = vehicle.preview_image;
    if (!imageUrl) {
      const { data: images } = await supabase
        .from("vehicle_images")
        .select("file_path")
        .eq("vehicle_id", vehicleId)
        .order("display_order", { ascending: true })
        .limit(1);
      if (images?.[0]) {
        imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/vehicle-images/${images[0].file_path}`;
      }
    }

    const { data: widgetConfig } = await supabase
      .from("widget_configs")
      .select("config")
      .eq("dealership_id", dealership.id)
      .single();

    const brandColor =
      (widgetConfig?.config as Record<string, string>)?.primaryColor ||
      "#1a1d1e";

    const prompt = buildPrompt(format, vehicle, dealership.name, brandColor);

    const contents: Array<
      string | { inlineData: { data: string; mimeType: string } }
    > = [prompt];

    if (imageUrl) {
      const carImage = await fetchImageAsBase64(imageUrl);
      if (carImage) {
        contents.push({ inlineData: carImage });
      }
    }

    if (dealership.logo_url) {
      const logo = await fetchImageAsBase64(dealership.logo_url);
      if (logo) {
        contents.push({ inlineData: logo });
      }
    }

    const gemini = getGeminiClient();
    const response = await gemini.models.generateContent({
      model: "gemini-3.1-flash-image-preview",
      contents,
      config: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    });

    const candidates = response.candidates;
    if (!candidates?.length) {
      return NextResponse.json(
        { error: "No image was generated. Try again." },
        { status: 500 }
      );
    }

    const parts = candidates[0].content?.parts;
    if (!parts) {
      return NextResponse.json(
        { error: "No content returned." },
        { status: 500 }
      );
    }

    let generatedImage: string | null = null;
    for (const part of parts) {
      if (part.inlineData?.data) {
        const mime = part.inlineData.mimeType || "image/png";
        generatedImage = `data:${mime};base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!generatedImage) {
      return NextResponse.json(
        { error: "The model did not return an image. Try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ image: generatedImage });
  } catch (err: unknown) {
    const apiErr = err as { status?: number; message?: string };
    console.error("[social-post]", apiErr.message);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
