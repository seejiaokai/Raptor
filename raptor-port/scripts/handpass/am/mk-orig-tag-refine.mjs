/* THE MOCK-UP for D110 (25 Sep 26, his pick of the ORIG options: "A but is there a nicer design"). Option A's direction
   — no colour, a tick, so it can never read as an amendment's colour — drawn four ways on the real app:
     A   the first draft: a bright outline and a typed tick;
     A1  seal:       a faint white wash, a thin outline, and a drawn tick in a white disc;
     A2  check-cap:  the tick in a solid white end-cap, the rest outlined, like a "verified" badge;
     A3  round seal: A1 in a fully round shape, apart from the square-ish AL tags.
   The week is made through the app's own controls on the demo week, as in mk-orig-tag-compare.mjs: Monday published as
   the Original with one change waiting; Tuesday amended to AL3 (green) and Wednesday to AL4 (white) — the two AL colours
   a no-colour tag must stay clear of. Each variant is pictured on the three days' heads, Monday's board strip and
   Monday on View-only Sched, cleared before the next is staged. Nothing is saved to the app.
   Usage, with the build served on :4173:  node mk-orig-tag-refine.mjs desktop 1  |  node mk-orig-tag-refine.mjs phone 3 */
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

await editWeek(page)
const edit = async (key, v) => { await page.evaluate(([k, v]) => { window.txtSet(k, v); window.afterSchedMutate() }, [key, v]); await page.waitForTimeout(500) }
await signDay(page, 0); await publishDay(page, 0)
await edit('fr:0.0.0.0', '1B: BFM-3 // WX CALL 0700')
async function amendTo(di, n) {
  await signDay(page, di); await publishDay(page, di)
  for (let i = 1; i <= n; i++) { await edit(`fr:${di}.0.0.0`, `1B: BFM-3 // CHANGE ${i}`); await signDay(page, di); await publishAL(page, di) }
}
await amendTo(1, 3); await amendTo(2, 4)
const tags = [(await head(page, 0)).tag, (await head(page, 1)).tag, (await head(page, 2)).tag]
console.log('tags', tags)
if (tags.join() !== 'ORIG,AL3,AL4') console.log('!! the days did not come out as intended')

/* a drawn tick in a disc — crisper than a typed ✓ at 10px */
const DISC = `<svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true" style="flex:0 0 auto;display:block"><circle cx="6" cy="6" r="6" fill="#F1F4F7"/><path d="M3.3 6.2l1.8 1.8 3.6-3.8" fill="none" stroke="#0B0D10" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`
const TICK = `<svg viewBox="0 0 12 12" width="9" height="9" aria-hidden="true" style="display:block"><path d="M2.4 6.3l2.4 2.4 4.8-5" fill="none" stroke="#0B0D10" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
const V = {
  a: { css: `.verchip.orig{background:transparent!important;color:#F1F4F7!important;box-shadow:inset 0 0 0 1.5px #F1F4F7}`, html: '✓ ORIG' },
  s: { css: `.verchip.orig{background:rgba(241,244,247,.10)!important;color:#F1F4F7!important;box-shadow:inset 0 0 0 1px rgba(241,244,247,.85);
        display:inline-flex!important;align-items:center;gap:4px;padding:1px 6px 1px 3px!important}`, html: DISC + 'ORIG' },
  k: { css: `.verchip.orig{background:transparent!important;color:#F1F4F7!important;box-shadow:inset 0 0 0 1px #F1F4F7;
        display:inline-flex!important;align-items:stretch;gap:5px;padding:0 6px 0 0!important;overflow:hidden}
      .verchip.orig .mk-cap{background:#F1F4F7;display:inline-flex;align-items:center;padding:0 3px}
      .verchip.orig .mk-t{display:inline-flex;align-items:center;padding:1px 0}`, html: `<span class="mk-cap">${TICK}</span><span class="mk-t">ORIG</span>` },
  r: { css: `.verchip.orig{background:rgba(241,244,247,.10)!important;color:#F1F4F7!important;box-shadow:inset 0 0 0 1px rgba(241,244,247,.85);
        border-radius:999px!important;display:inline-flex!important;align-items:center;gap:4px;padding:1px 8px 1px 3px!important}`, html: DISC + 'ORIG' },
}
async function stage(k) {
  await page.evaluate((v) => {
    document.querySelectorAll('style[data-mk]').forEach(s => s.remove())
    const st = document.createElement('style'); st.dataset.mk = '1'; st.textContent = v.css; document.head.appendChild(st)
    document.querySelectorAll('.verchip.orig').forEach(t => { t.innerHTML = v.html })
  }, V[k])
  await page.waitForTimeout(120)
}
async function headShot(di, name) {
  const clip = await page.evaluate((di) => {
    const d = document.querySelector(`#eWeek .day[data-day="${di}"] .day-head`)
    d.scrollIntoView({ block: 'center', inline: 'nearest' })   // clear of the sticky top bar
    const tag = d.querySelector('.verchip'), a = d.getBoundingClientRect(), t = tag.getBoundingClientRect()
    const ttl = d.firstElementChild.getBoundingClientRect()
    return { x: a.left, y: Math.min(a.top, t.top) - 2, width: Math.min(t.right - a.left + 10, innerWidth - a.left), height: Math.max(t.bottom, ttl.bottom) - Math.min(a.top, t.top) + 8 }
  }, di)
  await page.screenshot({ path: `${OUT}/${W}-ref-${name}.png`, clip })
}
async function snap(sel, name) {
  const clip = await page.evaluate((sel) => {
    const el = document.querySelector(sel); el.scrollIntoView({ block: 'center', inline: 'nearest' })
    const r = el.getBoundingClientRect()
    return { x: Math.max(0, r.left - 4), y: Math.max(0, r.top - 4), width: Math.min(r.width + 8, innerWidth - Math.max(0, r.left - 4)), height: r.height + 8 }
  }, sel)
  await page.screenshot({ path: `${OUT}/${W}-ref-${name}.png`, clip })
}

for (const k of Object.keys(V)) {
  for (const di of [0, 1, 2]) {
    await page.evaluate((di) => { const d = document.querySelector(`#eWeek .day[data-day="${di}"]`); d && d.scrollIntoView({ block: 'start', inline: 'start' }) }, di)
    await page.waitForTimeout(250)
    await stage(k); await headShot(di, `${k}-${di}`)
  }
}
await board(page, 0)
for (const k of Object.keys(V)) { await stage(k); await snap('#schedBoard .sb-pub', `${k}-board`) }
await closeBoard(page)
await go(page, 'viewsched'); await page.waitForTimeout(600)
for (const k of Object.keys(V)) {
  await page.evaluate(() => { const d = document.querySelector('#vWeek .day[data-day="0"]'); d && d.scrollIntoView({ block: 'start', inline: 'start' }) })
  await page.waitForTimeout(250)
  await stage(k); await snap('#vWeek .day[data-day="0"] .day-head', `${k}-view`)
}
console.log('errors', JSON.stringify(errors))
await browser.close()
