/* [GUIDE-NO-GLOW] the roll-call's other doors, on the BUILT change: places drawn by the same style in a second spot.
     R1 a SANS puck's stripe on the SANS calendar's opened day (the schedule's own puck builder — D651)
     R2 the Show SANS switch while on, in the Leave War's ⚙ settings (it shares `.rtbtn.on` with Rearrange — D882)
     R3 today's card on View-only Sched (the same `.day.today` as Edit Schedule's week)
   Each: a real press to reach it, a picture, and its computed light read off the page (a check line each).
   usage: DL_BASE=http://localhost:4173 DL_SHOTS=docs/handpass/2026-10-15-noglow-built node scripts/handpass/noglow-rollcall.mjs [phone|desk] */
import * as L from './dl-lib.mjs'
const SIZE = process.argv[2] === 'phone' ? 'phone' : 'desk'
const w = await L.world(SIZE), p = w.page
const lines = []
const check = (name, ok, saw) => lines.push(`${ok ? 'works' : 'FAIL'} — ${name}: ${saw}`)
/* a glow = a blurred layer in a colour that is not near-black, or a 3px+ see-through band (the guide's §4 point) */
const lit = s => (s || 'none').split(/,(?![^(]*\))/).some(l => {
  const c = l.match(/rgba?\(([\d.]+), ([\d.]+), ([\d.]+)(?:, ([\d.]+))?\)/); if (!c) return false
  const dark = Math.max(+c[1], +c[2], +c[3]) <= 40, a = c[4] === undefined ? 1 : +c[4]
  const n = l.replace(/rgba?\([^)]*\)/, '').replace('inset', '').match(/-?[\d.]+px/g)?.map(parseFloat) || []
  const [, , blur = 0, spread = 0] = n
  return !dark && ((blur > 0 && !/inset/.test(l)) || (!/inset/.test(l) && blur === 0 && spread >= 3 && a < 0.5))
})
try {
  /* R3 */
  await L.go(w, 'viewsched'); await L.sleep(400)
  const r3 = await p.evaluate(() => { const e = [...document.querySelectorAll('.day.today')].find(d => d.getBoundingClientRect().width > 0); if (!e) return null; e.scrollIntoView({ block: 'start' }); return getComputedStyle(e).boxShadow })
  if (r3 === null) check('R3 today\'s card on View-only Sched', false, 'no today card on screen')
  else { check('R3 today\'s card on View-only Sched', !lit(r3), r3); await L.pic(w, `R3-viewonly-today-${SIZE}`) }
  /* R1 */
  await L.go(w, 'inputs'); await L.sleep(300)
  await w.press('#inSansMode'); await L.sleep(600)
  /* open days of the month until one lists a SANS man's puck (the opened day draws the schedule's own puck) */
  let r1 = null
  const days = p.locator('[data-testid^="sc-day-"]')
  /* the month that holds commitments: the one whose cells show the most SANS committed (the demo's lie in July 26) */
  for (let m = 0; m < 6; m++) {
    const any = await p.evaluate(() => [...document.querySelectorAll('[data-testid^="sc-day-"]')].some(d => /[1-9]/.test((d.querySelector('[data-testid^="sc-f-"], [data-testid^="sc-o-"], [data-testid^="sc-a-"]') || {}).textContent || '')))
    if (any) break
    await w.press('[data-testid="sc-prev"]'); await L.sleep(350)
  }
  for (let i = 0, n = Math.min(await days.count(), 42); i < n && r1 === null; i++) {
    const d = days.nth(i); if (!await d.isVisible()) continue
    await w.press(d); await L.sleep(450)
    r1 = await p.evaluate(() => { const e = [...document.querySelectorAll('.sd-puck .puck.san')].find(x => x.getBoundingClientRect().width > 0); if (!e) return null; e.setAttribute('data-mk', 'a'); e.scrollIntoView({ block: 'center' }); return getComputedStyle(e, '::after').boxShadow })
    if (r1 === null) { await p.keyboard.press('Escape'); await L.sleep(250) }
  }
  if (r1 === null) check('R1 a SANS puck on the SANS calendar', false, 'no SANS puck reached on screen (the opened day held none)')
  else { check('R1 a SANS puck on the SANS calendar', !lit(r1), r1); await L.pic(w, `R1-sans-cal-puck-${SIZE}`, { around: '[data-mk="a"]', pad: 30 }) }
  /* R2 */
  await L.go(w, 'leavewar'); await p.waitForSelector('#page-leavewar [data-testid^="row-"]', { timeout: 20000 }); await L.sleep(600)
  await w.press('[data-testid="settings-open"]'); await L.sleep(500)
  const t = p.locator('[data-testid="sans-toggle"]')
  const was = await t.getAttribute('class')
  if (!/\bon\b/.test(was || '')) { await w.press(t); await L.sleep(300) }
  const r2 = await p.evaluate(() => { const e = document.querySelector('[data-testid="sans-toggle"]'); const s = getComputedStyle(e); return { cls: e.className, shadow: s.boxShadow, bg: s.backgroundColor } })
  check('R2 Show SANS on, in ⚙ Settings', /\bon\b/.test(r2.cls) && !lit(r2.shadow) && /rgba\(59, 198, 232, 0\.16\)/.test(r2.bg), `class "${r2.cls}", fill ${r2.bg}, shadow ${r2.shadow}`)
  await L.pic(w, `R2-show-sans-on-${SIZE}`, { around: '[data-testid="sans-toggle"]', pad: 24 })
  if (!/\bon\b/.test(was || '')) { await w.press(t); await L.sleep(300) } // put it back
  console.log(lines.join('\n'))
} finally { await L.close(w) }
