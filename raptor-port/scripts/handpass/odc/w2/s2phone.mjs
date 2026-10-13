// W2 scenario 2 phone follow-up: after Restore with a post-in date in NEXT month, is his row on the Leave War? VERSION 1
import { openWorld, tools, adminCategory } from './lib.mjs'
const WHICH = process.argv[2] || 'phone'
console.log(`s2phone VERSION 1 — ${WHICH}`)
const w = await openWorld(WHICH); const t = tools(w, `${WHICH}-s2b`); const { page } = w
const CS = 'Probey'
const groupCounts = () => page.evaluate(() => [...document.querySelectorAll('tr')].map(r => (r.innerText || '').replace(/\s+/g, ' ').trim()).filter(x => /^[▾▸]?\s*(SXO|IP|OPS P|IWSO|OPS W|OCU|Personnel)\b.*\d+$/.test(x) && x.length < 25))
const lwLook = async label => {
  await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(900)
  await page.evaluate(() => window.lwSetRole('admin')); await page.waitForTimeout(300)
  await t.press('[data-testid="month-NOV"]'); await page.waitForTimeout(900)
  const mine = await page.evaluate(c => [...document.querySelectorAll('tr[data-testid^="row-"] span.cs')].filter(x => x.textContent.trim() === c).length, CS)
  console.log(`${label}: his row on the war (Nov) = ${mine}; group headers ${JSON.stringify(await groupCounts())}; total person rows ${await page.locator('tr[data-testid^="row-"]').count()}`)
  return mine
}
await adminCategory(page, '^Users')
await page.locator('#accAddPostIn').scrollIntoViewIfNeeded()
await page.fill('#accAddCs', CS); await page.fill('#accAddIni', 'PB')
await page.selectOption('#accAddSeat', 'FCP'); await page.selectOption('#accAddCat', 'C')
await t.press('#accAdd'); await page.waitForTimeout(500)
await lwLook('after add (post-in today)')
await adminCategory(page, '^Users')
await page.fill('#accFind', CS); await page.waitForTimeout(300)
await t.press(`#accList .acc-main:has-text("${CS}")`); await t.press('#accEdArchive'); await page.waitForTimeout(500)
await page.fill('#accFind', '')
if ((await page.locator('#accArchToggle').getAttribute('aria-expanded')) !== 'true') await t.press('#accArchToggle')
await t.press(`#accArchList .acc-main:has-text("${CS}")`)
await t.press('#accArPostIn'); await t.press('[data-testid="dcal-next"]'); await t.pick(t.addDays(21))
console.log('restore post-in reads', (await t.text('#accArPostIn')).replace(/\s+/g, ' '))
await t.press('#accArRestore'); await page.waitForTimeout(700)
const inRoster = await page.locator('#accList').innerText().then(s => s.includes(CS))
console.log('he is on the Users roster list again:', inRoster)
const m = await lwLook('after restore +21 days (3 Nov)')
// scroll to the OPS P group so the picture shows where he would sit
await page.evaluate(() => { const r = [...document.querySelectorAll('tr')].find(x => /OPS P/.test(x.innerText || '') && (x.innerText || '').length < 25); if (r) r.scrollIntoView() })
await page.waitForTimeout(400)
await t.shot('s2-restore-next-month-nov-opsp')
console.log('errors', JSON.stringify(w.errors))
await w.browser.close()
