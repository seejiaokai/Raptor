/* W2 probe 2 — a driver check: the month calendar's day cells (why a day would not open). */
process.env.HP_URL ||= 'http://localhost:4202'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-30-dbrA/W2'
process.env.HP_OUT ||= 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/236f9951-7075-4c81-a20c-6df6f75ba05d/scratchpad/dbrA-W2-probe2.json'
const H = await import('./dbrA-W2-lib.mjs')
const { L, sleep } = H
const browser = await L.launch()
const ctx = await L.context(browser)
const errors = []
const p = await L.page(ctx, errors, 'A')
await L.signIn(p, 'a')
await H.inputsList(p)
await p.locator('#inCalBtn').click(); await sleep(700)
console.log('mon', await p.locator('#inpCal .ic-mon').allInnerTexts())
const info = await p.evaluate(() => {
  const cells = [...document.querySelectorAll('[data-icday="2026-10-14"]')]
  return cells.map(c => { const r = c.getBoundingClientRect(); const n = c.querySelector('.ic-num'); const rn = n && n.getBoundingClientRect(); return { inCal: !!c.closest('#inpCal'), r: [r.x, r.y, r.width, r.height], num: rn && [rn.x, rn.y, rn.width, rn.height], vis: getComputedStyle(c).visibility, disp: getComputedStyle(c).display } })
})
console.log(JSON.stringify(info))
console.log('inpCal count', await p.locator('#inpCal').count(), 'grid', await p.evaluate(() => { const g = document.querySelector('#inpCal .ic-grid'); const r = g.getBoundingClientRect(); return [r.x, r.y, r.width, r.height, g.scrollHeight] }))
await L.shot(p, '_probe-cal')
const c = p.locator('#inpCal [data-icday="2026-10-14"]').first()
const box = await c.boundingBox(); console.log('box', box)
await p.mouse.click(box.x + box.width / 2, box.y + 12); await sleep(500)
console.log('pop', await p.locator('.ic-pop').count(), await p.locator('.ic-pop:visible').count())
await L.shot(p, '_probe-cal-pop')
console.log('errors', errors)
await browser.close()
