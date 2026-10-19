import { launch, ctxOpen, sleep, go, shot, openBoard, addStandby, seat, bf, bType, status, errors, chips, summ, pressChip, waveShot, bPublish, topShot, pending, toTop, undo, redo, rec, oilRead, reload, dayBadge, histTab, cxRow } from './sf-A-lib.mjs'
console.log('sf-A-s04 v1')
const b = await launch()
const DI = 5
const cx = async (p, gi, r) => cxRow(p, DI, gi, 0, r)
async function mk(tag, { R = false, pub = true } = {}) {
  const { ctx, p } = await ctxOpen(b, tag)
  const gi = await addStandby(p, DI, 'sc')
  const seated = await seat(p, DI, gi, [[0, 0], [0, 1], [0, 2], [0, 3]])
  await openBoard(p, DI)
  if (R) await bType(p, bf(DI, gi, 0, 'rl'), '0630')
  return { ctx, p, gi, names: seated.map(s => s[2]) }
}
const rd = async (w) => {
  const { p, gi, names } = w
  const c = await chips(p, DI, gi, 0)
  const badge = (await dayBadge(p, DI)).badge
  const oil = (await oilRead(p)).filter(x => names.some(n => x.startsWith(n + ' '))).map(x => x.replace(/\s+/g, ' ')).join(' | ')
  const cxs = await p.evaluate(([d, g]) => window.DAYS[d].waves[g].formations[0].aircraft.map(a => !!(a.cx)), [DI, gi])
  const pend = (await pending(p)).filter(x => /pending/.test(x)).join(',')
  return { chips: summ(c), lit: c.map(x => x.chips.some(y => y.on) ? 1 : 0).join(''), chipN: c.map(x => x.chips.length).join(''), badge, oil, cxs: JSON.stringify(cxs), pend, c }
}
const fmt = r => `chips[${r.chips}] badge="${r.badge}" cx=${r.cxs} pend=${r.pend || '0'} OIL[${r.oil}]`

/* (a) R typed, publish, CX the SPARE row 0.2 */
{
  const w = await mk('s04a', { R: true }); const { p, gi } = w
  console.log('publish', JSON.stringify(await bPublish(p, DI)))
  const r0 = await rd(w)
  await cx(p, gi, 2)
  const r1 = await rd(w); const pic1 = await waveShot(p, DI, gi, 'A-4a-1-cx-spare')
  await topShot(p, 'A-4a-1-cx-top')
  rec('4a', 'Pub Sat, SC AM R 06:30 typed, CX the SPARE row (0.2)', 'his chip goes / not lit; badge drops one jet (4 -> 3); his OIL goes; the other three rows still fly', `before: ${fmt(r0)} || after CX: ${fmt(r1)}`, r1.lit.startsWith('11') && r1.lit[2] === '0' && r1.lit[3] === '1' && Number(r0.badge.match(/\d+/)[0]) - Number(r1.badge.match(/\d+/)[0]) === 1 && !/Drifter (HO|FO)/.test(r1.oil) ? 'PASS' : 'FAIL', pic1)
  await cx(p, gi, 2)
  const r2 = await rd(w)
  rec('4a', 'un-CX the row', 'back as before: lit 1111, badge as before, OIL back', `after un-CX: ${fmt(r2)}`, r2.lit === r0.lit && r2.badge === r0.badge ? 'PASS' : 'FAIL', await waveShot(p, DI, gi, 'A-4a-2-uncx'))
  await w.ctx.close()
}
/* (b) no R; tick by hand; publish; CX the ticked row; un-CX */
{
  const w = await mk('s04b'); const { p, gi } = w
  await pressChip(p, `${DI}.${gi}.0.2`)
  console.log('publish', JSON.stringify(await bPublish(p, DI)))
  const r0 = await rd(w)
  await cx(p, gi, 2)
  const r1 = await rd(w); const pic1 = await waveShot(p, DI, gi, 'A-4b-1-cx-ticked')
  await go(p, 'editsched'); await openBoard(p, DI)
  const st = await p.evaluate(([d, g]) => JSON.stringify(window.DAYS[d].waves[g].formations[0].aircraft[2]), [DI, gi])
  rec('4b', 'no R; tick the SPARE by hand, publish, then CX that row', 'he neither counts nor earns (badge one down, no OIL)', `ticked: ${fmt(r0)} || after CX: ${fmt(r1)}; row model ${st.slice(0, 200)}`, Number(r0.badge.match(/\d+/)[0]) - Number(r1.badge.match(/\d+/)[0]) === 1 && !/Drifter (HO|FO)/.test(r1.oil) ? 'PASS' : 'FAIL', pic1)
  await cx(p, gi, 2)
  const r2 = await rd(w)
  rec('4b', 'un-CX the ticked row', 'he flies again: the tick survived the cancel (chip lit, badge back, OIL back)', `after un-CX: ${fmt(r2)}`, r2.lit === r0.lit && r2.badge === r0.badge ? 'PASS' : 'FAIL', await waveShot(p, DI, gi, 'A-4b-2-uncx'))
  await w.ctx.close()
}
/* (c) CX first, then the tick on a cancelled row */
{
  const w = await mk('s04c'); const { p, gi } = w
  await cx(p, gi, 3)
  const r1 = await rd(w)
  const c3 = r1.c[3]
  const pic = await waveShot(p, DI, gi, 'A-4c-1-cx-first')
  let tried = 'no chip shown on the cancelled row'
  const btn = p.locator(`#schedBoard [data-safly="${DI}.${gi}.0.3"]:visible`)
  if (await btn.count()) { await btn.first().click().catch(e => tried = 'click failed ' + e.message.slice(0, 50)); await sleep(500); tried = 'pressed it' }
  const r2 = await rd(w)
  rec('4c', 'CX the 4th row first (no R), look for the dashed chip on it, press it if shown', 'RECORD whether the chip shows on a cancelled row; a press must never make it count', `after CX: chips[${r1.chips}] badge="${r1.badge}"; row chip detail ${JSON.stringify(c3.chips)}; ${tried}; after: chips[${r2.chips}] badge="${r2.badge}" OIL[${r2.oil}]`, 'RECORD', pic)
  await w.ctx.close()
}
/* (d) R typed, CX every row of the shift */
{
  const w = await mk('s04d', { R: true }); const { p, gi } = w
  await bPublish(p, DI)
  const r0 = await rd(w)
  for (let r = 0; r < 4; r++) await cx(p, gi, r)
  const r1 = await rd(w); const pic1 = await waveShot(p, DI, gi, 'A-4d-1-all-cx')
  rec('4d', 'R typed, CX all four rows of SC AM', 'no row flies; the badge loses the AM term; no OIL for the four', `before: ${fmt(r0)} || after: ${fmt(r1)}`, r1.lit === '0000' || r1.chipN === '0000' ? (Number(r1.badge.match(/\d+/)[0]) < Number(r0.badge.match(/\d+/)[0]) ? 'PASS' : 'FAIL') : 'FAIL', pic1)
  for (let i = 0; i < 4; i++) await undo(p)
  const u = await rd(w)
  rec('4d', 'Undo x4 (one CX each)', 'all four back to flying', `after undo x4: ${fmt(u)}`, u.lit === '1111' ? 'PASS' : 'FAIL', await waveShot(p, DI, gi, 'A-4d-2-undo'))
  for (let i = 0; i < 4; i++) await redo(p)
  const rr = await rd(w)
  await reload(p); await openBoard(p, DI)
  const rl = await rd(w)
  rec('4d', 'Redo x4 then reload', 'all cancelled again, same after reload', `redo: ${fmt(rr)} || reload: ${fmt(rl)}`, rr.chipN === rl.chipN && rr.badge === rl.badge ? 'PASS' : 'FAIL', await waveShot(p, DI, gi, 'A-4d-3-reload'))
  await w.ctx.close()
}
console.log('errors', JSON.stringify(errors))
await b.close()
