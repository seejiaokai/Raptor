import { world, pic, sleep, go, openBoard } from './aa-B-lib.mjs'
const w = await world('desk'); w.tag = 'p16'
const { page } = w
await openBoard(page, 4)
await page.locator('#schedBoard [data-wvadd="4"]').first().click(); await sleep(500)
await page.getByRole('button', { name: 'SC', exact: true }).first().click(); await sleep(900)
await pic(w, 'sc-added')
console.log(await page.evaluate(() => JSON.stringify(window.DAYS[4].waves.map(wv => ({ label: wv.label, kind: wv.kind, sa: wv.sa, f: wv.formations.map(f => ({ cs: f.cs, to: f.to, ld: f.ld, br: f.br, ac: f.aircraft.map(a => ({ p: a.p, w: a.w, role: a.role, spare: a.spare })) })) })))))
console.log(await page.evaluate(() => { const wv = document.querySelector('#schedBoard .sb-wave, #schedBoard .wave'); return [...document.querySelectorAll('#schedBoard [data-slot^="4."]')].map(e => e.dataset.slot + '|' + e.className).slice(0, 12) }))
await w.browser.close()
