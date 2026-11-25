// shr-a-a12 — share A, A12 (the host's find): a shared overseas duty for Ranger and Hex; Reject on a row NOT held (both
// go back), unfold Personal Inputs on the Board, type start 0900 on its ONE line, Tab. EXPECTED: the duty is re-timed for
// BOTH men, still one input (D739, D661, D1393).
//   WR4_OUT=<dir> WR4_NEW=<build> SZ=desk|phone ENG=chromium|webkit node scripts/handpass/shr-a-a12.mjs
import { L, J, sleep, add, done, world, openBoard, read, rowSel, typeIn, pressAt, pic, away, fixture, note, caret, TAG } from './shr-a-lib.mjs'
console.log('shr-a-a12 v1', TAG)
const steps = [], pics = [], notes = []
const persRows = p => p.evaluate(() => { const s = document.querySelector('#sbBoard > [data-secmove$=".inputs"]'); if (!s) return ['NO PERSONAL INPUTS']; return [...s.querySelectorAll('[data-inprow]')].filter(r => r.querySelector('[data-person="bane"],[data-person="rocky"]')).map(r => { const v = f => r.querySelector(`[data-ifld$=".${f}"]`)?.value ?? '∅'; return `${[...r.querySelectorAll('.seat [data-person] .nm')].map(e => e.textContent.trim()).join('+')} ${v('str')}-${v('end')} "${v('rmks')}" <${r.getAttribute('data-inprow')}>` }) })
try {
  const w = await world(); const p = w.page
  const iid = await fixture(w, [L.RANGER, L.HEX], { type: 'OD' }); await openBoard(w)
  steps.push(await read(p, 'filed'))
  const row = await rowSel(p, 'Ranger')
  await pressAt(w, `${row} .accb[data-acc="x"]`, 'reject')
  notes.push('reject: ' + await note(p))
  steps.push({ ...(await read(p, 'Reject pressed on Ranger\'s untouched row')), pers: await persRows(p) })
  if (!(await p.locator('#sbBoard > [data-secmove$=".inputs"] [data-inprow] [data-ifld$=".str"]').filter({ visible: true }).count())) {
    await pressAt(w, '#sbBoard [data-pitog]', 'unfold'); steps.push({ step: 'Personal Inputs unfolded', pers: await persRows(p) })
  }
  pics.push(await pic(w, 'a12-personal-before', ['#sbBoard > [data-secmove$=".inputs"]']))
  const k = await p.evaluate(() => { const s = document.querySelector('#sbBoard > [data-secmove$=".inputs"]'); const r = [...s.querySelectorAll('[data-inprow]')].find(r => r.querySelector('[data-person="bane"]') && r.querySelector('[data-person="rocky"]')); return r ? r.querySelector('[data-ifld$=".str"]')?.getAttribute('data-ifld') : null })
  if (!k) throw new Error('no ONE line for both men under Personal Inputs: ' + J(await persRows(p)))
  await typeIn(w, `#schedBoard [data-ifld="${k}"]`, '0900', 'Tab', 'str-tap')
  notes.push('after 0900 Tab: ' + await note(p))
  steps.push({ ...(await read(p, `0900 Tab on the one line (${k})`)), pers: await persRows(p) })
  pics.push(await pic(w, 'a12-after-0900', ['#sbBoard > [data-secmove$=".inputs"]']))
  await away(w)
  steps.push({ ...(await read(p, 'caret left')), pers: await persRows(p) })
  pics.push(await pic(w, 'a12-caret-left', ['#sbBoard > [data-secmove$=".inputs"]']))
  const s = steps.at(-1).store
  const ok = s.length === 1 && /^OD Ranger\+Hex Jul 15 540-600/.test(s[0]) && steps.at(-1).pers.length === 1 && / 09:00-10:00 /.test(steps.at(-1).pers[0])
  add('A12', ok ? 'PASS' : 'FAIL', { fixture: iid, steps, notes }, pics)
} catch (e) { add('A12', 'NOT WALKED', 'error: ' + e.message.split('\n')[0].slice(0, 400) + ' ' + J(steps).slice(0, 3000), pics) }
await done('a12')
