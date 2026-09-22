import { open, go, shot, STATE } from './lib.mjs'
const { browser, page } = await open({ state: STATE })
await go(page, 'inputs'); await page.waitForTimeout(1000)
const f = await page.evaluate(() => { const r = document.querySelector('#page-inputs'); if(!r) return 'NO PAGE'
  return { btns:[...r.querySelectorAll('button')].filter(e=>e.offsetParent!==null).map(e=>({t:(e.innerText||'').trim().slice(0,26),d:JSON.stringify(e.dataset)})).slice(0,18),
    fields:[...r.querySelectorAll('input,select,textarea')].filter(e=>e.offsetParent!==null)
      .map(e=>({tag:e.tagName,d:JSON.stringify(e.dataset),ph:e.placeholder||'',cls:e.className.slice(0,26),opts:e.tagName==='SELECT'?[...e.options].map(o=>o.value).slice(0,14):undefined})).slice(0,16) } })
console.log(JSON.stringify(f, null, 1))
await shot(page, 'RULE-probe-inputs2')
await browser.close()
