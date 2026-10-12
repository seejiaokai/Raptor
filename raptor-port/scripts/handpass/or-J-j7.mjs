import { open, shot, toWeekDay, errs, browser, PID, csId, undoOnce, redoOnce, toastMark, toastsSince } from './or-J-lib.mjs'
import { writeFileSync } from 'node:fs'
const { ctx, page } = await open({ fresh: true })
const res = {}
const DAY = '2026-07-17'
const counts = () => page.evaluate(d => ['sc-f-', 'sc-o-', 'sc-a-', 'sc-need-'].map(p => p + ' ' + (document.querySelector(`[data-testid="${p}${d}"]`)?.innerText || '').replace(/\s+/g, ' ')).join(' | '), DAY)
const sansInputs = () => page.evaluate(() => window.INPUTS.filter(r => /SANS/i.test(r.type) && r.date === 'Jul 17').map(r => ({ type: r.type, who: r.people ? r.people.map(e => window.PEOPLE[e.p]?.cs) : [window.PEOPLE[r.person]?.cs] })))
const weekSans = async () => { await toWeekDay(page, 4); return page.evaluate(() => { const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][4]; const s = d.querySelector('.sec-sans'); return s ? s.innerText.replace(/\s+/g, ' ').slice(0, 300) : '(no SANS section)' }) }
const toSans = async () => {
  await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(500)
  if (!(await page.locator('[data-testid="sanscal"]').count())) await page.locator('#inSansMode').click()
  await page.waitForTimeout(500)
  const m = await page.locator('[data-testid="sc-month"]').textContent()
  if (!/july/i.test(m)) { await page.locator('[data-testid="sc-next"]').click(); await page.waitForTimeout(400) }
}
const openDay = async () => { await page.locator(`[data-testid="sc-day-${DAY}"]`).click({ position: { x: 8, y: 8 } }); await page.waitForTimeout(600) }
const shotSec = async n => { const sec = page.locator('#eWeek .day:not(.peek)').nth(4).locator('.sec-sans').first(); if (await sec.count()) { await sec.scrollIntoViewIfNeeded(); await sec.screenshot({ path: 'docs/img/handpass/2026-10-12-one-rule/J/' + n + '.png' }); console.log('saved ' + n) } else console.log('no sans section for ' + n) }
await toSans()
res.countsBefore = await counts(); console.log('before', res.countsBefore)
res.weekBefore = await weekSans(); console.log('week before', res.weekBefore)
await toSans(); await openDay()
await page.locator('[data-testid="sd-add"]').click(); await page.waitForTimeout(600)
const WIN = '[data-testid="win-inputedit"]'
await page.locator(`${WIN} [data-testid="pp-several"]`).click(); await page.waitForTimeout(400)
const want = []
for (const cs of ['Tally', 'Bolt', 'Jester']) { const pid = await csId(page, cs); want.push(pid); const b = page.locator(`[data-pp="${pid}"]`).first(); if ((await b.count()) && (await b.getAttribute('aria-pressed')) !== 'true') await b.click() }
const pressed = await page.evaluate(() => [...document.querySelectorAll('[data-pp][aria-pressed="true"]')].map(b => b.getAttribute('data-pp')))
for (const id of pressed) if (!want.includes(id)) await page.locator(`[data-pp="${id}"]`).first().click()
await shot(page, 'j7-a-form')
await page.locator('#inpEditSave').click(); await page.waitForTimeout(900)
res.filedInputs = await sansInputs(); console.log('filed', JSON.stringify(res.filedInputs))
res.countsAfterFile = await counts(); console.log('after file', res.countsAfterFile)
await shot(page, 'j7-b-month')
res.weekAfterFile = await weekSans(); console.log('week after file', res.weekAfterFile)
await shotSec('j7-c-week-sans-before-takeout')
await toSans(); await openDay()
await shot(page, 'j7-d-day')
await page.locator('[data-testid="win-sansday"] [data-testid="sd-open"]', { hasText: 'Jester' }).click(); await page.waitForTimeout(800)
await shot(page, 'j7-e-window')
res.window = await page.evaluate(() => (document.querySelector('[data-testid="win-inputedit"]')?.innerText || '').replace(/\s+/g, ' ').slice(0, 500))
console.log('WINDOW', res.window)
res.buttons = await page.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputedit"] button')].map(b => (b.id || '') + '|' + b.innerText.trim().slice(0, 30) + '|' + (b.getAttribute('aria-pressed') || '')).filter(x => !/^\|[0-9]+\|/.test(x)))
console.log(res.buttons.join('\n'))
/* take Jester out: unpick him in the window, Save */
const jid = await csId(page, 'Jester')
const m0 = await toastMark(page)
await page.locator(`[data-testid="win-inputedit"] [data-pp="${jid}"]`).click(); await page.waitForTimeout(300)
await page.locator('#inpEditSave').click(); await page.waitForTimeout(1000)
res.takeOutToast = await toastsSince(page, m0); console.log('TAKE-OUT NOTE', res.takeOutToast)
res.inputsAfter = await sansInputs(); console.log('inputs after', JSON.stringify(res.inputsAfter))
res.countsAfter = await counts(); console.log('counts after', res.countsAfter)
await shot(page, 'j7-f-month-after')
res.dayAfter = await page.evaluate(() => (document.querySelector('[data-testid="win-sansday"]')?.innerText || '(day window closed)').replace(/\s+/g, ' ').slice(0, 400))
res.weekAfter = await weekSans(); console.log('week after', res.weekAfter)
await shotSec('j7-g-week-sans-after-takeout')
/* Undo / Redo */
res.undo = await undoOnce(page); res.undoState = { inputs: await sansInputs(), week: await weekSans() }
await toSans(); res.undoState.counts = await counts(); console.log('UNDO', res.undo, JSON.stringify(res.undoState))
await toWeekDay(page, 4)
res.redo = await redoOnce(page); res.redoState = { inputs: await sansInputs(), week: await weekSans() }
await toSans(); res.redoState.counts = await counts(); console.log('REDO', res.redo, JSON.stringify(res.redoState))
writeFileSync('docs/handpass/parts/or-J-j7-raw.json', JSON.stringify(res, null, 1))
console.log('ERR', errs.join('\n'))
await ctx.close(); await browser.close()
