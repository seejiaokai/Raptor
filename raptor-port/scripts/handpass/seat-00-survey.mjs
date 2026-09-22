/* [OIL-SEATS-CAN-EARN] walk — survey.
   What the saved everything-Saturday carries on THIS build, so the roll-call
   knows which seats already exist and which must be created by hand. */
import { open, board, readDay, oilMode, STATE, SHOTS } from './lib.mjs'

const { browser, page, errors } = await open({ state: STATE })
const days = await page.evaluate(() => window.DAYS.map((d, i) => ({
  i, date: d.date, pub: !!(d.issued || d.published || d.pub), keys: Object.keys(d).slice(0, 40),
})))
console.log('SHOTS =', SHOTS)
console.log('DAYS:'); for (const d of days) console.log(' ', d.i, d.date, 'pub=' + d.pub)
console.log('day0 keys:', days[0].keys.join(','))

const di = 5
await board(page, di)
const R = await readDay(page, di)
console.log('\n--- DAY', di, '---')
console.log('waves:', JSON.stringify(R.waves, null, 1).slice(0, 2600))
console.log('duties:', JSON.stringify(R.duties, null, 1).slice(0, 1400))
console.log('sims:', JSON.stringify(R.sims, null, 1).slice(0, 900))
console.log('ground:', JSON.stringify(R.ground, null, 1).slice(0, 900))
console.log('prog:', JSON.stringify(R.prog, null, 1).slice(0, 700))
console.log('version chip:', R.version, '| pending:', R.pending)
console.log('errors:', errors.slice(0, 6))
await browser.close()
