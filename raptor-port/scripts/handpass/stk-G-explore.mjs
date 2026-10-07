import * as G from './stk-G-lib.mjs'
const w = await G.world()
const p = w.p
const info = await p.evaluate(() => ({
  vconf: window.VCONF ? { reportLead: window.VCONF.reportLead, debrief: window.VCONF.debrief, oilFullMin: window.VCONF.oilFullMin, reportText: window.VCONF.reportText } : 'no VCONF',
  week: window.CURWEEK, page: window.CURPAGE,
  sat: window.DAYS[5].waves.length + ' waves, ' + window.DAYS[5].dutywaves.length + ' duty',
  tue: window.DAYS[1].waves.map(w => ({ label: w.label, intimes: w.intimes, f: w.formations.map(f => ({ cs: f.cs, msn: f.msn, to: f.to, ld: f.ld, rm: f.aircraft.map(a => a.rmks) })) })),
  people: Object.keys(window.PEOPLE).slice(0, 40).map(k => k + ':' + window.PEOPLE[k].cs),
}))
console.log(JSON.stringify(info, null, 1))
await G.boardOn(p, 5)
await G.pic(p, 'explore-sat-board')
console.log(JSON.stringify(await G.warnLines(p, 5)))
console.log(await p.evaluate(() => ({ bar: (document.querySelector('#schedBoard .sb-daybar, #schedBoard .sb-top') || {}).innerText })))
console.log(w.errors)
await w.browser.close()
