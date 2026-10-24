// Round 3 of the bid windows — the FULL check's walk (24 Oct 26), on the built bundle at LW_PORT (4341), his iPhone's size by
// real touch over CDP (402×874, a picture within ~100 ms of each lift — D1281) and a desktop (1440×900). Written as the RIGHT
// behaviour: a PASS means correct; a RECORD line has no fixed answer and is judged by the host from its picture.
// Each window is measured beside its drawing (lesson 42): the whole window's height against the drawn one, each row's
// lines (one, the leaves two), side-by-side boxes one height on one centre line (lesson 43), no button's words broken, and
// the same with an iPhone's wider letters (letter-spacing .9px on the window, as the drawings were checked).
// Usage: LW_PORT=4341 LW_OUT=2026-10-24-lw-r3/walk [ENGINE=webkit] [SIZES=phone,desk] [ONLY=S3,S7] node lw-r3-walk.mjs
import * as L from './lw-r3-lib.mjs'
import path from 'node:path'
import { mkdirSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs'
console.log('lw-r3-walk v1', L.OUT, 'port', L.PORT)
mkdirSync(L.OUT, { recursive: true })
for (const f of readdirSync(L.OUT)) if (f.endsWith('.png')) unlinkSync(path.join(L.OUT, f))   // one run, one folder
const ENGINE = process.env.ENGINE || 'chromium'
const SIZES = (process.env.SIZES || 'phone,desk').split(',')
const ONLY = process.env.ONLY ? new Set(process.env.ONLY.split(',')) : null
const run = id => !ONLY || ONLY.has(id)
const D = { empty: '2026-11-02', pend: '2026-11-03', half: '2026-11-05', free: '2026-11-06', two: '2026-11-09', ref: '2026-11-10', oil: '2026-11-11', long: '2026-11-12', rng: '2026-11-16', drag: '2026-11-23', mem: '2026-11-17', memA: '2026-11-18' }
const DRAWN = { empty: 248, pending: 286, approved: 286, drag: 279, member: 248 }
const T = L.T

/* ---- reading the open window ---- */
const winRows = (P, sel) => P.evaluate(sel => {
  const s = document.querySelector(sel); if (!s) return null
  const box = e => { const r = e.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), b: Math.round(r.bottom), r: Math.round(r.right) } }
  const parts = el => [...el.querySelectorAll('button, textarea, input[type=checkbox], .note, .dl-main, .leg-box, .inped-till, .dl-row, .dl-calm')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1 && !e.closest('.bp-menu') })
  /* a line is a band of overlapping boxes (a tall box beside short words is ONE line — the first run counted tops) */
  const lines = el => { const bands = []; for (const p of parts(el)) { const r = p.getBoundingClientRect(); const b = bands.find(x => r.top < x.b - 2 && r.bottom > x.t + 2); if (b) { b.t = Math.min(b.t, r.top); b.b = Math.max(b.b, r.bottom) } else bands.push({ t: r.top, b: r.bottom }) } return bands.length }
  /* side by side: the row's boxes (buttons, the remarks box) — their heights and centre lines (lesson 43) */
  const side = el => { const bs = [...el.querySelectorAll(':scope > button, :scope > span > button, :scope > span > textarea, :scope .bp-doc button, :scope .lv-grid > button')].filter(e => e.getBoundingClientRect().width > 1); if (bs.length < 2) return null; const first = bs.filter(b => Math.abs(b.getBoundingClientRect().top - bs[0].getBoundingClientRect().top) < 8); const hs = first.map(b => b.getBoundingClientRect().height); const cs = first.map(b => { const r = b.getBoundingClientRect(); return r.top + r.height / 2 }); return { n: first.length, hSpread: Math.round((Math.max(...hs) - Math.min(...hs)) * 10) / 10, cSpread: Math.round((Math.max(...cs) - Math.min(...cs)) * 10) / 10 } }
  const broken = [...s.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 1 && !b.closest('.bp-menu')).filter(b => { const r = document.createRange(); r.selectNodeContents(b); const ts = []; for (const q of r.getClientRects()) { if (q.width <= 0) continue; if (!ts.some(t => Math.abs(t - q.top) > 8 ? false : true)) ts.push(q.top) } return ts.length > 1 }).map(b => b.dataset.testid || b.innerText.trim())
  const rows = [...s.children].filter(e => e.getBoundingClientRect().height > 0).map(e => ({ name: e.getAttribute('aria-label') || e.dataset.testid || String(e.className).split(' ').slice(0, 2).join('.'), ...box(e), lines: lines(e), side: side(e), overX: e.scrollWidth - e.clientWidth, text: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 80) }))
  return { win: box(s), vp: [innerWidth, innerHeight], scrollH: s.scrollHeight, clientH: s.clientHeight, rows, broken }
}, sel)
const wider = async (P, sel) => { await P.evaluate(sel => { document.querySelector(sel).style.letterSpacing = '0.9px' }, sel); const g = await winRows(P, sel); await P.evaluate(sel => { document.querySelector(sel).style.letterSpacing = '' }, sel); return g }
const rowsSay = g => g ? g.rows.map(r => `${r.name}:${r.h}/${r.lines}L${r.side ? ` side h±${r.side.hSpread} c±${r.side.cSpread}` : ''}${r.overX > 0 ? ` overX${r.overX}` : ''}`).join(' | ') : 'no window'
/* the rows expected one line each (the leave grid two) — the name of every row that broke */
const lineFaults = g => g.rows.filter(r => !/bidsheet-hd/.test(r.name) && r.lines > (/Which leave/.test(r.name) ? 2 : /bid-dayline|bidsheet-dayline/.test(r.name) ? 9 : 1)).map(r => `${r.name} ${r.lines} lines`)
const sideFaults = g => g.rows.filter(r => r.side && (r.side.hSpread > 1.5 || r.side.cSpread > 1.5)).map(r => `${r.name} h±${r.side.hSpread} c±${r.side.cSpread}`)
/* one window measured: its height against the drawn one, lines and side by side, normal and wider letters */
async function measure(w, sel, drawnKey, id) {
  const g = await winRows(w.page, sel), gw = await wider(w.page, sel)
  const drawn = DRAWN[drawnKey]
  const faults = [...lineFaults(g), ...sideFaults(g), ...g.broken.map(b => `broken words: ${b}`), ...lineFaults(gw).map(f => `wider: ${f}`), ...gw.broken.map(b => `wider broken: ${b}`)]
  const dh = drawn ? g.win.h - drawn : null
  const sizeNote = drawn ? `height ${g.win.h} (drawn ${drawn}, ${dh >= 0 ? '+' : ''}${dh})` : `height ${g.win.h}`
  L.rec(`${id} geometry beside the drawing`, w.tag, faults.length ? 'FAIL' : 'PASS', `${sizeNote}; ${faults.join('; ') || 'every row one line, side by side one height'} — ${rowsSay(g)}`, [])
  return g
}
const setSwitch = async (w, on, pfx = 'bid') => { const s = w.page.locator(T(`${pfx}-approve-tick`)); if (!(await s.count())) return null; if (((await s.getAttribute('aria-checked')) === 'true') !== on) { await L.press(w, T(`${pfx}-approve-tick`)); await w.page.waitForTimeout(250) } return (await s.getAttribute('aria-checked')) === 'true' }
const cell = async (w, who, iso) => { const b = await L.boxes(w, who, iso); return b ? `${b.text} [${b.boxes.join(' ; ')}]` : 'no cell' }
const fillOf = async (w, who, iso) => (await L.cellInfo(w.page, who, iso))?.boxes?.map(b => (b.cls.match(/s-[awr]/) || [''])[0]).join(',') || ''
const lit = (P, id) => P.evaluate(id => { const e = document.querySelector(`[data-testid="${id}"]`); return e ? { lit: e.classList.contains('lit'), pressed: e.getAttribute('aria-pressed') } : null }, id)
const valueOf = (P, id) => P.evaluate(id => document.querySelector(`[data-testid="${id}"]`)?.value ?? null, id)
async function typeInto(w, id, text, { leave = false } = {}) {
  const P = w.page
  await L.press(w, T(id)); await P.waitForTimeout(200)
  await P.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A'); await P.keyboard.type(text, { delay: 8 })
  if (leave) { await P.keyboard.press('Enter'); await P.waitForTimeout(300) }
}
const closeX = async (w, id = 'bid-cancel') => { if (await L.vis(w.page, T(id))) { await L.press(w, T(id)); await w.page.waitForTimeout(350) } }
/* the stored leave's remarks (the Inputs page's record the war's approved leave is) */
/* read from the browser's SAVED inputs (raptor:inputs/<iid>) — what a reload would bring back — by its people, its display
   date ("Nov 3") and its war tag (the first run looked for fields the record does not have) */
const MON3 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const mdOf = iso => `${MON3[+iso.slice(5, 7) - 1]} ${+iso.slice(8, 10)}`
const leaveRemark = async (P, who, iso) => { const all = await L.storedInputs(P); const r = all.map(x => x.v).find(v => v && v.lw && ((v.people || []).some(p => p.p === who) || v.person === who) && v.date === mdOf(iso)); return r ? { remarks: r.remarks ?? '', till: r.till ?? null, docs: (r.docIds || []).length } : null }

for (const size of SIZES) {
  const w = await L.newCtx(size, ENGINE)
  w.tag = `${size}${ENGINE === 'webkit' ? '/webkit' : ''}`
  const P = w.page, tg = `${size}${ENGINE === 'webkit' ? '-wk' : ''}`
  const q = n => (w.phone ? `${n}-${tg}-q` : null)   // the picture right after a phone tap (D1281)
  await L.signInPlain(w, 'admin')
  const ids = await P.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE || {}).map(([k, v]) => [v.cs, k])))
  const who = ids.Drifter
  const rowOrder = await P.evaluate(() => [...document.querySelectorAll('[data-testid^="row-"]')].map(r => r.dataset.testid.slice(4)))
  const next = rowOrder[rowOrder.indexOf(who) + 1]
  console.log(w.tag, 'Drifter =', who, 'next row =', next, 'Ranger =', ids.Ranger)
  const sc = async (id, fn) => { if (!run(id)) return; try { await fn() } catch (e) { L.rec(`${id} — the script could not act`, w.tag, 'NOT WALKED', String(e).slice(0, 260), []); await L.closeAny(w) } }

  /* S1 — an empty day, the admin: the window's rows as drawn (c-empty-proposed) */
  await sc('S1', async () => {
    await L.openCellR(w, who, D.empty, q('s1-empty'))
    await L.shot(w, `s1-empty-${tg}`)
    const g = await measure(w, T('bid-picker'), 'empty', 'S1')
    const hd = await L.txt(P, '.bidsheet .bidsheet-hd')
    const sw = await P.locator(T('bid-approve-tick')).getAttribute('aria-checked')
    const acts = await L.vis(P, T('bid-actions'))
    const range = await P.evaluate(() => { const r = document.querySelector('[data-testid="span-range"]'); const row = r?.parentElement; return r && row ? { last: row.lastElementChild === r, right: Math.round(row.getBoundingClientRect().right - r.getBoundingClientRect().right) } : null })
    const more = await L.vis(P, T('bid-more')) ? await P.evaluate(() => { const m = document.querySelector('[data-testid="bid-more"]').getBoundingClientRect(), c = document.querySelector('[data-testid="bid-CL"]').getBoundingClientRect(); return { dx: Math.round(m.left - c.left), dw: Math.round(m.width - c.width), below: Math.round(m.top - c.bottom) } }) : null
    const noNow = !/\bnow\b/i.test(hd || '')
    const ok = sw === 'true' && !acts && range?.last && more && Math.abs(more.dx) <= 1 && Math.abs(more.dw) <= 1 && noNow
    L.rec('S1 empty day (admin): title who · day · switch on · ✕, no "now"; no actions row; Pick a range ends Duration; the ⋯ under CL at its width', w.tag, ok ? 'PASS' : 'FAIL',
      `title "${hd}"; switch ${sw}; actions row ${acts}; Pick a range last ${range?.last} (right gap ${range?.right}); ⋯ vs CL dx ${more?.dx} dw ${more?.dw} gap ${more?.below}`, [`s1-empty-${tg}`])
    await closeX(w)
  })

  /* S2 — the switch turned off (D1302): drawn as the app's switch, off; a leave placed waits (hollow) */
  await sc('S2', async () => {
    await L.openCellR(w, who, D.pend)
    await L.press(w, T('bid-approve-tick'), q('s2-switch'))
    await L.shot(w, `s2-switch-off-${tg}`)
    const off = (await P.locator(T('bid-approve-tick')).getAttribute('aria-checked')) === 'false'
    const look = await L.btnLook(P, 'LL')
    const placed = await L.placeLeave(w, 'LL')
    const f = await fillOf(w, who, D.pend)
    L.rec('S2 switch off: the buttons hollow, the LL placed waits', w.tag, off && placed && f === 's-w' ? 'PASS' : 'FAIL', `switch off ${off}; LL button ${look?.bd}; placed ${placed}; cell ${await cell(w, who, D.pend)}`, [`s2-switch-off-${tg}`])
  })

  /* S3 — the pending bid reopened (a-pending-proposed): one row of four actions, the LL lit, Whole day lit, its own words */
  await sc('S3', async () => {
    await L.openCellR(w, who, D.pend, q('s3-pending'))
    await L.shot(w, `s3-pending-${tg}`)
    await measure(w, T('bid-picker'), 'pending', 'S3')
    const ap = await lit(P, 'decide-approve'), ll = await lit(P, 'bid-LL'), whole = await lit(P, 'portion-full')
    const swOff = (await P.locator(T('bid-approve-tick')).getAttribute('aria-checked')) === 'false'
    const tapped = w.phone ? await P.evaluate(([who, d]) => { const c = document.querySelector(`[data-testid="cell-${who}-${d}"]`).getBoundingClientRect(), s = document.querySelector('[data-testid="bid-picker"]').getBoundingClientRect(); const td = document.querySelector(`[data-testid="cell-${who}-${d}"]`); return { above: Math.round(s.top - c.bottom), cyan: td.className } }, [who, D.pend]) : null
    const ok = ap && !ap.lit && ll?.lit && whole?.pressed === 'true' && swOff && (!tapped || tapped.above >= 0)
    L.rec('S3 pending bid: Approve not lit, LL lit, Whole day lit; switch still off (remembered); on a phone the day stands above the window (D1290)', w.tag, ok ? 'PASS' : 'FAIL',
      `Approve ${JSON.stringify(ap)}; LL ${JSON.stringify(ll)}; Whole day ${whole?.pressed}; switch off ${swOff}; day line "${await L.dayline(P)}"${tapped ? `; tapped day ${tapped.above}px above the window, cell class "${tapped.cyan}"` : ''}`, [`s3-pending-${tg}`])
  })

  /* S4 — a remark typed and the window closed by ✕ without leaving the box: the words go with the closing */
  await sc('S4', async () => {
    if (!(await L.vis(P, T('bid-picker')))) await L.openCellR(w, who, D.pend)
    await typeInto(w, 'bid-remarks', 'Walk remark one')
    await L.shot(w, `s4-typed-${tg}`)
    await closeX(w)
    await L.openCellR(w, who, D.pend)
    const v = await valueOf(P, 'bid-remarks')
    await L.shot(w, `s4-reopened-${tg}`)
    L.rec('S4 a remark typed then ✕ (the box not left): kept on the bid', w.tag, v === 'Walk remark one' ? 'PASS' : 'FAIL', `reopened box "${v}"`, [`s4-typed-${tg}`, `s4-reopened-${tg}`])
  })

  /* S5 — Approve: the leave approved; reopened, Approve LIT and the leave's own Remarks / Document (D1307), the remark carried */
  await sc('S5', async () => {
    if (!(await L.vis(P, T('bid-picker')))) await L.openCellR(w, who, D.pend)
    await L.press(w, T('decide-approve'), q('s5-approve'))
    await P.waitForTimeout(400)
    const f = await fillOf(w, who, D.pend)
    await L.openCellR(w, who, D.pend, q('s5-approved'))
    await L.shot(w, `s5-approved-${tg}`)
    await measure(w, T('bid-picker'), 'approved', 'S5')
    const ap = await lit(P, 'decide-approve')
    const v = await valueOf(P, 'bid-remarks')
    const stored = await leaveRemark(P, who, D.pend)
    const ok = f === 's-a' && ap?.lit && ap?.pressed === 'true' && v === 'Walk remark one' && stored?.remarks === 'Walk remark one'
    L.rec('S5 approved: the cell filled; reopened, Approve lit; the remark carried onto the leave (Inputs record)', w.tag, ok ? 'PASS' : 'FAIL', `cell ${f}; Approve ${JSON.stringify(ap)}; box "${v}"; the Inputs leave ${JSON.stringify(stored)}`, [`s5-approved-${tg}`])
  })

  /* S6 — the approved leave's remark changed from the window and ✕ pressed: saved onto the leave on the Inputs page */
  await sc('S6', async () => {
    if (!(await L.vis(P, T('bid-picker')))) await L.openCellR(w, who, D.pend)
    await typeInto(w, 'bid-remarks', 'Walk remark two')
    await closeX(w)
    const stored = await leaveRemark(P, who, D.pend)
    await L.openCellR(w, who, D.pend)
    const v = await valueOf(P, 'bid-remarks')
    await L.shot(w, `s6-leave-remark-${tg}`)
    L.rec('S6 the approved leave\'s remark typed, ✕: saved onto the leave', w.tag, stored?.remarks === 'Walk remark two' && v === 'Walk remark two' ? 'PASS' : 'FAIL', `Inputs leave ${JSON.stringify(stored)}; reopened box "${v}"`, [`s6-leave-remark-${tg}`])
  })

  /* S7 — the lit Approve's second tap sends the leave back to waiting (D1330); its words go back to the bid; Undo, Redo */
  await sc('S7', async () => {
    if (!(await L.vis(P, T('bid-picker')))) await L.openCellR(w, who, D.pend)
    await L.press(w, T('decide-approve'), q('s7-sendback'))
    await P.waitForTimeout(400)
    const f1 = await fillOf(w, who, D.pend), gone = await leaveRemark(P, who, D.pend)
    await L.cellShot(w, who, D.pend, `s7-sentback-cell-${tg}`)
    await L.openCellR(w, who, D.pend)
    const ap = await lit(P, 'decide-approve'), v = await valueOf(P, 'bid-remarks')
    await L.shot(w, `s7-sentback-${tg}`)
    await closeX(w)
    await L.undo(w); const fu = await fillOf(w, who, D.pend)
    await L.redo(w); const fr = await fillOf(w, who, D.pend)
    const ok = f1 === 's-w' && !gone && ap && !ap.lit && v === 'Walk remark two' && fu === 's-a' && fr === 's-w'
    L.rec('S7 the lit Approve tapped again: back to waiting, the leave gone from the Inputs page, its words on the bid; Undo approves, Redo sends back', w.tag, ok ? 'PASS' : 'FAIL',
      `after: cell ${f1}, Inputs leave ${JSON.stringify(gone)}; reopened Approve ${JSON.stringify(ap)}, box "${v}"; Undo ${fu}; Redo ${fr}`, [`s7-sentback-cell-${tg}`, `s7-sentback-${tg}`])
  })

  /* S8 — Refuse: struck; reopened — Refuse pressed, no leave lit (a refused bid holds no leave), what the rows say */
  await sc('S8', async () => {
    await L.openCellR(w, who, D.ref)
    await setSwitch(w, false)
    await L.placeLeave(w, 'LL')
    await L.openCellR(w, who, D.ref)
    await L.press(w, T('decide-refuse'), q('s8-refuse'))
    await P.waitForTimeout(400)
    const f = await fillOf(w, who, D.ref)
    await L.openCellR(w, who, D.ref)
    await L.shot(w, `s8-refused-${tg}`)
    const g = await winRows(P, T('bid-picker'))
    const rf = await lit(P, 'decide-refuse'), ll = await lit(P, 'bid-LL')
    L.rec('S8 refused: struck; reopened, Refuse pressed, no leave lit', w.tag, f === 's-r' && rf?.pressed === 'true' && !ll?.lit ? 'PASS' : 'FAIL', `cell ${f}; Refuse ${JSON.stringify(rf)}; LL ${JSON.stringify(ll)}; rows ${rowsSay(g)}`, [`s8-refused-${tg}`])
    await closeX(w)
  })

  /* S9 — a half day of war leave: placed AM (approved); reopened — which window, what is lit (D1331: AM lit beside LL; no code in the title) */
  await sc('S9', async () => {
    await L.openCellR(w, who, D.half)
    await setSwitch(w, true)
    await L.press(w, T('portion-am')); await L.placeLeave(w, 'LL')
    const f = await fillOf(w, who, D.half)
    await L.openCellR(w, who, D.half, q('s9-half'))
    await L.shot(w, `s9-half-${tg}`)
    const dump = await L.sheetDump(P)
    const am = await lit(P, 'portion-am'), ll = await lit(P, 'bid-LL'), hd = await L.txt(P, '.bidsheet .bidsheet-hd')
    L.rec('S9 half day (AM LL approved) reopened: the decide window, AM lit beside the lit LL, no code in the title (D1331)', w.tag, dump?.id === 'bid-picker' && am?.pressed === 'true' && ll?.lit && !/<LL|LL/.test(hd || '') ? 'PASS' : 'FAIL',
      `cell ${f}; window ${dump?.id}; AM ${JSON.stringify(am)}; LL ${JSON.stringify(ll)}; title "${hd}"; text: ${dump?.text?.slice(0, 220)}`, [`s9-half-${tg}`])
    await L.closeAny(w)
  })

  /* S10 — the free half beside leave filed on the Inputs page: only the other half offered, its line says where to change it, no leave lit */
  await sc('S10', async () => {
    const y = +D.free.slice(0, 4), md = new Date(D.free + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
    await P.evaluate(([who, md, y]) => window.fileInput({ person: who, date: md, yr: y, type: 'LL', allday: false, half: 'am', s: 0, e: 720, remarks: '' }), [who, md, y])
    await P.waitForTimeout(600)
    await L.openCellR(w, who, D.free, q('s10-free'))
    await L.shot(w, `s10-freehalf-${tg}`)
    const held = await L.txt(P, T('bid-heldhalf'))
    const chips = await P.evaluate(() => [...document.querySelectorAll('[data-testid^="portion-"]')].map(b => b.dataset.testid))
    const anyLit = await P.evaluate(() => !!document.querySelector('.bidsheet .tchip.lv.lit'))
    const g = await winRows(P, T('bid-picker'))
    L.rec('S10 free half beside Inputs-page leave: PM only, "The morning is LL, filed on the Inputs page — change that there", no leave lit', w.tag, chips.join() === 'portion-pm' && /morning is LL/.test(held || '') && !anyLit ? 'PASS' : 'FAIL',
      `portions ${chips}; line "${held}"; any lit ${anyLit}; rows ${rowsSay(g)}`, [`s10-freehalf-${tg}`])
    await L.closeAny(w)
  })

  /* S11 — the ⋯ and its menu: inside the window, every item pressable where drawn; Escape takes the menu first, then the window
     (desktop) — the keyboard back on the ⋯; a press outside the menu closes it (phone) */
  await sc('S11', async () => {
    await L.openCellR(w, who, D.empty)
    await L.press(w, T('bid-more'), q('s11-more'))
    await L.shot(w, `s11-menu-${tg}`)
    const m = await P.evaluate(() => {
      const s = document.querySelector('[data-testid="bid-picker"]').getBoundingClientRect(), mn = document.querySelector('[data-testid="bid-more-menu"]')?.getBoundingClientRect()
      const items = [...document.querySelectorAll('[data-testid="bid-more-menu"] [role=menuitem]')].map(e => { const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { t: e.innerText.trim(), ok: !!h && (h === e || e.contains(h)), bg: getComputedStyle(e).backgroundColor } })
      return mn ? { inside: mn.left >= s.left - 0.5 && mn.right <= s.right + 0.5 && mn.top >= s.top - 0.5 && mn.bottom <= innerHeight, items } : null
    })
    L.rec('S11 the ⋯ opens its menu inside the window: Grant OIL (green), Post out, Post in, each pressable', w.tag, m?.inside && m.items.length === 3 && m.items.every(i => i.ok) && /Grant OIL/.test(m.items[0].t) ? 'PASS' : 'FAIL', JSON.stringify(m), [`s11-menu-${tg}`])
    if (!w.phone) {
      await P.keyboard.press('Escape'); await P.waitForTimeout(250)
      const after1 = { menu: await L.vis(P, T('bid-more-menu')), win: await L.vis(P, T('bid-picker')), focus: await P.evaluate(() => document.activeElement?.dataset?.testid || document.activeElement?.tagName) }
      await P.keyboard.press('Escape'); await P.waitForTimeout(250)
      const after2 = await L.vis(P, T('bid-picker'))
      L.rec('S11b Escape: the menu first (focus back on the ⋯), then the window', w.tag, !after1.menu && after1.win && after1.focus === 'bid-more' && !after2 ? 'PASS' : 'FAIL', `first Escape ${JSON.stringify(after1)}; second: window open ${after2}`, [])
    } else {
      const c = await L.centre(P, T('bid-dayline')).catch(() => null)
      if (c) await L.finger(w, c.x, c.y, 0, `s11-outside-${tg}-q`)
      const after = { menu: await L.vis(P, T('bid-more-menu')), win: await L.vis(P, T('bid-picker')) }
      L.rec('S11b a press outside the menu (on the window) closes the menu, not the window', w.tag, !after.menu && after.win ? 'PASS' : 'FAIL', JSON.stringify(after), [`s11-outside-${tg}-q`])
      await L.closeAny(w)
    }
  })

  /* S12 — Grant OIL from the ⋯: its panel opens; an award given lands as FO; reopened, the ⋯'s first item names it; a second award */
  await sc('S12', async () => {
    await L.openCellR(w, who, D.oil)
    await L.press(w, T('bid-more')); await L.press(w, T('bid-oil'), q('s12-grant'))
    await L.shot(w, `s12-award-panel-${tg}`)
    const panel = await L.vis(P, T('oil-why'))
    if (panel) {
      await P.locator(T('oil-why')).fill('Walk: worked the weekend'); await P.locator(T('oil-given-by')).fill('OC')
      if (await L.vis(P, T('oil-days'))) await P.locator(T('oil-days')).fill('1')
      await L.press(w, T('oil-give')); await P.waitForTimeout(500)
    }
    const c1 = await cell(w, who, D.oil)
    await L.openCellR(w, who, D.oil)
    const dump = await L.sheetDump(P)
    let label = null
    if (await L.vis(P, T('bid-more'))) { await L.press(w, T('bid-more')); label = await L.txt(P, T('bid-oil')) }
    await L.shot(w, `s12-reopened-${tg}`)
    L.rec('S12 Grant OIL from the ⋯: panel opens, FO lands; reopened, the ⋯ names the award', w.tag, panel && /FO/.test(c1) && /FO/.test(label || '') ? 'PASS' : 'FAIL', `panel ${panel}; cell ${c1}; window ${dump?.id}; ⋯ item "${label}"`, [`s12-award-panel-${tg}`, `s12-reopened-${tg}`])
    await L.closeAny(w)
  })

  /* S13 — Pick a range: the calendar; a range picked; picked back to the day tapped = the one day again ("Pick a range") */
  await sc('S13', async () => {
    await L.openCellR(w, who, D.rng)
    await L.press(w, T('span-range'), q('s13-range'))
    await L.shot(w, `s13-cal-${tg}`)
    const end = '2026-11-18'
    await L.press(w, T(`span-day-${end}`)); await P.waitForTimeout(300)
    const chip1 = await L.txt(P, T('span-range')), line1 = await L.dayline(P)
    await L.shot(w, `s13-range-${tg}`)
    await L.press(w, T('span-range')); await P.waitForTimeout(250)
    if (await L.vis(P, T(`span-day-${D.rng}`))) { await L.press(w, T(`span-day-${D.rng}`)); await P.waitForTimeout(150); await L.press(w, T(`span-day-${D.rng}`)); await P.waitForTimeout(300) }
    const chip2 = await L.txt(P, T('span-range'))
    await L.shot(w, `s13-back-${tg}`)
    L.rec('S13 a range picked reads on its chip; picked back to the day tapped the chip reads "Pick a range" again', w.tag, /16/.test(chip1 || '') && /18/.test(chip1 || '') && chip2 === 'Pick a range' ? 'PASS' : 'FAIL',
      `range chip "${chip1}", day line "${line1}"; back: "${chip2}"`, [`s13-cal-${tg}`, `s13-range-${tg}`, `s13-back-${tg}`])
    await L.closeAny(w)
  })

  /* S14 — the switch remembered (D1302): off → next window off → the drag window off → after a reload off; then on again */
  await sc('S14', async () => {
    await L.openCellR(w, who, D.empty); await setSwitch(w, false); await closeX(w)
    await L.openCellR(w, who, D.long); const a = await P.locator(T('bid-approve-tick')).getAttribute('aria-checked'); await closeX(w)
    await P.reload(); await P.waitForSelector('#luser, #vWeek .day', { timeout: 20000 })
    if (await L.vis(P, '#luser')) { await P.fill('#luser', 'ad'); await P.fill('#lpass', 'a'); await P.click('#loginForm button[type=submit]'); await P.waitForSelector('#vWeek .day') }
    await P.evaluate(() => window.go('leavewar')); await P.waitForSelector(`[data-testid="row-${who}"]`); await P.waitForTimeout(800)
    await L.openCellR(w, who, D.empty); const b = await P.locator(T('bid-approve-tick')).getAttribute('aria-checked')
    await setSwitch(w, true); await closeX(w)
    L.rec('S14 the switch left off stays off in the next window and after a reload; turned on again', w.tag, a === 'false' && b === 'false' ? 'PASS' : 'FAIL', `next window ${a}; after reload ${b}`, [])
  })

  /* S15 — the drag window, one person over three days with a bid in the middle (d-select-proposed) */
  await sc('S15', async () => {
    const d1 = D.drag, d2 = '2026-11-24', d3 = '2026-11-25'
    await L.openCellR(w, who, d2); await setSwitch(w, false); await L.placeLeave(w, 'LL'); await L.openCellR(w, who, d1); await setSwitch(w, true); await closeX(w)
    await L.reachCell(w, who, d3)
    const c1 = await L.centre(P, T(L.cellId(who, d1))); const b3 = await P.locator(T(L.cellId(who, d3))).boundingBox(); const c3 = { x: b3.x + b3.width / 2, y: b3.y + b3.height / 2 }
    if (w.phone) await L.holdDrag(w, [0, .25, .5, .75, 1].map(t => ({ x: Math.round(c1.x + (c3.x - c1.x) * t), y: Math.round(c1.y) })), 420)
    else { await P.mouse.move(c1.x, c1.y); await P.mouse.down(); await P.mouse.move((c1.x + c3.x) / 2, c1.y, { steps: 4 }); await P.mouse.move(c3.x, c3.y, { steps: 4 }); await P.mouse.up(); await P.waitForTimeout(500) }
    await L.shot(w, `s15-drag-${tg}`)
    const g = await measure(w, T('select-sheet'), 'drag', 'S15')
    const title = await L.txt(P, '[data-testid="select-sheet"] .bidsheet-hd')
    const more = await L.vis(P, T('sel-more')) ? await P.evaluate(() => { const m = document.querySelector('[data-testid="sel-more"]').getBoundingClientRect(), c = document.querySelector('[data-testid="sel-CL"]').getBoundingClientRect(); return { dx: Math.round(m.left - c.left), dw: Math.round(m.width - c.width) } }) : null
    const acts = await P.evaluate(() => [...document.querySelectorAll('[data-testid="sel-actions"] > .dchip')].map(b => b.innerText.trim()))
    L.rec('S15 drag window, one man, three days with a bid: title short "23–25 Nov · 3 days"; Approve · Refuse · Move · Delete; the ⋯ under CL', w.tag, /23–25 Nov · 3 days/.test(title || '') && acts.length === 4 && more && Math.abs(more.dx) <= 1 && Math.abs(more.dw) <= 1 ? 'PASS' : 'FAIL',
      `title "${title}"; actions ${acts.join(' · ')}; ⋯ vs CL ${JSON.stringify(more)}`, [`s15-drag-${tg}`])
    await L.closeAny(w)
  })

  /* S16 — the drag window over two men: no words row (each man's paper is his own); what its ⋯ offers — RECORD */
  await sc('S16', async () => {
    const d1 = '2026-11-30', d2 = '2026-12-01'
    await L.reachCell(w, who, d1)
    const a = await L.centre(P, T(L.cellId(who, d1))); const bb = await P.locator(T(L.cellId(next, d2))).boundingBox(); const b = { x: bb.x + bb.width / 2, y: bb.y + bb.height / 2 }
    if (w.phone) await L.holdDrag(w, [0, .5, 1].map(t => ({ x: Math.round(a.x + (b.x - a.x) * t), y: Math.round(a.y + (b.y - a.y) * t) })), 420)
    else { await P.mouse.move(a.x, a.y); await P.mouse.down(); await P.mouse.move(b.x, b.y, { steps: 8 }); await P.mouse.up(); await P.waitForTimeout(500) }
    await L.shot(w, `s16-drag2-${tg}`)
    const g = await winRows(P, T('select-sheet'))
    const words = await L.vis(P, T('sel-rmk-row')), more = await L.vis(P, T('sel-more'))
    L.rec('S16 drag over two men: no Remarks row; RECORD the ⋯', w.tag, g && !words ? 'PASS' : 'FAIL', `words row ${words}; ⋯ ${more}; rows ${rowsSay(g)}`, [`s16-drag2-${tg}`])
    await L.closeAny(w)
  })

  /* S17 — the day's list of a day of two entries (D1315, D1327–D1330): an approved morning LL (the window) + an afternoon ATT B
     filed on the Inputs page with a remark; each entry led by its box; the leave's one row of actions, Approve lit; the ATT B read only */
  await sc('S17', async () => {
    await L.openCellR(w, who, D.two); await setSwitch(w, true); await L.press(w, T('portion-am')); await L.placeLeave(w, 'LL')
    const md = new Date(D.two + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
    await P.evaluate(([who, md]) => window.fileInput({ person: who, date: md, yr: 2026, type: 'ATT B', allday: false, half: 'pm', s: 721, e: 1439, remarks: 'Clinic review — no flying' }), [who, md])
    await P.waitForTimeout(600)
    await L.openCellR(w, who, D.two, q('s17-list'))
    await L.shot(w, `s17-list-${tg}`)
    const g = await winRows(P, T('daylist-sheet'))
    const li = await P.evaluate(() => [...document.querySelectorAll('[data-testid="daylist"] > li')].map(li => {
      const acts = li.querySelector('.dl-acts'); const bs = acts ? [...acts.querySelectorAll(':scope > button')] : []
      const tops = new Set(bs.map(b => Math.round(b.getBoundingClientRect().top / 8)))
      const ws = bs.map(b => Math.round(b.getBoundingClientRect().width))
      const broken = bs.filter(b => { const r = document.createRange(); r.selectNodeContents(b); const t = new Set([...r.getClientRects()].filter(q => q.width > 0).map(q => Math.round(q.top / 9))); return t.size > 1 }).map(b => b.innerText.trim())
      return { box: li.querySelector('.leg-box .c')?.className || null, main: li.querySelector('.dl-main')?.innerText, acts: bs.map(b => b.innerText.trim() + (b.classList.contains('lit') ? '(lit)' : '')), actLines: tops.size, widths: ws, broken, words: !!li.querySelector('textarea'), ro: li.querySelector('.dl-ro')?.innerText || null }
    }))
    const leave = li.find(x => /LL|k-ll/.test(x.box || '')), att = li.find(x => /att|med/.test(x.box || ''))
    const ok = leave && /Morning · approved/i.test(leave.main) && leave.acts.join() === 'Approve(lit),Refuse,⇄ Move,Delete'.replace('⇄ ', '⇄ ') || (leave && leave.acts.length === 4 && /Approve\(lit\)/.test(leave.acts[0]))
    L.rec('S17 two entries: each led by its box; the morning LL "Morning · approved", one row Approve(lit) · Refuse · Move · Delete, its Remarks; the ATT B "Afternoon · change it on the Inputs page", its remark read only', w.tag,
      ok && leave.actLines === 1 && !leave.broken.length && leave.words && att && /change it on the Inputs page/i.test(att.main || '') && /Clinic review/.test(att.ro || '') ? 'PASS' : 'FAIL', JSON.stringify(li), [`s17-list-${tg}`])
    /* the lit Approve in the list sends the leave back (D1330) */
    const apId = await P.evaluate(() => document.querySelector('[data-testid^="dl-approve-"].lit')?.dataset.testid)
    if (apId) { await L.press(w, T(apId), q('s17-sendback')); await P.waitForTimeout(400) }
    await L.shot(w, `s17-sentback-${tg}`)
    const after = await P.evaluate(() => [...document.querySelectorAll('[data-testid="daylist"] > li .dl-main')].map(e => e.innerText))
    L.rec('S17b the list\'s lit Approve tapped: the morning leave back to waiting', w.tag, after.some(t => /pending/i.test(t)) ? 'PASS' : 'FAIL', `lines now: ${after.join(' | ')}; window open ${await L.vis(P, T('daylist-sheet'))}`, [`s17-sentback-${tg}`])
    /* S18 — a remark typed on the pending bid in the list, the list closed by ✕: kept */
    const ta = await P.evaluate(() => document.querySelector('[data-testid="daylist"] textarea')?.dataset.testid)
    if (ta) {
      await typeInto(w, ta, 'List remark')
      await closeX(w, 'daylist-close')
      await L.openCellR(w, who, D.two)
      const v = await P.evaluate(() => [...document.querySelectorAll('[data-testid="daylist"] textarea')].map(t => t.value))
      L.rec('S18 a remark typed on the list\'s pending bid, the list closed by ✕: kept', w.tag, v.includes('List remark') ? 'PASS' : 'FAIL', `boxes now ${JSON.stringify(v)}`, [])
    } else L.rec('S18 a remark typed on the list\'s pending bid', w.tag, 'NOT WALKED', 'no remarks box on the list after the send-back', [])
    await L.closeAny(w)
  })

  /* S19 — a long remark wraps and the box grows (D1333); the window grows with it, its foot on the screen */
  await sc('S19', async () => {
    await L.openCellR(w, who, D.long)
    const h0 = (await winRows(P, T('bid-picker'))).win.h
    await typeInto(w, 'bid-remarks', 'A long remark for the walk: the member has not yet sent the approval from the leave app, and asks for the afternoon to be kept free for the move')
    await P.waitForTimeout(250)
    const t = await P.evaluate(() => { const e = document.querySelector('[data-testid="bid-remarks"]'); const s = document.querySelector('[data-testid="bid-picker"]').getBoundingClientRect(); return { h: Math.round(e.getBoundingClientRect().height), sh: e.scrollHeight, ch: e.clientHeight, winH: Math.round(s.height), winBottom: Math.round(s.bottom), vh: innerHeight } })
    await L.shot(w, `s19-long-${tg}`)
    L.rec('S19 a long remark: the box grows to show it all (no hidden words), the window grows, its foot on the screen', w.tag, t.h > 40 && t.sh <= t.ch + 2 && t.winH > h0 && t.winBottom <= t.vh ? 'PASS' : 'FAIL', `${JSON.stringify(t)}; window before ${h0}`, [`s19-long-${tg}`])
    await closeX(w)
  })

  /* S22/S23 — §7.11 lesson 4: with the one-day window open, a press on the grid behind it — what happens (RECORD) */
  await sc('S23', async () => {
    await L.openCellR(w, who, D.empty)
    const other = await P.evaluate(([who]) => { const td = [...document.querySelectorAll(`[data-testid^="cell-${who}-2026-11-0"]`)].map(e => ({ id: e.dataset.testid, r: e.getBoundingClientRect() })).find(x => x.r.bottom < document.querySelector('[data-testid="bid-picker"]').getBoundingClientRect().top - 4 && x.r.top > 120 && x.r.left > 60); return td ? { id: td.id, x: td.r.left + td.r.width / 2, y: td.r.top + td.r.height / 2 } : null }, [who])
    if (other) { if (w.phone) await L.finger(w, other.x, other.y, 0, `s23-behind-${tg}-q`); else { await P.mouse.click(other.x, other.y); await P.waitForTimeout(400) } }
    await L.shot(w, `s23-behind-${tg}`)
    const now = await P.evaluate(() => ({ win: !!document.querySelector('[data-testid="bid-picker"]'), title: document.querySelector('.bidsheet .bidsheet-hd')?.innerText.replace(/\s+/g, ' ') }))
    L.rec('S23 lesson 4: a press on the grid behind the open one-day window — RECORD what lights and what the window says', w.tag, 'RECORD', `pressed ${other?.id}; ${JSON.stringify(now)}`, [`s23-behind-${tg}`])
    await L.closeAny(w)
  })

  /* ---- the scenario designer's (docs/handpass/parts/lw-r3/scenarios.md) ---- */
  /* X15 (its S15) — words typed on a held bid, then Approve pressed without leaving the box: the words ride onto the leave */
  await sc('X15', async () => {
    const d = '2026-11-26'
    await L.openCellR(w, who, d); await setSwitch(w, false); await L.placeLeave(w, 'LL')
    await L.openCellR(w, who, d)
    await typeInto(w, 'bid-remarks', 'Typed then approved')
    await L.press(w, T('decide-approve'), q('x15-approve')); await P.waitForTimeout(500)
    const stored = await leaveRemark(P, who, d)
    await L.openCellR(w, who, d)
    const v = await valueOf(P, 'bid-remarks')
    await L.shot(w, `x15-after-${tg}`)
    L.rec('X15 words typed on a pending bid, then Approve (the box not left): the words on the approved leave', w.tag, v === 'Typed then approved' && stored?.remarks === 'Typed then approved' ? 'PASS' : 'FAIL', `reopened box "${v}"; the saved leave ${JSON.stringify(stored)}`, [`x15-after-${tg}`])
    /* the same with Refuse, on a fresh pending bid */
    await setSwitch(w, false); await closeX(w)
    const d2 = '2026-11-27'
    await L.openCellR(w, who, d2); await L.placeLeave(w, 'LL')
    await L.openCellR(w, who, d2); await typeInto(w, 'bid-remarks', 'Typed then refused')
    await L.press(w, T('decide-refuse')); await P.waitForTimeout(500)
    await L.openCellR(w, who, d2); const v2 = await valueOf(P, 'bid-remarks')
    L.rec('X15b words typed, then Refuse (the box not left): the words on the refused bid', w.tag, v2 === 'Typed then refused' ? 'PASS' : 'FAIL', `reopened box "${v2}"`, [])
    await closeX(w)
  })

  /* X3 (its S3) — two documents with long names on a pending bid: the Remarks box stays usable, the row inside the window */
  await sc('X3', async () => {
    const d = D.pend
    await L.openCellR(w, who, d)
    for (const n of ['approval-from-the-leave-app-for-november-local-leave.pdf', 'second-scan-of-the-signed-form-for-the-squadron.pdf']) {
      await P.locator('[data-testid="bid-doc-row"] input[type=file]').first().setInputFiles(L.pdfPath(n)); await P.waitForTimeout(600)
    }
    await L.shot(w, `x3-docs-${tg}`)
    const g = await winRows(P, T('bid-picker'))
    const m = await P.evaluate(() => { const t = document.querySelector('[data-testid="bid-remarks"]').getBoundingClientRect(), row = document.querySelector('[data-testid="bid-rmk-row"]'), s = document.querySelector('[data-testid="bid-picker"]'); const rr = row.getBoundingClientRect(), sr = s.getBoundingClientRect(); return { boxW: Math.round(t.width), rowRight: Math.round(rr.right), winRight: Math.round(sr.right), overX: row.scrollWidth - row.clientWidth, pageX: document.documentElement.scrollWidth - innerWidth } })
    L.rec('X3 two long-named documents: the box keeps a usable width, the row inside the window, no sideways scroll', w.tag, m.boxW >= 120 && m.rowRight <= m.winRight && m.overX <= 0 && m.pageX <= 0 ? 'PASS' : 'FAIL', `${JSON.stringify(m)}; rows ${rowsSay(g)}`, [`x3-docs-${tg}`])
    await closeX(w)
  })

  /* X6 (its S6) — a pending run of three days with an award on the middle one: the day's list's till date is the run's last */
  await sc('X6', async () => {
    const a = '2026-12-07', mid = '2026-12-08', z = '2026-12-09'
    await L.openCellR(w, who, a); await setSwitch(w, false)
    await L.press(w, T('span-range')); await L.press(w, T(`span-day-${z}`)); await P.waitForTimeout(250)
    await L.placeLeave(w, 'LL')
    await L.openCellR(w, who, mid); await L.press(w, T('bid-more')); await L.press(w, T('bid-oil'))
    await P.locator(T('oil-why')).fill('Walk: half a day'); await P.locator(T('oil-given-by')).fill('OC')
    if (await L.vis(P, T('oil-days'))) await P.locator(T('oil-days')).fill('0.5')
    await L.press(w, T('oil-give')); await P.waitForTimeout(500); await L.closeAny(w)
    await L.openCellR(w, who, mid)
    await L.shot(w, `x6-list-${tg}`)
    const tills = await P.evaluate(() => [...document.querySelectorAll('[data-testid$="-tilldate"]')].map(e => e.innerText))
    const oneDay = await (async () => { await L.closeAny(w); await L.openCellR(w, who, a); const t = await L.txt(P, T('bid-tilldate')); return t })()
    L.rec('X6 a pending run 7–9 Dec with an award on the 8th: the list\'s till date reads the run\'s last day, as the window on the 7th does', w.tag, tills.some(t => /9 Dec/.test(t)) && /9 Dec/.test(oneDay || '') ? 'PASS' : 'FAIL', `list tills ${JSON.stringify(tills)}; the window on the 7th "${oneDay}"`, [`x6-list-${tg}`])
    await L.closeAny(w)
  })

  /* X9 (its S9) — the ⋯ menu open, a tap on a leave button just outside it: RECORD whether the tap also places a leave */
  await sc('X9', async () => {
    const d = '2026-11-03'
    await L.openCellR(w, who, '2026-12-03')
    const before = await fillOf(w, who, '2026-12-03')
    await L.press(w, T('bid-more'))
    await L.press(w, T('bid-LL'), q('x9-outside'))
    await P.waitForTimeout(400)
    const after = await fillOf(w, who, '2026-12-03'), menu = await L.vis(P, T('bid-more-menu')), win = await L.vis(P, T('bid-picker'))
    await L.shot(w, `x9-after-${tg}`)
    L.rec('X9 the menu open, LL tapped beside it: RECORD — did the tap only close the menu, or also place LL?', w.tag, 'RECORD', `cell before "${before}" after "${after}"; menu open ${menu}; window open ${win}`, [`x9-after-${tg}`])
    await L.closeAny(w)
  })

  /* X14 (its S14) — a refused bid (the admin): what names it; words typed, then LL tapped — RECORD where the words go */
  await sc('X14', async () => {
    await L.openCellR(w, who, D.ref)
    const say = await L.sheetDump(P)
    await typeInto(w, 'bid-remarks', 'Words on the refused day')
    await setSwitch(w, false)
    await L.press(w, T('bid-LL')); await P.waitForTimeout(500)
    if (await L.vis(P, T('bid-picker'))) { await L.press(w, T('bid-LL')); await P.waitForTimeout(500) }
    const cellNow = await cell(w, who, D.ref)
    await L.openCellR(w, who, D.ref)
    await L.shot(w, `x14-after-${tg}`)
    const dump = await L.sheetDump(P)
    L.rec('X14 the refused day: RECORD what names it, and where words typed before a new LL land', w.tag, 'RECORD', `window before: ${say?.text?.slice(0, 160)}; cell after LL ${cellNow}; window after: ${dump?.id} ${dump?.text?.slice(0, 200)}`, [`x14-after-${tg}`])
    await L.closeAny(w)
  })

  /* X25 (its S25) / X8 (its S8) — a day of two war leaves, AM and PM, both approved: the list's rows; the lit Approve tapped twice
     at a person's speed (~150 ms) — RECORD the end state */
  await sc('X8', async () => {
    const d = '2026-12-14'
    await L.openCellR(w, who, d); await setSwitch(w, true); await L.press(w, T('portion-am')); await L.placeLeave(w, 'LL')
    await L.openCellR(w, who, d)
    const opened = (await L.sheetDump(P))?.id
    if (opened === 'bid-picker') { if (await L.vis(P, T('portion-pm'))) await L.press(w, T('portion-pm')); await L.placeLeave(w, 'PL') }
    await L.closeAny(w)
    await L.openCellR(w, who, d)
    await L.shot(w, `x8-list-${tg}`)
    const id = await P.evaluate(() => document.querySelector('[data-testid^="dl-approve-"].lit')?.dataset.testid)
    if (!id) { L.rec('X8 the lit Approve tapped twice quickly', w.tag, 'NOT WALKED', `the list did not open on two approved leaves (opened ${opened})`, [`x8-list-${tg}`]); await L.closeAny(w); return }
    const c = await L.centre(P, T(id))
    /* two taps ~150 ms apart, as a quick double tap is */
    if (w.cdp) { for (let i = 0; i < 2; i++) { await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: c.x, y: c.y, id: 1 }] }); await P.waitForTimeout(40); await w.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await P.waitForTimeout(110) } }
    else if (w.phone) { await P.touchscreen.tap(c.x, c.y); await P.waitForTimeout(150); await P.touchscreen.tap(c.x, c.y) }
    else { await P.mouse.click(c.x, c.y); await P.waitForTimeout(150); await P.mouse.click(c.x, c.y) }
    await P.waitForTimeout(500)
    await L.shot(w, `x8-after-${tg}`)
    const lines = await P.evaluate(() => [...document.querySelectorAll('[data-testid="daylist"] > li .dl-main')].map(e => e.innerText))
    L.rec('X8 the list\'s lit Approve tapped twice at a person\'s speed: RECORD the end state', w.tag, 'RECORD', `lines: ${lines.join(' | ')}; cell ${await cell(w, who, d)}`, [`x8-list-${tg}`, `x8-after-${tg}`])
    await L.closeAny(w)
  })

  /* S20 / S21 — a member (Ranger, his own row, months opened by the admin through the window): his empty open day — no switch,
     no ⋯; his pending bid — Move and Delete only; a day before today — the closed-day window as it was */
  await sc('S20', async () => {
    const me = ids.Ranger
    await P.evaluate(() => window.scrollTo(0, 0))
    await L.press(w, T('open-chip')); await P.waitForTimeout(500)
    for (const k of ['2026-11', '2026-12']) { const st = await P.locator(T(`od-month-${k}`)).getAttribute('data-state').catch(() => null); if (st && st !== 'open') { await L.press(w, T(`od-month-${k}`)); await P.waitForTimeout(250) } }
    await L.closeAny(w)
    /* as the admin, on Ranger's row: a refused LL (X1 — its S1) and an approved LL (his own approved leave, the readings) */
    const memR = '2026-11-19', memA = '2026-11-20'
    await L.openCellR(w, me, memR); await setSwitch(w, false); await L.placeLeave(w, 'LL')
    await L.openCellR(w, me, memR); await L.press(w, T('decide-refuse')); await P.waitForTimeout(400); await L.closeAny(w)
    await L.openCellR(w, me, memA); await setSwitch(w, true); await L.placeLeave(w, 'LL'); await L.closeAny(w)
    await P.evaluate(me => { window.raptorRole('member'); window.lwSetRole('member'); window.lwSetViewer && window.lwSetViewer(me) }, me)
    await P.waitForTimeout(500)
    await L.openCellR(w, me, D.mem, q('s20-member'))
    await L.shot(w, `s20-member-empty-${tg}`)
    const g = await measure(w, T('bid-picker'), 'member', 'S20')
    const sw = await L.vis(P, T('bid-approve-tick')), more = await L.vis(P, T('bid-more'))
    L.rec('S20 member, his empty open day: no switch, no ⋯ (none of the three is his)', w.tag, !sw && !more ? 'PASS' : 'FAIL', `switch ${sw}; ⋯ ${more}`, [`s20-member-empty-${tg}`])
    await L.placeLeave(w, 'LL')
    await L.openCellR(w, me, D.mem)
    await L.shot(w, `s20-member-pending-${tg}`)
    const acts = await P.evaluate(() => [...document.querySelectorAll('[data-testid="bid-actions"] > .dchip')].map(b => b.innerText.trim()))
    const ll = await lit(P, 'bid-LL')
    L.rec('S20b member, his pending bid: Move and Delete only, the LL lit, his words row', w.tag, acts.length === 2 && !acts.some(a => /Approve|Refuse/.test(a)) && ll?.lit && await L.vis(P, T('bid-remarks')) ? 'PASS' : 'FAIL', `actions ${acts.join(' · ')}; LL ${JSON.stringify(ll)}`, [`s20-member-pending-${tg}`])
    await L.closeAny(w)
    /* X1 — his own REFUSED bid: no leave lit (a refused bid holds no leave — leaveOn), Whole day lit */
    await L.openCellR(w, me, memR, q('x1-member-refused'))
    await L.shot(w, `x1-member-refused-${tg}`)
    const litNow = await P.evaluate(() => [...document.querySelectorAll('.bidsheet .tchip.lv.lit')].map(b => b.dataset.testid))
    const dumpR = await L.sheetDump(P)
    L.rec('X1 member, his own refused bid: no leave lit, as the admin’s window on it lights none', w.tag, dumpR?.id === 'bid-picker' ? (litNow.length === 0 ? 'PASS' : 'FAIL') : 'RECORD', `window ${dumpR?.id}; lit ${JSON.stringify(litNow)}; ${dumpR?.text?.slice(0, 160)}`, [`x1-member-refused-${tg}`])
    await L.closeAny(w)
    /* his own APPROVED leave: which window, what it offers (the readings to put to him — D1307, D1308, D1333) */
    await L.openCellR(w, me, memA, q('x4-member-approved'))
    await L.shot(w, `x4-member-approved-${tg}`)
    const dumpA = await L.sheetDump(P)
    const box = await P.evaluate(() => { const t = document.querySelector('.bidsheet textarea, .bidsheet input[type=text]'); if (!t) return null; const c = getComputedStyle(t); return { tag: t.tagName, bg: c.backgroundColor, font: c.fontFamily } })
    L.rec('X4 member, his own approved leave: RECORD which window and what its Remarks box is', w.tag, 'RECORD', `${dumpA?.id}: ${dumpA?.text?.slice(0, 200)}; box ${JSON.stringify(box)}`, [`x4-member-approved-${tg}`])
    await L.closeAny(w)
    /* a day before today: the closed-day window, unchanged */
    await L.openCellR(w, me, '2026-10-20')
    await L.shot(w, `s21-member-closed-${tg}`)
    const d = await L.sheetDump(P)
    L.rec('S21 member, a day before today: the closed-day window (RECORD — must not carry round 3\'s rows)', w.tag, 'RECORD', `${d?.id}: ${d?.text?.slice(0, 200)}`, [`s21-member-closed-${tg}`])
    await L.closeAny(w)
    await P.evaluate(() => { window.raptorRole('admin'); window.lwSetRole('admin') })
  })

  if (w.errs.length) L.rec('errors seen', w.tag, 'FAIL', w.errs.slice(0, 8).join(' || '), [])
  else L.rec('errors seen (console, page, 4xx)', w.tag, 'PASS', 'none', [])
  await w.ctx.close()
}
await L.closeBrowser()
writeFileSync(path.join(L.OUT, `results-${ENGINE}.json`), JSON.stringify(L.results, null, 1))
const n = v => L.results.filter(r => r.verdict === v).length
console.log(`DONE  PASS ${n('PASS')}  FAIL ${n('FAIL')}  RECORD ${n('RECORD')}  NOT WALKED ${n('NOT WALKED')}`)
