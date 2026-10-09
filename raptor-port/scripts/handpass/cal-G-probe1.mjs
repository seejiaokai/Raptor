import * as G from './cal-G-lib.mjs'
const { L, W, sleep } = G
const { browser, p, errors } = await G.world({ who: 'a' })
const info = await p.evaluate(() => {
  const P = window.PEOPLE
  const dayPersons = di => { const s = JSON.stringify(window.DAYS[di]); return Object.keys(P).filter(id => s.includes('"' + id + '"')).map(id => P[id].cs) }
  const ids = Object.keys(P)
  return {
    week: window.CURWEEK,
    n: ids.length,
    pilots: ids.filter(id => P[id].seat === 'FCP' && !P[id].san && !P[id].pers).map(id => id + '=' + P[id].cs).join(' '),
    wsos: ids.filter(id => P[id].seat === 'RCP' && !P[id].san && !P[id].pers).map(id => id + '=' + P[id].cs).join(' '),
    pers: ids.filter(id => P[id].pers).map(id => id + '=' + P[id].cs).join(' '),
    sat: dayPersons(5), sun: dayPersons(6),
    inputs: window.INPUTS.map(x => ({ iid: x.iid, person: x.person, type: x.type, date: x.date, endDate: x.endDate, grp: x.grp, allday: x.allday })).filter(x => x.grp || /Jul/.test(x.date)),
    nInputs: window.INPUTS.length,
  }
})
console.log(JSON.stringify(info))
await G.toInputsCal(p)
await G.monthTo(p, 2026, 6)
await G.shot(p, 'probe-july')
await G.openDay(p, '2026-07-18')
await G.shot(p, 'probe-jul18-day')
await G.plusInput(p)
await G.shot(p, 'probe-editor')
console.log('errors', errors)
await browser.close()
