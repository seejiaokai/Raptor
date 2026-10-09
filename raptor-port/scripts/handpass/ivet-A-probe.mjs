// scratch look at the window's markup (read only) — walker A
import * as L from './ivet-A-lib.mjs'
const { page } = await L.open(L.DESK, 'ad', 'a', false)
await L.toList(page, false)
await L.plus(page, false)
for (const t of ['Training', 'LL', 'ATT C', 'Duty', 'Upchit']) {
  await page.selectOption('#inpEditType', t)
  await page.waitForTimeout(150)
  const d = await page.evaluate(() => {
    const body = document.querySelector('#inpEditPop .inped-body')
    const clone = body.cloneNode(true); clone.querySelectorAll('.rangecal').forEach(e => e.remove())
    return { text: clone.innerText.replace(/\s+/g, ' '), ids: [...clone.querySelectorAll('[id]')].map(e => e.id + ':' + e.tagName), foot: document.querySelector('#inpEditPop .airpop-foot')?.innerText.replace(/\s+/g, ' ') }
  })
  console.log(t, JSON.stringify(d))
}
await page.selectOption('#inpEditType', 'LL')
console.log(await page.evaluate(() => document.querySelector('#inpEditSpan')?.outerHTML))
console.log(await page.evaluate(() => document.querySelector('#inpEditAllday')?.parentElement?.outerHTML))
await page.selectOption('#inpEditType', 'ATT C')
console.log(await page.evaluate(() => (document.querySelector('#inpEditSpan') || document.body).outerHTML.slice(0, 1500)))
console.log(await page.evaluate(() => { const b = document.querySelector('#inpEditPop .inped-body'); return [...b.children].map(c => c.className + '|' + c.id + '|' + c.innerText.slice(0, 60).replace(/\s+/g, ' ')) }))
await L.browser.close()
