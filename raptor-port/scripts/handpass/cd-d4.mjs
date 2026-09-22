/* D4 — reload, leave the week and come back.  F26 / C24.
   Nothing the scheduler did not do should appear as a change. */
import { open, board, shot, tap, go, login } from './lib.mjs'
import { dayHead, bars, pendingPanel, warCells, history, BASE_STATE } from './cd-lib.mjs'

const di = 5, SAT = '2026-07-18'
const say = (...a) => console.log(...a)
const { browser, page, errors } = await open({ state: BASE_STATE })
await board(page, di)

/* publish it fresh in THIS session, so nothing is inherited from a saved world */
const { signAndPublish } = await import('./cd-lib.mjs')
const pub = await signAndPublish(page, di)
say('PUBLISHED:', JSON.stringify(pub.head || pub))
const barsA = (await bars(page)).filter(b => b.bar)
say('bars right after publish:', barsA.length, 'pucks wearing a strip')
const famA = await page.evaluate(() => {
  const c = [...document.querySelectorAll('#schedBoard .cntchip, #schedBoard [class*=cnt]')].filter(e => e.offsetParent)
  return c.map(e => (e.innerText || '').trim()).slice(0, 4)
})
say('FAMILY DAY count chip right after publish:', JSON.stringify(famA))
await shot(page, 'CD-D4-01-just-published')

/* --- the reload ----------------------------------------------------- */
await page.reload()
await page.waitForTimeout(1200)
if (await page.locator('#luser').count() && await page.locator('#luser').isVisible()) await login(page, 'a')
await board(page, di)
const headR = await dayHead(page, di)
say('\nHEAD after a plain browser reload:', JSON.stringify(headR))
const barsB = (await bars(page)).filter(b => b.bar)
say('bars after reload:', barsB.length)
const famB = await page.evaluate(() => {
  const c = [...document.querySelectorAll('#schedBoard .cntchip, #schedBoard [class*=cnt]')].filter(e => e.offsetParent)
  return c.map(e => (e.innerText || '').trim()).slice(0, 4)
})
say('FAMILY DAY count chip after reload:', JSON.stringify(famB))
await shot(page, 'CD-D4-02-after-reload')
const pp = await pendingPanel(page)
say('PENDING CHIP after reload:', pp.chip)
say('PANEL SAYS:', pp.text.slice(0, 900))
await shot(page, 'CD-D4-03-pending-panel')
say('HISTORY after reload:', (await history(page) || '').slice(0, 800))

/* what exactly differs?  ask the day itself, in the app's own words */
const why = await page.evaluate(i => {
  const out = {}
  try { out.dayDelta = typeof window.dayDelta === 'function' ? window.dayDelta(i) : 'not exposed' } catch (e) { out.dayDelta = 'ERR ' + e.message }
  try { out.pendKeys = Object.keys((window.SCHED.pending || {})[i] || {}).slice(0, 20) } catch (e) { out.pendKeys = 'ERR' }
  try { out.changes = JSON.stringify((window.SCHED.changes || {})[i] || null).slice(0, 400) } catch (e) { out.changes = 'ERR' }
  return out
}, di)
say('WHAT THE DAY THINKS CHANGED:', JSON.stringify(why).slice(0, 700))

/* --- leave the week and come back ------------------------------------ */
say('\nWAR before the trip:', JSON.stringify((await warCells(page, [['bane', SAT], ['razer', SAT], ['fable', SAT]]))))
await go(page, 'editsched')
await page.waitForTimeout(400)
await page.evaluate(() => window.loadWeek(new Date('2026-07-20T00:00:00')))
await page.waitForTimeout(1200)
await page.evaluate(() => window.loadWeek(new Date('2026-07-13T00:00:00')))
await page.waitForTimeout(1200)
await board(page, di)
const headT = await dayHead(page, di)
say('HEAD after leaving the week and coming back:', JSON.stringify(headT))
const barsC = (await bars(page)).filter(b => b.bar)
say('bars after the week trip:', barsC.length)
await shot(page, 'CD-D4-04-after-week-trip')
say('WAR after the trip:', JSON.stringify(await warCells(page, [['bane', SAT], ['razer', SAT], ['fable', SAT]])))

say('\nerrors:', JSON.stringify(errors.slice(0, 8)))
await browser.close()
