# Code read of round 4 of the words pass (D2521) — the fresh, blind Fable reader, 24 Nov 26

(Saved by the host, chat 170, unchanged below the line. **Who:** a fresh Fable helper of chat 170 (the Agent tool, model fable), working only inside the copy. **What it read:** an exported copy of commit
`68ab6d1db` at `D:/rw4/read-copy` (`git archive`, no pictures), from which the round's evidence sheet, the two scenario
lists, the scenario and walk briefs, the walkers' reports and scripts and the branch's handoff block were taken out; the
brief `2026-11-24-words-r4-read-brief.md` as `BRIEF.md`, the change as `FIX-DIFF.patch`. **Blind to:** the walk, the
scenario lists and the other two readers — all three started together at 18:45 and wrote outside the checkout. **Its
report file was last written at 19:00.** Each claim's disposition: the evidence sheet
`raptor-port/docs/handpass/2026-11-24-words-r4-build.md` §13.)

---

FABLE'S BLIND READ — round 4 of the words pass (D2521) — 24 Nov 26
(No handoff block was pasted into this reader's context; HANDOFF.md not read. No file of the copy changed; each proof
test was copied under src/ as zy-proof-*, run alone and removed. Proofs kept in D:\rw4\reads\fable-scratch\.)

FINDINGS

F1. THE PUBLISH NOTE'S NO-PERIOD SENTENCE IS STILL JOINED BY THE DOT — NOT "A SENTENCE OF ITS OWN" (D2521 S2). Medium.
    The join is as on main; this change swapped the words only, so what he approved is not what the app says.
  Steps: load a week of a year with no Leave War period (07/02/2028), sign and publish Saturday 12 Feb.
  Shows (run): (a) "Saturday published and approved · No Leave War period for 2028, so no OIL can be earned for this
    day. Create the period on the Leave War."  (b) with a ground-programme row holding a man and no times (or an input
    with no OIL answer): "Saturday 12 Feb published and approved. The ground programme has no usable times, so nobody
    on it earns OIL. · No Leave War period for 2028, so no OIL can be earned for this day. Create the period on the
    Leave War." — a full stop and then the joining dot.
  Ruled — the page he approved (docs/mock/2026-11-24-words-r4/index.html, S2 "New"): "Saturday published and approved.
    No Leave War period for 2028, so no OIL can be earned for this day. Create the period on the Leave War."; the words
    brief: "Joined after another line it follows as its own sentence, as the unanswered-OIL line does."
  Cause: leavewar/sync.ts publishFlagsBids, the `if (!war)` exit — the sentence goes onto `lines` with no `part` of its
    own (alone: `told` is undefined) or rides in `after`; ui/toast.ts toastBatch joins a part-less note and every `after`
    with ' · '. leavewar/oilsync.test.ts swaps HOOKS.toast for a collector, so no test sees the join.
  Fix: 1. `const np = `No Leave War period for ${iso.slice(0, 4)}, so no OIL can be earned for this day. Create the period on the Leave War`` (no last stop: toast.ts `sentence` adds it); `lines.push(np + '.')`.
       2. `const t2 = told ? { ...told, body: `${told.body}. ${np}` } : { head: WEEKDAY_NAMES[weekday(iso)], body: np }`
       3. `HOOKS.toast(lines.join(' · '), 'warn', { day: di, ...t2, after: lines.slice(joined, -1).join(' · ') }); return`
       4. the blind line's second form ("… earned nobody any OIL — …", no `told`) and an amendment's receipt ("Published
          AL1 · …", no part) still meet it with the dot: decide those two and pin all shapes through toastBatch.
  Failing test (leavewar/oilsync.test.ts, in 'publishing a day no leave war period covers says so'; jsdom; add
    `import { toast, toastBatch } from '../ui/toast'`):
    it('joined to the publish note it is a sentence of its own (D2521 S2)', () => {
      setRole('admin'); installAbsenceDoor(); loadWeek('07/02/2028')
      const sat = DATES.findIndex((d: any) => /Feb 12/.test(String(d)))
      ;(DAYS[sat] as any).ground = [{ prog: 'SDO', str: '0800', end: '1800', who: 'plasma' }]
      const real = HOOKS.toast; HOOKS.toast = toast as any
      try { toastBatch(() => { publish(sat); publishFlagsBids(sat) }) } finally { HOOKS.toast = real }
      const shown = String(document.getElementById('toastEl')!.textContent)
      expect(shown).toBe('Saturday published and approved. No Leave War period for 2028, so no OIL can be earned for this day. Create the period on the Leave War.')
    })   // (b): add the row { prog: 'Brief', str: '', end: '', who: 'bane' } and expect(shown).not.toMatch(/\. · /)
  Proofs, both failing: zy-proof-publish-join.test.ts, zy-proof-publish-join2.test.ts.

F2. A NAME DRAGGED FROM THE CREW LIST ONTO THE SEAT THAT MAN ALREADY HOLDS SAYS NOTHING — the tap's true twin has no
    words (D2521 Q4b: "a drag onto the seat a man holds answers 'Ranger — already in that seat', as the tap's does").
    Low-medium. Was so on main (silent there too); the change gave the words only to a seat's puck dropped on itself.
  Steps: Edit Schedule, a duty seat holding Sidewinder; drag "Sidewinder" from the crew list (or the day's
    Available-crew pucks) onto that seat. Shows: no note at all (run: toasts = [], nothing written, no Undo step).
    The tap — arm the seat, tap his name on the list — says "Sidewinder — already in that seat" (state/view.ts placeArmed).
  Cause: ui/drag.ts applyDrop — the words sit only in the last `else` (a seat's puck, DRAG.key === targetKey). A
    crew-list drag takes the `DRAG.kind === 'roster'` branch: rowTwice lets his own place pass, setSlotVal writes the
    same value and done() ends as a landed drop with no word.
  Fix: 1. lift the last else's body into `const same = () => { const seat = …; const v = slotVal(targetKey), who = …; DRAG = null; dndOff(); landOn(seat); toast(`${who} — already in that seat`); return false }`
       2. roster branch, first line: `if (slotVal(targetKey) === DRAG.id) return same()`   3. the else: `return same()`
       4. ui/noteswords.test.ts pins the drag's words once in ui/drag.ts — keep it one template.
  Failing test (ui/drag.test.tsx, beside "the man already in the seat, dropped back"):
    it('his name dragged from the crew list onto the seat he holds says so, as the tap does (D2521 Q4b)', async () => {
      const seat = $('#eWeek .seat[data-slot^="d:"][data-drag]'), key = seat.dataset.slot!, before = slotVal(key)
      const src = $$('#eRoster .rpuck[data-person]').find(x => x.dataset.person === before)!
      toasts = []
      await dnd(src, $(`#eWeek .seat[data-slot="${key}"]`))
      expect(toasts).toEqual([`${PEOPLE[before].cs} — already in that seat`]); expect(slotVal(key)).toBe(before)
    })
  Proof, failing: zy-proof-roster-same-seat.test.tsx.

F3. A CHANGE OF KIND ALONE SAYS A PHANTOM "NOW …" WHEN THE NEW KIND ADDS OR DROPS THE AM / PM LABEL. Low.
    (a) was so on main in the old words; (b) is new in its words and now hides a real change behind "and 1 more change".
  (a) Ranger's morning LL on Wed 15 Jul; Saber changes only its kind to Training (the window clears just the half —
    ui/InputWindow.tsx `hasHalf(t) ? {} : { half: '' }`; the hours stay 00:00–12:00). Bell: "Training · Wed 15 Jul —
    Now 00:00–12:00, LL changed to Training · Saber" — nobody moved its hours, and the clock times are back.
  (b) a Training titled "Range brief", 00:00–12:00, changed to LL. Bell: "LL · Wed 15 Jul — Now LL (AM), Training
    changed to LL, and 1 more change · Saber" — one change said by two parts; the title that went is pushed out of sight.
  Cause: state/notices.ts common — `time = hours(b) !== hours(a)`; `hours()` ends with the half's label, which is worked
    out from the kind (inputedit.tsx normalizeInputDraft: `hasHalf(draft.type) && halfOf(s, e)`), so the kind alone flips it.
  Fix: 1. `const clock = (r: any) => (r.allday ? 'all day' : `${hhmm(r.s ?? 0)}–${hhmm(r.e ?? 0)}`)`
       2. `const time = clock(b) !== clock(a) || (kindOf(b) === kindOf(a) && (b.half || '') !== (a.half || ''))`
       3. `half` and `at` stay as they are (they read `time`).
  Failing tests (ui/bellnotices.test.tsx, in 'round 4 of the words pass: the bell'):
    it('a morning LL made a Training says only the kinds', async () => {
      await boot()
      expect(commitInput(null, LEAVE({ allday: false, half: 'am', sTime: '00:00', eTime: '12:00' }), [RANGER])).toBe(true); clear()
      expect(commitInput(leave(), { ...draftOf(leave()), type: 'Training', half: '' }, [RANGER])).toBe(true)
      expect(told(RANGER)).toEqual([`Training · Wed 15 Jul — LL changed to Training · ${cs(SABER)}`])
    })
    it('a Training 00:00–12:00 made an LL: the kinds and the title that went', async () => {
      await boot(); file([RANGER], WED, { sTime: '00:00', eTime: '12:00' }); clear()
      expect(commitInput(rec(), { ...draftOf(rec()), type: 'LL' }, [RANGER])).toBe(true)
      expect(told(RANGER)).toEqual([`LL · Wed 15 Jul — Training changed to LL, renamed — was ${TITLE} · ${cs(SABER)}`])
    })
  Proof, both failing: zy-proof-bell-f3.test.tsx.

EXPLICIT NEGATIVES — checked, nothing found
1. The new part kind and fields: a bell part's kind is branched on only in state/notices.ts (partWords, firstTwo,
   noticeAboutHim's in / out / rbid) and in perms.ts' set of the war's kinds. The gate (lineMalformed, lineRewritten,
   inputLineUnlike, toldBy, filerMarkOk, the member section, the posting pass's section) never reads an input line's
   kinds or fields; Undo / Redo restore whole lines; read marks go by id; persist.ts loads any row with to / at / what.
   Nothing drops, rewrites or refuses a line for `kind`, `h`, `c` or `now`. All fall through rightly.
2. common, run through the window and the in-place boxes (probe.log): LL→OL; titled Training→Meeting; a title equal to
   the new kind's name in any capitals; a title starting with its kind; ATT C; Other titled "Training" and back; a
   title that does not come back after LL→Training; an Attach's To changed, dropped by a kind change, not restored.
   The three "Renamed" cases of the builder's stated reading behave as recorded — note that with Q3's count the To a
   kind change drops now reads "Taken out of Unavailable, Attach changed to Training, and 1 more change".
3. The half: the window's AM / PM, typed hours equal to a half's, the end box (all day → 1200 → 1300 → 12:00), a kind
   with no half, a multi-day half ("Now Wed 15 Jul – Fri 17 Jul (PM)"), a man's part split from a shared input. A day
   moved with the half unchanged says "Now Thu 16 Jul" with no (AM) — the half did not change; as hours always were.
4. firstTwo: the same lines reach it as reached the old cut (holiday, war and posting lines return before it); one,
   two, three parts; "You", a callsign, "3 people", a kind keep their capital; rbid said after and not counted. An old
   saved line of three parts now also reads "…, and 1 more change" with its second part in small letters — by design.
5. Saved lines: {when, t:'00:00–12:00 am'} and {title, was:'LL'} read as before; new lines survive the history
   snapshot and a reload whole.
6. Times: setInpField names the typed box ("25:00 …", " 9am " trimmed to "9am …"); every other hmOK caller (schedule
   box, duty template, wave template) says the same sentence. The window's boxes are type="time", so its sentence is
   reached only by a hand-made draft; "Give the input a start and end time, or tick All day" still answers an empty box.
   The drag's note can name an id, or nobody, only for a seat holding an id with no person (corrupt data) — not shown.
   Look-ahead note: 1 week, N weeks, with and without "to Sunday" — right. One day a publish command: no two days at once.
7. Old words: none left in src, e2e or scripts for the eight sentences. Left as they were, outside the ruling's three
   places: "A leave war already covers part of …" (ui/interactions.ts) and "leave period" twice in ui/HolidaysPanel.tsx.
8. Roles: every changed line is words only; no refusal moved. Existing files run green: bellnotices, bellnotices-
   scenarios, noteswords, halfampm, m4ride.

TIDINESS NOTE (filed, not fixed)
- Duplicated: the no-period sentence is typed whole in engine/validate.ts and leavewar/sync.ts, held together only by
  noteswords.test.ts; "— already in that seat" in drag.ts and view.ts; lookaheadSavedNote repeats lookaheadLabel's logic.
- Dead: partWords' "Now AM" (no kind that takes a title offers a half — only the hand-made test line reaches it); `c`
  stored on a `when` whose day moved too (never read); the `p &&` guard in noticeWords (the `rb` filter one line above
  would already throw on a null part).
- Misleading: `ownName` returns the separator too (" · 145 Sqn") — it is "the label less its kind"; `c` on `when` is
  a kind while `c` on rbid / lw is a Leave War code; schema.ts NoticePartRec lists only some of the kinds.
