// THE HOST'S SHORT WALK of [DAY-TITLE-ESCAPE] (owner D732, 10 Oct 26 — docs/handpass/2026-10-10-batch2-check.md §11).
// One box, one key: Escape in the "Day title…" box of a day opened on the Inputs calendar puts the title back as last
// saved and leaves the day open; the next Escape closes the day; Enter and leaving the box still save. Driven through
// the app's own controls in the built bundle: a desktop as the admin (Saber), the same desktop as a member (Ranger,
// by the app's own sign-out and sign-in, after a write — the order's §7.7), and a phone by touch with a keyboard
// attached. "Saved" is read off the SCREEN: the title the month prints on the date. A PASS is the right behaviour, so
// a run on a later build is the re-walk.
//
//   node scripts/handpass/d732-walk.mjs <out dir>        (LOOK_URL=http://localhost:4173/ by default)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const OUT = process.argv[2] || 'docs/img/handpass/2026-10-10-batch2-check/d732'
mkdirSync(OUT, { recursive: true })
const URL = process.env.LOOK_URL || 'http://localhost:4173/'
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
let bad = 0, n = 0
const errs = []
const say = (ok, name, detail = '') => { n++; if (!ok) bad++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`) }
const step = async (name, fn) => { try { const r = await fn(); say(!!r.ok, name, r.detail) } catch (e) { say(false, name, String(e.message || e).split('\n').slice(0, 6).join(' | ')) } }

const DAYWIN = '[data-testid="win-inputsday"]', TITLE = '#icRmkEdit', D = '2026-10-22', E = '2026-10-23'
const press = (touch, loc) => (touch ? loc.tap() : loc.click())
async function signIn(page, who, pass) {
  await page.fill('#luser', who); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
}
async function open(browser, viewport, touch = false) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: touch ? 2 : 1, ...(touch ? { isMobile: true, hasTouch: true } : {}) })
  const page = await ctx.newPage()
  const tag = `${viewport.width}x${viewport.height}`
  page.on('pageerror', e => errs.push(`${tag} pageerror: ` + String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') errs.push(`${tag} console: ` + m.text().slice(0, 200)) })
  page.on('response', r => { if (r.status() >= 400) errs.push(`${tag} HTTP ${r.status()} ${r.url()}`) })
  await page.goto(URL)
  await signIn(page, 'ad', 'a')
  return { ctx, page }
}
async function month(p, y, m, touch) {
  for (let i = 0; i < 60; i++) {
    const [name, year] = (await p.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = y * 12 + (m - 1) - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name)))
    if (!d) return
    await press(touch, p.locator(d > 0 ? '#icNext' : '#icPrev'))
  }
  throw new Error('the calendar never reached the month asked for')
}
async function openDay(p, iso, touch) {
  await p.evaluate(() => window.go('inputs'))
  if (await p.locator(DAYWIN).count()) { await p.locator(DAYWIN + ' .win-x').click(); await p.waitForTimeout(150) }
  if (await p.locator('#inCalBtn[aria-pressed="false"]').count()) await press(touch, p.locator('#inCalBtn'))
  await month(p, +iso.slice(0, 4), +iso.slice(5, 7), touch)
  const cell = p.locator(`#inpCal [data-icday="${iso}"]`)
  if (touch) await cell.tap({ position: { x: 8, y: 8 } }); else await cell.click({ position: { x: 8, y: 8 } })
  await p.locator(DAYWIN).waitFor()
}
const shot = (p, name) => p.screenshot({ path: join(OUT, name + '.png') })
/* what the month prints on the date — the saved title, as a person sees it */
const onDate = (p, iso) => p.locator(`#inpCal [data-ichead="${iso}"] .ic-rmk`).allTextContents().then(t => t.join('|'))
const state = async (p, iso) => ({
  day: await p.locator(DAYWIN).count(),
  box: (await p.locator(TITLE).count()) ? await p.locator(TITLE).inputValue() : null,
  focused: await p.evaluate(() => document.activeElement && document.activeElement.id === 'icRmkEdit'),
  onDate: await onDate(p, iso),
})

const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})

/* ── a desktop, the admin ─────────────────────────────────────────────────────────────────────────────────────────── */
{
  const { ctx, page } = await open(browser, { width: 1440, height: 900 })
  await step('T1 a saved title typed over, then Escape: the title is back, the keyboard is out of the box, the day is open, the date still reads the saved title; the next Escape closes the day', async () => {
    await openDay(page, D)
    await page.locator(TITLE).fill('Sports day')
    await page.keyboard.press('Enter')
    const saved = await state(page, D)
    await page.locator(TITLE).click()
    await page.keyboard.press('End'); await page.keyboard.type(' — cancelled')
    await shot(page, 'T1a-title-typed-over')
    await page.keyboard.press('Escape')
    const after = await state(page, D)
    await shot(page, 'T1b-after-escape')
    await page.keyboard.press('Escape')
    const closed = await state(page, D)
    await shot(page, 'T1c-second-escape')
    const ok = saved.onDate === 'Sports day' && after.day === 1 && after.box === 'Sports day' && !after.focused && after.onDate === 'Sports day' && closed.day === 0 && closed.onDate === 'Sports day'
    return { ok, detail: JSON.stringify({ saved: saved.onDate, after, closed: { day: closed.day, onDate: closed.onDate } }) }
  })
  await step('T2 a day with NO title, one half typed, then Escape: the box is empty again and the date has no title; then typed again and the box LEFT by a press elsewhere in the window — saved, as before', async () => {
    await openDay(page, E)
    await page.locator(TITLE).click()
    await page.keyboard.type('half a tit')
    await page.keyboard.press('Escape')
    const after = await state(page, E)
    await shot(page, 'T2a-no-title-after-escape')
    await page.locator(TITLE).click()
    await page.keyboard.type('Range day')
    await page.locator(DAYWIN + ' [data-testid="idy-list"]').click({ position: { x: 20, y: 20 } })
    const left = await state(page, E)
    await shot(page, 'T2b-left-the-box-saved')
    const ok = after.day === 1 && after.box === '' && after.onDate === '' && left.day === 1 && left.box === 'Range day' && left.onDate === 'Range day'
    return { ok, detail: JSON.stringify({ after, left }) }
  })
  await step('T3 THE OTHER ORDER — Escape in the title box when nothing was typed: the box is left, the day stays; and Escape in a NOTE box beside it is unchanged (the note box only)', async () => {
    await openDay(page, D)
    await page.locator(TITLE).click()
    await page.keyboard.press('Escape')
    const a = await state(page, D)
    await page.locator('#icAddPuck').click()
    await page.locator('.ic-newnote .ic-poppuck-edit').fill('half a thought')
    await page.keyboard.press('Escape')
    const b = { ...(await state(page, D)), note: await page.locator('.ic-newnote').count(), notes: await page.locator('[data-testid^="idy-note-"]').count() }
    await shot(page, 'T3-untyped-escape-then-note-escape')
    await page.keyboard.press('Escape')
    const c = await page.locator(DAYWIN).count()
    const ok = a.day === 1 && !a.focused && a.box === 'Sports day' && b.day === 1 && b.note === 0 && b.notes === 0 && b.box === 'Sports day' && b.onDate === 'Sports day' && c === 0
    return { ok, detail: JSON.stringify({ a, b, c }) }
  })
  await step('T4 A MEMBER (Ranger, by the app’s own sign-out and sign-in): the day’s title is words, not a box — and Escape closes his day at the first press, as before', async () => {
    await page.locator('#logout').click()
    await page.waitForSelector('#luser')
    await signIn(page, 'us', 'us')
    await openDay(page, D)
    const m = { box: await page.locator(TITLE).count(), words: await page.locator(DAYWIN + ' .ic-title-ro').allTextContents().then(t => t.join('|')) }
    await shot(page, 'T4a-member-reads-the-title')
    await page.keyboard.press('Escape')
    const day = await page.locator(DAYWIN).count()
    return { ok: m.box === 0 && m.words === 'Sports day' && day === 0, detail: JSON.stringify({ ...m, day }) }
  })
  await ctx.close()
}

/* ── a phone, by touch, with a keyboard attached ──────────────────────────────────────────────────────────────────── */
{
  const { ctx, page } = await open(browser, { width: 390, height: 844 }, true)
  await step('T5 A PHONE: the title typed and the box left by a tap elsewhere in the day — saved (no Escape key on a phone: this is its only route, unchanged); then, with a keyboard attached, typed over and Escape — the title is back and the day is still open', async () => {
    await openDay(page, D, true)
    await page.locator(TITLE).tap()
    await page.keyboard.type('Sports day')
    await page.locator(DAYWIN + ' [data-testid="idy-list"]').tap({ position: { x: 20, y: 20 } })
    const saved = await state(page, D)
    await shot(page, 'T5a-phone-title-saved-by-leaving')
    await page.locator(TITLE).tap()
    await page.keyboard.press('End'); await page.keyboard.type(' — off')
    await page.keyboard.press('Escape')
    const after = await state(page, D)
    await shot(page, 'T5b-phone-after-escape')
    const ok = saved.day === 1 && saved.box === 'Sports day' && saved.onDate === 'Sports day' && after.day === 1 && after.box === 'Sports day' && !after.focused && after.onDate === 'Sports day'
    return { ok, detail: JSON.stringify({ saved, after }) }
  })
  await ctx.close()
}
await browser.close()

console.log(`\n${n - bad} of ${n} steps as they should be${bad ? ` — ${bad} NOT` : ''}`)
console.log(errs.length ? 'ERRORS SEEN:\n  ' + [...new Set(errs)].join('\n  ') : 'no console error, page error or failed request')
process.exit(bad ? 1 : 0)
