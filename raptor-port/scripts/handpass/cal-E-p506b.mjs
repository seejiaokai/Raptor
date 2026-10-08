// P5-06 follow-up: does a ghost stay after Escape pressed mid bar-drag, then the mouse released?
import { launch, world, toInputs, toMonth, bar, shot, seedFile, recOf, dayCentre } from './cal-E-lib.mjs'
const b = await launch()
const w = await world(b, 'desk'); const p = w.page
await toInputs(p); await toMonth(p, 2026, 10)
const sid = await p.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Saber'))
const [iid] = await seedFile(p, [{ pid: sid, type: 'LL', from: 'Oct 13', to: 'Oct 15', remarks: 'bar' }])
await p.waitForTimeout(400)
const bb = await bar(p, iid).first().boundingBox(); const y = bb.y + bb.height / 2
const g1 = await dayCentre(p, '2026-10-14'), g2 = await dayCentre(p, '2026-10-16')
const info = async t => console.log(t, JSON.stringify(await p.evaluate(() => ({ ghost: document.querySelectorAll('.ic-ghost').length, over: document.querySelectorAll('.ic-over').length, rec: JSON.stringify(window.INPUTS.filter(x => x.remarks === 'bar').map(x => [x.date, x.endDate])), bodyCls: document.body.className }))))
await p.mouse.move(g1.x, y); await p.mouse.down(); await p.mouse.move(g2.x, y + 4, { steps: 8 })
await info('mid-drag')
await p.keyboard.press('Escape'); await p.waitForTimeout(300)
await info('after Escape (button still down)')
await shot(p, 'p506b-1-after-escape')
await p.mouse.up(); await p.waitForTimeout(600)
await info('after release')
await shot(p, 'p506b-2-after-release')
await p.mouse.move(700, 700); await p.waitForTimeout(500)
await info('after moving away')
await shot(p, 'p506b-3-after-move-away')
await p.mouse.down(); await p.mouse.up(); await p.waitForTimeout(600); await info('after a later click'); await shot(p, 'p506b-4-after-later-click'); await p.mouse.move(300, 300); await p.waitForTimeout(300); await info('after moving again'); console.log(w.errors)
await b.close()
