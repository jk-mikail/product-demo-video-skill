#!/usr/bin/env node
// Installs the skill folders into a Claude Code skills directory.
//   npx product-demo-video-skill [--lang en|tr|all] [--project | --dir <path>] [--force] [--list]
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKILLS = { en: "product-demo-video", tr: "urun-tanitim-videosu" };
const a = process.argv.slice(2);
const has = (f) => a.includes(f);
const val = (f) => { const i = a.indexOf(f); return i >= 0 ? a[i + 1] : undefined; };

if (has("-h") || has("--help")) {
  console.log(`Usage: npx product-demo-video-skill [options]

Installs the Claude Agent Skill(s) for making product demo videos.

  --lang en|tr|all   en = product-demo-video, tr = urun-tanitim-videosu (default: all)
  --project          install into ./.claude/skills (share with your team via git)
  --dir <path>       install into a custom skills directory
  --force            overwrite an existing installation
  --list             show what would be installed and where, then exit
  -h, --help         this help

Default target: ~/.claude/skills (personal, all projects).`);
  process.exit(0);
}

const lang = val("--lang") || "all";
if (!["en", "tr", "all"].includes(lang)) { console.error(`Unknown --lang: ${lang}`); process.exit(1); }
const secilen = lang === "all" ? Object.values(SKILLS) : [SKILLS[lang]];
const hedefKok = val("--dir") ? path.resolve(val("--dir"))
  : has("--project") ? path.resolve(".claude", "skills")
  : path.join(os.homedir(), ".claude", "skills");

if (has("--list")) {
  for (const s of secilen) console.log(`${s}  →  ${path.join(hedefKok, s)}`);
  process.exit(0);
}

fs.mkdirSync(hedefKok, { recursive: true });
let hata = 0;
for (const s of secilen) {
  const hedef = path.join(hedefKok, s);
  if (fs.existsSync(hedef) && !has("--force")) {
    console.error(`✗ ${hedef} already exists (use --force to overwrite)`);
    hata = 1;
    continue;
  }
  fs.rmSync(hedef, { recursive: true, force: true });
  fs.cpSync(path.join(KOK, s), hedef, { recursive: true });
  for (const f of ["kaydet.mjs", "transkript.mjs", "birlestir.sh", "ses-ekle.sh"]) {
    try { fs.chmodSync(path.join(hedef, "scripts", f), 0o755); } catch {}
  }
  console.log(`✓ ${s}  →  ${hedef}`);
}
if (!hata) {
  console.log(`
Next:
  • Restart Claude Code (or start a new session) so it discovers the skill.
  • Ask: "Make a demo video of the <feature> flow in our app."
  • Recording needs: node >= 18, ffmpeg, jq, Chrome, and  npm i -D playwright-core
  • claude.ai: zip the folder and upload it in Settings → Capabilities → Skills.`);
}
process.exit(hata);
