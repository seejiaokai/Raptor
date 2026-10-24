// Walker A, scenarios 4 (admin unticks, places LL -> pending; closes and reopens -> ticked again) and 7 (below zero: tap again; ticked -> approved).
// usage: node lw-m3-walk-a4.mjs <desktop|phone> <chromium|webkit>
import * as L from './lw-m3-walk-a-lib.mjs'
const size = process.argv[2] || 'desktop', engine = process.argv[3] || 'chromium'
const tag = `s4-${size === 'phone' ? 'ph' : 'dk'}${engine === 'webkit' ? '-wk' : ''}`
console.log('lw-m3-walk-a4 v1', size, engine, tag)
const w = await L.newCtx(size, engine)
const P = w.page, ID = `4 ${size}/${engine}`
const tickState = async () => { const g = await L.winGeom(P); const t = g?.tick.find(x => x.id === 'bid-approve-tick'); return t ? t.checked : null }
let tickFault = []
/* press the tick as a person does; where the press changes nothing, note it and use the keyboard (Space) so the rest of the scenario can be walked */
async function toggleTick(label) {
  const before = await tickState()
  await L.step(w, label, L.T('bid-approve-tick'))
  let after = await tickState()
  if (after === before) {
    tickFault.push(`${label}: press left it ${after}`)
    await P.locator('[data-testid="bid-approve-tick"]').focus(); await P.keyboard.press('Space'); await P.waitForTimeout(300)
    after = await tickState()
  }
  return after
}
const anyHollow = async () => { const o = {}; for (const k of ['LL', 'OL', 'CL']) o[k] = (await L.btnLook(P, k))?.bg; return o }
const cellState = async (who, iso) => { const b = await L.boxes(w, who, iso); return b && b.boxes.length ? b.boxes.map(x => x.split('|').slice(0, 2).join('|')).join(' + ') : 'none' }
await L.signInPlain(w, 'admin')
const n0 = (await L.storedInputs(P)).length
// ---- scenario 4
await L.openCellR(w, 'bane', '2026-02-24')
const t0 = await tickState()
const t1 = await toggleTick(tag + '-01-untick'); const bg1 = await anyHollow()
await L.shot(w, tag + '-02-unticked')
console.log('tick on open', t0, 'after pressing it', t1, 'buttons', JSON.stringify(bg1))
L.rec(ID + ' a (untick: buttons go hollow)', size, t0 === true && t1 === false && Object.values(bg1).every(v => v === 'rgba(0, 0, 0, 0)') ? 'PASS' : 'FAIL', `ticked on open: ${t0}; after the press (${tickFault.length ? 'THE PRESS DID NOTHING, Space key used instead' : 'press worked'}): ${t1}; leave buttons' fill ${JSON.stringify(bg1)}`, [tag + '-01-untick-q', tag + '-02-unticked'])
await L.step(w, tag + '-03-ll1', L.T('bid-LL'))
if (await L.vis(P, L.T('bid-picker'))) await L.step(w, tag + '-04-ll2', L.T('bid-LL'))
await P.waitForTimeout(500)
await L.reachCell(w, 'bane', '2026-02-24'); await L.cellShot(w, 'bane', '2026-02-24', tag + '-05-cell')
const c1 = await cellState('bane', '2026-02-24'), n1 = (await L.storedInputs(P)).length
L.rec(ID + ' b (unticked LL -> pending, no Input)', size, /s-w/.test(c1) && n1 === n0 ? 'PASS' : 'FAIL', `cell ${c1}; stored inputs ${n0} -> ${n1}`, [tag + '-05-cell'])
// close and reopen: another empty day, untick, close with the cross, reopen
await L.openCellR(w, 'bane', '2026-02-26')
const u0 = await tickState()
const u1 = await toggleTick(tag + '-06-untick2')
await L.step(w, tag + '-06-cross', L.T('bid-cancel')); await P.waitForTimeout(300)
const closed = !(await L.vis(P, L.T('bid-picker')))
await L.openCellR(w, 'bane', '2026-02-26')
const u2 = await tickState()
await L.shot(w, tag + '-07-reopened')
L.rec(ID + ' c (close and reopen -> ticked again)', size, u0 === true && u1 === false && closed && u2 === true ? 'PASS' : 'FAIL', `first open ticked ${u0}; unticked ${u1}; closed with ✕: ${closed}; reopened ticked ${u2}`, [tag + '-06-cross-q', tag + '-07-reopened'])
await L.closeWinIfOpen(w)
// ---- scenario 7: below zero. Anvil ('shaft'): ticked, LL on 2 Mar
const iso7 = '2026-03-02'
await L.reachCell(w, 'shaft', iso7)
const lve = await L.txt(P, L.T('bal-shaft'))
console.log('Anvil LVE cell reads:', lve)
await L.openCellR(w, 'shaft', iso7, w.phone ? tag + '-10-celltap-q' : null)
const tk = await tickState()
await L.step(w, tag + '-11-anvil-ll1', L.T('bid-LL'))
const open1 = await L.vis(P, L.T('bid-picker'))
const note = open1 ? (await L.winGeom(P)).text.match(/That takes[^|]*/)?.[0] : null
const cellBetween = await cellState('shaft', iso7)
if (open1) await L.step(w, tag + '-12-anvil-ll2', L.T('bid-LL'))
await P.waitForTimeout(500)
await L.reachCell(w, 'shaft', iso7); await L.cellShot(w, 'shaft', iso7, tag + '-13-anvil-cell')
const c7 = await cellState('shaft', iso7)
L.rec(`7 ${size}/${engine} (below zero: tap again; ticked -> approved)`, size, open1 && /tap the same leave again/i.test(note || '') && cellBetween === 'none' && /s-a/.test(c7) ? 'PASS' : 'FAIL', `Anvil's LVE reads ${lve} here (the list says -1.5: not so in this demo); tick ${tk}; tap 1 kept the window open with "${note}" and placed nothing (${cellBetween}); tap 2 -> ${c7}`, [tag + '-11-anvil-ll1-q', tag + '-11-anvil-ll1', tag + '-12-anvil-ll2-q', tag + '-13-anvil-cell'])
console.log('TICK PRESS FAULTS:', JSON.stringify(tickFault))
console.log('ERRORS', JSON.stringify(w.errs))
await L.closeBrowser()
