/* RE-WALK 1 — D49's MARK, ON THE LINE, and the tap that lands on it.
   The walk's rules-sweep FAIL 3: the line's own boxes were byte-for-byte a
   correct line's, and tapping the warning moved nothing.
   Walked on the board (a weekend day AND a weekday), the edit week and the view
   week, because the ruling says "on the line, on any day". */
import { open, board, type, shot, go, STATE } from './lib.mjs'

const { browser, page, errors } = await open({ state: STATE })

const readMarks = (where) => page.evaluate((w) => {
  const root = document.querySelector(w) || document
  const m = [...root.querySelectorAll('.badtm')].filter(e => e.offsetParent !== null)
  return {
    n: m.length,
    boxes: m.map(e => ({
      tag: e.tagName,
      cls: e.className.slice(0, 40),
      addr: e.dataset.warnkey || e.dataset.bfld || '',
      says: (e.getAttribute('title') || '').slice(0, 70),
      value: (e.value != null ? e.value : (e.innerText || '')).replace(/\s+/g, ' ').trim().slice(0, 18),
    })),
  }
}, where)

for (const [di, what, g, l] of [[5, 'SATURDAY', 0, 0], [2, 'WEDNESDAY', 0, 0]]) {
  console.log('\n######', what, '— the board ######')
  await board(page, di)
  const before = await readMarks('#schedBoard')
  console.log('marks BEFORE the times are made the same:', before.n)
  await type(page, `[data-bfld="ff:${di}.${g}.${l}.ld"]`,
    await page.evaluate(([i, gg, ll]) => window.DAYS[i].waves[gg].formations[ll].to, [di, g, l]))
  await page.waitForTimeout(800)
  const after = await readMarks('#schedBoard')
  console.log('marks AFTER:', after.n)
  for (const b of after.boxes) console.log('   ', JSON.stringify(b))
  await shot(page, `RW-01-board-day${di}-marked`)

  /* the tap */
  const w = await page.evaluate(() => [...document.querySelectorAll('.wln')].filter(e => e.offsetParent !== null)
    .map(e => (e.innerText || '').replace(/\s+/g, ' ').slice(0, 80)))
  const hit = w.findIndex(x => /takes off and lands at the same time/.test(x))
  console.log('the warning row is at index', hit)
  if (hit >= 0) {
    const landed = await page.evaluate((i) => {
      const els = [...document.querySelectorAll('.wln')].filter(e => e.offsetParent !== null)
      const root = document.querySelector('#schedBoard .sb-boardwrap') || document
      /* resolve the same way the app's own warn-focus does */
      const key = (window.WARN && window.WARN.all || []).find(x => x.code === 'FLT_NO_LEN')
      els[i].click()
      const a = key ? root.querySelector(`[data-warnkey="${key.key}"]`) : null
      return { key: key ? key.key : '(no warning)', resolved: !!a, cls: a ? a.className : '', addr: a ? (a.dataset.bfld || '') : '' }
    }, hit)
    console.log('the tap:', JSON.stringify(landed))
    await page.waitForTimeout(700)
    await shot(page, `RW-01-board-day${di}-tapped`)
  }
}

console.log('\n###### the EDIT WEEK ######')
await go(page, 'editsched')
await page.waitForTimeout(900)
console.log(JSON.stringify(await readMarks('#eWeek'), null, 1))
await shot(page, 'RW-01-editweek-marked')

console.log('\n###### the VIEW WEEK ######')
await go(page, 'viewsched')
await page.waitForTimeout(900)
console.log(JSON.stringify(await readMarks('#vWeek'), null, 1))
await shot(page, 'RW-01-viewweek-marked')

console.log('\nerrors:', errors.slice(0, 6))
await browser.close()
