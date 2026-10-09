# Brief — read the CODE of "the input card, and the Inputs list without its pencil" (one reader each; read-only; blind)

**You are one of two independent readers of finished code on a FULL bug check** (the checking order
`raptor-port/docs/bug-check-order.md` §4 rank 2, §4a; owner D67, D590, D601: Opus 5.5 planned and built; Astra and
Sol 6.1 each read it, blind). **Change no file. Run nothing that writes. Do not read the other reader's report, of this
round or any earlier one — `raptor-port/docs/superpowers/briefs/2026-10-10-reads/` and `…/2026-10-09-reads/` are closed
to you.**

The app has been WALKED already (the evidence sheet below, with its roll-call, its door list and what the walk found).
You are not asked whether the app runs; you are asked what reading finds that driving could not — and what is MISSING.

## What was built, and what it promised
- The plan: `raptor-port/docs/superpowers/plans/2026-10-10-input-card-plan.md` — §2 the design, §3 the two doors the
  approved pictures do not show, §4 the roll-call and the door list. The approved pictures:
  `raptor-port/docs/mock/img/input-card-final/day-final.png`, `list-final.png`.
- The screens as documented: `raptor-port/docs/ui-contracts.md` — search `THE INPUT CARD` and `THE INPUTS LIST HAS NO
  EDIT IN PLACE`; what touches what: `raptor-port/docs/feature-impact.md` — search `The input card, and the Inputs list
  without a pencil` and `A drift seam of the input card`.
- The evidence sheet — the tier, the rulings swept, the ROLL-CALL, THE DOORS (§3a: every action the list offered and
  where it is now), the walk and what it found, the break tests:
  `raptor-port/docs/handpass/2026-10-10-input-card-check.md`.
- The rulings, one line each: `.claude/rules/decisions/scheduler.md` — D718–D724, and D629, D646, D648, D654–D663,
  D681, D682, D700–D717, D364, D620, D647, D649, D672, D178, D179, D103, D45, D174, D176; `.claude/rules/decisions/oil.md`
  — D25, D2, D142, D660 (named there); `how-we-work.md` — D56, D489, D487, D29; `people-accounts.md` — D200, D287,
  D290, D299. A ruling's full row: `grep -h '^| D723 |' .claude/decisions-full/*.md`.

## The change itself
`git diff a6d902c5..HEAD -- raptor-port/src raptor-port/e2e raptor-port/probes` (the branch `claude/day-window-compact`;
`a6d902c5` is the commit before this work). The pieces, by file:
- `src/ui/inputcard-model.ts` (new, pure) — `cardOf` (names, kind, title, remark, "By", tone), `cardWhen`, `lateNoteOf`.
  `src/ui/InputCard.tsx` (new) — the card: the floated corner, the role=button span, LATE, the words row, `row` /
  `data-iid`. `src/ui/placedline.ts` — `filerOf`, `filerName` (and `placedLineOf` now calls `filerOf`).
  `src/ui/inputscal-model.ts` — `toneOf` exported.
- `src/ui/InputsCal.tsx` — the opened day's list draws `InputCard` (the old `.sd-row` markup, its pucks row, its
  per-man LATE tags, the kind tag on the small-print line and `placedShort` are gone from it); the Delete key's question
  is the card's child.
- `src/ui/InputsPage.tsx` — `phone` (`useMedia('(max-width:820px)')`), `dayGroups` and `pinCount`, the `#inList` cards;
  the table's row `onClick`, its Name button (`in-open`), the last cell without pencil and cross; **the edit in place
  removed whole** (`startEdit`, `saveEdit`, `del`, `editRow` / `draft`, the `ined` row, `DeletedSelf`). What the pencil's
  row did before: `git show a6d902c5:raptor-port/src/ui/InputsPage.tsx` (search `the pencil turns ONE row`, `saveEdit`,
  `className="ined"`).
- `src/ui/inputedit.tsx` — `datesHere` (now for a one-person input too), the hint under the form, `unansweredDay` and
  the "Not answered yet · Answer…" line, `archivedHere` and the `more` / `moreIds` passed to the picker, the foot's
  paperclip (`inped-docview` → `setDocView`). `src/ui/PeoplePick.tsx` — `moreIds`, the "first person on no list" option.
- CSS: `src/ui/scheduler/25-inputs-calendar.css` (`.icard…`, `.icard-day`), `06-inputs.css` (the phone's table-as-cards
  and the inline editor's rules removed; `.inact` a real cell; `.in-open`; `.inlist`), `16-medical.css` (`.inped-doc`),
  `24-sans-calendar.css` (`.sd-kindtag` removed — the SANS day's own rules untouched).
- Tests written or restated: `src/ui/inputcard-model.test.ts`, `inputslist.test.tsx`, `windowdoors.test.tsx` (new);
  `groupeditor.test.tsx` (two new describes at its foot of the D681 block), `inputsday.test.tsx`, `sharedline.test.tsx`,
  `inputtitle.test.tsx`, `inputs.test.tsx`, `placeholderlist.test.tsx`, `savesaysok.test.tsx`, `whoplaced.test.tsx`,
  `inputstabs.test.tsx`, `audit-e-window-sort.test.tsx`, `audit-e-halfday-surfaces.test.tsx` (the pencil's cases restated
  for the window); `e2e/geometry.spec.ts`, `e2e/inputs-calendar.spec.ts`, `e2e/inputs-sans-calendar.spec.ts`,
  `e2e/input-title.spec.ts`; `probes/adapted/audit-async.cjs`.
Read the code these call and are called by — not only the changed lines.

## Your method (the order's §4, verbatim)
> Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
> actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
> where the visible sign and the working gesture should exist in the production app. Then rank concrete failure
> scenarios with setup, action, expected result, and the observation that would disprove correctness. Start with the
> least-shared or most specialised surface.

## NOT a finding (owner D56)
> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
> **Do not report a problem whose harm exists only in data already stored when the code is already correct going
> forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to
> NEW data, report it: that is a real finding and this exclusion does not touch it.
Not open either: the owner's own choices (D718–D724 — the card's layout; the kind as small grey capitals; "By" only as
ruled, with no day or time on the card; every name of a shared input, no pucks; no pencil and no cross; the phone's day
headings; the desktop table kept; the SANS day's card left as it is) and what is put to him in the sheet's §0 (the size
of a day in the window's calendar on a phone — D487; "Saber +3" and the pill on the DESKTOP table) and its seven
readings (among them: a remark with no "till" in it gets none added by a date change in the window; a shared input's
LATE is said once). A claim counts only with a concrete failure, its cause and its exact fix (D489).

## What we most want from you
1. **A door the list's pencil, tick, cross, OIL chips or paperclip gave that nothing gives now** — or gives only to
   some readers, or only at one width. Compare the old row editor (`git show a6d902c5:…InputsPage.tsx`) field by field
   and question by question with the window's `save` / `doSave` / `doMedSave`: the Person list (roster, placeholders,
   archived, a deleted man), the Type list's guard rails (a downchit stays in the downchit family, an upchit stays an
   upchit — `typeOptions(isDownchit(r.type) ? …)`: does the window keep them?), the SANS branch, the span picker and
   "all day", the title box, the documents (`DocField`, `docGate` — is the pencil's "an already-medical row never
   prompts" kept?), the remarks, the order of the refusals (placeholder first, then the document, the upchit summary,
   the medical clash, OIL), `revealInput` after a save, the toasts, what happens on a REFUSED save.
2. **The window's date door for a one-person input (`datesHere`).** It was written for a shared input (D681): `midPick`,
   `datesPicked`, `calKey`, the "changed behind the window" follower (`WIN_FIELDS`, `fieldSame`, `clash`), `swap`. Is
   every one of them right for ONE record — a Save pressed in mid-pick; a first tap on the saved day; a range collapsed
   to one day; an input of another year; `draft.end` empty against `r.endDate`; a leave the Leave War approved (`lw`
   provenance, the absence door, the clash rules of `leavewar/inputgate.ts`); a downchit and an upchit moved (the
   summary / clash sheets get the NEW dates?); a request accepted onto the programme (`acc`), taken off (`acc === 'r'`),
   filed under Unavailable; an input on a PUBLISHED day (D178 — pending, sign-offs); an ALL AVAIL input (one day only —
   is a range refused BEFORE anything else?); a member's own input versus one he filed for another man; the board's and
   the week's dialogs (must have NO calendar). Is the remark's "till" word followed, and never invented?
3. **OIL.** `unansweredDay` / `oilUnansweredDay` / `oilAnswered` for one record, for a shared entry opened on ANY of its
   records, for a partly answered input (one day answered, another not; one man answered, another not — can a question
   become unreachable from the window?). "Answer…" and "Change…" price the DRAFT (`oilGate(draft, r, true)`) and their
   Save runs `doSave` — is anything else of the draft saved by surprise, or an answer lost when the sheet is cancelled?
   A reader who may not change the input; a man in a shared input he did not file (`mineRow`, `saveOwnOil`); an input
   for ALL AVAIL (D711: the filer's answer). On the phone's list there is NO chip: is there any state where the
   desktop row offers an OIL action the window does not?
4. **The card's facts (`cardOf`, `filerOf`, `lateNoteOf`, `cardWhen`).** "By": one person / several / a group that
   shrank to one / a placeholder / a record with `by` but no `at` / `grpBy` on some records only / a man added later by
   someone else / the filer deleted or archived. The names: a person on no list, the same callsign twice, the order
   against `entriesOf`'s. The kind for an upchit, a half-day leave, SANS (must never reach a card). `cardWhen` against
   the day's old `whenOf` and the list's old Start / End cells: a timed input across midnight, a range seen from its
   middle day, another year. The LATE note against the list's old `isLateInput` / `lateNote` (downchits exempt; a
   shared input; the per-input "drop the LATE mark" of the board — must the Inputs page keep printing it?).
5. **The phone's list (`dayGroups`).** Order and grouping against the filters, the date window (`inWindow`), the pins
   (`pinCount` — a pinned shared record, a pin whose day already has a group, pins after a filter change), `flash`,
   `data-iid` (the reveal's `document.querySelector('[data-iid=…]')` — the month's bars carry `data-iid` too: which is
   found, on which view?), an input with no readable date, `useMedia` at exactly 820 / 821, the list mounted but hidden
   under the calendar, the SANS and Medical tabs.
6. **The desktop row's click.** `closest('button')` / `closest('.inact > span')`: the paperclip, both OIL chips, the
   Name, a text selection, a click on a row while a window with unsaved changes is open (`swap`), a row of a shared
   input, a member's row. Keyboard: is the Name the only tab stop, and are the chips reachable (they are spans)?
7. **What the removed code also did.** Search for every reader of what was deleted: `editRow`, `ined`, `data-edit`,
   `data-inx`, `data-save`, `.rmx`, `.rok`, `inedCal`, `DeletedSelf`, `placedShort`, `idy-people`, `idy-kindtag`,
   `sd-kindtag`, `idy-placed` — in `src`, `e2e`, `probes`, the docs a user reads (`src/ui/HelpPage*`, the Logic page),
   hints and toasts that still NAME the pencil, the cross or "the Inputs page" as the place to change something.
8. Anything else you judge this build most likely to have got wrong — say why.

## What to hand back
For each finding: its severity (HIGH / MEDIUM / LOW), the concrete failure (setup, action, what happens, what should),
its cause (file and function), and its EXACT fix, step by step — the builder will apply it as written. Then your
explicit negatives: what you checked and found right (so a clean area is a statement, not a silence). Then anything
you could not determine by reading. End with `Rulings: none this session.`
