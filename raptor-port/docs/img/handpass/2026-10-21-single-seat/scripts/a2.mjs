import { L, snap, sideWarn } from './h.mjs'
console.log('a2 v1')
const { browser, ctx, page, errors } = await L.open({ width: 1400, height: 900 })
await L.board(page, 4)
await L.tap(page, '[data-wvadd="4"]')
await page.waitForTimeout(400)
await page.getByRole('button', { name: 'Flying wave' }).click()
await page.waitForTimeout(800)
const fillLine = async (f, cs, to, ld) => {
  await L.type(page, `[data-bfld="ff:4.0.${f}.cs"]`, cs)
  await L.type(page, `[data-bfld="ff:4.0.${f}.msn"]`, 'BFM')
  await L.type(page, `[data-bfld="ff:4.0.${f}.to"]`, to)
  await L.type(page, `[data-bfld="ff:4.0.${f}.ld"]`, ld)
}
const LINE0 = '.sb-line:has([data-slot="4.0.0.0.p"])'
await fillLine(0, 'VL', '09:00', '10:30')
console.log('put', await L.put(page, '[data-slot="4.0.0.0.p"]', ['salsa']))
// ---------- S1
console.log('S1 warn:', await sideWarn(page))
await snap(page, 's1-board-line-rcp-door', { clip: LINE0, pad: 24, marks: ['[data-slot="4.0.0.0.w"]'] })
// S1 week
await page.evaluate(() => { const b = document.querySelector('#sbDone'); b && b.click() })
await page.waitForTimeout(800)
await L.go(page, 'editsched')
const WK = '#eWeek .form:has([data-slot="4.0.0.0.p"])'
console.log('week form count', await page.locator(WK).count())
await snap(page, 's1-week-line-rcp-door', { clip: WK, pad: 30, marks: ['#eWeek [data-slot="4.0.0.0.w"]'] })
console.log('week S1 warn cls on puck:', await page.evaluate(() => document.querySelector('#eWeek [data-slot="4.0.0.0.p"] .puck')?.className))
console.log(errors)
await ctx.storageState({ path: 'C:/Users/User/AppData/Local/Temp/claude/job3/walk/state-a2.json' })
await browser.close()
