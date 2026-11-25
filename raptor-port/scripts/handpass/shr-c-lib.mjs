// shr-c-lib — walker C's helpers for the shared-row walk of 25 Nov 26 (Share C, the Leave War's windows).
// Built on ./wr4-lib.mjs (the frozen build served inside the test browser). The Leave War's ways are copied from
// lw-r3-lib.mjs (cells, the bid window, remarks, closeAny) and lw-nb-docclose.mjs (the document viewer).
//   WR4_OUT=<picture folder> WR4_NEW=.tmp/build-6c7f3aac7 node scripts/handpass/shr-c-<x>.mjs
import * as L from './wr4-lib.mjs'
import { join } from 'node:path'
import { writeFileSync, appendFileSync, mkdirSync } from 'node:fs'
export { L }
export const BUNDLE = process.env.SHR_BUNDLE || 'index-BiU7Aj55.js'   // a later round's build names its own (chat 181)
export const T = id => `[data-testid="${id}"]`
export const J = JSON.stringify
export const sleep = L.sleep
const REPORT_DIR = '.tmp/shr-c'
mkdirSync(REPORT_DIR, { recursive: true })
export const results = []
export function rec(id, size, verdict, said, pics = []) {
  const r = { id, size, verdict, said, pics }
  results.push(r)
  console.log(`RESULT ${verdict} | ${id} [${size}] | ${said} | ${pics.join(', ')}`)
}
export function saveResults(name) { writeFileSync(join(REPORT_DIR, name), J({ results, errors: L.facts.errors }, null, 1)) }

/* a world: wr4-lib's page, plus a CDP finger on a Chromium phone */
export async function world(size, engine = 'chromium') {
  const w = await L.newPage(size, undefined, L.NEW_DIR, engine)
  w.engine = engine; w.phone = size === 'phone'
  w.cdp = w.phone && engine === 'chromium' ? await w.ctx.newCDPSession(w.page) : null
  w.tag = `${size}-${engine}`
  const b = await L.bundleOf(w.page)
  console.log(`[${w.tag}] bundle ${b}`)
  if (b !== BUNDLE) throw new Error('WRONG BUNDLE ' + b)
  return w
}
export async function signIn(w, user) { await L.signIn(w, user) }
export async function signOutIn(w, user) { await sleep(900); await L.signIn(w, user) }

/* a picture: cut to the union of the shown elements of sels (padded), or the whole screen */
export async function pic(w, name, sels = null, pad = 10) {
  const P = w.page
  let clip = null
  if (sels) clip = await L.boxOf(P, sels, pad)
  if (clip && (clip.width < 2 || clip.height < 2)) clip = null
  const file = `${name}.png`
  await P.screenshot({ path: join(L.OUT, file), ...(clip ? { clip } : {}) })
  return file
}
/* a finger on a phone (CDP in Chromium, touchscreen in WebKit), with a quick picture ~60–100ms after the lift; a click on desktop */
export async function finger(w, x, y, quickName = null) {
  const P = w.page
  if (w.cdp) {
    await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] })
    await P.waitForTimeout(40)
    await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  } else await P.touchscreen.tap(x, y)
  if (quickName) { await P.waitForTimeout(50); await P.screenshot({ path: join(L.OUT, quickName + '.png') }) }
  await P.waitForTimeout(300)
}
export async function centre(P, sel) {
  const loc = P.locator(sel).first()
  await loc.evaluate(e => { if (e.closest('td') || e.tagName === 'TD') e.scrollIntoView({ block: 'nearest', inline: 'center' }) }).catch(() => {})
  await loc.scrollIntoViewIfNeeded().catch(() => {}); await P.waitForTimeout(80)
  const b = await loc.boundingBox()
  if (!b) throw new Error('no box for ' + sel)
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 }
}
/* press a control: a finger on a phone (quick picture), a mouse click on desktop */
export async function press(w, sel, quickName = null) {
  if (w.phone) { const c = await centre(w.page, sel); await finger(w, c.x, c.y, quickName); return c }
  const loc = w.page.locator(sel).first()
  await loc.scrollIntoViewIfNeeded().catch(() => {})
  try { await loc.click({ timeout: 5000 }) } catch { const b = await loc.boundingBox({ timeout: 5000 }); await w.page.mouse.click(b.x + b.width / 2, b.y + b.height / 2) }
  await w.page.waitForTimeout(250)
}
export const vis = async (P, sel) => { const l = P.locator(sel).first(); return (await l.count()) > 0 && await l.isVisible() }
export const txt = async (P, sel) => (await P.locator(sel).count()) ? (await P.locator(sel).first().innerText()).replace(/\s+/g, ' ').trim() : null
export const active = P => P.evaluate(() => { const e = document.activeElement; return e ? (e.dataset?.testid || e.id || e.tagName) : null })

/* ---------- the Leave War ---------- */
const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
export async function toWar(w) { await w.page.evaluate(() => window.go('leavewar')); await w.page.waitForFunction(() => window.CURPAGE === 'leavewar'); await w.page.waitForSelector('[data-testid^="row-"]', { timeout: 10000 }); await sleep(800) }
/* the month strip's lit month, read from the screen */
export const monthShown = P => P.evaluate(() => { const b = [...document.querySelectorAll('[data-testid^="month-"]')].find(b => b.classList.contains('on') || b.getAttribute('aria-pressed') === 'true' || b.getAttribute('aria-current')); return b ? b.dataset.testid.slice(6) + ' ' + (b.innerText || '').trim() : null })
/* bring a day's cell into the grid: press the month button and read the screen until the cell is drawn */
export async function reachCell(w, who, iso) {
  const P = w.page, sel = `[data-testid="cell-${who}-${iso}"]`
  const mon = MON[Number(iso.slice(5, 7)) - 1]
  for (let i = 0; i < 4 && !(await P.locator(sel).count()); i++) {
    await P.evaluate(() => window.scrollTo(0, 0)); await sleep(200)
    if (await P.locator(T('month-' + mon)).count()) await press(w, T('month-' + mon))
    await sleep(1200)
  }
  const there = await P.locator(sel).count()
  return { there: !!there, month: await monthShown(P) }
}
export async function openCell(w, who, iso, quickName = null) {
  const r = await reachCell(w, who, iso)
  if (!r.there) throw new Error(`cell ${who} ${iso} never drawn (month shown ${r.month})`)
  const c = await press(w, T(`cell-${who}-${iso}`), quickName)
  await sleep(500)
  return r
}
/* the open window, in words: which one, its text, its testids */
export const sheet = P => P.evaluate(() => {
  const sheets = [...document.querySelectorAll('.sheet, .bidsheet, [data-testid="bid-picker"], [data-testid="daylist-sheet"], [data-testid="select-sheet"], [role="dialog"]')].filter(e => e.getBoundingClientRect().height > 0)
  const s = sheets[sheets.length - 1]
  if (!s) return null
  const r = s.getBoundingClientRect()
  return { id: s.dataset.testid || String(s.className).slice(0, 60), text: s.innerText.replace(/\n+/g, ' | ').slice(0, 600), tids: [...new Set([...s.querySelectorAll('[data-testid]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.dataset.testid))], box: { top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right) }, vp: [innerWidth, innerHeight] }
})
export const SHEETS = ['[data-testid="bid-picker"]', '[data-testid="daylist-sheet"]', '[data-testid="select-sheet"]', '.bidsheet', '[role="dialog"]']
export async function closeAny(w) {
  for (const t of ['bid-cancel', 'daylist-close', 'sel-cancel', 'closed-note-close', 'remarks-cancel', 'award-close', 'move-cancel', 'open-dates-close']) {
    if (await vis(w.page, T(t))) { await press(w, T(t)); await sleep(300) }
  }
}
/* the cell's text and its boxes' classes */
export const cellSays = (P, who, iso) => P.evaluate(([who, iso]) => { const td = document.querySelector(`[data-testid="cell-${who}-${iso}"]`); if (!td) return null; return { text: td.innerText.replace(/\s+/g, ' ').trim(), boxes: [...td.querySelectorAll('.c')].map(c => `${c.textContent}|${(String(c.className).match(/s-[awr]/) || [''])[0]}`) } }, [who, iso])

/* ---------- what is SAVED ---------- */
/* every input of the named people on the dates (display "Jul 15") — the store */
export const store = (P, pids, dates) => P.evaluate(([pids, dates]) => {
  const MON3 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const nm = { bane: 'Ranger', rocky: 'Hex' }
  return (window.INPUTS || []).filter(r => ((r.people || []).some(x => pids.includes(x.p)) || pids.includes(r.person)) && (!dates || dates.includes(r.date) || (r.endDate && dates.includes(r.endDate))))
    .map(r => `${(r.people && r.people.length ? r.people.map(x => nm[x.p] || x.p) : [nm[r.person] || r.person]).join('+')} ${r.type} ${r.date}${r.endDate ? '–' + r.endDate : ''} ${r.allday ? 'allday' : r.s + '-' + r.e} rmk="${r.remarks || ''}" till=${r.till ?? '-'} docs=${Object.keys(r).filter(k => /doc/i.test(k)).map(k => k + ':' + (Array.isArray(r[k]) ? r[k].length : JSON.stringify(r[k]))).join(',') || 0} [${r.iid}]`)
}, [pids, dates])
export const storeRaw = (P, iid) => P.evaluate(i => { const r = (window.INPUTS || []).find(x => String(x.iid) === String(i)); return r ? structuredClone(r) : null }, iid)
/* a point inside a window that holds no control (not the heading, which may be the window's handle) — a tap there leaves a box */
export const blankIn = (P, winSel) => P.evaluate(sel => {
  const s = document.querySelector(sel); if (!s) return null
  const r = s.getBoundingClientRect(), hd = s.querySelector('.bidsheet-hd')?.getBoundingClientRect()
  const top = hd ? hd.bottom + 2 : r.top + 40
  for (let y = top; y < r.bottom - 4; y += 6) for (let x = r.left + 4; x < r.right - 4; x += 8) {
    const e = document.elementFromPoint(x, y)
    if (!e || !s.contains(e)) continue
    if (e.closest('button, input, textarea, label, select, a, [role=button], [role=switch], [tabindex], .docchip')) continue
    return { x: Math.round(x), y: Math.round(y), on: (e.dataset?.testid || e.tagName) + '.' + String(e.className).slice(0, 30) }
  }
  return null
}, winSel)
/* leave a box by a tap (or click) on a blank part of its window */
export async function leaveBox(w, winSel, quickName = null) {
  const b = await blankIn(w.page, winSel)
  if (!b) throw new Error('no blank point in ' + winSel)
  if (w.phone) await finger(w, b.x, b.y, quickName); else { await w.page.mouse.click(b.x, b.y); await sleep(300) }
  await sleep(500)
  return b
}
export const ids = P => P.evaluate(() => (window.INPUTS || []).map(r => String(r.iid)))
export const PEOPLE = P => P.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE || {}).map(([k, v]) => [v.cs, k])))

/* type into a box: tap / click it, select all, type */
export async function typeInto(w, sel, text) {
  const P = w.page
  await press(w, sel); await sleep(200)
  await P.keyboard.press('Control+A'); await P.keyboard.type(text, { delay: 8 })
}
export const valueOf = (P, sel) => P.evaluate(sel => document.querySelector(sel)?.value ?? null, sel)

/* a little PDF file for the Document row */
export const pdfPath = (name = 'shr-c.pdf') => { const p = join(L.OUT, name); writeFileSync(p, '%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n'); return p }
export const viewerUp = P => P.evaluate(() => { const v = document.getElementById('docViewPop'); return !!v && !v.hidden && v.getBoundingClientRect().width > 0 })
export const up = (P, sel) => P.evaluate(sel => { const e = document.querySelector(sel); return !!e && e.getBoundingClientRect().width > 0 && !e.closest('[hidden]') }, sel)

/* a shared input over several days, filed through the Inputs page's own window (wr4-lib fileInput's steps, plus the
   window's own calendar: the first day tapped, then the last) — returns the new iid, asserts the readout */
export async function fileRange(w, c, first, last, { type = 'LL', people = [L.RANGER, L.HEX], from = '08:00', to = '10:00' } = {}) {
  const P = w.page
  await L.openDay(w, first)
  const before = await ids(P)
  await press(w, '#icPopAdd')
  await P.locator('#inpEditPop #inpEditType').waitFor()
  await P.selectOption('#inpEditPop #inpEditType', type)
  await press(w, '#inpEditPop [data-testid="pp-several"]')
  for (const id of people) if ((await P.locator(`#inpEditPop [data-pp="${id}"]`).getAttribute('aria-pressed')) !== 'true') await press(w, `#inpEditPop [data-pp="${id}"]`)
  const lit = await P.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-pp][aria-pressed="true"]')].map(b => b.getAttribute('data-pp')))
  for (const id of lit) if (!people.includes(id)) await press(w, `#inpEditPop [data-pp="${id}"]`)
  await press(w, `#inpEditPop [data-testid="inpEdCal-day-${first}"]`); await sleep(300)
  await press(w, `#inpEditPop [data-testid="inpEdCal-day-${last}"]`); await sleep(300)
  const readout = await txt(P, '#inpEditPop .rc-read')
  if (from) {
    const ad = P.locator('#inpEditPop #inpEditAllday')
    if (await P.locator('#inpEditSpan [data-span="custom"]').count()) await press(w, '#inpEditSpan [data-span="custom"]')
    else if (await ad.count() && await ad.isChecked()) await ad.click()
    await P.fill('#inpEditPop #inpEditStart', from); await P.fill('#inpEditPop #inpEditEnd', to)
  }
  await press(w, '#inpEditSave')
  const asked = await L.answerAsks(w)
  const said = await L.shownToast(P)
  const made = (await ids(P)).filter(x => !before.includes(x))
  if (await P.locator('[data-testid="win-inputsday-x"]').count()) await press(w, '[data-testid="win-inputsday-x"]')
  console.log(`[${c}] filed ${type} ${people} ${first}..${last} ${from}-${to}: readout "${readout}"; new ${J(made)}; asked ${J(asked)}; note ${J(said)}`)
  return made.length === 1 ? made[0] : null
}
/* the bell's lines for whoever is signed in (wr4-lib openBell: the schedule's bell) */
export async function bellLines(w) { try { const l = await L.openBell(w); await w.page.keyboard.press('Escape').catch(() => {}); await sleep(300); return l.map(x => `${x.name} ${x.day} / ${x.what}`) } catch (e) { return ['(bell not read: ' + String(e).slice(0, 120) + ')'] } }

/* the fixture: a shared LL for Ranger and Hex filed on the Inputs page (wr4-lib fileInput), optionally over Mon–Wed by the window's calendar */
export async function fileShared(w, c, { from = '08:00', to = '10:00', people = [L.RANGER, L.HEX], days = null, type = 'LL', allday = false } = {}) {
  return L.fileInput(w, c, days ? days[0] : L.WED, { type, people, ...(allday ? {} : { from, to }) })
}
