// A PROBE for walker B's extra 6 (10 Oct 26): "the Medical tab did not list Saber's own ATT C filed for 13–14 Jul; Ranger's
// did". Does a downchit an admin files for HIMSELF through "+ Input" show on the Medical tab?
//   node scripts/handpass/ivet-probe-med.mjs          (LOOK_URL=http://localhost:4174/ by default)
import { chromium } from '@playwright/test'
import { existsSync } from 'node:fs'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const URL = (process.env.LOOK_URL || 'http://localhost:4174/') + '?fresh=1'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
await page.goto(URL); await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#vWeek .day')
await page.evaluate(() => window.go('inputs'))
const med = async () => { await page.click('#inMedBtn'); await page.waitForTimeout(300); const t = await page.evaluate(() => ({ badges: [...document.querySelectorAll('#inMedBtn .medcount')].map(b => b.textContent), names: [...document.querySelectorAll('.inputs-workspace .medcard, .inputs-workspace [class*="med"] b')].map(b => b.textContent).filter(Boolean).slice(0, 30).join(' | ') })); await page.click('#inMemberMode'); return t }
console.log('before:', JSON.stringify(await med()))
const id = cs => page.evaluate(cs => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === cs), cs)
for (const who of ['Saber', 'Ranger']) {
  await page.click('#inListBtn'); await page.click('#inNew')
  await page.selectOption('#inpEditType', 'ATT C'); await page.selectOption('#inpEditPerson', await id(who))
  await page.click('#inpEdCal [data-cal="2026-07-13"]'); await page.click('#inpEdCal [data-cal="2026-07-14"]')
  await page.click('#inpEditSave'); await page.locator('[data-testid="docconf-nodoc"]').click(); await page.waitForTimeout(500)
  if (await page.locator('[data-testid="medclash"]').count()) { console.log(who, 'met a clash question'); await page.locator('[data-testid="medclash-save"]').click(); await page.waitForTimeout(400) }
  console.log(`after ${who}:`, JSON.stringify(await med()), 'toast:', await page.evaluate(() => document.getElementById('toastEl')?.textContent))
}
console.log('saved:', JSON.stringify(await page.evaluate(() => window.INPUTS.filter(r => r.type === 'ATT C').map(r => `${window.PEOPLE[r.person]?.cs} ${r.date}-${r.endDate || ''}`))))
await browser.close()
