/* Two small door checks: what the History button opens, and which people the
   Leave War grid actually draws a row for. */
import { open, board, shot, go } from './lib.mjs'
import { PUB_STATE } from './cd-lib.mjs'

const di = 5
const say = (...a) => console.log(...a)
const { browser, page, errors } = await open({ state: PUB_STATE })
await board(page, di)

const before = await page.evaluate(() => document.body.innerHTML.length)
await page.locator('#sbHist').click()
await page.waitForTimeout(1200)
const hist = await page.evaluate(() => {
  const vis = e => !!(e.offsetParent || e.getClientRects().length)
  const news = [...document.querySelectorAll('[class*=hist],[id*=hist],[class*=Hist]')].filter(vis)
  return {
    found: news.map(e => ({ tag: e.tagName, cls: e.className.slice(0, 40), id: e.id, text: (e.innerText || '').replace(/\s+/g, ' ').slice(0, 700) })),
    sheets: [...document.querySelectorAll('.sheet,[class*=sheet],[role=dialog]')].filter(vis).map(e => ({ cls: e.className.slice(0, 40), text: (e.innerText || '').replace(/\s+/g, ' ').slice(0, 700) })),
  }
})
say('HISTORY:', JSON.stringify(hist, null, 1).slice(0, 2500))
await shot(page, 'CD-probe-history')
await page.keyboard.press('Escape'); await page.waitForTimeout(400)

await go(page, 'leavewar')
await page.waitForTimeout(1200)
const rows = await page.evaluate(() => {
  const ids = [...document.querySelectorAll('[data-testid^="row-"]')].map(e => e.getAttribute('data-testid').slice(4))
  return { count: ids.length, has: { ipman: ids.includes('ipman'), haowen: ids.includes('haowen'), bane: ids.includes('bane'), bruise: ids.includes('bruise'), mamba: ids.includes('mamba'), ignite: ids.includes('ignite') }, sample: ids.slice(0, 12) }
})
say('WAR ROWS:', JSON.stringify(rows))
const names = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="person-"]')].slice(0, 70).map(e => (e.innerText || '').trim()))
say('WAR NAMES:', names.join(' '))
say('errors:', JSON.stringify(errors.slice(0, 4)))
await browser.close()
