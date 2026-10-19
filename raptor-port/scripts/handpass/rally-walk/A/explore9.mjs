import { launch, ctxOpen, SIZES, sleep, go, shot, buildSat, model, bPublish, warns } from './lib.mjs'
console.log('explore9 v1')
const b = await launch()
const { ctx, p } = await ctxOpen(b, SIZES.desk, 'x')
await buildSat(p); await bPublish(p, 5)
await p.locator('#sbOil').click(); await sleep(900)
const t = await p.evaluate(() => ({
  items: [...document.querySelectorAll('#schedBoard [data-oilitem]')].map(e => (e.innerText || '').replace(/\s+/g, ' ').slice(0, 200) + '|' + [...e.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(',')),
  bar: [...document.querySelectorAll('#schedBoard .oil, #schedBoard [class*=oilbar], #schedBoard [class*=oilmode]')].map(e => e.className + ':' + (e.innerText || '').replace(/\s+/g, ' ').slice(0, 120)).slice(0, 8),
  side: (document.querySelector('#sbSide')?.innerText || '').replace(/\s+/g, ' ').slice(0, 500),
  pucks: [...document.querySelectorAll('#schedBoard .puck[data-person]')].filter(e => !e.closest('#sbRoster')).map(e => e.dataset.person + ' ' + e.className.slice(0, 60) + ' ' + (e.title || '').slice(0, 200))
}))
console.log(JSON.stringify(t, null, 1))
await shot(p, 'explore-oil')
await b.close()
