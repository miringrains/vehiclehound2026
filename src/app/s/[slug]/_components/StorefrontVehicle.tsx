"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Props = {
  vehicle: {
    id: string;
    year: number;
    make: string;
    model: string;
    trim: string | null;
    vin: string | null;
    stock_number: string | null;
    inventory_type: string;
    vehicle_type: string | null;
    mileage: number | null;
    exterior_color: string | null;
    interior_color: string | null;
    engine: string | null;
    transmission: string | null;
    drivetrain: string | null;
    fuel_type: string | null;
    body_style: string | null;
    doors: number | null;
    description: string | null;
    online_price: number | null;
    sale_price: number | null;
    msrp: number | null;
    lease_payment: number | null;
    lease_term: number | null;
    condition: string | null;
  };
  images: string[];
  slug: string;
  showPricing: boolean;
  showCreditApp: boolean;
  phone: string | null;
  primaryColor: string;
  dealershipId: string;
  apiKey: string | null;
};

function fmtPrice(v: number | null | undefined): string {
  if (!v) return "";
  return "$" + v.toLocaleString();
}

function trackEvent(apiKey: string, event: string, vehicleId: string) {
  const sessionId = (() => {
    try { let id = sessionStorage.getItem("vh_session_id"); if (!id) { id = crypto.randomUUID(); sessionStorage.setItem("vh_session_id", id); } return id; } catch { return crypto.randomUUID(); }
  })();
  fetch("/api/widget/events", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-Key": apiKey },
    body: JSON.stringify({ events: [{ event, vehicle_id: vehicleId, session_id: sessionId, url: window.location.href, source: "storefront" }] }),
    keepalive: true,
  }).catch(() => {});
}

export function StorefrontVehicle({ vehicle, images, slug, showPricing, showCreditApp, phone, primaryColor, dealershipId, apiKey }: Props) {
  const [currentImage, setCurrentImage] = useState(0);
  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ""}`;

  const specs: [string, string][] = [];
  if (vehicle.mileage != null) specs.push(["Mileage", `${vehicle.mileage.toLocaleString()} mi`]);
  if (vehicle.exterior_color) specs.push(["Exterior", vehicle.exterior_color]);
  if (vehicle.interior_color) specs.push(["Interior", vehicle.interior_color]);
  if (vehicle.engine) specs.push(["Engine", vehicle.engine]);
  if (vehicle.transmission) specs.push(["Transmission", vehicle.transmission]);
  if (vehicle.drivetrain) specs.push(["Drivetrain", vehicle.drivetrain]);
  if (vehicle.fuel_type) specs.push(["Fuel", vehicle.fuel_type]);
  if (vehicle.body_style) specs.push(["Body", vehicle.body_style]);
  if (vehicle.doors) specs.push(["Doors", String(vehicle.doors)]);
  if (vehicle.vin) specs.push(["VIN", vehicle.vin]);
  if (vehicle.stock_number) specs.push(["Stock #", vehicle.stock_number]);
  if (vehicle.condition) specs.push(["Condition", vehicle.condition === "new" ? "New" : "Used"]);

  const btnStyle: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
    padding: "10px 20px", borderRadius: "var(--sf-radius)", fontSize: 14, fontWeight: 600,
    cursor: "pointer", border: "none", transition: "opacity 0.15s",
  };

  return (
    <div>
      <Link href={`/s/${slug}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--sf-text-muted)", marginBottom: 16 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
        Back to Inventory
      </Link>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }} className="sf-detail-grid">
        {/* Gallery */}
        <div>
          <div style={{ position: "relative", aspectRatio: "16/10", background: "var(--sf-img-bg)", borderRadius: "var(--sf-radius)", overflow: "hidden" }}>
            {images.length > 0 ? (
              <Image src={images[currentImage]} alt={title} fill style={{ objectFit: "cover" }} sizes="(max-width: 768px) 100vw, 60vw" priority />
            ) : (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="var(--sf-text-muted)" strokeWidth="1.5" opacity="0.3">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
                </svg>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div style={{ display: "flex", gap: 6, marginTop: 8, overflowX: "auto", paddingBottom: 4 }}>
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImage(i)}
                  style={{
                    flexShrink: 0, width: 64, height: 48, borderRadius: 6, overflow: "hidden",
                    border: currentImage === i ? `2px solid ${primaryColor}` : "2px solid transparent",
                    cursor: "pointer", background: "var(--sf-img-bg)", padding: 0,
                  }}
                >
                  <Image src={img} alt="" width={64} height={48} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>{title}</h1>
              {vehicle.inventory_type === "lease" && (
                <span style={{ display: "inline-block", background: primaryColor, color: "#fff", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 6, marginTop: 6 }}>Lease</span>
              )}
            </div>
            {showPricing && (
              <div style={{ textAlign: "right" }}>
                {vehicle.inventory_type === "lease" && vehicle.lease_payment ? (
                  <>
                    <p style={{ fontSize: 22, fontWeight: 700, margin: 0, color: primaryColor }}>{fmtPrice(vehicle.lease_payment)}<span style={{ fontSize: 14, fontWeight: 400 }}>/mo</span></p>
                    {vehicle.lease_term && <p style={{ fontSize: 12, color: "var(--sf-text-muted)", margin: "2px 0 0" }}>{vehicle.lease_term} month lease</p>}
                    {vehicle.msrp && <p style={{ fontSize: 12, color: "var(--sf-text-muted)", margin: "2px 0 0" }}>MSRP {fmtPrice(vehicle.msrp)}</p>}
                  </>
                ) : (
                  <>
                    <p style={{ fontSize: 22, fontWeight: 700, margin: 0, color: primaryColor }}>{fmtPrice(vehicle.online_price || vehicle.sale_price)}</p>
                    {vehicle.msrp && vehicle.msrp !== vehicle.online_price && (
                      <p style={{ fontSize: 12, color: "var(--sf-text-muted)", margin: "2px 0 0", textDecoration: "line-through" }}>MSRP {fmtPrice(vehicle.msrp)}</p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* CTAs */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 20 }}>
            {showCreditApp && (
              <Link
                href={`/s/${slug}/credit-application?vehicle=${vehicle.id}`}
                onClick={() => apiKey && trackEvent(apiKey, "apply_click", vehicle.id)}
                style={{ ...btnStyle, background: primaryColor, color: "#fff" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
                </svg>
                Apply for Financing
              </Link>
            )}
            {phone && (
              <a
                href={`tel:${phone}`}
                onClick={() => apiKey && trackEvent(apiKey, "call_click", vehicle.id)}
                style={{ ...btnStyle, background: "var(--sf-card)", color: "var(--sf-text)", border: "1px solid var(--sf-border)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                Call Dealer
              </a>
            )}
          </div>

          {/* Specs */}
          {specs.length > 0 && (
            <div style={{ marginTop: 24, border: "1px solid var(--sf-border)", borderRadius: "var(--sf-radius)", overflow: "hidden" }}>
              {specs.map(([label, value], i) => (
                <div
                  key={label}
                  style={{
                    display: "flex", justifyContent: "space-between", padding: "10px 14px",
                    fontSize: 13, borderTop: i > 0 ? "1px solid var(--sf-border)" : "none",
                    background: i % 2 === 0 ? "transparent" : "var(--sf-hover)",
                  }}
                >
                  <span style={{ color: "var(--sf-text-muted)" }}>{label}</span>
                  <span style={{ fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          {vehicle.description && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Description</h3>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--sf-text-muted)", whiteSpace: "pre-line" }}>{vehicle.description}</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .sf-detail-grid { grid-template-columns: 1.2fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}
