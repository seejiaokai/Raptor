/* w3 PROBE (24 Sep 26) — learn the everything week before walking it: every day head on the edit week,
   the book, who Saturday's publication credits on the Leave War, what Undo offers at the start, and what a
   Leave War cell's sheet offers (to plan the "bid against" case). Reads only; writes nothing. */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w3'
const STATE = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/2026-09-24-amendment-week.json'
const L = await import('./am-lib.mjs')
const { open, editWeek, head, book, go } = L
const { browser, page, errors } = await open({ state: STATE })
const log = (k, v) => console.log(k.padEnd(20), typeof v === 'string' ? v : JSON.stringify(v))
await editWeek(page)
for (let di = 0; di < 7; di++) log('head d' + di, await head(page, di))
log('book', await book(page))
log('undo at start', await page.evaluate(() => ({ u: document.querySelector('#undoBtn')?.title, ud: document.querySelector('#undoBtn')?.disabled, r: document.querySelector('#redoBtn')?.title })))
log('dates', await page.evaluate(() => window.DATES))
// who is credited on the Saturday (the Leave War grid, July)
await go(page, 'leavewar'); await page.waitForTimeout(1200)
const mon = page.locator('[data-testid="month-JUL"]')
if (await mon.count()) { await mon.first().click(); await page.waitForTimeout(1200) }
const sat = await page.evaluate(() => {
  const P = window.PEOPLE, out = []
  for (const c of document.querySelectorAll('[data-testid^="cell-"]')) {
    const m = c.dataset.testid.match(/^cell-(.+)-(2026-07-1[89])$/); if (!m) continue
    const t = (c.innerText || '').trim(); if (!t) continue
    out.push(`${(P[m[1]] || {}).cs || m[1]} ${m[2]} "${t}" ${c.className.slice(0, 60)}`)
  }
  return out
})
log('LW 18/19 Jul cells', sat)
log('LW stage/war', await page.evaluate(() => (document.querySelector('[data-testid="lw-hist"]')?.parentElement?.innerText || '').replace(/\s+/g, ' ').slice(0, 300)))
log('lw undo', await page.evaluate(() => ({ t: document.querySelector('[data-testid="lw-undo"]')?.title, d: document.querySelector('[data-testid="lw-undo"]')?.disabled })))
console.log('errors', errors)
await browser.close()
