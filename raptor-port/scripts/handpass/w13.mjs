/* WORDING 13 — "a claim row's NAME says nothing on this row can earn, while
   the puck beside it says he earns a full day". Both on screen together. */
import { open, board, openInputs, tap, shot, SHOTS } from './lib.mjs'
const { browser, page } = await open({ state: 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json' })
await board(page, 5); await openInputs(page, 5)
await tap(page, '#sbOil'); await page.waitForTimeout(900)
const rows = await page.evaluate(() => {
  const out = []
  for (const r of [...document.querySelectorAll('#schedBoard .sb-arow, #schedBoard .sb-line')].filter(e => e.offsetParent)) {
    const cell = r.querySelector('.oilitem')
    const pk = r.querySelector('.oilpk')
    if (!cell || !pk) continue
    out.push({
      row: (r.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 34),
      nameCellSays: (cell.title || '').replace(/\s+/g, ' ').slice(0, 84),
      cellHasSwitch: !!cell.getAttribute('data-oilitem'),
      puckSays: (pk.title || '').replace(/\s+/g, ' ').slice(0, 84),
      CONTRADICTS: /nothing on this row can earn/i.test(cell.title || '') && /earns (a full|half)/i.test(pk.title || ''),
    })
  }
  return out
})
console.log(JSON.stringify({
  total: rows.length,
  contradicting: rows.filter(r => r.CONTRADICTS),
  claimRows: rows.filter(r => /each person on it/.test(r.nameCellSays)),
  stillInert: rows.filter(r => /nothing on this row can earn/i.test(r.nameCellSays)).map(r => ({ row: r.row, puck: r.puckSays })),
}, null, 1))
await shot(page, 'w13-contradiction')
await browser.close()
