/* [OIL-SEATS-CAN-EARN] walk — the LEAVE WAR side: WHO the crowd stands for.
   Two questions the figures raised. Why one man reads a full day on a three
   hour Sunday, and whether the ground crew — who are on the roster and can be
   put on a desk BY NAME — are inside a placeholder's crowd or outside it.
   A man the app will pay when named and will not pay when swept up is an
   inconsistency, not a preference. */
import { open, board, oilMode, readDay, STATE } from './lib.mjs'
import { allPucks, allSwitches } from './seat-lib.mjs'

const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-22-oil-seats'
const { browser, page, errors } = await open({ state: OUT + '/state-lw-published.json' })

await board(page, 6)
const R6 = await readDay(page, 6)
console.log('SUNDAY duties as published:', JSON.stringify(R6.duties))
console.log('SUNDAY ground:', JSON.stringify(R6.ground), 'prog:', JSON.stringify(R6.prog))

await oilMode(page, true)
await page.waitForTimeout(500)
const items = await allSwitches(page)
const pucks = await allPucks(page)
const byItem = {}
for (const p of pucks) (byItem[p.item] = byItem[p.item] || []).push(p.cs + (p.on ? '' : '(off)'))
for (const it of items) console.log('  SUN item', JSON.stringify(it.txt), it.state, '->', (byItem[it.item] || []).length, 'men:', (byItem[it.item] || []).join(' ').slice(0, 300))
await oilMode(page, false)

/* Is a ground crewman offered at a duty desk at all? If the palette offers him
   there, the app is willing to pay him for a desk — and a crowd that leaves
   him out is paying two different answers to the same question. */
const gnd = await page.evaluate(() => Object.entries(window.PEOPLE)
  .filter(([, p]) => p.seat === 'gnd' || p.pers).map(([id, p]) => ({ id, cs: p.cs, seat: p.seat, pers: !!p.pers })))
console.log('\nGROUND CREW on the roster:', JSON.stringify(gnd))
await board(page, 6)
const offered = await page.evaluate(async () => {
  const el = document.querySelector('#schedBoard [data-fill]')
  return el ? el.getAttribute('data-fill') : null
})
console.log('a duty fill zone exists:', offered)
await browser.close()
console.log('errors:', errors.slice(0, 6))
