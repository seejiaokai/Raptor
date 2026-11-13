/* d-03-probe-sim v1 — probe: Friday's sim and duty rows, their box keys and seats. */
process.env.HP_URL ||= 'http://localhost:4174'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-11-13-rules-check-small-batch/d2028/probe2'
console.log('d-03-probe-sim v1', process.env.HP_SHOTS)
const D = await import('./d-lib.mjs')
const { X, L, sleep, j, FRI } = D
const w = await D.world('pc')
const { page } = w
await L.board(page, FRI)
const n0 = await page.evaluate(i => window.DAYS[i].sims.oft.length, FRI)
await X.press(w, `[data-sradd="${FRI}.oft"]`)
await sleep(800)
console.log('oft rows', n0, '->', await page.evaluate(i => window.DAYS[i].sims.oft.length, FRI))
console.log('sim rows', await page.evaluate(i => JSON.stringify(window.DAYS[i].sims.oft), FRI))
console.log('keys', await page.evaluate(() => [...document.querySelectorAll('#schedBoard .simr [data-bfld], #schedBoard .simr [data-slot], #schedBoard .simr [data-fill]')].filter(e => e.offsetWidth).map(e => (e.dataset.bfld || e.dataset.slot || e.dataset.fill)).join(' ')))
console.log('duty rows', await page.evaluate(i => JSON.stringify(window.DAYS[i].dutywaves.map(b => b.rows.map(r => [r.role, r.str, r.end, r.id]))), FRI))
console.log('duty keys', await page.evaluate(() => [...document.querySelectorAll('#schedBoard .duty [data-bfld], #schedBoard [data-fill^="d:"], #schedBoard [data-slot^="d:"]')].filter(e => e.offsetWidth).map(e => (e.dataset.bfld || e.dataset.slot || e.dataset.fill)).slice(0, 20).join(' ')))
await D.shot(page, 'p2-sim')
await w.browser.close()
