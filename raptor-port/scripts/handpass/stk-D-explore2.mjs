import * as H from './stk-D-lib.mjs'
const { open, nav, openBoard, boxList, scopeSel, sleep, pic } = H
const { browser, page, errors } = await open({ width: 1440, height: 900, who: 'a', fresh: false, state: process.env.STK_STATE })
await nav(page, 'editsched')
const wk = scopeSel('week', 5), sb = scopeSel('board', 5)
const wl = await boxList(page, wk)
console.log('WEEK Sat', wl.length); console.log(wl.map((b, i) => i + ' ' + b.kind + '=' + b.key + (b.sec ? ' [' + b.sec + ']' : '')).join('\n'))
await openBoard(page, 5)
const bl = await boxList(page, sb)
console.log('BOARD Sat', bl.length); console.log(bl.map((b, i) => i + ' ' + b.kind + '=' + b.key + (b.sec ? ' [' + b.sec + ']' : '')).join('\n'))
console.log('secs', await page.evaluate(() => [...document.querySelectorAll('#sbBoard [data-secmove]')].map(e => e.getAttribute('data-secmove') + '@' + Math.round(e.getBoundingClientRect().top))))
console.log('errors', errors)
await browser.close()
