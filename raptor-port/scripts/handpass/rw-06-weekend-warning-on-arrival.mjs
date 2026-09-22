/* RE-WALK 6 — the weekend says it is unpublished FROM THE FIRST PAINT.
   The owner asked whether the speed check's failure was a real problem. It was,
   and it was not a speed problem: `validate()` ran at boot BEFORE the Leave War
   wire installed the hooks that say which days can earn, so `oilWouldEarn`
   answered false for every weekend and the advisory the owner asked for on
   20 Sep 26 was absent until something else was edited. */
import { open, go, shot } from './lib.mjs'
const { browser, page, errors } = await open({ fresh: true })
await go(page, 'editsched')
await page.waitForTimeout(1200)

const read = () => page.evaluate(() => {
  const out = {}
  for (let di = 0; di < 7; di++) {
    const g = window.WARN.byDay && window.WARN.byDay[di]
    out[di] = ((g && g.warns) || []).map(w => w.code)
  }
  return out
})

const first = await read()
console.log('ON ARRIVAL, before anything is touched:')
for (const di of [5, 6]) console.log(`   day ${di}: ${first[di].join(', ') || '(nothing)'}`)
await shot(page, 'RW-06-weekend-on-arrival')

await page.evaluate(async () => {
  const w = window
  const s = document.querySelector('#eWeek [data-day="1"] .seat[data-slot$=".p"]')
  const ids = Object.keys(w.PEOPLE).filter(x => !w.PEOPLE[x].special)
  w.fillSlot(s.dataset.slot, ids[9]); w.afterSchedMutate()
})
await page.waitForTimeout(300)
const after = await read()
console.log('\nAFTER a man is put on a TUESDAY seat:')
for (const di of [5, 6]) console.log(`   day ${di}: ${after[di].join(', ') || '(nothing)'}`)
console.log('\nthe weekend days changed:',
  [5, 6].some(di => JSON.stringify(first[di]) !== JSON.stringify(after[di])) ? 'YES — the bug' : 'no')
console.log('errors:', errors.slice(0, 5))
await browser.close()
