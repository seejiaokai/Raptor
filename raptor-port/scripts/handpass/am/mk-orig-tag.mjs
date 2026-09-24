/* THE MOCK-UP for D108 (25 Sep 26, his ask in his look at PR #434: "I think ORG indicated at the top that is currently
   grey could stand out more, so that people know that the scheduled is published" → "ok show me").
   Pictures of the REAL app (the production build, the demo week), made the way a scheduler makes them through the
   app's own sign-off boxes and Publish buttons: Monday is published as the Original with one change already waiting
   (so ORIG sits beside "Not yet signed" and "1 pending", the busiest head it meets); Tuesday is published and amended
   to AL1; Wednesday is left a draft. Then the same frames are taken four times — today, and with each option laid on
   top of the live page:
     A. a ticked outline   — "✓ ORIG", bright outline, no fill: a stamp, a shape no other tag has;
     B. a ticked green     — "✓ ORIG", filled in the app's "signed" green;
     C. the word           — "Published" written before the tag on every published day; the tags themselves unchanged.
   Each option is cleared before the next is staged (the app swaps only the blocks that change, so an injected node
   would otherwise survive into the next option's pictures). Desktop at its real density (1x), phone at 3x — the page
   shows both at their real size. Nothing is saved to the app.
   Usage, with the build served on :4173:  node mk-orig-tag.mjs desktop 1  |  node mk-orig-tag.mjs phone 3 */
import { mkdirSync } from 'node:fs'
const W = process.argv[2] || 'desktop'
const DPR = Number(process.argv[3] || (W === 'phone' ? 3 : 1))
const SIZE = W === 'phone' ? { width: 390, height: 844 } : { width: 1440, height: 900 }
const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/mock/img/orig-tag'
process.env.HP_SHOTS = OUT
mkdirSync(OUT, { recursive: true })
const L = await import('./w2-lib.mjs')
const { openHi, editWeek, signDay, publishDay, publishAL, head, board, closeBoard, go } = L
const { browser, page, errors } = await openHi({ ...SIZE, state: null, dpr: DPR })   // a fresh browser: the demo week as seeded

/* ---- the three days, made through the app's own controls ---------------------------------------------------- */
await editWeek(page)
const log = []
const change = async (fn, arg) => { await page.evaluate(fn, arg); await page.waitForTimeout(600) }
log.push(['Mon sign', await signDay(page, 0)], ['Mon publish', await publishDay(page, 0)])
await change(() => { window.txtSet('fr:0.0.0.0', '1B: BFM-3 // WX CALL 0700'); window.afterSchedMutate() })
log.push(['Tue sign', await signDay(page, 1)], ['Tue publish', await publishDay(page, 1)])
await change(() => { window.txtSet('fr:1.0.0.0', '1B: BFM-3 // TBC'); window.afterSchedMutate() })
log.push(['Tue sign AL1', await signDay(page, 1)], ['Tue publish AL1', await publishAL(page, 1)])
const heads = [await head(page, 0), await head(page, 1), await head(page, 2)]
console.log(JSON.stringify({ log, heads: heads.map(h => ({ tag: h.tag, pending: h.pending, nys: h.nys })) }, null, 1))
if (heads[0].tag !== 'ORIG' || heads[1].tag !== 'AL1' || heads[2].tag !== 'DRAFT' || !heads[0].nys)
  console.log('!! the days did not come out as intended')

/* ---- the options ------------------------------------------------------------------------------------------- */
const OPTS = {
  today: { css: '', tick: false, word: false },
  a: { css: `.verchip.orig{background:transparent!important;color:#F1F4F7!important;box-shadow:inset 0 0 0 1.5px #F1F4F7}`, tick: true, word: false },
  b: { css: `.verchip.orig{background:#57C97A!important;color:#08131b!important}`, tick: true, word: false },
  c: { css: `.mk-pubword{font-family:'Barlow Condensed','Inter Tight',sans-serif;font-size:10px;font-weight:800;letter-spacing:.08em;
      text-transform:uppercase;color:#57C97A;margin-right:5px;white-space:nowrap;align-self:center;display:inline-flex;align-items:center;gap:4px}
    .mk-pubword::before{content:'';width:6px;height:6px;border-radius:50%;background:#57C97A}`, tick: false, word: true },
}
async function stage(k) {
  const o = OPTS[k]
  await page.evaluate((o) => {
    document.querySelectorAll('style[data-mk]').forEach(s => s.remove())
    document.querySelectorAll('.mk-pubword').forEach(s => s.remove())
    document.querySelectorAll('.verchip.orig').forEach(t => { t.textContent = 'ORIG' })
    if (o.css) { const st = document.createElement('style'); st.dataset.mk = '1'; st.textContent = o.css; document.head.appendChild(st) }
    if (o.tick) document.querySelectorAll('.verchip.orig').forEach(t => { t.textContent = '✓ ORIG' })
    if (o.word) document.querySelectorAll('.verchip.orig, .verchip[data-alc]').forEach(t => {
      const w = document.createElement('span'); w.className = 'mk-pubword'; w.textContent = 'Published'; t.before(w) })
  }, o)
  await page.waitForTimeout(150)
}
const clipOf = (sel) => page.evaluate((sel) => {
  const el = document.querySelector(sel); if (!el) return null
  el.scrollIntoView({ block: 'center', inline: 'nearest' })
  const r = el.getBoundingClientRect()
  return { x: Math.max(0, r.left - 4), y: Math.max(0, r.top - 4), width: Math.min(r.width + 8, innerWidth - Math.max(0, r.left - 4)), height: r.height + 8 }
}, sel)
async function snap(sel, name) {
  const c = await clipOf(sel)
  if (!c) { console.log('!! nothing at', sel); return }
  await page.waitForTimeout(120)
  const c2 = await clipOf(sel)
  await page.screenshot({ path: `${OUT}/${W}-${name}.png`, clip: c2 })
}

/* the edit week: each day's head, one at a time (a phone shows one day; a desktop two) */
for (const k of Object.keys(OPTS)) {
  for (const di of [0, 1, 2]) {
    await page.evaluate((di) => { const d = document.querySelector(`#eWeek .day[data-day="${di}"]`); d && d.scrollIntoView({ block: 'start', inline: 'start' }) }, di)
    await page.waitForTimeout(250)
    await stage(k)
    await snap(`#eWeek .day[data-day="${di}"] .day-head`, `${k}-week-${di}`)
  }
}
/* the scheduler board: Monday's publish strip */
await board(page, 0)
for (const k of Object.keys(OPTS)) { await stage(k); await snap('#schedBoard .sb-pub', `${k}-board`) }
await closeBoard(page)
/* View-only Sched: Monday as issued */
await go(page, 'viewsched'); await page.waitForTimeout(600)
for (const k of Object.keys(OPTS)) {
  await page.evaluate(() => { const d = document.querySelector('#vWeek .day[data-day="0"]'); d && d.scrollIntoView({ block: 'start', inline: 'start' }) })
  await page.waitForTimeout(250)
  await stage(k); await snap('#vWeek .day[data-day="0"] .day-head', `${k}-view`)
}
console.log('errors', JSON.stringify(errors))
await browser.close()
