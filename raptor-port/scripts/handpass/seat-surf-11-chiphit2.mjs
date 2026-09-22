/* [OIL-SEATS-CAN-EARN] walk — SURFACES. Chip reachability, ONE CHIP AT A TIME:
   scroll it into view, measure what is on its pixels, and press it, all in the
   same breath, so nothing moves in between. */
import { open, go, board, tap, type, shot, STATE } from './lib.mjs'

const di = 5
async function run(width, height, tag) {
  const { browser, page, errors } = await open({ state: STATE, width, height })
  await board(page, di)
  await tap(page, `[data-gradd="${di}"]`)
  await type(page, `[data-bfld="gr:${di}.5.prog"]`, 'STORES CHECK')
  await type(page, `[data-bfld="gr:${di}.5.str"]`, '08:00')
  await type(page, `[data-bfld="gr:${di}.5.end"]`, '10:00')
  await tap(page, `[data-fill="g:${di}.5.+"]`)
  await page.waitForTimeout(200)
  const p = page.locator(`#sbRoster .rpuck[data-person="allavail"]:visible`).first()
  if (await p.count()) { await p.click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(500) }
  await page.keyboard.press('Escape'); await page.waitForTimeout(250)

  const probe = async (scope, label) => {
    const n = await page.evaluate(s => document.querySelectorAll(`${s} .oilcount`).length, scope)
    console.log(`\n  --- ${label} ---   ${n} chip(s)`)
    for (let i = 0; i < n; i++) {
      const m = await page.evaluate(([s, ix]) => {
        const c = document.querySelectorAll(`${s} .oilcount`)[ix]; if (!c) return null
        c.scrollIntoView({ block: 'center', inline: 'center' })
        const b = c.getBoundingClientRect(), cx = b.x + b.width / 2, cy = b.y + b.height / 2
        const top = document.elementFromPoint(cx, cy)
        return { txt: (c.innerText || '').trim(), w: Math.round(b.width), h: Math.round(b.height), cx, cy,
          onTop: !!(top && (top === c || c.contains(top))),
          stack: document.elementsFromPoint(cx, cy).slice(0, 4)
            .map(e => (e.tagName + '.' + String(e.className).trim().replace(/\s+/g, '.')).slice(0, 40)),
          inView: cx >= 0 && cy >= 0 && cx <= innerWidth && cy <= innerHeight }
      }, [scope, i])
      if (!m) { console.log(`   chip ${i}: gone`); continue }
      await page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) { t.textContent = ''; t.style.opacity = '0' } })
      await page.waitForTimeout(80)
      if (m.inView) await page.mouse.click(m.cx, m.cy)
      await page.waitForTimeout(650)
      const said = await page.evaluate(() => { const t = document.getElementById('toastEl')
        return t && t.style.opacity === '1' ? (t.textContent || '').trim().slice(0, 70) : null })
      console.log(`   "${m.txt}" ${m.w}x${m.h}px  onTop=${m.onTop ? 'YES' : 'NO'}  inView=${m.inView}`)
      console.log(`     pixels front->back: ${m.stack.join(' > ')}`)
      console.log(`     press -> ${said ? '"' + said + '…"' : 'NOTHING HAPPENED'}`)
      await page.keyboard.press('Escape'); await page.waitForTimeout(200)
    }
  }
  console.log(`\n================= ${tag} (${width}x${height}) =================`)
  await probe('#schedBoard', 'THE BOARD')
  await page.locator('#sbClose:visible').first().click().catch(() => {}); await page.waitForTimeout(900)
  await go(page, 'editsched'); await page.waitForTimeout(900)
  await probe(`#eWeek .day[data-day="${di}"]`, 'THE EDIT WEEK')
  await shot(page, `SURF-19-${tag}-editweek-chips`)
  await go(page, 'viewsched'); await page.waitForTimeout(900)
  await probe(`#vWeek .day[data-day="${di}"]`, 'THE VIEW WEEK')
  await shot(page, `SURF-20-${tag}-viewweek-chips`)
  console.log('  errors:', errors.slice(0, 5))
  await browser.close()
}
await run(1440, 900, 'desktop')
await run(390, 844, 'phone')
