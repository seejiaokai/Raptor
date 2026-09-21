/* D6 part two — what the app SAYS when a day with a blind desk is published,
   and whether a leave bid can be put on that Saturday at all. */
import { open, board, shot, go } from './lib.mjs'
import { warCells, dayWarn, signAndPublish, BASE_STATE } from './cd-lib.mjs'

const di = 5, SAT = '2026-07-18'
const say = (...a) => console.log(...a)
async function watchToast(page) {
  await page.evaluate(() => {
    window.__t = []
    const rec = () => { const e = document.getElementById('toastEl'); if (e) { const s = (e.innerText || '').replace(/\s+/g, ' ').trim(); if (s && !window.__t.includes(s)) window.__t.push(s) } }
    new MutationObserver(rec).observe(document.body, { childList: true, subtree: true, characterData: true })
    window.__ti = setInterval(rec, 120)
  })
}
const toasts = p => p.evaluate(() => window.__t || [])

const { browser, page, errors } = await open({ state: BASE_STATE })
await board(page, di)
const FAB = await page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Fable'))

/* what stage is the Leave War in, and can a bid be put on 18 Jul? */
await go(page, 'leavewar'); await page.waitForTimeout(1100)
const stage = await page.evaluate(() => {
  const t = (document.body.innerText || '').replace(/\s+/g, ' ')
  const m = t.match(/(Bidding (open|closed)|Published|Draft)[^|]{0,40}/i)
  return { hint: m ? m[0] : null, head: t.slice(0, 260) }
})
say('THE WAR SAYS:', JSON.stringify(stage))
const cell = page.locator(`[data-testid="cell-${FAB}-${SAT}"]`).first()
await cell.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(300)
const b = await cell.boundingBox()
await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down(); await page.waitForTimeout(120); await page.mouse.up()
await page.waitForTimeout(1100)
const llBtn = page.locator('[class*=sheet] button').filter({ hasText: /^LL$/ }).first()
say('LL offered?', await llBtn.count() > 0, 'visible?', await llBtn.count() ? await llBtn.isVisible() : false)
if (await llBtn.count()) {
  await llBtn.click(); await page.waitForTimeout(1200)
  say('after pressing LL the sheet says:', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('[class*=sheet]')].filter(e => e.offsetParent).map(e => (e.innerText || '').replace(/\s+/g, ' ').slice(0, 260)))).slice(0, 800))
  /* the sheet asks for the same leave a second time to go ahead */
  const again = page.locator('[class*=sheet] button').filter({ hasText: /^LL$/ }).first()
  if (await again.count() && await again.isVisible()) { say('tapping LL again to go ahead'); await again.click(); await page.waitForTimeout(1300) }
  say('the sheet now says:', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('[class*=sheet]')].filter(e => e.offsetParent).map(e => (e.innerText || '').replace(/\s+/g, ' ').slice(0, 220)))).slice(0, 700))
}
await page.keyboard.press('Escape'); await page.waitForTimeout(600)
say('his Saturday cell now:', JSON.stringify(await warCells(page, [[FAB, SAT]])))
await shot(page, 'CD-D6-07-bid-attempt')

/* now publish, watching the toast strip */
await board(page, di)
await watchToast(page)
say('warning list before the publish:', JSON.stringify(await dayWarn(page)))
const r = await signAndPublish(page, di)
say('PUBLISH ->', (r.head || {}).headRow || r.why)
await page.waitForTimeout(2500)
say('WHAT THE APP SAID AT PUBLISH:')
const ts = await toasts(page)
if (!ts.length) say('   (nothing — no message appeared)')
ts.forEach(t => say('   * ' + t))
await shot(page, 'CD-D6-08-publish-message')
say('WAR after the publish:', JSON.stringify(await warCells(page, [[FAB, SAT]])))
say('errors:', JSON.stringify(errors.slice(0, 6)))
await browser.close()
