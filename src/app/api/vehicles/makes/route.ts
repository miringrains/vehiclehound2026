import { NextResponse } from "next/server";

const NHTSA_BASE = "https://vpic.nhtsa.dot.gov/api/vehicles";

// Canonical display names for popular makes — keyed by uppercase for matching
const POPULAR_DISPLAY: Record<string, string> = {
  "ACURA": "Acura",
  "ALFA ROMEO": "Alfa Romeo",
  "ASTON MARTIN": "Aston Martin",
  "AUDI": "Audi",
  "BENTLEY": "Bentley",
  "BMW": "BMW",
  "BUICK": "Buick",
  "CADILLAC": "Cadillac",
  "CHEVROLET": "Chevrolet",
  "CHRYSLER": "Chrysler",
  "DODGE": "Dodge",
  "FERRARI": "Ferrari",
  "FIAT": "Fiat",
  "FORD": "Ford",
  "GENESIS": "Genesis",
  "GMC": "GMC",
  "HONDA": "Honda",
  "HYUNDAI": "Hyundai",
  "INFINITI": "INFINITI",
  "JAGUAR": "Jaguar",
  "JEEP": "Jeep",
  "KIA": "Kia",
  "LAMBORGHINI": "Lamborghini",
  "LAND ROVER": "Land Rover",
  "LEXUS": "Lexus",
  "LINCOLN": "Lincoln",
  "LOTUS": "Lotus",
  "LUCID": "Lucid",
  "MASERATI": "Maserati",
  "MAZDA": "Mazda",
  "MCLAREN": "McLaren",
  "MERCEDES-BENZ": "Mercedes-Benz",
  "MINI": "MINI",
  "MITSUBISHI": "Mitsubishi",
  "NISSAN": "Nissan",
  "POLESTAR": "Polestar",
  "PORSCHE": "Porsche",
  "RAM": "Ram",
  "RIVIAN": "Rivian",
  "ROLLS-ROYCE": "Rolls-Royce",
  "SUBARU": "Subaru",
  "TESLA": "Tesla",
  "TOYOTA": "Toyota",
  "VOLKSWAGEN": "Volkswagen",
  "VOLVO": "Volvo",
};

function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(/(\s+|-)/g)
    .map((seg) => (/[\s-]/.test(seg) ? seg : seg.charAt(0).toUpperCase() + seg.slice(1)))
    .join("");
}

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

    const seen = new Set<string>();
    const popular: string[] = [];
    const rest: string[] = [];

    for (const raw of rawMakes) {
      const key = raw.toUpperCase();
      if (seen.has(key)) continue;
      seen.add(key);

      const display = POPULAR_DISPLAY[key] || titleCase(raw);

      if (POPULAR_DISPLAY[key]) {
        popular.push(display);
      } else {
        rest.push(display);
      }
    }

    popular.sort((a, b) => a.localeCompare(b));
    rest.sort((a, b) => a.localeCompare(b));

    return NextResponse.json({
      makes: [...popular, ...rest],
      popular_count: popular.length,
    });
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
