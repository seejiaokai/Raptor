/* W6 — the arrow's room taken out ([ARROW-ROOM-OUT], the owner's D275, 27 Sep 26 — "I still prefer these", of the
   full-screen BEFORE pictures in docs/mock/five-flags.html). Drives the PRODUCTION build already served at
   http://localhost:4176 (never rebuilds). Every check asserts the RIGHT behaviour (PASS = correct), so re-running this
   IS the re-walk.
   It retakes, on the real build with nothing injected, the three full-screen pictures he chose from (View-only with
   Monday's "⚠ issues" list open; View-only after two › presses; Edit Schedule at rest — the mock-up's `4f-*-before`),
   and measures what "flush at the left, as on main" means: the desktop week's left padding is main's 20px with no
   declared scroll-padding; at rest Monday starts 20px in from the week box; every › press lands the next day at that
   same place; a page switch carries the day at the front; a warning tap that pans lands its day there too. 1440×900
   and 1024×768; the phone (390×844) keeps its own 12px and draws no arrows.
   Usage, from raptor-port/:  node scripts/handpass/ff-w6-arrow.mjs
   Pictures: FF_SHOTS, default docs/img/handpass/2026-09-27-five-flags-answers/w6 */
process.env.HP_URL = process.env.HP_URL || 'http://localhost:4176'
const SHOTS = process.env.FF_SHOTS || new URL('../../docs/img/handpass/2026-09-27-five-flags-answers/w6', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
process.env.HP_SHOTS = SHOTS
import { mkdirSync } from 'node:fs'
mkdirSync(SHOTS, { recursive: true })
const L = await import('./am/w2-lib.mjs')
const { openHi, go } = L

let pass = 0, fail = 0
const check = (id, ok, what, detail = '') => { ok ? pass++ : fail++; console.log(`${ok ? 'PASS' : 'FAIL'} ${id} — ${what}${detail !== '' ? ' | ' + JSON.stringify(detail) : ''}`) }
const watch = (errors) => () => errors.splice(0)

/** the week's geometry, as the browser lays it out */
const geo = (page, wk) => page.evaluate((wk) => {
  const w = document.querySelector(wk), cs = getComputedStyle(w), wr = w.getBoundingClientRect()
  const ds = [...w.querySelectorAll('.day[data-day]:not(.peek)')]
  const prev = document.getElementById('weekPrev'), pr = prev && prev.getBoundingClientRect()
  /* the day at the front: the first live day whose right edge is past the week box's left edge + 60 */
  const front = ds.find(d => d.getBoundingClientRect().right > wr.left + 60)
  return {
    padL: cs.paddingLeft, spL: cs.scrollPaddingLeft, wl: Math.round(wr.left), sl: Math.round(w.scrollLeft),
    front: front ? +front.dataset.day : null, frontLeft: front ? Math.round(front.getBoundingClientRect().left - wr.left) : null,
    arrow: pr && pr.width ? { left: Math.round(pr.left), right: Math.round(pr.right) } : null,
  }
}, wk)

for (const vp of [{ width: 1440, height: 900 }, { width: 1024, height: 768 }]) {
  const tag = `${vp.width}`
  const { browser, page, errors } = await openHi({ ...vp, dpr: 1 }); const drain = watch(errors)
  await go(page, 'viewsched')
  const rest = async (wk = '#vWeek') => { await page.evaluate(wk => { const w = document.querySelector(wk); w.scrollLeft = 0; window.scrollTo(0, 0) }, wk); await page.waitForTimeout(400) }
  await rest()
  const g0 = await geo(page, '#vWeek')
  check(`R1-${tag}`, g0.padL === '20px' && (g0.spL === 'auto' || g0.spL === '0px'), `${tag}: the desktop week is back to main's 20px left padding, no declared room`, g0)
  check(`R2-${tag}`, g0.front === 0 && g0.frontLeft === 20, `${tag}: at rest Monday starts 20px in from the week box — flush at the left, the ‹ arrow over its first pixels`, g0)
  /* Monday's "⚠ issues" list open, the first picture he chose from */
  await page.locator('#vWeek .day[data-day="0"] [data-daywarn]').first().click(); await page.waitForSelector('#vWeek .day[data-day="0"] .dwlist')
  await rest()
  if (vp.width === 1440) await page.screenshot({ path: `${SHOTS}/W6-view-list-${tag}.png` })
  const lst = await page.evaluate(() => { const l = document.querySelector('#vWeek .day[data-day="0"] .dwlist').getBoundingClientRect(), a = document.getElementById('weekPrev').getBoundingClientRect(); return { listLeft: Math.round(l.left), arrowRight: Math.round(a.right) } })
  check(`R3-${tag}`, lst.listLeft < lst.arrowRight, `${tag}: the opened list starts UNDER the ‹ arrow, as he chose (D275 — the BEFORE picture)`, lst)
  await page.locator('#vWeek .day[data-day="0"] [data-daywarn]').first().click(); await page.waitForTimeout(300)
  await rest()
  /* › presses: each lands the next live day at the same 20px */
  const steps = []
  for (let i = 1; i <= 3; i++) {
    await page.locator('#weekNext').click(); await page.waitForTimeout(900)
    steps.push(await geo(page, '#vWeek'))
    if (i === 2 && vp.width === 1440) { await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(200); await page.screenshot({ path: `${SHOTS}/W6-view-pressed-${tag}.png` }) }
  }
  check(`R4-${tag}`, steps.every((s, i) => s.front === i + 1 && Math.abs(s.frontLeft - 20) <= 2), `${tag}: every › press lands the next day at the same 20px (Tue, Wed, Thu)`, steps.map(s => [s.front, s.frontLeft]))
  /* a page switch carries the day at the front (weekLeftDay → scrollWeekToDay) */
  await go(page, 'editsched'); await page.waitForTimeout(700)
  const ge = await geo(page, '#eWeek')
  check(`R5-${tag}`, ge.front === steps[2].front && Math.abs(ge.frontLeft) <= 2, `${tag}: Edit Schedule opens on the day View-only was showing, flush at the box's own left edge (scrollWeekToDay, main's landing)`, { view: steps[2].front, edit: ge })
  await rest('#eWeek')
  if (vp.width === 1440) await page.screenshot({ path: `${SHOTS}/W6-edit-rest-${tag}.png` })
  const ge0 = await geo(page, '#eWeek')
  check(`R6-${tag}`, ge0.padL === '20px' && ge0.front === 0 && ge0.frontLeft === 20, `${tag}: Edit Schedule at rest — 20px, Monday at the front`, ge0)
  /* a warning tap that has to pan lands its day at the box's edge (bringIntoView, main's) */
  await go(page, 'viewsched'); await rest()
  await page.locator('#vWeek .day[data-day="0"] [data-daywarn]').first().click(); await page.waitForSelector('#vWeek .day[data-day="0"] .dwlist')
  const step = await page.evaluate(() => { const ds = document.querySelectorAll('#vWeek .day'); return Math.round(ds[1].offsetLeft - ds[0].offsetLeft) })
  await page.evaluate(s => { const w = document.querySelector('#vWeek'); w.scrollLeft = s - 80 }, step); await page.waitForTimeout(400)
  await page.evaluate(() => { const it = document.querySelector('#vWeek .day[data-day="0"] .dwlist .witem'); it && it.click() }); await page.waitForTimeout(900)
  const gt = await page.evaluate(() => { const w = document.querySelector('#vWeek'), d = document.querySelector('#vWeek .day[data-day="0"]'); return Math.round(d.getBoundingClientRect().left - w.getBoundingClientRect().left) })
  check(`R7-${tag}`, gt >= -2 && gt <= 22, `${tag}: a warning tap that pans brings Monday back to the front, at the box's edge (0–20px in)`, { mondayFromBox: gt })
  const e = drain(); check(`R9-${tag}`, e.length === 0, `${tag}: no console errors, page errors or 4xx`, e.slice(0, 4))
  await browser.close()
}
/* the phone: untouched — 12px, no arrows */
{
  const { browser, page, errors } = await openHi({ width: 390, height: 844, dpr: 2 }); const drain = watch(errors)
  await go(page, 'viewsched')
  const gp = await geo(page, '#vWeek')
  check('R8-phone', gp.padL === '12px' && !gp.arrow, 'phone: the week keeps its own 12px and draws no arrows (untouched by the revert)', gp)
  await page.screenshot({ path: `${SHOTS}/W6-phone-view.png` })
  const e = drain(); check('R9-phone', e.length === 0, 'phone: no console errors, page errors or 4xx', e.slice(0, 4))
  await browser.close()
}
console.log(`\nW6: ${pass} pass · ${fail} fail`)
process.exit(fail ? 1 : 0)
