/* ============================================================
   MOTION — opening sinematik, reveal saat scroll, parallax,
   dan preview gambar pada daftar prestasi.
   Lapisan tambahan di atas site.js; tidak mengubah data/desain.
   ============================================================ */
(() => {
  "use strict";

  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;

  // Kelas ini yang menyalakan keadaan awal animasi di motion.css.
  // Tanpa JS, konten tetap terlihat normal.
  root.classList.add("motion-ready");

  const $ = (sel, scope = document) => scope.querySelector(sel);
  const $$ = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ------------------------------------------------------------
     1. OPENING
     ------------------------------------------------------------ */
  function introData() {
    try {
      if (typeof Site !== "undefined" && Site.data && Site.data.intro) return Site.data.intro;
      if (typeof DEFAULT_DATA !== "undefined" && DEFAULT_DATA.intro) return DEFAULT_DATA.intro;
    } catch {}
    return { kanji: "ディマス", name: "DIMAS PARAMA", year: "2026" };
  }

  function buildIntro() {
    const intro = $("#intro");
    if (!intro || intro.classList.contains("is-leaving") || intro.classList.contains("is-done")) return;

    const d = introData();
    const kanji = $("#introKanji");
    const name = $("#introName");
    const year = $("#introYear");

    if (kanji) {
      const same = kanji.textContent.replace(/\s+/g, "") === d.kanji.replace(/\s+/g, "");
      if (!same) {
        kanji.dataset.src = d.kanji;
        kanji.innerHTML = Array.from(d.kanji)
          .map((c, i) => `<span style="--i:${i}">${c === " " ? "&nbsp;" : c}</span>`)
          .join("");
      }
    }

    if (name) {
      const same = name.textContent.replace(/\s+/g, "") === d.name.replace(/\s+/g, "");
      if (!same) {
        name.dataset.src = d.name;
        name.innerHTML = Array.from(d.name)
          .map((c, i) =>
            c === " "
              ? `<span class="intro__space" style="--i:${i}">&nbsp;</span>`
              : `<span style="--i:${i}">${c}</span>`
          )
          .join("");
      }
    }

    if (year && d.year) year.textContent = d.year;
  }

  let heroOn = false;
  function heroIn() {
    if (heroOn) return;
    heroOn = true;
    const hero = $("#hero");
    if (hero) requestAnimationFrame(() => hero.classList.add("is-in"));
  }

  document.addEventListener("portfolio:intro-leaving", () => {
    if (reduced) return heroIn();
    setTimeout(heroIn, 360);
  }, { once: true });

  document.addEventListener("portfolio:intro-done", heroIn, { once: true });

  buildIntro();
  document.addEventListener("portfolio:rendered", buildIntro);

  // jaring pengaman bila halaman dibuka tanpa intro / event tidak terkirim
  if (reduced) heroIn();
  else {
    setTimeout(() => { if (!$("#intro")) heroIn(); }, 600);
    addEventListener("load", () => setTimeout(heroIn, 5000), { once: true });
  }

  /* ------------------------------------------------------------
     2. SPLIT TEKS MENJADI KATA (untuk masking reveal)
     ------------------------------------------------------------ */
  const SPLIT_SELECTOR = [
    ".sec-head__title",
    ".profile__title",
    ".bio__title",
    ".projects__heading",
    ".contact__title",
    ".quote__text"
  ].join(",");

  function unwrapWords(el) {
    $$(".m-word-wrap", el).forEach((wrap) => {
      wrap.replaceWith(document.createTextNode(wrap.textContent || ""));
    });
    el.classList.remove("m-split", "is-in");
  }

  function splitWords(el) {
    if (!el) return;
    unwrapWords(el);

    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const parent = node.parentElement;
        if (!parent || parent.closest(".m-word")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    if (!nodes.length) return;

    nodes.forEach((node) => {
      const frag = document.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(" "));
          return;
        }
        const wrap = document.createElement("span");
        wrap.className = "m-word-wrap";
        const word = document.createElement("span");
        word.className = "m-word";
        word.textContent = part;
        wrap.appendChild(word);
        frag.appendChild(wrap);
      });
      node.parentNode.replaceChild(frag, node);
    });

    $$(".m-word", el).forEach((w, i) => {
      w.style.setProperty("--d", Math.min(i * 42, 460) + "ms");
    });
    el.classList.add("m-split");
  }

  /* ------------------------------------------------------------
     3. OBSERVER REVEAL
     ------------------------------------------------------------ */
  let io = null;
  const triggerTargets = new WeakMap();

  function ensureIO() {
    if (io || !("IntersectionObserver" in window)) return io;
    io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const targets = triggerTargets.get(en.target);
          if (targets) targets.forEach((t) => t.classList.add("is-in"));
          triggerTargets.delete(en.target);
          io.unobserve(en.target);
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -6% 0px" }
    );
    return io;
  }

  /*
   * Elemen yang memakai clip-path tidak dianggap terlihat oleh
   * IntersectionObserver (Chrome menghitung clip elemen itu sendiri),
   * jadi yang diamati adalah elemen pembungkusnya.
   */
  function watch(el, trigger = el) {
    const observer = ensureIO();
    if (!observer) {
      el.classList.add("is-in");
      return;
    }

    let targets = triggerTargets.get(trigger);
    if (!targets) {
      targets = new Set();
      triggerTargets.set(trigger, targets);
      observer.observe(trigger);
    }
    targets.add(el);
  }

  const FADE_SELECTOR = [
    ".sec-mark",
    ".sec-head__sub",
    ".profile__cap",
    ".facts > div",
    ".bio__story",
    ".bio__row",
    ".edu",
    ".edu__row",
    ".project",
    ".cert",
    ".skill",
    ".gh__repo",
    ".socials a",
    ".contact__foot",
    ".projects__note",
    ".skills__note",
    ".certs__note",
    ".gallery__hint"
  ].join(",");

  const CLIP_SELECTOR = [
    ".profile__photo",
    ".project__media",
    ".shot__media",
    ".cert__media",
    ".acc__img",
    ".pdetail__cover"
  ].join(",");

  function initReveals() {
    $$(SPLIT_SELECTOR).forEach((el) => {
      splitWords(el);
      watch(el);
    });

    $$(FADE_SELECTOR).forEach((el) => {
      el.classList.add("m-fade");
      const parent = el.parentElement;
      const siblings = parent ? Array.from(parent.children) : [];
      const index = Math.max(0, siblings.indexOf(el));
      el.style.setProperty("--d", Math.min(index * 62, 320) + "ms");
      watch(el);
    });

    $$(CLIP_SELECTOR).forEach((el) => {
      el.classList.add("m-clip");
      watch(el, el.parentElement || el);
    });
  }

  // kalau konten dirender ulang (ganti bahasa), pasang lagi animasinya
  document.addEventListener("portfolio:rendered", () => {
    initReveals();
    initPeek();
  });

  /* ------------------------------------------------------------
     4. PARALLAX (halus, hanya desktop + tanpa reduced motion)
     ------------------------------------------------------------ */
  const parItems = [];
  let parRaf = 0;

  function measureParallax() {
    parItems.forEach((it) => {
      const current = parseFloat(getComputedStyle(it.el).getPropertyValue("--par")) || 0;
      const rect = it.el.getBoundingClientRect();
      it.base = rect.top + window.scrollY - current;
      it.height = rect.height || 1;
    });
  }

  function paintParallax() {
    if (!parItems.length) return;
    const vh = window.innerHeight || 1;
    parItems.forEach((it) => {
      const center = it.base + it.height / 2 - window.scrollY;
      const progress = (center - vh / 2) / vh;
      const y = clamp(-progress * it.speed * 130, -90, 90);
      it.el.style.setProperty("--par", y.toFixed(2) + "px");
    });
  }

  function resetParallax() {
    parItems.forEach((it) => {
      it.el.classList.remove("m-par");
      it.el.style.removeProperty("--par");
    });
    parItems.length = 0;
  }

  function addParallax(selector, speed) {
    const el = $(selector);
    if (!el || parItems.some((it) => it.el === el)) return;
    el.classList.add("m-par");
    parItems.push({ el, speed, base: 0, height: 1 });
  }

  function initParallax() {
    resetParallax();
    if (reduced || !fine || window.innerWidth < 860) return;

    addParallax("#heroPortrait", -0.09);
    addParallax("#aboutPortrait", -0.055);
    addParallax(".hero__kanji", 0.12);
    addParallax(".profile__kanji", 0.1);
    addParallax(".quote__text", -0.045);
    addParallax(".quote__by", 0.07);

    measureParallax();
    paintParallax();
  }

  function scheduleParallax() {
    if (parRaf) return;
    parRaf = requestAnimationFrame(() => {
      parRaf = 0;
      paintParallax();
    });
  }

  addEventListener("scroll", scheduleParallax, { passive: true });
  addEventListener("resize", () => {
    initParallax();
    scheduleParallax();
  }, { passive: true });
  addEventListener("load", () => {
    measureParallax();
    scheduleParallax();
  }, { once: true });

  /* ------------------------------------------------------------
     5. PREVIEW GAMBAR MENGIKUTI KURSOR (daftar prestasi)
     ------------------------------------------------------------ */
  let peek = null;
  const peekState = { x: 0, y: 0, tx: 0, ty: 0, ready: false, on: false, raf: 0 };

  function peekLoop() {
    const s = peekState;
    if (!peek) return;
    s.x += (s.tx - s.x) * 0.15;
    s.y += (s.ty - s.y) * 0.15;
    const rot = clamp((s.tx - s.x) * 0.05, -6, 6);
    peek.style.transform =
      `translate3d(${s.x.toFixed(1)}px,${s.y.toFixed(1)}px,0) translate(-50%,-50%) rotate(${rot.toFixed(2)}deg)`;
    if (!s.on) {
      s.raf = 0;
      return;
    }
    s.raf = requestAnimationFrame(peekLoop);
  }

  function showPeek(src) {
    if (!peek || !src) return;
    const img = peek.querySelector("img");
    if (img && img.getAttribute("src") !== src) img.src = src;
    if (!peekState.ready) {
      peekState.x = peekState.tx;
      peekState.y = peekState.ty;
      peekState.ready = true;
    }
    peek.classList.add("is-on");
    peekState.on = true;
    if (!peekState.raf) peekState.raf = requestAnimationFrame(peekLoop);
  }

  function hidePeek() {
    if (!peek) return;
    peek.classList.remove("is-on");
    peekState.on = false;
  }

  function onPeekMove(e) {
    peekState.tx = e.clientX + 30;
    peekState.ty = e.clientY;
  }

  function initPeek() {
    if (reduced || !fine) return;

    const rows = $$("#stageList .acc");
    if (!rows.length) return;

    if (!peek) {
      peek = document.createElement("div");
      peek.className = "m-peek";
      peek.setAttribute("aria-hidden", "true");
      peek.innerHTML = '<img alt="" />';
      document.body.appendChild(peek);
      document.addEventListener("pointermove", onPeekMove, { passive: true });
    }

    rows.forEach((row) => {
      if (row.dataset.peekReady === "1") return;
      row.dataset.peekReady = "1";
      const img = row.querySelector(".acc__img img");
      const own = img && (img.currentSrc || img.getAttribute("src"));
      const src = own || fallbackPeek(row);
      if (!src) return;
      row.addEventListener("pointerenter", () => showPeek(src));
      row.addEventListener("pointerleave", hidePeek);
    });
  }

  // Baris prestasi belum tentu punya gambar sendiri. Pakai karya yang
  // relevan sebagai pratinjau visual (tanpa mengubah data/isi).
  function fallbackPeek(row) {
    try {
      const data = typeof Site !== "undefined" && Site.data ? Site.data : null;
      if (!data) return "";
      const rows = $$("#stageList .acc");
      const index = rows.indexOf(row);
      const project = data.projects?.items?.[index];
      if (project?.cover) return project.cover;
      const shot = data.gallery?.items?.[index];
      if (shot?.image) return shot.image;
    } catch {}
    return "";
  }

  // sembunyikan preview saat halaman digulir / baris ditutup
  addEventListener("scroll", hidePeek, { passive: true });

  /* ------------------------------------------------------------
     6. BOOT
     ------------------------------------------------------------ */
  function bootMotion() {
    initReveals();
    initParallax();
    initPeek();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootMotion, { once: true });
  } else {
    bootMotion();
  }

  // konten dari API biasanya selesai setelah DOMContentLoaded
  document.addEventListener("portfolio:rendered", () => {
    initParallax();
  });
})();
