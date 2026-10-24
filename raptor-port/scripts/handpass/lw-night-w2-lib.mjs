// Walker 2 of the night of 25 Oct 26 — shared helpers over lw-r3-lib.mjs. Pictures into docs/img/handpass/2026-10-25-lw-night/w2/.
// Every sentence a script prints is built from what it just read (walk-scripts §4).
process.env.LW_PORT ||= '4180'
process.env.LW_OUT ||= '2026-10-25-lw-night/w2'
export const L = await import('./lw-r3-lib.mjs')
import path from 'node:path'
import { readdirSync, unlinkSync, writeFileSync } from 'node:fs'
export const T = L.T
export const OUT = L.OUT
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export const sleep = (w, ms) => w.page.waitForTimeout(ms)
export function clearPics(prefix) { for (const f of readdirSync(OUT)) if (f.startsWith(prefix) && f.endsWith('.png')) unlinkSync(path.join(OUT, f)) }
export const results = []
export function rec(id, size, verdict, said, pics = []) { results.push({ id, size, verdict, said, pics }); console.log(`${verdict}  ${id} [${size}]  ${said}  [${pics.join(', ')}]`) }
export function saveResults(name) { writeFileSync(path.join(OUT, `res-${name}.json`), JSON.stringify(results, null, 1)); console.log('saved', results.length, 'results →', `res-${name}.json`) }
export const KEEP = { toasts: false }
export const hideTransient = P => P.addStyleTag({ content: '#toastEl, .toast, .secdef-snack, .savestat, .saveband { visibility: hidden !important; }' })
export const people = P => P.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE || {}).map(([k, v]) => [v.cs, k])))
export async function signOut(P) { if (await L.vis(P, '#logout')) { await P.click('#logout') } else { await P.click('#burger'); await P.waitForTimeout(300); await P.click('#drawerLogout') } await P.waitForSelector('#luser') }
export async function signInAs(w, who) {
  const P = w.page
  if (who === 'admin') { await L.signInPlain(w, 'admin') } else {
    if (!(await L.vis(P, '#luser'))) { await P.goto(L.PLAIN); await P.waitForSelector('#luser') }
    await P.fill('#luser', 'us'); await P.fill('#lpass', 'us'); await P.click('#loginForm button[type=submit]'); await P.waitForSelector('#vWeek .day')
    await P.evaluate(() => window.go('leavewar')); await P.waitForSelector('[data-testid="row-bane"]'); await P.waitForTimeout(800)
  }
  if (!KEEP.toasts) await hideTransient(P)
}
/* sign in again after a reload (storage kept) — the login card shows again */
export async function reloadAs(w, who) {
  const P = w.page
  await P.reload(); await P.waitForTimeout(2200)
  if (await L.vis(P, '#luser')) {
    const [u, p] = who === 'admin' ? ['ad', 'a'] : ['us', 'us']
    await P.fill('#luser', u); await P.fill('#lpass', p); await P.click('#loginForm button[type=submit]'); await P.waitForSelector('#vWeek .day')
  }
  await P.evaluate(() => window.go('leavewar')); await P.waitForSelector(`[data-testid="row-${who === 'admin' ? 'stiff' : 'bane'}"]`); await P.waitForTimeout(1000)
  if (!KEEP.toasts) await hideTransient(P)
}
export const setSwitch = async (w, on, pfx = 'bid') => { const s = w.page.locator(T(`${pfx}-approve-tick`)); if (!(await s.count())) return null; if (((await s.getAttribute('aria-checked')) === 'true') !== on) { await L.press(w, T(`${pfx}-approve-tick`)); await w.page.waitForTimeout(250) } return (await s.getAttribute('aria-checked')) === 'true' }
/* a cell's boxes as words: letters|kind|state|place */
export const kinds = async (w, who, iso) => ((await L.cellInfo(w.page, who, iso))?.boxes ?? []).map(b => `${b.text}|${(b.cls.match(/k-\w+/) || [''])[0].slice(2)}|${(b.cls.match(/s-[awr]/) || [''])[0].slice(2)}|${(b.cls.match(/\b(right-am|right-pm|top|bot|left|right|whole)\b/) || [null, 'whole'])[1]}`)
/* ---- what the browser SAVED (read only) ---- */
const lsAll = (P, prefix) => P.evaluate(prefix => { const o = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith(prefix)) { try { o.push({ k, v: JSON.parse(localStorage.getItem(k)) }) } catch { } } } return o }, prefix)
export async function warRecs(P, who, iso) { return (await lsAll(P, 'raptor:leavewar/rec:')).map(x => x.v).filter(v => v.pid === who && v.date === iso) }
const monIdx = s => MONTHS.findIndex(m => s.startsWith(m))
const isoOf = (date, yr) => { if (!date) return null; const [m, d] = date.split(' '); return `${yr}-${String(monIdx(m) + 1).padStart(2, '0')}-${String(Number(d)).padStart(2, '0')}` }
/* the Raptor inputs (the Inputs page's entries) of a man — a list: its first/last day, kind, half, words, provenance tag, the others on it */
export async function inputsOf(P, who) {
  return (await lsAll(P, 'raptor:inputs/')).map(x => x.v).filter(v => v.person === who || (v.people || []).some(p => p.p === who)).map(v => ({
    iid: v.iid, type: v.type, from: isoOf(v.date, v.yr ?? 2026), to: v.endDate ? isoOf(v.endDate, v.yr ?? 2026) : isoOf(v.date, v.yr ?? 2026), half: v.half ?? '', remarks: v.remarks ?? '', lw: v.lw ?? '', till: v.till, docs: v.docIds ?? (v.docId ? [v.docId] : []), people: (v.people || []).map(p => p.p)
  })).filter(v => v.from)
}
export const inputsOn = async (P, who, iso) => (await inputsOf(P, who)).filter(v => v.from <= iso && iso <= v.to)
export const changeKeys = async P => (await lsAll(P, 'raptor:changes/')).map(x => x.k)
/* the words of a day: each request's (code state words), each Inputs entry's words */
export async function dayWords(P, who, iso) {
  const reqs = (await warRecs(P, who, iso)).filter(r => r.kind === 'request').map(r => `${r.code}/${r.state}/"${r.remarks ?? ''}"`)
  const ins = (await inputsOn(P, who, iso)).filter(i => /^(LL|OL|OIL|CCL|FCL|PL|EL|CL)$/.test(i.type)).map(i => `${i.type}${i.half ? '-' + i.half : ''}${i.lw ? '' : '[inputs]'} ${i.from === i.to ? i.from.slice(5) : i.from.slice(5) + '..' + i.to.slice(5)}/"${i.remarks}"`)
  return { reqs, ins, text: `req: ${reqs.join(' ; ') || '-'} | input: ${ins.join(' ; ') || '-'}` }
}
export const undoTitle = P => P.evaluate(() => { const b = document.querySelector('#undoBtn'); return b ? { title: b.title, dis: b.disabled || b.getAttribute('aria-disabled') === 'true' } : null })
/* one Undo press (a finger on a phone, with its quick picture) — the words it carried and the toast it left */
export async function undoPress(w, name = null) {
  const before = await undoTitle(w.page)
  if (w.phone && name) await L.step(w, name, '#undoBtn'); else { await L.press(w, '#undoBtn'); await w.page.waitForTimeout(500); if (name) await L.shot(w, name) }
  await w.page.waitForTimeout(300)
  const toast = await L.txt(w.page, '#toastEl, .toast')
  return { before: before?.title ?? null, disabled: before?.dis, toast }
}
export async function redoPress(w, name = null) {
  const before = await w.page.evaluate(() => { const b = document.querySelector('#redoBtn'); return b ? { title: b.title, dis: b.disabled } : null })
  if (w.phone && name) await L.step(w, name, '#redoBtn'); else { await L.press(w, '#redoBtn'); await w.page.waitForTimeout(500); if (name) await L.shot(w, name) }
  await w.page.waitForTimeout(300)
  return { before: before?.title ?? null, disabled: before?.dis }
}
/* a drag over cells (hold and drag on a phone) — true if the drag window opened */
export async function dragCells(w, [p1, a], [p2, z]) {
  const P = w.page
  await L.reachCell(w, p1, a)
  await P.locator(T(L.cellId(p1, a))).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await P.waitForTimeout(300)
  const bA = await P.locator(T(L.cellId(p1, a))).first().boundingBox(), bZ = await P.locator(T(L.cellId(p2, z))).first().boundingBox()
  if (!bA || !bZ) throw new Error('no box for the drag')
  const A = { x: bA.x + bA.width / 2, y: bA.y + bA.height / 2 }, Z = { x: bZ.x + bZ.width / 2, y: bZ.y + bZ.height / 2 }
  if (w.phone) await L.holdDrag(w, [A, { x: (A.x + Z.x) / 2, y: (A.y + Z.y) / 2 }, Z])
  else { await P.mouse.move(A.x, A.y); await P.mouse.down(); await P.mouse.move(Z.x, Z.y, { steps: 10 }); await P.mouse.up() }
  await P.waitForTimeout(500)
  return L.vis(P, T('select-sheet'))
}
/* type words into a box: a press (a tap on a phone) then the keys; replaces what is there */
export async function typeInto(w, sel, text, { enter = false } = {}) {
  const P = w.page
  await L.press(w, sel)
  await P.keyboard.press('Control+A'); await P.keyboard.press('Delete')
  if (text) await P.keyboard.type(text)
  await P.waitForTimeout(150)
  if (enter) { await P.keyboard.press('Enter'); await P.waitForTimeout(400) }
}
/* place a leave through the one-day window: the switch as asked; asserts it landed. opts: approve, portion, remarks, range:[a,b] */
export async function place(w, who, iso, type, { approve, portion = null, remarks = null, range = null, quick = null } = {}) {
  const P = w.page
  await L.openCellR(w, who, iso)
  await P.waitForSelector(T('bid-picker'), { timeout: 5000 })
  if (approve !== undefined) await setSwitch(w, approve)
  if (portion) await L.press(w, T(`portion-${portion}`))
  if (remarks) { await L.press(w, T('bid-remarks')); await P.keyboard.type(remarks); await P.waitForTimeout(150) }
  if (range) {
    await L.press(w, T('span-range')); await P.waitForTimeout(300)
    for (const d of range) { for (let i = 0; i < 8 && !(await L.vis(P, T('span-day-' + d))); i++) { await L.press(w, T('span-next')); await P.waitForTimeout(250) } await L.press(w, T('span-day-' + d)); await P.waitForTimeout(250) }
  }
  const closed = await L.placeLeave(w, type)
  if (!closed) { const d = await L.sheetDump(P); await L.closeAny(w); throw new Error(`${type} on ${iso} not placed: ${d?.text?.slice(0, 200)}`) }
  return kinds(w, who, iso)
}
/* the one-day window opened on a day: its Remarks box, its state buttons, its till — null if another window opened */
export async function dayWindow(w, who, iso) {
  const P = w.page
  await L.openCellR(w, who, iso)
  const sheet = (await P.evaluate(() => [...document.querySelectorAll('.bidsheet[data-testid]')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.dataset.testid).pop())) ?? 'nothing'
  const out = { sheet }
  if (sheet === 'bid-picker') {
    out.remarks = await P.locator(T('bid-remarks')).inputValue().catch(() => null)
    out.till = await L.txt(P, T('bid-tilldate'))
    out.lit = await P.evaluate(() => [...document.querySelectorAll('[data-testid="bid-picker"] .lit')].map(e => e.dataset.testid))
  } else if (sheet === 'remarks-sheet') { out.remarks = await P.locator(T('remarks-remarks')).inputValue().catch(() => null); out.till = await L.txt(P, T('remarks-tilldate')) }
  else if (sheet === 'closed-note') { out.remarks = await P.locator(T('closed-remarks')).inputValue().catch(() => null); out.till = await L.txt(P, T('closed-tilldate')) }
  else if (sheet === 'daylist-sheet') { out.list = await L.txt(P, T('daylist-sheet')) }
  return out
}
export async function closeSheet(w) {
  const P = w.page
  for (const t of ['bid-cancel', 'daylist-close', 'sel-cancel', 'closed-note-close', 'remarks-cancel']) if (await L.vis(P, T(t))) { await L.press(w, T(t)); await P.waitForTimeout(300); return t }
  return null
}
export const sheetOf = async P => (await P.evaluate(() => [...document.querySelectorAll('.bidsheet[data-testid]')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.dataset.testid).pop())) ?? 'nothing'
/* the Inputs page's list for one man: rows as the page words them */
export async function inputsPageRows(w, callsign, name = null) {
  const P = w.page
  await P.evaluate(() => window.go('inputs')); await P.waitForTimeout(1000)
  if (await P.locator('#inListBtn[aria-pressed="false"]').count()) { await L.press(w, '#inListBtn'); await P.waitForTimeout(600) }
  const dateBtn = P.locator('button:has-text("→")').first()
  if (await dateBtn.count()) { await dateBtn.click(); await P.waitForTimeout(500); await P.getByText('All dates', { exact: true }).first().click().catch(() => {}); await P.waitForTimeout(700) }
  const f = P.locator('#inFPerson')
  if (callsign && await f.count()) { await f.selectOption({ label: callsign }).catch(async () => { await f.selectOption(callsign).catch(() => {}) }); await P.waitForTimeout(500) }
  await P.waitForSelector('#inBody tr, [data-testid^="inl-row-"]', { timeout: 5000 }).catch(() => {}); await P.waitForTimeout(500)
  const rows = await P.evaluate(() => { const vis = e => e.getBoundingClientRect().height > 0; const txt = e => e.innerText.replace(/\s+/g, ' ').trim(); const tr = [...document.querySelectorAll('#inBody tr')].filter(vis).map(txt); if (tr.length) return tr; const cards = [...document.querySelectorAll('#page-inputs [data-testid^="inl-row-"]')].filter(vis).map(txt); if (cards.length) return cards; return [...document.querySelectorAll('#page-inputs li, #page-inputs .inrow, #page-inputs .in-card')].filter(vis).map(txt) })
  if (name) await L.shot(w, name)
  /* a phone's list has no person box on view: keep the man's cards by his callsign */
  return callsign && !(await f.count() && await f.isVisible()) ? rows.filter(r => r.includes(callsign)) : rows
}
export const toWar = async (w, who = 'admin') => { await w.page.evaluate(() => window.go('leavewar')); await w.page.waitForSelector(`[data-testid="row-${who === 'admin' ? 'stiff' : 'bane'}"]`); await w.page.waitForTimeout(800) }
/* a pdf for the Document button */
export const addDoc = async (w, scope, name = 'w2.pdf') => { await w.page.locator(`${scope} input[type=file]`).first().setInputFiles(L.pdfPath(name)); await w.page.waitForTimeout(800) }
/* file a leave straight on the Inputs page (the app's own New input window) — person label for an admin, null for the member's own */
export async function fileInputLeave(w, person, type, iso, isoEnd = null, { remarks = '', span = null, several = null } = {}) {
  const P = w.page
  await P.evaluate(() => window.go('inputs')); await P.waitForTimeout(900)
  if (await P.locator('#inListBtn[aria-pressed="false"]').count()) { await L.press(w, '#inListBtn'); await P.waitForTimeout(500) }
  await L.press(w, '#inNew'); await P.waitForSelector('#inpEditType', { timeout: 5000 }); await P.waitForTimeout(400)
  if (several) {
    await P.locator('[data-testid="pp-several"]').click(); await P.waitForTimeout(500)
    /* the picker starts with one man picked: turn on the wanted ones, then turn off any other that is on (several = person ids) */
    for (const id of several) { const b = P.locator(`button.pp-puck[data-pp="${id}"]`).first(); if ((await b.getAttribute('aria-pressed')) !== 'true') await b.click() }
    for (const b of await P.locator('button.pp-puck[aria-pressed="true"]').all()) { const id = await b.getAttribute('data-pp'); if (!several.includes(id)) await b.click() }
    await P.waitForTimeout(300)
    const cnt = (await P.locator('[data-testid="pp-count"]').innerText()).trim()
    if (cnt !== `${several.length} picked`) throw new Error(`the people picker reads "${cnt}", wanted ${several.length} picked`)
  } else if (person) await P.locator('#inpEditPerson').selectOption({ label: person })
  await P.locator('#inpEditType').selectOption(type); await P.waitForTimeout(300)
  if (span) { await P.locator('#inpEditSpan button', { hasText: new RegExp('^' + span + '$', 'i') }).first().click(); await P.waitForTimeout(250) }
  const MON = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
  const goto = async d => {
    for (let i = 0; i < 40 && !(await P.locator(`[data-testid="inpEdCal-day-${d}"]`).count()); i++) {
      const [m, y] = (await P.locator('[data-testid="inpEdCal-title"]').innerText()).replace('›', '').trim().split(/\s+/)
      const at = `${y}-${String(MON.findIndex(x => x.startsWith(m.toLowerCase())) + 1).padStart(2, '0')}`
      await P.locator(`[data-testid="inpEdCal-${at < d.slice(0, 7) ? 'next' : 'prev'}"]`).click(); await P.waitForTimeout(150)
    }
  }
  await goto(iso); await P.locator(`[data-testid="inpEdCal-day-${iso}"]`).click(); await P.waitForTimeout(150)
  if (isoEnd && isoEnd !== iso) { await goto(isoEnd); await P.locator(`[data-testid="inpEdCal-day-${isoEnd}"]`).click(); await P.waitForTimeout(250) }
  if (remarks) await P.locator('#inpEditRmk').fill(remarks)
  await P.click('#inpEditSave'); await P.waitForTimeout(700)
  const nodoc = P.getByRole('button', { name: 'No document' })
  if (await nodoc.count()) { await nodoc.first().click(); await P.waitForTimeout(800) }
  if (await P.locator('#inpEditSave').count() && await L.vis(P, '#inpEditSave')) throw new Error('the New input window stayed open after Add: ' + ((await P.locator('#inpEditPop').innerText().catch(() => '')) || '').replace(/\s+/g, ' ').slice(0, 200))
}
export async function finish() { await L.closeBrowser() }
/* ---- undo / redo walks ---- */
/* `state()` reads what the days hold (a string per day); presses Undo until `want(state)` or `max` presses; each press recorded with the words the button carried */
export async function undoWalk(w, state, want, max, prefix, { pics = true } = {}) {
  const steps = []
  let reached = false
  if (want(await state())) return { steps, reached: true, presses: 0 }
  for (let i = 1; i <= max; i++) {
    const r = await undoPress(w, pics ? `${prefix}-undo${i}` : null)
    const st = await state()
    steps.push({ i, title: r.before, toast: r.toast, st })
    if (want(st)) { reached = true; break }
    if (r.disabled) break
  }
  return { steps, reached, presses: steps.length }
}
export async function redoWalk(w, n) { for (let i = 0; i < n; i++) await redoPress(w) }
export const fmtSteps = steps => steps.map(s => `#${s.i} "${s.title}" → ${JSON.stringify(s.st)}`).join(' | ')
/* ---- a context that starts from a saved world (the fixture built once, walked at every size and engine) ---- */
import { devices } from '@playwright/test'
export async function ctxFrom(size, engine, state) {
  const b = await L.getBrowser(engine)
  const phone = size === 'phone'
  const ctx = await b.newContext({ ...(phone ? { viewport: L.PHONE, hasTouch: true, isMobile: true, deviceScaleFactor: 3, userAgent: devices['iPhone 13'].userAgent } : { viewport: L.DESK, deviceScaleFactor: 1 }), storageState: state })
  const page = await ctx.newPage()
  const errs = []
  const tg = `${size}/${engine}`
  page.on('crash', () => console.log('   !! PAGE CRASHED (' + tg + ')'))
  page.on('console', m => { if (m.type() === 'error') errs.push(`${tg} console: ` + m.text().slice(0, 220)) })
  page.on('pageerror', e => errs.push(`${tg} pageerror: ` + String(e).slice(0, 220)))
  page.on('response', r => { if (r.status() >= 400) errs.push(`${tg} http ${r.status()}: ` + r.url().slice(0, 120)) })
  const cdp = phone && engine === 'chromium' ? await ctx.newCDPSession(page) : null
  return { ctx, page, cdp, errs, phone, size, engine }
}
