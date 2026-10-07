import * as H from './stk-D-lib.mjs'
const { open, nav, openBoard, boxList, scopeSel, sleep, pic, clickBox } = H
const { browser, page, errors } = await open({ width: 1440, height: 900, who: 'a', fresh: false, state: process.env.STK_STATE })
await nav(page, 'editsched')
await openBoard(page, 5)
const info = await page.evaluate(() => {
  const out = []
  for (const k of ['ff:5.1.0.br', 'ff:5.1.0.to', 'ff:5.2.0.br', 'ff:5.3.0.br', 'ff:5.0.0.br']) {
    for (const e of document.querySelectorAll(`#sbBoard [data-bfld="${k}"]`)) {
      const r = e.getBoundingClientRect(), cs = getComputedStyle(e)
      out.push({ k, tag: e.tagName, x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height), op: cs.opacity, vis: cs.visibility, disp: cs.display, pe: cs.pointerEvents, ph: e.placeholder || '', val: e.value, tab: e.tabIndex })
    }
  }
  return out
})
console.log(JSON.stringify(info))
const bl = await boxList(page, '#sbBoard')
const ix = bl.findIndex(b => b.key === 'ff:5.1.0.cs')
await clickBox(page, '#sbBoard', ix)
await pic(page, 'explore3-sc-board')
console.log('errors', errors)
await browser.close()
