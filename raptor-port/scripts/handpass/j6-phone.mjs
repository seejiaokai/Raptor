/* THE WAY OUT AT 390px. The phone board carries no [data-sbweek] arrow (it
   navigates by day), so stepping to 2028 has to happen at desktop width — then
   the window narrows onto the same state. Resizing does not reload. */
import { open, go, board, tap, type, put, shot, SHOTS } from './lib.mjs'
const { browser, page, errors } = await open({ state: 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json' })
await go(page, 'editsched'); await board(page, 5)
for (let i = 0; i < 110; i++) {
  const wk = await page.evaluate(() => window.CURWEEK)
  if (/^\d\d\/02\/2028$/.test(String(wk))) break
  const n = page.locator('#schedBoard [data-sbweek="1"]:visible')
  if (!await n.count()) break
  await n.click({ force: true }); await page.waitForTimeout(310)
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
console.log('week', await page.evaluate(() => window.CURWEEK))

await page.setViewportSize({ width: 390, height: 844 })
await page.waitForTimeout(900)
const t = page.locator('#schedBoard [data-sbwtog]:visible').first()
if (await t.count()) { await t.click({ force: true }); await page.waitForTimeout(700) }
const r = await page.evaluate(() => {
  const b = document.querySelector('[data-mkperiod]')
  if (!b) return { mk: 0, warn: (document.getElementById('sbWarn')?.innerText || '').replace(/\s+/g, ' ').slice(0, 150) }
  const rc = b.getBoundingClientRect()
  const row = b.closest('.wln'); const rr = row && row.getBoundingClientRect()
  const top = document.elementFromPoint(rc.left + rc.width / 2, rc.top + rc.height / 2)
  return {
    mk: 1, label: (b.innerText || '').trim(),
    box: { w: Math.round(rc.width), h: Math.round(rc.height) },
    rowH: rr ? Math.round(rr.height) : null,
    fitsInTheRow: !!(rr && rc.right <= rr.right + 1),
    noHorizontalOverflow: rc.right <= 390,
    pressable: !!(top && (top === b || b.contains(top))),
    reasonShown: /no leave war period for 2028/i.test(document.body.innerText || ''),
  }
})
console.log('AT 390px:', JSON.stringify(r, null, 1))
await shot(page, 'j6p-01-phone-warnlist')
console.log('errors:', errors.slice(0, 4)); console.log('shots in ' + SHOTS)
await browser.close()
