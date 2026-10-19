import { launch, proveBundle, phone, wait, tapEl } from './sf-B-lib.mjs'
console.log('sf-B-probe3 v2')
await proveBundle()
const browser = await launch()
try {
  const { page: p, errors } = await phone(browser, 'a')
  await p.evaluate(() => window.go('editsched')); await wait(p, 600)
  await p.evaluate(() => window.openScheduler(6)); await p.waitForSelector('#schedBoard'); await wait(p, 800)
  await tapEl(p, p.locator('#schedBoard [data-wvadd="6"]'))
  console.log(await p.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetParent && /Flying wave|^SC$|AVALON|^BB$/.test((b.innerText||'').trim())).map(b => b.outerHTML.slice(0, 200)).join('\n')))
  console.log('errors', errors)
} finally { await browser.close() }
