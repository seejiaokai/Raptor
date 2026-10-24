// Re-walk item 6: a pending bid on a day held for him: type a remark and press the cross (or Escape) WITHOUT leaving the box; reopen: the remark is kept.
// usage: node lw-m3-rewalk-r6.mjs <phone|desktop> [chromium|webkit]
import * as L from './lw-m3-rewalk-lib.mjs'
const size = process.argv[2] || 'phone', engine = process.argv[3] || 'chromium'
const tag = `r6-${size === 'phone' ? 'ph' : 'dk'}-${engine === 'webkit' ? 'wk' : 'cr'}`
console.log('lw-m3-rewalk-r6 v1', size, engine, tag)
L.clearPrefix(tag)
const w = await L.newCtx(size, engine)
const P = w.page
await L.signInPlain(w, 'member', '2026-02-15')
const ISO = '2026-02-24'
await L.openCellR(w, 'bane', ISO)
console.log('placed pending bid', await L.placeLeave(w, 'LL'))
await L.reachCell(w, 'bane', ISO)
console.log('cell', JSON.stringify((await L.boxes(w, 'bane', ISO))?.text))
const rmk = () => P.evaluate(() => document.querySelector('[data-testid="bid-remarks"]')?.value ?? null)
const focusIn = () => P.evaluate(() => document.activeElement?.dataset?.testid || document.activeElement?.tagName)
async function round(label, how, text) {
  await L.openCellR(w, 'bane', ISO)
  await P.waitForSelector(L.T('bid-remarks'), { timeout: 4000 })
  const was = await rmk()
  const win = (await L.winGeom(P)).text.slice(0, 120)
  // type without leaving: click into the box then type; on a phone a finger tap into it opens the keyboard
  if (w.phone) { await L.press(w, L.T('bid-remarks')) } else await P.locator(L.T('bid-remarks')).click()
  await P.keyboard.press('Control+A'); await P.keyboard.type(text, { delay: 15 })
  const typed = await rmk(), f = await focusIn()
  await L.shot(w, `${tag}-${label}-1-typed`)
  if (how === 'cross') {
    // press the cross; focus still in the box when the press arrives
    if (w.phone) await L.press(w, L.T('bid-cancel'), `${tag}-${label}-2-cross-q`); else await L.press(w, L.T('bid-cancel'))
  } else await P.keyboard.press('Escape')
  await P.waitForTimeout(500)
  const closed = !(await L.vis(P, L.T('bid-picker')))
  await L.shot(w, `${tag}-${label}-3-closed`)
  await L.openCellR(w, 'bane', ISO)
  await P.waitForSelector(L.T('bid-remarks'), { timeout: 4000 })
  const kept = await rmk()
  await L.shot(w, `${tag}-${label}-4-reopened`)
  const ok = closed && kept === text
  console.log(`${label}: window before "${win}"; box before "${was}"; typed "${typed}" focus ${f}; closed ${closed}; reopened box reads "${kept}"`)
  L.rec(`6 ${size}/${engine} remark kept after ${how}`, size, ok ? 'PASS' : 'FAIL', `typed "${text}" (box read "${typed}", focus on ${f}); window closed ${closed}; reopened box reads "${kept}"`, (how === 'cross' && w.phone ? [`${tag}-${label}-2-cross-q`] : []).concat([`${tag}-${label}-1-typed`, `${tag}-${label}-3-closed`, `${tag}-${label}-4-reopened`]))
  await L.closeWinIfOpen(w)
  return kept
}
await round('a-cross', 'cross', 'cross remark')
await round('b-escape', 'escape', 'escape remark')
// the stored value is also kept after a second round (text replaced)
console.log('ERRORS', JSON.stringify(w.errs))
await L.closeBrowser()
