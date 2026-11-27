// oillater-walk — chat 210's walk of [OIL-LATER-PASSES-ON] (his D2800, D2801, D2859, D2867, D2868, D2869), on the
// served build of claude/oil-later-209. Every sign-off is a real press of a box (board, Edit Schedule's week, the
// phone board); every answer a real press at its door (the list, the input window, the Inputs page's row, a member's
// own window). The fixture's unanswered Trainings are filed through the app's own filing command, as walker w3's
// were (frf-w3.mjs: no real door leaves a plain weekend's input unanswered).
// Run from raptor-port/:  TS_URL=http://localhost:4321/ HP_SHOTS=<folder> ONLY=A,B node scripts/handpass/oillater-walk.mjs
import path from 'node:path'
import { writeFileSync } from 'node:fs'
import * as L from './frf-w3-lib.mjs'
console.log('oillater-walk v1', new Date().toISOString())
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const R = []
const res = (sc, sz, step, pass, note) => { R.push({ sc, size: sz.name, step, pass, note }); console.log(`${pass === true ? 'PASS' : pass === false ? 'FAIL' : 'NOTE'} ${sc} ${sz.name} ${step} — ${note}`) }
const LIST = '[data-testid="win-oilday"]', WIN = '[data-testid="win-inputedit"]'
const TRAIN = { type: 'Training', allday: false, s: 480, e: 1020, date: 'Jul 18', yr: 2026, remarks: '', acc: 'g' }
const ROLES = ['cur', 'sked', 'plan', 'appr']
const shot = async (p, sz, name) => { const f = path.join(L.SHOTS, `${name}-${sz.name}.png`); await p.screenshot({ path: f }); return f }

async function plant(p, who, iid, extra = {}) {
  await p.evaluate(([who, iid, T, extra]) => { const w = window; w.fileInput({ ...T, people: [{ p: who }], iid, ...extra }); w.afterSchedMutate() }, [who, iid, TRAIN, extra])
}
const csId = (p, cs) => p.evaluate(cs => Object.keys(window.PEOPLE).find(id => window.PEOPLE[id].cs === cs), cs)
/* a world: signed in as the admin, the Saturday emptied of flying (so no missing time refuses a name), n Trainings */
async function world(sz, n = 1, opts = {}) {
  const o = await L.open(sz); await L.login(o.p, 'ad')
  await o.p.evaluate(() => { const w = window, d = w.DAYS[5]; d.waves = []; d.sims = {}; d.dutywaves = []; d.ground = []; d.notes = []; d.allhands = []; w.afterSchedMutate() })
  const ranger = await csId(o.p, 'Ranger')
  const who = [opts.first || 'bane', 'stiff']
  if (opts.publishFirst) await signAllPlain(o.p, sz, true)
  for (let i = 0; i < n; i++) await plant(o.p, who[i], `ol-t${i + 1}`, opts.answer ? { oil: { '2026-07-18': opts.answer } } : {})
  return { ...o, ranger }
}
/* what each of the four boxes SHOWS on the board (the .v text), and whether "Publish" is free */
const boxes = p => p.evaluate(roles => {
  const out = {}
  for (const r of roles) {
    const s = [...document.querySelectorAll(`#schedBoard select[data-sign="${r}"][data-signday="5"]`)].find(x => x.closest('label') && x.closest('label').getBoundingClientRect().width > 0)
    out[r] = s ? (s.closest('label').querySelector('.v') || {}).textContent || '' : '(no box)'
  }
  const pub = document.querySelector('#schedBoard [data-alpub="5"], #schedBoard [data-beak="5"]')
  out.pub = pub ? `${pub.textContent.trim()}${pub.classList.contains('locked') ? ' [locked]' : ''}` : '(none)'
  out.pending = window.dayHasChanges ? window.dayHasChanges(5) : 'n/a'
  return out
}, ROLES)
const foot = p => p.evaluate(() => { const f = document.querySelector('[data-testid="odl-left"]'); return f ? f.textContent : null })
const listUp = L.listUp
async function later(p, sz) { await L.press(p, sz, '[data-testid="odl-later"]'); await p.waitForTimeout(350) }
async function pickOn(p, sz, where, role, nth) { await L.pickSign(p, where, role, nth); await p.waitForTimeout(250) }
/* sign the four with no question open (each signs at once); publish when asked */
async function signAllPlain(p, sz, pub) {
  await L.openBoard(p)
  for (const [i, r] of ROLES.entries()) await pickOn(p, sz, 'board', r, i)
  if (pub) { await L.press(p, sz, '#schedBoard [data-beak="5"]'); await p.waitForTimeout(500) }
}
/* the input window's OIL door: Answer… or Change…, then Yes / No, Save */
async function answerAtWindow(p, sz, iid, how) {
  await L.openInpDay(p, sz, L.SAT)
  await L.press(p, sz, `[data-testid="win-inputsday"] [data-testid="idy-row-${iid}"] [data-testid="idy-open"]`)
  await p.locator(WIN).waitFor()
  const btn = (await p.locator(`${WIN} [data-testid="oil-answer"]`).count()) ? 'oil-answer' : (await p.locator(`${WIN} [data-testid="oil-revise-own"]`).count()) ? 'oil-revise-own' : 'oil-revise'
  await L.press(p, sz, `${WIN} [data-testid="${btn}"]`)
  await p.locator('[data-testid="oilconf"]').waitFor()
  await L.press(p, sz, `[data-testid="oilconf"] [data-testid="oil-${how}"]`)
  await L.press(p, sz, '[data-testid="oilconf-save"]'); await p.waitForTimeout(400)
  const t = await L.toastText(p)
  if (await p.locator('#inpEditCancel:visible').count()) await L.press(p, sz, '#inpEditCancel')
  await L.closeInpDay(p); await p.waitForTimeout(200)
  return { door: btn, toast: t && t.text }
}
/* the Inputs page's list row: its "OIL?" button */
async function answerAtRow(p, sz, iid, how) {
  await L.go(p, 'inputs')
  await L.press(p, sz, '#inListBtn'); await p.waitForTimeout(400)
  const row = p.locator(`tr:has([data-oilask])`).filter({ hasText: 'Training' })
  const n = await row.count()
  await L.press(p, sz, '[data-oilask]')
  await p.locator('[data-testid="oilconf"]').waitFor()
  await L.press(p, sz, `[data-testid="oilconf"] [data-testid="oil-${how}"]`)
  await L.press(p, sz, '[data-testid="oilconf-save"]'); await p.waitForTimeout(400)
  return { rows: n, toast: (await L.toastText(p) || {}).text }
}
const answerOf = (p, iid) => p.evaluate(iid => JSON.stringify((window.INPUTS.find(r => r.iid === iid) || {}).oil || null), iid)
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b)
const named = b => ROLES.filter(r => b[r] && b[r] !== '(no box)' && !/^—|^\s*$/.test(b[r]))

const S = {}
/* A — his own case on the board, two questions: the three Later lines, the last box's two lines, Save, four stand */
S.A = async sz => {
  const { b, p } = await world(sz, 2)
  await L.openBoard(p)
  for (const [i, r] of ROLES.slice(0, 3).entries()) {
    await pickOn(p, sz, 'board', r, i)
    const up = await listUp(p), f = await foot(p)
    if (i === 0) await shot(p, sz, 'A1-first-box-later-line')
    res('A', sz, `${r} asks`, up && /^Later: .+ signs, and the next sign-off asks again$/.test(f || ''), `list ${up}, foot "${f}"`)
    await later(p, sz)
  }
  await pickOn(p, sz, 'board', 'appr', 3)
  const f0 = await foot(p); await shot(p, sz, 'A2-last-box-none-picked')
  res('A', sz, 'last box, none picked', /^Later: .+ signs, and OIL stays unanswered for now$/.test(f0 || ''), `"${f0}"`)
  await L.press(p, sz, `${LIST} [data-testid="odl-yes-ol-t1"]`); await p.waitForTimeout(200)
  const f1 = await foot(p); await shot(p, sz, 'A3-last-box-one-picked')
  res('A', sz, 'last box, one of two picked (D2867)', f1 === 'Save: the rest stays unanswered for now', `"${f1}"`)
  await L.press(p, sz, `${LIST} [data-testid="odl-no-ol-t2"]`); await p.waitForTimeout(200)
  const f2 = await foot(p)
  res('A', sz, 'every row picked: no line', f2 === '', `"${f2}"`)
  await L.press(p, sz, `${LIST} [data-testid="odl-save"]`); await p.waitForTimeout(500)
  const bx = await boxes(p); await shot(p, sz, 'A4-four-signed')
  res('A', sz, 'Save: all four stand', named(bx).length === 4 && !/locked/.test(bx.pub), JSON.stringify(bx))
  res('A', sz, 'the answers written', true, `${await answerOf(p, 'ol-t1')} ${await answerOf(p, 'ol-t2')}`)
  return { b, p }
}
/* B — from A: the answer APPROVED BY signed over, changed at the input window → its name falls, the Later three stand;
   Undo → it returns (D2869, AM11; the host's reading (b)) */
S.B = async sz => {
  const { b, p } = await S.A(sz)
  const d = await answerAtWindow(p, sz, 'ol-t1', 'no')
  await L.openBoard(p)
  const bx = await boxes(p); await shot(p, sz, 'B1-changed-answer')
  res('B', sz, 'changed at the window: APPROVED BY falls, three stand', eq(named(bx), ['cur', 'sked', 'plan']), `${JSON.stringify(d)} ${JSON.stringify(bx)}`)
  await L.press(p, sz, '#undoBtn'); await p.waitForTimeout(500)
  const bx2 = await boxes(p); await shot(p, sz, 'B2-undo')
  res('B', sz, 'Undo: the answer and the name back', named(bx2).length === 4, `${await answerOf(p, 'ol-t1')} ${JSON.stringify(bx2)}`)
  await L.done(b)
}
/* C — one question: two Later names; answered at the input window → both stand; the third box signs at once; a reload
   keeps all three */
S.C = async sz => {
  const { b, p } = await world(sz, 1)
  await L.openBoard(p)
  await pickOn(p, sz, 'board', 'cur', 0); await later(p, sz)
  await pickOn(p, sz, 'board', 'sked', 1); await later(p, sz)
  const d = await answerAtWindow(p, sz, 'ol-t1', 'yes')
  await L.openBoard(p)
  const bx = await boxes(p); await shot(p, sz, 'C1-answer-at-window')
  res('C', sz, 'an answer at the window leaves both names (D2801)', eq(named(bx), ['cur', 'sked']), `${JSON.stringify(d)} ${JSON.stringify(bx)}`)
  await pickOn(p, sz, 'board', 'plan', 2)
  res('C', sz, 'nothing open: the next box signs at once', !(await listUp(p)) && named(await boxes(p)).length === 3, JSON.stringify(await boxes(p)))
  await p.reload(); await p.waitForSelector('#luser').catch(() => {})
  if (await p.locator('#luser').count()) { await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]') }
  await p.waitForSelector('#vWeek .day', { state: 'attached' }); await p.waitForTimeout(600)
  await L.openBoard(p)
  const bx2 = await boxes(p); await shot(p, sz, 'C2-after-reload')
  res('C', sz, 'after a reload the three stand', named(bx2).length === 3, JSON.stringify(bx2))
  await L.done(b)
}
/* D — Edit Schedule's week boxes: Later on CUR CK there, and SKED CK there asks again */
S.D = async sz => {
  const { b, p } = await world(sz, 1)
  await L.go(p, 'editsched'); await p.waitForTimeout(400)
  await pickOn(p, sz, 'week', 'cur', 0)
  const up1 = await listUp(p); await shot(p, sz, 'D1-week-cur-asks')
  res('D', sz, 'week CUR CK asks', up1, `foot "${await foot(p)}"`)
  await later(p, sz)
  await pickOn(p, sz, 'week', 'sked', 1)
  const up2 = await listUp(p); await shot(p, sz, 'D2-week-sked-asks-again')
  res('D', sz, 'week SKED CK asks again (D2800)', up2, `foot "${await foot(p)}"`)
  await L.done(b)
}
/* E — a published day (D2868): published with nothing open; a Training filed on it; three Later; APPROVED BY answers and
   Saves → four stand, the change waits, Publish AL is free; publish it */
S.E = async sz => {
  const { b, p } = await world(sz, 0)
  await signAllPlain(p, sz, true)
  res('E', sz, 'setup: published', await p.evaluate(() => window.dayApproved(5)), '')
  await plant(p, 'bane', 'ol-t1'); await L.openBoard(p)
  const bx0 = await boxes(p)
  res('E', sz, 'a Training filed on the published day waits; the four fall (D103)', bx0.pending === true && named(bx0).length === 0, JSON.stringify(bx0))
  for (const [i, r] of ROLES.slice(0, 3).entries()) { await pickOn(p, sz, 'board', r, i); res('E', sz, `${r} asks`, await listUp(p), `"${await foot(p)}"`); await later(p, sz) }
  await pickOn(p, sz, 'board', 'appr', 3)
  await L.press(p, sz, `${LIST} [data-testid="odl-yes-ol-t1"]`); await L.press(p, sz, `${LIST} [data-testid="odl-save"]`); await p.waitForTimeout(500)
  const bx = await boxes(p); await shot(p, sz, 'E1-published-four-stand')
  res('E', sz, 'four stand over the answer; the change still waits; Publish AL free', named(bx).length === 4 && bx.pending === true && !/locked/.test(bx.pub) && /AL/.test(bx.pub), JSON.stringify(bx))
  await L.press(p, sz, '#schedBoard [data-alpub="5"]'); await p.waitForTimeout(600)
  const t = await L.toastText(p), bx2 = await boxes(p); await shot(p, sz, 'E2-amendment-out')
  res('E', sz, 'the amendment goes out', bx2.pending === false, `${t && t.text} ${JSON.stringify(bx2)}`)
  await L.done(b)
}
/* F — the Inputs page's row door: two Later names, answered at the row → both stand */
S.F = async sz => {
  const { b, p } = await world(sz, 1)
  await L.openBoard(p)
  await pickOn(p, sz, 'board', 'cur', 0); await later(p, sz)
  await pickOn(p, sz, 'board', 'sked', 1); await later(p, sz)
  const d = await answerAtRow(p, sz, 'ol-t1', 'yes'); await shot(p, sz, 'F1-inputs-row-answered')
  await L.openBoard(p)
  const bx = await boxes(p); await shot(p, sz, 'F2-board-after')
  res('F', sz, 'the Inputs page row answer leaves both names (D2801)', eq(named(bx), ['cur', 'sked']) && (await answerOf(p, 'ol-t1')) !== 'null', `${JSON.stringify(d)} ${JSON.stringify(bx)}`)
  await L.done(b)
}
/* G — a member's own answer changed after the four signed over it (D2869): Ranger's Training answered No before signing */
S.G = async sz => {
  const o = await L.open(sz); await L.login(o.p, 'ad'); const p = o.p
  await p.evaluate(() => { const w = window, d = w.DAYS[5]; d.waves = []; d.sims = {}; d.dutywaves = []; d.ground = []; d.notes = []; d.allhands = []; w.afterSchedMutate() })
  const ranger = await csId(p, 'Ranger')
  await plant(p, ranger, 'ol-r', { oil: { '2026-07-18': 0 } })
  await signAllPlain(p, sz, false)
  const bx0 = await boxes(p)
  res('G', sz, 'setup: four signed over No, no list', named(bx0).length === 4, JSON.stringify(bx0))
  await L.signout(p); await L.login(p, 'us')
  let d
  try { d = await answerAtWindow(p, sz, 'ol-r', 'yes') } catch (e) { d = { err: String(e.message).slice(0, 160) } }
  await shot(p, sz, 'G1-member-changed-own')
  await L.signout(p); await L.login(p, 'ad'); await L.openBoard(p)
  const bx = await boxes(p); await shot(p, sz, 'G2-board-after-member')
  res('G', sz, 'his own No → Yes clears the four (D2869)', named(bx).length === 0, `${JSON.stringify(d)} ${await answerOf(p, 'ol-r')} ${JSON.stringify(bx)}`)
  await L.done(o.b)
}
/* H — the phone board: two Later presses by tap, a picture right after each tap; answered at the window; both stand */
S.H = async sz => {
  const { b, p } = await world(sz, 1)
  await L.openBoard(p)
  await pickOn(p, sz, 'board', 'cur', 0); await shot(p, sz, 'H1-phone-cur-asks')
  res('H', sz, 'phone CUR CK asks', await listUp(p), `"${await foot(p)}"`)
  await L.tapShot(p, sz, '[data-testid="odl-later"]', 'H2-phone-later')
  await pickOn(p, sz, 'board', 'sked', 1); await shot(p, sz, 'H3-phone-sked-asks')
  res('H', sz, 'phone SKED CK asks again', await listUp(p), `"${await foot(p)}"`)
  await later(p, sz)
  const d = await answerAtWindow(p, sz, 'ol-t1', 'yes')
  await L.openBoard(p)
  const bx = await boxes(p); await shot(p, sz, 'H4-phone-board-after')
  res('H', sz, 'phone: answer at the window leaves both', eq(named(bx), ['cur', 'sked']), `${JSON.stringify(d)} ${JSON.stringify(bx)}`)
  await L.done(b)
}

const PLAN = { desktop: ['B', 'C', 'D', 'E', 'F', 'G'], phone: ['A', 'H'] }
for (const key of Object.keys(PLAN)) {
  const sz = L.SIZES[key]
  for (const sc of PLAN[key]) {
    if (ONLY.length && !ONLY.includes(sc)) continue
    try { const r = await S[sc](sz); if (r && r.b) await L.done(r.b) } catch (e) { res(sc, sz, 'ran', false, String(e && e.message).slice(0, 300)) }
  }
}
console.log('errors:', L.errs.length ? L.errs.join('\n') : 'none')
writeFileSync(path.join(L.SHOTS, 'results.json'), JSON.stringify({ R, errs: L.errs }, null, 1))
console.log(`DONE ${R.filter(x => x.pass === true).length} pass, ${R.filter(x => x.pass === false).length} fail`)
