// S16 issue half: short Yes -> half day, long Yes -> full day, No -> zero (read from the Leave War cells).
import { world, closeAll, toInputs, fileInput, pic, issue, lwMap, crowdCount } from './aa-A-lib.mjs'
for (const ph of ['allavail', 'all']) {
  for (const c of [{ k: 'short-yes', st: '09:00', en: '12:00', a: 'yes' }, { k: 'long-yes', st: '09:00', en: '16:00', a: 'yes' }, { k: 'no', st: '09:00', en: '12:00', a: 'no' }]) {
    const w = await world({ who: 'ad', size: 'd' })
    const { page } = w
    await toInputs(page)
    await fileInput(page, { iso: '2026-07-18', type: 'Duty', person: ph, remarks: `walkS16b ${ph} ${c.k}`, start: c.st, end: c.en, oil: c.a })
    await issue(page, 5)
    const m = await lwMap(page)
    const vals = {}; for (const t of Object.values(m)) vals[t] = (vals[t] || 0) + 1
    console.log(ph, c.k, 'Leave War cells on Sat 18 Jul:', JSON.stringify(vals), 'Ace=', m['Ace'], 'errs', JSON.stringify(w.errs))
    await pic(page, `s16b-${ph}-${c.k}`)
    await w.ctx.close()
  }
}
await closeAll()
