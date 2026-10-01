/* [DB-READINESS] phase 7 — walker A, probe 2: the placeholder on the Personal row's extras; the chip; the window's DOM. */
import { boot, world, fileTimed, fileRange } from './p6-lib.mjs'
import { handPut, chipAt, allChips } from './seat-lib.mjs'
const { L, W } = await boot()
const { browser, p, errors } = await world(L)
await W.toastSpy(p)
const out = {}
const iid = await fileTimed(L, p, { person: 'bane', type: 'Personal', iso: '2026-07-14', from: '10:00', to: '11:00', remarks: 'P7A A1' })
await W.boardOn(p, 1)
const ri = await p.evaluate(i => window.DAYS[1].ground.findIndex(r => r.src === i), iid)
out.ri = ri
out.rowHtml = await p.evaluate(([ri]) => { const f = document.querySelector(`#schedBoard [data-fill="g:1.${ri}.+"]`); const row = f.closest('.sb-arow, tr, .sb-row, .grow') || f.parentElement; return { cls: row.className, html: row.outerHTML.slice(0, 3500) } }, [ri])
out.put = await handPut(p, `g:1.${ri}.+`, 'allavail')
out.row = await p.evaluate(([ri]) => window.DAYS[1].ground[ri], [ri])
out.chip = await chipAt(p, `g:1.${ri}.+`)
out.chips = await allChips(p)
await p.evaluate(([ri]) => { const f = document.querySelector(`#schedBoard [data-fill="g:1.${ri}.+"]`); f.scrollIntoView({ block: 'center' }) }, [ri])
await L.sleep(300)
await L.shot(p, 'probe2-board-row-chip')
out.rowHtml2 = await p.evaluate(([ri]) => { const f = document.querySelector(`#schedBoard [data-fill="g:1.${ri}.+"]`); return f.outerHTML.slice(0, 2500) }, [ri])
const c = p.locator(`#schedBoard .oilcount[data-oilsent="i:${iid}"]:visible`).first()
out.chipCount = await c.count()
if (out.chipCount) { await c.click(); await L.sleep(500) }
out.win = await p.evaluate(() => { const w = [...document.querySelectorAll('.availwin')].find(x => !x.hidden && x.offsetWidth); return w ? { html: w.outerHTML.slice(0, 6000), n: w.querySelectorAll('[data-awp]').length } : null })
await L.shot(p, 'probe2-window')
out.oilbtn = await p.evaluate(() => [...document.querySelectorAll('#sbOil, #schedBoard [data-oilmode]')].map(e => ({ id: e.id, vis: e.offsetParent !== null, txt: e.innerText, dis: e.disabled, title: e.title })))
out.errors = errors
console.log(JSON.stringify(out, null, 1))
await browser.close()
