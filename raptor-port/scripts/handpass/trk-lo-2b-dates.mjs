/* [TRK-LEFTOVERS] walker b — C5 + D374: the Tracker's date boxes save when
   they are LEFT, never half-typed; a day after today is refused in Done on,
   Failed on and both Last Flown boxes (and each row of the full failures list,
   which are "Failed on" days too — D374 reading (2)); Upchit and the end dates
   take it.

     node scripts/handpass/trk-lo-2b-dates.mjs desk    (1440×900, a mouse)
     node scripts/handpass/trk-lo-2b-dates.mjs phone   (390×844, a finger; the side panel on Info)

   Every step is written as the RIGHT behaviour, so a PASS means correct and a
   re-run IS the re-walk. The box is typed with the real keyboard, slowly where
   slowness matters (the day's first digit, a 3 s pause, its second; the month;
   then the year one digit every 2.5 s). The browser's storage is READ to check
   what was saved — never written. A fresh browser (the demo world), admin. */
import { open, shot, save, log, PHONE, DESK } from './trk-lib.mjs'
import { sleep } from './trk-w2-lib.mjs'
import { PH, TAG, todayIso, addDays, short, press, pressSel, toInfo, toFlow, tapBall, stored, undoNow, onScreen } from './trk-lo-2b-lib.mjs'

const L = log()
const { browser, page, errors } = await open({ size: PH ? PHONE : DESK, who: 'a', touch: PH })
const T = await todayIso(page), TMR = addDays(T, 1)
const NOT_YET = 'That day hasn’t come yet — pick today or earlier.'
let pic = 0
const snap = async (what, opts) => { const n = `lo-2b-${TAG}-${++pic}-${what}`; await shot(page, n, opts); return n }
const box = sel => page.locator(sel).first()
const val = sel => box(sel).inputValue()
L.note('0 today (the squadron\'s day) / tomorrow', T + ' / ' + TMR + ' · size ' + (PH ? 'phone 390×844 touch' : 'desktop 1440×900'))
L.note('0 crew picked', await page.locator('#activeSel option:checked').innerText())

/* ---------- the moves a person makes in a date box ---------- */
/** press the box's day part, then type ddmmyyyy SLOWLY; `watch` reads what is
    saved, and every read is taken while the box is still being typed in */
async function slowType(sel, iso, watch) {
  const [y, m, d] = iso.split('-')
  await pressSel(page, sel, { dx: 10 })
  const series = []
  const look = async after => { const u = await undoNow(page); series.push({ after, box: await val(sel), saved: JSON.stringify(await watch()), undo: u.t, depth: u.depth }) }
  await page.keyboard.type(d[0]); await sleep(3000); await look('day ' + d[0])
  await page.keyboard.type(d[1]); await sleep(700); await look('day ' + d)
  await page.keyboard.type(m, { delay: 90 }); await sleep(700); await look('month ' + m)
  for (const ch of y) { await page.keyboard.type(ch); await sleep(2500); await look('year digit ' + ch) }
  return series
}
/** type a whole day quickly (a person who knows what they want) */
async function typeFast(sel, iso) {
  const [y, m, d] = iso.split('-')
  await pressSel(page, sel, { dx: 10 })
  await page.keyboard.type(d + m + y, { delay: 60 }); await sleep(300)
  return val(sel)
}
/** leave the box — Tab, Enter, or a press on an empty spot beside it (the card's
    own heading, the pop-up's title, the failures list's title) */
async function leave(sel, how) {
  /* a date box keeps Tab inside itself while it walks its parts and the calendar
     icon (Chrome: from the year, the first Tab lands on the icon) — a person
     presses Tab until the focus moves on */
  if (how === 'tab') {
    for (let k = 0; k < 4; k++) {
      await page.keyboard.press('Tab'); await sleep(150)
      if (!(await page.evaluate(sel => document.activeElement === document.querySelector(sel), sel))) break
    }
  } else if (how === 'enter') await page.keyboard.press('Enter')
  else {
    const p = await page.evaluate(sel => {
      const el = document.querySelector(sel); const host = el.closest('#failLog, #pop, .card')
      const h = host.id === 'pop' ? host.querySelector('#popTitle') : host.querySelector('.lullhd b, h3')
      const r = h.getBoundingClientRect(); return { x: r.left + 6, y: r.top + r.height / 2 }
    }, sel)
    await press(page, p.x, p.y)
  }
  await sleep(600)
}
/** go to the year part (press the day part, → twice) and type `digits` there */
async function halfYear(sel, digits) {
  await pressSel(page, sel, { dx: 10 })
  await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight')
  await page.keyboard.type(digits, { delay: 120 }); await sleep(400)
  return val(sel)
}
/** empty the box on purpose: each of its three parts cleared */
async function emptyAll(sel) {
  await pressSel(page, sel, { dx: 10 })
  for (let k = 0; k < 3; k++) { await page.keyboard.press('Backspace'); await sleep(80); if (k < 2) await page.keyboard.press('ArrowRight') }
  await sleep(300)
  return val(sel)
}
/** one part only cleared: the box reads empty but the browser knows it is half typed */
async function emptyOnePart(sel) {
  await pressSel(page, sel, { dx: 10 })
  await page.keyboard.press('Backspace'); await sleep(300)
  return val(sel)
}
const unchangedWhileTyping = (series, saved0, depth0, undo0) =>
  series.every(s => s.saved === saved0 && s.depth === depth0 && s.undo === undo0)
const warnUnder = sel => page.evaluate(sel => { const i = document.querySelector(sel); const w = i && i.parentElement && i.parentElement.querySelector('.datewarn'); return w ? w.textContent : '' }, sel)

/* ================= 1. the side panel's five boxes ================= */
await toInfo(page)
const S = [
  { name: 'Last Flown (Syllabus)', sel: '#lastSyll', get: st => (st.d || {}).lastSyll || '', future: false, how: PH ? 'click' : 'tab', day: addDays(T, -11) },
  { name: 'Last Flown (Currency)', sel: '#lastCurr', get: st => (st.d || {}).lastCurr || '', future: false, how: 'click', day: addDays(T, -6) },
  { name: 'Upchit', sel: '#upchit', get: st => (st.d || {}).upchit || '', future: true, how: 'enter', day: addDays(T, -20) },
  { name: 'End date A', sel: '#targetIn', get: st => (st.pace || {}).target || '', future: true, how: PH ? 'click' : 'tab', day: addDays(T, 80), tip: 'End date A' },
  { name: 'End date B', sel: '#targetIn2', get: st => (st.pace || {}).target2 || '', future: true, how: 'click', day: addDays(T, 110), tip: 'End date B' },
]
const tipOf = { '#lastSyll': 'Last Flown (Syllabus)', '#lastCurr': 'Last Flown (Currency)', '#upchit': 'the upchit date', '#targetIn': 'End date A', '#targetIn2': 'End date B' }
for (const b of S) {
  const K = b.name
  const st0 = await stored(page), v0 = b.get(st0), u0 = await undoNow(page)
  const watch = async () => b.get(await stored(page))
  /* (a) slow typing: nothing saved, no undo step, until the box is left */
  const series = await slowType(b.sel, b.day, watch)
  if (b.sel === '#lastSyll') { await box(b.sel).scrollIntoViewIfNeeded(); await snap('lastsyll-mid-typing', { el: '.c-curr' }) }
  L.note(`1 ${K}: typed ${short(b.day)} slowly (saved before "${v0}", ↶ "${u0.t}")`, JSON.stringify(series.map(s => [s.after, s.box, s.saved, s.depth])))
  L.ok(`1 ${K}: while typing, nothing is saved and ↶ does not move`, unchangedWhileTyping(series, JSON.stringify(v0), u0.depth, u0.t),
    series.map(s => `${s.after}: box ${s.box || '(empty)'} · saved "${JSON.parse(s.saved)}" · steps ${s.depth}`).join(' | '))
  const boxEnd = await val(b.sel)
  await leave(b.sel, b.how)
  const u1 = await undoNow(page), v1 = b.get(await stored(page))
  L.ok(`1 ${K}: left by ${b.how} → the day is saved once, one undo step named for the box`,
    boxEnd === b.day && v1 === b.day && u1.depth === u0.depth + 1 && u1.t.includes(tipOf[b.sel]),
    `box ${boxEnd} · saved "${v1}" · steps ${u0.depth}→${u1.depth} · ↶ "${u1.t}"`)
  /* ↶ once goes back to what was there before the typing — never a half-typed year — and ↷ puts it again */
  await pressSel(page, '#trUndoBtn'); await sleep(500)
  const back = await val(b.sel), vb = b.get(await stored(page))
  await pressSel(page, '#trRedoBtn'); await sleep(500)
  const fwd = await val(b.sel), vf = b.get(await stored(page))
  L.ok(`1 ${K}: one ↶ goes back to the day before the typing; ↷ puts it again`, back === v0 && vb === v0 && fwd === b.day && vf === b.day,
    `after ↶ box "${back}" saved "${vb}" (before "${v0}") · after ↷ box "${fwd}" saved "${vf}"`)
  await sleep(2200)
  /* (b) a half-typed year left in the box goes back to the saved day */
  const u2 = await undoNow(page)
  const half = await halfYear(b.sel, '20')
  await leave(b.sel, b.how === 'enter' ? 'click' : b.how)
  const afterHalf = await val(b.sel), vh = b.get(await stored(page)), u3 = await undoNow(page)
  L.ok(`1 ${K}: a half-typed year (box "${half}") left → put back to the saved day, nothing saved`, afterHalf === b.day && vh === b.day && u3.depth === u2.depth,
    `box after leaving "${afterHalf}" · saved "${vh}" · steps ${u2.depth}→${u3.depth}`)
  /* (c) one part cleared (the box reads empty, half typed) → put back */
  const one = await emptyOnePart(b.sel)
  await leave(b.sel, b.how === 'enter' ? 'click' : b.how)
  const afterOne = await val(b.sel), vo = b.get(await stored(page)), u4 = await undoNow(page)
  L.ok(`1 ${K}: one part of the day cleared (box "${one}") and left → put back, nothing saved`, afterOne === b.day && vo === b.day && u4.depth === u2.depth,
    `box after leaving "${afterOne}" · saved "${vo}" · steps ${u2.depth}→${u4.depth}`)
  /* (d) tomorrow */
  const tm = await typeFast(b.sel, TMR)
  await leave(b.sel, b.how)
  const afterT = await val(b.sel), vt = b.get(await stored(page)), u5 = await undoNow(page), w = await warnUnder(b.sel)
  if (!b.future) {
    L.ok(`1 ${K}: tomorrow (${short(TMR)}) is refused — box put back, nothing saved, no step, ONE line under the box`,
      tm === TMR && afterT === b.day && vt === b.day && u5.depth === u2.depth && w === NOT_YET,
      `box "${afterT}" · saved "${vt}" · steps ${u2.depth}→${u5.depth} · line "${w}"`)
    const lines = await page.evaluate(sel => { const c = document.querySelector(sel).closest('.card'); return [...c.querySelectorAll('.datewarn')].map(x => x.textContent) }, b.sel)
    L.ok(`1 ${K}: exactly one refusal line on the card`, lines.length === 1, JSON.stringify(lines))
    const os = await onScreen(page, b.sel + ' + .datewarn')
    await box(b.sel).scrollIntoViewIfNeeded()
    const n = await snap(b.sel === '#lastSyll' ? 'lastsyll-refused' : 'lastcurr-refused', { el: '.c-curr' })
    L.ok(`1 ${K}: the refusal line is on screen, whole, not clipped (${n})`, os.found && os.inWin && !os.clippedBy && !os.cut && os.onTop, JSON.stringify(os))
    /* the line goes with the next change: retype the saved day (no step) */
    await typeFast(b.sel, b.day)
    const w2 = await warnUnder(b.sel)
    await leave(b.sel, b.how === 'enter' ? 'click' : b.how)
    const u6 = await undoNow(page)
    L.ok(`1 ${K}: the line goes at the next change; the same day retyped makes no undo step`, w2 === '' && u6.depth === u2.depth && b.get(await stored(page)) === b.day,
      `line while retyping "${w2}" · steps ${u2.depth}→${u6.depth}`)
  } else {
    L.ok(`1 ${K}: tomorrow (${short(TMR)}) is taken — saved, one step, no refusal line`, afterT === TMR && vt === TMR && u5.depth === u2.depth + 1 && w === '',
      `box "${afterT}" · saved "${vt}" · steps ${u2.depth}→${u5.depth} · line "${w}"`)
    await sleep(2200)
    const u5b = await undoNow(page)
    await typeFast(b.sel, TMR); await leave(b.sel, b.how === 'enter' ? 'click' : b.how)
    const u6 = await undoNow(page)
    L.ok(`1 ${K}: the same day retyped makes no undo step`, u6.depth === u5b.depth && b.get(await stored(page)) === TMR, `steps ${u5b.depth}→${u6.depth}`)
  }
  await sleep(2200)
  /* (e) emptied on purpose → the empty is saved, one step */
  const u7 = await undoNow(page)
  const e = await emptyAll(b.sel)
  await leave(b.sel, b.how === 'enter' ? 'click' : b.how)
  const afterE = await val(b.sel), ve = b.get(await stored(page)), u8 = await undoNow(page)
  L.ok(`1 ${K}: emptied on purpose (box "${e}") and left → the empty is saved, one step`, afterE === '' && ve === '' && u8.depth === u7.depth + 1,
    `box "${afterE}" · saved "${ve}" · steps ${u7.depth}→${u8.depth} · ↶ "${u8.t}"`)
  await sleep(2200)
}
await toInfo(page)
await box('#lastSyll').scrollIntoViewIfNeeded()
await snap('side-boxes-end', { el: '.c-curr' })

/* ================= 2. the grading pop-up: Done on ================= */
const markOf = async id => ((await stored(page)).m || {})[id] || null
await tapBall(page, 'TR-2')
L.note('2 TR-2 pop-up', await page.locator('#popTitle').innerText())
await page.locator('#pop button', { hasText: /^\s*DCO\s*$/ }).first().click(); await sleep(600)
L.note('2 TR-2 graded DCO (today)', JSON.stringify(await markOf('TR-2')) + ' · Last Flown ' + JSON.stringify(((await stored(page)).d || {}).lastSyll))
await tapBall(page, 'TR-2')
{
  const d0 = (await markOf('TR-2')).d, u0 = await undoNow(page)
  const watch = async () => { const st = await stored(page); return [((st.m || {})['TR-2'] || {}).d, (st.d || {}).lastSyll] }
  const target = addDays(T, -11)
  const w0 = JSON.stringify(await watch())
  const series = await slowType('#popDoneDate', target, watch)
  L.ok('2 Done on: while typing slowly, the mark\'s day, Last Flown and ↶ do not move', unchangedWhileTyping(series, w0, u0.depth, u0.t),
    series.map(s => `${s.after}: box ${s.box || '(empty)'} · saved ${s.saved} · steps ${s.depth}`).join(' | '))
  await snap('doneon-mid-typing', { el: '#pop' })
  await leave('#popDoneDate', PH ? 'click' : 'tab')
  const m1 = await markOf('TR-2'), u1 = await undoNow(page), ls1 = ((await stored(page)).d || {}).lastSyll
  L.ok('2 Done on: left → the flight is re-dated once, Last Flown follows, one step "the date on TR-2"', m1.d === target && ls1 === target && u1.depth === u0.depth + 1 && /the date on TR-2/.test(u1.t),
    `mark day ${m1.d} · Last Flown ${ls1} · steps ${u0.depth}→${u1.depth} · ↶ "${u1.t}"`)
  await sleep(2200)
  const u2 = await undoNow(page)
  const half = await halfYear('#popDoneDate', '20'); await leave('#popDoneDate', PH ? 'click' : 'tab')
  const bh = await val('#popDoneDate'), mh = await markOf('TR-2'), u3 = await undoNow(page)
  L.ok(`2 Done on: a half-typed year (box "${half}") left → back to the mark's day, nothing saved`, bh === target && mh.d === target && u3.depth === u2.depth, `box "${bh}" · mark day ${mh.d} · steps ${u2.depth}→${u3.depth}`)
  await typeFast('#popDoneDate', target); await leave('#popDoneDate', PH ? 'click' : 'tab')
  const u4 = await undoNow(page)
  L.ok('2 Done on: the same day retyped makes no undo step', u4.depth === u2.depth && (await markOf('TR-2')).d === target, `steps ${u2.depth}→${u4.depth}`)
  /* tomorrow */
  await typeFast('#popDoneDate', TMR); await leave('#popDoneDate', PH ? 'click' : 'tab')
  const bt = await val('#popDoneDate'), mt = await markOf('TR-2'), u5 = await undoNow(page)
  const wt = await page.locator('#popDoneWarn').innerText().catch(() => '')
  L.ok(`2 Done on: tomorrow is refused — box back to the mark's day, nothing saved, no step, one line`, bt === target && mt.d === target && u5.depth === u2.depth && wt === NOT_YET,
    `box "${bt}" · mark day ${mt.d} · steps ${u2.depth}→${u5.depth} · line "${wt}"`)
  const os = await onScreen(page, '#popDoneWarn')
  const n = await snap('doneon-refused', { el: '#pop' })
  await snap('doneon-refused-page')
  L.ok(`2 Done on: the refusal line is on screen, whole, not clipped (${n})`, os.found && os.inWin && !os.clippedBy && !os.cut && os.onTop, JSON.stringify(os))
  /* emptied on purpose: a done flight always has a day — what happens? */
  const e = await emptyAll('#popDoneDate'); await leave('#popDoneDate', PH ? 'click' : 'tab')
  const be = await val('#popDoneDate'), me = await markOf('TR-2'), u6 = await undoNow(page)
  L.note('2 Done on: emptied on purpose and left (a done event keeps its day, by the code\'s comment)', `typed box "${e}" → box "${be}" · mark day ${me.d} · steps ${u2.depth}→${u6.depth}`)
  L.ok('2 Done on: an emptied box never leaves the done flight without a day or makes a step', be === target && me.d === target && u6.depth === u2.depth, `box "${be}" · mark day ${me.d}`)
  /* Escape keeps a whole day typed, as it closes the pop-up */
  await sleep(2200)
  const u7 = await undoNow(page), esc = addDays(T, -3)
  await typeFast('#popDoneDate', esc)
  await page.keyboard.press('Escape'); await sleep(600)
  const popGone = !(await page.locator('#pop').isVisible().catch(() => false))
  const mEsc = await markOf('TR-2'), u8 = await undoNow(page)
  await tapBall(page, 'TR-2')
  const reopened = await val('#popDoneDate')
  const n2 = await snap('doneon-after-escape', { el: '#pop' })
  L.ok(`2 Done on: ${short(esc)} typed then Escape → the pop-up closes AND the day is kept (one step) (${n2})`, popGone && mEsc.d === esc && reopened === esc && u8.depth === u7.depth + 1,
    `pop-up closed ${popGone} · mark day ${mEsc.d} · reopened box "${reopened}" · steps ${u7.depth}→${u8.depth} · ↶ "${u8.t}"`)
  await page.keyboard.press('Escape'); await sleep(300)
}
/* a grade pressed while Done on holds a future day (the box not left first) */
{
  const id = 'ST-01'
  await tapBall(page, id)
  const u0 = await undoNow(page), m0 = await markOf(id)
  await typeFast('#popDoneDate', TMR)
  const boxNow = await val('#popDoneDate')
  await pressSel(page, '#pop .opts button:nth-child(2)')   // DCO
  await sleep(600)
  const popUp = await page.locator('#pop').isVisible().catch(() => false)
  const m1 = await markOf(id), u1 = await undoNow(page)
  const w = popUp ? await page.locator('#popDoneWarn').innerText().catch(() => '') : ''
  const n = await snap('grade-with-future-doneon')
  L.note(`2 ${id} (not done): Done on typed ${short(TMR)} (box "${boxNow}"), then DCO pressed straight away`, `pop-up still up ${popUp} · mark ${JSON.stringify(m1)} (before ${JSON.stringify(m0)}) · steps ${u0.depth}→${u1.depth} · line "${w}" (${n})`)
  L.ok(`2 a grade pressed while Done on holds tomorrow is refused — no mark, the pop-up stays with the line`, popUp && !(m1 && m1.g) && u1.depth === u0.depth && w === NOT_YET,
    `pop-up up ${popUp} · mark ${JSON.stringify(m1)} · steps ${u0.depth}→${u1.depth} · line "${w}"`)
  if (popUp) { await page.keyboard.press('Escape'); await sleep(300) }
}

/* ================= 3. the grading pop-up: Failed on ================= */
const fdOf = async id => { const m = await markOf(id); return m ? { f: m.f, fd: m.fd } : null }
await tapBall(page, 'ST-02')
{
  const u0 = await undoNow(page), f0 = await fdOf('ST-02')
  const watch = async () => fdOf('ST-02')
  const target = addDays(T, -10)
  const series = await slowType('#popFailDate', target, watch)
  L.ok('3 Failed on: typing slowly saves nothing and makes no step (the box only says where the next + lands)', unchangedWhileTyping(series, JSON.stringify(f0), u0.depth, u0.t),
    series.map(s => `${s.after}: box ${s.box || '(empty)'} · saved ${s.saved} · steps ${s.depth}`).join(' | '))
  await leave('#popFailDate', PH ? 'click' : 'tab')
  const kept = await val('#popFailDate')
  L.ok('3 Failed on: a whole past day, left, stays in the box (nothing saved yet)', kept === target && JSON.stringify(await fdOf('ST-02')) === JSON.stringify(f0), `box "${kept}"`)
  await pressSel(page, '#popFailPlus'); await sleep(500)
  const f1 = await fdOf('ST-02'), u1 = await undoNow(page)
  L.ok(`3 Failed on ${short(target)}, then + → one failure on that day, one step`, f1 && f1.f === 1 && f1.fd[0] === target && u1.depth === u0.depth + 1, `${JSON.stringify(f1)} · steps ${u0.depth}→${u1.depth} · ↶ "${u1.t}"`)
  /* a half-typed year left in Failed on → it STAYS, with its line (the walk's F-b3 fix, 28 Sep 26:
     it used to snap back to today, and a + then recorded today under a "refused" line) */
  const half = await halfYear('#popFailDate', '20'); await leave('#popFailDate', PH ? 'click' : 'tab')
  const bh = await val('#popFailDate'), wh = await page.locator('#popFailWarn').innerText().catch(() => '')
  L.note(`3 Failed on: a half-typed year (box "${half}") left`, `box now "${bh}" (today ${T}) · line "${wh}"`)
  L.ok('3 Failed on: a half-typed year left stays in the box with the line saying the day is not finished', bh === half && /isn’t finished/.test(wh), `box "${bh}" · line "${wh}"`)
  /* tomorrow, left by keyboard → refused with the line; nothing recorded */
  const u2 = await undoNow(page), f2 = await fdOf('ST-02')
  await typeFast('#popFailDate', TMR)
  await page.keyboard.press('Enter'); await sleep(500)
  const bt = await val('#popFailDate'), wt = await page.locator('#popFailWarn').innerText().catch(() => '')
  L.ok(`3 Failed on: tomorrow, Enter → refused, the day stays in the box with one line, nothing recorded`, bt === TMR && wt === NOT_YET && JSON.stringify(await fdOf('ST-02')) === JSON.stringify(f2) && (await undoNow(page)).depth === u2.depth,
    `box "${bt}" · line "${wt}"`)
  const os = await onScreen(page, '#popFailWarn')
  const n = await snap('failedon-refused', { el: '#pop' })
  L.ok(`3 Failed on: the refusal line is on screen, whole, not clipped (${n})`, os.found && os.inWin && !os.clippedBy && !os.cut && os.onTop, JSON.stringify(os))
  /* tomorrow typed, then + pressed straight away (the box not left first) */
  await typeFast('#popFailDate', TMR)
  const boxNow = await val('#popFailDate')
  await pressSel(page, '#popFailPlus'); await sleep(600)
  const f3 = await fdOf('ST-02'), u3 = await undoNow(page), w3 = await page.locator('#popFailWarn').innerText().catch(() => '')
  const n3 = await snap('plus-with-future-failedon', { el: '#pop' })
  L.note(`3 Failed on typed ${short(TMR)} (box "${boxNow}"), + pressed straight away`, `failures ${JSON.stringify(f3)} (before ${JSON.stringify(f2)}) · steps ${u2.depth}→${u3.depth} · box "${await val('#popFailDate')}" · line "${w3}" (${n3})`)
  L.ok('3 + with a future Failed on is refused — no failure recorded, the line shown', JSON.stringify(f3) === JSON.stringify(f2) && u3.depth === u2.depth && w3 === NOT_YET,
    `failures ${JSON.stringify(f3)} (before ${JSON.stringify(f2)}) · steps ${u2.depth}→${u3.depth} · line "${w3}"`)
  /* a half-typed year in Failed on, then + pressed straight away: the plan's §6 (which
     wins over §2) — "+ with a half-typed or future day refuses and says so rather than
     using today" */
  {
    const fA = await fdOf('ST-02'), uA = await undoNow(page)
    const half2 = await halfYear('#popFailDate', '20')
    await pressSel(page, '#popFailPlus'); await sleep(600)
    const fB = await fdOf('ST-02'), uB = await undoNow(page), wB = await page.locator('#popFailWarn').innerText().catch(() => '')
    const nB = await snap('plus-with-halftyped-failedon', { el: '#pop' })
    L.note(`3 Failed on half typed (box "${half2}"), + pressed straight away`, `failures ${JSON.stringify(fB)} (before ${JSON.stringify(fA)}) · steps ${uA.depth}→${uB.depth} · box "${await val('#popFailDate')}" · line "${wB}" (${nB})`)
    L.ok('3 + with a half-typed Failed on refuses and says so (plan §6), recording nothing', JSON.stringify(fB) === JSON.stringify(fA) && uB.depth === uA.depth && wB !== '',
      `failures ${JSON.stringify(fB)} (before ${JSON.stringify(fA)}) · steps ${uA.depth}→${uB.depth} · line "${wB}"`)
    /* put the count back where the list below expects it (− takes the latest day) */
    while ((await fdOf('ST-02')).f > Math.max(2, fA.f)) { await pressSel(page, '#popFailMinus'); await sleep(400) }
  }
  /* a second failure today, for the list below */
  await sleep(300)
  const bx = await val('#popFailDate')
  if (bx !== T) { await typeFast('#popFailDate', T); await leave('#popFailDate', PH ? 'click' : 'tab') }
  if ((await fdOf('ST-02')).f < 2) { await pressSel(page, '#popFailPlus'); await sleep(500) }
  L.note('3 ST-02 failures now', JSON.stringify(await fdOf('ST-02')))
  await page.keyboard.press('Escape'); await sleep(300)
}

/* ================= 4. the full failures list's rows ================= */
await toInfo(page)
await pressSel(page, '#failTitle'); await sleep(500)
{
  const f0 = await fdOf('ST-02')
  const rowSel = i => `#failLog .frow[data-ev="ST-02"][data-fi="${i}"] input[type=date]`
  const rows = async () => page.evaluate(() => [...document.querySelectorAll('#failLog .frow')].map(r => r.querySelector('.failchip').textContent + ' ' + r.querySelector('input').value))
  L.note('4 the full list opened', JSON.stringify(await rows()) + ' · stored ' + JSON.stringify(f0))
  const later = f0.fd[1]   // today's
  const target = addDays(T, -5)
  const u0 = await undoNow(page)
  const series = await slowType(rowSel(1), target, async () => fdOf('ST-02'))
  L.ok('4 a list row: while typing slowly, nothing is saved and the rows do not re-sort', unchangedWhileTyping(series, JSON.stringify(f0), u0.depth, u0.t),
    series.map(s => `${s.after}: box ${s.box || '(empty)'} · saved ${s.saved} · steps ${s.depth}`).join(' | '))
  await leave(rowSel(1), PH ? 'click' : 'tab')
  const f1 = await fdOf('ST-02'), u1 = await undoNow(page)
  L.ok(`4 a list row: left → ST-02X re-dated ${short(later)}→${short(target)}, one step`, f1.fd[1] === target && f1.fd[0] === f0.fd[0] && u1.depth === u0.depth + 1 && /the date of ST-02X/.test(u1.t),
    `${JSON.stringify(f1)} · steps ${u0.depth}→${u1.depth} · ↶ "${u1.t}"`)
  await sleep(2200)
  const u2 = await undoNow(page)
  const half = await halfYear(rowSel(1), '20'); await leave(rowSel(1), PH ? 'click' : 'tab')
  L.ok(`4 a list row: a half-typed year (box "${half}") left → put back, nothing saved`, (await val(rowSel(1))) === target && JSON.stringify(await fdOf('ST-02')) === JSON.stringify(f1) && (await undoNow(page)).depth === u2.depth,
    `box "${await val(rowSel(1))}"`)
  await typeFast(rowSel(1), target); await leave(rowSel(1), PH ? 'click' : 'tab')
  L.ok('4 a list row: the same day retyped makes no step', (await undoNow(page)).depth === u2.depth, `steps ${u2.depth}→${(await undoNow(page)).depth}`)
  await typeFast(rowSel(1), TMR); await leave(rowSel(1), PH ? 'click' : 'tab')
  const wr = await page.evaluate(sel => { const i = document.querySelector(sel); const w = i && i.closest('.frow').querySelector('.datewarn'); return w ? w.textContent : '' }, rowSel(1))
  L.ok(`4 a list row: tomorrow refused — put back, nothing saved, no step, one line`, (await val(rowSel(1))) === target && JSON.stringify(await fdOf('ST-02')) === JSON.stringify(f1) && (await undoNow(page)).depth === u2.depth && wr === NOT_YET,
    `box "${await val(rowSel(1))}" · line "${wr}"`)
  const os = await onScreen(page, '#failLog .frow[data-fi="1"] .datewarn')
  const n = await snap('failrow-refused', { el: '#failLog' })
  L.ok(`4 a list row: the refusal line is on screen, whole, not clipped (${n})`, os.found && os.inWin && !os.clippedBy && !os.cut && os.onTop, JSON.stringify(os))
  await sleep(2200)
  /* emptied on purpose → the failure stays, undated, and sorts last */
  const u3 = await undoNow(page)
  await emptyAll(rowSel(0)); await leave(rowSel(0), PH ? 'click' : 'tab')
  const f4 = await fdOf('ST-02'), u4 = await undoNow(page)
  const stale = await page.evaluate(() => [...document.querySelectorAll('#failLog .frow')].map(r => { const w = r.querySelector('.datewarn'); return w ? r.querySelector('.failchip').textContent + ' (' + (r.querySelector('input').value || 'no day') + '): ' + w.textContent : null }).filter(Boolean))
  const n4 = await snap('failrow-emptied', { el: '#failLog' })
  L.ok(`4 after the empty (nothing refused) no refusal line is left under any row — an old one would now sit under another failure (${n4})`, stale.length === 0, JSON.stringify(stale))
  L.ok(`4 a list row: ST-02 (${short(f0.fd[0])}) emptied on purpose → saved undated, sorts after the dated one, one step (${n4})`, f4.f === 2 && f4.fd[0] === target && f4.fd[1] == null && u4.depth === u3.depth + 1,
    `${JSON.stringify(f4)} · rows ${JSON.stringify(await rows())} · steps ${u3.depth}→${u4.depth}`)
  await page.keyboard.press('Escape'); await sleep(300)
}

L.note('errors', JSON.stringify(errors))
L.ok('no console errors, page errors, failed requests or native dialogs', errors.length === 0, JSON.stringify(errors))
save(`lo-2b-dates-${TAG}`, { rows: L.rows, errors })
await browser.close()
process.exit(L.rows.some(r => r.pass === false) ? 1 : 0)
