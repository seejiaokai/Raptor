import * as B from './cal-B-lib.mjs'
const w = await B.world('desk')
const p = w.page
await B.press(w, B.tid(w, 'month-JAN')); await B.sleep(600)
await B.press(w, B.tid(w, 'figures-toggle')); await B.sleep(500)
await p.evaluate(() => { const e = document.querySelector('[data-testid="cell-slipway-2026-01-06"]'); window.scrollBy(0, e.getBoundingClientRect().top - 300) }); await B.sleep(300)
await B.dragPick(w, B.cell(w, 'cell-slipway', '2026-01-06').first ? B.tid(w, 'cell-slipway-2026-01-06') : null, B.tid(w, 'cell-slipway-2026-01-08'))
console.log('marked', await p.evaluate(() => [...document.querySelectorAll('[data-testid^="cell-slipway-2026-01-0"]')].map(e => e.getAttribute('data-testid').slice(-5) + ':' + e.className).join(' | ')))
console.log('at 1200,135:', await p.evaluate(() => { const e = document.elementFromPoint(1200, 135); return e ? e.tagName + '.' + e.className + ' ' + (e.getAttribute('data-testid') || '') + ' parent ' + (e.parentElement?.className || '') : null }))
await p.mouse.click(1200, 135); await B.sleep(400)
console.log('panel after', await B.tid(w, 'select-sheet').count(), 'scrim', await B.tid(w, 'sheet-scrim').count(), 'sheets', await p.evaluate(() => [...document.querySelectorAll('[role=dialog]')].map(e => e.getAttribute('data-testid'))))
await B.pic(p, 'probe-outside')
await B.close(w)
