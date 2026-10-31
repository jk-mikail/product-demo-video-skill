---
name: urun-tanitim-videosu
description: Bir web uygulamasının (panel, SaaS, iç araç) adım adım kullanımını anlatan profesyonel tanıtım ve eğitim videosu üretir. Gerçek ekranın sahte veriyle birebir kopyasını kurar, JSON senaryodan imleç, ok, etiket, spot ve başlık kartı animasyonlarıyla 1080p masaüstü ve dikey mobil video kaydeder, ElevenLabs seslendirmesi için saniye saniye transkript ve SRT üretir. Kullanıcı ürün demosu, kullanım kılavuzu videosu, ekran kaydı, eğitim videosu, onboarding videosu ya da "bu özelliği anlatan video" istediğinde kullanın.
---

# Ürün tanıtım videosu

Bir web arayüzünün kullanım akışını anlatan, animasyonlu, sessiz bir video üretir.
Ses sonra eklenir. Sonuç: yayına hazır MP4 + seslendirme metni + SRT.

## Genel akış

```
 1. Keşif          gerçek ekranlar, metinler, akış  →  SOZLESME.md
 2. Demo kopyası   demo/index.html (sahte veri, gerçek CSS, data-demo seçicileri)
 3. Senaryo        senaryo.json (sahne → anlatım + adımlar)
 4. Kayıt          kaydet.mjs  →  cikti/<cihaz>-ham.mkv + <cihaz>-zaman.json
 5. Montaj         birlestir.sh → mp4 (masaüstü, dikey mobil, çerçeveli mobil)
 6. Metin          transkript.mjs → transkript.md + .srt
 7. Kontrol        karelere bak, uyarıları oku, gerekirse 3'e dön
 8. Ses (isteğe)   sahne başına ElevenLabs dosyası → ses-ekle.sh
```

Bu kontrol listesini kopyalayın ve ilerledikçe işaretleyin:

```
- [ ] 1 Keşif + SOZLESME.md
- [ ] 2 Demo kopyası, tarayıcıda elle denendi
- [ ] 3 senaryo.json, her sel demo'da var
- [ ] 4 Kayıt: masaüstü + mobil, uyarı = 0
- [ ] 5 birlestir.sh
- [ ] 6 transkript.mjs
- [ ] 7 Kare kontrolü yapıldı
```

## Gerekenler

`node` ≥ 18, `ffmpeg` + `ffprobe`, `jq`, Playwright (`npm i -D playwright-core`) ve Chrome
ya da Playwright Chromium. Paket başka yerdeyse `PLAYWRIGHT_MODULE=<yol>` verin.
Chrome yolu için `CHROME_PATH`. Ayrıntı: [scripts/pw.mjs](scripts/pw.mjs).

## Adım 1 — Keşif

- Anlatılacak akışı uygulamanın **kaynak kodundan** çıkarın: bileşenler, düğme metinleri,
  durum geçişleri. Metin uydurmayın; koddaki metni kullanın.
- Akışı 8–14 sahneye bölün. Her sahne **tek fikir** anlatır.
- Kararları `SOZLESME.md` dosyasına yazın. Şablon: [templates/SOZLESME.md](templates/SOZLESME.md).
  Birden fazla alt ajan çalışacaksa dosya sahipliğini burada bölün.

## Adım 2 — Demo kopyası (canlı sistemde çekim YOK)

Canlı sistemde çekmeyin: gerçek müşteri verisi görünür ve düğmeler gerçek yan etki üretir.
Bunun yerine ekranların birebir kopyasını sahte veriyle kurun.

Kurallar (ayrıntı: [references/demo-kopyasi.md](references/demo-kopyasi.md)):

- Uygulamanın **derlenmiş CSS'ini** ve fontlarını kopyalayın. Bileşenlerdeki gerçek class
  adlarını kullanın. Yeni class uydurmayın (derlenmiş CSS'te yoktur); eksik stil için ayrı
  `ek.css` yazın.
- Tıklanacak her öğeye `data-demo="ad"` verin. Aynı anda ekranda **tek görünür** öğe eşleşsin.
- Gerçek ağ çağrısı, mikrofon, konum yok. Gecikmeleri `setTimeout` ile taklit edin.
- Ekranda olmayan özellik eklemeyin.
- Başlangıç iskeleti: [templates/demo/](templates/demo/).

Kayda geçmeden önce demo'yu tarayıcıda açın ve akışı elle tıklayın.

## Adım 3 — Senaryo

`senaryo.json` sahne listesidir. Başlangıç: [templates/senaryo.json](templates/senaryo.json)
(şablon demo ile çalışır). Tüm alanlar:
[references/senaryo-formati.md](references/senaryo-formati.md).
Senaryo İngilizce anahtarlarla da yazılabilir (`scenes`, `steps`, `click` …).

```json
{ "id": "baslat",
  "anlatim": "Sonra Ziyareti başlat'a basın.",       ← seslendirme metni
  "ekran": "'Ziyareti başlat' tıklanır",             ← transkripte gider
  "adimlar": [
    { "tur": "ok",    "sel": "karsilayan-sec", "etiket": "Müşteriyi karşılayan", "yon": "sol", "ms": 2500 },
    { "tur": "tikla", "sel": "ziyaret-baslat", "ok": "Ziyareti başlat", "yon": "sol" },
    { "tur": "bekle", "ms": 1500 } ] }
```

Adım türleri: `baslik` · `git` · `tikla` · `yaz` · `ok` · `isik` · `bekle` · `temizle`.
`yalniz: "masaustu" | "mobil"` bir sahneyi ya da adımı tek cihaza sınırlar.

Yazım kuralları:
- Anlatım kısa ve emir kipinde: "… tıklayın", "… basın".
- Ok etiketi 2–4 kelime. Anlatımı tekrar etmez, ekrandaki öğeyi adlandırır.
- Sahne süresini anlatım belirler: kayıt, anlatım süresi dolana kadar bekler
  (`karakterSn`, varsayılan tr 14 / en 15 karakter/sn). Ayrıca süre doldurmaya gerek yok.
- `ayar.dil` (`tr` | `en`) transkript dilini, rozet metnini ve tarayıcı dilini belirler.

## Adım 4 — Kayıt

Proje kökünden (`demo/`, `senaryo.json` burada) çalıştırın:

```bash
node <skill>/scripts/kaydet.mjs masaustu      # 1920×1080
node <skill>/scripts/kaydet.mjs mobil         # 390×844 @3x, dokunmatik, parmak imleci
```

Çıktı: `cikti/<cihaz>-ham.mkv` ve `cikti/<cihaz>-zaman.json` (her sahne/adımın ölçülen ms'i).
Son satırdaki **uyarı sayısı 0 olmalı.** Uyarı varsa bir `sel` bulunamamıştır; demo'yu ya da
senaryoyu düzeltin ve tekrar kaydedin.

Nasıl çalışır ve sorun giderme: [references/kayit-teknigi.md](references/kayit-teknigi.md). Özet:
- Görüntü CDP screencast ile alınır (Playwright `recordVideo` 1080p'de bulanık).
- Makine yavaşsa kare hızı düşer. Çözüm **yavaş çekim**: sayfa saatleri 1/K hızda çalışır,
  kareler K'ya bölünür. Varsayılan K: masaüstü 2.5, mobil 2. Son satırdaki
  "ort. kare/s" değeri 25'in altındaysa `--yavas 3` deneyin.

## Adım 5 — Montaj

```bash
bash <skill>/scripts/birlestir.sh             # masaustu + mobil
```

| Dosya | Biçim |
|---|---|
| `cikti/masaustu.mp4` | 1920×1080, H.264, 30 fps |
| `cikti/mobil.mp4` | 1080×1920 dikey; yanlar bulanık koyu dolgu (Reels/Shorts) |
| `cikti/mobil-cerceveli.mp4` | 1920×1080; degrade zemin + telefon çerçevesi |

Baştaki boş kareler otomatik kesilir.

## Adım 6 — Transkript ve altyazı

```bash
node <skill>/scripts/transkript.mjs
```

`cikti/transkript.md`: her sahne ve adım için başlangıç/bitiş, ekranda ne var, anlatım.
`cikti/<cihaz>.srt`: anlatım, sahne süresine bölünmüş (satır ≤ 42 karakter, 2 satır).

## Adım 7 — Kontrol (atlamayın)

```bash
for t in 2 10 20 40; do ffmpeg -v error -y -ss $t -i cikti/masaustu.mp4 -frames:v 1 cikti/kontrol_$t.png; done
```

Karelere bakın: ok doğru öğeyi gösteriyor mu, etiket ekrandan taşıyor mu, başlık kartı
okunuyor mu, mobilde alt menü öğeyi örtüyor mu. `zaman.json` içindeki `uyarilar` boş olmalı.

## Adım 8 — Seslendirme (isteğe bağlı)

Ayrıntı: [references/seslendirme.md](references/seslendirme.md).
- Her sahnenin `anlatim` metnini **ayrı ses dosyası** üretin (tek uzun dosya değil).
- Dosyaları sahnenin başlangıç saniyesine yerleştirin:
  `bash <skill>/scripts/ses-ekle.sh masaustu ses/` (dosya adları: `<sahne-id>.mp3`).

## Görsel dil (varsayılan)

```
koyu gri zemin + mavi vurgu (nötr)    → marka rengi: senaryo.json "ayar.renk"
                                         (parıltılar ve mobil çerçeve zemini buradan türetilir)
imleç   : easing ile süzülür, tıkta iki halka
ok      : kavisli, çizilerek gelir; hedefte nabız atan çerçeve
spot    : hedef dışı %55 karartılır
başlık  : tam ekran kart; "sema" → numaralı akış, "cipler" → kapanış adımları
rozet   : sol altta "Demo verisi" (sahte veri olduğu belli olsun)
```

## Yapmayın

- Canlı sistemde, gerçek veriyle kayıt.
- Uygulamada olmayan düğme/metin eklemek.
- Bir `sel`'i birden fazla görünür öğeye vermek (yanlış öğe tıklanır).
- Uyarılı kaydı yayınlamak.
- Tek uzun seslendirme dosyası (senkron kayar).
