/* D4 part two — name the phantom change that a reload creates, and do the
   week trip through the board's own arrows. */
import { open, board, shot, tap, go, login } from './lib.mjs'
import { dayHead, bars, warCells, history, signAndPublish, BASE_STATE } from './cd-lib.mjs'

const di = 5, SAT = '2026-07-18'
const say = (...a) => console.log(...a)
const { browser, page, errors } = await open({ state: BASE_STATE })
await board(page, di)
await signAndPublish(page, di)
say('published:', JSON.stringify(await dayHead(page, di)))

/* snapshot of what the day is, before the reload */
const beforeSnap = await page.evaluate(i => JSON.stringify(window.DAYS[i]).length, di)

await page.reload(); await page.waitForTimeout(1200)
if (await page.locator('#luser').count() && await page.locator('#luser').isVisible()) await login(page, 'a')
await board(page, di)
say('after reload:', JSON.stringify(await dayHead(page, di)))
say('day size before/after:', beforeSnap, await page.evaluate(i => JSON.stringify(window.DAYS[i]).length, di))

/* the chip — find it however it is worded, then open it */
const chip = await page.evaluate(() => {
  const b = document.querySelector('#schedBoard')
  const all = [...b.querySelectorAll('*')].filter(e => e.offsetParent && /pending|change/i.test(e.innerText || '') && (e.innerText || '').length < 60)
  return all.map(e => ({ t: (e.innerText || '').replace(/\s+/g, ' ').trim(), cls: e.className.slice(0, 40), tag: e.tagName, d: Object.entries(e.dataset || {}).map(([k, v]) => k + '=' + v).join(' ') })).slice(0, 8)
})
say('CHIP CANDIDATES:', JSON.stringify(chip, null, 1))

const clicked = await page.evaluate(() => {
  const b = document.querySelector('#schedBoard')
  const c = [...b.querySelectorAll('*')].filter(e => e.offsetParent && /\d+ pending/i.test(e.innerText || '') && (e.innerText || '').length < 30).pop()
  if (!c) return null
  c.click()
  return (c.innerText || '').trim()
})
await page.waitForTimeout(900)
say('clicked chip:', clicked)
const panel = await page.evaluate(() => [...document.querySelectorAll('div,section,ul')].filter(e => e.offsetParent
  && /change|amendment|difference/i.test(e.innerText || '') && (e.innerText || '').length < 1200 && (e.innerText || '').length > 20)
  .sort((a, b) => (a.innerText || '').length - (b.innerText || '').length).slice(0, 3)
  .map(e => (e.innerText || '').replace(/\s+/g, ' ').slice(0, 500)))
say('PANEL:', JSON.stringify(panel, null, 1))
await shot(page, 'CD-D4-05-phantom-change-panel')
await page.keyboard.press('Escape'); await page.waitForTimeout(400)

/* ask the day what differs, in its own words, through the app's own reader */
const delta = await page.evaluate(i => {
  const out = {}
  const S = window.SCHED
  out.schedKeys = Object.keys(S)
  try {
    const al = (S.al || {})[i]
    out.alCount = Array.isArray(al) ? al.length : (al ? 1 : 0)
    const iss = (S.issued || {})[i] || (S.snap || {})[i] || null
    out.issuedKind = iss ? Object.keys(iss).slice(0, 12) : null
  } catch (e) { out.err = e.message }
  try { out.oil = JSON.stringify((window.DAYS[i] || {}).oil || null).slice(0, 300) } catch (e) { /* */ }
  return out
}, di)
say('SCHED SHAPE:', JSON.stringify(delta).slice(0, 700))

/* --- the week trip, through the board's own ‹ › week arrows ---------- */
await tap(page, '[data-sbweek="1"]')
await page.waitForTimeout(1500)
say('after one week forward, board says:', await page.evaluate(() => (document.querySelector('#schedBoard .sb-title') || {}).innerText || ''))
await tap(page, '[data-sbweek="-1"]')
await page.waitForTimeout(1500)
say('back again, board says:', await page.evaluate(() => (document.querySelector('#schedBoard .sb-title') || {}).innerText || ''))
say('HEAD after the week trip:', JSON.stringify(await dayHead(page, di)))
say('bars after the week trip:', (await bars(page)).filter(b => b.bar).length)
await shot(page, 'CD-D4-06-after-week-trip')
say('WAR after the trip:', JSON.stringify(await warCells(page, [['bane', SAT], ['razer', SAT], ['haowen', SAT]])))
say('errors:', JSON.stringify(errors.slice(0, 6)))
await browser.close()
