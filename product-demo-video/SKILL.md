---
name: product-demo-video
description: Produces professional product demo and tutorial videos for web applications (dashboards, SaaS, internal tools). Builds a pixel-faithful replica of the real screens with fake data, plays a JSON scenario with animated cursor, arrows, labels, spotlight and title cards, records 1080p desktop and vertical mobile video, and outputs a second-by-second transcript and SRT for ElevenLabs voice-over. Use when the user asks for a product demo, feature walkthrough, how-to video, screen recording, training or onboarding video, or "a video that explains this feature".
---

# Product demo video

Produces an animated, silent video that walks through a web UI flow.
Voice-over is added afterwards. Output: publish-ready MP4 + narration script + SRT.

## Overall flow

```
 1. Discovery      real screens, texts, flow       →  CONTRACT.md
 2. Demo replica   demo/index.html (fake data, real CSS, data-demo selectors)
 3. Scenario       senaryo.json (scene → narration + steps)
 4. Record         kaydet.mjs  →  cikti/<device>-ham.mkv + <device>-zaman.json
 5. Assemble       birlestir.sh → mp4 (desktop, vertical mobile, framed mobile)
 6. Text           transkript.mjs → transkript.md + .srt
 7. Review         inspect frames, read warnings, go back to 3 if needed
 8. Audio (opt.)   one ElevenLabs file per scene → ses-ekle.sh
```

File and script names are Turkish (the pipeline was built in Turkish); everything below explains them.
Output folder is `cikti/` (= "output").

Copy this checklist and tick it off:

```
- [ ] 1 Discovery + CONTRACT.md
- [ ] 2 Demo replica, clicked through by hand in a browser
- [ ] 3 senaryo.json, every target exists in the demo
- [ ] 4 Recording: desktop + mobile, warnings = 0
- [ ] 5 birlestir.sh
- [ ] 6 transkript.mjs
- [ ] 7 Frames reviewed
```

## Requirements

`node` ≥ 18, `ffmpeg` + `ffprobe`, `jq`, Playwright (`npm i -D playwright-core`) and Chrome
or Playwright Chromium. If the package lives elsewhere, set `PLAYWRIGHT_MODULE=<path>`.
Chrome path: `CHROME_PATH`. Details: [scripts/pw.mjs](scripts/pw.mjs).

## Step 1 — Discovery

- Derive the flow from the app's **source code**: components, button labels, state
  transitions. Do not invent text; use the text in the code.
- Split the flow into 8–14 scenes. Each scene explains **one idea**.
- Write decisions to `CONTRACT.md`. Template: [templates/CONTRACT.md](templates/CONTRACT.md).
  If several subagents work in parallel, split file ownership there.

## Step 2 — Demo replica (NO recording on the live system)

Do not record the live system: real customer data shows up and buttons have real side effects.
Build a faithful replica of the screens with fake data instead.

Rules (details: [references/demo-replica.md](references/demo-replica.md)):

- Copy the app's **compiled CSS** and fonts. Use the real class names from the components.
  Do not invent classes (they are not in the compiled CSS); put missing styles in a separate `ek.css`.
- Give every clickable element `data-demo="name"`. Exactly **one visible** element may match at a time.
- No real network calls, microphone or geolocation. Fake latency with `setTimeout`.
- Do not add features that do not exist in the app.
- Starter skeleton: [templates/demo/](templates/demo/).

Before recording, open the demo in a browser and click through the flow by hand.

## Step 3 — Scenario

`senaryo.json` is the list of scenes. Starter: [templates/senaryo.json](templates/senaryo.json)
(works with the template demo). All fields:
[references/scenario-format.md](references/scenario-format.md).

```json
{ "id": "start",
  "narration": "Then press Start visit.",          ← voice-over text
  "screen": "'Start visit' is clicked",            ← goes into the transcript
  "steps": [
    { "type": "arrow", "target": "host-select", "label": "Who greets the customer", "side": "left", "ms": 2500 },
    { "type": "click", "target": "start-visit", "arrow": "Start visit", "side": "left" },
    { "type": "wait", "ms": 1500 } ] }
```

Step types: `title` · `goto` · `click` · `type` · `arrow` · `spotlight` · `wait` · `clear`.
`only: "desktop" | "mobile"` limits a scene or step to one device.

Writing rules:
- Narration is short and imperative: "Click …", "Press …".
- Arrow labels are 2–4 words. They name the element, they do not repeat the narration.
- Narration sets scene length: the recorder waits until the narration would finish
  (`charsPerSec`, default 15 for English). No manual padding needed.
- `settings.language` (`en` | `tr`) sets transcript language, badge text and browser locale.

## Step 4 — Record

Run from the project root (where `demo/` and `senaryo.json` are):

```bash
node <skill>/scripts/kaydet.mjs desktop      # 1920×1080
node <skill>/scripts/kaydet.mjs mobile       # 390×844 @3x, touch, finger cursor
```

Output: `cikti/<device>-ham.mkv` (raw) and `cikti/<device>-zaman.json` (measured ms of every scene/step).
**The warning count on the last line must be 0.** A warning means a `target` was not found;
fix the demo or the scenario and record again.

How it works and troubleshooting: [references/recording.md](references/recording.md). Summary:
- Frames come from the CDP screencast (Playwright `recordVideo` is blurry at 1080p).
- On a slow machine the frame rate drops. Fix: **slow motion** — page clocks run at 1/K speed,
  frame times are divided by K. Default K: desktop 2.5, mobile 2. If the last line shows
  "ort. kare/s" (avg fps) below 25, try `--yavas 3`.

## Step 5 — Assemble

```bash
bash <skill>/scripts/birlestir.sh             # finds desktop + mobile in cikti/
```

| File | Format |
|---|---|
| `cikti/desktop.mp4` | 1920×1080, H.264, 30 fps |
| `cikti/mobile.mp4` | 1080×1920 vertical; blurred dark fill on the sides (Reels/Shorts) |
| `cikti/mobile-cerceveli.mp4` | 1920×1080; gradient background + phone frame |

Leading blank frames are trimmed automatically.

## Step 6 — Transcript and subtitles

```bash
node <skill>/scripts/transkript.mjs
```

`cikti/transkript.md`: start/end, what is on screen and narration for each scene and step.
`cikti/<device>.srt`: narration split over scene length (≤ 42 chars per line, 2 lines).

## Step 7 — Review (do not skip)

```bash
for t in 2 10 20 40; do ffmpeg -v error -y -ss $t -i cikti/desktop.mp4 -frames:v 1 cikti/check_$t.png; done
```

Look at the frames: does the arrow point at the right element, does a label overflow the screen,
is the title card readable, does the mobile bottom nav cover the element?
`uyarilar` (warnings) in `zaman.json` must be empty.

## Step 8 — Voice-over (optional)

Details: [references/voice-over.md](references/voice-over.md).
- Generate **one audio file per scene** from its `narration` (not one long file).
- Place them at each scene's start time:
  `bash <skill>/scripts/ses-ekle.sh desktop audio/` (file names: `<scene-id>.mp3`).

## Visual language (default)

```
dark grey background + blue accent (neutral) → brand colors: senaryo.json "settings.colors"
                                               (glows and the phone-frame background derive from it)
cursor   : eased glide, two rings on click
arrow    : curved, drawn in; pulsing frame around the target
spotlight: everything except the target dimmed 55%
title    : full-screen card; "flow" → numbered diagram, "chips" → closing steps
badge    : "Demo data" bottom-left (makes clear the data is fake)
```

## Do not

- Record on the live system with real data.
- Add buttons or text that do not exist in the app.
- Give one `target` to more than one visible element (the wrong one gets clicked).
- Publish a recording with warnings.
- Use one long voice-over file (sync drifts).
