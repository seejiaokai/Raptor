import * as L from './ibl.mjs'
const size = process.argv[2] || 'desktop'
const b = await L.launch()
const s = await L.session(b, size), { page } = s
const iid = await L.fileIt(s, L.WED, { type: 'Training', people: ['bane'], from: '09:00', to: '12:00', title: 'Range brief' })
await L.openBoard(s, L.WED_DI)
const ri = await page.evaluate(([d, i]) => window.DAYS[d].ground.findIndex(r => r && String(r.src) === String(i)), [L.WED_DI, iid])
console.log('row index', ri, 'tally', JSON.stringify(await page.evaluate(() => Object.entries(window.PEOPLE || {}).filter(([k, v]) => k === 'nick').map(([k, v]) => v))))
console.log('slot els', JSON.stringify(await page.evaluate(([d, ri]) => [...document.querySelectorAll(`#sbBoard [data-slot^="g:${d}.${ri}"]`)].map(e => e.tagName + '.' + e.className + ' ' + e.getAttribute('data-slot') + ' "' + e.innerText.trim() + '"'), [L.WED_DI, ri])))
console.log('crew pucks nick', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('[data-who="nick"], [data-pid="nick"], [data-p="nick"], .puck[data-key="nick"]')].map(e => e.tagName + '.' + e.className + ' ' + [...e.attributes].map(a => a.name + '=' + a.value).join(' ')).slice(0, 6))))
console.log('crew pucks by text', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.puck')].filter(e => /^Tally/i.test(e.innerText.trim())).map(e => e.tagName + '.' + e.className + ' ' + [...e.attributes].map(a => a.name + '=' + a.value).join(' ') + ' in ' + (e.closest('[id]') || {}).id).slice(0, 6))))
console.log('hist', await page.locator('#sbHist').count(), await page.locator('#sbHist:visible').count())
await L.shot(s, `x15-${size}`)
await b.close()
