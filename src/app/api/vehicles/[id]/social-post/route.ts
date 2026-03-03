import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getGeminiClient } from "@/lib/gemini";
import { isFeatureAvailable } from "@/config/features";
import type { PlanSlug } from "@/config/plans";
import sharp from "sharp";

export const maxDuration = 60;

type SocialFormat = "instagram-post" | "instagram-story" | "facebook-post";

const FORMAT_SPECS: Record<SocialFormat, { label: string; dimensions: string }> =
  {
    "instagram-post": { label: "Instagram Post", dimensions: "1080x1080 (1:1)" },
    "instagram-story": {
      label: "Instagram Story",
      dimensions: "1080x1920 (9:16)",
    },
    "facebook-post": {
      label: "Facebook Post",
      dimensions: "1200x630 (landscape)",
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
  const exterior = vehicle.exterior_color ?? "Unknown";
  const interior = vehicle.interior_color ?? "Unknown";
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

  return `You are a premium automotive marketing designer. Create a social media graphic for a car dealership.

FORMAT: ${spec.label} (${spec.dimensions})

VEHICLE DETAILS:
- ${year} ${make} ${model} ${trim}
- ${isLease ? `Lease: ${priceInfo}` : `Sale Price: ${priceInfo}`}
${mileageInfo ? `- Mileage: ${mileageInfo}` : ""}
- Colors: ${exterior} / ${interior}

DEALERSHIP: ${dealershipName}
BRAND PRIMARY COLOR: ${brandColor}

DESIGN REQUIREMENTS:
- Feature the provided car photo prominently as the hero element
- Create a sleek, premium background — use a dark gradient, subtle geometric shapes, ambient lighting effects, or a moody automotive environment that complements the car's color
- NEVER use a plain white or flat-colored background — the design should feel cinematic and high-end
- Use the brand primary color (${brandColor}) as the accent color for overlays, badges, or typography highlights
- Include the vehicle name, price, and dealership name as clean typography overlays
- Professional, modern, premium automotive aesthetic (think luxury dealership, not used car lot)
- Clean composition with clear visual hierarchy: car first, price second, dealership third
- Do NOT add any text besides: vehicle name, price/payment, and dealership name
- No clip art, no cartoon elements, no stock watermarks
${isLease ? '- Show "LEASE" badge and monthly payment prominently' : "- Show sale price prominently"}
- Output ONLY the image, no additional text`;
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
