/* RW copy of w3-05-switch.mjs for the re-walk (26 Sep 26, the rebuilt app): pictures to rewalk/w3, results to 2026-09-26-absence-rewalk-w3-*.txt. */
/* W3-05 — SWITCHING WARS with each sheet open (the bid sheet, the tap list, the selection sheet, the Post out sheet,
   the read-only sheet): the sheet closes or goes inert and nothing writes into the other war; Undo after switching
   returns to the war the change was made in; a leave across 31 Dec shows in both wars and a move of its December day
   into January is refused (Q11); a redo the rules must refuse (E3); undo across a reload (E4).
   Old plan E1–E4; Fable S14; Astra 11. The switch is made the way a person can with a sheet up: on a desktop the
   sheet's shade covers the page, so the picker is reached by the KEYBOARD (Tab to it, arrow key); a mouse click there
   first closes the sheet (recorded). On a touch phone the shade lets a finger through (Sheet.tsx) — `phone` runs a
   touch context and TAPS the picker.
   Usage: node scripts/handpass/ab/w3-05-switch.mjs [desktop|phone] */
const W = process.argv[2] || 'desktop'
process.env.AB_WHO = 'rewalk/w3'
const L = await import('./w3-lib.mjs')
const { chromium } = await import('@playwright/test')
const { existsSync, mkdirSync } = await import('node:fs')
const { lwOpen, bidOn, tapCell, sheetPress, closeSheets, sheetNow, fileInput, inputsOf, shot, resultBook, ROOT, toastSpy, toasts, recsOf, lwHist, reload, stageNow, warPick, login, figures, lwCell } = L
const PHONE = W === 'phone'
const R = resultBook(`RW-W3-05-${W}`, `${ROOT}/docs/handpass/parts/2026-09-26-absence-rewalk-w3-05-${W}.txt`)
/* our own context so the phone run is a real touch device ((pointer: coarse) is what lets a finger past the shade) */
const CH = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
mkdirSync(process.env.HP_SHOTS, { recursive: true })
const browser = await chromium.launch({ headless: true, ...(existsSync(CH) ? { executablePath: CH } : {}) })
const ctx = await browser.newContext(PHONE ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true } : { viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
const errors = []
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
await page.goto((process.env.HP_URL || 'http://localhost:4175') + '/')
await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
await login(page, 'a')
await toastSpy(page)
R.note('bundle', await page.evaluate(() => [...document.scripts].map(s => s.src).filter(s => /index-/.test(s)).join(' ')))
R.note('coarse-pointer', await page.evaluate(() => matchMedia('(pointer: coarse)').matches))
const pic = (n) => shot(page, `w3-05-${W}-${n}`)
async function step(name, fn) { try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).slice(0, 300)); await pic(`THREW-${name}`).catch(() => {}); await closeSheets(page).catch(() => {}) } }
const warNow = async () => page.evaluate(() => { const s = document.querySelector('[data-testid="war-picker"]'); return s ? s.options[s.selectedIndex].text : '?' })

/** Switch the war WITH the sheet still up, the way this device can. */
async function switchWar(to) {
  const pk = page.locator('[data-testid="war-picker"]:visible').first()
  await pk.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(300)
  const bb = await pk.boundingBox()
  const over = await page.evaluate(([x, y]) => { const h = document.elementFromPoint(x, y); return h ? `${h.tagName}[${h.getAttribute('data-testid') || h.className}]` : 'nothing' }, [bb.x + bb.width / 2, bb.y + bb.height / 2])
  const opts = await pk.locator('option').evaluateAll(os => os.map(o => ({ v: o.value, t: o.text })))
  const o = opts.find(x => x.t === to)
  if (PHONE) { await page.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await page.waitForTimeout(300); await pk.selectOption(o.v) }
  else { await pk.focus(); const cur = await pk.inputValue(); const ci = opts.findIndex(x => x.v === cur), ti = opts.findIndex(x => x.v === o.v); for (let i = 0; i < Math.abs(ti - ci); i++) await page.keyboard.press(ti > ci ? 'ArrowDown' : 'ArrowUp') }
  await page.waitForTimeout(1300)
  return { overPicker: over, now: await warNow() }
}
const A = 'JAN - DEC 26', B = 'JAN - DEC 27'

/* ---- fixture: things to open in December 26 ---- */
await step('fixture', async () => {
  const f = await fileInput(page, { person: 'slash', type: 'LL', from: '2026-12-30', to: '2027-01-02', remarks: 'W3 across the new year' })
  await lwOpen(page, '2026-12-14')
  const a = await bidOn(page, 'razer', '2026-12-15', 'LL')
  await L.lwAward(page, 'glass', '2026-12-16', '1', 'W3 Dec award'); const b = await bidOn(page, 'glass', '2026-12-16', 'LL')
  const c = await bidOn(page, 'freak', '2026-12-31', 'LL'); await tapCell(page, 'freak', '2026-12-31'); const ap = await sheetPress(page, 'decide-approve'); await closeSheets(page)
  await tapCell(page, 'chaps', '2026-12-10'); await sheetPress(page, 'bid-postout'); await page.locator('[data-testid="po-date"]').fill('2026-12-20'); await page.waitForTimeout(200); await sheetPress(page, 'po-archive'); await sheetPress(page, 'po-confirm')
  R.note('fixture', { filed: f.added, bid: a.placed, twoRecs: b.placed, freak31: [c.placed, ap.pressed], war: await warNow() })
})

/* ---- E1 / Astra 11: each sheet open, then the war switched ---- */
const SHEETS = [
  ['bid-sheet', async () => tapCell(page, 'razer', '2026-12-18'), 'bid-LL'],
  ['tap-list', async () => tapCell(page, 'glass', '2026-12-16'), null],
  ['selection', async () => L.dragRect(page, 'razer', '2026-12-21', 'glass', '2026-12-22'), 'sel-OL'],
  ['postout', async () => tapCell(page, 'chaps', '2026-12-24'), 'postout-undo'],
  ['read-only', async () => tapCell(page, 'slash', '2026-12-30'), null],
]
for (const [name, openIt, press] of SHEETS) {
  await step(`E1-${name}`, async () => {
    if ((await warNow()) !== A) await switchWar(A)
    await lwOpen(page, '2026-12-14')
    const before27 = { razer: await recsOf(page, 'razer', ['2027-12-18', '2027-12-21']), glass: await recsOf(page, 'glass', ['2027-12-22']) }
    const s = await openIt()
    const sw = await switchWar(B)
    const after = await sheetNow(page)
    await pic(`E1-${name}-after-switch`)
    let pressed = null
    if (after.open !== 'nothing' && press) { const b = page.locator(`.bidsheet[role="dialog"]:visible [data-testid="${press}"]`).first(); if (await b.count()) { await b.click().catch(() => {}); await page.waitForTimeout(600); pressed = await sheetNow(page) } }
    const wrote = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('raptor:leavewar/wars') || '[]') } catch { return [] } })
    const w27 = (Array.isArray(wrote) ? wrote : Object.values(wrote)).find(w => w && w.period && /27/.test(w.period.name)) || {}
    const recs27 = JSON.stringify((w27.recs || {}).razer || {}) + JSON.stringify((w27.recs || {}).glass || {}) + JSON.stringify((w27.recs || {}).chaps || {})
    await closeSheets(page)
    const back = await switchWar(A)
    const reopened = await sheetNow(page)
    await pic(`E1-${name}-back-in-26`)
    await closeSheets(page)
    R.note(`E1-${name}`, { opened: s.open, overPicker: sw.overPicker, warAfter: sw.now, sheetAfter: after.open, sheetText: (after.text || '').slice(0, 120), pressed: pressed && pressed.open, back: back.now, sheetOnReturn: reopened.open, recs27: recs27.slice(0, 200) })
    R.ck(`E1-${name}`, sw.now === B && after.open === 'nothing' && !/request|credit/.test(recs27) && reopened.open === 'nothing',
      `RW (register §12 — a war switch closes the open cell): with the ${name} open, switching to JAN–DEC 27 CLOSES it, nothing is written into 27, and coming back to 26 does not re-open a stale sheet`,
      { sheetAfter: after.open, pressedResult: pressed && pressed.open, recs27: recs27.slice(0, 160), sheetOnReturn: reopened.open })
  })
}

/* ---- E2 / S14: undo after switching goes back to the war the change was made in ---- */
await step('E2-undo-after-switch', async () => {
  if ((await warNow()) !== B) await switchWar(B)
  await lwOpen(page, '2027-01-05')
  const b = await bidOn(page, 'mamba', '2027-01-05', 'LL')
  await switchWar(A); await lwOpen(page, '2026-12-14')
  const dec = await recsOf(page, 'razer', ['2026-12-15'])
  const u = await lwHist(page, 'undo')
  await page.waitForTimeout(800)
  const war = await warNow()
  await pic('E2-after-undo')
  const jan = await recsOf(page, 'mamba', ['2027-01-05'])
  const dec2 = await recsOf(page, 'razer', ['2026-12-15'])
  R.ck('E2-undo-after-switch', b.placed && /-/.test(jan['2027-01-05']) && dec2['2026-12-15'] === dec['2026-12-15'], 'Undo (made in 27, pressed while looking at 26) takes back the 27 bid and touches nothing in 26', { undo: u.title, warShownAfter: war, jan, dec: [dec, dec2] })
  R.note('E2-which-war-shows', { warShownAfterUndo: war, expectedPerS14: B })
  const rd = await lwHist(page, 'redo')
  R.ck('E2-redo', /request:LL/.test((await recsOf(page, 'mamba', ['2027-01-05']))['2027-01-05']), 'Redo puts the 27 bid back', rd)
})

/* ---- S14 / Q11: the leave across 31 Dec ---- */
await step('Q11-both-wars', async () => {
  if ((await warNow()) !== A) await switchWar(A)
  await lwOpen(page, '2026-12-30')
  const g26 = await L.grid(page, ['slash'], ['2026-12-29', '2026-12-30', '2026-12-31'])
  const f26 = await figures(page, 'slash')
  await L.lwShot(page, `w3-05-${W}-Q11-war26`, 'slash', '2026-12-31')
  await switchWar(B); await lwOpen(page, '2027-01-01')
  const g27 = await L.grid(page, ['slash'], ['2027-01-01', '2027-01-02', '2027-01-03'])
  const f27 = await figures(page, 'slash')
  await L.lwShot(page, `w3-05-${W}-Q11-war27`, 'slash', '2027-01-01')
  R.ck('Q11-both-wars', /LL/.test(g26.slash.split(' | ')[1]) && /LL/.test(g26.slash.split(' | ')[2]) && /LL/.test(g27.slash.split(' | ')[0]) && /LL/.test(g27.slash.split(' | ')[1]),
    'the leave filed 30 Dec 26 – 2 Jan 27 shows on 30–31 Dec in the 26 war and 1–2 Jan in the 27 war', { g26, g27, lve26: f26.lve, lvetot26: f26.lvetot, lve27: f27.lve, lvetot27: f27.lvetot })
})
await step('Q11-move-refused', async () => {
  await switchWar(A); await lwOpen(page, '2026-12-31')
  await tapCell(page, 'freak', '2026-12-31')
  const f = page.locator('[data-testid="bid-picker"] [data-testid="shift-date"]:visible').first()
  const max = await f.getAttribute('max')
  await f.fill('2027-01-04'); await page.waitForTimeout(250)
  const m = await sheetPress(page, 'decide-shift')
  const prob = (await page.locator('[data-testid="shift-problem"]').allInnerTexts()).join(' ')
  await pic('Q11-move-refused')
  await closeSheets(page)
  const inp = (await inputsOf(page, 'freak')).filter(x => /Dec 31|Jan 4/.test(x.date))
  R.ck('Q11-move-refused', m.sheet.open === 'bid-picker' && prob.length > 0 && inp.length === 1 && /Dec 31/.test(inp[0].date), 'moving the war-approved 31 Dec leave to 4 Jan 27 is refused with a sentence; the leave stays on 31 Dec (Q11)', { max, problem: prob, inputs: inp })
})

/* ---- E3: a redo the rules must refuse; E4: undo across a reload ---- */
await step('E3-redo-refused', async () => {
  await lwOpen(page, '2026-12-07')
  await bidOn(page, 'nact', '2026-12-08', 'LL')
  await lwHist(page, 'undo')
  const redoBefore = await page.locator('[data-testid="lw-redo"]:visible').first().isDisabled()
  const f = await fileInput(page, { person: 'nact', type: 'ATT C', from: '2026-12-08', remarks: 'W3 E3 medical' })
  await lwOpen(page, '2026-12-07')
  const redoAfter = await page.locator('[data-testid="lw-redo"]:visible').first()
  const dis = await redoAfter.isDisabled(), title = await redoAfter.getAttribute('title')
  let r = null
  if (!dis) r = await lwHist(page, 'redo')
  const recs = await recsOf(page, 'nact', ['2026-12-08'])
  const cell = await lwCell(page, 'nact', '2026-12-08')
  const t = await toasts(page)
  R.note('E3-redo-refused', { redoOnBeforeMedical: !redoBefore, filed: f.added, redoOnAfterMedical: !dis, title, pressed: r, recs, cell, toasts: t })
  R.ck('E3-redo-refused', dis || (!/request/.test(recs['2026-12-08']) && t.some(x => /couldn|can.t|refus|medical/i.test(x))), 'after a medical is filed on the day, the bid cannot come back by Redo — Redo is off, or it refuses by name and writes nothing', { dis, recs, toasts: t })
  R.ck('E3-refusal-names-the-medical', dis || t.some(x => /ATT C/.test(x) && /8 Dec/.test(x) && /can.t go over/i.test(x)), 'the refusal names what now holds the day ("…Warden’s ATT C now holds 8 Dec, and a bid can’t go over it" — register §12)', { toasts: t })
  await pic('E3-after-redo-refused')
})
await step('E4-undo-across-reload', async () => {
  await lwOpen(page, '2026-12-07')
  await bidOn(page, 'nact', '2026-12-09', 'LL')
  await reload(page); await lwOpen(page, '2026-12-07')
  const u = page.locator('[data-testid="lw-undo"]:visible').first(), rd = page.locator('[data-testid="lw-redo"]:visible').first()
  const st = { undoOff: await u.isDisabled(), redoOff: await rd.isDisabled(), war: await warNow(), rec: (await recsOf(page, 'nact', ['2026-12-09']))['2026-12-09'] }
  await pic('E4-after-reload')
  R.ck('E4-undo-across-reload', st.undoOff && st.redoOff && /request:LL/.test(st.rec), 'after a reload the bid is still there and both Undo and Redo are off (the history is this session\'s)', st)
})
R.note('toasts', await toasts(page))
R.note('errors', errors.slice(0, 20))
R.save()
await browser.close()
