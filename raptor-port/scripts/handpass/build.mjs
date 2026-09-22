/* Build the everything-Saturday and report what landed. */
import { open, shot, readDay, SHOTS, STATE } from './lib.mjs'
import { buildSaturday, fileInputFromBoard } from './fixture.mjs'

const di = 5
const { browser, page, errors } = await open({})
const t0 = Date.now()
const log = await buildSaturday(page, di)

// the five personal requests
const reqs = []
reqs.push(['Training Talisman 09-12 yes', await fileInputFromBoard(page, di, { person: 'haowen', type: 'Training', st: '09:00', en: '12:00', oil: 'yes' })])
reqs.push(['Duty Sidewinder all-day yes', await fileInputFromBoard(page, di, { person: 'mamba', type: 'Duty', allday: true, oil: 'yes' })])
reqs.push(['Meeting Gambit 13-14 NO', await fileInputFromBoard(page, di, { person: 'bruise', type: 'Meeting', st: '13:00', en: '14:00', oil: 'no' })])

const day = await readDay(page, di)
await shot(page, 'sat-built-desktop')
console.log('built in', Math.round((Date.now() - t0) / 1000) + 's')
console.log('SEATS:', JSON.stringify(log, null, 1))
console.log('REQUESTS:', JSON.stringify(reqs, null, 1))
console.log('DAY:', JSON.stringify({ waves: day.waves, duties: day.duties, sims: day.sims, ground: day.ground, prog: day.prog }, null, 1))
console.log('WARN:', JSON.stringify(day.warn, null, 1))
console.log('PUCKS:', JSON.stringify(day.pucks.map(p => `${p.who}:${p.bar || '-'}`), null, 1))
console.log('errors:', errors.slice(0, 6))
await page.context().storageState({ path: STATE })
console.log('world saved to ' + STATE)
console.log('shots in ' + SHOTS)
await browser.close()
