import * as C from './ows-C-lib.mjs'
const { S, L, W, RC, world, pic, sleep } = C
const { browser, p, errors } = await world()
const f = await RC.fileInput(p, { person: 'bane', type: 'Duty', di: 5, allday: false, from: '06:00', to: '06:30', remarks: 'walker C duty request' })
console.log('FILED', JSON.stringify(f))
await C.reloadAs(p, 'm'); await sleep(600)
await L.go(p, 'inputs'); await sleep(900)
console.log('ROWS', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('#inBody tr')].map(t => (t.dataset.iid || '?') + ' :: ' + t.innerText.replace(/\s+/g, ' ').slice(0, 120) + ' :: ' + [...t.querySelectorAll('[data-edit],[data-del],[title]')].map(e => e.outerHTML.slice(0, 90)).join(' ; ')))))
console.log('FILTER', JSON.stringify(await p.evaluate(() => document.body.innerText.match(/Filter[^\n]*\n?[^\n]*/)?.[0])))
await pic(p, 'probe14b-member')
await browser.close()
