import { NextResponse } from "next/server";

const NHTSA_BASE = "https://vpic.nhtsa.dot.gov/api/vehicles";

const POPULAR_MAKES = new Set([
  "Acura", "Audi", "BMW", "Buick", "Cadillac", "Chevrolet", "Chrysler",
  "Dodge", "Ford", "Genesis", "GMC", "Honda", "Hyundai", "INFINITI",
  "Jaguar", "Jeep", "Kia", "Land Rover", "Lexus", "Lincoln", "Mazda",
  "Mercedes-Benz", "MINI", "Mitsubishi", "Nissan", "Porsche", "Ram",
  "Rivian", "Subaru", "Tesla", "Toyota", "Volkswagen", "Volvo",
]);

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

    const rawMakes: string[] = results
      .map((r: Record<string, string>) => r.MakeName || r.Make_Name)
      .filter(Boolean)
      .map((n: string) => n.trim())
      .filter((n: string) => n.length > 0);

    const unique = [...new Set(rawMakes)];

    const popular = unique
      .filter((m) => POPULAR_MAKES.has(m))
      .sort((a, b) => a.localeCompare(b));

    const rest = unique
      .filter((m) => !POPULAR_MAKES.has(m))
      .sort((a, b) => a.localeCompare(b));

    return NextResponse.json({ makes: [...popular, ...rest], popular_count: popular.length });
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
