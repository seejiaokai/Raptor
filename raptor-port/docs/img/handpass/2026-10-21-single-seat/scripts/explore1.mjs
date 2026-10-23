const L = await import('file:///C:/Users/User/projects/Raptor/.claude/worktrees/overnight-backlog-review-92da33/raptor-port/scripts/handpass/lib.mjs')
console.log('explore1 v1')
const { browser, page, errors } = await L.open({ width: 1400, height: 900 })
await L.go(page, 'editsched')
const info = await page.evaluate(() => {
  const days = window.DAYS.map((d, i) => ({ i, label: d.label || d.date || d.name, waves: d.waves.map(w => ({ label: w.label, kind: w.kind, nf: w.formations.length, f: w.formations.map(f => ({ cs: f.cs, n: f.aircraft.length, ac: f.aircraft.map(a => [a.p, a.w, a.role]) })) })) }))
  return days
})
console.log(JSON.stringify(info, null, 0).slice(0, 4000))
const slots = await page.evaluate(() => [...document.querySelectorAll('#eWeek [data-slot]')].slice(0, 30).map(e => e.dataset.slot + ' ' + e.className + ' ' + (e.innerText||'').trim().slice(0,20)))
console.log(slots.join('\n'))
await page.screenshot({ path: process.env.HP_SHOTS + '/explore1.png' })
console.log(errors)
await browser.close()
