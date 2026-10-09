import * as H from './cal-A-lib2.mjs'
const { tid, sleep } = H
const SIZE = process.env.SIZE || 'side'
const w = await H.world(SIZE)
await H.openSans(w); await H.sansGoto(w, '2026-07-14')
await H.calOpenFromSans(w, '2026-07-14').catch(async () => { await H.sansOpen(w, '2026-07-14'); await w.press(tid(w.page, 'sd-days')); await tid(w.page, 'win-days').waitFor() })
await w.press(tid(w.page, 'days-wd-3')); await tid(w.page, 'win-every').waitFor(); await sleep(500)
const info = await w.page.evaluate(() => {
  const win = document.querySelector('[data-testid="win-every"]')
  const els = [win, ...win.querySelectorAll('*')].filter(e => { const cs = getComputedStyle(e); return /(auto|scroll)/.test(cs.overflowY) && e.scrollHeight > e.clientHeight + 2 })
  return els.map(e => ({ cls: e.className, sh: e.scrollHeight, ch: e.clientHeight, oy: getComputedStyle(e).overflowY }))
})
console.log('scrollable parts:', JSON.stringify(info))
const save = tid(w.page, 'every-save')
await save.scrollIntoViewIfNeeded().catch(e => console.log('scrollIntoView failed', String(e).slice(0, 80)))
await sleep(300)
const g = await w.page.evaluate(() => { const e = document.querySelector('[data-testid="every-save"]'); const r = e.getBoundingClientRect(); const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { t: Math.round(r.top), b: Math.round(r.bottom), vh: innerHeight, hit: !!hit && (hit === e || e.contains(hit)) } })
console.log('after scrolling it into view:', JSON.stringify(g))
await H.pic(w, 'sizes2-every-scrolled')
await H.closeAll(w)
