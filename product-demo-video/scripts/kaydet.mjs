#!/usr/bin/env node
/*
 * Senaryoyu tarayıcıda oynatıp kaydeder. Proje kökünden çalıştırın:
 *   node <skill>/scripts/kaydet.mjs masaustu|mobil|desktop|mobile [--url file:///.../demo/index.html#ana]
 *        [--senaryo senaryo.json] [--ad masaustu] [--yavas 2.5] [--kareler /tmp/dizin] [--cikti cikti]
 * Varsayılanlar çalışma dizinine göredir: ./demo/index.html, ./senaryo.json, ./cikti/
 *
 * Görüntü Playwright recordVideo ile DEĞİL, CDP Page.startScreencast ile alınır:
 * recordVideo 1 Mbps VP8 / 25 fps sabit (1080p'de bulanık) ve ayrı ffmpeg indirmesi ister.
 * Screencast her kareyi JPEG (q=92) + gerçek zaman damgasıyla verir; kareler concat listesiyle
 * sistem ffmpeg'ine 30 fps sabit kare hızında, neredeyse kayıpsız (crf 10) `cikti/<ad>-ham.mkv`
 * olarak yazılır. Zaman ölçümü aynı saatten yapılır: 0 ms = ilk kare.
 */
import { chromiumYukle, chromeYolu } from "./pw.mjs";
import { senaryoOku, cihazAdi } from "./senaryo.mjs";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const BETIK = path.dirname(fileURLToPath(import.meta.url));
const KOK = process.cwd();
const arg = process.argv.slice(2);
const cihaz = cihazAdi(arg[0]) === "mobil" ? "mobil" : "masaustu";
const opt = (ad, vars) => { const i = arg.indexOf("--" + ad); return i >= 0 ? arg[i + 1] : vars; };
const URL_ = opt("url", "file://" + path.join(KOK, "demo/index.html") + "#takvim");
const SENARYO = path.resolve(opt("senaryo", path.join(KOK, "senaryo.json")));
const AD = opt("ad", arg[0] && !arg[0].startsWith("--") ? arg[0] : cihaz);
const CIKTI = path.resolve(opt("cikti", path.join(KOK, "cikti")));
// Ağır makinede screencast kare hızı düşük kalırsa sahne YAVAŞ ÇEKİMDE oynatılır: sayfanın saatleri
// (setTimeout/setInterval/Date/performance.now/rAF) ve CSS animasyonları 1/K hızına alınır, kare zamanları K'ya
// bölünür. Sonuç normal hızda ama K kat daha akıcıdır. Varsayılan: masaüstü 2.5, mobil 2.
const K = Number(opt("yavas", cihaz === "mobil" ? 2 : 2.5));
const KARE_DIZIN = path.resolve(opt("kareler", path.join(os.tmpdir(), `tanitim-kareler-${AD}`)));
const ANLATIM_PAY = 600;     // anlatım sonrası küçük nefes payı (ms)
const SAHNE_ARASI = 400;
const YAZ_GECIKME = 55;
const OK_SURE = 1200;

const CIHAZ = {
  masaustu: { viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
  mobil: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true,
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1" },
}[cihaz];
const PIKSEL = { w: CIHAZ.viewport.width * CIHAZ.deviceScaleFactor, h: CIHAZ.viewport.height * CIHAZ.deviceScaleFactor };

const gercekUyku = (ms) => new Promise((r) => setTimeout(r, ms));
const uyku = (ms) => gercekUyku(ms * K); // sahne zamanı
const uyarilar = [];
const uyar = (m) => { uyarilar.push(m); console.warn("UYARI:", m); };
const senaryo = senaryoOku(SENARYO);
const AYAR = senaryo.ayar;
const KARAKTER_SN = AYAR.karakterSn; // seslendirme okuma hızı (tr ≈ 14, en ≈ 15 karakter/sn)
const anlatimMs = (s) => Math.ceil(((s || "").length / KARAKTER_SN) * 1000);
await fs.rm(KARE_DIZIN, { recursive: true, force: true });
await fs.mkdir(KARE_DIZIN, { recursive: true });
await fs.mkdir(CIKTI, { recursive: true });

const chromium = await chromiumYukle();
const browser = await chromium.launch({
  executablePath: chromeYolu(),
  headless: true,
  // vsync/frame-limit kapalı değilse headless screencast compositor animasyonlarında ~1 sn sonra durur
  args: ["--hide-scrollbars", "--force-color-profile=srgb", "--font-render-hinting=none", "--disable-gpu-vsync", "--disable-frame-rate-limit", "--disable-spell-checking"],
});
const context = await browser.newContext({ ...CIHAZ, locale: AYAR.locale, timezoneId: AYAR.timezone, colorScheme: "light" });
await context.addInitScript((a) => { window.OV_AYAR = a; }, { marka: AYAR.marka, rozet: AYAR.rozet, renk: AYAR.renk, font: AYAR.font });
if (K !== 1) {
  await context.addInitScript((K) => {
    const rs = window.setTimeout.bind(window), ri = window.setInterval.bind(window);
    window.setTimeout = (f, ms, ...a) => rs(f, (Number(ms) || 0) * K, ...a);
    window.setInterval = (f, ms, ...a) => ri(f, (Number(ms) || 0) * K, ...a);
    const pn = performance.now.bind(performance), p0 = pn();
    performance.now = () => p0 + (pn() - p0) / K;
    const RD = Date, d0 = RD.now(), sn = () => d0 + (RD.now() - d0) / K;
    class D extends RD { constructor(...a) { if (a.length === 0) super(sn()); else super(...a); } static now() { return sn(); } }
    window.Date = D;
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (cb) => raf((t) => cb(p0 + (t - p0) / K));
  }, K);
}
await context.addInitScript(() => {
  document.addEventListener("DOMContentLoaded", () => { document.documentElement.spellcheck = false; document.body && (document.body.spellcheck = false); });
});
const page = await context.newPage();
const cdp = await context.newCDPSession(page);

// ---- screencast ----
const kareler = []; // {dosya, t(ms epoch)}
let yazmalar = [];
let t0 = null;
cdp.on("Page.screencastFrame", (f) => {
  cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
  const t = f.metadata.timestamp ? f.metadata.timestamp * 1000 : Date.now();
  if (t0 == null) t0 = t;
  const dosya = path.join(KARE_DIZIN, String(kareler.length).padStart(6, "0") + ".jpg");
  kareler.push({ dosya, t });
  yazmalar.push(fs.writeFile(dosya, Buffer.from(f.data, "base64")));
});
await cdp.send("Page.startScreencast", { format: "jpeg", quality: 92, maxWidth: PIKSEL.w, maxHeight: PIKSEL.h, everyNthFrame: 1 });
const simdi = () => Math.round((Date.now() - (t0 ?? Date.now())) / K);
async function animasyonHizi() {
  if (K === 1) return;
  await cdp.send("Animation.enable").catch(() => {});
  await cdp.send("Animation.setPlaybackRate", { playbackRate: 1 / K }).catch((e) => uyar("Animation.setPlaybackRate: " + e.message));
}
await animasyonHizi();

await page.goto(URL_, { waitUntil: "load" });
await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
await animasyonHizi();
if (!(await page.evaluate(() => !!window.Ov))) {
  await page.addScriptTag({ path: path.join(BETIK, "overlay.js") });
}
await uyku(800);
if (t0 == null) { await uyku(500); }

// ---- yardımcılar ----
async function bul(sel, bekleMs = 5000) {
  const loc = page.locator(`[data-demo="${sel}"]`).filter({ visible: true }).first();
  try {
    await loc.waitFor({ state: "visible", timeout: bekleMs * K });
  } catch {
    return null;
  }
  const kutuAl = () => loc.boundingBox({ timeout: 800 * K }).catch(() => null);
  const once = await kutuAl();
  try { await loc.scrollIntoViewIfNeeded({ timeout: 1500 * K }); } catch {}
  await uyku(90);
  let kutu = await kutuAl();
  // kaydırma olduysa (pencere kendi de yumuşak kaydırıyor) yerleşmesini bekle, rect'i ondan SONRA al
  if (once && kutu && Math.hypot(once.x - kutu.x, once.y - kutu.y) > 2) { await uyku(350); kutu = await kutuAl(); }
  if (!kutu) return null;
  return { loc, kutu };
}
const merkez = (k) => ({ x: k.x + k.width / 2, y: k.y + Math.min(k.height / 2, 40) });
const imlec = (x, y, ms) => page.evaluate(([x, y, ms]) => Ov.imlecGit(x, y, ms), [x, y, ms ?? null]);

async function adimCalistir(a, kayit) {
  switch (a.tur) {
    case "baslik":
      await page.evaluate(([u, al, ms, ek]) => Ov.baslik(u, al, ms, ek), [a.ust, a.alt, a.ms || 4000, { sema: a.sema, cipler: a.cipler }]);
      return;
    case "git":
      await page.evaluate((h) => { if (location.hash !== h) location.hash = h; else window.Demo && Demo.yenile(); }, a.hash);
      await uyku(350);
      return;
    case "bekle":
      await uyku(a.ms || 500);
      return;
    case "temizle":
      await page.evaluate(() => Ov.temizle());
      await uyku(300);
      return;
    case "ok": {
      const h = await bul(a.sel);
      if (!h) return atla(a, kayit);
      await page.evaluate(([k, e, y]) => Ov.ok(k, e, y), [h.kutu, a.etiket, a.yon]);
      await uyku(Math.max(400, (a.ms || 2000) - 750));
      await page.evaluate(() => Ov.okKaldir());
      await uyku(250);
      return;
    }
    case "isik": {
      const h = await bul(a.sel);
      if (!h) return atla(a, kayit);
      await page.evaluate((k) => Ov.isik(k), h.kutu);
      await uyku(Math.max(400, (a.ms || 2000) - 450));
      await page.evaluate(() => Ov.isikKaldir());
      await uyku(350);
      return;
    }
    case "tikla":
    case "yaz": {
      const h = await bul(a.sel);
      if (!h) return atla(a, kayit);
      const m = merkez(h.kutu);
      await imlec(m.x, m.y);
      if (a.ok) {
        await page.evaluate(([k, e, y]) => Ov.ok(k, e, y), [h.kutu, a.ok, a.yon]);
        await uyku(OK_SURE - 750 + 200);
      }
      // kaydırma olmuş olabilir: son konumu tekrar ölç
      const k2 = (await h.loc.boundingBox({ timeout: 800 * K }).catch(() => null)) || h.kutu;
      const m2 = merkez(k2);
      if (Math.hypot(m2.x - m.x, m2.y - m.y) > 3) await imlec(m2.x, m2.y, 250);
      await page.evaluate(([x, y]) => Ov.tikHalkasi(x, y), [m2.x, m2.y]);
      try {
        await h.loc.click({ timeout: 4000 * K, position: { x: m2.x - k2.x, y: m2.y - k2.y } });
      } catch (e) {
        uyar(`${kayit.sahneId}: '${a.sel}' tıklanamadı (${String(e.message).split("\n")[0]})`);
        kayit.uyari = "tıklanamadı";
      }
      if (a.ok) await page.evaluate(() => Ov.okKaldir());
      if (a.tur === "yaz") {
        await uyku(200);
        try {
          await h.loc.pressSequentially(a.metin || "", { delay: YAZ_GECIKME * K });
        } catch (e) {
          uyar(`${kayit.sahneId}: '${a.sel}' yazılamadı (${String(e.message).split("\n")[0]})`);
          kayit.uyari = "yazılamadı";
        }
        await uyku(300);
      } else {
        await uyku(450);
      }
      return;
    }
    default:
      uyar(`bilinmeyen adım türü: ${a.tur}`);
  }
}
function atla(a, kayit) {
  kayit.atlandi = true;
  uyar(`${kayit.sahneId}: [data-demo="${a.sel}"] görünür değil, '${a.tur}' adımı atlandı`);
}

// ---- senaryo ----
const sahneler = [];
for (const s of senaryo.sahneler) {
  if (s.yalniz && s.yalniz !== cihaz) continue;
  // yalnız başlık kartı olan sahnede dolgu kartın ARKASINA değil, kartın süresine eklenir
  const hedefMs = anlatimMs(s.anlatim) + ANLATIM_PAY;
  const kartlar = s.adimlar.filter((a) => a.tur === "baslik");
  const yalnizKart = kartlar.length === 1 && s.adimlar.every((a) => a.tur === "baslik" || a.tur === "bekle" || a.tur === "temizle");
  const sk = { id: s.id, bas: simdi(), bit: null, anlatimTahminiMs: anlatimMs(s.anlatim), dolguMs: 0, adimlar: [] };
  console.log(`[${(sk.bas / 1000).toFixed(1)}s] sahne ${s.id}`);
  for (let a of s.adimlar) {
    if (a.yalniz && a.yalniz !== cihaz) continue;
    const ak = { tur: a.tur, sel: a.sel ?? null, etiket: a.etiket ?? a.ok ?? a.metin ?? a.ust ?? a.hash ?? null, bas: simdi(), bit: null, sahneId: s.id };
    try {
      if (yalnizKart && a.tur === "baslik") a = { ...a, ms: Math.max(a.ms || 4000, hedefMs) };
      await adimCalistir(a, ak);
    } catch (e) {
      uyar(`${s.id}: adım hatası ${a.tur} ${a.sel || ""}: ${String(e.message).split("\n")[0]}`);
      ak.uyari = "hata";
    }
    ak.bit = simdi();
    delete ak.sahneId;
    sk.adimlar.push(ak);
  }
  const hedef = sk.anlatimTahminiMs + ANLATIM_PAY;
  const gecen = simdi() - sk.bas;
  if (gecen < hedef) { sk.dolguMs = hedef - gecen; await uyku(sk.dolguMs); }
  sk.bit = simdi();
  sahneler.push(sk);
  await uyku(SAHNE_ARASI);
}
await uyku(600);
const sonMs = simdi();
await cdp.send("Page.stopScreencast").catch(() => {});
await uyku(200);
await Promise.all(yazmalar);
await context.close();
await browser.close();

// ---- kareler → ham video (30 fps sabit) ----
if (!kareler.length) { console.error("Hiç kare alınamadı"); process.exit(1); }
const satirlar = ["ffconcat version 1.0"];
for (let i = 0; i < kareler.length; i++) {
  const son = i === kareler.length - 1 ? t0 + sonMs * K : kareler[i + 1].t;
  const sure = Math.max(0.001, (son - kareler[i].t) / 1000 / K);
  satirlar.push(`file '${kareler[i].dosya}'`, `duration ${sure.toFixed(4)}`);
}
satirlar.push(`file '${kareler.at(-1).dosya}'`);
const liste = path.join(KARE_DIZIN, "liste.txt");
await fs.writeFile(liste, satirlar.join("\n") + "\n");
const ham = path.join(CIKTI, `${AD}-ham.mkv`);
const olcek = `scale=${PIKSEL.w}:${PIKSEL.h}:flags=lanczos,format=yuv420p`;
await new Promise((ok, red) => {
  const p = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", liste,
    "-vf", `${olcek},fps=30`, "-fps_mode", "cfr", "-c:v", "libx264", "-preset", "veryfast", "-crf", "10", ham], { stdio: "inherit" });
  p.on("exit", (c) => (c === 0 ? ok() : red(new Error("ffmpeg " + c))));
});

const zaman = {
  cihaz, ad: AD, dil: AYAR.dil, renk: AYAR.renk || null, url: URL_, viewport: CIHAZ.viewport, deviceScaleFactor: CIHAZ.deviceScaleFactor,
  video: path.basename(ham), videoPiksel: PIKSEL, fps: 30, yavasCekim: K, kareSayisi: kareler.length,
  not: "ms değerleri ham videonun başına göre (0 = ilk kare). birlestir.sh baştan ilkSahneMs kadar keser.",
  ilkSahneMs: sahneler[0]?.bas ?? 0, toplamMs: sonMs,
  sahneler, uyarilar,
};
await fs.writeFile(path.join(CIKTI, `${AD}-zaman.json`), JSON.stringify(zaman, null, 2));
console.log(`Bitti: ${ham} (${(sonMs / 1000).toFixed(1)} s, ${kareler.length} kare, ort. ${(kareler.length / (sonMs / 1000)).toFixed(1)} kare/s (video zamanı)), ${uyarilar.length} uyarı`);
