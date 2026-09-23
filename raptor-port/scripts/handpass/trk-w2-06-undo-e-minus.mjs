/* [HUMAN-RETEST] Tracker — walker w2, walk 6e: Fable #39, failures in both
   orders — + + (the second back-dated) → − → ↶ → ↷. Does ↶ of a − bring the
   removed failure back WITH its day? */
import { open, shot, save, log, DESK } from './trk-lib.mjs'
import { sleep, tapBall, popFails, typeDate, undoState } from './trk-w2-lib.mjs'

const L = log()
const { browser, page, errors } = await open({ size: DESK, who: 'a' })
await tapBall(page, 'ST-02')
await page.click('#popFailPlus'); await sleep(350)
await typeDate(page, '#popFailDate', '2026-09-10'); await page.click('#popFailPlus'); await sleep(350)
const a = await popFails(page)
await page.click('#popFailMinus'); await sleep(350)
const b = await popFails(page)
const tip = (await undoState(page)).undo.t
await page.keyboard.press('Escape'); await sleep(200)
await page.click('#trUndoBtn'); await sleep(500)
await tapBall(page, 'ST-02'); const c = await popFails(page); await page.keyboard.press('Escape'); await sleep(200)
await page.click('#trRedoBtn'); await sleep(500)
await tapBall(page, 'ST-02'); const d = await popFails(page)
await shot(page, 'w2-08-minus-undo-redo')
await page.keyboard.press('Escape'); await sleep(200)
L.note('+ + (10/09) → −', JSON.stringify({ two: a.list, afterMinus: b.list, tip }))
L.ok('↶ of the − brings the removed failure back WITH its day (ST-02X 10/09/26)', JSON.stringify(c.list) === JSON.stringify(a.list), JSON.stringify(c.list))
L.ok('↷ takes it away again', JSON.stringify(d.list) === JSON.stringify(b.list), JSON.stringify(d.list))
save('w2-06-undo-e-minus', { rows: L.rows, errors })
console.log(`errors ${errors.length}: ${errors.slice(0, 6).join(' | ')}`)
await browser.close()
