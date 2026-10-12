import * as L from './on-RX1-lib.mjs'
const W = await L.world({ tag: 'x10' })
const { page } = W
await L.goBoard(W)
console.log(JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('#schedBoard button, #schedBoard [data-sbgo], #schedBoard [data-sbpick]')].filter(e => /Fri 17|‹|›/.test(e.textContent) || /Fri/.test(e.textContent)).map(e => e.tagName + '#' + e.id + '.' + e.className + ' [' + [...e.attributes].map(a => a.name + '=' + a.value.slice(0, 20)).join(' ') + '] ' + e.textContent.trim()).slice(0, 8))))
await W.ctx.close(); process.exit(0)
