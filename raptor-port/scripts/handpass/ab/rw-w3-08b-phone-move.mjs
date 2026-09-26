/* RW-W3-08b — the phone half of rw-w3-08's move-mode road, with a REAL finger (rw-w3-08 phone FV drew its block with a
   mouse, which a touch device does not select with — so its FV proved nothing). A finger held on one day and lifted
   opens the selection sheet (W4-1); Move… puts the move banner up; then a finger on the war picker and a war picked.
   The move must not survive into the other war, and nothing may move. Pictures to rewalk/w3; results to
   docs/handpass/parts/2026-09-26-absence-rewalk-w3-08b-phone.txt. Usage: node scripts/handpass/ab/rw-w3-08b-phone-move.mjs */
process.env.AB_WHO = 'rewalk/w3'
const L = await import('./w3-lib.mjs')
const { chromium } = await import('@playwright/test')
const { existsSync, mkdirSync } = await import('node:fs')
const { lwOpen, bidOn, closeSheets, sheetNow, shot, resultBook, ROOT, recsOf, login, selPress } = L
const R = resultBook('RW-W3-08b-phone', `${ROOT}/docs/handpass/parts/2026-09-26-absence-rewalk-w3-08b-phone.txt`)
const CH = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
mkdirSync(process.env.HP_SHOTS, { recursive: true })
const browser = await chromium.launch({ headless: true, ...(existsSync(CH) ? { executablePath: CH } : {}) })
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true })
const page = await ctx.newPage()
const errors = []
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
await page.goto((process.env.HP_URL || 'http://localhost:4175') + '/')
await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
await login(page, 'a')
R.note('bundle', await page.evaluate(() => [...document.scripts].map(s => s.src).filter(s => /index-/.test(s)).join(' ')))
const cdp = await ctx.newCDPSession(page)
const pic = (n) => shot(page, `rw-w3-08b-phone-${n}`)
const warNow = async () => page.evaluate(() => { const s = document.querySelector('[data-testid="war-picker"]'); return s ? s.options[s.selectedIndex].text : '?' })
const at = async (sel) => { await page.locator(sel).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(350); return page.evaluate(s => { const b = document.querySelector(s).getBoundingClientRect(); return { x: Math.round(b.left + b.width / 2), y: Math.round(b.top + b.height / 2) } }, sel) }
const banner = async () => page.locator('[data-testid="move-banner"]:visible').allInnerTexts()

await lwOpen(page, '2026-12-14')
const b = await bidOn(page, 'razer', '2026-12-15', 'LL')
/* a finger held on Ridge's 15 Dec, then slid to 16 Dec and lifted (a finger held on ONE day and lifted is W4-1's door —
   on this rebuilt app W4's own re-walk still finds that sheet closed by the finger's trailing tap, so the block is drawn
   by a hold-and-slide, which sends no trailing tap) */
const c = await at('[data-testid="cell-razer-2026-12-15"]')
const c2 = await page.evaluate(() => { const b = document.querySelector('[data-testid="cell-razer-2026-12-16"]').getBoundingClientRect(); return { x: Math.round(b.left + b.width / 2), y: Math.round(b.top + b.height / 2) } })
await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: c.x, y: c.y, id: 7 }] })
await page.waitForTimeout(450)
for (let i = 1; i <= 8; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: Math.round(c.x + (c2.x - c.x) * i / 8), y: c.y, id: 7 }] }); await page.waitForTimeout(30) }
await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
await page.waitForTimeout(900)
const s1 = await sheetNow(page)
await pic('a-held-selection')
const m = await selPress(page, 'sel-move')
const b1 = await banner()
await pic('b-move-banner')
/* a finger on the picker, then the war picked from it */
const p = await at('[data-testid="war-picker"]')
await page.touchscreen.tap(p.x, p.y); await page.waitForTimeout(400)
const sel = page.locator('[data-testid="war-picker"]:visible').first()
const v = await sel.locator('option').evaluateAll(os => (os.find(o => o.text === 'JAN - DEC 27') || {}).value)
await sel.selectOption(v); await page.waitForTimeout(1300)
const w = await warNow(), b2 = await banner()
await pic('c-after-switch')
/* a finger on a 27 day, as a landing would be */
await lwOpen(page, '2027-01-18')
const c27 = await at('[data-testid="cell-razer-2027-01-19"]')
await page.touchscreen.tap(c27.x, c27.y); await page.waitForTimeout(900)
const s27 = await sheetNow(page), b27 = await banner()
await pic('d-tap-in-27')
await closeSheets(page)
const sel2 = page.locator('[data-testid="war-picker"]:visible').first()
const v2 = await sel2.locator('option').evaluateAll(os => (os.find(o => o.text === 'JAN - DEC 26') || {}).value)
await sel2.selectOption(v2); await page.waitForTimeout(1300)
await lwOpen(page, '2026-12-14')
const b3 = await banner()
const r = await recsOf(page, 'razer', ['2026-12-15', '2027-01-19'])
R.note('FV', { placed: b.placed, held: s1.open, heldText: (s1.text || '').slice(0, 120), movePressed: m.pressed, banners: [b1, b2, b27, b3], warAfter: w, tapIn27: s27.open, recs: r })
R.ck('FV-held-selection-and-banner', s1.open === 'select-sheet' && b1.length > 0, 'a finger held and slid across two days opens the selection sheet and Move… puts the move banner up (the premise)', { held: s1.open, banner: b1 })
R.ck('FV-move-ends-on-switch', w === 'JAN - DEC 27' && b2.length === 0 && b27.length === 0 && b3.length === 0 && /request:LL/.test(r['2026-12-15']) && r['2027-01-19'] === '-', 'a war picked by finger while the move banner is up ends the move: no banner in 27, a tap there moves nothing, back in 26 no banner and the bid still on 15 Dec', { war: w, banners: [b2, b27, b3], recs: r, tapIn27: s27.open })
/* and the selection SHEET itself (no Move pressed) open across a finger's war switch — rw-w3-05 phone's E1-selection drew
   its block with a mouse, which a touch device does not select with, so it opened nothing */
await lwOpen(page, '2026-12-14')
const d1 = await at('[data-testid="cell-razer-2026-12-17"]')
const d2 = await page.evaluate(() => { const b = document.querySelector('[data-testid="cell-razer-2026-12-18"]').getBoundingClientRect(); return { x: Math.round(b.left + b.width / 2), y: Math.round(b.top + b.height / 2) } })
await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: d1.x, y: d1.y, id: 8 }] })
await page.waitForTimeout(450)
for (let i = 1; i <= 8; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: Math.round(d1.x + (d2.x - d1.x) * i / 8), y: d1.y, id: 8 }] }); await page.waitForTimeout(30) }
await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
await page.waitForTimeout(900)
const e0 = await sheetNow(page)
await pic('e-selection-sheet')
const pk = await at('[data-testid="war-picker"]')
await page.touchscreen.tap(pk.x, pk.y); await page.waitForTimeout(400)
const e1 = await sheetNow(page)
const selx = page.locator('[data-testid="war-picker"]:visible').first()
const vx = await selx.locator('option').evaluateAll(os => (os.find(o => o.text === 'JAN - DEC 27') || {}).value)
await selx.selectOption(vx); await page.waitForTimeout(1300)
const e2 = await sheetNow(page), we = await warNow()
await pic('f-selection-after-switch')
const r27 = await page.evaluate(() => { try { const w = JSON.parse(localStorage.getItem('raptor:leavewar/wars') || '[]'); const x = (Array.isArray(w) ? w : Object.values(w)).find(v => v && v.period && /27/.test(v.period.name)); return JSON.stringify(((x || {}).recs || {}).razer || {}) } catch { return '?' } })
R.ck('E1-selection-finger', e0.open === 'select-sheet' && e2.open === 'nothing' && we === 'JAN - DEC 27' && !/request/.test(r27), 'the selection sheet drawn by a finger is gone after a finger’s war switch (the finger on the picker closes it first); nothing written into 27', { drawn: e0.open, afterFingerOnPicker: e1.open, afterSwitch: e2.open, war: we, razer27: r27 })
R.note('errors', errors.slice(0, 20))
R.save()
await browser.close()
