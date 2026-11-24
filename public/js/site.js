/* ============================================================
   SITE — public rendering & interactions
   ============================================================ */

const Site = (() => {
  let base = null;          // Indonesian document (source of truth)
  let data = null;          // currently rendered document (id or en)
  let lbIndex = 0;
  let lbItems = [];

  /* ---------------- preferences ---------------- */
  const THEMES = ["light", "dark", "midnight"];

  const pref = {
    get(key, fallback) {
      try {
        return localStorage.getItem("portfolio." + key) ?? fallback;
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem("portfolio." + key, value);
      } catch {}
    }
  };

  /* ---------------- static UI copy (not part of content) ---------------- */
  const UI = {
    id: {
      certEmptyTitle: "Sertifikat masih kosong",
      certEmptyNote: "Tambahkan sertifikat lewat panel admin.",
      galleryEmptyTitle: "Galeri masih kosong",
      galleryEmptyNote: "Tambahkan potret lewat panel admin.",
      noPhoto: "Potret ini belum punya gambar",
      noCert: "Sertifikat ini belum punya gambar",
      projectOpen: "Detail",
      projectRole: "Peran",
      projectYear: "Tahun",
      projectDocs: "Dokumentasi",
      projectPhotos: (n) => `${n} foto`,
      projectEmptyTitle: "Belum ada project",
      projectEmptyNote: "Tambahkan project lewat panel admin.",
      githubLoading: "Memuat repositori…",
      githubEmpty: "Belum ada repositori publik.",
      githubError: "Tidak bisa memuat GitHub saat ini.",
      themeToast: (m) => `Tema: ${m}`,
      light: "Terang",
      dark: "Gelap",
      midnight: "Midnight"
    },
    en: {
      certEmptyTitle: "No certificates yet",
      certEmptyNote: "Add certificates through the admin panel.",
      galleryEmptyTitle: "Gallery is still empty",
      galleryEmptyNote: "Add portraits through the admin panel.",
      noPhoto: "This portrait has no image yet",
      noCert: "This certificate has no image yet",
      projectOpen: "Details",
      projectRole: "Role",
      projectYear: "Year",
      projectDocs: "Documentation",
      projectPhotos: (n) => `${n} photo${n === 1 ? "" : "s"}`,
      projectEmptyTitle: "No projects yet",
      projectEmptyNote: "Add projects through the admin panel.",
      githubLoading: "Loading repositories…",
      githubEmpty: "No public repositories yet.",
      githubError: "GitHub can't be loaded right now.",
      themeToast: (m) => `Theme: ${m}`,
      light: "Light",
      dark: "Dark",
      midnight: "Midnight"
    }
  };

  const tr = (key) => (UI[lang] || UI.id)[key];

  let lang = pref.get("lang", "id");
  let themeMode = pref.get("theme", null);

  /* ---------------- helpers ---------------- */
  function setText(sel, val) {
    const html = safeHtml(val);
    $$(`[data-edit="${sel}"]`).forEach((el) => {
      if (el.innerHTML !== html) el.innerHTML = html;
    });
  }

  const setHTML = (el, html) => {
    if (el && el.innerHTML !== html) el.innerHTML = html;
  };

  function setImg(sel, val) {
    $$(`[data-edit-img="${sel}"]`).forEach((el) => {
      if (val) {
        if (el.getAttribute("src") !== val) el.src = val;
      } else {
        el.removeAttribute("src");
      }
    });
  }

  const socialLink = (s) => {
    const external = s.url && !s.url.startsWith("mailto:") && !s.url.startsWith("#");
    return `<a href="${esc(s.url || "#")}" ${external ? 'target="_blank" rel="noopener"' : ""}
      title="${esc(s.label)}" aria-label="${esc(s.label)}">${icon(s.icon)}</a>`;
  };

  /* ---------------- content ---------------- */
  function applyContent() {
    const d = data;

    const map = {
      "profile.firstName": d.profile.firstName,
      "profile.lastName": d.profile.lastName,
      "profile.kanji": d.profile.kanji,
      "nav.profile": d.nav.profile,
      "nav.activity": d.nav.activity,
      "nav.certificate": d.nav.certificate,
      "nav.quote": d.nav.quote,
      "nav.gallery": d.nav.gallery,
      "nav.contact": d.nav.contact,
      "nav.manage": d.nav.manage,
      "intro.kanji": d.intro.kanji,
      "intro.name": d.intro.name,
      "intro.year": d.intro.year,
      "intro.skipLabel": d.intro.skipLabel,
      "hero.kicker": d.hero.kicker,
      "hero.kickerText": d.hero.kickerText,
      "hero.greeting": d.hero.greeting,
      "hero.dateText": d.hero.dateText,
      "hero.projectBy": d.hero.projectBy,
      "hero.quoteLabel": d.hero.quoteLabel,
      "hero.quoteText": d.hero.quoteText,
      "hero.quoteBy": d.hero.quoteBy,
      "hero.scrollLabel": d.hero.scrollLabel,
      "about.sectionLabel": d.about.sectionLabel,
      "about.heading": d.about.heading,
      "about.scriptName": d.about.scriptName,
      "about.captionLeft": d.about.captionLeft,
      "about.captionRight": d.about.captionRight,
      "bio.sectionLabel": d.bio.sectionLabel,
      "bio.title": d.bio.title,
      "bio.quote": d.bio.quote,
      "bio.educationTitle": d.bio.educationTitle,
      "stage.sectionLabel": d.stage.sectionLabel,
      "stage.heading": d.stage.heading,
      "stage.script": d.stage.script,
      "stage.sub": d.stage.sub,
      "projects.label": d.projects.label,
      "projects.heading": d.projects.heading,
      "projects.script": d.projects.script,
      "projects.sub": d.projects.sub,
      "projects.note": d.projects.note,
      "certificate.sectionLabel": d.certificate.sectionLabel,
      "certificate.heading": d.certificate.heading,
      "certificate.script": d.certificate.script,
      "certificate.sub": d.certificate.sub,
      "certificate.note": d.certificate.note,
      "skills.sectionLabel": d.skills.sectionLabel,
      "skills.heading": d.skills.heading,
      "skills.script": d.skills.script,
      "skills.sub": d.skills.sub,
      "skills.note": d.skills.note,
      "skills.githubTitle": d.skills.githubTitle,
      "skills.githubNote": d.skills.githubNote,
      "quote.sectionLabel": d.quote.sectionLabel,
      "quote.text": d.quote.text,
      "quote.by": d.quote.by,
      "gallery.sectionLabel": d.gallery.sectionLabel,
      "gallery.heading": d.gallery.heading,
      "gallery.script": d.gallery.script,
      "gallery.hint": d.gallery.hint,
      "gallery.note": d.gallery.note,
      "contact.sectionLabel": d.contact.sectionLabel,
      "contact.heading": d.contact.heading,
      "contact.script": d.contact.script,
      "footer.projectBy": d.footer.projectBy,
      "footer.date": d.footer.date,
      "footer.backTop": d.footer.backTop,
      "footer.wordmark": d.footer.wordmark,
      "footer.visitsLabel": d.footer.visitsLabel
    };
    Object.entries(map).forEach(([k, v]) => setText(k, v ?? ""));

    renderWordmark();

    setImg("profile.portrait", d.profile.portrait);
    setImg("about.portrait", d.about.portrait || d.profile.portrait);
    $("#aboutPortrait")?.parentElement?.classList.toggle("is-cutout", !!d.about.portraitCutout);

    $("#heroSignature").textContent = d.profile.lastName || "";
    const heroImg = $("#heroPortrait");
    if (heroImg) heroImg.dataset.cutout = d.profile.portraitCutout ? "true" : "false";
    const heroFig = $(".hero__figure");
    if (heroFig) heroFig.dataset.cutout = d.profile.portraitCutout ? "true" : "false";

    document.title = `${d.profile.signature || "Portfolio"} — ${d.profile.role || "Portfolio"}`;

    // the giant name: first name letters spread across the full width
    const nameEl = $(".hero__name");
    if (nameEl) {
      const letters = (d.profile.firstName || "DIMAS").toUpperCase().split("");
      setHTML(nameEl, letters.map((c) => `<span aria-hidden="true">${esc(c)}</span>`).join(""));
    }

    // resume
    const resume = $("#resumeLink");
    if (d.profile.resumeUrl) {
      resume.href = d.profile.resumeUrl;
      resume.hidden = false;
      if (!/^https?:/.test(d.profile.resumeUrl)) resume.setAttribute("download", "");
    } else {
      resume.hidden = true;
    }
  }

  /* ---------------- marquee (loops seamlessly) ---------------- */
  let marqueeObserver = null;

  function renderMarquee() {
    const items = (data.marquee || []).filter(Boolean);
    const track = $("#marqueeTrack");
    if (!track) return;

    const row = items
      .map((t) => `<span class="marquee__item">${esc(t)}</span><span class="marquee__dot" aria-hidden="true"></span>`)
      .join("");

    // One row must always be wider than the viewport so translating by
    // -100% of its own width can never expose a gap.
    const copies = row ? Math.max(2, Math.ceil((window.innerWidth * 1.4) / 320)) : 0;
    const rows = Array.from({ length: copies }, () => `<div class="marquee__row">${row}</div>`).join("");
    setHTML($("#marqueeTrack"), row ? rows : row);

    // keep a constant speed (px/s) no matter how many copies
    observeMarqueeSpeed();
  }

  function observeMarqueeSpeed() {
    const rowEl = $(".marquee__row");
    if (!rowEl) return;
    const apply = () => {
      const width = rowEl.scrollWidth || rowEl.getBoundingClientRect().width;
      if (!width) return;
      const seconds = Math.max(12, width / 46);
      $$(".marquee__row").forEach((r) => (r.style.animationDuration = seconds + "s"));
    };
    apply();
    if (marqueeObserver) marqueeObserver.disconnect();
    marqueeObserver = new ResizeObserver(apply);
    marqueeObserver.observe(rowEl);
  }

  /* ---------------- about ---------------- */
  function renderAbout() {
    const a = data.about;
    setHTML($("#aboutText"), (a.paragraphs || []).map((p) => `<p>${esc(p)}</p>`).join(""));
    setHTML(
      $("#aboutFacts"),
      (a.facts || [])
        .map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`)
        .join("")
    );
  }

  /* ---------------- biography ---------------- */
  function renderBio() {
    const b = data.bio || {};
    const story = (b.biografi || "").trim();
    setHTML(
      $("#bioStory"),
      story ? story.split(/\n{2,}/).map((p) => `<p>${esc(p)}</p>`).join("") : ""
    );

    setHTML(
      $("#bioList"),
      (b.items || [])
        .map(
          (x) => `<div class="bio__row">
            <dt>${esc(x.label)}</dt>
            <dd>${esc(x.value)}</dd>
            <dd class="bio__note">${esc(x.note || "")}</dd>
          </div>`
        )
        .join("")
    );

    setHTML(
      $("#eduList"),
      (b.education || [])
        .map(
          (e) => `<li class="edu__row">
            <span class="edu__period">${esc(e.period || "")}</span>
            <span class="edu__school">${esc(e.school || "")}</span>
            <span class="edu__note">${esc(e.note || "")}</span>
          </li>`
        )
        .join("")
    );
  }

  /* ---------------- stage accordion ---------------- */
  function renderStage() {
    const items = data.stage.items || [];
    setHTML(
      $("#stageList"),
      items
        .map(
          (s, i) => `<details class="acc" ${i === 0 ? "open" : ""}>
            <summary class="acc__head">
              <span class="acc__no">${esc(s.no || `(0${i + 1})`)}</span>
              <span class="acc__title">${esc(s.title)}</span>
              <span class="acc__desc">${esc(s.desc)}</span>
              <span class="acc__icon" aria-hidden="true">${icon("chevron")}</span>
            </summary>
            <div class="acc__body">
              <div class="acc__bodytext">
                <p>${esc(s.detail || s.desc)}</p>
                <div class="acc__tags">
                  ${s.meta ? `<span class="acc__tag">${esc(s.meta)}</span>` : ""}
                  ${s.year ? `<span class="acc__tag">${esc(s.year)}</span>` : ""}
                </div>
              </div>
              ${s.image ? `<figure class="acc__img"><img src="${esc(s.image)}" alt="${esc(s.title)}" loading="lazy" /></figure>` : ""}
            </div>
          </details>`
        )
        .join("")
    );

    // only one open at a time
    $$(".acc", $("#stageList")).forEach((acc) => {
      acc.addEventListener("toggle", () => {
        if (!acc.open) return;
        $$(".acc", $("#stageList")).forEach((o) => {
          if (o !== acc) o.open = false;
        });
      });
    });
  }

  /* ---------------- projects ---------------- */
  let projectItems = [];
  let pdIndex = 0;

  function renderProjects() {
    const p = data.projects || {};
    const items = (p.items || []).filter(Boolean);
    projectItems = items;
    const host = $("#projectList");
    if (!host) return;

    if (!items.length) {
      const section = $("#projects");
      section?.classList.add("is-empty");
      setHTML(
        host,
        `<div class="projects__empty">
          <span class="mono">${esc(p.emptyTitle || tr("projectEmptyTitle"))}</span>
          <p>${esc(p.emptyNote || tr("projectEmptyNote"))}</p>
        </div>`
      );
      return;
    }

    $("#projects")?.classList.remove("is-empty");

    setHTML(
      host,
      items
        .map((it, i) => {
          const docs = (it.docs || []).filter(Boolean);
          return `<button type="button" class="project" data-project="${i}" aria-label="Buka detail ${esc(it.title || "project")}">
            <span class="project__media">
              ${it.role || it.year ? `<span class="project__badge">${esc(it.role || it.year)}</span>` : ""}
              ${it.cover ? `<img src="${esc(it.cover)}" alt="${esc(it.title || "Project")}" loading="lazy" />` : `<span class="project__blank">Belum ada gambar</span>`}
            </span>
            <span class="project__body">
              <span class="mono">${esc(it.no || `NO. 0${i + 1}`)}${docs.length ? ` · ${esc(tr("projectPhotos")(docs.length))}` : ""}</span>
              <span class="project__title">${esc(it.title || "Project")}</span>
              <span class="project__desc">${esc(it.desc || "")}</span>
              <span class="project__foot">
                <span>${esc(it.year || "")}</span>
                <span class="project__open">${esc(tr("projectOpen"))} ${icon("arrowUpRight")}</span>
              </span>
            </span>
          </button>`;
        })
        .join("")
    );

    $$("[data-project]", host).forEach((btn) =>
      btn.addEventListener("click", () => openProject(Number(btn.dataset.project)))
    );
  }

  function openProject(i) {
    const it = projectItems[i];
    if (!it) return;
    pdIndex = i;

    const cover = $("#pdCover");
    const docs = (it.docs || []).filter(Boolean);

    setHTML(
      cover,
      it.cover
        ? `<img src="${esc(it.cover)}" alt="${esc(it.title || "Project")}" />`
        : `<div class="project__blank">Belum ada gambar</div>`
    );

    $("#pdNo").textContent = it.no || `NO. 0${i + 1}`;
    $("#pdTitle").textContent = it.title || "Project";
    $("#pdDesc").textContent = it.desc || "";
    $("#pdDetail").textContent = it.detail || "";

    setHTML(
      $("#pdMeta"),
      [
        it.role ? [tr("projectRole"), it.role] : null,
        it.year ? [tr("projectYear"), it.year] : null,
        docs.length ? [tr("projectDocs"), tr("projectPhotos")(docs.length)] : null
      ]
        .filter(Boolean)
        .map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`)
        .join("")
    );

    const link = $("#pdLink");
    if (link) {
      if (it.link) {
        link.href = it.link;
        link.hidden = false;
      } else {
        link.hidden = true;
      }
    }

    const docsLabel = $("#pdDocsLabel");
    if (docsLabel) docsLabel.textContent = tr("projectDocs");

    const docsBox = $("#pdDocs");
    if (docsBox) {
      docsBox.hidden = docs.length === 0;
      setHTML(
        $("#pdDocGrid"),
        docs
          .map(
            (d, n) =>
              `<button type="button" class="pdetail__doc" data-doc="${n}"><img src="${esc(d)}" alt="${esc(tr("projectDocs"))} ${n + 1}" loading="lazy" /></button>`
          )
          .join("")
      );
      $$("[data-doc]", docsBox).forEach((el) =>
        el.addEventListener("click", () => {
          const source = docs.map((d) => ({ image: d, title: it.title, meta: tr("projectDocs") }));
          openLightbox(Number(el.dataset.doc), source);
        })
      );
    }

    const panel = $("#projectDetail");
    panel.hidden = false;
    document.body.classList.add("is-locked");
    $("#pdScroll").scrollTop = 0;
    $("#pdClose").focus();
  }

  function closeProject() {
    const panel = $("#projectDetail");
    if (!panel || panel.hidden) return;
    panel.hidden = true;
    document.body.classList.remove("is-locked");
  }

  /* ---------------- certificates ---------------- */
  let certItems = [];

  function renderCertificates() {
    const c = data.certificate || {};
    const items = c.items || [];
    certItems = items;
    const host = $("#certificateList");
    if (!host) return;

    const section = $("#certificate");
    section?.classList.toggle("is-empty", items.length === 0);

    if (!items.length) {
      setHTML(
        host,
        `<div class="certs__empty">
          <span class="mono">${esc(tr("certEmptyTitle"))}</span>
          <p>${esc(tr("certEmptyNote"))}</p>
        </div>`
      );
      $(".certs__note")?.classList.add("is-hidden");
      return;
    }

    $(".certs__note")?.classList.toggle("is-hidden", true);

    setHTML(
      host,
      items
        .map(
          (x, i) => `<button class="cert reveal-soft" type="button" data-cert="${i}" aria-label="Buka ${esc(x.title || "sertifikat")}">
            <div class="cert__media">
              ${x.image
                ? `<img src="${esc(x.image)}" alt="${esc(x.title || "")}" loading="lazy" />`
                : `<div class="cert__blank"><span>${esc(x.no || `NO. 0${i + 1}`)}</span><span>${esc(x.title || "Sertifikat")}</span></div>`}
            </div>
            <div class="cert__body">
              ${x.no ? `<span class="cert__issuer">${esc(x.no)}</span>` : ""}
              <strong class="cert__title">${esc(x.title || "")}</strong>
              ${x.issuer ? `<span class="cert__issuer">${esc(x.issuer)}</span>` : ""}
              ${x.desc ? `<p class="cert__note">${esc(x.desc)}</p>` : ""}
              <div class="cert__foot">
                <span>${esc(x.year || "")}</span>
                <span class="cert__open">${esc(c.hint || "Buka")}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M7 17 17 7M8 7h9v9"/></svg>
                </span>
              </div>
            </div>
          </button>`
        )
        .join("")
    );

    $$(".cert", host).forEach((el) =>
      el.addEventListener("click", () => openCert(+el.dataset.cert))
    );
  }

  function openCert(i) {
    const item = certItems[i];
    if (!item) return;
    if (item.image) {
      // reuse the gallery lightbox for certificate scans
      const source = certItems.map((x, n) => ({
        image: x.image,
        title: x.title,
        meta: x.issuer || x.no || "",
        no: x.no || `NO. 0${n + 1}`
      }));
      openLightbox(i, source);
    } else {
      toast(item.desc || item.title || tr("noCert"));
    }
  }

  /* ---------------- skills ---------------- */
  function renderSkills() {
    const s = data.skills || {};
    const items = s.items || [];
    setHTML(
      $("#skillsList"),
      items
        .map(
          (x, i) => `<article class="skill reveal-soft" style="--level:${Math.max(0, Math.min(100, Number(x.level) || 0))}%">
            <span class="skill__ico" aria-hidden="true">${icon(x.icon || "spark")}</span>
            <div class="skill__body">
              <div class="skill__top">
                <strong class="skill__name">${esc(x.name || "")}</strong>
                <span class="skill__pct">${Number(x.level) ? Math.round(Number(x.level)) + "%" : ""}</span>
              </div>
              ${x.note ? `<p class="skill__note">${esc(x.note)}</p>` : ""}
              <span class="skill__bar" aria-hidden="true"><i></i></span>
            </div>
          </article>`
        )
        .join("")
    );
  }

  /* ---------------- github integration ---------------- */
  async function renderGithub() {
    const g = data.github || {};
    const block = $("#githubBlock");
    if (!block) return;

    if (!g.enabled || !g.user) {
      block.hidden = true;
      return;
    }

    block.hidden = false;
    const link = $("#githubLink");
    link.href = `https://github.com/${g.user}`;
    $("[data-gh-user]", link).textContent = `@${g.user}`;

    const state = $("#githubState");
    state.textContent = tr("githubLoading");

    try {
      const res = await fetch(`/api/github/${encodeURIComponent(g.user)}`);
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "failed");

      const repos = json.repos || [];
      setHTML(
        $("#githubRepos"),
        repos.length
          ? repos
              .map(
                (r) => `<a class="gh__repo reveal-soft" href="${esc(r.url)}" target="_blank" rel="noopener">
                  <strong>${esc(r.name)}</strong>
                  ${r.description ? `<p>${esc(r.description)}</p>` : ""}
                  <span>
                    <em>${esc(r.language || "—")}</em>
                    <em>★ ${Number(r.stars) || 0}</em>
                  </span>
                </a>`
              )
              .join("")
          : `<p class="gh__state mono">${esc(tr("githubEmpty"))}</p>`
      );
      state.textContent = `${json.publicRepos ?? 0} repositori publik · ${json.followers ?? 0} pengikut`;
    } catch (err) {
      state.textContent = tr("githubError");
    }
  }

  /* ---------------- gallery + lightbox ---------------- */
  function renderGallery() {
    const items = data.gallery.items || [];
    const strip = $("#galleryStrip");
    strip.classList.toggle("is-empty", items.length === 0);
    $("#gallery")?.classList.toggle("is-empty", items.length === 0);
    $("#gallery")?.querySelector(".gallery__note")?.classList.toggle("is-hidden", items.length > 0);
    if (!items.length) {
      setHTML(
        strip,
        `<div class="gallery__empty">
          <span class="mono">${esc(tr("galleryEmptyTitle"))}</span>
          <p>${esc(tr("galleryEmptyNote"))}</p>
        </div>`
      );
      return;
    }
    setHTML(
      $("#galleryStrip"),
      items
        .map(
          (g, i) => `<figure class="shot" data-shot="${i}" tabindex="0" role="button"
            aria-label="Buka ${esc(g.title || g.meta || "potret")}">
            <div class="shot__media">
              ${g.image
                ? `<img src="${esc(g.image)}" alt="${esc(g.title || g.meta || "")}" loading="lazy" />`
                : `<div class="shot__blank"><span>${esc(g.title || "ディマス")}</span></div>`}
            </div>
            <figcaption class="shot__cap">
              <span>${esc(g.no || `NO. 0${i + 1}`)}</span>
              <span>${esc(g.meta || g.title || "")}</span>
            </figcaption>
          </figure>`
        )
        .join("")
    );

    $$(".shot").forEach((fig) => {
      fig.addEventListener("click", () => openLightbox(+fig.dataset.shot));
      fig.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openLightbox(+fig.dataset.shot);
        }
      });
    });
  }

  function lightboxItems() {
    return (lbSource || data.gallery.items || []).filter((g) => g.image);
  }

  let lbSource = null;

  function openLightbox(i, source) {
    lbSource = source || null;
    const all = lbSource || data.gallery.items || [];
    const item = all[i];
    if (!item || !item.image) return toast(tr("noPhoto"));
    lbIndex = i;
    paintLightbox();
    $("#lightbox").hidden = false;
    document.body.classList.add("is-locked");
    $("#lbClose").focus();
  }

  function paintLightbox() {
    const all = lbSource || data.gallery.items || [];
    const item = all[lbIndex];
    if (!item) return;
    $("#lbImg").src = item.image;
    $("#lbImg").alt = item.title || item.meta || "";
    $("#lbCap").textContent = [item.meta, item.title].filter(Boolean).join(" — ");
    const withImg = all.filter((g) => g.image);
    const pos = withImg.findIndex((g) => g === item);
    $("#lbCount").textContent = `${String(pos + 1).padStart(2, "0")} / ${String(withImg.length).padStart(2, "0")}`;
  }

  function stepLightbox(dir) {
    const all = lbSource || data.gallery.items || [];
    let i = lbIndex;
    for (let n = 0; n < all.length; n++) {
      i = (i + dir + all.length) % all.length;
      if (all[i].image) break;
    }
    lbIndex = i;
    paintLightbox();
  }

  function closeLightbox() {
    $("#lightbox").hidden = true;
    document.body.classList.remove("is-locked");
    lbSource = null;
  }

  /* ---------------- socials ---------------- */
  function renderSocials() {
    const list = data.contact.socials || [];
    $("#contactSocials").classList.toggle("is-empty", list.length === 0);
    setHTML(
      $("#contactSocials"),
      list
        .map((s) => {
          const external = s.url && !s.url.startsWith("mailto:") && !s.url.startsWith("#");
          return `<a href="${esc(s.url || "#")}" ${external ? 'target="_blank" rel="noopener"' : ""}>
            <span>${esc(s.label)}</span>
            <span class="socials__go" aria-hidden="true">${icon("arrowUpRight")}</span>
          </a>`;
        })
        .join("")
    );
  }

  /* ---------------- theme ---------------- */
  const THEME_ICONS = {
    light: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4L17 7M7 17l-1.6 1.6"/></svg>',
    dark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 14.4A8.4 8.4 0 0 1 9.6 4a6.6 6.6 0 0 0 10.4 10.4Z"/></svg>',
    midnight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M19 15.4A7.8 7.8 0 0 1 8.6 5 6.2 6.2 0 0 0 19 15.4Z"/><path d="M17 4.2l.8 1.6M20.4 7l-1.5.6M16.2 8.6l.5 1.5"/></svg>'
  };

  function resolvedTheme() {
    const configured = (data?.theme?.mode || "light").toLowerCase();
    const fallback = THEMES.includes(configured) ? configured : "light";
    return THEMES.includes(themeMode) ? themeMode : fallback;
  }

  function applyTheme(animate = false, origin) {
    const t = data?.theme || {};
    const mode = resolvedTheme();

    if (animate) {
      const wave = document.createElement("div");
      wave.className = "theme-wave";
      if (origin) {
        wave.style.setProperty("--wx", origin.x + "px");
        wave.style.setProperty("--wy", origin.y + "px");
      }
      document.body.appendChild(wave);
      setTimeout(() => wave.remove(), 900);
    }

    document.documentElement.dataset.mode = mode;
    if (t.accent) document.documentElement.style.setProperty("--accent", t.accent);

    const color = { light: "#F7F6F2", dark: "#141412", midnight: "#0c1020" }[mode] || "#F7F6F2";
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", color);

    const ico = $("[data-theme-icon]");
    if (ico) setHTML(ico, THEME_ICONS[mode] || THEME_ICONS.light);

    $$("[data-theme-name]").forEach((el) => (el.textContent = tr(mode)));
    const btn = $("#themeToggle");
    if (btn) btn.setAttribute("aria-pressed", String(mode !== "light"));
  }

  function cycleTheme(origin) {
    const order = ["light", "dark", "midnight"];
    const next = order[(order.indexOf(resolvedTheme()) + 1) % order.length];
    themeMode = next;
    pref.set("theme", next);
    applyTheme(true, origin);
    const btn = $("#themeToggle");
    if (btn) {
      btn.classList.remove("is-pulse");
      requestAnimationFrame(() => btn.classList.add("is-pulse"));
    }
    toast(tr("themeToast")(tr(next)));
  }

  /* ---------------- language ---------------- */
  function applyLangLabel() {
    const label = lang === "id" ? "ID" : "EN";
    $("#langLabel") && ($("#langLabel").textContent = label);
    $$("[data-lang-name]").forEach((el) => (el.textContent = lang === "id" ? "Indonesia" : "English"));
    document.documentElement.lang = lang;
    const btn = $("#langToggle");
    if (btn) btn.setAttribute("aria-label", lang === "id" ? "Ganti ke bahasa Inggris" : "Switch to Indonesian");
  }

  async function loadLocale(next) {
    lang = next;
    applyLangLabel();
    pref.set("lang", next);

    if (next === "id" || !base) {
      data = base;
    } else {
      try {
        const res = await fetch(`/api/content/translated?locale=${next}`);
        data = res.ok ? await res.json() : base;
      } catch {
        data = base;
      }
    }

    renderAll();
    initReveal(true);
    recalcContactScroll();
    initVisits();
  }

  function toggleLang() {
    loadLocale(lang === "id" ? "en" : "id");
  }

  /* ---------------- giant footer wordmark ---------------- */
  function renderWordmark() {
    const box = $(".wordmark");
    const track = $("#footerWordmarkTrack");
    if (!box || !track) return;

    const text = data?.footer?.wordmark || "";
    box.classList.remove("is-moving");
    setHTML(track, `<div class="wordmark__row"><span>${esc(text)}</span></div>`);

    const row = track.querySelector(".wordmark__row");
    if (!row) return;

    // fit to the viewport when it's short enough, otherwise scroll it
    const needsScroll = row.scrollWidth > box.clientWidth + 2;
    if (!needsScroll) return;

    const copies = Math.max(2, Math.ceil((box.clientWidth + 160) / Math.max(row.scrollWidth, 1)) + 1);
    const inner = row.innerHTML;
    setHTML(
      track,
      Array.from({ length: copies }, () => `<div class="wordmark__row">${inner}</div>`).join("")
    );

    const seconds = Math.max(16, row.scrollWidth / 70);
    $$(".wordmark__row", track).forEach((r) => (r.style.animationDuration = seconds + "s"));
    box.classList.add("is-moving");
  }

  /* ---------------- contact meta scroll ---------------- */
  function recalcContactScroll() {
    const box = $("#contactScroll");
    const track = $("#contactScrollTrack");
    if (!box || !track) return;

    // always render one pristine row first, then decide whether it overflows
    const template = data?.footer?.projectBy || "";
    box.classList.remove("is-moving");
    setHTML(track, `<div class="contact__scrollrow"><span>${safeHtml(template)}</span></div>`);

    const row = track.querySelector(".contact__scrollrow");
    if (!row) return;

    const needsScroll = row.scrollWidth > box.clientWidth + 2;
    if (!needsScroll) return;

    // duplicate the row enough times so translating one row width never
    // exposes an empty area, and the loop is seamless.
    const copies = Math.max(2, Math.ceil((box.clientWidth + 80) / Math.max(row.scrollWidth, 1)) + 1);
    const inner = row.innerHTML;
    setHTML(
      track,
      Array.from({ length: copies }, () => `<div class="contact__scrollrow">${inner}</div>`).join("")
    );

    const seconds = Math.max(10, row.scrollWidth / 42);
    $$(".contact__scrollrow", track).forEach((r) => (r.style.animationDuration = seconds + "s"));
    box.classList.add("is-moving");
  }

  /* ---------------- visitor counter ---------------- */
  async function initVisits() {
    const el = $("#visitCount");
    if (!el) return;
    try {
      let token = pref.get("visitor", "");
      if (!token) {
        token = uid() + Date.now().toString(36);
        pref.set("visitor", token);
      }
      const res = await fetch("/api/visit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token })
      });
      const json = await res.json();
      if (json.count != null) {
        el.textContent = Number(json.count).toLocaleString(lang === "id" ? "id-ID" : "en-US");
      }
    } catch {
      el.textContent = "—";
    }
  }

  /* ---------------- render ---------------- */
  function renderAll() {
    applyContent();
    renderMarquee();
    renderAbout();
    renderBio();
    renderStage();
    renderProjects();
    renderCertificates();
    renderGallery();
    renderSkills();
    renderSocials();
    applyTheme();
    renderGithub();
    applyLangLabel();
  }

  /* ---------------- intro ---------------- */
  function initIntro() {
    const intro = $("#intro");
    if (!intro) return;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      intro.classList.add("is-done");
      setTimeout(() => intro.remove(), 1100);
    };
    $("#introSkip").addEventListener("click", finish);
    intro.addEventListener("click", (e) => {
      if (e.target === intro) finish();
    });
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTimeout(finish, reduced ? 300 : 2400);
    document.addEventListener("keydown", (e) => {
      if (["Escape", "Enter", " "].includes(e.key)) finish();
    }, { once: true });
  }

  /* ---------------- interactions ---------------- */
  function initInteractions() {
    const nav = $("#nav");
    const drawer = $("#drawer");
    const burger = $("#burger");

    const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const closeDrawer = () => {
      drawer.classList.remove("is-open");
      drawer.setAttribute("aria-hidden", "true");
      burger.setAttribute("aria-expanded", "false");
      document.body.classList.remove("is-locked");
    };

    burger.addEventListener("click", () => {
      const open = !drawer.classList.contains("is-open");
      drawer.classList.toggle("is-open", open);
      drawer.setAttribute("aria-hidden", String(!open));
      burger.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("is-locked", open);
    });

    $$("#drawer a").forEach((a) => a.addEventListener("click", closeDrawer));

    // lightbox controls
    $("#lbClose").addEventListener("click", closeLightbox);
    $("#lbPrev").addEventListener("click", () => stepLightbox(-1));
    $("#lbNext").addEventListener("click", () => stepLightbox(1));
    $$("[data-close-lb]").forEach((el) => el.addEventListener("click", closeLightbox));

    // project detail panel
    $("#pdClose")?.addEventListener("click", closeProject);
    $$("[data-close-pd]").forEach((el) => el.addEventListener("click", closeProject));

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (!$("#lightbox").hidden) closeLightbox();
        else closeProject();
        closeDrawer();
      }
      if (!$("#lightbox").hidden) {
        if (e.key === "ArrowLeft") stepLightbox(-1);
        if (e.key === "ArrowRight") stepLightbox(1);
      }
      if ($("#projectDetail") && !$("#projectDetail").hidden) {
        if (e.key === "ArrowLeft" && pdIndex > 0) openProject(pdIndex - 1);
        if (e.key === "ArrowRight" && pdIndex < projectItems.length - 1) openProject(pdIndex + 1);
      }
    });

    // smooth in-page scroll with nav offset
    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (!id || id.length < 2) return;
        const el = document.querySelector(id);
        if (!el) return;
        e.preventDefault();
        const top = el.getBoundingClientRect().top + window.scrollY - 64;
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      });
    });

    // theme + language toggles
    $("#themeToggle")?.addEventListener("click", (e) => {
      const r = e.currentTarget.getBoundingClientRect();
      cycleTheme({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    });
    $("#themeToggleDrawer")?.addEventListener("click", (e) => cycleTheme(null));
    $("#langToggle")?.addEventListener("click", toggleLang);
    $("#langToggleDrawer")?.addEventListener("click", toggleLang);

    // active nav item
    const sections = ["profile", "stage", "certificate", "gallery", "contact"]
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if ("IntersectionObserver" in window && sections.length) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (!en.isIntersecting) return;
            $$(".nav__links a").forEach((a) =>
              a.classList.toggle("is-active", a.dataset.nav === en.target.id)
            );
          });
        },
        { rootMargin: "-45% 0px -50% 0px" }
      );
      sections.forEach((s) => io.observe(s));
    }

    // reveal on scroll (soft, for the new sections too)
    initReveal();

    // image fade-in
    $$("img[loading='lazy']").forEach((img) => {
      if (img.complete) return;
      img.style.opacity = "0";
      img.style.transition = "opacity .8s var(--ease-out)";
      img.addEventListener("load", () => (img.style.opacity = "1"), { once: true });
    });

    // contact meta + marquee follow the viewport
    window.addEventListener("resize", () => {
      recalcContactScroll();
      renderMarquee();
      renderWordmark();
    });
    recalcContactScroll();

    // subtle scroll progress line under the nav
    const progress = $("#scrollProgress");
    if (progress) {
      const paint = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
        progress.style.setProperty("--p", (p * 100).toFixed(2) + "%");
      };
      window.addEventListener("scroll", paint, { passive: true });
      paint();
    }
  }

  let revealObserver = null;

  function initReveal() {
    if (!("IntersectionObserver" in window)) return;

    if (revealObserver) revealObserver.disconnect();

    revealObserver = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-in");
            revealObserver.unobserve(en.target);
          }
        }),
      { threshold: 0.14 }
    );

    const soft = [".cert", ".skill", ".gh__repo", ".bio__story", ".edu", ".certs", ".skills", ".contact__foot"];
    $$(soft.join(",")).forEach((el) => {
      el.classList.add("reveal-soft");
      revealObserver.observe(el);
    });

    $$(".quote, .sec-head, .bio, .accordion, .profile").forEach((el) => {
      el.classList.add("reveal");
      revealObserver.observe(el);
    });

    // Safety net: anything the observer misses (fast scroll, full-page
    // capture, print) must never stay invisible.
    setTimeout(() => {
      $$(".reveal-soft:not(.is-in), .reveal:not(.is-in)").forEach((el) => el.classList.add("is-in"));
    }, 2600);
  }

  /* ---------------- boot ---------------- */
  async function boot() {
    initIntro();
    try {
      base = await API.load();
    } catch (err) {
      console.warn("Gagal memuat konten:", err);
      base = clone(DEFAULT_DATA);
      toast("Gagal memuat dari server — menampilkan konten bawaan");
    }

    data = base;

    // a saved theme choice from the visitor wins over the admin default
    if (!THEMES.includes(themeMode)) themeMode = null;

    applyLangLabel();
    renderAll();
    initInteractions();
    initVisits();

    if (lang !== "id") await loadLocale(lang);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();

  return { get data() { return data; }, renderAll };
})();
