/**
 * VehicleHound Vehicle Detail Widget v2
 * <div id="vh-vehicle" data-api-key="KEY"></div>
 * <script src="https://DOMAIN/widgets/vehicle-detail-widget.js"></script>
 */
(function () {
  "use strict";

  const SCRIPT = document.currentScript;
  const API_BASE = SCRIPT?.getAttribute("data-api-base") || new URL(SCRIPT?.src || "").origin;
  const container = document.getElementById("vh-vehicle");
  if (!container) return;
  const API_KEY = container.getAttribute("data-api-key");
  if (!API_KEY) return;
  const vehicleId = container.getAttribute("data-vehicle-id") || new URLSearchParams(window.location.search).get("id");
  if (!vehicleId) return;

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

  const fmt = v => v ? "$" + Number(v).toLocaleString("en-US", { maximumFractionDigits: 0 }) : "—";
  const fmtMi = v => v ? Number(v).toLocaleString("en-US") + " mi" : "—";

  const RADIUS_MAP = { sharp: 4, rounded: 12, soft: 20 };

  function getRadius(config) {
    const preset = config.borderRadius || "rounded";
    const base = RADIUS_MAP[preset] || 12;
    return { card: base, btn: Math.round(base * 0.83), badge: Math.round(base * 0.5), gallery: Math.round(base * 1.17) };
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
    };
  }

  // Analytics tracker
  const _sid = Array.from(crypto.getRandomValues(new Uint8Array(6))).map(b => b.toString(16).padStart(2, "0")).join("");
  const _evtBuf = [];
  function track(event, payload) {
    if (typeof navigator !== "undefined" && navigator.doNotTrack === "1") return;
    _evtBuf.push({ event, payload: payload || {}, session_id: _sid, vehicle_id: payload?.vehicle_id || vehicleId || null });
  }
  function _flushEvents() {
    if (_evtBuf.length === 0) return;
    const batch = _evtBuf.splice(0);
    const body = JSON.stringify({ events: batch });
    fetch(API_BASE + "/api/widget/events", { method: "POST", headers: { "Content-Type": "application/json", "X-API-Key": API_KEY }, body, keepalive: true })
      .then(r => { if (!r.ok) console.warn("[VH] Event tracking failed:", r.status); })
      .catch(e => console.warn("[VH] Event tracking error:", e.message));
  }
  setInterval(_flushEvents, 5000);
  window.addEventListener("beforeunload", _flushEvents);

  function injectStyles(r, cl) {
    const existing = document.getElementById("vh-det-css");
    if (existing) existing.remove();
    const s = document.createElement("style");
    s.id = "vh-det-css";
    if (!cl) cl = deriveColors("#ffffff");
    s.textContent = `
.vhd{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif !important;color:${cl.text} !important;-webkit-font-smoothing:antialiased;font-size:16px !important;font-weight:400 !important;font-style:normal !important;letter-spacing:normal !important;text-transform:none !important;word-spacing:normal !important;line-height:1.5 !important;max-width:1100px;margin:0 auto;background:${cl.bg}}
.vhd *,.vhd *::before,.vhd *::after{box-sizing:border-box;margin:0;padding:0;border:0;font-family:inherit !important;font-size:inherit !important;font-weight:inherit !important;font-style:inherit !important;letter-spacing:inherit !important;text-transform:inherit !important;word-spacing:inherit !important;line-height:inherit !important;color:inherit !important;text-decoration:inherit !important;background:transparent}
.vhd-top{display:flex;gap:32px;margin-bottom:32px}
.vhd-gallery{flex:1;min-width:0}
.vhd-main-img{width:100%;aspect-ratio:16/10;background:${cl.imgBg};border-radius:${r.gallery}px;overflow:hidden;margin-bottom:10px;position:relative}
.vhd-main-img img{width:100%;height:100%;object-fit:contain}
.vhd-main-img .vhd-nav{position:absolute;top:50%;transform:translateY(-50%);background:rgba(0,0,0,.55);color:#fff !important;border:none;width:36px;height:36px;border-radius:50%;cursor:pointer;font-size:18px !important;display:flex;align-items:center;justify-content:center;transition:background .15s}
.vhd-main-img .vhd-nav:hover{background:rgba(0,0,0,.75)}
.vhd-main-img .vhd-nav.prev{left:12px}
.vhd-main-img .vhd-nav.next{right:12px}
.vhd-thumbs{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px}
.vhd-thumbs img{width:80px;height:60px;object-fit:cover;border-radius:${r.badge}px;border:2px solid transparent;cursor:pointer;flex-shrink:0;transition:border-color .15s,opacity .15s;opacity:.6}
.vhd-thumbs img.active{border-color:${cl.text};opacity:1}
.vhd-thumbs img:hover{opacity:1}
.vhd-info{width:380px;flex-shrink:0}
.vhd-badge{display:inline-block;font-size:10px !important;font-weight:700 !important;text-transform:uppercase !important;letter-spacing:.6px !important;padding:4px 12px;border-radius:${r.badge}px;color:#fff !important;margin-bottom:10px}
.vhd-title{font-size:26px !important;font-weight:800 !important;color:${cl.text} !important;margin-bottom:4px;line-height:1.2 !important;letter-spacing:normal !important}
.vhd-subtitle{font-size:14px !important;color:${cl.textMuted} !important;margin-bottom:16px}
.vhd-price{font-size:32px !important;font-weight:800 !important;color:${cl.text} !important;margin-bottom:4px}
.vhd-price-sub{font-size:12px !important;color:${cl.textMuted} !important;margin-bottom:20px}
.vhd-details{border:1px solid ${cl.border};border-radius:${r.card}px;overflow:hidden;margin-bottom:20px}
.vhd-detail-row{display:flex;justify-content:space-between;padding:10px 16px;font-size:13px !important;border-bottom:1px solid ${cl.border}}
.vhd-detail-row:last-child{border-bottom:none}
.vhd-detail-row .label{color:${cl.textMuted} !important;font-size:13px !important;text-transform:none !important;letter-spacing:normal !important;font-weight:400 !important}
.vhd-detail-row .value{font-weight:600 !important;color:${cl.text} !important;text-align:right;font-size:13px !important}
.vhd-cta{display:block;width:100%;padding:14px;border:none;border-radius:${r.btn}px;font-size:15px !important;font-weight:700 !important;cursor:pointer;transition:background .15s;text-align:center;text-decoration:none !important;color:#fff !important}
.vhd-cta-secondary{display:block;width:100%;padding:12px;border:2px solid ${cl.border};border-radius:${r.btn}px;font-size:14px !important;font-weight:600 !important;cursor:pointer;text-align:center;text-decoration:none !important;color:${cl.text} !important;background:${cl.card};transition:border-color .15s;margin-top:10px}
.vhd-cta-secondary:hover{border-color:${cl.textMuted}}
.vhd-cta-row{display:flex;gap:10px;margin-top:10px}
.vhd-cta-row .vhd-cta-secondary{margin-top:0;flex:1}
.vhd-modal-overlay{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;transition:opacity .2s}
.vhd-modal-overlay.vhd-modal--open{opacity:1}
.vhd-modal{background:${cl.card};border-radius:${r.card}px;width:100%;max-width:640px;max-height:90vh;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.3);display:flex;flex-direction:column;transform:translateY(20px);transition:transform .25s ease}
.vhd-modal-overlay.vhd-modal--open .vhd-modal{transform:translateY(0)}
.vhd-modal-header{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid ${cl.border}}
.vhd-modal-header h2{font-size:16px !important;font-weight:700 !important;color:${cl.text} !important}
.vhd-modal-close{background:none;border:none;cursor:pointer;color:${cl.textMuted} !important;padding:4px;border-radius:6px;transition:background .15s;display:flex;align-items:center;justify-content:center;width:32px;height:32px}
.vhd-modal-close:hover{background:${cl.border}}
.vhd-modal iframe{width:100%;flex:1;border:none;min-height:min(75vh,700px)}
.vhd-specs{margin-top:32px}
.vhd-specs h2{font-size:18px !important;font-weight:700 !important;margin-bottom:16px}
.vhd-spec-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1px;border:1px solid ${cl.border};border-radius:${r.card}px;overflow:hidden;background:${cl.border}}
.vhd-spec-cell{background:${cl.card};padding:14px 18px}
.vhd-spec-cell .label{font-size:10px !important;text-transform:uppercase !important;letter-spacing:.5px !important;color:${cl.textMuted} !important;margin-bottom:2px}
.vhd-spec-cell .value{font-size:14px !important;font-weight:600 !important;color:${cl.text} !important}
.vhd-desc{margin-top:24px;font-size:14px !important;color:${cl.textStrong} !important;line-height:1.7 !important;white-space:pre-wrap}
.vhd-loading{text-align:center;padding:60px;font-size:14px !important;color:${cl.textMuted} !important}
.vhd-error{text-align:center;padding:60px;color:${cl.textMuted} !important;font-size:14px !important}
@media(max-width:768px){.vhd-top{flex-direction:column}.vhd-info{width:100%}}
`;
    document.head.appendChild(s);
  }

  let currentImg = 0;

  async function load() {
    container.innerHTML = "";
    container.appendChild($("div", { class: "vhd-loading" }, "Loading vehicle details..."));
    try {
      const res = await fetch(API_BASE + "/api/widget/vehicle/" + vehicleId + "?key=" + API_KEY);
      if (!res.ok) throw new Error();
      const data = await res.json();
      renderVehicle(data.vehicle, data.config);
    } catch {
      container.innerHTML = "";
      container.appendChild($("div", { class: "vhd-error" }, "Vehicle not found."));
    }
  }

  function renderVehicle(v, config) {
    container.innerHTML = "";
    track("detail_view", { vehicle_id: v.id });
    const cl = deriveColors(config.backgroundColor);
    injectStyles(getRadius(config), cl);
    const pc = config.primaryColor || "#1a1d1e";
    const hc = config.hoverColor || "#374151";
    const images = v.image_urls || [];
    const title = [v.year, v.make, v.model].filter(Boolean).join(" ");
    const subtitle = [v.trim, v.exterior_color].filter(Boolean).join(" · ");
    const isLease = v.inventory_type === "lease";

    const wrap = $("div", { class: "vhd" });
    const top = $("div", { class: "vhd-top" });

    // Gallery
    const gallery = $("div", { class: "vhd-gallery" });
    const mainImg = $("div", { class: "vhd-main-img" });
    if (images.length > 0) {
      images.forEach((url, i) => {
        const img = $("img", { src: url, alt: title, style: { display: i === 0 ? "block" : "none" } });
        mainImg.appendChild(img);
      });
      if (images.length > 1) {
        mainImg.appendChild($("button", { class: "vhd-nav prev", onClick: () => nav(-1, wrap) }, "‹"));
        mainImg.appendChild($("button", { class: "vhd-nav next", onClick: () => nav(1, wrap) }, "›"));
      }
    } else {
      mainImg.style.display = "flex"; mainImg.style.alignItems = "center"; mainImg.style.justifyContent = "center";
      mainImg.appendChild($("span", { style: { color: "#ccc", fontSize: "14px" } }, "No images available"));
    }
    gallery.appendChild(mainImg);

    if (images.length > 1) {
      const thumbs = $("div", { class: "vhd-thumbs" });
      images.forEach((url, i) => {
        thumbs.appendChild($("img", {
          src: url, alt: "Thumb " + (i + 1),
          class: i === 0 ? "active" : "",
          onClick: () => jump(i, wrap),
        }));
      });
      gallery.appendChild(thumbs);
    }
    top.appendChild(gallery);

    // Info panel
    const info = $("div", { class: "vhd-info" });
    info.appendChild($("span", { class: "vhd-badge", style: { background: isLease ? "#374151" : "#22c55e" } },
      isLease ? "Lease" : "For Sale"));
    info.appendChild($("h1", { class: "vhd-title" }, title || "Vehicle"));
    if (subtitle) info.appendChild($("p", { class: "vhd-subtitle" }, subtitle));

    if (config.showPricing !== false) {
      const price = isLease ? v.lease_payment : (v.online_price || v.sale_price);
      info.appendChild($("div", { class: "vhd-price" }, price ? (isLease ? fmt(price) + "/mo" : fmt(price)) : "Contact for Pricing"));
      if (isLease && v.lease_term) {
        info.appendChild($("p", { class: "vhd-price-sub" }, v.lease_term + " month lease"));
      }
      if (v.msrp && !isLease) {
        info.appendChild($("p", { class: "vhd-price-sub" }, "MSRP: " + fmt(v.msrp)));
      }
    }

    // Quick details
    const details = $("div", { class: "vhd-details" });
    const detailRows = [];
    if (v.mileage) detailRows.push(["Mileage", fmtMi(v.mileage)]);
    if (v.drive_type) detailRows.push(["Drivetrain", v.drive_type]);
    if (v.transmission_style) detailRows.push(["Transmission", v.transmission_style]);
    if (v.fuel_type) detailRows.push(["Fuel Type", v.fuel_type]);
    if (v.exterior_color) detailRows.push(["Exterior", v.exterior_color]);
    if (v.interior_color) detailRows.push(["Interior", v.interior_color]);
    if (isLease && v.lease_annual_mileage) detailRows.push(["Annual Mileage", Number(v.lease_annual_mileage).toLocaleString()]);
    if (v.stock_number) detailRows.push(["Stock #", v.stock_number]);
    if (v.vin) detailRows.push(["VIN", v.vin]);

    detailRows.forEach(([label, value]) => {
      details.appendChild($("div", { class: "vhd-detail-row" },
        $("span", { class: "label" }, label),
        $("span", { class: "value" }, value),
      ));
    });
    if (detailRows.length) info.appendChild(details);

    // CTAs
    if (config.showCreditApp !== false && config.creditAppUrl) {
      const appUrl = config.creditAppUrl + (config.creditAppUrl.includes("?") ? "&" : "?") + "vehicle=" + v.id + "&embed=true";
      const cta = $("a", {
        class: "vhd-cta", href: "javascript:void(0)",
        style: { background: pc },
        onMouseenter: e => { e.currentTarget.style.background = hc; },
        onMouseleave: e => { e.currentTarget.style.background = pc; },
        onClick: () => { track("apply_click", { vehicle_id: v.id }); openCreditModal(appUrl, title); },
      }, "Apply for Financing");
      info.appendChild(cta);
    }

    // Call + Back row
    const ctaRow = $("div", { class: "vhd-cta-row" });
    if (config.phone) {
      const cleanPhone = config.phone.replace(/[^\d+]/g, "");
      ctaRow.appendChild($("a", {
        class: "vhd-cta-secondary",
        href: "tel:" + cleanPhone,
        onClick: () => track("call_click", { vehicle_id: v.id }),
      }, "📞 Call Dealer"));
    }
    ctaRow.appendChild($("a", {
      class: "vhd-cta-secondary",
      href: "javascript:void(0)",
      onClick: () => { track("back_to_inventory"); _flushEvents(); window.history.back(); },
    }, "← Back to Inventory"));
    info.appendChild(ctaRow);

    top.appendChild(info);
    wrap.appendChild(top);

    // Specs grid
    const specs = [];
    if (v.engine_hp) specs.push(["Horsepower", v.engine_hp + " HP"]);
    if (v.engine_cylinders) specs.push(["Cylinders", v.engine_cylinders]);
    if (v.engine_displacement) specs.push(["Engine", v.engine_displacement + "L"]);
    if (v.doors) specs.push(["Doors", String(v.doors)]);
    if (v.body_class) specs.push(["Body Style", v.body_class]);
    if (v.vehicle_type) specs.push(["Type", v.vehicle_type]);

    if (specs.length > 0) {
      const specsSection = $("div", { class: "vhd-specs" },
        $("h2", null, "Specifications"),
        $("div", { class: "vhd-spec-grid" },
          ...specs.map(([label, value]) =>
            $("div", { class: "vhd-spec-cell" },
              $("div", { class: "label" }, label),
              $("div", { class: "value" }, value),
            )
          )
        )
      );
      wrap.appendChild(specsSection);
    }

    if (v.description) {
      wrap.appendChild($("p", { class: "vhd-desc" }, v.description));
    }

    container.appendChild(wrap);
  }

  function nav(dir, wrapEl) {
    const mainImg = wrapEl.querySelector(".vhd-main-img");
    const imgs = mainImg.querySelectorAll("img");
    if (!imgs.length) return;
    imgs[currentImg].style.display = "none";
    currentImg = (currentImg + dir + imgs.length) % imgs.length;
    imgs[currentImg].style.display = "block";
    const thumbs = wrapEl.querySelectorAll(".vhd-thumbs img");
    thumbs.forEach((t, i) => t.classList.toggle("active", i === currentImg));
  }

  function jump(idx, wrapEl) {
    const mainImg = wrapEl.querySelector(".vhd-main-img");
    const imgs = mainImg.querySelectorAll("img");
    if (!imgs.length) return;
    imgs[currentImg].style.display = "none";
    currentImg = idx;
    imgs[currentImg].style.display = "block";
    const thumbs = wrapEl.querySelectorAll(".vhd-thumbs img");
    thumbs.forEach((t, i) => t.classList.toggle("active", i === currentImg));
  }

  function openCreditModal(url, vehicleTitle) {
    const overlay = $("div", { class: "vhd-modal-overlay", onClick: e => { if (e.target === overlay) closeCreditModal(overlay); } });
    const svgNS = "http://www.w3.org/2000/svg";
    const xSvg = document.createElementNS(svgNS, "svg");
    xSvg.setAttribute("width", "18"); xSvg.setAttribute("height", "18"); xSvg.setAttribute("viewBox", "0 0 24 24");
    xSvg.setAttribute("fill", "none"); xSvg.setAttribute("stroke", "currentColor"); xSvg.setAttribute("stroke-width", "2");
    xSvg.setAttribute("stroke-linecap", "round"); xSvg.setAttribute("stroke-linejoin", "round");
    const l1 = document.createElementNS(svgNS, "line"); l1.setAttribute("x1","18");l1.setAttribute("y1","6");l1.setAttribute("x2","6");l1.setAttribute("y2","18");
    const l2 = document.createElementNS(svgNS, "line"); l2.setAttribute("x1","6");l2.setAttribute("y1","6");l2.setAttribute("x2","18");l2.setAttribute("y2","18");
    xSvg.appendChild(l1); xSvg.appendChild(l2);

    const modal = $("div", { class: "vhd-modal" },
      $("div", { class: "vhd-modal-header" },
        $("h2", null, "Apply for Financing" + (vehicleTitle ? " — " + vehicleTitle : "")),
        $("button", { class: "vhd-modal-close", onClick: () => closeCreditModal(overlay) }, xSvg),
      ),
      $("iframe", { src: url, title: "Credit Application" }),
    );
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => overlay.classList.add("vhd-modal--open"));
  }

  function closeCreditModal(overlay) {
    overlay.classList.remove("vhd-modal--open");
    setTimeout(() => { overlay.remove(); document.body.style.overflow = ""; }, 250);
  }

  injectStyles(getRadius({}), deriveColors("#ffffff"));
  load();
})();
