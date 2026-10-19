import * as L from './sf-C-lib.mjs'
const { launch, ctxOpen, openBoard, closeBoard, bPut, bType, bf, sleep, shot, go } = L
const b = await launch()
const { p } = await ctxOpen(b, {})
await go(p, 'editsched'); await p.evaluate(() => { window.addWave(5, 'sc') }); await sleep(500)
await openBoard(p, 5)
await p.getByRole('button', { name: 'Templates' }).first().click(); await sleep(800)
const t = await p.evaluate(() => { const m = [...document.querySelectorAll('[role=dialog], .tplwin, .wavemenu, .dtpl, [class*=tpl]')].filter(e => e.offsetParent); return m.map(e => e.className + '|' + e.innerHTML.replace(/\s+/g, ' ').slice(0, 1200)) })
console.log(t.join('\n---\n'))
await shot(p, 'x28-templates')
await b.close()
