# <Feature> demo video — shared contract

Goal: a SILENT video with cursor/arrow/highlight animations that walks through the **<flow>**
flow of `<app path>` (desktop + mobile). Voice-over is added later.

**NO recording on the live system.** `demo/` holds a faithful replica of the real screens, with fake data.
- CSS: `<compiled css files>` · fonts: `media/`
- Classes and texts are copied from `<component paths>`. No invented classes; extra styles go in `demo/ek.css`.
- No real network calls / microphone / geolocation. Nothing is written into the app directory.

## File ownership

| File | Owner |
|---|---|
| `CONTRACT.md`, `senaryo.json`, `demo/index.html`, `demo/durum.js` | main session |
| `demo/<view-a>.js` | UI-1 |
| `demo/<view-b>.js` | UI-2 |
| `demo/ek.css` | UI-1 (`.u1-*`), UI-2 (`.u2-*`) |

## Routes

`#<main>` (default), `#<second>` … Mobile breakpoint: ≤ 640 px.

## data-demo selectors (DO NOT RENAME — the scenario depends on them)

Each name matches exactly one visible element at a time.

<View A>: `...`, `...`
<Dialog>: `...`, `...`

## Behavior (same flow as the real app)

1. ...
2. ... → 0.8 s "…loading" → result
3. ...

No buttons/features that the real app does not have.

## Output

`cikti/desktop.mp4` (1920×1080), `cikti/mobile.mp4` (1080×1920),
`cikti/mobile-cerceveli.mp4` (framed), `cikti/transkript.md`, `cikti/<device>.srt`.
