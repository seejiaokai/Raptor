import { open, fileInput, shot, toWeekDay, toWeek, errs, browser, reveal, mouseDrag, centre, toastMark, toastsSince, inputsDump, PID, openBoard, oilOn, openCount, winState, closeWin, signAndPublish, lwOpen, lwCellsOf } from './or-J-lib.mjs'
import { writeFileSync } from 'node:fs'
const SECOND = process.argv[2] || 'Tally', TAG = process.argv[3] || 'tally'
const { ctx, page } = await open({ fresh: true })
const res = { second: SECOND }
res.filed = await fileInput(page, { type: 'Training', people: ['Ranger', SECOND], from: '2026-07-18', to: '2026-07-18', timed: ['09:00', '12:00'], title: 'Oil drill', oil: 'yes' })
console.log('filed', JSON.stringify(res.filed))
const iid = res.filed[0].iid
await toWeekDay(page, 5)
const row = page.locator('#eWeek .day:not(.peek)').nth(5).locator('.sec-grnd .pl-row').filter({ hasText: /OIL DRILL/i }).first()
const ap = page.locator('#eRoster .rpuck[data-person="allavail"]').first()
const tb = await reveal(row.locator('.ppl .puck').first())
const ab = await ap.boundingBox()
const m = await toastMark(page)
await mouseDrag(page, centre(ab), centre(tb))
res.drop = { toast: await toastsSince(page, m), row: (await row.innerText()).replace(/\s+/g, ' '), people: await page.evaluate(id => { const r = window.INPUTS.find(x => x.iid === id); return r.people.map(e => window.PEOPLE[e.p]?.cs) }, iid) }
console.log(JSON.stringify(res.drop))
await shot(page, `j5-${TAG}-a-row`)
await openBoard(page, 5); await oilOn(page, true)
await openCount(page, iid)
res.win0 = await winState(page); console.log('win0', JSON.stringify({ tabs: res.win0.tabs, on: res.win0.on, total: res.win0.total, hasRanger: 'Ranger' in res.win0.seats, hasSecond: SECOND in res.win0.seats }))
await shot(page, `j5-${TAG}-c-win`)
await page.locator(`.availwin .seat.oilpk[data-oilp="${PID.Hunter}"]`).first().click(); await page.waitForTimeout(500)
res.win1 = await winState(page); console.log('after Hunter off', JSON.stringify({ tabs: res.win1.tabs, off: res.win1.off, on: res.win1.on }))
await shot(page, `j5-${TAG}-d-hunter-off`)
await closeWin(page); await oilOn(page, false)
res.publish = await signAndPublish(page, 5); console.log('PUBLISH', JSON.stringify(res.publish))
await toWeekDay(page, 5); await shot(page, `j5-${TAG}-f-published`)
await lwOpen(page, 'jul')
const ids = ['bane', 'nick', 'pump', 'shaft', 'prowler', 'slash', 'slipway']
res.cells = await lwCellsOf(page, ids, ['2026-07-17', '2026-07-18', '2026-07-19']); console.log(res.cells)
res.cellTitles = await page.evaluate(ids => ids.map(id => id + ': ' + (document.querySelector(`[data-testid="cell-${id}-2026-07-18"]`)?.getAttribute('title') || '(no title)') + ' | ' + (document.querySelector(`[data-testid="cell-${id}-2026-07-18"]`)?.className || '')), ids); console.log(res.cellTitles.join(' ;; '))
await shot(page, `j5-${TAG}-g-lw`)
/* Tally is a SANS man: the war draws him only while its gear's "Show SANS" is on - press it as a scheduler would */
await page.locator('[data-testid="settings-open"]').click(); await page.waitForTimeout(500)
await page.locator('[data-testid="sans-toggle"]').click(); await page.waitForTimeout(600)
await page.keyboard.press('Escape'); await page.waitForTimeout(500)
if (await page.locator('[data-testid="sans-toggle"]').count()) { await page.locator('.sheet .x, [data-testid="settings-close"], button[aria-label="Close"]').first().click().catch(() => {}); await page.waitForTimeout(500) }
res.cellsSans = await lwCellsOf(page, ['nick', 'bane'], ['2026-07-17', '2026-07-18', '2026-07-19']); console.log('WITH SANS ON', res.cellsSans)
await shot(page, `j5-${TAG}-g2-lw-sans`)
await page.locator('[data-testid="oil-tracker"]').click(); await page.waitForTimeout(1000)
await shot(page, `j5-${TAG}-h-tracker`)
res.tracker = await page.evaluate(names => names.map(n => { const sh = document.querySelector('[data-testid="oil-sheet"]'); const el = sh && [...sh.querySelectorAll('*')].find(e => !e.children.length && e.textContent.trim() === n); const row = el && (el.closest('tr') || el.closest('[class*=row]')); return n + ' => 18 Jul credits: ' + (row ? (row.innerText.match(/18 Jul/g) || []).length + ' | ' + row.innerText.replace(/\s+/g, ' ').slice(0, 60) : 'no row in the tracker') }), ['Ranger', 'Tally', 'Piston', 'Anvil', 'Hunter', 'Blade', 'Drifter'])
console.log(res.tracker.join(' ;; '))
writeFileSync(`docs/handpass/parts/or-J-j5-${TAG}-raw.json`, JSON.stringify(res, null, 1))
console.log('ERR', errs.join('\n'))
await ctx.close(); await browser.close()
