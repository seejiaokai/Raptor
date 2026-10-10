const C = await import('./aa-C-lib.mjs')
const { world, fileInput, rec, shot, board, signDay, pubSat, sleep, go, L, pidOf } = C
const w = await world(); const { page } = w
const names = ['Ranger', 'Saber', 'Basher', 'Ace', 'Fable']
const ids = []
for (const n of names) ids.push(await pidOf(page, n))
console.log(JSON.stringify(ids))
console.log('before', JSON.stringify(await L.lwCell(page, ids.filter(Boolean), '2026-07-18')))
await shot(page, 'probe4-lw-before')
await fileInput(page, { iso: '2026-07-18', kind: 'Duty', person: 'allavail', s: '09:00', e: '12:00', rmk: 'S4 duty', oil: 'yes' })
await go(page, 'editsched'); await sleep(400)
console.log('unpub', JSON.stringify(await L.lwCell(page, ids.filter(Boolean), '2026-07-18')))
await go(page, 'editsched')
await pubSat(page, 5)
await C.closeBoard(page)
console.log('after', JSON.stringify(await L.lwCell(page, ids.filter(Boolean), '2026-07-18')))
await shot(page, 'probe4-lw-after')
console.log(JSON.stringify(w.errors))
await w.browser.close()
