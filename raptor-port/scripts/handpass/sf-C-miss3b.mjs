import * as L from './sf-C-lib.mjs'
const { launch, ctxOpen, openBoard, sleep, shot, rec, go, errors } = L
const S = 'W2'
const b = await launch()
const { p } = await ctxOpen(b, {})
await go(p, 'editsched'); await sleep(300)
await openBoard(p, 5)
await p.locator('#schedBoard [data-wvadd="5"]:visible').first().click(); await sleep(700)
const picker = await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find(e => e.offsetParent && /^Flying wave/.test(e.innerText)); let r = b; for (let i = 0; i < 4 && r.parentElement; i++) { if (/SC/.test(r.innerText) && /AVALON/.test(r.innerText)) break; r = r.parentElement } return r.innerText.replace(/\s+/g, ' ') })
await shot(p, 'W2-1-board-wave-picker')
rec(S, '+ Wave picker on the board', 'the wave-kind notes', picker, /shown only|only shown|outside the warnings/i.test(picker) ? 'FAIL' : 'RECORD', 'C-W2-1-board-wave-picker.png')
await b.close()
