// The drawing check's part list for the schedule's marks and words — the pictures round's group 3 (his "All as
// recommended", 8 Nov 26): D1784 the waiting mark on an Unavailable row (drawing A of question 5, pr-sched.mjs q1),
// D1785 the unreadable week's notice and refusal (drawing A of question 6, pr-sched.mjs q2), D1792 (a) the drawn eye and
// (d) the Reset arrow (round 5, pr-marks.mjs r5a, r5d). All drawn on main at 6e6c55667 (notes-sched.md, notes-marks.md).
// The dotted mark itself (an underline, an outline) is not a measure this check takes: it is judged by eye beside the
// drawing (the check's side-by-side pictures); what IS measured is that the mark moved nothing — the name's place, size,
// tint and letters — and the notice's and refusal's words and box, the eye's and the arrow's place and size.
// Record the drawings (from raptor-port/; the drawing scripts' own pictures go to a scratch folder):
//   HP_URL=http://localhost:4291 HP_SHOTS=<scratch> PR_ONLY=q1,q2 DRAWCHECK_SPEC=scripts/drawcheck/specs/sched-marks.mjs \
//     DRAWCHECK_DIST=<a build of 6e6c55667> DRAWCHECK_ORIGIN=http://localhost:4291 \
//     DRAWCHECK_APPROVED=docs/img/handpass/2026-11-07-pictures-round DRAWCHECK_DRAWN_ON='main at 6e6c55667' \
//     node --import ./scripts/drawcheck/record.mjs scripts/handpass/pr-sched.mjs
//   … the same with PRM_ONLY=r5a,r5d and scripts/handpass/pr-marks.mjs
// Check a build:  node scripts/drawcheck/check.mjs scripts/drawcheck/specs/sched-marks.mjs --dist <build> --out <folder>
// HOW THE BUILD GETS THERE: as the drawings did — the clock at Mon 13 Jul 09:00, Saber signed in; Wed 15 Jul published
// from the board's sign strip; LL for Bolt and Saint's Meeting "Safety brief" filed through the input window (q1); the
// Wednesday's saved row damaged before the app reads it (q2); Mon 13 Jul published and its Original looked at from the
// plans menu (r5a); Mon 13 Jul's first warning hidden on the board (r5d).
import { fileURLToPath } from 'node:url'
import * as L from '../../handpass/sm-lib.mjs'

const sleep = ms => new Promise(r => setTimeout(r, ms))
async function open(page, origin) {
  await page.context().clock.install({ time: new Date('2026-07-13T09:00:00') })
  await page.goto(origin + '/')
  await page.addStyleTag({ content: '*{scroll-behavior:auto!important}' }).catch(() => {})
  await signInHere(page)
}
async function signInHere(page) {
  await page.waitForSelector('#luser')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(600)
}
const W = (page, phone) => ({ page, phone })
const centre = (page, sel) => page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().height > 0); if (e) e.scrollIntoView({ block: 'center', inline: 'center' }) }, sel)
const blur = page => page.evaluate(() => { const a = document.activeElement; if (a && a.blur) a.blur() })
const press = async (page, sel, phone) => { const l = page.locator(sel).filter({ visible: true }).first(); if (phone) await l.tap(); else await l.click() }

/* q1: Wed 15 Jul published, then LL for Bolt and the Meeting for Saint */
async function q1World(page, origin, phone) {
  await open(page, origin)
  const w = W(page, phone)
  const pub = await L.publishDay(w, 2); if (!pub.published) return 'Wed 15 Jul did not publish: ' + pub.why
  await L.closeBoard(w)
  if (!(await L.fileInput(w, { who: 'Bolt', type: 'LL', iso: '2026-07-15' }))) return 'the LL was not filed'
  if (!(await L.fileInput(w, { who: 'Saint', type: 'Meeting', iso: '2026-07-15', remarks: 'Safety brief', oil: 'no' }))) return 'the Meeting was not filed'
}
const reachUnavWeek = async (page, { origin, phone }) => {
  const why = await q1World(page, origin, phone); if (why) return why
  await L.goEdit(W(page, phone))
  await centre(page, '#eWeek section.day[data-day="2"] .sec-unav .pl-row'); await sleep(phone ? 900 : 400)
  await blur(page)
}
const reachUnavBoard = async (page, { origin, phone }) => {
  const why = await q1World(page, origin, phone); if (why) return why
  await L.openBoard(W(page, phone), 2)
  await centre(page, '#schedBoard .sb-panel.unav .sb-arow'); await sleep(400)
  await blur(page)
}
/* q2: Wed 15 Jul published, its saved row damaged, the page read again (the damage set again before the app reads) */
async function q2World(page, origin, phone) {
  await open(page, origin)
  const pub = await L.publishDay(W(page, phone), 2); if (!pub.published) return 'Wed 15 Jul did not publish: ' + pub.why
  await L.closeBoard(W(page, phone))
  const key = await L.weekRowKey(page, 2); if (typeof key !== 'string') return 'no single saved row for Wed 15 Jul'
  await page.context().addInitScript(k => { try { if (!sessionStorage.getItem('smdone')) { localStorage.setItem(k, '{"broken'); sessionStorage.setItem('smdone', '1') } } catch (e) {} }, key)
  await page.reload()
  if (await page.locator('#luser').count()) await signInHere(page)
  await L.goEdit(W(page, phone))
  if (!(await page.locator('#eWeek section.day[data-day="2"] .dprev-bar').count())) return 'the damaged week shows no notice'
}
const reachNotice = async (page, { origin, phone }) => {
  const why = await q2World(page, origin, phone); if (why) return why
  await centre(page, '#eWeek section.day[data-day="2"] .dprev-bar'); await sleep(phone ? 900 : 500)
}
const reachRefusal = async (page, { origin, phone }) => {
  const why = await q2World(page, origin, phone); if (why) return why
  await L.fillNew(W(page, phone), { who: 'Saint', type: 'Meeting', iso: '2026-07-16', remarks: 'Safety brief' })
  await page.locator('#inpEditSave').click(); await sleep(450)
  const t = await L.toastText(page); if (!t || !t.shown) return 'no note after the save'
}
/* r5a: Mon 13 Jul published, its Original looked at — from the week, then from the board */
async function r5aWorld(page, origin, phone) {
  await open(page, origin)
  const pub = await L.publishDay(W(page, phone), 0); if (!pub.published) return 'Mon 13 Jul did not publish: ' + pub.why
  await L.closeBoard(W(page, phone))
  await L.goEdit(W(page, phone))
}
const reachEyeWeek = async (page, { origin, phone }) => {
  const why = await r5aWorld(page, origin, phone); if (why) return why
  await press(page, '#eWeek [data-planmenu="0"]', phone); await sleep(400)
  await press(page, '[data-planpv]', phone); await sleep(800)
  if (!(await page.locator('#eWeek .planselbtn.pv').count())) return 'no look at the Original on the week'
  await blur(page)
}
const reachEyeBoard = async (page, { origin, phone }) => {
  const why = await r5aWorld(page, origin, phone); if (why) return why
  await L.openBoard(W(page, phone), 0)
  await press(page, '#schedBoard [data-planmenu="0"]', phone); await sleep(400)
  await press(page, '[data-planpv]', phone); await sleep(900)
  if (!(await page.locator('#schedBoard .planselbtn.pv').count())) return 'no look at the Original on the board'
  await blur(page)
}
/* r5d: Mon 13 Jul's first warning hidden on the board; then the week's list opened */
async function r5dWorld(page, origin, phone) {
  await open(page, origin)
  await L.openBoard(W(page, phone), 0)
  // on a phone the board's warning list is folded: its head opens it, as the drawing script did
  if (!(await page.locator('#sbWarn .wln-mute').filter({ visible: true }).count())) {
    if (await page.locator('#sbWarn .sbw-car').count()) { await press(page, '#sbWarn .sbw-car', phone); await sleep(500) }
  }
  if (!(await page.locator('#sbWarn .wln-mute').filter({ visible: true }).count())) return 'no ✕ on the board’s warning lines'
  await press(page, '#sbWarn .wln-mute', phone); await sleep(700)
  if (!(await page.locator('#sbWarn .wln.hid').count())) return 'the line did not hide'
}
const reachResetBoard = async (page, { origin, phone }) => {
  const why = await r5dWorld(page, origin, phone); if (why) return why
  await blur(page)
}
const reachResetWeek = async (page, { origin, phone }) => {
  const why = await r5dWorld(page, origin, phone); if (why) return why
  await L.closeBoard(W(page, phone))
  await L.goEdit(W(page, phone))
  await press(page, '#eWeek [data-daywarn="0"]', phone); await sleep(600)
  if (!(await page.locator('#eWeek .witem.hid .witem-mute').count())) return 'no hidden line on the week'
  await blur(page)
}

const P = (name, label, draw, build, check, more = {}) => ({ name, label, draw, build: build ?? draw, check, ...more })
const D2 = '#eWeek section.day[data-day="2"]'
const unavWeekParts = [
  P('sec', 'the Unavailable list', '[data-zz="unav"]', `${D2} .sec-unav`, ['size']),
  P('row', "Bolt's LL row", '[data-zz="urow"]', { sel: `${D2} .sec-unav .pl-row`, nth: 0 }, ['place', 'size'], { rel: 'sec' }),
  P('name', 'its name "LL" (the waiting mark under it)', '[data-zz="uname"]', { sel: `${D2} .sec-unav .pl-row .nm .ntx`, nth: 0 }, ['place', 'size', 'words-place', 'colour', 'letters', 'text'], { rel: 'row' }),
]
const unavBoardParts = [
  P('panel', 'the board’s Unavailable panel', '[data-zz="bunav"]', '#schedBoard .sb-panel.unav', ['size']),
  P('row', "Bolt's LL row", '[data-zz="burow"]', { sel: '#schedBoard .sb-panel.unav .sb-arow', nth: 0 }, ['place', 'size'], { rel: 'panel' }),
  P('name', 'its name box (dotted outline, its purple tint kept)', '[data-zz="buname"]', { sel: '#schedBoard .sb-panel.unav .sb-arow .sbi-ty', nth: 0 }, ['place', 'size', 'fill', 'words-place', 'colour', 'text'], { rel: 'row' }),
]
const noticeParts = [
  P('day', 'Wednesday', D2, D2, []), // the phone drawing never named the day; its own selector finds it in both
  P('note', 'the notice', '[data-zz="note"]', `${D2} .dprev-bar`, ['place', 'size', 'fill', 'edge', 'words-place', 'colour', 'text'], { rel: 'day' }),
]
const refusalParts = [
  P('note', 'the grey "Blocked:" note', '#toastEl', null, ['place', 'size', 'fill', 'edge', 'corners', 'words-place', 'colour', 'text']),
]
const eyeParts = surf => [
  P('sel', 'the plans selector', `${surf} .planselbtn.pv`, null, ['size', 'words-place', 'text']),
  P('seleye', "the selector's eye", `${surf} .planselbtn.pv .psl svg`, `${surf} .planselbtn.pv .psl svg.pveye`, ['place', 'size'], { rel: 'sel' }),
  P('bar', 'the "Viewing the issued" banner', `${surf} .dprev-bar`, null, ['size', 'words-place', 'text']),
  P('bareye', "the banner's eye", `${surf} .dprev-bar svg`, `${surf} .dprev-bar svg.pveye`, ['place', 'size'], { rel: 'bar' }),
]
const selOnly = surf => eyeParts(surf).slice(0, 2)
const barOnly = surf => eyeParts(surf).slice(2)
const resetParts = (line, btn) => [
  P('line', 'the hidden warning line', line, null, ['size']),
  P('btn', 'its flag-again button', `${line} ${btn}`, null, ['place', 'size', 'colour'], { rel: 'line' }),
  P('arrow', 'the Reset arrow', `${line} ${btn} svg`, `${line} ${btn} svg.wmuteico`, ['place', 'size'], { rel: 'btn' }),
]
const SCHED = 'scripts/handpass/pr-sched.mjs', MARKS = 'scripts/handpass/pr-marks.mjs'
const st = (id, title, phone, script, shot, reach, parts) => ({ id, title, phone, drawing: { script, shot }, reach, parts })

export default {
  name: 'The schedule’s marks and words — the waiting mark on Unavailable, the unreadable week, the drawn eye and Reset arrow',
  slug: 'sched-marks',
  origin: 'http://localhost:4291',
  records: fileURLToPath(new URL('../../../docs/img/handpass/2026-11-08-sched-marks/drawcheck-records/', import.meta.url)),
  states: [
    st('unav-week-desk', 'The waiting mark on Edit Schedule’s Unavailable list, desktop (D1784)', false, SCHED, 'q-unavmark-pc-unav-A', reachUnavWeek, unavWeekParts),
    st('unav-week-phone', 'The waiting mark on Edit Schedule’s Unavailable list, phone (D1784)', true, SCHED, 'q-unavmark-ph-unav-A', reachUnavWeek, unavWeekParts),
    st('unav-board-desk', 'The waiting mark on the board’s Unavailable panel, desktop (D1784)', false, SCHED, 'q-unavmark-pc-board-unav-A', reachUnavBoard, unavBoardParts),
    st('notice-desk', 'The unreadable week’s notice, desktop (D1785)', false, SCHED, 'q-readonly-pc-notice-A', reachNotice, noticeParts),
    st('notice-phone', 'The unreadable week’s notice, phone (D1785)', true, SCHED, 'q-readonly-ph-notice-A', reachNotice, noticeParts),
    st('refusal-desk', 'The refusal in the grey "Blocked:" note, desktop (D1785)', false, SCHED, 'q-readonly-pc-refusal-A', reachRefusal, refusalParts),
    st('eye-week-desk', 'The drawn eye on the week’s look, desktop (D1792 a)', false, MARKS, 'q-r5a-pc-week-drawn', reachEyeWeek, eyeParts('#eWeek')),
    st('eye-week-phone', 'The drawn eye on the week’s look, phone (D1792 a)', true, MARKS, 'q-r5a-ph-week-drawn', reachEyeWeek, eyeParts('#eWeek')),
    st('eye-board-sel-desk', 'The drawn eye in the board’s selector, desktop (D1792 a)', false, MARKS, 'q-r5a-pc-board-sel-drawn', reachEyeBoard, selOnly('#schedBoard')),
    st('eye-board-bar-desk', 'The drawn eye in the board’s banner, desktop (D1792 a)', false, MARKS, 'q-r5a-pc-board-bar-drawn', reachEyeBoard, barOnly('#schedBoard')),
    st('eye-board-phone', 'The drawn eye on the board’s look, phone (D1792 a)', true, MARKS, 'q-r5a-ph-board-drawn', reachEyeBoard, eyeParts('#schedBoard')),
    st('reset-board-desk', 'The Reset arrow on the board’s hidden warning, desktop (D1792 d)', false, MARKS, 'q-r5d-pc-board-drawn', reachResetBoard, resetParts('#sbWarn .wln.hid', '.wln-mute')),
    st('reset-board-phone', 'The Reset arrow on the board’s hidden warning, phone (D1792 d)', true, MARKS, 'q-r5d-ph-board-drawn', reachResetBoard, resetParts('#sbWarn .wln.hid', '.wln-mute')),
    st('reset-week-desk', 'The Reset arrow on the week’s hidden warning, desktop (D1792 d)', false, MARKS, 'q-r5d-pc-week-drawn', reachResetWeek, resetParts('#eWeek .witem.hid', '.witem-mute')),
    st('reset-week-phone', 'The Reset arrow on the week’s hidden warning, phone (D1792 d)', true, MARKS, 'q-r5d-ph-week-drawn', reachResetWeek, resetParts('#eWeek .witem.hid', '.witem-mute')),
  ],
  accepted: [],
}
