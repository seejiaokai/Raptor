// The small fixes of 30 Oct 26 — fix 4, the month guard: S4-1 (a joined bar across a month's edge) and S4-2 (words changed on
// part of a run). Desktop (his PC) by default; SIZE=phone for WebKit at 402. Run on the build BEFORE the fix (LW_OUT=…/before)
// and AFTER it (…/after): written as the right behaviour, so a FAIL before and a PASS after is the fault and its fix.
process.env.LW_OUT ||= '2026-10-30-lw-small-fixes/s4'
const L = await import('./lw-sf-lib.mjs')
const { T } = L
const SIZE = process.env.SIZE || 'desk'
console.log('[lw-sf-s4 v1]', SIZE)
L.clearOut()
const w = await L.newCtx(SIZE === 'phone' ? 'phone' : 'desk')
await L.signIn(w, 'admin')
const P = w.page
const R = 'bane'   // Ranger
const boxes = async iso => (await L.cellInfo(P, R, iso))?.boxes ?? []
const joinOf = async iso => { const b = (await boxes(iso))[0]; return b ? `${b.text}${b.jl ? ' jl' : ''}${b.jr ? ' jr' : ''}` : '(empty)' }
const edge = async () => ({ n28: await joinOf('2026-11-28'), n29: await joinOf('2026-11-29'), n30: await joinOf('2026-11-30'), d1: await joinOf('2026-12-01'), d2: await joinOf('2026-12-02'), d3: await joinOf('2026-12-03') })
const line = e => `29 Nov ${e.n29} | 30 Nov ${e.n30} | 1 Dec ${e.d1} | 2 Dec ${e.d2} | 3 Dec ${e.d3}`

/* ---- S4-1 (a): approved — a drag over 1–3 Dec, LL (Auto-approve on, the admin's default), then 30 Nov ---- */
await L.reachCell(w, R, '2026-12-01')
const opened = await L.dragCells(w, [R, '2026-12-01'], [R, '2026-12-03'])
if (!opened) throw new Error('the drag window did not open')
await L.autoApprove(w, true, 'sel')
await L.press(w, T('sel-LL')); await P.waitForTimeout(700)
if (await L.vis(P, T('select-sheet'))) { await L.press(w, T('sel-LL')); await P.waitForTimeout(700) }
let e = await edge()
console.log('   after 1–3 Dec LL:', line(e))
await L.rowShot(w, R, '2026-11-28', '2026-12-04', 's41-a1-dec-run')
L.rec('S4-1 premise', SIZE, e.d1.startsWith('LL') && e.d1.includes('jr') && !e.d1.includes('jl') && e.d2.includes('jl') ? 'PASS' : 'FAIL', `1–3 Dec one bar: ${line(e)}`, ['s41-a1-dec-run'])
await L.openCell(w, R, '2026-11-30')
await L.autoApprove(w, true)
const placed = await L.placeLeave(w, 'LL')
await P.waitForTimeout(600)
e = await edge()
console.log('   after 30 Nov LL:', line(e))
await L.rowShot(w, R, '2026-11-28', '2026-12-04', 's41-a2-after-30nov')
const okA = e.n30.includes('jr') && e.d1.includes('jl')
L.rec('S4-1 approved', SIZE, okA ? 'PASS' : 'FAIL', `placed ${placed}; one joined bar 30 Nov–3 Dec expected (30 Nov jr, 1 Dec jl): ${line(e)}`, ['s41-a2-after-30nov'])
/* the disproof: any bid of his in December makes December draw again */
await L.openCell(w, R, '2026-12-21'); await L.autoApprove(w, false); await L.placeLeave(w, 'LL'); await P.waitForTimeout(500)
const e2 = await edge()
await L.rowShot(w, R, '2026-11-28', '2026-12-04', 's41-a3-after-dec-bid')
L.rec('S4-1 heals on a December redraw', SIZE, 'RECORDED', `after a bid on 21 Dec: ${line(e2)}`, ['s41-a3-after-dec-bid'])
/* Undo the 21 Dec bid, then Undo the 30 Nov leave */
await L.undo(w); await L.undo(w)
const e3 = await edge()
await L.rowShot(w, R, '2026-11-28', '2026-12-04', 's41-a4-undo')
L.rec('S4-1 Undo', SIZE, e3.n30 === '(empty)' && !e3.d1.includes('jl') && e3.d1.startsWith('LL') ? 'PASS' : 'FAIL', `30 Nov empty, 1 Dec the bar's start: ${line(e3)}`, ['s41-a4-undo'])

/* ---- S4-1 (b): pending — Auto-approve off, a drag over 1–2 Dec on Echo's row... (another man, a fresh row) ---- */
const E = 'rocky'
const be = async iso => { const b = ((await L.cellInfo(P, E, iso))?.boxes ?? [])[0]; return b ? `${b.text}${b.jl ? ' jl' : ''}${b.jr ? ' jr' : ''}` : '(empty)' }
await L.dragCells(w, [E, '2026-12-01'], [E, '2026-12-02'])
await L.autoApprove(w, false, 'sel')
await L.press(w, T('sel-LL')); await P.waitForTimeout(700)
if (await L.vis(P, T('select-sheet'))) { await L.press(w, T('sel-LL')); await P.waitForTimeout(700) }
await L.openCell(w, E, '2026-11-30'); await L.autoApprove(w, false); await L.placeLeave(w, 'LL'); await P.waitForTimeout(500)
const pb = `30 Nov ${await be('2026-11-30')} | 1 Dec ${await be('2026-12-01')} | 2 Dec ${await be('2026-12-02')}`
await L.rowShot(w, E, '2026-11-28', '2026-12-04', 's41-b1-pending')
L.rec('S4-1 pending run', SIZE, /30 Nov LL.* jr/.test(pb) && /1 Dec LL jl/.test(pb) ? 'PASS' : 'FAIL', `pending bids with no words: one key — joined at 1 Dec expected: ${pb}`, ['s41-b1-pending'])
/* delete 30 Nov from that run */
await L.openCell(w, E, '2026-11-30')
const dayTapped = await L.vis(P, T('scope-day'))
if (dayTapped) await L.press(w, T('scope-day'))
await L.press(w, T('bid-clear')); await P.waitForTimeout(300)
if (await L.vis(P, T('bid-picker'))) { await L.press(w, T('bid-clear')); await P.waitForTimeout(500) }
await L.closeWin(w)
const pd = `30 Nov ${await be('2026-11-30')} | 1 Dec ${await be('2026-12-01')} | 2 Dec ${await be('2026-12-02')}`
await L.rowShot(w, E, '2026-11-28', '2026-12-04', 's41-b2-deleted-30nov')
L.rec('S4-1 delete 30 Nov', SIZE, /30 Nov \(empty\)/.test(pd) && /1 Dec LL jr/.test(pd) && !/1 Dec LL jl/.test(pd) ? 'PASS' : 'FAIL', `1 Dec the start, nothing joined to the left: ${pd} (day-tapped choice ${dayTapped})`, ['s41-b2-deleted-30nov'])

/* ---- S4-2 (a): two pending LL on 10 and 11 Nov with different words, then one remark typed over both ---- */
const D = 'divot'
const bd = async iso => { const b = ((await L.cellInfo(P, D, iso))?.boxes ?? [])[0]; return b ? `${b.text}${b.jl ? ' jl' : ''}${b.jr ? ' jr' : ''}` : '(empty)' }
for (const [iso, words] of [['2026-11-10', 'first'], ['2026-11-11', 'second']]) {
  await L.openCell(w, D, iso); await L.autoApprove(w, false)
  await L.placeLeave(w, 'LL'); await P.waitForTimeout(300)
  await L.openCell(w, D, iso)
  const box = P.locator(`${T('bid-picker')} textarea`).first()
  if (await box.count()) { await box.click(); await box.fill(words); await P.keyboard.press('Enter'); await P.waitForTimeout(300) }
  await L.closeWin(w)
}
const a0 = `10 Nov ${await bd('2026-11-10')} | 11 Nov ${await bd('2026-11-11')}`
await L.rowShot(w, D, '2026-11-09', '2026-11-12', 's42-a1-two-bids')
L.rec('S4-2 premise', SIZE, /10 Nov LL \| 11 Nov LL$/.test(a0) ? 'PASS' : 'FAIL', `two boxes, not joined: ${a0}`, ['s42-a1-two-bids'])
await L.dragCells(w, [D, '2026-11-10'], [D, '2026-11-11'])
const sbox = P.locator(`${T('select-sheet')} textarea`).first()
if (await sbox.count()) { await sbox.click(); await sbox.fill('one leave'); await P.keyboard.press('Enter'); await P.waitForTimeout(400) }
await L.closeWin(w)
await P.waitForTimeout(400)
const a1 = `10 Nov ${await bd('2026-11-10')} | 11 Nov ${await bd('2026-11-11')}`
await L.rowShot(w, D, '2026-11-09', '2026-11-12', 's42-a2-one-remark')
const aOk = /10 Nov LL jr/.test(a1) && /11 Nov LL jl/.test(a1)
await L.openApprovals(w)
const lines = (await L.apprLines(P)).filter(l => l.who === D)
await L.shot(w, 's42-a3-approvals')
L.rec('S4-2 (a) one remark over both', SIZE, aOk ? 'PASS' : 'FAIL', `ONE joined bar expected: ${a1}; Approvals lists ${lines.length} line(s) for him: ${lines.map(l => l.text.slice(0, 60)).join(' / ')}`, ['s42-a2-one-remark', 's42-a3-approvals'])
await L.openGrid(w)

console.log('errors:', w.errs.length ? w.errs : 'none')
L.writeResults('s4-' + SIZE)
await L.closeBrowser()
