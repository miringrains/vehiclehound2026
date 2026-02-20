/**
 * VehicleHound Vehicle Detail Widget
 * Embed: <div id="vh-vehicle" data-api-key="YOUR_KEY" data-vehicle-id="UUID"></div>
 *        <script src="https://YOUR_DOMAIN/widgets/vehicle-detail-widget.js"></script>
 */
(function () {
  "use strict";

  const API_BASE =
    document.currentScript?.getAttribute("data-api-base") ||
    new URL(document.currentScript?.src || "").origin;

  const container = document.getElementById("vh-vehicle");
  if (!container) return console.warn("[VehicleHound] #vh-vehicle not found");

  const API_KEY = container.getAttribute("data-api-key");
  if (!API_KEY) return console.warn("[VehicleHound] data-api-key required");

  let vehicleId =
    container.getAttribute("data-vehicle-id") ||
    new URLSearchParams(window.location.search).get("id");
  if (!vehicleId) return console.warn("[VehicleHound] vehicle id required");

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
    if (!v) return "—";
    return "$" + Number(v).toLocaleString("en-US", { maximumFractionDigits: 0 });
  }

  function formatMileage(v) {
    if (!v) return "—";
    return Number(v).toLocaleString("en-US") + " mi";
  }

  function injectStyles() {
    if (document.getElementById("vh-detail-styles")) return;
    const style = document.createElement("style");
    style.id = "vh-detail-styles";
    style.textContent = `
      .vh-d{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#1a1d1e;max-width:960px}
      .vh-d *{box-sizing:border-box}
      .vh-d-gallery{position:relative;width:100%;aspect-ratio:16/10;background:#f5f5f5;border-radius:10px;overflow:hidden;margin-bottom:16px}
      .vh-d-gallery img{width:100%;height:100%;object-fit:contain;display:none}
      .vh-d-gallery img.active{display:block}
      .vh-d-gallery-nav{position:absolute;top:50%;transform:translateY(-50%);background:rgba(0,0,0,.5);color:#fff;border:none;padding:8px 12px;cursor:pointer;font-size:18px;border-radius:6px}
      .vh-d-gallery-nav.prev{left:8px}
      .vh-d-gallery-nav.next{right:8px}
      .vh-d-thumbs{display:flex;gap:6px;overflow-x:auto;padding-bottom:8px;margin-bottom:16px}
      .vh-d-thumbs img{width:72px;height:54px;object-fit:cover;border-radius:6px;border:2px solid transparent;cursor:pointer;flex-shrink:0}
      .vh-d-thumbs img.active{border-color:#1a1d1e}
      .vh-d-header{margin-bottom:16px}
      .vh-d-title{font-size:22px;font-weight:700;margin:0 0 4px}
      .vh-d-subtitle{font-size:13px;color:#888;margin:0}
      .vh-d-price{font-size:24px;font-weight:700;margin:12px 0}
      .vh-d-badge{display:inline-block;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;padding:2px 8px;border-radius:4px;background:#1a1d1e;color:#fff;margin-right:6px}
      .vh-d-specs{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1px;border:1px solid #e8e8e8;border-radius:8px;overflow:hidden;margin:16px 0}
      .vh-d-spec{background:#fafafa;padding:10px 14px}
      .vh-d-spec-label{font-size:10px;color:#999;text-transform:uppercase;letter-spacing:.5px;margin:0 0 2px}
      .vh-d-spec-value{font-size:13px;font-weight:600;margin:0}
      .vh-d-desc{font-size:13px;line-height:1.6;color:#555;margin:16px 0;white-space:pre-wrap}
      .vh-d-cta{display:inline-block;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;color:#fff;text-decoration:none;cursor:pointer;border:none;margin-right:8px;margin-top:8px}
      .vh-d-loading{text-align:center;padding:40px;font-size:13px;color:#999}
      .vh-d-error{text-align:center;padding:40px;color:#c00;font-size:13px}
    `;
    document.head.appendChild(style);
  }

  let currentImg = 0;

  async function load() {
    container.innerHTML = "";
    container.appendChild($("div", { class: "vh-d-loading" }, "Loading vehicle..."));

    try {
      const res = await fetch(`${API_BASE}/api/widget/vehicle/${vehicleId}?key=${API_KEY}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      renderVehicle(data.vehicle, data.config);
    } catch {
      container.innerHTML = "";
      container.appendChild($("div", { class: "vh-d-error" }, "Vehicle not found."));
    }
  }

  function renderVehicle(v, config) {
    container.innerHTML = "";
    const wrap = $("div", { class: "vh-d" });
    const pc = config.primaryColor || "#1a1d1e";
    const hc = config.hoverColor || "#374151";

    const images = v.image_urls || [];
    const title = [v.year, v.make, v.model].filter(Boolean).join(" ");
    const subtitle = [v.trim, v.exterior_color].filter(Boolean).join(" · ");

    if (images.length > 0) {
      const gallery = $("div", { class: "vh-d-gallery" });
      images.forEach((url, i) => {
        const img = $("img", { src: url, alt: title, class: i === 0 ? "active" : "" });
        gallery.appendChild(img);
      });

      if (images.length > 1) {
        const prev = $("button", { class: "vh-d-gallery-nav prev", onClick: () => navGallery(-1, gallery) }, "‹");
        const next = $("button", { class: "vh-d-gallery-nav next", onClick: () => navGallery(1, gallery) }, "›");
        gallery.appendChild(prev);
        gallery.appendChild(next);
      }
      wrap.appendChild(gallery);

      if (images.length > 1) {
        const thumbs = $("div", { class: "vh-d-thumbs" });
        images.forEach((url, i) => {
          const th = $("img", {
            src: url,
            alt: `Thumbnail ${i + 1}`,
            class: i === 0 ? "active" : "",
            onClick: () => jumpGallery(i, wrap),
          });
          thumbs.appendChild(th);
        });
        wrap.appendChild(thumbs);
      }
    }

    const header = $("div", { class: "vh-d-header" });
    header.appendChild($("span", { class: "vh-d-badge", style: { background: pc } },
      v.inventory_type === "lease" ? "Lease" : "For Sale"));
    header.appendChild($("h1", { class: "vh-d-title" }, title || "Vehicle"));
    if (subtitle) header.appendChild($("p", { class: "vh-d-subtitle" }, subtitle));

    if (config.showPricing) {
      const price = v.inventory_type === "lease" && v.lease_payment
        ? `${formatPrice(v.lease_payment)}/mo`
        : formatPrice(v.online_price || v.sale_price);
      header.appendChild($("p", { class: "vh-d-price" }, price));
    }
    wrap.appendChild(header);

    const specs = [];
    if (v.mileage) specs.push(["Mileage", formatMileage(v.mileage)]);
    if (v.vehicle_type) specs.push(["Type", v.vehicle_type]);
    if (v.drive_type) specs.push(["Drive", v.drive_type]);
    if (v.transmission_style) specs.push(["Transmission", v.transmission_style]);
    if (v.fuel_type) specs.push(["Fuel", v.fuel_type]);
    if (v.engine_hp) specs.push(["Horsepower", v.engine_hp + " HP"]);
    if (v.engine_cylinders) specs.push(["Cylinders", v.engine_cylinders]);
    if (v.doors) specs.push(["Doors", String(v.doors)]);
    if (v.exterior_color) specs.push(["Exterior", v.exterior_color]);
    if (v.interior_color) specs.push(["Interior", v.interior_color]);
    if (v.vin) specs.push(["VIN", v.vin]);
    if (v.stock_number) specs.push(["Stock #", v.stock_number]);
    if (v.inventory_type === "lease") {
      if (v.lease_term) specs.push(["Lease Term", v.lease_term + " months"]);
      if (v.lease_annual_mileage) specs.push(["Annual Mileage", Number(v.lease_annual_mileage).toLocaleString()]);
    }

    if (specs.length > 0) {
      const grid = $("div", { class: "vh-d-specs" });
      specs.forEach(([label, value]) => {
        grid.appendChild($("div", { class: "vh-d-spec" },
          $("p", { class: "vh-d-spec-label" }, label),
          $("p", { class: "vh-d-spec-value" }, value),
        ));
      });
      wrap.appendChild(grid);
    }

    if (v.description) {
      wrap.appendChild($("p", { class: "vh-d-desc" }, v.description));
    }

    if (config.creditAppUrl) {
      const appUrl = config.creditAppUrl.includes("?")
        ? `${config.creditAppUrl}&vehicle=${v.id}`
        : `${config.creditAppUrl}?vehicle=${v.id}`;
      wrap.appendChild($("a", {
        class: "vh-d-cta",
        href: appUrl,
        style: { background: pc },
        onMouseenter: (e) => { e.target.style.background = hc; },
        onMouseleave: (e) => { e.target.style.background = pc; },
      }, "Apply for Financing"));
    }

    container.appendChild(wrap);
  }

  function navGallery(dir, galleryEl) {
    const imgs = galleryEl.querySelectorAll("img");
    imgs[currentImg].classList.remove("active");
    currentImg = (currentImg + dir + imgs.length) % imgs.length;
    imgs[currentImg].classList.add("active");
    updateThumbs(galleryEl.parentElement);
  }

  function jumpGallery(idx, wrapEl) {
    const gallery = wrapEl.querySelector(".vh-d-gallery");
    const imgs = gallery.querySelectorAll("img");
    imgs[currentImg].classList.remove("active");
    currentImg = idx;
    imgs[currentImg].classList.add("active");
    updateThumbs(wrapEl);
  }

  function updateThumbs(wrapEl) {
    const thumbs = wrapEl.querySelectorAll(".vh-d-thumbs img");
    thumbs.forEach((t, i) => t.classList.toggle("active", i === currentImg));
  }

  injectStyles();
  load();
})();
