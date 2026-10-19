import { launch, ctxOpen, SIZES, sleep, go, shot } from './lib.mjs'
console.log('explore4 v1')
const b = await launch()
const { ctx, p } = await ctxOpen(b, SIZES.desk, 'x')
await go(p, 'editsched')
const r = await p.evaluate(() => {
  const d = document.querySelector('#eWeek .day[data-day="5"]')
  const els = [...d.querySelectorAll('*')].filter(e => /wave|\+ ?add|\+ ?line/i.test((e.innerText || '').slice(0, 40)) && e.children.length < 3 && (e.innerText || '').length < 40)
  return els.slice(0, 40).map(e => e.tagName + '.' + e.className + '|' + (e.innerText || '').trim() + '|' + [...e.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(','))
})
console.log(r.join('\n'))
const el = p.locator('#eWeek .day[data-day="5"] >> text=/Flying/i').first()
console.log('flying heading count', await el.count())
await b.close()
