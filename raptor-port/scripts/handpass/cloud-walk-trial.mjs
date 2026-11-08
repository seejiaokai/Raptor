// Trial: a walk that runs anywhere (relative paths only).
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, webkit } from 'playwright';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const out = join(root, 'docs', 'img', 'handpass', '2026-11-08-cloud-walk-trial');
mkdirSync(out, { recursive: true });
const URL = 'http://localhost:4173/';

const srv = spawn('npx', ['vite', 'preview', '--port', '4173', '--strictPort'], { cwd: root, shell: true, stdio: 'ignore' });
async function waitUp() {
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(URL)).ok) return; } catch {}
    await new Promise(r => setTimeout(r, 1000));
  }
  throw new Error('server did not start');
}
const errors = [];
async function walk(label, launcher, ctxOpts) {
  const browser = await launcher.launch();
  const ctx = await browser.newContext(ctxOpts);
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push(`${label} pageerror: ${e.message}`));
  page.on('console', m => { if (m.type() === 'error') errors.push(`${label} console: ${m.text()}`); });
  await page.goto(URL);
  await page.fill('#luser', 'ad');
  await page.fill('#lpass', 'a');
  await page.click('#loginForm button[type=submit]');
  await page.waitForSelector('#vWeek .day', { state: 'attached' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(out, `${label}-1-week.png`) });
  const nav = page.locator('nav button:visible, [role=tab]:visible, button:visible').first();
  console.log(label, 'clicking:', ((await nav.textContent()) || '').trim());
  await nav.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: join(out, `${label}-2-after-nav.png`) });
  await page.evaluate(() => window.scrollBy(0, 300));
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(out, `${label}-3-scrolled.png`) });
  await browser.close();
}
try {
  await waitUp();
  await walk('chromium-desktop', chromium, { viewport: { width: 1536, height: 864 } });
  await walk('webkit-phone', webkit, { viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  console.log('errors:', errors.length ? errors : 'none');
} finally {
  if (process.platform === 'win32') spawn('taskkill', ['/pid', String(srv.pid), '/T', '/F'], { stdio: 'ignore' });
  else srv.kill();
}
