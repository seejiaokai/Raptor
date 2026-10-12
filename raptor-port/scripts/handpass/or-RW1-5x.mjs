// RW1-5 explore: the Inputs List's row of tools (desktop, Saber) - read-only listing
import { launch, openWorld, shotP, log, errs } from './or-RW1-lib.mjs'
const browser = await launch()
const { page: p } = await openWorld(browser)
await p.evaluate(() => window.go('inputs'))
await p.waitForTimeout(600)
await p.locator('#inListBtn').click(); await p.waitForTimeout(500)
const tools = await p.evaluate(() => {
  const root = document.querySelector('#page-inputs')
  const out = []
  for (const b of root.querySelectorAll('button, select, input, [role=button]')) {
    if (!b.offsetParent) continue
    const r = b.getBoundingClientRect()
    if (r.top > 330) continue
    out.push({ tag: b.tagName, id: b.id, text: (b.innerText || b.value || b.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 40), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) })
  }
  return out
})
for (const t of tools) log(t)
log('export text anywhere?', await p.evaluate(() => /export to excel|export/i.test(document.querySelector('#page-inputs').innerText) ? [...document.querySelectorAll('#page-inputs *')].filter(e => /export/i.test(e.textContent) && e.children.length === 0).map(e => e.tagName + '#' + e.id + ':' + e.textContent.trim().slice(0, 40)) : 'none'))
await shotP(p, 'rw1-5x-list-desktop', { x: 0, y: 0, width: 1440, height: 420 })
log('errs', errs)
await browser.close()
