import { open, fileInput, shot, toWeekDay, errs, browser, unavRows, reveal, undoOnce, redoOnce, calDay, PID } from './or-J-lib.mjs'
import { writeFileSync } from 'node:fs'
const THIRD = process.argv[2] || 'Tally', TAG = process.argv[3] || 'tally'
const { ctx, page } = await open({ fresh: true })
const res = { third: THIRD }
const dump = () => page.evaluate(() => window.INPUTS.filter(r => ['LL', 'ATT C', 'ATT B', 'OML'].includes(r.type) && /^Jul 1[3-7]$/.test(r.date)).map(r => ({ type: r.type, from: r.date, to: r.to || null, rmk: r.remarks || r.rmk || '', who: r.people ? r.people.map(e => window.PEOPLE[e.p]?.cs) : [window.PEOPLE[r.person]?.cs] })).filter(r => r.who.some(w => ['Drifter', 'Hunter', 'Tally', 'Anvil'].includes(w))))
const lw = async () => {
  await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(1200)
  const m = page.locator('[data-testid="month-jul"], [data-testid="month-JUL"]'); if (await m.count()) { await m.first().click(); await page.waitForTimeout(900) }
  return page.evaluate(() => ['slipway', 'prowler', 'nick', 'shaft'].map(id => id + ': ' + ['13', '14', '15', '16', '17'].map(d => { const c = document.querySelector(`[data-testid="cell-${id}-2026-07-${d}"]`); return d + '=' + (c ? '"' + c.innerText.trim() + '"' : 'none') }).join(' ')).join('\n'))
}
const cal = async () => { await calDay(page, '2026-07-15'); await shot(page, `j4-${TAG}-cal-${res.stage}`); return page.evaluate(() => [...document.querySelectorAll('#inpCal [data-icday]')].filter(e => /^2026-07-1[3-7]$/.test(e.dataset.icday)).length) }
const wed = async () => { await toWeekDay(page, 2); return (await unavRows(page, 2)).filter(r => /^(LL|ATT|OML)/.test(r.text)).map(r => r.text) }
res.stage = '1-leave'
res.leave = await fileInput(page, { type: 'LL', people: ['Drifter', 'Hunter', THIRD], from: '2026-07-13', to: '2026-07-17' })
res.leaveDump = await dump(); await cal(); res.lw1 = await lw(); res.wed1 = await wed()
res.stage = '2-medical'
res.med = await fileInput(page, { type: 'ATT C', person: THIRD, from: '2026-07-15', to: '2026-07-16' })
console.log('MED FILED', JSON.stringify(res.med))
res.afterDump = await dump(); res.afterWed = await wed()
await shot(page, `j4-${TAG}-wed-unavail`)
const sec = page.locator('#eWeek .day:not(.peek)').nth(2).locator('.sec-unav').first(); await reveal(sec); await sec.screenshot({ path: `docs/img/handpass/2026-10-12-one-rule/J/j4-${TAG}-wed-unavail-sec.png` })
res.afterCal = await cal()
await page.locator('[data-icday="2026-07-15"]').focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(500)
res.afterCard = await page.evaluate(() => (document.querySelector('[data-testid="win-inputsday"]')?.innerText || '').replace(/\s+/g, ' '))
await shot(page, `j4-${TAG}-cal-card-after`); await page.keyboard.press('Escape')
res.afterLw = await lw(); await shot(page, `j4-${TAG}-lw-after`)
res.undo = await undoOnce(page); res.undoDump = await dump(); res.undoWed = await wed()
res.redo = await redoOnce(page); res.redoDump = await dump()
console.log(JSON.stringify(res, null, 1))
writeFileSync(`docs/handpass/parts/or-J-j4-${TAG}-raw.json`, JSON.stringify(res, null, 1))
console.log('ERR', errs.join('\n'))
await ctx.close(); await browser.close()
