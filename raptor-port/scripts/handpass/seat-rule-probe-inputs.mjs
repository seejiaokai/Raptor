import { open, go, shot, STATE } from './lib.mjs'
const { browser, page } = await open({ state: STATE })
await go(page, 'inputs')
await page.waitForTimeout(900)
const f = await page.evaluate(() => ({
  fields: [...document.querySelectorAll('input,select,textarea')].filter(e=>e.offsetParent!==null)
    .map(e=>({tag:e.tagName, id:e.id, name:e.name, ph:e.placeholder||'', d:JSON.stringify(e.dataset), type:e.type,
      opts:e.tagName==='SELECT'?[...e.options].map(o=>o.value).slice(0,12):undefined})).slice(0,22),
  btns: [...document.querySelectorAll('button')].filter(e=>e.offsetParent!==null).map(e=>(e.innerText||'').trim()).slice(0,20),
}))
console.log(JSON.stringify(f, null, 1))
await shot(page, 'RULE-probe-inputs')
await browser.close()
