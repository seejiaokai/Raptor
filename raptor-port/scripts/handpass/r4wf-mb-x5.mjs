// r4wf-mb-x5 — merge walk, Share B, X5: Ranger the FIRST Unavailable row of a shared leave (Ranger + Hex, LL 08:00–10:00,
// Wed 15 Jul); Personal Inputs folded. Ranger's Start 0900, Shift+Tab; picture; Tab; Tab; 1100 in his End, Tab.
// EXPECTED (brief): the caret is in a box after every key — the same boxes as on main; on the way back his Start reads
// 09:00 and his End HIS end; 11:00 is saved on the same own leave — two leaves in all.
//   WR4_OUT=<dir> WR4_NEW=<build> SHR_BUNDLE=<bundle> SZ=desk ENG=chromium node scripts/handpass/r4wf-mb-x5.mjs
import { L, J, sleep, add, done, world, openBoard, read, boxSel, pic, fixture, caretAt, heldRows, clickNow, BUILD, TAG } from './r4wf-mb-lib.mjs'
console.log('r4wf-mb-x5 v1', BUILD, TAG)
const steps = [], pics = []
try {
  const w = await world(); const p = w.page
  const iid = await fixture(w)
  await openBoard(w)
  const pers = await p.evaluate(() => { const s = document.querySelector('#sbBoard > [data-secmove$=".inputs"]'); return s ? { head: (s.querySelector('.sb-ph')?.innerText || '').replace(/\s+/g, ' '), boxesShown: [...s.querySelectorAll('[data-ifld]')].filter(e => e.getBoundingClientRect().height > 0).length } : null })
  const look = async label => { const r = await read(p, label); const o = { ...r, caretAt: await caretAt(p), held: await heldRows(p), caretVal: await p.evaluate(() => document.activeElement?.value ?? null) }; steps.push(o); return o }
  const first = await p.evaluate(() => document.querySelector('#sbBoard > [data-secmove$=".unav"] [data-inprow]')?.getAttribute('data-inprow'))
  await look('filed; first Unavailable row ' + first + '; Personal Inputs ' + J(pers))
  const rs = await boxSel(p, 'Ranger', 'str')
  await clickNow(w, rs); await sleep(250)
  await p.keyboard.press('Control+A'); await p.keyboard.type('0900')
  await look('Ranger start 0900 typed')
  await p.keyboard.press('Shift+Tab'); await sleep(650)
  await look('Shift+Tab')
  pics.push(await pic(w, 'x5-1-after-shift-tab', ['#sbBoard > [data-secmove$=".unav"]']))
  pics.push(await pic(w, 'x5-1b-caret-box', ['#schedBoard :focus']))
  await p.keyboard.press('Tab'); await sleep(650)
  await look('Tab (back)')
  pics.push(await pic(w, 'x5-2-after-tab-back'))
  await p.keyboard.press('Tab'); await sleep(650)
  await look('Tab (on)')
  pics.push(await pic(w, 'x5-3-after-tab-on'))
  await p.keyboard.press('Control+A'); await p.keyboard.type('1100'); await p.keyboard.press('Tab'); await sleep(650)
  await look('End 1100, Tab')
  pics.push(await pic(w, 'x5-4-after-end'))
  await p.mouse.click(3, 3); await sleep(700)
  await look('caret left')
  pics.push(await pic(w, 'x5-5-caret-left'))
  const s = steps.at(-1).store
  const inBox = steps.slice(1, -1).every(x => x.caretAt !== 'body' && /\.(str|end|rmks)$|^(gr|gn|dn|ap|dr|sr|ff|fr)/.test(x.caretAt))
  const back = steps.find(x => x.step === 'Tab (back)'), on = steps.find(x => x.step === 'Tab (on)')
  const backOk = /\.str$/.test(back.caretAt) && back.caretVal === '09:00' && /\.end$/.test(on.caretAt) && on.caretVal === '10:00'
  const storeOk = s.length === 2 && s.some(x => /^LL Ranger Jul 15 540-660 ""/.test(x)) && s.some(x => /^LL Hex Jul 15 480-600 ""/.test(x))
  add('X5', inBox && backOk && storeOk ? 'PASS' : 'FAIL', { inBox, backOk, storeOk, steps: steps.map(x => ({ step: x.step, caretAt: x.caretAt, caretVal: x.caretVal, store: x.store, screen: x.screen, held: x.held, agree: x.agree })) }, pics)
} catch (e) { add('X5', 'NOT WALKED', 'error: ' + e.message.split('\n')[0].slice(0, 300) + ' ' + J(steps.map(x => ({ step: x.step, caretAt: x.caretAt, store: x.store }))).slice(0, 3000), pics) }
await done('x5')
