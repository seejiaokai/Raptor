// shr-a-a8 — share A, A8 (O-S5, Astra S15): the Board's day stepped with the caret in his held, untouched box; a valid
// end typed and the next day pressed at once; the same with `2570`; leave the page and the week and come back, then a
// remark. EXPECTED: nothing saved by a step over an untouched box; a typed valid change commits once; a refused one
// saves nothing; the rows continue from the saved values.
//   WR4_OUT=<dir> WR4_NEW=<build> SZ=desk ENG=chromium node scripts/handpass/shr-a-a8.mjs
import { L, J, sleep, add, done, world, openBoard, read, boxSel, typeIn, pressAt, pic, away, fixture, note, TAG } from './shr-a-lib.mjs'
console.log('shr-a-a8 v1', TAG)
const steps = [], pics = [], checks = [], notes = []
const chk = (n, ok, seen) => checks.push(`${ok ? 'ok' : 'WRONG'} ${n}: ${seen}`)
const own = (s, a, b, r = '') => s.length === 2 && s.some(x => new RegExp(`^LL Ranger Jul 15 ${a}-${b} "${r}"`).test(x)) && s.some(x => /^LL Hex Jul 15 480-600 ""/.test(x))
const dayOn = p => p.evaluate(() => document.querySelector('#schedBoard .sbday.on')?.textContent?.trim())
try {
  const w = await world(); const p = w.page
  const iid = await fixture(w); await openBoard(w)
  steps.push(await read(p, 'filed'))
  await typeIn(w, await boxSel(p, 'Ranger', 'str'), '0900', 'Tab'); steps.push(await read(p, 'start 0900 Tab'))
  const base = steps.at(-1)
  chk('the first change: Ranger own 09:00–10:00', own(base.store, 540, 600), J(base.store))
  /* 1 — the caret back in his (held) start box, untouched; the day stepped and back */
  await pressAt(w, await boxSel(p, 'Ranger', 'str')); const inBox = await read(p, 'clicked back into his start box (untouched)'); steps.push(inBox)
  await pressAt(w, '#schedBoard [data-sbtab="3"]'); const d1 = await dayOn(p)
  await pressAt(w, '#schedBoard [data-sbtab="2"]'); const d2 = await dayOn(p)
  const s1 = await read(p, `day stepped to ${d1} and back to ${d2}`); steps.push(s1); pics.push(await pic(w, 'a8-step-untouched'))
  chk('a step over an untouched box saves nothing (store and Undo unchanged)', J(s1.store) === J(base.store) && s1.undo === base.undo && d1 === 'Thu 16' && d2 === 'Wed 15', `caret was ${inBox.caret}; days ${d1}/${d2}; ${J(s1.store)} ${s1.undo}`)
  /* 2 — a valid end typed, the next day pressed at once */
  await typeIn(w, await boxSel(p, 'Ranger', 'end'), '1100', null)
  await pressAt(w, '#schedBoard [data-sbtab="3"]'); notes.push('valid then step: ' + await note(p))
  const s2a = await read(p, `end 1100 typed, ${await dayOn(p)} pressed at once`); steps.push(s2a)
  await pressAt(w, '#schedBoard [data-sbtab="2"]'); const s2 = await read(p, 'back on Wed 15'); steps.push(s2); pics.push(await pic(w, 'a8-valid-then-step'))
  chk('a typed valid change commits once (Ranger own 09:00–11:00, one more Undo step)', own(s2.store, 540, 660) && s2.agree.bad.length === 0, `${J(s2.store)} ${s2.undo}`)
  /* 3 — 2570 typed, the next day pressed at once */
  await typeIn(w, await boxSel(p, 'Ranger', 'end'), '2570', null)
  await pressAt(w, '#schedBoard [data-sbtab="3"]'); notes.push('2570 then step: ' + await note(p))
  const s3a = await read(p, `end 2570 typed, ${await dayOn(p)} pressed at once`); steps.push(s3a)
  await pressAt(w, '#schedBoard [data-sbtab="2"]'); const s3 = await read(p, 'back on Wed 15'); steps.push(s3); pics.push(await pic(w, 'a8-refused-then-step'))
  chk('a refused change saves nothing', own(s3.store, 540, 660) && s3.agree.bad.length === 0 && s3.undo === s2.undo, `${J(s3.store)} ${s3.undo}`)
  /* 4 — leave the page and the week, come back, a remark */
  await L.go(p, 'inputs'); await sleep(500); await openBoard(w)
  await pressAt(w, '#schedBoard [data-sbweek="1"]'); await sleep(500); const wk = await dayOn(p)
  await pressAt(w, '#schedBoard [data-sbweek="-1"]'); await sleep(500); await pressAt(w, '#schedBoard [data-sbtab="2"]')
  const s4 = await read(p, `left for the Inputs page, the Board's next week (${wk}) and back to ${await dayOn(p)}`); steps.push(s4)
  chk('the rows continue from the saved values', own(s4.store, 540, 660) && s4.agree.bad.length === 0 && s4.agree.rows === 2, `${J(s4.screen)}`)
  await typeIn(w, await boxSel(p, 'Ranger', 'rmks'), 'back again', 'Tab'); await away(w)
  const s5 = await read(p, 'remark "back again" Tab, caret left'); steps.push(s5); pics.push(await pic(w, 'a8-remark-after-return'))
  chk('the remark lands on Ranger\'s own', own(s5.store, 540, 660, 'back again') && s5.agree.bad.length === 0, J(s5.store))
  add('A8', checks.every(c => c.startsWith('ok')) ? 'PASS' : 'FAIL', { fixture: iid, checks, notes, steps }, pics)
} catch (e) { add('A8', 'NOT WALKED', 'error: ' + e.message.split('\n')[0].slice(0, 400) + ' ' + J({ checks, steps }).slice(0, 3000), pics) }
await done('a8')
