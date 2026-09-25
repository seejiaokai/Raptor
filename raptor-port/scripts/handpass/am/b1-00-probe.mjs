/* B1 probe — what the seed Monday holds (a driver check, not a scenario): duty desks, their holders and extras,
   the Common Programme crowds, and the board's seat keys, so the counting walk can pick its seats. Reads only. */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-25-amendment-batch/b1'
const L = await import('./w2-lib.mjs')
const { openHi, editWeek, board } = L
const { browser, page, errors } = await openHi({ width: 1440, height: 900, dpr: 1, state: null })
await editWeek(page)
const d = await page.evaluate(() => {
  const D = window.DAYS[0], P = window.PEOPLE, cs = id => (P[id] && P[id].cs) || id || ''
  return {
    dow: D.dow,
    duties: D.dutywaves.map((b, bi) => ({ bi, label: b.label, rows: b.rows.map((r, ri) => `${ri}:${r.role}|${r.str}-${r.end}|${cs(r.id)}|more=${(r.more || []).map(cs).join(',')}`) })),
    ah: D.allhands.map((a, i) => `${i}:${a.prog}|${a.str}-${a.end}|${Array.isArray(a.who) ? a.who.map(cs).join(',') : cs(a.who)}`),
    ground: D.ground.map((g, i) => `${i}:${g.prog}|${g.str}-${g.end}|${cs(g.who)}|more=${(g.more || []).map(cs).join(',')}`),
    sims: Object.fromEntries(Object.entries(D.sims).map(([k, v]) => [k, v.map((s, i) => `${i}:${s.label}|${s.str}-${s.end}|${cs(s.p)}/${cs(s.w)}|pax=${(s.pax || []).map(cs).join(',')}`)])),
    waves: D.waves.map(w => ({ label: w.label, f: w.formations.map(f => `${f.cs} ${f.to}-${f.ld} ` + f.aircraft.map(a => `${cs(a.p)}/${cs(a.w)}`).join(' ')) })),
    signOpts: [...document.querySelectorAll('#eWeek .day[data-day="0"] select[data-sign]')].map(s => s.dataset.sign + ':' + [...s.options].map(o => o.value).filter(Boolean).length),
  }
})
console.log(JSON.stringify(d, null, 1))
await board(page, 0)
const keys = await page.evaluate(() => {
  const vis = e => !!(e.offsetWidth || e.offsetHeight)
  const r = document.querySelector('#schedBoard')
  return {
    slotsD: [...r.querySelectorAll('[data-slot^="d:0."]')].filter(vis).map(e => e.dataset.slot + (e.querySelector('.puck') ? '=' + e.querySelector('.puck').innerText.trim() : '(empty)')).slice(0, 60),
    slotsA: [...r.querySelectorAll('[data-slot^="a:0."]')].filter(vis).map(e => e.dataset.slot + (e.querySelector('.puck') ? '=' + e.querySelector('.puck').innerText.trim() : '(empty)')).slice(0, 40),
    fills: [...r.querySelectorAll('[data-fill]')].filter(vis).map(e => e.dataset.fill).slice(0, 30),
    bfld: [...r.querySelectorAll('[data-bfld^="dr:0"], [data-bfld^="ap:0"], [data-bfld^="gr:0"]')].filter(vis).map(e => e.dataset.bfld).slice(0, 40),
  }
})
console.log(JSON.stringify(keys, null, 1))
console.log('errors', errors)
await browser.close()
