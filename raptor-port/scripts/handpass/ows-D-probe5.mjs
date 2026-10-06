import * as D from './ows-D-lib.mjs'
const { world, sleep, A, L, P, SAT } = D
const { browser, p, errors } = await world()
await L.go(p, 'editsched'); await sleep(400)
await A.toBoard(p, SAT)
await sleep(500)
await P(p, 'probe5-phone-board')
const bt = await p.evaluate(() => [...document.querySelectorAll('#schedBoard button, #schedBoard [role=button]')].map(b => `${b.id || '-'}|${(b.innerText || '').trim().slice(0, 20)}|${(b.title || '').slice(0, 50)}|vis=${b.offsetParent !== null}|${Math.round(b.getBoundingClientRect().x)},${Math.round(b.getBoundingClientRect().y)}`).slice(0, 40))
console.log(JSON.stringify(bt, null, 0))
await browser.close()
