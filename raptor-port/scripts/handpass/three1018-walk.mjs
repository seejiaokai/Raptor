/* Walk for his three follow-ups of 18 Oct 26 (branch claude/three-small-jobs-1018):
     L — D1019: the Leave War grid card's buttons take the phone's short words up to 700 wide;
     E — D1020: the calendar floating over a date box shuts its month and year lists first on Escape;
     U — D1022: a deleted upchit gives the downchit it cut its days back, asked first on the upchit sheet.
   Drives the BUILT app already served (SPF_URL, default http://localhost:4174); builds nothing.
   Run: SPF_URL=http://localhost:4174 node scripts/handpass/three1018-walk.mjs
   Out: docs/img/handpass/2026-10-18-three-small-jobs/ (emptied first).
   Set-up by hand: none — every input is filed, deleted and undone through the app's own controls; the published day of
   U7 is the demo's own. The probe bridge is only READ (which days are published, which days have changes waiting). */
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const BASE = process.env.SPF_URL || 'http://localhost:4174'
const OUT = resolve(here, '../../docs/img/handpass/2026-10-18-three-small-jobs')
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const sleep = ms => new Promise(r => setTimeout(r, ms))
console.log('three1018-walk v1 ->', OUT, 'at', BASE)

const results = [], problems = []
let pic = 0
const check = (step, ok, note, picName) => {
  results.push({ step, ok, note, pic: picName || '' })
  console.log(`${ok ? 'PASS' : 'FAIL'} ${step} - ${note}${picName ? ` [${picName}]` : ''}`)
}
const shot = async (page, name, top = false) => {
  if (top) { await page.evaluate(() => window.scrollTo(0, 0)); await sleep(150) }
  const f = `${String(++pic).padStart(2, '0')}-${name}.png`
  await page.screenshot({ path: join(OUT, f) })
  return f
}
const T = s => `[data-testid="${s}"]`
const watch = (page, tag) => {
  page.on('pageerror', e => problems.push(`${tag}: page error: ${e.message}`))
  page.on('console', m => { if (m.type() === 'error') problems.push(`${tag}: console error: ${m.text()}`) })
  page.on('response', r => { if (r.status() >= 400) problems.push(`${tag}: ${r.status()} ${r.url()}`) })
}
async function signIn(page, touch, user = 'ad', pass = 'a') {
  await page.fill('#luser', user); await page.fill('#lpass', pass)
  const btn = page.locator('#loginForm button[type=submit]')
  if (touch) await btn.tap(); else await btn.click()
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(600)
}

/* ================= L — the Leave War card's buttons ================= */
const cardRead = () => {
  const pg = document.querySelector('#page-leavewar')
  const vis = e => { if (!e) return null; const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1 ? r : null }
  const seen = e => !e ? '' : [...e.childNodes].map(n => n.nodeType === 3 ? n.textContent : (vis(n) ? n.textContent : '')).join('').replace(/\s+/g, ' ').trim()
  const hd = pg.querySelector('.card-hd')
  const btns = hd ? [...hd.querySelectorAll('button')].filter(vis) : []
  const tops = [...new Set(btns.map(b => Math.round(b.getBoundingClientRect().top)))]
  const r = vis(hd)
  const rows = [...pg.querySelectorAll('[data-testid^="row-"]')].filter(e => { const q = vis(e); return q && q.top >= 0 && q.bottom <= innerHeight })
  const past = btns.filter(b => b.getBoundingClientRect().right > innerWidth + 0.5).length
  return {
    vw: innerWidth, tops, hdH: r ? Math.round(r.height) : null,
    arrange: seen(pg.querySelector('[data-testid="roster-arrange"]')), oil: seen(pg.querySelector('[data-testid="oil-tracker"]')),
    zoom: !!vis(pg.querySelector('[data-testid="lw-zoom"]')), rowsOnScreen: rows.length, past,
    stagePad: getComputedStyle(pg.querySelector('.stage')).paddingLeft, sideways: document.documentElement.scrollWidth - innerWidth,
  }
}
const SIZES = [[390, 844], [430, 932], [431, 932], [440, 956], [600, 960], [700, 900], [701, 900], [1440, 900]]
for (const role of ['admin', 'member']) {
  for (const [w, h] of role === 'admin' ? SIZES : [[440, 956], [701, 900]]) {
    const touch = w <= 700
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: touch, hasTouch: touch })
    const page = await ctx.newPage(); watch(page, `L ${role} ${w}`)
    await page.goto(BASE + '/?fresh=1')
    await signIn(page, touch, role === 'admin' ? 'ad' : 'us', role === 'admin' ? 'a' : 'us')
    await page.evaluate(() => window.go('leavewar'))
    await page.waitForSelector('[data-testid^="row-"]', { state: 'attached' }); await sleep(700)
    const m = await page.evaluate(cardRead)
    const short = w <= 700
    const p = await shot(page, `L-${role}-${w}`, true)
    const wantOil = short ? '◷ OIL' : '◷ OIL tracker'
    const wantArr = role === 'member' ? '' : short ? '⇅' : '⇅ Rearrange'
    check(`L ${role} ${w} wide: the card's buttons read ${short ? 'the short words' : 'the full words'}`,
      m.oil === wantOil && m.arrange === wantArr,
      `OIL "${m.oil}", Rearrange "${m.arrange}"`, p)
    check(`L ${role} ${w} wide: the card's head is one line with − and + on it, nothing past the edge`,
      m.tops.length === 1 && m.zoom && m.past === 0 && m.sideways <= 0,
      `button tops ${JSON.stringify(m.tops)}, head ${m.hdH}px, zoom shown ${m.zoom}, past the edge ${m.past}, page sideways ${m.sideways}; ${m.rowsOnScreen} rows of names on screen; grid padding ${m.stagePad}`)
    if (w > 430 && w <= 700) check(`L ${role} ${w} wide: the grid's padding is the wider screens' (unchanged)`, m.stagePad !== '10px', `padding-left ${m.stagePad}`)
    await ctx.close()
  }
}

/* ================= E — Escape over a date box (desktop: a keyboard) ================= */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage(); watch(page, 'E')
  await page.goto(BASE + '/?fresh=1'); await signIn(page, false)
  await page.evaluate(() => window.go('inputs')); await sleep(700)
  await page.click('#inGear'); await sleep(300); await page.click(T('iset-days')); await sleep(500)
  const x = page.locator(T('win-inputsset-x')); if (await x.count()) await x.evaluate(e => e.click())
  await page.click(T('days-wd-3')); await sleep(500)
  const win = T('win-every')
  check('E0 the "Every Thursday" window is up', await page.locator(win).isVisible(), 'win-every shown')
  await page.click(T('every-from')); await sleep(400)
  check('E1 the From box opens the calendar', await page.locator(T('dcal-card')).isVisible(), 'dcal-card shown')
  await page.click(T('dcal-title')); await sleep(400)
  const listsUp = await page.locator(T('dcal-lists')).isVisible()
  const p1 = await shot(page, 'E1-lists-open')
  check('E1 the title opens the month and year lists', listsUp, `lists shown ${listsUp}`, p1)
  await page.keyboard.press('Escape'); await sleep(350)
  const st = await page.evaluate(() => ({ lists: !!document.querySelector('[data-testid="dcal-lists"]'), card: !!document.querySelector('[data-testid="dcal-card"]'), win: !!document.querySelector('[data-testid="win-every"]'), ae: document.activeElement?.getAttribute('data-testid') || document.activeElement?.tagName }))
  const p2 = await shot(page, 'E2-first-escape')
  check('E2 the first Escape shuts only the lists; the calendar and the window stay; the keyboard on the title', !st.lists && st.card && st.win && st.ae === 'dcal-title', JSON.stringify(st), p2)
  await page.keyboard.press('Escape'); await sleep(350)
  const st2 = await page.evaluate(() => ({ card: !!document.querySelector('[data-testid="dcal-card"]'), win: !!document.querySelector('[data-testid="win-every"]'), ae: document.activeElement?.getAttribute('data-testid') }))
  const p3 = await shot(page, 'E3-second-escape')
  check('E3 the second Escape closes the calendar; the window stays; the keyboard back on the From box', !st2.card && st2.win && st2.ae === 'every-from', JSON.stringify(st2), p3)
  await page.keyboard.press('Escape'); await sleep(350)
  const st3 = await page.evaluate(() => ({ win: !!document.querySelector('[data-testid="win-every"]'), days: !!document.querySelector('[data-testid="win-days"]') }))
  check('E4 the third Escape closes the "Every" window; the Calendar window behind stays', !st3.win && st3.days, JSON.stringify(st3), await shot(page, 'E4-third-escape'))
  /* the other order: lists opened, a month chosen by a tap, then Escape — no lists left, so it closes the calendar at once */
  await page.click(T('days-wd-3')); await sleep(400); await page.click(T('every-from')); await sleep(300)
  await page.click(T('dcal-title')); await sleep(300); await page.click(T('dcal-title')); await sleep(300)
  const shutByTitle = !(await page.locator(T('dcal-lists')).count())
  await page.keyboard.press('Escape'); await sleep(300)
  check('E5 lists shut by the title first: one Escape then closes the calendar (nothing left to shut first)', shutByTitle && !(await page.locator(T('dcal-card')).count()) && await page.locator(win).isVisible(), `lists shut by the title ${shutByTitle}`)
  await ctx.close()
}

/* ================= U — an upchit deleted ================= */
const iso = (m, d) => `2026-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
async function world({ touch = false, storageState, tag }) {
  const ctx = await browser.newContext({ viewport: touch ? { width: 390, height: 844 } : { width: 1440, height: 900 }, deviceScaleFactor: touch ? 2 : 1, isMobile: touch, hasTouch: touch, ...(storageState ? { storageState } : {}) })
  const page = await ctx.newPage(); watch(page, tag)
  await page.goto(BASE + '/'); await signIn(page, touch)
  await page.evaluate(() => window.go('inputs')); await sleep(800)
  const cal = page.locator('#inCalBtn')
  if (await page.locator('#inCalBtn[aria-pressed="false"]').count()) { await (touch ? cal.tap() : cal.click()); await sleep(400) }
  return { ctx, page, touch }
}
const press = async (W, loc) => { if (W.touch) await loc.tap(); else await loc.click() }
async function toMonth(W, label) {
  for (let i = 0; i < 8; i++) {
    const h = (await W.page.locator('#inpCal .ic-mon').innerText()).trim()
    if (h.toLowerCase().includes(label.toLowerCase())) { console.log('calendar on:', h); return true }
    const prev = W.page.locator('#inpCal [aria-label="Previous month"], #icPrev, [data-testid="ic-prev"]').first()
    await press(W, prev); await sleep(400)
  }
  return false
}
async function bars(page, name) {
  return page.evaluate(n => {
    const cells = [...document.querySelectorAll('#inpCal [data-icday]')].filter(c => c.getClientRects().length).map(c => ({ d: c.dataset.icday, r: c.getBoundingClientRect() }))
    return [...document.querySelectorAll('#inpCal .ib-bar')].filter(b => b.getClientRects().length && b.innerText.includes(n)).map(b => {
      const r = b.getBoundingClientRect(), cy = (r.top + r.bottom) / 2
      const days = cells.filter(c => cy >= c.r.top && cy <= c.r.bottom && (c.r.left + c.r.right) / 2 >= r.left && (c.r.left + c.r.right) / 2 <= r.right).map(c => c.d).sort()
      return { label: b.innerText.replace(/\s+/g, ' ').trim(), iid: b.dataset.iid, days }
    })
  }, name)
}
const kindIs = (label, kind) => kind === 'Upchit' ? (label.includes('Upchit') || !/·/.test(label)) : label.includes(kind)
const span = (bs, kind) => { const b = bs.find(x => kindIs(x.label, kind)); return b ? b.days.map(d => +d.slice(-2)).join(',') : 'none' }
const nums = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i).join(',')
async function closeWins(page) {
  for (let i = 0; i < 6; i++) {
    let hit = false
    for (const x of await page.locator(`${T('win-inputedit-x')}, ${T('win-inputsday-x')}`).all()) { if (await x.isVisible().catch(() => false)) { await x.click({ force: true }).catch(() => {}); await sleep(300); hit = true; break } }
    if (!hit) break
  }
}
async function openDay(W, m, d) {
  await closeWins(W.page)
  const c = W.page.locator(`#inpCal [data-icday="${iso(m, d)}"]`)
  if (W.touch) await c.tap(); else await c.click({ position: { x: 8, y: 8 } })
  await sleep(450)
}
const docAsk = async (W) => { const nd = W.page.locator(T('docconf-nodoc')); try { await nd.waitFor({ state: 'visible', timeout: 1500 }); await press(W, nd); await sleep(600); return true } catch { return false } }
async function file(W, { person, type, m, from, to }) {
  await openDay(W, m, from)
  await press(W, W.page.locator('#icPopAdd')); await W.page.waitForSelector(T('win-inputedit'), { state: 'visible' }); await sleep(300)
  await W.page.selectOption('#inpEditPerson', person)
  await W.page.selectOption('#inpEditType', type); await sleep(300)
  if (to && to !== from) { await press(W, W.page.locator(T('inpEdCal-day-' + iso(m, to)))); await sleep(250) }
  await press(W, W.page.locator('#inpEditSave')); await sleep(450)
  await docAsk(W)
}
async function sheetText(page, ms = 4000) {
  try { await page.waitForSelector(T('upconf'), { state: 'visible', timeout: ms }) } catch { return null }
  await sleep(250)
  return page.evaluate(() => document.querySelector('[data-testid="upconf"]').innerText.replace(/\s+/g, ' ').trim())
}
async function openBar(W, name, kind) {
  await closeWins(W.page)
  const b = (await bars(W.page, name)).find(x => kindIs(x.label, kind))
  if (!b) return false
  await press(W, W.page.locator(`#inpCal ${T('ib-bar-' + b.iid)}`).first()); await sleep(600)
  if (await W.page.locator('#inpEditSave').isVisible().catch(() => false)) return true
  const row = W.page.locator(`${T('win-inputsday')} .sd-row`).filter({ hasText: kind }).locator('.sd-open').first()
  if (await row.count()) { await press(W, row); await sleep(600) }
  return W.page.locator('#inpEditSave').isVisible().catch(() => false)
}
const sheetBtn = (W, what) => what === 'save' ? W.page.locator(T('upconf-save')) : W.page.locator(`${T('upconf')} .abtn.ghost`)
/* file ATT C Mon 19 – Fri 23 Oct and an upchit Wed 21 (the upchit's own sheet saved), for `K` */
async function downAndUp(W, K, N, m = 10, a = 19, b = 23, u = 21) {
  await file(W, { person: K, type: 'ATT C', m, from: a, to: b })
  await openDay(W, m, u); await press(W, W.page.locator('#icPopAdd')); await W.page.waitForSelector(T('win-inputedit'), { state: 'visible' }); await sleep(300)
  await W.page.selectOption('#inpEditPerson', K); await W.page.selectOption('#inpEditType', 'Upchit'); await sleep(300)
  await press(W, W.page.locator('#inpEditSave')); await sleep(450); await docAsk(W)
  await sheetText(W.page); await press(W, sheetBtn(W, 'save')); await sleep(700); await closeWins(W.page)
  const x = await bars(W.page, N)
  return x
}

const W = await world({ tag: 'U desk' })
const { page } = W
const MAN = 'Warden', MANK = 'nact'
{
  const h = (await page.locator('#inpCal .ic-mon').innerText()).trim()
  check('U0 the calendar is on October 2026, Warden has nothing that week', /october 2026/i.test(h) && (await bars(page, MAN)).length === 0, h)
  const a = await downAndUp(W, MANK, MAN)
  check('U0 set-up: ATT C Mon–Tue (cut by the upchit), Upchit Wed', span(a, 'ATT C') === nums(19, 20) && span(a, 'Upchit') === '21', `ATT C ${span(a, 'ATT C')}, Upchit ${span(a, 'Upchit')}`, await shot(page, 'U0-set-up'))
}
/* U1 — the window's Delete asks; nothing until it is answered; Cancel */
{
  const ok = await openBar(W, MAN, 'Upchit')
  check('U1a the upchit opens from its bar', ok, ok ? 'the window is open' : 'did not open')
  await press(W, page.locator('#inpEditDel'))
  const t = await sheetText(page)
  const p = await shot(page, 'U1-delete-sheet')
  check('U1b Delete puts up the upchit sheet: "Deleting this upchit will … ATT C Oct 19 – Oct 20 → now ends Oct 23, its days given back", no fit line, a red "Delete upchit"',
    !!t && /Upchit\s+.\s+Warden/.test(t) && /Deleting this upchit will/.test(t) && /ATT C\s*Oct 19\s*.\s*Oct 20\s*→\s*now ends\s*Oct 23, its days given back/.test(t) && !/Fit for full duty/.test(t) && /Delete upchit/.test(t),
    'sheet: ' + t, p)
  const cls = await page.locator(T('upconf-save')).getAttribute('class')
  check('U1c its button is the red one', /danger/.test(cls || ''), 'class ' + cls)
  const mid = await bars(page, MAN)
  check('U1d nothing has changed while it asks', span(mid, 'ATT C') === nums(19, 20) && span(mid, 'Upchit') === '21', `ATT C ${span(mid, 'ATT C')}, Upchit ${span(mid, 'Upchit')}`)
  await press(W, sheetBtn(W, 'cancel')); await sleep(500)
  const c = await bars(page, MAN)
  const winUp = await page.locator('#inpEditDel').isVisible().catch(() => false)
  check('U1e Cancel: the sheet gone, the window still open, both as they were', !(await page.locator(T('upconf')).count()) && winUp && span(c, 'ATT C') === nums(19, 20) && span(c, 'Upchit') === '21', `window open ${winUp}; ATT C ${span(c, 'ATT C')}, Upchit ${span(c, 'Upchit')}`, await shot(page, 'U1-after-cancel'))
}
/* U2 — Delete upchit */
{
  if (!(await page.locator('#inpEditDel').isVisible().catch(() => false))) await openBar(W, MAN, 'Upchit')
  await press(W, page.locator('#inpEditDel')); await sheetText(page)
  await press(W, sheetBtn(W, 'save')); await sleep(800)
  const winGone = !(await page.locator('#inpEditDel').isVisible().catch(() => false)) && !(await page.locator(T('upconf')).count())
  const toast = await page.evaluate(() => [...document.querySelectorAll('.toast, [data-testid="toast"], .snack')].map(e => e.textContent.trim()).filter(Boolean).join(' | '))
  const d = await bars(page, MAN)
  check('U2 "Delete upchit": the upchit gone, ATT C back to Mon–Fri, the window closed', winGone && span(d, 'Upchit') === 'none' && span(d, 'ATT C') === nums(19, 23), `window and sheet gone ${winGone}; note "${toast}"; ATT C ${span(d, 'ATT C')}, Upchit ${span(d, 'Upchit')}`, await shot(page, 'U2-after-delete'))
}
/* U3 — Undo, Redo */
{
  await closeWins(page)
  await page.locator('#undoBtn').click(); await sleep(800)
  const a = await bars(page, MAN)
  check('U3a Undo once: the upchit back on Wed and the ATT C cut to Mon–Tue again', span(a, 'Upchit') === '21' && span(a, 'ATT C') === nums(19, 20), `ATT C ${span(a, 'ATT C')}, Upchit ${span(a, 'Upchit')}`, await shot(page, 'U3-after-undo'))
  await page.locator('#redoBtn').click(); await sleep(800)
  const b = await bars(page, MAN)
  check('U3b Redo: deleted again, ATT C Mon–Fri', span(b, 'Upchit') === 'none' && span(b, 'ATT C') === nums(19, 23), `ATT C ${span(b, 'ATT C')}, Upchit ${span(b, 'Upchit')}`, await shot(page, 'U3-after-redo'))
  await page.locator('#undoBtn').click(); await sleep(800)   // set-up for U4 by the real control: the upchit back
}
/* U4 — Delete on the upchit's line in the opened day */
{
  const a = await bars(page, MAN)
  check('U4-0 set-up by Undo: upchit Wed, ATT C Mon–Tue', span(a, 'Upchit') === '21' && span(a, 'ATT C') === nums(19, 20), `ATT C ${span(a, 'ATT C')}, Upchit ${span(a, 'Upchit')}`)
  await openDay(W, 10, 21)
  const lineSel = `${T('win-inputsday')} [data-testid^="idy-row-"]`
  const row = page.locator(lineSel).filter({ hasText: 'Warden' }).filter({ hasText: /Upchit/i }).locator(T('idy-open')).first()
  const has = await row.count()
  if (has) { await row.focus(); await page.keyboard.press('Delete') }
  const t = await sheetText(page, 3000)
  const inline = await page.locator(T('idy-ask')).count()
  const p = await shot(page, 'U4-day-delete-key-sheet')
  check('U4a Delete on the line puts up the same sheet, in place of the one-line question', has > 0 && !!t && inline === 0 && /Deleting this upchit will/.test(t) && /now ends\s*Oct 23, its days given back/.test(t), `line found ${has}; one-line question ${inline}; sheet: ${t}`, p)
  if (t) { await press(W, sheetBtn(W, 'save')); await sleep(800) }
  const dayUp = await page.locator(T('win-inputsday')).isVisible().catch(() => false)
  const d = await bars(page, MAN)
  check('U4b "Delete upchit": gone, ATT C Mon–Fri; the day stays open', dayUp && span(d, 'Upchit') === 'none' && span(d, 'ATT C') === nums(19, 23), `day open ${dayUp}; ATT C ${span(d, 'ATT C')}, Upchit ${span(d, 'Upchit')}`, await shot(page, 'U4-after'))
}
/* U5 — an ordinary input's Delete key still asks its one-line question; an upchit with nothing to give back goes at once */
{
  const M = 'Piston', K = 'pump'
  const a = await downAndUp(W, K, M)
  check('U5-0 set-up: Piston ATT C Mon–Tue, upchit Wed', span(a, 'ATT C') === nums(19, 20) && span(a, 'Upchit') === '21', `ATT C ${span(a, 'ATT C')}, Upchit ${span(a, 'Upchit')}`)
  /* by hand: end the ATT C on Mon 19 — it forgets what it was filed with (D999's reading), so nothing comes back */
  await openBar(W, M, 'ATT C'); await press(W, page.locator(T('inpEdCal-day-' + iso(10, 19)))); await sleep(250)
  await press(W, page.locator('#inpEditSave')); await sleep(450); await docAsk(W)
  const extra = await sheetText(page, 1200); if (extra) { await press(W, sheetBtn(W, 'save')); await sleep(600) }
  await closeWins(page)
  const b = await bars(page, M)
  check('U5a the hand edit stuck: ATT C Mon 19 only', span(b, 'ATT C') === '19', `ATT C ${span(b, 'ATT C')}, Upchit ${span(b, 'Upchit')}`)
  await openBar(W, M, 'Upchit'); await press(W, page.locator('#inpEditDel')); await sleep(700)
  const sheet = await page.locator(T('upconf')).count()
  const c = await bars(page, M)
  check('U5b nothing to give back: Delete deletes at once, no sheet (D792)', sheet === 0 && span(c, 'Upchit') === 'none' && span(c, 'ATT C') === '19', `sheet ${sheet}; ATT C ${span(c, 'ATT C')}, Upchit ${span(c, 'Upchit')}`, await shot(page, 'U5-delete-at-once'))
  await openDay(W, 10, 19)
  const row = page.locator(`${T('win-inputsday')} [data-testid^="idy-row-"]`).filter({ hasText: 'Piston' }).locator(T('idy-open')).first()
  if (await row.count()) { await row.focus(); await page.keyboard.press('Delete'); await sleep(300) }
  const ask = await page.locator(T('idy-ask')).count(), up = await page.locator(T('upconf')).count()
  check('U5c a downchit’s Delete key still asks its one-line question, not the upchit sheet', ask === 1 && up === 0, `one-line question ${ask}; upchit sheet ${up}`, await shot(page, 'U5-downchit-question'))
  const keep = page.locator(T('idy-del-no')); if (await keep.count()) await keep.click()
  await closeWins(page)
}
/* U6 — the phone: the sheet fits */
const s1 = await W.ctx.storageState()
await W.ctx.close()
const P = await world({ touch: true, storageState: s1, tag: 'U phone' })
{
  const pg = P.page
  const M = 'Cinch', K = 'snap'
  const a = await downAndUp(P, K, M)
  check('U6-0 set-up on the phone: Cinch ATT C Mon–Tue, upchit Wed', span(a, 'ATT C') === nums(19, 20) && span(a, 'Upchit') === '21', `ATT C ${span(a, 'ATT C')}, Upchit ${span(a, 'Upchit')}`)
  const ok = await openBar(P, M, 'Upchit')
  await press(P, pg.locator('#inpEditDel'))
  const t = await sheetText(pg)
  const p = await shot(pg, 'U6-phone-delete-sheet')
  const m = await pg.evaluate(() => {
    const bx = document.querySelector('[data-testid="upconf"] .airpop-box') || document.querySelector('[data-testid="upconf"]')
    const r = bx.getBoundingClientRect()
    const clipped = [...bx.querySelectorAll('*')].filter(e => e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== 'visible').map(e => e.className)
    const sv = document.querySelector('[data-testid="upconf-save"]').getBoundingClientRect()
    const hit = document.elementFromPoint((sv.left + sv.right) / 2, (sv.top + sv.bottom) / 2)
    return { l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top), b: Math.round(r.bottom), vw: innerWidth, vh: innerHeight, clipped, sideways: document.documentElement.scrollWidth - innerWidth, btnHit: !!hit && !!hit.closest('[data-testid="upconf-save"]') }
  })
  check('U6a on a phone the sheet is on the screen, its words whole, its button under the finger', ok && !!t && m.l >= 0 && m.r <= m.vw && m.t >= 0 && m.b <= m.vh && m.clipped.length === 0 && m.sideways <= 0 && m.btnHit && /now ends\s*Oct 23, its days given back/.test(t),
    `box ${m.l}..${m.r} x ${m.t}..${m.b} of ${m.vw}x${m.vh}; clipped [${m.clipped}]; sideways ${m.sideways}; a finger on the button meets it ${m.btnHit}; sheet: ${t}`, p)
  if (t) { await press(P, sheetBtn(P, 'save')); await sleep(800) }
  await closeWins(pg)
  const d = await bars(pg, M)
  check('U6b deleted by a tap: ATT C Mon–Fri', span(d, 'Upchit') === 'none' && span(d, 'ATT C') === nums(19, 23), `ATT C ${span(d, 'ATT C')}, Upchit ${span(d, 'Upchit')}`, await shot(pg, 'U6-phone-after'))
}
const s2 = await P.ctx.storageState()
await P.ctx.close()
/* U7 — a reload keeps it; and a published day given back reads pending */
const D = await world({ storageState: s2, tag: 'U desk2' })
{
  const pg = D.page
  const r = await bars(pg, MAN)
  check('U7-0 after a reload Warden still reads ATT C Mon–Fri with no upchit', span(r, 'ATT C') === nums(19, 23) && span(r, 'Upchit') === 'none', `ATT C ${span(r, 'ATT C')}, Upchit ${span(r, 'Upchit')}`)
  const pub = await pg.evaluate(() => ({ days: window.approvedDays(), dates: window.DATES }))
  console.log('published days of the loaded week:', JSON.stringify(pub))
  const di = pub.days.find(i => i >= 2 && i <= 5)
  if (di == null) check('U7 a published day given back reads pending', false, 'NOT WALKED - no published day Wed-Sat in the loaded week: ' + JSON.stringify(pub))
  else {
    const dd = +pub.dates[di].replace(/\D/g, '')     // "Jul 18" -> 18
    const onJuly = await toMonth(D, 'July 2026')
    const M = 'Grit', K = await pg.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Grit'))
    const before = await bars(pg, M)
    console.log('Grit on July before:', JSON.stringify(before.map(b => b.label + ' ' + b.days.join(','))))
    /* ATT C from two days before the published day to it; the upchit the day after the ATT C starts cuts it short of it */
    const a = await downAndUp(D, K, M, 7, dd - 2, dd, dd - 1)
    const pendBefore = await pg.evaluate(i => window.pendDays().includes(i), di)
    check(`U7a set-up on July: Grit ATT C ${dd - 2} only, upchit ${dd - 1} (the published ${pub.dates[di]} no longer covered)`, onJuly && span(a, 'ATT C') === String(dd - 2) && span(a, 'Upchit') === String(dd - 1), `ATT C ${span(a, 'ATT C')}, Upchit ${span(a, 'Upchit')}; the published day has changes waiting: ${pendBefore}`)
    await openBar(D, M, 'Upchit'); await press(D, pg.locator('#inpEditDel'))
    const t = await sheetText(pg)
    const p = await shot(pg, 'U7-published-sheet')
    check(`U7b the sheet says the ATT C now ends ${pub.dates[di]}`, !!t && new RegExp(`now ends\\s*${pub.dates[di]}, its days given back`).test(t), 'sheet: ' + t, p)
    if (t) { await press(D, sheetBtn(D, 'save')); await sleep(800) }
    await closeWins(pg)
    const pendAfter = await pg.evaluate(i => window.pendDays().includes(i), di)
    const b = await bars(pg, M)
    check(`U7c deleted: ATT C ${dd - 2}–${dd}, and the published ${pub.dates[di]} reads a change waiting (D178)`, span(b, 'ATT C') === nums(dd - 2, dd) && span(b, 'Upchit') === 'none' && pendAfter, `ATT C ${span(b, 'ATT C')}, Upchit ${span(b, 'Upchit')}; changes waiting before ${pendBefore}, after ${pendAfter}`, await shot(pg, 'U7-published-after'))
    await pg.evaluate(() => window.go('editsched')); await sleep(900)
    const head = await pg.evaluate(i => { const d = document.querySelector(`#eWeek .day[data-day="${i}"]`); if (!d) return '(no day)'; d.scrollIntoView({ block: 'start', inline: 'start' }); return (d.querySelector('.dhead, .day-head, header') || d).innerText.replace(/\s+/g, ' ').slice(0, 220) }, di)
    check(`U7d Edit Schedule: the published ${pub.dates[di]}'s head reads a change waiting (RECORD its words)`, /pending/i.test(head), 'head: ' + head, await shot(pg, 'U7-editsched-published-day'))
  }
}
await D.ctx.close()
await browser.close()

const bad = results.filter(r => !r.ok)
console.log(`\nTOTAL ${results.length} checks, ${bad.length} FAIL`)
console.log('problems:', problems.length ? '\n' + problems.join('\n') : 'none')
writeFileSync(join(OUT, 'results.json'), JSON.stringify({ results, problems }, null, 1))
