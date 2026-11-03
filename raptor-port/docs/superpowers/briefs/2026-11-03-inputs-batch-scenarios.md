# Scenario design — the Inputs batch (`claude/inputs-small-fixes-2`, PR 625, `origin/main...8b09ddfcf`)

Independent scenario designer (Opus, blind to the build). Read: bug-check-order §4, §6, §7.0a, §7.4, §7.11; walk-scripts §4;
the 3 Nov re-check sheet; `[INPUTS-FIXES-1103]`; full rows D1578, D1581–D1588, D1592, D641, D1298, D792, D19, D77, D45,
D103, D178, D469, D471; ui-contracts additions; the diff of `raptor-port/src` (state/view.ts, engine/restore.ts,
engine/canonical.ts, state/perms.ts, state/changelines.ts, state/notices.ts `common`, ui/interactions.ts, ui/html.ts,
ui/board-html.ts, ui/pendlist.ts, undo/describe.ts, ui/winorder.ts, ui/FloatWindow.tsx, ui/InputWindow.tsx F1/F2,
ui/inputedit.tsx `draftOf`/`WIN_FIELDS`/`commitInputEdit`, ui/InputsCal.tsx, ui/caldrag.ts, ui/RangeCal.tsx,
ui/SansCal.tsx, ui/SansDay.tsx, ui/pops.ts, 19-availability.css). Nothing run.

Demo-data rule (D56) applied: nothing below rests on a record stored before this build (e.g. a version issued before
`npub` existed). Every scenario makes its own fixture through the app's controls.

Sign-ins: admin `ad`/`a`; member `us`/`us`. Sizes: desktop 1440×900 (and his 1536 where named), phone 402×874,
phone sideways 844×390, small phone 320×568. "PUB day" = a July 2026 day of the demo week published through the day's
own four sign-offs and Publish (helpers `isr-A-pub.mjs signDay`); "UNPUB day" = a weekday left a draft. A **late input**
is made by member `us` filing any input for a July 2026 date today (3 Nov 26 is long past every July cut-off) — confirm
the LATE chip shows before relying on it.

Re-run first, unchanged: `isr-A*.mjs`, `isr-B*.mjs` (they prove F1–F10, D1581, D1582's basic words). Everything below
ADDS to them.

---

## 1. The roll-call (§6) — every place each fix's thing is drawn, read or written

Marks: **HAS** (code read says it is wired — still walked), **MUST NOT, because…**, **MISSING?** (my suspicion, with the
code that makes me think so), **RECORD** (no ruling settles it; walk and write down what it says).

### 1a. D1586 — the dropped LATE mark (`lateOff` on the input)

| Place | Shows the drop? | Gesture usable? | Notes / suspicion |
|---|---|---|---|
| Scheduler Board, live Personal Inputs row (`board-html.ts:763 lateChip`) | HAS (dim chip) | HAS, admin only | the only door. Phone + desktop. |
| Board, live Unavailable row (one row a man, D737) | HAS | HAS | **RECORD**: the drop is saved on the RECORD (`view.ts setLateOff` by `inpId`), so on a leave held by two men, dropping it on one man's row drops it on the other man's row too (both faces share the iid). Was the same with the old set; now permanent. |
| Board read-only (member, or `modeRO`) — `lateTag` | HAS | MUST NOT (no chip) | member sees it gone |
| Board inputs band / read-only panels (`sbiRmk`→`lateTag`, board-html.ts:127) | HAS | MUST NOT | |
| Board's promoted ground row (amber edge, `lateRowCls`, board-html.ts:607) | HAS | MUST NOT (bare box) | check edge goes AND comes back |
| Edit Schedule week — Ground row from an input (`plRmk`←`lateTagOf`, html.ts:771) | HAS | MUST NOT | |
| Edit Schedule week — Personal Inputs / Unavailable cells (`inpRmkCell`, html.ts:2321) | HAS | MUST NOT | |
| View-only Sched (ed=false, issued face) | HAS — **immediately on a PUB day** (`lateShown` reads the LIVE record by iid, view.ts:211) | MUST NOT | builder's call 1 (§7). Also **order trap**: if the input is later deleted, `lateShown` falls back to the issued copy's own `lateOff` — see S04b. |
| Export as PDF / print of the published day | HAS (same builder) | — | lesson 18: print-media pictures, Chromium + WebKit |
| Inputs page (List row, card, calendar bar, day window) | MUST NOT drop — paperwork record (20 Aug 26; D1586) | — | walk that it still prints LATE |
| Change history (`changelines.ts:202`) "… · LATE mark: shown → hidden" | HAS | — | read the exact line, both directions, and on a shared input (one line or one per face?) **RECORD** |
| Undo / Redo ("Undid: a LATE mark") | HAS | — | D1582 wants person+kind for an input; builder chose a generic phrase — **RECORD**, put to him |
| Bell (member's notices) | MUST NOT ring (`notices.ts common` compares cx/acc/dates/hours/people/title — not `lateOff`) | — | walk confirms silence |
| "N pending" / sign-offs on a PUB day | MUST NOT move (`inpDetailKey` has no `lateOff`) — builder's call | — | see §7 call 1 |
| "To go out" list | MUST NOT list it | — | |
| Member's own edit of the input afterwards (`commitInputEdit` mutates in place) | keeps `lateOff` | — | **RECORD**: a new late change after the drop stays hidden for ever. Not ruled. |
| Server-side rule (perms.ts `inputBreach` `mk`, line ~889) | **MISSING?** `mk` compares `cx, cxr, flag, info` — not `lateOff` — while the §11 note (perms.ts:344, data-model §11) now says the dropped mark is "never mine to set or clear". A member's hand-made write that sets/clears `lateOff` on his own input passes the breach check. Only the `inputs.lateOff` door (op T.sched) and `setLateOff`'s `canEditSched` stop it in the app. **Test-carried (security read, D1411), not walkable.** |
| Second signed-in user / second tab | HAS (saved row) | — | §6 storage rule → two-tab step S20 |
| Restore of a deleted input / a piece split off a shared input | carries `lateOff` (whole-record copy) | — | RECORD |

### 1b. D1588 / D1592 — a scheduler note's "Make public" (`npub` on the day)

| Place | Shows? | Gesture? | Notes |
|---|---|---|---|
| Edit Schedule week, the four section notes (Programme `pn`, Duties `dtn`, Sims `sn`, Ground `gn` — html.ts 1858/2060/2087/2101/2120) | HAS header "Public notes"/"Scheduler notes" + `On view-only ✓`/`Make public` | HAS (admin) | **MISSING? (words)** on a PUB day the working copy's toggle reads "On view-only ✓", its tooltip "Showing on the view-only schedule", and the toast "Note now shows on the view-only schedule" — all untrue until the amendment goes out (D1592). |
| Scheduler Board, same four (`sbNote`, board-html.ts:283) | HAS | HAS (`!pv && canEditSched`) | |
| Board / week preview of an issued version (`pv`, DPREV) | HAS, from the version's own day | MUST NOT (no toggle) | |
| View-only Sched (issued face, `notePub(k,d)` with the issued day) | HAS — the note as the day went out | MUST NOT | Ground note drawn even with no ground rows (html.ts:2101); a Sims/Duties/Programme note whose section has no rows is NOT drawn (documented edge) |
| View-only Sched of an UNPUB day (DRAFT face) | RECORD — immediate? who may see it? | — | |
| Member `us`, guest | read only | MUST NOT ("Only a scheduler can change this") | |
| Export as PDF of the published day | HAS | — | lesson 18 |
| "N pending" + the note's pending colour (`alAttr`, `noteChange` sets `SCHED.pending`) | HAS | — | **RECORD**: toggled back to as issued, the count returns to 0 but `noteChange` set `SCHED.pending[rk]=1` and nothing clears it — the note may keep its pending colour |
| Sign-offs (D103: any pending wipes them; AM11: put back restores) | HAS (via the canonical compare) | — | both directions |
| "To go out" words | HAS — `valueWords` splits the composite: "…X → X · public" | — | **RECORD exact words**; an EMPTY note reads "→ public" (S05) |
| Amendment publish (AL) | carries `npub` (in DAY_CANONICAL_FIELDS) | — | the note's AL mark after publish: RECORD |
| Unpublish / "Load onto working copy" of an older version | restores that version's `npub` | — | |
| Saved plans (parked / brought out) | `npub` rides (canonical) | — | RECORD |
| Day templates (daytpl.ts — notes carried, `npub` not) | **RECORD**: applying a template keeps the day's old public flags over the template's new note text | — | |
| Change history | **MISSING? (no line)** — `noteChange(k)` calls `logEdit(k, undefined, undefined)`, which returns at once; `changelines.ts` has no `sched.notePub` branch (a warning hide, D469, has one). Not demanded by D1588 in words; put to him beside the LATE line, which has one. |
| Undo / Redo "making a note public" | HAS | — | one step? (`HOOKS.histPush()` after the command is the storage push, not an undo step — walk confirms one press) |
| Reload / sign-out / week change | HAS (VIEW_RESET entries removed) | — | |

### 1c. F2 / F6 / F7 / D1581 — who answers Escape (the Escape stack)

Listeners, in the order a key reaches them (capture on window → capture on document → the target / React root → bubble):

| Listener | Where | Checks `defaultPrevented`? | Checks front window? |
|---|---|---|---|
| caldrag `onKey` (D1581) — while a bar or note is carried | window, capture; wired once at mount | no | no (stops immediate) |
| Delete question (F6, InputsCal:198) | window, capture; added when the question opens | yes | no (by design) |
| People picker (InputsCal:408) | window, capture | **no** | no |
| List's date-range calendar (InputsPage:377) | window, capture | no | no |
| Input window (InputWindow:389) | document, capture | yes | yes, unless one of its questions is up |
| **The month's DATE cell `onKey` (InputsCal:593)** | React, on the date | no | **no — closes the opened DAY whatever is in front** |
| FloatWin shell (FloatWindow:221) | window, bubble | yes | yes |

**MISSING? (high)** — the date cell's own Escape closes the day window (`closePop`) and stops the key, so with the
keyboard on a date and ANOTHER window in front (Inputs ⚙ settings, Calendar…, the OIL list), Escape closes the day
BEHIND and leaves the front window up. Contract (ui-contracts "ONE ESCAPE, ONE WINDOW"): "a BUTTON behind that still
holds the keys owns no Escape, and the front window closes". The date is a `role=button` div. → S01.

Windows on the Inputs page that can be "front": the opened day (`inputsday`), the input's own window (`inputedit`), the
Inputs settings, the SANS settings, the Calendar window (`days`), the SANS day (`sansday`), the OIL list, the document
viewer (blocking), the "?" type card, the Highlight list (a menu, not a window, D641 (2)).

### 1d. F8 — windows on a page change

| Window | Closes on page change? | Notes |
|---|---|---|
| Inputs settings, SANS settings | HAS (pops.ts SETTINGS_NAV, scope 'page') | typed cut-off not saved is lost — RECORD |
| **Calendar window (`DAYSWIN`, App-level)** | **MISSING?** — only reset per session (pops.ts POPS list). Opened from either settings window, it stays floating over Edit Schedule after the settings window closes — the very reason F8 gave. |
| OIL list (`OILLIST`, App-level) | RECORD (session only) | |
| The input's own window | becomes the schedule's blocking pop-up (`win = open && CURPAGE==='inputs'`) with its typing — RECORD; a tap outside then closes it with no question (F2's call) |
| Inputs day / SANS day | unmount with the page | |
| Week change | settings stay (by design) | |

### 1e. F9 — every door to the Calendar window

SANS day "Calendar…" (HAS beside, `openBeside`); Inputs settings "Calendar…" (MUST NOT? — no beside; does it cover the
settings window's ✕? RECORD); SANS settings "Calendar…" (same); Logic page row → settings → "Calendar…" (lesson 12).
Fallbacks: SANS day near the left edge (x<8 → old corner, over the day again); Calendar already open (no move; a stale
`BESIDE` entry is left and used by the NEXT opening from another door — RECORD where it lands); phone (no beside).

### 1f. F1 — Save with nothing changed: every field the window can change, each must still SAVE alone

`WIN_FIELDS` (inputedit.tsx:2246) + `to` + `goes` + OIL answer + medical removals. Who-it-is-for goes by `grouped`
(InputWindow:245) — a separate path. Each of these, changed ALONE, must still save; returned to the original value, must
not. Doors: the Inputs page window (List row ✎, card, calendar bar, opened day's card), the schedule's pop-up (board
Personal Inputs row ✎, edit week), phone and desktop.

### 1g. D1582 — every door whose Undo takes back an input

Inputs page window save (`inputs.batch`), calendar bar drag, delete (day window / Delete key), OIL answer chip, people
picker change, a shared input saved for 3 people, Restore of a deleted input, a medical that cuts a leave (2 records),
the schedule's pop-up save, board row edits (Accept / Reject / → Ground / → Unavail / a time typed on an Unavailable
row — these may ride `sched.mutate`, untouched by this batch: **RECORD**), LATE tap (`inputs.lateOff`), Leave War
filing (`lw.file`).

### 1h. D1578 / D1585 — a weekend no period covers

Readers of the OIL answer once a period exists: Leave War grid cell (FO), his OIL count (OIL tracker / Balances), "OIL
earned" (person window / OIL tracker — RECORD where), the schedule's D19 advisory and "Create the period" button
(must stay, D1578 note), the Inputs page OIL question (must say nothing of the period, D1585), the input's own window
OIL question, the schedule pop-up's OIL question.

---

## 2. Ranked scenarios

Each: **fix · setup · action · EXPECTED (ruling) · DISPROVED BY**. Pictures after every press (phone: one within
~100 ms of the lift too, §7.10).

### Tier 1 — most likely to find a fault

**S01 · F2/F7 · Escape with the keyboard on a DATE and another window in front** (desktop 1440, `ad`)
Setup: Inputs → Calendar, July 2026. Tab into the month, arrow to 15 Jul, Enter → the day window opens. Press the month's
⚙ with the mouse → Inputs settings window opens in front (it wears the front mark). Now Shift+Tab / Tab until the keyboard
is on a date in the month (no click — a click opens a day, D1298). Record `document.activeElement`.
Action: Escape once.
EXPECTED (ui-contracts "ONE ESCAPE, ONE WINDOW"; F2 "closes ONE window, the newest"): the settings window closes; the
15 Jul day stays open. Second Escape: the day closes.
Disproved by: the day closes and settings stays (predicted from InputsCal.tsx:593 `if (popIso) closePop()`).
Variants: (a) front window = Calendar… window (opened from settings); (b) front = the OIL list; (c) front = the input
window (open an input from the day's card, then Tab back to a date) — here the input window's own listener runs first
and should close it (or ask, if typed) — record which; (d) arrows moved the keyboard to 16 Jul first.

**S02 · F8 roll-call · the Calendar window after a page change** (desktop + phone, `ad`)
Setup: Inputs → Calendar → ⚙ → "Calendar…" → the Calendar window opens over the settings.
Action: press the Edit Schedule tab.
EXPECTED (F8's own reason, "a window about a page nobody is on"): RECORD; my reading is both close. Disproved (or put to
him) by: settings gone, Calendar window floating over the week. Repeat from SANS → ⚙ → Calendar…, and from the SANS
day's Calendar…. Then: go back to Inputs — is the Calendar window still there, in sight? (lesson 10/12). Also open the
OIL list (bell line or a holiday save) and change page — RECORD.

**S03 · D1592 words · Make public on a PUBLISHED day** (desktop, `ad`)
Setup: PUB day (e.g. Wed 15 Jul), type a Programme note "Brief 0700" in Edit Schedule (pending 1), publish the AL so the
note is out scheduler-only (pending 0, signed).
Action: tap "Make public" on that note (edit week); then the same on the Board.
EXPECTED (D1592): view-only still shows NO note; the day reads 1 pending; the four sign-offs fall (D103); "To go out"
lists the note. The toast, the toggle label ("On view-only ✓") and its tooltip ("Showing on the view-only schedule")
must not claim it is on view-only already — RECORD their exact words; if they claim it, that is a finding (an untrue
sentence about a published schedule, D45). Then publish the AL: view-only shows "Notes · Brief 0700"; pending 0.
Disproved by: view-only shows it before the AL; no pending; sign-offs kept.

**S04 · D1586 on a PUB day · the issued face changes with no amendment** (desktop + phone, `ad` then `us`)
Setup: member files a late Duty input on Wed 15 Jul; admin Accepts it onto the Ground Programme; publish Wed. View-only
shows LATE on that row.
Action: admin taps LATE on the Board's Personal Inputs row.
EXPECTED: builder's call — issued face (View-only Sched, PDF) loses LATE at once; pending stays 0; sign-offs stay.
RECORD exactly; this is §7 call 1 — put to him with the picture beside a warning hidden on a PUB day (D471: waits).
Sign in as `us` (fresh browser): View-only shows no LATE; the bell has nothing new.
**S04b (order trap)**: same setup, drop LATE after publish, then delete the input on the Inputs page (1 pending,
"removed"). EXPECTED: RECORD — `lateShown` falls back to the issued copy's own (undropped) mark once the live record is
gone (view.ts:211), so LATE may REAPPEAR on View-only Sched for a deleted input. Undo the delete → gone again?
Reverse order: drop LATE BEFORE publishing, publish, bring it back (tap again) after publishing, delete the input →
RECORD (issued copy holds `lateOff:true`; the mark may vanish).

**S05 · D1592 · Make public on an EMPTY note of a PUB day**
Setup: PUB day, Sims note empty, signed, 0 pending.
Action: tap "Make public" on the empty Sims note.
EXPECTED: RECORD. Code: the composite becomes "␟public" ≠ "" → 1 pending, sign-offs wiped, "To go out" reads
"Sims note · → public" — for a change no reader can ever see (view-only prints a public note only with text). Candidate
finding (a pending that changes nothing on the face, D45/D103). Then tap back: 0 pending; are the sign-offs restored
(AM11)? Does the note keep a pending colour (S06)?

**S06 · D1592 · public and back again on a PUB day** (both orders, undo, reload)
Setup: PUB day, note with text, out scheduler-only.
Actions & expected: (1) Make public → 1 pending, sign-offs fall. (2) Tap again (scheduler-only) → 0 pending, sign-offs
come back (AM11), "To go out" empty, the note's own pending colour gone. Disproved by: the colour stays (noteChange leaves
`SCHED.pending` set). (3) Same via Undo instead of the second tap. (4) Reload after (1): still pending, still public in
the working copy. (5) Make public, then edit the note's text → ONE "To go out" line naming both; publish → view-only shows
the new text.

**S07 · F2 · the unsaved question by every way out** (Inputs page window, desktop + phone)
Setup: open Drifter's input from the List; type in Remarks.
Actions, each from fresh: Escape · the window's ✕ · Cancel · tap a different input on the page behind (the swap
question) · press Edit Schedule tab · sign out.
EXPECTED: Escape → "This input has unsaved changes. Close it and lose them?" (F2). ✕ / Cancel: RECORD — the code closes at
once (FloatWin `onClose={close}`); put to him (one window, two answers to the same act). Page tab: RECORD (it becomes the
schedule pop-up with the typing). On the question: Escape = Keep editing; "Discard and close" closes; "Keep editing"
leaves the typing.

**S08 · F2 · the question up, then another window brought in front**
Setup: input window with typing → Escape → question up. Press the month's ⚙ (settings opens in front).
Action: Escape.
EXPECTED ("one Escape, the newest"): settings closes; the question stays. Disproved by: the question answers Keep
editing and settings stays (InputWindow:414 skips the front check while `escAsk`). Then the keyboard in the List's search
box behind + Escape with the question up: RECORD (the delete question answers "wherever the keys are"; this one yields
to a text box — mismatch).

**S09 · D1581 × F6 × picker · two Escape listeners racing**
Setup: open 15 Jul's day; press Delete on an input → "Delete this input?" up. Without answering, press-and-carry Grit's
ATT C bar (13–17 Jul) one day right and HOLD.
Action: Escape, then let go.
EXPECTED: the first Escape puts the bar back (D1581) — nothing moves after the release; the question still up. Second
Escape: Keep (F6), day open, nothing deleted. Disproved by: the question goes and the release moves the bar.
Reverse order: carry first, then (keyboard) Delete on the day's input is not reachable while carrying — instead: question
up, turn the month with ‹ ›, carry, Escape (caldrag's listener was wired at mount, so it runs first either way — confirm).
Also: the people picker up (a note's "+ people") + carry + Escape.

**S10 · D1578 · end to end through the app** (desktop, `ad`; then phone, `us`)
Setup: Leave War → confirm no period holds 2029 (or 2028). Inputs → file a Duty for Sat 10 Mar 2029 for Drifter, all day.
Action: answer the OIL question Yes (D1585: no word about a missing period on the question). Edit Schedule → that week →
the day shows D19's advisory and "Create the period" (must remain). Publish Saturday. Then create the 2029 period —
twice, as separate runs: (a) by the schedule's "Create the period"; (b) on the Leave War itself. Leave War → OIL.
EXPECTED (D1578): Drifter's 10 Mar 2029 cell shows the OIL; his OIL count rises by one day; "OIL earned" shows it.
Then: Unpublish Saturday → the OIL goes; publish again → back. Variant: a public holiday no period covers (agent's
reading in D1578 — RECORD and name it to him). Variant: an answer of No → nothing earned. Variant: left unanswered,
period created → the question still asked on the Inputs page. Disproved by: the answer kept but nothing on the war after
the period exists, or the Inputs page saying anything about a period.

**S11 · F4 · every order of off / retitle / back on a PUB day** (the "To go out" list)
| # | before publish | after publish | EXPECTED words |
|---|---|---|---|
| a | taken off | retitle, put back | "<new title> · … → on the programme" (builder's test) |
| b | taken off | put back, THEN retitle | same as a |
| c | taken off | retitle only (stays off) | nothing listed (neither face shows it) — RECORD |
| d | taken off | put under Unavailable (an Other's Goes to), retitle | "→ under Unavailable", no old title |
| e | on the programme | taken off, retitle, put back | a change of title "Sports day → Games afternoon" (the published day showed it) |
| f | under Unavailable | taken off, retitle, back to Unavailable | change of title (seen) |
| g | taken off | retitle + new hours + put back | "on the programme", no "→" detail |
Then publish the AL each time: the view-only row matches; Undo each step: the list shrinks in reverse.

**S12 · F1 · each field changed alone must still save** (Inputs window, desktop; schedule pop-up, phone)
For each: change only it, Save, and check it was saved (card/row) with "changed by" and an Undo step:
person (scheduler), kind, own title, start, end, hours (all day → 0900–1000), half (AM), remarks, till tick, Fly/OFT/AMT
(SANS), a document attached, an Attach's "To", an Other's "Goes to", the OIL answer alone (→ "OIL answer saved", no
late date moved), adding a second person (picker), removing one. Then each changed and changed BACK before Save →
closes, nothing stamped (lesson 16: type the same value again after a tap away). Disproved by: any single-field change
silently closing the window.

**S13 · D1582 · the label of every door** (desktop, `ad`)
Read the bubble after Undo and Redo, and the Undo button's own label/tooltip, for each door in §1g. EXPECTED (D1582):
one input → "Undid: Drifter's ISR brief" (own title stands for kind: "Drifter's Games afternoon"); several inputs →
"Undid: 3 inputs". RECORD: an input of 3 people ("ISR brief for 3 people"?), an input for ALL AVAIL, an archived man's
input, a medical that cut a leave ("2 inputs"?), the LATE tap ("a LATE mark"), the board's Accept/Reject/typed time,
`lw.file`. Disproved by: "a personal input" anywhere.

### Tier 2

**S14 · D1586 · both orders, undo, reload, sign-out, week, second role**
LATE drop → Undo (one press brings it back) → Redo → reload → sign out → `us` signs in (Board read-only / View-only: no
LATE) → `ad` back → next week and back → still dropped. Restore by tap → one Undo step. Change history: "… · LATE mark ·
shown → hidden", then "hidden → shown". Member taps nothing (no chip); a hand-made press (dispatch click on a crafted
`[data-lateoff]`) → "Only a scheduler can change the LATE marks", nothing saved.

**S15 · D1586 · a shared input** — an Event filed for Drifter, Ranger, Grit (members, late). Board's one row's chip →
drop → all three faces' LATE gone (Personal Inputs one line, D661). Unavailable variant: a leave held by two men, chip on
one man's row → RECORD whether the other man's row loses its mark too (record-level drop). Then the scheduler adds a
fourth man; then a member re-edits (late again) → RECORD whether LATE comes back (it will not, by the code).

**S16 · D1588 · persistence and sharing** — Make public on an UNPUB day → View-only (DRAFT) shows "Notes" at once (RECORD
if members can see DRAFT days); reload; sign out/in; `us` sees it; next week and back; Undo → scheduler-only;
Redo. Board toggle and edit-week toggle agree after each.

**S17 · D1592 · undo across a publish** — PUB day: Make public → publish AL → Undo. EXPECTED: refused with "A day on this
week was published after that change — tap Unpublish…" (undo/timeline.ts:676). Unpublish → working copy keeps public;
publish again → view-only shows it. "Load onto working copy" of the Original (not public) → the note returns to
scheduler-only, pending as a change.

**S18 · F3 · the input window's calendar state table** (see T3) — desktop and phone; plus D1298 interplay: with the window
waiting for an end, tap a date on the month BEHIND (lesson 4) — what lights, and what the window says.

**S19 · F5 · dragged windows on small phones + keyboard** (320×568 and 402×874)
Calendar window on August 2026 (six weeks): drag low, back up, quick flick (lesson 20) → its last week inside the screen,
body scrolls. Repeat for: Inputs settings, the input window (drag it, then tap Remarks: keyboard up — Remarks above the
keys AND not under Cancel/Add, lesson 5), the SANS settings. Rotate sideways after a drag → RECORD (cap from portrait
`innerHeight`?). Day windows (`rests`) unchanged.

**S20 · two tabs (§6 storage rule)** — Tab A `ad` and Tab B `ad` both open on Edit Schedule BEFORE any write. A: drop LATE;
B (untouched): edit the same input's remarks on the Inputs page → after both, is LATE dropped? A: Make public on Wed's note;
B: edit a Wed ground row → is the note still public after B's write? Then reload both. RECORD.

**S21 · F9 · every Calendar door, every fallback** (1440 and his 1536; 2560 wide, lesson 11) — SANS day at its own place →
Calendar… opens LEFT of it, neither's ✕ covered. SANS day dragged to the far left → Calendar… → RECORD (fallback corner
covers the day?). Calendar already open from settings → SANS day's Calendar… → comes forward, moves? Close Calendar,
open it from Inputs settings → where (stale beside request)? Close each by ✕, Escape, Close (lesson 19).

**S22 · F6/F7 · Escape wherever the keys are** — the delete question with the keyboard in the List's search box (Escape
should be Keep — "wherever"); a month arrow ‹ last pressed + a window up → window closes (F7); a SELECT behind (type filter)
holding keys → its own Escape; a checkbox behind (an INPUT) holding the keys → RECORD (it blocks the window: INPUT is
exempt by tag, though a checkbox has no Escape of its own).

**S23 · D1581 more ways** — carry, quick short flick then Escape before release; carry to the month's side so it turns,
then Escape (EXPECTED: bar back on its own dates, nothing moves; month stays turned — RECORD); carry a planning note
(not a bar) + Escape; Escape twice (second closes the front window); the release after Escape lands on another bar —
must not open it (click-eater). Undo after: nothing to undo for the carry.

**S24 · F10 / D77** — ALL AVAIL window at 402×874 (no corner) and at 844×390 sideways: the stylesheet's phone rule is
`max-width:620px`, so the sideways phone gets the desktop window with `resize:both` back — RECORD the corner (D77 says
no phone resize corner). Changes window the same. His iPhone on the look card (lesson 6).

**S25 · D1583 (b)** — 844×390, SANS → Highlight: list foot inside the screen, scrolls inside itself, last person
pickable; at 1440×700 short laptop; open, rotate, reopen. Picture after the press on the last person.

**S26 · F1 on a PUB day** — open an accepted input of the PUB day, Save with nothing changed → nothing pending, no sign-off
lost, no bell for the member (it used to stamp). Then change one field → 1 pending, sign-offs fall.

---

## 3. State tables (§7.4)

**T1 — the Escape stack.** Rows = state; columns = where the keys are (a box behind / a button behind / a date / inside
the front window / nowhere). Each cell = which ONE thing Escape ends.

| State (front last) | expected end |
|---|---|
| day | day |
| day → input window (clean) | input window |
| day → input window (typed) | the question appears; next Escape = Keep editing |
| day → input window (typed, question up) → ⚙ settings | settings (S08) |
| day → ⚙ settings | settings (S01: keys on a date) |
| day → Delete question | Keep (any keys) |
| day + bar carried | bar back |
| day + Delete question + bar carried | bar back, then Keep (S09) |
| day + people picker | picker (as Cancel) |
| input window + OIL question sheet | the OIL sheet |
| input window + document viewer | the viewer |
| SANS day → Calendar (beside) | Calendar |
| List date-range calendar open + input window | the date-range calendar (InputsPage:377 goes first) — RECORD |
| a box behind holding keys (any window) | the box's own (text put back), no window closes |

**T2 — the LATE chip.** shown/dropped × PUB/UNPUB × admin/member, each × {tap, Undo, Redo, reload, week change, input
edited late again, input deleted}. Read on: Board live chip, Board RO, edit week, View-only, PDF, Inputs page, history,
pending count, sign-offs, member bell.

**T3 — the input window's calendar (F3; `RangeCal startHolds`).**
| State | tap same day | tap later day | tap earlier day | Save |
|---|---|---|---|---|
| nothing picked (List "+ Input") | start set, waiting | start set | start set | refused "Pick a start date…" |
| start set, waiting (14) | stays 14, waiting (F3) | 14→16 | new start | one-day 14 |
| range finished (14→16) | new start 14 | new start | new start | saves 14→16 |
| existing one-day input opened (14, no end) | stays 14 | **RECORD**: 14→16 (extends, does not move it) | new start | nothing changed → closes (F1) |
| clash shown "Take theirs" on dates | — | next tap = new start (A4) | | |
Also: what on screen says "waiting for its end" after the second tap (lesson 3). And the List's own date filter: 14, 14 =
one day (MUST stay).

**T4 — a section note's public flag.** scheduler-only / public × issued-as / changed-since × PUB/UNPUB × note empty /
with text, each × {toggle, toggle back, text edit, Undo, publish AL, Unpublish, Load version, reload}. Read on: edit week
label + toggle, Board label + toggle, View-only, PDF, pending count, note colour, sign-offs, "To go out", history.

---

## 4. The plain-user round (§7.0a, D1557) — desktop 1440 then phone 402, pictures each step

Member `us`:
1. Inputs → Calendar → tap Wed 15 Jul → the day opens. "+ Input" → kind ISR brief, Remarks "Room 2" → Save. Card in the
   day and bar on the month wear the just-added mark; no note needed (D851).
2. Tap the new card → the window opens. Change nothing → Save → it closes; no "changed by" line, no Undo step (F1).
3. Open again, type Remarks "Room 3" → Escape → the question → Keep editing → Save. Undo (top bar) → "Undid: <you>'s ISR
   brief" (D1582) → Redo.
4. Open again, type → press ✕ (RECORD — asks?) → reopen; type → Cancel (RECORD).
5. Close the day by its ✕; reopen by Enter on the date; close by Escape; reopen; tap outside (page behind) — the day stays
   (D641).
6. Look elsewhere: Edit Schedule (as member: View-only Sched) Wed — the request? Bell — anything? Person window (tap his
   puck) — the input listed? Next month and back.
Admin `ad`:
7. Board → Wed → Personal Inputs: `us`'s ISR brief wears LATE → tap → dim; toast. Edit week Wed → no LATE. View-only Sched
   → no LATE. Inputs page → still LATE. Change history → the line. Undo → back. Redo.
8. Board → Programme note → type "Brief 0700" → Make public → View-only shows "Notes · Brief 0700". Close the board by its
   Done; reopen; reload.
9. Accept `us`'s input to the Ground Programme → publish Wed (signs + Publish). View-only: the row, LATE state as left.
10. Inputs → ⚙ → Calendar… → close Calendar by ✕; reopen; close by Escape; ⚙ again → switch to Edit Schedule → back to
    Inputs (settings gone; Calendar?). SANS → tap a day → Calendar… (beside) → close each by ✕ and Escape.
11. Leave War → OIL: anything for July weekends? Another period via the View picker and back.
12. Sign out; `us` signs in: bell, View-only Wed (public note, LATE dropped), Inputs page (LATE printed).

---

## 5. §7.11 lessons — which scenario covers each here

1 state × reading — T2, T3, T4, S06. 2 gesture speed — S19 (quick flick), S23 (quick carry). 3 feedback — S03 (toast/label
truth), T3 (what says "waiting"), S12 (silent close tells nothing), S14 (toast). 4 press behind a window — S01, S18 (date
behind the waiting window), S08. 5 box vs what stands over it — S19 (Remarks after a phone drag, keyboard up). 6 only the
real phone — S24 corner glyph, S19 iPhone keyboard with the new cap, S25 sideways: on his look card. 7 frame-by-frame
model — cannot apply: nothing here steers against a motion the phone makes (the F5 cap is static, worked out per render).
8 approved drawing — no drawing for these fixes; the new "unsaved" question is drawn as the swap question: §7.10 close-up
beside it (S07). 9 list alignment measured — the "To go out" lines (S11) are measured column-to-column on phone and
desktop; otherwise no list/table changes. 10 way back to a hidden page — S02 (page away and back), S14/S16 (week change and
back), S10 (Leave War and back). 11 reading by screen size — S21 at 1536 zoomed out and 2560; S19, S25. 12 window from one
page only — S02, S21 (every Calendar door, Logic's rows → settings). 13 pinch part-way — cannot apply: no pinch touched.
14 keyboard walk from a code search — S19 boxes in the dragged input window, the settings' cut-off boxes (S02 — typed
then page change). 15 pinned bar fill — cannot apply: no pinned bar changed. 16 same value again — S12 (changed back),
S26. 17 control that resizes a page — cannot apply: none added; F10/F5 change window size only (S19, S24 measure screen
edges). 18 print — S04 and S03: Export as PDF of the PUB day, print-media pictures Chromium + WebKit (LATE, public note).
19 window over window closed every way — S21, S07, S10 step 10, T1. 20 gesture as a hand does — S23, S19. 21 test
browser touch ≠ his phone — the carry (D1581) is keyboard-only, so its phone half cannot apply; F5's drag is named on
his look card.

---

## 6. Explicit negatives (looked at, judged safe — still walked where the round passes them)

- The bell is not rung by a LATE drop: `notices.ts common` compares cx, place, dates, hours, people, title — no `lateOff`.
- A LATE drop makes nothing pending: `inpDetailKey` (engine/inputs.ts:197) has no `lateOff`.
- A member cannot drop a LATE mark in the app: `setLateOff` checks `canEditSched`; `inputs.lateOff` is `op(T.sched,'U')`;
  the chip is drawn only on live board rows (RO draws `lateTag`). (The server-side breach list is the gap in 1a.)
- `lateOff` survives a member's or scheduler's edit: `commitInputEdit` writes fields in place, never rebuilds the record.
- A face of a shared input finds its record: `facesOf` copies the iid, `setLateOff` looks up by `inpId`.
- `npub` rides the issued copy and plans: it is in `DAY_CANONICAL_FIELDS`; the issued face reads `notePub(k, d)` with
  the drawn day on every caller (html.ts blkNoteHTML, board-html.ts sbNote — the only two).
- `HOOKS.histPush()` after the Make-public command is the storage push, not a second Undo step.
- The window-state move (`winorder.ts`) is the old FloatWindow code whole; `DocField` re-export repointed in
  leavewar/sync.ts; `InputEditor` import in App.tsx — no behaviour change read.
- Escape over a carried bar on the SANS calendar — cannot apply: SansCal has no carry (no `initCalDrag`).
- F1's no-change test covers every field the window writes (`setDraft` keys = WIN_FIELDS + `to` + `goes`); who-it-is-for
  goes by its own `grouped` path before the test.

---

## 7. The builder's three calls

1. **The LATE drop is no change of the input (no stamp, nothing pending).** No stamp: **supported** — the LATE rule
   measures the input's own last change (`isLateInput`), and a stamp would make the input itself later. Nothing pending
   on a published day: **contradicted by the pattern of his rulings, his to decide** — the mark is drawn on the issued
   face (View-only, PDF), so the drop changes what readers of a published day see with no amendment; his D471 made a
   hidden warning on a published day wait for the amendment, D1592 the same for Make public, and D45's test ("a reader
   could see a different answer tomorrow") is met. Put S04 to him with pictures.
2. **The unsaved-work question only on the Inputs page's window.** **His to decide**, but the bigger gap is inside that
   one window: Escape asks while ✕ and Cancel throw the typing away (S07). The schedule's pop-up closing on a tap outside
   is the standing pop-up rule (D641's exception covers only the D641 windows), so leaving it is consistent.
3. **F3 in the input's window only.** **Supported** — in the input's window one tap is already a whole one-day input,
   so a second tap has nothing to finish; on the List's date filter two taps on a day are how a one-day window is
   picked (F3 named "the input's calendar").
