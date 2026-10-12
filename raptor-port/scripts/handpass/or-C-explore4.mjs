import * as L from './or-C-lib.mjs'
import * as L2 from './or-C-lib2.mjs'
const { browser, page: p, errs } = await L.openWorld()
const f = await L.fileInput(p, { type: 'Duty', person: 'Ranger', from: '2026-07-18', to: '2026-07-18', timed: ['09:00', '12:00'], oil: 'yes' })
const iid = f[0].iid, di = 5
await L.goEdit(p)
await p.locator('#eWeek .day:not(.peek)').nth(di).scrollIntoViewIfNeeded()
await L.drag(p, p.locator('#eRoster .rpuck[data-person="allavail"]:visible').first(), p.locator(`#eWeek [data-fill="g:${di}.0.+"] .addz`).first())
const s = await L2.surfaces(p, { di, iso: '2026-07-18', iid })
console.log(JSON.stringify(s, null, 1))
const w = await L2.readWindow(p, { iso: '2026-07-18', iid })
console.log(JSON.stringify(w, null, 1))
console.log(errs.join('\n'))
await browser.close()
