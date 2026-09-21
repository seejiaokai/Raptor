/* A8 (Fable S8 reverse direction, Codex 12) — a public holiday TAKEN OFF a day
   after it was published.  Wednesday 15 Jul. */
import { open, board, tap, type, put, shot, publish, go, warnings, readDay, oilMode } from './lib.mjs'
import { writeFileSync } from 'node:fs'

const di = 2, DATE = '2026-07-15'
const STATE = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json'
const { browser, page, errors } = await open({ state: STATE })
const R = {}

const setEvent = async (text) => {
  await go(page, 'leavewar')
  await page.waitForTimeout(1200)
  const cell = page.locator(`[data-testid="event-0-${DATE}"]`)
  await cell.scrollIntoViewIfNeeded().catch(() => {})
  await cell.click()
  await page.waitForTimeout(500)
  await page.locator('[data-testid="event-text"]').fill(text)
  await page.locator('[data-testid="event-apply"]').click()
  await page.waitForTimeout(800)
  return (await page.locator(`[data-testid="event-0-${DATE}"]`).innerText()).trim()
}
const lwCell = async (pid) => {
  await go(page, 'leavewar')
  await page.waitForTimeout(1100)
  const c = page.locator(`[data-testid="cell-${pid}-${DATE}"]`)
  if (!await c.count()) return { found: false }
  await c.scrollIntoViewIfNeeded().catch(() => {})
  return { found: true, text: (await c.innerText()).replace(/\s+/g, ' ').trim(), cls: await c.getAttribute('class') }
}
const dayLook = async () => {
  await go(page, 'editsched')
  await board(page, di)
  const d = await readDay(page, di)
  const w = await warnings(page)
  const st = await page.evaluate(() => {
    const root = document.querySelector('#schedBoard')
    const vis = e => !!(e && (e.offsetParent || e.getClientRects().length))
    const leaves = []
    for (const e of root.querySelectorAll('*')) { if (e.children.length || !vis(e)) continue
      const t = (e.innerText || '').replace(/\s+/g, ' ').trim(); if (t && t.length < 70 && /pending|change|AL\d|ORIG|Publish/i.test(t)) leaves.push(t) }
    return {
      oilEarnOffered: [...root.querySelectorAll('[data-oilmode], #sbOil')].filter(vis).map(e => e.innerText.trim()),
      pendingWords: [...new Set(leaves)],
      bars: [...root.querySelectorAll('.puck[data-person]')].filter(e => vis(e) && !e.closest('#sbRoster'))
        .filter(e => /oilbar-(fo|ho)/.test(e.className))
        .map(e => ({ who: (window.PEOPLE[e.dataset.person] || {}).cs, kind: e.className.match(/oilbar-(fo|ho)/)[1], title: (e.getAttribute('title') || '').slice(0, 80) })),
    }
  })
  return { warn: w, ...st, duties: d.duties }
}

/* 1. declare the holiday */
R.phSet = await setEvent('PH')
await shot(page, 'G-A8-01-ph-declared')

/* 2. a man on a duty desk 08:00-16:00 on Wednesday */
await go(page, 'editsched')
await board(page, di)
R.oilOfferedBeforeWork = (await dayLook()).oilEarnOffered
await tap(page, `[data-dradd="${di}.0"]`)
await page.waitForTimeout(400)
const ri = await page.evaluate(i => window.DAYS[i].dutywaves[0].rows.length - 1, di)
await type(page, `[data-bfld="dr:${di}.0.${ri}.role"]`, 'PH DUTY')
await type(page, `[data-bfld="dr:${di}.0.${ri}.str"]`, '08:00')
await type(page, `[data-bfld="dr:${di}.0.${ri}.end"]`, '16:00')
const free = await page.evaluate(() => [...document.querySelectorAll('#sbRoster .rpuck[data-person]')]
  .map(e => e.dataset.person).filter(p => window.PEOPLE[p] && !/^all/i.test(p)).slice(0, 30))
R.man = await put(page, `[data-fill="d:${di}.0.${ri}.+"]`, free)
const PID = R.man
R.manCs = await page.evaluate(p => (window.PEOPLE[p] || {}).cs, PID)
await shot(page, 'G-A8-02-wed-desk-built')

/* 3. publish Wednesday */
R.pub = await publish(page, di)
await page.waitForTimeout(700)
R.afterPublish = await dayLook()
await shot(page, 'G-A8-03-wed-published')
R.creditAfterPublish = await lwCell(PID)
await shot(page, 'G-A8-04-leavewar-credit')

/* 4. clear the holiday */
R.phCleared = await setEvent('')
await shot(page, 'G-A8-05-ph-cleared')

/* 5. what the day says now */
R.afterClear = await dayLook()
await shot(page, 'G-A8-06-wed-after-ph-cleared')
R.creditAfterClear = await lwCell(PID)
await shot(page, 'G-A8-07-credit-after-ph-cleared')

/* 6. sign and publish AL1 */
await go(page, 'editsched'); await board(page, di)
R.pub2 = await publish(page, di)
await page.waitForTimeout(800)
R.afterAL1 = await dayLook()
await shot(page, 'G-A8-08-wed-after-al1')
R.creditAfterAL1 = await lwCell(PID)
await shot(page, 'G-A8-09-credit-after-al1')

/* 7. the history */
await go(page, 'editsched'); await board(page, di)
await page.locator('#sbHist').click().catch(() => {})
await page.waitForTimeout(600)
const hOpen = page.locator('[data-histopen]:visible').first()
R.histHead = await hOpen.count() ? (await hOpen.innerText()).replace(/\n+/g, ' ').trim() : null
if (await hOpen.count()) { await hOpen.click({ force: true }); await page.waitForTimeout(800) }
R.hist = await page.evaluate(() => [...document.querySelectorAll('.hl-list')].filter(e => e.offsetParent)
  .flatMap(e => [...e.querySelectorAll('li')].map(li => (li.innerText || '').replace(/\s+/g, ' ').trim())).slice(0, 14))
await shot(page, 'G-A8-10-wed-history')

/* 8. Saturday's amendment number must be untouched by any of this */
R.satVersion = await page.evaluate(() => { const d = window.SCHED; return d ? JSON.stringify(Object.keys(d).slice(0, 12)) : null })

R.errors = errors.slice(0, 10)
writeFileSync('C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/walk-a8.json', JSON.stringify(R, null, 1))
const pr = (n, o) => { console.log(`--- ${n} ---`)
  console.log('  OIL Earn offered: ' + JSON.stringify(o.oilEarnOffered))
  console.log('  bars: ' + JSON.stringify(o.bars))
  console.log('  pending words: ' + JSON.stringify(o.pendingWords))
  console.log('  warnings head: ' + o.warn.head); (o.warn.lines || []).forEach(l => console.log('     · ' + l)) }
console.log('PH set to:', JSON.stringify(R.phSet), ' cleared to:', JSON.stringify(R.phCleared))
console.log('man on the desk:', R.man, '=', R.manCs, ' publish:', JSON.stringify(R.pub), ' republish:', JSON.stringify(R.pub2))
console.log('OIL offered before any work, with PH on:', JSON.stringify(R.oilOfferedBeforeWork))
pr('AFTER PUBLISH (holiday still on)', R.afterPublish)
console.log('  LEAVE WAR credit: ' + JSON.stringify(R.creditAfterPublish))
pr('AFTER THE HOLIDAY IS CLEARED (not republished)', R.afterClear)
console.log('  LEAVE WAR credit: ' + JSON.stringify(R.creditAfterClear))
pr('AFTER AL1', R.afterAL1)
console.log('  LEAVE WAR credit: ' + JSON.stringify(R.creditAfterAL1))
console.log('history head:', R.histHead); R.hist.forEach(l => console.log('   | ' + l))
console.log('errors:', R.errors)
await browser.close()
