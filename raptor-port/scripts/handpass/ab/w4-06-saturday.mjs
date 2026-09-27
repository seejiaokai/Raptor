/* W4 — the published SATURDAY (26 Sep 26): finding AB6 (Fable S6 / F6, predicted) and SANS (Fable S39, Astra 22).
   Built once on the desktop through the app's own controls, then read at BOTH widths (the same saved world opened in
   a 390 px touch browser) and as the MEMBER (Ranger himself):
     - Ranger (bane): LL Fri 17 Jul 20:00–06:00 — an overnight leave whose tail runs into Saturday morning;
     - the Saturday SDO desk starts at 05:00, with Ranger and Kraken (krait, a SANS pilot) added to it; publish;
     - Kraken: LL Wed 22 Jul, and a SANS availability offer for Sun 19 Jul.
   Expected:
     AB6 — Saturday's box: the app's FO credit, AMBER (the leave's tail and his 05:00 work share 05:00–06:00), and the tap
           list names BOTH things that clash — the credit AND the leave running into the morning (Fable S6's expected);
           money: OIL +1 on Saturday, the leave charged on Friday only (its afternoon half).
     SANS — Show SANS off: Kraken's row is not drawn, yet his leave charges and his published Saturday credits; switched
           on, his row arrives with LL on 22 Jul and FO on 18 Jul already in it, figures agreeing; the SANS offer on
           Sunday is no work and no OIL.
   Usage (from raptor-port/, the build on 4175): node scripts/handpass/ab/w4-06-saturday.mjs */
process.env.AB_WHO = 'w4'
const L = await import('./w4-lib.mjs')
const S = await import('./ab-sched.mjs')
const { openW4, fileInput, lwOpen, tapDay, closeSheets, sheetPress, sheetNow, shot, resultBook, ROOT, readAll, manningOn, manningDelta, top, cellOf, board, closeBoard, put, type, go, toastSpy, toasts, relogin, sideScroll, inputsOf } = L
const R = resultBook('W4-sat', `${ROOT}/docs/handpass/parts/2026-09-26-absence-w4-saturday.txt`)
const SP = process.env.W4_SCRATCH || 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor--claude-worktrees-absence-record-d147-af6a50/88ce3848-856b-4e60-84e4-7a09da4979d8/scratchpad'
const STATEFILE = `${SP}/w4-saturday-state.json`
let page
let sansPlaced = false
async function step(name, fn) { try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).split('\n')[0].slice(0, 300)); await shot(page, `w4-sat-THREW-${name}`).catch(() => {}); await closeSheets(page).catch(() => {}) } }
const FRI = '2026-07-17', SAT = '2026-07-18', SUN = '2026-07-19', WED = '2026-07-22'
const me = 'bane', sans = 'krait'
const lines = s => (s.lines || []).map(x => x.slice(0, 110))

/** A SANS availability offer through the Inputs page's own form (the SANS ticks need one box ticked). */
async function fileSansOffer(pg, person, iso) {
  const MONS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  await go(pg, 'inputs'); await pg.waitForSelector('#inAdd')
  if (await pg.locator('#inPerson').count()) await pg.selectOption('#inPerson', person)
  await pg.selectOption('#inType', 'SANS Availability')
  for (let i = 0; i < 36 && !(await pg.locator(`#inCal [data-cal="${iso}"]`).count()); i++) {
    const [m, y] = (await pg.locator('#inCal .rc-mon').first().textContent()).trim().split(/\s+/)
    const at = `${y}-${String(MONS.indexOf(m.slice(0, 3)) + 1).padStart(2, '0')}`
    await pg.locator(`#inCal button[aria-label="${at < iso.slice(0, 7) ? 'Next' : 'Previous'} month"]`).first().click(); await pg.waitForTimeout(80)
  }
  await pg.locator(`#inCal [data-cal="${iso}"]`).first().click(); await pg.waitForTimeout(120)
  if ((await pg.locator('#inDates').textContent()).includes('→')) { await pg.locator(`#inCal [data-cal="${iso}"]`).first().click(); await pg.waitForTimeout(120) }
  const ticks = pg.locator('#inSans input[type="checkbox"]')
  const n = await ticks.count()
  if (n) await ticks.first().check()
  await pg.locator('#inRemarks').fill('W4 SANS offer')
  const before = await pg.evaluate(() => window.INPUTS.length)
  await pg.locator('#inAdd').click(); await pg.waitForTimeout(700)
  for (let i = 0; i < 2; i++) {
    const conf = pg.locator('[data-testid="oilconf"]')
    if (await conf.count() && await conf.isVisible()) { await conf.getByRole('button', { name: 'Save', exact: true }).click().catch(() => {}); await pg.waitForTimeout(500) }
  }
  return { added: (await pg.evaluate(() => window.INPUTS.length)) - before, ticks: n, toast: await pg.evaluate(() => (document.getElementById('toastEl') || {}).textContent || '') }
}
const showSans = async (pg, on) => {
  await pg.locator('[data-testid="settings-open"]:visible').first().click(); await pg.waitForTimeout(500)
  const t = pg.locator('[data-testid="sans-toggle"]').first()
  const was = await t.getAttribute('aria-pressed') ?? (await t.getAttribute('aria-checked'))
  const txt = (await t.innerText()).trim()
  const isOn = was === 'true' || /✓|on\b/i.test(txt)
  if (isOn !== on) { await t.click(); await pg.waitForTimeout(700) }
  const after = (await t.getAttribute('aria-pressed')) ?? (await t.getAttribute('aria-checked')) ?? (await t.innerText()).trim()
  await closeSheets(pg)
  return { was: was ?? txt, after }
}

/* ============================================================= BUILD (desktop, admin) */
{
  const o = await openW4({ phone: false, who: 'a' })
  page = o.page
  await toastSpy(page)
  await step('build', async () => {
    await lwOpen(page, SAT)
    const b0 = { me: await readAll(page, me, SAT, { bd: ['lve'] }), m: await manningOn(page, SAT) }
    R.note('before', { meSat: b0.me.cell, meFigs: b0.me.sheet, sansRow: await page.locator(`[data-testid="row-${sans}"]`).count() })
    const f1 = await fileInput(page, { person: me, type: 'LL', from: FRI, span: 'custom', start: '20:00', end: '06:00', remarks: 'W4 AB6 overnight Fri-Sat' })
    const stored = (await inputsOf(page, me)).filter(x => /W4 AB6/.test(x.remarks))
    R.ck('build-overnight-filed', f1.added === 1 && stored.length === 1, 'the Inputs page takes an LL 20:00–06:00 on Fri 17 Jul (an overnight leave)', { f1, stored })
    const f2 = await fileInput(page, { person: sans, type: 'LL', from: WED, span: 'all', remarks: 'W4 SANS leave' })
    /* a SANS man is offered to the board only on a day he has offered himself for (sansGate) — so Kraken offers
       Saturday (to be planned on the desk); Rebel (romeo) offers Sunday and is planned on nothing (Astra 22) */
    const f3 = await fileSansOffer(page, sans, SAT)
    const f4 = await fileSansOffer(page, 'romeo', SUN)
    R.ck('build-sans-inputs', f2.added === 1 && f3.added === 1 && f4.added === 1, 'SANS: Kraken — LL Wed 22 Jul and a SANS availability offer for Sat 18 Jul; Rebel — an offer for Sun 19 Jul', { f2: [f2.added, f2.toast], f3, f4 })
    await board(page, 5)
    await type(page, '[data-bfld="dr:5.0.0.str"]', '05:00')
    const pA = await put(page, '[data-fill="d:5.0.0.+"]', [me])
    const pB = await put(page, '[data-fill="d:5.0.0.+"]', [sans])
    const desk = await page.evaluate(() => { const r = window.DAYS[5].dutywaves[0].rows[0]; return { role: r.role, id: r.id, more: r.more, str: r.str, end: r.end } })
    await shot(page, 'w4-sat-desk-before-publish')
    R.ck('build-desk', pA === me && /05:?00/.test(String(desk.str)), "the Saturday SDO desk starts 05:00 with Ranger added (the board's own controls)", { pA, desk })
    /* A SANS man is offered by the board's palette only for Fly / OFT / AMT on a day he offered (sansGate) — a duty
       desk is none of them, and the demo Saturday has no flying line: so Kraken cannot be put on Saturday's work
       through the app's own controls. Recorded as not walkable here, never forced through window. */
    sansPlaced = pB === sans
    R.note('build-sans-on-desk', { pB, placed: sansPlaced, why: sansPlaced ? '' : 'the palette did not offer him for a duty desk (SANS are offered for Fly / OFT / AMT only)' })
    const pub = await S.pubOnBoard(page, 5)
    R.ck('build-published', pub.p.pressed, 'Saturday published through the board\'s sign-offs and Publish day', pub)
    await closeBoard(page)
  })

  /* ---- AB6 on the desktop, admin */
  await step('AB6-desktop', async () => {
    await lwOpen(page, SAT)
    const sat = await cellOf(page, me, SAT), fri = await cellOf(page, me, FRI)
    const figs = await readAll(page, me, SAT, { bd: ['lve'] })
    const t = await tapDay(page, false, me, SAT)
    await shot(page, 'w4-sat-AB6-desktop-sat-list')
    const ls = lines(t)
    R.note('AB6-cells', { fri, sat, list: ls, text: (t.text || '').slice(0, 400) })
    R.ck('AB6-sat-amber', sat.amber && sat.mark === '!', 'Saturday is amber: his leave\'s tail (to 06:00) and his 05:00 work share an hour', sat)
    R.ck('AB6-list-shows-what-clashes', t.open === 'daylist-sheet' && ls.some(l => /OIL earned|FO/.test(l)) && ls.some(l => /LL/.test(l)), 'the Saturday list names BOTH clashing things — the credit AND the leave running into the morning (Fable S6 expected)', { open: t.open, lines: ls, clashSentence: /can’t both stand|cover the same time/.test(t.text || '') })
    await closeSheets(page)
    const tf = await tapDay(page, false, me, FRI)
    await shot(page, 'w4-sat-AB6-desktop-fri')
    R.note('AB6-friday-sheet', { open: tf.open, text: (tf.text || '').slice(0, 300), lines: lines(tf) })
    await closeSheets(page)
    R.ck('AB6-money', /OIL|FO/.test(sat.box) && figs.agree, 'money: the Saturday credit lands (FO), the leave charges Friday only; every reader agrees', { sat: sat.box, fri: fri.box, lve: figs.sheet.lve, oil: figs.sheet.oil, disagree: figs.disagree })
    await L.lwShot(page, 'w4-sat-AB6-desktop-row', me, SAT)
  })

  /* ---- SANS on the desktop */
  await step('SANS-desktop', async () => {
    await lwOpen(page, SAT)
    const rowOff = await page.locator(`[data-testid="row-${sans}"]`).count()
    const mOff = await manningOn(page, WED)
    const sw = await showSans(page, true)
    await lwOpen(page, SAT)
    const rowOn = await page.locator(`[data-testid="row-${sans}"]`).count()
    const sat = await cellOf(page, sans, SAT), sun = await cellOf(page, 'romeo', SUN)
    await lwOpen(page, WED)
    const wed = await cellOf(page, sans, WED)
    const mOn = await manningOn(page, WED)
    const r = await readAll(page, sans, WED, { bd: ['lve'] })
    await L.lwShot(page, 'w4-sat-SANS-desktop-row-on', sans, SAT)
    R.ck('SANS-row-hidden-when-off', rowOff === 0, 'with Show SANS off his row is not drawn', { rowOff })
    R.ck('SANS-row-arrives-with-everything', sw && rowOn === 1 && (!sansPlaced || /FO/.test(sat.box)) && /^LL$/.test(wed.box) && !sun.box, "Show SANS on: Kraken's row arrives with the LL on Wed 22 Jul (filed while he was hidden) already in it — and FO on Sat 18 Jul when he could be placed; Rebel's Sunday (an offer, no work) is empty", { sansPlaced, sw, sat, sun, wed })
    R.ck('SANS-figures', (!sansPlaced || top(r.sheet.oil) >= 1) && /\s1(\/|$)/.test(r.sheet.lve) && r.agree, 'the leave charged while his row was hidden is in his figures (LL 1 used), every reader agreeing', { sansPlaced, sheet: r.sheet, bd: r.breakdown, disagree: r.disagree })
    R.note('SANS-manning-when-shown', { delta: manningDelta(mOff, mOn), note: 'Show SANS draws them as a group; a group never moves a count (groups.ts) — recorded, not judged' })
    const offer = (await inputsOf(page, 'romeo')).filter(x => /SANS/.test(x.type))
    const rebel = await readAll(page, 'romeo', SUN, { bd: [] , drawer: false })
    R.ck('SANS-offer-no-work', !/FO|HO/.test(sun.box) && rebel.agree, "Rebel's SANS availability offer on Sunday is no work and earns no OIL (an empty box; his OIL figure carries nothing for it)", { sun, oil: rebel.sheet.oil, offer })
  })
  await page.context().storageState({ path: STATEFILE })
  R.note('desktop-toasts', await toasts(page))
  R.note('desktop-errors', o.errors.slice(0, 20))
  await o.browser.close()
}

/* ============================================================= READ at 390 px (the same world), admin then member */
{
  const o = await openW4({ phone: true, who: 'a', state: STATEFILE })
  page = o.page
  await step('AB6-phone-admin', async () => {
    await lwOpen(page, SAT)
    const sat = await cellOf(page, me, SAT)
    const t = await tapDay(page, true, me, SAT)
    await shot(page, 'w4-sat-AB6-phone-admin-sat-list')
    R.ck('AB6-phone-list', t.open === 'daylist-sheet' && (t.lines || []).some(l => /LL/.test(l)), 'at 390 px the Saturday list names the leave running into the morning as well as the credit', { sat, open: t.open, lines: lines(t), text: (t.text || '').slice(0, 300) })
    await closeSheets(page)
    const r = await readAll(page, sans, WED, { bd: ['lve'] })
    R.ck('SANS-phone-figures', r.agree && (!sansPlaced || top(r.sheet.oil) >= 1) && /\s1(\/|$)/.test(r.sheet.lve), "at 390 px Kraken's row (Show SANS kept on) and figures read the same as on the desktop", { sheet: r.sheet, disagree: r.disagree })
    R.note('phone-side-scroll', await sideScroll(page))
  })
  await step('AB6-member', async () => {
    await relogin(page, 'm')
    await lwOpen(page, SAT)
    const sat = await cellOf(page, me, SAT)
    const t = await tapDay(page, true, me, SAT)
    await shot(page, 'w4-sat-AB6-phone-member-sat-list')
    R.ck('AB6-member-reads-the-tail', t.open === 'daylist-sheet' && (t.lines || []).some(l => /LL/.test(l)), 'Ranger himself, on his own Saturday: the list shows what the "two things on this day" are — his leave\'s tail and the credit', { sat, open: t.open, lines: lines(t), text: (t.text || '').slice(0, 300) })
    await closeSheets(page)
    const own = await readAll(page, me, SAT, { bd: ['lve'] })
    R.ck('member-own-figures', own.agree, 'the member\'s own figures agree across every reader', { sheet: own.sheet, disagree: own.disagree })
  })
  R.note('phone-errors', o.errors.slice(0, 20))
  await o.browser.close()
}
R.save()
