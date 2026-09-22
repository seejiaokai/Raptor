/* Does the ALL AVAIL count CHIP respond to a tap at phone width? */
import { open, board, shot, SHOTS } from './lib.mjs'
const STATE = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json'
for (const w of [1440, 390]) {
  const { browser, page, errors } = await open({ state: STATE, width: w, height: 844 })
  await board(page, 5)
  const pre = await page.evaluate(() => {
    const c = [...document.querySelectorAll('#schedBoard .oilcount')].filter(e => e.offsetParent)[0]
    if (!c) return 'NO CHIP'
    const r = c.getBoundingClientRect()
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2
    const top = document.elementFromPoint(cx, cy)
    const t = document.getElementById('toastEl'); if (t) t.innerText = ''
    return {
      box: { w: Math.round(r.width), h: Math.round(r.height) },
      whatIsOnTop: top ? (top.className || top.tagName).toString().slice(0, 30) : 'nothing',
      pressable: !!(top && (top === c || c.contains(top))),
      styles: (() => { const s = getComputedStyle(c); return { size: s.fontSize, colour: s.color, bg: s.backgroundColor.slice(0, 22), cursor: s.cursor } })(),
    }
  })
  /* a REAL press at its own centre, as a finger would */
  const tapped = await page.evaluate(() => {
    const c = [...document.querySelectorAll('#schedBoard .oilcount')].filter(e => e.offsetParent)[0]
    if (!c) return false
    const r = c.getBoundingClientRect()
    return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) }
  })
  if (tapped) { await page.mouse.click(tapped.x, tapped.y); await page.waitForTimeout(900) }
  const post = await page.evaluate(() => ({
    toast: (document.getElementById('toastEl')?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 80),
    chars: (document.getElementById('toastEl')?.innerText || '').length,
  }))
  console.log(w + 'px: ' + JSON.stringify({ pre, clickedAt: tapped, post }, null, 1))
  console.log('  errors:', errors.slice(0, 3))
  await shot(page, 'w11-tap-' + w)
  await browser.close()
}
console.log('shots in ' + SHOTS)
