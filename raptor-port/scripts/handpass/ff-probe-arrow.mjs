/* RETIRED 27 Sep 26 (owner, D275 — "I still prefer these"): the room beside the ‹ arrow this script asserts was taken
   out before it merged ([ARROW-ROOM-OUT]). Kept as the first walk's evidence (docs/handpass/2026-09-26-five-flags.md
   §3d, §5); re-running it now reports the room missing, which is correct. Do not re-run it as a check. */
/* [VIEW-ARROW-OVER-LIST] probe (26 Sep 26, the five-flags batch): where the week's floating ‹ › arrows sit
   against the day cards and an opened warning list, on View-only Sched and Edit Schedule, at desktop widths.
   Usage (from raptor-port/, a preview serving dist/): HP_URL=http://localhost:4176 HP_SHOTS=<dir> node scripts/handpass/ff-probe-arrow.mjs [tag] */
const L = await import('./am/w1-lib.mjs')
const { open, go } = L
const tag = process.argv[2] || 'probe'
for (const [w, h] of [[1440, 900], [1024, 768], [1920, 1080]]) {
  const { browser, page, errors } = await open({ width: w, height: h })
  for (const pg of ['viewsched', 'editsched']) {
    await go(page, pg)
    const wk = pg === 'viewsched' ? '#vWeek' : '#eWeek'
    /* open the first live day's warning list, if it has one */
    const opened = await page.evaluate((wk) => {
      const d = document.querySelector(`${wk} .day[data-day]`)
      const b = d && d.querySelector('.daywarn, [data-daywarn], .dw-head, .dwarn-h')
      if (b) { b.click(); return b.className }
      return ''
    }, wk)
    await page.waitForTimeout(400)
    const m = await page.evaluate((wk) => {
      const r = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height), r: Math.round(b.right) } }
      const week = document.querySelector(wk)
      const days = [...week.querySelectorAll('.day[data-day]')].map(r)
      const cs = getComputedStyle(week)
      return { vw: innerWidth, padL: cs.paddingLeft, padR: cs.paddingRight, scrollLeft: week.scrollLeft, weekBox: r(week),
        prev: r(document.getElementById('weekPrev')), next: r(document.getElementById('weekNext')),
        prevHidden: document.getElementById('weekPrev').hidden, days: days.slice(0, 5) }
    }, wk)
    console.log(tag, w, pg, 'opened:', opened || '(no list button found)', JSON.stringify(m))
    await page.screenshot({ path: `${process.env.HP_SHOTS}/${tag}-${pg}-${w}.png` })
  }
  if (errors.length) console.log('errors', JSON.stringify(errors))
  await browser.close()
}
