import { open, board, publish, oilMode, STATE } from './lib.mjs'
const di = 5
const { browser, page } = await open({ state: STATE })
await board(page, di)
await publish(page, di); await page.waitForTimeout(600)
await oilMode(page, true)
await page.locator('#schedBoard [data-oilp]:visible').filter({ hasText: 'Fable' }).first().click()
await page.waitForTimeout(600)
await oilMode(page, false); await page.waitForTimeout(700)
const after = await page.evaluate(() => {
  const b = document.querySelector('#schedBoard')
  const hits = [...b.querySelectorAll('*')]
    .filter(e => /chang|amend|AL\d|Not yet signed|sign off/i.test(e.innerText || '') && (e.innerText || '').length < 120 && e.children.length < 4)
    .map(e => ({ cls: (e.className || '').toString().slice(0, 40), id: e.id, txt: (e.innerText || '').replace(/\n/g, ' | ') }))
  return { ver: (b.querySelector('.verchip') || {}).innerText, hits: hits.slice(0, 12), top: b.innerText.slice(0, 350).replace(/\n/g, ' | ') }
})
console.log(JSON.stringify(after, null, 1))
await browser.close()
