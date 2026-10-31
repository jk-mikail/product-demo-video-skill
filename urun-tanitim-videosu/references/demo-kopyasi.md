# Demo kopyası nasıl kurulur

## Neden kopya?

```
canlı sistem ── gerçek müşteri adı/telefonu görünür      ✗
            ── düğme gerçek iş yapar (CRM'e yorum yazar) ✗
            ── veri her gün değişir, kayıt tekrarlanamaz ✗
demo kopyası ── sahte veri, yan etki yok, her kayıt aynı  ✓
```

## Görünüm sadakati

1. Uygulamayı build edin. Derlenmiş CSS dosyalarını (Next.js: `.next/static/css/*.css`,
   Vite: `dist/assets/*.css`) ve fontları (`media/*.woff2`) `demo/` yanına kopyalayın.
   CSS içindeki font yolları göreli kalsın (`../media/...`).
2. `<html>` ve `<body>` class'larını gerçek uygulamadan alın (font değişkeni class'ları dahil).
3. Her ekranı bileşen dosyasından kopyalayın: **aynı Tailwind class'ları, aynı metin**.
   Derlenmiş CSS yalnız kullanılan class'ları içerir; uydurma class stil getirmez.
4. Eksik stil (ör. açılır liste, dalga animasyonu) için `ek.css` yazın. Çakışmasın diye önek
   kullanın (`.u1-*`, `.u2-*`).
5. İkonlar: uygulama hangi seti kullanıyorsa onu (ör. lucide UMD, sabit sürüm) ya da inline SVG.

## Yapı (şablon: `templates/demo/`)

```
index.html
├── #kabuk        üst bar (masaüstü) / alt navigasyon (mobil)
├── #gorunum      aktif ekran — location.hash ile seçilir (#takvim, #liste …)
├── #pencere-kok  dialog / mobilde tam ekran sheet
└── #ov-kok       overlay (kaydet.mjs ekler; pointer-events:none, en üstte)

durum.js          window.Demo: sahte veri + durum + yönlendirici
<ekran>.js        Demo.gorunumKaydet("ad", el => { el.innerHTML = ... })
```

API (şablondaki `durum.js`; İngilizce takma adlar parantezde):
- `Demo.durum` (`state`) paylaşılan durum nesnesi. Değiştirince `Demo.yenile()` (`refresh`).
- `Demo.gorunumKaydet(ad, renderFn)` (`registerView`) ekran kaydı.
- `Demo.pencereAc(renderFn)` / `Demo.pencereKapat()` (`openDialog` / `closeDialog`).

## data-demo seçicileri

- Senaryoda anılacak her öğeye `data-demo="kisa-ad"` verin.
- Aynı anda **tek görünür** eşleşme olsun. Masaüstü ve mobilde iki ayrı öğe varsa ikisine aynı
  adı verebilirsiniz; görünmeyen olan atlanır.
- Adları `SOZLESME.md`'de listeleyin ve sonra değiştirmeyin (senaryo bunlara bağlı).

## Davranış taklidi

| Gerçekte | Demo'da |
|---|---|
| API çağrısı | `setTimeout(…, 800)` + durum güncelle |
| Konum izni | "Konum alınıyor…" → 0,8 sn → "Konum alındı (±12 m)" |
| Mikrofon kaydı | kırmızı nokta + `setInterval` sayaç + CSS dalga |
| Yükleme | ilerleme çubuğu, 2 sn |

Zamanlayıcılar `setTimeout`/`setInterval`/CSS animasyonu ile yazılmalı. Kayıt yavaş çekimde
bunları otomatik yavaşlatır; `requestAnimationFrame` ve `Date.now()` da desteklenir.

## Mobil

- Kırılım gerçek uygulamayla aynı olsun (Tailwind `sm:` = 640 px).
- Kayıt mobilde 390×844 görünüm, `isMobile`, `hasTouch` ile açar; dokunma hedefleri gerçekçi olmalı.
- Sabit alt navigasyon öğeleri örtebilir: kayıt öğeyi kaydırarak görünür yapar, yine de karelerde kontrol edin.

## Paralel çalışma (alt ajanlarla)

Büyük demo'da ekranları ayrı ajanlara verin. `SOZLESME.md`'de dosya sahipliğini bölün:

```
ana oturum : SOZLESME.md, senaryo.json, index.html, durum.js
UI-1       : kabuk + ekran A + pencere          (ek.css'te yalnız .u1-*)
UI-2       : ekran B + form                     (ek.css'te yalnız .u2-*)
KAYIT      : overlay, kayıt, montaj betikleri
```

Her ajana: gerçek bileşen yollarını, CSS dosyalarını ve `data-demo` listesini verin.
