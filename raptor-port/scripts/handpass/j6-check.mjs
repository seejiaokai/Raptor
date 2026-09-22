/* Did the 2028 period ACTUALLY get created, or does the toast only say so? */
import { open, go, board, tap, type, put, shot, SHOTS } from './lib.mjs'
const { browser, page, errors } = await open({ state: 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json' })
await go(page, 'editsched'); await board(page, 5)
for (let i = 0; i < 110; i++) {
  const wk = await page.evaluate(() => window.CURWEEK)
  if (/^\d\d\/02\/2028$/.test(String(wk))) break
  const n = page.locator('#schedBoard [data-sbweek="1"]:visible')
  if (!await n.count()) break
  await n.click({ force: true }); await page.waitForTimeout(320)
}
await tap(page, '[data-gradd="5"]'); await page.waitForTimeout(600)
const gi = await page.evaluate(() => (window.DAYS[5].ground || []).length - 1)
await type(page, `[data-bfld="gr:5.${gi}.prog"]`, 'SDO')
await type(page, `[data-bfld="gr:5.${gi}.str"]`, '08:00')
await type(page, `[data-bfld="gr:5.${gi}.end"]`, '18:00')
const free = await page.evaluate(() => [...document.querySelectorAll('#sbRoster .rpuck[data-person]')]
  .map(e => e.dataset.person).filter(p => window.PEOPLE[p] && !/^all/i.test(p)).slice(0, 25))
await put(page, `[data-fill="g:5.${gi}.+"]`, free)
await page.waitForTimeout(500)
const t = page.locator('#schedBoard [data-sbwtog]:visible').first()
if (await t.count()) { await t.click({ force: true }); await page.waitForTimeout(500) }
await tap(page, '[data-mkperiod]'); await page.waitForTimeout(2000)

const dump = await page.evaluate(() => {
  const txt = (document.body.innerText || '').replace(/\s+/g, ' ')
  const btns = [...document.querySelectorAll('button,[role=tab],.lw-per,[class*=period]')]
    .filter(e => e.offsetParent).map(e => (e.innerText || '').replace(/\s+/g, ' ').trim())
    .filter(Boolean).slice(0, 26)
  return { periodStrip: txt.slice(txt.indexOf('PERIOD'), txt.indexOf('PERIOD') + 150), buttons: btns }
})
console.log(JSON.stringify(dump, null, 1))
await shot(page, 'j6c-01-leavewar-after-create')
/* and after a reload — is it persisted? */
await page.reload(); await page.waitForTimeout(1800)
await go(page, 'leavewar'); await page.waitForTimeout(1500)
console.log('AFTER RELOAD:', JSON.stringify(await page.evaluate(() => {
  const txt = (document.body.innerText || '').replace(/\s+/g, ' ')
  return { periodStrip: txt.slice(txt.indexOf('PERIOD'), txt.indexOf('PERIOD') + 130) }
})))
console.log('errors:', errors.slice(0, 4))
await browser.close()
