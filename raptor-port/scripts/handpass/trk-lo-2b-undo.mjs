/* [TRK-LEFTOVERS] walker b — C4 + D372: a change to a student's pace, either
   end date or his lull periods is an undo step, like Last Flown and Upchit.
   With an OLDER mark in the history (ST-01 graded DCO first), each change is
   made, the ↶ tooltip is read (it must name the change), then Ctrl+Z is
   pressed ON THE CHART (not in a box) and ↶ is pressed on the bar: the change
   goes back and the older mark stays; ↷ puts it again. The pace is typed "3"
   then "3.5" quickly (one step). A lull period is added, changed and removed
   (removal asks first). "Copy to…" onto two other students is ONE step: taken
   back, both students' periods come back together and the Crew picker stays.

     node scripts/handpass/trk-lo-2b-undo.mjs desk|phone

   A fresh browser (the demo world), admin. A third student is added with
   + Add (typed), because the demo course has two. Storage is read only to
   check what was saved. */
import { open, shot, save, log, PHONE, DESK } from './trk-lib.mjs'
import { sleep, pickFrom } from './trk-w2-lib.mjs'
import { PH, TAG, todayIso, addDays, short, press, pressSel, toInfo, toFlow, tapBall, stored, undoNow, chartBlank } from './trk-lo-2b-lib.mjs'

const L = log()
const { browser, page, errors } = await open({ size: PH ? PHONE : DESK, who: 'a', touch: PH })
const T = await todayIso(page)
let pic = 0
const snap = async (what, opts) => { const n = `lo-2b-${TAG}-u${++pic}-${what}`; await shot(page, n, opts); return n }
const crew = () => page.locator('#activeSel option:checked').innerText()
const roster = () => page.evaluate(() => window.__coreForTests.rosterNow().map(r => ({ id: r.id, name: r.name })))
const grade = async label => {
  const b = page.locator('#pop button', { hasText: new RegExp('^\\s*' + label.replace(/\./g, '\\.') + '\\s*$') }).first()
  await b.scrollIntoViewIfNeeded(); const r = await b.boundingBox(); await press(page, r.x + r.width / 2, r.y + r.height / 2); await sleep(500)
}
const olderMark = async () => (((await stored(page, A)).m || {})['ST-01'] || {}).g
/** Ctrl+Z / Ctrl+Y pressed with the keyboard's focus on the chart, not in a box */
async function keyOnChart(combo) {
  await toFlow(page)
  const p = await chartBlank(page); await press(page, p.x, p.y)
  const f = await page.evaluate(() => (document.activeElement || {}).tagName)
  await page.keyboard.press(combo); await sleep(700)
  return f
}
const bar = async id => { await pressSel(page, id); await sleep(700) }
/** the whole round for one change: the tooltip names it; Ctrl+Z on the chart takes it
    back and the older mark stays; ↷ puts it again; ↶ on the bar takes it back; ↷ again */
async function round(label, tipRe, read, before, after, { picture = null } = {}) {
  const u = await undoNow(page)
  L.ok(`${label}: ↶'s tooltip names the change`, tipRe.test(u.t || ''), `"${u.t}"`)
  const focus = await keyOnChart('Control+z')
  const r1 = await read(), m1 = await olderMark(), c1 = await crew()
  if (picture) { await toInfo(page); await snap(picture + '-after-ctrlz') }
  L.ok(`${label}: Ctrl+Z on the chart (focus on ${focus}) takes it back — the older mark (ST-01 DCO) stays`, JSON.stringify(r1) === JSON.stringify(before) && m1 === 'dco',
    `now ${JSON.stringify(r1)} (want ${JSON.stringify(before)}) · ST-01 ${m1} · crew ${c1} · ↷ "${(await undoNow(page)).rt}"`)
  await bar('#trRedoBtn')
  const r2 = await read()
  L.ok(`${label}: ↷ puts it again`, JSON.stringify(r2) === JSON.stringify(after), `now ${JSON.stringify(r2)} (want ${JSON.stringify(after)})`)
  await bar('#trUndoBtn')
  const r3 = await read(), m3 = await olderMark()
  L.ok(`${label}: ↶ on the bar takes it back too — the older mark stays`, JSON.stringify(r3) === JSON.stringify(before) && m3 === 'dco', `now ${JSON.stringify(r3)} · ST-01 ${m3}`)
  await bar('#trRedoBtn')
  const r4 = await read()
  L.ok(`${label}: ↷ puts it again`, JSON.stringify(r4) === JSON.stringify(after), `now ${JSON.stringify(r4)}`)
}
async function leaveBox(sel) {
  const p = await page.evaluate(sel => { const h = document.querySelector(sel).closest('.card').querySelector('h3'); const r = h.getBoundingClientRect(); return { x: r.left + 6, y: r.top + r.height / 2 } }, sel)
  await press(page, p.x, p.y); await sleep(500)
}
async function typeDay(sel, iso) {
  const [y, m, d] = iso.split('-')
  await pressSel(page, sel, { dx: 10 }); await page.keyboard.type(d + m + y, { delay: 60 }); await sleep(250)
  await leaveBox(sel)
}
/** + Set lull period (or a chip tapped), then two days pressed on the calendar */
async function lullPick(openSel, a, b) {
  await toInfo(page)
  await pressSel(page, openSel); await sleep(350)
  for (const d of [a, b]) {
    for (let k = 0; k < 3 && !(await page.locator(`#lullCal .day[data-iso="${d}"]`).count()); k++) await pressSel(page, d < (await page.evaluate(() => document.querySelector('#lullCal .day:not(.out)').dataset.iso)) ? '#lullPrev' : '#lullNext')
    await pressSel(page, `#lullCal .day[data-iso="${d}"]`); await sleep(350)
  }
}
const lullsOf = async sid => ((await stored(page, sid)).lulls || []).map(l => l.start + '→' + l.end)

/* ---- the older mark ---- */
const R0 = await roster(); const A = R0[0].id, B = R0[1].id
L.note('0 today / roster / picked', `${T} · ${R0.map(r => r.name).join(', ')} · ${await crew()} · ${PH ? 'phone 390×844 touch' : 'desktop 1440×900'}`)
await tapBall(page, 'ST-01'); await grade('DCO')
L.ok('0 the older mark: ST-01 graded DCO for STUDENT A (one step)', (await olderMark()) === 'dco' && (await undoNow(page)).depth === 1, `ST-01 ${await olderMark()} · ↶ "${(await undoNow(page)).t}"`)
await sleep(2200)

/* ---- 1. the pace, "3" then "3.5" quickly ---- */
await toInfo(page)
{
  const p0 = ((await stored(page, A)).pace || {}).epw ?? null, box0 = await page.locator('#epwIn').inputValue(), d0 = (await undoNow(page)).depth
  await pressSel(page, '#epwIn'); await page.keyboard.press('Control+a'); await page.keyboard.press('Backspace')
  await page.keyboard.type('3', { delay: 80 }); await sleep(300)
  const mid = [await page.locator('#epwIn').inputValue(), ((await stored(page, A)).pace || {}).epw]
  await page.keyboard.type('.5', { delay: 120 }); await sleep(500)
  await leaveBox('#epwIn')
  const p1 = ((await stored(page, A)).pace || {}).epw, d1 = (await undoNow(page)).depth
  L.ok(`1 pace typed "3" then "3.5" quickly → saved 3.5 as ONE step`, String(p1) === '3.5' && d1 === d0 + 1, `box was "${box0}" (stored ${JSON.stringify(p0)}) · after "3": box ${mid[0]}, stored ${mid[1]} · now stored ${p1} · steps ${d0}→${d1}`)
  /* the pace in force: what the box shows, and what is stored — nothing stored
     yet means the baseline, 2 a week (the card's own words) */
  const readPace = async () => [await page.locator('#epwIn').inputValue().catch(() => null), String(((await stored(page, A)).pace || {}).epw ?? '2')]
  await toInfo(page); await page.locator('#epwIn').scrollIntoViewIfNeeded(); await snap('pace-3.5', { el: '.c-pace' })
  const readP = async () => { await toInfo(page); return readPace() }
  await round('1 pace', /the pace for STUDENT A/, readP, [box0, String(p0 ?? '2')], ['3.5', '3.5'], { picture: 'pace' })
}
await sleep(2200)

/* ---- 2. End date A, 3. End date B ---- */
for (const [n, sel, key, day, tip] of [['2 End date A', '#targetIn', 'target', addDays(T, 60), /End date A for STUDENT A/], ['3 End date B', '#targetIn2', 'target2', addDays(T, 90), /End date B for STUDENT A/]]) {
  await toInfo(page)
  const v0 = ((await stored(page, A)).pace || {})[key] || ''
  await typeDay(sel, day)
  const readE = async () => { await toInfo(page); return [await page.locator(sel).inputValue(), ((await stored(page, A)).pace || {})[key] || ''] }
  L.ok(`${n}: ${short(day)} typed and left → saved`, ((await stored(page, A)).pace || {})[key] === day, JSON.stringify(await readE()))
  await round(n, tip, readE, [v0, v0], [day, day])
  await sleep(2200)
}
await toInfo(page); await page.locator('#targetIn').scrollIntoViewIfNeeded(); await snap('pace-card-after-dates', { el: '.c-pace' })

/* ---- 4. a lull period: added, changed, removed ---- */
const L1 = [addDays(T, -6), addDays(T, -4)], L2 = [addDays(T, -14), addDays(T, -12)]
const readL = async () => { await toInfo(page); return [await page.evaluate(() => [...document.querySelectorAll('#lullChips .lullchip')].map(c => c.textContent.replace('×', '').replace(/\s+/g, ' ').trim())), await lullsOf(A)] }
const chipTxt = ([a, b]) => short(a) + '→' + short(b)
await lullPick('#setLullBtn', L1[0], L1[1])
L.ok(`4 a lull period added ${chipTxt(L1)}`, JSON.stringify(await lullsOf(A)) === JSON.stringify([L1.join('→')]), JSON.stringify(await readL()))
await round('4 lull added', /the lull periods for STUDENT A/, readL, [[], []], [[chipTxt(L1)], [L1.join('→')]])
await sleep(2200)
await lullPick('#lullChips .lullchip', L2[0], L2[1])
L.ok(`5 the lull period changed to ${chipTxt(L2)} (its chip tapped)`, JSON.stringify(await lullsOf(A)) === JSON.stringify([L2.join('→')]), JSON.stringify(await readL()))
await round('5 lull changed', /the lull periods for STUDENT A/, readL, [[chipTxt(L1)], [L1.join('→')]], [[chipTxt(L2)], [L2.join('→')]])
await sleep(2200)
{
  await toInfo(page)
  const d0 = (await undoNow(page)).depth
  await pressSel(page, '#lullChips .lullchip .x'); await sleep(300)
  const q = await page.locator('#dlgModal').isVisible().catch(() => false) ? (await page.locator('#dlgModal').innerText()).replace(/\s+/g, ' ').trim() : null
  const nq = await snap('lull-remove-asks')
  await pressSel(page, '#dlgCancel'); await sleep(300)
  L.ok(`6 × on the period asks first — "${q}"; No/Cancel keeps it, no step (${nq})`, !!q && JSON.stringify(await lullsOf(A)) === JSON.stringify([L2.join('→')]) && (await undoNow(page)).depth === d0, `lulls ${JSON.stringify(await lullsOf(A))} · steps ${d0}→${(await undoNow(page)).depth}`)
  await pressSel(page, '#lullChips .lullchip .x'); await sleep(300)
  await pressSel(page, '#dlgOk'); await sleep(400)
  L.ok('6 answered yes → removed, one step', (await lullsOf(A)).length === 0 && (await undoNow(page)).depth === d0 + 1, `lulls ${JSON.stringify(await lullsOf(A))} · steps ${d0}→${(await undoNow(page)).depth}`)
  await round('6 lull removed', /the lull periods for STUDENT A/, readL, [[chipTxt(L2)], [L2.join('→')]], [[], []])
}
await sleep(2200)

/* ---- 7. Copy to… two other students — ONE step ---- */
{
  /* a third student, typed in + Add */
  await toInfo(page)
  await pressSel(page, '#addStu'); await page.waitForSelector('#dlgModal', { state: 'visible' }); await sleep(300)
  await pressSel(page, '#dlgInput'); await page.keyboard.type('WALKB C', { delay: 50 }); await sleep(200)
  await pressSel(page, '#dlgOk'); await sleep(900)
  const R1 = await roster(); const Cst = R1.find(r => r.name === 'WALKB C')
  L.note('7.0 + Add typed "WALKB C"', JSON.stringify(R1.map(r => r.name)) + ' · crew now ' + await crew())
  if (!Cst) throw new Error('the third student was not added')
  const C = Cst.id
  /* STUDENT B gets a period of his own first */
  await pickFrom(page, '#activeSel', /STUDENT B/)
  const LB = [addDays(T, -25), addDays(T, -24)]
  await lullPick('#setLullBtn', LB[0], LB[1])
  await pickFrom(page, '#activeSel', /STUDENT A/)
  const LA = [addDays(T, -5), addDays(T, -3)]
  await lullPick('#setLullBtn', LA[0], LA[1])
  const before = { B: await lullsOf(B), C: await lullsOf(C), A: await lullsOf(A) }
  L.note('7.1 before the copy', JSON.stringify(before) + ' · crew ' + await crew())
  await sleep(2200)
  const d0 = (await undoNow(page)).depth
  await pressSel(page, '#copyLullBtn'); await sleep(350)
  for (const nm of ['STUDENT B', 'WALKB C']) {
    const cb = page.locator('#lullCopy label.lullpick:not(.lullall)', { hasText: nm }).locator('input'); const b = await cb.boundingBox(); await press(page, b.x + b.width / 2, b.y + b.height / 2)
  }
  const nc = await snap('copy-to-ticked', { el: '#lullCopy' })
  await pressSel(page, '#lullCopyOk'); await sleep(600)
  const after = { B: await lullsOf(B), C: await lullsOf(C) }, u = await undoNow(page)
  L.ok(`7 Copy to… STUDENT B and WALKB C → both get A's period, ONE step (${nc})`, JSON.stringify(after.B) === JSON.stringify(before.A) && JSON.stringify(after.C) === JSON.stringify(before.A) && u.depth === d0 + 1,
    `${JSON.stringify(after)} · steps ${d0}→${u.depth} · ↶ "${u.t}"`)
  L.ok('7 ↶\'s tooltip names the copy ("the lull periods for 2 students")', /the lull periods for 2 students/.test(u.t || ''), `"${u.t}"`)
  const readBoth = async () => [await lullsOf(B), await lullsOf(C)]
  const focus = await keyOnChart('Control+z')
  const r1 = await readBoth(), c1 = await crew(), m1 = await olderMark(), u1 = await undoNow(page)
  await toInfo(page); const n1 = await snap('copy-after-ctrlz')
  L.ok(`7 Ctrl+Z on the chart (focus on ${focus}) → BOTH students back together (B his own, C none), Crew stays on STUDENT A, ST-01 still DCO (${n1})`,
    JSON.stringify(r1) === JSON.stringify([before.B, before.C]) && c1 === 'STUDENT A' && m1 === 'dco',
    `${JSON.stringify(r1)} (want ${JSON.stringify([before.B, before.C])}) · crew ${c1} · ↷ "${u1.rt}"`)
  await bar('#trRedoBtn')
  const r2 = await readBoth()
  L.ok('7 ↷ → both carry A\'s period again, crew still A', JSON.stringify(r2) === JSON.stringify([before.A, before.A]) && (await crew()) === 'STUDENT A', `${JSON.stringify(r2)} · crew ${await crew()}`)
  await bar('#trUndoBtn')
  const r3 = await readBoth()
  L.ok('7 ↶ on the bar → both back together, crew still A', JSON.stringify(r3) === JSON.stringify([before.B, before.C]) && (await crew()) === 'STUDENT A', `${JSON.stringify(r3)} · crew ${await crew()}`)
  await bar('#trRedoBtn')
  L.ok('7 ↷ → both copied again', JSON.stringify(await readBoth()) === JSON.stringify([before.A, before.A]), JSON.stringify(await readBoth()))
  await toInfo(page); await page.locator('#lullChips').scrollIntoViewIfNeeded(); await snap('lull-card-end', { el: '.c-lull' })
}

L.ok('no console errors, page errors, failed requests or native dialogs', errors.length === 0, JSON.stringify(errors))
save(`lo-2b-undo-${TAG}`, { rows: L.rows, errors })
await browser.close()
process.exit(L.rows.some(r => r.pass === false) ? 1 : 0)
