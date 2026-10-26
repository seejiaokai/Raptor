// exploration only: the open-dates window, a day holding two entries, member storageState
const M = await import('./lw-m3b-w1-lib.mjs')
const { L, T } = M
const w = await M.start('phone')
const P = w.page
await L.press(w, T('open-chip')); await P.waitForTimeout(600)
console.log('open-dates tids:', JSON.stringify(await P.evaluate(() => [...document.querySelectorAll('[data-testid^="od-"], [data-testid="open-dates"]')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.dataset.testid))))
console.log('text:', await L.txt(P, T('open-dates')))
await M.settled(w, 'x-explore-open')
const mk = await P.evaluate(() => [...document.querySelectorAll('[data-testid^="od-month-"]')].map(e => e.dataset.testid))
console.log('months', mk)
await L.press(w, T('od-month-2026-11')); await P.waitForTimeout(500)
console.log('after month press text:', await L.txt(P, T('open-dates')))
console.log('tids:', JSON.stringify(await P.evaluate(() => [...document.querySelectorAll('[data-testid^="od-"]')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.dataset.testid))))
await M.settled(w, 'x-explore-open2')
console.log('errs', w.errs)
await w.ctx.close(); await M.closeBrowser()
