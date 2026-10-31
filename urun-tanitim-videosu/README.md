# urun-tanitim-videosu — Agent Skill

Web uygulaması için animasyonlu kullanım/tanıtım videosu üreten Claude Agent Skill'i.
Claude okumak için `SKILL.md` ile başlar; bu dosya insanlar içindir.

## Kurulum

| Ortam | Nasıl |
|---|---|
| Claude Code (kişisel) | Klasörü `~/.claude/skills/urun-tanitim-videosu/` altına kopyalayın |
| Claude Code (proje, ekip) | `.claude/skills/urun-tanitim-videosu/` altına koyup git'e ekleyin |
| claude.ai | Ayarlar → Capabilities → Skills → zip'i yükleyin |
| Claude API | `/v1/skills` uç noktasına yükleyin (code execution beta gerekir) |

En iyi sonuç **Claude Code**'da alınır: kayıt için yerel Chrome + Playwright + ffmpeg gerekir.
claude.ai / API kod ortamında ağ erişimi yoktur; Playwright ve tarayıcı orada kurulu değilse
yalnız senaryo, demo ve metin adımları çalışır.

## Makinede gerekenler

```bash
node -v        # ≥ 18
ffmpeg -version && jq --version
npm i -D playwright-core     # ya da PLAYWRIGHT_MODULE=/yol/node_modules/playwright-core
# Chrome: /usr/bin/google-chrome, ya da CHROME_PATH=..., ya da `npx playwright install chromium`
```

## Hızlı başlangıç

```bash
mkdir video && cd video
cp -r ~/.claude/skills/urun-tanitim-videosu/templates/demo demo
cp ~/.claude/skills/urun-tanitim-videosu/templates/senaryo.json .
# demo/ ve senaryo.json'u kendi uygulamanıza göre düzenleyin (ya da Claude'a yaptırın)
S=~/.claude/skills/urun-tanitim-videosu/scripts
node $S/kaydet.mjs masaustu && node $S/kaydet.mjs mobil
bash $S/birlestir.sh && node $S/transkript.mjs
```

Claude Code'da örnek istek: *"Panelimizdeki fatura onay akışını anlatan tanıtım videosu hazırla."*

## İçerik

```
SKILL.md                    ana talimat (Claude okur)
references/
  demo-kopyasi.md           ekranın birebir kopyası nasıl kurulur
  senaryo-formati.md        senaryo.json alanları ve kalıplar
  kayit-teknigi.md          screencast, yavaş çekim, sorun giderme
  seslendirme.md            ElevenLabs, ses yerleştirme, altyazı
scripts/
  kaydet.mjs                senaryoyu oynatıp kaydeder
  overlay.js                imleç, ok, spot, başlık kartı
  birlestir.sh              masaüstü / dikey / çerçeveli mp4
  transkript.mjs            transkript.md + .srt
  ses-ekle.sh               sahne seslerini videoya yerleştirir
  senaryo.mjs               senaryo okuyucu (TR/EN anahtarlar)
  pw.mjs                    Playwright / Chrome bulucu
templates/
  senaryo.json              şablon demo ile çalışan 6 sahnelik başlangıç
  SOZLESME.md               proje sözleşmesi şablonu
  demo/                     index.html + durum.js + örnek ekran
```

İngilizce sürüm: `product-demo-video` (aynı betikler, İngilizce talimat).
