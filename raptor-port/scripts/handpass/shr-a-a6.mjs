// shr-a-a6 — share A, A6 (Astra S08, O-S12, F-S8): Undo and Redo between changes on the Board (#sbUndo / #sbRedo).
// Desk (O-S12): start 0900 Tab → Undo → his end 1100 Tab → Undo → Redo → his remark `x` Tab.
// Phone (F-S8): 0900, tap End, 1100, tap Remark (two saves); keyboard up: Undo twice; type `Dental` in the Remark box and
// tap Hex's Start; then Undo once, Redo once, ` pm` after the remark, tap away.
// EXPECTED: one change one Undo step; nothing ever written on Hex's; after the caret leaves, the row agrees with the
// store. What the held row SHOWS straight after an Undo: RECORD.
//   WR4_OUT=<dir> WR4_NEW=<build> SZ=desk|phone ENG=chromium|webkit node scripts/handpass/shr-a-a6.mjs
import { L, J, sleep, add, done, world, openBoard, read, boxSel, typeIn, pressAt, pic, away, fixture, note, caret, TAG } from './shr-a-lib.mjs'
console.log('shr-a-a6 v1', TAG)
const steps = [], pics = [], checks = [], recs = []
const chk = (n, ok, seen) => checks.push(`${ok ? 'ok' : 'WRONG'} ${n}: ${seen}`)
const shared = s => s.length === 1 && /^LL Ranger\+Hex Jul 15 480-600 ""/.test(s[0])
const own = (s, a, b, r) => s.length === 2 && s.some(x => new RegExp(`^LL Ranger Jul 15 ${a}-${b} "${r}"`).test(x)) && s.some(x => /^LL Hex Jul 15 480-600 ""/.test(x))
const hexClean = s => s.filter(x => /^LL Hex /.test(x)).every(x => / 480-600 ""/.test(x)) && !s.some(x => /Hex\+|\+Hex/.test(x) && !/ 480-600 ""/.test(x))
try {
  const w = await world(); const p = w.page
  const iid = await fixture(w); await openBoard(w)
  steps.push(await read(p, 'filed'))
  const btn = async (b, label) => { const c0 = await caret(p); await pressAt(w, b, label); const r = await read(p, `${label} pressed (caret before: ${c0})`); steps.push(r); recs.push(`after ${label}: row shows ${J(r.screen.filter(x => /Ranger/.test(x)))}; caret ${c0} → ${r.caret}; ${r.undo}`); return r }
  if (!w.tap) {
    await typeIn(w, await boxSel(p, 'Ranger', 'str'), '0900', 'Tab'); steps.push(await read(p, 'start 0900 Tab'))
    let r = await btn('#sbUndo', 'Undo'); pics.push(await pic(w, 'a6-after-undo1'))
    chk('Undo puts back one shared leave 08:00–10:00', shared(r.store), J(r.store))
    await typeIn(w, await boxSel(p, 'Ranger', 'end'), '1100', 'Tab'); r = await read(p, 'his end clicked, 1100 Tab'); steps.push(r)
    chk('end 1100 gives Ranger his own afresh, 08:00–11:00', own(r.store, 480, 660, ''), J(r.store))
    r = await btn('#sbUndo', 'Undo'); chk('Undo takes back that one change', shared(r.store), J(r.store))
    r = await btn('#sbRedo', 'Redo'); pics.push(await pic(w, 'a6-after-redo'))
    chk('Redo brings back Ranger own 08:00–11:00', own(r.store, 480, 660, ''), J(r.store))
    await typeIn(w, await boxSel(p, 'Ranger', 'rmks'), 'x', 'Tab'); r = await read(p, 'his remark clicked, x Tab'); steps.push(r)
    chk('the remark lands on Ranger\'s own', own(r.store, 480, 660, 'x'), J(r.store))
  } else {
    await typeIn(w, await boxSel(p, 'Ranger', 'str'), '0900', null, 'str-tap')
    await pressAt(w, await boxSel(p, 'Ranger', 'end'), 'end-tap'); await p.keyboard.press('Control+A'); await p.keyboard.type('1100')
    await pressAt(w, await boxSel(p, 'Ranger', 'rmks'), 'rmks-tap'); steps.push(await read(p, '0900, tap End, 1100, tap Remark'))
    chk('two saves: Ranger own 09:00–11:00', own(steps.at(-1).store, 540, 660, ''), J(steps.at(-1).store))
    await btn('#sbUndo', 'Undo'); let r = await btn('#sbUndo', 'Undo-2'); pics.push(await pic(w, 'a6-phone-after-2-undos'))
    chk('after two Undos one leave, both men, 08:00–10:00', shared(r.store), J(r.store))
    /* type Dental in the Remark box (tap it if the caret left it) and tap Hex's Start */
    const rm = await boxSel(p, 'Ranger', 'rmks')
    if (!(await caret(p)).endsWith('.rmks')) await pressAt(w, rm, 'rmks-retap')
    await p.keyboard.type('Dental')
    await pressAt(w, await boxSel(p, 'Hex', 'str'), 'hex-str-tap')
    r = await read(p, 'Dental typed in his remark, Hex\'s Start tapped'); steps.push(r)
    chk('the remark lands on a fresh leave of Ranger\'s own, 08:00–10:00 + "Dental"', own(r.store, 480, 600, 'Dental'), J(r.store))
    r = await btn('#sbUndo', 'Undo-3'); r = await btn('#sbRedo', 'Redo')
    chk('Undo then Redo: Ranger own 08:00–10:00 "Dental" again', own(r.store, 480, 600, 'Dental'), J(r.store))
    await pressAt(w, await boxSel(p, 'Ranger', 'rmks'), 'rmks-tap2'); await p.keyboard.press('Control+End'); await p.keyboard.type(' pm')
    await away(w); r = await read(p, '" pm" typed after the remark, tapped away'); steps.push(r)
    chk('the words reach Ranger\'s own: "Dental pm"', own(r.store, 480, 600, 'Dental pm'), J(r.store))
  }
  await away(w); const last = await read(p, 'caret left'); steps.push(last); pics.push(await pic(w, 'a6-caret-left'))
  chk('nothing ever written on Hex\'s', steps.every(s => hexClean(s.store)), J(steps.map(s => s.store.filter(x => /Hex/.test(x)))))
  chk('after the caret leaves, the row agrees with the store', last.agree.bad.length === 0, J(last.agree))
  add('A6', checks.every(c => c.startsWith('ok')) ? 'PASS' : 'FAIL', { fixture: iid, checks, steps }, pics)
  add('A6-held-row-after-undo', 'RECORDED', recs.join(' ; '))
} catch (e) { add('A6', 'NOT WALKED', 'error: ' + e.message.split('\n')[0].slice(0, 400) + ' ' + J({ checks, steps }).slice(0, 3000), pics) }
await done('a6')
