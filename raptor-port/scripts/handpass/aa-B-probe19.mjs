import { world, pic, sleep, go, openBoard } from './aa-B-lib.mjs'
const w = await world('desk'); w.tag = 'p19'
const { page } = w
await openBoard(page, 4)
await page.locator('#schedBoard [data-wvadd="4"]').first().click(); await sleep(500)
await page.getByRole('button', { name: 'Flying wave', exact: true }).first().click(); await sleep(900)
console.log(await page.evaluate(() => JSON.stringify(window.DAYS[4].waves.map(wv => ({ label: wv.label, f: wv.formations.map(f => ({ cs: f.cs, msn: f.msn, to: f.to, ld: f.ld, n: f.aircraft.length })) })))))
console.log(await page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-bfld^="f"], #schedBoard [data-bfld^="4."], #schedBoard [data-slot^="4.0"]')].map(e => (e.dataset.bfld || e.dataset.slot)).slice(0, 30)))
await pic(w, 'flywave')
await w.browser.close()
