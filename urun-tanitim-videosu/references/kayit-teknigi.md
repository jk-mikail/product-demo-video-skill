# Kayıt tekniği ve sorun giderme

## Boru hattı

```
Chrome (headless)
  │  CDP Page.startScreencast  → her kare JPEG q92 + gerçek zaman damgası
  ▼
kareler/000001.jpg …           (os.tmpdir()/tanitim-kareler-<ad>, --kareler ile değişir)
  │  ffconcat listesi: her karenin süresi = sonraki kareye kadar geçen zaman / K
  ▼
ffmpeg → 30 fps sabit, crf 10  → cikti/<ad>-ham.mkv
  │
  ▼
birlestir.sh → baştaki boşluğu kes, ölçekle, crf 18 → cikti/<ad>.mp4
```

## Neden `recordVideo` değil?

Playwright `recordVideo` VP8, ~1 Mbps ve 25 fps sabittir. 1080p'de metin bulanık olur.
Screencast kareyi tam çözünürlükte verir; süre bilgisi gerçek zamandan gelir.

## Yavaş çekim (K)

Headless Chrome her makinede 30 kare/sn veremez. Örnek ölçüm: 1920×1080, K=1 → 6–8 kare/sn.

Çözüm: sahneyi K kat yavaş oynat, sonra K kat hızlandır.

```
sayfa içi  : setTimeout, setInterval ×K  ·  Date, performance.now, rAF ÷K
CDP        : Animation.setPlaybackRate(1/K)   (CSS animasyon ve geçişler)
betik      : her bekleme ×K
montaj     : kare süreleri ÷K
```

Sonuç normal hızda, K kat akıcı. Bitiş satırındaki `ort. X kare/s (video zamanı)` değerine bakın:

| Değer | Yapılacak |
|---|---|
| ≥ 25 | iyi |
| 15–25 | `--yavas` değerini 1 artırın |
| < 15 | `--yavas 4`; makine yükünü azaltın |

## Chrome bayrakları

| Bayrak | Neden |
|---|---|
| `--disable-gpu-vsync`, `--disable-frame-rate-limit` | Yoksa headless screencast ~1 sn sonra yeni kare vermeyi keser |
| `--hide-scrollbars` | Kaydırma çubuğu görünmesin |
| `--force-color-profile=srgb` | Renkler tutarlı |
| `--font-render-hinting=none` | Font Mac/Windows'a yakın görünür |
| `--disable-spell-checking` | Yazı alanında kırmızı çizgi olmasın |

## Hedef bulma

```
[data-demo=sel] içinden ilk görünür öğe
  → scrollIntoViewIfNeeded
  → kaydırma olduysa 350 ms yerleşme beklenir, kutu yeniden ölçülür
  → imleç kutunun ortasına (yüksek öğede üstten en çok 40 px) süzülür
  → ok varsa gösterilir, kutu bir daha ölçülür (pencere kendi kaydırmış olabilir)
  → tık halkası + gerçek locator.click()
```

## zaman.json

```json
{ "cihaz": "masaustu", "yavasCekim": 2.5, "kareSayisi": 2847,
  "ilkSahneMs": 1546, "toplamMs": 126848,
  "sahneler": [ { "id": "giris", "bas": 1546, "bit": 9880, "anlatimTahminiMs": 7643, "dolguMs": 0,
                  "adimlar": [ { "tur": "baslik", "bas": 1546, "bit": 9480 } ] } ],
  "uyarilar": [] }
```

Tüm ms değerleri ham videonun başına göredir. Montaj ve transkript `ilkSahneMs` kadar kaydırır.

## Sorun giderme

| Belirti | Sebep | Çözüm |
|---|---|---|
| `UYARI: ... görünür değil, adım atlandı` | `sel` yok, gizli ya da önceki adım ekranı açmadı | Demo'yu elle aynı sırayla tıklayın; önüne `bekle` ekleyin |
| `tıklanamadı` | Öğenin üstünde başka katman (sheet, toast) | Katmanı kapatan adım ekleyin; `z-index`'i kontrol edin |
| Video takılıyor | Düşük kare hızı | `--yavas` artırın |
| Animasyon ~1 sn sonra donuyor | vsync bayrakları eksik | Bayrakları koruyun |
| Ok yanlış yerde | Kayıttan sonra yerleşim değişti (font geç yüklendi, kaydırma) | Önceki adıma `bekle` ekleyin |
| Etiket ekrandan taşıyor | Uzun etiket / dar ekran | Etiketi kısaltın, `yon`'u değiştirin |
| Başlık fontu monospace | Sistemde font yok | `ayar.font` verin ya da sayfada font yükleyin |
| `Playwright bulunamadı` | Paket çözülemedi | `PLAYWRIGHT_MODULE=/yol/node_modules/playwright-core` |
| Mobilde öğe alt menünün altında | Sabit alt navigasyon | Demo'da içerik alt boşluğu (`pb-20`) gerçekle aynı mı bakın |
