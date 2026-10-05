import * as X from './stk2-Q-fx.mjs'
import * as F from './stk2-Q-flib.mjs'
import * as K from './stk2-S-lib.mjs'
import { handPut } from './seat-lib.mjs'
const { sleep } = F
const DI = 4
const { browser, p, errors } = await F.open('desk', 'a')
const pic = name => K.pic(p, name)
await X.tracking(p, true)
await X.board(p, DI); await sleep(400)
const wavesBefore = await p.evaluate(i => window.DAYS[i].waves.length, DI)
const b = p.locator(`#schedBoard [data-wvadd="${DI}"]`).first()
await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await sleep(500)
await p.locator('[data-wvedit="1"]').first().click(); await sleep(700)
await p.getByRole('button', { name: '+ New wave template' }).first().click(); await sleep(800)
// one line: callsign, mission with TWO spaces before DS
const cs = p.getByPlaceholder('Callsign', { exact: true }).locator('visible=true').first(), ms = p.getByPlaceholder('Mission', { exact: true }).locator('visible=true').first()
await cs.click(); await p.keyboard.type('VL', { delay: 15 })
await ms.click(); await p.keyboard.type('ACM /  DS', { delay: 25 })
const typedVal = await ms.inputValue()
await p.getByPlaceholder('T/O', { exact: true }).locator('visible=true').first().click(); await p.keyboard.type('1200', { delay: 15 })
await p.getByPlaceholder('LD', { exact: true }).locator('visible=true').first().click(); await p.keyboard.type('1300', { delay: 15 })
await p.keyboard.press('Tab'); await sleep(400)
const keptInBox = await ms.inputValue()
const tplPic = await pic('S6-1-template-editor')
console.log('mission typed value', JSON.stringify(typedVal), 'kept in box', JSON.stringify(keptInBox))
await p.getByRole('button', { name: 'Done', exact: true }).last().click(); await sleep(600)
// add that template's wave to Friday
await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await sleep(500)
const menuItems = await p.evaluate(() => [...document.querySelectorAll('.wavemenu button')].map(e => e.innerText.trim() + '|' + [...e.attributes].map(a => a.name + '=' + a.value).join(' ').slice(0, 90)))
console.log('wave menu', JSON.stringify(menuItems))
const tplBtn = p.locator('.wavemenu [data-wmtpl="w1"]').first()
if (!(await tplBtn.count())) { console.log('NO template item in menu'); }
await tplBtn.click(); await sleep(800)
const stored = await p.evaluate(i => window.DAYS[i].waves.map(w => w.formations.map(f => JSON.stringify({ cs: f.cs, msn: f.msn, to: f.to, ld: f.ld }))), DI)
console.log('stored formations on Fri', JSON.stringify(stored))
const gi = wavesBefore  // the new wave index
const fiMsn = await p.evaluate(([i, g]) => window.DAYS[i].waves[g].formations[0].msn, [DI, gi])
const keptStored = JSON.stringify(fiMsn)
// pilot on the line, take-off and landing
let pilotId = 'beams'
const hp = await handPut(p, `${DI}.${gi}.0.0.p`, pilotId)
const pilotCs = await p.evaluate(i => window.PEOPLE[i].cs, pilotId)
const toLd = await p.evaluate(([i, g]) => ({ to: window.DAYS[i].waves[g].formations[0].to, ld: window.DAYS[i].waves[g].formations[0].ld }), [DI, gi])
if (!toLd.to) { await X.typeIn(p, 'board', `ff:${DI}.${gi}.0.to`, '12:00'); await p.keyboard.press('Tab') }
if (!toLd.ld) { await X.typeIn(p, 'board', `ff:${DI}.${gi}.0.ld`, '13:00'); await p.keyboard.press('Tab') }
await sleep(400)
const fm0 = await p.evaluate(([i, g]) => { const f = window.DAYS[i].waves[g].formations[0]; return { cs: f.cs, msn: f.msn, to: f.to, ld: f.ld, p: f.aircraft[0].p, w: f.aircraft[0].w } }, [DI, gi])
console.log('line', JSON.stringify(fm0), 'seat', JSON.stringify(hp))
const insB = await X.insights(p, { door: 'board', all: true })
const rowB = insB.secs.flatMap(s => s.rows.map(r => ({ sec: s.h.slice(0, 18), ...r }))).filter(r => r.nm === pilotCs).map(r => `${r.sec}: blue ${r.blue} red ${r.red} :: ${r.txt.slice(0, 70)}`)
await X.insightsClose(p)
const wave1 = await pic('S6-2-wave-on-friday')
const snapBefore = { elog: await p.evaluate(() => window.ELOG.rows.length), head: await X.head(p, DI), roleLines: await p.evaluate(() => window.ELOG.rows.filter(r => r.fld === 'mission-role').length) }
// Remarks: click, then the button
const rk = `fr:${DI}.${gi}.0.0`
const el = p.locator(X.boxSel('board', rk)).first()
await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(150)
const bb = await el.boundingBox(); await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await sleep(500)
const uiA = await p.evaluate(() => { const vis = e => e.getBoundingClientRect().width > 0; return { btn: [...document.querySelectorAll('[data-role-choose]')].filter(vis).map(e => { const r = e.getBoundingClientRect(); return { txt: e.innerText.trim(), box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] } }), q: [...document.querySelectorAll('.mission-role-question')].filter(vis).length } })
const pA = await pic('S6-3-remarks-clicked')
let pressed = 'no button'
if (uiA.btn.length) { const r = uiA.btn[0].box; await p.mouse.click(r[0] + r[2] / 2, r[1] + r[3] / 2); await sleep(500); pressed = 'pressed "' + uiA.btn[0].txt + '"' }
const qOpen = await p.evaluate(() => [...document.querySelectorAll('.mission-role-question')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText.replace(/\s+/g, ' ').slice(0, 100)))
const pB = await pic('S6-4-question-open')
// click into the same line's MISSION box (change nothing)
const mk = `ff:${DI}.${gi}.0.msn`
const mEl = p.locator(X.boxSel('board', mk)).first()
await mEl.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(150)
const mb = await mEl.boundingBox(); await p.mouse.click(mb.x + mb.width / 2, mb.y + mb.height / 2); await sleep(500)
const qAfterMission = await p.evaluate(() => [...document.querySelectorAll('.mission-role-question')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText.replace(/\s+/g, ' ').slice(0, 100)))
const actM = await X.active(p)
const pC = await pic('S6-5-mission-clicked-question-still-there')
// press Red
let red = 'no Red button'
const rd = p.locator('[data-role-side="red"]:visible').first()
if (await rd.count()) { await rd.click(); await sleep(700); red = 'pressed Red' }
const mission = await p.evaluate(([i, g]) => window.DAYS[i].waves[g].formations[0].msn, [DI, gi])
const missionBox = await X.active(p)
const snapAfter = { elog: await p.evaluate(() => window.ELOG.rows.length), head: await X.head(p, DI), roleLines: await p.evaluate(() => window.ELOG.rows.filter(r => r.fld === 'mission-role').length) }
const newLines = await p.evaluate(n => window.ELOG.rows.slice(n).map(r => `${r.fld}: ${r.lbl} ${r.from} -> ${r.to}`.slice(0, 140)), snapBefore.elog)
const pD = await pic('S6-6-after-red')
const insA = await X.insights(p, { door: 'board', all: true })
const rowA = insA.secs.flatMap(s => s.rows.map(r => ({ sec: s.h.slice(0, 18), ...r }))).filter(r => r.nm === pilotCs).map(r => `${r.sec}: blue ${r.blue} red ${r.red} :: ${r.txt.slice(0, 70)}`)
const pE = await pic('S6-7-insights')
await X.insightsClose(p)
const qEnd = await p.evaluate(() => [...document.querySelectorAll('.mission-role-question')].filter(e => e.getBoundingClientRect().width > 0).length)
const redRecorded = newLines.some(l => /mission role|mission-role/i.test(l) && /Red/.test(l)) || rowA.some(r => /red [1-9]/.test(r))
const twoSpaces = /ACM \/  DS/.test(String(mission))
console.log(JSON.stringify({ keptStored, mission, rowB, rowA, newLines, snapBefore, snapAfter, qOpen, qAfterMission, red, qEnd }, null, 1))
const bad = []
if (!twoSpaces) bad.push('mission text no longer has the doubled space: ' + JSON.stringify(mission))
if (!redRecorded) bad.push('Red not recorded')
K.note('S-6', 'run', `tracking On; Scheduler Board Friday 17 Jul: + Wave -> ⚙ -> New wave template, callsign VL, Mission typed "ACM /  DS" (two spaces), T/O 1200, LD 1300; Done; + Wave -> that template -> Friday; ${pilotCs} on the line (${hp.took ? 'seated' : 'NOT seated'}); clicked the line's Remarks; ${pressed}; with the question open clicked the same line's Mission box; pressed Red`,
  `template editor kept the Mission as ${JSON.stringify(keptInBox)} (typed ${JSON.stringify(typedVal)}); stored on the Friday line: msn ${keptStored}, to/ld ${JSON.stringify(toLd)} (before I set any); after placing: ${JSON.stringify(fm0)}; Insights for ${pilotCs} before: ${JSON.stringify(rowB)}; Remarks clicked -> button ${JSON.stringify(uiA.btn)}, questions ${uiA.q}; after the button: question ${JSON.stringify(qOpen)}; after clicking Mission box: question ${JSON.stringify(qAfterMission)}, caret ${JSON.stringify(actM)}; Red -> ${red}; Mission text after: ${JSON.stringify(mission)}; questions left open ${qEnd}; change history rows ${snapBefore.elog} -> ${snapAfter.elog}; new lines: ${JSON.stringify(newLines)}; day's head before ${JSON.stringify(snapBefore.head)} / after ${JSON.stringify(snapAfter.head)}; Insights for ${pilotCs} after: ${JSON.stringify(rowA)}`,
  !/ACM \/  DS/.test(keptInBox) ? 'NOT WALKED (template editor kept ' + JSON.stringify(keptInBox) + ')' : (bad.length ? 'FAIL (' + bad.join('; ') + ')' : 'PASS'), [tplPic, wave1, pA, pB, pC, pD, pE])
console.log('errors', K.errList(errors))
K.flush()
await browser.close()
