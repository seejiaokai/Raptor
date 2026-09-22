/* D19's WAY OUT — which SURFACE carries it? The button is built in html.ts's
   day warning list (the WEEK's collapsible per-day list), not in the board's
   side panel. Check both. */
import { open, go, board, tap, type, put, closeBoard, shot, SHOTS } from './lib.mjs'
const { browser, page, errors } = await open({ state: 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json' })
const L = []; const S = (k, v) => { L.push({ [k]: v }); return v }
await go(page, 'editsched'); await board(page, 5)
for (let i = 0; i < 110; i++) {
  const wk = await page.evaluate(() => window.CURWEEK)
  if (/^\d\d\/02\/2028$/.test(String(wk))) break
  const n = page.locator('#schedBoard [data-sbweek="1"]:visible')
  if (!await n.count()) break
  await n.click({ force: true }); await page.waitForTimeout(320)
}
S('week', await page.evaluate(() => window.CURWEEK))
/* a man down to earn, so the check speaks at all */
await tap(page, '[data-gradd="5"]'); await page.waitForTimeout(600)
const gi = await page.evaluate(() => (window.DAYS[5].ground || []).length - 1)
await type(page, `[data-bfld="gr:5.${gi}.prog"]`, 'SDO')
await type(page, `[data-bfld="gr:5.${gi}.str"]`, '08:00')
await type(page, `[data-bfld="gr:5.${gi}.end"]`, '18:00')
const free = await page.evaluate(() => [...document.querySelectorAll('#sbRoster .rpuck[data-person]')]
  .map(e => e.dataset.person).filter(p => window.PEOPLE[p] && !/^all/i.test(p)).slice(0, 25))
await put(page, `[data-fill="g:5.${gi}.+"]`, free)
await page.waitForTimeout(600)

/* the warning list's own toggle is [data-daywarn="<di>"] — the ▼ "tap to
   review" header. Without pressing it the list is not rendered at all, so
   looking for its button finds nothing and reads as a missing feature. */
const openList = async () => {
  const t = page.locator('[data-daywarn="5"]:visible').first()
  if (await t.count()) { await t.click({ force: true }); await page.waitForTimeout(700) }
  return await page.evaluate(() => document.querySelectorAll('.witem').length)
}
S('ON THE BOARD', { listRows: await openList(), ...(await page.evaluate(() => ({
  reasonShown: /no leave war period for 2028/i.test(document.body.innerText || ''),
  createButtons: [...document.querySelectorAll('[data-mkperiod]')].map(b => ({
    year: b.getAttribute('data-mkperiod'), label: (b.innerText || '').trim(),
    visible: !!b.offsetParent, inBoard: !!b.closest('#schedBoard') })),
}))) })
await shot(page, 'j6w-01-board')

/* now the WEEK: close the board and open the same day's list there */
await closeBoard(page); await page.waitForTimeout(800)
S('ON THE WEEK', { listRows: await openList(), ...(await page.evaluate(() => ({
  reasonShown: /no leave war period for 2028/i.test(document.body.innerText || ''),
  createButtons: [...document.querySelectorAll('[data-mkperiod]')].map(b => ({
    year: b.getAttribute('data-mkperiod'), label: (b.innerText || '').trim(), visible: !!b.offsetParent })),
}))) })
await shot(page, 'j6w-02-week')
console.log(JSON.stringify(L, null, 1)); console.log('errors:', errors.slice(0, 4))
console.log('shots in ' + SHOTS)
await browser.close()
