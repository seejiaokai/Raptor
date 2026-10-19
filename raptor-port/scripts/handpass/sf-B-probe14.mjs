import { launch, proveBundle, phone, wait, tapEl, shot, weekTo, swipe } from './sf-B-lib.mjs'
console.log('sf-B-probe14 v2')
await proveBundle()
const browser = await launch()
try {
  const { ctx, page: p, errors } = await phone(browser, 'a')
  await p.evaluate(() => window.go('editsched')); await wait(p, 600)
  console.log(await p.evaluate(() => [...document.querySelector('#eWeek').parentElement.children].map(e => e.tagName + '.' + e.className + '#' + e.id + ' w=' + Math.round(e.getBoundingClientRect().width)).join('\n')))
  console.log(await p.evaluate(() => [...document.querySelectorAll('#eWeek > *')].map(e => e.tagName + '.' + e.className).join(' | ')))
  console.log(await p.evaluate(() => { const w = document.querySelector('#eWeek'); return [w.scrollWidth, w.clientWidth].join(' ') }))
  console.log(await p.evaluate(() => [...document.querySelectorAll('.peek-nextwk, [class*=peek]')].map(e => e.tagName + '.' + e.className + ' vis=' + (e.offsetParent !== null) + ' ' + Math.round(e.getBoundingClientRect().left)).slice(0, 8).join('\n')))
  console.log('errors', errors)
} finally { await browser.close() }
