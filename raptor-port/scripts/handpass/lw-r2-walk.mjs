// Round 2's FULL check — the walk (24 Oct 26): a course, an overseas duty and the unforeseen absence (UNA) filed on the
// Leave War (his D1318, D1324, D1325, D1326; the design note docs/superpowers/specs/2026-10-24-lw-file-od-cse-una.md).
// On the built bundle at LW_PORT: his iPhone's size by real touch over CDP (402×874, a picture ~100 ms after each lift —
// D1281) and a desktop (1440×900). Written as the RIGHT behaviour: a PASS means correct; a RECORD line has no fixed answer
// and is judged by the host from its picture.
// Usage: LW_PORT=4345 LW_OUT=2026-10-24-lw-r2/walk [ENGINE=webkit] [SIZES=phone,desk] [ONLY=H1,H3] node lw-r2-walk.mjs
import * as L from './lw-r3-lib.mjs'
import path from 'node:path'
import { mkdirSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs'
console.log('lw-r2-walk v1', L.OUT, 'port', L.PORT)
mkdirSync(L.OUT, { recursive: true })
for (const f of readdirSync(L.OUT)) if (f.endsWith('.png')) unlinkSync(path.join(L.OUT, f))
const ENGINE = process.env.ENGINE || 'chromium'
const SIZES = (process.env.SIZES || 'phone,desk').split(',')
const ONLY = process.env.ONLY ? new Set(process.env.ONLY.split(',')) : null
const run = id => !ONLY || ONLY.has(id)
const T = L.T
async function signOut(P) { if (await L.vis(P, '#logout')) { await P.click('#logout') } else { await P.click('#burger'); await P.waitForTimeout(300); await P.click('#drawerLogout') } await P.waitForSelector('#luser') }
const setSwitch = async (w, on, pfx = 'bid') => { const s = w.page.locator(T(`${pfx}-approve-tick`)); if (!(await s.count())) return null; if (((await s.getAttribute('aria-checked')) === 'true') !== on) { await L.press(w, T(`${pfx}-approve-tick`)); await w.page.waitForTimeout(250) } return (await s.getAttribute('aria-checked')) === 'true' }
const kinds = async (w, who, iso) => ((await L.cellInfo(w.page, who, iso))?.boxes ?? []).map(b => `${b.text}|${(b.cls.match(/k-\w+/) || [''])[0]}|${(b.cls.match(/s-[awr]/) || [''])[0]}|bg ${b.bg}`)
const rowIds = (P, rowId) => P.evaluate(id => { const r = document.querySelector(`[data-testid="${id}"]`); return r ? [...r.querySelectorAll('button')].map(b => b.dataset.testid) : null }, rowId)
/* the four places of the row under the leaves against the leave buttons above them (a phone's rows must line up as drawn) */
const placeCheck = (P, pfx) => P.evaluate(pfx => {
  const box = id => { const e = document.querySelector(`[data-testid="${id}"]`); if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.left), w: Math.round(r.width), y: Math.round(r.top), h: Math.round(r.height) } }
  const pairs = [[`${pfx}-file-CSE`, `${pfx}-LL`], [`${pfx}-file-OD`, `${pfx}-OL`], [`${pfx}-file-UNA`, `${pfx}-OIL`], [`${pfx}-more`, `${pfx}-CL`]]
  return pairs.map(([a, b]) => { const A = box(a), B = box(b); return A && B ? `${a}: dx ${A.x - B.x}, dw ${A.w - B.w}, h ${A.h} vs ${B.h}` : `${a}: ${A ? 'no ' + b : 'missing'}` })
}, pfx)
const words = async (P) => P.evaluate(() => [...document.querySelectorAll('.bidsheet .tchip.lv')].filter(b => { const r = document.createRange(); r.selectNodeContents(b); const tops = new Set([...r.getClientRects()].filter(q => q.width > 0).map(q => Math.round(q.top / 6))); return tops.size > 1 }).map(b => b.dataset.testid))

for (const size of SIZES) {
  const w = await L.newCtx(size, ENGINE)
  w.tag = `${size}${ENGINE === 'webkit' ? '/webkit' : ''}`
  const P = w.page, tg = `${size}${ENGINE === 'webkit' ? '-wk' : ''}`
  const q = n => (w.phone ? `${n}-${tg}-q` : null)
  await L.signInPlain(w, 'admin')
  const ids = await P.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE || {}).map(([k, v]) => [v.cs, k])))
  const who = ids.Drifter, me = ids.Ranger
  const rowOrder = await P.evaluate(() => [...document.querySelectorAll('[data-testid^="row-"]')].map(r => r.dataset.testid.slice(4)))
  const next = rowOrder[rowOrder.indexOf(who) + 1]
  console.log(w.tag, 'Drifter =', who, 'next =', next, 'Ranger =', me)
  const sc = async (id, fn) => { if (!run(id)) return; try { await fn() } catch (e) { L.rec(`${id} — the script could not act`, w.tag, 'NOT WALKED', String(e).slice(0, 260), []); await L.closeAny(w) } }

  /* H1 — the admin's empty day: the row under the leaves as drawn; a tap on UNA files it; the teal box */
  await sc('H1', async () => {
    const d = '2026-11-02'
    await L.openCellR(w, who, d, q('h1-open'))
    await L.shot(w, `h1-window-${tg}`)
    const row = await rowIds(P, 'bid-extra-row'), places = await placeCheck(P, 'bid'), broke = await words(P)
    const okRow = JSON.stringify(row) === JSON.stringify(['bid-file-CSE', 'bid-file-OD', 'bid-file-UNA', 'bid-more'])
    const okPlaces = places.every(p => /dx [-]?[01], dw [-]?[01]/.test(p))
    L.rec('H1 the admin\'s window: CSE · OD · UNA · ⋯ under LL · OL · OIL · CL, as wide, one line, no word broken', w.tag, okRow && okPlaces && !broke.length ? 'PASS' : 'FAIL', `row ${JSON.stringify(row)}; ${places.join('; ')}; broken ${JSON.stringify(broke)}`, [`h1-window-${tg}`])
    await L.press(w, T('bid-file-UNA'), q('h1-una'))
    await P.waitForTimeout(500)
    const open = await L.vis(P, T('bid-picker')), k = await kinds(w, who, d)
    await L.cellShot(w, who, d, `h1-filed-${tg}`)
    L.rec('H1b a tap on UNA files it: the window closes, the day holds a filled teal UNA box', w.tag, !open && k.length === 1 && /UNA\|k-una\|s-a\|bg rgba\(20, 130, 130, 0\.7\)/.test(k[0] || '') ? 'PASS' : 'FAIL', `window open ${open}; boxes ${JSON.stringify(k)}`, [`h1-filed-${tg}`])
    /* a tap on it now: the Inputs page's window (it is an input) */
    await L.openCellR(w, who, d, q('h1-reopen'))
    const dump = await L.sheetDump(P)
    await L.shot(w, `h1-reopen-${tg}`)
    L.rec('H1c a tap on the filed day: the window an input filed on the Inputs page opens (RECORD — reading 4)', w.tag, 'RECORD', `${dump?.id}: ${dump?.text?.slice(0, 220)}`, [`h1-reopen-${tg}`])
    await L.closeAny(w)
  })

  /* H2 — a range: OD over three days; one input on the Inputs page with the words typed */
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
    const stored = (await L.storedInputs(P)).map(x => x.v).filter(v => v && v.type === 'OD' && (v.person === who || (v.people || []).some(p => p.p === who)))
    const mine = stored.filter(v => v.date === 'Nov 3')
    L.rec('H2 a range 3–5 Nov and OD: three filled slate boxes; one input, its words with it', w.tag, ks.every(k => k.length === 1 && /OD\|k-od\|s-a/.test(k[0] || '')) && mine.length === 1 && mine[0].endDate === 'Nov 5' && /Pitch Black/.test(mine[0].remarks || '') ? 'PASS' : 'FAIL', `boxes ${JSON.stringify(ks)}; stored ${JSON.stringify(mine.map(v => [v.date, v.endDate, v.remarks, v.allday]))}`, [`h2-range-${tg}`, `h2-filed-${tg}`])
  })

  /* H3 — a day with a pending LL: CSE filed over it — the bid stays, the day holds both */
  await sc('H3', async () => {
    const d = '2026-11-09'
    await L.openCellR(w, who, d); await setSwitch(w, false); await L.placeLeave(w, 'LL')
    await L.openCellR(w, who, d)
    await L.shot(w, `h3-pending-${tg}`)
    await L.press(w, T('bid-file-CSE'), q('h3-cse')); await P.waitForTimeout(500)
    const k = await kinds(w, who, d)
    await L.cellShot(w, who, d, `h3-both-${tg}`)
    L.rec('H3 a pending LL, then CSE: the bid stays and the day holds both, each its own box', w.tag, k.length === 2 && k.some(x => /k-ll\|s-w/.test(x)) && k.some(x => /k-cse\|s-a/.test(x)) ? 'PASS' : 'FAIL', `boxes ${JSON.stringify(k)}`, [`h3-pending-${tg}`, `h3-both-${tg}`])
  })

  /* H4 — the drag window: two men, two days, UNA — four days filed; no ⋯ for two men */
  await sc('H4', async () => {
    const a = '2026-11-16', z = '2026-11-17'
    await L.reachCell(w, who, a)
    const A = await L.centre(P, T(L.cellId(who, a))), Z = await L.centre(P, T(L.cellId(next, z)))
    if (w.phone) await L.holdDrag(w, [A, Z])
    else { await P.mouse.move(A.x, A.y); await P.mouse.down(); await P.mouse.move(Z.x, Z.y, { steps: 8 }); await P.mouse.up() }
    await P.waitForTimeout(500)
    const open = await L.vis(P, T('select-sheet'))
    await L.shot(w, `h4-drag-${tg}`)
    const row = open ? await rowIds(P, 'sel-extra-row') : null
    if (open) { await L.press(w, T('sel-file-UNA'), q('h4-una')); await P.waitForTimeout(600) }
    const ks = await Promise.all([[who, a], [who, z], [next, a], [next, z]].map(([p, d]) => kinds(w, p, d)))
    await L.cellShot(w, who, z, `h4-filed-${tg}`)
    L.rec('H4 a drag over two men and two days: CSE · OD · UNA (no ⋯ — a posting is one man\'s); UNA fills all four', w.tag, open && JSON.stringify(row) === JSON.stringify(['sel-file-CSE', 'sel-file-OD', 'sel-file-UNA']) && ks.every(k => k.some(x => /k-una\|s-a/.test(x))) ? 'PASS' : 'FAIL', `sheet ${open}; row ${JSON.stringify(row)}; boxes ${JSON.stringify(ks)}`, [`h4-drag-${tg}`, `h4-filed-${tg}`])
    await L.closeAny(w)
  })

  /* H5 — the top bar's Undo takes the last filing back whole; Redo puts it again */
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

  /* H6 — manning: UNA takes him off the day's count — the grid's Available row for his seat drops by one */
  await sc('H6', async () => {
    const d = '2026-11-19'
    const avail = () => P.evaluate(d => { const c = document.querySelector(`[data-testid="avail-p-${d}"]`); return c ? c.textContent.trim() : null }, d)
    await L.reachCell(w, who, d)
    const before = await avail()
    await L.openCellR(w, who, d); await L.press(w, T('bid-file-UNA')); await P.waitForTimeout(600)
    const after = await avail()
    L.rec('H6 UNA takes him off the day\'s manning: Available P on 19 Nov one lower (RECORD if the row is not found)', w.tag, before != null && after != null ? (Number(after) === Number(before) - 1 ? 'PASS' : 'FAIL') : 'RECORD', `Available P ${before} → ${after}`, [])
  })

  /* H7 — the Legend names UNA, in its teal */
  await sc('H7', async () => {
    await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(200)
    await L.press(w, T('legend-open')); await P.waitForTimeout(400)
    const row = await P.evaluate(() => { const r = [...document.querySelectorAll('[data-testid="legend"] .leg-row')].find(x => /Unavailable/.test(x.innerText)); if (!r) return null; const b = r.querySelector('.leg-box .c'); return { t: r.innerText.trim(), bg: b ? getComputedStyle(b).backgroundColor : null } })
    await L.shot(w, `h7-legend-${tg}`)
    L.rec('H7 the Legend: "Unavailable: an unforeseen absence" in its own teal', w.tag, row && /unforeseen/.test(row.t) && row.bg === 'rgba(20, 130, 130, 0.7)' ? 'PASS' : 'FAIL', JSON.stringify(row), [`h7-legend-${tg}`])
    await P.keyboard.press('Escape'); await L.closeAny(w); await P.waitForTimeout(300)
  })

  /* H8 — the Inputs page: the list names the UNA and the OD; the calendar's November bar teal */
  await sc('H8', async () => {
    await L.inputsList(w)
    const rows = (await L.inputsRows(P)).filter(r => /\bUNA\b|\bOD\b/.test(r) && /Drifter/.test(r))
    await L.shot(w, `h8-list-${tg}`)
    L.rec('H8 the Inputs list shows Drifter\'s UNA and OD (RECORD — their rows)', w.tag, rows.some(r => /UNA/.test(r)) && rows.some(r => /\bOD\b/.test(r)) ? 'PASS' : 'FAIL', rows.slice(0, 6).join(' || '), [`h8-list-${tg}`])
    await L.press(w, 'text=Calendar'); await P.waitForTimeout(700)
    for (let i = 0; i < 14 && !(await P.locator('.ib-bar.k-una').count()); i++) { await L.press(w, '#icNext'); await P.waitForTimeout(400) }
    const bar = await P.evaluate(() => { const b = document.querySelector('.ib-bar.k-una'); return b ? { bg: getComputedStyle(b).backgroundColor, t: b.innerText } : null })
    await L.shot(w, `h8-calendar-${tg}`)
    L.rec('H8b the Inputs calendar: UNA\'s bar deep teal, filled .70', w.tag, bar && bar.bg === 'rgba(20, 130, 130, 0.7)' ? 'PASS' : 'FAIL', JSON.stringify(bar), [`h8-calendar-${tg}`])
    await P.evaluate(() => window.go('leavewar')); await P.waitForTimeout(800)
  })

  /* H9 — the schedule: UNA filed for Drifter on Tue 14 Jul (the demo's week) — Edit Schedule's Unavailable names him with UNA */
  await sc('H9', async () => {
    const d = '2026-07-14'
    await L.openCellR(w, who, d); await L.press(w, T('bid-file-UNA')); await P.waitForTimeout(500)
    await P.evaluate(() => window.go('editsched')); await P.waitForTimeout(1500)
    const hits = await P.evaluate(() => [...document.querySelectorAll('#page-editsched *, .day *')].filter(e => e.children.length < 8 && /Drifter/.test(e.innerText || '') && /\bUNA\b/.test(e.innerText || '') && (e.innerText || '').length < 160).map(e => e.innerText.replace(/\s+/g, ' ')).slice(0, 3))
    await L.shot(w, `h9-schedule-${tg}`)
    L.rec('H9 the schedule: Drifter under Unavailable with UNA on Tue 14 Jul (RECORD — read from the picture too)', w.tag, hits.length ? 'PASS' : 'RECORD', JSON.stringify(hits), [`h9-schedule-${tg}`])
    await P.evaluate(() => window.go('leavewar')); await P.waitForTimeout(800)
  })

  /* H10 — the member, signed in for real: his open day (three, no ⋯), his closed day (the note and the three) */
  await sc('H10', async () => {
    await signOut(P); await P.fill('#luser', 'us'); await P.fill('#lpass', 'us'); await P.click('#loginForm button[type=submit]'); await P.waitForSelector('#vWeek .day')
    await P.evaluate(() => window.go('leavewar')); await P.waitForSelector('[data-testid="row-bane"]'); await P.waitForTimeout(800)
    /* a day before his today: the closed-day window (D1211) */
    const past = '2026-10-20'
    await L.openCellR(w, me, past, q('h10-closed'))
    const dump = await L.sheetDump(P)
    await L.shot(w, `h10-closed-${tg}`)
    const row = await rowIds(P, 'closed-extra-row')
    L.rec('H10 member, a day before his today: the closed note, then CSE · OD · UNA', w.tag, dump?.id === 'closed-note' && JSON.stringify(row) === JSON.stringify(['closed-file-CSE', 'closed-file-OD', 'closed-file-UNA']) ? 'PASS' : 'FAIL', `${dump?.id}; row ${JSON.stringify(row)}`, [`h10-closed-${tg}`])
    if (row) { await L.press(w, T('closed-file-CSE'), q('h10-cse')); await P.waitForTimeout(500) }
    const k = await kinds(w, me, past)
    await L.cellShot(w, me, past, `h10-filed-${tg}`)
    L.rec('H10b his tap on CSE files it there: the window closes, the day holds his course', w.tag, !(await L.vis(P, T('closed-note'))) && k.some(x => /k-cse\|s-a/.test(x)) ? 'PASS' : 'FAIL', `boxes ${JSON.stringify(k)}`, [`h10-filed-${tg}`])
    /* another man's row: nothing opens for him */
    await L.openCellR(w, who, '2026-11-24')
    const other = await L.sheetDump(P)
    L.rec('H10c member, another man\'s day: no window offers the three (RECORD)', w.tag, other && /file-/.test(JSON.stringify(other.tids)) ? 'FAIL' : 'PASS', `${other?.id ?? 'nothing opened'}`, [])
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
