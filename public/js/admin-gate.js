/* ============================================================
   ADMIN GATE — akses panel admin secara khusus
   ------------------------------------------------------------
   Panel admin tidak ditautkan di mana pun. Tiga cara membukanya:

   1. Ketuk logo "Dimas" di navbar 5x dalam 3 detik.
   2. Tekan Ctrl/Cmd + Shift + A.
   3. Buka langsung path rahasianya (lihat ADMIN_PATH di server).
   ============================================================ */

(() => {
  const path = document.body.dataset.gate || "/kelola";
  const brand = document.querySelector(".nav__brand");
  let taps = 0;
  let timer = null;

  function open() {
    window.location.href = path;
  }

  function tap() {
    taps += 1;
    clearTimeout(timer);
    timer = setTimeout(() => (taps = 0), 3000);
    if (taps >= 5) {
      taps = 0;
      open();
    }
  }

  if (brand) {
    brand.addEventListener("click", (e) => {
      // keep the normal anchor behaviour unless the secret gesture is used
      tap();
    });
    brand.addEventListener("touchend", tap, { passive: true });
  }

  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "a") {
      e.preventDefault();
      open();
    }
  });
})();
