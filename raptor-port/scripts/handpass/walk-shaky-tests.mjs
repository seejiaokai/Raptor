/* WALK — the shaky-tests batch of 20 Oct 26 (D994, Checks and tooling): the one change on screen is [BOARD-TAB-FOLD-BOARD]
   — on the Scheduler Board a time typed "1000" and left by Tab reads 10:00 at once (was "1000" until a press elsewhere) —
   and the R box phone test's step it was blamed for: an empty take-off box tapped, "1300" typed, Enter saves 13:00.
   Assertions of the RIGHT behaviour, so a PASS means correct and a re-run is the re-walk. Every time typed by a real press
   and real keys; a desktop 1440 × 900 by mouse (D1–D5), a phone 402 × 874 by touch (P1–P4).
   Run: HP_URL=http://localhost:4321 node scripts/handpass/walk-shaky-tests.mjs
   Pictures: docs/img/handpass/2026-10-20-shaky-tests/walk/ (WALK_DIR=walk2 for a re-walk) */
import { existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const BASE = process.env.HP_URL || 'http://localhost:4321'
const OUT = resolve(ROOT, 'docs/img/handpass/2026-10-20-shaky-tests', process.env.WALK_DIR || 'walk')
mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const results = [], errors = []
const check = (id, ok, said) => { results.push([id, ok, said]); console.log(`${ok ? 'PASS' : 'FAIL'} ${id} — ${said}`) }
let n = 0
const pic = async (p, name, loc, pad = 40) => {
  const f = resolve(OUT, `${String(++n).padStart(2, '0')}-${name}.png`)
  if (!loc) { await p.screenshot({ path: f }); return }
  const b = await loc.boundingBox(), vp = p.viewportSize()
  const x = Math.max(0, b.x - pad * 6), y = Math.max(0, b.y - pad)
  await p.screenshot({ path: f, clip: { x, y, width: Math.min(vp.width - x, b.width + pad * 12), height: b.height + 2 * pad } })
}
async function start(vp, phone) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, colorScheme: 'dark', ...(phone ? { hasTouch: true, isMobile: true } : {}) })
  const p = await ctx.newPage()
  p.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  p.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
  p.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()) })
  await p.goto(BASE + '/?fresh=1')
  await p.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 }); await p.waitForTimeout(500)
  /* the board by its own door: Edit Schedule, then the day's own button */
  await p.evaluate(() => window.go('editsched')); await p.waitForFunction(() => window.CURPAGE === 'editsched')
  await p.locator('#eWeek [data-sbday="0"]').first().click()
  await p.locator('#schedBoard').waitFor({ state: 'visible' })
  return { ctx, p }
}
const box = (p, k) => p.locator(`#sbBoard [data-bfld="ff:0.0.0.${k}"]:visible`).first()
const model = (p, k) => p.evaluate(k => window.DAYS[0].waves[0].formations[0][k], k)
const focusedKey = p => p.evaluate(() => document.activeElement?.dataset?.bfld || document.activeElement?.dataset?.ifld || null)
async function press(p, loc, phone) {
  await loc.evaluate(e => e.scrollIntoView({ block: 'center' }))
  const b = await loc.boundingBox()
  if (phone) await p.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); else await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
  await p.waitForTimeout(150)
}
const settle = p => p.waitForTimeout(300)

for (const [tag, vp, phone] of [['D', { width: 1440, height: 900 }, false], ['P', { width: 402, height: 874 }, true]]) {
  const { ctx, p } = await start(vp, phone)
  const to = box(p, 'to'), ld = box(p, 'ld')
  // 1 — a time typed "1000" and left by Tab: saved 10:00, the box left reads 10:00, the caret on the landing
  await press(p, to, phone); await p.keyboard.type('1000'); await p.keyboard.press('Tab'); await settle(p)
  check(`${tag}1`, await model(p, 'to') === '10:00' && await to.inputValue() === '10:00' && await focusedKey(p) === 'ff:0.0.0.ld',
    `take-off "1000" + Tab: saved ${await model(p, 'to')}, the box reads "${await to.inputValue()}", the caret in ${await focusedKey(p)}`)
  await pic(p, `${phone ? 'phone' : 'desktop'}-tab-reads-1000-as-10-00`, to)
  // 2 — the landing too, left by a press on the next box rather than Tab (the other way off a box)
  // (Tab arms nothing — D1047 — so the landing's own time is selected first, as a person would)
  await ld.evaluate(e => e.select()); await p.keyboard.type('1135')
  const rmk = p.locator('#sbBoard [data-bfld="fr:0.0.0.0"]:visible').first()
  await press(p, rmk, phone); await settle(p)
  check(`${tag}2`, await model(p, 'ld') === '11:35' && await ld.inputValue() === '11:35', `landing "1135", then a press on the remarks: saved ${await model(p, 'ld')}, the box reads "${await ld.inputValue()}"`)
  // 3 — the R box test's own step: the take-off cleared (one tap, Backspace, Tab), then tapped empty, "1300", Enter
  await press(p, to, phone); await p.keyboard.press('Backspace'); await p.keyboard.press('Tab'); await settle(p)
  const cleared = await model(p, 'to')
  await press(p, to, phone); await p.keyboard.type('1300'); await p.keyboard.press('Enter'); await settle(p)
  check(`${tag}3`, cleared === '' && await model(p, 'to') === '13:00', `cleared → saved "${cleared}"; tapped empty, "1300", Enter → saved ${await model(p, 'to')} (box "${await to.inputValue()}")`)
  await pic(p, `${phone ? 'phone' : 'desktop'}-empty-box-1300-enter`, to)
  // 4 — the fold never writes under the caret: Enter keeps the caret in the box with what was typed, and Escape still puts the
  //     old time back (D1011)
  await p.keyboard.press('Tab'); await press(p, to, phone); await p.keyboard.type('9'); await p.keyboard.press('Escape'); await settle(p)
  check(`${tag}4`, await model(p, 'to') === '13:00' && await to.inputValue() === '13:00', `"9" then Escape: saved ${await model(p, 'to')}, the box reads "${await to.inputValue()}"`)
  // 5 — an input's own start on the board (Personal Inputs), if the day shows one: "1015" + Tab reads 10:15
  const istr = p.locator('#sbBoard [data-ifld$=".str"]:visible').first()
  if (await istr.count()) {
    await press(p, istr, phone); await p.keyboard.press(phone ? 'End' : 'End'); await p.keyboard.type('')
    await istr.evaluate(e => e.select()); await p.keyboard.type('1015'); await p.keyboard.press('Tab'); await settle(p)
    check(`${tag}5`, await istr.inputValue() === '10:15', `an input's own start "1015" + Tab: the box reads "${await istr.inputValue()}"`)
    await pic(p, `${phone ? 'phone' : 'desktop'}-input-start-10-15`, istr)
  } else check(`${tag}5`, true, 'no input with its own start on this day — nothing to walk here')
  await pic(p, `${phone ? 'phone' : 'desktop'}-board-after`, null)
  await ctx.close()
}
console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no console errors, no page errors, no 4xx')
console.log(`${results.filter(r => r[1]).length}/${results.length} PASS`)
await browser.close()
process.exit(results.every(r => r[1]) && !errors.length ? 0 : 1)
