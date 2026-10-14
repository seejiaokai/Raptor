# The small OIL job — its ONE bug check (`[OIL-UNCANCEL-UNASKED]`, `[OIL-LOAD-VERSION-UNASKED]`)

**One branch, one check (D485):** his two rulings of 13 Oct 26 — (1) taking the cancel (or the information-only mark)
off an input that has no OIL answer for a non-working day puts the OIL question first; nothing is un-cancelled until it
is answered (D816); (2) after a published version is loaded back onto the working copy, the app says how many of the
inputs it put back still need an OIL answer and opens that day's one list — the load itself is not held (D818). Built
on the night of 14 Oct 26, unattended (D856, D857), on `claude/oil-uncancel-load-ask` (cut from the leftovers batch;
no pull request until pull request 505 is merged). Opus built it; ONE fresh Opus reader read it (D858); Sonnet 5.5
walked the helper's share. The plan and its state: `docs/superpowers/plans/2026-10-14-oil-uncancel-load-plan.md`.

## 0. Questions waiting for him (a minute's read)

Nothing below held the build. Each has what the walk saw and a recommended answer. Pictures:
`docs/img/handpass/2026-10-14-oil-uncancel-load/`.

1. **The words for the information-only mark.** His ruling gave the cancel's words; for the ⓘ mark the question is
   headed "Taking “information only” off Nomad's Hangar brief", its buttons "Don’t change" / "Change", the bar "Not
   changed — OIL not answered", and where the input changed meanwhile "That input has changed — left as it is".
   Pictures: `U6-question-phone.png`, `U6-bar-phone.png`. **Recommended: keep.**
2. **The load's note keeps its older sentence and adds his tail:** "Friday: Original loaded onto the working copy —
   viewers still see Original until you publish · 2 unpublished edits replaced · 1 input needs an OIL answer". His
   ruling's example was shorter ("<day> loaded · 3 inputs need an OIL answer"); the older sentence tells him the
   viewers' copy has not changed. Picture: `L1-loaded-board-phone.png`. **Recommended: keep the older sentence.**
3. **The list a load opens is that day's WHOLE list of open OIL questions**, so it can hold more than the note
   counts: "1 input needs an OIL answer" over "2 to answer" (the second was already waiting before the load). Picture:
   `L1-loaded-board-phone.png`. **Recommended: leave it** — it is the day's one list (D782), and both are his to answer.
4. **An input of several days, loaded back on a day that has nothing to answer** (Thursday to Friday, Friday a
   holiday with no answer, THURSDAY's version loaded). First built as "not counted, no list"; the fresh reader showed
   that where the holiday was made while the input was off the programme, nobody is ever told — the gap his ruling
   closes. **Now built:** it is counted ("· 1 input needs an OIL answer") and the list opens for the day that needs
   the answer ("OIL — Fri 17 Jul"), not the day loaded. Picture: `R1-two-day-loaded-desk.png`.
   **Recommended: keep;** say if he would rather the list always open on the loaded day.
5. **"Switch to this plan" (a saved plan, not a published version) that brings back an unanswered input says
   nothing.** His ruling names a published version. **Recommended: the same tail and list there — a small follow-up if
   he says so.** Not built.
6. **The bar is up, and before "Answer OIL" is pressed the input stops needing an answer** (an Undo takes it back to a
   working day; or it is answered in its own window). "Answer OIL" then un-cancels it at once and says "Restored" — his
   ruling's "where nothing is to be asked, it is un-cancelled at once". Picture: `E3-after-undo-desk.png`.
   **Recommended: keep.**
7. **Nothing to answer:** on a plain weekend the list a load opens has no "Public holiday" line (a Saturday is not
   one). No road through the app's controls now leaves an unanswered, live input on a published weekend day — a
   filing, a move and the un-cancel all ask — so this is held by tests and was not walked.

## 1. The eight questions, and the tier

| # | The question | Answer | Why |
|---|---|---|---|
| 1 | What a man is owed (OIL counts) | **YES** | The un-cancel writes an OIL answer in the same step; a published day then credits it (the Leave War's cell, walked). |
| 2 | The published record | **YES** | An un-cancel on a published day is a change waiting; the second half is the load of a published version itself. |
| 3 | Saved data | NO | No new stored field: the input's cancel, its reason, the ⓘ mark and the OIL answer are as before. The list's "plain" flag is view state — never saved, never in Undo. |
| 4 | A shared drawer | **YES** | The OIL question's sheet, the bar that stays and the day's one list are shared with five older waiting changes and the holiday's own door. |
| 5 | A new gesture or mode | **YES** | Two existing buttons now hold their change for an answer. |
| 6 | A new surface | NO | No new screen, window or kind of row. |
| 7 | Roles | NO | The buttons and the load are a scheduler's, as before (`state/perms.ts` not in the change). A member's side was walked. |
| 8 | The warning list | NO | No rule and no warning's words are touched; what shows behind the open question was walked (S23). |

**Tier: FULL** (questions 1 and 2). The rules sweep; scenarios from a model that did not build it; the roll-call; a
walk at both sizes, sized below; break tests; the gates; this sheet. **Model reads:** ONE fresh, blind Opus read of the
finished code (D790, and for this job D858 — "solely opus to review is good enough": no Fable read, though D790 gives
OIL work one). No ChatGPT read (D761 — on `[NO-ASTRA-LIST]`).

## 2. The rulings that apply

D816 (and its four readings) · D818 · D814 (a cancelled or information-only input is never asked, wears no "OIL?" tag,
stands in neither the list nor the bell) · D804 (leave and medical never asked; every other kind asked, under
Unavailable too) · D793, D783 (the change waits on the answer; the bar) · D840, D841, D831 (the bar: one line, under
the top bar, amber) · D782, D781 (the day's one list; what is answered there notifies nobody) · D762, D660, D682 (one
answer for everyone in a shared input) · D753, D711 (ALL AVAIL follows the input's answer) · D142, D2 (only the
published schedule earns) · D148 (Undo) · D44, D45, D103 (a published day: a change waits, sign-offs fall) · D771 (a
cancelled input's own window only says so) · D760 (a CX on an input's row cancels the input) · D363, D175 (what a load
puts back or leaves out) · D25 (OIL is earned leave) · D56 (stored demo data is not a finding).
**No clash between them.** Two readings told to him in §0 (items 1 and 2) rather than asked.

## 3. The roll-call

| The thing | Every place the app draws or raises it | Has it / must not / missing |
|---|---|---|
| A cancel or an ⓘ mark coming OFF an input | the Scheduler Board's row buttons (the cancel sheet's "Un-cancel"; the ⓘ pressed off) — the only control that clears either on an input | **has it** — waits on the question (walked U1–U6, both sizes) |
| | the same buttons on a scheduler's own row (no input behind it) | **must not** — it has no OIL question of its own; it earns by OIL Earn (walked by the helper, S17) |
| | Edit Schedule's week · View-only Sched · the Inputs calendar and List · the input's own window · the Leave War | **must not** — none offers an un-cancel (D771); checked by the helper (S22) |
| | Undo of a cancel · Redo of an un-cancel | **must not ask** (D816 reading 4) — walked U4, S9 |
| | a published version loaded back · a saved plan switched to | the load: **says and lists** (D818); a saved plan: says nothing — §0 item 5 |
| The question's sheet | over the Scheduler Board at a phone's and a desktop's size | **has it** — headed in the un-cancel's own words, the right button greyed until an answer (U1, U6) |
| The bar that stays | the band under the Scheduler Board's own bar, a phone (390 and 320 wide) and a desktop | **has it** — one line, both buttons, nothing cut (U2; `e2e/oil-uncancel-load.spec.ts`) |
| The passing note after the answer | "Restored" · the ⓘ mark's sentence | **has it** (U3, U6) |
| The OIL answer's readers after the un-cancel | the input as saved · the Leave War's cell for that man and day after publishing | **has it** — "HO*" on Sat 18 Jul (U5, both sizes; pictures opened) |
| The load's note | Edit Schedule's week (the preview bar) · the Scheduler Board's own preview bar | **has it** on both (L1 — the week on a desktop, the board on a phone) |
| The day's one list after a load | over the week · over the full-screen board | **has it** — above the board, its Yes reachable (L1; the browser test) |
| The list's heading | a public holiday · a plain weekend | names the holiday (L1) · no "Public holiday" line (tests only — §0 item 7) |

**The door check:** every un-cancel of an input goes through ONE door (`rowMark`); every load of a published version
through ONE (`data-restore`), which both pages' buttons route to.

## 4. The walk, sized (D607)

1. **The type of change:** C (two controls now hold their change — a new order of action), D (the waiting change is
   drawn by shared code in three places: the sheet, the bar, the list), G (the publish path, Undo, a load).
2. **What only a walk could find:** whether the board's cancel sheet is wired to the new wait at all; whether the
   bar's longest-ever words fit one line on a phone; whether the list a load opens from the full-screen board stands
   above it; what the Leave War shows after publishing; the orders (a second press, Undo with the bar up). The rule
   itself — who is asked and what is counted — is carried by 18 unit tests through the app's own routed buttons.
3. **What the ledger says:** the two walks of the mechanism this stands on (`[OIL-ASK-NOTIFY]`, 13 Oct 26: five
   walkers, then two) found their faults on the first pass and none on the re-walk; a rule-at-a-door change on a
   walked mechanism has supported a smaller walk.
4. **The walk chosen — MEDIUM:** the host's own scripts as assertions at a phone's (390 × 844, by touch; the bar at
   320 wide too) and a desktop's size (1440 × 900) for the two rulings' main roads and the downstream number — 13
   parts a size; and ONE Sonnet 5.5 helper for the designer's remaining scenarios (publish orders, the members' side,
   the places that must not offer it, the load's edges). No case is carried by a test in place of a press.
5. **After the walk:** its row is in `docs/walk-ledger.md`.

## 5. The host's walk — `scripts/handpass/ou-walk.mjs`, `ou-walk-2.mjs` (the fixtures made by the app's own controls)

Every row PASS at both sizes; the pictures behind every OIL and published-day row opened by the host.

| Part | What was done | What the screen showed and what was saved | Phone | Desktop |
|---|---|---|---|---|
| U0 | an input filed on Wed 15 Jul, cancelled on the board ("WX"), its date moved to Sat 18 Jul in its own window | no question at the move (D814); cancelled, no answer | PASS | PASS |
| U1 | Saturday's board → the row's CX → "Un-cancel" | the question "Un-cancelling Ranger's Range brief"; "Don’t un-cancel" / "Un-cancel" (greyed); still cancelled, "WX" kept, no note | PASS | PASS |
| U2 | "Don’t un-cancel" | the bar "Not un-cancelled — OIL not answered · Answer OIL · OK" — one line, nothing cut, at 390 and at 320 wide; nothing written | PASS | PASS |
| U3 | "Answer OIL" → Yes → "Un-cancel" | "Restored"; un-cancelled with HO for 18 Jul in one step; the bar gone | PASS | PASS |
| U4 | Undo, then Redo | one Undo: cancelled again, "WX" back, the answer gone; Redo: back with its answer, no question | PASS | PASS |
| U5 | Saturday published; the Leave War | Ranger's cell for Sat 18 Jul reads "HO*", his OIL column 0.5 | PASS | PASS |
| U6 | the same with the ⓘ mark | "Taking “information only” off Nomad's Hangar brief"; "Don’t change" / "Change"; the bar "Not changed — OIL not answered"; answered: the mark off, HO written, the ⓘ sentence said | PASS | PASS |
| L0 | two inputs filed on Fri 17 Jul, Friday published, Friday made a public holiday | the holiday's own list opened with both (and an overseas duty already on that day); one answered Yes and saved, the rest left | PASS | PASS |
| L1 | both taken off the programme; the Original loaded back (the week on a desktop; the Scheduler Board on a phone) | "Friday: Original loaded onto the working copy — viewers still see Original until you publish · 2 unpublished edits replaced · 1 input needs an OIL answer"; the list open, "Public holiday · Walk holiday", the unanswered one on it and the answered one not; above the board, its Yes reachable; both back on the programme | PASS | PASS |
| L2 | answered in the list; taken off and loaded again | the answer written, the list closed; the second load's note has no OIL tail and no list opens | PASS | PASS |
| E1 | inputs filed on Saturday and answered at the save (one Yes, one No), cancelled, un-cancelled | no question; "Restored" at once; each answer as it was | PASS | PASS |
| E2 | the bar up for one input: its CX again; then another input's CX; left; "Answer OIL" | asked again for the same; the other's own question; the bar is the last one's and "Answer OIL" asks for that one; neither un-cancelled | PASS | PASS |
| E3 | the bar up, Undo (the input goes back to Wednesday, cancelled), "Answer OIL" | no question; "Restored"; un-cancelled on its working day with no answer written — §0 item 6 | RECORDED | RECORDED |


## 6. The model reads

**ONE fresh, blind Opus read of the finished code (D790; D858 — no Fable read, on his word)** — the brief
`docs/superpowers/briefs/2026-10-14-oil-uncancel-load-read-brief.md`, the report whole
`docs/superpowers/briefs/2026-10-14-oil-uncancel-load-read.md`. Its verdict: the un-cancel is sound — no way found to
un-cancel with no answer where one was owed, to write an answer nobody gave, to lose one given, or to credit an input
still wearing a mark. Four findings, none in the top class, ALL FIXED tests first:

| # | What it found | What it would have meant | The fix | Its test |
|---|---|---|---|---|
| F1 | an input of several days put back by a load is not counted when its unanswered day is not the day loaded | a Thu–Fri input brought back on Thursday said nothing of Friday's missing OIL answer — and where Friday became a holiday while it was off the programme, no scheduler was ever told | the open questions are read over every day those inputs cover; the list opens for the days that need the answer | `oilwait.test.tsx` "an input of two days put back…" |
| F2 | on a holiday with no name of its own the list a load opens was headed "Public holiday · PH" | the preset's word shown as if it were the holiday's name | the holiday's own name, read as its own list and the bell read it | `holnotice.test.tsx` "…NO name of its own" |
| F3 | the list's foot said "What is left goes to the schedulers’ bells" on a plain weekend | a promise that is not kept — no scheduler's bell carries a line there | said only where a scheduler's holiday line is live for a day still unanswered | `holnotice.test.tsx` "…a plain Saturday" (and the named-holiday test: it IS said there) |
| F4 | after a row was taken off above it, "Don’t un-cancel" flashed another row's button | the wrong row lit as "this was not un-cancelled" | the row's button is found each time the question is put; the old place is not carried into the new wait | `oilwait.test.tsx` "a row taken off above it while the bar is up…" |

Two notes of the reader's that are not findings: a branch that cannot be reached (left as it is); and with the bar up,
an input taken OFF the programme meanwhile is still asked and un-cancelled on the answer (harmless: it waits under
Personal Inputs with its answer).

**A narrow read of the fixes** (they rewrite the load's count) by a second fresh Opus reader — the brief
`docs/superpowers/briefs/2026-10-14-oil-uncancel-load-narrow-read-brief.md`; its result is in §9.
