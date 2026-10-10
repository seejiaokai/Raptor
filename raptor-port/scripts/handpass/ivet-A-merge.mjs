// WALKER A — merges the five part files into ivet-A.json and ivet-A.md
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
const P = 'docs/handpass/parts/'
const rows = []
for (const k of [1, 2, 3, 4, 5]) rows.push(...JSON.parse(readFileSync(`${P}ivet-A-part${k}.json`, 'utf8')))
rows.sort((a, b) => a.n - b.n)
const errs = new Set()
for (const k of [1, 2, 3, 4, 5]) for (const e of JSON.parse(readFileSync(`${P}ivet-A-part${k}-errors.json`, 'utf8'))) errs.add(e)
const extras = [
  { what: 'The saved row stays lit after a column heading is pressed, and after a hiding filter (Person, Type or search) is cleared back — the row only goes out of the lit state when a filter change hides it again (then it is simply not in the list). The brief says it "lets go when a filter or a column heading is next touched". Six cases, one fresh world each (ivet-A-extra2.mjs): heading Start, heading Name, Person Wisp→Everyone, Type LL→All types, search cleared: all stay lit (1→1). Host to judge whether "lets go" meant the pinned reveal rather than the light.', pics: ['X-desk-after-person-change.png', 'X-phone-after-person-change.png'] },
  { what: 'Scenario 1: Astra\'s text says the fresh kind is Duty; the screen opens on Training, as the brief\'s list says. Followed the brief.', pics: ['S1-phone-window.png'] },
  { what: 'Scenarios 4 and 15: the refusal words match the scenarios but without the final full stop ("Pick a start date on the calendar first", "Give the input a start and end that are not the same time", "Give the input a start and end time, or tick All day"). Judged PASS; flagged in case the full stop matters.', pics: ['S4-desk-Upchit-stiff.png', 'S15-phone-missing-time.png'] },
  { what: 'The "?" card lists "SANS Availability" (last entry) although no SANS kind can be picked in this window; and Training, Personal, Appointment, Duty, Event and Other have a name but no words beside them.', pics: ['S16-new-card-end.png'] },
  { what: 'Turning a one-day LL draft (AM chosen) into Duty keeps the AM hours as visible Duty hours (12:00 am – 12:00 pm) and the automatic remark "till 27 Jul" stays in Remarks of a one-day Duty; saved with no half-day mark.', pics: ['S2-desk-AM-then-Duty.png'] },
  { what: 'The OIL question for a two-person weekend duty is titled "OIL — Ranger +1, Duty": it does not name the second person.', pics: ['S19-phone-two-question.png'] },
  { what: 'Phone pictures show a pale teal block painted over a window where the finger had pressed the card or button underneath (the tap highlight stays on): S1-phone-window (over the Person box), S19-phone-yes-reopened (over the calendar). Probably the emulation, not the app; not judged.', pics: ['S1-phone-window.png', 'S19-phone-yes-reopened.png'] },
  { what: 'A member\'s Inputs list opens with the Person filter already on himself ("Ranger", a filter badge and "Clear filters" on a phone), so an input he files for Echo is hidden until the filter is cleared (it is then brought in and lit by the save, as intended).', pics: ['S3-phone-saved-lit.png'] }
]
const out = { walker: 'A', build: 'http://localhost:4231/', date: '2026-10-10', share: '1-19', counts: { PASS: rows.filter(r => r.status === 'PASS').length, FAIL: rows.filter(r => r.status === 'FAIL').length, 'NOT RUN': rows.filter(r => r.status === 'NOT RUN').length, ERROR: rows.filter(r => r.status === 'ERROR').length }, rows, errors: [...errs], extras }
writeFileSync(`${P}ivet-A.json`, JSON.stringify(out, null, 1))
const short = {
  1: 'List: one filled "+ Input" first in the tools row, left of the dates button, no form. Window: "pick a start date", Saber, Training (not Duty — brief wins), Add, no instruction line.',
  2: 'Three groups Leave / Medical / Duty & other commitments, no SANS kind. LL: span buttons only; ATT C: span + Document; Duty: title + hours. AM draft turned to Duty: no span control, saved with no half-day; ATT C turned to Meeting: no Document row, no document question, saved with 0 documents.',
  3: 'One input saved for Ranger: Meeting "A3 briefing" 27 Jul 10:00-11:00, remark "Bring ID"; window closed, card on screen and lit, light gone after 6 s; reopened shows the same values.',
  4: 'Duty, ATT C, Upchit and ALL AVAIL Duty each: toast "Pick a start date on the calendar first", no question sheet, nothing saved (52 -> 52), window open with person, kind and remark kept.',
  5: 'Setting on (box ticked, survived the second sign-in). Ranger filed Duty for Echo 27 Jul: saved for Echo, filer Ranger, card says "By Ranger"; reopened "Placed by Ranger for Echo", Save present; changed remark saved, still Echo / Ranger.',
  6: 'Setting off. Ranger\'s new window shows only himself (plain name, no list, no Several people, no ALL / ALL AVAIL) for Duty, Meeting and Event. Echo duty he filed earlier opens read-only (no Save, no Delete, "Only Echo or an admin can change this."). His own meeting stays editable and saved a change.',
  7: '(a) Echo/Duty draft turned to LL: notice "You can file leave only for yourself" with "File it for me only"; Add said the same, person still Echo, nothing created. (b) Saved Echo duty turned to LL then Save: same refusal, original still Echo Duty 5 Aug. No LL for Ranger.',
  8: 'Three runs: Ranger+Echo (filer left out), four with filer (Saber, Wisp, Ace, Ranger), four without (Wisp, Ace, Vapor, Echo), picked out of order. Each one shared input: every person once, filer Saber, row names them A to Z, reopened shows the whole group.',
  9: 'Saber: two-person LL saved (Echo + Saber, one group). Saber: Meeting for two turned to ATT C: words "A medical entry is filed for one person at a time — each needs its own document" and "Keep Saber only"; Add refused, nothing saved, both people still ticked. Ranger: two-person LL refused ("only for yourself"); Meeting for two turned to ATT C refused ("only for yourself"); nothing saved.',
  10: 'ALL AVAIL Duty, ALL Event, ALL AVAIL Training, ALL Meeting, ALL AVAIL Appointment, ALL Other, one day each, all saved by Ranger as ONE record each (no group), reopened as "ALL AVAIL" / "ALL" with kind, title, hours 09:30-10:45 and "Placed by Ranger". The Person filter has separate entries ALL AVAIL, ALL and Everyone; ALL AVAIL showed 4 rows.',
  11: 'ALL AVAIL and ALL, two days: "ALL AVAIL is filed one day at a time" / "ALL is filed one day at a time", draft kept. Turned to LL: notice and Add refusal "ALL AVAIL can be filed only for Training, Meeting, Appointment, Duty, Event or Other". Several people with a placeholder: "ALL AVAIL is filed on its own — it already stands for whoever is free", no person ticked, placeholder kept. Nothing saved.',
  12: 'Ridge archived on Admin -> Users. Saber\'s new window has a "Posted out / archived" group with Ridge; Meeting 5 Aug saved for him, reopened as Ridge. Ranger\'s Person list: no such group, Ridge not listed.',
  13: 'Taps 27, 29: "Jul 27 -> Jul 29"; 29 again: "Jul 29"; 27 (backwards): "Jul 27", no inverted range; 30: "Jul 27 -> Jul 30", remark "till 30 Jul". Saved LL 27-30 Jul, remark "till 30 Jul".',
  14: 'Own LL: All day (no hours shown, saved all-day), AM (00:00-12:00, half am), PM (12:01-23:59, half pm), Custom 09:15-11:45 (kept); each reopened on its own button. AM draft turned to Duty: span buttons gone, hours still visible, saved Duty with no half-day mark.',
  15: 'Overnight Duty 22:00-02:00 saved and reopened as typed. 10:00-10:00: "Give the input a start and end that are not the same time" (no full stop), nothing saved. Start cleared: "Give the input a start and end time, or tick All day" (no full stop), nothing saved. Custom LL 22:00-02:00 saved and reopened on Custom as typed.',
  16: 'New and saved window: card "What each type means" with all three groups and every kind, the ATT B exception, last entry scrolls to above the buttons, Add reachable; "?" again, a press on Remarks and Escape each close only the card; window and typed remark kept.',
  17: 'Event "A17 sports afternoon" + remark "Bring trainers" and Other "A17 other thing" + same remark: saved and reopened with title, kind and remark apart; the card line reads title then remark, no repeated kind in the remark. Event turned to LL: no title box. Title cleared on a saved Event: saved, card shows kind "Event" and the remark.',
  18: 'Own Duty Sat 18 Jul 06:00-18:00 as Ranger: question "OIL — Ranger, Duty … 18 JUL (WEEKEND / PH) Does it deserve FO"; its Cancel: window open, remark kept, nothing saved; Add again: asked again, same words.',
  19: 'Ranger own Duty Sat 18 Jul Yes: saved with OIL 1, reopened "credited on its non-working day". Sun 19 Jul No: OIL 0, reopened "no OIL on its non-working day". Two-person Saturday 1 Aug (Ranger + Echo): one question, Yes saved OIL 1 for BOTH, one group.'
}
let md = `# Walker A — the design vet's walk, scenarios 1-19 (10 Oct 26)

Server http://localhost:4231/ (frozen build). Scripts \`raptor-port/scripts/handpass/ivet-A-*.mjs\`; pictures \`raptor-port/docs/img/handpass/2026-10-10-inputs-vet-check/A/\`.
**Counts: ${out.counts.PASS} PASS, ${out.counts.FAIL} FAIL, ${out['counts']['NOT RUN']} NOT RUN, ${out.counts.ERROR} script errors (of 19).** Sizes and roles by the brief's rule (odd = phone, even = desktop; number mod 4 of 0/1 = admin, 2/3 = member), except 5, 6, 7, 10, 11, 19 (a member with Saber's setting), 9 and 12 (both roles in turn).

| # | Size | Role | Result | What the screen said | Pictures |
|---|---|---|---|---|---|
`
for (const r of rows) md += `| ${r.n} | ${r.size} | ${r.role} | ${r.status} | ${(short[r.n] || r.said).replace(/\|/g, '/')} | ${r.pics.join(', ')} |\n`
md += `\n## Setups worth knowing\n- 5, 6, 7, 9, 10, 11, 12, 19 each used its own world opened WITHOUT ?fresh=1; Saber made one saved change (Members may file duties for others on, plus an input of his own), the page was reloaded and Ranger signed in. 6 reloaded twice (Saber switched the box off between).\n- 8 was walked as the admin only (an admin does not need the member setting).\n- Archiving a man (12) went through Admin -> Users -> Archive, as the host's walk did.\n\n## Anything that looked wrong or odd, outside the scenarios\n`
for (const e of extras) md += `- ${e.what} (${e.pics.join(', ')})\n`
md += `\n## Errors seen\n${out.errors.length ? out.errors.map(e => '- ' + e).join('\n') : 'None: no console error, no page error, no 4xx across every run.'}\n\n## Pictures\n${readdirSync('docs/img/handpass/2026-10-10-inputs-vet-check/A').length} saved; 22 opened and looked at (the ones behind the OIL, medical, role and refusal scenarios first).\n`
writeFileSync(`${P}ivet-A.md`, md)
console.log(out.counts, errs.size)
