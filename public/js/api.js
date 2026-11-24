/* ============================================================
   API — thin client for the portfolio server
   Falls back to read-only defaults when opened as a static file.
   ============================================================ */

const API = (() => {
  const isStatic = location.protocol === "file:";
  let content = null;
  let meta = { openEdit: false, authed: false, canEdit: false };
  let adminToken = null;

  try {
    adminToken = localStorage.getItem("portfolio.token");
  } catch {}

  function headers(extra = {}) {
    const h = { ...extra };
    if (adminToken) h["x-admin-token"] = adminToken;
    return h;
  }

  async function request(path, opts = {}) {
    const res = await fetch(path, {
      ...opts,
      headers: headers(opts.headers || {})
    });
    const isJson = (res.headers.get("content-type") || "").includes("json");
    const body = isJson ? await res.json().catch(() => ({})) : null;
    if (!res.ok) {
      const err = new Error(body?.error || `HTTP ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return body;
  }

  function mergeDefaults(base, patch) {
    /* keep defaults for keys the server may not have yet (old content.json) */
    if (Array.isArray(base)) return Array.isArray(patch) ? patch : base;
    if (base && typeof base === "object") {
      const out = {};
      for (const k of Object.keys(base)) out[k] = k in (patch || {}) ? mergeDefaults(base[k], patch[k]) : base[k];
      for (const k of Object.keys(patch || {})) if (!(k in out)) out[k] = patch[k];
      return out;
    }
    return patch === undefined ? base : patch;
  }

  async function load() {
    if (isStatic) {
      content = JSON.parse(JSON.stringify(DEFAULT_DATA));
      meta = { openEdit: false, authed: false, canEdit: false };
      return content;
    }
    const [data, m] = await Promise.all([
      request("/api/content"),
      request("/api/meta").catch(() => ({ openEdit: false, authed: false, canEdit: false }))
    ]);
    meta = m;
    content = mergeDefaults(DEFAULT_DATA, data);
    return content;
  }

  async function save(data) {
    if (!meta.canEdit) throw new Error("Tidak punya izin mengubah");
    const res = await request("/api/content", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data)
    });
    content = data;
    return res;
  }

  async function upload(dataUrl) {
    const res = await request("/api/upload", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ dataUrl })
    });
    return res.url;
  }

  async function login(password) {
    const res = await request("/api/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password })
    });
    adminToken = res.token;
    try { localStorage.setItem("portfolio.token", res.token); } catch {}
    meta = await request("/api/meta");
    return res;
  }

  function logout() {
    adminToken = null;
    meta = { ...meta, authed: false };
    try { localStorage.removeItem("portfolio.token"); } catch {}
  }

  async function saveSettings(patch) {
    return request("/api/settings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch)
    });
  }

  return {
    get content() { return content; },
    get meta() { return meta; },
    get isStatic() { return isStatic; },
    get authed() { return !!meta.authed; },
    load, save, upload, login, logout, saveSettings, request
  };
})();

/* ---------- helpers shared by both front-ends ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const clone = (v) => JSON.parse(JSON.stringify(v));
const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const icon = (name) => ICONS[name] || ICONS.link;
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);

/* headings allow a tiny whitelist of inline tags */
function safeHtml(str = "") {
  const allowed = /<\/?(?:em|strong|br|i|b|span)>/gi;
  const out = [];
  let last = 0;
  String(str).replace(allowed, (m, offset) => {
    out.push(esc(String(str).slice(last, offset)));
    out.push(m.toLowerCase());
    last = offset + m.length;
    return m;
  });
  out.push(esc(String(str).slice(last)));
  return out.join("");
}

function toast(msg, ms = 2600) {
  const t = $("#toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("is-on");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove("is-on"), ms);
}

function relativeTime(ts) {
  if (!ts) return "";
  const diff = Math.round((Date.now() - ts) / 1000);
  if (diff < 60) return "baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return `${Math.floor(diff / 86400)} hari lalu`;
}
