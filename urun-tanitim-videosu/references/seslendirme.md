# Seslendirme (ElevenLabs ya da başka TTS)

## İlke

```
tek uzun ses dosyası  → bir cümle uzarsa sonraki her şey kayar        ✗
sahne başına bir dosya → her dosya kendi sahnesinin başına oturur      ✓
```

## Adımlar

1. `cikti/transkript.md` içinden her sahnenin **Başlangıç** zamanını ve `anlatim` metnini alın.
2. Her sahne için bir ses dosyası üretin. Adı sahne `id`'si olsun: `ses/giris.mp3`, `ses/takvim.mp3` …
3. Ses, sahne süresinden uzunsa: konuşma hızını biraz artırın (ElevenLabs `speed` 1.05–1.1)
   ya da metni kısaltıp yeniden kaydedin.
4. Dosyaları videoya yerleştirin:

```bash
bash <skill>/scripts/ses-ekle.sh masaustu ses/        # → cikti/masaustu-sesli.mp4
bash <skill>/scripts/ses-ekle.sh mobil ses/           # → cikti/mobil-sesli.mp4
```

Betik her `<id>.mp3|wav|m4a` dosyasını `zaman.json`'daki sahne başlangıcı + 300 ms'ye koyar
(`adelay`), hepsini karıştırır (`amix`), AAC 192k ile videoya ekler. Dosyası olmayan sahne
sessiz geçer.

## ElevenLabs ipuçları

- Türkçe için çok dilli model kullanın. Okuma hızı ≈ 14 karakter/sn
  (`senaryo.json` → `ayar.karakterSn`). Farklı ses/dil için bir sahneyi üretip ölçün,
  değeri güncelleyin ve kaydı tekrarlayın.
- Ürün adlarını ve kısaltmaları yazıldığı gibi okunacak hâle getirin
  (ör. "Bitrix24" → "Bitriks yirmi dört" yalnız ses metninde).
- Her dosyanın başında ~0,3 sn sessizlik doğal durur (betik bunu zaten ekler).

## Altyazı

`cikti/<cihaz>.srt` anlatımı sahne süresine karakter oranıyla böler. YouTube/LinkedIn'e
doğrudan yüklenebilir. Videoya gömmek için:

```bash
ffmpeg -i cikti/masaustu-sesli.mp4 -vf "subtitles=cikti/masaustu.srt:force_style='FontSize=22,MarginV=40'" \
  -c:a copy cikti/masaustu-altyazili.mp4
```
