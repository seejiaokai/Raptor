// Walker A, scenario 3 (admin, a member's empty day: tick on, buttons filled, LL -> approved box + an Input with lw; one Undo takes both back; Redo puts both back).
// usage: node lw-m3-walk-a3.mjs <desktop|phone> <chromium|webkit>
import * as L from './lw-m3-walk-a-lib.mjs'
const size = process.argv[2] || 'desktop', engine = process.argv[3] || 'chromium'
const tag = `s3-${size === 'phone' ? 'ph' : 'dk'}${engine === 'webkit' ? '-wk' : ''}`
console.log('lw-m3-walk-a3 v1', size, engine, tag)
const w = await L.newCtx(size, engine)
const P = w.page, ID = `3 ${size}/${engine}`
const ISO = '2026-02-24'
const scrollSig = () => P.evaluate(() => {
  const out = { win: [Math.round(scrollX), Math.round(scrollY)], els: [] }
  for (const e of document.querySelectorAll('#page-leavewar *')) if ((e.scrollLeft > 0 || e.scrollTop > 0) && (e.scrollWidth > e.clientWidth || e.scrollHeight > e.clientHeight)) out.els.push((e.className || e.tagName).toString().slice(0, 24) + '@' + Math.round(e.scrollLeft) + ',' + Math.round(e.scrollTop))
  return JSON.stringify(out)
})
const cellState = async () => { const b = await L.boxes(w, 'bane', ISO); return b && b.boxes.length ? b.boxes.map(x => x.split('|').slice(0, 2).join('|')).join(' + ') : 'none' }
const nInputs = async () => (await L.storedInputs(P)).length
await L.signInPlain(w, 'admin')
const n0 = await nInputs()
await L.openCellR(w, 'bane', ISO, w.phone ? tag + '-01-celltap-q' : null)
await P.waitForTimeout(300); await L.shot(w, tag + '-01-open')
const g = await L.winGeom(P)
const tick = g.tick.find(t => t.id === 'bid-approve-tick')
const looks = {}; for (const k of ['LL', 'OL', 'OIL', 'CCL', 'FCL', 'PL', 'EL', 'CL']) looks[k] = await L.btnLook(P, k)
const filled = Object.values(looks).every(l => l && l.bg !== 'rgba(0, 0, 0, 0)')
console.log('tick', JSON.stringify(tick), 'filled', filled, JSON.stringify(Object.fromEntries(Object.entries(looks).map(([k, v]) => [k, v.bg]))))
console.log('title bar boxes: tick', JSON.stringify(tick?.box), '✕', JSON.stringify(g.items['bid-cancel']), 'window', JSON.stringify(g.win))
const ov = tick && g.items['bid-cancel'] ? !(tick.box.r <= g.items['bid-cancel'].x || g.items['bid-cancel'].r <= tick.box.x) : null
L.rec(ID + ' a (tick on, buttons filled)', size, tick?.checked && filled ? 'PASS' : 'FAIL', `"Approve what I enter" ticked: ${tick?.checked}; all eight buttons filled: ${filled}; tick box ${JSON.stringify(tick?.box)} and ✕ ${JSON.stringify(g.items['bid-cancel'])} overlap: ${ov}`, [tag + '-01-open'])
await L.step(w, tag + '-02-ll1', L.T('bid-LL'))
let note = null
if (await L.vis(P, L.T('bid-picker'))) { note = (await L.winGeom(P)).text.match(/That takes[^|]*/)?.[0]; await L.step(w, tag + '-03-ll2', L.T('bid-LL')) }
await P.waitForTimeout(500)
await L.reachCell(w, 'bane', ISO)
await L.cellShot(w, 'bane', ISO, tag + '-04-cell-approved')
const c1 = await cellState()
const n1 = await nInputs()
const ins = (await L.storedInputs(P)).filter(i => i.v.lw && JSON.stringify(i.v).includes('bane') && i.v.date === 'Feb 24')
console.log('after LL: note', note, '| cell', c1, '| inputs', n0, '->', n1, '| lw inputs', JSON.stringify(ins.map(i => i.v)))
L.rec(ID + ' b (LL -> approved box and an Input with lw)', size, /s-a/.test(c1) && n1 === n0 + 1 && ins.length === 1 ? 'PASS' : 'FAIL', `below-zero note "${note}"; cell ${c1}; stored inputs ${n0} -> ${n1}; the new one carries lw="${ins[0]?.v.lw}" type ${ins[0]?.v.type} date ${ins[0]?.v.date}`, [tag + '-04-cell-approved'])
// the Inputs page shows it
await L.inputsList(w)
await L.shot(w, tag + '-05-inputs-after')
const rowTxt = (await L.inputsRows(P)).filter(r => /Ranger 24 Feb/.test(r))
console.log('inputs page rows:', rowTxt)
// back to the war, bring the day into view, take the baseline, Undo
await P.evaluate(() => window.go('leavewar')); await P.waitForTimeout(900)
await L.reachCell(w, 'bane', ISO)
await L.cellShot(w, 'bane', ISO, tag + '-06-before-undo')
await P.waitForTimeout(300)
const sigB = await scrollSig()
await L.step(w, tag + '-07-undo', '#undoBtn'); await P.waitForTimeout(500)
const sigU = await scrollSig()
const c2 = await cellState(), n2 = await nInputs()
await L.shot(w, tag + '-08-after-undo')
console.log('undo: cell', c2, 'inputs', n2, 'scroll before', sigB, 'after', sigU)
L.rec(ID + ' c (one Undo takes back the leave AND the bid; grid where it was)', size, c2 === 'none' && n2 === n0 && sigB === sigU ? 'PASS' : 'FAIL', `after one Undo: cell ${c2}; stored inputs ${n2} (was ${n0} before the bid); scroll position before ${sigB} after ${sigU}`, [tag + '-07-undo-q', tag + '-08-after-undo'])
await L.step(w, tag + '-09-redo', '#redoBtn'); await P.waitForTimeout(500)
const sigR = await scrollSig()
const c3 = await cellState(), n3 = await nInputs()
await L.reachCell(w, 'bane', ISO); await L.cellShot(w, 'bane', ISO, tag + '-10-after-redo')
const ins3 = (await L.storedInputs(P)).filter(i => i.v.lw && i.v.date === 'Feb 24')
console.log('redo: cell', c3, 'inputs', n3, 'lw', ins3.length, 'scroll', sigR)
L.rec(ID + ' d (Redo puts both back)', size, /s-a/.test(c3) && n3 === n0 + 1 && ins3.length === 1 ? 'PASS' : 'FAIL', `after Redo: cell ${c3}; stored inputs ${n3}; lw input present: ${ins3.length === 1}; scroll ${sigR}`, [tag + '-09-redo', tag + '-10-after-redo'])
console.log('ERRORS', JSON.stringify(w.errs))
await L.closeBrowser()
