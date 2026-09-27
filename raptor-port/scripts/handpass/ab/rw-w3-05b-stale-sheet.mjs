/* RW copy of w3-05b-stale-sheet.mjs for the re-walk (26 Sep 26, the rebuilt app): pictures to rewalk/w3, results to 2026-09-26-absence-rewalk-w3-*.txt. */
/* W3-05b — a sheet left open across a WAR SWITCH is re-read against the war now on screen, and can turn into a live bid
   sheet for a day of the OTHER war. Does it let an admin change a PUBLISHED war's approved leave without reopening the
   stage ("approved and published is finished paperwork", owner 21 Sep 26)? And E3 with pictures: after a bid is undone
   and a medical is filed on that day, does Redo bring the bid back over the medical?
   Assertions of the RIGHT behaviour. Usage: node scripts/handpass/ab/w3-05b-stale-sheet.mjs [desktop|phone] */
const W = process.argv[2] || 'desktop'
process.env.AB_WHO = 'rewalk/w3'
const L = await import('./w3-lib.mjs')
const { chromium } = await import('@playwright/test')
const { existsSync, mkdirSync } = await import('node:fs')
const { lwOpen, bidOn, tapCell, sheetPress, closeSheets, sheetNow, fileInput, inputsOf, shot, resultBook, ROOT, toastSpy, toasts, recsOf, lwHist, stageNow, stageGo, login, lwCell } = L
const PHONE = W === 'phone'
const R = resultBook(`RW-W3-05b-${W}`, `${ROOT}/docs/handpass/parts/2026-09-26-absence-rewalk-w3-05b-${W}.txt`)
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
const pic = (n) => shot(page, `w3-05b-${W}-${n}`)
async function step(name, fn) { try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).slice(0, 300)); await pic(`THREW-${name}`).catch(() => {}); await closeSheets(page).catch(() => {}) } }
const warNow = async () => page.evaluate(() => { const s = document.querySelector('[data-testid="war-picker"]'); return s ? s.options[s.selectedIndex].text : '?' })
let lastOver = ''
async function switchWar(to) {
  const pk = page.locator('[data-testid="war-picker"]:visible').first()
  const opts = await pk.locator('option').evaluateAll(os => os.map(o => ({ v: o.value, t: o.text })))
  const o = opts.find(x => x.t === to)
  await pk.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(300)
  const bb = await pk.boundingBox()
  lastOver = await page.evaluate(([x, y]) => { const h = document.elementFromPoint(x, y); return h ? `${h.tagName}[${h.getAttribute('data-testid') || h.className}]` : 'nothing' }, [bb.x + bb.width / 2, bb.y + bb.height / 2])
  if (PHONE) { await page.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await page.waitForTimeout(300); await pk.selectOption(o.v) }
  else { await pk.focus(); const cur = await pk.inputValue(); const ci = opts.findIndex(x => x.v === cur), ti = opts.findIndex(x => x.v === o.v); for (let i = 0; i < Math.abs(ti - ci); i++) await page.keyboard.press(ti > ci ? 'ArrowDown' : 'ArrowUp') }
  await page.waitForTimeout(1300)
  return warNow()
}
const A = 'JAN - DEC 26', B = 'JAN - DEC 27'
const glassDec = async () => ({ rec: (await recsOf(page, 'glass', ['2026-12-16']))['2026-12-16'], inputs: (await inputsOf(page, 'glass')).filter(x => /Dec 16/.test(x.date)).map(x => `${x.type} ${x.date} lw=${x.lw || 'n'}`) })

await step('setup', async () => {
  await lwOpen(page, '2026-12-14')
  await bidOn(page, 'glass', '2026-12-16', 'LL')
  await tapCell(page, 'glass', '2026-12-16'); await sheetPress(page, 'decide-approve'); await closeSheets(page)
  const a = await stageGo(page, 'advance'), b = await stageGo(page, 'advance')
  await switchWar(B)
  const st27 = await stageNow(page)
  let adv = null
  if (!/OPEN/i.test(st27)) adv = await stageGo(page, 'advance')
  const st27b = await stageNow(page)
  await switchWar(A)
  R.note('setup', { war26: [a.now, b.now], war27: [st27, st27b, adv && adv.label], glass: await glassDec() })
})

await step('stale-remarks-to-bid-sheet', async () => {
  await lwOpen(page, '2026-12-14')
  const s = await tapCell(page, 'glass', '2026-12-16')
  await pic('1-published-remarks-sheet')
  const sw = await switchWar(B)
  const after = await sheetNow(page)
  await pic('2-after-switch-to-27')
  R.note('after-switch', { openedIn26: s.open, war: sw, underTheFingerOrMouseAtThePicker: lastOver, now: after.open, text: (after.text || '').slice(0, 200), buttons: after.buttons })
  R.ck('sheet-closes-on-switch', after.open === 'nothing', 'switching to JAN–DEC 27 closes the sheet opened on a 26 day (E1)', { now: after.open, text: (after.text || '').slice(0, 120) })
  let cleared = null
  if (after.open === 'bid-picker') { cleared = await sheetPress(page, 'bid-clear'); await pic('3-after-clear-pressed') }
  await closeSheets(page)
  await switchWar(A); await lwOpen(page, '2026-12-14')
  const g = await glassDec()
  const cell = await lwCell(page, 'glass', '2026-12-16')
  await L.lwShot(page, `w3-05b-${W}-4-back-in-26`, 'glass', '2026-12-16')
  R.ck('published-leave-untouched', /LL/.test(cell.box) && g.inputs.length === 1, 'the PUBLISHED war\'s approved leave cannot be taken off from a sheet left open across a war switch — it is still there on the war and on the Inputs page', { clearPressed: cleared && cleared.pressed, sheetAfterClear: cleared && cleared.sheet.open, cell, glass: g, stage26: await stageNow(page) })
  if (!/LL/.test(cell.box)) { const u = await lwHist(page, 'undo'); R.note('undo-after', { undo: u, glass: await glassDec() }) }
})

await step('E3-redo-over-medical', async () => {
  await switchWar(B); await lwOpen(page, '2027-02-01')
  await bidOn(page, 'nact', '2027-02-02', 'LL')
  const u = await lwHist(page, 'undo')
  const f = await fileInput(page, { person: 'nact', type: 'ATT C', from: '2027-02-02', remarks: 'W3 E3 medical' })
  await lwOpen(page, '2027-02-01')
  const rb = page.locator('[data-testid="lw-redo"]:visible').first()
  const redoOn = !(await rb.isDisabled()), title = await rb.getAttribute('title')
  await pic('5-redo-offered-after-medical')
  let r = null
  if (redoOn) r = await lwHist(page, 'redo')
  const recs = (await recsOf(page, 'nact', ['2027-02-02']))['2027-02-02']
  const cell = await lwCell(page, 'nact', '2027-02-02')
  const t = await tapCell(page, 'nact', '2027-02-02')
  await pic('6-after-redo-taplist')
  await closeSheets(page)
  const tt = await toasts(page)
  R.ck('E3-refusal-names-the-medical', !redoOn || tt.some(x => /ATT C/.test(x) && /2 Feb/.test(x) && /can.t go over/i.test(x)), 'a Redo that would put the bid over the medical is refused BY NAME ("…ATT C now holds 2 Feb, and a bid can’t go over it" — register §12)', { toasts: tt })
  R.ck('E3-redo-over-medical', !/request/.test(recs), 'after the bid is undone and a medical filed on that day, Redo does not put the bid back over the medical (B7 at every door — undo and redo too); if it offers, it refuses by name', { undo: u.title, filed: f.added, redoOn, title, redo: r, recs, cell, tap: { open: t.open, lines: t.lines } })
})
R.note('toasts', await toasts(page))
R.note('errors', errors.slice(0, 20))
R.save()
await browser.close()
