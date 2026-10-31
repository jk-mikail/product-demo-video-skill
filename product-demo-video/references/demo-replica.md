# Building the demo replica

## Why a replica?

```
live system  ── real customer names/phones visible               ✗
             ── buttons do real work (writes to the CRM)          ✗
             ── data changes daily, recording is not repeatable   ✗
replica      ── fake data, no side effects, every take identical  ✓
```

## Visual fidelity

1. Build the app. Copy the compiled CSS (Next.js: `.next/static/css/*.css`,
   Vite: `dist/assets/*.css`) and fonts (`media/*.woff2`) next to `demo/`.
   Keep font URLs inside the CSS relative (`../media/...`).
2. Take the `<html>` and `<body>` classes from the real app (including font variable classes).
3. Copy each screen from its component file: **same Tailwind classes, same text**.
   Compiled CSS only contains classes that are used; invented classes get no style.
4. Put missing styles (custom dropdown, waveform animation …) in `ek.css`. Use prefixes
   so agents do not collide (`.u1-*`, `.u2-*`).
5. Icons: the set the app uses (e.g. lucide UMD at a pinned version) or inline SVG.

## Structure (template: `templates/demo/`)

```
index.html
├── #kabuk        shell: top bar (desktop) / bottom nav (mobile)
├── #gorunum      active view — chosen by location.hash (#ana, #list …)
├── #pencere-kok  dialog root / full-screen sheet on mobile
└── #ov-kok       overlay (added by kaydet.mjs; pointer-events:none, on top)

durum.js          window.Demo: fake data + state + router
<view>.js         Demo.registerView("name", el => { el.innerHTML = ... })
```

API (template `durum.js`; original Turkish names in parentheses):
- `Demo.state` (`durum`) shared state object. After changing it call `Demo.refresh()` (`yenile`).
- `Demo.registerView(name, renderFn)` (`gorunumKaydet`).
- `Demo.openDialog(renderFn)` / `Demo.closeDialog()` (`pencereAc` / `pencereKapat`).
- `Demo.isMobile()` (`mobilMi`), `Demo.start()` (`basla`).

## data-demo selectors

- Give every element the scenario mentions `data-demo="short-name"`.
- Only **one visible** match at a time. If desktop and mobile have two different elements you may
  give both the same name; the hidden one is skipped.
- List the names in `CONTRACT.md` and do not rename them later (the scenario depends on them).

## Faking behavior

| Real app | Replica |
|---|---|
| API call | `setTimeout(…, 800)` + update state |
| Geolocation permission | "Getting location…" → 0.8 s → "Location found (±12 m)" |
| Microphone recording | red dot + `setInterval` counter + CSS waveform |
| Upload | progress bar, 2 s |

Write timers with `setTimeout`/`setInterval`/CSS animation. Slow-motion recording slows them down
automatically; `requestAnimationFrame` and `Date.now()` are covered too.

## Mobile

- Use the same breakpoint as the real app (Tailwind `sm:` = 640 px).
- The recorder opens mobile at a 390×844 viewport with `isMobile` and `hasTouch`; touch targets should be realistic.
- A fixed bottom nav can cover elements: the recorder scrolls them into view, but still check the frames.

## Parallel work (with subagents)

For a large demo give screens to separate agents. Split ownership in `CONTRACT.md`:

```
main session : CONTRACT.md, senaryo.json, index.html, durum.js
UI-1         : shell + view A + dialog         (only .u1-* in ek.css)
UI-2         : view B + form                   (only .u2-* in ek.css)
RECORDING    : overlay, recording, assembly scripts
```

Give each agent the real component paths, the CSS files and the `data-demo` list.
