/* W3 probe (26 Sep 26): publish Sat 18 Jul on a fresh demo (the board's own sign-offs and Publish day) and read who the
   war credits there, and every row's 16–19 Jul — to choose the mixed rectangle's rows. Read only beyond the publish. */
process.env.AB_WHO = 'w3'
const L = await import('./ab-lib.mjs')
const S = await import('./ab-sched.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { lwOpen, rowRun, shot } = L
const { browser, page, errors } = await openHi({ width: 1440, height: 900, who: 'a', dpr: 1 })
const free = await S.freeMen(page, [3, 4, 5, 6])
console.log('free 16-19', free.join(' '))
const p = await S.pubOnBoard(page, 5)
console.log('pub', JSON.stringify(p.p), JSON.stringify(p.h).slice(0, 300))
await lwOpen(page, '2026-07-18')
const order = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="row-"]')].map(r => r.getAttribute('data-testid').slice(4)))
for (const id of order) {
  const r = await rowRun(page, id, ['2026-07-15', '2026-07-16', '2026-07-17', '2026-07-18', '2026-07-19', '2026-07-20'])
  console.log(id.padEnd(9), r.join(' '))
}
await shot(page, 'w3-00b-sat-published')
console.log('errors', errors.slice(0, 10))
await browser.close()
