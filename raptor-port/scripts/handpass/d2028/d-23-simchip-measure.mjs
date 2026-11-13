/* d-23-simchip-measure v2 — [SIM-COUNT-OVER-SEAT]: an OFT sim row with ALL AVAIL in the FRONT seat, the rear empty.
   Measures the count, both seats and the row's box, says what stands at the count's centre, presses it, and pictures
   the whole board and the row. usage (from raptor-port/): node scripts/handpass/d2028/d-23-simchip-measure.mjs pc|phone <folder-tag> */
const KIND = process.argv[2] || 'pc', TAG = process.argv[3] || 'before'
process.env.HP_URL ||= 'http://localhost:4174'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-11-13-rules-check-small-batch/simcount/' + TAG + '-' + KIND
console.log('d-23 v2', KIND, TAG)
const D = await import('./d-lib.mjs')
const { X, L, sleep, j, FRI } = D
const w = await D.world(KIND)
const { page } = w
await L.board(page, FRI)
const n0 = await page.evaluate(i => window.DAYS[i].sims.oft.length, FRI)
await X.press(w, `[data-sradd="${FRI}.oft"]`)
await page.waitForFunction(([i, n]) => window.DAYS[i].sims.oft.length === n + 1, [FRI, n0]); await sleep(300)
await X.typeIn(w, `[data-bfld="sr:${FRI}.oft.${n0}.label"]`, 'OFT Brief')
await X.typeIn(w, `[data-bfld="sr:${FRI}.oft.${n0}.str"]`, '0900')
console.log('drop', await D.drop(w, `s:${FRI}.oft.${n0}.p`, 'allavail'))
await sleep(500)

const measure = () => page.evaluate(() => {
  const vis = e => e && e.offsetWidth > 0
  const chip = [...document.querySelectorAll('#schedBoard .oilcount')].find(vis)
  if (!chip) return { chip: null }
  const r = e => { const b = e.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)] }
  const seat = chip.closest('.seat'), par = seat.parentElement, cs = getComputedStyle(par)
  const b = chip.getBoundingClientRect(), at = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2)
  const kids = [...par.children].map(k => ({ cls: k.className, slot: k.getAttribute('data-slot'), box: r(k), ov: getComputedStyle(k).overflow, w: getComputedStyle(k).width }))
  return { chip: r(chip), seat: r(seat), seatCss: { display: getComputedStyle(seat).display, width: getComputedStyle(seat).width, overflow: getComputedStyle(seat).overflow },
    parent: { cls: par.className, tag: par.tagName, display: cs.display, cols: cs.gridTemplateColumns, gap: cs.gap, box: r(par) }, kids,
    at: at && (at.className + ' | slot ' + at.getAttribute('data-slot')), atIsChip: at === chip,
    grand: { cls: par.parentElement.className, box: r(par.parentElement), kids: [...par.parentElement.children].map(k => [k.className.slice(0, 24), ...r(k)]) } }
})
const m = await measure(); console.log('MEASURE', j(m))
await D.shot(page, 'm-0-whole')
if (m.chip) {
  await page.mouse.click(m.chip[0] + m.chip[2] / 2, m.chip[1] + m.chip[3] / 2); await sleep(900)
  console.log('after press: window up', await page.evaluate(() => !![...document.querySelectorAll('.win-bar')].find(e => e.offsetWidth)), '· armed', await page.evaluate(() => window.ARM && window.ARM.key))
  await D.shot(page, 'm-1-after-press')
}
await w.browser.close()
