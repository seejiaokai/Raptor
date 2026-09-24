/* The ROLL-CALL walk (bug-check order §6): every place the app draws amendment state, on the
   everything week, at desktop and phone width, photographed. One pass per width.
   Usage: node am-10-rollcall.mjs [desktop|phone]   (default: both) */
const WIDTHS = { desktop: { width: 1440, height: 900 }, phone: { width: 390, height: 844 } }
const which = process.argv[2] ? [process.argv[2]] : ['desktop', 'phone']
const BASEDIR = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/rollcall'
const STATE = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/2026-09-24-amendment-week.json'
for (const w of which) {
  process.env.HP_SHOTS = `${BASEDIR}/${w}`
  const L = await import('./am-lib.mjs?' + w)
  const { open, editWeek, board, closeBoard, head, marks, shot, go, viewHead, planMenuItems, book } = L
  const { browser, page, errors } = await open({ ...WIDTHS[w], state: STATE })
  const out = {}
  const log = (k, v) => { out[k] = v; console.log(`[${w}] ${k.padEnd(20)} ${typeof v === 'string' ? v : JSON.stringify(v)}`.slice(0, 900)) }
  const esc = async () => { await page.keyboard.press('Escape'); await page.waitForTimeout(200)
    /* a click-open popup closes on a press outside it (house rule) — the day panel (#dayPop) is one */
    if (await page.locator('#dayPop:visible, .wmenu:visible').count()) { await page.mouse.click(3, 300); await page.waitForTimeout(300) }
    const hx = page.locator('#histModal:visible button:has-text("✕")').first(); if (await hx.count()) { await hx.click(); await page.waitForTimeout(300) } }

  // R1–R3: the edit week — Monday (AL1 issued + one pending), Thursday (plans), Sunday (unpublished AL1)
  await editWeek(page)
  for (const di of [0, 1, 2, 3, 6]) {
    log(`R1 head d${di}`, await head(page, di))
    const day = page.locator(`#eWeek .day[data-day="${di}"]`)
    await day.evaluate(e => e.scrollIntoView({ block: 'start' }))
    await page.waitForTimeout(300)
    await shot(page, `r1-editweek-d${di}`, day)
  }
  log('R3 marks mon', await marks(page, '#eWeek .day[data-day="0"]'))
  log('R3 marks sun', await marks(page, '#eWeek .day[data-day="6"]'))

  // R10: the Amendments panel
  const alp = page.locator('#alPanel')
  if (await alp.count() && await alp.isVisible()) { await alp.evaluate(e => e.scrollIntoView({ block: 'center' })); await shot(page, 'r10-alpanel', alp)
    log('R10 panel', (await alp.innerText()).replace(/\s+/g, ' ')) } else log('R10 panel', (await alp.count()) ? 'HIDDEN at this width' : 'NOT ON PAGE')

  // R11: the day panel from the edit week (Monday)
  await page.locator('#eWeek [data-dayinfo="0"]:visible').first().click().catch(() => {})
  await page.waitForTimeout(600)
  const dip = await page.evaluate(() => { const m = document.querySelector('#dayPop'); return m ? m.innerText.replace(/\s+/g, ' ').slice(0, 500) : 'NO PANEL' })
  log('R11 dayinfo edit', dip)
  await shot(page, 'r11-dayinfo-edit')
  await esc()

  // R14: a preview of an issued version on the week (Monday → its Original)
  const mm = await planMenuItems(page, 0)
  log('R14 mon menu', mm)
  const orig = page.locator('.wm:visible').filter({ hasText: /Original/ }).first()
  if (await orig.count()) { await orig.click(); await page.waitForTimeout(700)
    log('R14 preview head', await head(page, 0))
    const bar = await page.evaluate(() => (document.querySelector('#eWeek .day[data-day="0"] .dprev-bar') || {}).innerText || 'NO BAR')
    log('R14 preview bar', bar)
    await shot(page, 'r14-week-preview-orig', page.locator('#eWeek .day[data-day="0"]'))
    log('R14 marks under preview', await marks(page, '#eWeek .day[data-day="0"]'))
    const back = page.locator('#eWeek [data-golive="0"]:visible').first()
    log('R14 back button', (await back.count()) ? 'present' : 'MISSING')
    if (await back.count()) { await back.click(); await page.waitForTimeout(500) }
  } else { await esc(); log('R14 preview', 'NO ORIGINAL ROW IN MENU') }

  // R16: Thursday's plan menu (published day with a contingency)
  log('R16 thu menu', await planMenuItems(page, 3))
  await shot(page, 'r16-thu-planmenu')
  await esc()

  // R12: History (the changes list)
  const hb = page.locator('#histBtn:visible, [data-histopen]:visible, button:has-text("History"):visible').first()
  if (await hb.count()) { await hb.click(); await page.waitForTimeout(700)
    const h = await page.evaluate(() => { const m = document.querySelector('#histModal'); return m && !m.hidden ? m.innerText.replace(/\s+/g, ' ').slice(0, 600) : 'NO HISTORY MODAL' })
    log('R12 history', h); await shot(page, 'r12-history'); await esc() } else log('R12 history', 'NO HISTORY BUTTON ON THE WEEK')

  // R4–R6: the board for Monday (desktop board, or the phone board at phone width)
  await board(page, 0)
  log('R4 board head mon', await head(page, 0))
  await shot(page, 'r4-board-mon')
  log('R5 board marks mon', await marks(page, '#schedBoard'))
  const bh = page.locator('#sbHist:visible, #schedBoard [data-histopen]:visible').first()
  if (await bh.count()) { await bh.click(); await page.waitForTimeout(700); await shot(page, 'r12-board-history')
    log('R12 board history', await page.evaluate(() => (document.querySelector('#histModal') || document.querySelector('.histmode') || {}).innerText?.replace(/\s+/g, ' ').slice(0, 400) || 'none')); await esc() }
  await closeBoard(page)
  await board(page, 6)
  log('R4 board head sun', await head(page, 6))
  await shot(page, 'r4-board-sun')
  await closeBoard(page)

  // R7–R9: the view-only week
  for (const di of [0, 2, 3, 6]) log(`R7 view d${di}`, await viewHead(page, di))
  await page.locator('#vWeek .day[data-day="0"]').evaluate(e => e.scrollIntoView({ block: 'start' }))
  await shot(page, 'r7-view-mon-issued', page.locator('#vWeek .day[data-day="0"]'))
  log('R7 view marks mon', await marks(page, '#vWeek .day[data-day="0"]'))
  const vw = page.locator('#vWeek select[data-vwork="0"]:visible').first()
  if (await vw.count()) { await vw.selectOption('working'); await page.waitForTimeout(700)
    log('R8 view working', await viewHead(page, 0))
    log('R8 view marks working', await marks(page, '#vWeek .day[data-day="0"]'))
    await shot(page, 'r8-view-mon-working', page.locator('#vWeek .day[data-day="0"]'))
    await page.locator('#vWeek select[data-vwork="0"]:visible').first().selectOption('issued'); await page.waitForTimeout(400) }
  else log('R8 view working', 'NO PICKER')
  const wsel = page.locator('#vWeek select[data-dver="2"]:visible').first()
  log('R9 wed picker', (await wsel.count()) ? await wsel.locator('option').allInnerTexts() : 'NO PICKER')
  if (await wsel.count()) { const opts = await wsel.locator('option').evaluateAll(os => os.map(o => o.value))
    const other = opts.find(v => v.startsWith('d:')); if (other) { await wsel.selectOption(other); await page.waitForTimeout(700)
      log('R15 view plan preview', await viewHead(page, 2)); await shot(page, 'r15-view-wed-plan', page.locator('#vWeek .day[data-day="2"]')) } }
  // the day panel from the view page (Monday)
  await page.locator('#vWeek [data-dayinfo="0"]:visible').first().click().catch(() => {})
  await page.waitForTimeout(600)
  log('R11 dayinfo view', await page.evaluate(() => { const m = document.querySelector('#dayPop'); return m ? m.innerText.replace(/\s+/g, ' ').slice(0, 500) : 'NO PANEL' }))
  await shot(page, 'r11-dayinfo-view')
  await esc()

  log('book', await book(page))
  log('errors', errors)
  await browser.close()
}
