import { world, fileInput, openNew, timeFields, pic, sleep, tid, go, openBoard, dump } from './aa-B-lib.mjs'
const w = await world('desk')
const { page } = w
w.tag = 'p1'
await openNew(page, '2026-07-18')
console.log(JSON.stringify(await timeFields(page)))
await pic(w, 'editor')
console.log('optgroups', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('#inpEditType optgroup')].map(g => g.label + ':' + [...g.querySelectorAll('option')].map(o => o.value).join(',')))))
await page.keyboard.press('Escape')
const r = await fileInput(page, { iso: '2026-07-18', kind: 'Duty', person: 'allavail', rmk: 'p1', oil: 'yes' })
console.log(JSON.stringify(r))
await go(page, 'editsched')
console.log(JSON.stringify(await page.evaluate(() => ({
  pucks: [...document.querySelectorAll('.puck.allavail')].map(e => e.outerHTML.slice(0, 200)),
  counts: [...document.querySelectorAll('.oilcount')].map(e => e.outerHTML.slice(0, 300)),
  week: [...document.querySelectorAll('#eWeek .day')].length,
  oilmode: [...document.querySelectorAll('[data-oilmode]')].map(e => e.outerHTML.slice(0, 200)),
  sb: [...document.querySelectorAll('[data-sbday]')].map(e => e.dataset.sbday + ':' + (e.offsetParent !== null)),
})), null, 1))
await pic(w, 'week')
console.log(w.errors)
await w.browser.close()
