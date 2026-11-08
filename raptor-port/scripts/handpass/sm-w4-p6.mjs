// W4 probe for scenario 6: reach the week of 20 Jul, make a small saved change, find its row key
import * as L from './sm-lib.mjs'
console.log('sm-w4-p6 v1', L.DIST)
const OUT = L.outDir('w4')
const W = await L.launch('pc', { origin: 'http://localhost:4398' })
const { page } = W
try {
  await L.signIn(W)
  const m = await L.fileInput(W, { who: 'Saint', type: 'Meeting', iso: '2026-07-19', iso2: '2026-07-20' })
  console.log('filed', JSON.stringify(m && { acc: m.acc, allday: m.allday, date: m.date, endDate: m.endDate }))
  await L.goEdit(W)
  console.log('keys before', JSON.stringify(await page.evaluate(() => Object.keys(localStorage).filter(k => /weeks\//.test(k)))))
  await page.getByRole('button', { name: /Jul 20/ }).first().click(); await L.sleep(1500)
  console.log('week label', await page.evaluate(() => (document.querySelector('#eWeek section.day[data-day="0"] .dtitle, #eWeek section.day[data-day="0"]') || {}).textContent?.slice(0, 80)))
  const notes = await page.evaluate(() => [...document.querySelectorAll('#eWeek section.day[data-day="0"] [data-key^="dn:"], #eWeek section.day[data-day="0"] [data-tk^="dn:"], #eWeek section.day[data-day="0"] [contenteditable], #eWeek section.day[data-day="0"] input, #eWeek section.day[data-day="0"] textarea')].slice(0, 12).map(e => e.tagName + '|' + e.className.slice(0, 30) + '|' + [...e.attributes].map(a => a.name + '=' + a.value.slice(0, 20)).join(',').slice(0, 90)))
  console.log(JSON.stringify(notes, null, 1))
  await L.pic(W, OUT, 'p6-week20', { sel: '#eWeek section.day[data-day="0"]' })
} catch (e) { console.log('ERR', String(e).slice(0, 300)) }
console.log('errs', JSON.stringify(W.errs))
await L.closeAll(W)
