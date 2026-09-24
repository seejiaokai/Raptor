/* w1 — a READ-ONLY survey of the everything week before the walk (24 Sep 26). Nothing is written
   through window; it only records what each day carries, so the scenarios pick the right cells. */
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w1'
const STATE = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/2026-09-24-amendment-week.json'
const L = await import('./am-lib.mjs')
const { open, editWeek, head, book } = L
const { browser, page, errors } = await open({ state: process.argv[2] === 'fresh' ? null : STATE })
await editWeek(page)
const days = await page.evaluate(() => window.DAYS.map((d, i) => ({
  i, dow: d.dow, dt: d.dt,
  waves: d.waves.map(w => `${w.label}[${w.kind || 'fly'}${w.sa ? ',sa' : ''}] ` + w.formations.map(f => `${f.cs}/${f.to}-${f.ld}(${f.aircraft.length}ac)`).join(' ')),
  duties: d.dutywaves.map(b => `${b.label}:${b.rows.length}`),
  sims: Object.fromEntries(Object.entries(d.sims || {}).map(([k, v]) => [k, v.length])),
  ground: d.ground.length, prog: d.allhands.length, notes: (d.notes || []).length,
  txt: [...document.querySelectorAll(`#eWeek .day[data-day="${i}"] [data-txt]`)].map(e => e.dataset.txt).slice(0, 40),
})))
for (const d of days) console.log(JSON.stringify(d))
for (let i = 0; i < 7; i++) console.log('head', i, JSON.stringify(await head(page, i)))
console.log('book', JSON.stringify(await book(page)))
const inputs = await page.evaluate(() => (window.INPUTS || []).filter(x => x.from && x.from <= '2026-07-19' && (x.to || x.from) >= '2026-07-13')
  .map(x => `${x.id}|${x.type}|${x.person}|${x.from}..${x.to || ''}|acc=${JSON.stringify(x.acc || null)}|${(x.remark || x.rmk || '').slice(0, 20)}`))
console.log('inputs this week', inputs.length, JSON.stringify(inputs, null, 0))
console.log('probe keys', await page.evaluate(() => Object.keys(window).filter(k => /^(set|go|open|add|SCHED|DAYS|INPUTS|PEOPLE|CURWEEK|SBDAY|lw|raptor)/.test(k)).join(' ')))
console.log('errors', errors)
await browser.close()
