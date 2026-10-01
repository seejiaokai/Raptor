/* [DB-READINESS] phase 7 — walker A, probe 4: the doors to a request row's NAME BOX — tap-arm, drag from the crew list. */
import { boot, world, fileTimed, fileRange } from './p6-lib.mjs'
import * as S from './seat-lib.mjs'
const { L, W } = await boot()
const { browser, p, errors } = await world(L)
await W.toastSpy(p)
const out = {}
const SAT = 5
const iid = await fileRange(L, p, { person: 'bane', type: 'Personal', fromIso: '2026-07-18', toIso: '2026-07-18', remarks: 'P7A A2' })
await W.boardOn(p, SAT)
const ri = await p.evaluate(i => window.DAYS[5].ground.findIndex(r => r.src === i), iid)
const seat = p.locator(`#schedBoard [data-slot="g:${SAT}.${ri}"]:visible`).first()
await seat.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(200)
/* 1: a tap on the requester's puck in the name seat */
await seat.click(); await L.sleep(400)
out.afterTap = await p.evaluate(() => ({ arm: window.ARM ? JSON.parse(JSON.stringify(window.ARM)) : null, sel: window.SEL || null, toast: document.getElementById('toastEl')?.textContent, armedEls: [...document.querySelectorAll('#schedBoard .armed, #schedBoard .arm')].map(e => e.outerHTML.slice(0, 160)) }))
await L.shot(p, 'probe4-1-tap-name-seat')
await p.keyboard.press('Escape'); await L.sleep(200)
/* 2: a second tap (double) */
await seat.dblclick(); await L.sleep(400)
out.afterDbl = await p.evaluate(() => ({ arm: window.ARM ? JSON.parse(JSON.stringify(window.ARM)) : null, toast: document.getElementById('toastEl')?.textContent, row: window.DAYS[5].ground[0] }))
await L.shot(p, 'probe4-2-dbl-name-seat')
await p.keyboard.press('Escape'); await L.sleep(200)
/* 3: a real drag of ALL from the crew list onto the name seat */
const src = p.locator('#sbRoster .rpuck[data-person="all"]:visible').first()
try { await W.drag(p, src, seat); out.drag = 'dragged' } catch (e) { out.drag = String(e.message) }
out.afterDrag = await p.evaluate(() => ({ row: window.DAYS[5].ground[0], toast: document.getElementById('toastEl')?.textContent }))
out.toasts = await W.toasts(p)
out.holds = await S.seatHolds(p, `g:${SAT}.${ri}`)
out.chips = await S.allChips(p)
await L.shot(p, 'probe4-3-drag-all-name-seat')
out.rowHtml = await p.evaluate(([d, ri]) => { const f = document.querySelector(`#schedBoard [data-fill="g:${d}.${ri}.+"]`); return f ? f.outerHTML.slice(0, 1500) : null }, [SAT, ri])
out.errors = errors
console.log(JSON.stringify(out, null, 1))
await browser.close()
