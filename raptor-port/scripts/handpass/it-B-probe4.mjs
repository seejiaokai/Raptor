import * as L from './it-B-lib.mjs'
const W = await L.mk('desk')
const p = W.page
const ranger = await L.csId(p, 'Ranger')
await L.fileInput(W, { iso: '2026-07-15', type: 'OD', person: ranger, title: 'Overseas visit', rmk: 'od title test' })
await L.editWeek(p); await L.showDay(p, 2)
const out = await p.evaluate(() => {
  const d = document.querySelector('#eWeek .day[data-day="2"]')
  const hs = [...d.querySelectorAll('*')].filter(e => /unavailable/i.test(e.textContent) && e.textContent.length < 40).map(e => e.tagName + '.' + e.className + ' kids' + e.children.length + ' :: ' + e.textContent.trim())
  const btn = [...d.querySelectorAll('.ntx')].filter(e => /overseas/i.test(e.textContent)).map(e => { const ch = []; let x = e; for (let i = 0; i < 6 && x; i++) { ch.push(x.tagName + '.' + x.className); x = x.parentElement } return ch })
  return { hs, btn }
})
console.log(JSON.stringify(out, null, 1))
await W.browser.close()
