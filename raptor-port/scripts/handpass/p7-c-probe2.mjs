/* p7 walker C — probe 2: how a cockpit seat arms, what the placeholder row says, how a seat is emptied. */
import { boot, world } from './p6-lib.mjs'
const { L, W } = await boot()
const S = await import('./seat-lib.mjs')
const { browser, p, errors } = await world(L)
const DI = 1, KEY = '1.0.0.0.p'
await W.boardOn(p, DI)
await W.toastSpy(p)
const seatHtml = () => p.evaluate(k => document.querySelector(`#schedBoard [data-slot="${k}"]`)?.outerHTML.slice(0, 600), KEY)
console.log('SEAT', await seatHtml())
const seat = p.locator(`#schedBoard [data-slot="${KEY}"]:visible`).first()
await seat.evaluate(e => e.scrollIntoView({ block: 'center' }))
await L.sleep(200)
// tap the seat (occupied)
await seat.click(); await L.sleep(300)
console.log('ARM after tap on occupied seat', await p.evaluate(() => JSON.stringify(window.ARM)), 'SEL', await p.evaluate(() => JSON.stringify(window.SEL || window.SELP || null)))
console.log('special row', await p.evaluate(() => [...document.querySelectorAll('#sbRoster [data-person="all"], #sbRoster [data-person="allavail"]')].filter(e => e.classList.contains('rpuck')).map(e => e.outerHTML.slice(0, 400) + ' || parentText: ' + (e.parentElement.innerText || '').slice(0, 200))))
await L.shot(p, 'probe2-armed-occupied')
await p.keyboard.press('Escape'); await L.sleep(200)
// how to empty: try a click on the puck inside the seat, then Delete
const puck = p.locator(`#schedBoard [data-slot="${KEY}"] .puck:visible`).first()
console.log('puck count', await puck.count())
if (await puck.count()) {
  await puck.click({ button: 'right' }); await L.sleep(400)
  console.log('after right-click', await seatHtml(), await W.toasts(p))
  await L.shot(p, 'probe2-rightclick')
}
console.log('ARM', await p.evaluate(() => JSON.stringify(window.ARM)))
await p.keyboard.press('Escape'); await L.sleep(200)
console.log('undo btn', await p.evaluate(() => { const b = document.querySelector('#sbUndo'); return b ? { dis: b.disabled, title: b.title } : null }))
console.log('view keys', await p.evaluate(() => Object.keys(window).filter(k => /arm|ARM|undo|hist|elog|ELOG|pending|SCHED|slot/i.test(k))))
console.log('errors', errors)
await browser.close()
