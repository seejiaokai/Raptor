/* A9 (Fable S9) — a weekend that no Leave War period covers.  Green bars
   everywhere and the money nowhere? */
import { open, board, tap, type, put, shot, publish, go, warnings } from './lib.mjs'
import { writeFileSync } from 'node:fs'

const STATE = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json'
const { browser, page, errors } = await open({ state: STATE })
const R = {}

/* what does the war actually cover? */
await go(page, 'leavewar')
await page.waitForTimeout(1400)
R.warPeriods = await page.evaluate(() => {
  const any = [...document.querySelectorAll('*')].filter(e => !e.children.length && e.offsetParent)
    .map(e => (e.innerText || '').trim()).filter(t => /20\d\d/.test(t) && t.length < 60)
  return [...new Set(any)].slice(0, 12)
})
R.has2027 = await page.locator('[data-testid^="event-0-2027-"]').count()
R.has2026Jul = await page.locator('[data-testid="event-0-2026-07-18"]').count()

/* step the board forward until we are past the war's last year */
await go(page, 'editsched')
await board(page, 5)
R.steps = []
for (let i = 0; i < 30; i++) {
  const t = await page.evaluate(() => ((document.querySelector('#schedBoard .sb-title') || {}).innerText || '').replace(/\n+/g, ' ').trim())
  const dt = await page.evaluate(() => { const d = window.DAYS && window.DAYS[5]; return (d && (d.iso || d.date)) || (window.DATES && window.DATES[5]) || null })
  R.steps.push(dt)
  if (dt && /^2027-/.test(dt)) break
  const wk = page.locator('[data-sbweek]:visible')
  if (!await wk.count()) { R.steps.push('no week buttons'); break }
  await wk.last().click({ force: true })
  await page.waitForTimeout(1100)
}
R.landedOn = await page.evaluate(() => ({ date: (window.DAYS[5] && (window.DAYS[5].iso || window.DAYS[5].date)) || (window.DATES && window.DATES[5]), keys: Object.keys(window.DAYS[5] || {}).slice(0, 18), title: ((document.querySelector('#schedBoard .sb-title') || {}).innerText || '').replace(/\n+/g, ' ').trim() }))
await shot(page, 'G-A9-01-saturday-outside-the-war')

/* is OIL even offered on that Saturday? */
R.offered = await page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-oilmode], #sbOil')]
  .filter(e => e.offsetParent).map(e => e.innerText.replace(/\n/g, ' ').trim()))

/* put a man on a duty desk 08:00-18:00 */
const has = await page.evaluate(() => (window.DAYS[5].dutywaves || []).length)
if (!has) {
  await tap(page, `[data-dwadd="5"]`); await page.waitForTimeout(800)
  R.pickerButtons = await page.evaluate(() => [...document.querySelectorAll('button')].filter(e => e.offsetParent)
    .map(e => (e.innerText || '').replace(/\s+/g, ' ').trim()).filter(Boolean).slice(0, 40))
  await shot(page, 'G-A9-01b-duty-block-picker')
  const b = page.locator('button').filter({ hasText: /^(Plain|Blank|Empty|New block|Duty desk)/i }).first()
  if (await b.count()) { await b.click(); await page.waitForTimeout(800) } else { await page.keyboard.press('Escape') }
}
R.blocks = await page.evaluate(() => (window.DAYS[5].dutywaves || []).length)
if (R.blocks) {
  await tap(page, `[data-dradd="5.0"]`)
  await page.waitForTimeout(400)
  const ri = await page.evaluate(() => window.DAYS[5].dutywaves[0].rows.length - 1)
  await type(page, `[data-bfld="dr:5.0.${ri}.role"]`, 'SDO')
  await type(page, `[data-bfld="dr:5.0.${ri}.str"]`, '08:00')
  await type(page, `[data-bfld="dr:5.0.${ri}.end"]`, '18:00')
  const free = await page.evaluate(() => [...document.querySelectorAll('#sbRoster .rpuck[data-person]')]
    .map(e => e.dataset.person).filter(p => window.PEOPLE[p] && !/^all/i.test(p)).slice(0, 25))
  R.man = await put(page, `[data-fill="d:5.0.${ri}.+"]`, free)
  R.manCs = await page.evaluate(p => (window.PEOPLE[p] || {}).cs, R.man)
}
/* if no duty block could be made, a ground row earns the same way */
if (!R.blocks) {
  await tap(page, `[data-gradd="5"]`); await page.waitForTimeout(500)
  const gi = await page.evaluate(() => window.DAYS[5].ground.length - 1)
  await type(page, `[data-bfld="gr:5.${gi}.prog"]`, 'SDO')
  await type(page, `[data-bfld="gr:5.${gi}.str"]`, '08:00')
  await type(page, `[data-bfld="gr:5.${gi}.end"]`, '18:00')
  const free2 = await page.evaluate(() => [...document.querySelectorAll('#sbRoster .rpuck[data-person]')]
    .map(e => e.dataset.person).filter(p => window.PEOPLE[p] && !/^all/i.test(p)).slice(0, 25))
  R.man = await put(page, `[data-fill="g:5.${gi}.+"]`, free2)
  R.manCs = await page.evaluate(p => (window.PEOPLE[p] || {}).cs, R.man)
  R.usedGroundRow = true
}
await shot(page, 'G-A9-02-desk-built')

const look = async () => {
  const w = await warnings(page)
  const s = await page.evaluate(() => {
    const root = document.querySelector('#schedBoard')
    const vis = e => !!(e && (e.offsetParent || e.getClientRects().length))
    return {
      bars: [...root.querySelectorAll('.puck[data-person]')].filter(e => vis(e) && !e.closest('#sbRoster'))
        .filter(e => /oilbar-(fo|ho)/.test(e.className))
        .map(e => ({ who: (window.PEOPLE[e.dataset.person] || {}).cs, kind: e.className.match(/oilbar-(fo|ho)/)[1], title: (e.getAttribute('title') || '').slice(0, 70) })),
      oilButtons: [...root.querySelectorAll('[data-oilmode], #sbOil')].filter(vis).map(e => e.innerText.replace(/\n/g, ' ').trim()),
    }
  })
  return { warnHead: w.head, warnings: w.lines, ...s }
}
R.beforePublish = await look()
R.pub = await publish(page, 5)
await page.waitForTimeout(900)
R.toasts = await page.evaluate(() => [...document.querySelectorAll('*')].filter(e => e.offsetParent && !e.children.length)
  .map(e => (e.innerText || '').replace(/\s+/g, ' ').trim())
  .filter(t => t && t.length < 160 && /OIL|earn|nobody|nowhere|no war|period/i.test(t)).slice(0, 8))
R.afterPublish = await look()
await shot(page, 'G-A9-03-published-outside-the-war')

/* and the money */
R.credit = await (async () => {
  await go(page, 'leavewar'); await page.waitForTimeout(1400)
  const d = R.landedOn.date
  const c = page.locator(`[data-testid="cell-${R.man}-${d}"]`)
  const found = await c.count()
  let text = null
  if (found) { await c.scrollIntoViewIfNeeded().catch(() => {}); text = (await c.innerText()).replace(/\s+/g, ' ').trim() }
  await shot(page, 'G-A9-04-leavewar-that-date')
  return { date: d, cellExists: !!found, text }
})()
/* and the OIL tracker sheet */
R.tracker = await (async () => {
  const b = page.getByText(/^OIL( tracker)?$/).first()
  if (!await b.count()) return { opened: false }
  await b.click({ force: true }).catch(() => {})
  await page.waitForTimeout(1000)
  const txt = await page.evaluate(() => [...document.querySelectorAll('[role=dialog], .sheet, [class*=oiltrack]')]
    .filter(e => e.offsetParent).map(e => (e.innerText || '').replace(/\n+/g, ' | ').slice(0, 400)).slice(0, 2))
  await shot(page, 'G-A9-05-oil-tracker')
  return { opened: true, txt }
})()

R.errors = errors.slice(0, 10)
writeFileSync('C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/walk-a9.json', JSON.stringify(R, null, 1))
console.log('war periods seen on screen:', JSON.stringify(R.warPeriods))
console.log('war holds a 2027 date?', R.has2027, '  holds 18 Jul 26?', R.has2026Jul)
console.log('stepped through:', JSON.stringify(R.steps))
console.log('landed on:', JSON.stringify(R.landedOn), ' OIL offered there:', JSON.stringify(R.offered))
console.log('duty blocks:', R.blocks, ' man:', R.man, '=', R.manCs)
console.log('BEFORE publish  bars=' + JSON.stringify(R.beforePublish.bars) + '  warnings=' + JSON.stringify(R.beforePublish.warnings))
console.log('publish:', JSON.stringify(R.pub))
console.log('what the app said at publish:', JSON.stringify(R.toasts))
console.log('AFTER publish   bars=' + JSON.stringify(R.afterPublish.bars) + '  warnings=' + JSON.stringify(R.afterPublish.warnings))
console.log('the money:', JSON.stringify(R.credit))
console.log('the OIL tracker:', JSON.stringify(R.tracker))
console.log('errors:', R.errors)
await browser.close()
