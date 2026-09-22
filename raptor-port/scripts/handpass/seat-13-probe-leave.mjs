/* Where does a member file an ABSENCE? The board's "+ INPUTS" door offers
   ground request types only, so leave has to come from somewhere else. */
import { open, go, shot, STATE } from './lib.mjs'
const { browser, page } = await open({ state: STATE })
await go(page, 'inputs')
await page.waitForTimeout(1200)
console.log(JSON.stringify(await page.evaluate(() => {
  const btns = [...document.querySelectorAll('button,[data-inpadd],[data-newinp],a')]
    .filter(e => e.offsetParent !== null)
    .map(e => ({ t: (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 26), add: e.getAttribute('data-inpadd'), id: e.id, cls: (e.className || '').toString().slice(0, 30) }))
    .filter(e => e.t || e.add)
  return { page: window.CURPAGE, buttons: btns.slice(0, 28) }
}), null, 1).slice(0, 2200))
await shot(page, 'PROBE-inputs-page')
await browser.close()
