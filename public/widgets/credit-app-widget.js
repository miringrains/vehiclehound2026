/**
 * VehicleHound Credit Application Widget v1
 * <div id="vh-credit-app" data-api-key="KEY"></div>
 * <script src="https://DOMAIN/widgets/credit-app-widget.js"></script>
 */
(function () {
  "use strict";

  const SCRIPT = document.currentScript;
  const API_BASE = SCRIPT?.getAttribute("data-api-base") || new URL(SCRIPT?.src || "").origin;
  const container = document.getElementById("vh-credit-app");
  if (!container) return;
  const API_KEY = container.getAttribute("data-api-key");
  if (!API_KEY) return;

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

  const RADIUS_MAP = { sharp: 4, rounded: 12, soft: 20 };

  function getRadius(config) {
    const preset = config.borderRadius || "rounded";
    const base = RADIUS_MAP[preset] || 12;
    return { card: base, btn: Math.round(base * 0.83) };
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
    };
  }

  function injectStyles(r, cl) {
    const existing = document.getElementById("vh-ca-css");
    if (existing) existing.remove();
    const s = document.createElement("style");
    s.id = "vh-ca-css";
    if (!cl) cl = deriveColors("#ffffff");
    s.textContent = `
.vhca{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif !important;color:${cl.text};-webkit-font-smoothing:antialiased;line-height:1.5;max-width:720px;margin:0 auto;background:${cl.bg}}
.vhca *,.vhca *::before,.vhca *::after{box-sizing:border-box;margin:0;padding:0;font-family:inherit !important;line-height:inherit}
.vhca-frame{width:100%;border:none;border-radius:${r.card}px;background:${cl.bg};min-height:500px;transition:height .2s ease}
.vhca-loading{text-align:center;padding:60px;font-size:14px;color:${cl.textMuted}}
.vhca-error{text-align:center;padding:60px;color:${cl.textMuted};font-size:14px}
`;
    document.head.appendChild(s);
  }

  // Analytics tracker
  const _sid = Array.from(crypto.getRandomValues(new Uint8Array(6))).map(b => b.toString(16).padStart(2, "0")).join("");
  const _evtBuf = [];
  function track(event, payload) {
    if (typeof navigator !== "undefined" && navigator.doNotTrack === "1") return;
    _evtBuf.push({ event, payload: payload || {}, session_id: _sid, vehicle_id: null });
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

  // Listen for height messages from the iframe
  let iframeEl = null;
  window.addEventListener("message", function (e) {
    if (!iframeEl) return;
    try {
      const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
      if (data.type === "vh-credit-app-height" && typeof data.height === "number") {
        iframeEl.style.height = data.height + "px";
      }
    } catch { /* ignore non-JSON messages */ }
  });

  async function load() {
    container.innerHTML = "";
    container.appendChild($("div", { class: "vhca-loading" }, "Loading credit application..."));
    try {
      const res = await fetch(API_BASE + "/api/widget/credit-app?key=" + API_KEY);
      if (!res.ok) throw new Error();
      const data = await res.json();
      renderApp(data.config);
    } catch {
      container.innerHTML = "";
      container.appendChild($("div", { class: "vhca-error" }, "Credit application is currently unavailable."));
    }
  }

  function renderApp(config) {
    container.innerHTML = "";
    track("credit_app_view");
    const cl = deriveColors(config.backgroundColor);
    injectStyles(getRadius(config), cl);

    if (!config.creditAppUrl) {
      container.appendChild($("div", { class: "vhca-error" }, "Credit application is not configured."));
      return;
    }

    const appUrl = config.creditAppUrl + (config.creditAppUrl.includes("?") ? "&" : "?") + "embed=true";

    const wrap = $("div", { class: "vhca" });
    iframeEl = $("iframe", {
      class: "vhca-frame",
      src: appUrl,
      title: "Credit Application",
      loading: "lazy",
    });
    wrap.appendChild(iframeEl);
    container.appendChild(wrap);
  }

  injectStyles(getRadius({}), deriveColors("#ffffff"));
  load();
})();
