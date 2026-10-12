import * as L from './or-C-lib.mjs'
const { browser, page: p, errs } = await L.openWorld()
const sat = (await L.fileInput(p, { type: 'Training', person: 'Ranger', from: '2026-07-18', to: '2026-07-18', timed: ['09:00', '12:00'], title: 'Sat drill', oil: 'yes' }))[0]
await L.oilOn(p, 5, true)
console.log('on: OILDAY', await p.evaluate(() => window.OILDAY), 'cx buttons', await p.locator('#schedBoard [data-grcx]').count())
await L.oilOn(p, 5, false)
console.log('off: OILDAY', await p.evaluate(() => window.OILDAY), 'cx buttons', await p.locator('#schedBoard [data-grcx]').count(), 'visible', await p.locator('#schedBoard [data-grcx]:visible').count())
console.log(await p.evaluate(() => [...document.querySelectorAll('#schedBoard button')].filter(b => b.offsetParent).map(b => (b.id || '') + ':' + (b.textContent || '').trim().slice(0, 14)).slice(0, 30).join(' | ')))
console.log(await p.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-panel.grnd .sb-arow')].map(r => r.className + ' :: ' + r.innerHTML.slice(0, 200)).join('\n')))
await browser.close()
