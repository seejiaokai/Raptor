/* p7 walker C — probe 6: the PHONE — + Line, tap-arm an empty cockpit, the AIRCREW drawer, the week's own arm. */
import { boot, world } from './p6-lib.mjs'
import * as C from './p7-c-lib.mjs'
const { L, W } = await boot()
const { browser, p, errors } = await world(L, { phone: true })
await C.toastSpy(p)
const DI = 1
await W.boardOn(p, DI)
const add = p.locator('#schedBoard [data-gline="1.0"]:visible').first()
await add.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(200); await add.tap(); await L.sleep(600)
const cock = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-slot]')].filter(e => e.offsetParent !== null && /^1\.0\.\d+\.\d+\.[pw]$/.test(e.dataset.slot)).map(e => e.dataset.slot + (e.querySelector('[data-person]') ? '' : ' EMPTY')))
console.log('cockpits wave 1', cock, await C.toasts(p))
const emptyP = cock.find(k => / EMPTY/.test(k) && /\.p /.test(k)).split(' ')[0]
const seat = p.locator(`#schedBoard [data-slot="${emptyP}"]:visible`).first()
await seat.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(300)
await L.shot(p, 'probe6-phone-newline')
await seat.tap(); await L.sleep(600)
console.log('armed', await p.evaluate(() => window.armedKey()))
await L.shot(p, 'probe6-phone-armed')
const r = await p.evaluate(() => { const e = document.querySelector('#sbRoster'); const b = e.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height, cls: e.className, par: e.parentElement.className } })
console.log('roster box', r)
console.log('placeholder rows', await p.evaluate(() => [...document.querySelectorAll('#sbRoster .rpuck[data-person="all"], #sbRoster .rpuck[data-person="allavail"]')].map(e => { const b = e.getBoundingClientRect(); return { cls: e.className, x: Math.round(b.x), y: Math.round(b.y), row: (e.closest('.rall') || e.parentElement).innerText.replace(/\s+/g, ' ').slice(0, 160) } })))
const pk = p.locator('#sbRoster .rpuck[data-person="all"]').first()
const inView = await pk.evaluate(e => { const b = e.getBoundingClientRect(); return b.x >= 0 && b.x + b.width <= innerWidth })
console.log('placeholder in view', inView)
if (!inView) { const tab = p.locator('#schedBoard .crewtab:visible, #schedBoard [data-crewtab]:visible, #sbCrewTab:visible').first(); console.log('tab', await tab.count(), await p.evaluate(() => [...document.querySelectorAll('#schedBoard *')].filter(e => /AIRCREW/.test(e.innerText || '') && e.children.length < 3).map(e => e.tagName + '.' + e.className + '#' + e.id).slice(0, 6))) }
await pk.tap().catch(e => console.log('tap failed', e.message.split('\n')[0])); await L.sleep(400)
await L.shot(p, 'probe6-phone-tapped')
console.log('toasts', await C.toasts(p), 'seat', await p.evaluate(k => window.slotVal(k), emptyP), 'armed', await p.evaluate(() => window.armedKey()))
await p.keyboard.press('Escape')
// the phone week
await W.boardOff(p); await W.toEdit(L, p); await W.showDay(p, DI)
await L.shot(p, 'probe6-phone-week')
console.log('week: eRoster', await p.evaluate(() => { const e = document.querySelector('#eRoster'); if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height, vis: e.offsetParent !== null } }))
const ws = p.locator(`#eWeek [data-slot="${emptyP}"]:visible`).first()
console.log('week seat', await ws.count())
if (await ws.count()) { await ws.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await L.sleep(300); await ws.tap(); await L.sleep(600); console.log('week armed', await p.evaluate(() => window.armedKey())); await L.shot(p, 'probe6-phone-week-armed')
  console.log('eRoster after arm', await p.evaluate(() => { const e = document.querySelector('#eRoster'); const b = e.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height } }), await p.evaluate(() => [...document.querySelectorAll('.rpuck[data-person="all"]')].map(e => { const b = e.getBoundingClientRect(); return (e.closest('[id]') || {}).id + '@' + Math.round(b.x) + ',' + Math.round(b.y) + ' ' + e.className })))
}
console.log('errors', errors)
await browser.close()
