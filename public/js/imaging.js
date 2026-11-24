/* ============================================================
   IMAGING — upload prep + automatic background removal
   Runs entirely in the browser; the resulting file is uploaded
   to the server afterwards.
   ============================================================ */

const Imaging = (() => {
  function loadImage(src) {
    return new Promise((res, rej) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => res(img);
      img.onerror = () => rej(new Error("Gagal memuat gambar"));
      img.src = src;
    });
  }

  function readFile(file) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
  }

  async function shrink(dataUrl, max = 1800, quality = 0.9) {
    const img = await loadImage(dataUrl);
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    if (scale === 1 && dataUrl.length < 900_000) return dataUrl;
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(img.width * scale));
    c.height = Math.max(1, Math.round(img.height * scale));
    const ctx = c.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/webp", quality);
  }

  /* does the image already have meaningful transparency? */
  async function hasAlpha(dataUrl) {
    try {
      const img = await loadImage(dataUrl);
      const c = document.createElement("canvas");
      c.width = Math.min(img.width, 300);
      c.height = Math.max(1, Math.round(c.width * (img.height / img.width)));
      const ctx = c.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, c.width, c.height);
      const d = ctx.getImageData(0, 0, c.width, c.height).data;
      let clear = 0;
      for (let i = 3; i < d.length; i += 4 * 5) if (d[i] < 20) clear++;
      return clear / (d.length / 20) > 0.06;
    } catch {
      return false;
    }
  }

  /* offline fallback: flood-fill the near-uniform border colour */
  async function fallbackRemoveBg(dataUrl) {
    const img = await loadImage(dataUrl);
    const c = document.createElement("canvas");
    c.width = img.width;
    c.height = img.height;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);
    const { width: w, height: h } = c;
    const d = ctx.getImageData(0, 0, w, h);
    const px = d.data;
    const idx = (x, y) => (y * w + x) * 4;

    let r = 0, g = 0, b = 0, n = 0;
    for (let x = 0; x < w; x += 4) {
      for (const y of [0, 1, h - 2, h - 1]) {
        const i = idx(x, y);
        r += px[i]; g += px[i + 1]; b += px[i + 2]; n++;
      }
    }
    for (let y = 0; y < h; y += 4) {
      for (const x of [0, 1, w - 2, w - 1]) {
        const i = idx(x, y);
        r += px[i]; g += px[i + 1]; b += px[i + 2]; n++;
      }
    }
    r /= n; g /= n; b /= n;
    const tol = 44;

    const visited = new Uint8Array(w * h);
    const queue = [];
    const push = (x, y) => {
      if (x < 0 || y < 0 || x >= w || y >= h) return;
      const p = y * w + x;
      if (visited[p]) return;
      visited[p] = 1;
      queue.push(p);
    };
    for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
    for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }

    while (queue.length) {
      const p = queue.pop();
      const i = p * 4;
      const dist = Math.abs(px[i] - r) + Math.abs(px[i + 1] - g) + Math.abs(px[i + 2] - b);
      if (dist > tol * 3) continue;
      px[i + 3] = 0;
      const x = p % w, y = (p / w) | 0;
      push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1);
    }
    ctx.putImageData(d, 0, 0);
    return c.toDataURL("image/png");
  }

  /* AI cut-out, client side */
  let modulePromise = null;
  function loadModule() {
    if (!modulePromise) {
      modulePromise = import("https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.5.8/+esm").catch((err) => {
        modulePromise = null;
        throw err;
      });
    }
    return modulePromise;
  }

  async function removeBg(dataUrl, onProgress = () => {}) {
    const src = await shrink(dataUrl, 1400, 0.92);
    try {
      onProgress(0.06);
      const mod = await loadModule();
      const blob = await mod.removeBackground(src, {
        output: { format: "image/png" },
        progress: (_key, cur, total) => {
          if (!total) return;
          onProgress(0.1 + Math.min(cur / total, 1) * 0.85);
        }
      });
      onProgress(0.97);
      return await new Promise((res, rej) => {
        const fr = new FileReader();
        fr.onload = () => res(fr.result);
        fr.onerror = rej;
        fr.readAsDataURL(blob);
      });
    } catch (err) {
      console.warn("AI background removal gagal, pakai mode cepat:", err);
      toast("Model AI tidak bisa dimuat — menggunakan mode cepat");
      onProgress(0.5);
      const out = await fallbackRemoveBg(dataUrl);
      onProgress(1);
      return out;
    }
  }

  return { readFile, shrink, hasAlpha, removeBg, loadImage };
})();
