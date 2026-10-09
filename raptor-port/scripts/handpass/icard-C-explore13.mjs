import * as L from './icard-C-lib.mjs'
const { sleep } = L
const w = await L.world('desk', 'us')
const p = w.page
const ranger = await L.pid(p, 'Ranger')
await L.openNew(w, '2026-07-20')
await p.selectOption('#inpEditType', 'LL')
await L.calTap(w, '2026-07-21')
await L.saveWin(w); await L.closeWins(p)
const rec = await L.recBy(p, { type: 'LL', date: 'Jul 20', person: ranger })
await L.switchUser(w, 'ad')
await L.signAndPublish(w, 'Jul 20', 0)
await L.signDay(p, 0, 1)
const dump = async tag => {
  await L.editDay(w, 'Jul 20', 0)
  console.log(tag, JSON.stringify(await L.head(p, 0)))
  console.log(await p.evaluate(() => { const d = document.querySelector('#eWeek .day[data-day="0"]'); const t = d.innerText; const out = []; for (const m of t.matchAll(/.{0,60}(till|Ranger|UNAVAIL|Unavail).{0,60}/gi)) out.push(m[0].replace(/\s+/g, ' ')); return out.slice(0, 12) }))
  console.log(await p.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="0"] [class*="unav"], #eWeek .day[data-day="0"] .gr-leave, #eWeek .day[data-day="0"] [data-iu]')].map(e => e.className + '::' + e.innerText.replace(/\s+/g, ' ').slice(0, 80)).slice(0, 8)))
}
await dump('before')
await L.switchUser(w, 'us')
await L.openFromList(w, rec.iid)
await L.calTap(w, '2026-07-20', '2026-07-22'); await L.saveWin(w)
await L.switchUser(w, 'ad')
await dump('after')
await L.pic(w, 'x13-after')
await w.browser.close()
