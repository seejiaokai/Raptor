const C = await import('./aa-C-lib.mjs')
const { world, fileInput, rec, shot, board, sleep, go } = C
const w = await world(); const { page } = w
await fileInput(page, { iso: '2026-07-18', kind: 'Duty', person: 'allavail', s: '09:00', e: '12:00', rmk: 'S4 duty', oil: 'yes' })
await go(page, 'editsched'); await sleep(400)
// ground row on the week
const wk = await page.evaluate(() => { const d = document.querySelector('#eWeek .day[data-day="5"]'); const p = d.querySelector('.puck.allavail'); const row = p && p.closest('.pl-row, .row, tr, [data-slot]'); return { has: !!p, rowCls: row && row.className, rowHTML: row && row.outerHTML.slice(0, 1500) } })
console.log(JSON.stringify(wk, null, 1))
await board(page, 5)
const bd = await page.evaluate(() => { const b = document.querySelector('#schedBoard'); const p = [...b.querySelectorAll('.puck.allavail')].find(e => e.offsetParent && !e.closest('#sbSide')); const row = p && p.closest('.sb-arow, .sb-row, [data-slot]'); return { has: !!p, rowCls: row && row.className, rowHTML: row && row.outerHTML.slice(0, 2500) } })
console.log(JSON.stringify(bd, null, 1))
const el = page.locator('#schedBoard .sb-arow .puck.allavail:visible').first()
if (await el.count()) { await el.scrollIntoViewIfNeeded(); await sleep(300) }
await shot(page, 'probe5-ground')
await w.browser.close()
