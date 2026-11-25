// r4wf-mb-x8b — merge walk, Share B, X8 (b): a shared overseas duty (Ranger + Hex, 08:00–12:00, Wed 15 Jul), nothing
// changed yet; 0900 typed in Ranger's Start and not left; ONE mouse click on Reject on Ranger's row (measured where it
// stood at the press). EXPECTED (brief): one press does its job on HIS duty; Hex's untouched. RECORD if a second press is
// needed (then made once, on Ranger's row as it is drawn then).
//   WR4_OUT=<dir> WR4_NEW=<build> SHR_BUNDLE=<bundle> SZ=desk ENG=chromium node scripts/handpass/r4wf-mb-x8b.mjs
import { L, J, sleep, add, done, world, openBoard, read, boxSel, rowSel, pic, fixture, note, caretAt, heldRows, clickNow, BUILD, TAG } from './r4wf-mb-lib.mjs'
console.log('r4wf-mb-x8b v1', BUILD, TAG)
const steps = [], pics = [], notes = []
const secs = p => p.evaluate(() => [...document.querySelectorAll('#sbBoard > [data-secmove]')].map(s => { const rows = [...s.querySelectorAll('[data-inprow]')].filter(r => r.querySelector('.seat [data-person="bane"],.seat [data-person="rocky"]')); return rows.length ? s.getAttribute('data-secmove') + ': ' + rows.map(r => r.getAttribute('data-inprow') + ' ' + [...r.querySelectorAll('.seat [data-person] .nm')].map(e => e.textContent.trim()).join('+') + ' [' + [...r.querySelectorAll('button')].filter(b => b.offsetWidth).map(b => b.textContent.trim()).join('/') + ']').join(' | ') : null }).filter(Boolean))
const persCount = p => p.evaluate(() => (document.querySelector('#sbBoard > [data-secmove$=".inputs"] .sb-ph')?.innerText || '').replace(/\s+/g, ' '))
try {
  const w = await world(); const p = w.page
  const iid = await fixture(w, [L.RANGER, L.HEX], { type: 'OD', from: '08:00', to: '12:00' })
  await openBoard(w)
  const look = async label => { const r = await read(p, label); const o = { ...r, caretAt: await caretAt(p), held: await heldRows(p), sections: await secs(p), persHead: await persCount(p) }; steps.push(o); return o }
  await look('filed')
  if (!(await p.locator(`#sbBoard > [data-secmove$=".unav"] [data-inprow^="${iid}"]`).count())) throw new Error('the shared duty is not under Unavailable: ' + J(await secs(p)))
  const rs = await boxSel(p, 'Ranger', 'str')
  await clickNow(w, rs); await sleep(250)
  await p.keyboard.press('Control+A'); await p.keyboard.type('0900')
  await look('0900 typed in Ranger\'s Start, not left')
  pics.push(await pic(w, 'x8b-0-typed'))
  const rej = `${await rowSel(p, 'Ranger')} .accb[data-acc="x"]`
  if (!(await p.locator(rej).count())) throw new Error('no Reject on Ranger\'s row: ' + J(await secs(p)))
  const bb = await p.locator(rej).first().boundingBox()
  /* a real mouse press at the button's middle, measured just before */
  await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2)
  const under = await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? e.tagName + '.' + e.className + ' "' + e.textContent.trim().slice(0, 15) + '"' : 'none' }, [bb.x + bb.width / 2, bb.y + bb.height / 2])
  await p.mouse.down(); await sleep(60); await p.mouse.up(); await sleep(900)
  notes.push(`press 1 at (${Math.round(bb.x + bb.width / 2)},${Math.round(bb.y + bb.height / 2)}) on ${under}; note after: ` + J(await note(p)))
  const a1 = await look('Reject clicked once')
  pics.push(await pic(w, 'x8b-1-after-one-press'))
  pics.push(await pic(w, 'x8b-1b-personal', ['#sbBoard > [data-secmove$=".inputs"]']))
  const rangerStillUnav = a1.sections.some(x => /\.unav:.*Ranger/.test(x))
  const rangerRejected = a1.store.some(x => /^OD Ranger /.test(x) && / acc=x/.test(x))
  if (rangerStillUnav && !rangerRejected) {
    const r2 = `${await rowSel(p, 'Ranger')} .accb[data-acc="x"]`
    if (await p.locator(r2).count()) { await p.locator(r2).first().click(); await sleep(900); notes.push('press 2 made; note after: ' + J(await note(p))); await look('Reject clicked a second time'); pics.push(await pic(w, 'x8b-2-after-second-press')) }
    else notes.push('no Reject left on Ranger\'s row for a second press')
  }
  await p.mouse.click(3, 3); await sleep(700)
  const fin = await look('caret left')
  pics.push(await pic(w, 'x8b-3-caret-left'))
  pics.push(await pic(w, 'x8b-3b-personal', ['#sbBoard > [data-secmove$=".inputs"]']))
  const hex = fin.store.filter(x => /^OD Hex Jul 15 480-720 ""/.test(x) && !/acc=x/.test(x))
  const oneDid = steps.find(x => x.step === 'Reject clicked once')
  const oneOk = oneDid.store.some(x => /^OD Ranger /.test(x) && /acc=x/.test(x)) || !oneDid.sections.some(x => /\.unav:.*Ranger/.test(x))
  const hexOk = hex.length === 1 && !steps.some(x => x.store.some(s => /^OD Hex/.test(s) && /acc=x/.test(s)))
  add('X8b', oneOk && hexOk ? 'PASS' : 'FAIL', { oneOk, hexOk, notes, steps: steps.map(x => ({ step: x.step, caretAt: x.caretAt, store: x.store, screen: x.screen, held: x.held, sections: x.sections, persHead: x.persHead })) }, pics)
} catch (e) { add('X8b', 'NOT WALKED', 'error: ' + e.message.split('\n')[0].slice(0, 300) + ' ' + J({ notes, steps: steps.map(x => ({ step: x.step, store: x.store, sections: x.sections })) }).slice(0, 3000), pics) }
await done('x8b')
