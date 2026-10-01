/* p7 walker C — probe 19: the Quals page's top buttons, by id, before and after Enable editing; and whether a column's
   ✕ saves at once (the stored list read right after one ✕, before any Save). */
import { boot, world } from './p6-lib.mjs'
const { L } = await boot()
const { browser, p } = await world(L)
await L.go(p, 'quals'); await L.sleep(400)
const btns = () => p.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null && b.closest('#page-quals, .qbar, .qtools, main') && /quals|Save|Enable|Export|Edit/i.test(b.innerText)).map(b => `#${b.id}:"${b.innerText.trim()}"`))
console.log('before', await btns())
await p.click('#qEdit'); await L.sleep(300)
console.log('editing', await btns())
await p.click('#qEditQuals'); await L.sleep(300)
console.log('edit quals', await btns())
await p.locator('#qtbl thead .qdel[data-del="tf"]').click(); await L.sleep(400); await L.settle(p)
console.log('stored after one ✕, no Save pressed:', await p.evaluate(() => localStorage.getItem('raptor:settings/qualcols')))
await browser.close()
