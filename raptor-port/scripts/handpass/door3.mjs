import { open, board } from './lib.mjs'
const STATE = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json'
const { browser, page } = await open({ state: STATE })
await board(page, 5)
const r = await page.evaluate(() => {
  const panels = ['pinp', 'unav', 'sansav', 'grnd']
  const out = {}
  for (const p of panels) {
    const el = document.querySelector('#schedBoard .sb-panel.' + p)
    if (!el) { out[p] = 'NO PANEL'; continue }
    out[p] = {
      visible: !!el.offsetParent,
      cls: el.className,
      hidden: getComputedStyle(el).display,
      rowsAny: el.querySelectorAll('.sb-arow.inprow, .sbi-row, .sanscard').length,
      doors: el.querySelectorAll('[data-inpedit]').length,
      head: (el.querySelector('.sb-ph, h3, .sb-phead, header') || {}).innerText || '',
      text: (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 160),
    }
  }
  return out
})
console.log(JSON.stringify(r, null, 1))
await browser.close()
