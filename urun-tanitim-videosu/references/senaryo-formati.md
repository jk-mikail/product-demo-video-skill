# senaryo.json biçimi

## İçindekiler
- Üst düzey alanlar
- `ayar`
- Sahne alanları
- Adım türleri
- Zamanlama kuralları
- Örnek kalıplar

## Üst düzey alanlar

```json
{
  "baslik": "Ziyaret modülü tanıtım videosu",   // transkript başlığı
  "ayar": { ... },                               // isteğe bağlı
  "sahneler": [ ... ]
}
```

## `ayar`

| Alan | Varsayılan | Anlam |
|---|---|---|
| `marka` | `""` | Başlık kartının üstündeki küçük marka satırı. Boşsa gizli. |
| `rozet` | `"Demo verisi"` | Sol alttaki rozet. `""` → gizli. |
| `dil` | `tr` (İngilizce anahtarlıysa `en`) | Transkript dili, rozet, locale/timezone varsayılanı |
| `renk.koyu` / `renk.koyu2` | `#111827` / `#1e293b` | Kart zemini, etiket zemini, mobil çerçeve zemini |
| `renk.vurgu` / `renk.vurgu2` | `#3b82f6` / `#93c5fd` | Ok, çerçeve, halka, spot, marka |
| `font` | sayfa fontu → Inter → Arial | Overlay fontu (CSS `font-family`) |
| `karakterSn` | `14` (en: `15`) | Anlatım okuma hızı. Sahne en az `uzunluk/karakterSn + 0.6 sn` sürer. |
| `locale` / `timezone` | `tr-TR` / `Europe/Istanbul` (en: `en-US` / `UTC`) | Tarayıcı bağlamı |

Marka paleti örneği (lacivert + amber):
`"renk": { "koyu": "#0b1d3a", "koyu2": "#16305c", "vurgu": "#f5a623", "vurgu2": "#ffc857" }`

## Sahne alanları

| Alan | Zorunlu | Anlam |
|---|---|---|
| `id` | evet | Kısa ad. Ses dosyası adı da budur (`<id>.mp3`). |
| `anlatim` | evet | Seslendirme metni. Süreyi belirler. |
| `ekran` | evet | Ekranda ne olduğu (transkripte gider). |
| `adimlar` | evet | Adım listesi. |
| `yalniz` | hayır | `"masaustu"` ya da `"mobil"` |

## Adım türleri

| tur | Alanlar | Ne olur |
|---|---|---|
| `baslik` | `ust`, `alt?`, `ms?` (4000), `sema?`, `cipler?` | Tam ekran başlık kartı. Sahnede yalnız kart varsa süre anlatıma uzar. |
| `git` | `hash` | `location.hash` değişir (demo rotası). Aynı hash ise `Demo.yenile()`. |
| `tikla` | `sel`, `ok?`, `yon?` | İmleç süzülür. `ok` varsa önce ok + etiket. Tık halkası + gerçek tık. |
| `yaz` | `sel`, `metin` | Tıklar, sonra harf harf yazar (55 ms/harf). |
| `ok` | `sel`, `etiket`, `yon?`, `ms?` (2000) | Kavisli ok + etiket + nabız çerçeve. |
| `isik` | `sel`, `ms?` (2000) | Spot: hedef dışı karartılır. |
| `bekle` | `ms` | Bekler (animasyon/durum geçişi için). |
| `temizle` | — | Ok, spot, kartları kaldırır. |

Her adımda `yalniz` kullanılabilir.

`sel` = öğenin `data-demo` değeri. Kayıt `[data-demo="<sel>"]` içinden **ilk görünür** olanı
alır, gerekirse kaydırıp görünür yapar. Bulamazsa adımı atlar ve uyarı yazar.

`yon` = etiketin hedefe göre tarafı: `ust | alt | sol | sag`. Yer yoksa ters tarafa,
o da yoksa alta/üste geçer. Mobilde genellikle `ust` ya da `alt` daha iyi durur.

### Başlık kartı çeşitleri

```json
{ "tur": "baslik", "ust": "Müşteri Ziyareti", "alt": "adım adım kullanım", "ms": 5000 }

{ "tur": "baslik", "ust": "CRM'e otomatik yansır", "ms": 6000,
  "sema": [["Panel", "Ziyaret başlar / biter"], ["CRM görevi", "Yorum düşer"], ["Kişi kartı", "Ses dosyası"]] }

{ "tur": "baslik", "ust": "Aç · Başlat · Durdur · Bitir", "alt": "Gerisini panel halleder", "cipler": true }
```

## Zamanlama kuralları

```
sahne süresi = max( adımların gerçek süresi , anlatim.length / karakterSn + 0.6 sn )
sahne arası  = 0.4 sn
```

- Adımlar anlatımdan kısaysa kayıt sahne sonunda bekler (`dolguMs`, transkriptte görünür).
- Adımlar uzunsa sahne uzar; anlatım sahneye rahat sığar.
- Ok `ms` değeri, okun ekranda kalma süresidir. Anlatımda o öğe anılırken görünmeli.

## İngilizce anahtarlar

İki yazım da kabul edilir; karıştırılabilir.

| Türkçe | İngilizce |
|---|---|
| `sahneler`, `adimlar`, `anlatim`, `ekran`, `yalniz`, `ayar` | `scenes`, `steps`, `narration`, `screen`, `only`, `settings` |
| `tur`: `baslik git tikla yaz ok isik bekle temizle` | `type`: `title goto click type arrow spotlight wait clear` |
| `sel`, `etiket`, `yon` (`ust alt sol sag`), `metin` | `target`, `label`, `side` (`top bottom left right`), `text` |
| `ust`, `alt`, `sema`, `cipler`, `ok` | `title`, `subtitle`, `flow`, `chips`, `arrow` |
| `masaustu`, `mobil` | `desktop`, `mobile` |
| `marka`, `rozet`, `renk{koyu,koyu2,vurgu,vurgu2}`, `karakterSn`, `dil` | `brand`, `badge`, `colors{dark,dark2,accent,accent2}`, `charsPerSec`, `language` |

## Örnek kalıplar

**Öğe tanıt + tıkla**
```json
[{ "tur": "ok", "sel": "gun-basligi", "etiket": "Bugünün randevuları", "yon": "alt", "ms": 2200 },
 { "tur": "tikla", "sel": "randevu-deniz", "ok": "Randevuya tıklayın", "yon": "sag" },
 { "tur": "bekle", "ms": 1000 }]
```

**Bölüm vurgula**
```json
[{ "tur": "isik", "sel": "ziyaret-bolumu", "ms": 3000 }, { "tur": "temizle" }]
```

**Form doldur**
```json
[{ "tur": "yaz", "sel": "not-alani", "metin": "3+1 bahçe katı ile ilgilendi." },
 { "tur": "tikla", "sel": "not-ekle" }]
```

**Yalnız mobilde görünen uyarı**
```json
{ "tur": "ok", "sel": "ekran-uyarisi", "etiket": "Ekranı kapatmayın", "yon": "ust", "ms": 3000, "yalniz": "mobil" }
```
