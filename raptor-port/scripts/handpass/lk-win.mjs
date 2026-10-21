/* [FLOATWIN-TWO-LINE-BAR] — where each movable window opens against the top bar, at the desktop widths where the bar is
   one line and where it is two (21 Oct 26, the look-and-keys night job). Run against either build:
   HP_URL=http://localhost:<port> HP_SHOTS=<folder> LK_TAG=<before|after> node scripts/handpass/lk-win.mjs */
console.log('lk-win v2')
const { go, shot } = await import('./lib.mjs')
const { openAt } = await import('./lk-lib.mjs')
const TAG = process.env.LK_TAG || 'x'

/* the window against the bar it opens over: its top, the bar's bottom, and what a finger meets in the bar's last 3px */
const MEASURE = (sel) => {
  const win = [...document.querySelectorAll(sel)].find(w => !w.hidden && w.offsetWidth)
  const bar = document.getElementById('burger')?.closest('.topbar')
  if (!win) return { open: false }
  const r = win.getBoundingClientRect(), q = bar.getBoundingClientRect()
  const board = document.querySelector('#schedBoard:not([hidden]) .sb-top')
  const bq = board ? board.getBoundingClientRect() : null
  const x = r.left + r.width / 2
  const hit = document.elementFromPoint(x, (board ? bq.bottom : q.bottom) - 3)
  return { open: true, top: Math.round(r.top), foot: Math.round(r.bottom), barBottom: Math.round(q.bottom), boardTop: bq ? Math.round(bq.bottom) : null,
    underBarFoot: hit ? (win.contains(hit) ? 'THE WINDOW' : (hit.closest('.topbar') ? 'the top bar' : hit.closest('.sb-top') ? "the board's bar" : hit.tagName + '.' + hit.className)) : 'nothing' }
}
const line = (where, m) => console.log(`${TAG} ${where}: ` + (m.open ? `window top ${m.top} foot ${m.foot} · bar bottom ${m.barBottom}${m.boardTop != null ? ` · board bar bottom ${m.boardTop}` : ''} · in the bar's last 3px: ${m.underBarFoot}` : 'NOT OPEN'))

for (const w of [1024, 1200, 1366, 1440]) {
  const { browser, page, errors } = await openAt({ width: w, height: 800 })
  await go(page, 'editsched')
  /* the changes window, from the top bar's clock */
  await page.click('#histBtn')
  await page.waitForSelector('.chgwin:not([hidden])')
  await page.waitForTimeout(250)
  line(`${w} Edit Schedule, the changes window`, await page.evaluate(MEASURE, '.chgwin'))
  if (w === 1200) await shot(page, `${TAG}-win-chg-1200`)
  /* …carried to View-only Sched, whose bar is one line at 1366: the window follows the bar back up */
  await go(page, 'viewsched')
  await page.waitForTimeout(300)
  line(`${w} View-only Sched (the changes window carried over)`, await page.evaluate(MEASURE, '.chgwin'))
  await page.click('.chgwin .win-x').catch(() => {})
  await go(page, 'editsched')
  /* the ALL AVAIL window, from a count on the week: ALL AVAIL put on Monday's first Common Programme row */
  await page.evaluate(() => { const w = window; w.fillSlot('a:0.0.+', 'allavail'); w.afterSchedMutate() })
  await page.waitForTimeout(300)
  const chip = page.locator('#eWeek [data-oilsent]:visible').first()
  if (await chip.count()) {
    await chip.scrollIntoViewIfNeeded(); await chip.click()
    await page.waitForSelector('.availwin:not([hidden])')
    await page.waitForTimeout(250)
    line(`${w} Edit Schedule, the ALL AVAIL window`, await page.evaluate(MEASURE, '.availwin'))
    if (w === 1200) await shot(page, `${TAG}-win-avail-1200`)
    await page.click('.availwin .win-x').catch(() => {})
  } else console.log(`${TAG} ${w}: no count chip on the week`)
  /* over the Scheduler Board: the changes window opened from the board's own History */
  await page.click('#eWeek [data-sbday="0"]:visible')
  await page.waitForSelector('#schedBoard:not([hidden])')
  await page.waitForTimeout(400)
  const bchip = page.locator('#schedBoard [data-oilsent]:visible').first()
  if (await bchip.count()) {
    await bchip.click()
    await page.waitForSelector('.availwin:not([hidden])')
    await page.waitForTimeout(250)
    line(`${w} the Scheduler Board, the ALL AVAIL window`, await page.evaluate(MEASURE, '.availwin'))
    if (w === 1200) await shot(page, `${TAG}-win-board-1200`)
    await page.click('.availwin .win-x').catch(() => {})
  }
  await page.click('#sbDone').catch(() => {})
  /* the Inputs page: its bar, and a window of the shell (the list's ⚙ settings) */
  await go(page, 'inputs')
  await page.click('#inGear')
  await page.waitForTimeout(300)
  line(`${w} Inputs, its ⚙ settings window`, await page.evaluate(MEASURE, '.floatwin'))
  console.log(`${TAG} ${w} errors:`, errors.length ? errors : 'none')
  await browser.close()
}
