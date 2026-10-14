/* THE HOST'S WALK OF THE SMALL OIL JOB — the un-cancel that waits on the OIL question (owner D816; `[OIL-UNCANCEL-UNASKED]`;
   the sheet docs/handpass/2026-10-14-oil-uncancel-load.md; the scenarios docs/superpowers/briefs/2026-10-14-oil-uncancel-load-scenarios.md).
   Assertions of the RIGHT behaviour on the built app, with pictures; a PASS means correct, so a re-run IS the re-walk.
   The fixture is made by the app's own controls — the designer's S15: an input filed on a working day, cancelled on the
   Scheduler Board, its date moved to Saturday in its own window while cancelled (no question: D814), then the cancel
   taken off on Saturday's board.
     U1 the question in the un-cancel's own words, nothing changed behind it (S5, S6)
     U2 not answered: the bar, on one line, at this size and at 320 wide (S6, S7)
     U3 "Answer OIL" → Yes → "Un-cancel": brought back with its answer, "Restored" (S5)
     U4 one Undo: cancelled again, its reason kept, the answer gone; Redo: back, no question (S8)
     U5 published: the Leave War's Saturday cell for him (the real downstream number)
     U6 the information-only mark the same way, in its own words (S1)
   usage: DL_BASE=http://localhost:4174 DL_SHOTS=docs/img/handpass/2026-10-14-oil-uncancel-load node scripts/handpass/ou-walk.mjs [phone|desk] */
import { L, inputsCal, openAdd, fillForm, rowOut, part } from './tb/w3/lib.mjs'
import { publish, lwCell } from './lib.mjs'

const SIZE = process.argv[2] === 'desk' ? 'desk' : 'phone', T = SIZE
const SAT = 5, WED = 2, SAT_ISO = '2026-07-18'
const w = await L.world(SIZE), p = w.page
const noteNow = () => p.evaluate(() => { const t = document.getElementById('toastEl'); return t && +getComputedStyle(t).opacity > 0.5 ? (t.textContent || '') : '' })
const rec = id => p.evaluate(id => { const r = window.INPUTS.find(x => String(x.iid) === id); return r ? { cx: !!r.cx, cxr: r.cxr || '', info: !!r.info, oil: r.oil || null, date: r.date } : null }, id)
const board = async di => {
  if (await p.evaluate(() => window.CURPAGE) !== 'editsched') await L.go(w, 'editsched')
  const open = await p.evaluate(() => { const b = document.querySelector('#schedBoard'); return !!b && !b.hidden })
  if (open) { await p.evaluate(() => document.querySelector('#sbDone').click()); await L.sleep(400) }
  await p.locator(`#eWeek [data-sbday="${di}"]`).first().evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.click() })
  await p.waitForSelector('#schedBoard .sb-sec', { state: 'attached' }); await L.sleep(600)
}
const rowBtn = async (di, id, attr) => {
  const sel = await p.evaluate(([di, id, attr]) => { const ri = window.DAYS[di].ground.findIndex(g => String(g.src) === id); return ri < 0 ? null : `#schedBoard [data-${attr}="${di}.${ri}"]` }, [di, id, attr])
  if (!sel) throw new Error(`the input's row is not on day ${di}'s Ground Programme`)
  await p.locator(sel).first().evaluate(e => { e.scrollIntoView({ block: 'center' }); e.click() })
  await L.sleep(350)
}
const sheet = () => p.evaluate(() => {
  const s = document.querySelector('[data-testid="oilconf"]'); if (!s) return null
  const t = sel => (s.querySelector(sel)?.textContent || '').replace(/\s+/g, ' ').trim()
  const save = s.querySelector('[data-testid="oilconf-save"]')
  return { head: t('.airpop-head b'), lead: t('[data-testid="oilconf-lead"]'), ask: t('[data-testid="oilconf-ask"]'), no: t('[data-testid="oilconf-cancel"]'), yes: t('[data-testid="oilconf-save"]'), yesDisabled: !!save && save.disabled }
})
const bar = () => p.evaluate(() => {
  const b = document.querySelector('[data-testid="oilbar"]'); if (!b) return null
  const r = b.getBoundingClientRect(), txt = b.querySelector('[data-testid="oilbar-text"]'), tr = txt.getBoundingClientRect()
  const lh = parseFloat(getComputedStyle(txt).lineHeight) || 16
  const btns = [...b.querySelectorAll('button')].map(x => { const q = x.getBoundingClientRect(); return { t: x.textContent.trim(), top: Math.round(q.top), right: Math.round(q.right) } })
  return { text: txt.textContent.trim(), h: Math.round(r.height), lines: Math.round(tr.height / lh), cut: txt.scrollWidth > txt.clientWidth + 1, btns, inside: btns.every(x => x.right <= innerWidth + 0.5), oneRow: btns.every(x => Math.abs(x.top - btns[0].top) < 3) }
})
/* an input filed on Wednesday, marked on the board, then moved to Saturday in its own window while marked */
async function fixture(who, title, mark) {
  await inputsCal(w, '2026-07-13')
  await openAdd(w, '2026-07-15')
  await fillForm(w, { type: 'Training', person: who, start: '09:00', end: '10:00', title })
  await w.press('#inpEditSave'); await L.sleep(900)
  const id = await p.evaluate(() => String(window.INPUTS[0].iid))
  const x = p.locator('[data-testid="win-inputsday-x"]'); if (await x.count()) await x.first().evaluate(e => e.click())
  await board(WED)
  if (mark === 'cx') { await rowBtn(WED, id, 'grcx'); await p.fill('#cxReason', 'WX'); await p.locator('#cxSave').evaluate(e => e.click()); await L.sleep(500) }
  else { await rowBtn(WED, id, 'grinfo'); await L.sleep(400) }
  const marked = await rec(id)
  await p.evaluate(() => document.querySelector('#sbDone').click()); await L.sleep(400)
  /* its date moved to Saturday, in its own window, while it wears the mark */
  await inputsCal(w, '2026-07-13')
  await p.locator('[data-icday="2026-07-15"]').focus(); await p.keyboard.press('Enter')
  await p.waitForSelector(`[data-testid="idy-row-${id}"]`)
  await w.press(`[data-testid="idy-row-${id}"] [data-testid="idy-open"]`)
  await p.waitForSelector('#inpEditPop #inpEdCal')
  await w.press('#inpEdCal [data-cal="2026-07-18"]'); await L.sleep(250)
  await w.press('#inpEditSave'); await L.sleep(900)
  const asked = !!(await p.locator('[data-testid="oilconf"]').count())
  const moved = await rec(id)
  const x2 = p.locator('[data-testid="win-inputsday-x"]'); if (await x2.count()) await x2.first().evaluate(e => e.click())
  return { id, marked, moved, asked }
}

try {
  let F = null
  await part(w, `U ${T}`, 'U0 the fixture: filed on a working day, cancelled, moved to Saturday while cancelled', 'cancelled with its reason; the move asks nothing (D814); no answer', async () => {
    F = await fixture('bane', 'Range brief', 'cx')
    rowOut(`U ${T}`, 'U0 the fixture: filed on a working day, cancelled, moved to Saturday while cancelled', 'cancelled with its reason; the move asks nothing (D814); no answer',
      `after the cancel ${JSON.stringify(F.marked)}; after the move ${JSON.stringify(F.moved)}; a question at the move: ${F.asked}`,
      F.marked.cx && F.marked.cxr === 'WX' && F.moved.cx && F.moved.date === 'Jul 18' && !F.moved.oil && !F.asked)
  })
  await part(w, `U ${T}`, 'U1 the cancel taken off on Saturday: the question first', 'the sheet in the un-cancel\'s words; "Un-cancel" waits for an answer; nothing changed', async () => {
    await board(SAT)
    await rowBtn(SAT, F.id, 'grcx')
    await p.waitForSelector('#cxPop:not([hidden]) #cxUn'); await L.pic(w, `U1a-cancel-sheet-${T}`)
    await p.locator('#cxUn').evaluate(e => e.click()); await L.sleep(500)
    const s = await sheet(), r = await rec(F.id), n = await noteNow()
    await L.pic(w, `U1-question-${T}`)
    rowOut(`U ${T}`, 'U1 the cancel taken off on Saturday: the question first', 'the sheet in the un-cancel\'s words; "Un-cancel" waits for an answer; nothing changed',
      `${JSON.stringify(s)}; the input ${JSON.stringify(r)}; note "${n}"`,
      !!s && /Un-cancelling .+ Range brief/.test(s.lead + ' ' + s.head) && s.no === 'Don’t un-cancel' && s.yes === 'Un-cancel' && s.yesDisabled && r.cx && r.cxr === 'WX' && !r.oil && !n)
  })
  await part(w, `U ${T}`, 'U2 not answered: the bar', '"Not un-cancelled — OIL not answered · Answer OIL · OK" on one line; still cancelled', async () => {
    await w.press('[data-testid="oilconf-cancel"]'); await L.sleep(500)
    const b = await bar(), r = await rec(F.id)
    await L.pic(w, `U2-bar-${T}`)
    let narrow = null
    if (w.phone) { await p.setViewportSize({ width: 320, height: 700 }); await L.sleep(400); narrow = await bar(); await L.pic(w, `U2-bar-320-${T}`); await p.setViewportSize({ width: w.S.w, height: w.S.h }); await L.sleep(300) }
    const ok1 = x => !!x && x.text === 'Not un-cancelled — OIL not answered' && x.lines === 1 && !x.cut && x.inside && x.oneRow && x.btns.length === 2
    rowOut(`U ${T}`, 'U2 not answered: the bar', '"Not un-cancelled — OIL not answered · Answer OIL · OK" on one line; still cancelled',
      `${JSON.stringify(b)}${narrow ? '; at 320 wide ' + JSON.stringify(narrow) : ''}; the input ${JSON.stringify(r)}`, ok1(b) && (!narrow || ok1(narrow)) && r.cx && !r.oil)
  })
  await part(w, `U ${T}`, 'U3 "Answer OIL", Yes, "Un-cancel"', 'brought back with its answer in one step; "Restored"', async () => {
    await w.press('[data-testid="oilbar-answer"]'); await L.sleep(450)
    const s0 = await sheet()
    await w.press('[data-testid="oil-yes"]'); await L.sleep(200)
    const s1 = await sheet()
    await w.press('[data-testid="oilconf-save"]'); await L.sleep(450)
    const n = await noteNow(), r = await rec(F.id), b = await bar()
    await L.pic(w, `U3-restored-${T}`)
    rowOut(`U ${T}`, 'U3 "Answer OIL", Yes, "Un-cancel"', 'brought back with its answer in one step; "Restored"',
      `the question again: ${!!s0}; "Un-cancel" live once Yes is picked: ${s1 && !s1.yesDisabled}; note "${n}"; the input ${JSON.stringify(r)}; the bar gone: ${!b}`,
      !!s0 && !!s1 && !s1.yesDisabled && n === 'Restored' && !r.cx && !r.cxr && !!r.oil && r.oil[SAT_ISO] === 0.5 && !b)
  })
  await part(w, `U ${T}`, 'U4 Undo, then Redo', 'one Undo: cancelled again, reason kept, the answer gone; Redo: back with its answer, no question', async () => {
    await L.sleep(3200)
    await p.evaluate(() => (document.querySelector('#sbUndo') || document.querySelector('#undoBtn')).click()); await L.sleep(600)
    const u = await rec(F.id)
    await p.evaluate(() => (document.querySelector('#sbRedo') || document.querySelector('#redoBtn')).click()); await L.sleep(600)
    const r = await rec(F.id), q = !!(await p.locator('[data-testid="oilconf"]').count())
    rowOut(`U ${T}`, 'U4 Undo, then Redo', 'one Undo: cancelled again, reason kept, the answer gone; Redo: back with its answer, no question',
      `after Undo ${JSON.stringify(u)}; after Redo ${JSON.stringify(r)}; a question at Redo: ${q}`, u.cx && u.cxr === 'WX' && !u.oil && !r.cx && !!r.oil && r.oil[SAT_ISO] === 0.5 && !q)
  })
  await part(w, `U ${T}`, 'U5 published: the Leave War\'s Saturday cell', 'after Saturday is published the man\'s cell for 18 Jul shows his HO', async () => {
    const pub = await publish(p, SAT)
    await L.sleep(800); await L.pic(w, `U5a-published-${T}`)
    await p.evaluate(() => { const d = document.querySelector('#sbDone'); if (d) d.click() }); await L.sleep(400)
    const cell = await lwCell(p, ['bane'], SAT_ISO)
    await L.pic(w, `U5-leavewar-${T}`)
    rowOut(`U ${T}`, 'U5 published: the Leave War\'s Saturday cell', 'after Saturday is published the man\'s cell for 18 Jul shows his HO',
      `publish ${JSON.stringify(pub)}; the cell ${JSON.stringify(cell)}`, pub.published && /HO/.test(JSON.stringify(cell)))
  })
  let G = null
  await part(w, `U ${T}`, 'U6 the information-only mark the same way', 'the question in its own words; left: "Not changed — OIL not answered"; answered: the mark off with its answer', async () => {
    G = await fixture('pike', 'Hangar brief', 'info')
    await board(SAT)
    await rowBtn(SAT, G.id, 'grinfo'); await L.sleep(300)
    const s = await sheet(), r0 = await rec(G.id)
    await L.pic(w, `U6-question-${T}`)
    await w.press('[data-testid="oilconf-cancel"]'); await L.sleep(450)
    const b = await bar(); await L.pic(w, `U6-bar-${T}`)
    await w.press('[data-testid="oilbar-answer"]'); await L.sleep(400)
    await w.press('[data-testid="oil-yes"]'); await L.sleep(150)
    await w.press('[data-testid="oilconf-save"]'); await L.sleep(450)
    const n = await noteNow(), r = await rec(G.id)
    rowOut(`U ${T}`, 'U6 the information-only mark the same way', 'the question in its own words; left: "Not changed — OIL not answered"; answered: the mark off with its answer',
      `the fixture: marked ${JSON.stringify(G.marked)}, moved ${JSON.stringify(G.moved)}, asked at the move ${G.asked}; the sheet ${JSON.stringify(s)}; before ${JSON.stringify(r0)}; the bar ${JSON.stringify(b)}; note "${n}"; after ${JSON.stringify(r)}`,
      !!s && s.no === 'Don’t change' && s.yes === 'Change' && r0.info && !!b && b.text === 'Not changed — OIL not answered' && b.lines === 1 && n === 'This item is checked against the rules again and can earn OIL' && !r.info && !!r.oil && r.oil[SAT_ISO] === 0.5)
  })
} finally { await L.close(w) }
