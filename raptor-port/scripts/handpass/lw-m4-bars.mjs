// His question 17's follow-up (27 Oct 26 — "what other similar bars are on this app can show me pictures"): every bar in
// the app like Approvals' slim bar, pictured on his iPhone's width and his PC's, each switched on through the app's own
// state on the DEVELOPMENT server (the bars that wait on a drag, a refused swap or a failed save cannot be reached from a
// built bundle's console). Run from raptor-port/ with the dev server up: PORT=4176 node scripts/handpass/lw-m4-bars.mjs
import { chromium, devices } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
const PORT = process.env.PORT || 4176
const OUT = path.resolve('docs/img/handpass/2026-10-27-lw-m4/sbs-after/bars')
mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const b = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const SIZES = {
  phone: { viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: devices['iPhone 13'].userAgent },
  desk: { viewport: { width: 1536, height: 860 }, deviceScaleFactor: 1.25 },
}
const mod = (p, path, fn, arg) => p.evaluate(async ([path, fn, arg]) => { const m = await import(path); const s = await import('/src/state/store.ts'); const r = new Function('m', 'arg', fn)(m, arg); s.notify(); return r }, [path, fn, arg])
const pause = (p, ms = 500) => p.waitForTimeout(ms)
for (const [size, opts] of Object.entries(SIZES)) {
  const ctx = await b.newContext(opts)
  const p = await ctx.newPage()
  const errs = []
  p.on('pageerror', e => errs.push(String(e).slice(0, 200)))
  await p.goto(`http://localhost:${PORT}/`)
  await p.waitForSelector('#luser', { timeout: 60000 })
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 60000 })
  const shot = async (name, where) => {
    const h = opts.viewport.height, w = opts.viewport.width
    const clip = where === 'top' ? { x: 0, y: 0, width: w, height: Math.min(260, h) } : { x: 0, y: h - (size === 'phone' ? 200 : 170), width: w, height: size === 'phone' ? 200 : 170 }
    await p.screenshot({ path: path.join(OUT, `${size}-${name}.png`), clip })
  }
  /* 1 — Approvals' slim bar (the Leave War, after a request's dates) */
  await p.evaluate(() => window.go('leavewar')); await p.waitForSelector('[data-testid="lw-tab-approvals"]', { timeout: 30000 })
  await p.click('[data-testid="lw-tab-approvals"]'); await pause(p, 900)
  await p.locator('[data-testid="appr-dates"]').first().click(); await pause(p, 1200)
  await shot('1-approvals-slim', 'foot')
  await p.click('[data-testid="appr-slim-x"]'); await pause(p)
  /* 2 — the passing note (any page) */
  await mod(p, '/src/ui/toast.ts', "m.toast('Approved LL for Ranger, Tue 13 Jan')"); await pause(p, 400)
  await shot('2-passing-note', 'foot')
  await mod(p, '/src/ui/toast.ts', 'm.clearToast && m.clearToast()'); await pause(p, 300)
  /* Edit Schedule for the rest */
  await p.evaluate(() => window.go('editsched')); await pause(p, 1500)
  /* 3 — "Set as default order?" after a section is dragged */
  await mod(p, '/src/state/view.ts', 'm.setSecDefOffer(0)'); await pause(p, 600)
  await shot('3-default-order', 'foot')
  await mod(p, '/src/state/view.ts', 'm.setSecDefOffer(null)'); await pause(p, 300)
  /* 4 — the changes window's bar after Hide (a phone only — the desktop has no bar) */
  if (size === 'phone') {
    await mod(p, '/src/ui/changesopen.ts', "m.openChanges('week', 'new')"); await pause(p, 600)
    await mod(p, '/src/state/view.ts', 'm.setChgWin({ ...m.CHGWIN, bar: true })'); await pause(p, 700)
    await shot('4-changes-bar', 'foot')
    await mod(p, '/src/state/view.ts', 'm.setChgWin(null)'); await pause(p, 300)
  }
  /* 5 — the OIL bar under the top bar ("Not swapped — OIL not answered") */
  await mod(p, '/src/state/view.ts', "m.setOilBar({ text: 'Not swapped — OIL not answered', wait: { kind: 'swap', lead: '', gate: { who: '', typeLabel: '', plan: [], prev: {} }, redo: () => '', ask: () => '', places: [] } })"); await pause(p, 700)
  await shot('5-oil-bar', 'top')
  await mod(p, '/src/state/view.ts', 'm.setOilBar(null)'); await pause(p, 300)
  /* 6 — the failed-save band under the top bar */
  await mod(p, '/src/ui/SaveStatus.tsx', "m.setSaveStatusSource({ status: 'failed', onStatus: () => {} })"); await pause(p, 700)
  await shot('6-not-saved', 'top')
  console.log(size, 'done', errs.length ? 'errors: ' + errs.join(' | ') : 'no page errors')
  await ctx.close()
}
await b.close()
process.exit(0)
