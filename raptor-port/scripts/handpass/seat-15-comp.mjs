/* A COMP, not a change. The owner asked to SEE two pucks a row before any
   product code is written (his 7 Aug 26 rule). This drives the real app at
   phone width with a real crowd open, then layers throwaway CSS on top and
   photographs each option. Nothing here touches the product. */
import { open, board, tap, type, shot, STATE } from './lib.mjs'
const di = 5
const { browser, page, errors } = await open({ width: 375, height: 812, state: STATE })
await board(page, di)

await tap(page, `[data-sblkadd="${di}"]`)
await page.waitForTimeout(700)
await type(page, `[data-bfld="sr:${di}.amt.4.str"]`, '09:00')
await type(page, `[data-bfld="sr:${di}.amt.4.end"]`, '11:00')
const pax = await page.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-slot.empty[data-slot*="amt.4"]')]
  .filter(e => e.offsetParent !== null).map(e => e.getAttribute('data-slot')))
await tap(page, `[data-slot="${pax[0]}"]`)
await page.waitForTimeout(250)
await page.locator('#sbRoster .rpuck[data-person="allavail"]:visible').first().click()
await page.waitForTimeout(700)
const b = page.locator(`[data-oilmode="${di}"]`).first()
if (await b.count() && await b.isVisible()) { await b.click(); await page.waitForTimeout(900) }
else { await page.locator('#sbOil').click(); await page.waitForTimeout(900) }

/* what is the crowd's container, and how wide is it? */
const shape = await page.evaluate(() => {
  const pk = [...document.querySelectorAll('#schedBoard [data-oilp]')].filter(e => e.offsetParent !== null)
  if (!pk.length) return 'no crowd'
  const cell = pk[0].parentElement
  const row = cell.closest('.pl-row, .sb-arow') || cell.parentElement
  const cs = getComputedStyle(cell)
  const rb = row.getBoundingClientRect(), cb = cell.getBoundingClientRect()
  return { n: pk.length, cellCls: cell.className, rowCls: row.className,
    display: cs.display, cols: cs.gridTemplateColumns, gap: cs.gap,
    cellW: Math.round(cb.width), rowW: Math.round(rb.width), rowH: Math.round(rb.height),
    puckW: Math.round(pk[0].getBoundingClientRect().width),
    rowChildren: [...row.children].map(c => c.className.slice(0, 22) + ':' + Math.round(c.getBoundingClientRect().width)) }
})
console.log('SHAPE:', JSON.stringify(shape, null, 1))

const measure = async (tag) => page.evaluate(() => {
  const pk = [...document.querySelectorAll('#schedBoard [data-oilp]')].filter(e => e.offsetParent !== null)
  const row = pk[0].closest('.pl-row, .sb-arow') || pk[0].parentElement.parentElement
  const ys = new Set(pk.map(e => Math.round(e.getBoundingClientRect().y)))
  const clipped = pk.filter(e => e.scrollWidth > e.clientWidth + 1).map(e => e.textContent.trim().split('\n')[0])
  return { rows: ys.size, rowH: Math.round(row.getBoundingClientRect().height),
    pct: Math.round(row.getBoundingClientRect().height / window.innerHeight * 100),
    puckW: Math.round(pk[0].getBoundingClientRect().width), clipped: clipped.slice(0, 6), nClipped: clipped.length }
})

const scrollToRow = () => page.evaluate(() => {
  const pk = document.querySelector('#schedBoard [data-oilp]')
  const row = pk.closest('.pl-row, .sb-arow') || pk.parentElement
  row.scrollIntoView({ block: 'start' })
})

await scrollToRow(); await page.waitForTimeout(300)
console.log('\nA — as it is now:', JSON.stringify(await measure()))
await shot(page, 'COMP-A-one-per-row-today')

/* B — two a row, inside the cell as it stands */
await page.addStyleTag({ content: `
  #schedBoard .ppl.oilppl, #schedBoard .ppl:has([data-oilp]){display:grid !important;
    grid-template-columns:1fr 1fr !important;gap:1px 2px !important;align-content:start !important}
  #schedBoard [data-oilp]{width:auto !important;min-width:0 !important;max-width:none !important}` })
await page.waitForTimeout(500); await scrollToRow(); await page.waitForTimeout(300)
console.log('B — two a row:', JSON.stringify(await measure()))
await shot(page, 'COMP-B-two-per-row')
