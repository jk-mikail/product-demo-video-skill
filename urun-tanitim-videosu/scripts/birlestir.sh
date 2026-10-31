#!/usr/bin/env bash
# Ham kayıtları (kaydet.mjs çıktısı) yayın videosuna çevirir. Proje kökünden çalıştırın:
#   bash <skill>/scripts/birlestir.sh [masaustu_adi] [mobil_adi]
#   (varsayılan / default: cikti/ içinde masaustu|desktop ve mobil|mobile aranır)
# Gerekenler: ffmpeg, ffprobe, jq, node + Playwright (mobil çerçeve görselleri için).
# Girdi : cikti/<ad>-ham.mkv + cikti/<ad>-zaman.json
# Çıktı : cikti/<masaustu>.mp4          1920x1080, h264 yuv420p 30fps crf18
#         cikti/<mobil>.mp4             1080x1920 dikey (telefon ekranı ortada, bulanık koyu dolgu)
#         cikti/<mobil>-cerceveli.mp4   1920x1080, degrade zemin + telefon çerçevesi
# Baştaki boş kareler zaman.json'daki ilkSahneMs kadar kesilir (transkript.mjs aynı kesimi uygular).
set -euo pipefail
BETIK="$(cd "$(dirname "$0")" && pwd)"
C="${CIKTI:-$PWD/cikti}"
bul() { for a in "$@"; do [[ -f "$C/$a-ham.mkv" ]] && { echo "$a"; return; }; done; echo "$1"; }
MASA="${1:-$(bul masaustu desktop)}"
MOB="${2:-$(bul mobil mobile)}"
GEC="$C/.gecici"
mkdir -p "$GEC"
ENC=(-c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -r 30 -movflags +faststart -an)

kesim() { jq -r '((.ilkSahneMs // 0) / 1000) | if . < 0 then 0 else . end' "$1"; }
sure() { ffprobe -v error -show_entries format=duration -of csv=p=0 "$1"; }

# ---- masaüstü ----
if [[ -f "$C/$MASA-ham.mkv" ]]; then
  K=$(kesim "$C/$MASA-zaman.json")
  echo "masaüstü: baştan ${K}s kesiliyor"
  ffmpeg -y -loglevel error -ss "$K" -i "$C/$MASA-ham.mkv" \
    -vf "scale=1920:1080:flags=lanczos,fps=30,format=yuv420p" "${ENC[@]}" "$C/$MASA.mp4"
  echo "  -> $C/$MASA.mp4 ($(sure "$C/$MASA.mp4") s)"
else
  echo "atlandı: $C/$MASA-ham.mkv yok"
fi

# ---- mobil ----
if [[ -f "$C/$MOB-ham.mkv" ]]; then
  K=$(kesim "$C/$MOB-zaman.json")
  echo "mobil: baştan ${K}s kesiliyor"
  # dikey 1080x1920: telefon ekranı yüksekliği doldurur (888x1920), yanlar aynı görüntünün bulanık+koyu kopyası
  ffmpeg -y -loglevel error -ss "$K" -i "$C/$MOB-ham.mkv" -filter_complex "
    [0:v]fps=30,split[a][b];
    [a]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=40:2,eq=brightness=-0.32:saturation=0.6[bg];
    [b]scale=-2:1920:flags=lanczos[fg];
    [bg][fg]overlay=(W-w)/2:0,format=yuv420p" "${ENC[@]}" "$C/$MOB.mp4"
  echo "  -> $C/$MOB.mp4 ($(sure "$C/$MOB.mp4") s)"

  # çerçeve görselleri (zemin + çerçeve) Chrome ile çizilir
  EKRAN_H=960
  VW=$(jq -r '.viewport.width // 390' "$C/$MOB-zaman.json"); VH=$(jq -r '.viewport.height // 844' "$C/$MOB-zaman.json")
  EKRAN_W=$(( (EKRAN_H * VW / VH + 1) / 2 * 2 ))
  EX=$(( (1920 - EKRAN_W) / 2 )); EY=$(( (1080 - EKRAN_H) / 2 ))
  # zemin rengi kayıttaki paletten (senaryo ayar.renk); yoksa nötr varsayılan
  KOYU=$(jq -r '.renk.koyu // "#111827"' "$C/$MOB-zaman.json"); KOYU2=$(jq -r '.renk.koyu2 // "#1e293b"' "$C/$MOB-zaman.json")
  VURGU=$(jq -r '.renk.vurgu // "#3b82f6"' "$C/$MOB-zaman.json")
  node --input-type=module - "$GEC" "$EKRAN_W" "$EKRAN_H" "$EX" "$EY" "$BETIK/pw.mjs" "$KOYU" "$KOYU2" "$VURGU" <<'JS'
const { chromiumYukle, chromeYolu } = await import("file://" + process.argv[7]);
const [KOYU, KOYU2, VURGU] = process.argv.slice(8, 11);
const chromium = await chromiumYukle();
const [dir, w, h, x, y] = process.argv.slice(2, 7).map((v, i) => (i ? Number(v) : v));
const b = 16, r = 54;
const html = (zemin) => `<html><body style="margin:0;width:1920px;height:1080px;overflow:hidden;background:${zemin ? "transparent" : "transparent"}">
${zemin ? `<div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 45%,${KOYU2} 0%,${KOYU} 45%,color-mix(in srgb, ${KOYU} 55%, #000) 100%)"></div>
<div style="position:absolute;inset:0;background:radial-gradient(ellipse at 18% 12%,color-mix(in srgb, ${VURGU} 13%, transparent),transparent 50%)"></div>
<div style="position:absolute;left:${x - b}px;top:${y - b}px;width:${w + 2 * b}px;height:${h + 2 * b}px;border-radius:${r + b}px;box-shadow:0 40px 90px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.04)"></div>`
: `<div style="position:absolute;left:${x - b}px;top:${y - b}px;width:${w}px;height:${h}px;border:${b}px solid #0a0a0c;border-radius:${r + b}px;box-shadow:inset 0 0 0 1px #2a2c33,0 0 0 2px #3a3d46,0 0 0 3px #15161a"></div>
<div style="position:absolute;left:${x - b - 3}px;top:${y + 150}px;width:3px;height:70px;border-radius:2px;background:#2a2c33"></div>
<div style="position:absolute;left:${x + w + b}px;top:${y + 200}px;width:3px;height:110px;border-radius:2px;background:#2a2c33"></div>`}
</body></html>`;
const br = await chromium.launch({ executablePath: chromeYolu(), headless: true });
const p = await br.newPage({ viewport: { width: 1920, height: 1080 } });
await p.setContent(html(true));
await p.screenshot({ path: dir + "/zemin.png" });
await p.setContent(html(false));
await p.screenshot({ path: dir + "/cerceve.png", omitBackground: true });
await p.setViewportSize({ width: w, height: h });
await p.setContent(`<body style="margin:0;background:#000"><div style="width:${w}px;height:${h}px;border-radius:${r}px;background:#fff"></div></body>`);
await p.screenshot({ path: dir + "/maske.png" });
await br.close();
JS
  # ekran köşeleri çerçevenin iç yarıçapıyla yuvarlatılır (maske.png alfa)
  ffmpeg -y -loglevel error -ss "$K" -i "$C/$MOB-ham.mkv" -loop 1 -i "$GEC/zemin.png" -loop 1 -i "$GEC/cerceve.png" -loop 1 -i "$GEC/maske.png" -filter_complex "
    [3:v]fps=30,format=gray[m];
    [0:v]fps=30,scale=${EKRAN_W}:${EKRAN_H}:flags=lanczos,format=yuva420p[v];
    [v][m]alphamerge=shortest=1[tel];
    [1:v]fps=30[z];
    [z][tel]overlay=${EX}:${EY}:shortest=1[a];
    [2:v]fps=30[c];
    [a][c]overlay=0:0:shortest=1,format=yuv420p" "${ENC[@]}" "$C/$MOB-cerceveli.mp4"
  echo "  -> $C/$MOB-cerceveli.mp4 ($(sure "$C/$MOB-cerceveli.mp4") s)"
else
  echo "atlandı: $C/$MOB-ham.mkv yok"
fi
