import * as S from './stk-TS-lib.mjs'
const { L, W, world, pic } = S
const { browser, p, errors } = await world()
await L.go(p, 'editsched')
await W.boardOn(p, 0)
console.log(await p.evaluate(() => ({
  sbInsights: !!document.querySelector('#sbInsights'), sbMore: !!document.querySelector('#sbMore'),
  anyIns: [...document.querySelectorAll('#schedBoard *')].filter(e => /insight/i.test(e.id + e.className + (e.title || '') + (e.getAttribute('aria-label') || '') + (e.children.length ? '' : e.innerText))).map(e => e.tagName + '#' + e.id + '.' + e.className + ' vis=' + (e.offsetParent !== null)).slice(0, 10),
  bar: document.querySelector('#schedBoard .sb-top, #schedBoard header, #schedBoard .sbbar')?.innerText?.replace(/\s+/g, ' ').slice(0, 200),
  w: innerWidth,
  ver: document.querySelector('meta[name=build], #buildTag')?.outerHTML || '',
})))
await pic(p, 'probe-board-bar')
console.log('errors', errors)
await browser.close()
