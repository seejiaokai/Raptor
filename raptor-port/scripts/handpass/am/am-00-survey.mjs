/* [HUMAN-RETEST] amendment system — survey of the seed world (24 Sep 26).
   What the demo week carries for publishing out of the box, read off the app. */
import { open, go } from '../lib.mjs'
const { browser, page, errors } = await open({ fresh: true })
const out = await page.evaluate(() => {
  const S = window.SCHED, D = window.DAYS
  return {
    week: window.CURWEEK,
    days: D.map((d, i) => ({ i, dow: d.dow, dt: d.dt, ok: !!S.dayOK[i], cur: (S.cur || {})[i] || null })),
    als: (S.als || []).map(a => ({ id: a.id, di: a.di, seq: a.seq, n: (a.diff || []).length })),
    orig: Object.keys(S.orig || {}),
    pending: Object.keys(S.pending || {}).length,
    changes: Object.keys(S.changes || {}).length,
    drafts: Object.fromEntries(Object.entries(S.drafts || {}).map(([k, v]) => [k, v.map(x => x.name)])),
    sign: S.sign,
  }
})
console.log(JSON.stringify(out, null, 1))
await go(page, 'editsched')
const heads = await page.evaluate(() => [...document.querySelectorAll('#eWeek .day-head')].map(h => h.innerText.replace(/\s+/g, ' ').trim()))
console.log(heads.join('\n'))
console.log('errors', errors)
await browser.close()
