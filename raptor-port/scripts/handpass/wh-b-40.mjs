/* WALKER B — Astra's scenario 40: every count of pending says exactly ONE per hidden warning (the day's chip, the
   changes window's "To go out" tab and its line, the Amendments panel, the marker, the four sign-offs, the Publish AL
   button, the amendment's own item count), and never also "Warnings on this day changed". */
import * as B from './wh-b-lib.mjs'
const { L, W, TUE, judge, row, pic, savePart, nIssues, lineOf, short, K } = B
const S = '40'
B.prefix('s40-')
const { browser, p, errors } = await B.world()
const one = (a, n, al = 1) => {
  const o = a.win && a.win.out, items = o ? o.out : []
  return [
    [`the day's chip reads ${n} pending`, new RegExp(`^${n}\\s*pending`).test(a.head.pending), a.head.pending],
    [`the button reads Publish AL${al}`, !!a.btn && a.btn.label === `Publish AL${al}`, a.btn],
    [`Amendments: "1 day with changes to publish", Tue · ${n} change${n === 1 ? '' : 's'}`, !!a.panel && /^1 day with changes to publish/.test(a.panel.line) && a.panel.days.length === 1 && new RegExp(`^Tue · ${n} change${n === 1 ? '$' : 's$'}`).test(a.panel.days[0].text), a.panel && [a.panel.line, a.panel.days]],
    [`the window's heading says ${n} change${n === 1 ? '' : 's'} waiting to go out as AL${al}`, !!o && new RegExp(`${n} changes? waiting to go out as AL${al}`).test(o.title), o && o.title],
    [`the "To go out · AL${al}" tab counts ${n}`, !!o && o.tabs.some(t => new RegExp(`^To go out · AL${al} ${n}( |$)`).test(t)), o && o.tabs],
    [`its list is headed "Waiting to go out as AL${al} · ${n} change${n === 1 ? '' : 's'}" and holds ${n} line${n === 1 ? '' : 's'}`, !!o && new RegExp(`Waiting to go out as AL${al} · ${n} changes?$`).test(o.outHead) && items.length === n, o && [o.outHead, items.map(i => i.text)]],
    ['every line reads "Warning · … flagged → hidden"', items.length > 0 && items.every(i => /^Warning · /.test(i.where) && /flagged → hidden/.test(i.chg)), items.map(i => i.text)],
    ['no line says "Warnings on this day changed"', !items.some(i => /Warnings on this day changed/i.test(i.text)), items.map(i => i.text)],
  ]
}
try {
  await B.toEdit(p)
  const pub = await B.pubOrig(p, TUE)
  let a = await B.auth(p, TUE)
  let s0 = await pic(p, `s${S}-0-published`)
  judge(`${S}.0`, 'Tuesday signed and published (Original), nothing hidden — the counts before', [
    ['published', pub.r.pressed && /ORIG/.test(a.head.tag), [pub.r, a.head.tag]], ['the chip does not say pending', !/pending/.test(a.head.pending), a.head.pending],
    ['no marker', !a.head.nys, a.head.nys], ['no Publish AL button', !a.btn, a.btn], ['Amendments names no day', !!a.panel && a.panel.days.length === 0, a.panel]], [s0])

  /* 1 — one hide */
  const did = await B.hide(p, TUE, K.long.re)
  a = await B.auth(p, TUE, { tap: true })
  let s1 = await pic(p, `s${S}-1-one-hide-head`)
  judge(`${S}.1`, '✕ on Static\'s long work day; then the day\'s chip, the marker, the sign-offs, the button, the Amendments panel, the changes window ("To go out")', [
    ['the ✕ was pressed', did === 'pressed', did], ...one(a, 1),
    ['the marker reads Not yet signed', a.head.nys === 'Not yet signed', a.head.nys], ['the four sign-offs are empty', W.signsEmpty(a.head), a.head.signs],
    ['Publish AL1 is locked until the four sign (day head and Amendments)', !!a.btn && a.btn.locked && a.panel.days[0].locked, [a.btn, a.panel.days]]], [s1, ...a.win.shots])
  const grp = a.win.all.groups.filter(g => /warning/i.test(g.text) && /hid|hidden/i.test(g.text))
  judge(`${S}.1g`, 'the changes window, "All changes": where the hide is listed', [
    ['a line says who hid the warning', grp.length > 0, a.win.all.groups.map(g => g.text.slice(0, 120))],
    ['it sits under the group "The day"', grp.some(g => /^The day/.test(g.title)), grp.map(g => g.title)]], [a.win.shots[1]])
  const ld = a.win.landed
  judge(`${S}.1t`, 'a tap on the "Warning · … flagged → hidden" line in "To go out" (Astra: it lands on the struck line)', [
    ['the line can be tapped (it is a button)', a.win.out.out[0].tappable, a.win.out.out[0].title || 'a button'],
    ['the tap lights something on the schedule', !!ld && !!ld.flash, ld]], [ld && ld.shot])

  /* 2 — the four sign over the pending hide */
  await B.sign4(p, TUE)
  a = await B.auth(p, TUE)
  let s2 = await pic(p, `s${S}-2-signed`)
  judge(`${S}.2`, 'the four sign-off selects over the pending hide', [
    ...one(a, 1), ['the marker now reads Not yet published', a.head.nys === 'Not yet published', a.head.nys], ['the four are signed', W.signsFull(a.head), a.head.signs],
    ['Publish AL1 is unlocked (day head and Amendments)', !!a.btn && !a.btn.locked && !a.panel.days[0].locked, [a.btn, a.panel.days]]], [s2, a.win.shots[0]])

  /* 3 — a second hide: two, and the four fall */
  const did2 = await B.hide(p, TUE, K.clash.re)
  a = await B.auth(p, TUE)
  let s3 = await pic(p, `s${S}-3-two-hides`)
  judge(`${S}.3`, '✕ on a second warning (Saint\'s clash) while the four are signed', [
    ['the ✕ was pressed', did2 === 'pressed', did2], ...one(a, 2),
    ['the four sign-offs fell', W.signsEmpty(a.head), a.head.signs], ['the marker is back to Not yet signed', a.head.nys === 'Not yet signed', a.head.nys]], [s3, a.win.shots[0]])

  /* 3t — with two hides waiting: the clash names a seat, the long work day names none. A tap on each line. */
  const tc = await B.tapOut(p, TUE, /Saint — VL SAT/, `s${S}-3t-tap-clash-line`)
  const tl = await B.tapOut(p, TUE, /long work day/, `s${S}-3t-tap-longday-line`)
  judge(`${S}.3t`, 'the changes window, "To go out": a tap on each "Warning · … flagged → hidden" line (the plan: "a tap takes the view to the line of the warning"; Astra 40: "tapping it lands on the struck line")', [
    ['the clash line (it names a seat) can be tapped', !!tc.item && tc.item.button, tc.item], ['the tap lights something on Tuesday', !!tc.landed && !!tc.landed.lit && tc.landed.lit.day === TUE, tc.landed],
    ['what it lights is the struck warning line in the day list (Astra 40)', !!tc.landed && !!tc.landed.lit && tc.landed.lit.isWarnLine && tc.landed.listOpen === true, tc.landed && tc.landed.lit ? `it lit ${tc.landed.lit.isPuck ? 'the seat' : tc.landed.lit.tag} "${tc.landed.lit.text}"; the day list ${tc.landed.listOpen ? 'opened' : 'stayed shut'}` : 'nothing lit'],
    ['the long-work-day line (it names no seat) can be tapped', !!tl.item && tl.item.button, tl.item], ['that tap lights something on Tuesday', !!tl.landed && !!tl.landed.lit, tl.landed]], [tc.shot, tl.shot])
  row(`${S}.3r`, 'RECORDED — where each tap landed, and the hint the window shows under the list', `clash line: ${tc.item && tc.item.button ? 'a button' : 'not a button ("' + (tc.item && tc.item.title) + '")'} → lit ${tc.landed && tc.landed.lit ? `${tc.landed.lit.isWarnLine ? 'the warning line' : tc.landed.lit.isPuck ? 'a puck / seat' : tc.landed.lit.tag} "${tc.landed.lit.text}"` : 'nothing'}, the day's list ${tc.landed && tc.landed.listOpen ? 'opened' : 'stayed shut'} · long-work-day line: ${tl.item && tl.item.button ? 'a button' : 'not a button ("' + (tl.item && tl.item.title) + '")'} → lit ${tl.landed && tl.landed.lit ? '"' + tl.landed.lit.text + '"' : 'nothing'}, the day's list ${tl.landed && tl.landed.listOpen ? 'opened' : 'stayed shut'} · hint: "${tl.hint}"`, 'RECORDED', [tc.shot, tl.shot])

  /* 4 — flag the second again: one */
  const did3 = await B.again(p, TUE, K.clash.re)
  a = await B.auth(p, TUE)
  let s4 = await pic(p, `s${S}-4-back-to-one`)
  judge(`${S}.4`, '↺ on Saint\'s clash — back to one hidden warning', [['the ↺ was pressed', did3 === 'pressed', did3], ...one(a, 1)], [s4, a.win.shots[0]])
  row(`${S}.4s`, 'RECORDED — the sign-offs after the second hide was taken back (the day is again exactly what the four signed)', `marker "${a.head.nys}" · sign-offs [${a.head.signs.join(' | ')}]`, 'RECORDED', [s4])

  /* 5 — publish AL1: the amendment's own item count */
  const al = await B.pubAL(p, TUE)
  a = await B.auth(p, TUE)
  const info = await B.dayInfo(p, '#eWeek', TUE, `s${S}-5-dayinfo-AL1`)
  let s5 = await pic(p, `s${S}-5-after-AL1`)
  judge(`${S}.5`, 'the four sign-off selects, Publish AL1; then the Amendments panel\'s list and the ⓘ panel\'s "AL versions covering Tuesday"', [
    ['Publish AL1 was pressed', al.r.pressed, al.r], ['the day reads AL1, nothing pending, no marker', /AL1/.test(a.head.tag) && !/pending/.test(a.head.pending) && !a.head.nys, [a.head.tag, a.head.pending, a.head.nys]],
    ['Amendments lists AL1 with ONE item', !!a.panel && /AL1/.test(a.panel.list) && /\b1 (item|change|edit)\b/.test(a.panel.list) && !/\b[2-9] (items|changes|edits)\b/.test(a.panel.list), a.panel && a.panel.list],
    ['the ⓘ panel lists AL1 with ONE item', /AL1/.test(info.als || '') && /\b1 (item|change|edit)\b/.test(info.als || ''), info.als]], [s5, info.shot])

  /* 6 — flag again on the working copy: one pending the other way; hide again: nothing */
  const did4 = await B.again(p, TUE, K.long.re)
  a = await B.auth(p, TUE)
  const it = a.win && a.win.out ? a.win.out.out : []
  let s6 = await pic(p, `s${S}-6-flag-again-pending`)
  judge(`${S}.6`, '↺ on the long work day after AL1 went out with it hidden', [
    ['the ↺ was pressed', did4 === 'pressed', did4], ['the chip reads 1 pending', /^1\s*pending/.test(a.head.pending), a.head.pending], ['the button reads Publish AL2', !!a.btn && a.btn.label === 'Publish AL2', a.btn],
    ['"To go out" holds ONE line', it.length === 1, it.map(i => i.text)], ['it reads "Warning · … hidden → flagged again"', it.length === 1 && /^Warning · /.test(it[0].where) && /hidden → flagged again/.test(it[0].chg), it.map(i => i.text)],
    ['the marker reads Not yet signed', a.head.nys === 'Not yet signed', a.head.nys]], [s6, a.win ? a.win.shots[0] : null])
  const did5 = await B.hide(p, TUE, K.long.re)
  const w = await B.work(p, TUE)
  let s7 = await pic(p, `s${S}-7-back-to-nothing`)
  judge(`${S}.7`, '✕ on it again — the day is back to what AL1 went out with', [
    ['the ✕ was pressed', did5 === 'pressed', did5], ['nothing pending', !/pending/.test(w.head.pending), w.head.pending], ['no marker', !w.head.nys, w.head.nys], ['no Publish AL button', !w.head.alpub, w.head.alpub],
    ['the line is struck again', !!lineOf(w.list, K.long.re) && lineOf(w.list, K.long.re).struck, short(w.list)]], [s7])
} catch (e) { row(`${S}.X`, 'the script stopped', String(e && e.stack || e).slice(0, 600), 'FAIL', [await pic(p, `s${S}-X-error`)]) }
row(`${S}.err`, 'the browser\'s error list through this scenario', errors.length ? errors.join(' | ').slice(0, 800) : 'none', errors.length ? 'FAIL' : 'PASS')
savePart(`s${S}`, { errors })
await browser.close()
