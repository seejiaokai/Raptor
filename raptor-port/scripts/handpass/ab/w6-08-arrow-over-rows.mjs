/* W6 — R18 "painted over": on View-only Sched at desktop width the week's own ‹ arrow floats at the screen's left edge.
   With published Friday brought to the FRONT the way the arrows bring a day (the › arrow, day by day), is anything of
   Friday's Unavailable rows under it? Reads and pictures only. Usage: node scripts/handpass/ab/w6-08-arrow-over-rows.mjs */
process.env.AB_WHO = 'rewalk/w6'
const L = await import('./ab-lib.mjs')
const W4 = await import('./w4-lib.mjs')
const SCR = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor--claude-worktrees-absence-record-d147-af6a50/88ce3848-856b-4e60-84e4-7a09da4979d8/scratchpad/w6'
const R = L.resultBook('W6-arrow', `${L.ROOT}/docs/handpass/parts/2026-09-26-absence-rewalk-w6-08-arrow.txt`)
const o = await W4.openW4({ phone: false, who: 'a', state: `${SCR}/world.json` })
const page = o.page
for (const pg of ['viewsched', 'editsched']) {
  await L.go(page, pg); await page.waitForTimeout(400)
  const wk = pg === 'viewsched' ? '#vWeek' : '#eWeek'
  /* step the week with its own › arrow until Friday is the day at the front */
  for (let i = 0; i < 8; i++) {
    const left = await page.evaluate(w => { const d = document.querySelector(`${w} .day[data-day="4"]`); return d ? Math.round(d.getBoundingClientRect().left) : 9999 }, wk)
    if (left < 120) break
    await page.locator('#weekNext:visible').first().click().catch(() => {}); await page.waitForTimeout(500)
  }
  const day = `${wk} .day[data-day="4"]`
  await page.locator(`${day} .sec-unav`).first().evaluate(e => e.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(400)
  const r = await page.evaluate(d => {
    const out = [], arrow = document.querySelector('#weekPrev'), ab = arrow && arrow.getBoundingClientRect()
    for (const e of document.querySelectorAll(`${d} .sec-unav .pl-row .nm, ${d} .sec-unav .pl-row .puck, ${d} .sec-unav .pl-row [data-inpedit]`)) {
      if (!(e.offsetWidth || e.offsetHeight)) continue
      const b = e.getBoundingClientRect(); if (b.bottom < 0 || b.top > innerHeight) continue
      for (const [x, y] of [[b.left + 4, b.top + b.height / 2], [b.left + b.width / 2, b.top + b.height / 2]]) {
        const h = document.elementFromPoint(x, y)
        if (h && !(h === e || e.contains(h))) { out.push(`${(e.innerText || '').trim().slice(0, 12)} @${Math.round(x)},${Math.round(y)} under ${h.id ? '#' + h.id : h.tagName + '.' + String(h.className).slice(0, 20)}`); break }
      }
    }
    return { covered: out, arrow: ab ? [Math.round(ab.left), Math.round(ab.top), Math.round(ab.width), Math.round(ab.height)] : null, dayLeft: Math.round(document.querySelector(d).getBoundingClientRect().left) }
  }, day)
  await L.shot(page, `w6-desktop-admin-R18-05-arrow-${pg}`)
  R.ck(`${pg}-rows-clear-of-arrow`, r.covered.length === 0, `with Friday at the front of ${pg === 'viewsched' ? 'View-only Sched' : 'Edit Schedule'}, nothing of its Unavailable rows sits under the week's ‹ arrow`, r)
}
R.note('errors', o.errors.slice(0, 5))
R.save()
await o.browser.close()
