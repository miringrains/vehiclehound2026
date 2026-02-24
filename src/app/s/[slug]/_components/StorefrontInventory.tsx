"use client";

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

type Vehicle = {
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

function getPrice(v: Vehicle): number | null {
  return v.inventory_type === "lease" ? v.lease_payment : (v.online_price || v.sale_price);
}

export function StorefrontInventory({ vehicles: rawVehicles, slug, showPricing, primaryColor }: Props) {
  const vehicles = rawVehicles as unknown as Vehicle[];
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [activeMakes, setActiveMakes] = useState<Set<string>>(new Set());
  const [activeTypes, setActiveTypes] = useState<Set<string>>(new Set());
  const [maxPriceFilter, setMaxPriceFilter] = useState<number | null>(null);

  const filterOptions = useMemo(() => {
    const makes = new Set<string>();
    const types = new Set<string>();
    let minP = Infinity;
    let maxP = 0;
    vehicles.forEach((v) => {
      if (v.make) makes.add(v.make);
      if (v.vehicle_type) types.add(v.vehicle_type);
      const p = getPrice(v);
      if (p) {
        minP = Math.min(minP, p);
        maxP = Math.max(maxP, p);
      }
    });
    return {
      makes: [...makes].sort(),
      types: [...types].sort(),
      minPrice: minP === Infinity ? 0 : Math.floor(minP),
      maxPrice: maxP === 0 ? 5000 : Math.ceil(maxP),
    };
  }, [vehicles]);

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

    if (activeMakes.size > 0) {
      list = list.filter((v) => activeMakes.has(v.make));
    }

    if (activeTypes.size > 0) {
      list = list.filter((v) => v.vehicle_type && activeTypes.has(v.vehicle_type));
    }

    if (maxPriceFilter !== null) {
      list = list.filter((v) => {
        const p = getPrice(v);
        if (!p) return true;
        return p >= filterOptions.minPrice && p <= maxPriceFilter;
      });
    }

    list.sort((a, b) => {
      switch (sort) {
        case "price_asc":
          return (getPrice(a) ?? Infinity) - (getPrice(b) ?? Infinity);
        case "price_desc":
          return (getPrice(b) ?? 0) - (getPrice(a) ?? 0);
        case "year_desc":
          return b.year - a.year;
        case "mileage_asc":
          return (a.mileage ?? Infinity) - (b.mileage ?? Infinity);
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
    return list;
  }, [vehicles, search, sort, activeMakes, activeTypes, maxPriceFilter, filterOptions.minPrice]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const safePage = Math.min(page, totalPages || 1);
  const paged = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const activeFilterCount =
    activeMakes.size + activeTypes.size + (maxPriceFilter !== null && maxPriceFilter < filterOptions.maxPrice ? 1 : 0);

  const toggleMake = useCallback((make: string) => {
    setActiveMakes((prev) => {
      const next = new Set(prev);
      if (next.has(make)) next.delete(make);
      else next.add(make);
      return next;
    });
    setPage(1);
  }, []);

  const toggleType = useCallback((type: string) => {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
    setPage(1);
  }, []);

  const clearAllFilters = useCallback(() => {
    setActiveMakes(new Set());
    setActiveTypes(new Set());
    setMaxPriceFilter(null);
    setSearch("");
    setPage(1);
  }, []);

  const hasPriceRange = showPricing && filterOptions.maxPrice > filterOptions.minPrice;
  const hasFilters = filterOptions.makes.length > 1 || filterOptions.types.length > 1 || hasPriceRange;

  const selectStyle: React.CSSProperties = {
    padding: "8px 12px",
    border: "1px solid var(--sf-border)",
    borderRadius: "var(--sf-radius)",
    background: "var(--sf-card)",
    color: "var(--sf-text)",
    fontSize: 13,
  };

  const checkboxStyle: React.CSSProperties = {
    width: 15,
    height: 15,
    accentColor: primaryColor,
    cursor: "pointer",
    flexShrink: 0,
  };

  /* ─── Filter sidebar content (shared between desktop sidebar and mobile drawer) ─── */
  const filterContent = (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 700 }}>Filters</span>
        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "var(--sf-text-muted)",
              background: "none",
              border: "none",
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            Clear All
          </button>
        )}
      </div>

      {/* Price range */}
      {hasPriceRange && (
        <div style={{ padding: "14px 0", borderBottom: "1px solid var(--sf-border)" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--sf-text)", marginBottom: 10 }}>Price Range</div>
          <input
            type="range"
            min={filterOptions.minPrice}
            max={filterOptions.maxPrice}
            value={maxPriceFilter ?? filterOptions.maxPrice}
            onChange={(e) => {
              setMaxPriceFilter(Number(e.target.value));
              setPage(1);
            }}
            style={{ width: "100%", accentColor: primaryColor, cursor: "pointer" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--sf-text-muted)", marginTop: 6 }}>
            <span>{fmtPrice(filterOptions.minPrice)}</span>
            <span>{fmtPrice(maxPriceFilter ?? filterOptions.maxPrice)}</span>
          </div>
        </div>
      )}

      {/* Make */}
      {filterOptions.makes.length > 1 && (
        <div style={{ padding: "14px 0", borderBottom: "1px solid var(--sf-border)" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--sf-text)", marginBottom: 10 }}>Make</div>
          {filterOptions.makes.map((m) => (
            <label
              key={m}
              style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, cursor: "pointer", fontSize: 13 }}
            >
              <input
                type="checkbox"
                checked={activeMakes.has(m)}
                onChange={() => toggleMake(m)}
                style={checkboxStyle}
              />
              {m}
            </label>
          ))}
        </div>
      )}

      {/* Vehicle Type */}
      {filterOptions.types.length > 1 && (
        <div style={{ padding: "14px 0" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--sf-text)", marginBottom: 10 }}>Vehicle Type</div>
          {filterOptions.types.map((t) => (
            <label
              key={t}
              style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, cursor: "pointer", fontSize: 13 }}
            >
              <input
                type="checkbox"
                checked={activeTypes.has(t)}
                onChange={() => toggleType(t)}
                style={checkboxStyle}
              />
              {t}
            </label>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div>
      {/* Search bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          border: "1px solid var(--sf-border)",
          borderRadius: "var(--sf-radius)",
          padding: "10px 14px",
          background: "var(--sf-card)",
          marginBottom: 20,
          gap: 10,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--sf-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search by make, model, or keyword..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{
            border: "none",
            outline: "none",
            flex: 1,
            fontSize: 14,
            background: "transparent",
            color: "var(--sf-text)",
          }}
        />
        {search && (
          <button
            onClick={() => { setSearch(""); setPage(1); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--sf-text-muted)", padding: 2 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Body: sidebar + main */}
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        {/* Desktop sidebar */}
        {hasFilters && (
          <div
            className="sf-sidebar"
            style={{
              width: 240,
              flexShrink: 0,
              position: "sticky",
              top: 80,
              background: "var(--sf-card)",
              border: "1px solid var(--sf-border)",
              borderRadius: "var(--sf-radius)",
            }}
          >
            {filterContent}
          </div>
        )}

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Top bar: count + sort */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
            <span style={{ fontSize: 13, color: "var(--sf-text-muted)", fontWeight: 500 }}>
              {filtered.length} vehicle{filtered.length !== 1 ? "s" : ""} found
            </span>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value as SortKey); setPage(1); }}
              style={selectStyle}
            >
              <option value="newest">Newest</option>
              {showPricing && <option value="price_asc">Price: Low to High</option>}
              {showPricing && <option value="price_desc">Price: High to Low</option>}
              <option value="year_desc">Year: Newest</option>
              <option value="mileage_asc">Mileage: Low</option>
            </select>
          </div>

          {/* Grid */}
          {paged.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
              <p style={{ fontSize: 15, color: "var(--sf-text-muted)" }}>No vehicles match your filters</p>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  style={{
                    marginTop: 12,
                    padding: "8px 16px",
                    border: "1px solid var(--sf-border)",
                    borderRadius: "var(--sf-radius)",
                    background: "var(--sf-card)",
                    color: "var(--sf-text)",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {paged.map((v) => {
                const isLease = v.inventory_type === "lease";
                const price = getPrice(v);
                const priceLabel = price ? (isLease ? `${fmtPrice(price)}/mo` : fmtPrice(price)) : "";

                return (
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
                        <Image src={v.preview_image} alt={`${v.year} ${v.make} ${v.model}`} fill style={{ objectFit: "contain", padding: 4 }} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                      ) : (
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--sf-text-muted)" strokeWidth="1.5" opacity="0.4">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="M21 15l-5-5L5 21" />
                          </svg>
                        </div>
                      )}
                      {isLease && (
                        <span style={{
                          position: "absolute", top: 8, left: 8, background: primaryColor, color: "#fff",
                          fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 6,
                        }}>
                          Lease
                        </span>
                      )}
                      {showPricing && priceLabel && (
                        <span style={{
                          position: "absolute", top: 8, right: 8, background: "var(--sf-card)", color: "var(--sf-text)",
                          fontSize: 13, fontWeight: 700, padding: "4px 10px", borderRadius: 6,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}>
                          {priceLabel}
                        </span>
                      )}
                    </div>
                    <div style={{ padding: "12px 14px" }}>
                      <p style={{ fontWeight: 600, fontSize: 14, margin: 0, letterSpacing: "-0.01em" }}>
                        {v.year} {v.make} {v.model}
                      </p>
                      {v.trim && <p style={{ fontSize: 12, color: "var(--sf-text-muted)", margin: "2px 0 0" }}>{v.trim}</p>}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", fontSize: 11, color: "var(--sf-text-muted)", marginTop: 8 }}>
                        {v.mileage != null && <span>{v.mileage.toLocaleString()} mi</span>}
                        {v.exterior_color && <span>{v.exterior_color}</span>}
                        {isLease && v.lease_term && <span>{v.lease_term} mo term</span>}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 24 }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                style={{
                  padding: "8px 18px", border: "1px solid var(--sf-border)", borderRadius: "var(--sf-radius)",
                  background: "var(--sf-card)", color: "var(--sf-text)", fontSize: 12, fontWeight: 500,
                  cursor: safePage === 1 ? "default" : "pointer", opacity: safePage === 1 ? 0.35 : 1,
                }}
              >
                ← Previous
              </button>
              <span style={{ display: "flex", alignItems: "center", fontSize: 12, color: "var(--sf-text-muted)", padding: "0 8px" }}>
                Page {safePage} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                style={{
                  padding: "8px 18px", border: "1px solid var(--sf-border)", borderRadius: "var(--sf-radius)",
                  background: "var(--sf-card)", color: "var(--sf-text)", fontSize: 12, fontWeight: 500,
                  cursor: safePage === totalPages ? "default" : "pointer", opacity: safePage === totalPages ? 0.35 : 1,
                }}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter overlay */}
      {filtersOpen && (
        <div
          onClick={() => setFiltersOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 998,
          }}
        />
      )}

      {/* Mobile filter drawer */}
      {filtersOpen && hasFilters && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 999,
            maxHeight: "70vh",
            overflowY: "auto",
            background: "var(--sf-card)",
            borderRadius: "var(--sf-radius) var(--sf-radius) 0 0",
            boxShadow: "0 -4px 30px rgba(0,0,0,0.15)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px 0" }}>
            <span style={{ fontSize: 16, fontWeight: 700 }}>Filters</span>
            <button
              onClick={() => setFiltersOpen(false)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--sf-text)", padding: 4 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          {filterContent}
          <div style={{ padding: "0 20px 20px" }}>
            <button
              onClick={() => setFiltersOpen(false)}
              style={{
                width: "100%",
                padding: "12px",
                border: "none",
                borderRadius: "var(--sf-radius)",
                background: primaryColor,
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Show {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </button>
          </div>
        </div>
      )}

      {/* Mobile filter FAB */}
      {hasFilters && (
        <button
          className="sf-filter-fab"
          onClick={() => setFiltersOpen(true)}
          style={{
            display: "none",
            position: "fixed",
            bottom: 20,
            right: 20,
            zIndex: 997,
            padding: "12px 20px",
            border: "none",
            borderRadius: 999,
            fontSize: 14,
            fontWeight: 600,
            color: "#fff",
            background: primaryColor,
            cursor: "pointer",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            alignItems: "center",
            gap: 8,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="7" y1="12" x2="17" y2="12" />
            <line x1="10" y1="18" x2="14" y2="18" />
          </svg>
          Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
        </button>
      )}

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .sf-sidebar { display: none !important; }
          .sf-filter-fab { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
