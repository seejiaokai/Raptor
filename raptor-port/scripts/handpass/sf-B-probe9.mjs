import { launch, proveBundle, phone, shot, wait, tapEl } from './sf-B-lib.mjs'
console.log('sf-B-probe9 v1')
await proveBundle()
const browser = await launch()
try {
  const { ctx, page: p, errors } = await phone(browser, 'a')
  await tapEl(p, p.locator('#burger'), { label: 'burger' })
  await shot(p, 'probe-burger', { scale: 'css' })
  console.log(await p.evaluate(() => { const b = document.querySelector('#insightBtn'); const r = b.getBoundingClientRect(); return JSON.stringify({ vis: b.offsetParent !== null, r, cs: getComputedStyle(b).display, txt: b.innerText, par: b.parentElement.className + '#' + b.parentElement.id }) }))
  console.log('errors', errors)
} finally { await browser.close() }
