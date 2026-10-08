import * as H from './cal-H-lib.mjs'
const { browser, page, errors } = await H.world({})
const info = await page.evaluate(() => {
  const P = window.PEOPLE
  return {
    week: window.CURWEEK, page: window.CURPAGE, role: window.CURROLE,
    people: Object.keys(P).slice(0, 80).map(k => `${k}:${P[k].cs}:${P[k].seat || ''}${P[k].san ? ':SANS' : ''}${P[k].pers ? ':pers' : ''}`),
    inputs: window.INPUTS.map(x => [x.iid, x.person, x.type, x.date, x.endDate, x.grp, x.acc].join('|')).slice(0, 40),
    dates: window.DATES, win: Object.keys(window).filter(k => /^(lw|raptor|fly|file|set|open|hist|SCHED|ELOG|DAYS)/.test(k)).slice(0, 80),
  }
})
console.log(JSON.stringify(info, null, 1))
await H.go(page, 'inputs')
await H.pic(page, 'probe-inputs')
console.log(errors)
await browser.close()
