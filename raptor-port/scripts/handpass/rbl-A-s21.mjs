/* S21 — change the cause elsewhere: Monday's late end is a ground event / Common Programme item / duty desk row / sim row / typed input, one at a time,
   with a blank crewed flight drawn earlier in Monday's order; edit its end, then delete it. Walker A. */
import * as K from './rbl-A-lib.mjs'
const { B, W, L, R, X, MON, TUE, chk, whole, clean } = K
const id = 'S21'
const which = (process.argv[2] || 'ground,prog,duty,sim,input').split(',')
const { browser, p, errors } = await K.fresh()
try {
  const cs = await B.csOf(p, X)
  /* Monday: a blank flight with X, nothing else; Tuesday: ZT 07:00-08:00 Brief 05:00 */
  const bl = await K.addFlyWave(p, MON); const sbl = await K.seat(p, MON, bl.gi, 0, 0, 'w', X)
  const t = await K.wave(p, TUE, 'ZT', 'BFM', '07:00', '08:00', X, '05:00')
  await chk(p, `${id}.0`, `Monday: only a blank flight with ${cs} (took ${sbl.took}); Tuesday ZT 07:00-08:00, Brief 05:00, ${cs} aboard — nothing to break rest yet`, s => !s.breach && clean(s), { monPic: false })
  const noDebrief = s => !/debrief/i.test(K.restText(s) || '')
  for (const kind of which) {
    if (kind === 'input') continue
    const row = await K.addRow(p, kind, MON, `WALK ${kind.toUpperCase()}`, '20:00', '22:30', X)
    const det = `${row.label} #${row.ri}: ${cs} placed (took ${row.took})`
    await chk(p, `${id}.${kind}.1`, `Monday ${det} 20:00-22:30 — a late end that is NOT a flight, the blank flight still drawn first`, s => whole(s) && /ended 22:30/.test(K.restText(s) || '') && /4h30|6h30/.test(K.restText(s) || '') && noDebrief(s) && clean(s), { monPic: true })
    await K.setRow(p, kind, MON, row.ri, 'end', '23:30')
    await chk(p, `${id}.${kind}.2`, `its end edited to 23:30`, s => whole(s) && /ended 23:30/.test(K.restText(s) || '') && noDebrief(s) && clean(s), { monPic: true })
    await K.delRow(p, kind, MON, row.ri)
    await chk(p, `${id}.${kind}.3`, `the row deleted with its own ✕: only the blank flight is left on Monday`, s => !s.breach && !s.dotMon && clean(s), { monPic: true })
  }
  if (which.includes('input')) {
    const { fileTimed } = await import('./p6-lib.mjs')
    await L.go(p, 'inputs'); await p.waitForSelector('#inType', { timeout: 8000 })
    const types = await p.evaluate(() => [...document.querySelectorAll('#inType option')].map(o => o.value + '=' + o.textContent.trim()))
    console.log('types', JSON.stringify(types))
    const tname = (types.find(t => /meeting/i.test(t)) || types.find(t => /appoint/i.test(t)) || '').split('=')[0]
    const iid = await fileTimed(L, p, { person: X, type: tname, iso: '2026-07-13', from: '20:00', to: '22:30', remarks: 'walk cause' })
    await chk(p, `${id}.input.1`, `Monday typed input (${tname}) 20:00-22:30 for ${cs} through the Inputs form (filed ${iid})`, s => whole(s) && /ended 22:30/.test(K.restText(s) || '') && noDebrief(s) && clean(s), { monPic: true })
    if (iid) {
      const W2 = await import('./dbrA-W2-lib.mjs')
      await W2.delReq(p, iid)
      await chk(p, `${id}.input.3`, `the input deleted from the Inputs page`, s => !s.breach && clean(s), { monPic: true })
    }
  }
} catch (e) { R(`${id}.script`, 'script', String(e.stack || e).slice(0, 700), 'FAIL', [await B.pic(p, `${id}-X`)]) }
await K.wrap('rbl-A-s21', browser, errors, id)
