import * as H from './wh-lib.mjs'
const { L } = H
const { browser, p, errors } = await H.world({ who: 'a', phone: false })
await L.go(p, 'inputs')
await p.waitForSelector('#inRangeBtn')
console.log('types', await p.evaluate(() => [...document.querySelectorAll('#inType option')].map(o => o.value + '=' + o.text)))
console.log('persons', await p.evaluate(() => [...document.querySelectorAll('#inPerson option')].map(o => o.value + '=' + o.text).slice(0, 30)))
console.log('inputs', await p.evaluate(() => window.INPUTS.map(x => [x.iid, x.person, x.type, x.date, x.endDate, x.acc, x.remarks].join('|'))))
console.log('form html', await p.evaluate(() => document.querySelector('#inType').closest('div,form,section').parentElement.innerText.replace(/\s+/g, ' ').slice(0, 600)))
await H.pic(p, 'inputs')
await browser.close()
console.log(errors)
