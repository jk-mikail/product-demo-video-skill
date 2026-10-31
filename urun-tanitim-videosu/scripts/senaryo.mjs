// Senaryo okuyucu. Türkçe ve İngilizce anahtarları aynı iç biçime çevirir.
// Scenario loader. Accepts Turkish or English keys and normalizes them to one internal shape.
import fs from "node:fs";

const TUR = { title: "baslik", goto: "git", click: "tikla", type: "yaz", arrow: "ok", spotlight: "isik", wait: "bekle", clear: "temizle" };
const YON = { top: "ust", bottom: "alt", left: "sol", right: "sag" };
const CIHAZ = { desktop: "masaustu", mobile: "mobil" };
const RENK = { dark: "koyu", dark2: "koyu2", accent: "vurgu", accent2: "vurgu2" };

export const cihazAdi = (v) => (v ? CIHAZ[v] || v : v);
const ilk = (o, ...k) => { for (const a of k) if (o[a] !== undefined) return o[a]; return undefined; };

function adim(a) {
  const tur = TUR[ilk(a, "tur", "type")] || ilk(a, "tur", "type");
  const n = {
    tur,
    sel: ilk(a, "sel", "target"),
    hash: a.hash,
    ms: a.ms,
    yalniz: cihazAdi(ilk(a, "yalniz", "only")),
    yon: (v => YON[v] || v)(ilk(a, "yon", "side")),
    etiket: ilk(a, "etiket", "label"),
    metin: ilk(a, "metin", "text"),
    sema: ilk(a, "sema", "flow"),
    cipler: ilk(a, "cipler", "chips"),
  };
  if (tur === "baslik") { n.ust = ilk(a, "ust", "title"); n.alt = ilk(a, "alt", "subtitle"); }
  else n.ok = ilk(a, "ok", "arrow"); // tikla/yaz üzerindeki ok etiketi · arrow label on click/type
  for (const k of Object.keys(n)) if (n[k] === undefined) delete n[k];
  return n;
}

export function senaryoOku(yol) {
  const ham = JSON.parse(fs.readFileSync(yol, "utf8"));
  const ingilizce = Array.isArray(ham.scenes) && !ham.sahneler;
  const ay = ilk(ham, "ayar", "settings") || {};
  const renkHam = ilk(ay, "renk", "colors") || {};
  const renk = {};
  for (const [k, v] of Object.entries(renkHam)) renk[RENK[k] || k] = v;
  const dil = ilk(ay, "dil", "language") || (ingilizce ? "en" : "tr");
  const ayar = {
    dil,
    marka: ilk(ay, "marka", "brand") ?? "",
    rozet: ilk(ay, "rozet", "badge") ?? (dil === "en" ? "Demo data" : "Demo verisi"),
    renk: Object.keys(renk).length ? renk : undefined,
    font: ay.font,
    karakterSn: ilk(ay, "karakterSn", "charsPerSec") || (dil === "en" ? 15 : 14),
    locale: ay.locale || (dil === "en" ? "en-US" : "tr-TR"),
    timezone: ilk(ay, "timezone", "timeZone") || (dil === "en" ? "UTC" : "Europe/Istanbul"),
  };
  const sahneler = (ham.sahneler || ham.scenes || []).map((s) => ({
    id: s.id,
    anlatim: ilk(s, "anlatim", "narration") || "",
    ekran: ilk(s, "ekran", "screen") || "",
    yalniz: cihazAdi(ilk(s, "yalniz", "only")),
    adimlar: (ilk(s, "adimlar", "steps") || []).map(adim),
  }));
  return { baslik: ilk(ham, "baslik", "title"), ayar, sahneler };
}
