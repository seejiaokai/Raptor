/* THE MOCK-UP for D172 (25 Sep 26): his "The ORIG tag seems abit too long" → "Show me a pic, including AL0, and all AL
   [tags] adopt a tick on the [heading] of each day as well, just like how the ORIG is shown currently. But before we
   accept the decision show me a mock up".
   Part 1 — the corner tag on a changed puck of a day NOT yet published (Thursday), four options: NEW · AL0 · a hollow dot ·
   OG — each in the plain white dotted outline, beside the REAL waiting AL1 tag on a published day (Monday, one change).
   Part 2 — the version tag in each day's heading: today (ORIG ticked, the ALs plain) against two ways of giving every AL
   the ORIG seal's tick: (a) the solid AL colour with the seal's white tick disc, (b) the seal's own form in the AL's colour.
   Days made through the app's own controls on the demo week: Monday ORIG (+ a change waiting), Tuesday AL3, Wednesday AL1.
   Drawn on the real app (the production build); everything proposed is injected just before each picture; nothing is saved.
   Usage, with the build served on :4173:  node mk-tags-ticks.mjs desktop  |  node mk-tags-ticks.mjs phone */
import { mkdirSync } from 'node:fs'
const W = process.argv[2] || 'desktop'
const DPR = W === 'phone' ? 3 : 2
const SIZE = W === 'phone' ? { width: 390, height: 844 } : { width: 1440, height: 900 }
const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/mock/img/tags-ticks'
process.env.HP_SHOTS = OUT
mkdirSync(OUT, { recursive: true })
const L = await import('./w2-lib.mjs')
const { openHi, editWeek, signDay, publishDay, publishAL } = L
const { browser, page, errors } = await openHi({ ...SIZE, state: null, dpr: DPR })
await editWeek(page)
const edit = async (key, v) => { await page.evaluate(([k, v]) => { window.txtSet(k, v); window.afterSchedMutate() }, [key, v]); await page.waitForTimeout(400) }
async function amendTo(di, n) {
  await signDay(page, di); await publishDay(page, di)
  for (let i = 1; i <= n; i++) { await edit(`fr:${di}.0.0.0`, `1B: BFM-3 // CHANGE ${i}`); await signDay(page, di); await publishAL(page, di) }
}
await signDay(page, 0); await publishDay(page, 0)
await page.evaluate(() => { const a = window.slotVal('0.0.0.0.p'), b = window.slotVal('0.0.0.0.w'); window.setSlotVal('0.0.0.0.p', b); window.setSlotVal('0.0.0.0.w', a); window.afterSchedMutate() })
await page.waitForTimeout(500)
await amendTo(1, 3); await amendTo(2, 1)
await page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.display = 'none' })

const TAG = (content, extra = '') => `.seat[data-mktag]{position:relative}
.seat[data-mktag]::after{content:${content};position:absolute;top:-5px;right:-3px;z-index:4;font-family:'Barlow Condensed','Inter Tight',sans-serif;
  font-size:7.5px;font-weight:800;letter-spacing:.02em;line-height:1;padding:0 2px;border-radius:4px;background:var(--panel);color:#F1F4F7;
  border:1px dotted #F1F4F7;pointer-events:none;${extra}}`
const TAGS = {
  new: TAG("'NEW'"), al0: TAG("'AL0'"), og: TAG("'OG'"),
  dot: TAG("''", 'width:7px;height:7px;padding:0;border-radius:50%;top:-4px;right:-2px'),
}
const DISC = (fill, stroke) => `<svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true" style="flex:0 0 auto;display:block"><circle cx="6" cy="6" r="6" fill="${fill}"/><path d="M3.3 6.2l1.8 1.8 3.6-3.8" fill="none" stroke="${stroke}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`
const HEADS = {
  now: { css: '', html: null },
  a: { css: `.day-head .verchip[data-alc],.signedln .verchip[data-alc]{display:inline-flex!important;align-items:center;gap:4px;padding-left:3px!important}`, html: 'a' },
  b: { css: `.day-head .verchip[data-alc],.signedln .verchip[data-alc]{display:inline-flex!important;align-items:center;gap:4px;padding-left:3px!important;
      background:color-mix(in srgb,var(--alc) 14%,transparent)!important;color:var(--alc)!important;box-shadow:inset 0 0 0 1px var(--alc)}`, html: 'b' },
}
async function injectCss(css) {
  await page.evaluate((css) => { document.querySelectorAll('style[data-mk]').forEach(s => s.remove()); const s = document.createElement('style'); s.dataset.mk = '1'; s.textContent = css; document.head.appendChild(s) }, css)
}
async function clipOf(sel, pad = 8) {
  return page.evaluate(([sel, pad]) => {
    const el = document.querySelector(sel); el.scrollIntoView({ block: 'center', inline: 'nearest' })
    const r = el.getBoundingClientRect()
    return { x: Math.max(0, r.left - pad), y: Math.max(0, r.top - pad), width: Math.min(r.width + 2 * pad, innerWidth - Math.max(0, r.left - pad)), height: r.height + 2 * pad }
  }, [sel, pad])
}
async function toDay(di) {
  await page.evaluate((di) => {
    const d = document.querySelector(`#eWeek .day[data-day="${di}"]`); if (!d) return
    d.scrollIntoView({ block: 'start', inline: 'start' })
    /* clear of the sticky bars: scroll up until the day's own heading is what the page shows there */
    const h = d.querySelector('.day-head')
    for (let i = 0; i < 30; i++) {
      const q = h.getBoundingClientRect(), hit = document.elementFromPoint(Math.max(1, q.left + 12), Math.max(1, q.top + 6))
      if (hit && (h === hit || h.contains(hit))) break
      window.scrollBy(0, -30)
    }
    window.scrollBy(0, -10)
  }, di)
  await page.waitForTimeout(350)
}

/* Part 1 — Thursday's first line, each tag option on its two first pucks; Monday's real AL1 tag as the reference */
await toDay(3)
for (const [k, css] of Object.entries(TAGS)) {
  await injectCss(css)
  const sel = await page.evaluate(() => {
    document.querySelectorAll('[data-mktag],[data-mkshot]').forEach(x => { x.removeAttribute('data-mktag'); x.removeAttribute('data-mkshot') })
    const day = document.querySelector('#eWeek .day[data-day="3"]')
    const seats = [...day.querySelectorAll('.seat')].filter(x => x.querySelector('.puck') && x.offsetWidth)
    ;[seats[0], seats[3]].forEach(x => x && x.setAttribute('data-mktag', '1'))
    seats[0].scrollIntoView({ block: 'center', inline: 'nearest' })
    return null
  })
  await page.waitForTimeout(200)
  const c = await page.evaluate(() => {
    const t = [...document.querySelectorAll('#eWeek .day[data-day="3"] [data-mktag]')].map(x => x.getBoundingClientRect())
    const top = Math.min(...t.map(r => r.top)) - 44, bot = Math.max(...t.map(r => r.bottom)) + 30
    const left = Math.min(...t.map(r => r.left)) - 150, right = Math.max(...t.map(r => r.right)) + 330
    const x = Math.max(0, left), y = Math.max(0, top)
    return { x, y, width: Math.min(right, innerWidth) - x, height: Math.min(bot, innerHeight) - y }
  })
  await page.screenshot({ path: `${OUT}/${W}-tag-${k}.png`, clip: c })
}
await injectCss('')
await toDay(0)
{
  const sel = await page.evaluate(() => {
    document.querySelectorAll('[data-mkshot]').forEach(x => x.removeAttribute('data-mkshot'))
    const s = document.querySelector('#eWeek .day[data-day="0"] .seat[data-aln]')
    const blk = s && (s.closest('.wave, .go, section'))
    if (!blk) return null
    blk.setAttribute('data-mkshot', 'm'); return '[data-mkshot="m"]'
  })
  if (sel) {
    await page.evaluate(() => document.querySelector('#eWeek .day[data-day="0"] .seat[data-aln]').scrollIntoView({ block: 'center', inline: 'nearest' }))
    await page.waitForTimeout(200)
    const c = await page.evaluate(() => {
      const t = [...document.querySelectorAll('#eWeek .day[data-day="0"] .seat[data-aln]')].map(x => x.getBoundingClientRect())
      const top = Math.min(...t.map(r => r.top)) - 44, bot = Math.max(...t.map(r => r.bottom)) + 30
      const left = Math.min(...t.map(r => r.left)) - 150, right = Math.max(...t.map(r => r.right)) + 330
      const x = Math.max(0, left), y = Math.max(0, top)
      return { x, y, width: Math.min(right, innerWidth) - x, height: Math.min(bot, innerHeight) - y }
    })
    await page.screenshot({ path: `${OUT}/${W}-tag-ref-al1.png`, clip: c })
  }
}

/* Part 2 — the day headings, now vs (a) vs (b) */
for (const [k, v] of Object.entries(HEADS)) {
  for (const di of [0, 1, 2]) {
    await toDay(di)
    await injectCss(v.css)
    await page.evaluate(([mode, dA, dB]) => {
      document.querySelectorAll('.mk-disc').forEach(x => x.remove())
      if (!mode) return
      document.querySelectorAll('.day-head .verchip[data-alc], .signedln .verchip[data-alc]').forEach(c => c.insertAdjacentHTML('afterbegin', `<span class="mk-disc" style="display:inline-flex">${mode === 'a' ? dA : dB}</span>`))
    }, [v.html, DISC('#F1F4F7', '#08131b'), DISC('var(--alc)', '#08131b')])
    await page.waitForTimeout(150)
    const clip = await page.evaluate((di) => {
      const d = document.querySelector(`#eWeek .day[data-day="${di}"]`)
      const h = d.querySelector('.day-head').getBoundingClientRect(), sl = d.querySelector('.signedln')
      const bottom = sl ? sl.getBoundingClientRect().bottom : h.bottom
      return { x: Math.max(0, h.left - 4), y: Math.max(0, h.top - 4), width: Math.min(h.width + 8, innerWidth - Math.max(0, h.left - 4)), height: bottom - h.top + 10 }
    }, di)
    await page.screenshot({ path: `${OUT}/${W}-head-${k}-d${di}.png`, clip })
  }
}
console.log('errors', JSON.stringify(errors))
await browser.close()
