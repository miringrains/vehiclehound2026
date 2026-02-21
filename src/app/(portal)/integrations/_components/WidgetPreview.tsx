"use client";

type RadiusPreset = "sharp" | "rounded" | "soft";

const RADIUS_MAP: Record<RadiusPreset, { card: number; button: number; search: number; badge: number }> = {
  sharp:   { card: 4,  button: 4,  search: 6,  badge: 4 },
  rounded: { card: 12, button: 8,  search: 10, badge: 6 },
  soft:    { card: 20, button: 14, search: 16, badge: 10 },
};

const MOCK_CARS = [
  { name: "2025 BMW X7 xDrive", price: "$999/mo", term: "39 mo", mileage: "7,500 mi/yr" },
  { name: "2025 Mercedes C300", price: "$348/mo", term: "24 mo", mileage: "7,500 mi/yr" },
];

type WidgetPreviewProps = {
  primaryColor: string;
  borderRadius: RadiusPreset;
  showPricing: boolean;
};

function darkenHex(hex: string, factor = 0.12): string {
  const h = hex.replace("#", "");
  const r = Math.round(parseInt(h.substring(0, 2), 16) * (1 - factor));
  const g = Math.round(parseInt(h.substring(2, 4), 16) * (1 - factor));
  const b = Math.round(parseInt(h.substring(4, 6), 16) * (1 - factor));
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

export function WidgetPreview({ primaryColor, borderRadius, showPricing }: WidgetPreviewProps) {
  const r = RADIUS_MAP[borderRadius] ?? RADIUS_MAP.rounded;
  const hoverColor = darkenHex(primaryColor);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
        </div>
        <div className="flex-1 mx-8">
          <div className="bg-muted rounded-md px-3 py-1 text-[10px] text-muted-foreground text-center font-mono truncate">
            yourwebsite.com/inventory
          </div>
        </div>
      </div>

      {/* Widget content — white background to simulate third-party site */}
      <div className="bg-white p-5" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        {/* Search bar */}
        <div
          className="flex items-center gap-2.5 border px-3.5 py-2.5 mb-4"
          style={{ borderColor: "#e5e5e5", borderRadius: r.search }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span style={{ fontSize: 12, color: "#aaa" }}>Search by make, model, or keyword...</span>
        </div>

        {/* Vehicle grid */}
        <div className="flex items-center justify-between mb-3">
          <span style={{ fontSize: 11, color: "#666", fontWeight: 500 }}>12 vehicles found</span>
          <span style={{ fontSize: 11, color: "#999", border: "1px solid #e5e5e5", borderRadius: r.button, padding: "4px 10px" }}>Featured</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {MOCK_CARS.map((car, i) => (
            <div
              key={i}
              style={{
                border: "1px solid #eee",
                borderRadius: r.card,
                overflow: "hidden",
              }}
            >
              {/* Image area */}
              <div style={{ position: "relative", aspectRatio: "4/3", background: "#f5f5f5" }}>
                <span
                  style={{
                    position: "absolute", top: 8, left: 8,
                    fontSize: 7, fontWeight: 700, textTransform: "uppercase" as const,
                    letterSpacing: "0.5px", color: "#fff",
                    background: "#22c55e", padding: "2px 7px",
                    borderRadius: r.badge,
                  }}
                >
                  Available
                </span>
                {showPricing && (
                  <span
                    style={{
                      position: "absolute", top: 8, right: 8,
                      fontSize: 11, fontWeight: 800, color: "#1a1d1e",
                      background: "#fff", padding: "3px 8px",
                      borderRadius: r.button,
                      boxShadow: "0 1px 4px rgba(0,0,0,.08)",
                    }}
                  >
                    {car.price}
                  </span>
                )}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#d4d4d4", fontSize: 10 }}>
                  Vehicle Image
                </div>
              </div>

              {/* Card body */}
              <div style={{ padding: "10px 12px 12px" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#1a1d1e", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {car.name}
                </p>
                {showPricing && (
                  <div style={{ display: "flex", gap: 8, fontSize: 9, color: "#999", marginBottom: 8 }}>
                    <span><strong style={{ color: "#666" }}>TERM:</strong> {car.term}</span>
                    <span>{car.mileage}</span>
                  </div>
                )}
                <button
                  style={{
                    display: "block", width: "100%",
                    padding: "7px 0", border: "none",
                    borderRadius: r.button,
                    fontSize: 10, fontWeight: 600,
                    color: "#fff", cursor: "default",
                    backgroundColor: primaryColor,
                    transition: "background-color 0.15s",
                  }}
                  onMouseEnter={(e) => { (e.target as HTMLElement).style.backgroundColor = hoverColor; }}
                  onMouseLeave={(e) => { (e.target as HTMLElement).style.backgroundColor = primaryColor; }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination mock */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 14 }}>
          <span style={{ fontSize: 9, color: "#ccc", border: "1px solid #eee", borderRadius: r.button, padding: "4px 12px" }}>Previous</span>
          <span style={{ fontSize: 9, color: "#999" }}>1 of 3</span>
          <span style={{ fontSize: 9, color: "#666", border: "1px solid #e5e5e5", borderRadius: r.button, padding: "4px 12px" }}>Next</span>
        </div>
      </div>
    </div>
  );
}
