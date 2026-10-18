/* Walk for night job 6 (18 Oct 26, D999): an upchit moved LATER gives a cut downchit its days back.
   Drives the BUILT app already served (SPF_URL, default http://localhost:4174); builds nothing.
   Run: SPF_URL=http://localhost:4174 node scripts/handpass/night1018-job6-walk.mjs
   Out: docs/img/handpass/2026-10-18-night-job6/ (emptied first). Desktop 1440x900; phone 390x844 touch for S6.
   Set-up by hand (no control can make it): none — everything is filed and moved through the Inputs page's own controls,
   except S5/S6 which first press Undo (a real control) to put the upchit back on a day where a give-back is possible. */
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const BASE = process.env.SPF_URL || 'http://localhost:4174'
const OUT = resolve(here, '../../docs/img/handpass/2026-10-18-night-job6')
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const sleep = ms => new Promise(r => setTimeout(r, ms))
console.log('night1018-job6-walk v1 ->', OUT, 'at', BASE)

const results = [], problems = []
let pic = 0
const check = (step, ok, note, picName) => {
  results.push({ step, ok, note, pic: picName || '' })
  console.log(`${ok ? 'PASS' : 'FAIL'} ${step} - ${note}${picName ? ` [${picName}]` : ''}`)
}
const shot = async (page, name) => {
  const f = `${String(++pic).padStart(2, '0')}-${name}.png`
  await page.screenshot({ path: join(OUT, f) })
  return f
}
const T = s => `[data-testid="${s}"]`
const iso = d => `2026-10-${String(d).padStart(2, '0')}`

async function world({ touch = false, storageState, tag }) {
  const ctx = await browser.newContext({ viewport: touch ? { width: 390, height: 844 } : { width: 1440, height: 900 }, deviceScaleFactor: touch ? 2 : 1, isMobile: touch, hasTouch: touch, ...(storageState ? { storageState } : {}) })
  const page = await ctx.newPage()
  page.on('pageerror', e => problems.push(`${tag}: page error: ${e.message}`))
  page.on('console', m => { if (m.type() === 'error') problems.push(`${tag}: console error: ${m.text()}`) })
  page.on('response', r => { if (r.status() >= 400) problems.push(`${tag}: ${r.status()} ${r.url()}`) })
  await page.goto(BASE + '/')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  const btn = page.locator('#loginForm button[type=submit]')
  if (touch) await btn.tap(); else await btn.click()
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(600)
  await page.evaluate(() => window.go('inputs')); await sleep(800)
  const cal = page.locator('#inCalBtn')
  if (await page.locator('#inCalBtn[aria-pressed="false"]').count()) { await (touch ? cal.tap() : cal.click()); await sleep(400) }
  return { ctx, page, touch }
}
const press = async (W, loc) => { if (W.touch) await loc.tap(); else await loc.click() }

/* the days (ISO) each calendar bar of a man covers, read from the boxes on screen */
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
/* a phone's bar is cut to the man's name alone: the Upchit is then the bar that carries no kind */
const kindIs = (label, kind) => kind === 'Upchit' ? (label.includes('Upchit') || !/·/.test(label)) : label.includes(kind)
const span = (bs, kind) => { const b = bs.find(x => kindIs(x.label, kind)); return b ? b.days.map(d => +d.slice(-2)).join(',') : 'none' }
const rangeStr = a => a.length === 0 ? 'none' : a.join(',')
const nums = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i).join(',')

async function closeWins(page) {
  for (let i = 0; i < 6; i++) {
    let hit = false
    for (const x of await page.locator(`${T('win-inputedit-x')}, ${T('win-inputsday-x')}`).all()) { if (await x.isVisible().catch(() => false)) { await x.click({ force: true }).catch(() => {}); await sleep(300); hit = true; break } }
    if (!hit) break
  }
}
async function openDay(W, d) {
  await closeWins(W.page)
  const c = W.page.locator(`#inpCal [data-icday="${iso(d)}"]`)
  if (W.touch) await c.tap(); else await c.click({ position: { x: 8, y: 8 } })
  await sleep(450)
}
const docAsk = async (W) => {
  const nd = W.page.locator(T('docconf-nodoc'))
  try { await nd.waitFor({ state: 'visible', timeout: 1500 }); await press(W, nd); await sleep(600); return true } catch { return false }
}
/* file an input for a man through the editor: type, first day, optional last day (one click on the later day extends the range) */
async function file(W, { person, type, from, to, nodoc = true }) {
  await openDay(W, from)
  await press(W, W.page.locator('#icPopAdd')); await W.page.waitForSelector(T('win-inputedit'), { state: 'visible' }); await sleep(300)
  await W.page.selectOption('#inpEditPerson', person)
  await W.page.selectOption('#inpEditType', type); await sleep(300)
  if (to && to !== from) { await press(W, W.page.locator(T('inpEdCal-day-' + iso(to)))); await sleep(250) }
  await press(W, W.page.locator('#inpEditSave')); await sleep(450)
  if (nodoc) await docAsk(W)
}
async function sheetText(page) {
  try { await page.waitForSelector(T('upconf'), { state: 'visible', timeout: 4000 }) } catch { return null }
  await sleep(250)
  return page.evaluate(() => document.querySelector('[data-testid="upconf"]').innerText.replace(/\s+/g, ' ').trim())
}
/* open an existing input of the calendar by its bar (a tap) - falls back to the day panel's row */
async function openBar(W, name, kind, dayHint) {
  await closeWins(W.page)
  const bs = await bars(W.page, name)
  const b = bs.find(x => kindIs(x.label, kind))
  if (!b) return false
  const loc = W.page.locator(`#inpCal ${T('ib-bar-' + b.iid)}`).first()
  await press(W, loc); await sleep(600)
  if (await W.page.locator('#inpEditSave').isVisible().catch(() => false)) return true
  // the day panel came up instead: open the row
  const row = W.page.locator(`${T('win-inputsday')} .sd-row`).filter({ hasText: kind }).locator('.sd-open').first()
  if (await row.count()) { await press(W, row); await sleep(600) }
  return W.page.locator('#inpEditSave').isVisible().catch(() => false)
}
const pickDay = async (W, d) => { await press(W, W.page.locator(T('inpEdCal-day-' + iso(d)))); await sleep(300) }
const sel = page => page.evaluate(() => [...document.querySelectorAll('[data-testid^="inpEdCal-day"]')].filter(b => b.className.includes('is-sel')).map(b => b.dataset.testid.slice(-2)).join(','))
const sheetBtn = (W, what) => what === 'save' ? W.page.locator(T('upconf-save')) : W.page.locator(`${T('upconf')} .abtn.ghost`)

/* ============ S1 ============ */
const W = await world({ tag: 'desk' })
const { page } = W
const heading = (await page.locator('#inpCal .ic-mon').innerText()).trim()
console.log('calendar on:', heading)
check('S0 the calendar is on the current month view', /october 2026/i.test(heading), heading)
const MAN = 'Warden', MANK = 'nact'
{
  const before = await bars(page, MAN)
  check('S0 Warden has no inputs that week', before.length === 0, JSON.stringify(before.map(b => b.label)))
  await file(W, { person: MANK, type: 'ATT C', from: 19, to: 23 })
  const b1 = await bars(page, MAN)
  check('S1a ATT C filed Mon-Fri (19-23)', span(b1, 'ATT C') === nums(19, 23), 'ATT C covers ' + span(b1, 'ATT C'))
  await closeWins(page)
  await openDay(W, 21)
  await press(W, page.locator('#icPopAdd')); await page.waitForSelector(T('win-inputedit'), { state: 'visible' }); await sleep(300)
  await page.selectOption('#inpEditPerson', MANK); await page.selectOption('#inpEditType', 'Upchit'); await sleep(300)
  await press(W, page.locator('#inpEditSave')); await sleep(450)
  await docAsk(W)
  const t = await sheetText(page)
  const p1 = await shot(page, 'S1-upchit-sheet')
  check('S1b the sheet says the ATT C now ends Tue (20)', !!t && /Upchit\s+.\s+Warden/.test(t) && /Saving this upchit will/i.test(t) && /ATT C.*now ends\s*Oct 20/.test(t), 'sheet: ' + t, p1)
  const mid = await bars(page, MAN)
  check('S1b before Save nothing has changed yet', span(mid, 'ATT C') === nums(19, 23) && span(mid, 'Upchit') === 'none', `ATT C ${span(mid, 'ATT C')}, upchit ${span(mid, 'Upchit')}`)
  await press(W, sheetBtn(W, 'save')); await sleep(700)
  await closeWins(page)
  const b2 = await bars(page, MAN)
  const p2 = await shot(page, 'S1-calendar-after')
  check('S1c calendar: ATT C Mon-Tue, Upchit Wed', span(b2, 'ATT C') === nums(19, 20) && span(b2, 'Upchit') === '21', `ATT C ${span(b2, 'ATT C')}, Upchit ${span(b2, 'Upchit')}`, p2)
}

/* ============ S2 ============ */
{
  const ok = await openBar(W, MAN, 'Upchit')
  check('S2a the upchit opens from its bar', ok, ok ? 'editor open' : 'editor did not open')
  await pickDay(W, 22)
  check('S2a editor date now Thu 22', (await sel(page)) === '22', 'selected ' + await sel(page))
  await press(W, page.locator('#inpEditSave')); await sleep(450); await docAsk(W)
  const t = await sheetText(page)
  const p = await shot(page, 'S2-sheet-given-back')
  check('S2b the sheet says "ATT C ... now ends Oct 21, its days given back"', !!t && /ATT C.*Oct 19\s*.\s*Oct 20.*now ends\s*Oct 21.*given back/.test(t), 'sheet: ' + t, p)
  await press(W, sheetBtn(W, 'cancel')); await sleep(600)
  const sheetGone = !(await page.locator(T('upconf')).isVisible().catch(() => false))
  const c = await bars(page, MAN)
  check('S2c Cancel on the sheet: sheet gone, ATT C still Mon-Tue, upchit still Wed', sheetGone && span(c, 'ATT C') === nums(19, 20) && span(c, 'Upchit') === '21', `sheet gone ${sheetGone}; ATT C ${span(c, 'ATT C')}, Upchit ${span(c, 'Upchit')}`, await shot(page, 'S2-after-cancel'))
  // save again
  if (!(await page.locator('#inpEditSave').isVisible().catch(() => false))) { await openBar(W, MAN, 'Upchit'); await pickDay(W, 22) }
  await press(W, page.locator('#inpEditSave')); await sleep(450); await docAsk(W)
  const t2 = await sheetText(page)
  check('S2d the sheet came again with the given-back line', !!t2 && /given back/.test(t2), 'sheet: ' + t2)
  await press(W, sheetBtn(W, 'save')); await sleep(700); await closeWins(page)
  const d = await bars(page, MAN)
  check('S2e saved: ATT C Mon-Wed, Upchit Thu', span(d, 'ATT C') === nums(19, 21) && span(d, 'Upchit') === '22', `ATT C ${span(d, 'ATT C')}, Upchit ${span(d, 'Upchit')}`, await shot(page, 'S2-calendar-saved'))
}

/* ============ S3 ============ */
{
  await openBar(W, MAN, 'Upchit'); await pickDay(W, 26)
  await press(W, page.locator('#inpEditSave')); await sleep(450); await docAsk(W)
  const t = await sheetText(page)
  const p = await shot(page, 'S3-sheet-next-monday')
  check('S3a the sheet says ATT C now ends Oct 23 (not further), given back', !!t && /ATT C.*now ends\s*Oct 23.*given back/.test(t) && !/Oct 24|Oct 25|Oct 26/.test((t.match(/now ends\s*Oct \d+/) || [''])[0]), 'sheet: ' + t, p)
  await press(W, sheetBtn(W, 'save')); await sleep(700); await closeWins(page)
  const d = await bars(page, MAN)
  check('S3b ATT C grew to Fri 23, no further; Upchit on Mon 26', span(d, 'ATT C') === nums(19, 23) && span(d, 'Upchit') === '26', `ATT C ${span(d, 'ATT C')}, Upchit ${span(d, 'Upchit')}`, await shot(page, 'S3-calendar'))
}

/* ============ S4 ============ */
{
  const undo = page.locator('#undoBtn'), redo = page.locator('#redoBtn')
  check('S4 the top bar has Undo and Redo', (await undo.count()) === 1 && (await redo.count()) === 1, `undo ${await undo.count()}, redo ${await redo.count()}`)
  await closeWins(page)
  await undo.click(); await sleep(800)
  const a = await bars(page, MAN)
  check('S4a Undo once: upchit back on Thu 22 and ATT C Mon-Wed', span(a, 'Upchit') === '22' && span(a, 'ATT C') === nums(19, 21), `ATT C ${span(a, 'ATT C')}, Upchit ${span(a, 'Upchit')}`, await shot(page, 'S4-after-undo'))
  await redo.click(); await sleep(800)
  const b = await bars(page, MAN)
  check('S4b Redo: back to Upchit Mon 26, ATT C Mon-Fri', span(b, 'Upchit') === '26' && span(b, 'ATT C') === nums(19, 23), `ATT C ${span(b, 'ATT C')}, Upchit ${span(b, 'Upchit')}`, await shot(page, 'S4-after-redo'))
}

/* ============ S5: calendar drag ============ */
{
  await closeWins(page)
  await page.locator('#undoBtn').click(); await sleep(800) // set-up: Undo (real control) puts the upchit back on Thu 22, ATT C Mon-Wed
  const a = await bars(page, MAN)
  console.log('S5 set-up by Undo: ATT C', span(a, 'ATT C'), 'Upchit', span(a, 'Upchit'))
  const geo = await page.evaluate(() => {
    const bar = [...document.querySelectorAll('#inpCal .ib-bar')].find(b => b.innerText.includes('Warden') && b.innerText.includes('Upchit'))
    const br = bar.getBoundingClientRect()
    const c = d => { const r = document.querySelector(`#inpCal [data-icday="${d}"]`).getBoundingClientRect(); return { x: (r.left + r.right) / 2, y: (r.top + r.bottom) / 2 } }
    return { bx: (br.left + br.right) / 2, by: (br.top + br.bottom) / 2, to: c('2026-10-23') }
  })
  await page.mouse.move(geo.bx, geo.by); await page.mouse.down(); await sleep(150)
  const dx = geo.to.x - geo.bx
  for (let i = 1; i <= 12; i++) { await page.mouse.move(geo.bx + dx * i / 12, geo.by + (i === 12 ? 0 : 2)); await sleep(30) }
  await sleep(200)
  const midShot = await shot(page, 'S5-drag-in-flight')
  await page.mouse.up(); await sleep(500)
  const t = await sheetText(page)
  const p = await shot(page, 'S5-drag-sheet')
  check('S5a the drag brings the same sheet with the given-back line (ATT C now ends Oct 22... or days given)', !!t && /Upchit/.test(t) && /ATT C.*now ends/.test(t), 'sheet: ' + t, p)
  const mid = await bars(page, MAN)
  check('S5b before Save the drag has changed nothing', t ? span(mid, 'Upchit') === '22' && span(mid, 'ATT C') === nums(19, 21) : false, `ATT C ${span(mid, 'ATT C')}, Upchit ${span(mid, 'Upchit')}`, midShot)
  if (t) { await press(W, sheetBtn(W, 'save')); await sleep(700) }
  await closeWins(page)
  const d = await bars(page, MAN)
  check('S5c saved: Upchit on Fri 23, ATT C ends Thu 22 (Mon-Thu)', span(d, 'Upchit') === '23' && span(d, 'ATT C') === nums(19, 22), `ATT C ${span(d, 'ATT C')}, Upchit ${span(d, 'Upchit')}`, await shot(page, 'S5-calendar-after'))
}

/* ============ S6: phone ============ */
const state1 = await W.ctx.storageState()
await W.ctx.close()
const P = await world({ touch: true, storageState: state1, tag: 'phone' })
{
  const pg = P.page
  const bs = await bars(pg, MAN)
  check('S6-0 phone world holds the man\'s data (ATT C Mon-Thu, Upchit Fri)', span(bs, 'ATT C') === nums(19, 22) && span(bs, 'Upchit') === '23', `ATT C ${span(bs, 'ATT C')}, Upchit ${span(bs, 'Upchit')}`)
  const ok = await openBar(P, MAN, 'Upchit')
  check('S6a the upchit opens by a tap', ok, ok ? 'editor open' : 'editor did not open', await shot(pg, 'S6-editor'))
  await pickDay(P, 24)
  await press(P, pg.locator('#inpEditSave')); await sleep(450); await docAsk(P)
  const t = await sheetText(pg)
  const p = await shot(pg, 'S6-phone-sheet')
  const m = await pg.evaluate(() => {
    const bx = document.querySelector('[data-testid="upconf"] .airpop-box') || document.querySelector('[data-testid="upconf"]')
    const r = bx.getBoundingClientRect()
    const clipped = [...bx.querySelectorAll('*')].filter(e => e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== 'visible').map(e => e.className)
    const ink = [...bx.querySelectorAll('li, .upconf-fit, .upconf-h, b')].filter(e => { const q = e.getBoundingClientRect(); return q.right > innerWidth + 0.5 || q.left < -0.5 }).length
    return { l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top), b: Math.round(r.bottom), vw: innerWidth, vh: innerHeight, clipped, outside: ink, sideways: document.documentElement.scrollWidth - innerWidth }
  })
  check('S6b the sheet fits 390x844 with its words whole and the given-back line', !!t && m.l >= 0 && m.r <= m.vw && m.t >= 0 && m.b <= m.vh && m.clipped.length === 0 && m.outside === 0 && m.sideways <= 0 && /ATT C.*now ends\s*Oct 23.*given back/.test(t), `box ${m.l}..${m.r} x ${m.t}..${m.b} of ${m.vw}x${m.vh}; clipped [${m.clipped}]; words outside ${m.outside}; sideways ${m.sideways}; sheet: ${t}`, p)
  if (t) { await press(P, sheetBtn(P, 'save')); await sleep(700) }
  await closeWins(pg)
  const d = await bars(pg, MAN)
  check('S6c saved on the phone: Upchit Sat 24, ATT C Mon-Fri', span(d, 'Upchit') === '24' && span(d, 'ATT C') === nums(19, 23), `ATT C ${span(d, 'ATT C')}, Upchit ${span(d, 'Upchit')}`)
}
const state2 = await P.ctx.storageState()
await P.ctx.close()

/* ============ S7: Medical tab ============ */
const D = await world({ storageState: state2, tag: 'desk2' })
{
  const pg = D.page
  await pg.locator('.intab:has-text("Medical"), [data-testid="tab-medical"]').first().click(); await sleep(900)
  /* the tab reads "as of 13 Jul" (the demo day): move its date to Wed 21 Oct, where Warden's ATT C is running */
  await pg.locator('button:has-text("as of")').first().click(); await sleep(500)
  for (let i = 0; i < 3; i++) { await pg.locator('button:visible').filter({ hasText: /^›$/ }).last().click(); await sleep(250) }
  await pg.locator('button:visible').filter({ hasText: /^21$/ }).last().click(); await sleep(900)
  console.log('Medical tab date button:', (await pg.locator('button:has-text("as of")').first().innerText()).trim())
  const txt = await pg.evaluate(() => document.body.innerText.replace(/\s+/g, ' '))
  const i = txt.indexOf('Warden')
  const around = i >= 0 ? txt.slice(i, i + 260) : '(Warden not on the Medical tab)'
  const p = await shot(pg, 'S7-medical-tab')
  check('S7 the Medical tab shows Warden\'s ATT C with the new dates (Oct 19 - Oct 23)', i >= 0 && /ATT C\s*19\s*[–-]\s*23\s*Oct/.test(around), 'card text: ' + around, p)
  await pg.locator('.intab:has-text("Inputs"), [data-testid="tab-inputs"]').first().click(); await sleep(700)
  const cal = pg.locator('#inCalBtn'); if (await pg.locator('#inCalBtn[aria-pressed="false"]').count()) { await cal.click(); await sleep(400) }
}

/* ============ B1: a hand-changed end is never grown past ============ */
{
  const pg = D.page, M = 'Piston', K = 'pump'
  await file(D, { person: K, type: 'ATT C', from: 19, to: 23 })
  await openDay(D, 21); await press(D, pg.locator('#icPopAdd')); await pg.waitForSelector(T('win-inputedit'), { state: 'visible' }); await sleep(300)
  await pg.selectOption('#inpEditPerson', K); await pg.selectOption('#inpEditType', 'Upchit'); await sleep(300)
  await press(D, pg.locator('#inpEditSave')); await sleep(450); await docAsk(D)
  await sheetText(pg); await press(D, sheetBtn(D, 'save')); await sleep(700); await closeWins(pg)
  const a = await bars(pg, M)
  check('B1-0 set-up: Piston ATT C Mon-Tue, upchit Wed', span(a, 'ATT C') === nums(19, 20) && span(a, 'Upchit') === '21', `ATT C ${span(a, 'ATT C')}, Upchit ${span(a, 'Upchit')}`)
  // by hand: open the ATT C and end it on Mon 19 (one click on the first day)
  const ok = await openBar(D, M, 'ATT C')
  check('B1a the ATT C opens by its bar', ok, ok ? 'editor open' : 'editor did not open')
  await pickDay(D, 19)
  const s1 = await sel(pg)
  await press(D, pg.locator('#inpEditSave')); await sleep(450); await docAsk(D)
  await sleep(400)
  const extra = await sheetText(pg).catch(() => null)
  if (extra) { console.log('B1 an extra sheet showed on the hand edit:', extra); await press(D, sheetBtn(D, 'save')); await sleep(600) }
  await closeWins(pg)
  const b = await bars(pg, M)
  check('B1b the hand edit stuck: ATT C is Mon 19 only', span(b, 'ATT C') === '19', `selected ${s1}; ATT C ${span(b, 'ATT C')}, Upchit ${span(b, 'Upchit')}`, await shot(pg, 'B1-after-hand-edit'))
  await openBar(D, M, 'Upchit'); await pickDay(D, 23)
  await press(D, pg.locator('#inpEditSave')); await sleep(450); await docAsk(D)
  const t = await sheetText(pg)
  const p = await shot(pg, 'B1-sheet')
  check('B1c moving the upchit later: no give-back line for the hand-shortened ATT C', t !== null && !/given back/.test(t), 'sheet: ' + t, p)
  if (t) { await press(D, sheetBtn(D, 'save')); await sleep(700) }
  await closeWins(pg)
  const c = await bars(pg, M)
  check('B1d ATT C stays Mon 19 only; Upchit on Fri 23', span(c, 'ATT C') === '19' && span(c, 'Upchit') === '23', `ATT C ${span(c, 'ATT C')}, Upchit ${span(c, 'Upchit')}`, await shot(pg, 'B1-calendar-after'))
}

/* ============ B2: an OML in the gap stops the growth ============ */
{
  const pg = D.page, M = 'Cinch', K = 'snap'
  await file(D, { person: K, type: 'ATT C', from: 19, to: 23 })
  await openDay(D, 21); await press(D, pg.locator('#icPopAdd')); await pg.waitForSelector(T('win-inputedit'), { state: 'visible' }); await sleep(300)
  await pg.selectOption('#inpEditPerson', K); await pg.selectOption('#inpEditType', 'Upchit'); await sleep(300)
  await press(D, pg.locator('#inpEditSave')); await sleep(450); await docAsk(D)
  await sheetText(pg); await press(D, sheetBtn(D, 'save')); await sleep(700); await closeWins(pg)
  const a = await bars(pg, M)
  check('B2-0 set-up: Cinch ATT C Mon-Tue, upchit Wed', span(a, 'ATT C') === nums(19, 20) && span(a, 'Upchit') === '21', `ATT C ${span(a, 'ATT C')}, Upchit ${span(a, 'Upchit')}`)
  await file(D, { person: K, type: 'OML', from: 22 })
  await closeWins(pg)
  const b = await bars(pg, M)
  check('B2a OML filed on Thu 22 in the gap', span(b, 'OML') === '22' && span(b, 'ATT C') === nums(19, 20), `OML ${span(b, 'OML')}, ATT C ${span(b, 'ATT C')}, Upchit ${span(b, 'Upchit')}`, await shot(pg, 'B2-oml-filed'))
  await openBar(D, M, 'Upchit'); await pickDay(D, 23)
  await press(D, pg.locator('#inpEditSave')); await sleep(450); await docAsk(D)
  const t = await sheetText(pg)
  const p = await shot(pg, 'B2-sheet')
  check('B2b the sheet says ATT C now ends Oct 21 (the day before the OML), given back', !!t && /ATT C.*now ends\s*Oct 21.*given back/.test(t), 'sheet: ' + t, p)
  if (t) { await press(D, sheetBtn(D, 'save')); await sleep(700) }
  await closeWins(pg)
  const c = await bars(pg, M)
  check('B2c ATT C Mon-Wed, OML Thu, Upchit Fri', span(c, 'ATT C') === nums(19, 21) && span(c, 'OML') === '22' && span(c, 'Upchit') === '23', `ATT C ${span(c, 'ATT C')}, OML ${span(c, 'OML')}, Upchit ${span(c, 'Upchit')}`, await shot(pg, 'B2-calendar-after'))
}
await D.ctx.close()
await browser.close()

const bad = results.filter(r => !r.ok)
console.log(`\nTOTAL ${results.length} checks, ${bad.length} FAIL`)
console.log('problems:', problems.length ? '\n' + problems.join('\n') : 'none')
writeFileSync(join(OUT, 'results.json'), JSON.stringify({ results, problems }, null, 1))
