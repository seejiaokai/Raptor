/* rcsb-lib v1 (13 Nov 26) — the rules check's small batch walk (D2009, D2010, D2014, D2015).
   Reuses the 12 Nov walks' helpers (rcf-w1-lib, pdl-w1-lib) for every control; replaces only the WORLD:
   - 'pc'    his PC: a real Chromium window STARTED at 125% scaling (1536 x 864 CSS = his 1920 x 1080 screen pixels),
             no viewport emulated (the walk-scripts lesson 31; his PC's display runs at 125%)
   - 'phone' his iPhone: WebKit, 402 x 874, touch, 3x
   Set HP_URL and HP_SHOTS BEFORE importing (the borrowed libraries read them once). */
import { chromium, webkit } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
export const X = await import('../rcf/rcf-w1-lib.mjs')
export const P = await import('../pdl/pdl-w1-lib.mjs')
export const { L, sleep, norm } = X
export const SHOTS = process.env.HP_SHOTS
export const ISO = X.ISO
export const ROWS = []
export function row(id, verdict, saw, pic = '') { ROWS.push({ id, verdict, saw, pic }); console.log(`ROW ${id} | ${verdict} | ${saw} | ${pic}`) }
export const shot = async (page, name) => { await page.screenshot({ path: `${SHOTS}/${name}.png` }); return name + '.png' }

export async function world(kind = 'pc', { who = 'a' } = {}) {
  const phone = kind === 'phone'
  mkdirSync(SHOTS, { recursive: true })
  let browser, ctx
  if (phone) {
    browser = await webkit.launch({ headless: true })
    ctx = await browser.newContext({ viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true })
  } else {
    const CH = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
    /* the window's size is given in the screen's own points (1536 x 864 at 125% is his 1920 x 1080 screen); a first try
       with 1920,1080 drew a 1920-wide page at 1.25 — a screen he does not have */
    browser = await chromium.launch({ headless: true, args: ['--force-device-scale-factor=1.25', '--window-size=1536,864'], ...(existsSync(CH) ? { executablePath: CH } : {}) })
    ctx = await browser.newContext({ viewport: null })
  }
  const page = await ctx.newPage()
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
  page.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()) })
  await page.goto(process.env.HP_URL + '/')
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await L.login(page, who)
  await L.installToasts(page)
  const CS = await page.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE).map(([k, p]) => [k, p.cs])))
  const ID = cs => Object.keys(CS).find(k => CS[k] === cs)
  const size = await page.evaluate(() => ({ w: innerWidth, h: innerHeight, dpr: devicePixelRatio }))
  console.log('world', kind, JSON.stringify(size))
  /* a window with no emulated size answers viewportSize() with null, and the borrowed helpers (X.pic's crop, a menu's
     close-by-corner) read it: give them the window's real size instead */
  if (!phone) page.viewportSize = () => ({ width: size.w, height: size.h })
  return { browser, ctx, page, errors, CS, ID, phone, size }
}

/* Logic: set one setting by its own box (✎ Edit first when the boxes are closed), then Done. Returns what the box and
   the app hold after. `val` as a person types it ("5h", "8h", "6h1"). */
export async function setLogic(w, key, val, picName = null) {
  const page = w.page
  await L.go(page, 'logic'); await sleep(600)
  if (!(await page.locator(`#lgBody input[data-lgset="${key}"]:visible`).count())) { await X.press(w, '#lgEdit', { scope: 'page' }); await sleep(500) }
  const inp = page.locator(`#lgBody input[data-lgset="${key}"]`).first()
  await inp.scrollIntoViewIfNeeded()
  const before = await inp.inputValue()
  if (w.phone) await inp.tap(); else await inp.click()
  await inp.fill(String(val)); await inp.press('Tab'); await sleep(600)
  const after = await inp.inputValue()
  if (picName) await shot(page, picName + '-editing')
  if (await page.locator('#lgDone:visible').count()) { await X.press(w, '#lgDone', { scope: 'page' }); await sleep(600) }
  const strip = await page.evaluate(() => { const e = document.querySelector('#lgOff'); return e && !e.hidden ? e.innerText.replace(/[\s ]+/g, ' ').trim() : '(strip hidden)' })
  const vconf = await page.evaluate(k => window.VCONF[k], key)
  if (picName) await shot(page, picName)
  return { before, after, vconf, strip }
}
/* the strip, pictured cut to itself */
export async function stripPic(w, name) {
  await L.go(w.page, 'logic'); await sleep(500)
  return X.pic(w.page, name, '#lgOff', { pad: 10 })
}
export function finish(w, tag) {
  writeFileSync(`${SHOTS}/${tag}-rows.json`, JSON.stringify({ rows: ROWS, errors: w.errors }, null, 1))
  console.log('errors:', w.errors.length, JSON.stringify(w.errors.slice(0, 5)))
}
