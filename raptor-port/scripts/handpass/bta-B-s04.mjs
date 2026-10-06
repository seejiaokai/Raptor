/* S04 — Training, Custom 00:00–23:59 (and, in a second world, the All day tick) on Tuesday; put on the Ground Programme;
   X then on another blank flying line, duty row, sim row and SC MAIN seat. Usage: node bta-B-s04.mjs [custom|allday|both] */
import * as T from './bta-B-lib.mjs'
import * as Q from './bta-B-lib2.mjs'
const { K, B, C, D, L, W, ID, CSN, TUE, sleep, R, pic } = T
const t = T.mk('s04')
const which = process.argv[2] || 'both'
const TAGP = T.PHONE ? 'ph' : 'dk'

async function one(tag, cfg, idp) {
  const { browser, p, errors } = await K.fresh()
  try {
    await Q.walkInput(p, { type: 'Training', tag, ...cfg }, t, idp)
    let n = 0
    await Q.onSeat(p, t, `${idp}.2`, tag, 'a new flying line (+ Wave → Flying wave, no times)', async () => { const b = await T.blankLine(p, TUE); return `took ${b.took}` }, /Training clashes/, 'flying line', 1, 1)
    await Q.onSeat(p, t, `${idp}.3`, tag, 'a new duty desk row ("+ Row", no name, no times)', async () => { const r = await T.blankRow(p, 'duty', TUE); return `took ${r.took}` }, /Training but tasked — this row/, 'duty', 1, 1)
    await Q.onSeat(p, t, `${idp}.4`, tag, 'a new sim row ("+ Row" on the AMT block, no name, no times)', async () => { const r = await T.blankRow(p, 'sim', TUE); return `took ${r.took}` }, /Training but tasked — this row/, 'sim', 1, 1)
    await Q.onSeat(p, t, `${idp}.5`, tag, 'an SC MAIN seat (+ Wave → SC, shift start and end cleared)', async () => { const s = await Q.scMainBlank(p, TUE); return `shift ${s.times}; took ${s.took}` }, /Training but tasked — SC/, 'flying line', 2, 1)
    const re = await T.see(p, `${tag}-6-all`)
    t.add(`${idp}.6`, `${tag}: the whole Tuesday list for ${CSN} with all five seats placed`, T.says(re, 220), re.held.filter(x => /Training/.test(x)).length === 3 ? 'PASS' : 'FAIL', re.pics)
  } catch (e) { R(`${idp}.X`, 'script', String(e.stack || e).slice(0, 700), 'FAIL', [await pic(p, `${tag}-X`)]) }
  R(`${idp}.err`, `${tag}: browser errors`, errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}
if (which === 'custom' || which === 'both') await one('Custom-0000-2359', { allday: false, span: 'custom', from: '00:00', to: '23:59' }, `S04-${TAGP}-custom`)
if (which === 'allday' || which === 'both') await one('Allday-tick', { allday: true }, `S04-${TAGP}-allday`)
T.done('bta-B-s04' + '-' + which)
