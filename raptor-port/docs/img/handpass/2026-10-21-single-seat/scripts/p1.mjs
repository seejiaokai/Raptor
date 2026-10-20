import { L, snap } from './h.mjs'
console.log('p1 v1')
const { browser, ctx, page, errors } = await L.open({ width: 390, height: 844, state: 'C:/Users/User/AppData/Local/Temp/claude/job3/walk/state-pub2.json' })
const T = async (name, fn) => { try { await fn() } catch (e) { console.log('STEP FAIL', name, String(e.message).split('\n')[0]) } }
console.log('Friday lines:', await page.evaluate(() => JSON.stringify(window.DAYS[4].waves.map(w => w.formations.map(f => f.aircraft.map(a => a.p + '/' + a.w))))))
await T('week', async () => {
  await L.go(page, 'editsched')
  const el = page.locator('#eWeek [data-slot="4.0.0.0.w"]:visible').first()
  console.log('phone week +RCP door count', await page.locator('#eWeek [data-slot="4.0.0.0.w"]').count())
  await snap(page, 'phone-s1-week-rcp-door', { scrollTo: '#eWeek [data-slot="4.0.0.0.w"]', marks: ['#eWeek [data-slot="4.0.0.0.w"]'] })
})
await T('viewonly', async () => {
  await page.getByRole('button', { name: /View-only Sched/ }).first().click().catch(async () => { await L.go(page, 'viewsched') })
  await page.waitForTimeout(800)
  console.log('CURPAGE', await page.evaluate(() => window.CURPAGE))
  await snap(page, 'phone-s1-viewonly-no-rcp', { scrollTo: '#vWeek .puck[data-person="salsa"]', marks: ['rest:#vWeek .puck[data-person="salsa"]'] })
})
await T('board', async () => {
  await L.board(page, 4)
  await snap(page, 'phone-s1-board-rcp-door', { scrollTo: '#schedBoard [data-slot="4.0.0.0.w"]', marks: ['#schedBoard [data-slot="4.0.0.0.w"]'] })
})
console.log('ERRORS', JSON.stringify(errors))
await browser.close()
