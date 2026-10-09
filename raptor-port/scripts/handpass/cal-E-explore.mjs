import { launch, world, shot, SIZES } from './cal-E-lib.mjs'
import { writeFileSync } from 'node:fs'
const b = await launch()
const out = {}
for (const size of ['desk', 'phone']) {
  const w = await world(b, size); const p = w.page
  out[size] = await p.evaluate(() => [...document.querySelectorAll('button, a')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.top < 80 }).map(e => (e.id || '') + '|' + (e.dataset.page || e.dataset.pg || '') + '|' + e.textContent.trim().slice(0, 20) + '|' + e.className.toString().slice(0, 20)))
  if (size === 'phone') {
    await p.locator('button').first().click().catch(() => {})
    await shot(p, 'explore-phone-menu')
    out.phoneMenu = await p.evaluate(() => [...document.querySelectorAll('button, a')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && /Inputs/.test(e.textContent) }).map(e => (e.id || '') + '|' + e.tagName + '|' + e.textContent.trim().slice(0, 20) + '|' + e.className.toString().slice(0, 30)))
  }
  await w.ctx.close()
}
writeFileSync('C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/8bd22da8-eddf-41f4-a0b3-4f89d1b5d57c/scratchpad/e-explore.json', JSON.stringify(out, null, 1))
await b.close()
