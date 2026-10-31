// Playwright'ı ve Chrome'u bulur. Ortam değişkenleri:
//   PLAYWRIGHT_MODULE  playwright / playwright-core paketinin yolu (ör. /proje/node_modules/playwright-core)
//   CHROME_PATH        sistem Chrome'u (yoksa /usr/bin/google-chrome denenir, o da yoksa Playwright'ın kendi Chromium'u)
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

export async function chromiumYukle() {
  const adaylar = [process.env.PLAYWRIGHT_MODULE, "playwright-core", "playwright"].filter(Boolean);
  const req = createRequire(path.join(process.cwd(), "_.js"));
  for (const a of adaylar) {
    try {
      const yol = req.resolve(a);
      const mod = await import(pathToFileURL(yol).href);
      const chromium = mod.chromium || mod.default?.chromium;
      if (chromium) return chromium;
    } catch {}
  }
  throw new Error("Playwright bulunamadı. `npm i -D playwright-core` çalıştırın ya da PLAYWRIGHT_MODULE=<paket yolu> verin.");
}

export function chromeYolu() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  for (const y of ["/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"])
    if (fs.existsSync(y)) return y;
  return undefined; // Playwright'ın indirdiği Chromium
}
