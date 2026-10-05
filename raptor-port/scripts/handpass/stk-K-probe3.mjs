import * as K from './stk-K-lib.mjs'
const { L, W, H } = K
const { browser, p, errors } = await H.world({ who: 'a', phone: false })
await L.go(p, 'editsched')
await p.waitForSelector('#eWeek .day[data-day="0"]')
const info = await p.evaluate(() => {
  const out = {}
  for (const iid of window.INPUTS.filter(x => ['pike', 'salsa', 'bane', 'sufa'].includes(x.person)).map(x => x.iid)) {
    const x = window.INPUTS.find(r => r.iid === iid)
    out[iid + ' ' + x.person + ' ' + x.type + ' ' + x.date + '-' + (x.endDate || '') + ' acc=' + x.acc] = [...document.querySelectorAll(`#eWeek [data-inp^="${iid}"], #eWeek [data-ifld^="${iid}"]`)].map(e => (e.closest('.day') || {dataset:{}}).dataset.day + ':' + (e.dataset.inp || e.dataset.ifld) + '=' + e.innerText.trim().slice(0, 40) + ' @' + (() => { const r = e.getBoundingClientRect(); return Math.round(r.x) + ',' + Math.round(r.y) })())
  }
  return out
})
console.log(JSON.stringify(info, null, 1))
const grounds = await p.evaluate(() => window.DAYS.map((d, i) => (d.ground || []).map((g, j) => i + '.' + j + ' src=' + g.src + ' who=' + g.who + ' rmks=' + g.rmks)).flat())
console.log(grounds)
const gtx = await p.evaluate(() => [...document.querySelectorAll('#eWeek [data-txt^="gr:"]')].map(e => e.dataset.txt + '=' + e.innerText.trim().slice(0, 30) + ' day' + e.closest('.day').dataset.day))
console.log(gtx)
await browser.close()
