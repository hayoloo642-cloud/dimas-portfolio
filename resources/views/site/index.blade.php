<!DOCTYPE html>
<html lang="id" data-mode="light">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Dimas Parama — Portfolio</title>
<meta name="description" content="Portofolio editorial Dimas Parama — profil, biografi, prestasi, kutipan, dan potret." />
<meta name="theme-color" content="#F7F6F2" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght%400,6..96,400;0,6..96,500;1,6..96,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Parisienne&family=Inter:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="css/site.css" />
<link rel="icon" href="assets/favicon.svg" />
</head>
<body data-gate="/kelola">
<span class="scroll-progress" id="scrollProgress" aria-hidden="true"></span>

<!-- ============ INTRO ============ -->
<div class="intro" id="intro">
  <div class="intro__inner">
    <p class="intro__kanji" id="introKanji">ディマス</p>
    <div class="intro__meta">
      <span id="introName">DIMAS PARAMA</span>
      <span class="intro__dot" aria-hidden="true"></span>
      <span id="introYear">2026</span>
    </div>
  </div>
  <button class="intro__skip mono" id="introSkip" type="button" data-edit="intro.skipLabel">Lewati</button>
</div>

<!-- ============ NAV ============ -->
<header class="nav" id="nav">
  <a class="nav__brand" href="#top" aria-label="Dimas Parama — beranda">
    <span class="nav__word" data-edit="profile.firstName">Dimas</span>
    <span class="nav__mark script" data-edit="profile.lastName" aria-hidden="true">Parama</span>
  </a>

  <nav class="nav__links" aria-label="Navigasi utama">
    <a href="#profile" data-nav="profile"><span class="mono">01</span><span data-edit="nav.profile">Profil</span></a>
    <a href="#stage" data-nav="stage"><span class="mono">02</span><span data-edit="nav.activity">Prestasi</span></a>
    <a href="#certificate" data-nav="certificate"><span class="mono">03</span><span data-edit="nav.certificate">Sertifikat</span></a>
    <a href="#gallery" data-nav="gallery"><span class="mono">04</span><span data-edit="nav.gallery">Galeri</span></a>
    <a href="#contact" data-nav="contact"><span class="mono">05</span><span data-edit="nav.contact">Kontak</span></a>
  </nav>

  <div class="nav__actions">
    <button class="nav__lang mono" id="langToggle" type="button" aria-label="Ganti bahasa" title="Ganti bahasa">
      <span id="langLabel">ID</span>
    </button>
    <button class="nav__theme" id="themeToggle" type="button" aria-label="Ganti tema" title="Ganti tema" aria-pressed="false">
      <span class="nav__theme-ico" data-theme-icon aria-hidden="true"></span>
    </button>
    <button class="nav__burger" id="burger" aria-label="Buka menu" aria-expanded="false" aria-controls="drawer">
      <span></span><span></span>
    </button>
  </div>
</header>

<div class="drawer" id="drawer" aria-hidden="true">
  <nav class="drawer__links" aria-label="Navigasi seluler">
    <a href="#profile"><span class="mono">01</span> <span data-edit="nav.profile">Profil</span></a>
    <a href="#stage"><span class="mono">02</span> <span data-edit="nav.activity">Prestasi</span></a>
    <a href="#certificate"><span class="mono">03</span> <span data-edit="nav.certificate">Sertifikat</span></a>
    <a href="#gallery"><span class="mono">04</span> <span data-edit="nav.gallery">Galeri</span></a>
    <a href="#contact"><span class="mono">05</span> <span data-edit="nav.contact">Kontak</span></a>
  </nav>
  <div class="drawer__tools">
    <button class="drawer__lang mono" id="langToggleDrawer" type="button">Bahasa: <span data-lang-name>Indonesia</span></button>
    <button class="drawer__theme mono" id="themeToggleDrawer" type="button">Tema: <span data-theme-name>Terang</span></button>
  </div>
</div>

<main id="top">

<!-- ============ HERO ============ -->
<section class="hero" id="hero">
  <div class="hero__frame" aria-hidden="true">
    <span class="hero__hair"></span><span class="hero__hair"></span><span class="hero__hair"></span>
    <span class="hero__hair"></span><span class="hero__hair"></span><span class="hero__hair"></span>
    <span class="hero__edge hero__edge--l"></span>
    <span class="hero__edge hero__edge--r"></span>
    <span class="hero__glow"></span>
    <span class="hero__trace"></span>
  </div>

  <figure class="hero__figure">
    <img id="heroPortrait" alt="Potret Dimas Parama" data-edit-img="profile.portrait" />
  </figure>

  <div class="hero__top">
    <div class="hero__brandblock">
      <span class="hero__kicker" data-edit="hero.kicker">JIKOSOUKAI</span>
      <p class="hero__kicker-text" data-edit="hero.kickerText">ディマス・パラマ</p>
      <span class="hero__hello mono" data-edit="hero.greeting">Halo aku Dimas!</span>
    </div>
    <div class="hero__meta">
      <span class="hero__date script" data-edit="hero.dateText">Bali, 27-11-2009</span>
      <span class="hero__project mono" data-edit="hero.projectBy">Project by DP's Project</span>
    </div>
  </div>

  <div class="hero__stage">
    <span class="hero__kanji" aria-hidden="true" data-edit="profile.kanji">ディマス</span>

    <h1 class="hero__name" aria-label="Dimas Parama">
      <span aria-hidden="true">D</span><span aria-hidden="true">I</span><span aria-hidden="true">M</span><span aria-hidden="true">A</span><span aria-hidden="true">S</span>
    </h1>

    <span class="hero__sign script" id="heroSignature">Parama</span>
    <span class="hero__side mono" aria-hidden="true">PORTFOLIO</span>
  </div>

  <div class="hero__bottom">
    <div class="hero__news"></div>
    <div class="hero__quote">
      <h2 class="hero__label" data-edit="hero.quoteLabel">The Question Is:</h2>
      <p class="script" data-edit="hero.quoteText">it's not impossible, it's just hard</p>
      <span class="hero__by mono" data-edit="hero.quoteBy">~Dimas Parama~</span>
    </div>
  </div>

  <a class="hero__scroll mono" href="#profile" aria-label="Gulir ke profil">
    <span data-edit="hero.scrollLabel">SCROLL</span><i aria-hidden="true"></i>
  </a>
</section>

<!-- ============ MARQUEE ============ -->
<div class="marquee" aria-hidden="true">
  <div class="marquee__track" id="marqueeTrack"></div>
</div>

<!-- ============ PROFILE ============ -->
<section class="section section--profile" id="profile">
  <div class="shell">
    <header class="sec-mark">
      <span class="sec-mark__line" aria-hidden="true"></span>
      <span class="mono" data-edit="about.sectionLabel">01 — Profil</span>
    </header>

    <div class="profile">
      <figure class="profile__figure">
        <div class="profile__photo">
          <img id="aboutPortrait" alt="Potret profil Dimas" data-edit-img="about.portrait" loading="lazy" />
        </div>
        <figcaption class="profile__cap mono">
          <span data-edit="about.captionLeft">NO. 001 — PORTRAIT</span>
          <span data-edit="about.captionRight">BALI</span>
        </figcaption>
      </figure>

      <div class="profile__body">
        <span class="profile__kanji" aria-hidden="true" data-edit="profile.kanji">ディマス</span>
        <h2 class="profile__title">
          <span class="display" data-edit="about.heading">Halo, aku</span>
          <span class="script profile__script" data-edit="about.scriptName">Dimas!</span>
        </h2>
        <div class="profile__text" id="aboutText"></div>
        <dl class="facts" id="aboutFacts"></dl>
        <a class="resume mono" id="resumeLink" href="#" hidden>
          <span>Lihat CV</span>
          <span class="resume__ico" aria-hidden="true"></span>
        </a>
      </div>
    </div>
  </div>
</section>

<!-- ============ BIOGRAPHY ============ -->
<section class="section section--bio" id="biography">
  <div class="shell">
    <header class="sec-mark">
      <span class="sec-mark__line" aria-hidden="true"></span>
      <span class="mono" data-edit="bio.sectionLabel">02 — Biografi</span>
    </header>

    <div class="bio">
      <div class="bio__head">
        <h2 class="bio__title display" data-edit="bio.title">Riwayat singkat</h2>
        <p class="bio__quote script" data-edit="bio.quote"></p>
      </div>
      <div class="bio__story" id="bioStory"></div>
      <dl class="bio__list" id="bioList"></dl>
      <div class="edu" id="bioEducation">
        <header class="edu__head">
          <h3 class="edu__title" data-edit="bio.educationTitle">Riwayat pendidikan</h3>
          <span class="mono" data-edit="bio.educationLabel">Pendidikan</span>
        </header>
        <ol class="edu__list" id="eduList"></ol>
      </div>
    </div>
  </div>
</section>

<!-- ============ STAGE / ACCORDION ============ -->
<section class="section section--stage" id="stage">
  <div class="shell">
    <header class="sec-mark">
      <span class="sec-mark__line" aria-hidden="true"></span>
      <span class="mono" data-edit="stage.sectionLabel">03 — Prestasi</span>
    </header>

    <div class="sec-head">
      <h2 class="sec-head__title">
        <span class="display" data-edit="stage.heading">Jejak</span>
        <span class="script" data-edit="stage.script">prestasi</span>
      </h2>
      <p class="sec-head__sub" data-edit="stage.sub">Hal-hal yang sudah dikerjakan — dari coding, desain, sampai panggung seni.</p>
    </div>

    <div class="accordion" id="stageList"></div>

    <!-- ---- project ---- -->
    <div class="projects" id="projects">
      <header class="projects__head">
        <div class="projects__title">
          <span class="mono" data-edit="projects.label">Karya terpilih</span>
          <h3 class="projects__heading">
            <span class="display" data-edit="projects.heading">Project</span>
            <span class="script" data-edit="projects.script">yang pernah dibuat</span>
          </h3>
        </div>
        <p class="projects__sub" data-edit="projects.sub">Kumpulan proyek yang dikerjakan sendiri maupun bersama tim. Klik salah satu kartu untuk melihat detail dan foto dokumentasinya.</p>
      </header>

      <div class="projects__grid" id="projectList"></div>
      <p class="projects__note mono" data-edit="projects.note">Klik kartu untuk melihat detail dan foto dokumentasi.</p>
    </div>
  </div>
</section>

<!-- ============ PROJECT DETAIL ============ -->
<div class="pdetail" id="projectDetail" hidden role="dialog" aria-modal="true" aria-label="Detail project">
  <div class="pdetail__veil" data-close-pd></div>
  <div class="pdetail__sheet" role="document">
    <button class="pdetail__close" id="pdClose" type="button" aria-label="Tutup detail">
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 6l12 12M18 6L6 18"/></svg>
    </button>
    <div class="pdetail__scroll" id="pdScroll">
      <figure class="pdetail__cover" id="pdCover"></figure>
      <div class="pdetail__body">
        <span class="mono pdetail__no" id="pdNo"></span>
        <h3 class="pdetail__title" id="pdTitle"></h3>
        <p class="pdetail__desc" id="pdDesc"></p>
        <dl class="pdetail__meta" id="pdMeta"></dl>
        <p class="pdetail__detail" id="pdDetail"></p>
        <a class="pdetail__link mono" id="pdLink" href="#" target="_blank" rel="noopener" hidden>
          <span>Buka tautan</span>
          <span class="pdetail__linkico" aria-hidden="true"></span>
        </a>
        <div class="pdetail__docs" id="pdDocs" hidden>
          <span class="mono" id="pdDocsLabel">Dokumentasi</span>
          <div class="pdetail__docgrid" id="pdDocGrid"></div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ============ CERTIFICATE ============ -->
<section class="section section--certificate" id="certificate">
  <div class="shell">
    <header class="sec-mark">
      <span class="sec-mark__line" aria-hidden="true"></span>
      <span class="mono" data-edit="certificate.sectionLabel">03 — Sertifikat</span>
    </header>

    <div class="sec-head sec-head--split">
      <h2 class="sec-head__title">
        <span class="display" data-edit="certificate.heading">Bukti</span>
        <span class="script" data-edit="certificate.script">belajar</span>
      </h2>
      <p class="sec-head__sub" data-edit="certificate.sub">Sertifikat dan penghargaan dari kursus, kompetisi, serta kegiatan yang pernah diikuti.</p>
    </div>
  </div>

  <div class="certs" id="certificateList"></div>

  <div class="shell">
    <p class="certs__note mono" data-edit="certificate.note">Sertifikat segera hadir.</p>
  </div>
</section>

<!-- ============ SKILLS ============ -->
<section class="section section--skills" id="skills">
  <div class="shell">
    <header class="sec-mark">
      <span class="sec-mark__line" aria-hidden="true"></span>
      <span class="mono" data-edit="skills.sectionLabel">05 — Keahlian</span>
    </header>

    <div class="sec-head">
      <h2 class="sec-head__title">
        <span class="display" data-edit="skills.heading">Yang aku</span>
        <span class="script" data-edit="skills.script">pelajari</span>
      </h2>
      <p class="sec-head__sub" data-edit="skills.sub">Hal-hal yang aku tekuni, dari menulis kode sampai menyusun tampilan.</p>
    </div>

    <div class="skills" id="skillsList"></div>

    <div class="gh" id="githubBlock" hidden>
      <header class="gh__head">
        <h3 class="gh__title" data-edit="skills.githubTitle">GitHub</h3>
        <a class="gh__link mono" id="githubLink" href="https://github.com" target="_blank" rel="noopener">
          <span data-gh-user>@github</span>
          <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M7 17 17 7M8 7h9v9"/></svg>
        </a>
      </header>
      <p class="gh__note" data-edit="skills.githubNote">Proyek yang sedang dan pernah aku kerjakan.</p>
      <div class="gh__repos" id="githubRepos"></div>
      <p class="gh__state mono" id="githubState"></p>
    </div>

    <p class="skills__note mono" data-edit="skills.note">Keahlian tumbuh dari rasa ingin tahu yang tidak pernah berhenti.</p>
  </div>
</section>

<!-- ============ QUOTE ============ -->
<section class="quote" id="quote">
  <span class="quote__mark mono" data-edit="quote.sectionLabel">— The Question Is</span>
  <blockquote class="quote__body">
    <p class="quote__text" data-edit="quote.text">It's not impossible. it's just hard.</p>
    <footer class="quote__by script" data-edit="quote.by">Dimas Parama</footer>
  </blockquote>
</section>

<!-- ============ GALLERY ============ -->
<section class="section section--gallery" id="gallery">
  <div class="shell">
    <header class="sec-mark">
      <span class="sec-mark__line" aria-hidden="true"></span>
      <span class="mono" data-edit="gallery.sectionLabel">04 — Galeri</span>
    </header>

    <div class="sec-head sec-head--split">
      <h2 class="sec-head__title">
        <span class="display" data-edit="gallery.heading">Potret</span>
        <span class="script" data-edit="gallery.script">Dimas</span>
      </h2>
      <p class="gallery__hint mono" data-edit="gallery.hint">Geser untuk melihat →</p>
    </div>
  </div>

  <div class="gallery" id="galleryStrip"></div>

  <div class="shell">
    <p class="gallery__note mono" data-edit="gallery.note">Potret segera hadir.</p>
  </div>
</section>

<!-- ============ CONTACT / FOOTER ============ -->
<footer class="contact" id="contact">
  <div class="shell">
    <header class="sec-mark sec-mark--light">
      <span class="sec-mark__line" aria-hidden="true"></span>
      <span class="mono" data-edit="contact.sectionLabel">05 — Kontak</span>
    </header>

    <h2 class="contact__title">
      <span class="display" data-edit="contact.heading">Terima kasih sudah</span>
      <span class="script" data-edit="contact.script">mampir!</span>
    </h2>

    <div class="socials" id="contactSocials"></div>

    <div class="contact__meta">
      <div class="contact__scroll mono" id="contactScroll">
        <div class="contact__scrolltrack" id="contactScrollTrack">
          <span data-edit="footer.projectBy">Project by Dimas Parama · © Pridiprakasa</span>
        </div>
      </div>
      <span class="script contact__date" data-edit="footer.date">Bali, 27-11-2009</span>
      <a class="contact__top mono" href="#top" id="backTop">
        <span data-edit="footer.backTop">Kembali ke atas</span>
        <span class="contact__top-btn" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
        </span>
      </a>
    </div>

    <div class="contact__foot mono">
      <span class="contact__visits"><i aria-hidden="true"></i><span data-edit="footer.visitsLabel">Kunjungan</span> <strong id="visitCount">—</strong></span>
      <span class="contact__sig">Dimas Parama</span>
    </div>
  </div>

  <div class="wordmark" aria-hidden="true">
    <div class="wordmark__track" id="footerWordmarkTrack"></div>
  </div>
</footer>

</main>

<!-- ============ LIGHTBOX ============ -->
<div class="lightbox" id="lightbox" hidden role="dialog" aria-modal="true" aria-label="Galeri potret">
  <div class="lightbox__veil" data-close-lb></div>
  <button class="lightbox__close" id="lbClose" type="button" aria-label="Tutup">
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 6l12 12M18 6L6 18"/></svg>
  </button>
  <button class="lightbox__arrow lightbox__arrow--prev" id="lbPrev" type="button" aria-label="Potret sebelumnya">
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 5l-7 7 7 7"/></svg>
  </button>
  <figure class="lightbox__stage">
    <img id="lbImg" alt="" />
    <figcaption class="lightbox__bar mono">
      <span id="lbCap"></span>
      <span id="lbCount"></span>
    </figcaption>
  </figure>
  <button class="lightbox__arrow lightbox__arrow--next" id="lbNext" type="button" aria-label="Potret berikutnya">
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 5l7 7-7 7"/></svg>
  </button>
</div>

<div class="toast" id="toast" role="status" aria-live="polite"></div>

<script src="js/data.js"></script>
<script src="js/icons.js"></script>
<script src="js/api.js"></script>
<script src="js/site.js"></script>
<script src="js/admin-gate.js"></script>
</body>
</html>
