/* Survey: what controls the Tracker shows, desk and phone (trk-ur round, 2 Nov 26) */
import { open, toTracker, shot, log } from './trk-ur-lib.mjs'
console.log('trk-ur-survey v1')
const phone = process.env.UR_PHONE === '1'
const { browser, page, errors } = await open({ phone, who: process.env.UR_WHO || 'a' })
await toTracker(page)
await shot(page, 'survey-landing')
const ctl = await page.evaluate(() => {
  const out = []
  for (const el of document.querySelectorAll('#page-tracker button, #page-tracker select, #page-tracker input, #page-tracker [role=tab]')) {
    const r = el.getBoundingClientRect()
    if (r.width < 2 || r.height < 2) continue
    out.push({ tag: el.tagName, id: el.id, cls: String(el.className).slice(0, 40), t: (el.innerText || el.value || el.getAttribute('aria-label') || el.title || '').trim().slice(0, 30), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width) })
  }
  return out
})
for (const c of ctl.slice(0, 160)) log(JSON.stringify(c))
log('count', ctl.length, 'errors', errors)
await browser.close()
