# Voice-over (ElevenLabs or any TTS)

## Principle

```
one long audio file     → if one sentence runs long, everything after drifts   ✗
one file per scene      → each file sits at the start of its own scene         ✓
```

## Steps

1. From `cikti/transkript.md`, take each scene's **Start** time and its `narration`.
2. Generate one audio file per scene, named after the scene `id`: `audio/intro.mp3`, `audio/list.mp3` …
3. If a file is longer than its scene: raise the speaking speed slightly (ElevenLabs `speed` 1.05–1.1)
   or shorten the text and regenerate.
4. Place the files in the video:

```bash
bash <skill>/scripts/ses-ekle.sh desktop audio/      # → cikti/desktop-sesli.mp4
bash <skill>/scripts/ses-ekle.sh mobile audio/       # → cikti/mobile-sesli.mp4
```

The script puts each `<id>.mp3|wav|m4a` at the scene start from `zaman.json` + 300 ms (`adelay`),
mixes them (`amix`) and muxes AAC 192k into the video. Scenes without a file stay silent
(the script prints `sessiz: <id>` = "silent").

## ElevenLabs tips

- Use a multilingual model for non-English. Reading speed ≈ 15 chars/s in English, ≈ 14 in Turkish
  (`settings.charsPerSec`). For a different voice/language, generate one scene, measure it,
  update the value and record again.
- Spell out product names and acronyms the way they should be spoken — in the audio text only.
- ~0.3 s of silence at the start of each file feels natural (the script already adds it).

## Subtitles

`cikti/<device>.srt` splits the narration over scene length by character ratio. It can be uploaded
directly to YouTube/LinkedIn. To burn it into the video:

```bash
ffmpeg -i cikti/desktop-sesli.mp4 -vf "subtitles=cikti/desktop.srt:force_style='FontSize=22,MarginV=40'" \
  -c:a copy cikti/desktop-subtitled.mp4
```
