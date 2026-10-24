// Round 2's FULL check — the walk, v2 (24 Oct 26): a course and an overseas duty filed on the Leave War (his D1318,
// D1326) and, since his D1338, UNA — the war's own record, an admin's alone, read by everyone, nowhere else (round 2b).
// v1's H1, H4, H6, H8, H9, H10 pressed UNA as a third filed kind; v2 presses `bid-una` / `sel-una` (an admin's) and the
// course and the OD as the two filed kinds. Fixes of the first walk become checks here (F1 → H1c; the designer's G2 → H12,
// G3 → H13, H14). The design note docs/superpowers/specs/2026-10-24-lw-file-od-cse-una.md; the sheet
// docs/handpass/2026-10-24-lw-round2.md (its roll-call and sizing).
// On the built bundle at LW_PORT: his iPhone's size by real touch over CDP (402×874, a picture ~100 ms after each lift —
// D1281) and a desktop (1440×900). Written as the RIGHT behaviour: a PASS means correct; a RECORD line has no fixed answer
// and is judged by the host from its picture; NOT WALKED means the script's own step could not act.
// Usage: LW_PORT=4345 LW_OUT=2026-10-24-lw-r2/rewalk [ENGINE=webkit] [SIZES=phone,desk] [ONLY=H1,U1] node lw-r2-walk.mjs
import * as L from './lw-r3-lib.mjs'
import path from 'node:path'
import { mkdirSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs'
console.log('lw-r2-walk v2.2', L.OUT, 'port', L.PORT)
mkdirSync(L.OUT, { recursive: true })
const ENGINE = process.env.ENGINE || 'chromium'
for (const f of readdirSync(L.OUT)) if (f.endsWith('.png') && (ENGINE === 'webkit') === f.includes('-wk')) unlinkSync(path.join(L.OUT, f))
const SIZES = (process.env.SIZES || 'phone,desk').split(',')
const ONLY = process.env.ONLY ? new Set(process.env.ONLY.split(',')) : null
const run = id => !ONLY || ONLY.has(id)
const T = L.T
async function signOut(P) { if (await L.vis(P, '#logout')) { await P.click('#logout') } else { await P.click('#burger'); await P.waitForTimeout(300); await P.click('#drawerLogout') } await P.waitForSelector('#luser') }
const setSwitch = async (w, on, pfx = 'bid') => { const s = w.page.locator(T(`${pfx}-approve-tick`)); if (!(await s.count())) return null; if (((await s.getAttribute('aria-checked')) === 'true') !== on) { await L.press(w, T(`${pfx}-approve-tick`)); await w.page.waitForTimeout(250) } return (await s.getAttribute('aria-checked')) === 'true' }
const kinds = async (w, who, iso) => ((await L.cellInfo(w.page, who, iso))?.boxes ?? []).map(b => `${b.text}|${(b.cls.match(/k-\w+/) || [''])[0]}|${(b.cls.match(/s-[awr]/) || [''])[0]}|y ${b.y} h ${b.h}|bg ${b.bg}`)
const rowIds = (P, rowId) => P.evaluate(id => { const r = document.querySelector(`[data-testid="${id}"]`); return r ? [...r.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0).map(b => b.dataset.testid) : null }, rowId)
/* the four places of the row under the leaves against the leave buttons above them (a phone's rows must line up as drawn) */
const placeCheck = (P) => P.evaluate(() => {
  const box = id => { const e = document.querySelector(`[data-testid="${id}"]`); if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.left), w: Math.round(r.width), y: Math.round(r.top), h: Math.round(r.height) } }
  const pairs = [['bid-file-CSE', 'bid-LL'], ['bid-file-OD', 'bid-OL'], ['bid-una', 'bid-OIL'], ['bid-more', 'bid-CL']]
  return pairs.map(([a, b]) => { const A = box(a), B = box(b); return A && B ? `${a}: dx ${A.x - B.x}, dw ${A.w - B.w}, h ${A.h} vs ${B.h}` : `${a}: ${A ? 'no ' + b : 'missing'}` })
})
const brokenWords = (P) => P.evaluate(() => [...document.querySelectorAll('.bidsheet .tchip.lv')].filter(b => { const r = document.createRange(); r.selectNodeContents(b); const tops = new Set([...r.getClientRects()].filter(q => q.width > 0).map(q => Math.round(q.top / 6))); return tops.size > 1 }).map(b => b.dataset.testid))
/* the stored inputs of one man of one kind (read only) */
const storedOf = async (P, who, type) => (await L.storedInputs(P)).map(x => x.v).filter(v => v && v.type === type && (v.person === who || (v.people || []).some(p => p.p === who)))
/* the war's own records of a man on a day, as SAVED (read only — the whiteboard's `raptor:leavewar/rec:<war>:<recId>`, a
   row a record with its `pid` and `date` beside it; state/rows.ts recJSON). v2.1: v2 read `leavewar:rec:` — the war's
   own seam's name in tests, not the built site's whiteboard — and found nothing (the first re-walk's U1–U3, U6, U7, U11) */
const recsOf = (P, who, iso) => P.evaluate(([who, iso]) => {
  const out = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (!k || !k.startsWith('raptor:leavewar/rec:')) continue
    try { const v = JSON.parse(localStorage.getItem(k)); if (v.pid === who && v.date === iso) out.push(v) } catch { }
  }
  return out
}, [who, iso])
/* the Manning block's Available P for a day — opened first on a phone, where it folds (D1258) */
async function availP(w, iso) {
  const P = w.page, sel = `[data-testid="avail-p-${iso}"]`
  await L.reachCell(w, 'bane', iso)
  if (!(await L.vis(P, sel))) { await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(200); await L.press(w, T('counts-toggle')); await P.waitForTimeout(600); await L.reachCell(w, 'bane', iso) }
  if (!(await P.locator(sel).count())) return null
  return (await P.locator(sel).first().innerText()).trim()
}
/* hold on one cell and move to another, both read without scrolling in between (v1's H4 read the second after the grid had
   scrolled under the first) */
async function dragCells(w, [p1, a], [p2, z]) {
  const P = w.page
  await L.reachCell(w, p1, a)
  await P.locator(T(L.cellId(p1, a))).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await P.waitForTimeout(300)
  const bA = await P.locator(T(L.cellId(p1, a))).first().boundingBox(), bZ = await P.locator(T(L.cellId(p2, z))).first().boundingBox()
  if (!bA || !bZ) throw new Error('no box for the drag')
  const A = { x: bA.x + bA.width / 2, y: bA.y + bA.height / 2 }, Z = { x: bZ.x + bZ.width / 2, y: bZ.y + bZ.height / 2 }
  if (w.phone) { if (!w.cdp) throw new Error('no touch drag driver in this engine'); await L.holdDrag(w, [A, { x: (A.x + Z.x) / 2, y: (A.y + Z.y) / 2 }, Z]) }
  else { await P.mouse.move(A.x, A.y); await P.mouse.down(); await P.mouse.move(Z.x, Z.y, { steps: 10 }); await P.mouse.up() }
  await P.waitForTimeout(500)
  return L.vis(P, T('select-sheet'))
}
/* the element at a surface's centre is the surface (a window is drawn ABOVE the grid) */
const onTop = (P, sel) => P.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + Math.min(r.height / 2, 40)); return !!h && (h === e || e.contains(h)) }, sel)

for (const size of SIZES) {
  const w = await L.newCtx(size, ENGINE)
  w.tag = `${size}${ENGINE === 'webkit' ? '/webkit' : ''}`
  const P = w.page, tg = `${size}${ENGINE === 'webkit' ? '-wk' : ''}`
  const q = n => (w.phone ? `${n}-${tg}-q` : null)
  await L.signInPlain(w, 'admin')
  const ids = await P.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE || {}).map(([k, v]) => [v.cs, k])))
  const who = ids.Drifter, me = ids.Ranger, saber = ids.Saber
  const rowOrder = await P.evaluate(() => [...document.querySelectorAll('[data-testid^="row-"]')].map(r => r.dataset.testid.slice(4)))
  const next = rowOrder[rowOrder.indexOf(who) + 1]
  console.log(w.tag, 'Drifter =', who, 'next =', next, 'Ranger =', me, 'Saber =', saber)
  const sc = async (id, fn) => { if (!run(id)) return; try { await fn() } catch (e) { L.rec(`${id} — the script could not act`, w.tag, 'NOT WALKED', String(e).slice(0, 260), []); await L.closeAny(w); await P.keyboard.press('Escape').catch(() => {}) } }

  /* ================= THE ADMIN — the course and the overseas duty ================= */

  /* H1 — the admin's empty day: CSE · OD · UNA · ⋯ under LL · OL · OIL · CL; a tap on OD files it; a tap afterwards says
     where it is changed (the first walk's F1, now a check) */
  await sc('H1', async () => {
    const d = '2026-11-02'
    await L.openCellR(w, who, d, q('h1-open'))
    await L.shot(w, `h1-window-${tg}`)
    const row = await rowIds(P, 'bid-extra-row'), places = await placeCheck(P), broke = await brokenWords(P)
    const okRow = JSON.stringify(row) === JSON.stringify(['bid-file-CSE', 'bid-file-OD', 'bid-una', 'bid-more'])
    const okPlaces = places.every(p => /dx -?[01], dw -?[01], h (\d+) vs \1/.test(p))
    L.rec('H1 the admin\'s window: CSE · OD · UNA · ⋯ under LL · OL · OIL · CL, as wide and as tall, no word broken', w.tag, okRow && okPlaces && !broke.length ? 'PASS' : 'FAIL', `row ${JSON.stringify(row)}; ${places.join('; ')}; broken ${JSON.stringify(broke)}`, [`h1-window-${tg}`])
    await L.press(w, T('bid-file-OD'), q('h1-od'))
    await P.waitForTimeout(500)
    const open = await L.vis(P, T('bid-picker')), k = await kinds(w, who, d)
    await L.cellShot(w, who, d, `h1-filed-${tg}`)
    L.rec('H1b a tap on OD files it: the window closes, the day holds one filled slate OD box', w.tag, !open && k.length === 1 && /OD\|k-od\|s-a/.test(k[0] || '') ? 'PASS' : 'FAIL', `window open ${open}; boxes ${JSON.stringify(k)}`, [`h1-filed-${tg}`])
    await L.openCellR(w, who, d, q('h1-reopen'))
    const note = await L.txt(P, T('raptor-note'))
    await L.shot(w, `h1-reopen-${tg}`)
    L.rec('H1c a tap on the filed day says where it is changed: "Change it on the Inputs page, not here." (F1 fixed)', w.tag, note === 'Change it on the Inputs page, not here.' ? 'PASS' : 'FAIL', `note: ${note}`, [`h1-reopen-${tg}`])
    await L.closeAny(w)
  })

  /* H2 — a range: OD over three days with words typed; one input on the Inputs page, the words with it */
  await sc('H2', async () => {
    const a = '2026-11-03', z = '2026-11-05'
    await L.openCellR(w, who, a)
    await L.press(w, T('bid-remarks')); await P.keyboard.type('Exercise Pitch Black')
    await L.press(w, T('span-range')); await L.press(w, T(`span-day-${z}`)); await P.waitForTimeout(300)
    await L.shot(w, `h2-range-${tg}`)
    await L.press(w, T('bid-file-OD'), q('h2-od'))
    await P.waitForTimeout(500)
    const ks = await Promise.all([a, '2026-11-04', z].map(d => kinds(w, who, d)))
    await L.cellShot(w, who, '2026-11-04', `h2-filed-${tg}`)
    const mine = (await storedOf(P, who, 'OD')).filter(v => v.date === 'Nov 3')
    L.rec('H2 a range 3–5 Nov and OD: three filled slate boxes; one input, its words with it', w.tag, ks.every(k => k.length === 1 && /OD\|k-od\|s-a/.test(k[0] || '')) && mine.length === 1 && mine[0].endDate === 'Nov 5' && /Pitch Black/.test(mine[0].remarks || '') ? 'PASS' : 'FAIL', `boxes ${JSON.stringify(ks)}; stored ${JSON.stringify(mine.map(v => [v.date, v.endDate, v.remarks, v.till]))}`, [`h2-range-${tg}`, `h2-filed-${tg}`])
  })

  /* H3 — a pending LL, then CSE: the bid stays, the day holds both; then the LL approved from the day's list (the designer's
     S22 — leave and a course stand together, as on the Inputs page) */
  await sc('H3', async () => {
    const d = '2026-11-20'
    await L.openCellR(w, who, d); await setSwitch(w, false); await L.placeLeave(w, 'LL')
    await L.openCellR(w, who, d)
    await L.shot(w, `h3-pending-${tg}`)
    await L.press(w, T('bid-file-CSE'), q('h3-cse')); await P.waitForTimeout(500)
    const k = await kinds(w, who, d)
    await L.cellShot(w, who, d, `h3-both-${tg}`)
    L.rec('H3 a pending LL, then CSE: the bid stays and the day holds both, each its own box', w.tag, k.length === 2 && k.some(x => /k-ll\|s-w/.test(x)) && k.some(x => /k-cse\|s-a/.test(x)) ? 'PASS' : 'FAIL', `boxes ${JSON.stringify(k)}`, [`h3-pending-${tg}`, `h3-both-${tg}`])
    await L.openCellR(w, who, d, q('h3-list'))
    const dump = await L.sheetDump(P)
    const appr = await P.evaluate(() => [...document.querySelectorAll('[data-testid^="dl-approve-"]')].map(b => b.dataset.testid))
    await L.shot(w, `h3-list-${tg}`)
    if (appr[0]) { await L.press(w, T(appr[0]), q('h3-approve')); await P.waitForTimeout(600) }
    const k2 = await kinds(w, who, d)
    await L.closeAny(w)
    await L.cellShot(w, who, d, `h3-approved-${tg}`)
    L.rec('H3b the LL approved beside the course: both stand (RECORD — S22, the Inputs page allows the pair)', w.tag, 'RECORD', `list ${dump?.id}; approve ${JSON.stringify(appr)}; boxes after ${JSON.stringify(k2)}`, [`h3-list-${tg}`, `h3-approved-${tg}`])
  })

  /* H4 — the drag window: two men, two days — CSE · OD · UNA (no ⋯ — a posting is one man's); OD fills all four */
  await sc('H4', async () => {
    const a = '2026-11-16', z = '2026-11-17'
    const open = await dragCells(w, [who, a], [next, z])
    await L.shot(w, `h4-drag-${tg}`)
    const span = await L.txt(P, T('sel-span')), row = open ? await rowIds(P, 'sel-extra-row') : null
    if (open) { await L.press(w, T('sel-file-OD'), q('h4-od')); await P.waitForTimeout(600) }
    const ks = await Promise.all([[who, a], [who, z], [next, a], [next, z]].map(([p, d]) => kinds(w, p, d)))
    await L.cellShot(w, who, z, `h4-filed-${tg}`)
    L.rec('H4 a drag over two men and two days: CSE · OD · UNA, no ⋯; OD fills all four', w.tag, open && JSON.stringify(row) === JSON.stringify(['sel-file-CSE', 'sel-file-OD', 'sel-una']) && ks.every(k => k.some(x => /k-od\|s-a/.test(x))) ? 'PASS' : 'FAIL', `sheet ${open} (${span}); row ${JSON.stringify(row)}; boxes ${JSON.stringify(ks)}`, [`h4-drag-${tg}`, `h4-filed-${tg}`])
    await L.closeAny(w)
  })

  /* H5 — the top bar's Undo takes the filing back whole; Redo puts it again */
  await sc('H5', async () => {
    const d = '2026-11-18'
    await L.openCellR(w, who, d); await L.press(w, T('bid-file-OD')); await P.waitForTimeout(500)
    const k0 = await kinds(w, who, d)
    await L.undo(w)
    const k1 = await kinds(w, who, d)
    await L.cellShot(w, who, d, `h5-undone-${tg}`)
    await L.redo(w)
    const k2 = await kinds(w, who, d)
    L.rec('H5 Undo takes the OD back, Redo puts it again', w.tag, k0.length === 1 && /k-od/.test(k0[0] || '') && k1.length === 0 && k2.length === 1 ? 'PASS' : 'FAIL', `filed ${JSON.stringify(k0)}; undone ${JSON.stringify(k1)}; redone ${JSON.stringify(k2)}`, [`h5-undone-${tg}`])
  })

  /* H6 — manning: an OD takes him off the day's count — Available P one lower (the Manning rows opened on a phone) */
  await sc('H6', async () => {
    const d = '2026-11-19'
    const before = await availP(w, d)
    await L.openCellR(w, who, d); await L.press(w, T('bid-file-OD')); await P.waitForTimeout(600)
    const after = await availP(w, d)
    await L.cellShot(w, 'bane', d, `h6-manning-${tg}`)
    L.rec('H6 an OD takes him off the day\'s manning: Available P on 19 Nov one lower', w.tag, before != null && after != null && Number(after) === Number(before) - 1 ? 'PASS' : 'FAIL', `Available P ${before} → ${after}`, [`h6-manning-${tg}`])
  })

  /* H12 — the designer's G2 (fixed): an OD on Tue 24 Nov, then a range Mon 23 – Wed 25 and OD again: Tue keeps one OD; and a
     quick double tap on OD files once (the designer's S7) */
  await sc('H12', async () => {
    await L.openCellR(w, who, '2026-11-24'); await L.press(w, T('bid-file-OD')); await P.waitForTimeout(500)
    await L.openCellR(w, who, '2026-11-23')
    await L.press(w, T('span-range')); await L.press(w, T('span-day-2026-11-25')); await P.waitForTimeout(300)
    await L.press(w, T('bid-file-OD'), q('h12-od')); await P.waitForTimeout(600)
    await L.shot(w, `h12-after-${tg}`)
    const on24 = (await storedOf(P, who, 'OD')).filter(v => v.date === 'Nov 24' || v.endDate === 'Nov 24' || (v.date === 'Nov 23' && v.endDate === 'Nov 25'))
    const ks = await Promise.all(['2026-11-23', '2026-11-24', '2026-11-25'].map(d => kinds(w, who, d)))
    L.rec('H12 a range over a day already holding an OD: that day keeps ONE OD, the days around it filed', w.tag, on24.length === 1 && ks.every(k => k.length === 1 && /k-od/.test(k[0] || '')) ? 'PASS' : 'FAIL', `ODs covering 24 Nov ${on24.length}; boxes ${JSON.stringify(ks)}`, [`h12-after-${tg}`])
    /* the quick double tap: the window closes on the first; the second lands on the grid behind it */
    const d = '2026-11-26'
    await L.openCellR(w, who, d)
    const c = await L.centre(P, T('bid-file-OD'))
    if (w.phone) { await L.tapAt(w, c.x, c.y); await L.tapAt(w, c.x, c.y) } else { await P.mouse.click(c.x, c.y); await P.mouse.click(c.x, c.y) }
    await P.waitForTimeout(600)
    const n = (await storedOf(P, who, 'OD')).filter(v => v.date === 'Nov 26').length
    await L.shot(w, `h12-double-${tg}`)
    L.rec('H12b a quick double tap on OD files ONE OD (RECORD what the second tap opened)', w.tag, n === 1 ? 'PASS' : 'FAIL', `ODs on 26 Nov: ${n}; open after: ${(await L.sheetDump(P))?.id ?? 'nothing'}`, [`h12-double-${tg}`])
    await L.closeAny(w)
  })

  /* H13 — the designer's G3 (fixed): an OD Fri 6 – Mon 9 Nov asks its OIL question at once, over the war, as the Inputs page
     does (D804, D660) */
  await sc('H13', async () => {
    await L.openCellR(w, who, '2026-11-06')
    await L.press(w, T('span-range')); await L.press(w, T('span-day-2026-11-09')); await P.waitForTimeout(300)
    await L.press(w, T('bid-file-OD'), q('h13-od')); await P.waitForTimeout(900)
    const up = await L.vis(P, T('oilconf')), top = up ? await onTop(P, T('oilconf')) : null
    const words = await L.txt(P, T('oilconf'))
    await L.shot(w, `h13-oil-${tg}`)
    L.rec('H13 an OD over a weekend filed from the war: its OIL question opens at once, above the war', w.tag, up && top ? 'PASS' : 'FAIL', `up ${up}; on top ${top}; words: ${String(words).slice(0, 220)}`, [`h13-oil-${tg}`])
    if (up) { await L.press(w, T('oilconf-cancel')); await P.waitForTimeout(500) }
    await P.keyboard.press('Escape').catch(() => {}); await P.waitForTimeout(300)
    await L.shot(w, `h13-after-${tg}`)
    L.rec('H13b after the question: where the page is left (RECORD)', w.tag, 'RECORD', `page ${await P.evaluate(() => window.CURPAGE ?? document.querySelector('.page.on, [data-page].on')?.id ?? '')}; open ${(await L.sheetDump(P))?.id ?? 'nothing'}`, [`h13-after-${tg}`])
    await L.closeAny(w)
  })

  /* H14 — G3 for several: a drag over two men's weekend, CSE — the one list of that weekend's questions (D782) */
  await sc('H14', async () => {
    const open = await dragCells(w, [who, '2026-11-14'], [next, '2026-11-15'])
    if (!open) throw new Error('no drag window')
    await L.press(w, T('sel-file-CSE'), q('h14-cse')); await P.waitForTimeout(900)
    const count = await L.txt(P, T('odl-count')), onlyOne = await L.vis(P, T('oilconf'))
    await L.shot(w, `h14-list-${tg}`)
    /* v2.1: one line an INPUT (D762 — one answer for everyone in it): two men's runs are two lines, not four */
    L.rec('H14 two men over a weekend, CSE: the one list opens — "2 to answer", one line an input — never a window per man', w.tag, count && /^2 to answer/i.test(count) && !onlyOne ? 'PASS' : 'FAIL', `list: ${count}; single window ${onlyOne}`, [`h14-list-${tg}`])
    await P.keyboard.press('Escape').catch(() => {}); await P.waitForTimeout(300)
    const x = P.locator('#win-oilday button[aria-label*="lose"], [data-testid="win-oilday"] button[aria-label*="lose"]').first()
    if (await x.count()) { await x.click().catch(() => {}); await P.waitForTimeout(300) }
  })

  /* H15 — the free half (the designer's S10, S11; reading 2): an approved AM LL, then the day's window and OD — a whole day */
  await sc('H15', async () => {
    const d = '2026-11-30'
    await L.openCellR(w, who, d); await setSwitch(w, true); await L.press(w, T('portion-am')); await L.placeLeave(w, 'LL')
    await L.openCellR(w, who, d, q('h15-open'))
    const dump = await L.sheetDump(P)
    await L.shot(w, `h15-window-${tg}`)
    if (await L.vis(P, T('bid-file-OD'))) { await L.press(w, T('bid-file-OD'), q('h15-od')); await P.waitForTimeout(600) }
    const k = await kinds(w, who, d)
    await L.cellShot(w, who, d, `h15-filed-${tg}`)
    L.rec('H15 a day holding an AM leave: the window it opens, then OD — a whole-day OD beside the morning (RECORD — reading 2)', w.tag, 'RECORD', `window ${dump?.id}: ${String(dump?.text).slice(0, 160)}; boxes ${JSON.stringify(k)}`, [`h15-window-${tg}`, `h15-filed-${tg}`])
    await L.closeAny(w)
  })

  /* H16 — the tap path and the drag path (the designer's S12, G5): a drag over a day of approved leave and the day after */
  await sc('H16', async () => {
    await L.openCellR(w, who, '2026-12-01'); await setSwitch(w, true); await L.placeLeave(w, 'LL')
    await L.openCellR(w, who, '2026-12-01', q('h16-tap'))
    const tap = await L.sheetDump(P)
    await L.shot(w, `h16-tap-${tg}`)
    await L.closeAny(w)
    const open = await dragCells(w, [who, '2026-12-01'], [who, '2026-12-02'])
    const row = open ? await rowIds(P, 'sel-extra-row') : null
    await L.shot(w, `h16-drag-${tg}`)
    L.rec('H16 a tap on approved leave vs a drag over it: what each offers (RECORD — G5)', w.tag, 'RECORD', `tap: ${tap?.id}; drag window ${open}, row ${JSON.stringify(row)}`, [`h16-tap-${tg}`, `h16-drag-${tg}`])
    await L.closeAny(w)
  })

  /* H17 — §7.11 lesson 4: with the drag window open, a press on another man's day behind it — what lights, what it says */
  await sc('H17', async () => {
    const open = await dragCells(w, [who, '2026-12-21'], [who, '2026-12-22'])
    if (!open) throw new Error('no drag window')
    const span0 = await L.txt(P, T('sel-span'))
    await L.shot(w, `h17-open-${tg}`)
    const c = await P.locator(T(L.cellId(next, '2026-12-28'))).first().boundingBox().catch(() => null)
    if (c) { if (w.phone) await L.tapAt(w, c.x + c.width / 2, c.y + c.height / 2, `h17-press-${tg}-q`); else await P.mouse.click(c.x + c.width / 2, c.y + c.height / 2) }
    await P.waitForTimeout(500)
    const after = await L.sheetDump(P)
    await L.shot(w, `h17-after-${tg}`)
    L.rec('H17 the drag window open, a press on another day behind it: what lights matches what the window says (RECORD)', w.tag, 'RECORD', `window before: ${span0}; press on ${c ? 'a visible day' : 'a day out of view — not pressed'}; after: ${after?.id} ${String(after?.text).slice(0, 120)}`, [`h17-open-${tg}`, `h17-after-${tg}`])
    await L.closeAny(w)
  })

  /* ================= THE ADMIN — UNA (D1338) ================= */

  /* U18 (before) — his own My leave, read before a UNA on his own row */
  let myLeave0 = null
  await sc('U18', async () => { myLeave0 = await L.txt(P, T('my-leave')) })

  /* U1 — a whole-day UNA with words: the teal box fills the day; Available P one lower; never an input */
  await sc('U1', async () => {
    const d = '2026-11-10'
    const before = await availP(w, d)
    await L.openCellR(w, who, d)
    await L.press(w, T('bid-remarks')); await P.keyboard.type('Board of inquiry')
    await L.press(w, T('bid-una'), q('u1-una')); await P.waitForTimeout(600)
    const open = await L.vis(P, T('bid-picker')), k = await kinds(w, who, d), recs = await recsOf(P, who, d)
    const after = await availP(w, d)
    await L.cellShot(w, who, d, `u1-placed-${tg}`)
    const una = (recs || []).filter(r => r.kind === 'una')
    L.rec('U1 a whole-day UNA: the window closes, one filled teal box, the words and who placed it stored, Available P one lower', w.tag, !open && k.length === 1 && /UNA\|k-una\|s-a/.test(k[0] || '') && una.length === 1 && una[0].code === 'UNA' && una[0].remarks === 'Board of inquiry' && !!una[0].by && Number(after) === Number(before) - 1 ? 'PASS' : 'FAIL', `open ${open}; boxes ${JSON.stringify(k)}; stored ${JSON.stringify(una)}; Available P ${before} → ${after}`, [`u1-placed-${tg}`])
    const asInput = (await L.storedInputs(P)).map(x => x.v).filter(v => v && v.type === 'UNA')
    L.rec('U1b a UNA is never an input (D1338)', w.tag, asInput.length === 0 ? 'PASS' : 'FAIL', `inputs of type UNA: ${asInput.length}`, [])
  })

  /* U2, U3 — a morning and an afternoon: the box in its half, the manning half a man lower */
  for (const [id, d, por, code] of [['U2', '2026-11-11', 'am', '*UNA'], ['U3', '2026-11-12', 'pm', 'UNA*']]) {
    await sc(id, async () => {
      const before = await availP(w, d)
      await L.openCellR(w, who, d); await L.press(w, T(`portion-${por}`)); await L.press(w, T('bid-una'), q(`${id.toLowerCase()}-una`)); await P.waitForTimeout(600)
      const info = await L.cellInfo(P, who, d), recs = await recsOf(P, who, d), after = await availP(w, d)
      await L.cellShot(w, who, d, `${id.toLowerCase()}-placed-${tg}`)
      const b = info?.boxes?.[0], half = b ? (por === 'am' ? b.y <= 2 && b.h <= info.tdh / 2 + 2 : b.y >= info.tdh / 2 - 3 && b.h <= info.tdh / 2 + 2) : false
      const st = (recs || []).filter(r => r.kind === 'una')
      L.rec(`${id} a${por === 'am' ? ' morning' : 'n afternoon'} UNA: its box in its half, stored ${code}, Available P half a man lower (RECORD the figure)`, w.tag, st.length === 1 && st[0].code === code && /k-una/.test(b?.cls || '') && half ? 'PASS' : 'FAIL', `box ${b ? `y ${b.y} h ${b.h} of ${info.tdh}` : 'none'}; stored ${JSON.stringify(st.map(r => r.code))}; Available P ${before} → ${after}`, [`${id.toLowerCase()}-placed-${tg}`])
    })
  }

  /* U4 — a range: three days of UNA */
  await sc('U4', async () => {
    await L.openCellR(w, who, '2026-12-03')
    await L.press(w, T('span-range')); await L.press(w, T('span-day-2026-12-05')); await P.waitForTimeout(300)
    await L.press(w, T('bid-una'), q('u4-una')); await P.waitForTimeout(600)
    const ks = await Promise.all(['2026-12-03', '2026-12-04', '2026-12-05'].map(d => kinds(w, who, d)))
    await L.cellShot(w, who, '2026-12-04', `u4-range-${tg}`)
    L.rec('U4 a range 3–5 Dec and UNA: three teal boxes', w.tag, ks.every(k => k.length === 1 && /k-una/.test(k[0] || '')) ? 'PASS' : 'FAIL', JSON.stringify(ks), [`u4-range-${tg}`])
  })

  /* U5 — a drag over two men and two days, UNA: all four */
  await sc('U5', async () => {
    const open = await dragCells(w, [who, '2026-12-07'], [next, '2026-12-08'])
    if (!open) throw new Error('no drag window')
    await L.press(w, T('sel-una'), q('u5-una')); await P.waitForTimeout(600)
    const ks = await Promise.all([[who, '2026-12-07'], [who, '2026-12-08'], [next, '2026-12-07'], [next, '2026-12-08']].map(([p, d]) => kinds(w, p, d)))
    await L.cellShot(w, who, '2026-12-08', `u5-drag-${tg}`)
    L.rec('U5 a drag over two men and two days, UNA: all four teal', w.tag, ks.every(k => k.some(x => /k-una/.test(x))) ? 'PASS' : 'FAIL', JSON.stringify(ks), [`u5-drag-${tg}`])
    await L.closeAny(w)
  })

  /* U6 — the admin taps a UNA day: the day's list — its box, out of the manning, placed by, its words in a box he changes */
  await sc('U6', async () => {
    const d = '2026-11-10'
    await L.openCellR(w, who, d, q('u6-open'))
    const recs = await recsOf(P, who, d), u = (recs || []).find(r => r.kind === 'una')
    const line = u ? await L.txt(P, T(`dl-u-${u.id}`)) : null
    const box = u ? P.locator(T(`dl-una-rmk-${u.id}`)) : null
    const has = { box: !!box && (await box.count()) > 0, del: !!u && (await P.locator(T(`dl-clear-${u.id}`)).count()) > 0 }
    await L.shot(w, `u6-list-${tg}`)
    L.rec('U6 the admin\'s tap on a UNA: the day\'s list — "out of the manning · placed by …", its words in a box, Delete', w.tag, /out of the manning/i.test(line || '') && /placed by/i.test(line || '') && has.box && has.del ? 'PASS' : 'FAIL', `line: ${line}; ${JSON.stringify(has)}`, [`u6-list-${tg}`])
    if (has.box) {
      await L.press(w, T(`dl-una-rmk-${u.id}`)); await P.keyboard.press('End'); await P.keyboard.type(', week 2'); await P.keyboard.press('Enter'); await P.waitForTimeout(400)
      const r2 = ((await recsOf(P, who, d)) || []).find(r => r.kind === 'una')
      L.rec('U6b he changes its words there: saved', w.tag, r2?.remarks === 'Board of inquiry, week 2' ? 'PASS' : 'FAIL', `stored: ${r2?.remarks}`, [])
    }
    await L.closeAny(w)
  })

  /* U8 — the admin's block Delete over the UNA days takes them */
  await sc('U8', async () => {
    const open = await dragCells(w, [who, '2026-12-07'], [who, '2026-12-08'])
    if (!open) throw new Error('no drag window')
    await L.shot(w, `u8-sel-${tg}`)
    for (let i = 0; i < 2 && (await L.vis(P, T('sel-delete'))); i++) { await L.press(w, T('sel-delete'), q(`u8-del${i}`)); await P.waitForTimeout(500) }
    const ks = await Promise.all(['2026-12-07', '2026-12-08'].map(d => kinds(w, who, d)))
    await L.cellShot(w, who, '2026-12-07', `u8-deleted-${tg}`)
    L.rec('U8 the admin\'s block Delete over two UNA days takes both', w.tag, ks.every(k => !k.some(x => /k-una/.test(x))) ? 'PASS' : 'FAIL', JSON.stringify(ks), [`u8-sel-${tg}`, `u8-deleted-${tg}`])
    await L.closeAny(w)
  })

  /* U9 — a Move over a bid and a UNA: the UNA stays, and the banner says so */
  await sc('U9', async () => {
    await L.openCellR(w, who, '2026-12-09'); await setSwitch(w, false); await L.placeLeave(w, 'LL')
    await L.openCellR(w, who, '2026-12-10'); await L.press(w, T('bid-una')); await P.waitForTimeout(500)
    const open = await dragCells(w, [who, '2026-12-09'], [who, '2026-12-10'])
    if (!open) throw new Error('no drag window')
    await L.press(w, T('sel-move')); await P.waitForTimeout(500)
    let banner = await L.txt(P, T('move-banner'))
    if (banner && !/stays/.test(banner)) { const t = await P.locator(T(L.cellId(who, '2026-12-15'))).first().boundingBox().catch(() => null); if (t) { if (w.phone) await L.tapAt(w, t.x + t.width / 2, t.y + t.height / 2); else await P.mouse.move(t.x + t.width / 2, t.y + t.height / 2); await P.waitForTimeout(500); banner = await L.txt(P, T('move-banner')) } }
    await L.shot(w, `u9-move-${tg}`)
    L.rec('U9 a Move over a bid and a UNA: the banner says the UNA stays', w.tag, /UNA stays/.test(banner || '') ? 'PASS' : 'FAIL', `banner: ${banner}`, [`u9-move-${tg}`])
    if (await L.vis(P, T('move-cancel'))) await L.press(w, T('move-cancel'))
    await P.waitForTimeout(300)
    const k = await kinds(w, who, '2026-12-10')
    L.rec('U9b after the cancelled Move the UNA is where it was', w.tag, k.some(x => /k-una/.test(x)) ? 'PASS' : 'FAIL', JSON.stringify(k), [])
  })

  /* U10 — Undo and Redo of a placement, from the top bar */
  await sc('U10', async () => {
    const d = '2026-12-14'
    await L.openCellR(w, who, d); await L.press(w, T('bid-una')); await P.waitForTimeout(500)
    const k0 = await kinds(w, who, d)
    await L.undo(w)
    const toast = await P.evaluate(() => [...document.querySelectorAll('.toast, [role="status"], .snack')].map(e => e.innerText).join(' | '))
    const k1 = await kinds(w, who, d)
    await L.redo(w)
    const k2 = await kinds(w, who, d)
    await L.cellShot(w, who, d, `u10-redone-${tg}`)
    L.rec('U10 Undo takes the UNA back, Redo puts it again (RECORD the Undo\'s words)', w.tag, k0.some(x => /k-una/.test(x)) && !k1.some(x => /k-una/.test(x)) && k2.some(x => /k-una/.test(x)) ? 'PASS' : 'FAIL', `placed ${JSON.stringify(k0)}; undone ${JSON.stringify(k1)}; redone ${JSON.stringify(k2)}; words: ${toast.slice(0, 160)}`, [`u10-redone-${tg}`])
  })

  /* U12 — the day panel (a tap on the date): Drifter's UNA in the Away list, its teal box */
  await sc('U12', async () => {
    const d = '2026-11-10'
    await L.reachCell(w, who, d)
    await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(200)
    await L.press(w, `th.day[data-d="${d}"]`, q('u12-date')); await P.waitForTimeout(600)
    const line = P.locator(T(`lwday-away-${who}`))
    const has = await line.count() ? { t: (await line.innerText()).replace(/\s+/g, ' '), una: await line.locator('.k-una').count() } : null
    await L.shot(w, `u12-panel-${tg}`)
    L.rec('U12 the day panel\'s Away list names his UNA in its teal box, no state word', w.tag, has && has.una > 0 && !/pending|approved/i.test(has.t) ? 'PASS' : 'FAIL', JSON.stringify(has), [`u12-panel-${tg}`])
    await P.keyboard.press('Escape').catch(() => {}); await P.waitForTimeout(300)
    const x = P.locator('[data-testid="win-lwday"] button[aria-label*="lose"]').first()
    if (await x.count()) await x.click().catch(() => {})
  })

  /* H7 / U13 — the Legend names UNA in its teal */
  await sc('H7', async () => {
    await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(200)
    await L.press(w, T('legend-open')); await P.waitForTimeout(400)
    const row = await P.evaluate(() => { const r = [...document.querySelectorAll('[data-testid="legend"] .leg-row')].find(x => /Unavailable/.test(x.innerText)); if (!r) return null; const b = r.querySelector('.leg-box .c'); return { t: r.innerText.trim(), bg: b ? getComputedStyle(b).backgroundColor : null } })
    await L.shot(w, `h7-legend-${tg}`)
    L.rec('H7 the Legend: "Unavailable: out of the manning" in its own teal', w.tag, row && /out of the manning/.test(row.t) && row.bg === 'rgba(20, 130, 130, 0.7)' ? 'PASS' : 'FAIL', JSON.stringify(row), [`h7-legend-${tg}`])
    await P.keyboard.press('Escape'); await L.closeAny(w); await P.waitForTimeout(300)
  })

  /* U17 — counting: a day where Available P equals Required P; a UNA turns it red, the Manning button's count rises, and the
     next bid window's day line says so (the designer's S17; G9 is a question for him) */
  await sc('U17', async () => {
    const d = '2026-12-15'
    const a0 = await availP(w, d)
    const set = await L.setRequired(w, 'p', d, Number(a0))
    const red0 = await L.txt(P, T('undermanned'))
    await L.openCellR(w, who, d); await L.press(w, T('bid-una')); await P.waitForTimeout(600)
    const a1 = await availP(w, d), red1 = await L.txt(P, T('undermanned'))
    const lvl = await P.evaluate(d => { const c = document.querySelector(`[data-testid="avail-p-${d}"]`); return c ? c.className + ' ' + (c.closest('td')?.className ?? '') : null }, d)
    await L.cellShot(w, 'bane', d, `u17-red-${tg}`)
    const pilot = rowOrder.find(p => p !== who && p !== next && p !== me && p !== saber && p !== 'bane') ?? next
    await L.openCellR(w, ids.Pike ?? pilot, d, q('u17-bid'))
    const line = await L.dayline(P)
    await L.shot(w, `u17-dayline-${tg}`)
    L.rec('U17 Available P = Required P, then a UNA: Available P one under, red; the Manning count and the next bid window\'s day line say so (RECORD the words)', w.tag, Number(a1) === Number(a0) - 1 && /\bunder\b/.test(lvl || '') && /red/.test(line || '') && /1 red/.test(red1 || '') ? 'PASS' : 'FAIL', `Required set ${set}; Available P ${a0} → ${a1}; cell ${lvl}; Manning ${red0} → ${red1}; day line: ${line}`, [`u17-red-${tg}`, `u17-dayline-${tg}`])
    await L.closeAny(w)
  })

  /* U18 (after) and the UNA on Ranger's row a member then reads (U7b, U20): a UNA on his own row spends nothing */
  await sc('U18', async () => {
    await L.openCellR(w, saber, '2026-12-16'); await L.press(w, T('bid-una')); await P.waitForTimeout(500)
    await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(200)
    const myLeave1 = await L.txt(P, T('my-leave'))
    await L.shot(w, `u18-myleave-${tg}`)
    L.rec('U18 a UNA on his own row: My leave reads the same — nothing spent, no next leave', w.tag, myLeave0 != null && myLeave0 === myLeave1 ? 'PASS' : 'FAIL', `before: ${myLeave0} | after: ${myLeave1}`, [`u18-myleave-${tg}`])
  })

  /* the member's fixtures, placed by the admin through the app's own controls: Ranger's pending LL on a day before today
     (H11) and a UNA on his row (U7b, U20) */
  await sc('PREP', async () => {
    await L.openCellR(w, me, '2026-10-21'); await setSwitch(w, false); await L.placeLeave(w, 'LL')
    await L.openCellR(w, me, '2026-12-16'); await L.press(w, T('portion-am')); await L.press(w, T('bid-una')); await P.waitForTimeout(500)
    const k = await kinds(w, me, '2026-10-21'), u = await kinds(w, me, '2026-12-16')
    L.rec('PREP Ranger: a pending LL on 21 Oct and a morning UNA on 16 Dec (fixtures)', w.tag, k.some(x => /k-ll\|s-w/.test(x)) && u.some(x => /k-una/.test(x)) ? 'PASS' : 'FAIL', `21 Oct ${JSON.stringify(k)}; 16 Dec ${JSON.stringify(u)}`, [])
  })

  /* U11 — a reload keeps the UNA, its words and who placed it */
  await sc('U11', async () => {
    await P.reload(); await P.waitForTimeout(1200)
    if (await L.vis(P, '#luser')) { await P.fill('#luser', 'ad'); await P.fill('#lpass', 'a'); await P.click('#loginForm button[type=submit]'); await P.waitForSelector('#vWeek .day') }
    await P.evaluate(() => window.go('leavewar')); await P.waitForSelector('[data-testid="row-stiff"]'); await P.waitForTimeout(800)
    const r = ((await recsOf(P, who, '2026-11-10')) || []).find(x => x.kind === 'una'), k = await kinds(w, who, '2026-11-10')
    await L.cellShot(w, who, '2026-11-10', `u11-reload-${tg}`)
    L.rec('U11 after a reload the UNA is there, its words and who placed it with it', w.tag, r && /week 2|Board of inquiry/.test(r.remarks || '') && r.by && k.some(x => /k-una/.test(x)) ? 'PASS' : 'FAIL', `stored ${JSON.stringify(r)}; boxes ${JSON.stringify(k)}`, [`u11-reload-${tg}`])
  })

  /* H8 / U14 — the Inputs page: Drifter's ODs listed; nothing of UNA on the page; "+ Input"'s kinds hold no UNA */
  await sc('H8', async () => {
    await L.inputsList(w)
    await L.shot(w, `h8-list-${tg}`)
    /* v2.1: a phone draws only the cards near the screen — read while scrolling to the end (the first re-walk's H8 on a
       phone read January only) */
    let text = ''
    for (let i = 0; i < 80; i++) {
      text += ' ' + await P.evaluate(() => (document.querySelector('#page-inputs')?.innerText ?? '').replace(/\s+/g, ' '))
      const end = await P.evaluate(() => { const y = scrollY; scrollBy(0, innerHeight * 0.8); return scrollY === y })
      await P.waitForTimeout(120)
      if (end) break
    }
    await P.evaluate(() => scrollTo(0, 0)); await P.waitForTimeout(200)
    /* v2.2: the card itself — a drawn element holding Drifter and OD (the page's text read by scrolling missed it on a
       phone, where a probe found the card in the page) — scrolled into view and pictured */
    const card = await P.evaluate(() => { const e = [...document.querySelectorAll('#page-inputs *')].filter(x => x.children.length < 30 && /Drifter/.test(x.textContent || '') && [...x.querySelectorAll('*')].some(k => k.textContent.trim() === 'OD') && (x.textContent || '').length < 400 && x.getBoundingClientRect().height > 0).sort((a, b) => (a.textContent.length - b.textContent.length))[0]; if (!e) return null; e.scrollIntoView({ block: 'center' }); return e.textContent.replace(/\s+/g, ' ').trim() })
    if (card) { await P.waitForTimeout(250); await L.shot(w, `h8-od-card-${tg}`) }
    const od = !!card
    L.rec('H8 the Inputs list names Drifter\'s overseas duties; UNA nowhere on the page (D1338)', w.tag, od && !/\bUNA\b/.test(text) ? 'PASS' : 'FAIL', `Drifter's OD card: ${card}; UNA on the page ${/\bUNA\b/.test(text)}`, [`h8-list-${tg}`, ...(card ? [`h8-od-card-${tg}`] : [])])
    const add = P.locator('button:has-text("+ Input")').first()
    if (await add.count()) {
      await add.click(); await P.waitForTimeout(700)
      const kindsText = await P.evaluate(() => [...document.querySelectorAll('select option, [role="option"], .inped-type button, .ty-btn')].map(e => e.textContent.trim()).join('|'))
      await L.shot(w, `h8-new-${tg}`)
      L.rec('U14 "+ Input": the kinds offered hold no UNA', w.tag, kindsText && !/\bUNA\b|Unavailable/.test(kindsText) ? 'PASS' : 'FAIL', kindsText.slice(0, 240), [`h8-new-${tg}`])
      await P.keyboard.press('Escape'); await P.waitForTimeout(300)
      const c = P.locator('[data-testid="inped-cancel"], button:has-text("Cancel")').first(); if (await c.count() && await c.isVisible()) await c.click().catch(() => {})
    }
    await P.evaluate(() => window.go('leavewar')); await P.waitForTimeout(800)
  })

  /* H9 / U14 — the schedule: an OD for Drifter on Tue 14 Jul (the demo week) under Unavailable; a UNA for the next man there
     is not on the schedule */
  await sc('H9', async () => {
    const d = '2026-07-14'
    await L.openCellR(w, who, d); await L.press(w, T('bid-file-OD')); await P.waitForTimeout(500)
    await L.openCellR(w, next, d); await L.press(w, T('bid-una')); await P.waitForTimeout(500)
    const nextCs = await P.evaluate(id => window.PEOPLE?.[id]?.cs, next)
    await P.evaluate(() => window.go('editsched')); await P.waitForTimeout(1500)
    const all = await P.evaluate(() => (document.querySelector('#page-editsched')?.innerText ?? document.body.innerText).replace(/\s+/g, ' '))
    const hits = await P.evaluate(() => [...document.querySelectorAll('#page-editsched *')].filter(e => e.children.length < 8 && /Drifter/.test(e.innerText || '') && /\bOD\b|overseas/i.test(e.innerText || '') && (e.innerText || '').length < 160).map(e => e.innerText.replace(/\s+/g, ' ')).slice(0, 3))
    await L.shot(w, `h9-schedule-${tg}`)
    L.rec('H9 the schedule: Drifter under Unavailable with his OD on Tue 14 Jul (RECORD — read from the picture too)', w.tag, hits.length ? 'PASS' : 'RECORD', JSON.stringify(hits), [`h9-schedule-${tg}`])
    L.rec(`U14b the schedule never names a UNA (${nextCs}'s, placed on 14 Jul)`, w.tag, !/\bUNA\b/.test(all) ? 'PASS' : 'FAIL', `UNA on the page: ${/\bUNA\b/.test(all)}`, [`h9-schedule-${tg}`])
    await P.evaluate(() => window.go('leavewar')); await P.waitForTimeout(800)
  })

  /* ================= THE MEMBER (Ranger), signed in for real ================= */
  await sc('MEMBER', async () => {
    await signOut(P); await P.fill('#luser', 'us'); await P.fill('#lpass', 'us'); await P.click('#loginForm button[type=submit]'); await P.waitForSelector('#vWeek .day')
    await P.evaluate(() => window.go('leavewar')); await P.waitForSelector('[data-testid="row-bane"]'); await P.waitForTimeout(800)
  })

  /* H10 — a day before his today: the closed note, then CSE · OD — no UNA; his tap files a course; Undo and Redo (S14) */
  await sc('H10', async () => {
    const past = '2026-10-20'
    await L.openCellR(w, me, past, q('h10-closed'))
    const dump = await L.sheetDump(P)
    await L.shot(w, `h10-closed-${tg}`)
    const row = await rowIds(P, 'closed-extra-row')
    L.rec('H10 member, a day before his today: the closed note, then CSE · OD — no UNA', w.tag, dump?.id === 'closed-note' && JSON.stringify(row) === JSON.stringify(['closed-file-CSE', 'closed-file-OD']) ? 'PASS' : 'FAIL', `${dump?.id}; row ${JSON.stringify(row)}`, [`h10-closed-${tg}`])
    if (row) { await L.press(w, T('closed-file-CSE'), q('h10-cse')); await P.waitForTimeout(500) }
    const k = await kinds(w, me, past)
    await L.cellShot(w, me, past, `h10-filed-${tg}`)
    L.rec('H10b his tap on CSE files it: the window closes, the day holds his course', w.tag, !(await L.vis(P, T('closed-note'))) && k.some(x => /k-cse\|s-a/.test(x)) ? 'PASS' : 'FAIL', `boxes ${JSON.stringify(k)}`, [`h10-filed-${tg}`])
    await L.undo(w); const k1 = await kinds(w, me, past)
    await L.redo(w); const k2 = await kinds(w, me, past)
    L.rec('H10c his Undo takes his course back, his Redo puts it again (S14)', w.tag, !k1.some(x => /k-cse/.test(x)) && k2.some(x => /k-cse/.test(x)) ? 'PASS' : 'FAIL', `undone ${JSON.stringify(k1)}; redone ${JSON.stringify(k2)}`, [])
  })

  /* H11 — the designer's S5: his pending LL on a closed day; words typed into the bid's Remarks; OD — the words stay on the
     bid, the LL and the OD side by side, his Delete on the bid kept */
  await sc('H11', async () => {
    const d = '2026-10-21'
    await L.openCellR(w, me, d, q('h11-open'))
    await L.shot(w, `h11-closed-${tg}`)
    const rmk = P.locator('[data-testid="closed-note"] textarea, [data-testid="closed-note"] input[type="text"]').first()
    if (await rmk.count()) { await rmk.click(); await P.keyboard.type('Wedding') }
    await L.press(w, T('closed-file-OD'), q('h11-od')); await P.waitForTimeout(600)
    const recs = await recsOf(P, me, d), bid = (recs || []).find(r => r.kind === 'request'), k = await kinds(w, me, d)
    await L.cellShot(w, me, d, `h11-both-${tg}`)
    L.rec('H11 his closed day with a pending LL: OD filed beside it, his words stay on the bid', w.tag, k.some(x => /k-ll/.test(x)) && k.some(x => /k-od/.test(x)) && /Wedding/.test(bid?.remarks || '') ? 'PASS' : 'FAIL', `boxes ${JSON.stringify(k)}; bid words ${bid?.remarks}`, [`h11-closed-${tg}`, `h11-both-${tg}`])
    await L.openCellR(w, me, d, q('h11-list'))
    const dump = await L.sheetDump(P)
    await L.shot(w, `h11-list-${tg}`)
    L.rec('H11b the day now holds two entries: what opens, his Delete on the bid (RECORD)', w.tag, 'RECORD', `${dump?.id}: ${String(dump?.text).slice(0, 200)}; delete ${JSON.stringify((dump?.tids || []).filter(t => /clear|delete/.test(t)))}`, [`h11-list-${tg}`])
    await L.closeAny(w)
  })

  /* U7 — the member taps ANOTHER man's UNA: the day's list, read only — placed by, the words; no box, no Delete */
  await sc('U7', async () => {
    const d = '2026-11-10'
    await L.openCellR(w, who, d, q('u7-open'))
    const recs = await recsOf(P, who, d), u = (recs || []).find(r => r.kind === 'una')
    const line = u ? await L.txt(P, T(`dl-u-${u.id}`)) : null, ro = u ? await L.txt(P, T(`dl-ro-${u.id}`)) : null
    const box = u ? await P.locator(T(`dl-una-rmk-${u.id}`)).count() : -1, del = u ? await P.locator(T(`dl-clear-${u.id}`)).count() : -1
    await L.shot(w, `u7-list-${tg}`)
    L.rec('U7 member, another man\'s UNA: the day\'s list read only — placed by, its words; no box, no Delete', w.tag, /placed by/i.test(line || '') && /Board of inquiry/.test(ro || '') && box === 0 && del === 0 ? 'PASS' : 'FAIL', `line ${line}; words ${ro}; box ${box}; delete ${del}`, [`u7-list-${tg}`])
    await L.closeAny(w)
  })

  /* U7b / U20 — his OWN UNA (a morning, placed by the admin): read only, no Delete; its box on his own row */
  await sc('U7b', async () => {
    const d = '2026-12-16'
    await L.reachCell(w, me, d)
    await L.cellShot(w, me, d, `u20-own-${tg}`)
    await L.openCellR(w, me, d, q('u7b-open'))
    const recs = await recsOf(P, me, d), u = (recs || []).find(r => r.kind === 'una')
    const box = u ? await P.locator(T(`dl-una-rmk-${u.id}`)).count() : -1, del = u ? await P.locator(T(`dl-clear-${u.id}`)).count() : -1
    const dump = await L.sheetDump(P)
    await L.shot(w, `u7b-list-${tg}`)
    L.rec('U7b member, his own UNA: the list read only — no box, no Delete (RECORD what the free afternoon offers)', w.tag, u && box === 0 && del === 0 ? 'PASS' : 'FAIL', `${dump?.id}: ${String(dump?.text).slice(0, 160)}; box ${box}; delete ${del}`, [`u20-own-${tg}`, `u7b-list-${tg}`])
    await L.closeAny(w)
  })

  /* U15 — his own drag: CSE · OD, no UNA; a tap on OD files both days (S21: a picture right after the tap) */
  await sc('U15', async () => {
    const open = await dragCells(w, [me, '2026-12-17'], [me, '2026-12-18'])
    const row = open ? await rowIds(P, 'sel-extra-row') : null
    await L.shot(w, `u15-drag-${tg}`)
    if (open && row?.includes('sel-file-OD')) { await L.press(w, T('sel-file-OD'), q('u15-od')); await P.waitForTimeout(600) }
    const ks = await Promise.all(['2026-12-17', '2026-12-18'].map(d => kinds(w, me, d)))
    L.rec('U15 member, a drag over his own two days: CSE · OD, no UNA; OD files both', w.tag, open && JSON.stringify(row) === JSON.stringify(['sel-file-CSE', 'sel-file-OD']) && ks.every(k => k.some(x => /k-od/.test(x))) ? 'PASS' : 'FAIL', `sheet ${open}; row ${JSON.stringify(row)}; boxes ${JSON.stringify(ks)}`, [`u15-drag-${tg}`])
    await L.closeAny(w)
  })

  /* H10d — another man's empty day: nothing offers to file */
  await sc('H10d', async () => {
    await L.openCellR(w, next, '2026-11-25')
    const other = await L.sheetDump(P)
    L.rec('H10d member, another man\'s empty day: no window offers CSE, OD or UNA', w.tag, other && /file-|-una/.test(JSON.stringify(other.tids)) ? 'FAIL' : 'PASS', `${other?.id ?? 'nothing opened'}`, [])
    await L.closeAny(w)
  })

  if (w.errs.length) L.rec('errors seen', w.tag, 'FAIL', w.errs.slice(0, 8).join(' || '), [])
  else L.rec('errors seen (console, page, 4xx)', w.tag, 'PASS', 'none', [])
  await w.ctx.close()
}
await L.closeBrowser()
writeFileSync(path.join(L.OUT, `results-${ENGINE}.json`), JSON.stringify(L.results, null, 1))
const n = v => L.results.filter(r => r.verdict === v).length
console.log(`DONE  PASS ${n('PASS')}  FAIL ${n('FAIL')}  RECORD ${n('RECORD')}  NOT WALKED ${n('NOT WALKED')}`)
