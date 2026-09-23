/* w3 probe: the bar as drawn at both widths, and what a reload does to the
   login (several of w3's items reload). Pictures only of what is judged later. */
import { open, shot, core, DESK, PHONE } from './trk-lib.mjs'
import { sleep, halves } from './trk-w3-lib.mjs'

const bar = page => page.evaluate(() => {
  const h = document.querySelector('#page-tracker header'); if (!h) return null
  const vis = el => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden' }
  const items = [...h.querySelectorAll('.controls > *')].filter(vis).map(el => {
    const r = el.getBoundingClientRect()
    const b = el.querySelector('button, select') || el
    return { tag: el.tagName.toLowerCase(), id: el.id || b.id || '', cls: String(el.className || ''), text: (el.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 30), x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }
  })
  const hr = h.getBoundingClientRect()
  return { header: { y: Math.round(hr.top), h: Math.round(hr.height), w: Math.round(hr.width) }, items }
})

for (const [label, size, touch] of [['desk', DESK, false], ['phone', PHONE, true]]) {
  const { browser, page, errors } = await open({ size, who: 'a', touch })
  const b = await bar(page)
  console.log(`\n== ${label} header ${JSON.stringify(b.header)}`)
  for (const it of b.items) console.log(`   ${it.tag}#${it.id} .${it.cls} "${it.text}" @${it.x},${it.y} ${it.w}x${it.h}`)
  console.log('halves', JSON.stringify(await halves(page)))
  console.log('roster', JSON.stringify(await core(page, c => ({ roster: c.rosterNow().map(r => r.name), course: c.curCourseName(), syl: c.curSylName() }))))
  /* reload: does the login survive? */
  await page.reload(); await sleep(1500)
  const onLogin = await page.locator('#luser').isVisible().catch(() => false)
  console.log('after reload: login screen?', onLogin, 'page', await page.evaluate(() => window.CURPAGE))
  console.log('errors', errors.length, errors.slice(0, 3).join(' | '))
  await browser.close()
}
