import { world, sleep, go } from './aa-B-lib.mjs'
const w = await world('desk')
const { page } = w
const ppl = await page.evaluate(() => Object.entries(window.PEOPLE).map(([id, p]) => `${id}:${p.cs}:${p.cat || ''}:${p.seat || p.role || ''}:${p.grp || p.type || ''}:${Object.keys(p).join('|')}`).slice(0, 80))
console.log(ppl.join('\n'))
console.log(JSON.stringify(await page.evaluate(() => window.INPUTS.filter(i => /^2026-07-(1[3-9])/.test(i.d1 || i.date || '') || true).slice(0, 4))))
console.log(JSON.stringify(await page.evaluate(() => window.DAYS[5].ground.slice(0, 3))))
await w.browser.close()
