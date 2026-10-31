#!/usr/bin/env node
/*
 * zaman.json + senaryo.json → cikti/transkript.md, cikti/<ad>.srt
 *   node <skill>/scripts/transkript.mjs [masaustu_adi] [mobil_adi] [--senaryo senaryo.json] [--md transkript.md]
 * Proje kökünden çalıştırın. Ad verilmezse cikti/ içinde masaustu|desktop ve mobil|mobile aranır.
 * Run from the project root. Output language follows senaryo ayar.dil / settings.language (tr|en).
 * Zamanlar birlestir.sh'in kesimine göre kaydırılır (ilkSahneMs = 0).
 */
import fs from "node:fs";
import path from "node:path";
import { senaryoOku } from "./senaryo.mjs";

const KOK = process.cwd();
const C = process.env.CIKTI || path.join(KOK, "cikti");
const arg = process.argv.slice(2);
const opt = (ad, v) => { const i = arg.indexOf("--" + ad); return i >= 0 ? arg.splice(i, 2)[1] : v; };
const senaryoYolu = opt("senaryo", path.join(KOK, "senaryo.json"));
const mdAdi = opt("md", "transkript.md");
const varOlan = (...adlar) => adlar.find((a) => fs.existsSync(path.join(C, `${a}-zaman.json`))) || adlar[0];
const adlar = [arg[0] || varOlan("masaustu", "desktop"), arg[1] || varOlan("mobil", "mobile")];
const senaryo = senaryoOku(senaryoYolu);
const sahneById = Object.fromEntries(senaryo.sahneler.map((s) => [s.id, s]));
const EN = senaryo.ayar.dil === "en";

const M = EN ? {
  baslik: (b) => `# ${b || "Product demo video"} — transcript`,
  aciklama: "Times refer to the final video (`mm:ss.s`; leading blank frames removed). Source: timings measured during recording (`cikti/<device>-zaman.json`).",
  masa: (w, h) => `Desktop (${w}×${h})`, mobil: (w, h) => `Mobile (${w}×${h} viewport, vertical video)`,
  toplam: (t, n) => `Total ≈ ${t} · ${n} scenes`,
  kolon: "| Start | End | On screen | Narration |",
  dolgu: (s) => ` _(+${s} s wait for narration)_`,
  atlandi: " **(SKIPPED: element not found)**",
  kart: (u, a) => `Title card: «${u}»${a ? ` — ${a}` : ""}`, git: (h) => `Screen opens: ${h}`,
  tik: (s, o) => `Click: \`${s}\`${o ? ` (arrow: «${o}»)` : ""}`, yaz: (s, m) => `Type into \`${s}\`: «${m}»`,
  ok: (e, s) => `Arrow + label «${e}» → \`${s}\``, isik: (s) => `Spotlight (rest dimmed): \`${s}\``,
  uyarilar: "**Recording warnings:**",
  not: (k) => ["## Voice-over notes", "",
    "- Generate **one audio file per scene** (not one long file) and align each file to the scene's **Start** time.",
    `- Scene lengths assume ~${k} characters/second; if the generated audio is longer than its scene, raise the speed slightly or shorten the text.`,
    "- ~0.3 s of silence at the start of each file keeps clicks and arrows in sync naturally.",
    "- The `.srt` files split the same text over the scene by character ratio; use them as subtitles or as an alignment reference.", ""],
} : {
  baslik: (b) => `# ${b || "Tanıtım videosu"} — transkript`,
  aciklama: "Zamanlar yayın videosuna göredir (`mm:ss.s`; baştaki boş kareler kesilmiş). Kaynak: kayıt sırasında ölçülen gerçek zamanlar (`cikti/<cihaz>-zaman.json`).",
  masa: (w, h) => `Masaüstü (${w}×${h})`, mobil: (w, h) => `Mobil (${w}×${h} görünüm, dikey video)`,
  toplam: (t, n) => `Toplam süre ≈ ${t} · ${n} sahne`,
  kolon: "| Başlangıç | Bitiş | Ekranda | Seslendirme metni |",
  dolgu: (s) => ` _(anlatım için +${s} sn bekleme)_`,
  atlandi: " **(ATLANDI: öğe bulunamadı)**",
  kart: (u, a) => `Başlık kartı: «${u}»${a ? ` — ${a}` : ""}`, git: (h) => `Ekran açılır: ${h}`,
  tik: (s, o) => `Tıklanır: \`${s}\`${o ? ` (ok: «${o}»)` : ""}`, yaz: (s, m) => `Yazılır \`${s}\`: «${m}»`,
  ok: (e, s) => `Ok + etiket «${e}» → \`${s}\``, isik: (s) => `Spot (geri kalan karartılır): \`${s}\``,
  uyarilar: "**Kayıt uyarıları:**",
  not: (k) => ["## Seslendirme notu", "",
    "- Her sahnenin seslendirme metnini **ayrı bir dosya** olarak üretin (tek uzun metin değil); dosyayı o sahnenin tablodaki **Başlangıç** zamanına hizalayın.",
    `- Sahne süreleri metnin ~${k} karakter/sn okunacağı varsayımıyla gerekirse beklemeyle uzatıldı; üretilen ses sahneden uzun gelirse hızı biraz artırın ya da metni kısaltın.`,
    "- Başlangıçta ~0,3 sn sessizlik bırakmak tıklama/ok animasyonlarıyla senkronu doğal gösterir.",
    "- `.srt` dosyaları aynı metni sahne süresine karakter oranıyla bölerek verir; altyazı ya da hizalama referansı olarak kullanılabilir.", ""],
};

const mmss = (ms) => {
  ms = Math.max(0, ms);
  const m = Math.floor(ms / 60000), s = (ms % 60000) / 1000;
  return `${String(m).padStart(2, "0")}:${s.toFixed(1).padStart(4, "0")}`;
};
const srtZ = (ms) => {
  ms = Math.max(0, Math.round(ms));
  const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000), s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(ms % 1000).padStart(3, "0")}`;
};
const hucre = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");

function adimMetni(a, z) {
  const ek = z?.atlandi ? M.atlandi : z?.uyari ? ` **(${z.uyari})**` : "";
  const t = { baslik: () => M.kart(a.ust, a.alt), git: () => M.git(a.hash), tikla: () => M.tik(a.sel, a.ok),
    yaz: () => M.yaz(a.sel, a.metin), ok: () => M.ok(a.etiket, a.sel), isik: () => M.isik(a.sel) }[a.tur];
  return t ? t() + ek : null; // bekle, temizle: yazılmaz
}

// ≤84 karakterlik, ≤2 satırlık (satır ≤42) parçalar
function parcala(metin, max = 84) {
  const cumleler = metin.match(/[^.!?;:]+[.!?;:]*\s*/g) || [metin];
  const parcalar = [];
  for (let c of cumleler) {
    c = c.trim();
    if (!c) continue;
    if (c.length <= max) {
      const son = parcalar.at(-1);
      if (son && son.length + 1 + c.length <= max && son.length < 30) parcalar[parcalar.length - 1] = son + " " + c;
      else parcalar.push(c);
      continue;
    }
    const kelimeler = c.split(/\s+/);
    const hedef = c.length / Math.ceil(c.length / max);
    let cur = "";
    for (const k of kelimeler) {
      if (cur && (cur.length + 1 + k.length > max || cur.length >= hedef)) { parcalar.push(cur); cur = k; }
      else cur = cur ? cur + " " + k : k;
    }
    if (cur) parcalar.push(cur);
  }
  return parcalar;
}
function ikiSatir(p, satir = 42) {
  if (p.length <= satir) return p;
  let en = -1;
  for (let i = 0; i < p.length; i++) if (p[i] === " " && (en < 0 || Math.abs(i - p.length / 2) < Math.abs(en - p.length / 2))) en = i;
  return en < 0 ? p : p.slice(0, en) + "\n" + p.slice(en + 1);
}

const md = [M.baslik(senaryo.baslik), "", M.aciklama, ""];

for (const ad of adlar) {
  const zyol = path.join(C, `${ad}-zaman.json`);
  if (!fs.existsSync(zyol)) { console.warn(`atlandı / skipped: ${zyol}`); continue; }
  const z = JSON.parse(fs.readFileSync(zyol, "utf8"));
  const kes = Math.max(0, z.ilkSahneMs || 0);
  const t = (ms) => ms - kes;
  const cihaz = z.cihaz;
  const baslik = cihaz === "mobil" ? M.mobil(z.viewport.width, z.viewport.height) : M.masa(z.viewport.width, z.viewport.height);
  const sonSahne = z.sahneler.at(-1);
  const toplam = Math.max(t(z.toplamMs), sonSahne ? t(sonSahne.bit) : 0);
  md.push(`## ${baslik} — \`${ad}.mp4\``, "", M.toplam(mmss(toplam), z.sahneler.length), "");
  md.push(M.kolon, "|---|---|---|---|");
  const srt = [];
  let n = 0;
  for (const zs of z.sahneler) {
    const s = sahneById[zs.id] || {};
    const sureMs = zs.bit - zs.bas;
    const not = zs.dolguMs > 0 ? M.dolgu((zs.dolguMs / 1000).toFixed(1)) : "";
    md.push(`| **${mmss(t(zs.bas))}** | **${mmss(t(zs.bit))}** | **${hucre(zs.id)}** — ${hucre(s.ekran)}${not} | ${hucre(s.anlatim)} |`);
    const adimlar = (s.adimlar || []).filter((a) => !a.yalniz || a.yalniz === cihaz);
    adimlar.forEach((a, i) => {
      const za = zs.adimlar[i];
      const mt = adimMetni(a, za);
      if (!mt || !za) return;
      md.push(`| ${mmss(t(za.bas))} | ${mmss(t(za.bit))} | ↳ ${hucre(mt)} | |`);
    });
    const parcalar = parcala(s.anlatim || "");
    const topKar = parcalar.reduce((a, p) => a + p.length, 0) || 1;
    let bas = t(zs.bas);
    for (const p of parcalar) {
      const sure = (sureMs * p.length) / topKar;
      srt.push(String(++n), `${srtZ(bas)} --> ${srtZ(bas + sure - 40)}`, ikiSatir(p), "");
      bas += sure;
    }
  }
  md.push("");
  const uy = z.uyarilar || [];
  if (uy.length) md.push(M.uyarilar, "", ...uy.map((u) => `- ${u}`), "");
  fs.writeFileSync(path.join(C, `${ad}.srt`), srt.join("\n"));
  console.log(`-> ${path.join(C, `${ad}.srt`)} (${n})`);
}

md.push(...M.not(senaryo.ayar.karakterSn));
fs.writeFileSync(path.join(C, mdAdi), md.join("\n"));
console.log(`-> ${path.join(C, mdAdi)}`);
