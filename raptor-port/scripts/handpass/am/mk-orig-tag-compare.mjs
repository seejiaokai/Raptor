/* THE MOCK-UP for D108, part two (25 Sep 26, his question on option B: "wouldn't people confuse the AL green with this
   ORIG green?"). The same way as mk-orig-tag.mjs, through the app's own controls on the demo week: Monday published as
   the Original with one change waiting; Tuesday amended three times (AL3 — green); Wednesday four times (AL4 — white).
   Then each day's version tag is pictured today and under options A and B, so ORIG can be judged BESIDE the two AL
   colours it could be mistaken for: B's green against AL3, A's white outline against AL4. Nothing is saved to the app.
   Usage, with the build served on :4173:  node mk-orig-tag-compare.mjs desktop 1  |  node mk-orig-tag-compare.mjs phone 3 */
import { mkdirSync } from 'node:fs'
const W = process.argv[2] || 'desktop'
const DPR = Number(process.argv[3] || (W === 'phone' ? 3 : 1))
const SIZE = W === 'phone' ? { width: 390, height: 844 } : { width: 1440, height: 900 }
const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/mock/img/orig-tag'
process.env.HP_SHOTS = OUT
mkdirSync(OUT, { recursive: true })
const L = await import('./w2-lib.mjs')
const { openHi, editWeek, signDay, publishDay, publishAL, head } = L
const { browser, page, errors } = await openHi({ ...SIZE, state: null, dpr: DPR })   // a fresh browser: the demo week as seeded

await editWeek(page)
const edit = async (key, v) => { await page.evaluate(([k, v]) => { window.txtSet(k, v); window.afterSchedMutate() }, [key, v]); await page.waitForTimeout(500) }
await signDay(page, 0); await publishDay(page, 0)
await edit('fr:0.0.0.0', '1B: BFM-3 // WX CALL 0700')
/* an amendment each: sign, change a remark, sign again, publish the AL */
async function amendTo(di, n) {
  await signDay(page, di); await publishDay(page, di)
  for (let i = 1; i <= n; i++) { await edit(`fr:${di}.0.0.0`, `1B: BFM-3 // CHANGE ${i}`); await signDay(page, di); await publishAL(page, di) }
}
await amendTo(1, 3); await amendTo(2, 4)
const tags = [(await head(page, 0)).tag, (await head(page, 1)).tag, (await head(page, 2)).tag]
console.log('tags', tags)
if (tags.join() !== 'ORIG,AL3,AL4') console.log('!! the days did not come out as intended')

const OPTS = {
  today: { css: '', tick: false },
  a: { css: `.verchip.orig{background:transparent!important;color:#F1F4F7!important;box-shadow:inset 0 0 0 1.5px #F1F4F7}`, tick: true },
  b: { css: `.verchip.orig{background:#57C97A!important;color:#08131b!important}`, tick: true },
}
for (const [k, o] of Object.entries(OPTS)) {
  for (const di of [0, 1, 2]) {
    await page.evaluate((di) => { const d = document.querySelector(`#eWeek .day[data-day="${di}"]`); d && d.scrollIntoView({ block: 'start', inline: 'start' }) }, di)
    await page.waitForTimeout(250)
    await page.evaluate((o) => {
      document.querySelectorAll('style[data-mk]').forEach(s => s.remove())
      document.querySelectorAll('.verchip.orig').forEach(t => { t.textContent = o.tick ? '✓ ORIG' : 'ORIG' })
      if (o.css) { const st = document.createElement('style'); st.dataset.mk = '1'; st.textContent = o.css; document.head.appendChild(st) }
    }, o)
    await page.waitForTimeout(120)
    /* the day's title and its tag together, so the picture says which day it is */
    const clip = await page.evaluate((di) => {
      const d = document.querySelector(`#eWeek .day[data-day="${di}"] .day-head`)
      d.scrollIntoView({ block: 'center', inline: 'nearest' })   // clear of the sticky top bar
      const ttl = d.querySelector('.dname, h2, .dt, b') || d.firstElementChild, tag = d.querySelector('.verchip')
      const a = d.getBoundingClientRect(), t = tag.getBoundingClientRect()
      return { x: a.left, y: Math.min(a.top, t.top) - 2, width: Math.min(t.right - a.left + 10, innerWidth - a.left), height: Math.max(t.bottom, (ttl ? ttl.getBoundingClientRect().bottom : t.bottom)) - Math.min(a.top, t.top) + 8 }
    }, di)
    await page.screenshot({ path: `${OUT}/${W}-cmp-${k}-${di}.png`, clip })
  }
}
console.log('errors', JSON.stringify(errors))
await browser.close()
