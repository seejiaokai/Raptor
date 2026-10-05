import * as H from './stk-D-lib.mjs'
const { open, nav, sleep, pic } = H
const { browser, page, errors } = await open({ width: 1440, height: 900, who: 'a', fresh: false, state: process.env.STK_STATE })
await nav(page, 'tracker'); await sleep(1500)
await pic(page, 'explore5-tracker')
console.log(await page.evaluate(() => {
  const root = document.querySelector('#page-tracker')
  const cls = {}
  for (const e of root.querySelectorAll('[class]')) for (const c of String(e.className).split(/\s+/)) if (c) cls[c] = (cls[c] || 0) + 1
  return Object.entries(cls).sort((a, b) => b[1] - a[1]).slice(0, 60).map(x => x.join(':')).join(' ')
}))
console.log(await page.evaluate(() => [...document.querySelectorAll('#page-tracker button')].filter(b => b.getBoundingClientRect().width > 0).map(b => (b.id || '') + '|' + b.innerText.trim().slice(0, 18)).slice(0, 40).join('  ')))
await nav(page, 'leavewar'); await sleep(1500)
console.log(await page.evaluate(() => [...document.querySelectorAll('#page-leavewar [data-testid]')].map(e => e.getAttribute('data-testid')).filter(t => !/^cell-/.test(t)).slice(0, 40).join(' ')))
console.log('errors', errors)
await browser.close()
