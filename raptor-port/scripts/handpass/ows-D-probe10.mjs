import * as D from './ows-D-lib.mjs'
const { world, sleep, A, L, P, SAT } = D
const { browser, p, errors } = await world()
await L.go(p, 'editsched'); await sleep(300)
await A.toBoard(p, SAT)
await p.locator(`#schedBoard [data-wvadd="${SAT}"]`).first().click(); await sleep(500)
await p.locator('[data-wvedit]:visible').first().click(); await sleep(800); await p.locator('#waveTplModal button', { hasText: /New wave template/ }).first().click(); await sleep(800)
const m = await p.evaluate(() => { const e = document.querySelector('.modal:not([hidden])'); return e ? { id: e.id, txt: e.innerText.replace(/\s+/g, ' ').slice(0, 900), btns: [...e.querySelectorAll('button, input, select')].filter(x => x.offsetParent !== null).map(x => `${x.tagName}|${x.id}|${x.className}|${(x.innerText || x.value || x.placeholder || '').slice(0, 25)}|${Object.entries(x.dataset).map(([k, v]) => k + '=' + v).join(',')}`) } : null })
console.log(JSON.stringify(m, null, 0))
await P(p, 'probe10-wavetpl')
await browser.close()
