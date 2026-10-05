import * as K from './stk-K-lib.mjs'
const { L, W, H } = K
const { browser, p, errors } = await H.world({ who: 'a', phone: false })
await L.go(p, 'editsched')
await p.waitForSelector('#eWeek .day[data-day="0"]')
const info = await p.evaluate(() => {
  const d = document.querySelector('#eWeek .day[data-day="0"]')
  const q = s => [...d.querySelectorAll(s)].map(e => ({ k: e.dataset.atime || e.dataset.txt || e.dataset.area, t: e.innerText.trim(), r: (() => { const r = e.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] })() }))
  return { atime: q('[data-atime]'), to: q('[data-txt$=".to"]'), ld: q('[data-txt$=".ld"]'), area: q('[data-area]'), bombs: q('[data-bombs]') }
})
console.log(JSON.stringify(info, null, 0))
console.log('ELOG', await p.evaluate(() => [window.ELOG.rows.length, window.commandStreamLen()]))
console.log('formation0', await p.evaluate(() => JSON.stringify(window.DAYS[0].waves[0].formations[0]).slice(0, 700)))
// all the days: which have atime displays
console.log(await p.evaluate(() => [...document.querySelectorAll('#eWeek .day')].map(d => d.dataset.day + ':' + [...d.querySelectorAll('[data-atime]')].map(e => e.innerText.trim()).join(','))))
await H.pic(p, 'probe-week')
await browser.close()
