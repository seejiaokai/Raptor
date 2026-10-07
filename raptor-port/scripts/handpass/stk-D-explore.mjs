import * as H from './stk-D-lib.mjs'
const { open, nav, openBoard, openBoxes, caret, label, tabs, snap, same, sleep } = H
const { browser, page, errors } = await open({ width: 1440, height: 900, who: 'a', fresh: false })
await nav(page, 'editsched')
const wk = await openBoxes(page, '#eWeek .day[data-day="0"]')
console.log('WEEK boxes', wk.length); console.log(wk.map(b => b.kind + '=' + b.key + (b.sec ? ' [' + b.sec + ']' : '')).join('\n'))
// tab tour from first box
await page.locator('#eWeek .day[data-day="0"] [data-txt]').first().focus()
const s0 = await snap(page)
let c = await caret(page); console.log('START', label(c))
for (let i = 0; i < 80; i++) { await page.keyboard.press('Tab'); await sleep(50); c = await caret(page); console.log(i + 1, label(c), c.txt); if (c.page !== 'editsched' || !(c.kind)) { if (i > 3) break } }
const s1 = await snap(page); console.log('same', same(s0, s1))
await openBoard(page, 0)
const bb = await openBoxes(page, '#sbBoard')
console.log('BOARD boxes', bb.length); console.log(bb.map(b => b.kind + '=' + b.key + (b.sec ? ' [' + b.sec + ']' : '')).join('\n'))
await H.pic(page, 'explore-board')
console.log('errors', errors)
await browser.close()
