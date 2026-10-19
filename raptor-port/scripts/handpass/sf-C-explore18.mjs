import * as L from './sf-C-lib.mjs'
const { launch, ctxOpen, sleep, shot, go, errors } = L
const b = await launch()
const { p } = await ctxOpen(b, { who: 'u' })
await go(p, 'inputs'); await sleep(800)
await p.locator('#inListBtn').click(); await sleep(600)
await p.locator('#inNew').click(); await sleep(1000)
await shot(p, 'x18-new')
const els = await p.evaluate(() => { const w = [...document.querySelectorAll('[role=dialog], .inpwin, #inpEditPop, [class*=inpwin], [class*=ipw]')].filter(e => e.offsetParent); return w.map(d => d.id + '|' + d.className + '|' + [...d.querySelectorAll('button,select,input,textarea,[data-testid]')].filter(e => e.offsetParent).map(e => (e.dataset.testid || e.id || e.name || e.className) + ':' + (e.innerText || e.value || '').toString().trim().slice(0, 16)).join(' ; ')) })
console.log(els.join('\n---\n'))
await b.close()
