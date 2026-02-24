import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VHList – Vehicle Storefronts",
  description: "Powered by VehicleHound",
};

export default function StorefrontLandingPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",
        background: "#0a0a0a",
        color: "#f5f5f5",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 8 }}>
        VHList
      </h1>
      <p style={{ color: "#888", fontSize: 15, maxWidth: 400 }}>
        This domain hosts dealership storefronts powered by{" "}
        <a href="https://vehiclehound.com" style={{ color: "#a78bfa", textDecoration: "none" }}>
          VehicleHound
        </a>.
      </p>
    </div>
  );
}
