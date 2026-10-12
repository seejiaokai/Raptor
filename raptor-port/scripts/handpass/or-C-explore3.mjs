import * as L from './or-C-lib.mjs'
const { browser, page: p, errs } = await L.openWorld()
const f = await L.fileInput(p, { type: 'Duty', person: 'Ranger', from: '2026-07-18', to: '2026-07-18', timed: ['09:00', '12:00'], oil: 'yes' })
const iid = f[0].iid
await L.goEdit(p)
const di = 5
await p.locator('#eWeek .day:not(.peek)').nth(di).scrollIntoViewIfNeeded()
await L.drag(p, p.locator('#eRoster .rpuck[data-person="allavail"]:visible').first(), p.locator(`#eWeek [data-fill="g:${di}.0.+"] .addz`).first())
await L.openBoard(p, di)
await p.locator('#sbOil').click(); await p.waitForTimeout(700)
const info = await p.evaluate(() => ({
  items: [...document.querySelectorAll('#schedBoard [data-oilitem]')].filter(e=>e.offsetParent).map(e => e.tagName + '|' + e.getAttribute('data-oilitem') + '|' + e.className.slice(0, 60) + '|' + (e.innerText||'').replace(/\s+/g,' ').slice(0,40)),
  people: [...document.querySelectorAll('#schedBoard [data-oilp]')].filter(e=>e.offsetParent).map(e => e.getAttribute('data-oilp') + '|' + e.className + '|' + e.getAttribute('title')),
  sent: [...document.querySelectorAll('#schedBoard [data-oilsent]')].filter(e=>e.offsetParent).map(e => e.getAttribute('data-oilsent') + '|' + e.innerText),
  bar: ((document.querySelector('#schedBoard .sb-daybar, #schedBoard .sb-top') || {}).innerText || '').replace(/\s+/g, ' ').slice(0, 300),
}))
console.log(JSON.stringify(info, null, 1))
await L.shot(p, 'x3-oil')
const chip = p.locator('#schedBoard [data-oilsent]:visible').first()
await chip.scrollIntoViewIfNeeded()
await chip.click(); await p.waitForTimeout(500)
const w = await p.evaluate(() => { const w = document.querySelector('.availwin:not([hidden])'); if (!w) return null; return { title: w.querySelector('.win-ttl')?.innerText, tabs: [...w.querySelectorAll('.win-tab')].map(t => t.textContent.trim() + (t.classList.contains('on') ? ' [on]' : '')), foot: w.querySelector('.win-foot')?.textContent, rows: [...w.querySelectorAll('[data-awp]')].map(x => x.dataset.awp + '|' + x.className + '|' + (x.innerText||'').replace(/\s+/g,' ').slice(0,40)).slice(0, 8), n: w.querySelectorAll('[data-awp]').length } })
console.log(JSON.stringify(w, null, 1))
await L.shot(p, 'x3-win')
console.log(errs.join('\n'))
await browser.close()
