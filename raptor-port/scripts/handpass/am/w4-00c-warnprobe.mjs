/* w4 probe — which warnings do the published days carry on the everything week (the working copy's, and the
   issued faces'), and which are cross-day (crew rest across two days)? For choosing Astra rank 36's case. */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w4/probe'
const L = await import('./w4-lib.mjs')
const { open, STATE, DESK, editWeek, go } = L
const { browser, page, errors } = await open({ ...DESK, state: STATE })
await editWeek(page)
const work = await page.evaluate(() => Object.values(window.WARN.byDay || {}).map(d => ({ di: d.di, dow: d.dow, w: d.warns.map(x => `${x.sev}:${x.code}:${(x.who || []).join(',')}${x.prevDi != null ? ' prev=' + x.prevDi : ''}`) })))
console.log('WORKING', JSON.stringify(work, null, 0))
await go(page, 'viewsched')
const rows = await page.evaluate(() => [...document.querySelectorAll('#vWeek .day')].map(d => ({ di: d.dataset.day, strip: (d.querySelector('.daywarn') || {}).innerText?.replace(/\s+/g, ' ') || '' })))
console.log('VIEW STRIPS', JSON.stringify(rows))
const people = await page.evaluate(() => { const o = {}; for (const di of [0, 1, 2, 3]) { const d = window.DAYS[di]; o[di] = d.waves.flatMap(w => w.formations.map(f => `${f.cs} ${f.to}-${f.ld} ${f.aircraft.map(a => a.p + '/' + a.w).join(' ')}`)) } return o })
console.log('FLYING', JSON.stringify(people, null, 1))
console.log('errors', errors)
await browser.close()
