// The Inputs batch's check (3 Nov 26): the walk of the code read's fixes, on the frozen build of their commit.
//   WALK_DIR=<folder> ISR_OUT=<pictures> LOOK_URL=http://localhost:4394/ node scripts/handpass/ibc-cr.mjs
// C1 D1620 — a member's own later change brings back the LATE mark a scheduler dropped; a scheduler's change keeps it.
// C2 the security read's finding 1 — a member's own medical (OML) over his leave whose LATE mark was dropped is filed, not refused.
// C3 F-A3 — Save with nothing changed on an input of several people says nothing and changes nothing.
// C4 F-A1 — "Delete this input?" up, the Inputs settings window opened in front: Escape closes that window, the question stays.
// C5 F-A2 — Make public pressed twice on a published day leaves no pending mark on the note.
// Every write through the app's own controls; the probe bridge (INPUTS, PEOPLE, DAYS) is only READ.
import * as L from './isr-A-lib.mjs'
import { pubDay, editWeek, showDay, closeBoard } from './isr-A-pub.mjs'
const { check, note, shot, tid } = L
const sleep = ms => new Promise(r => setTimeout(r, ms))

const rec = (page, iid) => page.evaluate(iid => { const r = window.INPUTS.find(x => String(x.iid) === String(iid)); return r ? { type: r.type, date: r.date, endDate: r.endDate, lateOff: !!r.lateOff, late: window.isLateInput(r), mod: r.mod, modAt: r.modAt, remarks: r.remarks } : null }, iid)
async function signIn(page, user) {
  await closeBoard(page)
  if (await page.locator('#logout').count()) { await page.locator('#logout').click(); await sleep(700) }
  await page.fill('#luser', user); await page.fill('#lpass', user === 'ad' ? 'a' : user)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(500)
}
async function openBoard(page, di) {
  await closeBoard(page); await L.go(page, 'editsched')
  await page.locator(`#eWeek [data-sbday="${di}"]:visible`).first().click()
  await page.waitForSelector('#schedBoard'); await sleep(700)
}
const chipOf = (page, iid) => page.evaluate(id => { const e = [...document.querySelectorAll(`#schedBoard .latechip[data-lateoff="${id}"]`)].find(x => x.getBoundingClientRect().height > 0); return e ? { off: e.classList.contains('off') } : null }, iid)
/* open an input's own window from its line in the opened day of the Inputs calendar */
async function openInput(page, iso, iid) {
  await L.toInputsCal(page, false); await L.incalMonth(page, false, +iso.slice(0, 4), +iso.slice(5, 7))
  await L.openDay(page, iso)
  await page.locator(`[data-testid="idy-row-${iid}"] [data-testid="idy-open"]`).first().click(); await sleep(400)
  await tid(page, 'win-inputedit').waitFor()
}

const { page } = await L.session('desktop', 'us')
/* Ranger (bane), the member signed in, and two days of the loaded week he is free on, side by side */
const pick = await page.evaluate(() => { const D = window.DAYS; const freeOn = d => !JSON.stringify(D[d]).includes('"bane"') && !window.INPUTS.some(r => JSON.stringify(r).includes('"bane"') && window.inputCoversDate(r, D[d].dt)); for (let d = 0; d < 4; d++) if (freeOn(d) && freeOn(d + 1)) return d; return -1 })
const ISO = d => `2026-07-${String(13 + d).padStart(2, '0')}`
const D1 = pick, A = ISO(pick), B = ISO(pick + 1)
note('C0', `Ranger free on ${A} and ${B} (day ${D1} of the week): ${pick >= 0}`)

/* ---------- C1: D1620 ---------- */
const ll = await L.fileOn(page, false, A, { type: 'LL', people: ['bane'], end: B, remarks: 'family' })
const r0 = await rec(page, ll)
check('C1', 'premise: his leave is filed, and late (filed long after its cut-off)', !!ll && r0 && r0.late, r0)
await signIn(page, 'ad')
await openBoard(page, D1)
const c0 = await chipOf(page, ll)
check('C1', 'premise: the board shows its LATE chip, solid', c0 && !c0.off, c0)
await page.locator(`#schedBoard .latechip[data-lateoff="${ll}"]`).first().click(); await sleep(600)
check('C1', 'the scheduler drops it', (await rec(page, ll)).lateOff === true && (await chipOf(page, ll)).off, await rec(page, ll))
await shot(page, 'C1', 'desktop', '1-scheduler-dropped')
/* a scheduler's own change keeps it */
await openInput(page, A, ll)
await page.fill('#inpEditPop #inpEditRmk', 'family — seen by the scheduler'); await L.press(page, false, '#inpEditSave'); await sleep(500)
if (await tid(page, 'docconf-nodoc').count()) { await L.press(page, false, '[data-testid="docconf-nodoc"]'); await sleep(300) }
check('C1', 'a scheduler\'s own change keeps the drop', (await rec(page, ll)).lateOff === true, await rec(page, ll))
/* the member changes it again */
await signIn(page, 'us')
await openInput(page, A, ll)
await page.fill('#inpEditPop #inpEditRmk', 'family — flights changed'); await L.press(page, false, '#inpEditSave'); await sleep(500)
if (await tid(page, 'docconf-nodoc').count()) { await L.press(page, false, '[data-testid="docconf-nodoc"]'); await sleep(300) }
const notesM = await L.notes(page)
const r1 = await rec(page, ll)
check('C1', 'his save goes through (not refused)', r1 && r1.remarks === 'family — flights changed' && !notesM.some(n => /couldn.t be completed/i.test(n)), { r1, notes: notesM.slice(-3) })
check('C1', 'his change takes the drop off', r1 && r1.lateOff === false && r1.late, r1)
await signIn(page, 'ad')
await openBoard(page, D1)
const c1 = await chipOf(page, ll)
check('C1', 'the scheduler sees LATE again on the board (the chip solid)', c1 && !c1.off, c1)
await shot(page, 'C1', 'desktop', '2-late-back-after-his-change')

/* ---------- C2: his MC over his leave whose LATE mark was dropped ---------- */
await page.locator(`#schedBoard .latechip[data-lateoff="${ll}"]`).first().click(); await sleep(600)
check('C2', 'premise: the scheduler drops it again', (await rec(page, ll)).lateOff === true, await rec(page, ll))
await signIn(page, 'us')
await page.evaluate(() => { window.__notes = [] })
const mc = await L.fileOn(page, false, B, { type: 'OML', people: ['bane'] })
const notesC2 = await L.notes(page)
check('C2', 'his OML over the second day of that leave is filed', !!mc && !notesC2.some(n => /couldn.t be completed/i.test(n)), { mc, mcRec: mc && await rec(page, mc), notes: notesC2 })
const l2 = await rec(page, ll)
check('C2', 'his leave is cut back to the day before', l2 && !l2.endDate, l2)
note('C2', `the cut leave keeps the drop (the medical's cut, never late — the agent's call): lateOff ${l2 && l2.lateOff}`)
await L.toInputsCal(page, false); await L.incalMonth(page, false, 2026, 7); await L.openDay(page, B)
await shot(page, 'C2', 'desktop', 'oml-filed-over-the-leave')
if (await tid(page, 'win-inputsday-x').count()) await L.press(page, false, '[data-testid="win-inputsday-x"]')

/* ---------- C3: Save with nothing changed, an input of several ---------- */
await signIn(page, 'ad')
const men = await L.freeMen(page, 2, [2])
const grp = await L.fileOn(page, false, '2026-07-15', { type: 'Meeting', people: men, from: '09:00', to: '10:00', title: 'Ops brief' }, true)
check('C3', 'premise: an input of two people', !!grp && men.length === 2, { grp, men })
await page.evaluate(() => { window.__notes = [] })
const g0 = await rec(page, grp)
await page.locator(`[data-testid="idy-row-${grp}"] [data-testid="idy-open"]`).first().click(); await sleep(400)
await tid(page, 'win-inputedit').waitFor()
await L.press(page, false, '#inpEditSave'); await sleep(600)
const g1 = await rec(page, grp)
const notesC3 = await L.notes(page)
check('C3', 'the window closes', (await tid(page, 'win-inputedit').count()) === 0, null)
check('C3', 'nothing is said ("Input updated" is not)', !notesC3.some(n => /Input updated/.test(n)), notesC3)
check('C3', 'nothing is stamped', JSON.stringify(g1) === JSON.stringify(g0), { before: g0, after: g1 })
const ring = await page.evaluate(id => !!document.querySelector(`[data-testid="idy-row-${id}"] .justadded, [data-testid="idy-row-${id}"].justadded`), grp)
check('C3', 'no just-changed ring on its card', !ring, ring)
await shot(page, 'C3', 'desktop', 'save-nothing-changed')

/* ---------- C4: "Delete this input?" with the settings window in front ---------- */
await page.locator(`[data-testid="idy-row-${grp}"] [data-testid="idy-open"]`).first().focus()
await page.keyboard.press('Delete'); await sleep(300)
check('C4', 'premise: the question is up', (await tid(page, 'idy-ask').count()) > 0, null)
await page.locator('#inGear').click(); await sleep(400)
check('C4', 'premise: the Inputs settings window is open', (await tid(page, 'win-inputsset').count()) > 0, null)
await shot(page, 'C4', 'desktop', '1-question-and-settings')
await page.keyboard.press('Escape'); await sleep(300)
const c4 = { settings: await tid(page, 'win-inputsset').count(), ask: await tid(page, 'idy-ask').count(), day: await tid(page, 'win-inputsday').count(), still: !!(await rec(page, grp)) }
check('C4', 'Escape closes the settings window in front; the question and the day stay; nothing deleted', c4.settings === 0 && c4.ask > 0 && c4.day > 0 && c4.still, c4)
await shot(page, 'C4', 'desktop', '2-after-escape')
await page.keyboard.press('Escape'); await sleep(300)
check('C4', 'the next Escape is Keep: the question goes, the day stays, nothing deleted', (await tid(page, 'idy-ask').count()) === 0 && (await tid(page, 'win-inputsday').count()) > 0 && !!(await rec(page, grp)), null)
if (await tid(page, 'win-inputsday-x').count()) await L.press(page, false, '[data-testid="win-inputsday-x"]')

/* ---------- C5: Make public twice on a published day ---------- */
const DI = 1
await page.evaluate(i => { window.DAYS[i].prognotes = window.DAYS[i].prognotes || '' }, DI)
const hasWords = await page.evaluate(i => !!String(window.DAYS[i].prognotes || '').trim(), DI)
note('C5', `the programme note of Tue 14 Jul has words: ${hasWords}`)
const p = await pubDay(page, false, DI)
note('C5', `published: ${JSON.stringify(p)}`)
const mark = () => page.evaluate(i => { const e = document.querySelector(`#eWeek [data-txt="pn:${i}"]`); const b = document.querySelector(`#eWeek [data-notepub="pn:${i}"]`); return { alp: e ? e.getAttribute('data-alp') : 'no note box', title: e ? e.getAttribute('title') : null, btnTitle: b ? b.getAttribute('title') : null } }, DI)
const pend = () => page.evaluate(i => window.dayShownPendCount ? window.dayShownPendCount(i) : null, DI)
await editWeek(page); await showDay(page, DI)
const btn = page.locator(`#eWeek [data-notepub="pn:${DI}"]`).first()
await btn.evaluate(e => e.scrollIntoView({ block: 'center' })); await btn.click(); await sleep(500)
const m1 = await mark()
note('C5', `after one press: ${JSON.stringify(m1)}; pending ${await pend()}`)
await page.locator(`#eWeek [data-notepub="pn:${DI}"]`).first().click(); await sleep(500)
const m2 = await mark()
check('C5', 'pressed twice (as it went out): no pending mark, no "goes out" words', !m2.alp && !/goes out/i.test(String(m2.title) + String(m2.btnTitle)), { m2, pending: await pend() })
await showDay(page, DI); await shot(page, 'C5', 'desktop', 'make-public-twice')

await page.context().close()
await L.finish('cr')
