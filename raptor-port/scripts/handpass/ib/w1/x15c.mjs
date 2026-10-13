import * as L from './ibl.mjs'
const b = await L.launch()
const s = await L.session(b, 'phone'), { page } = s
await L.openBoard(s, L.WED_DI)
console.log(await page.evaluate(() => [...document.querySelectorAll('button,[role=button],.crewtab,[class*=crew]')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && /crew/i.test((e.innerText || '') + e.id + e.className + (e.getAttribute('aria-label') || '') + (e.title || '')) }).map(e => e.tagName + '#' + e.id + '.' + String(e.className).slice(0, 40) + ' "' + (e.innerText || '').trim().slice(0, 30) + '" ' + JSON.stringify(e.getBoundingClientRect().toJSON ? [Math.round(e.getBoundingClientRect().x), Math.round(e.getBoundingClientRect().y), Math.round(e.getBoundingClientRect().width), Math.round(e.getBoundingClientRect().height)] : '')).join('\n')))
console.log(await L.shot(s, 'x15c-phone'))
console.log(await page.evaluate(() => { const e = document.querySelector('#sbRoster'); const r = e.getBoundingClientRect(); const p = e.closest('[id]'); return JSON.stringify({ r: [r.x, r.y, r.width, r.height], parent: e.parentElement.id + '.' + e.parentElement.className, cls: e.className }) }))
await b.close()
