export default function StorefrontNotFound() {
  return (
    <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
      <h1 style={{ fontSize: 48, fontWeight: 700, margin: 0, opacity: 0.3 }}>404</h1>
      <p style={{ fontSize: 15, marginTop: 8, color: "var(--sf-text-muted)" }}>
        Page not found
      </p>
      <a
        href="./"
        style={{
          display: "inline-block",
          marginTop: 20,
          padding: "8px 20px",
          borderRadius: "var(--sf-radius)",
          background: "var(--sf-primary)",
          color: "#fff",
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        Back to Inventory
      </a>
    </div>
  );
}
