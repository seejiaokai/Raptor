import * as L from './icard-B-lib.mjs'
const browser = await L.launch()
const { ctx, page: p } = await L.open(browser, { width: 1440, height: 900 })
const sab = await L.csId(p, 'Saber')
await L.fileInput(p, false, { iso: '2026-07-20', type: 'Duty', who: sab, from: '09:00', to: '10:00', title: 'Cell test', rmk: 'Select this remark text please' })
const d = await L.rec(p, { person: sab, type: 'Duty', title: 'Cell test' })
await L.toList(p, false)
console.log(await p.evaluate(iid => { const tr = document.querySelector(`#inBody tr[data-iid="${iid}"]`); return [...tr.children].map(td => td.tagName + '[' + [...td.attributes].map(a => a.name + '=' + a.value).join(',') + '] ' + td.innerHTML.slice(0, 260)).join('\n----\n') }, d.iid))
await browser.close()
