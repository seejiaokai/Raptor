/* [DB-READINESS] phase 7 — walker A, probe 3: Saturday — the name box door, OIL Earn's DOM on a Personal row, the window's earn half. */
import { boot, world, fileTimed, fileRange, oilButton } from './p6-lib.mjs'
import { handPut, chipAt, allChips, allSwitches, allPucks } from './seat-lib.mjs'
const { L, W } = await boot()
const { browser, p, errors } = await world(L)
await W.toastSpy(p)
const out = {}
const SAT = 5
const iid = await fileTimed(L, p, { person: 'bane', type: 'Personal', iso: '2026-07-18', from: '10:00', to: '11:00', remarks: 'P7A A3' })
await W.boardOn(p, SAT)
const ri = await p.evaluate(i => window.DAYS[5].ground.findIndex(r => r.src === i), iid)
out.ri = ri
out.putExtras = await handPut(p, `g:${SAT}.${ri}.+`, 'all')
out.chips = await allChips(p)
out.oilbtn0 = await p.evaluate(() => [...document.querySelectorAll('#sbOil, #schedBoard [data-oilmode]')].map(e => ({ id: e.id, vis: e.offsetParent !== null, txt: e.innerText, dis: e.disabled, title: e.title })))
out.oil = await oilButton(L, p)
out.oilday = await p.evaluate(() => window.OILDAY)
out.switches = await allSwitches(p)
out.pucks = await allPucks(p)
out.rowHtml = await p.evaluate(([d, ri]) => { const f = document.querySelector(`#schedBoard [data-fill="g:${d}.${ri}.+"], #schedBoard [data-slot="g:${d}.${ri}"]`); const row = f && (f.closest('.sb-arow') || f.parentElement); return row ? row.outerHTML.slice(0, 4000) : 'no row: ' + [...document.querySelectorAll('#schedBoard .sb-arow')].map(e => e.outerHTML.slice(0, 300)).join('\n') }, [SAT, ri])
await p.evaluate(() => { const c = document.querySelector('#schedBoard .oilcount'); if (c) c.scrollIntoView({ block: 'center' }) }); await L.sleep(300)
await L.shot(p, 'probe3-sat-oil-on')
const c = p.locator(`#schedBoard .oilcount[data-oilsent="i:${iid}"]:visible`).first()
out.chipCount = await c.count()
if (out.chipCount) { await c.click(); await L.sleep(500) }
out.win1 = await p.evaluate(() => { const w = [...document.querySelectorAll('.availwin')].find(x => !x.hidden && x.offsetWidth); return w ? { tabs: [...w.querySelectorAll('.win-tab')].map(t => t.outerHTML), from: w.querySelector('.win-from')?.innerText, foot: w.querySelector('.win-foot')?.innerText, n: w.querySelectorAll('[data-awp]').length } : null })
const t2 = p.locator('.availwin .win-tab').nth(1)
if (await t2.count()) { await t2.click(); await L.sleep(400) }
out.win2 = await p.evaluate(() => { const w = [...document.querySelectorAll('.availwin')].find(x => !x.hidden && x.offsetWidth); return w ? { html: w.outerHTML.slice(0, 3500), from: w.querySelector('.win-from')?.innerText, foot: w.querySelector('.win-foot')?.innerText, n: w.querySelectorAll('[data-awp]').length } : null })
await L.shot(p, 'probe3-sat-window-earn')
out.errors = errors
console.log(JSON.stringify(out, null, 1))
await browser.close()
