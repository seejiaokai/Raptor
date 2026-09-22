/* A4 — a placeholder dropped somewhere it cannot expand: a duty desk that HAS
   times, a sim seat, and a cockpit seat. Does anything say it pays nobody? */
import { open, board, publish, oilMode, shot, put, readDay, lwCell, STATE } from './lib.mjs'
const di = 5
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)
const R = {}

R.onSdoDesk = await put(page, `[data-fill="d:${di}.0.0.+"]`, ['allavail'])   // SDO 08:00-18:00, Fable already on it
R.onSimSeat = await put(page, `[data-slot="s:${di}.oft.0.w"]`, ["allavail"])   // the sim back seat
R.onCockpit = await put(page, `[data-slot="${di}.0.1.0.w"]`, ['allavail'])   // COBRA back seat, replacing Grit

R.outsideMode = await page.evaluate(() => [...document.querySelectorAll('#schedBoard .puck[data-person="allavail"]')]
  .filter(e => !e.closest('#sbRoster') && !e.closest('#eRoster'))
  .map(e => {
    const row = e.closest('.sb-arow, .sb-line')
    return { where: row ? (row.innerText || '').replace(/\s+/g, ' ').slice(0, 42) : '?',
      cls: e.className, title: e.getAttribute('title'),
      chip: row ? ([...row.querySelectorAll('.cntchip, [class*=cnt]')].map(c => c.innerText.trim())[0] || null) : null }
  }))
await shot(page, 'A4-placeholders-planted')

await oilMode(page, true)
R.inMode = await page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-person="allavail"]')]
  .filter(e => !e.closest('#sbRoster') && !e.closest('#eRoster'))
  .map(e => ({ cls: e.className, title: e.getAttribute('title'),
    tappable: !!e.closest('[data-oilp]'),
    where: (e.closest('.sb-arow, .sb-line') || {}).innerText?.replace(/\s+/g, ' ').slice(0, 42) })))
await shot(page, 'A4-placeholders-in-mode')
await oilMode(page, false)

R.pub = await publish(page, di); await page.waitForTimeout(800)
R.money = await lwCell(page, ['plasma', 'razer', 'sufa', 'snap', 'ammo'], '2026-07-18')
R.errors = errors.slice(0, 8)
console.log(JSON.stringify(R, null, 1))
await browser.close()
