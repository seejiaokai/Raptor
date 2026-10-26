// Walker A, scenario 6: admin, ticked, drag-selection across three people -> all approved; one Undo takes all back.
// usage: node lw-m3-walk-a6.mjs <desktop|phone>   (chromium; the drag is a held touch drag on the phone)
import * as L from './lw-m3-walk-a-lib.mjs'
const size = process.argv[2] || 'desktop'
const tag = `s6-${size === 'phone' ? 'ph' : 'dk'}`
console.log('lw-m3-walk-a6 v1', size, tag)
const w = await L.newCtx(size)
const P = w.page, ID = `6 ${size}/chromium`
const who = ['dice', 'shaft', 'snap'], days = ['2026-02-25', '2026-02-26']
const cells = async () => { const o = {}; for (const p of who) for (const d of days) { const b = await L.boxes(w, p, d); o[p + d.slice(5)] = b && b.boxes.length ? b.boxes.map(x => x.split('|')[1]).join('+') : 'none' } return o }
await L.signInPlain(w, 'admin')
const n0 = (await L.storedInputs(P)).length
await L.reachCell(w, 'snap', days[1])
await P.locator(L.T(L.cellId('snap', days[1]))).evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await P.waitForTimeout(300)
const before = await cells()
console.log('before', JSON.stringify(before))
const bx = async (p, d) => { const b = await P.locator(L.T(L.cellId(p, d))).first().boundingBox(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 } }
const a = await bx('dice', days[0]), b = await bx('snap', days[1])
console.log('drag from', JSON.stringify(a), 'to', JSON.stringify(b))
if (w.phone) {
  const pts = [a]; for (let i = 1; i <= 6; i++) pts.push({ x: a.x + (b.x - a.x) * i / 6, y: a.y + (b.y - a.y) * i / 6 })
  await L.holdDrag(w, pts, 320)
} else {
  await P.mouse.move(a.x, a.y); await P.mouse.down(); await P.mouse.move(b.x, b.y, { steps: 10 }); await P.mouse.up()
  await P.waitForTimeout(500)
}
await P.waitForTimeout(500)
await L.shot(w, tag + '-01-selection')
const sh = await L.sheetDump(P)
const open = await L.vis(P, L.T('select-sheet'))
const tick = await P.evaluate(() => { const c = document.querySelector('[data-testid="sel-approve-tick"]'); return c ? c.checked : null })
console.log('sheet open', open, 'tick', tick, '|', sh?.text?.slice(0, 200))
L.rec(ID + ' a (drag-selection window opens over 3 people x 2 days, ticked)', size, open && tick === true && /Reaper, Anvil, Cinch/.test(sh.text) && /2 days/.test(sh.text) ? 'PASS' : 'FAIL', `window "${sh?.text?.slice(0, 90)}"; ticked ${tick}`, [tag + '-01-selection'])
await L.step(w, tag + '-02-ll1', L.T('sel-LL'))
let note = null
if (await L.vis(P, L.T('select-sheet'))) { note = (await L.sheetDump(P)).text.match(/That takes[^|]*/)?.[0]; console.log('after LL 1: still open; note', note); await L.shot(w, tag + '-02b-after-ll1'); await L.step(w, tag + '-03-ll2', L.T('sel-LL')) }
await P.waitForTimeout(600)
const stillOpen = await L.vis(P, L.T('select-sheet'))
await L.shot(w, tag + '-04-after')
const after = await cells(); const n1 = (await L.storedInputs(P)).length
const lw = (await L.storedInputs(P)).filter(i => i.v.lw && /Feb 2[56]/.test(i.v.date + ''))
console.log('after', JSON.stringify(after), 'inputs', n0, '->', n1, 'lw', lw.length, 'window still open', stillOpen, 'note', note)
const allApproved = Object.values(after).every(v => /s-a/.test(v))
L.rec(ID + ' b (LL: all six approved)', size, allApproved && !stillOpen ? 'PASS' : 'FAIL', `cells ${JSON.stringify(after)}; window still open ${stillOpen}; below-zero note "${note}"; stored inputs ${n0} -> ${n1}, of them lw: ${lw.length}`, [tag + '-04-after'])
await L.step(w, tag + '-05-undo', '#undoBtn'); await P.waitForTimeout(600)
const afterU = await cells(); const n2 = (await L.storedInputs(P)).length
await L.shot(w, tag + '-06-after-undo')
const toast = await P.evaluate(() => (document.body.innerText.match(/Undid[^\n]*/) || [''])[0])
L.rec(ID + ' c (one Undo takes all back)', size, Object.values(afterU).every(v => v === 'none') && n2 === n0 ? 'PASS' : 'FAIL', `after ONE Undo cells ${JSON.stringify(afterU)}; stored inputs ${n2} (start ${n0}); toast "${toast}"`, [tag + '-05-undo-q', tag + '-06-after-undo'])
await L.step(w, tag + '-07-redo', '#redoBtn'); await P.waitForTimeout(600)
const afterR = await cells(); const n3 = (await L.storedInputs(P)).length
L.rec(ID + ' d (Redo puts all back)', size, Object.values(afterR).every(v => /s-a/.test(v)) && n3 === n1 ? 'PASS' : 'FAIL', `after Redo cells ${JSON.stringify(afterR)}; stored inputs ${n3}`, [tag + '-07-redo'])
console.log('ERRORS', JSON.stringify(w.errs))
await L.closeBrowser()
