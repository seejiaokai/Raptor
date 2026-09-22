/* Every drop zone the board actually draws, so the sweep uses real addresses. */
import { open, board, STATE } from './lib.mjs'
const di = 5
const { browser, page } = await open({ state: STATE })
await board(page, di)
const keys = await page.evaluate(() => {
  const b = document.querySelector('#schedBoard')
  const seen = []
  for (const e of b.querySelectorAll('[data-slot],[data-fill]')) {
    if (e.offsetParent === null) continue
    seen.push({ k: e.dataset.slot || e.dataset.fill, how: e.dataset.slot ? 'slot' : 'fill',
      holds: [...e.querySelectorAll('[data-person]')].map(x=>x.dataset.person).join(','),
      cls: e.className.slice(0,40) })
  }
  return seen
})
const g = {}
for (const k of keys) { const kind = k.k.split(':')[0].match(/^\d/) ? 'fly' : k.k.split(':')[0]; (g[kind] ||= []).push(`${k.how} ${k.k} [${k.holds}]`) }
for (const kind of Object.keys(g)) { console.log('===', kind, `(${g[kind].length})`); console.log('  ' + g[kind].join('\n  ')) }
await browser.close()
