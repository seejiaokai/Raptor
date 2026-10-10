import * as L from './ivet-B-lib.mjs'
const { WIN, sleep, MONTHS } = L
const browser = await L.launch()

/* the dates button's calendar: pick one day, turning months */
async function rangeGo(p, T, iso) {
  for (let i = 0; i < 40 && !(await p.locator(`#inRangeCal [data-cal="${iso}"]`).count()); i++) {
    const [m, y] = (await p.locator('#inRangeCal .rc-mon').textContent()).split(' ')
    const at = `${y}-${String(MONTHS.findIndex(x => x.startsWith(m.toLowerCase())) + 1).padStart(2, '0')}`
    await L.press(T, p.locator(`#inRangeCal button[aria-label="${at < iso.slice(0, 7) ? 'Next' : 'Previous'} month"]`))
  }
  await L.press(T, p.locator(`#inRangeCal [data-cal="${iso}"]`))
}
const state = p => p.evaluate(() => ({ search: document.querySelector('#inFSearch')?.value, person: document.querySelector('#inFPerson')?.selectedOptions[0]?.textContent, type: document.querySelector('#inFType')?.selectedOptions[0]?.textContent, range: document.querySelector('#inRangeBtn')?.textContent.replace(/\s+/g, ' ').trim() }))

/* ===== 28 · desktop · admin ===== */
{
  const { ctx, page } = await L.open(browser, L.DESK, { fresh: true })
  const T = false
  L.scn(28, 'desktop 1440x900', 'admin Saber', 'four hiding filters, each alone, then together')
  await L.guard(async () => {
    await L.toList(page, T)
    const reset = async () => {
      await page.fill('#inFSearch', ''); await page.selectOption('#inFPerson', 'all'); await page.selectOption('#inFType', 'all')
      if (!(await page.locator('#inRangePop').count())) await page.locator('#inRangeBtn').click()
      await page.locator('#inRangeAll').click(); await page.waitForTimeout(200); await page.mouse.click(700, 880)
    }
    const setOct = async () => {
      if (!(await page.locator('#inRangePop').count())) await page.locator('#inRangeBtn').click()
      await rangeGo(page, T, '2026-10-05'); await rangeGo(page, T, '2026-10-20'); await page.mouse.click(700, 880); await page.waitForTimeout(200)
    }
    const cases = [
      ['search "zz-no-match"', async () => { await page.fill('#inFSearch', 'zz-no-match') }, '2026-07-27'],
      ['Person = Wisp', async () => { await page.selectOption('#inFPerson', await L.csId(page, 'Wisp')) }, '2026-07-28'],
      ['Type = LL', async () => { await page.selectOption('#inFType', 'LL') }, '2026-07-29'],
      ['dates = 5–20 Oct', setOct, '2026-07-30'],
      ['all four together', async () => { await page.fill('#inFSearch', 'zz-no-match'); await page.selectOption('#inFPerson', await L.csId(page, 'Wisp')); await page.selectOption('#inFType', 'LL'); await setOct() }, '2026-07-31'],
    ]
    let k = 0
    for (const [label, apply, day] of cases) {
      k++
      await reset(); await apply()
      const before = await state(page)
      const had = await L.ids(page)
      await L.plus(page, T)
      await page.selectOption('#inpEditType', 'Meeting'); await L.pick(page, day, T); await page.fill('#inpEditRmk', `S28-${k}`)
      await page.locator('#inpEditSave').click(); await page.locator(WIN).waitFor({ state: 'hidden' }); await sleep(350)
      const made = await L.newest(page, had)
      const row = made[0] && await L.rowOf(page, made[0].iid)
      const after = await state(page)
      const nrows = await page.locator('#inBody tr').count()
      await L.shot(page, `s28-${k}-${label.replace(/[^a-z0-9]+/gi, '_')}`)
      L.chk(`${label}: the new input is in view, FIRST and LIT, and the filters were not changed`, made.length === 1 && !!row && row.at === 0 && row.lit && row.onScreen && JSON.stringify(before) === JSON.stringify(after), JSON.stringify({ row: row && { at: row.at, lit: row.lit, onScreen: row.onScreen }, before, after, nrows }))
      // touching a filter lets go: the row is no longer forced in, no light left
      await page.fill('#inFSearch', await page.inputValue('#inFSearch') + ' ')   // a filter touched
      await sleep(250)
      const row2 = made[0] && await L.rowOf(page, made[0].iid)
      const lit = await page.locator('#inBody tr.innew').count()
      L.chk(`${label}: when a filter is next touched the filter rules again (the row goes away if the filter hides it) and no light is left`, lit === 0 && (label.startsWith('dates') || label.includes('Type') || label.includes('Person') || label.includes('search') || label.includes('together')) && row2 === null, JSON.stringify({ row2: row2 && { lit: row2.lit, at: row2.at }, lit }))
      await L.shot(page, `s28-${k}-released`)
    }
    // a heading press also lets go (when the row is lit and visible): wait out every earlier light, unfiltered add, then a heading
    await reset(); await sleep(250)
    const litSeen = await page.locator('#inBody tr.innew').count()
    await L.shot(page, 's28-7-after-reset-lights')
    L.info('rows lit straight after the filters were reset (earlier saves, filters touched in between)', String(litSeen))
    await sleep(7000)
    const had = await L.ids(page)
    await L.plus(page, T); await page.selectOption('#inpEditType', 'Meeting'); await L.pick(page, '2026-07-22', T); await page.fill('#inpEditRmk', 'S28-6')
    await page.locator('#inpEditSave').click(); await page.locator(WIN).waitFor({ state: 'hidden' }); await sleep(300)
    const mm = await L.newest(page, had)
    const lit1 = await page.locator('#inBody tr.innew').count()
    await L.shot(page, 's28-8-lit-alone')
    await page.locator('#intbl thead th[data-sort="name"]').click(); await sleep(250)
    const lit2 = await page.locator('#inBody tr.innew').count()
    await L.shot(page, 's28-9-after-heading-press')
    await sleep(1500)
    const lit3 = await page.locator('#inBody tr.innew').count()
    L.info('lit rows 1.75 s after the heading press', String(lit3))
    L.chk('with no filter hiding it: lit after the save, light lets go when a column heading is pressed', mm.length === 1 && lit1 === 1 && lit2 === 0, JSON.stringify({ lit1, lit2 }))
  })
  await ctx.close()
}

/* ===== 29 · phone · admin · shared reveal and light ===== */
{
  const { ctx, page } = await L.open(browser, L.PHONE, { fresh: true, touch: true })
  const T = true
  L.scn(29, 'phone 390x844 (touch)', 'admin Saber', 'hiding filter; Saber then Echo; then Ace added')
  await L.guard(async () => {
    await L.toList(page, T)
    await L.press(T, page.locator('#inFiltersBtn')); await sleep(250)
    await page.fill('#inFSearch', 'zz-no-match')
    await L.press(T, page.locator('#inFiltersBtn')); await sleep(250)
    const had = await L.ids(page)
    await L.plus(page, T)
    await page.selectOption('#inpEditType', 'Meeting')
    await L.press(T, page.locator(`${WIN} [data-testid="pp-several"]`))
    await L.press(T, page.locator(`${WIN} [data-pp="${await L.csId(page, 'Echo')}"]`))
    await L.pick(page, '2026-07-29', T); await page.fill('#inpEditRmk', 'S29 shared')
    await page.locator('#inpEditSave').tap(); await page.locator(WIN).waitFor({ state: 'hidden' }); await sleep(400)
    const made = await L.newest(page, had)
    const grp = made[0]?.grp
    const cards = async () => page.evaluate(grp => { const own = window.INPUTS.filter(r => r.grp === grp).map(r => r.iid); const cs = [...document.querySelectorAll('[data-testid^="inl-row-"]')]; const mine = cs.filter(c => own.includes(c.getAttribute('data-iid'))); const c = mine[0]; const head = c?.previousElementSibling; return { cardsTotal: cs.length, mine: mine.length, who: c?.querySelector('[data-testid="inl-who"]')?.textContent, lit: !!c?.classList.contains('innew'), first: c ? cs.indexOf(c) === 0 : null, head: head?.getAttribute('data-testid') === 'inl-day' ? head.textContent.replace(/\s+/g, ' ') : null, heads: [...document.querySelectorAll('[data-testid="inl-day"]')].map(h => h.textContent.replace(/\s+/g, ' ')), onScreen: c ? (b => b.top >= 0 && b.bottom <= innerHeight)(c.getBoundingClientRect()) : null, srch: document.querySelector('#inFSearch')?.value } }, grp)
    const c1 = await cards()
    await L.shot(page, 's29-first-save')
    L.chk('first save (Saber, Echo): ONE card, both names, lit, in view, under its own day heading once, the hiding search still on', made.length === 2 && c1.mine === 1 && /Echo/.test(c1.who || '') && /Saber/.test(c1.who || '') && c1.lit && c1.onScreen && c1.heads.length === 1 && /29 Jul/i.test(c1.heads[0]) && /1 input$/.test(c1.heads[0]) && c1.srch === 'zz-no-match', JSON.stringify(c1))
    // reopen it from that very card (the search still hides everything else), and add Ace, whose name sorts before both
    await page.locator(`[data-testid="inl-row-${made[0].iid}"] [data-testid="inl-open"], [data-testid="inl-row-${made[1].iid}"] [data-testid="inl-open"]`).first().tap(); await page.locator(WIN).waitFor()
    const sel = await page.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputedit"] [data-pp][aria-pressed="true"]')].map(b => b.textContent.trim()))
    L.info('people ticked in the reopened window', JSON.stringify(sel))
    await page.locator(`${WIN} [data-pp="${await L.csId(page, 'Ace')}"]`).tap()
    await page.locator('#inpEditSave').tap(); await page.locator(WIN).waitFor({ state: 'hidden' }); await sleep(500)
    const c2 = await cards()
    await L.shot(page, 's29-second-save')
    const grpIds = await page.evaluate(grp => window.INPUTS.filter(r => r.grp === grp).map(r => window.PEOPLE[r.person].cs).sort(), grp)
    L.chk('after Ace is added: still ONE card, now naming Ace, Echo, Saber, lit, in view and first; no duplicate; the search still on', c2.mine === 1 && c2.cardsTotal === 1 && /Ace/.test(c2.who || '') && /Echo/.test(c2.who || '') && /Saber/.test(c2.who || '') && c2.lit && c2.onScreen && c2.first && c2.srch === 'zz-no-match', JSON.stringify({ c2, grpIds }))
    L.chk('the day heading appears once and counts the shared entry once ("1 input")', c2.heads.length === 1 && /29 Jul/i.test(c2.heads[0]) && /1 input$/.test(c2.heads[0]), JSON.stringify(c2.heads))
  })
  await ctx.close()
}
await browser.close()
L.save('s28-29')
