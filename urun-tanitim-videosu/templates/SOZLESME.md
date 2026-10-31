# <Özellik> tanıtım videosu — ortak sözleşme

Amaç: `<uygulama yolu>` içindeki **<akış>** akışını (masaüstü + mobil) anlatan, ok/vurgu/imleç
animasyonlu, SESSİZ video. Ses sonra eklenir.

**Canlı sistemde çekim YOK.** `demo/` altında gerçek ekranların birebir kopyası, sahte veriyle.
- CSS: `<derlenmiş css dosyaları>` · fontlar: `media/`
- Class ve metinler: `<bileşen yolları>` dosyalarından kopyalanır. Yeni class uydurulmaz; ek stil `demo/ek.css`.
- Gerçek ağ çağrısı / mikrofon / konum yok. Uygulama dizinine hiçbir dosya yazılmaz.

## Dosya sahipliği

| Dosya | Sahibi |
|---|---|
| `SOZLESME.md`, `senaryo.json`, `demo/index.html`, `demo/durum.js` | ana oturum |
| `demo/<ekran-a>.js` | UI-1 |
| `demo/<ekran-b>.js` | UI-2 |
| `demo/ek.css` | UI-1 (`.u1-*`), UI-2 (`.u2-*`) |

## Rotalar

`#<ana>` (varsayılan), `#<ikinci>` … Mobil kırılım: ≤ 640 px.

## data-demo seçicileri (ADLARI DEĞİŞTİRME — senaryo bunlara bağlı)

Her ad aynı anda tek görünür öğeye denk gelir.

<Ekran A>: `...`, `...`
<Pencere>: `...`, `...`

## Davranış (gerçek uygulamayla aynı akış)

1. ...
2. ... → 0,8 sn "…yükleniyor" → sonuç
3. ...

Gerçekte olmayan düğme/özellik EKLENMEZ.

## Çıktı

`cikti/masaustu.mp4` (1920×1080), `cikti/mobil.mp4` (1080×1920),
`cikti/mobil-cerceveli.mp4`, `cikti/transkript.md`, `cikti/<cihaz>.srt`.
