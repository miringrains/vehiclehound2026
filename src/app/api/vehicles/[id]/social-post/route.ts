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

  return `You are a world-class automotive art director at a top creative agency. You design social media content that wins awards and stops the scroll. Your work is influenced by modern editorial design — think Apple product launches, Porsche's Instagram, and high-fashion automotive photography.

Create a single social media graphic.

FORMAT: ${spec.label} (${spec.dimensions})

THE CAR:
${year} ${make} ${model}${trim ? ` ${trim}` : ""}
${isLease ? `Lease: ${priceInfo}` : `Price: ${priceInfo}`}

DEALERSHIP: ${dealershipName}
ACCENT COLOR: ${brandColor}

CREATIVE DIRECTION:
1. COMPOSITION: Place the car as a bold, dominant hero element. Use asymmetric or editorial composition — not centered and boring. Give it breathing room. Let negative space work for you.
2. BACKGROUND: Create an abstract, atmospheric backdrop. Think: soft color gradients with luminous bokeh, sweeping light trails, subtle particle effects, or smooth flowing curves. The vibe should feel like a luxury perfume ad meets automotive photography. NEVER use plain white, plain black, or flat solid fills.
3. TYPOGRAPHY: Minimal, modern sans-serif type (like Helvetica Neue or Montserrat weight). Vehicle name large and confident. Price smaller but clear. Dealership name subtle, bottom edge. Use generous letter-spacing. Align text to a grid — clean edges, not floating randomly.
4. COLOR: Use the accent color (${brandColor}) sparingly — a thin rule, a highlight on the price, or a subtle glow. Don't drench the design in it. Let the car's own color be the star.
5. MOOD: Premium, aspirational, editorial. This should look like it belongs on a luxury brand's Instagram, not a local classifieds ad. No cheesy gradients, no drop shadows on text, no bevels, no 2010-era glossy effects.
${isLease ? '6. Show a "LEASE" label and the monthly payment as the focal price point.' : "6. Feature the sale price as the focal price point."}
7. Include ONLY: vehicle name, price/payment, and dealership name. No other text, no phone numbers, no URLs, no "call now" badges.
8. If a dealership logo image is provided, integrate it subtly — small, in a corner, semi-transparent or monochrome. Do not let it compete with the car.

Output ONLY the final image.`;
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
