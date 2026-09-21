/* SETTLING A DISAGREEMENT BETWEEN THE TWO REVIEWS.
   The host's finding: a plain reload manufactures a pending amendment on a day
   that earns OIL, so the fix is to suppress it.
   Fable's answer: it is not a phantom — the family day's membership changes
   across the reload because the demo's posted-out man walks back in, so
   suppressing it would silence every real post-out made after a publish.
   One observation decides it: does the membership change? */
import { open, board, publish, closeBoard, go, STATE } from './lib.mjs'
const di = 5
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)

const members = () => page.evaluate(i => {
  const d = window.DAYS[i], P = window.PEOPLE
  const row = (d.allhands || []).find(a => /FAMILY DAY/i.test(a.prog || ''))
  const chip = [...document.querySelectorAll('#schedBoard .cntchip, #eWeek .cntchip, [class*=cnt]')]
    .map(e => (e.innerText || '').trim()).filter(Boolean).slice(0, 3)
  return { sentinel: row ? (Array.isArray(row.who) ? row.who.join(',') : row.who) : 'no row', chip }
}, di)
const expanded = async () => {
  const btn = page.locator('#sbOil'); await btn.click(); await page.waitForTimeout(800)
  const who = await page.evaluate(() => {
    const row = [...document.querySelectorAll('#schedBoard .sb-arow')].find(r => /FAMILY DAY/i.test(r.innerText || ''))
    return row ? [...row.querySelectorAll('[data-oilp]')].map(p => (p.innerText || '').split('\n')[0].trim()).sort() : []
  })
  await btn.click(); await page.waitForTimeout(600)
  return who
}
const pend = () => page.evaluate(() => {
  const b = document.querySelector('#schedBoard'), e = b.querySelector('.dbeak')
  return { beak: e ? e.innerText.replace(/\s+/g, ' ').trim() : 'none',
    ver: (b.querySelector('.verchip') || {}).innerText || '',
    pending: (b.innerText.match(/(\d+)\s+pending/) || [])[0] || 'none' }
})

const R = {}
R.pub = await publish(page, di); await page.waitForTimeout(700)
R.beforeReload = await pend()
R.membersBefore = await expanded()

await page.reload(); await page.waitForTimeout(1500)
await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
if (await page.locator('#luser').count()) {
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#vWeek .day'); await page.waitForTimeout(600)
}
await board(page, di)
R.afterReload = await pend()
R.membersAfter = await expanded()

const a = new Set(R.membersBefore), b = new Set(R.membersAfter)
R.cameBack = R.membersAfter.filter(x => !a.has(x))
R.wentAway = R.membersBefore.filter(x => !b.has(x))
R.errors = errors.slice(0, 6)
console.log('before reload :', JSON.stringify(R.beforeReload), ' members:', R.membersBefore.length)
console.log('after  reload :', JSON.stringify(R.afterReload), ' members:', R.membersAfter.length)
console.log('WALKED BACK IN:', JSON.stringify(R.cameBack))
console.log('DROPPED OUT   :', JSON.stringify(R.wentAway))
console.log('errors:', R.errors)
await browser.close()
