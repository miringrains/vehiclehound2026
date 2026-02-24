"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";

type Vehicle = Record<string, unknown> & {
  id: string;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  stock_number: string | null;
  inventory_type: string;
  vehicle_type: string | null;
  mileage: number | null;
  exterior_color: string | null;
  preview_image: string | null;
  online_price: number | null;
  sale_price: number | null;
  lease_payment: number | null;
  lease_term: number | null;
  msrp: number | null;
  created_at: string;
};

type Props = {
  vehicles: Record<string, unknown>[];
  slug: string;
  showPricing: boolean;
  primaryColor: string;
};

type SortKey = "newest" | "price_asc" | "price_desc" | "year_desc" | "mileage_asc";

const ITEMS_PER_PAGE = 12;

function fmtPrice(v: number | null | undefined): string {
  if (!v) return "";
  return "$" + v.toLocaleString();
}

export function StorefrontInventory({ vehicles: rawVehicles, slug, showPricing, primaryColor }: Props) {
  const vehicles = rawVehicles as unknown as Vehicle[];
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [typeFilter, setTypeFilter] = useState<"all" | "sale" | "lease">("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = [...vehicles];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (v) =>
          v.make.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          (v.trim && v.trim.toLowerCase().includes(q)) ||
          (v.stock_number && v.stock_number.toLowerCase().includes(q)) ||
          String(v.year).includes(q)
      );
    }
    if (typeFilter !== "all") list = list.filter((v) => v.inventory_type === typeFilter);

    list.sort((a, b) => {
      switch (sort) {
        case "price_asc":
          return (a.online_price ?? Infinity) - (b.online_price ?? Infinity);
        case "price_desc":
          return (b.online_price ?? 0) - (a.online_price ?? 0);
        case "year_desc":
          return b.year - a.year;
        case "mileage_asc":
          return (a.mileage ?? Infinity) - (b.mileage ?? Infinity);
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
    return list;
  }, [vehicles, search, sort, typeFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const hasLeases = vehicles.some((v) => v.inventory_type === "lease");
  const hasSales = vehicles.some((v) => v.inventory_type === "sale");

  return (
    <div>
      {/* Controls */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20, alignItems: "center" }}>
        <input
          type="text"
          placeholder="Search inventory…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{
            flex: "1 1 200px",
            padding: "8px 12px",
            border: "1px solid var(--sf-border)",
            borderRadius: "var(--sf-radius)",
            background: "var(--sf-card)",
            color: "var(--sf-text)",
            fontSize: 14,
            outline: "none",
          }}
        />
        {hasLeases && hasSales && (
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value as typeof typeFilter); setPage(1); }}
            style={{
              padding: "8px 12px",
              border: "1px solid var(--sf-border)",
              borderRadius: "var(--sf-radius)",
              background: "var(--sf-card)",
              color: "var(--sf-text)",
              fontSize: 13,
            }}
          >
            <option value="all">All Types</option>
            <option value="sale">For Sale</option>
            <option value="lease">For Lease</option>
          </select>
        )}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          style={{
            padding: "8px 12px",
            border: "1px solid var(--sf-border)",
            borderRadius: "var(--sf-radius)",
            background: "var(--sf-card)",
            color: "var(--sf-text)",
            fontSize: 13,
          }}
        >
          <option value="newest">Newest</option>
          {showPricing && <option value="price_asc">Price: Low to High</option>}
          {showPricing && <option value="price_desc">Price: High to Low</option>}
          <option value="year_desc">Year: Newest</option>
          <option value="mileage_asc">Mileage: Low</option>
        </select>
      </div>

      {/* Results count */}
      <p style={{ fontSize: 13, color: "var(--sf-text-muted)", marginBottom: 16 }}>
        {filtered.length} vehicle{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Grid */}
      {paged.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
          <p style={{ fontSize: 15, color: "var(--sf-text-muted)" }}>No vehicles found</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {paged.map((v) => (
            <Link
              key={v.id}
              href={`/s/${slug}/vehicle/${v.id}`}
              style={{
                display: "block",
                background: "var(--sf-card)",
                border: "1px solid var(--sf-border)",
                borderRadius: "var(--sf-radius)",
                overflow: "hidden",
                transition: "box-shadow 0.15s ease, transform 0.15s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
            >
              <div style={{ position: "relative", aspectRatio: "16/10", background: "var(--sf-img-bg)" }}>
                {v.preview_image ? (
                  <Image src={v.preview_image} alt={`${v.year} ${v.make} ${v.model}`} fill style={{ objectFit: "cover" }} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                ) : (
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--sf-text-muted)" strokeWidth="1.5" opacity="0.4">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                  </div>
                )}
                {v.inventory_type === "lease" && (
                  <span style={{
                    position: "absolute", top: 8, left: 8, background: primaryColor, color: "#fff",
                    fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 6,
                  }}>
                    Lease
                  </span>
                )}
              </div>
              <div style={{ padding: "12px 14px" }}>
                <p style={{ fontWeight: 600, fontSize: 14, margin: 0, letterSpacing: "-0.01em" }}>
                  {v.year} {v.make} {v.model}
                </p>
                {v.trim && <p style={{ fontSize: 12, color: "var(--sf-text-muted)", margin: "2px 0 0" }}>{v.trim}</p>}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                  {showPricing && (
                    <span style={{ fontWeight: 600, fontSize: 15, color: primaryColor }}>
                      {v.inventory_type === "lease" && v.lease_payment
                        ? `${fmtPrice(v.lease_payment)}/mo`
                        : fmtPrice(v.online_price || v.sale_price || v.msrp)}
                    </span>
                  )}
                  {v.mileage != null && (
                    <span style={{ fontSize: 12, color: "var(--sf-text-muted)" }}>
                      {v.mileage.toLocaleString()} mi
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 24 }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              padding: "6px 14px", border: "1px solid var(--sf-border)", borderRadius: "var(--sf-radius)",
              background: "var(--sf-card)", color: "var(--sf-text)", fontSize: 13, cursor: page === 1 ? "default" : "pointer",
              opacity: page === 1 ? 0.4 : 1,
            }}
          >
            Prev
          </button>
          <span style={{ display: "flex", alignItems: "center", fontSize: 13, color: "var(--sf-text-muted)", padding: "0 8px" }}>
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{
              padding: "6px 14px", border: "1px solid var(--sf-border)", borderRadius: "var(--sf-radius)",
              background: "var(--sf-card)", color: "var(--sf-text)", fontSize: 13, cursor: page === totalPages ? "default" : "pointer",
              opacity: page === totalPages ? 0.4 : 1,
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
