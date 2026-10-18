/* Walk for [UPCHIT-SHEET-LEAVE-CUT] (owner D1023, 18 Oct 26 — branch claude/upchit-sheet-leave-cut): before an upchit moved
   later or deleted gives a downchit its days back, the upchit sheet lists each leave and bid of his those days will cut,
   one line each, in the Leave War's own words — worked out by trying the save and throwing it away.
   Drives the BUILT app already served (SPF_URL, default http://localhost:4231); builds nothing.
   Run: SPF_URL=http://localhost:4231 node scripts/handpass/upcut1018-walk.mjs
   Out: docs/img/handpass/2026-10-18-upchit-sheet-leave-cut/ (emptied first; HP_OUT for a re-walk).
   Set-up by hand: none — every input is filed, moved, deleted and undone through the app's own controls; the bid is placed
   on the Leave War's grid by its own sheet; the published day is published through the board's own sign-offs. The probe
   bridge is only READ (which days are published). Helpers copied from three1018-walk.mjs (the D1022 walk). */
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const BASE = process.env.SPF_URL || 'http://localhost:4231'
const OUT = process.env.HP_OUT ? resolve(process.env.HP_OUT) : resolve(here, '../../docs/img/handpass/2026-10-18-upchit-sheet-leave-cut')
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const sleep = ms => new Promise(r => setTimeout(r, ms))
console.log('upcut1018-walk v1 ->', OUT, 'at', BASE)

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
const iso = (m, d) => `2026-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
async function world({ touch = false, storageState, tag }) {
  const ctx = await browser.newContext({ viewport: touch ? { width: 390, height: 844 } : { width: 1440, height: 900 }, deviceScaleFactor: touch ? 2 : 1, isMobile: touch, hasTouch: touch, ...(storageState ? { storageState } : {}) })
  const page = await ctx.newPage(); watch(page, tag)
  await page.goto(BASE + '/'); await signIn(page, touch)
  await toInputs({ ctx, page, touch })
  return { ctx, page, touch }
}
async function toInputs(W) {
  await W.page.evaluate(() => window.go('inputs')); await sleep(800)
  const cal = W.page.locator('#inCalBtn')
  if (await W.page.locator('#inCalBtn[aria-pressed="false"]').count()) { await (W.touch ? cal.tap() : cal.click()); await sleep(400) }
}
const press = async (W, loc) => { if (W.touch) await loc.tap(); else await loc.click() }
async function toMonth(W, label) {
  for (let i = 0; i < 8; i++) {
    const h = (await W.page.locator('#inpCal .ic-mon').innerText()).trim()
    if (h.toLowerCase().includes(label.toLowerCase())) return true
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
  await closeWins(W.page)
}
async function sheetText(page, ms = 4000) {
  try { await page.waitForSelector(T('upconf'), { state: 'visible', timeout: ms }) } catch { return null }
  await sleep(250)
  return page.evaluate(() => document.querySelector('[data-testid="upconf"]').innerText.replace(/\s+/g, ' ').trim())
}
/* the sheet's cut lines, and the colour down each one's left */
const cutRead = page => page.evaluate(() => [...document.querySelectorAll('[data-testid^="upconf-cut-"]')].map(e => ({ t: e.textContent.trim(), edge: getComputedStyle(e).borderLeftColor, w: getComputedStyle(e).borderLeftWidth })))
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
  return bars(W.page, N)
}
/* what the Leave War's grid shows for `k` on `d` (its cell's words; '' for an empty cell) */
async function warCell(W, k, d) {
  await W.page.evaluate(() => window.go('leavewar')); await sleep(900)
  const c = W.page.locator(T(`cell-${k}-${d}`))
  for (let i = 0; i < 10 && !(await c.count()); i++) await sleep(400)
  if (!(await c.count())) return { found: false, text: '' }
  await c.scrollIntoViewIfNeeded().catch(() => {}); await sleep(300)
  const text = (await c.innerText()).replace(/\s+/g, ' ').trim()
  return { found: true, text, c }
}

const LL = (n, d) => `${n}'s LL on ${d} Oct is cut for the ATT C — that leave goes back to the balance`
const BID = (n, d) => `This replaces ${n}'s LL bid on ${d} Oct on the Leave War`

const W = await world({ tag: 'C desk' })
const { page } = W
const MAN = 'Warden', MANK = 'nact'
/* C0 — the set-up, by the app's own controls: ATT C 19–23, upchit 21 (cuts it to 19–20); fit, an LL on Thu 22; a bid Fri 23 */
{
  const h = (await page.locator('#inpCal .ic-mon').innerText()).trim()
  check('C0 the calendar is on October 2026, Warden has nothing that week', /october 2026/i.test(h) && (await bars(page, MAN)).length === 0, h)
  await downAndUp(W, MANK, MAN)
  await file(W, { person: MANK, type: 'LL', m: 10, from: 22 })
  const a = await bars(page, MAN)
  check('C0a set-up: ATT C Mon–Tue (cut by the upchit), Upchit Wed, LL Thu', span(a, 'ATT C') === nums(19, 20) && span(a, 'Upchit') === '21' && span(a, 'LL') === '22', `ATT C ${span(a, 'ATT C')}, Upchit ${span(a, 'Upchit')}, LL ${span(a, 'LL')}`, await shot(page, 'C0-set-up'))
  const cell = await warCell(W, MANK, iso(10, 23))
  let bidOk = false
  if (cell.found) {
    await cell.c.click(); await sleep(500)
    const b = page.locator(T('bid-LL'))
    /* below zero, the sheet asks first and a second tap of the same leave goes ahead (D418) */
    if (await b.count()) { await b.click(); await sleep(500); if (await b.count()) { await b.click(); await sleep(600) } }
    const again = await warCell(W, MANK, iso(10, 23))
    bidOk = /LL/.test(again.text)
    check('C0b a pending LL bid placed on Fri 23 Oct by the grid’s own sheet', bidOk, `cell reads "${again.text}"`, await shot(page, 'C0-bid-on-the-war'))
  } else check('C0b a pending LL bid placed on Fri 23 Oct by the grid’s own sheet', false, 'the cell was not found on the grid')
  await toInputs(W)
  W.bid = bidOk
}
/* C1 — the window's Delete: the sheet lists the leave and the bid; nothing changes while it asks */
{
  const ok = await openBar(W, MAN, 'Upchit')
  await press(W, page.locator('#inpEditDel'))
  const t = await sheetText(page)
  const cuts = await cutRead(page)
  const p = await shot(page, 'C1-delete-sheet-lists-the-cuts')
  const want = [LL(MAN, 22), ...(W.bid ? [BID(MAN, 23)] : [])]
  check('C1a Delete puts up the upchit sheet with the give-back AND one line for each cut, in the Leave War’s words',
    ok && !!t && /now ends\s*Oct 23, its days given back/.test(t) && JSON.stringify(cuts.map(c => c.t)) === JSON.stringify(want),
    `sheet: ${t} | lines: ${JSON.stringify(cuts.map(c => c.t))}`, p)
  check('C1b each cut line wears the amber edge down its left', cuts.length > 0 && cuts.every(c => c.edge === 'rgb(229, 168, 59)' && c.w === '3px'), JSON.stringify(cuts.map(c => [c.edge, c.w])))
  const mid = await bars(page, MAN)
  check('C1c nothing has changed while it asks', span(mid, 'ATT C') === nums(19, 20) && span(mid, 'Upchit') === '21' && span(mid, 'LL') === '22', `ATT C ${span(mid, 'ATT C')}, Upchit ${span(mid, 'Upchit')}, LL ${span(mid, 'LL')}`)
  await press(W, sheetBtn(W, 'cancel')); await sleep(500)
  const winUp = await page.locator('#inpEditDel').isVisible().catch(() => false)
  const c = await bars(page, MAN)
  check('C1d Cancel: the sheet gone, the window still open, all three as they were', !(await page.locator(T('upconf')).count()) && winUp && span(c, 'LL') === '22' && span(c, 'ATT C') === nums(19, 20), `window ${winUp}; ATT C ${span(c, 'ATT C')}, LL ${span(c, 'LL')}`, await shot(page, 'C1-after-cancel'))
  /* what was typed is kept through the try */
  await page.fill('#inpEditRmk', 'kept through the try'); await sleep(200)
  await press(W, page.locator('#inpEditDel')); await sheetText(page)
  await press(W, sheetBtn(W, 'cancel')); await sleep(400)
  const v = await page.inputValue('#inpEditRmk').catch(() => '(no box)')
  check('C1e a remark typed before Delete is still in its box after the sheet is cancelled', v === 'kept through the try', `remarks box: "${v}"`, await shot(page, 'C1-typing-kept'))
  await closeWins(page)
  /* the Leave War after the try: the leave and the bid still there */
  const ll = await warCell(W, MANK, iso(10, 22)), bd = await warCell(W, MANK, iso(10, 23))
  check('C1f the Leave War after asking: Thu 22 still LL, Fri 23 still the bid', /LL/.test(ll.text) && (!W.bid || /LL/.test(bd.text)), `22 "${ll.text}", 23 "${bd.text}"`, await shot(page, 'C1-war-after-asking'))
  await toInputs(W)
}
/* C2 — "Delete upchit": the cut made as listed */
{
  await openBar(W, MAN, 'Upchit')
  await press(W, page.locator('#inpEditDel')); await sheetText(page)
  await press(W, sheetBtn(W, 'save')); await sleep(800)
  const note = await page.evaluate(() => (document.getElementById('toastEl')?.textContent || '').trim())
  const d = await bars(page, MAN)
  check('C2a deleted: the upchit gone, ATT C Mon–Fri, the LL gone; the note says the cut beside "Input deleted"', span(d, 'Upchit') === 'none' && span(d, 'ATT C') === nums(19, 23) && span(d, 'LL') === 'none' && note.includes(LL(MAN, 22)) && /Input deleted/.test(note), `ATT C ${span(d, 'ATT C')}, LL ${span(d, 'LL')}; note "${note}"`, await shot(page, 'C2-after-delete'))
  const ll = await warCell(W, MANK, iso(10, 22)), bd = await warCell(W, MANK, iso(10, 23))
  check('C2b the Leave War: Thu 22 the ATT C (drawn "C"), Fri 23 the bid replaced by it', /C/.test(ll.text) && !/LL/.test(ll.text) && (!W.bid || (/C/.test(bd.text) && !/LL/.test(bd.text))), `22 "${ll.text}", 23 "${bd.text}"`, await shot(page, 'C2-war-after-delete'))
  await toInputs(W)
  await page.locator('#undoBtn').click(); await sleep(900)
  const u = await bars(page, MAN)
  check('C2c one Undo puts back the upchit, the cut and the LL', span(u, 'Upchit') === '21' && span(u, 'ATT C') === nums(19, 20) && span(u, 'LL') === '22', `ATT C ${span(u, 'ATT C')}, Upchit ${span(u, 'Upchit')}, LL ${span(u, 'LL')}`, await shot(page, 'C2-after-undo'))
}
/* C3 — Delete on the upchit's line in the opened day */
{
  await openDay(W, 10, 21)
  const row = page.locator(`${T('win-inputsday')} [data-testid^="idy-row-"]`).filter({ hasText: 'Warden' }).filter({ hasText: /Upchit/i }).locator(T('idy-open')).first()
  const has = await row.count()
  if (has) { await row.focus(); await page.keyboard.press('Delete') }
  const t = await sheetText(page, 3000)
  const cuts = await cutRead(page)
  check('C3a the Delete key on the line: the same sheet, the LL listed', has > 0 && !!t && cuts.some(c => c.t === LL(MAN, 22)), `sheet: ${t}`, await shot(page, 'C3-day-delete-key-sheet'))
  if (t) { await press(W, sheetBtn(W, 'cancel')); await sleep(400) }
  const c = await bars(page, MAN)
  check('C3b cancelled: nothing changed', span(c, 'Upchit') === '21' && span(c, 'LL') === '22', `Upchit ${span(c, 'Upchit')}, LL ${span(c, 'LL')}`)
  await closeWins(page)
}
/* C4 — the calendar's drag of the upchit to Sat 24 (D999: gives back to Fri 23) */
{
  const geo = await page.evaluate(() => {
    const bar = [...document.querySelectorAll('#inpCal .ib-bar')].find(b => b.innerText.includes('Warden') && !/·/.test(b.innerText.replace(/Upchit/, '')) && /Upchit|^\s*Warden\s*$/.test(b.innerText)) || [...document.querySelectorAll('#inpCal .ib-bar')].find(b => b.innerText.includes('Warden') && b.innerText.includes('Upchit'))
    const br = bar.getBoundingClientRect()
    const c = d => { const r = document.querySelector(`#inpCal [data-icday="${d}"]`).getBoundingClientRect(); return { x: (r.left + r.right) / 2, y: (r.top + r.bottom) / 2 } }
    return { bx: (br.left + br.right) / 2, by: (br.top + br.bottom) / 2, to: c('2026-10-24') }
  })
  await page.mouse.move(geo.bx, geo.by); await page.mouse.down(); await sleep(150)
  const dx = geo.to.x - geo.bx
  for (let i = 1; i <= 12; i++) { await page.mouse.move(geo.bx + dx * i / 12, geo.by + (i === 12 ? 0 : 2)); await sleep(30) }
  await sleep(200); await page.mouse.up(); await sleep(600)
  const t = await sheetText(page)
  const cuts = await cutRead(page)
  check('C4a the drag to Sat 24: the sheet gives back to Fri 23 and lists the LL (and the bid)', !!t && /now ends\s*Oct 23, its days given back/.test(t) && cuts.some(c => c.t === LL(MAN, 22)) && (!W.bid || cuts.some(c => c.t === BID(MAN, 23))), `sheet: ${t}`, await shot(page, 'C4-drag-sheet'))
  const mid = await bars(page, MAN)
  check('C4b nothing moved or cut by asking', span(mid, 'Upchit') === '21' && span(mid, 'LL') === '22', `Upchit ${span(mid, 'Upchit')}, LL ${span(mid, 'LL')}`)
  if (t) { await press(W, sheetBtn(W, 'save')); await sleep(800) }
  await closeWins(page)
  const d = await bars(page, MAN)
  check('C4c saved: the upchit on Sat 24, ATT C Mon–Fri, the LL gone', span(d, 'Upchit') === '24' && span(d, 'ATT C') === nums(19, 23) && span(d, 'LL') === 'none', `ATT C ${span(d, 'ATT C')}, Upchit ${span(d, 'Upchit')}, LL ${span(d, 'LL')}`, await shot(page, 'C4-after-drag'))
  await page.locator('#undoBtn').click(); await sleep(900)
  const u = await bars(page, MAN)
  check('C4d Undo: back to Wed 21, the LL back', span(u, 'Upchit') === '21' && span(u, 'LL') === '22', `Upchit ${span(u, 'Upchit')}, LL ${span(u, 'LL')}`)
}
/* C5 — the window's own Save of a later date (Sat 24) */
{
  await openBar(W, MAN, 'Upchit')
  await press(W, page.locator(T('inpEdCal-day-' + iso(10, 24)))); await sleep(250)
  await press(W, page.locator('#inpEditSave')); await sleep(500)
  const t = await sheetText(page)
  const cuts = await cutRead(page)
  check('C5a the window’s Save on Sat 24: the save sheet lists the LL under the give-back', !!t && /Saving this upchit will/i.test(t) && /now ends\s*Oct 23, its days given back/.test(t) && cuts.some(c => c.t === LL(MAN, 22)), `sheet: ${t}`, await shot(page, 'C5-window-save-sheet'))
  if (t) { await press(W, sheetBtn(W, 'cancel')); await sleep(400) }
  const c = await bars(page, MAN)
  check('C5b cancelled: nothing moved', span(c, 'Upchit') === '21' && span(c, 'LL') === '22', `Upchit ${span(c, 'Upchit')}, LL ${span(c, 'LL')}`)
  await closeWins(page)
}
/* C6 — a give-back with no leave in its days lists nothing */
{
  const M = 'Piston', K = 'pump'
  await downAndUp(W, K, M)
  await openBar(W, M, 'Upchit'); await press(W, page.locator('#inpEditDel'))
  const t = await sheetText(page)
  const cuts = await cutRead(page)
  check('C6 Piston, nothing in the days given back: the sheet as before, no cut line', !!t && /now ends\s*Oct 23/.test(t) && cuts.length === 0, `sheet: ${t}`, await shot(page, 'C6-no-cut'))
  if (t) { await press(W, sheetBtn(W, 'cancel')); await sleep(300) }
  await closeWins(page)
}
/* C7 — the phone: the sheet with its cut line fits */
const s1 = await W.ctx.storageState()
await W.ctx.close()
const P = await world({ touch: true, storageState: s1, tag: 'C phone' })
{
  const pg = P.page
  const r = await bars(pg, MAN)
  /* a phone's thin bars leave the kind out but for the first: his three bars read by their days (the absence colour on Thu 22 is the LL) */
  const days = JSON.stringify(r.map(b => b.days.map(d => +d.slice(-2)).join(',')).sort())
  check('C7-0 after a reload (the phone, the same browser’s store): Warden as left — ATT C Mon–Tue, Upchit Wed, LL Thu', days === JSON.stringify(['19,20', '21', '22']), `ATT C ${span(r, 'ATT C')}, Upchit ${span(r, 'Upchit')}, LL ${span(r, 'LL')}; every bar of his: ${JSON.stringify(r.map(b => b.label + ' ' + b.days.join(',')))}`, await shot(pg, 'C7-phone-month'))
  const ok = await openBar(P, MAN, 'Upchit')
  await press(P, pg.locator('#inpEditDel'))
  const t = await sheetText(pg)
  const p = await shot(pg, 'C7-phone-sheet')
  const m = await pg.evaluate(() => {
    const bx = document.querySelector('[data-testid="upconf"] .airpop-box')
    const r = bx.getBoundingClientRect()
    const cut = document.querySelector('[data-testid="upconf-cut-0"]')
    const cr = cut ? cut.getBoundingClientRect() : null
    const clipped = [...bx.querySelectorAll('*')].filter(e => e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== 'visible').map(e => e.className)
    const sv = document.querySelector('[data-testid="upconf-save"]').getBoundingClientRect()
    const hit = document.elementFromPoint((sv.left + sv.right) / 2, (sv.top + sv.bottom) / 2)
    return { l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top), b: Math.round(r.bottom), vw: innerWidth, vh: innerHeight, cut: cr ? [Math.round(cr.left), Math.round(cr.right), Math.round(cr.top), Math.round(cr.bottom)] : null, clipped, sideways: document.documentElement.scrollWidth - innerWidth, btnHit: !!hit && !!hit.closest('[data-testid="upconf-save"]') }
  })
  check('C7a on a phone the sheet and its cut lines are on the screen, words whole, the button under the finger', ok && !!t && t.includes(LL(MAN, 22)) && m.l >= 0 && m.r <= m.vw && m.t >= 0 && m.b <= m.vh && m.cut && m.clipped.length === 0 && m.sideways <= 0 && m.btnHit,
    `box ${m.l}..${m.r} x ${m.t}..${m.b} of ${m.vw}x${m.vh}; first cut line ${JSON.stringify(m.cut)}; clipped [${m.clipped}]; a finger on the button meets it ${m.btnHit}`, p)
  if (t) { await press(P, sheetBtn(P, 'cancel')); await sleep(400) }
  await closeWins(pg)
}
const s2 = await P.ctx.storageState()
await P.ctx.close()
/* C8 — a published day: asking leaves it as it was (nothing waiting); and a reload after asking keeps everything */
const D = await world({ storageState: s2, tag: 'C desk2' })
{
  const pg = D.page
  const r = await bars(pg, MAN)
  check('C8-0 after the phone asked and cancelled, and a reload: Warden still ATT C Mon–Tue, Upchit Wed, LL Thu', span(r, 'ATT C') === nums(19, 20) && span(r, 'Upchit') === '21' && span(r, 'LL') === '22', `ATT C ${span(r, 'ATT C')}, Upchit ${span(r, 'Upchit')}, LL ${span(r, 'LL')}`)
  const L = await import('./lib.mjs')
  await L.board(pg, 5)
  const pr = await L.publish(pg, 5)
  await L.closeBoard(pg)
  console.log('C8 set-up, Saturday published through the board:', JSON.stringify(pr))
  await toInputs(D)
  const pub = await pg.evaluate(() => ({ days: window.approvedDays(), dates: window.DATES }))
  const di = pub.days.find(i => i >= 2 && i <= 5)
  if (di == null) check('C8 a published day', false, 'NOT WALKED — no published day Wed–Sat: ' + JSON.stringify(pub))
  else {
    const dd = +pub.dates[di].replace(/\D/g, '')
    await toMonth(D, 'July 2026')
    const pick = await pg.evaluate(() => {
      const P = window.PEOPLE
      const busy = new Set(window.INPUTS.filter(r => /^Jul 1[3-9]$/.test(String(r.date)) || /^Jul 1[3-9]$/.test(String(r.endDate || ''))).flatMap(r => [r.person, ...(r.people || []).map(x => x.p)]).map(String))
      const k = Object.keys(P).find(k => !P[k].archived && !P[k].deleted && !P[k].special && !P[k].san && !P[k].pers && !busy.has(k) && !/^(Warden|Piston|Cinch)$/.test(P[k].cs))
      return { k, cs: P[k].cs }
    })
    const M = pick.cs, K = pick.k
    /* ATT C two days before the published day to it; the upchit the day after it starts; then, fit, LL the day before the published day */
    await downAndUp(D, K, M, 7, dd - 2, dd, dd - 1)
    await file(D, { person: K, type: 'LL', m: 7, from: dd - 1 })
    const a = await bars(pg, M)
    const headOf = async () => {
      await pg.evaluate(() => window.go('editsched')); await sleep(900)
      const h = await pg.evaluate(i => { const d = document.querySelector(`#eWeek .day[data-day="${i}"]`); if (!d) return '(no day)'; return (d.querySelector('.dhead, .day-head, header') || d).innerText.replace(/\s+/g, ' ').slice(0, 220) }, di)
      await toInputs(D); await toMonth(D, 'July 2026')
      return h
    }
    const headBefore = await headOf()
    check(`C8a set-up on July: ${M} ATT C ${dd - 2}, Upchit ${dd - 1}, LL ${dd - 1}… (the LL the upchit's day); the published ${pub.dates[di]} reads nothing waiting`, span(a, 'ATT C') === String(dd - 2) && span(a, 'Upchit') === String(dd - 1) && !/\d+ pending/i.test(headBefore), `ATT C ${span(a, 'ATT C')}, Upchit ${span(a, 'Upchit')}, LL ${span(a, 'LL')}; head "${headBefore}"`)
    await openBar(D, M, 'Upchit'); await press(D, pg.locator('#inpEditDel'))
    const t = await sheetText(pg)
    const cuts = await cutRead(pg)
    check(`C8b the sheet gives back to ${pub.dates[di]} and lists ${M}'s LL`, !!t && cuts.some(c => c.t.startsWith(`${M}'s LL on ${dd - 1} Jul is cut`)), `sheet: ${t}`, await shot(pg, 'C8-published-sheet'))
    if (t) { await press(D, sheetBtn(D, 'cancel')); await sleep(400) }
    await closeWins(pg)
    const headAfter = await headOf()
    check(`C8c cancelled: the published ${pub.dates[di]} still reads nothing waiting — the try left no change on it`, headAfter === headBefore && !/\d+ pending/i.test(headAfter), `before "${headBefore}" — after "${headAfter}"`)
    await pg.evaluate(() => window.go('editsched')); await sleep(900)
    await pg.evaluate(i => document.querySelector(`#eWeek .day[data-day="${i}"]`)?.scrollIntoView({ block: 'start', inline: 'start' }), di)
    await shot(pg, 'C8-published-day-unchanged')
    await toInputs(D); await toMonth(D, 'July 2026')
    const b = await bars(pg, M)
    check(`C8d and ${M}'s inputs as they were`, span(b, 'ATT C') === String(dd - 2) && span(b, 'Upchit') === String(dd - 1), `ATT C ${span(b, 'ATT C')}, Upchit ${span(b, 'Upchit')}, LL ${span(b, 'LL')}`)
  }
}
await D.ctx.close()
await browser.close()

const bad = results.filter(r => !r.ok)
console.log(`\nTOTAL ${results.length} checks, ${bad.length} FAIL`)
console.log('problems:', problems.length ? '\n' + problems.join('\n') : 'none')
writeFileSync(join(OUT, 'results.json'), JSON.stringify({ results, problems }, null, 1))
