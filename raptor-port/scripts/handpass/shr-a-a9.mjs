// shr-a-a9 — share A, A9 (F-S5): `0800` typed over Ranger's row's 08:00, Tab. EXPECTED: nothing changes — one leave,
// both men, no Undo step. RECORD the Undo button's state. A second pass does the same on his END (`1000` over 10:00).
//   WR4_OUT=<dir> WR4_NEW=<build> SZ=desk ENG=chromium node scripts/handpass/shr-a-a9.mjs
import { L, J, add, done, world, openBoard, read, boxSel, typeIn, pic, away, fixture, note, TAG } from './shr-a-lib.mjs'
console.log('shr-a-a9 v1', TAG)
for (const [f, v] of [['str', '0800'], ['end', '1000']]) {
  const steps = [], pics = [], notes = [], id = `A9-${f}`
  try {
    const w = await world(); const p = w.page
    const iid = await fixture(w); await openBoard(w)
    steps.push(await read(p, 'filed'))
    const sel = await boxSel(p, 'Ranger', f)
    await typeIn(w, sel, v, 'Tab')
    notes.push(await note(p))
    steps.push(await read(p, `${v} typed over his ${f}, Tab — the box held the caret before: ${sel}`))
    pics.push(await pic(w, `${id}-after-tab`, ['#sbBoard > [data-secmove$=".unav"]', '#sbUndo']))
    await away(w)
    steps.push(await read(p, 'caret left'))
    pics.push(await pic(w, `${id}-caret-left`, ['#sbBoard > [data-secmove$=".unav"]', '#sbUndo']))
    const ok = steps.slice(1).every(s => s.store.length === 1 && /^LL Ranger\+Hex Jul 15 480-600 ""/.test(s.store[0]) && s.undo === steps[0].undo)
    add(id, ok ? 'PASS' : 'FAIL', { fixture: iid, steps, notes }, pics)
    add(id + '-undo', 'RECORDED', `Undo before: ${steps[0].undo}; after Tab: ${steps[1].undo}; after caret left: ${steps[2].undo}`)
    await w.ctx.close()
  } catch (e) { add(id, 'NOT WALKED', 'error: ' + e.message.split('\n')[0].slice(0, 400) + ' ' + J(steps).slice(0, 2000), pics) }
}
await done('a9')
