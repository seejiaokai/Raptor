// shr-a-a3 — share A, A3 (Astra S04): a time cleared, then Tab and Shift+Tab through his boxes untouched, then a new
// start. EXPECTED: a cleared time makes HIS leave all day, both boxes empty; untouched traversal saves nothing; Hex
// untouched ("clearing a time means all day"). Pass 1: start 0900, then his end cleared. Pass 2: his start cleared first.
// On the phone each Tab is a tap on the next box.
//   WR4_OUT=<dir> WR4_NEW=<build> SZ=desk|phone ENG=chromium|webkit node scripts/handpass/shr-a-a3.mjs
import { L, J, sleep, add, done, world, openBoard, read, boxSel, typeIn, pressAt, pic, away, fixture, note, TAG } from './shr-a-lib.mjs'
console.log('shr-a-a3 v1', TAG)
const hexOk = s => s.filter(x => /^LL Hex Jul 15 480-600 ""/.test(x)).length === 1
const ranger = s => s.filter(x => /^LL Ranger /.test(x))
for (const pass of (process.env.PASSES || '1,2,3').split(',').map(Number)) {
  const id = `A3-pass${pass}`, steps = [], pics = [], checks = [], notes = []
  const chk = (n, ok, seen) => checks.push(`${ok ? 'ok' : 'WRONG'} ${n}: ${seen}`)
  try {
    const w = await world(); const p = w.page
    const iid = await fixture(w); await openBoard(w)
    steps.push(await read(p, 'filed'))
    const S = () => boxSel(p, 'Ranger', 'str'), E = () => boxSel(p, 'Ranger', 'end')
    const next = async sel => { if (w.tap) await pressAt(w, sel, 'next-tap'); else { await p.keyboard.press('Tab'); await sleep(600) } }
    if (pass === 1 || pass === 3) {
      await typeIn(w, await S(), '0900', null, 'str-tap'); await next(await E()); steps.push(await read(p, 'start 0900, on to end')); if (pass === 3) { await away(w); await pressAt(w, await E(), 'end-again'); steps.push(await read(p, 'CONTROL: caret left (his row repainted as his own), his end tapped again')) }
      await p.keyboard.press('Control+A'); await p.keyboard.press('Delete')
      if (w.tap) await pressAt(w, await boxSel(p, 'Ranger', 'rmks'), 'rmks-tap'); else { await p.keyboard.press('Tab'); await sleep(600) }
      notes.push('after clearing end: ' + await note(p))
    } else {
      await typeIn(w, await S(), '', null, 'str-tap')
      await next(await E())
      notes.push('after clearing start: ' + await note(p))
    }
    const cleared = await read(p, `${pass === 1 ? 'end' : 'start'} cleared, left`)
    steps.push(cleared)
    pics.push(await pic(w, `${id}-cleared`))
    const r1 = ranger(cleared.store)
    const row = cleared.screen.find(x => /Ranger/.test(x)) || ''
    chk('his leave all day on his own input, Hex untouched', r1.length === 1 && / allday /.test(r1[0]) && hexOk(cleared.store) && cleared.store.length === 2, J(cleared.store))
    chk('both his time boxes empty', / LL - "/.test(row), row)
    /* untouched traversal: back through his boxes and forward again, typing nothing */
    const before = J(cleared.store) + cleared.undo
    if (w.tap) { await pressAt(w, await S(), 'trav-s'); await pressAt(w, await E(), 'trav-e'); await pressAt(w, await S(), 'trav-s2') }
    else { for (const k of pass !== 2 ? ['Shift+Tab', 'Shift+Tab', 'Tab', 'Shift+Tab'] : ['Tab', 'Shift+Tab', 'Shift+Tab']) { await p.keyboard.press(k); await sleep(450) } }
    const trav = await read(p, 'his boxes traversed untouched (caret now in his start)')
    steps.push(trav)
    chk('untouched traversal saves nothing (store and Undo unchanged)', J(trav.store) + trav.undo === before, `${J(trav.store)} ${trav.undo}`)
    chk('the caret is in HIS start box', (await S()).includes('"' + trav.caret + '"'), `caret ${trav.caret}`)
    await p.keyboard.press('Control+A'); await p.keyboard.type('0930')
    await next(await E())
    const ns = await read(p, 'start 0930, on')
    steps.push(ns); pics.push(await pic(w, `${id}-new-start`))
    notes.push('after new start: ' + await note(p))
    const r2 = ranger(ns.store)
    chk('a new start: his own input re-timed from 09:30, Hex untouched, no third input', r2.length === 1 && / 570-/.test(r2[0]) && hexOk(ns.store) && ns.store.length === 2, J(ns.store))
    await away(w); steps.push(await read(p, 'caret left')); pics.push(await pic(w, `${id}-left`))
    chk('screen = store at every read', steps.every(s => !s.agree.bad.length), J(steps.map(s => s.agree.bad)))
    add(id, checks.every(c => c.startsWith('ok')) ? 'PASS' : 'FAIL', { fixture: iid, checks, notes, steps }, pics)
    add(id + '-end-after-new-start', 'RECORDED', `his row after the new start: ${ns.screen.find(x => /Ranger/.test(x))}; store ${J(r2)}`)
    await w.ctx.close()
  } catch (e) { add(id, 'NOT WALKED', 'error: ' + e.message.split('\n')[0].slice(0, 400) + ' ' + J({ checks, steps }).slice(0, 3000), pics) }
}
await done('a3')
