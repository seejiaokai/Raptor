/* [FLOATWIN-BOARD-BAR] (owner D1106, 21 Oct 26) — over the Scheduler Board a window he has not moved opens just below the
   board's own bar, so the bell, Insights and ✓ Done stay in reach. Walks the ALL AVAIL window (from a count on the board)
   and the changes window (from the board's History) at 1024, 1200 and 1440, asserts where each opens and that each of the
   three buttons takes a press, then presses ✓ Done with the window still open and checks the board closed. A PASS means
   correct. Run: HP_URL=http://localhost:<port> HP_SHOTS=<folder> node scripts/handpass/d1106-board-bar.mjs */
console.log('d1106-board-bar v1')
const { go, shot } = await import('./lib.mjs')
const { openAt } = await import('./lk-lib.mjs')
let fails = 0
const check = (ok, what) => { console.log(`${ok ? 'PASS' : 'FAIL'} ${what}`); if (!ok) fails++ }

const MEASURE = (sel) => {
  const win = [...document.querySelectorAll(sel)].find(w => !w.hidden && w.offsetWidth)
  const bar = document.querySelector('#schedBoard:not([hidden]) .sb-top')
  if (!win || !bar) return null
  const r = win.getBoundingClientRect(), q = bar.getBoundingClientRect()
  const reach = ['#sbBell', '#sbInsights', '#sbDone'].map(id => {
    const b = document.querySelector(id); if (!b || !b.offsetWidth) return `${id}: not drawn`
    const k = b.getBoundingClientRect(), at = document.elementFromPoint(k.left + k.width / 2, k.top + k.height / 2)
    return `${id}: ${at && (at === b || b.contains(at)) ? 'reachable' : 'COVERED'}`
  })
  return { top: Math.round(r.top), foot: Math.round(r.bottom), barFoot: Math.round(q.bottom), vh: innerHeight, reach }
}

for (const w of [1024, 1200, 1440]) {
  const { browser, page, errors } = await openAt({ width: w, height: 800 })
  await go(page, 'editsched')
  await page.evaluate(() => { const x = window; x.fillSlot('a:0.0.+', 'allavail'); x.afterSchedMutate() })
  await page.waitForTimeout(300)
  await page.click('#eWeek [data-sbday="0"]:visible')
  await page.waitForSelector('#schedBoard:not([hidden])')
  await page.waitForTimeout(400)
  for (const [name, sel, open] of [['ALL AVAIL', '.availwin', '#schedBoard [data-oilsent]:visible'], ['changes', '.chgwin', '#sbHist']]) {
    await page.locator(open).first().click()
    await page.waitForSelector(`${sel}:not([hidden])`)
    await page.waitForTimeout(250)
    const m = await page.evaluate(MEASURE, sel)
    if (!m) { check(false, `${w} the ${name} window opened over the board`); continue }
    console.log(`${w} ${name}: window top ${m.top} foot ${m.foot}, board bar foot ${m.barFoot}; ${m.reach.join(', ')}`)
    check(m.top === m.barFoot + 8, `${w} the ${name} window opens 8px below the board's bar`)
    check(m.foot <= m.vh, `${w} the ${name} window ends on the screen`)
    check(m.reach.every(x => /reachable$/.test(x)), `${w} the bell, Insights and ✓ Done each take a press with the ${name} window open`)
    await shot(page, `d1106-${w}-${sel.slice(1)}`)
    await page.click(`${sel} .win-x`).catch(() => {})
    await page.waitForTimeout(150)
  }
  /* the real gesture: ✓ Done pressed with the ALL AVAIL window still open — the board closes, the window stays over the week */
  await page.locator('#schedBoard [data-oilsent]:visible').first().click()
  await page.waitForSelector('.availwin:not([hidden])')
  await page.mouse.click(...await page.locator('#sbDone').evaluate(b => { const k = b.getBoundingClientRect(); return [k.left + k.width / 2, k.top + k.height / 2] }))
  await page.waitForTimeout(400)
  check(await page.locator('#schedBoard').evaluate(b => b.hidden), `${w} a mouse press on ✓ Done with the window open closes the board`)
  if (w === 1200) await shot(page, `d1106-${w}-done-pressed`)
  check(!errors.length, `${w} no console errors (${errors.join(' | ') || 'none'})`)
  await browser.close()
}
console.log(fails ? `${fails} FAIL` : 'ALL PASS')
process.exit(fails ? 1 : 0)
