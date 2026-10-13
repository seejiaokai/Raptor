/* THE DESIGN LOOK OF 13 OCT 26 — shared helpers ([DESIGN-LOOK-13OCT], owner D807; the page docs/mock/design-look-13oct.html).
   Pictures of the BUILT app at his iPhone's size (390 × 844, three device pixels to one — an iPhone's own density) and
   a desktop's (1440 × 900, two to one so a crop stays sharp when he zooms). A real mouse and keyboard on the desktop, a
   real finger on the phone. Nothing here changes the app: the mock-ups of a PROPOSAL (dl-clash.mjs, dl-notes.mjs) inject
   into the open page and say so in their own heads.
   Run against a served build: `npm run build`, the preview on 4173 (.claude/launch.json "raptor-walk"), then
   `node scripts/handpass/dl-<name>.mjs`. */
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
export const ROOT = resolve(HERE, '..', '..')
export const BASE = process.env.DL_BASE || 'http://localhost:4173'
/* THE RE-CHECK WRITES ELSEWHERE (docs/bug-check-order.md §5 "The re-walk"): the look's own pictures and key record are
   the evidence of what was found and stay as they were. A later run names its own folder — DL_SHOTS, a path from the
   app's root — and its pictures and its keyboard.json land there. */
export const SHOTS = resolve(ROOT, process.env.DL_SHOTS || 'docs/mock/2026-10-13-design-look')
export const OUT = resolve(SHOTS, 'keyboard.json')
mkdirSync(SHOTS, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
export const sleep = ms => new Promise(r => setTimeout(r, ms))

export const SIZES = {
  phone: { w: 390, h: 844, dpr: 3, phone: true },
  desk: { w: 1440, h: 900, dpr: 2, phone: false },
}

export async function world(sizeKey, { who = ['ad', 'a'] } = {}) {
  const S = SIZES[sizeKey]
  const browser = await chromium.launch({ headless: true, ...launchOptions })
  const ctx = await browser.newContext({ viewport: { width: S.w, height: S.h }, deviceScaleFactor: S.dpr, ...(S.phone ? { isMobile: true, hasTouch: true } : {}) })
  const page = await ctx.newPage()
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(`console: ${m.text()}`) })
  page.on('pageerror', e => errors.push(`PAGEERROR ${e.message}`))
  await page.goto(BASE + '/?fresh=1')
  await page.fill('#luser', who[0]); await page.fill('#lpass', who[1])
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await sleep(400)
  const press = async sel => { const l = typeof sel === 'string' ? page.locator(sel).first() : sel; if (S.phone) await l.tap(); else await l.click() }
  return { browser, ctx, page, errors, S, phone: S.phone, key: sizeKey, press }
}
export async function close(w) {
  if (w.errors.length) console.log(`errors [${w.key}]: ${w.errors.length}\n  ` + w.errors.join('\n  ').slice(0, 1200))
  await w.ctx.close().catch(() => {}); await w.browser.close().catch(() => {})
}
export async function go(w, to) {
  await w.page.evaluate(p => window.go(p), to)
  await w.page.waitForFunction(p => window.CURPAGE === p, to)
  await sleep(400)
}

/** a picture; `clip` in CSS pixels, or `around` a selector with a margin, kept on the screen */
export async function pic(w, name, { clip, around, pad = 16 } = {}) {
  const f = `${name}.png`
  let c = clip
  if (around) {
    const r = await w.page.locator(around).first().boundingBox()
    if (!r) throw new Error('nothing to picture: ' + around)
    const x = Math.max(0, r.x - pad), y = Math.max(0, r.y - pad)
    c = { x, y, width: Math.min(w.S.w - x, r.width + pad * 2), height: Math.min(w.S.h - y, r.height + pad * 2) }
  }
  await w.page.screenshot({ path: resolve(SHOTS, f), ...(c ? { clip: c } : {}) })
  console.log('   pic', f)
  return f
}

/** what the keyboard is on, in words a person would use */
export const focusOf = w => w.page.evaluate(() => {
  const e = document.activeElement
  if (!e || e === document.body) return 'nothing (the page)'
  const r = e.getBoundingClientRect()
  const st = getComputedStyle(e)
  const name = e.getAttribute('aria-label') || (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60) || e.getAttribute('placeholder') || ''
  const ring = st.outlineStyle !== 'none' && parseFloat(st.outlineWidth) > 0 ? `outline ${st.outlineWidth} ${st.outlineColor}` : (st.boxShadow && st.boxShadow !== 'none' ? 'shadow ' + st.boxShadow.slice(0, 60) : 'NO RING')
  return `${e.tagName.toLowerCase()}${e.getAttribute('data-testid') ? '[' + e.getAttribute('data-testid') + ']' : e.id ? '#' + e.id : e.className ? '.' + String(e.className).split(' ')[0] : ''} "${name}" · ${ring} · ${Math.round(r.width)}×${Math.round(r.height)}`
})

/** one row of the keyboard sweep, merged into one file across scripts */
export function row(surface, key, expected, saw, verdict) {
  let all = []
  if (existsSync(OUT)) { try { all = JSON.parse(readFileSync(OUT, 'utf8')) } catch {} }
  all = all.filter(r => !(r.surface === surface && r.key === key))
  all.push({ surface, key, expected, saw, verdict })
  writeFileSync(OUT, JSON.stringify(all, null, 1))
  console.log(`== ${verdict}  ${surface} · ${key}\n     saw: ${String(saw).slice(0, 500)}`)
}

/** the Inputs page's Calendar window, with the settings window that opened it closed */
export async function openCalendarWindow(w) {
  await go(w, 'inputs')
  await w.press('#inGear'); await w.press('[data-testid="iset-days"]')
  await w.page.waitForSelector('[data-testid="win-days"]')
  const x = w.page.locator('[data-testid="win-inputsset-x"]')
  if (await x.count()) await x.evaluate(e => e.click())
  await sleep(300)
}
export const adminPanel = async (w, name) => {
  await w.page.evaluate(() => window.go('admin'))
  await w.page.waitForSelector('#page-admin.on')
  const back = w.page.locator('#page-admin .adm-back')
  if (await back.count() && await back.first().isVisible()) await back.first().click()
  await w.page.evaluate(n => { const b = [...document.querySelectorAll('#page-admin button')].find(b => b.getBoundingClientRect().width > 0 && new RegExp('^' + n).test((b.textContent || '').trim())); if (b) b.click() }, name)
  await sleep(400)
}
