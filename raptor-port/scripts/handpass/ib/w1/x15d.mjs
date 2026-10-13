import * as L from './ibl.mjs'
const b = await L.launch()
const s = await L.session(b, 'phone'), { page } = s
await L.openBoard(s, L.WED_DI)
console.log(await page.evaluate(() => [...document.querySelectorAll('*')].filter(e => e.children.length === 0 && /^aircrew$/i.test((e.innerText || '').trim())).map(e => { let n = e, c = []; for (let i = 0; i < 4 && n; i++, n = n.parentElement) c.push(n.tagName + '#' + n.id + '.' + n.className); return c.join(' < ') }).join('\n')))
const t = page.locator('text=/^AIRCREW$/i').first()
await t.tap(); await page.waitForTimeout(600)
console.log(await page.evaluate(() => { const e = document.querySelector('#sbRoster'); const r = e.getBoundingClientRect(); return JSON.stringify([r.x, r.y, r.width, r.height]) }))
console.log(await L.shot(s, 'x15d-phone-open'))
await b.close()
