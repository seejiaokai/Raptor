/* B — section 3's families, DRAWN on the real warning list (Monday's board, which holds real red, amber and grey rows to
   clone). Every word is the proposal's (section 3, with the cold read's corrections of 15 Nov 26 applied to "proposed").
   Today's words are the app's templates filled with example values, as the proposal writes them; the prefix is the
   app's own "<callsign(s)> — ". usage: [PHONE=1] node b-families.mjs */
import * as X from './ww-lib.mjs'
import { appendFileSync } from 'node:fs'
const w = await X.open({ phone: process.env.PHONE === '1' })
const { P } = w
const man = rec => appendFileSync(X.OUT + '/manifest.jsonl', JSON.stringify(rec) + '\n')
const size = w.phone ? '402x874 WebKit @3x' : '1536x864 Chromium @2x'
// [sev, prefix, today, proposed]  (today null = no line today)
const R = 'Ranger', VJ = 'Viper, Jinx'
const F = {
  clashes: ['Clashes', [
    ['hard', R, 'RU & BRIEFING clash', 'Clash: RU (step 12:00, T/O 13:00) & BRIEFING 12:40–13:00'],
    ['hard', R, 'SC AM & OFT 1 clash', 'Clash: SC AM 07:00–13:00 & OFT 1 10:00–11:30'],
    ['hard', R, 'Ranger is in two seats on VL BFM at once', 'Clash: in two seats on VL BFM (T/O 12:00) at once'],
    ['hard', R, 'Ranger is on two items called SODB at once', 'Clash: two items both called SODB, 07:45–08:00 & 07:50–08:10'],
    ['hard', R, 'Ranger is on AVALON NIGHT MAIN (19:00–07:00) and also on AVALON NIGHT SPARE (19:00–07:00)', 'Clash: AVALON NIGHT MAIN 19:00–07:00 & AVALON NIGHT SPARE 19:00–07:00'],
    ['hard', R, 'Ranger is standing SC SPARE (SC AM 07:00–13:00) and also on SC AM MAIN (07:00–13:00)', 'Clash: SC AM SPARE 07:00–13:00 & SC AM MAIN 07:00–13:00'],
    ['hard', R, 'Appointment clashes with VL BFM — reason: dental', 'Clash: VL BFM (landing 13:30, dekit to 14:00) & Appointment 13:40–14:30. Reason: dental'],
    ['hard', R, 'Appointment but tasked — OFT 1 — reason: dental', 'Clash: OFT 1 10:00–11:30 & Appointment 10:30–11:30. Reason: dental'],
  ]],
  standby: ['On standby and also on something else', [
    ['adv', R, 'Ranger is on SC AM (07:00–13:00) and also down for LECTURE', 'Overlaps standby: LECTURE 09:00–10:00 & SC AM 07:00–13:00'],
    ['adv', R, 'Ranger is on SC AM (07:00–13:00) and also down for Meeting', 'Overlaps standby: Meeting 09:00–10:00 & SC AM 07:00–13:00'],
    ['adv', R, 'Ranger reports 06:00 for SC AM — MEETING (06:30–07:00) cuts into the in-time window before the 07:00 start', 'Busy before SC AM: MEETING 06:30–07:00 is between his 06:00 in-time and the 07:00 start'],
  ]],
  leave: ['On leave, downchit, away', [
    ['hard', R, 'Downchit but planned to fly VL BFM — reason: flu', 'Downchit + planned: VL BFM (T/O 12:00). Reason: flu'],
    ['hard', R, 'On leave but planned to fly VL BFM — reason: family', 'On leave + planned: VL BFM (T/O 12:00). Reason: family'],
    ['hard', R, 'Downchit but tasked — LECTURE — reason: flu', 'Downchit + planned: LECTURE 09:00–10:00. Reason: flu'],
    ['hard', R, 'On leave but tasked — OFT 1', 'On leave + planned: OFT 1 10:00–11:30'],
    ['hard', R, 'ATT C but on AVALON DUTY — medically down — reason: flu', 'Downchit + planned: AVALON DUTY 19:00–07:00 (ATT C). Reason: flu'],
    ['hard', R, 'Overseas Duty but on AVALON DUTY — overseas', 'Overseas + planned: AVALON DUTY 19:00–07:00'],
    ['hard', R, 'ATT C but standing SC SPARE — medically down, SC AM — reason: flu', 'Downchit + planned: SC SPARE on SC AM 07:00–13:00 (ATT C). Reason: flu'],
    ['hard', R, 'On leave but tasked — this duty row', 'On leave + planned: this duty row (no times yet)'],
  ]],
  brief: ['Brief and debrief', [
    ['adv', R, 'No time for the RU flight brief — BRIEFING sits inside 10:40–13:00 (brief 10:40)', 'Misses RU brief 10:40–13:00: BRIEFING 12:40–13:00'],
    ['adv', R, 'Not enough time to attend the VL BFM debrief — MEETING sits inside 14:30–16:30 (land + 2h)', 'Misses VL BFM debrief 14:30–16:30: MEETING 15:00–16:00'],
    ['adv', R, 'Not enough time to attend the VL BFM debrief — MEETING sits inside 12:00–14:00 (take-off + 2h, no landing typed)', 'Misses VL BFM debrief 13:00–15:00 (landing assumed): MEETING 13:30–14:00'],
    ['adv', R, 'No time for the OFT 1 brief — SODB sits inside 09:45–10:00', 'Misses OFT 1 brief 09:45–10:00: SODB 09:30–09:50'],
    ['adv', R, 'No time for the OFT 1 debrief — MEETING sits inside 11:30–12:00', 'Misses OFT 1 debrief 11:30–12:00: MEETING 11:45–12:30'],
    ['adv', R, 'No time for the VL BFM flight brief — BRIEFING, Meeting sits inside 09:40–12:00 (brief 09:40)', 'Misses VL BFM brief 09:40–12:00: BRIEFING 10:00–10:30, Meeting 11:00–11:30'],
  ]],
  turns1: ['Turns and rest (1 of 2)', [
    ['adv', R, 'Tight turn VL BFM→RU: 45 min land→next T/O (needs 120 min — threshold 120, dekit+step 30+60)', 'Tight turn: VL BFM → RU, 45 min (needs 120). VL BFM landing 14:15, RU T/O 15:00'],
    ['adv', R, 'Tight turn VL BFM→RU: 60 min take-off→next T/O, no landing typed (needs 120 min — threshold 120, dekit+step 30+60)','Tight turn: VL BFM → RU, 0 min (needs 120). VL BFM landing assumed 13:00 (T/O + 1h), RU T/O 13:00'],
    ['hard', R, 'Crew rest breach — Thu landed 21:30, +2h debrief assumed → ended 23:30 → crew rest clear at 11:30, but told to report 08:40 — only 9h10 rest.', 'Crew rest: Thu landed 21:30 + 2h debrief (assumed) → ended 23:30 → clear 11:30. Report 08:40: 9h10 rest, needs 12h.'],
    ['hard', R, 'Crew rest breach — Thu took off 20:30 with no landing typed, +2h debrief assumed → ended 22:30 → crew rest clear at 10:30, but told to report 08:40 — only 10h10 rest.','Crew rest: Thu T/O 20:30, landing assumed 21:30 (T/O + 1h) + 2h debrief (assumed) → ended 23:30 → clear 11:30. Report 08:40: 9h10 rest, needs 12h.'],
    ['hard', R, 'Crew rest breach — Thu ended 20:00 → crew rest clear at 08:00, but SC AM starts 07:00 — only 11h rest.', 'Crew rest: Thu duty ended 20:00 → clear 08:00. SC AM starts 07:00: 11h rest, needs 12h.'],
    ['hard', R, "Crew rest breach — Thu ended 20:00 → crew rest clear at 08:00, but SC AM's in-time is 06:00 — only 10h rest.", 'Crew rest: Thu duty ended 20:00 → clear 08:00. SC AM in-time 06:00: 10h rest, needs 12h.'],
    ['hard', R, 'Crew rest breach — Thu ended 23:30 → crew rest clear at 11:30, but his day starts 07:00 (MEETING) before the 08:40 report — only 7h30 rest.', 'Crew rest: Thu duty ended 23:30 → clear 11:30. Day starts 07:00 (MEETING), before report 08:40: 7h30 rest, needs 12h.'],
    ['hard', R, 'Crew rest breach — Thu ended 23:30 → crew rest clear at 11:30, but his day starts 07:00 (MEETING), and he is on a line with no take-off yet — only 7h30 rest.', 'Crew rest: Thu duty ended 23:30 → clear 11:30. Day starts 07:00 (MEETING): 7h30 rest, needs 12h. His flight has no T/O yet.'],
  ]],
  turns2: ['Turns and rest (2 of 2)', [
    ['hard', R, 'Crew rest breach — Thu ended 02:00 → crew rest clear at 14:00, but told to report 00:30 — 1h30 before his Thu duty ends.', 'Crew rest: Thu duty ended 02:00 → clear 14:00. Report 00:30: 1h30 before his Thu duty ends.'],
    ['hard', R, 'Crew rest breach — Thu ended 23:30 → crew rest clear at 11:30, but told to report 10:00 — only 10h30 rest. Late show — he still makes the 12:00 step.', 'Crew rest: Thu duty ended 23:30 → clear 11:30. Report 10:00: 10h30 rest, needs 12h. Late show: still makes the 12:00 step.'],
    ['hard', R, 'Crew rest breach — Thu ended 01:30 → crew rest clear at 13:30, but told to report 10:00 — only 8h30 rest. Late show cannot save it — the 12:00 step is still before rest clears.', "Crew rest: Thu duty ended 01:30 → clear 13:30. Report 10:00: 8h30 rest, needs 12h. Late show doesn't help: the 12:00 step is before rest clears."],
    ['adv', R, 'Tight turning — T/O 09:00 puts the 3h report at 06:00, inside 12h. Thu landed 19:30, +2h debrief assumed → ended 21:30 → crew rest clear at 09:30', 'Tight crew rest: the usual report (T/O 09:00 − 3h = 06:00) is before clear 09:30. Thu landed 19:30 + 2h debrief (assumed) → ended 21:30 → clear 09:30.'],
    ['note', R, 'Ranger has a long work day: 13h20, 06:00 → 19:20 (last landing 17:20 + 2h debrief assumed)', 'Long day: 13h20 (limit 12h), 06:00 → 19:20 (last landing 17:20 + 2h debrief assumed)'],
    ['note', R, null, 'Long day: 13h20 (limit 12h), 06:00 → 19:20 (VL BFM landing assumed 17:20 + 2h debrief assumed)'],
    ['hard', R, 'Ranger is on the programme 8 days in a row — 7 is the limit, so a break day is due', 'Days in a row: 8 (limit 7). A break day is due.'],
    ['adv', R, '1 person is double turning: Ranger', '1 person is double turning: Ranger'],
  ]],
  crew1: ['Who may fly with whom, and in which seat (1 of 3)', [
    ['adv', VJ, 'Viper (OCU pilot) with Jinx (OCU WSO) in VL BFM — a crew solo, only allowed under the Basic Course Syllabus', 'Crew solo: OCU pilot Viper & OCU WSO Jinx on VL BFM (T/O 12:00). Only allowed under the Basic Course Syllabus.'],
    ['hard', VJ, 'OCU pilot Viper with CAT C WSO Jinx — not an authorised combination (VL BFM)', 'Crew not authorised: OCU pilot Viper & CAT C WSO Jinx on VL BFM (T/O 12:00). An OCU needs an instructor in the other seat.'],
    ['adv', VJ, 'CAT D pilot Viper with CAT C WSO Jinx in VL BFM — CO approval required', 'CO approval needed: CAT D pilot Viper & CAT C WSO Jinx on VL BFM (T/O 12:00)'],
    ['adv', 'Tan', 'Tan is riding the rear seat of VL BFM as an incentive passenger — this crew pairing needs approval', 'Approval needed: incentive passenger in the rear seat of VL BFM (T/O 12:00)'],
    ['adv', 'Viper', 'OCU in VL BFM with no IP', 'OCU with no IP: VL BFM (T/O 12:00)'],
    ['hard', 'Viper', 'IRT in VL BFM with no IR examiner', 'IRT with no IR examiner: VL BFM (T/O 12:00)'],
    ['hard', 'Viper', 'IRT remarks on VL BFM with no IR examiner', "IRT with no IR examiner: VL BFM (T/O 12:00), IRT in an aircraft's remarks"],
  ]],
  crew2: ['Who may fly with whom, and in which seat (2 of 3)', [
    ['hard', 'Tan', 'Tan is ground crew — cannot fly a front seat (VL BFM)', 'Wrong seat: ground crew in the front seat of VL BFM (T/O 12:00)'],
    ['hard', 'Jinx', 'Jinx is a WSO — cannot fly FCP (VL BFM)', 'Wrong seat: a WSO in the front seat of VL BFM (T/O 12:00)'],
    ['hard', 'Jinx', 'Jinx is CAT IW — a WSO category, cannot fly FCP (VL BFM)', 'Wrong seat: CAT IW (a WSO category) in the front seat of VL BFM (T/O 12:00)'],
    ['hard', 'Jinx', 'Jinx is a WSO — cannot fly FCP (SC AM MAIN)', 'Wrong seat: a WSO in the front seat of SC AM MAIN 07:00–13:00'],
    ['hard', 'Jinx', 'Jinx is a WSO — cannot take the front seat (OFT 1)', 'Wrong seat: a WSO in the front seat of OFT 1 10:00–11:30'],
  ]],
  crew3: ['Who may fly with whom, and in which seat (3 of 3)', [
    ['hard', R, 'SC DAY currency needed for SC AM MAIN (07:00–13:00) — Ranger is not current', 'Not SC DAY current: SC AM MAIN 07:00–13:00'],
    ['hard', VJ, 'SC NIGHT currency needed for SC PM (19:00–01:00) — Viper, Jinx are not current', 'Not SC NIGHT current: SC PM 19:00–01:00'],
    ['hard', 'Viper', 'Viper is not DAAR current — VL BFM remarks call for day AAR', 'Not DAAR current: VL BFM (T/O 12:00) remarks call for it'],
    ['hard', 'Jinx, Viper', 'Jinx is not cleared to instruct DAAR — Viper is not DAAR current and VL BFM remarks call for day AAR', 'Jinx is not cleared to instruct DAAR. Viper is not DAAR current and VL BFM (T/O 12:00) remarks call for it.'],
    ['adv', R, 'Ranger planned for VL BFM — not offering flying today', 'SANS: not offering flying today. Planned on VL BFM (T/O 12:00)'],
    ['adv', R, 'Ranger planned for VL BFM — available 08:00–12:00 only', 'SANS: available 08:00–12:00 only. Planned on VL BFM (T/O 13:00)'],
  ]],
  oil1: ["A line's own times, and OIL (1 of 2)", [
    ['adv', '', 'VL BFM takes off and lands at the same time (12:00) — one of the two is wrong; the day still earns from the report and debrief', 'Times look wrong: VL BFM T/O and landing are both 12:00. The day still earns OIL from the report and debrief.'],
    ['adv', '', 'SC AM MAIN takes off and lands at the same time (09:00) — one of the two is wrong; the shift still earns from its R or B', 'Times look wrong: SC AM MAIN T/O and landing are both 09:00. The shift still earns OIL from its R or B.'],
    ['adv', '', 'SC PM MAIN takes off and lands at the same time (19:00) — one of the two is wrong; a shift with no length earns nobody any OIL until it is fixed', 'Times look wrong: SC PM MAIN T/O and landing are both 19:00. A shift with no length earns nobody any OIL until it is fixed.'],
    ['adv', '', 'RU takes off and lands at the same time (13:00) — one of the two is wrong; with no report before it and no debrief after it, the line earns nobody any OIL until it is fixed', 'Times look wrong: RU T/O and landing are both 13:00. With no report before it and no debrief after it, the line earns nobody any OIL until it is fixed.'],
    ['adv', '', 'SC AM MAIN flies but has no END — type it so its crew rest and OIL can be worked out', 'SC AM MAIN flies but has no END. Type it so its crew rest and OIL can be worked out.'],
    ['hard', '', 'SC AM has no usable times — nobody on it earns OIL for this day', 'SC AM has no usable times, so nobody on it earns OIL for this day'],
  ]],
  oil2: ["A line's own times, and OIL (2 of 2)", [
    ['adv', '', 'There is no leave war period for Jul 26, so no OIL can be earned for this day — create the period on the Leave War', 'No Leave War period for Jul 26, so no OIL can be earned for this day. Create the period on the Leave War.'],
    ['adv', '', 'This day is not published yet, so nobody earns their OIL for it — publish it before the day is out', 'Not published yet, so nobody earns OIL for this day. Publish it before the day is out.'],
    ['adv', '', 'This day was published before the app counted who is behind an ALL AVAIL puck on a duty desk, a sim or an extras line — publish it again to credit them', 'This day was published before the app counted who is behind an ALL AVAIL puck on a duty desk, a sim or an extras line. Publish it again to credit them.'],
    ['adv', '', 'Publish this day again so OIL is earned. The PH was set after the day was published.', 'Publish this day again so OIL is earned. The PH was set after the day was published.'],
    ['adv', '', 'Publish this day again to withdraw the OIL. The PH was removed after the day was published.', 'Publish this day again to withdraw the OIL. The PH was removed after the day was published.'],
    ['hard', '', 'RU: RALLY 09:00 is later than BRIEF 08:40.', 'RU: RALLY 09:00 is later than BRIEF 08:40.'],
    ['hard', '', 'RU: reporting line 2 has no recognised clock. Check the time.', 'RU: reporting line 2 has no recognised clock. Check the time.'],
  ]],
}
const only = (process.env.ONLY || '').split(',').filter(Boolean)
const keys = w.phone ? Object.keys(F) : ['turns1', 'turns2']
await X.board(w, 0)
await X.openWarn(w)
if (!w.phone) X.say('checks panel grown to', await X.growWarn(w))
let n = 0
const nums = { clashes: 'b1', standby: 'b2', leave: 'b3', brief: 'b4', turns1: 'b5', turns2: 'b5', crew1: 'b6', crew2: 'b6', crew3: 'b6', oil1: 'b7', oil2: 'b7' }
for (const k of keys) {
  if (only.length && !only.includes(k)) continue
  const [title, rows] = F[k]
  for (const state of ['today', 'proposed']) {
    const draw = rows.filter(r => state === 'proposed' || r[2] !== null).map(([sev, prefix, t, p]) => ({ sev, prefix, words: state === 'today' ? t : p }))
    await X.drawRows(w, draw, { nowrap: state === 'proposed' })
    const file = `${nums[k]}-${k}-${state}-${P}.png`
    const s = await X.shotList(w, file)
    await X.assertDrawn(w, draw)   // the app did not redraw the list under the picture
    const rd = await X.readWarn(w)
    const left = rows.filter(r => r[2] === null).map(r => r[3])
    man({ file, family: title, state, kind: 'drawn (cloned real rows of Monday\'s list; words = the proposal\'s example values)', size, header: rd.head,
      rows: rd.rows.map(x => x.text), sev: rd.rows.map(x => x.sev), lines: rd.rows.map(x => x.lines), tooTall: s.tooTall,
      notes: state === 'today' && left.length ? 'no line today for: ' + left.join(' | ') : '' })
    X.say(file, rd.rows.map(x => x.lines + ' ' + x.text.slice(0, 50)))
    n++
  }
}
X.say('B done', n)
await w.browser.close()
