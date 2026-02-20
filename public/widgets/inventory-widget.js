/**
 * VehicleHound Inventory Widget
 * Embed: <div id="vh-inventory" data-api-key="YOUR_KEY"></div>
 *        <script src="https://YOUR_DOMAIN/widgets/inventory-widget.js"></script>
 */
(function () {
  "use strict";

  const API_BASE =
    document.currentScript?.getAttribute("data-api-base") ||
    new URL(document.currentScript?.src || "").origin;

  const container = document.getElementById("vh-inventory");
  if (!container) return console.warn("[VehicleHound] #vh-inventory not found");

  const API_KEY = container.getAttribute("data-api-key");
  if (!API_KEY) return console.warn("[VehicleHound] data-api-key required");

  const DETAIL_BASE = container.getAttribute("data-detail-url") || "";

  let state = {
    vehicles: [],
    total: 0,
    page: 1,
    totalPages: 1,
    search: "",
    type: "all",
    sort: "newest",
    loading: true,
    config: {},
  };

  function $(tag, attrs, ...children) {
    const el = document.createElement(tag);
    if (attrs) Object.entries(attrs).forEach(([k, v]) => {
      if (k === "style" && typeof v === "object") Object.assign(el.style, v);
      else if (k.startsWith("on")) el.addEventListener(k.slice(2).toLowerCase(), v);
      else el.setAttribute(k, v);
    });
    children.flat().forEach((c) => {
      if (c == null) return;
      el.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return el;
  }

  function formatPrice(v) {
    if (!v) return "";
    return "$" + Number(v).toLocaleString("en-US", { maximumFractionDigits: 0 });
  }

  function formatMileage(v) {
    if (!v) return "";
    return Number(v).toLocaleString("en-US") + " mi";
  }

  async function fetchInventory() {
    state.loading = true;
    render();
    try {
      const params = new URLSearchParams({
        key: API_KEY,
        page: String(state.page),
        sort: state.sort,
      });
      if (state.search) params.set("search", state.search);
      if (state.type !== "all") params.set("type", state.type);

      const res = await fetch(`${API_BASE}/api/widget/inventory?${params}`);
      const data = await res.json();
      state.vehicles = data.vehicles || [];
      state.total = data.total || 0;
      state.totalPages = data.totalPages || 1;
      state.config = data.config || {};
    } catch (e) {
      console.error("[VehicleHound]", e);
      state.vehicles = [];
    }
    state.loading = false;
    render();
  }

  function injectStyles() {
    if (document.getElementById("vh-widget-styles")) return;
    const style = document.createElement("style");
    style.id = "vh-widget-styles";
    style.textContent = `
      .vh-w{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#1a1d1e}
      .vh-w *{box-sizing:border-box}
      .vh-bar{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px}
      .vh-bar input,.vh-bar select{border:1px solid #e2e2e2;border-radius:6px;padding:8px 12px;font-size:13px;outline:none;background:#fff}
      .vh-bar input:focus,.vh-bar select:focus{border-color:#999}
      .vh-bar input{flex:1;min-width:160px}
      .vh-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px}
      .vh-card{border:1px solid #e8e8e8;border-radius:10px;overflow:hidden;transition:box-shadow .15s;cursor:pointer;background:#fff}
      .vh-card:hover{box-shadow:0 4px 20px rgba(0,0,0,.08)}
      .vh-card-img{position:relative;width:100%;padding-top:75%;background:#f5f5f5;overflow:hidden}
      .vh-card-img img{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:contain}
      .vh-card-body{padding:12px 14px}
      .vh-card-title{font-size:14px;font-weight:600;margin:0 0 4px}
      .vh-card-meta{font-size:12px;color:#888;margin:0}
      .vh-card-price{font-size:15px;font-weight:700;margin:8px 0 0}
      .vh-badge{display:inline-block;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;padding:2px 6px;border-radius:4px;background:#1a1d1e;color:#fff;margin-right:4px}
      .vh-badge--lease{background:#374151}
      .vh-pager{display:flex;justify-content:center;align-items:center;gap:8px;margin-top:16px}
      .vh-pager button{border:1px solid #ddd;border-radius:6px;padding:6px 14px;font-size:12px;cursor:pointer;background:#fff}
      .vh-pager button:disabled{opacity:.4;cursor:default}
      .vh-pager span{font-size:12px;color:#888}
      .vh-loading{text-align:center;padding:40px;font-size:13px;color:#999}
      .vh-empty{text-align:center;padding:40px;color:#999;font-size:13px}
    `;
    document.head.appendChild(style);
  }

  let searchTimer = null;

  function render() {
    container.innerHTML = "";
    const wrap = $("div", { class: "vh-w" });

    const bar = $("div", { class: "vh-bar" },
      $("input", {
        type: "text",
        placeholder: "Search vehicles...",
        value: state.search,
        onInput: (e) => {
          state.search = e.target.value;
          clearTimeout(searchTimer);
          searchTimer = setTimeout(() => { state.page = 1; fetchInventory(); }, 300);
        },
      }),
      $("select", {
        onChange: (e) => { state.type = e.target.value; state.page = 1; fetchInventory(); },
      },
        $("option", { value: "all" }, "All Types"),
        $("option", { value: "sale" }, "For Sale"),
        $("option", { value: "lease" }, "For Lease"),
      ),
      $("select", {
        onChange: (e) => { state.sort = e.target.value; state.page = 1; fetchInventory(); },
      },
        $("option", { value: "newest" }, "Newest"),
        $("option", { value: "price_asc" }, "Price: Low → High"),
        $("option", { value: "price_desc" }, "Price: High → Low"),
        $("option", { value: "year_desc" }, "Year: Newest"),
        $("option", { value: "mileage_asc" }, "Mileage: Lowest"),
      ),
    );
    wrap.appendChild(bar);

    if (state.loading) {
      wrap.appendChild($("div", { class: "vh-loading" }, "Loading inventory..."));
    } else if (state.vehicles.length === 0) {
      wrap.appendChild($("div", { class: "vh-empty" }, "No vehicles found."));
    } else {
      const grid = $("div", { class: "vh-grid" });
      state.vehicles.forEach((v) => {
        const title = [v.year, v.make, v.model].filter(Boolean).join(" ");
        const price =
          v.inventory_type === "lease" && v.lease_payment
            ? `${formatPrice(v.lease_payment)}/mo`
            : v.online_price
              ? formatPrice(v.online_price)
              : v.sale_price
                ? formatPrice(v.sale_price)
                : "";

        const meta = [
          v.trim,
          v.mileage ? formatMileage(v.mileage) : null,
          v.exterior_color,
        ].filter(Boolean).join(" · ");

        const card = $("div", { class: "vh-card", onClick: () => {
          if (DETAIL_BASE) {
            const url = DETAIL_BASE.includes("?")
              ? `${DETAIL_BASE}&id=${v.id}`
              : `${DETAIL_BASE}?id=${v.id}`;
            window.location.href = url;
          }
        } },
          $("div", { class: "vh-card-img" },
            v.preview_image
              ? $("img", { src: v.preview_image, alt: title, loading: "lazy" })
              : null,
          ),
          $("div", { class: "vh-card-body" },
            $("div", null,
              $("span", { class: `vh-badge${v.inventory_type === "lease" ? " vh-badge--lease" : ""}` },
                v.inventory_type === "lease" ? "Lease" : "Sale"),
            ),
            $("p", { class: "vh-card-title" }, title || "Untitled"),
            meta ? $("p", { class: "vh-card-meta" }, meta) : null,
            state.config.showPricing && price
              ? $("p", { class: "vh-card-price" }, price)
              : null,
          ),
        );
        grid.appendChild(card);
      });
      wrap.appendChild(grid);

      if (state.totalPages > 1) {
        const pager = $("div", { class: "vh-pager" },
          $("button", {
            disabled: state.page <= 1 ? "true" : null,
            onClick: () => { if (state.page > 1) { state.page--; fetchInventory(); } },
          }, "← Prev"),
          $("span", null, `Page ${state.page} of ${state.totalPages}`),
          $("button", {
            disabled: state.page >= state.totalPages ? "true" : null,
            onClick: () => { if (state.page < state.totalPages) { state.page++; fetchInventory(); } },
          }, "Next →"),
        );
        wrap.appendChild(pager);
      }
    }

    container.appendChild(wrap);
  }

  injectStyles();
  fetchInventory();
})();
