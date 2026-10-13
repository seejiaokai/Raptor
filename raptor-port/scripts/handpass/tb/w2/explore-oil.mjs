/* explore: where is OIL Earn, and the ground rows' buttons.  node explore-oil.mjs phone|desk */
import { L, openBoard, sleep } from './w2lib.mjs'
console.log('explore-oil v1')
const size = process.argv[2] || 'desk'
const w = await L.world(size)
const p = w.page
try {
  await openBoard(w, +(process.argv[3] || 1))
  const f = async () => p.evaluate(() => [...document.querySelectorAll('#schedBoard *')].filter(e => e.getBoundingClientRect().width > 0 && e.children.length === 0 && /oil/i.test(e.textContent || '') && (e.textContent || '').length < 60).slice(0, 25).map(e => `${e.tagName}#${e.id}.${String(e.className).slice(0, 24)} "${e.textContent.trim().slice(0, 40)}" ${[...e.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(',').slice(0, 50)} parent=${e.parentElement.tagName}.${String(e.parentElement.className).slice(0, 20)}`))
  console.log('OIL texts:\n' + (await f()).join('\n'))
  const g = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-ginfo], #sbOil, [data-oilmode], [data-gi], [data-grow], #schedBoard [data-gflag], #schedBoard [data-gcx], #schedBoard [data-oilmode], #schedBoard [data-sbmore], #schedBoard #sbMore, #schedBoard [id^=sb]')].filter(b => b.getBoundingClientRect().width > 0).map(b => `${b.tagName}#${b.id}|${(b.textContent || '').trim().slice(0, 20)}|${[...b.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(',').slice(0, 40)}`))
  console.log('G:\n' + g.join('\n'))
  await L.pic(w, `explore-${size}-oil`)
} finally { await L.close(w) }
