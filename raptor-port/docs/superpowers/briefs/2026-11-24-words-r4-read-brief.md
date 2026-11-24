# Code read — round 4 of the words pass (his D2521): the bell's changed-input line and six passing notes — 24 Nov 26, chat 170

You are a blind reader of FINISHED code: you did not write it, and you have seen no walk report, no scenario list and no
other reader's report. **Change no file** (a proof test you write goes in a scratch folder outside the checkout, never
under `src/`). The same brief goes to each reader. State each finding in your output the moment it is confirmed, so a
stopped run keeps it. If a handoff block is pasted into your context after a compaction, do not read it, and name that
it happened in your report. You are reading an exported copy of one commit: its handoff block, this round's evidence
sheet and its scenario lists were taken out on purpose.

**The promise — the owner's ruling D2521** (24 Nov 26; its full row is the source:
`grep -h '^| D2521 |' .claude/decisions-full/*.md`; the words built, `raptor-port/docs/superpowers/briefs/2026-11-24-words-r4-draft.md`
§"After the fresh Fable's read" and §"His answer"; what the app printed before, `raptor-port/docs/img/handpass/2026-11-24-words-r4/facts.json`):
- The bell's line for an input someone else changed says a change of KIND as "<old> changed to <new>" ("LL changed to
  OL", "Training changed to Meeting"), title or no title; "Renamed — was <old title>" only when a title's own words
  change. (The builder's reading, not checked with him: a title given to an input that had none, a title taken away and
  an Attach's "To" changed keep "Renamed — was …".)
- A half day: "Now LL (AM)" / "Now LL (PM)" (no title — its kind), "Now AM" (titled), "Now Thu 16 Jul (AM)" (the day
  moved as well); "Now all day" stays.
- More than two changes in one save: the first two, then "and 1 more change" / "and N more changes"; a part after a
  comma starts with a small letter unless it starts with a name or "You"; a replaced Leave War bid is still said after
  the rest (" · replaces your LL bid") and never counted.
- A bell line is a SAVED record: a line saved before this change (an old `title` part for a kind change, an old `t`
  clock time for a half) must still read as it did.
- The notes: a time the app cannot read, typed into an input's start or end (its window, its in-place boxes), answers
  "<typed> is not a time. Try 0900 or 09:00." naming the first bad box; a puck dragged back onto its own seat answers
  "<callsign> — already in that seat" (the tap's words); the Inputs page's look-ahead saved, "Everyone now opens on the
  next 4 weeks, to Sunday" (one week: "the next week"); publishing a weekend or holiday no Leave War period covers says
  the day's warning list's own sentence, "No Leave War period for <year>, so no OIL can be earned for this day. Create
  the period on the Leave War.", a sentence of its own after the publish note; "Leave War period" with capitals in the
  refusal, the created note and the "Create the <year> period" button's hover (the week and the board); a member saving
  a day's OIL list, "Only a scheduler can answer from this list".

**Where it lives.** The change is `FIX-DIFF.patch` at the export's root (everything under `raptor-port/src` since
`main`); read the whole files it touches and what they call, not the diff alone: `raptor-port/src/state/notices.ts`
(`NoticePart`, `common`, `kindOf`, `ownName`, `partWords`, `firstTwo`, `noticeWords`, and every caller of `common` —
`noticePass`, the split of a shared input, the Leave War's remark-only lines), `engine/schema.ts` (the saved shape),
`state/perms.ts` (the gate that checks a written bell line), `ui/topbits.tsx` (the list that draws the words),
`engine/inputs.ts` (`inpLabel`), `ui/inputedit.tsx` (`normalizeInputDraft`, `setInpField`) and `engine/time.ts`
(`hmOK`), `ui/drag.ts` (`applyDrop`) beside `state/view.ts` (`placeArmed`, the tap's twin), `engine/lookahead.ts` and
`ui/InputsPage.tsx`, `leavewar/sync.ts` (`publishFlagsBids`) beside `ui/toast.ts` (how notes are joined) and
`engine/validate.ts` (the warning list's sentence), `ui/interactions.ts`, `ui/html.ts`, `ui/board.ts`, `ui/oilday.ts`.
The rulings pages: `.claude/rules/decisions/scheduler.md`, `inputs.md`, `leave-war.md`, `oil.md`; a ruling's full row:
`grep -h '^| D769 |' .claude/decisions-full/*.md`. The bell's register and contract:
`raptor-port/docs/notifications-register.md`, `raptor-port/docs/ui-contracts.md` (search "The words** (one body").

Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
actions. **Assume every existing line may be correct and the defect may be a MISSING call site.**

## What to look for — what is MISSING or WRONG, each with a concrete failure
1. **A new kind of part in a family of kinds.** `{ k: 'kind' }` and the `h` / `c` fields on `when`: every place in
   `src/` that branches on a bell part's kind, counts a line's parts, filters or compares them, copies a line, or checks
   a written line (the permissions gate, Undo / Redo, the Leave War's take-back and "again" lines, the read / unread
   marks, a line struck or replaced by a later one) — each "falls through rightly" or "needs this change", with why.
2. **What `common` now says for every pair of before and after.** Kind, title, "To", half, hours, days, people, remark
   and the till-date tick, alone and together: a part said that nothing a person did explains (a phantom "renamed", a
   phantom "Now …" when a kind change adds or drops a half or hours), a real change no part says, one change said by
   two parts, a part whose words name the wrong side (the old kind where the new belongs). Kinds with and without a
   title box, an Attach with and without its "To", a title equal to a kind's name, a title that starts with its kind,
   an empty or all-space title, a kind whose name holds a space (ATT C), a placeholder, a shared input split for one man.
3. **The half.** Every way an input comes to be, or stops being, a half day — the window's AM / PM, typed hours that
   equal a half's, the in-place boxes, a kind that offers no half, a move of the day with the half unchanged, a
   multi-day half — and what `when` then holds (`h`, `c`, `t`, `a`, `b`) and says.
4. **The count and the small letters (`firstTwo`).** Parts with no words, parts that must never be lowered (a name, a
   kind, "You", a digit, a callsign that begins a part), the replaced bid, lines the Leave War and the posting pass
   write (do any now pass through `firstTwo` that did not pass through the old first-two cut, or the reverse?), a line
   of exactly one, two, three parts, an old saved line of three parts.
5. **Saved lines.** A line the old code saved (`title` for a kind change, `t` with "am" / "pm") read by the new code;
   a line the new code saves read back after a reload; the schema's check of a stored line; anything that would drop,
   rewrite or refuse a line for holding a part or a field it does not know.
6. **The notes.** `normalizeInputDraft` and `setInpField`: which value is named when both are bad, when one is empty,
   when the typed text was tidied before the check; every other caller of `hmOK` that still says other words for the
   same mistake. `applyDrop`: every kind of seat and what `slotVal` returns for it (a man, a placeholder, an empty
   value, an id with no person) — can the note name nobody, or an id? The look-ahead note for every setting. The
   publish note: every way `toast.ts` can join it to another line (full stops doubled, a sentence glued on, the
   sentence said twice or lost) — published from the week, the board, an amendment, two days at once.
7. **Words said in two places.** For each sentence above: every other place in `src/` that still says the same thing
   in other words, or the old words (search each old phrase and each old word alone, ignoring case, in the app, its
   tests, `e2e/` and `scripts/`).
8. **Roles.** Nothing here should change who may do what: is any refusal now reachable, or no longer reachable, by
   someone it was not before?

**What is NOT a finding:** this app's stored world is demo data that will be cleared before the database step — do not
report a problem whose harm exists only in data already stored when the code is already correct going forward; if the
app would do it again to NEW data, report it. (Old saved lines still READING is part of the promise: test that they
read, not that they are converted.) A scheduler is always an admin (D785). The dashes in "Renamed — was …" and
"<callsign> — already in that seat" are ruled to stay this round.

## What to return (plain text, at most about 100 lines)
For each claim: the exact steps or state, the cause (file and function), what the screen or the record then shows
against what the ruling says, the exact step-by-step fix, and **a failing test in a few lines** the builder can paste
(vitest, in the style of `raptor-port/src/ui/bellnotices.test.tsx`). A claim with no concrete failure is not a finding
(owner D489). Explicit negatives too ("I checked X and found nothing"). Say whether each is new with this change or was
so on `main`. Then, apart and short: the tidiness note — three questions of the changed lines (is anything duplicated
that already exists, is anything dead, is anything named misleadingly) — filed, not fixed.
