// RX4-8: the second re-walk's RX3-4 with the clock MOVING. LL for Drifter, Hex, Hunter Wed 15 Jul (all day); publish; un-pick Hex, Save; advance clock; new LL for Hex 08:00-12:00.
import * as L from './or-RX5-lib.mjs'
const { j } = L
const out = {}
// the clock is INSTALLED (not fixed) at 2026-06-22T09:00 and left to RUN; later moved forward with clock.fastForward
const { ctx, page: p } = await L.open('ad', 'a', { running: true })
const t0 = await p.evaluate(() => new Date().toISOString())
const w0 = await p.evaluate(() => performance.now())
await p.waitForTimeout(1500)
const t1 = await p.evaluate(() => new Date().toISOString())
console.log('clock at start', t0, '-> 1.5 s later', t1, '(running:', t1 !== t0, ')')
out.clockCheck = [t0, t1]
const ll = (await L.fileInput(p, { type: 'LL', people: ['Drifter', 'Hex', 'Hunter'], from: L.ISO, to: L.ISO }))[0]
console.log('filed', j(ll)); const iid = ll.iid
out.pub = await L.signAndPublish(p, L.DI); console.log('PUBLISH', j(out.pub))
out.c0 = await L.counts(p, { noBoard: true }); console.log('COUNTS 0', L.fmt(out.c0))
const rec = id => p.evaluate(id => { const r = window.INPUTS.find(x => x.iid === id); return r ? JSON.parse(JSON.stringify(r)) : null }, id)
out.rec0 = await rec(iid); console.log('first LL record (full):', j(out.rec0))
await L.openFromList(p, iid)
await L.shot(p, 'rx4-8-1-leave-window')
const hid = await L.csId(p, 'Hex')
await p.locator(`${L.WIN} [data-pp="${hid}"]`).click(); await p.waitForTimeout(200)
out.pressedAfter = await p.evaluate(sel => [...document.querySelectorAll(`${sel} [data-pp][aria-pressed="true"]`)].map(b => window.PEOPLE[b.getAttribute('data-pp')]?.cs), L.WIN)
console.log('after un-pressing Hex:', j(out.pressedAfter))
await L.shot(p, 'rx4-8-2-hex-unpicked')
const m = await L.toastMark(p)
await p.locator('#inpEditSave').click(); await p.waitForTimeout(800)
out.saveToast = await L.toastsSince(p, m); console.log('save toasts:', out.saveToast)
out.afterTakeOut = (await L.allInputs(p)).filter(r => r.type === 'LL'); console.log('LL inputs after take-out:', j(out.afterTakeOut))
out.c1 = await L.counts(p, { keepWin: true, noBoard: true }); console.log('COUNTS taken out', L.fmt(out.c1))
await L.shot(p, 'rx4-8-3-togoout-taken-out')
await p.locator('.chgwin .win-x').first().click().catch(() => {}); await p.waitForTimeout(300)
// MOVE the clock: 5 minutes
const before = await p.evaluate(() => new Date().toISOString())
await p.clock.fastForward('05:00')
await p.waitForTimeout(500)
const after = await p.evaluate(() => new Date().toISOString())
console.log('clock moved with page.clock.fastForward("05:00"):', before, '->', after)
out.clockMove = [before, after]
const nl = await L.fileInput(p, { type: 'LL', person: 'Hex', from: L.ISO, to: L.ISO, timed: ['08:00', '12:00'] })
console.log('new LL filed:', j(nl)); out.newLL = nl
const nid = nl[0]?.iid
out.rec1 = nid ? await rec(nid) : null; console.log('new LL record (full):', j(out.rec1))
out.c2 = await L.counts(p, { keepWin: true, noBoard: true }); console.log('COUNTS new LL for Hex', L.fmt(out.c2))
await L.shot(p, 'rx4-8-4-togoout-new-leave')
out.winAll = await L.winRead(p); console.log('WINDOW', j(out.winAll))
await p.locator('.chgwin .win-x').first().click().catch(() => {}); await p.waitForTimeout(300)
out.firstAfter = await rec(iid); console.log('first LL record after take-out (full):', j(out.firstAfter))
out.at = { first: { at: out.rec0?.at ?? null, rec: Object.keys(out.rec0 || {}) }, second: { at: out.rec1?.at ?? null } }
out.inputsEnd = (await L.allInputs(p)).filter(r => r.type === 'LL'); console.log('LL inputs end:', j(out.inputsEnd))
await L.toWeek(p)
out.unav = await p.evaluate(di => { const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]; return [...d.querySelectorAll('.sec-unav .pl-row')].map(r => r.innerText.replace(/\s+/g, ' ').trim()) }, L.DI)
console.log('Wed unavailable rows:', j(out.unav))
console.log('ERRORS', L.errs.join(' | ') || 'none')
L.saveRes('8', out)
await ctx.close(); await L.browser.close()
