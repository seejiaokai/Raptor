/* the same row at DESKTOP width, for the contrast picture */
import { open, go, board, tap, type, shot, STATE } from './lib.mjs'
const di = 5
const { browser, page, errors } = await open({ state: STATE })
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
await go(page, 'editsched'); await page.waitForTimeout(900)
const box = await page.evaluate(d => {
  const rows = [...document.querySelectorAll(`#eWeek .day[data-day="${d}"] .pl-row`)]
  const r = rows.find(e => (e.innerText || '').includes('STORES CHECK')); if (!r) return null
  r.scrollIntoView({ block: 'center', inline: 'center' })
  const b = r.getBoundingClientRect()
  return { x: Math.max(0, b.x - 8), y: Math.max(0, b.y - 24), width: b.width + 16, height: b.height + 44 }
}, di)
if (box) { await page.waitForTimeout(200); await page.screenshot({ path: `${process.env.HP_SHOTS}/SURF-39-desktop-editweek-same-row.png`, clip: box }); console.log('picture taken') }
await shot(page, 'SURF-40-desktop-editweek-full')
console.log('errors:', errors.slice(0, 5))
await browser.close()
