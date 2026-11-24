<!DOCTYPE html>
<html lang="id" data-mode="light">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Panel Admin — Portofolio</title>
<meta name="robots" content="noindex" />
<meta name="theme-color" content="#f7f5f0" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital%400;1&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="css/site.css" />
<link rel="stylesheet" href="css/admin.css" />
<link rel="icon" href="assets/favicon.svg" />
</head>
<body class="admin">

<!-- ============ LOGIN ============ -->
<div class="login" id="login" hidden>
  <div class="login__card">
    <span class="mono">Panel admin</span>
    <h1 class="login__title">Masuk untuk <em>mengelola</em></h1>
    <p class="login__note">Masukkan password admin yang dibuat saat server pertama kali dijalankan.</p>
    <form id="loginForm" class="login__form" novalidate>
      <label class="field">
        <span class="mono">Password</span>
        <input type="password" id="loginPass" autocomplete="current-password" placeholder="••••••••" required />
      </label>
      <p class="login__error" id="loginError" hidden></p>
      <button class="btn btn--solid btn--full" type="submit">Masuk</button>
    </form>
    <a class="login__back mono" href="/">Kembali ke website</a>
  </div>
</div>

<!-- ============ APP ============ -->
<div class="shell" id="shell" hidden>
  <header class="topbar">
    <a class="topbar__brand" href="/">
      <span class="topbar__logo" id="topLogo">R</span>
      <span>
        <strong id="topName">Portofolio</strong>
        <span class="mono" id="topState">tersambung ke server</span>
      </span>
    </a>

    <div class="topbar__mid">
      <span class="pill" id="editModePill"></span>
      <span class="pill pill--muted" id="savedAt"></span>
    </div>

    <div class="topbar__actions">
      <a class="btn btn--ghost btn--tiny" href="/" id="previewBtn">Lihat website
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M7 17 17 7M8 7h9v9"/></svg>
      </a>
      <button class="btn btn--solid btn--tiny" id="saveBtn">
        <span id="saveLabel">Simpan</span>
      </button>
      <button class="btn btn--ghost btn--tiny" id="logoutBtn" title="Keluar">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M14 4h6v16h-6M10 12l6-6M16 18l-6-6"/></svg>
      </button>
    </div>
  </header>

  <div class="workspace">
    <nav class="sidebar" id="tabs" aria-label="Bagian konten"></nav>

    <main class="panel" id="panel">
      <div class="panel__head">
        <div>
          <h2 class="panel__title" id="panelTitle"></h2>
          <p class="panel__sub" id="panelSub"></p>
        </div>
        <span class="mono" id="panelCount"></span>
      </div>
      <form class="panel__body" id="panelBody" autocomplete="off"></form>
    </main>

    <aside class="inspector" id="inspector">
      <div class="inspect" id="inspectMount"></div>
      <div class="inspect__note">
        <span class="mono">Semua perubahan tersimpan di server</span>
        <p>Data disimpan di database SQLite dan gambar di folder <code>storage/app/public/uploads/</code>. Bisa diakses dari perangkat mana pun.</p>
      </div>
    </aside>
  </div>
</div>

<!-- background removal progress -->
<div class="bgmodal" id="bgModal" hidden>
  <div class="bgmodal__card">
    <div class="bgmodal__spinner"></div>
    <strong id="bgTitle">Menghapus background…</strong>
    <p id="bgNote">Proses berjalan di browser kamu. Pemakaian pertama mengunduh model (~40MB).</p>
    <div class="bgmodal__bar"><i id="bgBar"></i></div>
  </div>
</div>

<div class="toast" id="toast" role="status" aria-live="polite"></div>

<script src="js/data.js"></script>
<script src="js/icons.js"></script>
<script src="js/api.js"></script>
<script src="js/imaging.js"></script>
<script src="js/admin.js"></script>
</body>
</html>
