// Walker 2 — INCIDENTAL finding INC-1 (not one of my scenarios): the one-day window opened on a day that already holds a morning bid, to place the afternoon: the words typed for the afternoon land on the morning bid.
process.env.LW_OUT ||= '2026-10-25-lw-night/w2'
const H = await import('./lw-night-w2-lib.mjs')
const { L, T, sleep, warRecs } = H
const w = await L.newCtx('desk')
const P = w.page
await H.signInAs(w, 'admin')
const ids = await H.people(P)
const R = ids.Ridge, d = '2026-12-04'
await H.place(w, R, d, 'LL', { approve: false, portion: 'am', remarks: 'Am' })
await L.openCellR(w, R, d)
const open = await P.evaluate(() => ({ remarks: document.querySelector('[data-testid="bid-remarks"]')?.value, lit: [...document.querySelectorAll('[data-testid="bid-picker"] .lit, [data-testid="bid-picker"] [aria-pressed="true"]')].map(e => e.dataset.testid), text: document.querySelector('[data-testid="bid-picker"]').innerText.replace(/\s+/g, ' ').slice(0, 260) }))
console.log('window on a day holding a morning LL "Am":', JSON.stringify(open))
await L.shot(w, 'inc1-am-window-open')
await L.press(w, T('portion-pm'))
const afterPm = await P.evaluate(() => ({ remarks: document.querySelector('[data-testid="bid-remarks"]')?.value }))
console.log('after pressing PM: box reads', JSON.stringify(afterPm))
await L.press(w, T('bid-remarks')); await P.keyboard.type('Pm'); await sleep(w, 200)
console.log('typed Pm: box reads', await P.locator(T('bid-remarks')).inputValue())
await L.shot(w, 'inc1-pm-typed')
console.log('placed', await L.placeLeave(w, 'OL'))
console.log('records', JSON.stringify((await warRecs(P, R, d)).filter(r => r.kind === 'request').map(r => `${r.code}/${r.state}/"${r.remarks ?? ''}"`)))
await L.closeBrowser()
