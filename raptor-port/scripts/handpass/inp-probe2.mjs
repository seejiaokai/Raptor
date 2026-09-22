import { open, go } from './lib.mjs'
const { browser, page } = await open({ state: 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json' })
await go(page, 'inputs')
const before = await page.evaluate(() => document.querySelectorAll('input,select').length)
await page.click('#inAdd')
await page.waitForTimeout(1200)
console.log(JSON.stringify(await page.evaluate((b) => {
  const dlgs = [...document.querySelectorAll('dialog,[role=dialog],.pop,.modal,[class*=pop],[class*=modal]')]
    .filter(e => e.offsetParent)
    .map(e => ({ id: e.id, cls: (e.className||'').toString().slice(0,40), txt: (e.innerText||'').replace(/\s+/g,' ').slice(0,150) }))
  return { fieldsBefore: b, fieldsNow: document.querySelectorAll('input,select').length, dlgs: dlgs.slice(0,8) }
}, before), null, 1))
await browser.close()
