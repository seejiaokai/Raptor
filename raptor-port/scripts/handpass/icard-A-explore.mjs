import { launch, open, openDay, press, WIN, DAYWIN, shot, csId, saveWin } from './icard-A-lib.mjs'
const browser = await launch()
const T = false
const { page: p } = await open(browser, { width: 1440, height: 900 }, 'ad', 'a', T)
await openDay(p, '2026-07-23', T)
await p.locator(`${DAYWIN} [data-testid^="idy-row-"]`).filter({ hasText: 'Flight safety brief' }).locator(".icard-words").click(); await p.locator(WIN).waitFor()
await p.locator('#inpEditDel').click(); await p.waitForTimeout(400)
const m = await p.evaluate(() => { const no = document.querySelector('[data-testid="inped-delall-no"]'); const w = document.querySelector('[data-testid="win-inputedit"]'); const b = no.getBoundingClientRect(), wb = w.getBoundingClientRect(); return { keep: [Math.round(b.top), Math.round(b.bottom)], win: [Math.round(wb.top), Math.round(wb.bottom)], vh: innerHeight, scrollable: [...w.querySelectorAll('*')].filter(e => e.scrollHeight > e.clientHeight + 2 && /auto|scroll/.test(getComputedStyle(e).overflowY)).map(e => e.className + ':' + e.scrollTop + '/' + (e.scrollHeight - e.clientHeight)) } })
console.log(JSON.stringify(m))
await shot(p, 'x-explore-keep-visible')
await browser.close()
