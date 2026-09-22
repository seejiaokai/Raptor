/* [OIL-SEATS-CAN-EARN] walk — the LEAVE WAR side, step 10: the count against
   the money. The desk says how many men it stands for. The war says how many
   it paid. If those two numbers differ, a scheduler reading the board is being
   told the desk covers more men than it will ever credit — and he has no way
   to see which one is missing. */
import { open, board, oilMode, shot, go } from './lib.mjs'
import { allPucks, allSwitches, allChips } from './seat-lib.mjs'

const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-22-oil-seats'
const { browser, page, errors } = await open({ state: OUT + '/state-lw-published.json' })

await board(page, 6)
const chips = await allChips(page)
console.log('COUNT CHIPS on the published Sunday, mode OFF:')
for (const c of chips) console.log('  ', JSON.stringify(c.txt), '| item', c.item, '| ver', c.ver, '|', c.title)
await shot(page, 'LW-29-sunday-count-chips')

await oilMode(page, true); await page.waitForTimeout(600)
const sw = (await allSwitches(page)).find(s => /SUN DESK/.test(s.txt))
const crowd = (await allPucks(page)).filter(p => p.item === sw.item)
console.log('\nthe desk OPENS into', crowd.length, 'pucks;', crowd.filter(p => p.on).length, 'of them lit as paid')
console.log('names:', crowd.map(p => p.cs + (p.on ? '' : '(off)')).join(' '))
await oilMode(page, false)

await go(page, 'leavewar'); await page.waitForTimeout(2000)
const paid = await page.evaluate(() => {
  const o = []
  for (const r of document.querySelectorAll('[data-testid^="row-"]')) {
    const id = r.getAttribute('data-testid').slice(4)
    const c = document.querySelector(`[data-testid="cell-${id}-2026-07-19"]`)
    const n = r.querySelector(`[data-testid="person-${id}"]`)
    const t = c ? (c.innerText || '').replace(/\s+/g, ' ').trim() : ''
    if (/FO|HO/.test(t)) o.push((n ? n.innerText : id).replace(/\s+/g, ' ').trim().split(' ')[0])
  }
  return o
})
console.log('\nthe war paid', paid.length, 'men on 19 Jul:', paid.join(' '))
const crowdNames = crowd.map(p => p.cs)
console.log('\nin the desk\'s crowd but NOT paid:', crowdNames.filter(n => !paid.includes(n)).join(' ') || 'none')
console.log('paid but not in the desk\'s crowd:', paid.filter(n => !crowdNames.includes(n)).join(' ') || 'none')
console.log('\nerrors:', errors.slice(0, 8))
await browser.close()
