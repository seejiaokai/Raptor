// r4wf-mb-m10 — merge walk, Share B, M10 (Astra's M10, the M9 set-up on the desk): a shared ALL-DAY leave Ranger + Hex on
// Wed 15 Jul; Available crew above Unavailable (it already is on this day's order — recorded); Ranger's Start 1800, Tab
// (caret in his End); then his puck dragged by mouse from Available crew into an empty front seat of wave 1.
// EXPECTED (brief): RECORD whether Ranger is offered in Available crew and what the drop does; FAIL only if either leave
// changes because of the drop, or the drag acts on Hex.
//   WR4_OUT=<dir> WR4_NEW=<build> SHR_BUNDLE=<bundle> SZ=desk ENG=chromium node scripts/handpass/r4wf-mb-m10.mjs
import { L, J, sleep, add, done, world, openBoard, read, boxSel, pic, fixture, caretAt, heldRows, clickNow, note, BUILD, TAG } from './r4wf-mb-lib.mjs'
console.log('r4wf-mb-m10 v2', BUILD, TAG)
const steps = [], pics = [], notes = []
try {
  const w = await world(); const p = w.page
  await fixture(w, [L.RANGER, L.HEX], { from: undefined, to: undefined, span: 'all' })
  await openBoard(w)
  const order = await p.evaluate(() => [...document.querySelectorAll('#sbBoard > [data-secmove]')].map(s => s.getAttribute('data-secmove')))
  notes.push('section order: ' + order.join(', ') + ' — Available crew above Unavailable: ' + (order.indexOf('2.avail') < order.indexOf('2.unav')))
  /* the empty seats of the flying section, and where Ranger shows */
  const seats = () => p.evaluate(() => [...document.querySelectorAll('#sbBoard > [data-secmove$=".waves"] .sb-slot.empty[data-slot]')].filter(s => s.offsetWidth).map(s => s.getAttribute('data-slot') + ' @' + Math.round(s.getBoundingClientRect().top)))
  const waveSeats = () => p.evaluate(() => [...document.querySelectorAll('#sbBoard > [data-secmove$=".waves"] [data-slot]')].map(s => s.getAttribute('data-slot') + '=' + ([...s.querySelectorAll('[data-person]')].map(e => e.getAttribute('data-person')).join('+') || '∅')))
  /* an empty line in wave 1's first formation: its own "+" (Add another aircraft to this formation), pressed as set-up */
  await p.locator('#schedBoard [data-lac="2.0.0"]').first().click(); await sleep(800); await p.mouse.click(3, 3); await sleep(500)
  const newLine = await p.evaluate(() => { const out = []; for (const e of document.querySelectorAll('#sbBoard > [data-secmove$=".waves"] *')) for (const a of e.attributes) if (/2\.0\.0\.2/.test(a.value)) out.push(e.tagName + '.' + String(e.className).slice(0, 25) + ' ' + a.name + '=' + a.value + (e.children.length ? '' : ' "' + e.textContent.trim().slice(0, 10) + '"')); return out })
  notes.push('the new line\'s parts: ' + J(newLine))
  notes.push('empty seats in the flying section: ' + J(await seats()))
  notes.push('flying seats: ' + J((await waveSeats()).slice(0, 24)))
  const look = async label => { const r = await read(p, label); const o = { ...r, caretAt: await caretAt(p), held: await heldRows(p), avail: await p.evaluate(() => { const s = document.querySelector('#sbBoard > [data-secmove$=".avail"]'); return { ranger: s ? [...s.querySelectorAll('[data-person="bane"]')].map(e => (e.className || '') + ' "' + e.textContent.trim().slice(0, 20) + '"' + (e.title ? ' title=' + e.title.slice(0, 60) : '')) : [], hex: !!s?.querySelector('[data-person="rocky"]') } }), flying: (await waveSeats()).filter(x => /bane|rocky/.test(x)) }; steps.push(o); return o }
  await look('filed')
  const rs = await boxSel(p, 'Ranger', 'str')
  await clickNow(w, rs); await sleep(250)
  await p.keyboard.press('Control+A'); await p.keyboard.type('1800'); await p.keyboard.press('Tab'); await sleep(700)
  await look('1800, Tab (caret in his End)')
  pics.push(await pic(w, 'm10-0-avail', ['#sbBoard > [data-secmove$=".avail"]']))
  const empty = await seats()
  if (!empty.length) throw new Error('no empty seat in the flying section')
  /* the first empty FRONT seat (slot ending .0) of wave 1, else the first empty seat */
  const target = (empty.find(s => /^2\.0\.0\.2\.p /.test(s)) || empty.find(s => /\.p /.test(s)) || empty[0]).split(' ')[0]
  notes.push('target seat ' + target)
  const src = p.locator('#sbBoard > [data-secmove$=".avail"] [data-person="bane"]').filter({ visible: true }).first()
  if (!(await src.count())) throw new Error('Ranger is not offered in Available crew')
  await src.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300)
  const tgt = p.locator(`#sbBoard > [data-secmove$=".waves"] [data-slot="${target}"]`).first()
  const a = await src.boundingBox()
  await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await p.mouse.down(); await sleep(150)
  await p.mouse.move(a.x + a.width / 2 + 8, a.y + a.height / 2 + 8); await sleep(150)
  /* the seat measured once the drag has begun (the page may scroll), then the move in steps */
  await tgt.evaluate(e => e.scrollIntoView({ block: 'center' })).catch(() => {}); await sleep(300)
  const b = await tgt.boundingBox()
  const sx = a.x + a.width / 2 + 8, sy = a.y + a.height / 2 + 8
  for (let i = 1; i <= 15; i++) { await p.mouse.move(sx + (b.x + b.width / 2 - sx) * i / 15, sy + (b.y + b.height / 2 - sy) * i / 15); await sleep(30) }
  const under = await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return (e?.closest('[data-slot]')?.getAttribute('data-slot') || '') + ' ' + (e ? e.tagName + '.' + e.className : 'none') }, [b.x + b.width / 2, b.y + b.height / 2])
  const ghost = await p.evaluate(() => [...document.querySelectorAll('[class*="ghost"], [class*="drag"]')].filter(e => e.offsetWidth).map(e => e.className).slice(0, 4))
  pics.push(await pic(w, 'm10-1-dragging', ['body']))
  await p.mouse.up(); await sleep(900)
  notes.push(`dropped on ${under}; drag marks during: ${J(ghost)}; note after: ${J(await note(p))}`)
  await look('dropped')
  pics.push(await pic(w, 'm10-2-after-drop', [`#sbBoard > [data-secmove$=".waves"] [data-slot="${target}"]`]))
  pics.push(await pic(w, 'm10-2b-unav', ['#sbBoard > [data-secmove$=".unav"]']))
  await p.mouse.click(3, 3); await sleep(700)
  const fin = await look('caret left')
  const before = steps[1].store, after = fin.store
  const leavesSame = J(before.map(x => x.replace(/ \[.*/, ''))) === J(after.map(x => x.replace(/ \[.*/, '')))
  const hexActed = fin.flying.some(x => /rocky/.test(x) && x.startsWith(target + '='))
  const rangerIn = fin.flying.find(x => x.startsWith(target + '='))
  add('M10', leavesSame && !hexActed ? 'RECORD (no FAIL condition)' : 'FAIL', { leavesSame, hexActed, rangerSeat: rangerIn, notes, steps: steps.map(x => ({ step: x.step, caretAt: x.caretAt, store: x.store, held: x.held, avail: x.avail, flying: x.flying })) }, pics)
} catch (e) { add('M10', 'NOT WALKED', 'error: ' + e.message.split('\n')[0].slice(0, 300) + ' ' + J({ notes, steps: steps.map(x => ({ step: x.step, store: x.store, avail: x.avail })) }).slice(0, 3000), pics) }
await done('m10')
