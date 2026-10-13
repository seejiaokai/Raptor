import * as L from './ibl.mjs'
const b = await L.launch()
const s = await L.session(b, process.argv[2] || 'desktop'), { page } = s
const iid = await L.fileIt(s, L.WED, { type: 'Training', people: ['bane'], from: '09:00', to: '12:00', title: 'Range brief' })
await L.openBoard(s, L.WED_DI)
console.log(await page.evaluate(() => { const e = document.querySelector('#sbBoard [data-slot="g:2.2"]'); const row = e.closest('.sb-arow') || e.parentElement.parentElement; return row.outerHTML.slice(0, 2500) }))
await b.close()
