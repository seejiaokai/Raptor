// [GROUP-INPUT-ONE-ROW] WALKER W1 - the hands, desktop 1440x900. Real controls only; reads window.INPUTS/DAYS/PEOPLE for checking.
//   node scripts/handpass/gi-w1.mjs 1 2 3     (scenario numbers; none = all, in order)
// Results: scripts/handpass/_w1-results.json (merged per scenario), report: node scripts/handpass/gi-w1.mjs report
import { openWorld, reload, fileFixture, fileInput, press, csId, shot, shotEl, toast, toastMark, toastsSince, flashNow, inputsOf, undoRedo, drag, readRows, errs, browser, OUT, ISO, DI, FOUR, TITLE, DESK } from './gi-w1-lib.mjs'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const RES = 'scripts/handpass/_w1-results.json'
const load = () => (existsSync(RES) ? JSON.parse(readFileSync(RES, 'utf8')) : {})
const save = r => writeFileSync(RES, JSON.stringify(r, null, 1))
const args = process.argv.slice(2)

/* ------------------------------------------------------------------ navigation helpers */
const WKSEL = k => `#eWeek .day:not(.peek) [data-secmove="${DI}.${k}"]`
const BDSEL = k => `#schedBoard [data-secmove="${DI}.${k}"]`
async function goWeek(p) {
  if (await p.locator('#schedBoard').count()) { await p.evaluate(() => window.closeScheduler && window.closeScheduler()); await p.waitForTimeout(500) }
  const cur = await p.evaluate(() => window.CURPAGE)
  if (cur !== 'editsched') { await p.evaluate(() => window.go('editsched')); await p.waitForTimeout(700) }
}
async function goBoard(p) {
  const open = await p.evaluate(() => (document.querySelector('#schedBoard') ? window.SBDAY : null))
  if (open === DI) return
  await goWeek(p)
  await p.evaluate(di => window.openScheduler(di), DI); await p.waitForSelector('#schedBoard'); await p.waitForTimeout(900)
}
const scrollWeek = (p, key, di0 = DI) => p.evaluate(([di, key]) => {
  const day = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]
  day.scrollIntoView({ inline: 'start', block: 'nearest' })
  const sec = day.querySelector(`[data-secmove="${di}.${key}"]`)
  const y = sec.getBoundingClientRect().top + window.scrollY - 96
  window.scrollTo(0, Math.max(0, y))
}, [di0, key])
const scrollBoard = (p, key) => p.evaluate(([di, key]) => {
  const sec = document.querySelector(`#schedBoard [data-secmove="${di}.${key}"]`)
  sec.scrollIntoView({ block: 'start' })
  for (let n = sec.parentElement; n; n = n.parentElement) if (n.scrollHeight > n.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(n).overflowY)) { n.scrollTop -= 10; break }
}, [DI, key])
const hideToast = p => p.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.display = 'none' })
const showToast = p => p.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.display = '' })

/* the ground row (or personal-inputs line) for a title, as a locator, week or board */
async function rowLoc(p, where, title = TITLE) {
  const SEL = { weekG: '#eWeek .day:not(.peek) .sec-grnd .pl-row', weekI: '#eWeek .day:not(.peek) .sec-inp .pl-row', boardG: '#schedBoard .sb-panel.grnd .sb-arow', boardI: '#schedBoard .sb-panel.pinp .sb-arow.inprow' }[where]
  const idx = await p.evaluate(([sel, where, t]) => [...document.querySelectorAll(sel)].findIndex(r => {
    const nm = where === 'weekG' || where === 'weekI' ? r.querySelector('.nm .ntx')?.textContent : where === 'boardG' ? r.querySelector('textarea.ain, input.ain')?.value : r.querySelector('.inpedit')?.textContent
    return (nm || '').trim().toLowerCase() === t.toLowerCase()
  }), [SEL, where, title])
  return idx < 0 ? null : p.locator(SEL).nth(idx)
}
const puckIn = (row, id) => row.locator(`.ppl .puck[data-person="${id}"]`).first()
const rosterPuck = (p, id, board) => p.locator(`${board ? '#sbRoster' : '#eRoster'} .rpuck[data-person="${id}"]`).first()
const ids = {}
async function id(p, cs) { return (ids[cs] ||= await csId(p, cs)) }

/* the Inputs calendar's bar text for 15 Jul (the shared input), read on the Inputs page, then back to where we were */
async function calBar(p, title = TITLE) {
  const back = (await p.evaluate(() => window.SBDAY != null)) ? 'board' : 'week'
  await p.evaluate(() => window.go('inputs')); await p.waitForTimeout(600)
  if (await p.locator('#inCalBtn[aria-pressed="false"]').count()) { await p.click('#inCalBtn'); await p.waitForTimeout(500) }
  const t = await p.evaluate(title => { const els = [...document.querySelectorAll('#page-inputs [data-testid^="ib-bar-"]')].filter(e => (e.textContent || '').toLowerCase().includes(title.toLowerCase())); return els.length ? els.map(e => e.textContent.trim()).join(" || ") : null }, title)
  await p.evaluate(() => window.go('editsched')); await p.waitForTimeout(600)
  if (back === 'board') { await p.evaluate(di => window.openScheduler(di), DI); await p.waitForTimeout(800) }
  return t
}

/* make sure Personal Inputs is opened on a surface (it folds again after a reload) */
async function openFold(p, surface) {
  const rows = () => p.evaluate(sf => document.querySelectorAll(sf === 'board' ? '#schedBoard .pinp .sb-arow' : '#eWeek .day:not(.peek) .sec-inp .pl-row').length, surface)
  if (await rows()) return
  const sel = surface === 'board' ? `#schedBoard [data-pitog="${DI}"]` : `#eWeek .day:not(.peek) [data-pitog="${DI}"]`
  const f = p.locator(sel).first()
  if (await f.count()) { await f.evaluate(e => e.scrollIntoView({ block: 'center' })); await f.click(); await p.waitForTimeout(450) }
}
/* a compact reading of what the surface in use draws + what window.INPUTS says (surface: 'week' | 'board') */
async function snap(p, surface = 'week', title = TITLE) {
  await openFold(p, surface)
  const r = await readRows(p, title)
  const inp = await inputsOf(p, title)
  const rows = surface === 'board' ? { ground: r.boardGround, line: r.boardInputs } : { ground: r.weekGround, line: r.weekInputs }
  return { surface, rows, inputs: `${inp.n} rec: ${inp.people.join(',')} @ ${inp.clock.join('|')} rmk=${JSON.stringify(inp.rmk)} title=${JSON.stringify(inp.titles)}`, raw: inp }
}
const fmtSnap = s => `${s.surface} row ${JSON.stringify(s.rows.ground)} / line ${JSON.stringify(s.rows.line)}`

/* the closing steps of every scenario: Undo once, Redo, reload. surface: 'week' | 'board'. probe: extra reading (a string) after each step */
async function closing(p, surface, title = TITLE, probe = null) {
  const out = {}
  const m1 = await toastMark(p)
  const u = await undoRedo(p, 'undo'); out.undo = { ctl: u.used, ok: u.ok, toast: await toastsSince(p, m1), snap: await snap(p, surface, title), probe: probe ? await probe(p) : null }
  const m2 = await toastMark(p)
  const r = await undoRedo(p, 'redo'); out.redo = { ctl: r.used, ok: r.ok, toast: await toastsSince(p, m2), snap: await snap(p, surface, title), probe: probe ? await probe(p) : null }
  await reload(p)
  await goWeek(p); if (surface === 'board') await goBoard(p)
  await p.waitForTimeout(500)
  out.reload = { snap: await snap(p, surface, title), probe: probe ? await probe(p) : null }
  return out
}
const sameRows = (a, b) => JSON.stringify(a) === JSON.stringify(b)

/* ------------------------------------------------------------------ the scenarios */
const S = {}
let W   // the one world

/* 1 - one row, one line */
S[1] = async () => {
  const p = W.page, pics = []
  await goWeek(p); await hideToast(p)
  const fold = p.locator(`#eWeek .day:not(.peek) [data-pitog="${DI}"]`).first()
  const foldTxt = (await fold.innerText()).replace(/s+/g, ' ')
  await openFold(p, 'week')
  await scrollWeek(p, 'ground'); await p.waitForTimeout(300)
  pics.push(await shotEl(p.locator(WKSEL('ground')).first(), 's1-week-ground'))
  await scrollWeek(p, 'inputs'); await p.waitForTimeout(300)
  pics.push(await shotEl(p.locator(WKSEL('inputs')).first(), 's1-week-inputs'))
  const wk = await snap(p, 'week')
  await goBoard(p); await hideToast(p)
  await openFold(p, 'board')
  await scrollBoard(p, 'ground'); await p.waitForTimeout(300)
  pics.push(await shotEl(p.locator(BDSEL('ground')).first(), 's1-board-ground'))
  await scrollBoard(p, 'inputs'); await p.waitForTimeout(300)
  pics.push(await shotEl(p.locator(BDSEL('inputs')).first(), 's1-board-inputs'))
  const bd = await snap(p, 'board')
  // the fold's count with G4 alone in a clean world (S1 is also filed in the fixture, so the main world's header reads 2)
  let foldAlone = null
  { const w2 = await openWorld()
    try { await fileInput(w2.page, { type: 'Meeting', people: FOUR, from: ISO, to: ISO, timed: ['14:00', '15:00'], title: TITLE }, false); await goWeek(w2.page); await w2.page.waitForTimeout(400); foldAlone = (await w2.page.locator(`#eWeek .day:not(.peek) [data-pitog="${DI}"]`).first().innerText()).replace(/\s+/g, ' ') } catch (e) { foldAlone = 'ERROR ' + String(e).slice(0, 80) }
    await w2.ctx.close() }
  const A_Z = JSON.stringify(FOUR)
  const pass = /\b1 input · 1 on programme/.test(foldAlone || '') && [wk.rows.ground, wk.rows.line, bd.rows.ground, bd.rows.line].every(a => a.length === 1 && JSON.stringify(a[0]) === A_Z)
  const done = await closing(p, 'board')
  return { n: 1, did: 'filed G4 (and S1) through + Input; opened the week and the board; opened Personal Inputs; read every surface', saw: `${fmtSnap(wk)}; ${fmtSnap(bd)}; folded week header read: "${foldTxt}" (S1 also filed, so 2 inputs; G4 counts once); with G4 filed alone in a clean world the folded header reads: "${foldAlone}"`, inputs: wk.inputs, done, pass, pics, note: 'No hand act in this scenario: Undo took back the last filing (S1, Anvil) and Redo restored it.' }
}

/* 2 - week: drag Anvil from the crew list onto Hunter's puck */
S[2] = async () => {
  const p = W.page, pics = []
  await goWeek(p); await showToast(p)
  await openFold(p, 'week')
  await scrollWeek(p, 'ground'); await p.waitForTimeout(300)
  const row = await rowLoc(p, 'weekG')
  const before = await snap(p, 'week')
  const m = await toastMark(p)
  await drag(p, rosterPuck(p, await id(p, 'Anvil')), puckIn(row, await id(p, 'Hunter')))
  const tst = await toastsSince(p, m)
  const after = await snap(p, 'week')
  pics.push(await shotEl(p.locator(WKSEL('ground')).first(), 's2-week-after-drop'))
  const cal = await calBar(p)
  await goWeek(p)
  const want = ['Anvil', 'Drifter', 'Hunter', 'Ranger', 'Tally']
  const pass = JSON.stringify(after.rows.ground[0]) === JSON.stringify(want) && JSON.stringify(after.rows.line[0]) === JSON.stringify(want) && after.raw.people.join() === want.join() && /Anvil added to Range safety brief/i.test(tst) && /^5/.test(cal || '')
  const done = await closing(p, 'week')
  return { n: 2, did: "week: mouse-drag Anvil from the crew list onto Hunter's puck on the one row", saw: `row before ${JSON.stringify(before.rows.ground)}, after ${JSON.stringify(after.rows.ground)}; Personal Inputs line ${JSON.stringify(after.rows.line)}; toast "${tst}"; Inputs calendar bar for 15 Jul reads "${cal}"`, inputs: after.inputs, done, pass, pics }
}

/* 3 - board: drag Blade onto the "+ add" ; then Blade again */
S[3] = async () => {
  const p = W.page, pics = []
  await goBoard(p); await showToast(p)
  await openFold(p, 'board')
  await scrollBoard(p, 'ground'); await p.waitForTimeout(300)
  const row = await rowLoc(p, 'boardG')
  const addz = await rowAddTarget(row)
  const m = await toastMark(p)
  await drag(p, rosterPuck(p, await id(p, 'Blade'), true), addz)
  const tst = await toastsSince(p, m)
  const after = await snap(p, 'board')
  pics.push(await shotEl(p.locator(BDSEL('ground')).first(), 's3-board-after-add'))
  const cal = await calBar(p)
  await goBoard(p); await scrollBoard(p, 'ground')
  const row2 = await rowLoc(p, 'boardG')
  await showToast(p)
  const m2 = await toastMark(p)
  await drag(p, rosterPuck(p, await id(p, 'Blade'), true), puckIn(row2, await id(p, 'Hunter')))
  const tst2 = await toastsSince(p, m2)
  const again = await snap(p, 'board')
  pics.push(await shotEl(p.locator(BDSEL('ground')).first(), 's3-board-blade-again'))
  const want = ['Blade', 'Drifter', 'Hunter', 'Ranger', 'Tally']
  const pass = JSON.stringify(after.rows.ground[0]) === JSON.stringify(want) && /Blade added to Range safety brief/i.test(tst) && /^5/.test(cal || '') && /Blade is already on this input/i.test(tst2) && sameRows(again.rows, after.rows) && again.inputs === after.inputs
  const done = await closing(p, 'board')
  return { n: 3, did: "board: mouse-drag Blade from the board crew list onto the row's + add; then drag Blade again onto Hunter's puck on the row", saw: `after add: ${JSON.stringify(after.rows.ground)} toast "${tst}"; calendar bar "${cal}"; second drop toast "${tst2}", row ${JSON.stringify(again.rows.ground)}`, inputs: after.inputs + ' | after 2nd drop: ' + again.inputs, done, pass, pics }
}

/* the people a surface's G4 row holds, and a seat's man */
const seatMan = (p, key) => p.evaluate(key => { const e = document.querySelector(`#eWeek [data-slot="${key}"] .puck .nm`); return e ? e.textContent.trim() : null }, key)
const emptyPage = { x: 900, y: 82 }

/* 4 - week: drag Tally's puck off the row onto empty page */
S[4] = async () => {
  const p = W.page, pics = []
  await goWeek(p); await openFold(p, 'week')
  await scrollWeek(p, 'ground'); await p.waitForTimeout(300)
  const row = await rowLoc(p, 'weekG')
  const m = await toastMark(p)
  await drag(p, puckIn(row, await id(p, 'Tally')), emptyPage)
  const tst = await toastsSince(p, m)
  const after = await snap(p, 'week')
  await scrollWeek(p, 'ground')
  pics.push(await shotEl(p.locator(WKSEL('ground')).first(), 's4-week-tally-off'))
  const cal = await calBar(p); await goWeek(p)
  const want = ['Drifter', 'Hunter', 'Ranger']
  const pass = JSON.stringify(after.rows.ground[0]) === JSON.stringify(want) && JSON.stringify(after.rows.line[0]) === JSON.stringify(want) && after.raw.people.join() === want.join() && /Tally taken out of Range safety brief/i.test(tst) && /^3/.test(cal || '')
  const done = await closing(p, 'week')
  return { n: 4, did: "week: mouse-drag Tally's puck off the one row and let go on empty page (the blank toolbar space)", saw: `row now ${JSON.stringify(after.rows.ground)}, line ${JSON.stringify(after.rows.line)}; toast "${tst}"; Inputs calendar bar "${cal}"`, inputs: after.inputs, done, pass, pics }
}

/* 5 - week: right-click Ranger's puck */
S[5] = async () => {
  const p = W.page, pics = []
  await goWeek(p); await openFold(p, 'week')
  await scrollWeek(p, 'ground'); await p.waitForTimeout(300)
  const row = await rowLoc(p, 'weekG')
  const m = await toastMark(p)
  await puckIn(row, await id(p, 'Ranger')).click({ button: 'right' }); await p.waitForTimeout(600)
  const tst = await toastsSince(p, m)
  const after = await snap(p, 'week')
  await scrollWeek(p, 'ground')
  pics.push(await shotEl(p.locator(WKSEL('ground')).first(), 's5-week-ranger-off'))
  const cal = await calBar(p); await goWeek(p)
  const want = ['Drifter', 'Hunter', 'Tally']
  const pass = JSON.stringify(after.rows.ground[0]) === JSON.stringify(want) && JSON.stringify(after.rows.line[0]) === JSON.stringify(want) && after.raw.people.join() === want.join() && /Ranger taken out of Range safety brief/i.test(tst) && /^3/.test(cal || '')
  const done = await closing(p, 'week')
  return { n: 5, did: "week: right-click Ranger's puck on the one row", saw: `row now ${JSON.stringify(after.rows.ground)}, line ${JSON.stringify(after.rows.line)}; toast "${tst}"; Inputs calendar bar "${cal}"`, inputs: after.inputs, done, pass, pics }
}

/* 6 - week: drag Hunter's puck from the row onto a flying seat that holds another man */
S[6] = async () => {
  const p = W.page, pics = []
  await goWeek(p); await openFold(p, 'week')
  const seats = await p.evaluate(() => [...document.querySelectorAll('#eWeek [data-slot^="2.0."]')].filter(e => /^2\.0\.\d+\.\d+\.[pw]$/.test(e.dataset.slot)).map(e => e.dataset.slot + ':' + (e.querySelector('.puck .nm')?.textContent || '')))
  const SEAT = '2.0.0.0.p'
  const occupant0 = await seatMan(p, SEAT)
  await scrollWeek(p, 'ground'); await p.waitForTimeout(300)
  const row = await rowLoc(p, 'weekG')
  const target = p.locator(`#eWeek [data-slot="${SEAT}"]`).first()
  const m = await toastMark(p)
  let flash = null
  await drag(p, puckIn(row, await id(p, 'Hunter')), target, { wheel: true, onUp: async () => { flash = await flashNow(p); await p.screenshot({ path: OUT + '/s6-week-landing-flash.png' }) } })
  const tst = await toastsSince(p, m)
  const occupant1 = await seatMan(p, SEAT)
  const after = await snap(p, 'week')
  await scrollWeek(p, 'ground')
  pics.push(await shotEl(p.locator(WKSEL('ground')).first(), 's6-week-ground-after'), 's6-week-landing-flash')
  const probe = async q => 'seat ' + SEAT + ' holds ' + (await seatMan(q, SEAT))
  const want = ['Drifter', 'Ranger', 'Tally']
  const pass = occupant1 === 'Hunter' && JSON.stringify(after.rows.ground[0]) === JSON.stringify(want) && after.raw.people.join() === want.join() && flash.some(f => f.slot === SEAT)
  const done = await closing(p, 'week', TITLE, probe)
  return { n: 6, did: "week: mouse-drag Hunter's puck from the one row onto the first-wave seat " + SEAT + " (rolling the wheel mid-drag to bring it in view)", saw: `seat before: ${occupant0}; after: ${occupant1}; row now ${JSON.stringify(after.rows.ground)}; line ${JSON.stringify(after.rows.line)}; toast "${tst}"; flash at drop: ${JSON.stringify(flash)}; (first-wave seats: ${seats.slice(0, 6).join(', ')})`, inputs: after.inputs, done, pass, pics }
}

/* board ground rows, read as {title, men} in the order drawn (a title may be blank) */
const boardRows = p => p.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-panel.grnd .sb-arow')].map((r, i) => ({ i, title: (r.querySelector('textarea.ain, input.ain')?.value || '').trim(), men: [...r.querySelectorAll('.ppl .puck .nm')].map(n => n.textContent.trim()) })))
const rowAddTarget = async row => { const a = row.locator('.addz').first(); const b = await a.boundingBox().catch(() => null); return b && b.width > 2 ? a : row.locator('.ppl').first() }
const fmtRows = rs => rs.map(r => `[${r.title || '(blank)'}: ${r.men.join(',')}]`).join(' ')

/* 7 - board: drag Drifter's puck from the row onto S1's row (above), then, separately, onto a ground row below */
S[7] = async () => {
  const p = W.page, pics = []
  await goBoard(p); await openFold(p, 'board')
  await scrollBoard(p, 'ground'); await p.waitForTimeout(300)
  // a ground row BELOW the one row: the board's own "+ Item" button adds a blank one at the foot
  await p.locator(`#schedBoard [data-gradd="${DI}"]`).click(); await p.waitForTimeout(700)
  await scrollBoard(p, 'ground')
  const rows0 = await boardRows(p)
  const gi = rows0.findIndex(r => r.title.toLowerCase() === TITLE.toLowerCase()), ti = rows0.findIndex(r => r.title === 'TRAINING'), bi = rows0.length - 1
  const drifter = await id(p, 'Drifter')
  const trial = async (name, targetIdx) => {
    const rows = p.locator('#schedBoard .sb-panel.grnd .sb-arow')
    const g4 = await rowLoc(p, 'boardG')
    const target = await rowAddTarget(rows.nth(targetIdx))
    const m = await toastMark(p)
    let flash = null
    await drag(p, puckIn(g4, drifter), target, { onUp: async () => { flash = await flashNow(p); await p.screenshot({ path: OUT + `/s7-board-${name}-flash.png` }) } })
    const tst = await toastsSince(p, m)
    await scrollBoard(p, 'ground'); await p.waitForTimeout(250)
    pics.push(await shotEl(p.locator(BDSEL('ground')).first(), `s7-board-${name}-after`), `s7-board-${name}-flash`)
    return { tst, flash, rows: await boardRows(p), inp: await inputsOf(p) }
  }
  const A = await trial('onto-S1', ti)
  const mu = await toastMark(p); const ua = await undoRedo(p, 'undo'); const undoA = { toast: await toastsSince(p, mu), rows: await boardRows(p), inp: await inputsOf(p) }
  await scrollBoard(p, 'ground')
  const rowsB0 = await boardRows(p)
  const B = await trial('onto-below', rowsB0.length - 1)
  const flashRowA = A.flash.map(f => f.row && f.row.title)
  const flashRowB = B.flash.map(f => f.row && f.row.idx)
  const okA = A.rows.find(r => r.title === 'TRAINING')?.men.includes('Drifter') && !A.rows.find(r => r.title.toLowerCase() === TITLE.toLowerCase())?.men.includes('Drifter') && !A.inp.people.includes('Drifter') && A.flash.length > 0 && A.flash.every(f => f.row && f.row.title === 'TRAINING')
  const lastIdx = rowsB0.length - 1
  const okB = B.rows[lastIdx]?.men.includes('Drifter') && !B.inp.people.includes('Drifter') && B.flash.length > 0 && B.flash.every(f => f.row && f.row.idx === lastIdx)
  const done = await closing(p, 'board')
  return { n: 7, did: 'board: clicked + Item to add a blank ground row at the foot; mouse-dragged Drifter from the one row onto the TRAINING (S1) row, Undo, then onto the blank row below', saw: `A (onto S1 row): ${fmtRows(A.rows)}; toast "${A.tst}"; flash on row(s) ${JSON.stringify(flashRowA)} elements ${JSON.stringify(A.flash.map(f => f.slot || f.cls))}; INPUTS ${A.inp.people.join(',')}. Undo A: ${fmtRows(undoA.rows)} INPUTS ${undoA.inp.people.join(',')} toast "${undoA.toast}". B (onto blank row below): ${fmtRows(B.rows)}; toast "${B.tst}"; flash on row idx ${JSON.stringify(flashRowB)} (target idx ${lastIdx}) ${JSON.stringify(B.flash.map(f => f.slot || f.cls))}; INPUTS ${B.inp.people.join(',')}`, inputs: `after B: ${B.inp.n} rec: ${B.inp.people.join(',')}`, done, pass: !!(okA && okB), pics }
}

/* 8 - take men off until one is left; then try the last by drag and by right-click */
S[8] = async () => {
  const p = W.page, pics = []
  await goWeek(p); await openFold(p, 'week')
  const names = async () => (await readRows(p)).weekGround[0]
  const act = async (label, fn) => { await scrollWeek(p, 'ground'); await p.waitForTimeout(250); const m = await toastMark(p); await fn(); await p.waitForTimeout(500); return { label, toast: await toastsSince(p, m), men: await names(), inp: (await inputsOf(p)).people.join(',') } }
  const log = []
  log.push(await act('drag Tally off', async () => drag(p, puckIn(await rowLoc(p, 'weekG'), await id(p, 'Tally')), emptyPage)))
  log.push(await act('right-click Ranger', async () => (await puckIn(await rowLoc(p, 'weekG'), await id(p, 'Ranger')).click({ button: 'right' }))))
  log.push(await act('drag Hunter off', async () => drag(p, puckIn(await rowLoc(p, 'weekG'), await id(p, 'Hunter')), emptyPage)))
  await scrollWeek(p, 'ground'); pics.push(await shotEl(p.locator(WKSEL('ground')).first(), 's8-week-one-left'))
  const last1 = await act('drag the last (Drifter) off', async () => drag(p, puckIn(await rowLoc(p, 'weekG'), await id(p, 'Drifter')), emptyPage))
  await scrollWeek(p, 'ground'); pics.push(await shotEl(p.locator(WKSEL('ground')).first(), 's8-week-last-by-drag'))
  const last2 = await act('right-click the last (Drifter)', async () => (await puckIn(await rowLoc(p, 'weekG'), await id(p, 'Drifter')).click({ button: 'right' })))
  await scrollWeek(p, 'ground'); pics.push(await shotEl(p.locator(WKSEL('ground')).first(), 's8-week-last-by-rightclick'))
  const msg = /is the last person on this input/i
  const pass = JSON.stringify(log[2].men) === JSON.stringify(['Drifter']) && log[2].inp === 'Drifter' && msg.test(last1.toast) && msg.test(last2.toast) && JSON.stringify(last1.men) === JSON.stringify(['Drifter']) && JSON.stringify(last2.men) === JSON.stringify(['Drifter']) && last1.inp === 'Drifter' && last2.inp === 'Drifter'
  const done = await closing(p, 'week')
  return { n: 8, did: 'week: took Tally off by drag, Ranger by right-click, Hunter by drag (Drifter left); then tried the last by drag and by right-click', saw: log.concat([last1, last2]).map(l => `${l.label} -> row [${(l.men || []).join(',')}] INPUTS [${l.inp}] toast "${l.toast}"`).join(' ;; '), inputs: last2.inp, done, pass, pics }
}

/* the Inputs calendar's day card for 15 Jul: its text, how many cards the input has, and a picture; then back to where we were */
async function dayCard(p, picName) {
  const back = (await p.evaluate(() => window.SBDAY != null)) ? 'board' : 'week'
  await p.evaluate(() => window.go('inputs')); await p.waitForTimeout(600)
  if (await p.locator('#inCalBtn[aria-pressed="false"]').count()) { await p.click('#inCalBtn'); await p.waitForTimeout(500) }
  await p.locator('[data-icday="2026-07-15"]').first().click({ position: { x: 20, y: 10 } }); await p.waitForTimeout(700)
  const win = p.locator('[data-testid="win-inputsday"]')
  const text = (await win.innerText()).replace(/\s+/g, ' ')
  if (picName) await win.screenshot({ path: OUT + '/' + picName + '.png' })
  await p.locator('[data-testid="win-inputsday-x"]').click().catch(() => {}); await p.waitForTimeout(300)
  await p.evaluate(() => window.go('editsched')); await p.waitForTimeout(600)
  if (back === 'board') { await p.evaluate(di => window.openScheduler(di), DI); await p.waitForTimeout(800) }
  return text
}
const TITLES = [TITLE, 'Range brief']
const typeBox = async (p, loc, text) => { let b = await loc.boundingBox(); if (!b || b.y < 130 || b.y > 820) { await loc.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await p.waitForTimeout(250); b = await loc.boundingBox() } if (process.env.DBG) await p.screenshot({ path: OUT + '/_dbg-' + text.replace(/W/g, '') + '.png' }); if (process.env.DBG) console.log('   typeBox', text, JSON.stringify(b), await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? e.tagName + '.' + e.className + ' ' + (e.getAttribute('data-txt') || '') + ' | scrollY ' + window.scrollY + ' wins:' + [...document.querySelectorAll('[data-testid^="win-"]')].map(w => w.getAttribute('data-testid')).join(',') : null }, [b.x + b.width / 2, b.y + b.height / 2])); await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await p.waitForTimeout(120); await p.keyboard.press('Control+a'); await p.keyboard.type(text, { delay: 12 }); await p.keyboard.press('Enter'); await p.waitForTimeout(600) }
/* the row (or the Personal Inputs line) of the shared input right now, whichever of the two names it carries */
async function curRow(p, where) { return (await rowLoc(p, where, TITLES[0])) || (await rowLoc(p, where, TITLES[1])) }
const boxes = {
  weekG: { start: r => r.locator('.t-s').first(), rmk: r => r.locator('.rmk .ntx').first(), name: r => r.locator('.nm .ntx').first() },
  weekI: { start: r => r.locator('[data-inp$=".str"]').first(), rmk: r => r.locator('[data-inp$=".rmks"]').first(), name: null },
  boardG: { start: r => r.locator('input.atm').first(), rmk: r => r.locator('textarea.rmkin').first(), name: r => r.locator('.sb-nmk textarea.ain').first() },
  boardI: { start: r => r.locator('[data-inp$=".str"], input.atm').first(), rmk: r => r.locator('[data-inp$=".rmks"], textarea.rmkin, input.rmkin').first(), name: null },
}
const boxText = async loc => (await loc.evaluate(e => ('value' in e && e.tagName !== 'SPAN' ? e.value : e.textContent) || '')).trim()
/* a full reading: the row's boxes, how many rows, INPUTS, the card */
async function readAll(p, where, surface, cardPic) {
  const row = await curRow(p, where)
  const b = boxes[where]
  const rd = await readRows(p, TITLES)
  const key = { weekG: 'weekGround', weekI: 'weekInputs', boardG: 'boardGround', boardI: 'boardInputs' }[where]
  const inp = await inputsOf(p, TITLES)
  const card = await dayCard(p, cardPic)
  return { start: row ? await boxText(b.start(row)) : null, rmk: row ? await boxText(b.rmk(row)) : null, name: row && b.name ? await boxText(b.name(row)) : null, rows: rd[key].length, men: rd[key][0], inp, card, cards: (card.match(/MEETING/g) || []).length }
}
/* the three typed edits on one surface, each undone once and redone once; where: weekG | weekI | boardG | boardI */
async function typedEdits(where) {
  const surface = where.startsWith('board') ? 'board' : 'week'
  W = await openWorld(); const p = W.page
  await fileFixture(p)
  await (surface === 'board' ? goBoard(p) : goWeek(p)); await openFold(p, surface)
  const log = [], pics = []
  try {
  const edits = [['start', '14:30', r => r.start === '14:30' && r.inp.clock.join() === '14:30-15:00' && r.card.includes('14:30–15:00')], ['rmk', 'Bring ID', r => /Bring ID/.test(r.rmk) && r.inp.rmk.every(x => /Bring ID/.test(x)) && /Bring ID/.test(r.card)], ['name', 'Range brief', r => (r.name || '').toLowerCase() === 'range brief' && r.inp.titles.join() === 'Range brief' && /Range brief/.test(r.card)]]
  let allOk = true
  for (const [kind, text, ok] of edits) {
    if (kind === 'name' && !boxes[where].name) { log.push('name: no typed box for the name on this line (the name is a button that opens the input window)'); continue }
    await (surface === 'board' ? scrollBoard(p, where === 'boardG' ? 'ground' : 'inputs') : scrollWeek(p, where === 'weekG' ? 'ground' : 'inputs')); await p.waitForTimeout(300)
    const row = await curRow(p, where)
    const m = await toastMark(p)
    await typeBox(p, boxes[where][kind](row), text)
    const tst = await toastsSince(p, m)
    const after = await readAll(p, where, surface, kind === 'name' ? `s9-${where}-card-after-three` : null)
    const good = ok(after) && after.rows === 1 && after.inp.n === 4 && after.cards === 1 && after.men && after.men.length === 4
    const mu = await toastMark(p); const u = await undoRedo(p, 'undo'); const tu = await toastsSince(p, mu)
    const undone = await readAll(p, where, surface, null)
    const mr = await toastMark(p); await undoRedo(p, 'redo'); const redone = await readAll(p, where, surface, null)
    const goodU = !ok(undone) && undone.rows === 1 && undone.inp.n === 4
    const goodR = ok(redone) && redone.rows === 1
    allOk = allOk && good && goodU && goodR
    log.push(`${kind} "${text}": box now "${after[kind]}", rows ${after.rows}, men ${JSON.stringify(after.men)}, INPUTS ${after.inp.n} rec @ ${after.inp.clock} rmk=${JSON.stringify(after.inp.rmk)} titles=${JSON.stringify(after.inp.titles)}; card (${after.cards} card): "${after.card.slice(Math.max(0, after.card.indexOf('Drifter, Hunter') - 22))}"; toast "${tst}" => ${good ? 'ok' : 'NOT AS EXPECTED'} | Undo once: box "${undone[kind]}", INPUTS @ ${undone.inp.clock} rmk=${JSON.stringify(undone.inp.rmk)} titles=${JSON.stringify(undone.inp.titles)}, toast "${tu}" => ${goodU ? 'ok' : 'NOT AS EXPECTED'} | Redo: box "${redone[kind]}" => ${goodR ? 'ok' : 'NOT AS EXPECTED'}`)
    await (surface === 'board' ? scrollBoard(p, where === 'boardG' ? 'ground' : 'inputs') : scrollWeek(p, where === 'weekG' ? 'ground' : 'inputs'))
  }
  await (surface === 'board' ? scrollBoard(p, where === 'boardG' ? 'ground' : 'inputs') : scrollWeek(p, where === 'weekG' ? 'ground' : 'inputs')); await p.waitForTimeout(300)
  pics.push(await shotEl(p.locator((surface === 'board' ? BDSEL : WKSEL)(where === 'weekG' || where === 'boardG' ? 'ground' : 'inputs')).first(), `s9-${where}-after-three`), `s9-${where}-card-after-three`)
  const done = await closing(p, surface, TITLES)
  await W.ctx.close()
  return { where, log, pics, done, allOk }
  } catch (e) { log.push('ERROR ' + String(e.stack || e).split('\n').slice(0, 3).join(' | ')); try { await W.ctx.close() } catch {} ; return { where, log, pics, done: null, allOk: false } }
}
/* 9 - typed boxes: week, board, then the same on the Personal Inputs line (week and board) */
S[9] = async () => {
  await W.ctx.close()
  const out = []
  for (const where of (process.env.WHERE ? process.env.WHERE.split(',') : ['weekG', 'boardG', 'weekI', 'boardI'])) { try { out.push(await typedEdits(where)) } catch (e) { out.push({ where, log: ['ERROR ' + String(e.stack || e).split('\n').slice(0, 4).join(' | ')], pics: [], done: null, allOk: false }) } }
  W = await openWorld()
  const pass = out.every(o => o.allOk)
  return { n: 9, did: 'typed 14:30 over the start, then a remark "Bring ID", then the name "Range brief" into the boxes of the one row (week, board) and of the Personal Inputs line (week, board), each in a fresh world; read the row, INPUTS and the Inputs calendar day card after each; one Undo and a Redo after each', saw: out.map(o => `[${o.where}] ` + o.log.join(' ;; ')).join('\n'), inputs: out.map(o => `${o.where}: after reload ${o.done ? o.done.reload.snap.inputs : 'n/a'}`).join(' | '), done: out[0].done, doneAll: out.map(o => ({ where: o.where, done: o.done })), pass, pics: out.flatMap(o => o.pics) }
}

/* what the board draws for the one row right now: rows, men, the row's class, how dim its pucks are, the line under Personal Inputs */
async function boardRead(p, title = TITLES[0]) {
  const rd = await readRows(p, title)
  const info = await p.evaluate(title => {
    const row = [...document.querySelectorAll('#schedBoard .sb-panel.grnd .sb-arow')].find(r => (r.querySelector('textarea.ain, input.ain')?.value || '').trim().toLowerCase() === title.toLowerCase())
    const line = [...document.querySelectorAll('#schedBoard .sb-panel.pinp .sb-arow.inprow')].find(r => (r.querySelector('.inpedit')?.textContent || '').trim().toLowerCase() === title.toLowerCase())
    return { rowCls: row ? row.className.replace(/\s+/g, ' ') : null, opac: row ? [...row.querySelectorAll('.ppl .puck')].map(k => { let o = 1; for (let e = k; e && e !== row.parentElement; e = e.parentElement) o *= parseFloat(getComputedStyle(e).opacity); return String(Math.round(o * 100) / 100) }) : [], rowBoxes: row ? [...row.querySelectorAll('input.atm, textarea.ain')].map(e => e.value) : [], btnOn: row ? [...row.querySelectorAll('.lctl .mbtn')].filter(b => /\bon\b|active|pressed/.test(b.className) || b.getAttribute('aria-pressed') === 'true').map(b => b.title.slice(0, 20)) : [], lineTxt: line ? line.innerText.replace(/\s+/g, ' ').slice(0, 160) : null, lineCls: line ? line.className : null, lineBtns: line ? [...line.querySelectorAll('button')].map(b => b.textContent.trim()).filter(Boolean) : [] }
  }, title)
  const inp = await inputsOf(p, title)
  const acc = await p.evaluate(title => [...new Set(window.INPUTS.filter(r => (r.title || '').toLowerCase() === title.toLowerCase()).map(r => String(r.acc)))].join('/'), title)
  return { rows: rd.boardGround.length, men: rd.boardGround[0] || null, lines: rd.boardInputs.length, lineMen: rd.boardInputs[0] || null, ...info, inp, acc }
}
const fmtB = b => `rows ${b.rows} men ${JSON.stringify(b.men)} class "${b.rowCls}" puck opacity ${JSON.stringify(b.opac)} boxes ${JSON.stringify(b.rowBoxes)}; line ${b.lines} "${b.lineTxt}" buttons ${JSON.stringify(b.lineBtns)}; INPUTS ${b.inp.n} rec acc=${b.acc} @ ${b.inp.clock}`
const clickAt = async (p, loc) => { await loc.evaluate(e => e.scrollIntoView({ block: 'center' })); await p.waitForTimeout(250); const b = await loc.boundingBox(); await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await p.waitForTimeout(700) }

/* 10 - the board row's buttons: X, CX with a reason, the red box, the information-only mark - each then Undo */
S[10] = async () => {
  const p = W.page, pics = [], log = []
  await goBoard(p); await openFold(p, 'board')
  const KEY = `${DI}.2`
  const base = await boardRead(p)
  log.push(`before: ${fmtB(base)}`)
  const grnd = async (name) => { await scrollBoard(p, 'ground'); await p.waitForTimeout(300); pics.push(await shotEl(p.locator(BDSEL('ground')).first(), name)) }
  const inps = async (name) => { await scrollBoard(p, 'inputs'); await p.waitForTimeout(300); pics.push(await shotEl(p.locator(BDSEL('inputs')).first(), name)) }
  let ok = true
  // a) the cross
  await scrollBoard(p, 'ground')
  let m = await toastMark(p)
  await clickAt(p, p.locator(`#schedBoard [data-grdel="${KEY}"]`))
  let t = await toastsSince(p, m); let a = await boardRead(p)
  await inps('s10-x-line-after'); await grnd('s10-x-ground-after')
  const okX = a.rows === 0 && a.lines === 1 && a.lineBtns.some(x => /accept/i.test(x)) && /4 people/.test(t) && a.inp.n === 4
  log.push(`X: toast "${t}"; ${fmtB(a)} => ${okX ? 'ok' : 'NOT AS EXPECTED'}`)
  m = await toastMark(p); await undoRedo(p, 'undo'); let u = await boardRead(p); let ut = await toastsSince(p, m)
  const okXu = u.rows === 1 && JSON.stringify(u.men) === JSON.stringify(FOUR)
  log.push(`  Undo: toast "${ut}"; ${fmtB(u)} => ${okXu ? 'ok' : 'NOT AS EXPECTED'}`)
  ok = ok && okX && okXu
  // b) CX with a reason
  await scrollBoard(p, 'ground')
  m = await toastMark(p)
  await clickAt(p, p.locator(`#schedBoard [data-grcx="${KEY}"]`))
  const dlg = p.locator('div', { has: p.getByText('Cancel this item') }).filter({ has: p.locator('input') }).last()
  const dlgTxt = ((await dlg.innerText().catch(() => '')) || '').replace(/\s+/g, ' ').slice(0, 160)
  const nQ = await p.getByText('Cancel this item').count()
  pics.push(await shot(p, 's10-cx-question'))
  await dlg.locator('input').first().click(); await p.keyboard.type('weather', { delay: 15 })
  await p.getByRole('button', { name: /cancel line/i }).click(); await p.waitForTimeout(700)
  t = await toastsSince(p, m); a = await boardRead(p)
  await grnd('s10-cx-ground-after')
  const okC = nQ === 1 && a.rows === 1 && JSON.stringify(a.men) === JSON.stringify(FOUR) && /\bcx\b/i.test(a.rowCls + ' ' + a.rowBoxes.join(' ')) && a.opac.every(o => parseFloat(o) < 1)
  log.push(`CX: questions open ${nQ} ("${dlgTxt}"); typed "weather"; toast "${t}"; ${fmtB(a)} => ${okC ? 'ok' : 'NOT AS EXPECTED'}`)
  m = await toastMark(p); await undoRedo(p, 'undo'); u = await boardRead(p); ut = await toastsSince(p, m)
  const okCu = u.rows === 1 && u.opac.every(o => parseFloat(o) === 1) && !/\bcx\b/i.test(u.rowCls + ' ' + u.rowBoxes.join(' '))
  log.push(`  Undo: toast "${ut}"; ${fmtB(u)} => ${okCu ? 'ok' : 'NOT AS EXPECTED'}`)
  ok = ok && okC && okCu
  // c) the red box
  await scrollBoard(p, 'ground')
  m = await toastMark(p)
  await clickAt(p, p.locator(`#schedBoard [data-grflag="${KEY}"]`))
  t = await toastsSince(p, m); a = await boardRead(p)
  await grnd('s10-redbox-ground-after')
  const okR = a.rows === 1 && JSON.stringify(a.men) === JSON.stringify(FOUR) && a.rowCls !== base.rowCls
  log.push(`red box: toast "${t}"; ${fmtB(a)} => ${okR ? 'ok' : 'NOT AS EXPECTED'}`)
  m = await toastMark(p); await undoRedo(p, 'undo'); u = await boardRead(p); ut = await toastsSince(p, m)
  const okRu = u.rows === 1 && u.rowCls === base.rowCls
  log.push(`  Undo: toast "${ut}"; ${fmtB(u)} => ${okRu ? 'ok' : 'NOT AS EXPECTED'}`)
  ok = ok && okR && okRu
  // d) information only - then the closing steps
  await scrollBoard(p, 'ground')
  m = await toastMark(p)
  await clickAt(p, p.locator(`#schedBoard [data-grinfo="${KEY}"]`))
  t = await toastsSince(p, m); a = await boardRead(p)
  await grnd('s10-info-ground-after')
  const okI = a.rows === 1 && JSON.stringify(a.men) === JSON.stringify(FOUR) && a.rowCls !== base.rowCls
  log.push(`info only: toast "${t}"; ${fmtB(a)} => ${okI ? 'ok' : 'NOT AS EXPECTED'}`)
  ok = ok && okI
  const done = await closing(p, 'board')
  return { n: 10, did: 'board row buttons on the one row, each then Undo: the cross, CX (typed a reason in the question, pressed Cancel line), the red box, the information-only mark; the last one then Undo / Redo / reload', saw: log.join('\n'), inputs: a.inp.n + ' rec, acc ' + a.acc, done, pass: ok, pics }
}

/* 11 - board: drag the one row by its grip above S1's row, then below a later row; Auto sort */
S[11] = async () => {
  const p = W.page, pics = [], log = []
  await goBoard(p); await openFold(p, 'board')
  await scrollBoard(p, 'ground'); await p.waitForTimeout(300)
  const order = rs => rs.map(r => `${r.title || '(blank)'}[${r.men.length}]`).join(' > ')
  const rowsNow = async () => { const rs = await boardRows(p); return { rs, g4: rs.find(r => r.title.toLowerCase() === TITLE.toLowerCase()) } }
  const gripOf = async () => (await rowLoc(p, 'boardG')).locator('.sb-grip').first()
  const edge = async (title, where) => { const loc = p.locator('#schedBoard .sb-panel.grnd .sb-arow').filter({ has: p.locator(`textarea.ain`) }); const idx = (await boardRows(p)).findIndex(r => r.title === title); const b = await p.locator('#schedBoard .sb-panel.grnd .sb-arow').nth(idx).boundingBox(); return { x: b.x + 200, y: where === 'top' ? b.y + 3 : b.y + b.height - 3 } }
  const b0 = await rowsNow(); log.push(`before: ${order(b0.rs)}`)
  let ok = true
  // 1: above S1's row
  let m = await toastMark(p); let flash = null
  await drag(p, await gripOf(), await edge('TRAINING', 'top'), { onUp: async () => { const a = await flashNow(p); await p.waitForTimeout(80); await p.screenshot({ path: OUT + '/s11-board-move1-flash.png' }); flash = a.concat(await flashNow(p)) } })
  let t = await toastsSince(p, m); let n1 = await rowsNow(); let inp = await inputsOf(p)
  await scrollBoard(p, 'ground'); pics.push(await shotEl(p.locator(BDSEL('ground')).first(), 's11-board-moved-above-S1'), 's11-board-move1-flash')
  const i1 = n1.rs.findIndex(r => r.title.toLowerCase() === TITLE.toLowerCase())
  const ok1 = i1 === 0 && n1.g4.men.join() === FOUR.join() && n1.rs.filter(r => r.men.includes('Drifter')).length === 1 && inp.n === 4
  log.push(`1) grip dragged above TRAINING: ${order(n1.rs)}; four men ${JSON.stringify(n1.g4 && n1.g4.men)}; toast "${t}"; flash ${JSON.stringify(flash.map(f => f.row && f.row.title || f.cls))}; INPUTS ${inp.n} rec => ${ok1 ? 'ok' : 'NOT AS EXPECTED'}`)
  ok = ok && ok1
  // 2: below a later row (MAINT CONF)
  await scrollBoard(p, 'ground'); await p.waitForTimeout(250)
  m = await toastMark(p); flash = null
  await drag(p, await gripOf(), await edge('MAINT CONF @ ENG WING', 'bottom'), { onUp: async () => { const a = await flashNow(p); await p.waitForTimeout(80); await p.screenshot({ path: OUT + '/s11-board-move2-flash.png' }); flash = a.concat(await flashNow(p)) } })
  t = await toastsSince(p, m); const n2 = await rowsNow(); inp = await inputsOf(p)
  await scrollBoard(p, 'ground'); pics.push(await shotEl(p.locator(BDSEL('ground')).first(), 's11-board-moved-below-MAINT'), 's11-board-move2-flash')
  const names2 = n2.rs.map(r => r.title)
  const i2 = names2.findIndex(x => x.toLowerCase() === TITLE.toLowerCase())
  const ok2 = i2 === names2.indexOf('MAINT CONF @ ENG WING') + 1 && n2.g4.men.join() === FOUR.join() && n2.rs.filter(r => r.men.includes('Drifter')).length === 1 && inp.n === 4
  log.push(`2) grip dragged below MAINT CONF: ${order(n2.rs)}; four men ${JSON.stringify(n2.g4 && n2.g4.men)}; toast "${t}"; flash ${JSON.stringify(flash.map(f => f.row && f.row.title || f.cls))}; INPUTS ${inp.n} rec => ${ok2 ? 'ok' : 'NOT AS EXPECTED'}`)
  ok = ok && ok2
  // 3: Auto sort
  await scrollBoard(p, 'ground'); await p.waitForTimeout(250)
  m = await toastMark(p)
  await clickAt(p, p.locator(`#schedBoard [data-sortsec="g.${DI}"]`))
  t = await toastsSince(p, m); const n3 = await rowsNow(); inp = await inputsOf(p)
  await scrollBoard(p, 'ground'); pics.push(await shotEl(p.locator(BDSEL('ground')).first(), 's11-board-after-auto-sort'))
  const names3 = n3.rs.map(r => r.title)
  const starts3 = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-panel.grnd .sb-arow')].map(r => r.querySelector('input.atm')?.value || ''))
  const mins = x => (x ? Number(x.slice(0, 2)) * 60 + Number(x.slice(3)) : 1e9)
  const ok3 = starts3.every((x, k) => k === 0 || mins(starts3[k - 1]) <= mins(x)) && n3.rs.filter(r => r.men.includes('Drifter')).length === 1 && n3.g4.men.join() === FOUR.join() && inp.n === 4
  log.push(`3) Auto sort: ${order(n3.rs)} (start times ${JSON.stringify(starts3)} - non-decreasing, three rows tie at 14:00); four men ${JSON.stringify(n3.g4 && n3.g4.men)}; toast "${t}"; INPUTS ${inp.n} rec => ${ok3 ? 'ok' : 'NOT AS EXPECTED'}`)
  ok = ok && ok3
  const done = await closing(p, 'board')
  return { n: 11, did: 'board: mouse-dragged the one row by its grip above the TRAINING row, then below the MAINT CONF row, then pressed the Ground Programme\'s Auto sort', saw: log.join('\n'), inputs: inp.n + ' rec: ' + inp.people.join(','), done, pass: ok, pics }
}

/* what a week day's Unavailable list draws: one entry per row {type, who, rmk, start, end} */
const unavRows = (p, di = 3) => p.evaluate(di => { const day = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]; return [...day.querySelectorAll('[data-secmove$=".unav"] .pl-row')].map(r => ({ type: r.querySelector('.inpedit')?.textContent.trim(), who: [...r.querySelectorAll('.ppl .puck .nm')].map(n => n.textContent.trim()), rmk: (r.querySelector('.rmk .ntx')?.textContent || '').trim(), start: r.querySelector('.t-s')?.textContent.trim(), end: r.querySelector('.t-e')?.textContent.trim() })) }, di)
const odRecs = p => p.evaluate(() => window.INPUTS.filter(r => r.type === 'OD' && r.date === 'Jul 16' && ['Drifter', 'Hunter'].includes(window.PEOPLE[r.person]?.cs)).map(r => `${window.PEOPLE[r.person].cs}:${JSON.stringify(r.remarks || '')}`).sort().join(' / '))

/* 12 - an overseas duty for Drifter and Hunter on Thu 16 Jul: the Unavailable list is one row a man */
S[12] = async () => {
  const p = W.page, pics = []
  const mf = await toastMark(p)
  const filed = await fileInput(p, { type: 'OD', people: ['Drifter', 'Hunter'], from: '2026-07-16', to: '2026-07-16' }, false)
  const tf = await toastsSince(p, mf)
  await goWeek(p)
  await scrollWeek(p, 'unav', 3); await p.waitForTimeout(300)
  const day3 = '#eWeek .day:not(.peek) >> nth=3'
  const secLoc = p.locator('#eWeek .day:not(.peek)').nth(3).locator('[data-secmove$=".unav"]').first()
  pics.push(await shotEl(secLoc, 's12-week-unavailable-after-filing'))
  const rows0 = await unavRows(p)
  const od0 = rows0.filter(r => r.type === 'OD' && r.who.some(w => w === 'Drifter' || w === 'Hunter'))
  const recs0 = await odRecs(p)
  // type a remark on Drifter's row
  const idx = await p.evaluate(() => { const day = [...document.querySelectorAll('#eWeek .day:not(.peek)')][3]; return [...day.querySelectorAll('[data-secmove$=".unav"] .pl-row')].findIndex(r => r.querySelector('.ppl .puck .nm')?.textContent.trim() === 'Drifter') })
  const rowsLoc = p.locator('#eWeek .day:not(.peek)').nth(3).locator('[data-secmove$=".unav"] .pl-row')
  const m = await toastMark(p)
  await typeBox(p, rowsLoc.nth(idx).locator('.rmk .ntx').first(), 'Range deployment')
  const tt = await toastsSince(p, m)
  await scrollWeek(p, 'unav', 3); await p.waitForTimeout(300)
  pics.push(await shotEl(secLoc, 's12-week-unavailable-after-remark'))
  const rows1 = await unavRows(p)
  const od1 = rows1.filter(r => r.type === 'OD' && r.who.some(w => w === 'Drifter' || w === 'Hunter'))
  const recs1 = await odRecs(p)
  const okFile = od0.length === 2 && od0.every(r => r.who.length === 1) && filed.length === 2
  const okType = od1.length === 2 && recs1 === 'Drifter:"Range deployment" / Hunter:"till 16 Jul"' && od1.find(r => r.who[0] === 'Hunter').rmk === 'till 16 Jul'
  const probe = async q => `OD rows ${JSON.stringify((await unavRows(q)).filter(r => r.type === 'OD' && r.who.some(w => w === 'Drifter' || w === 'Hunter')).map(r => r.who[0] + ':' + r.rmk))}; INPUTS ${await odRecs(q)}`
  const done = await closing(p, 'week', TITLE, probe)
  return { n: 12, did: 'filed an overseas duty (OD) for Drifter and Hunter on Thu 16 Jul through the + Input window (Several people); looked at Thursday\'s Unavailable list; typed the remark "Range deployment" into Drifter\'s row box', saw: `after filing: ${od0.length} OD rows for them, ${JSON.stringify(od0.map(r => r.who[0] + ' ' + r.start + '-' + r.end))}; toast "${tf}"; INPUTS ${recs0}. After typing on Drifter's row: rows ${JSON.stringify(od1.map(r => r.who[0] + ':"' + r.rmk + '"'))}; INPUTS ${recs1}; toast "${tt}"`, inputs: recs1, done, pass: okFile && okType, pics }
}

/* 13 - Tally given a leave on 15 Jul while he is in G4: flag ring, the warning list, the click */
S[13] = async () => {
  const p = W.page, pics = []
  const mf = await toastMark(p)
  const filed = await fileInput(p, { type: 'LL', person: 'Tally', from: ISO, to: ISO }, false)
  const tf = await toastsSince(p, mf)
  const pucks = async (where) => p.evaluate(where => { const sel = where === 'board' ? '#schedBoard .sb-panel.grnd .sb-arow' : '#eWeek .day:not(.peek) .sec-grnd .pl-row'; const row = [...document.querySelectorAll(sel)].find(r => /range safety/i.test(r.querySelector('textarea.ain, input.ain')?.value || r.querySelector('.nm .ntx')?.textContent || '')); return row ? [...row.querySelectorAll('.ppl .puck')].map(k => ({ name: k.querySelector('.nm').textContent.trim(), cls: k.className, title: k.title })) : null }, where)
  await goWeek(p); await openFold(p, 'week'); await scrollWeek(p, 'ground'); await p.waitForTimeout(300)
  const wk = await pucks('week')
  pics.push(await shotEl(p.locator(WKSEL('ground')).first(), 's13-week-tally-flag'))
  await goBoard(p); await scrollBoard(p, 'ground'); await p.waitForTimeout(300)
  const bd = await pucks('board')
  const warnTxt = await p.evaluate(() => [...document.querySelectorAll('#sbSide *')].filter(e => e.children.length === 0 && /Tally/.test(e.textContent) && e.textContent.length < 200).map(e => e.textContent.trim()))
  const rowsState = () => p.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-panel.grnd .sb-arow')].map(r => [r.querySelector('textarea.ain')?.value, r.className, ...[...r.querySelectorAll('.puck')].map(k => k.className)].join(' || ')))
  const before = await rowsState()
  const warn = p.locator('#sbSide').getByText(/^Tally — On leave but tasked/).first()
  await warn.click(); await p.waitForTimeout(600)
  const after = await rowsState()
  const litAll = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .puck.wfoc')].map(k => (k.closest('.sb-panel')?.className.replace('sb-panel ', '') || '?') + ':' + (k.closest('.sb-arow')?.querySelector('textarea.ain')?.value || '?')))
  const lit = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-panel.grnd .puck.wfoc')].map(k => (k.closest('.sb-arow')?.querySelector('textarea.ain')?.value || k.closest('[data-secmove]')?.getAttribute('data-secmove') || '?') + ':' + k.querySelector('.nm').textContent.trim()))
  const dimmed = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-panel.grnd .puck')].filter(k => { let o = 1; for (let e = k; e && e.id !== 'schedBoard'; e = e.parentElement) o *= parseFloat(getComputedStyle(e).opacity); return o < 0.95 }).length)
  await scrollBoard(p, 'ground'); await p.waitForTimeout(250)
  pics.push(await shot(p, 's13-board-warning-clicked'), await shotEl(p.locator(BDSEL('ground')).first(), 's13-board-ground-warning-clicked'))
  const flagged = x => /\bwarn\b/.test(x.cls)
  const okWk = wk && wk.length === 4 && flagged(wk.find(x => x.name === 'Tally')) && wk.filter(flagged).length === 1
  const okBd = bd && bd.length === 4 && flagged(bd.find(x => x.name === 'Tally')) && warnTxt.some(t => /Tally — On leave but tasked — RANGE SAFETY BRIEF/i.test(t)) && lit.length === 1 && /RANGE SAFETY BRIEF:Tally/i.test(lit[0])
  const probe = async q => { const b = await pucks('board'); const t = b && b.find(x => x.name === 'Tally'); return `Tally puck on the board ${t ? (flagged(t) ? 'FLAGGED (' + t.cls + ')' : 'not flagged (' + t.cls + ')') : 'absent'}; leave records for Tally 15 Jul: ${await q.evaluate(() => window.INPUTS.filter(r => r.type === 'LL' && r.date === 'Jul 15').length)}` }
  const done = await closing(p, 'board', TITLE, probe)
  return { n: 13, did: 'filed a leave (LL) for Tally on 15 Jul through the + Input window, while he is in the meeting; read the one row on the week and the board; clicked his line in the board\'s warning list', saw: `week row pucks ${JSON.stringify(wk.map(x => x.name + (flagged(x) ? '[flag ring]' : '')))}; Tally puck class "${wk.find(x => x.name === 'Tally').cls}"; board row pucks ${JSON.stringify(bd.map(x => x.name + (flagged(x) ? '[flag ring]' : '')))}; warning list lines naming Tally: ${JSON.stringify(warnTxt)}; clicking it lit these pucks on the Ground Programme (warning-focus ring): ${JSON.stringify(lit)} (all lit places on the board: ${JSON.stringify(litAll)}); ${dimmed} other pucks on the Ground Programme dimmed; filing toast "${tf}"`, inputs: `LL for Tally: ${filed.length}`, done, pass: !!(okWk && okBd), pics }
}

/* 14 - the next-week peek draws ONE row */
S[14] = async () => {
  const p = W.page, pics = []
  await goWeek(p)
  await p.locator('button[data-wk]:visible', { hasText: 'Jul 06' }).first().click(); await p.waitForTimeout(1200)
  const peekRows = () => p.evaluate(() => { const d = [...document.querySelectorAll('#eWeek .day.peek')][2]; if (!d) return null; const rows = [...d.querySelectorAll('.pl-row')].filter(r => /range safety/i.test(r.querySelector('.nm')?.textContent || '')); return { head: d.querySelector('.dayhead, h2, .dh')?.textContent?.replace(/\s+/g, ' ').slice(0, 40) || d.textContent.slice(0, 30), n: rows.length, men: rows.map(r => [...r.querySelectorAll('.puck .nm')].map(x => x.textContent.trim())), editable: rows.map(r => r.querySelectorAll('[contenteditable=true], [data-slot], [data-fill], button').length) } })
  await p.evaluate(() => { const d = [...document.querySelectorAll('#eWeek .day.peek')][2]; d.scrollIntoView({ inline: 'center', block: 'nearest' }); const sec = d.querySelector('.sec-grnd'); window.scrollTo(0, Math.max(0, sec.getBoundingClientRect().top + window.scrollY - 96)) })
  await p.waitForTimeout(500)
  const r = await peekRows()
  const sec = p.locator('#eWeek .day.peek').nth(2).locator('.sec-grnd').first()
  pics.push(await shotEl(sec, 's14-peek-wednesday-ground'))
  const wk = await p.evaluate(() => window.CURWEEK || null)
  const pass = !!r && r.n === 1 && JSON.stringify(r.men[0]) === JSON.stringify(FOUR) && r.editable[0] === 0
  const probe = async q => { const x = await peekRows(); return x ? `peek Wednesday: ${x.n} row(s) ${JSON.stringify(x.men)}` : 'no peek drawn' }
  const m1 = await toastMark(p)
  const done = await closing(p, 'week', TITLE, probe)
  return { n: 14, did: 'week: clicked the Jul 06 week chip so 13-19 Jul shows as next week\'s peek; read the peek\'s Wednesday Ground Programme', saw: `peek ${JSON.stringify(r)}; the peek's row has ${r && r.editable[0]} controls (editable boxes / drop targets / buttons)`, inputs: (await inputsOf(p)).n + ' records of the input', done, pass, pics }
}

/* the same, in a clean world, taking Hunter off a different way - to be sure what the first run saw is the app's, not the gesture's */
async function allAvailVariant(kind) {
  const w = await openWorld(); const p = w.page
  try {
    await fileFixture(p); await goWeek(p); await scrollWeek(p, 'ground'); await p.waitForTimeout(300)
    const hunter = await id(p, 'Hunter')
    const ph = p.locator('#eRoster').getByText('ALL AVAIL', { exact: true }).first()
    const row = await rowLoc(p, 'weekG')
    await drag(p, ph, kind === 'dropped on the + add zone' ? row.locator('.addz').first() : puckIn(row, hunter))
    await scrollWeek(p, 'ground'); await p.waitForTimeout(250)
    const m = await toastMark(p)
    const hp = puckIn(await rowLoc(p, 'weekG'), hunter)
    if (/right-click/.test(kind)) await hp.click({ button: 'right' }); else await drag(p, hp, emptyPage)
    await p.waitForTimeout(600)
    const names = (await readRows(p)).weekGround[0]
    return `variant "${kind}": row after Hunter off ${JSON.stringify(names)}; INPUTS ${(await inputsOf(p)).people.join(',')}; toast "${await toastsSince(p, m)}"`
  } catch (e) { return `variant "${kind}" ERROR ${String(e).slice(0, 120)}` } finally { await w.ctx.close() }
}

/* 15 - ALL AVAIL dropped on Hunter's puck; then Hunter taken off */
S[15] = async () => {
  const p = W.page, pics = []
  await goWeek(p); await openFold(p, 'week'); await scrollWeek(p, 'ground'); await p.waitForTimeout(300)
  const ph = p.locator('#eRoster').getByText('ALL AVAIL', { exact: true }).first()
  const m = await toastMark(p); let flash = null
  const row = await rowLoc(p, 'weekG')
  await drag(p, ph, puckIn(row, await id(p, 'Hunter')), { onUp: async () => { flash = await flashNow(p) } })
  const t1 = await toastsSince(p, m)
  const a1 = await snap(p, 'week')
  const seats1 = await p.evaluate(() => { const r = [...document.querySelectorAll('#eWeek .day:not(.peek) .sec-grnd .pl-row')].find(r => /range safety/i.test(r.querySelector('.nm .ntx')?.textContent || '')); return [...r.querySelectorAll('.ppl .seat')].map(s => (s.getAttribute('data-slot') || '') + ':' + (s.querySelector('.nm')?.textContent || '').trim()) })
  await scrollWeek(p, 'ground'); pics.push(await shotEl(p.locator(WKSEL('ground')).first(), 's15-week-allavail-dropped'))
  const ok1 = a1.rows.ground[0].length === 5 && a1.rows.ground[0].includes('Hunter') && a1.raw.people.join() === ['Drifter', 'Hunter', 'Ranger', 'Tally'].join() && a1.raw.n === 4 && /ALL AVAIL/i.test(a1.rows.ground[0].join(' '))
  // take Hunter off
  await scrollWeek(p, 'ground'); await p.waitForTimeout(250)
  const row2 = await rowLoc(p, 'weekG')
  const m2 = await toastMark(p)
  await drag(p, puckIn(row2, await id(p, 'Hunter')), emptyPage)
  const t2 = await toastsSince(p, m2)
  const a2 = await snap(p, 'week')
  await scrollWeek(p, 'ground'); pics.push(await shotEl(p.locator(WKSEL('ground')).first(), 's15-week-hunter-off'))
  const ok2 = !a2.rows.ground[0].includes('Hunter') && !/ALL AVAIL/i.test(a2.rows.ground[0].join(' ')) && /ALL AVAIL came off Range safety brief with Hunter — drop it on the row again if it still applies/i.test(t2) && a2.raw.people.join() === ['Drifter', 'Ranger', 'Tally'].join()
  const done = await closing(p, 'week')
  const ok3 = done.undo.snap.rows.ground[0].includes('Hunter') && /ALL AVAIL/i.test(done.undo.snap.rows.ground[0].join(' '))
  const variants = []
  if (!ok2) for (const k of ['Hunter taken off by right-click', 'ALL AVAIL dropped on the + add zone, Hunter dragged off']) variants.push(await allAvailVariant(k))
  return { n: 15, did: 'week: mouse-drag the ALL AVAIL placeholder from the crew drawer onto Hunter\'s puck on the one row; then mouse-drag Hunter\'s puck off onto empty page', saw: `after the drop: row ${JSON.stringify(a1.rows.ground[0])} seats ${JSON.stringify(seats1)}; INPUTS ${a1.inputs}; toast "${t1}"; flash ${JSON.stringify((flash || []).map(f => f.slot || f.cls))}. After taking Hunter off: row ${JSON.stringify(a2.rows.ground[0])}; INPUTS ${a2.inputs}; toast "${t2}"${variants.length ? '. Tried again in clean worlds: ' + variants.join(' ;; ') : ''}`, inputs: a2.inputs, done, pass: !!(ok1 && ok2 && ok3), pics }
}

/* ------------------------------------------------------------------ run */
if (args[0] === 'report') { await report(); process.exit(0) }
const which = args.length ? args.map(Number) : Object.keys(S).map(Number).sort((a, b) => a - b)
const res = load()
for (const n of which) {
  W = await openWorld()
  try {
    await fileFixture(W.page)
    console.log('=== scenario', n)
    const r = await S[n]()
    res[n] = r; res._errs = [...new Set([...(res._errs || []), ...errs])]; save(res)
    const f = x => x && (fmtSnap(x.snap) + ' | toast ' + x.toast + ' | ' + x.snap.inputs + (x.probe ? ' | ' + x.probe : ''))
    console.log(JSON.stringify({ n: r.n, pass: r.pass, saw: r.saw, inputs: r.inputs, undo: f(r.done?.undo), redo: f(r.done?.redo), reload: f(r.done?.reload), pics: r.pics }, null, 1))
  } catch (e) { console.log('SCENARIO', n, 'ERROR', String(e.stack || e).split('\n').slice(0, 8).join(' | ')); try { await shot(W.page, `s${n}-error`) } catch {} }
  await W.ctx.close()
}
console.log('errs', errs)
await browser.close()

async function report() {
  const res = load()
  const notes = existsSync('scripts/handpass/_w1-notes.json') ? JSON.parse(readFileSync('scripts/handpass/_w1-notes.json', 'utf8')) : { notes: {}, could: [], verdict: {} }
  const esc = x => String(x == null ? '' : x).replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>')
  const IMG = 'docs/img/handpass/2026-10-11-group-input-one-row/w1/'
  const stepTxt = (lab, x) => x ? `${lab} [${x.ctl || ''}] note "${x.toast || '(none)'}": ${fmtSnap(x.snap)}; INPUTS ${x.snap.inputs}${x.probe ? '; ' + x.probe : ''}` : `${lab}: n/a`
  const ur = r => {
    const one = d => `${stepTxt('Undo', d.undo)}<br>${stepTxt('Redo', d.redo)}<br>${stepTxt('Reload', d.reload && { snap: d.reload.snap, probe: d.reload.probe })}`
    if (r.doneAll) return r.doneAll.map(x => `<b>${x.where}</b>: ` + (x.done ? one(x.done) : 'n/a')).join('<br><br>')
    return r.done ? one(r.done) : 'n/a'
  }
  const lines = []
  lines.push('# W1 - the hands, desktop 1440x900 (walker W1, 11 Oct 26)', '')
  lines.push('Real mouse and keyboard on the built bundle at http://localhost:4180/, one browser context a scenario (a reload ends the undo list, so each scenario starts in a fresh world with the fixture re-filed through + Input: G4 Meeting "Range safety brief" Drifter, Hunter, Ranger, Tally, Wed 15 Jul 14:00-15:00, and S1 a one-man Training for Anvil 10:00-11:00). Signed in as `ad` / `a`. The PC clock was 11 Oct 26, so every input reads LATE; that is beside the point of these scenarios. Script: `scripts/handpass/gi-w1.mjs` (helpers `gi-w1-lib.mjs`). Undo/Redo: the top bar\'s `#undoBtn` / `#redoBtn` on the week, the board\'s own `#sbUndo` / `#sbRedo` on the board (real clicks). Pictures: `' + IMG + '`.', '')
  lines.push('| # | what I did (the real gesture) | what the screen said and showed | what window.INPUTS said | Undo / Redo / reload | PASS / FAIL | picture(s) |', '|---|---|---|---|---|---|---|')
  let pass = 0, fail = 0
  for (const n of Object.keys(res).filter(k => /^\d+$/.test(k)).map(Number).sort((a, b) => a - b)) {
    const r = res[n]
    const v = notes.verdict[n] || (r.pass ? 'PASS' : 'FAIL')
    if (/^PASS/.test(v)) pass++; else fail++
    const pics = (r.pics || []).map(x => '`' + (x.endsWith('.png') ? x : x + '.png') + '`').join(', ')
    lines.push(`| ${n} | ${esc(r.did)} | ${esc(r.saw)}${notes.notes[n] ? '<br><br><b>Note:</b> ' + esc(notes.notes[n]) : ''}${r.note ? '<br><br>' + esc(r.note) : ''} | ${esc(r.inputs)} | ${esc(ur(r))} | **${esc(v)}** | ${pics} |`)
  }
  lines.push('', `**Count: ${pass} PASS, ${fail} FAIL** (of ${pass + fail} scenarios run).`, '')
  lines.push('## Browser errors seen', '')
  const e = res._errs || []
  lines.push(...(e.length ? e.map(x => '- ' + x) : ['none']), '')
  lines.push('## Could not do, and why', '')
  lines.push(...(notes.could.length ? notes.could.map(x => '- ' + x) : ['nothing - every scenario was driven through real controls.']), '')
  writeFileSync('docs/handpass/parts/gi-w1.md', lines.join('\n') + '\n')
  console.log('written docs/handpass/parts/gi-w1.md', pass, 'pass', fail, 'fail')
}
