# Recording technique and troubleshooting

## Pipeline

```
Chrome (headless)
  │  CDP Page.startScreencast  → every frame as JPEG q92 + real timestamp
  ▼
frames/000001.jpg …            (os.tmpdir()/tanitim-kareler-<name>, change with --kareler)
  │  ffconcat list: each frame lasts until the next frame's timestamp / K
  ▼
ffmpeg → constant 30 fps, crf 10  → cikti/<name>-ham.mkv
  │
  ▼
birlestir.sh → trim leading blank, scale, crf 18 → cikti/<name>.mp4
```

`kaydet.mjs` options: `--url`, `--senaryo` (scenario path), `--ad` (output name), `--yavas` (slow-motion K),
`--kareler` (frame dir), `--cikti` (output dir).

## Why not `recordVideo`?

Playwright `recordVideo` is VP8 at ~1 Mbps and a fixed 25 fps. Text is blurry at 1080p.
The screencast delivers full-resolution frames; timing comes from real timestamps.

## Slow motion (K)

Headless Chrome cannot deliver 30 fps on every machine. Example: 1920×1080, K=1 → 6–8 fps.

Fix: play the scene K times slower, then speed it up K times.

```
in page : setTimeout, setInterval ×K  ·  Date, performance.now, rAF ÷K
CDP     : Animation.setPlaybackRate(1/K)   (CSS animations and transitions)
script  : every wait ×K
assembly: frame durations ÷K
```

Result plays at normal speed, K times smoother. Check `ort. X kare/s (video zamanı)` (avg fps in video time) on the last line:

| Value | Action |
|---|---|
| ≥ 25 | good |
| 15–25 | raise `--yavas` by 1 |
| < 15 | `--yavas 4`; reduce machine load |

## Chrome flags

| Flag | Why |
|---|---|
| `--disable-gpu-vsync`, `--disable-frame-rate-limit` | Without them the headless screencast stops sending new frames after ~1 s |
| `--hide-scrollbars` | No scrollbars in the video |
| `--force-color-profile=srgb` | Consistent colors |
| `--font-render-hinting=none` | Fonts look closer to Mac/Windows |
| `--disable-spell-checking` | No red squiggles in inputs |

## Target resolution

```
first visible [data-demo=target]
  → scrollIntoViewIfNeeded
  → if it scrolled, wait 350 ms to settle and measure the box again
  → cursor glides to the box center (at most 40 px from the top for tall elements)
  → arrow shown if requested, box measured once more (the dialog may have scrolled itself)
  → click rings + real locator.click()
```

## zaman.json (timing)

```json
{ "cihaz": "masaustu", "dil": "en", "renk": null, "yavasCekim": 2.5, "kareSayisi": 2847,
  "ilkSahneMs": 1546, "toplamMs": 126848,
  "sahneler": [ { "id": "intro", "bas": 1546, "bit": 9880, "anlatimTahminiMs": 7643, "dolguMs": 0,
                  "adimlar": [ { "tur": "baslik", "bas": 1546, "bit": 9480 } ] } ],
  "uyarilar": [] }
```

`cihaz` = device, `sahneler` = scenes, `bas`/`bit` = start/end, `dolguMs` = padding added for narration,
`uyarilar` = warnings. All ms values are relative to the start of the raw video. Assembly and
transcript shift them by `ilkSahneMs`.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `UYARI: ... görünür değil, adım atlandı` (not visible, step skipped) | `target` missing, hidden, or the previous step did not open the screen | Click through the demo by hand in the same order; add a `wait` before it |
| `tıklanamadı` (could not click) | Another layer (sheet, toast) covers the element | Add a step that closes it; check `z-index` |
| Video stutters | Low frame rate | Raise `--yavas` |
| Animations freeze after ~1 s | vsync flags missing | Keep the flags |
| Arrow in the wrong place | Layout changed after measuring (late font, scrolling) | Add a `wait` to the previous step |
| Label overflows the screen | Long label / narrow screen | Shorten the label, change `side` |
| Title font is monospace | Font not installed | Set `settings.font` or load a font in the page |
| `Playwright bulunamadı` (not found) | Package not resolvable | `PLAYWRIGHT_MODULE=/path/node_modules/playwright-core` |
| On mobile the element is under the bottom nav | Fixed bottom nav | Check the content bottom padding (`pb-20`) matches the real app |
