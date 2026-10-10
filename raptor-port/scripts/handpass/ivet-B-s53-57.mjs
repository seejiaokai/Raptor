import * as L from './ivet-B-lib.mjs'
const { WIN, DAYWIN, sleep } = L
const browser = await L.launch()
const T = true
const idyCards = p => p.evaluate(() => [...document.querySelectorAll('[data-testid^="idy-row-"]')].map(c => ({ who: c.querySelector('[data-testid="idy-who"]')?.textContent, when: c.querySelector('[data-testid="idy-when"]')?.textContent, kind: c.querySelector('[data-testid="idy-kind"]')?.textContent, rmk: c.querySelector('[data-testid="idy-rmk"]')?.textContent ?? null, iid: c.getAttribute('data-popiid') })))

/* ===== 53 · 54 · 55 · 57 · phone · admin Saber (one world, four scenarios) ===== */
{
  const { ctx, page } = await L.open(browser, L.PHONE, { fresh: true, touch: true })
  /* ---- 53 ---- */
  L.scn(53, 'phone 390x844 (touch)', 'admin Saber')
  await L.guard(async () => {
    await L.toList(page, T)
    const two = await L.fileInput(page, T, { type: 'Meeting', people: ['Ranger'], d1: '2026-07-08', rmk: 'S53 two' })
    const nine = await L.fileInput(page, T, { type: 'Meeting', people: L.NINE, d1: '2026-07-09', rmk: 'S53 nine' })
    L.chk('(setup) a two-person and a nine-person Meeting saved', two.length === 2 && nine.length === 9, `${two.length} and ${nine.length} records`)
    await L.toCal(page, T)
    const ia = await L.grpIids(page, two[0].grp, two[0].iid), ib = await L.grpIids(page, nine[0].grp, nine[0].iid)
    const g4 = await page.evaluate(() => { const r = window.INPUTS.find(x => x.type === 'Meeting' && x.date === 'Jul 23' && x.grp); return r ? window.INPUTS.filter(x => x.grp === r.grp).map(x => x.iid) : [] })
    const A = await L.barsOf(page, ia), B = await L.barsOf(page, ib), C = await L.barsOf(page, g4)
    await L.shot(page, 's53-month')
    L.chk('the bars begin "2 · Meeting", "9 · Meeting" and "4 · Meeting" (no callsign, no "+N")', A.length === 1 && /^2 · Meeting/.test(A[0].text) && B.length === 1 && /^9 · Meeting/.test(B[0].text) && C.length >= 1 && /^4 · Meeting/.test(C[0].text) && ![...A, ...B, ...C].some(b => /\+\d/.test(b.text)), JSON.stringify({ A: A.map(b => b.text), B: B.map(b => b.text), C: C.map(b => b.text) }))
    // a filter to one member: the list's Person filter; do the Month's bars follow it?
    await L.toList(page, T, false)
    await L.press(T, page.locator('#inFiltersBtn')); await sleep(250)
    await page.selectOption('#inFPerson', await L.csId(page, 'Ranger')); await L.press(T, page.locator('#inFiltersBtn')); await sleep(250)
    await L.toCal(page, T)
    const A2 = await L.barsOf(page, ia), B2 = await L.barsOf(page, ib), C2 = await L.barsOf(page, g4)
    await L.shot(page, 's53-month-filtered')
    const nall = await page.locator('.ib-bar').count()
    L.chk('with the Person filter set to Ranger the shared bars still lead with their whole counts (2, 9, 4) — never 1', [A2[0], B2[0], C2[0]].every(Boolean) ? (/^2 · /.test(A2[0].text) && /^9 · /.test(B2[0].text) && /^4 · /.test(C2[0].text)) : (A2.length + B2.length + C2.length === 0 ? false : false), JSON.stringify({ A2: A2.map(b => b.text), B2: B2.map(b => b.text), C2: C2.map(b => b.text), barsOnMonth: nall }))
    if (!A2.length && !B2.length) L.info('the month shows no filtered bars for the shared inputs', 'the Calendar did not keep the Person filter, or hid them')
    await L.toList(page, T, false); await L.press(T, page.locator('#inFiltersBtn')); await sleep(250); await page.selectOption('#inFPerson', 'all'); await L.press(T, page.locator('#inFiltersBtn'))
  })

  /* ---- 54 ---- */
  L.scn(54, 'phone 390x844 (touch)', 'admin Saber', 'the scenario names 390px')
  await L.guard(async () => {
    await L.toList(page, T, false)
    const ev = await L.fileInput(page, T, { type: 'Event', people: L.NINE, d1: '2026-07-10', title: 'C54 Squadron photograph and briefing', rmk: 'S54' })
    L.chk('(setup) the nine-person Event saved', ev.length === 9, String(ev.length))
    await L.toCal(page, T)
    const bars = await L.barsOf(page, await L.grpIids(page, ev[0].grp, ev[0].iid))
    await L.shot(page, 's54-month')
    L.chk('its bar begins "9 ·" and the title, clipped only to fit (the count stays)', bars.length === 1 && /^9 · /.test(bars[0].text) && /C54 Squadron/.test(bars[0].text), JSON.stringify(bars.map(b => ({ text: b.text, clipped: b.clipped, w: b.w }))))
    // open the input from its bar
    const evI = await L.grpIids(page, ev[0].grp, ev[0].iid); await page.locator(evI.map(i => `.ib-bar[data-iid="${i}"]`).join(', ')).first().tap(); await sleep(600)
    let w = await page.locator(WIN).count()
    if (!w) { const c = page.locator(DAYWIN).locator('[data-testid="idy-open"]').filter({ hasText: /./ }).first(); L.info('the bar tap opened', await page.evaluate(() => [...document.querySelectorAll('[data-testid^="win-"]')].map(x => x.dataset.testid).join(','))) }
    const open = await page.evaluate(() => { const win = document.querySelector('[data-testid="win-inputedit"]'); return win ? { title: win.querySelector('.win-ttl')?.textContent, ownTitle: document.querySelector('#inpEditOwnTitle')?.value, type: document.querySelector('#inpEditType')?.value, ticked: [...win.querySelectorAll('[data-pp][aria-pressed="true"]')].length } : null })
    await L.shot(page, 's54-opened')
    L.chk('opening it shows the full title, the Event kind and all nine people', !!open && open.ownTitle === 'C54 Squadron photograph and briefing' && open.type === 'Event' && open.ticked === 9, JSON.stringify(open))
    if (await page.locator(WIN).count()) { const t = await page.evaluate(() => { const e = document.querySelector('[data-testid="win-inputedit"] .win-ttl'); const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 } }); await page.locator('[data-testid="win-inputedit-x"]').tap(); await sleep(300) }
  })

  /* ---- 55 ---- */
  L.scn(55, 'phone 390x844 (touch)', 'admin Saber')
  await L.guard(async () => {
    await L.toList(page, T, false)
    const sp = await L.fileInput(page, T, { type: 'Meeting', people: ['Echo'], d1: '2026-07-26', d2: '2026-07-28', rmk: 'S55 span' })
    L.chk('(setup) a two-person Meeting 26–28 Jul saved', sp.length === 2 && sp[0].date === 'Jul 26' && sp[0].endDate === 'Jul 28', JSON.stringify(sp.map(r => [r.cs, r.date, r.endDate])))
    await L.toCal(page, T)
    const iids = await L.grpIids(page, sp[0].grp, sp[0].iid)
    const bars = await L.barsOf(page, iids)
    await L.shot(page, 's55-month')
    const tops = [...new Set(bars.map(b => b.top))]
    L.chk('the bar runs on across the week boundary: two pieces on two week rows, the same count and title words', bars.length === 2 && tops.length === 2 && bars.every(b => /^2 · Meeting/.test(b.text)), JSON.stringify(bars.map(b => ({ text: b.text, top: b.top, left: b.left, w: b.w }))))
    const seen = []
    for (const d of ['2026-07-26', '2026-07-27', '2026-07-28']) {
      await L.openDay(page, d, T); await sleep(300)
      const cards = await idyCards(page)
      const mine = cards.filter(c => /S55/.test(c.rmk || '') || iids.includes(c.iid))
      seen.push({ d, n: mine.length, who: mine[0]?.who, when: mine[0]?.when })
      await L.shot(page, `s55-day-${d.slice(8)}`)
      await page.keyboard.press('Escape'); await sleep(250)
    }
    L.chk('every covered day opens to the same ONE shared entry naming both people', seen.every(x => x.n === 1 && /Echo/.test(x.who || '') && /Saber/.test(x.who || '')), JSON.stringify(seen))
  })

  /* ---- 57 ---- */
  L.scn(57, 'phone 390x844 (touch)', 'admin Saber')
  await L.guard(async () => {
    await L.toList(page, T, false)
    const t = await L.fileInput(page, T, { type: 'Meeting', d1: '2026-07-27', d2: '2026-07-29', start: '09:00', end: '11:00', rmk: 'S57 timed', title: 'S57 timed span' })
    L.chk('(setup) the timed Meeting 27–29 Jul 09:00–11:00 saved', t.length === 1 && t[0].s === 540 && t[0].e === 660 && t[0].endDate === 'Jul 29' && t[0].allday === false, JSON.stringify(t))
    await L.toCal(page, T)
    const bars = await L.barsOf(page, [t[0].iid])
    await L.shot(page, 's57-month')
    L.chk('every bar segment is tinted (the timed look) with the solid left edge', bars.length >= 1 && bars.every(b => b.timed && /inset/.test(b.shadow)), JSON.stringify(bars.map(b => ({ timed: b.timed, bg: b.bg, shadow: b.shadow, text: b.text }))))
    const days = []
    for (const d of ['2026-07-27', '2026-07-28', '2026-07-29']) {
      await L.openDay(page, d, T); await sleep(300)
      const mine = (await idyCards(page)).find(c => c.iid === t[0].iid || /S57/.test(c.rmk || ''))
      days.push({ d, when: mine?.when, kind: mine?.kind, rmk: mine?.rmk })
      await L.shot(page, `s57-day-${d.slice(8)}`)
      await page.keyboard.press('Escape'); await sleep(250)
    }
    L.info('opened-day cards', JSON.stringify(days))
    L.chk('first, middle and last opened days all show the hours (not "All day")', days.every(x => x.when && !/All day/i.test(x.when) && /09:00|9:00|9/.test(x.when)), JSON.stringify(days))
    await L.toList(page, T, false)
    await page.locator(`[data-testid="inl-row-${t[0].iid}"] [data-testid="inl-open"]`).tap(); await page.locator(WIN).waitFor()
    const w = await page.evaluate(() => ({ read: document.querySelector('#inpEditPop .rc-read')?.textContent, start: document.querySelector('#inpEditStart')?.value, end: document.querySelector('#inpEditEnd')?.value, allday: document.querySelector('#inpEditAllday')?.checked }))
    await L.shot(page, 's57-window')
    L.chk('the saved window keeps the span and the hours (Jul 27 → Jul 29, 09:00–11:00, not all day)', /Jul 27 → Jul 29/.test(w.read) && w.start === '09:00' && w.end === '11:00' && w.allday === false, JSON.stringify(w))
    await page.locator('[data-testid="win-inputedit-x"]').tap()
  })
  await ctx.close()
}

/* ===== 56 · desktop · admin Saber · the four fills ===== */
{
  const { ctx, page } = await L.open(browser, L.DESK, { fresh: true, dsf: 2 })
  const T = false
  L.scn(56, 'desktop 1440x900 (picture scale 2)', 'admin Saber (own inputs)')
  await L.guard(async () => {
    await L.toList(page, T)
    const mk = {}
    mk.ll = (await L.fileInput(page, T, { type: 'LL', d1: '2026-07-06', rmk: 'S56 allday leave' }))[0]
    mk.llT = (await L.fileInput(page, T, { type: 'LL', d1: '2026-07-07', span: 'custom', start: '10:00', end: '12:00', rmk: 'S56 timed leave' }))[0]
    mk.mt = (await L.fileInput(page, T, { type: 'Meeting', d1: '2026-07-08', allday: true, rmk: 'S56 allday meeting' }))[0]
    mk.mtT = (await L.fileInput(page, T, { type: 'Meeting', d1: '2026-07-09', start: '09:00', end: '10:30', rmk: 'S56 timed meeting' }))[0]
    mk.am = (await L.fileInput(page, T, { type: 'LL', d1: '2026-07-10', span: 'am', rmk: 'S56 am leave' }))[0]
    L.chk('(setup) all five saved', Object.values(mk).every(Boolean), JSON.stringify(Object.fromEntries(Object.entries(mk).map(([k, v]) => [k, v && [v.type, v.date, v.allday, v.s, v.e]]))))
    await L.toCal(page, T)
    const out = {}
    for (const [k, r] of Object.entries(mk)) out[k] = (await L.barsOf(page, [r.iid]))[0]
    await L.shot(page, 's56-month')
    const wk = await page.evaluate(() => { const c = document.querySelector('#inpCal [data-icday="2026-07-06"]').getBoundingClientRect(), d = document.querySelector('#inpCal [data-icday="2026-07-10"]').getBoundingClientRect(); return { x: Math.floor(c.left) - 4, y: Math.floor(c.top) - 4, width: Math.ceil(d.right - c.left) + 8, height: Math.ceil(c.height) + 8 } })
    await page.screenshot({ path: L.OUT + '/s56-week-zoom.png', clip: wk })
    const lum = c => { const m = (c.match(/[\d.]+/g) || []).map(Number); const k = /srgb/.test(c) ? 255 : 1; return Math.round((0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) * k) }
    const L2 = Object.fromEntries(Object.entries(out).map(([k, b]) => [k, b && { timed: b.timed, tone: b.tone, bg: b.bg, lum: lum(b.bg), shadow: b.shadow, color: b.color, text: b.text }]))
    L.info('painted', JSON.stringify(L2))
    const ok = k => !!out[k]
    L.chk('all-day leave: solid red, no edge; all-day Meeting: solid amber, no edge', ok('ll') && !out.ll.timed && out.ll.tone === 'red' && out.ll.shadow === 'none' && ok('mt') && !out.mt.timed && out.mt.tone === 'amb' && out.mt.shadow === 'none', JSON.stringify([L2.ll, L2.mt]))
    L.chk('timed Custom leave: lighter red with a solid left edge; timed Meeting: lighter amber with a solid left edge', ok('llT') && out.llT.timed && out.llT.tone === 'red' && /inset/.test(out.llT.shadow) && lum(out.llT.bg) < lum(out.ll.bg) && ok('mtT') && out.mtT.timed && out.mtT.tone === 'amb' && /inset/.test(out.mtT.shadow) && lum(out.mtT.bg) < lum(out.mt.bg), JSON.stringify([L2.llT, L2.mtT]))
    L.chk('the half-day (AM) leave uses the timed treatment', ok('am') && out.am.timed && out.am.tone === 'red' && /inset/.test(out.am.shadow), JSON.stringify(L2.am))
    L.info('"lighter": compared as the brightness of the paint colour; the picture shows it', 'luminance solid red ' + (out.ll && lum(out.ll.bg)) + ' / timed red ' + (out.llT && lum(out.llT.bg)) + ' / solid amber ' + (out.mt && lum(out.mt.bg)) + ' / timed amber ' + (out.mtT && lum(out.mtT.bg)))
  })
  await ctx.close()
}
await browser.close()
L.save('s53-57')
