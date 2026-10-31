/* Shared fake data + state + router. Do NOT use real data. Turkish method names have English aliases at the bottom. */
window.Demo = (function () {
  const gorunumler = {};
  let pencereRender = null;

  const durum = {
    // example: everything the scenario changes lives here
    kayitlar: [
      { id: 1, ad: "Alex Morgan", saat: "14:00", durum: "pending" },
      { id: 2, ad: "Sam Lee", saat: "11:00", durum: "done" },
    ],
  };

  function yenile() {
    const ad = (location.hash || "#ana").slice(1);
    const el = document.getElementById("gorunum");
    el.innerHTML = "";
    (gorunumler[ad] || gorunumler.ana || (() => {}))(el);
    if (pencereRender) {
      const k = document.getElementById("pencere-kok");
      k.innerHTML = "";
      pencereRender(k);
    }
    if (window.lucide) lucide.createIcons();
  }

  const api = {
    durum,
    gorunumKaydet: (ad, fn) => (gorunumler[ad] = fn),
    pencereAc(fn) { pencereRender = fn; yenile(); },
    pencereKapat() { pencereRender = null; document.getElementById("pencere-kok").innerHTML = ""; yenile(); },
    yenile,
    mobilMi: () => window.innerWidth <= 640,   // same breakpoint as the real app
    basla() { window.addEventListener("hashchange", yenile); yenile(); },
  };
  // English aliases
  Object.assign(api, { state: durum, registerView: api.gorunumKaydet, openDialog: api.pencereAc,
    closeDialog: api.pencereKapat, refresh: yenile, isMobile: api.mobilMi, start: api.basla });
  return api;
})();
