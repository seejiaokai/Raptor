// Round 3's check: the Remarks box's font, beside the Inputs window's own box (the dark box it copies — D1308)
import * as L from './lw-r3-lib.mjs'
const w = await L.newCtx('phone'); const P = w.page
await L.signInPlain(w, 'admin')
const ids = await P.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE || {}).map(([k, v]) => [v.cs, k])))
await L.openCellR(w, ids.Drifter, '2026-11-02')
console.log(JSON.stringify(await P.evaluate(() => { const t = document.querySelector('[data-testid="bid-remarks"]'); const c = getComputedStyle(t); return { family: c.fontFamily, size: c.fontSize, weight: c.fontWeight, lh: c.lineHeight, bg: c.backgroundColor, h: t.getBoundingClientRect().height, body: getComputedStyle(document.body).fontFamily } })))
await L.closeBrowser()
