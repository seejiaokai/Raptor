import { launch, proveBundle, phone, shot, wait, tapEl } from './sf-B-lib.mjs'
console.log('sf-B-probe7 v2')
await proveBundle()
const browser = await launch()
try {
  const { ctx, page: p, errors } = await phone(browser, 'a')
  console.log(await p.evaluate(() => [...document.querySelectorAll('header button, .topbar button, #topbar button')].slice(0, 8).map(b => b.id + '|' + b.className + '|' + (b.title || b.getAttribute('aria-label') || '')).join('\n')))
  const h = p.locator('header button, .topbar button, #topbar button').first()
  await tapEl(p, h, { label: 'menu' })
  console.log(await p.evaluate(() => [...document.querySelectorAll('button, a')].filter(b => b.offsetParent && /Insights|View-only|Edit Schedule|Leave|Tracker|OIL/i.test(b.innerText || '')).map(b => (b.innerText || '').trim().slice(0, 30) + '|' + b.tagName + '|' + b.id + '|' + [...b.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(',')).join('\n')))
  await shot(p, 'probe-menu', { scale: 'css' })
  console.log('errors', errors)
} finally { await browser.close() }
