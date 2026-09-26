/* W6 (26 Sep 26) — a READ-ONLY survey of a fresh world before the first walk of the roll-call rows nobody reached
   (R12, R17, R18, R19, R22, R27, R30, R32, R36): which days fly, what Thursday's Common Programme and Saturday's desks
   hold, the input types the form offers, the manning rows the war draws, the free men. Reads only. */
process.env.AB_WHO = 'rewalk/w6'
const L = await import('./ab-lib.mjs')
const S = await import('./ab-sched.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { browser, page, errors } = await openHi({ width: 1440, height: 900, who: 'a', dpr: 1 })
const bundle = await page.evaluate(() => [...document.scripts].map(s => s.src).filter(s => /index-/.test(s)))
console.log('bundle', bundle)
const days = await page.evaluate(() => window.DAYS.map((d, i) => ({ i, dow: d.dow, dt: d.dt,
  waves: d.waves.map(w => `${w.label}:${w.formations.map(f => `${f.cs}(${f.to}-${f.ld})[${f.aircraft.map(a => (a.p || '-') + '/' + (a.w || '-')).join(' ')}]`).join(',')}`),
  duty: (d.dutywaves || []).map(b => `${b.label}:${b.rows.map(r => `${r.role}|${r.str}-${r.end}|${r.id || '-'}+${(r.more || []).join(',')}`).join(';')}`),
  prog: (d.allhands || []).map(a => `${a.prog}|${a.str}-${a.end}|${JSON.stringify(a.who)}`),
  ground: (d.ground || []).map(g => `${g.prog}|${g.str}-${g.end}|${g.who}`) })))
console.log(JSON.stringify(days, null, 1).slice(0, 6000))
console.log('free Thu-Fri-Sat', await S.freeMen(page, [3, 4, 5]))
console.log('free Mon-Fri next wk?', await page.evaluate(() => Object.keys(window.PEOPLE).length))
await L.go(page, 'inputs'); await page.waitForSelector('#inType')
console.log('types', await page.evaluate(() => [...document.querySelectorAll('#inType option')].map(o => o.value)))
console.log('inputs Jul', await page.evaluate(() => window.INPUTS.filter(x => /Jul/.test(x.date)).map(x => `${x.person} ${x.type} ${x.date}${x.endDate ? '-' + x.endDate : ''} ${x.allday ? 'all' : x.s + '-' + x.e} acc=${x.acc || ''}`)))
await L.lwOpen(page, '2026-07-21')
console.log('manning rows', await page.evaluate(() => [...document.querySelectorAll('[data-testid^="manning-info-"]')].map(e => e.getAttribute('data-testid').slice(13) + '=' + e.innerText.trim())))
console.log('under', await page.evaluate(() => (document.querySelector('[data-testid="undermanned"]') || {}).innerText))
console.log('clash strip', await page.evaluate(() => (document.querySelector('[data-testid="sync-clashes"]') || {}).innerText || 'none'))
console.log('errors', errors)
await browser.close()
