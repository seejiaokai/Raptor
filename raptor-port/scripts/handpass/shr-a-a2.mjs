// shr-a-a2 — share A, A2 (Astra S03, O-S4): Escape after a typed-over end, start and remark; Shift+Tab back into his end
// box; on the phone tap between boxes. EXPECTED: Escape puts back HIS saved value and saves nothing; a box arrived at
// shows HIS value (fixed: M1, M3).
//   WR4_OUT=<dir> WR4_NEW=<build> SZ=desk|phone ENG=chromium|webkit node scripts/handpass/shr-a-a2.mjs
import { L, J, sleep, add, done, world, openBoard, read, boxSel, typeIn, pressAt, pic, away, fixture, note, caret, TAG } from './shr-a-lib.mjs'
console.log('shr-a-a2 v1', TAG)
const steps = [], pics = [], notes = []
const val = (p, sel) => p.locator(sel).first().inputValue()
const boardOpen = p => p.evaluate(() => { const b = document.querySelector('#schedBoard'); return !!b && b.offsetWidth > 0 })
const okStore = (s, a, b, r = '') => s.filter(x => /^LL Ranger /.test(x)).length === 1 && s.some(x => new RegExp(`^LL Ranger Jul 15 ${a}-${b} "${r}"`).test(x)) && s.filter(x => /^LL Hex Jul 15 480-600 ""/.test(x)).length === 1 && s.length === 2
const checks = []
const chk = (name, ok, seen) => { checks.push(`${ok ? 'ok' : 'WRONG'} ${name}: ${seen}`) }
try {
  const w = await world(); const p = w.page
  const iid = await fixture(w); await openBoard(w)
  steps.push(await read(p, 'filed'))
  const S = () => boxSel(p, 'Ranger', 'str'), E = () => boxSel(p, 'Ranger', 'end'), R = () => boxSel(p, 'Ranger', 'rmks')
  if (!w.tap) {
    await typeIn(w, await S(), '0900', 'Tab'); steps.push(await read(p, 'start 0900 Tab'))
    await typeIn(w, await E(), '1100', 'Tab'); steps.push(await read(p, 'end 1100 Tab'))
    await p.keyboard.press('Shift+Tab'); await sleep(500)
    const c1 = await caret(p), v1 = await val(p, await E())
    steps.push({ ...(await read(p, 'Shift+Tab back')), endShows: v1 })
    chk('Shift+Tab lands in his end box showing 11:00', /bane\.end$/.test(c1) && v1 === '11:00', `caret ${c1}, end box ${v1}`)
    pics.push(await pic(w, 'a2-shifttab-end'))
    for (const [f, typed, want] of [['end', '1200', '11:00'], ['str', '1000', '09:00'], ['rmks', 'cancel me', '']]) {
      const sel = f === 'end' ? await E() : f === 'str' ? await S() : await R()
      await typeIn(w, sel, typed, null)
      const typedShows = await val(p, sel)
      await p.keyboard.press('Escape'); await sleep(600)
      /* the row may repaint on Escape (his own address replaces the held one): read his box afresh by his name */
      const c = await caret(p), sel2 = await boxSel(p, 'Ranger', f)
      const after = await val(p, sel2).catch(() => 'BOX GONE'), open = await boardOpen(p)
      if (sel2 !== sel) notes.push(`Escape in ${f}: the row repainted — its box address ${sel.match(/"(.+)"/)[1]} → ${sel2.match(/"(.+)"/)[1]}`)
      notes.push(`Escape in ${f}: note "${await note(p)}"`)
      steps.push({ ...(await read(p, `${f}: ${typed} typed (box showed ${typedShows}), Escape`)), boxAfter: after, boardOpen: open })
      pics.push(await pic(w, `a2-escape-${f}`))
      chk(`Escape in his ${f} puts back ${want || 'empty'}, Board stays open, nothing saved`, after === want && open && okStore(steps.at(-1).store, 540, 660), `box ${J(after)}, caret ${c}, board open ${open}, store ${J(steps.at(-1).store)}`)
    }
    await away(w); steps.push(await read(p, 'caret left'))
    pics.push(await pic(w, 'a2-caret-left'))
    chk('at the end: Ranger 09:00–11:00 own, Hex 08:00–10:00', okStore(steps.at(-1).store, 540, 660) && steps.every(s => !s.agree || !s.agree.bad.length), J(steps.at(-1).store))
  } else {
    /* the phone: tap between boxes — no Escape on an iPhone keyboard */
    await typeIn(w, await S(), '0900', null, 'str-tap')
    await pressAt(w, await E(), 'end-tap'); const v0 = await val(p, await E()); steps.push({ ...(await read(p, 'start 0900, tapped his end box')), endShows: v0 })
    chk('his end box, arrived at by a tap, shows 10:00', v0 === '10:00' && /bane\.end$/.test(steps.at(-1).caret), `end ${v0}, caret ${steps.at(-1).caret}`)
    await p.keyboard.press('Control+A'); await p.keyboard.type('1100')
    await pressAt(w, await S(), 'str-tap2'); const v1 = await val(p, await S()); steps.push({ ...(await read(p, 'end 1100 typed, tapped his start box')), startShows: v1 })
    chk('his start box, arrived at by a tap, shows 09:00; end saved 11:00', v1 === '09:00' && okStore(steps.at(-1).store, 540, 660), `start ${v1}, store ${J(steps.at(-1).store)}`)
    pics.push(await pic(w, 'a2-phone-back-in-start'))
    await pressAt(w, await E(), 'end-tap2'); const v2 = await val(p, await E())
    chk('his end box tapped again shows 11:00', v2 === '11:00', `end ${v2}`)
    await p.keyboard.press('Control+A'); await p.keyboard.type('1130')
    await away(w); steps.push(await read(p, 'end 1130 typed, tapped outside'))
    pics.push(await pic(w, 'a2-phone-1130-left'))
    chk('11:30 saved on Ranger\'s own; Hex untouched', okStore(steps.at(-1).store, 540, 690), J(steps.at(-1).store))
    chk('screen = store at every read', steps.every(s => !s.agree || !s.agree.bad.length), J(steps.map(s => s.agree?.bad)))
  }
  add('A2', checks.every(c => c.startsWith('ok')) ? 'PASS' : 'FAIL', { fixture: iid, checks, notes, steps }, pics)
} catch (e) { add('A2', 'NOT WALKED', 'error: ' + e.message.split('\n')[0].slice(0, 400) + ' ' + J({ checks, steps }).slice(0, 3000), pics) }
await done('a2')
