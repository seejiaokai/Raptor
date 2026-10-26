import { L, snap } from './h.mjs'
console.log('d4 v1')
const { browser, ctx, page, errors } = await L.open({ width: 1400, height: 900 })
await L.go(page, 'inputs'); await page.waitForTimeout(800)
await page.locator('#inSansMode').click(); await page.waitForTimeout(1000)
console.log(await page.evaluate(() => { const e = [...document.querySelectorAll('#page-inputs *')].filter(x => x.children.length===0 && x.innerText && x.innerText.trim()==='22')[0]; let r = e; const o=[]; for (let i=0;i<4&&r;i++){ o.push(r.tagName+'.'+r.className+' '+[...r.attributes].filter(a=>a.name.startsWith('data')).map(a=>a.name+'='+a.value).join(' ')); r=r.parentElement } return o.join('\n') }))
await browser.close()
