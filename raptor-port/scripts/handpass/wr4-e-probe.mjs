// Walker e — a read-only probe: what empty places Monday draws on the week and the board (no gesture).
console.log('wr4-e-probe v1')
const E = await (await import('./wr4-e-common.mjs')).setup('probe')
const { newPage, signIn, go, sleep, finish } = E
const w = await newPage('desk'); await signIn(w, 'ad')
await go(w.page, 'editsched')
const read = root => w.page.evaluate(root => [...document.querySelectorAll(root + ' [data-slot], ' + root + ' [data-fill]')].filter(e => e.getBoundingClientRect().width > 3 && !e.querySelector('.puck[data-person]')).slice(0, 25).map(e => ({ slot: e.getAttribute('data-slot'), fill: e.getAttribute('data-fill'), cls: String(e.className).slice(0, 50), drag: e.getAttribute('data-drag') })), root)
console.log('week', JSON.stringify(await read('#eWeek')))
await w.page.evaluate(() => window.openScheduler(0)); await w.page.waitForSelector('#schedBoard'); await sleep(900)
console.log('board', JSON.stringify(await read('#schedBoard')))
await finish()
