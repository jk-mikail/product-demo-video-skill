/* Örnek ekran. Class'ları ve metinleri gerçek bileşenden kopyalayın.
 * Senaryoda anılan her öğeye data-demo verin; aynı anda tek görünür eşleşme olsun. */
Demo.gorunumKaydet("ana", (el) => {
  const d = Demo.durum;
  el.innerHTML = `
    <div class="p-6 space-y-3" data-demo="liste">
      ${d.kayitlar.map((k) => `
        <button class="w-full flex justify-between rounded-lg border p-4 text-left"
                data-demo="kayit-${k.id}">
          <span class="font-medium">${k.ad}</span>
          <span class="text-sm" data-demo="durum-${k.id}">${k.durum === "tamamlandi" ? "Tamamlandı" : k.saat}</span>
        </button>`).join("")}
    </div>`;
  el.querySelectorAll("[data-demo^=kayit-]").forEach((b) =>
    b.addEventListener("click", () => {
      const k = d.kayitlar.find((x) => "kayit-" + x.id === b.dataset.demo);
      Demo.pencereAc((kok) => pencere(kok, k));
    }));
});

function pencere(kok, k) {
  kok.innerHTML = `
    <div class="fixed inset-0 bg-black/40 grid place-items-center">
      <div class="bg-white rounded-xl p-6 w-[28rem] max-w-full space-y-4" data-demo="pencere">
        <h2 class="text-lg font-semibold">${k.ad}</h2>
        <button class="rounded-md bg-blue-600 text-white px-4 py-2" data-demo="tamamla">Tamamla</button>
        <button class="ml-2 text-sm" data-demo="pencere-kapat">Kapat</button>
      </div>
    </div>`;
  kok.querySelector("[data-demo=tamamla]").onclick = () => {
    // gerçek API yerine gecikme taklidi
    setTimeout(() => { k.durum = "tamamlandi"; Demo.pencereKapat(); }, 800);
  };
  kok.querySelector("[data-demo=pencere-kapat]").onclick = () => Demo.pencereKapat();
}
