import { NextResponse } from "next/server";

const NHTSA_BASE = "https://vpic.nhtsa.dot.gov/api/vehicles";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const make = searchParams.get("make");
    const year = searchParams.get("year");

    if (!make) {
      return NextResponse.json({ error: "make is required" }, { status: 400 });
    }

    let url: string;
    if (year) {
      url = `${NHTSA_BASE}/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${year}?format=json`;
    } else {
      url = `${NHTSA_BASE}/GetModelsForMake/${encodeURIComponent(make)}?format=json`;
    }

    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) {
      return NextResponse.json({ error: "NHTSA unavailable" }, { status: 502 });
    }

    const json = await res.json();
    const results = json.Results || [];

    const models: string[] = results
      .map((r: Record<string, string>) => r.Model_Name)
      .filter(Boolean)
      .map((n: string) => n.trim())
      .filter((n: string) => n.length > 0)
      .sort();

    const unique = [...new Set(models)];

    return NextResponse.json({ models: unique });
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
