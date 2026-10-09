// A PROBE for the host's own find while opening the walk's pictures (10 Oct 26): after a shared input of nine was added
// through "+ Input", the row LIT on the desktop list was another man's upchit, not the new shared row. Which record does
// the page reveal after a group save — and is the shared row lit?
//   node scripts/handpass/ivet-probe-lit.mjs          (LOOK_URL=http://localhost:4174/ by default)
import { chromium } from '@playwright/test'
import { existsSync } from 'node:fs'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const URL = (process.env.LOOK_URL || 'http://localhost:4174/') + '?fresh=1'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
await page.goto(URL); await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#vWeek .day')
await page.evaluate(() => window.go('inputs')); await page.click('#inListBtn'); await page.click('#inRangeBtn'); await page.click('#inRangeAll')
const id = cs => page.evaluate(cs => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === cs), cs)
const WIN = '[data-testid="win-inputedit"]'
const lit = () => page.evaluate(() => [...document.querySelectorAll('#inBody tr.innew')].map(t => t.textContent.replace(/\s+/g, ' ').slice(0, 60)))
const group = async (names, day, withUpchitFirst) => {
  const had = await page.evaluate(() => window.INPUTS.map(r => r.iid))
  await page.click('#inNew'); await page.locator(WIN).waitFor()
  await page.selectOption('#inpEditType', 'Meeting')
  await page.locator(`${WIN} [data-testid="pp-several"]`).click()
  for (const cs of names) await page.locator(`${WIN} [data-pp="${await id(cs)}"]`).click()
  await page.click(`#inpEdCal [data-cal="${day}"]`)
  await page.click('#inpEditSave'); await page.locator(WIN).waitFor({ state: 'hidden' }); await page.waitForTimeout(300)
  const made = await page.evaluate(had => window.INPUTS.map((r, i) => ({ i, iid: r.iid, cs: window.PEOPLE[r.person]?.cs, type: r.type })).filter(r => !had.includes(r.iid)), had)
  console.log(JSON.stringify({ names, made: made.map(m => `${m.i}:${m.cs}:${m.type}`), lit: await lit() }))
}
await group(['Wisp', 'Ace'], '2026-07-15')            // the filer (Saber) is not the first A to Z
await page.waitForTimeout(6500)
await group(['Wisp'], '2026-07-16')                   // the filer IS… no: Saber < Wisp, so Saber is first
await page.waitForTimeout(6500)
/* an upchit over a downchit first, as the walk had — then a group */
await page.click('#inNew'); await page.selectOption('#inpEditType', 'OML'); await page.selectOption('#inpEditPerson', await id('Havoc'))
await page.click('#inpEdCal [data-cal="2026-07-21"]'); await page.click('#inpEdCal [data-cal="2026-07-23"]'); await page.click('#inpEditSave')
await page.locator('[data-testid="docconf-nodoc"]').click(); await page.locator(WIN).waitFor({ state: 'hidden' })
await page.click('#inNew'); await page.selectOption('#inpEditType', 'Upchit'); await page.selectOption('#inpEditPerson', await id('Havoc'))
await page.click('#inpEdCal [data-cal="2026-07-22"]'); await page.click('#inpEditSave')
if (await page.locator('[data-testid="docconf"]').waitFor({ timeout: 1500 }).then(() => true, () => false)) await page.locator('[data-testid="docconf-nodoc"]').click()
await page.locator('[data-testid="upconf-save"]').click(); await page.waitForTimeout(600)
console.log('after the upchit, lit:', JSON.stringify(await lit()))
await page.waitForTimeout(6500)
await group(['Ranger', 'Ace', 'Drifter'], '2026-07-23')
await browser.close()
