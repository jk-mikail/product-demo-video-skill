/* Paylaşılan sahte veri + durum + yönlendirici. Gerçek veri KULLANMAYIN. */
window.Demo = (function () {
  const gorunumler = {};
  let pencereRender = null;

  const durum = {
    // örnek: senaryoda değişecek her şey burada
    kayitlar: [
      { id: 1, ad: "Deniz Kaya", saat: "14:00", durum: "bekliyor" },
      { id: 2, ad: "Murat Şahin", saat: "11:00", durum: "tamamlandi" },
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
    mobilMi: () => window.innerWidth <= 640,   // gerçek uygulamanın kırılımıyla aynı olsun
    basla() { window.addEventListener("hashchange", yenile); yenile(); },
  };
  // English aliases
  Object.assign(api, { state: durum, registerView: api.gorunumKaydet, openDialog: api.pencereAc,
    closeDialog: api.pencereKapat, refresh: yenile, isMobile: api.mobilMi, start: api.basla });
  return api;
})();
