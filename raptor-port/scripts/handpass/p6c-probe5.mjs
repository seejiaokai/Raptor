/* phase 6 (c) check — §8 item 6: a request on a week nobody has opened shows on the next-week preview (its picture).
   Filed for Tue 21 Jul from week 1; the preview's Tuesday is brought to the front the way its scrollbar would. */
import { world, fileTimed } from './p6-lib.mjs'
const L = await import('./dbrA-lib.mjs'); const W = await import('./dbrA-W1-lib.mjs')
const { browser, p } = await world(L)
await fileTimed(L, p, { person: 'bane', type: 'Meeting', iso: '2026-07-21', from: '10:00', to: '11:00', remarks: 'P6C PEEK' })
await W.toEdit(L, p)
const sel = '#eWeek .day.peek[data-peek-day="1"]'
const text = await p.evaluate(s => { const e = document.querySelector(s); return e ? e.innerText : null }, sel)
console.log('the preview\'s Tuesday shows it:', /P6C PEEK/.test(text || ''))
await p.evaluate(s => {
  const e = document.querySelector(s); if (!e) return
  let sc = e.parentElement; while (sc && sc.scrollWidth <= sc.clientWidth) sc = sc.parentElement
  if (!sc) return
  sc.scrollLeft += e.getBoundingClientRect().left - sc.getBoundingClientRect().left - 20
  const g = [...e.querySelectorAll('*')].find(x => /P6C PEEK/.test(x.textContent || '') && !x.children.length)
  if (g) g.scrollIntoView({ block: 'center' })
}, sel)
await L.sleep(600)
await L.shot(p, 'X4b-peek-tuesday-' + (process.env.HP_TAG || 'x'))
await browser.close()
