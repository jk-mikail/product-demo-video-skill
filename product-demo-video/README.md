# product-demo-video — Agent Skill

A Claude Agent Skill that produces animated walkthrough / demo videos for web applications.
Claude starts from `SKILL.md`; this file is for humans.
Turkish edition: `urun-tanitim-videosu` (same scripts, Turkish instructions).

## Install

| Environment | How |
|---|---|
| Claude Code (personal) | Copy the folder to `~/.claude/skills/product-demo-video/` |
| Claude Code (project, team) | Put it in `.claude/skills/product-demo-video/` and commit it |
| claude.ai | Settings → Capabilities → Skills → upload the zip |
| Claude API | Upload via the `/v1/skills` endpoint (requires the code execution beta) |

Best results come from **Claude Code**: recording needs a local Chrome + Playwright + ffmpeg.
The claude.ai / API code environment has no network access; if Playwright and a browser are not
installed there, only the scenario, demo and text steps work.

## Machine requirements

```bash
node -v        # ≥ 18
ffmpeg -version && jq --version
npm i -D playwright-core     # or PLAYWRIGHT_MODULE=/path/node_modules/playwright-core
# Chrome: /usr/bin/google-chrome, or CHROME_PATH=..., or `npx playwright install chromium`
```

## Quick start

```bash
mkdir video && cd video
cp -r ~/.claude/skills/product-demo-video/templates/demo demo
cp ~/.claude/skills/product-demo-video/templates/senaryo.json .
# adapt demo/ and senaryo.json to your app (or ask Claude to)
S=~/.claude/skills/product-demo-video/scripts
node $S/kaydet.mjs desktop && node $S/kaydet.mjs mobile
bash $S/birlestir.sh && node $S/transkript.mjs
```

Example request in Claude Code: *"Make a demo video of the invoice approval flow in our dashboard."*

## Contents

```
SKILL.md                    main instructions (read by Claude)
references/
  demo-replica.md           how to build a faithful replica of the screens
  scenario-format.md        senaryo.json fields and patterns (English + Turkish keys)
  recording.md              screencast, slow motion, troubleshooting
  voice-over.md             ElevenLabs, placing audio, subtitles
scripts/                    (Turkish file names, bilingual input/output)
  kaydet.mjs                plays and records the scenario ("record")
  overlay.js                cursor, arrow, spotlight, title cards
  birlestir.sh              desktop / vertical / framed mp4 ("assemble")
  transkript.mjs            transkript.md + .srt
  ses-ekle.sh               places per-scene audio in the video ("add audio")
  senaryo.mjs               scenario loader (EN/TR keys)
  pw.mjs                    Playwright / Chrome finder
templates/
  senaryo.json              6-scene starter that works with the template demo
  CONTRACT.md               project contract template
  demo/                     index.html + durum.js + example view
```
