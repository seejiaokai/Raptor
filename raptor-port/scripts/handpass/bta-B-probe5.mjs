import * as T from './bta-B-lib.mjs'
const { K, B, L, W, sleep } = T
const { browser, p, errors } = await K.fresh()
try {
  await L.go(p, 'logic'); await sleep(800)
  console.log(await p.evaluate(() => {
    const h = [...document.querySelectorAll('#page-logic *')].find(e => e.children.length === 0 && /Leave, downchit and personal inputs/i.test(e.textContent))
    if (!h) return 'no heading'
    let g = h; for (let i = 0; i < 3 && g.parentElement; i++) g = g.parentElement
    return { hcls: h.className, htag: h.tagName, pcls: h.parentElement.className, gcls: g.className, html: g.outerHTML.replace(/\s+/g, ' ').slice(0, 2500) }
  }))
  await p.locator('#lgSearch').fill('no times'); await sleep(600)
  console.log(await p.evaluate(() => (document.querySelector('#page-logic') || document.body).innerText.replace(/\s+/g, ' ').slice(0, 1200)))
  await T.pic(p, 'probe-logic-search')
} catch (e) { console.log('ERR', e.stack) }
console.log(errors)
await browser.close()
