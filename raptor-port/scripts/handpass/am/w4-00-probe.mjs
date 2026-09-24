/* w4 probe — learn the ground before the walk: plasma's Saturday box and OIL figure on the
   everything week, the Saturday's head, and the view page's Saturday, at one width.
   Usage: node w4-00-probe.mjs [desktop|phone] */
const w = process.argv[2] || 'desktop'
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w4/probe'
const L = await import('./w4-lib.mjs')
const { open, STATE, PHONE, DESK, lwOpen, lwCell, lwBalCol, lwOilFig, lwCloseSheet, lwShot, editWeek, head, viewDay, shot, book } = L
const { browser, page, errors } = await open({ ...(w === 'phone' ? PHONE : DESK), state: STATE })
const log = (k, v) => console.log(k.padEnd(22), typeof v === 'string' ? v : JSON.stringify(v).slice(0, 900))

await lwOpen(page)
log('plasma cell', await lwCell(page, 'plasma'))
log('bal col', await lwBalCol(page, 'plasma'))
await lwShot(page, `p-${w}-lw-plasma`, 'plasma')
log('fig', await lwOilFig(page, 'plasma'))
await shot(page, `p-${w}-lw-plasma-fig`)
await lwCloseSheet(page)
log('counter options', await page.evaluate(() => { const s = document.querySelector('[data-testid="counter-pick"]'); return s ? (s.tagName + ' ' + [...(s.options || [])].map(o => o.value + ':' + o.text).join(',')) : 'none' }))

await editWeek(page)
log('sat head', await head(page, 5))
await page.locator('#eWeek .day[data-day="5"]').evaluate(e => e.scrollIntoView({ block: 'start' }))
await shot(page, `p-${w}-edit-sat`)
log('view sat', await viewDay(page, 5))
await page.locator('#vWeek .day[data-day="5"]').evaluate(e => e.scrollIntoView({ block: 'start' }))
await shot(page, `p-${w}-view-sat`)
log('book', await book(page))
log('errors', errors)
await browser.close()
