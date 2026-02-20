import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const NHTSA_URL = "https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues";

const FIELD_MAP: Record<string, string> = {
  ModelYear: "year",
  Make: "make",
  Model: "model",
  Trim: "trim",
  Series: "series",
  BodyClass: "body_class",
  VehicleType: "vehicle_type",
  Doors: "doors",
  EngineHP: "engine_hp",
  EngineCylinders: "engine_cylinders",
  DisplacementL: "engine_displacement",
  FuelTypePrimary: "fuel_type",
  TransmissionStyle: "transmission_style",
  DriveType: "drive_type",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ vin: string }> }
) {
  try {
    const { vin } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!vin || vin.length !== 17) {
      return NextResponse.json({ error: "VIN must be 17 characters" }, { status: 400 });
    }

    const res = await fetch(`${NHTSA_URL}/${vin}?format=json`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "VIN decode service unavailable" }, { status: 502 });
    }

    const json = await res.json();
    const result = json.Results?.[0];

    if (!result) {
      return NextResponse.json({ error: "No results for this VIN" }, { status: 404 });
    }

    const decoded: Record<string, string | number | null> = {};

    for (const [nhtsaKey, fieldName] of Object.entries(FIELD_MAP)) {
      const raw = result[nhtsaKey]?.toString().trim();
      if (!raw || raw === "0" || raw === "Not Applicable") continue;

      if (fieldName === "year" || fieldName === "doors") {
        const num = parseInt(raw, 10);
        decoded[fieldName] = isNaN(num) ? null : num;
      } else {
        decoded[fieldName] = raw;
      }
    }

    return NextResponse.json({ decoded, raw: result });
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
