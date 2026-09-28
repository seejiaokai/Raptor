/* Walker A1 — where the one Undo takes you, and what outlives a reload (28 Sep 26): Fable S24 (a reload after Undo),
   S25 (two doors, one gesture — the board's and the top bar's pair; the top bar covered while the board is open),
   S32 (an off-week change undone from another week: the view jumps there), Astra 22 (week A / week B — the undo order
   follows the time order, whichever week is loaded, from both doors), S14 (Redo after a new change; the LIFO pick;
   never the "redo that first" stall). Weeks are changed through the app's own calendar ("Jump to a date").
   HP_W=390 for the phone. */
import { openA1, book, door, doorState, boardOn, boardOff, dayHead, changesLines, changesClose, put, boardText, txt,
  toasts, spy, login, PHONE } from './cr-a1-lib.mjs'

const { browser, page, errors } = await openA1('a')
const bk = book('nav')
const SAT = 5, FRI = 4
const wk = () => page.evaluate(() => window.CURWEEK)

/** Change week through the app's own calendar — "Jump to a date" — landing on that exact day. */
async function toDate(iso) {
  await boardOff(page)
  if ((await page.evaluate(() => window.CURPAGE)) !== 'editsched') { await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(500) }
  await page.evaluate(() => window.scrollTo(0, 0))
  const cal = page.locator(PHONE ? '.filt-cal:visible, .wknav-mbtn:visible' : '.wk-cal:visible, button[aria-label="Jump to a date"]:visible').first()
  if (PHONE) await cal.tap().catch(() => cal.click()); else await cal.click()
  await page.waitForTimeout(500)
  const d = page.locator(`[data-wcal="${iso}"]:visible`).first()
  if (!(await d.count())) return 'NO DAY ' + iso
  if (PHONE) await d.tap().catch(() => d.click()); else await d.click()
  await page.waitForTimeout(1200)
  return 'ok'
}
/** Which day of the loaded week the edit week shows at its front (a phone shows one day). */
const dayInView = () => page.evaluate(() => {
  const days = [...document.querySelectorAll('#eWeek .day[data-day]')]
  const hit = days.map(d => ({ i: +d.dataset.day, l: d.getBoundingClientRect().left })).filter(x => x.l >= -40 && x.l < innerWidth / 2).sort((a, b) => a.l - b.l)
  return hit.length ? hit[0].i : null
})
const moreOf = (di) => page.evaluate(i => (window.DAYS[i].dutywaves[0].rows[0].more || []).slice(), di)
const pal = (exclude) => page.evaluate(x => [...document.querySelectorAll('#sbRoster .rpuck[data-person]')].map(e => e.dataset.person).filter(v => v && v !== 'allavail' && v !== 'all' && !x.includes(v)), exclude)

/* ---------- S24 — a reload after Undo ---------- */
await boardOn(page, SAT)
const sdo = await page.evaluate(() => window.DAYS[5].dutywaves[0].rows[0].id)
const who = await put(page, `[data-fill="d:${SAT}.0.0.+"]`, (await pal([sdo])).slice(0, 6))
const m1 = await moreOf(SAT)
const u1 = await door(page, 'board', 'undo')
const m2 = await moreOf(SAT)
bk.ck('S24.1', 'a man put on Saturday\'s SDO desk, then board Undo → he is off again', m1.length === 1 && m2.length === 0 && /^Undid:/.test(u1.toasts.join(' ')), { who, m1, m2, u1: u1.toasts })
await boardOff(page)
await page.reload(); await login(page, 'a'); await spy(page)
await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(700)
const m3 = await moreOf(SAT)
const ts = await doorState(page, 'top')
const cw = await changesLines(page, 'Sat')
await page.evaluate(() => window.scrollTo(0, 0))
const p1 = await bk.shot(page, 'reload-after-undo')
const und = (cw.lines || []).filter(l => /Undo — /.test(l))
bk.ck('S24.2', 'after a reload: still undone; Undo and Redo both greyed (history is per sign-in); the changes window keeps the "Undo — …" line', m3.length === 0 && /^off/.test(ts.undo) && /^off/.test(ts.redo) && und.length >= 1, { m3, ts, undoLines: und, lines: (cw.lines || []).slice(0, 6) }, p1)
await changesClose(page)

/* ---------- S25 — two doors, one gesture ---------- */
await boardOn(page, SAT)
const t0 = await page.evaluate(() => window.DAYS[5].dutywaves[0].rows[0].str)
await boardText(page, `dr:${SAT}.0.0.str`, '0700')
const t1 = await page.evaluate(() => window.DAYS[5].dutywaves[0].rows[0].str)
/* while the board is open, is the top bar's pair reachable at all? (D347 (3): the board covers it) */
const covered = await page.evaluate(() => {
  const b = document.querySelector('#undoBtn'); if (!b) return 'no top-bar Undo in the page'
  const r = b.getBoundingClientRect(); if (!r.width) return 'top-bar Undo has no size'
  const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
  return e && (e === b || b.contains(e)) ? 'REACHABLE' : 'covered by ' + (e ? (e.id || e.className || e.tagName).toString().slice(0, 40) : 'nothing')
})
const p2 = await bk.shot(page, 'board-time-changed')
bk.ck('S25.1', 'on the board, SDO start 08:00 → 07:00; the top bar\'s pair is covered while the board is open', t0 !== t1 && /07/.test(String(t1)) && /covered/.test(covered), { t0, t1, covered }, p2)
await boardOff(page)
const tu = await door(page, 'top', 'undo')
const wkTime = await page.evaluate(() => { const d = document.querySelector('#eWeek .day[data-day="5"]'); return d ? (d.innerText.match(/SDO\s+(\S+)\s+(\S+)/) || [])[0] : null })
await page.evaluate(() => { window.scrollTo(0, 0) })
const p3 = await bk.shot(page, 'week-top-undo')
bk.ck('S25.2', 'board closed, top-bar Undo → the week shows 08:00 again', /^Undid:/.test(tu.toasts.join(' ')) && /08:00/.test(wkTime || ''), { tu: tu.toasts, wkTime }, p3)
await boardOn(page, SAT)
const br = await door(page, 'board', 'redo')
const t2 = await page.evaluate(() => window.DAYS[5].dutywaves[0].rows[0].str)
const boardVal = await page.evaluate(() => { const e = [...document.querySelectorAll('#schedBoard [data-bfld="dr:5.0.0.str"]')].find(x => x.offsetParent); return e ? e.value : null })
const p4 = await bk.shot(page, 'board-redo')
bk.ck('S25.3', 'board reopened, board Redo → 07:00 on the board', /^Redid:/.test(br.toasts.join(' ')) && /07:00/.test(boardVal || '') && t2 === t1, { br: br.toasts, t2, boardVal }, p4)

/* ---------- S14 — Redo after a new change; the LIFO pick ---------- */
const signCur = async (di) => {
  await boardOn(page, di)
  const s = page.locator(`#schedBoard select[data-sign="cur"][data-signday="${di}"]:visible`).first()
  const opts = await s.locator('option').evaluateAll(os => os.map(o => o.value).filter(Boolean))
  await s.selectOption(opts[0]); await page.waitForTimeout(500)
  return page.evaluate(i => { const s = document.querySelector(`#schedBoard select[data-sign="cur"][data-signday="${i}"]`); return s ? s.options[s.selectedIndex].text : null }, di)
}
const curOf = (di) => page.evaluate(i => { const s = [...document.querySelectorAll(`select[data-sign="cur"][data-signday="${i}"]`)][0]; return s ? s.options[s.selectedIndex].text : null }, di)
/* (a) sign Fri, Undo, sign Sat, Undo, Redo, Redo */
const aF = await signCur(FRI)
const ua = await door(page, 'board', 'undo')
const aS = await signCur(SAT)
const ub = await door(page, 'board', 'undo')
const ra = await door(page, 'board', 'redo')
const satBack = await curOf(SAT)
const rb = await door(page, 'board', 'redo')
const rs = await doorState(page, 'board')
await boardOn(page, FRI)
const friNow = await curOf(FRI)
const p5 = await bk.shot(page, 's14a-after-two-redos')
const stall = [ua, ub, ra, rb].some(x => (x.toasts || []).some(t => /redo that first/.test(t)))
bk.ck('S14a', 'sign Fri, Undo, sign Sat, Undo, Redo → Sat\'s signature back; the next Redo never stalls on "redo that first"', /^Redid: a sign-off/.test(ra.toasts.join(' ')) && satBack && !/name/.test(satBack) && !stall, { aF, aS, ua: ua.toasts, ub: ub.toasts, ra: ra.toasts, satBack, rb: { pressed: rb.pressed, disabled: rb.disabled, title: rb.title, toasts: rb.toasts }, rs, friNow }, p5)
bk.note('S14a-lifo', { what: 'after Sat\'s redo, is Friday\'s undone sign-off still redoable?', redoState: rs, friday: friNow, reading: rb.pressed ? 'Friday came back (the two sign-offs are separate)' : 'Friday\'s undone sign-off was dropped when Saturday was signed — the classic "a new change drops the redo tail" (they share the week\'s sign-off record)' })
/* (b) sign Fri, Undo, a note on Fri → Redo greyed */
await boardOn(page, FRI)
const clr = page.locator(`#schedBoard select[data-sign="cur"][data-signday="${FRI}"]:visible`).first()
await clr.selectOption(''); await page.waitForTimeout(400)
await signCur(FRI)
await door(page, 'board', 'undo')
await boardText(page, `dn:${FRI}.0`, 'S14B NOTE')
const rsb = await doorState(page, 'board')
const rpress = await door(page, 'board', 'redo')
const p6 = await bk.shot(page, 's14b-redo-after-note')
bk.ck('S14b', 'sign Fri, Undo, then a note on Fri → Redo greyed (the undone sign dropped), no stall message', /^off/.test(rsb.redo) && !(rpress.toasts || []).some(t => /redo that first/.test(t)), { rsb, rpress }, p6)

/* ---------- S32 — an off-week change undone from another week: the view jumps there ---------- */
const wA = await wk()
const n1 = await toDate('2026-07-21')
const wB = await wk()
await boardOn(page, 1)
const tueB0 = await txt(page, 'dn:1.0')
await boardText(page, 'dn:1.0', 'WEEK B NOTE (S32)')
await boardOff(page)
const n2 = await toDate('2026-07-14')
const w3 = await wk()
const su = await door(page, 'top', 'undo')
const w4 = await wk()
const tueB1 = await txt(page, 'dn:1.0')
await page.waitForTimeout(600)
const inView = await dayInView()
await page.evaluate(() => window.scrollTo(0, 0))
const p7 = await bk.shot(page, 's32-undo-jumps-to-week-b')
bk.ck('S32.1', 'from week A, top-bar Undo of a week-B note → the view jumps to week B and the note reverts; the bubble shows', w3 === wA && w4 === wB && tueB1 === tueB0 && /^Undid:/.test(su.toasts.join(' ')), { n1, n2, wA, wB, w3, w4, tueB0, tueB1, su: su.toasts }, p7)
bk.note('S32.1b', { what: 'which day the week lands on after the jump (Fable: "the glide lands on Tuesday? Record.")', dayInView: inView, changedDay: 1 })
const sr = await door(page, 'top', 'redo')
const w5 = await wk(), tueB2 = await txt(page, 'dn:1.0')
bk.ck('S32.2', 'Redo stays on week B and re-applies the note', w5 === wB && tueB2 === 'WEEK B NOTE (S32)' && /^Redid:/.test(sr.toasts.join(' ')), { w5, tueB2, sr: sr.toasts })

/* ---------- Astra 22 — week A then week B; undo twice, redo twice, from each door ---------- */
for (const where of ['top', 'board']) {
  await toDate('2026-07-13')
  await boardOn(page, 0)
  const a0 = await txt(page, 'dn:0.0')
  await boardText(page, 'dn:0.0', 'A22 WEEK A ' + where)
  await toDate('2026-07-21')
  await boardOn(page, 1)
  const b0 = await txt(page, 'dn:1.0')
  await boardText(page, 'dn:1.0', 'A22 WEEK B ' + where)
  if (where === 'top') await boardOff(page)
  const x1 = await door(page, where, 'undo')
  const k1 = await wk(), v1 = await txt(page, 'dn:1.0')
  const x2 = await door(page, where, 'undo')
  const k2 = await wk(), v2 = await txt(page, 'dn:0.0')
  const sb = await page.evaluate(() => window.SBDAY)
  const pa = await bk.shot(page, `a22-${where}-second-undo`)
  bk.ck(`A22.${where}.undo`, `${where === 'top' ? 'top-bar' : 'board'} Undo → week B's note back (on week B); Undo again → the view on week A, its note back`, k1 === wB && v1 === b0 && k2 === wA && v2 === a0 && /^Undid:/.test(x1.toasts.join(' ')) && /^Undid:/.test(x2.toasts.join(' ')), { x1: x1.toasts, k1, v1, x2: x2.toasts, k2, v2, boardDay: sb }, pa)
  const y1 = await door(page, where, 'redo')
  const j1 = await wk(), q1 = await txt(page, 'dn:0.0')
  const y2 = await door(page, where, 'redo')
  const j2 = await wk(), q2 = await txt(page, 'dn:1.0')
  const pb = await bk.shot(page, `a22-${where}-second-redo`)
  bk.ck(`A22.${where}.redo`, `${where === 'top' ? 'top-bar' : 'board'} Redo → week A's note again (on week A); Redo → the view on week B, its note again`, j1 === wA && q1 === 'A22 WEEK A ' + where && j2 === wB && q2 === 'A22 WEEK B ' + where, { y1: y1.toasts, j1, q1, y2: y2.toasts, j2, q2 }, pb)
}

bk.save(errors)
await browser.close()
