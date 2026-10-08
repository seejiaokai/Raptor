import * as H from './cal-H-lib.mjs'
H.setTag('p3')
const { browser, page, errors } = await H.world({})
await H.toEdit(page)
await H.showDay(page, 2)
await H.signDay(page, 2); await H.publishDay(page, 2)
await H.inputsMonth(page, 2026, 7)
await H.fileShared(page, { iso: '2026-07-15', type: 'Meeting', people: ['Ranger', 'Drifter', 'Ace'], remarks: 'probe shared' })
await H.toEdit(page); await H.showDay(page, 2)
await H.changesWin(page, 2)
await H.pic(page, 'changes-open')
console.log(JSON.stringify(await H.changesRead(page), null, 1))
for (const t of ['New to you', 'All changes', 'To go out']) { await H.changesTab(page, t); console.log(t, JSON.stringify(await H.changesRead(page))); await H.pic(page, 'chg-' + t.replace(/ /g, '')) }
// toolbar buttons
const btns = await page.evaluate(() => [...document.querySelectorAll('#page-editsched .toolbar button, .topbar button, #eToolbar button, button[title]')].filter(b => b.offsetParent).map(b => (b.id || '') + '|' + (b.title || '') + '|' + (b.innerText || '').trim().slice(0, 20)).slice(0, 60))
console.log(btns)
console.log(errors)
await browser.close()
