/* MOCK for his question on the look card's no-end-time row (29 Sep 26): the ALL AVAIL count on a row with a start and no
   end, AS BUILT (a plain number) beside OPTION 2 (a "~" before it, the same words on hover). The mark is painted onto the
   real page for the picture only — nothing here changes the app. Pictures at 2x. Usage: node mock-assumed-mark.mjs */
process.env.HP_URL ||= 'http://localhost:4174'
process.env.HP_SHOTS ||= process.env.MOCK_OUT
const L = await import('./sf-lib.mjs')
const { openHi, editWeek, board, closeBoard, SF_STATE, DESK, PHONE } = L
const DI = 5, OUT = process.env.HP_SHOTS
const rowKeys = page => page.evaluate(di => {
  const prog = [...document.querySelectorAll(`#eWeek [data-txt^="ap:${di}."][data-txt$=".prog"]`)].find(e => /FAMILY DAY/.test(e.textContent || ''))
  if (!prog) return null
  const base = prog.getAttribute('data-txt').replace(/\.prog$/, '')
  return { str: base + '.str', end: base + '.end' }
}, DI)
async function clearBox(page, key) {
  const el = page.locator(`#eWeek [data-txt="${key}"]:visible`).first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await el.click()
  await page.keyboard.press('Control+A'); await page.keyboard.press('Backspace')
  await el.evaluate(e => e.blur()); await page.waitForTimeout(700)
}
/* the FAMILY DAY row's box on screen, padded — the picture's frame */
const rowBox = (page, scope) => page.evaluate(({ scope, di }) => {
  const c = [...document.querySelectorAll(`${scope} .oilcount[data-oilday="${di}"]`)].find(e => e.offsetWidth && /FAMILY DAY/.test((e.closest('.ah-row, .sb-arow, .pl-row') || {}).textContent || ''))
  if (!c) return null
  c.scrollIntoView({ block: 'center' })
  const row = c.closest('.ah-row, .sb-arow, .pl-row') || c.parentElement
  const r = row.getBoundingClientRect(), cr = c.getBoundingClientRect()
  return { x: Math.max(0, r.left - 8), y: Math.max(0, Math.min(r.top, cr.top) - 30), w: Math.min(innerWidth - Math.max(0, r.left - 8), r.width + 16), h: Math.max(r.height, cr.height) + 60, text: c.textContent.trim() }
}, { scope, di: DI })
/* option 2, painted on: "~" before the count, a dashed edge, and the words as its hover title */
const paint = (page, scope) => page.evaluate(({ scope, di }) => {
  document.querySelectorAll(`${scope} .oilcount[data-oilday="${di}"]`).forEach(c => {
    if (!/FAMILY DAY/.test((c.closest('.ah-row, .sb-arow, .pl-row') || {}).textContent || '')) return
    if (!c.textContent.startsWith('~')) c.textContent = '~' + c.textContent.trim()
    c.style.borderStyle = 'dashed'
    c.title = 'No end time — counted over an assumed hour (10:00–11:00)'
  })
}, { scope, di: DI })
async function pair(page, scope, name) {
  const b = await rowBox(page, scope); if (!b) { console.log('NO CHIP', name); return }
  await page.waitForTimeout(300)
  const clip = { x: b.x, y: b.y, width: Math.min(b.w, 640), height: b.h }
  await page.screenshot({ path: `${OUT}/${name}-1-as-built.png`, clip })
  await paint(page, scope); await page.waitForTimeout(150)
  await page.screenshot({ path: `${OUT}/${name}-2-with-mark.png`, clip })
  console.log(name, b.text, JSON.stringify(clip))
}
const { browser, page } = await openHi({ ...DESK, state: SF_STATE, dpr: 2 })
await editWeek(page)
const keys = await rowKeys(page)
await clearBox(page, keys.end)
await pair(page, '#eWeek', 'week-desktop')
await board(page, DI); await page.waitForTimeout(500)
await pair(page, '#schedBoard', 'board-desktop')
/* what a tap on the count shows today — the window's head, close up */
await page.locator('#schedBoard .oilcount[data-oilday="5"]:visible').first().click(); await page.waitForTimeout(700)
const wb = await page.evaluate(() => { const w = [...document.querySelectorAll('.availwin')].find(x => !x.hidden && x.offsetWidth); if (!w) return null; const r = w.getBoundingClientRect(); return { x: r.left, y: r.top, width: r.width, height: Math.min(r.height, 150) } })
if (wb) await page.screenshot({ path: `${OUT}/window-desktop-head.png`, clip: wb })
console.log('window', JSON.stringify(wb))
await page.locator('.availwin:not([hidden]) .win-x').first().click({ timeout: 1500 }).catch(() => {})
await closeBoard(page)
await page.setViewportSize(PHONE); await page.waitForTimeout(800)
await board(page, DI); await page.waitForTimeout(500)
await pair(page, '#schedBoard', 'board-phone')
await browser.close()
