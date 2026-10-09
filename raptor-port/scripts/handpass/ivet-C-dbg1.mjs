import * as L from './ivet-C-lib.mjs'
const { page, ctx } = await L.openState('desk-saber', L.DESK, 'us', 'us', false)
await L.toList(page, false)
await page.selectOption('#inFPerson', 'all')
const pid = await L.csId(page, 'Zulu')
console.log(JSON.stringify(await page.evaluate(pid => window.INPUTS.filter(r => r.person === pid).map(r => ({ iid: r.iid, type: r.type, date: r.date, end: r.endDate, grp: r.grp, rmk: r.remarks, sans: r.sans, kind: r.kind })), pid)))
await page.selectOption('#inFPerson', pid); await page.waitForTimeout(300)
console.log(JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('#inBody tr[data-iid]')].map(t => t.innerText.replace(/\s+/g, ' ')))))
await L.browser.close()
