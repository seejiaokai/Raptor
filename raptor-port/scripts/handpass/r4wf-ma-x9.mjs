// r4wf-ma-x9 — merge walk, walker A, X9 (RECORD): OIL Earn switched on with the caret in his row. A shared overseas duty
// Ranger + Hex 08:00–12:00 on Sat 18 Jul (OIL answered Yes when filed). Caret in Ranger's End; "OIL Earn" pressed keeping
// the caret; 1000 typed, Tab; then blank. Everything recorded.
//   WR4_OUT=<dir> WR4_NEW=<build> SHR_BUNDLE=<bundle> SZ=phone ENG=webkit KEEP=tap node scripts/handpass/r4wf-ma-x9.mjs
import * as A from './r4wf-ma-lib.mjs'
const { L, J, sleep } = A
console.log('r4wf-ma-x9 v4', A.TAG, 'KEEP', process.env.KEEP || 'tap', 'bundle', A.EXPECT_BUNDLE)
const ID = 'X9', steps = [], pics = []
let p
const st = () => p.evaluate(() => window.INPUTS.filter(r => (r.people || []).some(x => x.p === 'bane' || x.p === 'rocky') && r.date === 'Jul 18').map(r => `${r.type} ${(r.people || []).map(x => x.p === 'bane' ? 'Ranger' : x.p === 'rocky' ? 'Hex' : x.p).join('+')} ${r.date} ${r.allday ? 'allday' : r.s + '-' + r.e} oil=${JSON.stringify(Object.fromEntries(Object.entries(r).filter(([k]) => /oil/i.test(k))))} acc=${r.acc || ''} [${r.iid}]`))
const oilMode = () => p.evaluate(() => { const b = document.querySelector('#sbOil'); return b ? { text: b.textContent.trim(), pressed: b.getAttribute('aria-pressed'), cls: b.className, visible: b.offsetWidth > 0 } : 'no #sbOil' })
const rd = async (label, extra = {}) => { const r = { step: label, store: await st(), screen: await A.screen(p), caret: await A.caret(p), oil: await oilMode(), note: await A.note(p), editable: await p.evaluate(() => [...document.querySelectorAll('#sbBoard > [data-secmove$=".unav"] [data-ifld]')].map(e => `${e.getAttribute('data-ifld')} ro=${e.readOnly} dis=${e.disabled}`)), ...extra }; steps.push(r); console.log('READ', J(r)); return r }
try {
  const w = await A.world(); p = w.page
  const iid = await L.fileInput(w, A.TAG, '2026-07-18', { type: 'OD', people: [L.RANGER, L.HEX], from: '08:00', to: '12:00' })
  if (!iid) throw new Error('the Saturday OD was not filed')
  await A.L.go(p, 'editsched'); await p.evaluate(() => window.openScheduler(5)); await sleep(900)
  await rd('filed, Sat 18 Jul on the Board')
  pics.push(await A.pic(w, 'X9-0-filed'))
  if (!(await p.locator(`#sbBoard > [data-secmove$=".unav"] [data-inprow^="${iid}"]`).count())) throw new Error('the Saturday OD is not under Unavailable')
  await A.tapBox(w, await A.boxSel(p, 'Ranger', 'end'), 'r-end-tap')
  await rd('caret in Ranger\'s End')
  let k0 = null
  if (!(await p.locator('#sbOil:visible').count())) {
    /* on a phone OIL Earn sits in the Board's "⋯" menu: that pressed first, keeping the caret */
    const more = await p.evaluate(() => { const b = document.querySelector('#sbMore'); if (!b || !b.offsetWidth) return null; b.setAttribute('data-ma-more', '1'); return b.id })
    if (!more) throw new Error('no OIL Earn control and no ⋯ menu on the Board: ' + J(await oilMode()))
    k0 = await A.keepPress(w, '[data-ma-more="1"]', 'X9-more')
    await rd('⋯ menu pressed', { keep: k0 })
  }
  /* the menu's own OIL Earn item (button.mbtn), or the bar's #sbOil where it is drawn */
  const oilSel = (await p.locator('#sbOil:visible').count()) ? '#sbOil' : await p.evaluate(() => { const b = [...document.querySelectorAll('button.mbtn')].find(b => b.offsetWidth && /OIL Earn/.test(b.textContent)); if (!b) return null; b.setAttribute('data-ma-oil', '1'); return '[data-ma-oil="1"]' })
  if (!oilSel) throw new Error('OIL Earn not shown after the ⋯ menu: ' + J(await oilMode()))
  const k = await A.keepPress(w, oilSel, 'X9-oil')
  await rd('OIL Earn pressed', { keep: k })
  pics.push(await A.pic(w, 'X9-1-oil-on', ['body']))
  if (!k.kept) { const again = await A.boxSel(p, 'Ranger', 'end'); await A.tapBox(w, again, 'r-end-retap'); await rd('caret put back in Ranger\'s End by a fresh tap') }
  await p.keyboard.press('Control+A'); await p.keyboard.type('1000'); await p.keyboard.press('Tab'); await sleep(700)
  await rd('1000 typed, Tab')
  pics.push(await A.pic(w, 'X9-2-after-1000-tab', ['body']))
  try { await A.away(w); await rd('blank tapped') } catch (e) { await rd('blank NOT tapped — the Unavailable heading the phone taps is not drawn in this mode: ' + e.message.slice(0, 80)) }
  pics.push(await A.pic(w, 'X9-3-caret-left'))
  A.res(ID, 'RECORD' + (k.kept ? '' : ' (caret lost at OIL Earn; put back by a fresh tap)'), { keep: k, final: steps.at(-1).store, steps }, pics)
  await w.ctx.close()
} catch (e) { A.res(ID, 'NOT WALKED', 'error: ' + e.message.split('\n')[0].slice(0, 400) + ' ' + J(steps).slice(0, 3000), pics) }
await A.fin(`x9-${process.env.KEEP || 'tap'}`)
