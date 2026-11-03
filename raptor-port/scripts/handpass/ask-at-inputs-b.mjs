// [ASK-AT-THE-CONTROL] (D1626) — area inputs-b: roll-call #7 to #20, the Inputs page's medical, document and OIL sheets.
// Each question raised by a press is pictured TODAY and then as a CARD hanging from the control pressed (ask-at-lib.mjs:
// hangInPage for a small question, rehomeInPage for a sheet), at a desktop's size and his iPhone's; a question not raised
// by a press is pictured today only. Frozen build, nothing saved anywhere but the test browser.
//   WALK_DIR=<frozen dist> ISR_OUT=<repo>/raptor-port/docs/img/handpass/2026-11-04-ask-at-the-control/inputs-b \
//   LOOK_URL=http://localhost:4397/ node scripts/handpass/ask-at-inputs-b.mjs [only=7,8,...]
import * as L from './isr-A-lib.mjs'
import { CARD_CSS, hangInPage, rehomeInPage } from './ask-at-lib.mjs'
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
const { tid, press } = L
const sleep = ms => new Promise(r => setTimeout(r, ms))
const ONLY = (process.argv.find(a => a.startsWith('only=')) || '').slice(5).split(',').filter(Boolean).map(Number)
const SIZES = (process.argv.find(a => a.startsWith('sizes=')) || 'sizes=desktop,phone').slice(6).split(',')
const want = n => !ONLY.length || ONLY.includes(n)
const AREA = dirname(L.OUT)
const MAN = join(AREA, 'manifest.json')
const M = new Map((existsSync(MAN) ? JSON.parse(readFileSync(MAN, 'utf8')) : []).map(e => [e.n, e]))
const entry = (n, base = {}) => {
  const e = M.get(n) || { n, area: 'inputs-b', pics: { today: {}, card: {} }, measures: {}, newWords: [], notes: [] }
  Object.assign(e, base); M.set(n, e); return e
}
const save = () => writeFileSync(MAN, JSON.stringify([...M.values()].sort((a, b) => a.n - b.n), null, 2) + '\n')

/* a sheet moved whole keeps its own head, body and foot: the card's flex column and padding are for a small card only
   (an override kept in this script, not the shared kit) */
const EXTRA = `.aq-frame.aq-card{display:block;padding:0;gap:0;overflow:visible}.bl-line.aq-ring{outline-offset:-3px !important}`

async function start(size) {
  const s = await L.session(size, 'ad')
  await s.page.addStyleTag({ content: CARD_CSS + EXTRA })
  return s
}
/* no control left hovered or focused before a picture */
async function settle(page, tap) {
  await page.evaluate(() => { const a = document.activeElement; if (a && a !== document.body && a.blur) a.blur() })
  if (!tap) await page.mouse.move(2, 2)
  await sleep(150)
}
/* the area a desktop picture shows: the parts named, padded 40px, kept inside the screen */
const clipOf = (page, sels) => page.evaluate(sels => {
  let l = 1e9, t = 1e9, r = -1e9, b = -1e9
  for (const s of sels) {
    const e = [...document.querySelectorAll(s)].find(x => { const q = x.getBoundingClientRect(); return q.width > 0 && q.height > 0 })
    if (!e) continue
    const q = e.getBoundingClientRect(); l = Math.min(l, q.left); t = Math.min(t, q.top); r = Math.max(r, q.right); b = Math.max(b, q.bottom)
  }
  const P = 40; l = Math.max(0, l - P); t = Math.max(0, t - P); r = Math.min(innerWidth, r + P); b = Math.min(innerHeight, b + P)
  return { x: Math.floor(l), y: Math.floor(t), width: Math.ceil(r - l), height: Math.ceil(b - t) }
}, sels)
const union = (a, b) => { const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y); return { x, y, width: Math.max(a.x + a.width, b.x + b.width) - x, height: Math.max(a.y + a.height, b.y + b.height) - y } }
async function pic(page, size, n, what, clip) {
  const f = `${String(n).padStart(2, '0')}-${size}-${what}.png`
  await page.screenshot(size === 'desktop' && clip ? { path: join(L.OUT, f), clip } : { path: join(L.OUT, f) })
  entry(n).pics[what][size] = 'A/' + f
}
const ring = (page, sel) => page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().height > 0); if (!e) throw new Error('premise: no control to ring — ' + sel); e.classList.add('aq-ring') }, sel)
const unring = page => page.evaluate(() => document.querySelectorAll('.aq-ring').forEach(e => e.classList.remove('aq-ring')))
const up = (page, t) => page.locator(`[data-testid="${t}"]`).first().isVisible().catch(() => false)
const must = async (page, t, what) => { await page.locator(`[data-testid="${t}"]`).first().waitFor({ timeout: 6000 }).catch(() => { throw new Error(`premise: ${what} is not up`) }) }

/* set a box's value through its own input event — never typed: an emulated phone zooms to a focused box */
const setVal = (page, sel, v) => page.evaluate(([sel, v]) => {
  const e = document.querySelector(sel); if (!e) throw new Error('no box ' + sel)
  const proto = e.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
  Object.getOwnPropertyDescriptor(proto, 'value').set.call(e, v); e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true }))
}, [sel, v])

/* a new input from a day of the Inputs calendar, filled but not saved: the press under question is the caller's */
async function newInput(page, tap, iso, { type, person, end }) {
  await L.toInputsCal(page, tap)
  await L.incalMonth(page, tap, +iso.slice(0, 4), +iso.slice(5, 7))
  await L.openDay(page, iso)
  await press(page, tap, '#icPopAdd')
  await page.locator('#inpEditPop #inpEditType').waitFor()
  await page.selectOption('#inpEditPop #inpEditType', type)
  await sleep(150)
  if (person && await page.locator('#inpEditPop #inpEditPerson').count()) await page.selectOption('#inpEditPop #inpEditPerson', person)
  if (end) { await L.winMonth(page, tap, end); await press(page, tap, `#inpEdCal [data-iso="${end}"]`) }
  await sleep(200)
}
const iidOf = (page, type, person) => page.evaluate(([type, person]) => { const r = window.INPUTS.find(x => x.type === type && (x.person === person || (x.people || []).some(e => (e && e.p) === person))); return r ? String(r.iid) : null }, [type, person])
const freeOne = async page => (await L.freeMen(page, 1, [2, 5, 6]))[0]

/* the calendar drag, by a mouse or by a finger: the bar is taken over the day `fromIso` and let go over `toIso` */
async function barDrag(page, tap, iid, fromIso, toIso) {
  const at = await page.evaluate(([iid, fromIso, toIso]) => {
    const bars = [...document.querySelectorAll(`#inpCal .ib-bar[data-iid="${iid}"]`)].filter(b => b.getBoundingClientRect().height > 0)
    const day = document.querySelector(`#inpCal [data-icday="${fromIso}"]`), to = document.querySelector(`#inpCal [data-icday="${toIso}"]`)
    if (!bars.length || !day || !to) return null
    const d = day.getBoundingClientRect()
    const bar = bars.find(b => { const r = b.getBoundingClientRect(); return r.left <= d.left + d.width / 2 && r.right >= d.left + d.width / 2 }) || bars[0]
    const r = bar.getBoundingClientRect(), t = to.getBoundingClientRect()
    return { x0: d.left + d.width / 2, y0: r.top + r.height / 2, x1: t.left + t.width / 2, y1: t.top + Math.min(t.height - 6, 16) + (r.top - d.top) }
  }, [iid, fromIso, toIso])
  if (!at) throw new Error(`premise: no bar ${iid} over ${fromIso}`)
  if (!tap) {
    await page.mouse.move(at.x0, at.y0); await page.mouse.down()
    await page.mouse.move(at.x0 + 7, at.y0 + 3, { steps: 2 })
    await page.mouse.move(at.x1, at.y1, { steps: 14 }); await sleep(120)
    await page.mouse.up(); await sleep(700)
    return
  }
  const cdp = await page.context().newCDPSession(page)
  const t = (type, touchPoints) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints })
  await t('touchStart', [{ x: at.x0, y: at.y0, id: 1 }]); await sleep(320)
  for (let i = 1; i <= 14; i++) { await t('touchMove', [{ x: at.x0 + (at.x1 - at.x0) * i / 14, y: at.y0 + (at.y1 - at.y0) * i / 14, id: 1 }]); await sleep(18) }
  await sleep(120); await t('touchEnd', []); await sleep(800)
  await cdp.detach().catch(() => {})
}

/* ---- the two kinds of drawing ---- */
async function todayAndSheet(page, tap, size, n, ctl, sheetT, maxW, win = '[data-testid="win-inputedit"]') {
  await must(page, sheetT, `#${n}'s sheet`)
  await settle(page, tap)
  await ring(page, ctl)
  const clip = await clipOf(page, [ctl, `[data-testid="${sheetT}"] .airpop-box`, win])
  await pic(page, size, n, 'today', clip)
  await unring(page)
  /* on a phone the sheet stays inside its window (about 377 wide there) */
  const m = await page.evaluate(rehomeInPage, [ctl, `[data-testid="${sheetT}"] .airpop-box`, `[data-testid="${sheetT}"]`, size === 'phone' ? Math.min(maxW, 360) : maxW])
  await settle(page, tap)
  const c2 = union(clip, await clipOf(page, [ctl, `[data-testid="${sheetT}"] .airpop-box`, win]))
  await pic(page, size, n, 'card', c2)
  entry(n).measures[size] = m
  L.check(n, `${size}: the sheet hangs from the control, on screen`, m.onScreen, m)
  return m
}
async function todayOnly(page, tap, size, n, sels, ringSel) {
  await settle(page, tap)
  if (ringSel) await ring(page, ringSel).catch(() => {})
  const clip = await clipOf(page, sels)
  await pic(page, size, n, 'today', clip)
  await unring(page)
}

/* ======================================================================================================== the questions */
const Q = {}

/* #7 — the document question, raised by Save on a new medical with no certificate */
Q[7] = async (size) => {
  const { page, tap } = await start(size)
  const man = await freeOne(page)
  await newInput(page, tap, '2026-07-21', { type: 'ATT C', person: man })
  await press(page, tap, '#inpEditSave')
  await must(page, 'docconf', 'the document question')
  const words = await page.evaluate(() => [...document.querySelectorAll('[data-testid="docconf"] .airpop-head b, [data-testid="docconf"] .upconf-h, [data-testid="docconf"] .docconf-what, [data-testid="docconf"] .abtn')].map(e => e.textContent.trim()))
  entry(7, { screen: 'Inputs — a new medical input’s window', control: 'Save, the window’s foot (right)', question: words.slice(0, 3).join(' / '), answers: words.slice(3), today: 'a sheet centred over the screen, a dark backdrop over everything (DocConfirm)', proposal: 'card' })
  await settle(page, tap)
  await ring(page, '#inpEditSave')
  const clip = await clipOf(page, ['#inpEditSave', '[data-testid="docconf"] .airpop-box', '[data-testid="win-inputedit"]'])
  await pic(page, size, 7, 'today', clip)
  await unring(page)
  const m = await page.evaluate(hangInPage, ['#inpEditSave', { q: '[data-testid="docconf"] .airpop-head b', sub: ['[data-testid="docconf"] .upconf-h', '[data-testid="docconf"] .docconf-what'], btns: ['[data-testid="docconf-nodoc"]', '[data-testid="docconf-upload"]'], hide: '[data-testid="docconf"]' }])
  await settle(page, tap)
  await pic(page, size, 7, 'card', union(clip, await clipOf(page, ['#inpEditSave', '.aq-card', '[data-testid="win-inputedit"]'])))
  entry(7).measures[size] = m
  L.check(7, `${size}: card on screen, every answer's words inside it`, m.onScreen && m.btns.every(b => b.fits), m)
  await page.context().close()
}

/* #8 the upchit sheet on Save, #9 the upchit sheet on Delete, #13 the same from the opened day's Delete key */
Q[8] = async (size) => {
  const { page, tap } = await start(size)
  /* a later medical of his on file, so the sheet's "choose for each" part shows (the busy state) */
  await L.fileOn(page, tap, '2026-07-22', { type: 'HL', people: ['sufa'], end: '2026-07-23' })
  await newInput(page, tap, '2026-07-15', { type: 'Upchit', person: 'sufa' })
  await press(page, tap, '#inpEditSave')
  if (await up(page, 'docconf-nodoc')) await press(page, tap, '[data-testid="docconf-nodoc"]')
  await must(page, 'upconf', 'the upchit sheet')
  const words = await page.evaluate(() => (document.querySelector('[data-testid="upconf"] .airpop-box').innerText || '').replace(/\s+/g, ' ').trim())
  entry(8, { screen: 'Inputs — a new upchit’s window', control: 'Save, the window’s foot (right)', question: words, answers: ['Keep / Remove (each later entry)', 'Cancel', 'Save upchit'], today: 'a sheet centred over the screen, a dark backdrop (UpchitConfirm); the document question comes first and is answered "No document"', proposal: 'sheet' })
  await todayAndSheet(page, tap, size, 8, '#inpEditSave', 'upconf', 380)
  /* on to #9: answer it and save, then open the upchit and press Delete */
  await page.evaluate(() => document.querySelectorAll('.aq-ring').forEach(e => e.classList.remove('aq-ring')))
  if (await page.locator('[data-testid="upconf-left-0"]').count()) await press(page, tap, '[data-testid="upconf-left-0"] button:has-text("Keep")')
  await press(page, tap, '[data-testid="upconf-save"]')
  await sleep(500)
  const up9 = await iidOf(page, 'Upchit', 'sufa')
  if (!up9) throw new Error('premise: the upchit was not saved — ' + JSON.stringify(await page.evaluate(() => ({ sheets: [...document.querySelectorAll('[data-testid]')].filter(e => e.getBoundingClientRect().height > 0 && /conf|clash|ask/.test(e.dataset.testid)).map(e => e.dataset.testid), saveOff: !!document.querySelector('[data-testid=upconf-save]:disabled'), notes: window.__notes, ups: window.INPUTS.filter(r => /upchit/i.test(r.type)).map(r => r.person + ' ' + r.date) }))))
  if (!await page.locator('[data-testid="win-inputsday"]').count()) await L.openDay(page, '2026-07-15')
  await press(page, tap, `[data-testid="idy-row-${up9}"] [data-testid="idy-open"]`); await tid(page, 'win-inputedit').waitFor()
  await press(page, tap, '#inpEditDel')
  await must(page, 'upconf', 'the upchit-delete sheet')
  const w9 = await page.evaluate(() => (document.querySelector('[data-testid="upconf"] .airpop-box').innerText || '').replace(/\s+/g, ' ').trim())
  entry(9, { screen: 'Inputs — an upchit’s window', control: 'Delete, the window’s foot (left)', question: w9, answers: ['Cancel', 'Delete upchit'], today: 'the same centred sheet as #8, its Save red "Delete upchit"', proposal: 'sheet' })
  await todayAndSheet(page, tap, size, 9, '#inpEditDel', 'upconf', 380)
  /* on to #13: Cancel, close the window, the Delete key on the upchit's line in the opened day */
  await unring(page)
  await press(page, tap, '[data-testid="upconf"] .abtn.ghost')
  await press(page, tap, '[data-testid="win-inputedit-x"]'); await sleep(300)
  await page.locator(`[data-testid="idy-row-${up9}"] [data-testid="idy-open"]`).focus()
  await page.keyboard.press('Delete'); await sleep(400)
  const sheet = await page.evaluate(() => { const s = [...document.querySelectorAll('.airpop')].find(x => x.getBoundingClientRect().height > 0); return s ? (s.querySelector('.airpop-box').innerText || '').replace(/\s+/g, ' ').trim() : null })
  entry(13, { screen: 'Inputs — a day opened on the calendar', control: 'none: the Delete key on the upchit’s line', question: sheet, answers: ['Cancel', 'Delete upchit'], today: 'the same centred sheet (MedMoveConfirm)', proposal: 'none — not a press' })
  if (sheet) await todayOnly(page, tap, size, 13, ['.airpop .airpop-box', '[data-testid="win-inputsday"]'], `[data-testid="idy-row-${up9}"]`)
  else entry(13).notes.push(`${size}: the Delete key raised no sheet — not pictured`)
  await page.context().close()
}

/* #10 — the medical-clash sheet: an HL over days his ATT C holds */
Q[10] = async (size) => {
  const { page, tap } = await start(size)
  await newInput(page, tap, '2026-07-16', { type: 'HL', person: 'sufa', end: '2026-07-19' })
  await press(page, tap, '#inpEditSave')
  if (await up(page, 'docconf-nodoc')) await press(page, tap, '[data-testid="docconf-nodoc"]')
  await must(page, 'medclash', 'the medical-clash sheet')
  const words = await page.evaluate(() => (document.querySelector('[data-testid="medclash"] .airpop-box').innerText || '').replace(/\s+/g, ' ').trim())
  entry(10, { screen: 'Inputs — a new medical input’s window', control: 'Save, the window’s foot (right)', question: words, answers: ['(per clash) ATT C replaces / Keep …', 'Cancel', 'Save'], today: 'a sheet centred over the screen, a dark backdrop (MedClashConfirm); the document question comes first', proposal: 'sheet' })
  await todayAndSheet(page, tap, size, 10, '#inpEditSave', 'medclash', 380)
  await page.context().close()
}

/* #14 — the OIL question on Save: a duty over a weekend, two days */
Q[14] = async (size) => {
  const { page, tap } = await start(size)
  const man = await freeOne(page)
  await newInput(page, tap, '2026-07-18', { type: 'Duty', person: man, end: '2026-07-19' })
  await press(page, tap, '#inpEditSave')
  await must(page, 'oilconf', 'the OIL question')
  const words = await page.evaluate(() => (document.querySelector('[data-testid="oilconf"] .airpop-box').innerText || '').replace(/\s+/g, ' ').trim())
  entry(14, { screen: 'Inputs — a new duty’s window', control: 'Save (here “Add”?), the window’s foot (right)', question: words, answers: ['All days', 'Only some days…', 'No OIL', 'Back', 'Save'], today: 'a sheet centred over the screen, a dark backdrop (OilConfirm)', proposal: 'sheet' })
  entry(14).control = 'Save, the window’s foot (right)'
  await todayAndSheet(page, tap, size, 14, '#inpEditSave', 'oilconf', 380)
  await page.context().close()
}

/* #15 Change… on the window's OIL line; #16 the desktop list's OIL chip; #17 the bell */
Q[15] = async (size) => {
  const { page, tap } = await start(size)
  const man = await freeOne(page)
  const iid = await L.fileOn(page, tap, '2026-07-18', { type: 'Duty', people: [man], title: 'Gate duty' }, true)
  if (!iid) throw new Error('premise: the weekend duty was not filed')
  await press(page, tap, `[data-testid="idy-row-${iid}"] [data-testid="idy-open"]`); await tid(page, 'win-inputedit').waitFor()
  const ctl = (await page.locator('[data-testid="oil-revise"]').count()) ? '[data-testid="oil-revise"]' : '[data-testid="oil-answer"]'
  await page.locator(ctl).first().scrollIntoViewIfNeeded()
  await press(page, tap, ctl)
  await must(page, 'oilconf', 'the OIL question')
  const words = await page.evaluate(() => (document.querySelector('[data-testid="oilconf"] .airpop-box').innerText || '').replace(/\s+/g, ' ').trim())
  const lbl = await page.locator(ctl).first().innerText().catch(() => '')
  entry(15, { screen: 'Inputs — a saved weekend duty’s window', control: `${lbl.trim() || 'Change…'} on the window’s OIL line`, question: words, answers: ['Yes: credit FO|HO', 'No OIL', 'Back', 'Save'], today: 'the same centred sheet as #14', proposal: 'sheet' })
  await todayAndSheet(page, tap, size, 15, ctl, 'oilconf', 380)
  await unring(page)
  await press(page, tap, '[data-testid="oilconf-cancel"]')
  await press(page, tap, '[data-testid="win-inputedit-x"]'); await sleep(300)
  if (await page.locator('[data-testid="win-inputsday-x"]').count()) await press(page, tap, '[data-testid="win-inputsday-x"]')
  /* #16 — the List */
  await press(page, tap, '#inListBtn'); await sleep(500)
  const chip = await page.evaluate(iid => {
    const rows = [...document.querySelectorAll('tr')].filter(tr => tr.getBoundingClientRect().height > 0)
    for (const tr of rows) { const c = tr.querySelector('.roil'); if (c && c.getBoundingClientRect().height > 0 && (tr.dataset.iid === iid || tr.innerText.includes('Gate duty'))) { c.setAttribute('data-aq16', '1'); c.scrollIntoView({ block: 'center' }); return true } }
    const any = [...document.querySelectorAll('.roil')].find(c => c.getBoundingClientRect().height > 0)
    if (any) { any.setAttribute('data-aq16', '1'); any.scrollIntoView({ block: 'center' }); return 'other' }
    return false
  }, iid)
  entry(16, { screen: 'Inputs — the List', control: 'the row’s OIL chip (OIL, or OIL? where nobody has answered)', answers: ['as #14/#15', 'Back', 'Save'], today: 'the same centred sheet as #14', proposal: 'sheet' })
  if (!chip) entry(16).notes.push(`${size}: the List shows no OIL chip at this size — not pictured`)
  else {
    if (chip === 'other') entry(16).notes.push(`${size}: the staged row's chip was not found; another row's chip was used`)
    await sleep(300)
    await press(page, tap, '[data-aq16="1"]')
    await must(page, 'oilconf', 'the OIL question from the List')
    entry(16).question = await page.evaluate(() => (document.querySelector('[data-testid="oilconf"] .airpop-box').innerText || '').replace(/\s+/g, ' ').trim())
    await todayAndSheet(page, tap, size, 16, '[data-aq16="1"]', 'oilconf', 380, '#inTable, table')
    await unring(page)
    await press(page, tap, '[data-testid="oilconf-cancel"]').catch(() => {})
  }
  await page.context().close()
}

/* #11 — the medical sheet after a calendar drag (not a press): his ATT C dragged onto an HL of his */
Q[11] = async (size) => {
  const { page, tap } = await start(size)
  await L.fileOn(page, tap, '2026-07-22', { type: 'HL', people: ['sufa'], end: '2026-07-23' })
  const ac = await iidOf(page, 'ATT C', 'sufa')
  await L.toInputsCal(page, tap); await L.incalMonth(page, tap, 2026, 7)
  await barDrag(page, tap, ac, '2026-07-13', '2026-07-20')
  const sheet = await page.evaluate(() => { const s = [...document.querySelectorAll('.airpop')].find(x => x.getBoundingClientRect().height > 0); return s ? (s.querySelector('.airpop-box').innerText || '').replace(/\s+/g, ' ').trim() : null })
  entry(11, { screen: 'Inputs — the calendar', control: 'none: a medical’s bar dropped over another medical of his', question: sheet, today: 'a sheet centred over the screen (MedMoveConfirm)', proposal: 'none — not a press' })
  if (sheet) await todayOnly(page, tap, size, 11, ['.airpop .airpop-box'])
  else entry(11).notes.push(`${size}: the drag raised no sheet — not pictured`)
  await page.context().close()
}

/* #18 the OIL wait after a calendar drag (not a press); #19 the band after its "Don't move" */
Q[18] = async (size) => {
  const { page, tap } = await start(size)
  const man = await freeOne(page)
  const iid = await L.fileOn(page, tap, '2026-07-22', { type: 'Duty', people: [man], title: 'Gate duty' })
  if (!iid) throw new Error('premise: the weekday duty was not filed')
  await L.toInputsCal(page, tap); await L.incalMonth(page, tap, 2026, 7)
  await barDrag(page, tap, iid, '2026-07-22', '2026-07-25')
  const sheet = await page.evaluate(() => { const s = document.querySelector('[data-testid="oilconf"] .airpop-box'); return s && s.getBoundingClientRect().height > 0 ? (s.innerText || '').replace(/\s+/g, ' ').trim() : null })
  entry(18, { screen: 'Inputs — the calendar', control: 'none: an earning input’s bar dropped on a weekend', question: sheet, answers: ['Don’t move', 'Move'], today: 'a sheet centred over the screen (OilWaitSheet → OilConfirm)', proposal: 'none — not a press' })
  if (!sheet) { entry(18).notes.push(`${size}: the drag raised no OIL question — not pictured`); entry(19).notes.push(`${size}: not reached (no #18)`); await page.context().close(); return }
  await todayOnly(page, tap, size, 18, ['[data-testid="oilconf"] .airpop-box'])
  await press(page, tap, '[data-testid="oilconf-cancel"]'); await sleep(400)
  const band = await page.evaluate(() => { const b = document.querySelector('[data-testid="oilbar"]'); return b && b.getBoundingClientRect().height > 0 ? (b.innerText || '').replace(/\s+/g, ' ').trim() : null })
  entry(19, { screen: 'every page — a band under the top bar', control: 'raised by pressing “Don’t move” (or ✕, Escape) on #18', question: band, answers: ['Answer OIL', 'OK'], today: 'a band along the bottom of the top bar (.oilband)', proposal: 'none — not a press' })
  if (band) await todayOnly(page, tap, size, 19, ['[data-testid="oilbar"]', '.topbar, header'], '[data-testid="oilbar"]')
  await page.context().close()
}

/* #20 the day's one OIL list, raised when a holiday is saved over an earning input; #17 the bell's line */
Q[20] = async (size) => {
  const { page, tap } = await start(size)
  const men = await L.freeMen(page, 2, [4])
  await L.fileOn(page, tap, '2026-07-17', { type: 'Training', people: men, from: '09:00', to: '12:00', title: 'Range brief' })
  await L.go(page, 'inputs')
  await press(page, tap, '#inGear')
  await press(page, tap, '[data-testid="iset-days"]')
  if (await page.locator('[data-testid="days-tab-holidays"]').count()) await press(page, tap, '[data-testid="days-tab-holidays"]')
  await press(page, tap, '[data-testid="hol-add"]')
  await press(page, tap, '[data-testid="hol-kind-ph"]')
  await setVal(page, '[data-testid="hol-name"]', 'National Day')
  for (let i = 0; i < 14 && !(await page.locator('[data-testid="holcal-day-2026-07-17"]').count()); i++) await press(page, tap, '[data-testid="holcal-prev"]')
  for (let i = 0; i < 40 && !(await page.locator('[data-testid="holcal-day-2026-07-17"]').count()); i++) await press(page, tap, '[data-testid="holcal-next"]')
  await press(page, tap, '[data-testid="holcal-day-2026-07-17"]')
  await press(page, tap, '[data-testid="hol-save"]'); await sleep(500)
  await must(page, 'win-oilday', 'the day’s OIL list')
  await page.locator('[data-testid="win-oilday"]').click({ position: { x: 60, y: 14 } }).catch(() => {})
  const lead = await page.evaluate(() => (document.querySelector('[data-testid="win-oilday"]').innerText || '').replace(/\s+/g, ' ').trim().slice(0, 300))
  entry(20, { screen: 'Inputs — the Calendar window’s Holidays, then a window of its own', control: 'raised by the holiday’s Save (the window “OIL — …” opens by itself)', question: lead, answers: ['Yes to all', 'No to all', 'per input Yes · FO / No', 'Later', 'Save'], today: 'a floating window of its own (OilDayList)', proposal: 'none — not a press' })
  await todayOnly(page, tap, size, 20, ['[data-testid="win-oilday"]'])
  /* #17 — leave it for later; the bell's line */
  await press(page, tap, '[data-testid="odl-later"]'); await sleep(300)
  await page.locator('[data-testid="win-days"] .win-x').evaluate(e => e.click()).catch(() => {})
  await page.locator('.bellbtn:visible').first().click(); await sleep(400)
  const line = await page.evaluate(() => { const l = document.querySelector('[data-testid="bell-list"] .bl-line'); return l ? (l.innerText || '').replace(/\s+/g, ' ').trim() : null })
  entry(17, { screen: 'the bell’s list (top bar)', control: 'a line of the bell', question: line, today: 'a tap on the line opens a WINDOW — the day’s OIL list (#20) for a holiday line, or the input’s own window, whose OIL line’s Answer… then raises the question (#15); the line itself raises no question', proposal: 'none — not a press' })
  if (line) await todayOnly(page, tap, size, 17, ['[data-testid="bell-list"]', '.bellbtn'], '[data-testid="bell-list"] .bl-line')
  await page.context().close()
}

for (const size of SIZES) for (const n of Object.keys(Q).map(Number)) {
  const covers = { 8: [8, 9, 13], 15: [15, 16], 18: [18, 19], 20: [20, 17] }[n] || [n]
  if (!covers.some(want)) continue
  try { await Q[n](size) } catch (e) { L.say(`FAIL ${n} ${size} THREW ${String(e && e.message || e).slice(0, 300)}`); entry(n).notes.push(`${size}: THREW ${String(e && e.message || e).slice(0, 200)}`) }
  save()
}
entry(12, { screen: 'Edit Schedule / the Scheduler Board — a medical’s Unavailable row', control: 'none: a puck dropped on the row’s person (reassign)', today: 'the same centred medical sheet as #10/#11 (MedMoveConfirm)', proposal: 'none — not a press' })
if (!entry(12).notes.length) entry(12).notes.push('not pictured: it needs a medical\'s Unavailable row armed on Edit Schedule and a drop of another man — a drop, outside the ruling; the sheet it raises is #10\'s, pictured there')
save()
await L.finish('inputs-b')
