/* [OIL-SEATS-CAN-EARN] walk — SURFACES. Is the count chip ACTUALLY TAPPABLE on
   each surface, at each width? Measured, not assumed: what sits on the chip's
   own pixels, and does a real press produce the app's message. */
import { open, go, board, tap, type, shot, STATE } from './lib.mjs'

const di = 5
async function run(width, height, tag) {
  const { browser, page, errors } = await open({ state: STATE, width, height })
  await board(page, di)
  await tap(page, `[data-gradd="${di}"]`)
  await type(page, `[data-bfld="gr:${di}.5.prog"]`, 'STORES CHECK')
  await type(page, `[data-bfld="gr:${di}.5.str"]`, '08:00')
  await type(page, `[data-bfld="gr:${di}.5.end"]`, '10:00')
  /* one placeholder on the new ground row, placed on the BOARD so the week and
     the board are showing the SAME seat */
  await tap(page, `[data-fill="g:${di}.5.+"]`)
  await page.waitForTimeout(200)
  const p = page.locator(`#sbRoster .rpuck[data-person="allavail"]:visible`).first()
  if (await p.count()) { await p.click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(500) }
  await page.keyboard.press('Escape'); await page.waitForTimeout(250)

  const probe = async (scope, label) => {
    const r = await page.evaluate(([sel]) => {
      const chips = [...document.querySelectorAll(`${sel} .oilcount`)].filter(e => e.getBoundingClientRect().width > 0)
      return chips.map(c => {
        c.scrollIntoView({ block: 'center', inline: 'center' })
        const b = c.getBoundingClientRect()
        const cx = b.x + b.width / 2, cy = b.y + b.height / 2
        const top = document.elementFromPoint(cx, cy)
        const stack = document.elementsFromPoint(cx, cy).slice(0, 4)
          .map(e => (e.tagName + '.' + String(e.className).trim().replace(/\s+/g, '.')).slice(0, 44))
        const cs = getComputedStyle(c)
        return { txt: (c.innerText || '').trim(), w: Math.round(b.width), h: Math.round(b.height),
          x: cx, y: cy, z: cs.zIndex, pos: cs.position, pe: cs.pointerEvents,
          topIsChip: !!(top && (top === c || c.contains(top))), stack }
      })
    }, [scope])
    console.log(`\n  --- ${label} ---   ${r.length} chip(s)`)
    for (const c of r) {
      console.log(`   "${c.txt}"  ${c.w}x${c.h}px  z=${c.z} pos=${c.pos} pointer-events=${c.pe}`)
      console.log(`     what is on those pixels, front to back: ${c.stack.join('  >  ')}`)
      console.log(`     the chip itself is on top: ${c.topIsChip ? 'YES' : 'NO — something else takes the press'}`)
      await page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) { t.textContent = ''; t.style.opacity = '0' } })
      await page.mouse.click(c.x, c.y); await page.waitForTimeout(650)
      const said = await page.evaluate(() => { const t = document.getElementById('toastEl')
        return t && t.style.opacity === '1' ? (t.textContent || '').trim().slice(0, 90) : null })
      console.log(`     a real press there -> ${said ? '"' + said + '…"' : 'NOTHING HAPPENED'}`)
      await page.keyboard.press('Escape'); await page.waitForTimeout(200)
    }
    return r
  }
  console.log(`\n===================== ${tag} (${width}x${height}) =====================`)
  await probe('#schedBoard', 'THE BOARD')
  await shot(page, `SURF-16-${tag}-board-chip`)
  await page.locator('#sbClose:visible').first().click().catch(() => {})
  await page.waitForTimeout(900)
  await go(page, 'editsched'); await page.waitForTimeout(900)
  await probe(`#eWeek .day[data-day="${di}"]`, 'THE EDIT WEEK')
  await shot(page, `SURF-17-${tag}-editweek-chip`)
  await go(page, 'viewsched'); await page.waitForTimeout(900)
  await probe(`#vWeek .day[data-day="${di}"]`, 'THE VIEW WEEK')
  await shot(page, `SURF-18-${tag}-viewweek-chip`)
  console.log('  errors:', errors.slice(0, 5))
  await browser.close()
}
await run(1440, 900, 'desktop')
await run(390, 844, 'phone')
