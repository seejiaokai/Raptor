import * as L from './or-F-lib.mjs'
import * as A from './or-F-acts.mjs'
const { page, ctx } = await L.open()
await L.fileInput(page, A.meetingSpec(['Drifter', 'Hunter', 'Ranger']))
await L.signAndPublish(page, 2)
await L.toWeek(page)
await L.shotHead(page, 'base-published-clean-head', 2, 170)
const t = async tag => { await L.toWeek(page); return page.evaluate(() => { const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][2]; return d.innerText.replace(/\s+/g, ' ').slice(0, 330) }) }
console.log('CLEAN', await t())
await A.addFromCrew(page, 'Tally', L.TITLE)
console.log('ADDED', await t())
await L.shotHead(page, 'base-added-head', 2, 170)
await A.takeOutRight(page, 'Tally', L.TITLE)
console.log('BACK', await t())
await L.shotHead(page, 'base-back-head', 2, 170)
await ctx.close(); await L.browser.close()
console.log('ERRS', JSON.stringify(L.errs))
