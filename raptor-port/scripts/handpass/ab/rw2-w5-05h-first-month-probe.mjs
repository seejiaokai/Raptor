/* W5 RE-WALK (26 Sep 26) — W5-F2's REAL trigger, found by the bisect (rw-w5-05e T17–T19): the vanishing row needs no
   "Undo post out" at all. A fresh world whose Leave War is FIRST shown on a later month (September), then a man posted out
   from a July date: his row is gone from July (every month) until a reload. Each world here, as a person would:
     H1  war opened on SEP first → JUL → Drifter: tap 14 Jul → PO → 15 Jul → Post out   (no leave, nothing published)
     H2  control: war opened on JUL first → the same Post out
     H3  war opened on AUG first → the same
     H4  war opened on SEP first, and left 20 s before going to JUL (time for the grid to finish drawing) → the same
     H5  war opened on SEP first → a Post out from 1 Oct (a date AFTER the first month shown)
   After each: the row in July; then the way back tried — the month strip (JAN, then JUL again), another page and back,
   and a reload. Usage (from raptor-port/): node scripts/handpass/ab/rw-w5-05h-first-month-probe.mjs [desktop|phone] [H1,…] */
const W = process.argv[2] || 'desktop'
process.env.AB_WHO = 'rewalk2/w5'
const L = await import('./ab-lib.mjs')
const X = await import('./w5-lib.mjs')
const Q = await import('./rw-w5-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { lwOpen, shot, toastSpy, resultBook, ROOT, rowRun, lwShot, go } = L
const PHONE = W === 'phone'
const R = resultBook(`RW-W5-05h-${W}`, `${ROOT}/docs/handpass/parts/2026-09-26-absence-rewalk2-w5-05h-${W}.txt`)
const pic = n => `rw-w5-05h-${W}-${n}`
const JUL = ['2026-07-01', '2026-07-13', '2026-07-14', '2026-07-15']
const D = 'slipway'
async function world(tag, first, from = '2026-07-15', { wait = 0, tap = '2026-07-14', rows = JUL } = {}) {
  const { browser, page, errors } = await openHi({ width: PHONE ? 390 : 1440, height: PHONE ? 844 : 900, who: 'a', dpr: PHONE ? 2 : 1 })
  await toastSpy(page)
  await lwOpen(page, first)
  await shot(page, pic(`${tag}-0-war-first-on-${first.slice(5, 7)}`))
  if (wait) await page.waitForTimeout(wait)
  const before = await (async () => { await lwOpen(page, tap); return rowRun(page, D, rows) })()
  const po = await Q.postOutBid(page, D, tap, from, true)
  await lwOpen(page, tap)
  const after = await rowRun(page, D, rows)
  await lwShot(page, pic(`${tag}-1-after-postout`), 'stiff', tap)
  const sxo = await page.evaluate(() => { const h = [...document.querySelectorAll('.mx-grp, [data-testid^="grp-"], tr')].map(e => (e.innerText || '').replace(/\s+/g, ' ').trim()).find(t => /^SXO\b/.test(t) || /· SXO/.test(t)); return h ? h.slice(0, 40) : '' })
  /* the ways back a person might try */
  await lwOpen(page, '2026-01-10'); await lwOpen(page, tap)
  const viaStrip = await rowRun(page, D, rows)
  await go(page, 'inputs'); await lwOpen(page, tap)
  const viaPage = await rowRun(page, D, rows)
  await X.reload(page, 'a'); await lwOpen(page, tap)
  const viaReload = await rowRun(page, D, rows)
  await lwShot(page, pic(`${tag}-2-after-reload`), 'stiff', tap)
  const gone = a => a.every(x => /NO CELL/.test(x))
  R.ck(tag, !gone(after), `${tag}: war first on ${first.slice(5, 7)}${wait ? ` (+${wait / 1000}s)` : ''}; Drifter posted out from ${from}: his row is still drawn in the month on screen`,
    { first, from, before, po: po.done, after, sxoHeading: sxo, back: { monthStrip: gone(viaStrip) ? 'still gone' : 'back', otherPage: gone(viaPage) ? 'still gone' : 'back', reload: gone(viaReload) ? 'still gone' : 'back' }, errors: errors.slice(0, 5) })
  await browser.close()
}
const only = (process.argv[3] || '').split(',').filter(Boolean)
const run = k => !only.length || only.includes(k)
if (run('H1')) await world('H1', '2026-09-10')
if (run('H2')) await world('H2', '2026-07-14')
if (run('H3')) await world('H3', '2026-08-10')
if (run('H4')) await world('H4', '2026-09-10', '2026-07-15', { wait: 20000 })
if (run('H5')) await world('H5', '2026-09-10', '2026-10-01', { tap: '2026-09-14', rows: ['2026-09-01', '2026-09-14', '2026-09-30', '2026-10-01'] })
R.save()
