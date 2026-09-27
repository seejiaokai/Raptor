/* W5 — the bid sheet left OPEN across a war switch (Fable S14; Astra 11). Expected: the switch closes the sheet or leaves it
   inert — no control on it can write (Matrix.tsx). Steps, as a person: open Ranger's 28 Dec 26 on the JAN–DEC 26 war → the
   bid sheet opens; scroll to the top with the sheet still open; can the Period picker be reached (what is on its pixels)?
   switch to JAN–DEC 27 with the picker; press LL on the still-open sheet TWICE (the second press is the "take the balance
   below zero" yes); then look in BOTH wars for a bid on 28 Dec 26.
   Usage (from raptor-port/, the build on 4175): node scripts/handpass/ab/w5-06b-stale-sheet-probe.mjs [desktop|phone] */
const W = process.argv[2] || 'desktop'
process.env.AB_WHO = 'w5'
const L = await import('./ab-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { lwOpen, tapCell, sheetPress, closeSheets, sheetNow, shot, toastSpy, toasts, resultBook, ROOT, rowRun, lwShot } = L
const PHONE = W === 'phone'
const R = resultBook(`W5-06b-${W}`, `${ROOT}/docs/handpass/parts/2026-09-26-absence-w5-06b-${W}.txt`)
const { browser, page, errors } = await openHi({ width: PHONE ? 390 : 1440, height: PHONE ? 844 : 900, who: 'a', dpr: PHONE ? 2 : 1 })
await toastSpy(page)
const pic = n => `w5-06b-${W}-${n}`
const P = 'bane', D = '2026-12-28'
const opts = () => page.evaluate(() => { const s = document.querySelector('[data-testid="war-picker"]'); return s ? [...s.options].map(o => ({ v: o.value, t: o.text, on: o.selected })) : [] })
await lwOpen(page, D)
const t = await tapCell(page, P, D)
await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300)
const reach = await page.evaluate(() => { const s = document.querySelector('[data-testid="war-picker"]'); if (!s) return 'no picker'; s.scrollIntoView({ block: 'center' }); const b = s.getBoundingClientRect(); const h = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return h === s || s.contains(h) ? 'the picker itself — reachable' : (h ? `covered by ${h.tagName}.${String(h.className).slice(0, 30)}[${h.getAttribute('data-testid') || ''}]` : 'off screen') })
await shot(page, pic('1-sheet-open-picker-reach'))
let clicked = 'not tried'
if (/reachable/.test(reach)) {
  /* a real click on the select, then the keyboard picks the other war — the way a person changes a <select> */
  const b = await page.locator('[data-testid="war-picker"]').boundingBox()
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(200)
  await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter'); await page.waitForTimeout(900)
  clicked = 'mouse + keyboard'
}
/* the keyboard: can Tab (or Shift+Tab) move focus out of the open sheet onto the picker behind the scrim? */
const focusWalk = []
for (const k of ['Tab', 'Shift+Tab']) {
  for (let i = 0; i < 45; i++) {
    await page.keyboard.press(k)
    const a = await page.evaluate(() => { const e = document.activeElement; return e ? (e.getAttribute('data-testid') || e.tagName) + (e.closest('.bidsheet') ? '@sheet' : '') : 'none' })
    focusWalk.push(a)
    if (a === 'war-picker') break
  }
  if (focusWalk.includes('war-picker')) break
}
const kbReach = focusWalk.includes('war-picker')
if (kbReach && clicked === 'not tried') { await page.keyboard.press('ArrowDown'); await page.waitForTimeout(900); clicked = 'keyboard: Tab to the picker behind the sheet, then ArrowDown' }
R.note('keyboard-reach', { reached: kbReach, walkedOutside: [...new Set(focusWalk.filter(x => !/@sheet/.test(x)))].slice(0, 12) })
let o = await opts()
if (!o.find(x => x.on && /27/.test(x.t))) { await page.locator('[data-testid="war-picker"]').selectOption(o.find(x => /27/.test(x.t)).v); await page.waitForTimeout(900); clicked += ' (then set by the driver)' }
o = await opts()
const s1 = await sheetNow(page)
await shot(page, pic('2-after-switch-sheet'))
let p1 = null, p2 = null
if (s1.open === 'bid-picker') { p1 = await sheetPress(page, 'bid-LL'); p2 = await sheetPress(page, 'bid-LL') }
const s2 = await sheetNow(page)
await shot(page, pic('3-after-two-presses'))
await closeSheets(page)
const inWar27 = await rowRun(page, P, [D])
await page.locator('[data-testid="war-picker"]').selectOption(o.find(x => /26/.test(x.t)).v); await page.waitForTimeout(900)
await lwOpen(page, D)
const inWar26 = await rowRun(page, P, [D])
await lwShot(page, pic('4-war26-after'), P, D)
R.note('reach', { sheet: t.open, picker: reach, how: clicked, war: o.filter(x => x.on).map(x => x.t) })
R.ck('stale-sheet-inert', !kbReach || s1.open !== 'bid-picker' || !/LL/.test(inWar26[0]),
  'after the war switch the old sheet is closed or inert: two presses on its LL write nothing into 28 Dec 26', { afterSwitch: s1.open, press1: p1 && (p1.sheet.text || '').slice(-120), press2: p2 && p2.sheet.open, after: s2.open, war27: inWar27, war26: inWar26, toasts: await toasts(page) })
R.note('errors', errors.slice(0, 20))
R.save()
await browser.close()
