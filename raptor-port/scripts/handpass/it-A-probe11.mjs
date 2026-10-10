import { launch, open, shot, sleep, press, people, allRecs } from './it-A-lib.mjs'
import { calDoor, boardDoor, closeBoardAny } from './it-A-doors.mjs'
const browser = await launch()
const { ctx, page } = await open(browser, 'desk')
const P = await people(page)
const c = calDoor(); const before = new Set((await allRecs(page)).map(r => r.iid))
await c.openNew(page, { iso: '2026-07-15', person: P.Ranger, type: 'OD' }); await page.fill('#inpEditTitle', 'Overseas visit'); await c.submit(page)
const od = (await allRecs(page)).find(r => !before.has(r.iid))
const b = boardDoor(2)
await b.openSaved(page, od)
console.log('kinds', await page.locator('#inpEditPop #inpEditType option').allInnerTexts())
console.log('title', await page.locator('#inpEditPop input#inpEditTitle').inputValue())
await shot(page, 'probe11-board-od')
await browser.close()
