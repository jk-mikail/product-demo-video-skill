/* Example view. Copy classes and texts from the real component.
 * Give every element the scenario mentions a data-demo name; only one visible match at a time. */
Demo.registerView("ana", (el) => {
  const d = Demo.state;
  el.innerHTML = `
    <div class="p-6 space-y-3" data-demo="liste">
      ${d.kayitlar.map((k) => `
        <button class="w-full flex justify-between rounded-lg border p-4 text-left"
                data-demo="kayit-${k.id}">
          <span class="font-medium">${k.ad}</span>
          <span class="text-sm" data-demo="durum-${k.id}">${k.durum === "done" ? "Completed" : k.saat}</span>
        </button>`).join("")}
    </div>`;
  el.querySelectorAll("[data-demo^=kayit-]").forEach((b) =>
    b.addEventListener("click", () => {
      const k = d.kayitlar.find((x) => "kayit-" + x.id === b.dataset.demo);
      Demo.openDialog((root) => dialog(root, k));
    }));
});

function dialog(root, k) {
  root.innerHTML = `
    <div class="fixed inset-0 bg-black/40 grid place-items-center">
      <div class="bg-white rounded-xl p-6 w-[28rem] max-w-full space-y-4" data-demo="pencere">
        <h2 class="text-lg font-semibold">${k.ad}</h2>
        <button class="rounded-md bg-blue-600 text-white px-4 py-2" data-demo="tamamla">Complete</button>
        <button class="ml-2 text-sm" data-demo="pencere-kapat">Close</button>
      </div>
    </div>`;
  root.querySelector("[data-demo=tamamla]").onclick = () => {
    // fake latency instead of a real API call
    setTimeout(() => { k.durum = "done"; Demo.closeDialog(); }, 800);
  };
  root.querySelector("[data-demo=pencere-kapat]").onclick = () => Demo.closeDialog();
}
