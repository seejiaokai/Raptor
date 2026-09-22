/* WORDING 11 AT PHONE WIDTH — the ALL AVAIL count on the board's Common
   Programme. Checked on the desktop when it was fixed; never at 390px, which
   the standing order requires and which the owner then asked about. */
import { open, board, shot, SHOTS } from './lib.mjs'
const STATE = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json'
for (const w of [1440, 390]) {
  const { browser, page, errors } = await open({ state: STATE, width: w, height: 844 })
  await board(page, 5)
  const r = await page.evaluate((W) => {
    const rows = [...document.querySelectorAll('#schedBoard .sb-arow, #schedBoard .sb-line')]
      .filter(e => e.offsetParent).filter(r => /ALL AVAIL/i.test(r.textContent || ''))
    return rows.map(r => {
      const chip = r.querySelector('.oilcount')
      const rc = chip && chip.getBoundingClientRect()
      const cell = chip && chip.closest('.ppl')
      const cc = cell && cell.getBoundingClientRect()
      return {
        row: (r.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 56),
        chipInDom: !!chip,
        chipText: chip ? (chip.textContent || '').trim() : null,
        visible: !!(chip && chip.offsetParent),
        box: rc ? { w: Math.round(rc.width), h: Math.round(rc.height) } : null,
        insideItsCell: !!(rc && cc && rc.right <= cc.right + 1),
        clippedByCell: !!(cell && cell.scrollWidth > cell.clientWidth + 1),
        offScreen: !!(rc && (rc.right > W || rc.left < 0)),
      }
    })
  }, w)
  console.log(w + 'px: ' + JSON.stringify(r, null, 1))
  console.log('  errors:', errors.slice(0, 3))
  await shot(page, 'w11-phone-' + w)
  await browser.close()
}
console.log('shots in ' + SHOTS)
