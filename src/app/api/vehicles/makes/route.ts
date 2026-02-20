import { NextResponse } from "next/server";

const NHTSA_BASE = "https://vpic.nhtsa.dot.gov/api/vehicles";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");

    let url: string;
    if (year) {
      url = `${NHTSA_BASE}/GetMakesForVehicleType/car?format=json`;
    } else {
      url = `${NHTSA_BASE}/GetAllMakes?format=json`;
    }

    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) {
      return NextResponse.json({ error: "NHTSA unavailable" }, { status: 502 });
    }

    const json = await res.json();
    const results = json.Results || [];

    const makes: string[] = results
      .map((r: Record<string, string>) => r.MakeName || r.Make_Name)
      .filter(Boolean)
      .map((n: string) => n.trim())
      .filter((n: string) => n.length > 0)
      .sort();

    const unique = [...new Set(makes)];

    return NextResponse.json({ makes: unique });
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
