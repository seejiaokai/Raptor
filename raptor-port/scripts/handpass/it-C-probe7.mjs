import * as C from './it-C-lib.mjs'
const w = await C.world('desk', 'us', { fresh: false })
const p = w.page
await C.openNew(w, '2026-07-22')
console.log(await p.evaluate(() => { const win = document.querySelector('[data-testid="win-inputedit"]'); return { html: win.querySelector('.inped-body').innerHTML.slice(0, 2500) } }).then(x => x.html))
await C.pic(w, 'probe7-member-new')
await w.browser.close()
