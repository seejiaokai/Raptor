# Code read of round 4 of the words pass (D2521) — the fresh, blind Opus reader, 24 Nov 26

(Saved by the host, chat 170, unchanged below the line. **Who:** a fresh Opus helper of chat 170 (the Agent tool, model opus), working only inside the copy. **What it read:** an exported copy of commit
`68ab6d1db` at `D:/rw4/read-copy` (`git archive`, no pictures), from which the round's evidence sheet, the two scenario
lists, the scenario and walk briefs, the walkers' reports and scripts and the branch's handoff block were taken out; the
brief `2026-11-24-words-r4-read-brief.md` as `BRIEF.md`, the change as `FIX-DIFF.patch`. **Blind to:** the walk, the
scenario lists and the other two readers — all three started together at 18:45 and wrote outside the checkout. **Its
report file was last written at 18:53.** Each claim's disposition: the evidence sheet
`raptor-port/docs/handpass/2026-11-24-words-r4-build.md` §13.)

---

READ OF ROUND 4 OF THE WORDS PASS (D2521) — fresh, blind Opus reader, 24 Nov 26
(No compaction happened during this read; no handoff block was pasted.)

FINDING 1 — the no-period sentence is glued on with ". ·" after the day's blind line, not "a sentence of its own"
  New with this change? The ". ·" glue is old (main said "…earns OIL. · there is no leave war period…"); what is new is
  that S2's answer promised "Joined after another line it follows as its own sentence, as the unanswered-OIL line does"
  (briefs/2026-11-24-words-r4-draft.md, S2 doubts 14/15) and the build does not do it.
  Steps: a 2028 Saturday (no Leave War period) whose ground programme has one desk with usable times (SDO 0800–1800,
  plasma) and one with none (RUNNER 0900–0900, bane); sign it and publish it.
  Screen (proved, real toastBatch + real toast element):
    "Saturday 12 Feb published and approved. The ground programme has no usable times, so nobody on it earns OIL. ·
     No Leave War period for 2028, so no OIL can be earned for this day. Create the period on the Leave War."
  Against the promise: "…earns OIL. No Leave War period for 2028, …" — a full stop, then the sentence; never ". ·".
  Cause: leavewar/sync.ts publishFlagsBids pushes the sentence into `lines`; `told` (the blind line's head/body) folds
  only the unanswered line into its body, so the no-period sentence rides in `after` and ui/toast.ts toastBatch joins
  `after` with ' · ' behind a body that sentence() has already closed with '.'.
  Fix: in publishFlagsBids's no-war branch, when `told` exists, fold the sentence into told.body as the unanswered line
  is folded — told.body = `${told.body}. No Leave War period for Y, so no OIL can be earned for this day. Create the
  period on the Leave War` (no closing stop: sentence() adds it) — and leave it out of `after` (raise `joined` by one);
  the plain `lines.join(' · ')` message for the un-batched path can stay. Same for the unanswered-only form (told from
  `open`, no blind line). Leave the part-less case (the only line) as built: it matches his approved picture
  ("Saturday published and approved · No Leave War period for 2028, …", facts.json s2-no-period-after).
  Failing test (leavewar/, jsdom; setup as oilsync.test.ts's beforeEach):
    installAbsenceDoor(); loadWeek('07/02/2028'); const sat = DATES.findIndex(d => /Feb 12/.test(String(d)))
    ;(DAYS[sat] as any).ground = [{ prog:'SDO', str:'0800', end:'1800', who:'plasma' }, { prog:'RUNNER', str:'0900', end:'0900', who:'bane' }]
    HOOKS.toast = toast; HOOKS.toastBatch = toastBatch      // ui/toast's own
    sign(sat); HOOKS.toastBatch(() => { setDayApproved(sat, true); publishFlagsBids(sat) })
    expect(document.getElementById('toastEl')!.textContent).toContain('earns OIL. No Leave War period for 2028')

FINDING 2 (low) — a change of KIND alone that makes or unmakes a half also says "Now …", as if the hours moved
  New with this change? The shape is old (main said "Now 00:00–12:00 am, renamed — was Training"); this round's words
  carry it on ("Now LL (AM), Training changed to LL"). Brief item 2 asks for exactly this pair.
  Steps (proved through state/notices.ts common + noticeWords, and reachable by the window: its kind picker keeps the
  hours on an edit, ui/InputWindow.tsx, and normalizeInputDraft derives the half from them): Ranger's Training
  00:00–12:00, a scheduler changes only its Type to LL → bell "Now LL (AM), Training changed to LL · Saber" ("LL" said
  twice, the first of the two slots spent on an hours change nobody made). Reverse: LL (AM) → Training → "Now 00:00–12:00,
  LL changed to Training" (same clock hours as before).
  Cause: common's `time = hours(b) !== hours(a)` — hours() appends r.half, and the half follows the kind
  (normalizeInputDraft: half only for a kind that has halves), so a kind change flips it with s/e untouched.
  Fix: when the kind changed and allday/s/e did not, push no 'when' part (the "changed to" part already says what it is;
  the bold name and the schedule show the half): e.g. `const clock = (r) => r.allday ? 'all day' : `${hhmm(r.s??0)}–${hhmm(r.e??0)}``
  and `const time = clock(b) !== clock(a) || (kindOf(b) === kindOf(a) && (b.half||'') !== (a.half||''))`.
  Failing test (bellnotices.test.tsx style):
    file([RANGER], WED, { s: 0, e: 720, sTime: '00:00', eTime: '12:00' }); clear()
    expect(commitInput(rec(), { ...draftOf(rec()), type: 'LL', title: null }, [RANGER])).toBe(true)
    expect(told(RANGER)).toEqual([`LL · Wed 15 Jul — Training changed to LL · ${cs(SABER)}`])
  (His call whether "Now LL (AM)" is wanted here; if it is, this is not a finding.)

EXPLICIT NEGATIVES — checked and found nothing
- Part kinds: nothing in src branches on 'title'/'when' outside notices.ts (perms gate checks shape and minting only —
  lineMalformed, lineRewritten, PASS_MADE; persist.ts needs only an array; topbits draws noticeWords.what; noticeAboutHim
  reads in/out/rbid only; joinFilerImgs and the war's remark-only path filter 'rmk' only). 'kind', 'h', 'c', 'now' pass.
- common, probed pair by pair: LL→OL; LL(AM)→OL(AM) ("LL changed to OL" only); ATT C→ATT B; titled kind change keeps
  title → kind only; title = new kind's name, any case → kind only; title starting "Training · " → kind only; Training
  titled "Attach · 145" → Attach To 145 → kind only; Attach To changed → "Renamed — was Attach · 145 Sqn" and kind
  dropping a To/title → kind + "renamed — was …" (both the builder's recorded reading); real rename unchanged; the split
  of a shared input can never carry a kind part (same type required).
- Half: AM/PM/all day, moved day "(PM)" with c dropped, multi-day half, a move with the half unchanged ("Now Thu 16 Jul"),
  a titled kind can never hold a half (no titled kind has halves), so "Now AM" is reachable only from a hand-made line.
- firstTwo: "You" kept, names/kinds/digits kept, empty parts uncounted, bid tail uncounted; old saved `title`/`t` parts
  read as before; an old three-part line now gains "and 1 more change" (presentation, not a rewrite of the record).
- Notes: both boxes bad names the start; empty boxes are caught earlier ("Give the input a start and end time…"); the
  window's boxes are type=time, so the in-place boxes are the real door, and they name the trimmed typed text. Drag back
  onto a seat: every draggable seat is drawn only for a person in PEOPLE (lSeat/sbSeat), so the name is never ''/an id.
  Look-ahead note right for 1–52 weeks, with and without Sunday. "Leave War period" capitals in all three places; no old
  phrase left in src, e2e or scripts. Roles: no refusal's condition changed.
- The four changed test files pass (203 tests).

TIDINESS (filed, not fixed)
- Duplicated: `kindOf` re-reads r.type where engine/inputs.ts inpKindTag already answers "is the name the kind";
  `swallowed` re-states titleOf's own case-insensitive rule rather than asking titleOf(a.type, b.title) === ''.
- Dead: noticeWords' new `p && p.k !== 'rbid'` guard is unreachable for a null part — the `rb` filter on the line above
  has no guard and throws first.
- Misleading name: `ownName` returns " · 145 Sqn" (separator included) for an untitled Attach, not a name; harmless
  only because it is only ever compared.
