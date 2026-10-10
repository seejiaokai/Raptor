import * as L from './ivet-B-lib.mjs'
const { WIN, DAYWIN, sleep } = L
const browser = await L.launch()
const dates = (p, iids) => p.evaluate(iids => iids.map(i => { const r = window.INPUTS.find(x => x.iid === i); return r ? [r.date, r.endDate || '', r.allday ? 'all' : `${r.s}-${r.e}`] : null }), iids)
const cellX = async (p, iso) => { const r = await p.locator(`#inpCal [data-icday="${iso}"]`).boundingBox(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, r } }
const barBox = async (p, iid) => p.locator(`[data-testid="ib-bar-${iid}"]`).first().boundingBox()

/* ===== 58 · desktop · member Ranger (own inputs) — mouse; then the phone half by finger ===== */
{
  const { ctx, page } = await L.open(browser, L.DESK, { who: 'us', pass: 'us', fresh: true })
  const T = false
  L.scn(58, 'desktop 1440x900 (mouse)', 'member Ranger (own input)', 'phone half follows below')
  await L.guard(async () => {
    await L.toList(page, T)
    const own = (await L.fileInput(page, T, { type: 'Meeting', d1: '2026-07-07', start: '09:00', end: '10:00', title: 'S58 own', rmk: 'S58 own' }))[0]
    const sh = await L.fileInput(page, T, { type: 'Meeting', people: ['Echo'], d1: '2026-07-14', d2: '2026-07-15', start: '09:00', end: '10:00', rmk: 'S58 shared' })
    L.chk('(setup) a timed own Meeting and a timed shared two-day Meeting saved', !!own && sh.length === 2, JSON.stringify([own?.iid, sh.length]))
    await L.toCal(page, T)
    await sleep(6500)
    // ---- one-day timed bar, Jul 7 -> Jul 8
    const b = await barBox(page, own.iid), y = b.y + b.height / 2
    const before = await dates(page, [own.iid])
    await page.mouse.move(b.x + b.width / 2, y); await page.mouse.down()
    const to = await cellX(page, '2026-07-08')
    await page.mouse.move(b.x + b.width / 2 + 20, y + 4, { steps: 4 })
    const ghost1 = await page.locator('.ic-ghost').count()
    await page.mouse.move(to.x, y + 6, { steps: 6 })
    const over = await page.locator('#inpCal [data-icday="2026-07-08"].ic-over').count()
    const ghostTxt = await page.locator('.ic-ghost').first().evaluate(e => ({ text: e.textContent, bg: getComputedStyle(e).backgroundColor, color: getComputedStyle(e).color, cls: e.className })).catch(() => null)
    await L.shot(page, 's58-lifted')
    await page.mouse.up(); await sleep(500)
    const after = await dates(page, [own.iid])
    const bar2 = (await L.barsOf(page, [own.iid]))[0]
    await L.shot(page, 's58-moved')
    L.chk('the bar lifts and follows the mouse (a ghost, the date under it lights), legible', ghost1 === 1 && over === 1 && !!ghostTxt && /S58 own|Ranger|Meeting/.test(ghostTxt.text), JSON.stringify({ ghost1, over, ghostTxt }))
    L.chk('dropped on the next day: it moved one day, keeping its hours and (still timed) look', JSON.stringify(before[0]) === JSON.stringify(['Jul 7', '', '540-600']) && after[0][0] === 'Jul 8' && after[0][2] === '540-600' && bar2 && bar2.timed && /inset/.test(bar2.shadow), JSON.stringify({ before, after, timed: bar2?.timed }))
    L.chk('the release did not open the input it moved', (await page.locator(WIN).count()) === 0)
    await page.locator('#undoBtn').click(); await sleep(500)
    const undone = await dates(page, [own.iid])
    L.chk('Undo puts it back on 7 Jul', JSON.stringify(undone[0]) === JSON.stringify(before[0]), JSON.stringify(undone))
    // cancelled drag: lifted, carried over another day, brought back to where it was grabbed
    await sleep(500)
    const c = await barBox(page, own.iid), cy = c.y + c.height / 2
    await page.mouse.move(c.x + c.width / 2, cy); await page.mouse.down()
    await page.mouse.move((await cellX(page, '2026-07-09')).x, cy + 5, { steps: 8 })
    await page.keyboard.press('Escape'); await sleep(200)
    await page.mouse.move(c.x + c.width / 2, cy, { steps: 6 }); await page.mouse.up(); await sleep(400)
    const afterCancel = await dates(page, [own.iid])
    L.chk('a cancelled drag (Escape, then brought home) causes no move', JSON.stringify(afterCancel[0]) === JSON.stringify(before[0]) && (await page.locator('.ic-ghost').count()) === 0, JSON.stringify(afterCancel))
    // ---- the shared timed span
    await sleep(500)
    const grp = sh.map(r => r.iid)
    const bars = await L.barsOf(page, grp)
    const sbx = bars[0]
    const sy = sbx.top + sbx.h / 2
    const beforeS = await dates(page, grp)
    await page.mouse.move(sbx.left + 10, sy); await page.mouse.down()
    await page.mouse.move(sbx.left + 40, sy + 3, { steps: 4 })
    await page.mouse.move((await cellX(page, '2026-07-15')).x - 20, sy + 5, { steps: 8 })
    await L.shot(page, 's58-shared-lifted')
    await page.mouse.up(); await sleep(500)
    const afterS = await dates(page, grp)
    const bS = await L.barsOf(page, grp)
    await L.shot(page, 's58-shared-moved')
    L.chk('the shared timed span moved as a whole (both people, same length and hours, still timed)', afterS.every(a => a && a[0] !== beforeS[0][0] && a[2] === '540-600') && afterS[0][0] === afterS[1][0] && afterS[0][1] === afterS[1][1] && bS.length >= 1 && bS.every(x => x.timed), JSON.stringify({ beforeS, afterS, texts: bS.map(x => x.text) }))
    await page.locator('#undoBtn').click(); await sleep(500)
    const undoS = await dates(page, grp)
    L.chk('Undo restores the shared span\'s original dates', JSON.stringify(undoS) === JSON.stringify(beforeS), JSON.stringify(undoS))
  })
  await ctx.close()
}
/* ---- 58, the phone half: hold, then drag, by finger over CDP ---- */
{
  const { ctx, page } = await L.open(browser, L.PHONE, { fresh: true, touch: true })
  const T = true
  L.scn('58-phone', 'phone 390x844 (finger over CDP)', 'admin Saber (own input)', 'the phone half of 58')
  await L.guard(async () => {
    await L.toList(page, T)
    const own = (await L.fileInput(page, T, { type: 'Meeting', d1: '2026-07-07', start: '09:00', end: '10:00', title: 'S58 own', rmk: 'S58 own' }))[0]
    await L.toCal(page, T); await sleep(6500)
    const cli = await L.cdp(page)
    const b = await barBox(page, own.iid), y = Math.round(b.y + b.height / 2), x0 = Math.round(b.x + b.width / 2)
    const to = await cellX(page, '2026-07-08')
    const before = await dates(page, [own.iid])
    await cli.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y, id: 1 }] })
    await sleep(900)
    const ghost = await page.locator('.ic-ghost').count()
    await L.shot(page, 's58-phone-held')
    for (const x of [x0 + 20, x0 + 60, Math.round(to.x)]) await cli.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y + 3, id: 1 }] })
    await L.shot(page, 's58-phone-dragged')
    await cli.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(600)
    const after = await dates(page, [own.iid]), bar2 = (await L.barsOf(page, [own.iid]))[0]
    await L.shot(page, 's58-phone-moved')
    L.chk('held still the bar lifts; dragged by finger it follows; dropped it moved one day with hours kept and the timed look', ghost === 1 && after[0][0] === 'Jul 8' && after[0][2] === '540-600' && bar2 && bar2.timed, JSON.stringify({ ghost, before, after }))
    L.chk('the release did not open the input', (await page.locator(WIN).count()) === 0)
    await page.locator('#undoBtn').tap(); await sleep(500)
    L.chk('Undo restores 7 Jul', JSON.stringify((await dates(page, [own.iid]))[0]) === JSON.stringify(before[0]), JSON.stringify(await dates(page, [own.iid])))
  })
  await ctx.close()
}

/* ===== 59 · phone · member Ranger ===== */
{
  const { ctx, page } = await L.open(browser, L.PHONE, { who: 'us', pass: 'us', fresh: true, touch: true })
  const T = true
  L.scn(59, 'phone 390x844 (touch)', 'member Ranger')
  await L.guard(async () => {
    await L.toList(page, T)
    const own = (await L.fileInput(page, T, { type: 'Meeting', d1: '2026-07-21', start: '09:00', end: '10:00', title: 'S59 own', rmk: 'S59 own' }))[0]
    await L.toCal(page, T)
    await page.locator(`[data-testid="ib-bar-${own.iid}"]`).first().tap(); await sleep(600)
    const wins = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="win-"]')].map(w => w.dataset.testid))
    const ttl = await page.evaluate(() => ({ own: document.querySelector('#inpEditOwnTitle')?.value, type: document.querySelector('#inpEditType')?.value }))
    await L.shot(page, 's59-bar-tap')
    L.chk('a tap on a bar opens THAT input in its window', wins.includes('win-inputedit') && ttl.own === 'S59 own', JSON.stringify({ wins, ttl }))
    if (await page.locator(WIN).count()) { await page.locator('[data-testid="win-inputedit-x"]').tap(); await sleep(300) }
    await page.locator('#inpCal [data-icday="2026-07-21"]').tap({ position: { x: 8, y: 60 } }); await sleep(500)
    const day = await page.evaluate(() => ({ day: !!document.querySelector('[data-testid="win-inputsday"]'), edit: !!document.querySelector('[data-testid="win-inputedit"]'), cards: [...document.querySelectorAll('[data-testid^="idy-row-"]')].map(c => c.querySelector('[data-testid="idy-rmk"]')?.textContent) }))
    await L.shot(page, 's59-empty-space-tap')
    L.chk('a tap on empty space of its date opens that DAY, whose card agrees with the bar', day.day && !day.edit && day.cards.some(x => /S59/.test(x || '')), JSON.stringify(day))
    await page.keyboard.press('Escape'); await sleep(250)
    // crowded day: "+N more" (the month's own button)
    await L.toList(page, T, false)
    for (let k = 0; k < 6; k++) await L.fileInput(page, T, { type: 'Training', d1: '2026-07-22', rmk: 'S59 crowd ' + k })
    await L.toCal(page, T)
    const more = page.locator('.ib-more').first()
    const mtxt = (await more.count()) ? await more.innerText() : null
    await L.shot(page, 's59-crowded')
    if (mtxt) {
      await more.tap(); await sleep(500)
      const o = await page.evaluate(() => ({ day: !!document.querySelector('[data-testid="win-inputsday"]'), edit: !!document.querySelector('[data-testid="win-inputedit"]'), title: document.querySelector('[data-testid="win-inputsday"] .win-ttl')?.textContent, n: document.querySelectorAll('[data-testid^="idy-row-"]').length }))
      await L.shot(page, 's59-more')
      L.chk(`"${mtxt}" opens the intended DAY with all its cards (the month showed the rest)`, o.day && !o.edit && o.n >= 5, JSON.stringify(o))
      await page.keyboard.press('Escape')
    } else L.notRun('"+N more"', 'no .ib-more button showed after crowding one day with six inputs')
  })
  await ctx.close()
}
/* the tooltip, desktop */
{
  const { ctx, page } = await L.open(browser, L.DESK, { who: 'us', pass: 'us', fresh: true })
  L.scn('59-desktop', 'desktop 1440x900', 'member Ranger', 'the tooltip half of 59')
  await L.guard(async () => {
    await L.toCal(page, false)
    const bar = page.locator('.ib-bar', { hasText: /^4 · Meeting/ }).first()
    await bar.hover(); await sleep(900)
    const tip = await bar.getAttribute('title')
    await L.shot(page, 's59-tooltip-hover')
    L.info('the tooltip (the bar\'s title text)', tip)
    L.chk('a shared titled bar\'s tooltip names every person, the kind, the dates (and hours / filing detail), not just the clipped words', !!tip && /Drifter/.test(tip) && /Saber/.test(tip) && /Echo/.test(tip) && /Ranger/.test(tip) && /Meeting/.test(tip) && /Jul 23|23 Jul/.test(tip), String(tip))
    L.chk('it carries filing details ("Placed by …")', /Placed by|By /.test(tip || ''), String(tip))
  })
  await ctx.close()
}

/* ===== 60 · desktop · admin ===== */
for (const [vp, touch, lab] of [[L.DESK, false, 'desktop 1440x900'], [L.PHONE, true, 'phone 390x844 (extra, the scenario says especially 390)']]) {
  const { ctx, page } = await L.open(browser, vp, { fresh: true, touch })
  L.scn(touch ? '60-phone' : 60, lab, 'admin Saber')
  await L.guard(async () => {
    await L.toCal(page, touch)
    await L.press(touch, page.locator('[data-testid="ib-how"]')); await sleep(400)
    const list = await page.locator('[data-testid="ib-how-list"] li').allInnerTexts()
    const key = await page.locator('[data-testid="ib-legend"] .ib-key').allInnerTexts()
    const all = await page.evaluate(() => { const l = document.querySelector('[data-testid="ib-how-list"]').getBoundingClientRect(); return { right: Math.round(l.right), bottom: Math.round(l.bottom), h: innerHeight, w: innerWidth, wide: document.documentElement.scrollWidth } })
    await L.shot(page, touch ? 's60-phone-fold' : 's60-fold')
    L.info('the four lines', JSON.stringify(list))
    L.chk('the fold has four items', list.length === 4, String(list.length))
    L.chk('item 1 = tap a day/bar and drag; item 2 = several days; item 3 = NF / holiday / Off day; item 4 = the filing cut-off', /Tap a day/i.test(list[0]) && /drag/i.test(list[0]) && /several|days/i.test(list[1] || '') && /NF/.test(list[2] || '') && /holiday/i.test(list[2] || '') && /Off/.test(list[2] || '') && /at least \d+ days|cut|due|late/i.test(list[3] || ''), JSON.stringify(list))
    L.chk('the key reads "absence" and "duty" and the fold has no red/amber explanation', key.join('|') === 'absence|duty' && !list.some(t => /red|amber/i.test(t)), JSON.stringify({ key }))
    L.chk('nothing runs off the screen (no sideways page scroll)', all.wide <= vp.width, JSON.stringify(all))
    await L.press(touch, page.locator('[data-testid="ib-how"]')); await sleep(250)
    const closed = await page.locator('[data-testid="ib-how-list"]').count()
    L.chk('it closes again', closed === 0 || !(await page.locator('[data-testid="ib-how-list"]').isVisible()), String(closed))
  })
  await ctx.close()
}

/* ===== 61 · phone · admin ===== */
{
  const { ctx, page } = await L.open(browser, L.PHONE, { fresh: true, touch: true })
  const T = true
  L.scn(61, 'phone 390x844 (touch)', 'admin Saber')
  await L.guard(async () => {
    await L.toList(page, T)
    const pos = () => page.evaluate(() => ['#inFiltersBtn', '#inGear', '#inCalBtn', '#inListBtn'].map(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return [s, Math.round(r.left), Math.round(r.top + scrollY)] }))
    await page.evaluate(() => scrollTo(0, 0)); await sleep(300)
    const p0 = await pos()
    await L.shot(page, 's61-closed')
    await L.press(T, page.locator('#inFiltersBtn')); await sleep(300)
    const p1 = await pos()
    const m = await page.evaluate(() => ({ spans: document.querySelectorAll('#inFilters label > span').length, text: document.querySelector('#inFilters')?.innerText.replace(/\s+/g, ' '), ph: document.querySelector('#inFSearch')?.placeholder, aria: ['#inFPerson', '#inFType', '#inFSearch'].map(s => document.querySelector(s)?.getAttribute('aria-label') || document.querySelector(s)?.labels?.[0]?.textContent || document.querySelector(s)?.getAttribute('title') || null), person: document.querySelector('#inFPerson').selectedOptions[0].textContent, type: document.querySelector('#inFType').selectedOptions[0].textContent }))
    await L.shot(page, 's61-open')
    L.chk('opened: no words (Person, Type, Search) stand over the three boxes; each box says what it is by its value / placeholder', m.spans === 0 && !/^(Person|Type|Search)\b/.test(m.text || '') && m.person === 'Everyone' && m.type === 'All types' && m.ph === 'Search inputs', JSON.stringify(m))
    L.info('accessible names of the three boxes', JSON.stringify(m.aria))
    L.chk('the filter button and the gear did not jump when the fields opened', JSON.stringify(p0) === JSON.stringify(p1), JSON.stringify({ p0, p1 }))
    await page.selectOption('#inFPerson', await L.csId(page, 'Ranger')); await page.selectOption('#inFType', 'Meeting'); await page.fill('#inFSearch', 'Flight')
    await sleep(300)
    const sum1 = await page.evaluate(() => ({ btn: document.querySelector('#inFiltersBtn').innerText.replace(/\s+/g, ' ') + '|' + (document.querySelector('#inFiltersBtn .badge, #inFiltersBtn [class*=badge], #inFiltersBtn [class*=count]')?.textContent || ''), cards: document.querySelectorAll('[data-testid^="inl-row-"]').length, foot: [...document.querySelectorAll('#page-inputs [class*=sum], #page-inputs [class*=count]')].map(e => e.textContent.trim()).filter(Boolean).slice(0, 4) }))
    await L.press(T, page.locator('#inFiltersBtn')); await sleep(300)
    const p2 = await pos()
    await L.shot(page, 's61-closed-with-values')
    await L.press(T, page.locator('#inFiltersBtn')); await sleep(300)
    const back = await page.evaluate(() => ({ person: document.querySelector('#inFPerson').selectedOptions[0].textContent, type: document.querySelector('#inFType').selectedOptions[0].textContent, search: document.querySelector('#inFSearch').value }))
    L.chk('closed and reopened: the values are kept (Ranger · Meeting · "Flight") and the buttons stay put', back.person === 'Ranger' && back.type === 'Meeting' && back.search === 'Flight' && JSON.stringify(p2) === JSON.stringify(p0), JSON.stringify({ back, sum1, p2 }))
    await L.press(T, page.locator('#inFiltersBtn')); await sleep(250)
    await L.press(T, page.locator('#inCalBtn')); await sleep(500)
    await L.press(T, page.locator('#inListBtn')); await sleep(500)
    await L.press(T, page.locator('#inFiltersBtn')); await sleep(300)
    const back2 = await page.evaluate(() => ({ person: document.querySelector('#inFPerson').selectedOptions[0].textContent, type: document.querySelector('#inFType').selectedOptions[0].textContent, search: document.querySelector('#inFSearch').value, cards: document.querySelectorAll('[data-testid^="inl-row-"]').length }))
    await L.shot(page, 's61-after-switch')
    L.chk('switching Calendar and List and back keeps the filter values; cards agree with them', back2.person === 'Ranger' && back2.type === 'Meeting' && back2.search === 'Flight', JSON.stringify(back2))
  })
  await ctx.close()
}

/* ===== 62 · desktop · member Ranger ===== */
{
  const { ctx, page } = await L.open(browser, L.DESK, { who: 'us', pass: 'us', fresh: true })
  const T = false
  L.scn(62, 'desktop 1440x900', 'member Ranger')
  await L.guard(async () => {
    const read = () => page.evaluate(() => ({ read: document.querySelector('#inpEditPop .rc-read')?.textContent, help: document.querySelectorAll('[data-testid="win-inputedit"] #inTypeHelp').length, hint: document.querySelectorAll('[data-testid="win-inputedit"] .inped-hint').length, type: document.querySelector('#inpEditType')?.value, save: document.querySelector('#inpEditSave')?.textContent, instr: [...document.querySelectorAll('[data-testid="win-inputedit"] p, [data-testid="win-inputedit"] .hint, [data-testid="win-inputedit"] small')].map(e => e.textContent.trim()).filter(t => t.length > 25) }))
    await L.openDay(page, '2026-07-27', T)
    await L.plusDay(page, T)
    const a = await read(); await L.shot(page, 's62-day-plus')
    L.chk('"+ Input" in the opened 27 Jul gives that day, the "?" and no instruction paragraph', a.read === 'Jul 27' && a.help === 1 && a.hint === 0 && a.instr.length === 0 && a.save === 'Add', JSON.stringify(a))
    await page.locator('#inpEditCancel').click(); await sleep(250); await page.keyboard.press('Escape'); await sleep(250)
    // a mouse drag across three dates
    await L.toCal(page, T)
    const c1 = await cellX(page, '2026-07-27'), c3 = await cellX(page, '2026-07-29')
    const dy = c1.r.y + c1.r.height - 10
    await page.mouse.move(c1.x, dy); await page.mouse.down(); await page.mouse.move((c1.x + c3.x) / 2, dy + 2, { steps: 6 }); await page.mouse.move(c3.x, dy + 2, { steps: 6 }); await page.mouse.up(); await sleep(500)
    const b = await page.locator(WIN).count() ? await read() : null
    await L.shot(page, 's62-drag-span')
    L.chk('a mouse drag over 27–29 Jul opens a new input with that span, same controls and "?", no paragraph', !!b && b.read === 'Jul 27 → Jul 29' && b.help === 1 && b.hint === 0 && b.instr.length === 0, JSON.stringify(b))
    if (await page.locator(WIN).count()) await page.locator('#inpEditCancel').click()
    await sleep(250)
    await L.toList(page, T); await L.plus(page, T)
    const c = await read(); await L.shot(page, 's62-list-plus')
    L.chk('"+ Input" on the List supplies no date; same controls and "?"; no paragraph', c.read === 'pick a start date' && c.help === 1 && c.hint === 0 && c.instr.length === 0, JSON.stringify(c))
  })
  await ctx.close()
}
await browser.close()
L.save('s58-62')
