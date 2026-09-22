/* [OIL-SEATS-CAN-EARN] walk — SURFACES. The picture of the phone defect: the
   count chip on a ground row of the EDIT WEEK, with the remarks box painted
   over it, beside the SAME row on the VIEW WEEK where it is reachable. */
import { open, go, board, tap, type, shot, STATE } from './lib.mjs'

const di = 5
const { browser, page, errors } = await open({ state: STATE, width: 390, height: 844 })
await board(page, di)
await tap(page, `[data-gradd="${di}"]`)
await type(page, `[data-bfld="gr:${di}.5.prog"]`, 'STORES CHECK')
await type(page, `[data-bfld="gr:${di}.5.str"]`, '08:00')
await type(page, `[data-bfld="gr:${di}.5.end"]`, '10:00')
await tap(page, `[data-fill="g:${di}.5.+"]`)
await page.waitForTimeout(200)
const p = page.locator('#sbRoster .rpuck[data-person="allavail"]:visible').first()
if (await p.count()) { await p.click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(500) }
await page.keyboard.press('Escape'); await page.waitForTimeout(250)
await page.locator('#sbClose:visible').first().click().catch(() => {}); await page.waitForTimeout(900)

const shootRow = async (sel, name) => {
  const box = await page.evaluate(s => {
    const rows = [...document.querySelectorAll(`${s} .pl-row`)]
    const r = rows.find(e => (e.innerText || '').includes('STORES CHECK'))
    if (!r) return null
    r.scrollIntoView({ block: 'center', inline: 'center' })
    const b = r.getBoundingClientRect()
    return { x: Math.max(0, b.x - 6), y: Math.max(0, b.y - 20), width: Math.min(390, b.width + 12), height: b.height + 40 }
  }, sel)
  if (!box) return console.log(' no STORES CHECK row under', sel)
  await page.waitForTimeout(200)
  await page.screenshot({ path: `${process.env.HP_SHOTS}/${name}.png`, clip: box })
  console.log(' picture:', name, JSON.stringify(box))
}
await go(page, 'editsched'); await page.waitForTimeout(900)
await shootRow(`#eWeek .day[data-day="${di}"]`, 'SURF-34-phone-editweek-chip-under-remarks')
await shot(page, 'SURF-35-phone-editweek-full')
await go(page, 'viewsched'); await page.waitForTimeout(900)
await shootRow(`#vWeek .day[data-day="${di}"]`, 'SURF-36-phone-viewweek-same-row-reachable')
await shot(page, 'SURF-37-phone-viewweek-full')

/* and what a press actually does on the edit week: where does the caret land? */
await go(page, 'editsched'); await page.waitForTimeout(900)
const hit = await page.evaluate(d => {
  const rows = [...document.querySelectorAll(`#eWeek .day[data-day="${d}"] .pl-row`)]
  const r = rows.find(e => (e.innerText || '').includes('STORES CHECK'))
  const c = r && r.querySelector('.oilcount'); if (!c) return null
  c.scrollIntoView({ block: 'center', inline: 'center' })
  const b = c.getBoundingClientRect()
  return { cx: b.x + b.width / 2, cy: b.y + b.height / 2 }
}, di)
if (hit) {
  await page.mouse.click(hit.cx, hit.cy); await page.waitForTimeout(500)
  const focus = await page.evaluate(() => {
    const a = document.activeElement
    return { tag: a ? a.tagName : null, cls: a ? String(a.className).slice(0, 40) : null,
      editable: a ? a.getAttribute('contenteditable') : null,
      inRow: a ? !!a.closest('.pl-row') : false,
      rowText: a && a.closest('.pl-row') ? (a.closest('.pl-row').innerText || '').replace(/\s+/g, ' ').slice(0, 44) : null }
  })
  console.log('\n a press on the count chip puts the cursor in:', JSON.stringify(focus))
  await shot(page, 'SURF-38-phone-press-lands-in-remarks')
}
console.log('\nerrors:', errors.slice(0, 6))
await browser.close()
