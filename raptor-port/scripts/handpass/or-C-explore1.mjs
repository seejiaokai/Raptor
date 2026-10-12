import * as L from './or-C-lib.mjs'
const { browser, page: p, errs } = await L.openWorld()
const f = await L.fileInput(p, { type: 'Duty', person: 'Ranger', from: '2026-07-18', to: '2026-07-18', timed: ['09:00', '12:00'], oil: 'yes' })
console.log('filed', JSON.stringify(f))
const iid = f[0].iid
console.log(await L.recRaw(p, iid))
await L.goEdit(p)
const di = 5
console.log('row', await L.rowIdx(p, di, iid), JSON.stringify(await L.rowData(p, di, iid)))
// Saturday day card
const info = await p.evaluate((di) => {
  const d = document.querySelectorAll('#eWeek .day:not(.peek)')[di]
  const rows = [...d.querySelectorAll('.sec-grnd .pl-row')].map(r => ({ cls: r.className, txt: r.innerText.replace(/\s+/g, ' ').slice(0, 100), slot: r.getAttribute('data-slot'), kids: [...r.querySelectorAll('[data-slot]')].map(k => k.getAttribute('data-slot') + '|' + k.className.slice(0, 40)).slice(0, 8) }))
  return { rows, roster: !!document.querySelector('#eRoster'), rosterBox: document.querySelector('#eRoster')?.getBoundingClientRect().toJSON(), dayBox: d.getBoundingClientRect().toJSON() }
}, di)
console.log(JSON.stringify(info, null, 1))
await p.locator('#eWeek .day:not(.peek)').nth(di).scrollIntoViewIfNeeded()
await L.shot(p, 'x1-sat')
console.log(errs.join('\n'))
await browser.close()
