/* C4 — a man archived, hidden (SANS) or posted out after the day went out.
   F21 / C18.  The credit must not move; only the row may hide. */
import { open, board, shot, tap, go } from './lib.mjs'
import { warCells, PUB_STATE } from './cd-lib.mjs'

const SAT = '2026-07-18'
const say = (...a) => console.log(...a)
const { browser, page, errors } = await open({ state: PUB_STATE })
await board(page, 5)
const PIS = await page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Piston'))
say('Piston is', PIS)
say('WAR Piston with the day out:', JSON.stringify(await warCells(page, [[PIS, SAT]])))

/* the doors: what does the Quals / roster page offer for a person? */
await go(page, 'quals'); await page.waitForTimeout(900)
const doors = await page.evaluate(() => {
  const vis = e => !!(e.offsetParent || e.getClientRects().length)
  return {
    buttons: [...document.querySelectorAll('button,[role=button]')].filter(vis)
      .map(e => ({ t: (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 26), d: Object.entries(e.dataset || {}).map(([k, v]) => k + '=' + v).join(' ') }))
      .filter(x => /arch|post|remove|hide|sans|delete|out/i.test(x.t + x.d)).slice(0, 20),
    text: (document.body.innerText || '').replace(/\s+/g, ' ').slice(0, 400),
  }
})
say('QUALS PAGE doors that archive / post out:', JSON.stringify(doors.buttons))
await shot(page, 'CD-C4-01-quals-page')

/* the Admin page's people list */
await go(page, 'admin'); await page.waitForTimeout(900)
const adoors = await page.evaluate(() => {
  const vis = e => !!(e.offsetParent || e.getClientRects().length)
  return [...document.querySelectorAll('button,[role=button],select')].filter(vis)
    .map(e => ({ t: (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 26), d: Object.entries(e.dataset || {}).map(([k, v]) => k + '=' + v).join(' ') }))
    .filter(x => /arch|post|remove|delete|out|sans/i.test(x.t + x.d)).slice(0, 25)
})
say('ADMIN PAGE doors:', JSON.stringify(adoors))
await shot(page, 'CD-C4-02-admin-page')

/* the Leave War's own person sheet — post out lives there */
await go(page, 'leavewar'); await page.waitForTimeout(1000)
const nameCell = page.locator(`[data-testid="person-${PIS}"]`).first()
if (await nameCell.count()) { await nameCell.click(); await page.waitForTimeout(900) }
const sheet = await page.evaluate(() => [...document.querySelectorAll('.sheet,[role=dialog]')].filter(e => e.offsetParent)
  .map(e => ({ text: (e.innerText || '').replace(/\s+/g, ' ').slice(0, 600), buttons: [...e.querySelectorAll('button')].map(b => (b.innerText || '').trim().slice(0, 24)) })))
say('THE PERSON SHEET ON THE WAR:', JSON.stringify(sheet, null, 1).slice(0, 1200))
await shot(page, 'CD-C4-03-person-sheet')

/* post him out from a date before Saturday and read the money */
const po = page.locator('button').filter({ hasText: /post(ed)? out|posting out/i }).first()
if (await po.count() && await po.isVisible()) {
  say('pressing:', (await po.innerText()).trim())
  await po.click(); await page.waitForTimeout(900)
  const after = await page.evaluate(() => [...document.querySelectorAll('.sheet,[role=dialog]')].filter(e => e.offsetParent).map(e => (e.innerText || '').replace(/\s+/g, ' ').slice(0, 500)))
  say('what it asks:', JSON.stringify(after))
  await shot(page, 'CD-C4-04-post-out-sheet')
}
say('errors:', JSON.stringify(errors.slice(0, 6)))
await browser.close()
