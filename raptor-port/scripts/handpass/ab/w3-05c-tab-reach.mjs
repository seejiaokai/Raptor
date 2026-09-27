/* W3-05c — can a KEYBOARD reach the war picker while a sheet is open (desktop)? Open a bid sheet, then press Tab /
   Shift+Tab as a person would and record every stop until the picker has the focus. Then change the war with an
   arrow key — the path W3-05b's desktop run took with a direct focus. Read + one war switch only. */
process.env.AB_WHO = 'w3'
const L = await import('./w3-lib.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { lwOpen, bidOn, tapCell, sheetNow, shot, resultBook, ROOT } = L
const R = resultBook('W3-05c', `${ROOT}/docs/handpass/parts/2026-09-26-absence-w3-05c.txt`)
const { browser, page, errors } = await openHi({ width: 1440, height: 900, who: 'a', dpr: 1 })
await lwOpen(page, '2026-12-14')
await bidOn(page, 'razer', '2026-12-15', 'LL')
const s = await tapCell(page, 'razer', '2026-12-15')
const stops = []
let reached = false, key = 'Shift+Tab'
for (const k of ['Shift+Tab', 'Tab']) {
  for (let i = 0; i < 80; i++) {
    await page.keyboard.press(k)
    const a = await page.evaluate(() => { const e = document.activeElement; return e ? (e.getAttribute('data-testid') || e.tagName + '.' + String(e.className).slice(0, 20)) : 'none' })
    stops.push(`${k}:${a}`)
    if (a === 'war-picker') { reached = true; key = k; break }
  }
  if (reached) break
}
const open = await sheetNow(page)
R.note('tab-stops', { count: stops.length, first: stops.slice(0, 12), last: stops.slice(-4) })
R.ck('keyboard-reaches-picker', reached && open.open === 'bid-picker', 'the war picker can be reached by the keyboard while a sheet is open (so a war switch with a sheet up is a real door on a desktop)', { reached, via: key, presses: stops.length, sheetStillOpen: open.open })
if (reached) { await page.keyboard.press('ArrowDown'); await page.waitForTimeout(1200) }
const after = await sheetNow(page)
await shot(page, 'w3-05c-after-keyboard-switch')
R.note('after-switch', { war: await page.evaluate(() => { const x = document.querySelector('[data-testid="war-picker"]'); return x.options[x.selectedIndex].text }), sheet: after.open, text: (after.text || '').slice(0, 120) })
R.note('errors', errors.slice(0, 10))
R.save()
await browser.close()
