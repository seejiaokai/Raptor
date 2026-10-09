// Scenario 40 - Take off and accept again. usage: node it-B-s40.mjs desk
import * as L from './it-B-lib.mjs'
const size = process.argv[2] || 'desk'
const DI = 2, ISO = '2026-07-15'
const FOC = 'sports day|^event$'
const W = await L.mk(size)
const p = W.page
L.setWeek(null)
const ranger = await L.csId(p, 'Ranger')
const tag = `s40-${size}`
await L.fileInput(W, { iso: ISO, type: 'Event', person: ranger, s: '09:00', e: '10:00', title: 'Sports day', rmk: 'titled one' })
const r = await L.recBy(p, { person: ranger, type: 'Event' })
await L.pubDay(W, DI)
await p.evaluate(() => { window.__t = []; new MutationObserver(() => { const t = document.getElementById('toastEl'); if (t && t.textContent && window.__t[window.__t.length - 1] !== t.textContent) window.__t.push(t.textContent) }).observe(document.body, { subtree: true, childList: true, characterData: true }) })
const tt = () => p.evaluate(() => { const a = window.__t; window.__t = []; return a })
const base = await L.snap(W, DI, { focus: FOC, pic: tag + '-0published' })
// take off through the board's Personal Inputs panel
await L.openBoard(W, DI)
if (await p.locator('#schedBoard [data-pitog]').count()) { await p.locator('#schedBoard [data-pitog]').first().click(); await L.sleep(500) }
await tt()
const x = p.locator(`#schedBoard [data-acc="x"][data-acck="${r.iid}"]`).first()
const hadX = await x.count()
const xLabel = hadX ? ((await x.innerText()) + ' / ' + (await x.getAttribute('title'))) : ''
if (hadX) { await x.evaluate(e => e.scrollIntoView({ block: 'center' })); await (W.mobile ? x.tap() : x.click()); await L.sleep(900) }
const t1 = await tt()
await L.shot(p, tag + '-1takeoff-board')
await L.closeBoard(p)
const off = await L.snap(W, DI, { focus: FOC, pic: tag + '-1takeoff' })
const recOff = await L.rec(p, r.iid)
console.log('takeoff', hadX, xLabel, JSON.stringify(t1), L.brief(off), JSON.stringify(recOff))
// accept again
await L.openBoard(W, DI)
if (!(await p.locator('#schedBoard .inprow .accb').count()) && await p.locator('#schedBoard [data-pitog]').count()) { await p.locator('#schedBoard [data-pitog]').first().click(); await L.sleep(500) }
await tt()
const a = p.locator(`#schedBoard [data-acc="g"][data-acck="${r.iid}"]`).first()
const hadA = await a.count()
const aLabel = hadA ? ((await a.innerText()) + ' / ' + (await a.getAttribute('title'))) : ''
if (hadA) { await a.evaluate(e => e.scrollIntoView({ block: 'center' })); await (W.mobile ? a.tap() : a.click()); await L.sleep(900) }
const t2 = await tt()
await L.shot(p, tag + '-2accept-board')
await L.closeBoard(p)
const back = await L.snap(W, DI, { focus: FOC, pic: tag + '-2accepted' })
const recBack = await L.rec(p, r.iid)
console.log('accept', hadA, aLabel, JSON.stringify(t2), L.brief(back), JSON.stringify(recBack))
const stateOk = hadX && hadA && base.f.rows[0]?.name === 'SPORTS DAY'
  && !off.f.rows.some(x => /sports day|event/i.test(x.name)) && off.v.rows.some(x => x.name === 'SPORTS DAY') && /Sports day/.test(off.togo || '') && recOff.title === 'Sports day'
  && !back.f.pend.length && !back.f.nys && back.f.rows[0]?.name === 'SPORTS DAY' && back.f.rows[0]?.kind === 'EVENT' && back.v.rows[0]?.name === 'SPORTS DAY' && recBack.title === 'Sports day'
L.row('40', size, 'admin', stateOk ? 'PASS' : 'FAIL', `published "Sports day": ${L.brief(base)}; after Take off (button "${xLabel}"): ${L.brief(off)}; after Accept (button "${aLabel}"): ${L.brief(back)}; saved title ${JSON.stringify(recBack && recBack.title)}`, [tag + '-1takeoff-edit.png', tag + '-1takeoff-togo.png', tag + '-1takeoff-view.png', tag + '-2accepted-edit.png'])
const msgOk = [...t1, ...t2].length >= 2 && [...t1, ...t2].every(m => /Sports day/.test(m))
L.row('40', size, 'admin', msgOk ? 'PASS' : 'FAIL', `the messages shown (toasts): after Take off ${JSON.stringify(t1)}; after Accept ${JSON.stringify(t2)} — expected each to name "Sports day"`, [tag + '-1takeoff-board.png', tag + '-2accept-board.png'])
await W.browser.close()
L.saveRows('s40-' + size)
console.log('ERRORS', L.ERRS)
