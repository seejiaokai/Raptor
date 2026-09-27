/* RW-W3-08 — the re-walk's NEW script: EVERY ROAD TO A WAR SWITCH WITH A SHEET OPEN (W3-F7, register §12 "Every Leave War
   sheet holds the keyboard … and a war switch closes the open cell"). The first walk found one road (the keyboard: 49
   Shift+Tabs to the picker, then an arrow key). This walks every other road a person has, on the rebuilt app:
   desktop (mouse + keyboard):
     K1  the picker holding the focus from before (Tab to it with no sheet up), then a MOUSE click on a day opens a
         sheet, then an arrow key — does the focus stay on the picker and switch the war under the sheet?
     M1  a mouse click on the picker with a sheet up (the shade is over the page).
     M2  a mouse click on the war's Undo with a sheet up, when that Undo would put the OTHER war on screen.
     M3  a mouse click on the app's own nav ("Edit Schedule", where the one timeline's Undo also lives) with a sheet up.
     MV  move mode (no shade): Move… on a block, then the picker by mouse — the move must not survive into the other war.
   phone (a real touch device — the shade lets a finger through to the grid):
     F1  a finger on the war's Undo with a sheet up, when that Undo would put the OTHER war on screen.
     F2  a finger on "+ New" with a sheet up.
     F3  a finger on the app's menu (☰) with a sheet up.
     FV  move mode (phone: preview-then-Confirm): the picker by finger with the move banner up.
   (The finger on the picker itself, and a switch made with the focus put on the picker directly, are w3-05 / w3-05b.)
   Pictures to rewalk/w3; results to docs/handpass/parts/2026-09-26-absence-rewalk-w3-08-<width>.txt.
   Usage (from raptor-port/, the build on 4175): node scripts/handpass/ab/rw-w3-08-roads.mjs [desktop|phone] */
const W = process.argv[2] || 'desktop'
process.env.AB_WHO = 'rewalk/w3'
const L = await import('./w3-lib.mjs')
const { chromium } = await import('@playwright/test')
const { existsSync, mkdirSync } = await import('node:fs')
const { lwOpen, bidOn, tapCell, sheetPress, closeSheets, sheetNow, shot, resultBook, ROOT, toastSpy, toasts, recsOf, login, dragRect, selPress } = L
const PHONE = W === 'phone'
const R = resultBook(`RW-W3-08-${W}`, `${ROOT}/docs/handpass/parts/2026-09-26-absence-rewalk-w3-08-${W}.txt`)
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
const pic = (n) => shot(page, `rw-w3-08-${W}-${n}`)
async function step(name, fn) { try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).slice(0, 300)); await pic(`THREW-${name}`).catch(() => {}); await closeSheets(page).catch(() => {}) } }
const A = 'JAN - DEC 26', B = 'JAN - DEC 27'
const warNow = async () => page.evaluate(() => { const s = document.querySelector('[data-testid="war-picker"]'); return s ? s.options[s.selectedIndex].text : '?' })
const pageNow = async () => page.evaluate(() => window.CURPAGE)
const focusNow = async () => page.evaluate(() => { const e = document.activeElement; return e ? (e.getAttribute('data-testid') || e.id || e.tagName) : 'none' })
const centre = async (sel) => { const l = page.locator(sel).first(); await l.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })).catch(() => {}); await page.waitForTimeout(250); const b = await l.boundingBox(); return b ? { x: b.x + b.width / 2, y: b.y + b.height / 2 } : null }
const under = async (p) => page.evaluate(([x, y]) => { const h = document.elementFromPoint(x, y); return h ? `${h.tagName}[${h.getAttribute('data-testid') || h.id || String(h.className).slice(0, 24)}]` : 'nothing' }, [p.x, p.y])
/* a war switch with NO sheet up — the picker itself, the way a person picks from it (setup only) */
async function pick(to) {
  if ((await warNow()) === to) return
  const sel = page.locator('[data-testid="war-picker"]:visible').first()
  const v = await sel.locator('option').evaluateAll((os, t) => (os.find(o => o.text === t) || {}).value, to)
  await sel.selectOption(v); await page.waitForTimeout(1300)
}
async function press(p) { if (PHONE) await page.touchscreen.tap(p.x, p.y); else await page.mouse.click(p.x, p.y); await page.waitForTimeout(900) }
/* the last change on the one timeline is a bid in the 27 war, so an Undo would put 27 on screen (E2 of the first walk) */
let n27 = 0
async function lastStepIn27() {
  await pick(B); await lwOpen(page, '2027-01-04')
  const d = ['2027-01-05', '2027-01-06', '2027-01-07', '2027-01-08', '2027-01-11', '2027-01-12'][n27++ % 6]
  const b = await bidOn(page, 'mamba', d, 'LL')
  await pick(A); await lwOpen(page, '2026-12-14')
  return { d, placed: b.placed }
}

await step('fixture', async () => {
  await lwOpen(page, '2026-12-14')
  const a = await bidOn(page, 'razer', '2026-12-15', 'LL')
  /* the 27 war must be bid-able for the 27 steps: move it to OPEN if it is not */
  await pick(B)
  const st = await L.stageNow(page)
  let adv = null
  for (let i = 0; i < 3 && !/OPEN/i.test(await L.stageNow(page)); i++) adv = await L.stageGo(page, 'advance')
  const st2 = await L.stageNow(page)
  await pick(A)
  R.note('fixture', { razer15: a.placed, war27: [st, st2, adv && adv.label], war: await warNow() })
})

if (!PHONE) {
  await step('K1-focus-kept-on-picker', async () => {
    await lwOpen(page, '2026-12-14')
    /* Tab from the page until the picker holds the focus (no sheet up) */
    let got = false
    for (let i = 0; i < 120 && !got; i++) { await page.keyboard.press('Tab'); got = (await focusNow()) === 'war-picker' }
    if (!got) for (let i = 0; i < 120 && !got; i++) { await page.keyboard.press('Shift+Tab'); got = (await focusNow()) === 'war-picker' }
    const s = await tapCell(page, 'razer', '2026-12-18')     // a MOUSE click on a day: a sheet opens
    const f = await focusNow()
    await page.keyboard.press('ArrowDown'); await page.waitForTimeout(1300)
    const w = await warNow(), after = await sheetNow(page)
    await pic('K1-after-arrow')
    R.note('K1', { pickerFocusedFirst: got, opened: s.open, focusAfterClick: f, warAfterArrow: w, sheetAfterArrow: after.open })
    R.ck('K1-no-stale-sheet', (w === A && after.open === 'bid-picker') || (w !== A && after.open === 'nothing'), 'the picker\'s focus does not survive the mouse click that opens a sheet — the arrow key switches nothing; or, if it switched, the sheet closed with it', { focusAfterClick: f, war: w, sheet: after.open })
    await closeSheets(page); if ((await warNow()) !== A) await pick(A)
  })
  await step('M1-mouse-on-picker', async () => {
    await lwOpen(page, '2026-12-14')
    const s = await tapCell(page, 'razer', '2026-12-18')
    const p = await centre('[data-testid="war-picker"]:visible')
    const u = await under(p)
    await press(p)
    const after = await sheetNow(page), w = await warNow()
    await pic('M1-after-mouse-on-picker')
    R.ck('M1-mouse-on-picker', s.open === 'bid-picker' && after.open === 'nothing' && w === A, 'a mouse aimed at the picker with a sheet up lands on the shade: the sheet closes, the war stays', { opened: s.open, under: u, sheetAfter: after.open, war: w })
    await closeSheets(page)
  })
  await step('M2-mouse-on-undo', async () => {
    const f = await lastStepIn27()
    const s = await tapCell(page, 'razer', '2026-12-18')
    const p = await centre('[data-testid="lw-undo"]:visible')
    const u = await under(p)
    await press(p)
    const after = await sheetNow(page), w = await warNow(), r = (await recsOf(page, 'mamba', [f.d]))[f.d]
    await pic('M2-after-mouse-on-undo')
    R.ck('M2-mouse-on-undo', s.open === 'bid-picker' && after.open === 'nothing' && w === A && /request:LL/.test(r), 'a mouse aimed at the war\'s Undo with a sheet up lands on the shade: the sheet closes, nothing is undone, the war stays', { opened: s.open, under: u, sheetAfter: after.open, war: w, bid27: r, fixture: f })
    await closeSheets(page)
  })
  await step('M3-mouse-on-nav', async () => {
    await lwOpen(page, '2026-12-14')
    const s = await tapCell(page, 'razer', '2026-12-18')
    const p = await centre('.topbar [data-page="editsched"]')
    const u = await under(p)
    await press(p)
    const after = await sheetNow(page), pg = await pageNow()
    await pic('M3-after-mouse-on-nav')
    R.ck('M3-mouse-on-nav', after.open === 'nothing' && pg === 'leavewar', 'a mouse aimed at "Edit Schedule" (the page with the one timeline\'s other Undo) with a sheet up lands on the shade: the sheet closes, the page stays', { opened: s.open, under: u, sheetAfter: after.open, page: pg })
    await closeSheets(page)
  })
  await step('M3b-undo-from-edit-schedule', async () => {
    /* the only way to Edit Schedule's Undo is with the sheet CLOSED (M3) — walk it anyway: the timeline's Undo there puts 27
       on the war's screen; back on the war nothing stale is open */
    const f = await lastStepIn27()
    const s = await tapCell(page, 'razer', '2026-12-18'); await closeSheets(page)
    await page.locator('.topbar [data-page="editsched"]').first().click(); await page.waitForTimeout(900)
    if (await page.locator('#schedBoard:visible').count()) await L.closeBoard(page)
    const ub = page.locator('#undoBtn:visible').first()
    const title = await ub.getAttribute('title').catch(() => null)
    if (await ub.count() && !(await ub.isDisabled())) { await ub.click(); await page.waitForTimeout(900) }
    await page.locator('.topbar [data-page="leavewar"]').first().click(); await page.waitForTimeout(1300)
    const w = await warNow(), after = await sheetNow(page), r = (await recsOf(page, 'mamba', [f.d]))[f.d]
    await pic('M3b-back-on-war')
    R.ck('M3b-undo-from-edit-schedule', after.open === 'nothing' && !/request/.test(r), 'Edit Schedule\'s Undo takes back the 27 bid (the one timeline); back on the war no sheet is open', { title, war: w, sheet: after.open, bid27: r })
    R.note('M3b-war-shown', { war: w })
    await closeSheets(page); if ((await warNow()) !== A) await pick(A)
  })
  await step('MV-move-mode-then-picker', async () => {
    await lwOpen(page, '2026-12-14')
    const sel = await dragRect(page, 'razer', '2026-12-15', 'razer', '2026-12-16')
    const m = await selPress(page, 'sel-move')
    const b1 = await page.locator('[data-testid="move-banner"]:visible').allInnerTexts()
    const pp = await centre('[data-testid="war-picker"]:visible')
    const reach = pp ? await under(pp) : 'no picker'   // move mode has no shade: the mouse reaches the picker
    await pick(B)
    const b2 = await page.locator('[data-testid="move-banner"]:visible').allInnerTexts()
    await pic('MV-after-switch')
    R.note('MV-picker-reachable', reach)
    /* a click on a 27 day, as the landing would be */
    await lwOpen(page, '2027-01-18')
    const tc = await centre('[data-testid="cell-razer-2027-01-19"]')
    if (tc) { await page.mouse.click(tc.x, tc.y); await page.waitForTimeout(900) }
    const s27 = await sheetNow(page)
    await closeSheets(page)
    await pick(A); await lwOpen(page, '2026-12-14')
    const b3 = await page.locator('[data-testid="move-banner"]:visible').allInnerTexts()
    const r = await recsOf(page, 'razer', ['2026-12-15', '2027-01-19'])
    R.ck('MV-move-mode-then-picker', b1.length > 0 && b2.length === 0 && b3.length === 0 && /request:LL/.test(r['2026-12-15']) && r['2027-01-19'] === '-', 'a war switched while a block is in move mode ends the move: no banner in 27, a click there moves nothing, the bid stays on 15 Dec', { banner: [b1, b2, b3], tapIn27: s27.open, recs: r, sel: sel.open, pressed: m.pressed })
  })
} else {
  await step('F1-finger-on-undo', async () => {
    const f = await lastStepIn27()
    const s = await tapCell(page, 'razer', '2026-12-18')
    const p = await centre('[data-testid="lw-undo"]:visible')
    const u = await under(p)
    await press(p)
    const after = await sheetNow(page), w = await warNow(), r = (await recsOf(page, 'mamba', [f.d]))[f.d]
    await pic('F1-after-finger-on-undo')
    R.note('F1', { opened: s.open, under: u, sheetAfter: after.open, war: w, bid27: r, fixture: f })
    R.ck('F1-finger-on-undo', s.open === 'bid-picker' && after.open === 'nothing' && ((w === A && /request:LL/.test(r)) || (w === B && !/request/.test(r))), 'a finger on the war\'s Undo with a sheet up: the sheet closes — either the tap only closes it (nothing undone), or the Undo runs and no sheet is left open against the war it put on screen', { sheetAfter: after.open, war: w, bid27: r })
    await closeSheets(page); if ((await warNow()) !== A) await pick(A)
  })
  await step('F2-finger-on-new', async () => {
    await lwOpen(page, '2026-12-14')
    const s = await tapCell(page, 'razer', '2026-12-18')
    const p = await centre('[data-testid="war-new"]:visible')
    const u = p ? await under(p) : 'no + New'
    if (p) await press(p)
    const after = await sheetNow(page), w = await warNow()
    await pic('F2-after-finger-on-new')
    R.ck('F2-finger-on-new', after.open === 'nothing' && w === A, 'a finger on "+ New" with a sheet up only closes the sheet (no new war, no switch)', { opened: s.open, under: u, sheetAfter: after.open, war: w })
    await closeSheets(page)
  })
  await step('F3-finger-on-menu', async () => {
    await lwOpen(page, '2026-12-14')
    const s = await tapCell(page, 'razer', '2026-12-18')
    const p = await centre('#burger')
    const u = p ? await under(p) : 'no menu'
    if (p) await press(p)
    const after = await sheetNow(page), pg = await pageNow()
    const drawer = await page.locator('.drawer.open, .navdrawer.open, [data-testid="nav-drawer"]:visible').count()
    await pic('F3-after-finger-on-menu')
    R.ck('F3-finger-on-menu', after.open === 'nothing' && pg === 'leavewar', 'a finger on the menu with a sheet up closes the sheet and leaves the page where it is', { opened: s.open, under: u, sheetAfter: after.open, page: pg, drawerOpen: drawer })
    await closeSheets(page)
    if (drawer) { await page.keyboard.press('Escape'); await page.waitForTimeout(300) }
  })
  await step('FV-move-banner-then-picker', async () => {
    await lwOpen(page, '2026-12-14')
    const sel = await dragRect(page, 'razer', '2026-12-15', 'razer', '2026-12-16')
    const m = await selPress(page, 'sel-move')
    const b1 = await page.locator('[data-testid="move-banner"]:visible').allInnerTexts()
    const p = await centre('[data-testid="war-picker"]:visible')
    if (p) { await page.touchscreen.tap(p.x, p.y); await page.waitForTimeout(300) }
    await pick(B)
    const b2 = await page.locator('[data-testid="move-banner"]:visible').allInnerTexts()
    await pic('FV-after-switch')
    await pick(A); await lwOpen(page, '2026-12-14')
    const b3 = await page.locator('[data-testid="move-banner"]:visible').allInnerTexts()
    const r = await recsOf(page, 'razer', ['2026-12-15'])
    R.ck('FV-move-banner-then-picker', b2.length === 0 && b3.length === 0 && /request:LL/.test(r['2026-12-15']), 'the phone\'s move banner does not survive a war switch; nothing moved', { banner: [b1, b2, b3], sel: sel.open, pressed: m.pressed, recs: r })
  })
}
R.note('toasts', await toasts(page))
R.note('errors', errors.slice(0, 20))
R.save()
await browser.close()
