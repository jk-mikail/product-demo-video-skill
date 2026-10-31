# product-demo-video-skill

Claude Agent Skill for producing **professional product demo / tutorial videos** of web applications.

- Builds a faithful replica of your real screens with fake data (no recording on production)
- Plays a JSON scenario: animated cursor, curved arrows with labels, spotlight, title cards, flow diagrams
- Records 1920×1080 desktop, 1080×1920 vertical mobile and a framed-phone version
- Outputs a second-by-second transcript + SRT, and places per-scene ElevenLabs voice-over

Two editions with identical scripts:

| Skill | Language |
|---|---|
| `product-demo-video` | English |
| `urun-tanitim-videosu` | Türkçe |

## Install

```bash
npx product-demo-video-skill                 # both editions → ~/.claude/skills
npx product-demo-video-skill --lang en       # English only
npx product-demo-video-skill --project       # → ./.claude/skills (commit for your team)
npx product-demo-video-skill --help
```

Then restart Claude Code and ask: *"Make a demo video of the invoice approval flow in our dashboard."*

## Requirements for recording

`node` ≥ 18, `ffmpeg` + `ffprobe`, `jq`, Chrome (or `npx playwright install chromium`),
and `npm i -D playwright-core` in your video project (or `PLAYWRIGHT_MODULE=<path>`).

## Kurulum (Türkçe)

```bash
npx product-demo-video-skill --lang tr       # yalnız Türkçe sürüm → ~/.claude/skills
```

Sonra Claude Code'u yeniden başlatın ve isteyin: *"Panelimizdeki fatura onay akışını anlatan tanıtım videosu hazırla."*

See each skill's own `README.md` and `SKILL.md` for details.

## License

MIT
