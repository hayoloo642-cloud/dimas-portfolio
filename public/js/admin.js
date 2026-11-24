/* ============================================================
   ADMIN — server-backed content editor
   ============================================================ */

const Admin = (() => {
  let draft = null;          // working copy
  let savedSnapshot = "";    // last persisted JSON
  let saving = false;
  let saveTimer = null;
  let activeTab = "identity";

  const FIELDS = {}; // path -> input element (for live refresh)

  /* ---------------- path helpers ---------------- */
  const getPath = (path) =>
    path.split(".").reduce((o, k) => (o == null ? o : o[k]), draft);

  function setPath(path, value) {
    const parts = path.split(".");
    let o = draft;
    for (let i = 0; i < parts.length - 1; i++) {
      const k = parts[i];
      if (o[k] == null) o[k] = /^\d+$/.test(parts[i + 1]) ? [] : {};
      o = o[k];
    }
    o[parts.at(-1)] = value;
  }

  /* ---------------- markup helpers ---------------- */
  const field = (label, path, opts = {}) => {
    const {
      type = "text",
      help = "",
      placeholder = "",
      min,
      max,
      step = 1,
      rows = 3,
      span = 1
    } = opts;
    const id = "f_" + path.replace(/[^\w]/g, "_");
    const value = getPath(path);
    let control = "";

    if (type === "textarea") {
      control = `<textarea id="${id}" rows="${rows}" data-path="${path}" data-type="textarea"
        placeholder="${esc(placeholder)}">${esc(value ?? "")}</textarea>`;
    } else if (type === "number") {
      control = `<input id="${id}" type="number" data-path="${path}" data-type="number"
        value="${esc(value ?? "")}" ${min !== undefined ? `min="${min}"` : ""} ${max !== undefined ? `max="${max}"` : ""} step="${step}" />`;
    } else if (type === "color") {
      control = `<div class="colorrow"><input id="${id}" type="color" data-path="${path}" data-type="color" value="${esc(value || "#b3543b")}" />
        <code class="mono">${esc(value || "")}</code></div>`;
    } else if (type === "check") {
      return `<label class="field field--check span-${span}" for="${id}">
        <input id="${id}" type="checkbox" data-path="${path}" data-type="check" ${value ? "checked" : ""} />
        <span><strong>${esc(label)}</strong>${help ? `<em>${help}</em>` : ""}</span></label>`;
    } else if (type === "tags") {
      control = `<input id="${id}" type="text" data-path="${path}" data-type="tags"
        value="${esc((value || []).join(", "))}" placeholder="pisahkan dengan koma" />`;
    } else if (type === "select") {
      control = `<select id="${id}" data-path="${path}" data-type="select">${(opts.options || [])
        .map((o) => `<option value="${esc(o)}" ${o === value ? "selected" : ""}>${esc(o)}</option>`)
        .join("")}</select>`;
    } else {
      control = `<input id="${id}" type="text" data-path="${path}" data-type="text"
        value="${esc(value ?? "")}" placeholder="${esc(placeholder)}" />`;
    }

    return `<div class="field span-${span}">
      <label for="${id}">${esc(label)}</label>
      ${control}
      ${help ? `<span class="help">${help}</span>` : ""}
    </div>`;
  };

  /* image picker */
  const imageField = (label, path, opts = {}) => {
    const value = getPath(path);
    const cutoutPath = opts.cutoutPath;
    const cutout = cutoutPath ? !!getPath(cutoutPath) : false;
    const id = "img_" + path.replace(/[^\w]/g, "_");
    return `<div class="field span-2 imagefield" id="${id}" data-image="${path}">
      <label>${esc(label)}</label>
      <div class="imagefield__row">
        <div class="imagefield__preview ${cutout ? "is-cutout" : ""}">
          ${value ? `<img src="${esc(value)}" alt="preview" />` : `<span class="mono">belum ada gambar</span>`}
        </div>
        <div class="imagefield__side">
          <div class="imagefield__btns">
            <button type="button" class="btn btn--solid btn--tiny" data-pick="${path}">${icon("upload")} Upload</button>
            <button type="button" class="btn btn--outline btn--tiny" data-cut="${path}">${icon("magic")} Hapus BG</button>
          </div>
          <div class="imagefield__btns">
            <button type="button" class="btn btn--ghost btn--tiny" data-url="${path}">Pakai URL</button>
            <button type="button" class="btn btn--ghost btn--tiny" data-clear="${path}">Hapus</button>
          </div>
          ${cutoutPath
            ? `<label class="checkline"><input type="checkbox" data-path="${cutoutPath}" data-type="check" ${cutout ? "checked" : ""} /> Tampilkan sebagai cut-out transparan</label>`
            : ""}
          <span class="help">Upload otomatis dikompres ke WEBP. <strong>Hapus BG</strong> memotong background lewat AI di browser.</span>
        </div>
      </div>
      <input type="file" accept="image/*" data-file="${path}" hidden />
    </div>`;
  };

  /* list of images (documentation photos) */
  const imageListField = (label, path, addText = "Tambah foto") => {
    const items = getPath(path) || [];
    const id = "imglist_" + path.replace(/[^\w]/g, "_");
    return `<div class="field span-2 imagelist" id="${id}" data-imagelist="${path}">
      <label>${esc(label)}</label>
      <div class="imagelist__grid">
        ${items
          .map(
            (src, i) => `<div class="imagelist__cell">
              <div class="imagelist__thumb">${src ? `<img src="${esc(src)}" alt="foto ${i + 1}" />` : `<span class="mono">kosong</span>`}</div>
              <div class="imagelist__tools">
                <button type="button" class="btn btn--ghost btn--tiny" data-docpick="${path}" data-i="${i}">${icon("upload")} ${src ? "Ganti" : "Upload"}</button>
                <button type="button" class="btn btn--ghost btn--tiny is-danger" data-docdel="${path}" data-i="${i}">${icon("trash")}</button>
              </div>
            </div>`
          )
          .join("")}
      </div>
      <button type="button" class="addbtn addbtn--small" data-docadd="${path}">${icon("plus")} ${esc(addText)}</button>
      <input type="file" accept="image/*" data-docfile="${path}" hidden />
      <span class="help">Foto dokumentasi tampil di dalam detail project. Bisa lebih dari satu.</span>
    </div>`;
  };

  /* social / skill icon picker */
  const iconField = (label, path, list = SKILL_ICONS) => {
    const value = getPath(path);
    return `<div class="field span-2">
      <label>${esc(label)}</label>
      <div class="iconpick" data-iconpath="${path}">
        ${list
          .map(
            (n) => `<button type="button" class="${n === value ? "is-on" : ""}" data-icon="${n}" title="${n}">${icon(n)}</button>`
          )
          .join("")}
      </div>
    </div>`;
  };

  /* repeatable list */
  const listEditor = ({ key, label, addText, itemTitle, body, factory, hint }) => {
    const items = getPath(key) || [];
    const cards = items
      .map(
        (item, i) => `<article class="item">
        <header class="item__head">
          <span class="item__grip">${icon("grip")}</span>
          <span class="item__title">${esc(itemTitle(item, i))}</span>
          <span class="item__tools">
            <button type="button" title="Naik" data-move="${key}" data-i="${i}" data-dir="-1">${icon("up")}</button>
            <button type="button" title="Turun" data-move="${key}" data-i="${i}" data-dir="1">${icon("down")}</button>
            <button type="button" class="is-danger" title="Hapus" data-remove="${key}" data-i="${i}">${icon("trash")}</button>
          </span>
        </header>
        <div class="item__body">${body(item, i)}</div>
      </article>`
      )
      .join("");

    return `<section class="listblock">
      <header class="listblock__head">
        <h3>${esc(label)}</h3>
        <span class="mono">${items.length} item</span>
      </header>
      ${hint ? `<p class="help">${hint}</p>` : ""}
      ${cards || `<p class="empty">Belum ada item. Tambahkan yang pertama.</p>`}
      <button type="button" class="addbtn" data-add="${key}">${icon("plus")} ${esc(addText || "Tambah")}</button>
    </section>`;
  };

  /* ---------------- tab definitions ---------------- */
  const TABS = [
    {
      id: "identity",
      label: "Identitas",
      icon: "user",
      title: "Identitas",
      sub: "Nama, peran, dan foto yang tampil di seluruh website.",
      render() {
        return `<div class="grid">
          ${field("Nama depan", "profile.firstName", { help: "Dipakai sebagai nama raksasa di hero — hurufnya direntangkan penuh." })}
          ${field("Nama belakang", "profile.lastName", { help: "Muncul sebagai tulisan tangan di hero." })}
          ${field("Nama lengkap", "profile.signature", { span: 2 })}
          ${field("Aksara Jepang", "profile.kanji", { help: "Contoh: ディマス" })}
          ${field("Peran", "profile.role")}
          ${field("Surel", "profile.email")}
          ${field("Lokasi", "profile.location")}
          ${field("Bio singkat", "profile.bio", { type: "textarea", span: 2 })}
          ${imageField("Foto utama (hero)", "profile.portrait", { cutoutPath: "profile.portraitCutout" })}
          ${field("Link CV", "profile.resumeUrl", { span: 2, help: "Tempel URL file PDF. Kosongkan untuk menyembunyikan tombol." })}
        </div>`;
      }
    },
    {
      id: "intro",
      label: "Intro",
      icon: "eye",
      title: "Layar Intro",
      sub: "Layar gelap singkat yang muncul sebelum website terbuka.",
      render() {
        return `<div class="grid">
          ${field("Aksara Jepang", "intro.kanji", { help: "Tampil besar dengan jarak lebar." })}
          ${field("Nama", "intro.name")}
          ${field("Tahun / nomor", "intro.year")}
          ${field("Label tombol lewati", "intro.skipLabel")}
        </div>`;
      }
    },
    {
      id: "hero",
      label: "Hero",
      icon: "type",
      title: "Bagian Hero",
      sub: "Layar pertama — label, sapaan, catatan, dan kutipan.",
      render() {
        return `<div class="grid">
          ${field("Label atas kiri", "hero.kicker")}
          ${field("Tanggal (kanan)", "hero.dateText")}
          ${field("Paragraf pengantar", "hero.kickerText", { type: "textarea", span: 2 })}
          ${field("Sapaan kecil", "hero.greeting")}
          ${field("Kredit proyek", "hero.projectBy")}
          <div class="divider span-2"><span class="mono">Kutipan bawah</span></div>
          ${field("Judul kutipan", "hero.quoteLabel")}
          ${field("Kutipan", "hero.quoteText", { type: "textarea" })}
          ${field("Sumber kutipan", "hero.quoteBy")}
          <div class="divider span-2"><span class="mono">Lainnya</span></div>
          ${field("Label gulir", "hero.scrollLabel")}
        </div>
        ${listEditor({
          key: "marquee",
          label: "Teks berjalan",
          addText: "Tambah teks",
          itemTitle: (t) => t || "Teks baru",
          factory: () => "Kata baru",
          body: (_t, i) => `<div class="grid">${field("Teks", `marquee.${i}`, { span: 2 })}</div>`
        })}`;
      }
    },
    {
      id: "about",
      label: "Profil",
      icon: "book",
      title: "Bagian Profil",
      sub: "« Halo, aku Dimas! » — cerita singkat dan fakta.",
      render() {
        return `<div class="grid">
          ${field("Label bagian", "about.sectionLabel")}
          ${field("Judul baris 1", "about.heading")}
          ${field("Nama tulisan tangan", "about.scriptName")}
          ${field("Keterangan foto kiri", "about.captionLeft")}
          ${field("Keterangan foto kanan", "about.captionRight")}
          <div class="field span-2"><label>Paragraf</label>
            <div class="stacked">
              ${(draft.about.paragraphs || [])
                .map(
                  (p, i) =>
                    `<div class="para"><textarea rows="3" data-path="about.paragraphs.${i}" data-type="textarea">${esc(p)}</textarea>
                     <button type="button" class="paradel" data-paradel="${i}" title="Hapus paragraf">${icon("trash")}</button></div>`
                )
                .join("")}
            </div>
            <button type="button" class="addbtn addbtn--inline" data-addpara="about.paragraphs">${icon("plus")} Tambah paragraf</button>
          </div>
          ${imageField("Foto bagian profil", "about.portrait", { cutoutPath: "about.portraitCutout" })}
        </div>
        ${listEditor({
          key: "about.facts",
          label: "Fakta singkat",
          addText: "Tambah fakta",
          itemTitle: (f) => `${f.label || "Fakta"}: ${f.value || ""}`,
          factory: () => ({ label: "Label", value: "Isi" }),
          body: (_f, i) => `<div class="grid">
            ${field("Label", `about.facts.${i}.label`)}
            ${field("Isi", `about.facts.${i}.value`)}
          </div>`
        })}`;
      }
    },
    {
      id: "bio",
      label: "Biografi",
      icon: "award",
      title: "Biografi",
      sub: "Cerita singkat, riwayat, dan pendidikan — semua bisa ditambah.",
      render() {
        return `<div class="grid">
          ${field("Label bagian", "bio.sectionLabel")}
          ${field("Judul", "bio.title")}
          ${field("Kalimat tulisan tangan", "bio.quote", { type: "textarea", span: 2 })}
          ${field("Biografi", "bio.biografi", { type: "textarea", rows: 8, span: 2, help: "Pisahkan paragraf dengan satu baris kosong." })}
        </div>
        ${listEditor({
          key: "bio.items",
          label: "Baris biografi",
          addText: "Tambah baris",
          itemTitle: (b) => b.label || "Baris baru",
          factory: () => ({ label: "Label", value: "Isi", note: "Keterangan singkat." }),
          body: (b, i) => `<div class="grid">
            ${field("Label", `bio.items.${i}.label`)}
            ${field("Isi", `bio.items.${i}.value`)}
            ${field("Keterangan", `bio.items.${i}.note`, { type: "textarea", span: 2 })}
          </div>`
        })}
        <div class="grid" style="margin-top:18px">
          ${field("Judul riwayat pendidikan", "bio.educationTitle", { span: 2 })}
        </div>
        ${listEditor({
          key: "bio.education",
          label: "Riwayat pendidikan",
          addText: "Tambah pendidikan",
          itemTitle: (e) => e.school || "Sekolah baru",
          factory: () => ({ period: "2024 — sekarang", school: "Sekolah baru", note: "Keterangan singkat." }),
          body: (e, i) => `<div class="grid">
            ${field("Periode", `bio.education.${i}.period`)}
            ${field("Sekolah", `bio.education.${i}.school`)}
            ${field("Keterangan", `bio.education.${i}.note`, { type: "textarea", span: 2 })}
          </div>`
        })}`;
      }
    },
    {
      id: "stage",
      label: "Prestasi",
      icon: "spark",
      title: "Prestasi",
      sub: "Baris akordeon — coding, desain, musik, dan pencapaian lain.",
      render() {
        return `<div class="grid">
          ${field("Label bagian", "stage.sectionLabel")}
          ${field("Judul baris 1", "stage.heading")}
          ${field("Judul tulisan tangan", "stage.script")}
          ${field("Keterangan", "stage.sub", { type: "textarea", span: 2 })}
        </div>
        ${listEditor({
          key: "stage.items",
          label: "Prestasi",
          addText: "Tambah prestasi",
          itemTitle: (s) => s.title || "Kategori baru",
          factory: () => ({ no: "(0" + ((draft.stage?.items?.length || 0) + 1) + ")", title: "Prestasi baru", desc: "Deskripsi singkat.", detail: "Cerita lengkap.", image: "", meta: "Label", year: "2025 — sekarang" }),
          body: (s, i) => `<div class="grid">
            ${field("Nomor", `stage.items.${i}.no`)}
            ${field("Judul", `stage.items.${i}.title`)}
            ${field("Deskripsi di baris", `stage.items.${i}.desc`, { type: "textarea", span: 2 })}
            ${field("Cerita saat dibuka", `stage.items.${i}.detail`, { type: "textarea", rows: 5, span: 2 })}
            ${imageField("Foto", `stage.items.${i}.image`)}
            ${field("Label kecil", `stage.items.${i}.meta`)}
            ${field("Periode", `stage.items.${i}.year`)}
          </div>`
        })}`;
      }
    },
    {
      id: "projects",
      label: "Project",
      icon: "folder",
      title: "Project",
      sub: "Kartu project di bagian prestasi. Klik kartu di situs untuk membuka detail.",
      render() {
        return `<div class="grid">
          ${field("Label kecil", "projects.label")}
          ${field("Judul baris 1", "projects.heading")}
          ${field("Judul tulisan tangan", "projects.script")}
          ${field("Keterangan", "projects.sub", { type: "textarea", span: 2 })}
          ${field("Catatan di bawah", "projects.note")}
          ${field("Teks saat kosong", "projects.emptyTitle")}
          ${field("Keterangan saat kosong", "projects.emptyNote", { type: "textarea", span: 2 })}
        </div>
        ${listEditor({
          key: "projects.items",
          label: "Daftar project",
          addText: "Tambah project",
          itemTitle: (s) => s.title || "Project baru",
          factory: () => ({
            no: "NO. 0" + ((draft.projects?.items?.length || 0) + 1),
            title: "Project baru",
            desc: "Deskripsi singkat project.",
            detail: "Cerita lengkap project.",
            cover: "",
            year: "2026",
            role: "Peran",
            link: "",
            docs: []
          }),
          body: (s, i) => `<div class="grid">
            ${field("Nomor", `projects.items.${i}.no`)}
            ${field("Judul", `projects.items.${i}.title`)}
            ${field("Deskripsi kartu", `projects.items.${i}.desc`, { type: "textarea", span: 2 })}
            ${field("Cerita di detail", `projects.items.${i}.detail`, { type: "textarea", rows: 6, span: 2 })}
            ${imageField("Foto sampul", `projects.items.${i}.cover`)}
            ${field("Peran", `projects.items.${i}.role`)}
            ${field("Tahun", `projects.items.${i}.year`)}
            ${field("Tautan (opsional)", `projects.items.${i}.link`, { span: 2, help: "URL github/live demo. Kosongkan untuk menyembunyikan tombol." })}
            ${imageListField("Foto dokumentasi", `projects.items.${i}.docs`, "Tambah foto dokumentasi")}
          </div>`
        })}`;
      }
    },
    {
      id: "certificate",
      label: "Sertifikat",
      icon: "award",
      title: "Sertifikat",
      sub: "Upload sertifikat, penghargaan, atau piagam. Bisa diklik untuk melihat versi besar.",
      render() {
        return `<div class="grid">
          ${field("Label bagian", "certificate.sectionLabel")}
          ${field("Judul baris 1", "certificate.heading")}
          ${field("Judul tulisan tangan", "certificate.script")}
          ${field("Keterangan", "certificate.sub", { type: "textarea", span: 2 })}
          ${field("Label tombol buka", "certificate.hint")}
          ${field("Catatan saat kosong", "certificate.note")}
        </div>
        ${listEditor({
          key: "certificate.items",
          label: "Daftar sertifikat",
          addText: "Tambah sertifikat",
          hint: "Urutan bisa diatur dengan tombol naik/turun. Klik kartu di website untuk membuka gambar besar.",
          itemTitle: (c) => c.title || "Sertifikat baru",
          factory: () => ({ image: "", no: "NO. 0" + ((draft.certificate?.items?.length || 0) + 1), title: "Sertifikat baru", issuer: "Penerbit", desc: "", year: "2025" }),
          body: (c, i) => `<div class="grid">
            ${imageField("Gambar sertifikat", `certificate.items.${i}.image`)}
            ${field("Nomor", `certificate.items.${i}.no`)}
            ${field("Judul", `certificate.items.${i}.title`)}
            ${field("Penerbit", `certificate.items.${i}.issuer`)}
            ${field("Tahun", `certificate.items.${i}.year`)}
            ${field("Deskripsi", `certificate.items.${i}.desc`, { type: "textarea", span: 2 })}
          </div>`
        })}`;
      }
    },
    {
      id: "quote",
      label: "Quote",
      icon: "chat",
      title: "Kutipan Gelap",
      sub: "Bagian gelap dengan kutipan besar di tengah.",
      render() {
        return `<div class="grid">
          ${field("Label bagian", "quote.sectionLabel")}
          ${field("Kutipan", "quote.text", { type: "textarea", span: 2 })}
          ${field("Sumber", "quote.by", { span: 2 })}
        </div>`;
      }
    },
    {
      id: "skills",
      label: "Keahlian",
      icon: "spark",
      title: "Keahlian",
      sub: "Halaman keahlian dan integrasi GitHub. Halaman ini sengaja tidak punya tombol di navbar.",
      render() {
        const g = draft.github || {};
        return `<div class="grid">
          ${field("Label bagian", "skills.sectionLabel")}
          ${field("Judul baris 1", "skills.heading")}
          ${field("Judul tulisan tangan", "skills.script")}
          ${field("Keterangan", "skills.sub", { type: "textarea", span: 2 })}
          ${field("Catatan bawah", "skills.note", { type: "textarea", span: 2 })}
        </div>
        ${listEditor({
          key: "skills.items",
          label: "Daftar keahlian",
          addText: "Tambah keahlian",
          itemTitle: (s) => s.name || "Keahlian baru",
          factory: () => ({ name: "Keahlian baru", level: 60, note: "Keterangan singkat.", icon: "spark" }),
          body: (s, i) => `<div class="grid">
            ${field("Nama", `skills.items.${i}.name`)}
            ${field("Tingkat (%)", `skills.items.${i}.level`, { type: "number", min: 0, max: 100 })}
            ${field("Keterangan", `skills.items.${i}.note`, { type: "textarea", span: 2 })}
            ${iconField("Ikon", `skills.items.${i}.icon`, SKILL_ICONS)}
          </div>`
        })}
        <div class="grid" style="margin-top:18px">
          <div class="divider span-2"><span class="mono">Integrasi GitHub</span></div>
          ${field("Aktifkan GitHub", "github.enabled", { type: "check", span: 2, help: "Menampilkan repositori publik di halaman keahlian." })}
          ${field("Username GitHub", "github.user", { span: 2, placeholder: "contoh: dimasparama", help: "Hanya username, bukan URL penuh." })}
          ${field("Judul blok GitHub", "skills.githubTitle")}
          ${field("Catatan blok GitHub", "skills.githubNote")}
        </div>`;
      }
    },
    {
      id: "gallery",
      label: "Galeri",
      icon: "image",
      title: "Potret Dimas",
      sub: "Galeri asimetris — bisa diklik untuk melihat lebih besar. Kosongkan dulu, tambah foto lewat tombol di bawah.",
      render() {
        return `<div class="grid">
          ${field("Label bagian", "gallery.sectionLabel")}
          ${field("Judul baris 1", "gallery.heading")}
          ${field("Judul tulisan tangan", "gallery.script")}
          ${field("Petunjuk geser", "gallery.hint")}
          ${field("Catatan bawah", "gallery.note")}
        </div>
        ${listEditor({
          key: "gallery.items",
          label: "Foto galeri",
          addText: "Tambah foto",
          hint: "Kosongkan gambar untuk membuat kartu hitam berisi aksara Jepang.",
          itemTitle: (g, i) => g.title || `Foto ${i + 1}`,
          factory: () => ({ image: "", no: "NO. 0" + ((draft.gallery?.items?.length || 0) + 1), title: "Potret", meta: "Editorial" }),
          body: (g, i) => `<div class="grid">
            ${imageField("Gambar", `gallery.items.${i}.image`)}
            ${field("Nomor", `gallery.items.${i}.no`)}
            ${field("Judul", `gallery.items.${i}.title`)}
            ${field("Label kecil", `gallery.items.${i}.meta`)}
          </div>`
        })}`;
      }
    },
    {
      id: "contact",
      label: "Kontak",
      icon: "mail",
      title: "Kontak & Footer",
      sub: "Ucapan penutup, sosial media, dan kredit.",
      render() {
        return `<div class="grid">
          ${field("Label bagian", "contact.sectionLabel")}
          ${field("Judul baris 1", "contact.heading")}
          ${field("Judul tulisan tangan", "contact.script")}
          <div class="divider span-2"><span class="mono">Footer</span></div>
          ${field("Kredit proyek", "footer.projectBy")}
          ${field("Tanggal", "footer.date")}
          ${field("Label kembali ke atas", "footer.backTop")}
          ${field("Label kunjungan", "footer.visitsLabel")}
          ${field("Nama raksasa", "footer.wordmark", { span: 2 })}
        </div>
        ${listEditor({
          key: "contact.socials",
          label: "Sosial media",
          addText: "Tambah sosial",
          itemTitle: (s) => s.label || "Sosial baru",
          factory: () => ({ label: "Sosial", url: "https://", icon: "link" }),
          body: (s, i) => `<div class="grid">
            ${field("Nama", `contact.socials.${i}.label`)}
            ${field("URL", `contact.socials.${i}.url`)}
            ${iconField("Ikon", `contact.socials.${i}.icon`, SOCIAL_ICONS)}
          </div>`
        })}`;
      }
    },
    {
      id: "theme",
      label: "Tampilan",
      icon: "grid",
      title: "Tampilan",
      sub: "Mode warna dan aksen. Desainnya tetap putih premium — aksen hanya untuk detail.",
      render() {
        const t = draft.theme || {};
        const swatches = ["#b3543b", "#1b1a17", "#6a7d5a", "#8a6b4f", "#2f4b6e", "#a67c52", "#7a6a8f", "#3f6d63"];
        return `<div class="grid">
          <div class="field span-2"><label>Mode</label>
            <div class="segmented">
              ${["light", "dark", "midnight"]
                .map(
                  (m) => `<button type="button" data-mode="${m}" class="${t.mode === m ? "is-on" : ""}">
                    ${icon("eye")} ${m === "light" ? "Terang" : m === "dark" ? "Gelap" : "Midnight"}</button>`
                )
                .join("")}
            </div>
            <span class="help">Tiga tema dengan kontras yang disesuaikan. Pengunjung juga bisa mengganti tema lewat tombol di navbar; pilihan mereka tersimpan di perangkatnya.</span>
          </div>
          <div class="field span-2"><label>Warna aksen</label>
            <div class="swatches">
              ${swatches
                .map((c) => `<button type="button" data-accent="${c}" class="${String(t.accent).toLowerCase() === c ? "is-on" : ""}" style="--sw:${c}" title="${c}"></button>`)
                .join("")}
              <label class="swatch-custom" title="Warna kustom">
                <input type="color" data-path="theme.accent" data-type="color" value="${esc(t.accent || "#b3543b")}" />
              </label>
            </div>
          </div>
        </div>`;
      }
    },
    {
      id: "settings",
      label: "Pengaturan",
      icon: "settings",
      title: "Pengaturan Situs",
      sub: "Izin edit publik, password admin, dan kesehatan data.",
      render() {
        const meta = API.meta;
        const locked = !meta.authed;
        return `<div class="grid">
          ${locked
            ? `<div class="field span-2"><label>Masuk sebagai admin</label>
                <div class="callout callout--lock">
                  <div>
                    <strong>Kamu sedang mengedit sebagai pengunjung</strong>
                    <p>Konten tetap bisa disimpan, tapi pengaturan situs dan ganti password hanya bisa dilakukan setelah login sebagai admin.</p>
                  </div>
                </div>
                <div class="inlineform" style="margin-top:8px">
                  <input type="password" id="settingsPass" placeholder="Password admin" autocomplete="current-password" />
                  <button type="button" class="btn btn--solid btn--tiny" id="settingsLogin">Masuk</button>
                </div>
                <span class="help">Password awal <code>admin123</code> — segera ganti setelah masuk pertama kali.</span>
              </div>`
            : ""}
          <div class="field span-2"><label>Akses edit</label>
            <div class="callout ${meta.openEdit ? "callout--on" : ""}">
              <div>
                <strong>${meta.openEdit ? "Edit publik aktif" : "Edit publik nonaktif"}</strong>
                <p>${meta.openEdit
                  ? "Pengunjung bisa membuka panel ini dan mengubah konten tanpa password."
                  : "Hanya admin yang login yang bisa mengubah konten."}</p>
              </div>
              <button type="button" class="btn btn--outline btn--tiny" id="toggleOpen" ${locked ? "disabled" : ""}>${meta.openEdit ? "Matikan" : "Aktifkan"}</button>
            </div>
          </div>
          <div class="field span-2"><label>Ganti password admin</label>
            <div class="inlineform">
              <input type="password" id="newPass" placeholder="Password baru (min. 6 karakter)" autocomplete="new-password" ${locked ? "disabled" : ""} />
              <button type="button" class="btn btn--solid btn--tiny" id="savePass" ${locked ? "disabled" : ""}>Simpan password</button>
            </div>
            <span class="help">Password disimpan sebagai hash bcrypt di database, bukan teks biasa.</span>
          </div>
          <div class="field span-2"><label>Status data</label>
            <div class="statuslist">
              <div><span class="mono">Penyimpanan</span><strong>SQLite</strong></div>
              <div><span class="mono">Gambar</span><strong>storage/uploads</strong></div>
              <div><span class="mono">Terakhir diubah</span><strong id="lastSaved">${API.content?.updatedAt ? new Date(API.content.updatedAt).toLocaleString("id-ID") : "—"}</strong></div>
              <div><span class="mono">Cadangan otomatis</span><strong>20 versi terakhir</strong></div>
            </div>
          </div>
          <div class="field span-2"><label>Lainnya</label>
            <div class="inlineform">
              <a class="btn btn--outline btn--tiny" href="/" target="_blank" rel="noopener">Buka website</a>
              <button type="button" class="btn btn--ghost btn--tiny" id="reloadBtn">Muat ulang data</button>
            </div>
            <span class="help">Butuh deploy? Jalankan <code>php artisan serve</code> atau arahkan web server ke folder <code>public/</code>.</span>
          </div>
        </div>`;
      }
    }
  ];

  /* ---------------- rendering ---------------- */
  function renderTabs() {
    const el = $("#tabs");
    el.innerHTML = TABS
      .map(
        (t) => `<button type="button" class="tab ${t.id === activeTab ? "is-on" : ""}" data-tab="${t.id}">
          <span class="tab__icon">${icon(t.icon)}</span>
          <span>${t.label}</span>
        </button>`
      )
      .join("");
    el.querySelectorAll(".tab").forEach((b) =>
      b.addEventListener("click", () => {
        activeTab = b.dataset.tab;
        renderTabs();
        renderPanel();
      })
    );
  }

  function renderPanel() {
    const tab = TABS.find((t) => t.id === activeTab) || TABS[0];
    $("#panelTitle").textContent = tab.title;
    $("#panelSub").textContent = tab.sub;
    $("#panelBody").innerHTML = tab.render();

    const el = $("#panelBody");
    // count for context
    $("#panelCount").textContent = "";
    bindPanel(el);
    renderInspector();
  }

  function renderInspector() {
    const dirty = JSON.stringify(draft) !== savedSnapshot;
    $("#inspectMount").innerHTML = `
      <div class="inspect__status ${dirty ? "is-dirty" : ""}">
        <span class="inspect__dot"></span>
        <div>
          <strong>${dirty ? "Perubahan belum tersimpan" : "Semua tersimpan"}</strong>
          <p>${dirty ? "Menekan Simpan akan mengirim perubahan ke server." : "Konten di server sudah sesuai dengan panel."}</p>
        </div>
      </div>
      <div class="inspect__tips">
        <span class="mono">Pintasan</span>
        <ul>
          <li><kbd>Ctrl</kbd><kbd>S</kbd> simpan perubahan</li>
          <li><kbd>Ctrl</kbd><kbd>Enter</kbd> simpan &amp; lihat situs</li>
        </ul>
      </div>
      <div class="inspect__tips">
        <span class="mono">Pengunjung</span>
        <p>Pengunjung selalu melihat versi terakhir yang kamu simpan. Data tersimpan di server, jadi bisa diedit dari perangkat lain.</p>
      </div>`;
    $("#savedAt").textContent = dirty ? "belum disimpan" : "tersimpan di server";
    $("#savedAt").classList.toggle("is-warn", dirty);
    $("#saveBtn").classList.toggle("is-ready", dirty);
    $("#saveLabel").textContent = dirty ? "Simpan perubahan" : "Tersimpan";
  }

  /* ---------------- binding ---------------- */
  function afterChange() {
    renderInspector();
    scheduleSave();
  }

  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      if (JSON.stringify(draft) !== savedSnapshot) save();
    }, 1400);
  }

  function bindPanel(root) {
    // text-ish inputs
    root.querySelectorAll("[data-path]").forEach((input) => {
      const evt = input.type === "checkbox" || input.tagName === "SELECT" || input.type === "color" ? "input" : "input";
      input.addEventListener(evt, () => {
        const path = input.dataset.path;
        const type = input.dataset.type;
        let value = input.value;
        if (type === "number") value = value === "" ? 0 : Number(value);
        else if (type === "check") value = input.checked;
        else if (type === "tags") value = value.split(",").map((s) => s.trim()).filter(Boolean);
        setPath(path, value);

        // live-ish updates for titles in repeated cards
        if (type === "color") {
          const code = input.parentElement?.querySelector("code");
          if (code) code.textContent = value;
          if (path === "theme.accent") applyPreviewTheme();
        }
        afterChange();
      });
    });

    // icon pickers
    root.querySelectorAll("[data-iconpath]").forEach((box) => {
      box.querySelectorAll("button[data-icon]").forEach((btn) => {
        btn.addEventListener("click", () => {
          box.querySelectorAll("button").forEach((b) => b.classList.toggle("is-on", b === btn));
          setPath(box.dataset.iconpath, btn.dataset.icon);
          afterChange();
        });
      });
    });

    // reorder / delete
    root.querySelectorAll("[data-move]").forEach((btn) =>
      btn.addEventListener("click", () => {
        const key = btn.dataset.move;
        const i = Number(btn.dataset.i);
        const dir = Number(btn.dataset.dir);
        const arr = getPath(key);
        const j = i + dir;
        if (j < 0 || j >= arr.length) return;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        renderPanel();
        afterChange();
      })
    );
    root.querySelectorAll("[data-remove]").forEach((btn) =>
      btn.addEventListener("click", () => {
        const key = btn.dataset.remove;
        const i = Number(btn.dataset.i);
        const arr = getPath(key);
        if (!confirm("Hapus item ini?")) return;
        arr.splice(i, 1);
        renderPanel();
        afterChange();
      })
    );

    // add item
    root.querySelectorAll("[data-add]").forEach((btn) =>
      btn.addEventListener("click", () => {
        const key = btn.dataset.add;
        const tab = TABS.find((t) => t.id === activeTab);
        const factory = factoryFor(key);
        const arr = getPath(key);
        arr.push(factory ? factory() : "");
        renderPanel();
        afterChange();
      })
    );

    // paragraphs
    root.querySelectorAll("[data-addpara]").forEach((btn) =>
      btn.addEventListener("click", () => {
        const arr = getPath(btn.dataset.addpara);
        arr.push("");
        renderPanel();
        afterChange();
      })
    );
    root.querySelectorAll("[data-paradel]").forEach((btn) =>
      btn.addEventListener("click", () => {
        const arr = getPath("about.paragraphs");
        arr.splice(Number(btn.dataset.paradel), 1);
        renderPanel();
        afterChange();
      })
    );

    // image list (documentation photos)
    root.querySelectorAll("[data-docadd]").forEach((btn) =>
      btn.addEventListener("click", () => {
        const arr = getPath(btn.dataset.docadd);
        arr.push("");
        renderPanel();
        afterChange();
      })
    );
    root.querySelectorAll("[data-docdel]").forEach((btn) =>
      btn.addEventListener("click", () => {
        const arr = getPath(btn.dataset.docdel);
        arr.splice(Number(btn.dataset.i), 1);
        renderPanel();
        afterChange();
      })
    );
    root.querySelectorAll("[data-docpick]").forEach((btn) =>
      btn.addEventListener("click", () => {
        const box = btn.closest("[data-imagelist]");
        const input = box.querySelector("[data-docfile]");
        input.dataset.target = btn.dataset.i;
        input.dataset.listPath = btn.dataset.docpick;
        input.click();
      })
    );
    root.querySelectorAll("[data-docfile]").forEach((input) =>
      input.addEventListener("change", async () => {
        const file = input.files?.[0];
        if (!file) return;
        const { listPath, target } = input.dataset;
        try {
          const raw = await Imaging.readFile(file);
          const small = await Imaging.shrink(raw, 1600);
          const url = await upload(small);
          const arr = getPath(listPath);
          arr[Number(target)] = url;
          renderPanel();
          afterChange();
        } catch {
          toast("Gagal mengunggah foto");
        } finally {
          input.value = "";
        }
      })
    );

    // images
    root.querySelectorAll("[data-pick]").forEach((btn) =>
      btn.addEventListener("click", () => {
        const path = btn.dataset.pick;
        const box = btn.closest("[data-image]");
        box.querySelector("[data-file]").click();
      })
    );
    root.querySelectorAll("[data-file]").forEach((input) =>
      input.addEventListener("change", async () => {
        const file = input.files?.[0];
        if (!file) return;
        const path = input.dataset.file;
        try {
          const raw = await Imaging.readFile(file);
          const small = await Imaging.shrink(raw, 1800);
          const url = await upload(small);
          setPath(path, url);
          renderPanel();
          afterChange();
          toast("Foto terunggah");
        } catch (err) {
          console.error(err);
          toast("Gagal mengunggah foto");
        }
        input.value = "";
      })
    );

    root.querySelectorAll("[data-cut]").forEach((btn) =>
      btn.addEventListener("click", async () => {
        const path = btn.dataset.cut;
        const current = getPath(path);
        if (!current) return toast("Upload foto dulu");
        btn.disabled = true;
        bgModal(true);
        try {
          const dataUrl = /^data:/.test(current) ? current : await toDataUrl(current);
          const cut = await Imaging.removeBg(dataUrl, bgProgress);
          const url = await upload(cut);
          setPath(path, url);
          // auto-enable the cut-out presentation
          const box = $('.imagefield[data-image="' + path + '"]');
          const check = box?.querySelector('.checkline input[type="checkbox"]');
          if (check && !check.checked) {
            const cp = check.dataset.path;
            if (cp) setPath(cp, true);
          }
          renderPanel();
          afterChange();
          toast("Background dihapus — foto transparan");
        } catch (err) {
          console.error(err);
          toast("Gagal menghapus background");
        } finally {
          btn.disabled = false;
          bgModal(false);
        }
      })
    );

    root.querySelectorAll("[data-url]").forEach((btn) =>
      btn.addEventListener("click", () => {
        const path = btn.dataset.url;
        const val = prompt("Tempel URL gambar:", getPath(path) || "https://");
        if (val == null) return;
        setPath(path, val.trim());
        renderPanel();
        afterChange();
      })
    );
    root.querySelectorAll("[data-clear]").forEach((btn) =>
      btn.addEventListener("click", () => {
        setPath(btn.dataset.clear, "");
        renderPanel();
        afterChange();
      })
    );

    // theme controls
    root.querySelectorAll("[data-mode]").forEach((btn) =>
      btn.addEventListener("click", () => {
        setPath("theme.mode", btn.dataset.mode);
        applyPreviewTheme();
        renderPanel();
        afterChange();
      })
    );
    root.querySelectorAll("[data-accent]").forEach((btn) =>
      btn.addEventListener("click", () => {
        setPath("theme.accent", btn.dataset.accent);
        applyPreviewTheme();
        renderPanel();
        afterChange();
      })
    );

    // settings: inline admin login
    root.querySelector("#settingsLogin")?.addEventListener("click", async () => {
      const pass = root.querySelector("#settingsPass")?.value || "";
      if (!pass) return toast("Masukkan password");
      try {
        await API.login(pass);
        await refreshMeta();
        renderPanel();
        toast("Kamu masuk sebagai admin");
      } catch (e) {
        toast(e.message || "Gagal masuk");
      }
    });

    // settings buttons
    root.querySelector("#toggleOpen")?.addEventListener("click", async () => {
      try {
        const res = await API.saveSettings({ openEdit: !API.meta.openEdit });
        API.meta.openEdit = res.openEdit;
        renderPanel();
        toast(res.openEdit ? "Edit publik diaktifkan" : "Edit publik dimatikan");
      } catch (e) {
        toast(e.message || "Gagal mengubah pengaturan");
      }
    });
    root.querySelector("#savePass")?.addEventListener("click", async () => {
      const pass = root.querySelector("#newPass")?.value || "";
      if (pass.length < 6) return toast("Password minimal 6 karakter");
      try {
        await API.saveSettings({ newPassword: pass });
        root.querySelector("#newPass").value = "";
        toast("Password admin diperbarui");
      } catch (e) {
        toast(e.message || "Gagal mengganti password");
      }
    });
    root.querySelector("#reloadBtn")?.addEventListener("click", async () => {
      if (!confirm("Muat ulang data dari server? Perubahan yang belum disimpan akan hilang.")) return;
      await loadContent();
      renderPanel();
      toast("Data dimuat ulang");
    });
  }

  function factoryFor(key) {
    const tab = TABS.find((t) => t.id === activeTab);
    // factories live inside listEditor calls; simplest is a small lookup
    const map = {
      "marquee": () => "Kata baru",
      "about.facts": () => ({ label: "Label", value: "Isi" }),
      "bio.items": () => ({ label: "Label", value: "Isi", note: "Keterangan singkat." }),
      "bio.education": () => ({ period: "2024 — sekarang", school: "Sekolah baru", note: "Keterangan singkat." }),
      "stage.items": () => ({ no: "(0" + ((draft.stage?.items?.length || 0) + 1) + ")", title: "Prestasi baru", desc: "Deskripsi singkat.", detail: "Cerita lengkap.", image: "", meta: "Label", year: "2025 — sekarang" }),
      "projects.items": () => ({ no: "NO. 0" + ((draft.projects?.items?.length || 0) + 1), title: "Project baru", desc: "Deskripsi singkat project.", detail: "Cerita lengkap project.", cover: "", year: "2026", role: "Peran", link: "", docs: [] }),
      "certificate.items": () => ({ image: "", no: "NO. 0" + ((draft.certificate?.items?.length || 0) + 1), title: "Sertifikat baru", issuer: "Penerbit", desc: "", year: "2025" }),
      "skills.items": () => ({ name: "Keahlian baru", level: 60, note: "Keterangan singkat.", icon: "spark" }),
      "gallery.items": () => ({ image: "", no: "NO. 0" + ((draft.gallery?.items?.length || 0) + 1), title: "Potret", meta: "Editorial" }),
      "contact.socials": () => ({ label: "Sosial", url: "https://", icon: "link" })
    };
    return map[key];
  }

  /* ---------------- image utils ---------------- */
  async function toDataUrl(url) {
    const img = await Imaging.loadImage(url);
    const c = document.createElement("canvas");
    c.width = img.naturalWidth || img.width;
    c.height = img.naturalHeight || img.height;
    c.getContext("2d").drawImage(img, 0, 0);
    return c.toDataURL("image/png");
  }

  async function upload(dataUrl) {
    const res = await API.upload(dataUrl);
    return res;
  }

  function bgModal(show) {
    const m = $("#bgModal");
    if (!m) return;
    m.hidden = !show;
    if (show) {
      $("#bgBar").style.width = "4%";
      $("#bgTitle").textContent = "Menghapus background…";
      $("#bgNote").textContent = "Proses 100% di browser kamu. Pemakaian pertama mengunduh model AI (~40MB).";
    }
  }
  function bgProgress(p) {
    $("#bgBar").style.width = Math.max(4, Math.round(p * 100)) + "%";
    if (p > 0.12) $("#bgNote").textContent = "Memotong background… jangan tutup tab ini.";
  }

  /* ---------------- save ---------------- */
  async function save() {
    if (saving) {
      scheduleSave();
      return;
    }
    saving = true;
    $("#saveLabel").textContent = "Menyimpan…";
    $("#saveBtn").disabled = true;
    try {
      await API.save(draft);
      savedSnapshot = JSON.stringify(draft);
      toast("Perubahan tersimpan di server");
    } catch (err) {
      console.error(err);
      toast(err.message || "Gagal menyimpan");
    } finally {
      saving = false;
      $("#saveBtn").disabled = false;
      renderInspector();
    }
  }

  /* ---------------- theme preview ---------------- */
  function applyPreviewTheme() {
    const t = draft.theme || {};
    document.documentElement.dataset.mode = ["light", "dark", "midnight"].includes(t.mode) ? t.mode : "light";
    if (t.accent) document.documentElement.style.setProperty("--accent", t.accent);
  }

  /* ---------------- login ---------------- */
  function showLogin(message) {
    $("#login").hidden = false;
    $("#shell").hidden = true;
    if (message) {
      const err = $("#loginError");
      err.textContent = message;
      err.hidden = false;
    }
    $("#loginPass").focus();
  }

  function initLogin() {
    $("#loginForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const pass = $("#loginPass").value;
      const err = $("#loginError");
      err.hidden = true;
      const btn = e.target.querySelector('button[type="submit"]');
      btn.disabled = true;
      try {
        await API.login(pass);
        $("#login").hidden = true;
        await start();
        toast("Selamat datang kembali");
      } catch (ex) {
        err.textContent = ex.message || "Gagal masuk";
        err.hidden = false;
      } finally {
        btn.disabled = false;
      }
    });
  }

  /* ---------------- meta ---------------- */
  async function refreshMeta() {
    const meta = await API.request("/api/meta");
    API.meta = meta;
    const pill = $("#editModePill");
    if (pill) {
      pill.textContent = meta.authed
        ? (meta.openEdit ? "Admin — edit publik aktif" : "Admin — mode privat")
        : "Edit publik aktif";
      pill.classList.toggle("pill--warn", !meta.authed && meta.openEdit);
    }
    const logout = $("#logoutBtn");
    if (logout) logout.hidden = !meta.authed;
    return meta;
  }

  /* ---------------- content ---------------- */
  async function loadContent() {
    draft = clone(await API.load());
    savedSnapshot = JSON.stringify(draft);
  }

  async function start() {
    await loadContent();
    applyPreviewTheme();
    $("#shell").hidden = false;

    const name = draft.profile.signature || draft.profile.firstName || "Portofolio";
    $("#topName").textContent = name;
    $("#topLogo").textContent = (draft.profile.firstName || name)[0].toUpperCase();
    await refreshMeta();

    renderTabs();
    renderPanel();
    renderInspector();
  }

  /* ---------------- boot ---------------- */
  async function boot() {
    initLogin();

    $("#saveBtn").addEventListener("click", save);
    $("#logoutBtn").addEventListener("click", async () => {
      API.logout();
      location.reload();
    });
    $("#previewBtn").addEventListener("click", (e) => {
      if (JSON.stringify(draft) !== savedSnapshot) {
        e.preventDefault();
        save().then(() => window.open("/", "_blank"));
      }
    });

    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        save();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        save().then(() => window.open("/", "_blank"));
      }
    });

    window.addEventListener("beforeunload", (e) => {
      if (JSON.stringify(draft) !== savedSnapshot) {
        e.preventDefault();
        e.returnValue = "";
      }
    });

    if (API.isStatic) {
      showLogin("Panel admin butuh server. Jalankan: php artisan serve");
      return;
    }

    try {
      const meta = await API.request("/api/meta");
      API.meta = meta;
      if (!meta.canEdit) {
        showLogin(meta.authed ? "" : "");
        return;
      }
      await start();
    } catch (err) {
      console.error(err);
      showLogin("Tidak bisa terhubung ke server. Pastikan server berjalan.");
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();

  return { save };
})();
