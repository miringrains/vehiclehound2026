/**
 * VehicleHound Inventory Widget v2
 * <div id="vh-inventory" data-api-key="KEY" data-detail-url="/vehicle-details"></div>
 * <script src="https://DOMAIN/widgets/inventory-widget.js"></script>
 */
(function () {
  "use strict";

  const SCRIPT = document.currentScript;
  const API_BASE = SCRIPT?.getAttribute("data-api-base") || new URL(SCRIPT?.src || "").origin;
  const container = document.getElementById("vh-inventory");
  if (!container) return;
  const API_KEY = container.getAttribute("data-api-key");
  if (!API_KEY) return;
  const DETAIL_URL = container.getAttribute("data-detail-url") || "";

  let state = {
    vehicles: [], all: [], total: 0, page: 1, totalPages: 1,
    search: "", sort: "newest", loading: true, config: {},
    filters: { makes: [], types: [], minPrice: 0, maxPrice: 5000, priceRange: [0, 5000] },
    activeMakes: new Set(), activeTypes: new Set(),
  };

  function $(tag, attrs, ...ch) {
    const el = document.createElement(tag);
    if (attrs) Object.entries(attrs).forEach(([k, v]) => {
      if (k === "style" && typeof v === "object") Object.assign(el.style, v);
      else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (v !== null && v !== undefined) el.setAttribute(k, String(v));
    });
    ch.flat().forEach(c => { if (c != null) el.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return el;
  }

  const fmt = v => v ? "$" + Number(v).toLocaleString("en-US", { maximumFractionDigits: 0 }) : "";
  const fmtMi = v => v ? Number(v).toLocaleString("en-US") : "";

  function injectStyles() {
    if (document.getElementById("vh-inv-css")) return;
    const s = document.createElement("style");
    s.id = "vh-inv-css";
    s.textContent = `
.vh{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:#1a1d1e;-webkit-font-smoothing:antialiased;line-height:1.5}
.vh *{box-sizing:border-box;margin:0;padding:0}
.vh-search{display:flex;align-items:center;border:1px solid #e5e5e5;border-radius:10px;padding:12px 16px;background:#fff;margin-bottom:20px;gap:10px;transition:border-color .15s}
.vh-search:focus-within{border-color:#999}
.vh-search svg{flex-shrink:0;color:#999}
.vh-search input{border:none;outline:none;flex:1;font-size:14px;background:transparent;color:#1a1d1e}
.vh-search input::placeholder{color:#aaa}
.vh-body{display:flex;gap:24px;align-items:flex-start}
.vh-sidebar{width:240px;flex-shrink:0;position:sticky;top:16px}
.vh-sidebar-inner{background:#fff;border:1px solid #eee;border-radius:12px;padding:20px}
.vh-sidebar h3{font-size:14px;font-weight:700;margin-bottom:4px;display:flex;align-items:center;justify-content:space-between}
.vh-sidebar .vh-clear{font-size:11px;font-weight:500;color:#999;cursor:pointer;background:none;border:none;text-decoration:underline}
.vh-sidebar .vh-clear:hover{color:#333}
.vh-filter-section{padding:14px 0;border-bottom:1px solid #f0f0f0}
.vh-filter-section:last-child{border-bottom:none;padding-bottom:0}
.vh-filter-title{font-size:12px;font-weight:600;color:#555;margin-bottom:10px}
.vh-check{display:flex;align-items:center;gap:8px;margin-bottom:6px;cursor:pointer;font-size:13px;color:#333}
.vh-check input{accent-color:#1a1d1e;width:15px;height:15px;cursor:pointer}
.vh-range-row{display:flex;justify-content:space-between;font-size:11px;color:#999;margin-top:6px}
.vh-range{width:100%;accent-color:#1a1d1e;cursor:pointer}
.vh-main{flex:1;min-width:0}
.vh-topbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px}
.vh-count{font-size:13px;color:#666;font-weight:500}
.vh-sort{border:1px solid #e5e5e5;border-radius:8px;padding:8px 12px;font-size:13px;background:#fff;color:#333;cursor:pointer;outline:none;appearance:auto}
.vh-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px}
.vh-card{background:#fff;border:1px solid #eee;border-radius:12px;overflow:hidden;transition:box-shadow .2s,transform .15s;cursor:pointer}
.vh-card:hover{box-shadow:0 8px 30px rgba(0,0,0,.08);transform:translateY(-2px)}
.vh-card-img{position:relative;width:100%;aspect-ratio:4/3;background:#f7f7f7;overflow:hidden}
.vh-card-img img{width:100%;height:100%;object-fit:contain}
.vh-badge{position:absolute;top:10px;left:10px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;padding:4px 10px;border-radius:6px;color:#fff}
.vh-badge--avail{background:#22c55e}
.vh-badge--sold{background:#888}
.vh-price-tag{position:absolute;top:10px;right:10px;font-size:14px;font-weight:800;color:#1a1d1e;background:#fff;padding:5px 12px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.1)}
.vh-card-body{padding:14px 16px 16px}
.vh-card-title{font-size:15px;font-weight:700;color:#1a1d1e;margin-bottom:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.vh-card-meta{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:11px;color:#888;margin-bottom:12px}
.vh-card-meta span{display:flex;align-items:center;gap:3px}
.vh-card-meta strong{color:#555;font-weight:600}
.vh-card-btn{display:block;width:100%;padding:10px;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;transition:background .15s;text-align:center;text-decoration:none}
.vh-pager{display:flex;justify-content:center;align-items:center;gap:8px;margin-top:24px}
.vh-pager button{border:1px solid #e5e5e5;border-radius:8px;padding:8px 18px;font-size:12px;font-weight:500;cursor:pointer;background:#fff;color:#333;transition:background .15s}
.vh-pager button:hover:not(:disabled){background:#f5f5f5}
.vh-pager button:disabled{opacity:.35;cursor:default}
.vh-pager span{font-size:12px;color:#888}
.vh-loading{text-align:center;padding:60px 20px;font-size:14px;color:#999}
.vh-empty{text-align:center;padding:60px 20px}
.vh-empty p{color:#999;font-size:14px}
@media(max-width:768px){.vh-body{flex-direction:column}.vh-sidebar{width:100%;position:static}.vh-grid{grid-template-columns:1fr}}
`;
    document.head.appendChild(s);
  }

  let searchTimer = null;

  async function fetchAll() {
    state.loading = true;
    render();
    try {
      const params = new URLSearchParams({ key: API_KEY, page: "1", limit: "200", sort: state.sort });
      const res = await fetch(API_BASE + "/api/widget/inventory?" + params);
      const data = await res.json();
      state.all = data.vehicles || [];
      state.config = data.config || {};
      buildFilterOptions();
      applyFilters();
    } catch (e) {
      console.error("[VH]", e);
      state.all = [];
      state.vehicles = [];
      state.total = 0;
    }
    state.loading = false;
    render();
  }

  function buildFilterOptions() {
    const makes = new Set(), types = new Set();
    let minP = Infinity, maxP = 0;
    state.all.forEach(v => {
      if (v.make) makes.add(v.make);
      if (v.vehicle_type) types.add(v.vehicle_type);
      const p = v.inventory_type === "lease" ? v.lease_payment : (v.online_price || v.sale_price);
      if (p) { minP = Math.min(minP, p); maxP = Math.max(maxP, p); }
    });
    state.filters.makes = [...makes].sort();
    state.filters.types = [...types].sort();
    state.filters.minPrice = minP === Infinity ? 0 : Math.floor(minP);
    state.filters.maxPrice = maxP === 0 ? 5000 : Math.ceil(maxP);
    state.filters.priceRange = [state.filters.minPrice, state.filters.maxPrice];
  }

  function applyFilters() {
    let filtered = state.all;

    if (state.search) {
      const q = state.search.toLowerCase();
      filtered = filtered.filter(v =>
        [v.year, v.make, v.model, v.trim, v.stock_number].filter(Boolean).join(" ").toLowerCase().includes(q)
      );
    }

    if (state.activeMakes.size > 0) {
      filtered = filtered.filter(v => v.make && state.activeMakes.has(v.make));
    }

    if (state.activeTypes.size > 0) {
      filtered = filtered.filter(v => v.vehicle_type && state.activeTypes.has(v.vehicle_type));
    }

    const [lo, hi] = state.filters.priceRange;
    filtered = filtered.filter(v => {
      const p = v.inventory_type === "lease" ? v.lease_payment : (v.online_price || v.sale_price);
      if (!p) return true;
      return p >= lo && p <= hi;
    });

    if (state.sort === "price_asc") filtered.sort((a, b) => (getPrice(a) || 0) - (getPrice(b) || 0));
    else if (state.sort === "price_desc") filtered.sort((a, b) => (getPrice(b) || 0) - (getPrice(a) || 0));
    else if (state.sort === "year_desc") filtered.sort((a, b) => (b.year || 0) - (a.year || 0));
    else if (state.sort === "mileage_asc") filtered.sort((a, b) => (a.mileage || 0) - (b.mileage || 0));

    state.total = filtered.length;
    const perPage = 12;
    state.totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    state.page = Math.min(state.page, state.totalPages);
    const start = (state.page - 1) * perPage;
    state.vehicles = filtered.slice(start, start + perPage);
  }

  function getPrice(v) {
    return v.inventory_type === "lease" ? v.lease_payment : (v.online_price || v.sale_price);
  }

  function clearFilters() {
    state.activeMakes.clear();
    state.activeTypes.clear();
    state.filters.priceRange = [state.filters.minPrice, state.filters.maxPrice];
    state.search = "";
    state.page = 1;
    applyFilters();
    render();
  }

  function goToVehicle(id) {
    if (!DETAIL_URL) return;
    window.location.href = DETAIL_URL + (DETAIL_URL.includes("?") ? "&" : "?") + "id=" + id;
  }

  function render() {
    container.innerHTML = "";
    const pc = state.config.primaryColor || "#1a1d1e";
    const hc = state.config.hoverColor || "#374151";
    const showPrice = state.config.showPricing !== false;

    const wrap = $("div", { class: "vh" });

    // Search
    const searchBox = $("div", { class: "vh-search" },
      $("svg", null), // placeholder, we'll set innerHTML
      $("input", {
        type: "text", placeholder: "Search by make, model, or keyword...",
        value: state.search,
        onInput: e => {
          state.search = e.target.value;
          clearTimeout(searchTimer);
          searchTimer = setTimeout(() => { state.page = 1; applyFilters(); render(); }, 200);
        },
      })
    );
    searchBox.querySelector("svg")?.remove();
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", "18"); svg.setAttribute("height", "18");
    svg.setAttribute("viewBox", "0 0 24 24"); svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor"); svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round"); svg.setAttribute("stroke-linejoin", "round");
    const circle = document.createElementNS(svgNS, "circle");
    circle.setAttribute("cx", "11"); circle.setAttribute("cy", "11"); circle.setAttribute("r", "8");
    const line = document.createElementNS(svgNS, "line");
    line.setAttribute("x1", "21"); line.setAttribute("y1", "21"); line.setAttribute("x2", "16.65"); line.setAttribute("y2", "16.65");
    svg.appendChild(circle); svg.appendChild(line);
    svg.style.flexShrink = "0"; svg.style.color = "#999";
    searchBox.prepend(svg);
    wrap.appendChild(searchBox);

    const body = $("div", { class: "vh-body" });

    // Sidebar
    const sidebar = $("div", { class: "vh-sidebar" },
      $("div", { class: "vh-sidebar-inner" },
        $("h3", null,
          "Filters",
          $("button", { class: "vh-clear", onClick: clearFilters }, "Clear All")
        ),
        // Price range
        priceSection(showPrice),
        // Makes
        makeSection(),
        // Vehicle types
        typeSection(),
      )
    );
    body.appendChild(sidebar);

    // Main
    const main = $("div", { class: "vh-main" });

    // Topbar
    const topbar = $("div", { class: "vh-topbar" },
      $("span", { class: "vh-count" }, state.loading ? "Loading..." : state.total + " vehicle" + (state.total !== 1 ? "s" : "") + " found"),
      $("select", { class: "vh-sort", onChange: e => { state.sort = e.target.value; state.page = 1; applyFilters(); render(); } },
        ...[["newest", "Newest"], ["price_asc", "Price: Low to High"], ["price_desc", "Price: High to Low"], ["year_desc", "Year: Newest"], ["mileage_asc", "Mileage: Lowest"]].map(
          ([v, l]) => { const o = $("option", { value: v }, l); if (v === state.sort) o.selected = true; return o; }
        )
      )
    );
    main.appendChild(topbar);

    if (state.loading) {
      main.appendChild($("div", { class: "vh-loading" }, "Loading inventory..."));
    } else if (state.vehicles.length === 0) {
      main.appendChild($("div", { class: "vh-empty" }, $("p", null, "No vehicles match your search.")));
    } else {
      const grid = $("div", { class: "vh-grid" });
      state.vehicles.forEach(v => {
        const title = [v.year, v.make, v.model].filter(Boolean).join(" ");
        const isLease = v.inventory_type === "lease";
        const price = isLease ? v.lease_payment : (v.online_price || v.sale_price);
        const priceLabel = price ? (isLease ? fmt(price) + "/mo" : fmt(price)) : "";

        const meta = [];
        if (isLease && v.lease_term) meta.push(["TERM", v.lease_term + " mo"]);
        if (v.mileage) meta.push(["", fmtMi(v.mileage) + " mi"]);
        if (isLease && v.lease_annual_mileage) meta.push(["", fmtMi(v.lease_annual_mileage) + " mi/yr"]);
        if (v.exterior_color) meta.push(["", v.exterior_color]);

        const card = $("div", { class: "vh-card", onClick: () => goToVehicle(v.id) },
          $("div", { class: "vh-card-img" },
            v.preview_image ? $("img", { src: v.preview_image, alt: title, loading: "lazy" }) : null,
            $("span", { class: "vh-badge vh-badge--avail" }, "Available"),
            showPrice && priceLabel ? $("span", { class: "vh-price-tag" }, priceLabel) : null,
          ),
          $("div", { class: "vh-card-body" },
            $("div", { class: "vh-card-title" }, title || "Untitled"),
            meta.length > 0 ? $("div", { class: "vh-card-meta" },
              ...meta.map(([label, val]) =>
                $("span", null, label ? [$("strong", null, label + ": "), val].flat() : val)
              )
            ) : null,
            $("a", {
              class: "vh-card-btn",
              style: { background: pc, color: "#fff" },
              onMouseenter: e => { e.currentTarget.style.background = hc; },
              onMouseleave: e => { e.currentTarget.style.background = pc; },
              onClick: e => { e.stopPropagation(); goToVehicle(v.id); },
            }, "View Details"),
          )
        );
        grid.appendChild(card);
      });
      main.appendChild(grid);

      if (state.totalPages > 1) {
        main.appendChild($("div", { class: "vh-pager" },
          $("button", { disabled: state.page <= 1 ? true : null, onClick: () => { state.page--; applyFilters(); render(); } }, "← Previous"),
          $("span", null, "Page " + state.page + " of " + state.totalPages),
          $("button", { disabled: state.page >= state.totalPages ? true : null, onClick: () => { state.page++; applyFilters(); render(); } }, "Next →"),
        ));
      }
    }

    body.appendChild(main);
    wrap.appendChild(body);
    container.appendChild(wrap);
  }

  function priceSection(showPrice) {
    if (!showPrice || state.filters.maxPrice <= state.filters.minPrice) return $("div");
    const [lo, hi] = state.filters.priceRange;
    const section = $("div", { class: "vh-filter-section" },
      $("div", { class: "vh-filter-title" }, "Monthly Payment Range"),
      $("input", {
        type: "range", class: "vh-range",
        min: String(state.filters.minPrice), max: String(state.filters.maxPrice),
        value: String(hi),
        onInput: e => {
          state.filters.priceRange = [state.filters.minPrice, Number(e.target.value)];
          state.page = 1; applyFilters(); render();
        },
      }),
      $("div", { class: "vh-range-row" },
        $("span", null, fmt(lo) + "/mo"),
        $("span", null, fmt(hi) + "/mo"),
      ),
    );
    return section;
  }

  function makeSection() {
    if (state.filters.makes.length === 0) return $("div");
    return $("div", { class: "vh-filter-section" },
      $("div", { class: "vh-filter-title" }, "Make"),
      ...state.filters.makes.map(m => {
        const id = "vh-mk-" + m.replace(/\s/g, "");
        return $("label", { class: "vh-check", for: id },
          $("input", {
            type: "checkbox", id, checked: state.activeMakes.has(m) ? true : null,
            onChange: e => {
              if (e.target.checked) state.activeMakes.add(m); else state.activeMakes.delete(m);
              state.page = 1; applyFilters(); render();
            },
          }),
          m,
        );
      })
    );
  }

  function typeSection() {
    if (state.filters.types.length === 0) return $("div");
    return $("div", { class: "vh-filter-section" },
      $("div", { class: "vh-filter-title" }, "Vehicle Type"),
      ...state.filters.types.map(t => {
        const id = "vh-tp-" + t.replace(/\s/g, "");
        return $("label", { class: "vh-check", for: id },
          $("input", {
            type: "checkbox", id, checked: state.activeTypes.has(t) ? true : null,
            onChange: e => {
              if (e.target.checked) state.activeTypes.add(t); else state.activeTypes.delete(t);
              state.page = 1; applyFilters(); render();
            },
          }),
          t,
        );
      })
    );
  }

  injectStyles();
  fetchAll();
})();
