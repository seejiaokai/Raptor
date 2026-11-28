// shr-a-a1 — share A, A1 (Astra S05, O-S8): Ranger's row of the shared leave on the Board: start 0900 Tab, end 1100 Tab,
// remark Tab; caret leaves; RELOAD and read again. EXPECTED: Ranger 09:00–11:00 + remark on an input of his own; Hex
// 08:00–10:00 none; screen = store at every step and after the reload. Row order: RECORD.
//   WR4_OUT=<dir> WR4_NEW=<build> SZ=desk|phone ENG=chromium|webkit node scripts/handpass/shr-a-a1.mjs
import { L, J, sleep, add, done, world, openBoard, read, boxSel, typeIn, pic, away, fixture, reload, TAG } from './shr-a-lib.mjs'
console.log('shr-a-a1 v1', TAG)
const steps = [], pics = []
try {
  const w = await world(); const p = w.page
  const iid = await fixture(w); await openBoard(w)
  steps.push(await read(p, 'filed'))
  for (const [f, v] of [['str', '0900'], ['end', '1100'], ['rmks', 'own hours']]) {
    const sel = await boxSel(p, 'Ranger', f)
    await typeIn(w, sel, v, 'Tab', `${f}-tap`)
    steps.push(await read(p, `${f} ${v} Tab (typed in ${sel.match(/"(.+)"/)[1]})`))
    pics.push(await pic(w, `a1-after-${f}`))
  }
  await away(w)
  steps.push(await read(p, 'caret left'))
  pics.push(await pic(w, 'a1-caret-left'))
  await reload(w)
  await openBoard(w)
  steps.push(await read(p, 'after reload'))
  pics.push(await pic(w, 'a1-after-reload'))
  const last = steps.at(-1), left = steps.at(-2)
  const okStore = s => { const r = s.filter(x => /^LL Ranger /.test(x)), h = s.filter(x => /^LL Hex /.test(x)); return r.length === 1 && / 540-660 "own hours"/.test(r[0]) && h.length === 1 && / 480-600 ""/.test(h[0]) && !s.some(x => /Ranger\+Hex|Hex\+Ranger/.test(x)) }
  const allAgree = steps.every(s => s.agree.bad.length === 0 && s.agree.rows >= 2)
  const v = okStore(left.store) && okStore(last.store) && allAgree
  add('A1', v ? 'PASS' : 'FAIL', { fixture: iid, steps: steps.map(s => ({ step: s.step, store: s.store, screen: s.screen, caret: s.caret, agree: s.agree })) }, pics)
  const order = s => s.screen.map(x => x.replace(/ .*/, '') + ' ' + x.split(' ')[1]).join(' / ')
  add('A1-order', 'RECORDED', `before: ${order(steps[0])}; after 1st Tab: ${order(steps[1])}; caret left: ${order(left)}; after reload: ${order(last)}`, pics)
} catch (e) { add('A1', 'NOT WALKED', 'error: ' + e.message.split('\n')[0].slice(0, 300) + ' ' + J(steps)) }
await done('a1')
