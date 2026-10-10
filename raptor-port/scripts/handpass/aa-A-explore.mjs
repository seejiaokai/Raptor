import { world, closeAll, toInputs, fileInput, pic, sleep, closeWins } from './aa-A-lib.mjs'
import * as L from './lib.mjs'
const w = await world({ who: 'ad', size: 'd' })
const page = w.page
await toInputs(page)
await fileInput(page, { iso: '2026-07-15', type: 'Duty', person: 'allavail', remarks: 'S33-AA', start: '09:00', end: '12:00' })
await closeWins(page)
await L.go(page, 'editsched'); await L.board(page, 2)
console.log(await page.evaluate(() => { const g = window.DAYS[2].ground; return JSON.stringify(g.map((r, i) => ({ i, prog: r.prog, str: r.str, end: r.end, src: r.src, who: r.who }))) }))
console.log(await page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-grdel], #schedBoard [data-bfld]')].filter(e => /^g/.test(e.getAttribute('data-bfld') || '') || e.hasAttribute('data-grdel')).map(e => (e.getAttribute('data-bfld') || e.getAttribute('data-grdel')) + ' ' + e.tagName + ' ' + (e.value ?? '')).slice(0, 30)))
await closeAll()
