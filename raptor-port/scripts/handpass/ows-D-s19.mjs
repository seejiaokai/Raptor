/* S19 — saved plans do not retain issued-day rule authority: plan A (IN TIME 08:30) signed, plan B (IN TIME 10:00), debrief changed under B, back to A */
import * as D from './ows-D-lib.mjs'
const { world, sleep, A, R, W, L, P, judge, pend, signsOf, ISO } = D
const SAT = 5
const log = (...a) => console.log('>>', ...a)
const allErrors = []
async function planMenuItems(p) {
  await A.toWeek(p); await W.showDay(p, SAT)
  const m = p.locator(`#eWeek [data-planmenu="${SAT}"]:visible`).first()
  await m.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await m.click(); await sleep(500)
  return p.evaluate(() => [...document.querySelectorAll('[data-plansel],[data-plangolive],[data-plandup]')].filter(e => e.offsetParent !== null).map(e => ({ sel: e.dataset.plansel || (e.dataset.plangolive !== undefined ? 'LIVE' : 'DUP'), text: (e.innerText || '').replace(/\s+/g, ' ').trim() })))
}
async function pickPlan(p, which) {
  const items = await planMenuItems(p)
  const it = items.find(i => which(i))
  if (!it) { await p.keyboard.press('Escape'); return { err: 'no such plan', items } }
  const sel = it.sel === 'LIVE' ? `[data-plangolive]` : it.sel === 'DUP' ? `[data-plandup]` : `[data-plansel="${it.sel}"]`
  await p.locator(`${sel}:visible`).first().click(); await sleep(900)
  return { items, picked: it }
}
const planLabel = p => p.evaluate(i => ((document.querySelector(`#eWeek [data-planmenu="${i}"] .psl`) || {}).innerText || '').trim(), SAT)
const itLine = p => p.evaluate(i => (window.DAYS[i].waves[0].intimes || []).slice(), SAT)
async function head(p, tag) {
  await A.toWeek(p); await W.showDay(p, SAT)
  const h = await A.dayHead(p, SAT)
  h.pending = await p.evaluate(i => { const c = document.querySelector(`#eWeek .day[data-day="${i}"] .dpend:not(.dnew):not(.dchg)`); return c && c.offsetParent !== null ? c.innerText.replace(/\s+/g, ' ').trim() : '' }, SAT)
  h.pic = await P(p, tag)
  return h
}
async function figs(p) {
  await A.toBoard(p, SAT); await D.oilMode(p, true)
  const f = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .puck[data-person="bane"]')].filter(e => e.offsetParent !== null && !e.closest('#sbRoster')).map(e => e.innerText.replace(/\s+/g, ' ').trim()))
  const pc = await P(p, 'S19-mode')
  await D.oilMode(p, false); await A.closeBoard(p)
  return { f, pc }
}
async function cellNone(p) { await A.lwOpenMonth(p, 'JUL'); const c = await A.lwCellOf(p, 'bane', ISO[SAT]); return c }

/* ===== Run 1: A is the one published ===== */
{
  const { browser, p, errors } = await world()
  await L.go(p, 'editsched'); await sleep(300)
  const w = await D.flyingWave(p, SAT, { cs: 'VIPER', to: '12:00', ld: '13:00', p1: 'bane' })
  await A.closeBoard(p); await A.toWeek(p); await W.showDay(p, SAT)
  await A.addItBtn(p, SAT, w.wi); await A.setItLine(p, SAT, w.wi, 0, 'IN TIME 0830')
  log('A line', JSON.stringify(await itLine(p)))
  /* "+ Alt Plan": a copy of the day, now the live one; give it IN TIME 10:00 */
  const dup = await pickPlan(p, i => i.sel === 'DUP')
  const lblB = await planLabel(p)
  await A.toWeek(p); await W.showDay(p, SAT)
  await A.setItLine(p, SAT, w.wi, 0, 'IN TIME 1000')
  log('plan now live:', lblB, 'line', JSON.stringify(await itLine(p)))
  const items1 = await planMenuItems(p); await p.keyboard.press('Escape'); await sleep(300)
  log('plans offered', JSON.stringify(items1))
  /* switch to A (the other editable copy) and sign it */
  const swA = await pickPlan(p, i => i.sel !== 'DUP' && i.sel !== 'LIVE' ? true : (i.sel === 'LIVE' ? false : false))
  log('switched to', JSON.stringify(swA.picked), '→ label', await planLabel(p), 'line', JSON.stringify(await itLine(p)))
  const lineA = (await itLine(p))[0]
  await A.toWeek(p); await W.showDay(p, SAT)
  const sA = await W.signDay(p, SAT)
  const hA = await head(p, 'S19-A-signed')
  const fA = await figs(p)
  log('A signed:', JSON.stringify(sA), 'selects', signsOf(hA), 'figs', JSON.stringify(fA.f))
  /* switch to B */
  const swB = await pickPlan(p, i => i.sel === 'LIVE' ? false : i.sel !== 'DUP' && !/10|1000/.test('') && true)
  log('after switching again:', JSON.stringify(swB.picked), 'label', await planLabel(p), 'line', JSON.stringify(await itLine(p)), 'items', JSON.stringify(swB.items))
  const lineNow = (await itLine(p))[0]
  const hB0 = await head(p, 'S19-B-selected')
  const fB = await figs(p)
  const c1 = await cellNone(p)
  /* the debrief changes while B is live */
  const set = await A.logicSet(p, 'debrief', '2h30')
  /* back to A */
  const items3 = await planMenuItems(p); log('plans offered now', JSON.stringify(items3))
  const back = items3.find(i => /1000|10:00/.test('') ? false : (i.sel !== 'DUP' && i.sel !== (swB.picked && swB.picked.sel)))
  await p.keyboard.press('Escape'); await sleep(300)
  const goA = await pickPlan(p, i => i.sel !== 'DUP' && i.sel !== (swB.picked && swB.picked.sel) && (i.sel === 'LIVE' ? !!swB.picked && swB.picked.sel !== 'LIVE' : true))
  const lineBack = (await itLine(p))[0]
  log('back on', JSON.stringify(goA.picked), 'label', await planLabel(p), 'line', lineBack)
  const hA2 = await head(p, 'S19-A-back')
  const fA2 = await figs(p)
  const c2 = await cellNone(p)
  log('A back: selects', signsOf(hA2), 'nys', hA2.nys, 'figs', JSON.stringify(fA2.f), 'cell', JSON.stringify(c2))
  /* publish A: sign again, publish */
  const pub = await A.publishNew(p, SAT); await A.closeBoard(p)
  const o = await D.oilOf(p, 'bane', ISO[SAT], 'S19-A-published')
  log('A published: cell', o.cell.text, '| row', o.row.slice(0, 200))
  judge('S19.A', 'two plans of Saturday: A = IN TIME 08:30 (signed), B = a copy of the day made with "+ Alt Plan" and given IN TIME 10:00; on B the Logic debrief 2h → 2h30; back to A; then sign four and Publish', [
    ['plan A carries IN TIME 08:30, plan B IN TIME 10:00', /0?8:?30/.test(lineA || '') && /1000|10:00/.test(lineNow || ''), { A: lineA, B: lineNow }],
    ['A was signed (four names set)', W.signsFull(hA), hA.signs],
    ['OIL Earn shows FO for A and HO for B', /FO/.test(fA.f.join(' ')) && /HO/.test(fB.f.join(' ')), { A: fA.f, B: fB.f }],
    ['selecting plans pays nothing (Leave War empty after the switch to B and after returning to A)', !/FO|HO/.test(c1.text) && !/FO|HO/.test(c2.text), { b: c1.text, a: c2.text }],
    ['A is live again', /0?8:?30/.test(lineBack || ''), lineBack],
    ["A's old signatures no longer stand (the four selects are empty)", W.signsEmpty(hA2), hA2.signs],
    ['A published: FO, worked 08:30–15:30 (420 min with the new 2h30 debrief)', o.letters === 'FO' && /08:30.15:30/.test(o.row), `${o.cell.text} | ${o.row.slice(0, 160)}`],
  ], [hA.pic, fA.pc, hB0.pic, fB.pc, hA2.pic, fA2.pc, ...o.pics])
  allErrors.push(...errors); await browser.close()
}
console.log('ERRORS', JSON.stringify(D.cleanErr(allErrors)))
D.savePart('ows-D-s19', { errors: D.cleanErr(allErrors), pics: D.pics.saved })
