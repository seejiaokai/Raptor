/* D4 finale — what happens if the scheduler believes the phantom and presses
   the amendment button it offers him after a reload. */
import { open, board, shot, login } from './lib.mjs'
import { dayHead, bars, warCells, signAndPublish, publishAL, history, BASE_STATE } from './cd-lib.mjs'

const di = 5, SAT = '2026-07-18'
const say = (...a) => console.log(...a)
const headTxt = p => p.evaluate(() => { const b = document.querySelector('#schedBoard .sb-pub'); return b ? (b.innerText || '').replace(/\s+/g, ' ').trim() : null })

const { browser, page, errors } = await open({ state: BASE_STATE })
await board(page, di)
await signAndPublish(page, di)
say('published:', await headTxt(page))
const war0 = await warCells(page, [['plasma', SAT], ['stiff', SAT], ['razer', SAT]])
say('WAR:', JSON.stringify(war0.map(c => c.pid + '=' + c.text)))

await page.reload(); await page.waitForTimeout(1300)
if (await page.locator('#luser').count() && await page.locator('#luser').isVisible()) await login(page, 'a')
await board(page, di)
say('after a reload:', await headTxt(page))
await shot(page, 'CD-D4-08-phantom')

/* believe it, and press the amendment button it offers */
const p = await publishAL(page, di)
say('PRESSING THE AMENDMENT BUTTON:', p.label, '->', await headTxt(page), '|', p.why || '')
await shot(page, 'CD-D4-09-phantom-published')
const war1 = await warCells(page, [['plasma', SAT], ['stiff', SAT], ['razer', SAT]])
say('WAR after that amendment:', JSON.stringify(war1.map(c => c.pid + '=' + c.text)))
await board(page, di)
say('bars still on the board:', (await bars(page)).filter(b => b.bar).length)

/* and reload again — does it come back? */
await page.reload(); await page.waitForTimeout(1300)
if (await page.locator('#luser').count() && await page.locator('#luser').isVisible()) await login(page, 'a')
await board(page, di)
say('after a SECOND reload:', await headTxt(page))
await shot(page, 'CD-D4-10-phantom-again')
say('HISTORY:', JSON.stringify((await history(page) || {}).top))
say('errors:', JSON.stringify(errors.slice(0, 6)))
await browser.close()
