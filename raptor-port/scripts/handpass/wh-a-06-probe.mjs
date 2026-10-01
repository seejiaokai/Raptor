/* [WARN-HIDE-KEPT] walker A — probe 6 (own world, nothing recorded): the ALL AVAIL window's DOM around a flagged man. */
import { world, L, W } from './wh-a-lib.mjs'
import { handPut } from './seat-lib.mjs'
const { browser, p, errors } = await world(); p.setDefaultTimeout(6000)
try {
  await L.go(p, 'editsched'); await W.boardOn(p, 1)
  await handPut(p, 'a:1.1.+', 'allavail')
  await p.locator('#schedBoard .oilcount:visible').first().click(); await L.sleep(600)
  console.log(await p.evaluate(() => ['casper', 'salsa', 'nact', 'rocky'].map(id => { const r = document.querySelector(`.availwin .rpuck[data-awp="${id}"]`); if (!r) return id + ': not in the window'; return id + ' :: ' + r.outerHTML.slice(0, 500) + '\n   PARENT ' + r.parentElement.tagName + '.' + r.parentElement.className + '\n   NEXT ' + (r.nextElementSibling ? r.nextElementSibling.outerHTML.slice(0, 300) : 'none') }).join('\n')))
  console.log('foot:', await p.evaluate(() => { const w = document.querySelector('.availwin'); return [...w.children].map(c => c.className + ' :: ' + c.innerText.replace(/\n+/g, ' | ').slice(0, 120)).join('\n   ') }))
} catch (e) { console.log('PROBE ERROR', String(e).split('\n')[0]) }
await browser.close()
