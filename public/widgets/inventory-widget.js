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

  const RADIUS_MAP = { sharp: 4, rounded: 12, soft: 20 };

  function getRadius(config) {
    const preset = config.borderRadius || "rounded";
    const base = RADIUS_MAP[preset] || 12;
    return { card: base, btn: Math.round(base * 0.67), search: Math.round(base * 0.83), badge: Math.round(base * 0.5) };
  }

  function hexToRgb(hex) {
    const h = hex.replace("#", "");
    return [parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16)];
  }

  function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map(c => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, "0")).join("");
  }

  function mixHex(hex, target, factor) {
    const [r1, g1, b1] = hexToRgb(hex);
    const [r2, g2, b2] = hexToRgb(target);
    return rgbToHex(r1 + (r2 - r1) * factor, g1 + (g2 - g1) * factor, b1 + (b2 - b1) * factor);
  }

  function luminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  function deriveColors(bg) {
    if (!bg || typeof bg !== "string") bg = "#ffffff";
    const [r, g, b] = hexToRgb(bg);
    const light = luminance(r, g, b) > 0.4;
    return {
      bg: bg,
      card: light ? mixHex(bg, "#ffffff", 0.6) : mixHex(bg, "#ffffff", 0.06),
      border: light ? mixHex(bg, "#000000", 0.1) : mixHex(bg, "#ffffff", 0.12),
      text: light ? "#1a1d1e" : "#f5f5f5",
      textMuted: light ? "#888888" : "#999999",
      textStrong: light ? "#555555" : "#cccccc",
      imgBg: light ? mixHex(bg, "#000000", 0.04) : mixHex(bg, "#ffffff", 0.04),
      priceBg: light ? "#ffffff" : mixHex(bg, "#ffffff", 0.12),
      hoverBg: light ? mixHex(bg, "#000000", 0.02) : mixHex(bg, "#ffffff", 0.03),
    };
  }

  // Analytics tracker
  const _sid = Array.from(crypto.getRandomValues(new Uint8Array(6))).map(b => b.toString(16).padStart(2, "0")).join("");
  const _evtBuf = [];
  function track(event, payload) {
    if (typeof navigator !== "undefined" && navigator.doNotTrack === "1") return;
    _evtBuf.push({ event, payload: payload || {}, session_id: _sid, vehicle_id: payload?.vehicle_id || null });
  }
  function _flushEvents() {
    if (_evtBuf.length === 0) return;
    const batch = _evtBuf.splice(0);
    const body = JSON.stringify({ events: batch });
    const url = API_BASE + "/api/widget/events";
    fetch(url, { method: "POST", headers: { "Content-Type": "application/json", "X-API-Key": API_KEY }, body, keepalive: true })
      .then(r => { if (!r.ok) console.warn("[VH] Event tracking failed:", r.status); })
      .catch(e => console.warn("[VH] Event tracking error:", e.message));
  }
  setInterval(_flushEvents, 5000);
  window.addEventListener("beforeunload", _flushEvents);

  let filtersOpen = false;

  function injectStyles(r, cl) {
    const existing = document.getElementById("vh-inv-css");
    if (existing) existing.remove();
    const s = document.createElement("style");
    s.id = "vh-inv-css";
    if (!cl) cl = deriveColors("#ffffff");
    s.textContent = `
.vh{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif !important;color:${cl.text} !important;-webkit-font-smoothing:antialiased;font-size:16px !important;font-weight:400 !important;font-style:normal !important;letter-spacing:normal !important;text-transform:none !important;word-spacing:normal !important;line-height:1.5 !important;background:${cl.bg}}
.vh *,.vh *::before,.vh *::after{box-sizing:border-box;margin:0;padding:0;font-family:inherit !important;font-size:inherit !important;font-weight:inherit !important;font-style:inherit !important;letter-spacing:inherit !important;text-transform:inherit !important;word-spacing:inherit !important;line-height:inherit !important;color:inherit !important;text-decoration:inherit !important}
.vh-search{display:flex;align-items:center;border:1px solid ${cl.border};border-radius:${r.search}px;padding:12px 16px;background:${cl.card};margin-bottom:20px;gap:10px;transition:border-color .15s}
.vh-search:focus-within{border-color:${cl.textMuted}}
.vh-search svg{flex-shrink:0;color:${cl.textMuted} !important}
.vh-search input{border:none;outline:none;flex:1;font-size:14px !important;background:transparent;color:${cl.text} !important}
.vh-search input::placeholder{color:${cl.textMuted} !important}
.vh-body{display:flex;gap:24px;align-items:flex-start}
.vh-sidebar{width:240px;flex-shrink:0;position:sticky;top:16px}
.vh-sidebar-inner{background:${cl.card};border:1px solid ${cl.border};border-radius:${r.card}px;padding:20px}
.vh-sidebar h3{font-size:14px !important;font-weight:700 !important;margin-bottom:4px;display:flex;align-items:center;justify-content:space-between}
.vh-sidebar .vh-clear{font-size:11px !important;font-weight:500 !important;color:${cl.textMuted} !important;cursor:pointer;background:none;border:none;text-decoration:underline !important}
.vh-sidebar .vh-clear:hover{color:${cl.text} !important}
.vh-filter-section{padding:14px 0;border-bottom:1px solid ${cl.border}}
.vh-filter-section:last-child{border-bottom:none;padding-bottom:0}
.vh-filter-title{font-size:12px !important;font-weight:600 !important;color:${cl.textStrong} !important;margin-bottom:10px}
.vh-check{display:flex;align-items:center;gap:8px;margin-bottom:6px;cursor:pointer;font-size:13px !important;color:${cl.text} !important}
.vh-check input{accent-color:${cl.text};width:15px;height:15px;cursor:pointer}
.vh-range-row{display:flex;justify-content:space-between;font-size:11px !important;color:${cl.textMuted} !important;margin-top:6px}
.vh-range{width:100%;accent-color:${cl.text};cursor:pointer}
.vh-main{flex:1;min-width:0}
.vh-topbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px}
.vh-count{font-size:13px !important;color:${cl.textMuted} !important;font-weight:500 !important}
.vh-sort{border:1px solid ${cl.border};border-radius:${r.btn}px;padding:8px 12px;font-size:13px !important;background:${cl.card};color:${cl.text} !important;cursor:pointer;outline:none;appearance:auto}
.vh-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px}
.vh-card{background:${cl.card};border:1px solid ${cl.border};border-radius:${r.card}px;overflow:hidden;transition:box-shadow .2s,transform .15s;cursor:pointer}
.vh-card:hover{box-shadow:0 8px 30px rgba(0,0,0,.08);transform:translateY(-2px)}
.vh-card-img{position:relative;width:100%;aspect-ratio:4/3;background:${cl.imgBg};overflow:hidden}
.vh-card-img img{width:100%;height:100%;object-fit:contain}
.vh-badge{position:absolute;top:10px;left:10px;font-size:10px !important;font-weight:700 !important;text-transform:uppercase !important;letter-spacing:.6px !important;padding:4px 10px;border-radius:${r.badge}px;color:#fff !important}
.vh-badge--avail{background:#22c55e}
.vh-badge--sold{background:#888}
.vh-price-tag{position:absolute;top:10px;right:10px;font-size:14px !important;font-weight:800 !important;color:${cl.text} !important;background:${cl.priceBg};padding:5px 12px;border-radius:${r.btn}px;box-shadow:0 2px 8px rgba(0,0,0,.1)}
.vh-card-body{padding:14px 16px 16px}
.vh-card-title{font-size:15px !important;font-weight:700 !important;color:${cl.text} !important;margin-bottom:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.vh-card-meta{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:11px !important;color:${cl.textMuted} !important;margin-bottom:12px}
.vh-card-meta span{display:flex;align-items:center;gap:3px}
.vh-card-meta strong{color:${cl.textStrong} !important;font-weight:600 !important}
.vh-card-btn{display:block;width:100%;padding:10px;border:none;border-radius:${r.btn}px;font-size:13px !important;font-weight:600 !important;cursor:pointer;transition:background .15s;text-align:center;text-decoration:none !important}
.vh-pager{display:flex;justify-content:center;align-items:center;gap:8px;margin-top:24px}
.vh-pager button{border:1px solid ${cl.border};border-radius:${r.btn}px;padding:8px 18px;font-size:12px !important;font-weight:500 !important;cursor:pointer;background:${cl.card};color:${cl.text} !important;transition:background .15s}
.vh-pager button:hover:not(:disabled){background:${cl.hoverBg}}
.vh-pager button:disabled{opacity:.35;cursor:default}
.vh-pager span{font-size:12px !important;color:${cl.textMuted} !important}
.vh-loading{text-align:center;padding:60px 20px;font-size:14px !important;color:${cl.textMuted} !important}
.vh-empty{text-align:center;padding:60px 20px}
.vh-empty p{color:${cl.textMuted} !important;font-size:14px !important}
.vh-filter-fab{display:none;position:fixed;bottom:20px;right:20px;z-index:9999;padding:12px 20px;border:none;border-radius:${r.btn + 16}px;font-size:14px !important;font-weight:600 !important;color:#fff !important;cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,.2);transition:transform .15s,box-shadow .15s;gap:8px;align-items:center}
.vh-filter-fab:active{transform:scale(.96)}
.vh-filter-fab svg{width:18px;height:18px}
.vh-sidebar-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:9998}
@media(max-width:768px){
  .vh-body{flex-direction:column}
  .vh-sidebar{display:none;position:fixed;bottom:0;left:0;right:0;z-index:9999;width:100%;max-height:70vh;overflow-y:auto;border-radius:${r.card}px ${r.card}px 0 0;box-shadow:0 -4px 30px rgba(0,0,0,.15)}
  .vh-sidebar.vh-sidebar--open{display:block}
  .vh-sidebar-overlay.vh-sidebar--open{display:block}
  .vh-filter-fab{display:flex}
  .vh-grid{grid-template-columns:1fr}
}
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
      track("page_view", { referrer: document.referrer });
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
    track("vehicle_click", { vehicle_id: id });
    _flushEvents();
    if (!DETAIL_URL) return;
    window.location.href = DETAIL_URL + (DETAIL_URL.includes("?") ? "&" : "?") + "id=" + id;
  }

  function toggleFilters(wrap) {
    filtersOpen = !filtersOpen;
    const sidebar = wrap.querySelector(".vh-sidebar");
    const overlay = wrap.querySelector(".vh-sidebar-overlay");
    if (sidebar) sidebar.classList.toggle("vh-sidebar--open", filtersOpen);
    if (overlay) overlay.classList.toggle("vh-sidebar--open", filtersOpen);
  }

  function render() {
    container.innerHTML = "";
    const pc = state.config.primaryColor || "#1a1d1e";
    const hc = state.config.hoverColor || "#374151";
    const showPrice = state.config.showPricing !== false;
    const cl = deriveColors(state.config.backgroundColor);
    injectStyles(getRadius(state.config), cl);

    const wrap = $("div", { class: "vh" });

    // Search
    const searchBox = $("div", { class: "vh-search" },
      $("svg", null),
      $("input", {
        type: "text", placeholder: "Search by make, model, or keyword...",
        value: state.search,
        onInput: e => {
          state.search = e.target.value;
          clearTimeout(searchTimer);
          searchTimer = setTimeout(() => { state.page = 1; applyFilters(); render(); if (state.search) track("search", { query: state.search }); }, 200);
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
    svg.style.flexShrink = "0"; svg.style.color = cl.textMuted;
    searchBox.prepend(svg);
    wrap.appendChild(searchBox);

    const body = $("div", { class: "vh-body" });

    // Overlay for mobile filter drawer
    const overlay = $("div", { class: "vh-sidebar-overlay" + (filtersOpen ? " vh-sidebar--open" : ""), onClick: () => toggleFilters(wrap) });
    body.appendChild(overlay);

    // Sidebar
    const sidebar = $("div", { class: "vh-sidebar" + (filtersOpen ? " vh-sidebar--open" : "") },
      $("div", { class: "vh-sidebar-inner" },
        $("h3", null,
          "Filters",
          $("button", { class: "vh-clear", onClick: clearFilters }, "Clear All")
        ),
        priceSection(showPrice),
        makeSection(),
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

    // Mobile filter FAB
    const fabSvg = document.createElementNS(svgNS, "svg");
    fabSvg.setAttribute("viewBox", "0 0 24 24"); fabSvg.setAttribute("fill", "none");
    fabSvg.setAttribute("stroke", "currentColor"); fabSvg.setAttribute("stroke-width", "2");
    fabSvg.setAttribute("stroke-linecap", "round"); fabSvg.setAttribute("stroke-linejoin", "round");
    const fLine1 = document.createElementNS(svgNS, "line"); fLine1.setAttribute("x1","4");fLine1.setAttribute("y1","6");fLine1.setAttribute("x2","20");fLine1.setAttribute("y2","6");
    const fLine2 = document.createElementNS(svgNS, "line"); fLine2.setAttribute("x1","7");fLine2.setAttribute("y1","12");fLine2.setAttribute("x2","17");fLine2.setAttribute("y2","12");
    const fLine3 = document.createElementNS(svgNS, "line"); fLine3.setAttribute("x1","10");fLine3.setAttribute("y1","18");fLine3.setAttribute("x2","14");fLine3.setAttribute("y2","18");
    fabSvg.appendChild(fLine1); fabSvg.appendChild(fLine2); fabSvg.appendChild(fLine3);
    const fab = $("button", {
      class: "vh-filter-fab",
      style: { background: pc },
      onClick: () => toggleFilters(wrap),
    }, fabSvg, "Filters");
    wrap.appendChild(fab);

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

  injectStyles(getRadius({}), deriveColors("#ffffff"));
  fetchAll();
})();
