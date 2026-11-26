# Build 1 plan after the round-5/6 fold, red team — a fresh, blind Opus (chat 191, 26 Nov 26)

Read from the exported copy C:\rc191 of 22ada16e1. Saved whole by the host.

# Red-team read 191 — Build 1's plan after the round-5/6 fold and the four-section split (fresh blind Opus)

Copy read: C:/rc191 (one commit). Plan: `raptor-port/docs/superpowers/plans/2026-11-25-msq-pick-guard-build1.md`.

**What I read whole:** the plan's head and §1, §8 (8.1–8.5), §10, §11, §13, §18.3, §19.3, §19.7, §19.8, §19.11–§19.13,
§21, §22, §23; §3.2 (f) and (h), §3.4, §4.1. The full rows D2636, D2638–D2657 and the D-rows the posting sheet cites
(D300, D332, D487, D1462, D1626). The round-6 page's own readings N2, N3, N6, N8, N13 (`scripts/handpass/n188/page/`).
**Code read:** `ui/postout.css`, `leavewar/ui/OutcomeChips.tsx`, `state/bellsqn.ts`, `state/reports.ts`,
`ui/AdminPage.tsx` (the left column's list), `state/perms.ts mayViewAsMember`, `ui/topbits.tsx BellList`, parts of
`leavewar/ui/Sheet.tsx` and `leavewar/ui/BidPicker.tsx`. **Only searched (not read):** every `<Sheet`/`<AskCard` in the
posting files, `NOT_STEPS` and the settings-command registrations, the test files under the new prefixes, who imports
`postout.css`, where SquadronsPanel's forms are. **Not checkable here:** what `main` holds (this copy has one commit),
so finding 3's first half is stated as conditional. Nothing was run or pressed.

Out of scope by the brief: data already stored (D56); a scheduler who is not an admin (D785).

---

## Ranked findings

### 1. HIGH — §21's "waits on" cells drop holds that the rest of the plan says stop specific steps; four section chats briefed from §21 would build open readings as his rules (lesson 32, D2611)

§21 says it "is the spine of the coordinator's brief and of each section chat's", and §10 says §21 "wins over this
section wherever the two differ". But several holds that §1 (condition 2), §8.5 and §17 attach to steps are not in
their §21 cell:

- **N14** (the saver never ends a send that never answers) holds "the core's steps 3 to 5, that clause alone" (§8.5),
  which are K4, K5 and K6. Only K4's cell names it; **K5 and K6 read "—"**. Who/what: the K5/K6 builder writes B20's
  "wait for a save" at the view switch and the bell on N14's default, which §8.5 says is unanswered.
- **Reading 18** (his own SANS reminder brings his own squadron into view first — §4.1 row 9b, "no page yet") is
  built in **K6** (§10 step 5 names "the SANS reminder's branch"), and K6's cell is "—".
- **Reading 19** (a moved master admin's old inputs follow the view he is in — F15) is in **K9**'s tests; K9's cell
  holds only the D11 redraw.
- **Reading 20** (the Calendar's note named first) rides K1/K3 with no hold in either cell.
- **Readings 22 and 23** — D2626's "own admins" read as "admins who can sign in", and a replay by one who lost the
  right "blocked for good" — are **permission rules** built inside **U2**'s one commit (§19.2 point 5, the replay
  rule). U2's cell holds only NQ1 and the words. §17 says of both "not put to him; no page".
- **U5** waits on "the two readings of §8.5 **told** to him on the mock-up page"; **BL2**'s other Display readings
  (Reset goes back to the start colour, the section lists every squadron under Show, the start colour worked out from
  the squadron, a colour Save is no Undo step) are "told in the section's mock-up page" (§19.13). Telling is not
  answering: §8.5's own heading says "None is built before he answers", and D2611 says each reading is put to him as
  its own question, never built on.

**What goes wrong:** the Users chat ships a fail-closed rule about which admins may give Plan, and the bell chat ships
Reset and the start-colour rule, each as if he had ruled it — the lapse D2567 asked Fable to stop.
**Fix:** copy every hold into its §21 cell (N14 into K5 and K6; reading 18 into K6; 19 into K9; 20 into K1; 22 and 23
into U2); change U5's and BL2's "told" to "answered, or that piece left out"; add a line to §21's rules for every
section: "a `(reading)` or an open code in your step's text holds that piece even if your cell does not name it".

### 2. HIGH-MEDIUM — The core must change `leavewar/ui/BidPicker.tsx`, which §21.1 forbids it and §21.5 does not list; and the guard's own scan reads the posting sheet's files

- §3.2 (f) builds E9b (his answer, D2654): "a sheet may be opened with `showOnly`", and K1 changes "the Leave War's
  show-only sheets as E9b's list decides". Two of the most likely show-only sheets live in **BidPicker.tsx**: "Your
  OIL award" (`award-sheet`, l.1356) and "Leave filed on the Inputs page" / "OIL the app credited"
  (`raptor-sheet`, l.1250) — each a title, a line of text and a ✕. Marking them means editing their `<Sheet …>` call
  in BidPicker.tsx. §21.1 says the core "must not touch BidPicker.tsx"; the posting sheet changes the same file and
  ships alone from `main`.
- **R3** ("every frame is counted, one by one") pins **a count per file** of `<Sheet `, `<AskCard`, `role="dialog"`
  and the like, across every non-test file. BidPicker.tsx has 5 `<Sheet` and 2 `<AskCard` today; SelectSheet.tsx 1
  and 1. If way C adds, removes or moves one (PS1–PS3 restructure the posting, its Delete card and the existing
  posting's sheet), then the day the batch branch brings `main` in, **the core's** R3 fails — not the posting sheet's
  tests, which are the only ones risk 39 says the coordinator re-runs.

**What goes wrong:** either the core builds E9b's answer only half (the two sheets left refusing, against his
answer), or the core edits a file another chat is rewriting; and the batch goes red on a test neither chat owns at
that moment.
**Fix:** add BidPicker.tsx to §21.5 — the core owns the one-word `showOnly` marks, landed on `main` first as a tiny
change, or the posting chat adds them on the core's list; PS0 pins the R3 counts of BidPicker.tsx and
SelectSheet.tsx; risk 39's after-merge run includes `msq-guard-rollcall.test.ts`.

### 3. MEDIUM — "Ships alone, cut from `main`" may start the posting chat without the plan, the rulings and the code it builds on

§21.4's reading cuts the posting branch from `main`. The round-6 rulings D2638–D2657, lesson 105, the design report
`2026-11-26-msq-r6-posting-sheet-report.md`, the `p6-*` pictures and this plan's §22 are all on this branch; the
batch branch is pull request 826, open, with code `main` lacks (`HANDOFF.md`; §9). **If they are not on `main`**
(this copy cannot show it), the posting chat cannot read §22 from its own checkout, and its records step (the Leave
War page's posting-sheet line citing D2653, `ui-contracts.md`) cites rulings `main` lacks. `npm run docsize` would
fail on them, or the chat copies the rows over and the two copies have to be reconciled at the batch's merge. Also
BidPicker.tsx on this branch carries the move-band code (`warBand`, l.47, l.506–604); if `main`'s differs, way C is
built on a different file from the one the batch will hold.
**Fix:** the coordinator's first act lands the round-5/6 rulings, lesson 105 and the design report on `main` as a
notes-only pull request, and the posting brief tells the chat to diff the four posting files between `main` and the
batch branch before PS1. Or cut the posting branch from the batch branch and say it waits for the batch (the
alternative §21.4 names).

### 4. MEDIUM — The bell section must edit the Undo engine and the settings-command files, which §21.3 does not list

Every "no Undo step" saved setting is registered in `undo/timeline.ts NOT_STEPS` (l.275 — `bell.squadrons` is there),
in `state/people-settings-commit.ts SETTINGS_ROW_PREFIXES` (l.97), in `state/people-settings-wire.ts` (l.20), and
through `perms.ts`'s row table (l.106, l.159, l.751) and its owner check (l.3856–3864, l.4234). A new saved collection
also needs `command/`'s `LOGICAL_TO_BLOB`. The colours (§19.13: "a colour Save is no Undo step") and bug reports
("seen" records, "neither an Undo step") need the same. §21.3 says only "the storage and command files a saved report
needs". `undo/timeline.ts` is the core's K8 file, and §21.5's row for it names only the core and Users.
**Fix:** name these files in §21.3 and add the bell section to §21.5's `undo-wire.ts` / `timeline.ts` row (it touches
only `NOT_STEPS` — the core's K8 first, or whoever is second brings the branch in).

### 5. MEDIUM — No ruling-number range, lesson range, register-row range or test port for each section

`doc-structure.md`: "Parallel chats each touch only … their own D-number range". `shipping.md`: "each keeps its own
branch, ports and rulings range". D1417: "a branch that will add lessons takes a range of lesson numbers first".
§21's rules give a section its own `## Now` block and backlog lines, but no D range, lesson range or E2E port. The
notifications register's rows are numbered too, and both Users (Plan and callsign lines) and the bell (the bug
alert's reach) add rows.
**What goes wrong:** he answers a mock-up question in the Users chat and another in the bell chat on the same day.
Both take "the next free number", D2658. Or two browser runs land on one port and test the other chat's build.
**Fix:** a §21 rule — the coordinator hands each section a D range, a lesson range, a register-row range and an
E2E port before it starts.

### 6. MEDIUM — The Users and bell sections really wait on K1's waits, which have nothing to do with them

The core is "one chain". K2 (the top row) comes after K1, and K2's own report (`useGuardWork('addperson', …)`)
needs K1's `ui/guard.ts`. K1 waits on the lull pop-ups being pressed, E9b's list being told to him and the
Calendar's notes being drawn. So "Admin → Users once the core has moved '+ Add a person'" in fact waits on those three
Tracker, Leave War and Calendar items, and K2's own redraw (finding 6 of §21.5). The bell, waiting on K6, waits on
every wait in K1–K5, about 44 of the core's hours (§13).
**Fix:** split K2 into a visual move (the top row and form, no guard report) taken straight after K0, and its report
added in K1. Or say plainly in §21.2 and §21.3 that both sections wait on K1's three items.

### 7. MEDIUM — "Edit on 142 →" sits in U1's tests, but its door is the core's K4

§19.1 holds "Edit on 142 →", and its test V1 presses it "with the line changed and not saved, or with a window open:
refused as a pick". §21.2 gives V1–V4 to **U1**, which "waits on … Nothing else" beyond K2, while it moves "Edit on
142 →" to **U3** (waits on K4).
**What goes wrong:** the U1 builder, following §19.1, either cannot make V1 pass before K4 lands, or wires the link
straight to the pick with no guard — risk 30's own example.
**Fix:** move V1's "Edit on 142 →" clauses into U3's tests (name them, say V11's or a new V-number), and strike the
link from U1's scope.

### 8. MEDIUM — N3 h ("wherever squadrons are listed, your home squadron first") is ruled app-wide and built on one page

D2652 took N3 h as the page wrote it: "wherever squadrons are listed, your home squadron first, then the rest by
number". §19.3 restates it as "wherever they are listed", but it is built and tested only for Admin → Users' folded
headings (V11). Today the Schedules menu, the ☰ menu's list and the bell's Show row list by number
(`bellsqn.ts bellSquadrons`: "By number, as the Schedules menu lists them"); the Display page's colour list and Admin
→ Squadrons have no stated order.
**What goes wrong:** Mako (home 150) sees "150, 142" on Admin → Users and "142, 149, 150" in his Schedules menu and his
bell's Show row. One rule, two orders. This is not built and not put to him.
**Fix:** either steps — the core for the two menus, the bell section for the Show row and Display — or mark "this page
only" as a reading on §8.5's list and put it to him.

### 9. MEDIUM-LOW — The new test-file prefixes are already taken, so R9 cannot tell new files from old

§21.5 finding 5 names the sections' new files `msq-users-*` and `msq-bell-*`. Eight existing two-squadron files
already use those prefixes: `ui/msq-users-filter`, `ui/msq-users-row`, `ui/msq-bell-show`, `ui/msq-bell-tap`,
`tracker/msq-bell-input-ask`, `tracker/msq-bell-recheck-after-ask`, `leavewar/msq-bell-audience` and
`leavewar/msq-bell-rights`. R9 ("fails a new test file that does not call `withThird()`") is defined in one
sentence. Matched by name, it either fails those eight, which step 0 says stay on two squadrons, or misses the
sections' new files.
**Fix:** give the new files distinct prefixes (for example `msq-v-users-*`, `msq-v-bell-*`), or have R9 read an
explicit list that the coordinator owns.

### 10. LOW-MEDIUM — The group B reminder moved from "after the first build" to "when the batch is built"

D2636, in his words: "Group b ill answer after te first build. remind me". The ruling says "after Build 1 is built".
§21.1's closing step is "made by the coordinator **when the batch is built**". The core may be built days before the
Users and bell sections.
**Fix:** the coordinator puts group B to him when the core section's last step lands.

### 11. LOW-MEDIUM — §19.11 V0 contradicts D2657

V0: "each step below waits on its own drawing … **not on every drawing of §19**". D2657 and §21's rule: each
section's mock-up page "seen by him **before any of it is built**". A Users builder reading §19.11 would start U1 once
its own row is drawn.
**Fix:** strike V0's clause, pointing to §21.

### 12. LOW-MEDIUM — PS3's "pressing the day again" may need `Sheet.tsx` changed, and the posting section may not touch it

D2653 d and PS3: pressing the day again gives the leave buttons back. With the head no longer naming the day (f), the
only "day" is the grid's cell behind the sheet. `Sheet.tsx`'s own notes say a press aimed under an open sheet is
caught by its scrim or capture listener, and the sheet closes on that click. So one press closes the sheet, it does
not give the leave buttons back. Making it do so needs `Sheet.tsx`, which §21.4 forbids ("the core reads it").
I read this, I did not press it.
**Fix:** §22 says what the press is — the sheet closing and a second press opening it fresh, with leave buttons —
and PS3's test says the same; or the coordinator lands the one `Sheet.tsx` line.

### 13. LOW — §19.12: does a jump's count match its heading's?

§19.12 gives the desktop jumps as "People 60, Outgoing 1, Incoming 1, From other squadrons 1" and also says "the
heading's count is all of them". V33's block on 149 is Hunter, Saber and "View only · 2", which is 4. V36 asserts
the jumps "with their counts" but does not say which count. The round-6 page itself mixed "Others 1" with "From other
squadrons · 4".
**Fix:** one sentence — a jump's count is its heading's count — and V36 asserts it.

### 14. LOW — small slips a section chat would trip on

- Risk 39 cites "§21's finding 2" for `ui/postout.css`; it is finding 1 (finding 2 is `perms.ts`).
- The test names PS1–PS8 (§22) clash with the step names PS0–PS4 (§21.4). "PS3" means two different things.
- §21.1's changed-file list leaves out `ui/SquadronsPanel.tsx`, where K1's reports for "+ New squadron", `MoveEditor`
  and `PlaceEditor` go (§3.2 (h)). No other section touches it, so no clash.
- §18.3's "After" bullet still opens "on the People row after Filter … above the first person", unstruck. The round-6
  bullet above it says it wins, but G3's first clause still reads "the button stands after Filter".
- §19.13 e builds N2 e ("one whose bell **shows** more than one squadron") as "**can show**": an admin who switched
  his other squadrons off still sees the section. This is sensible, but it is an unmarked narrowing of his words. Mark
  it as a reading.
- The head lists the codes whose "(default)" is now his answer as "E1–E9, D5, D6, D8, D10, D11, D12". §1's condition 2
  lists "E1–E9, D5, D8 and D10". Harmless, but they should agree.

---

## The four questions, answered in short

1. **Does the fold say what he ruled?** Mostly yes. Every D2638–D2657 row has a place, and the clashes §23 names are
   settled the right way (the later ruling wins). Gaps: N3 h is built on one page only (finding 8); D2636's timing
   moved (finding 10); N2 e is narrowed without a mark (finding 14). "(Default) now means his answer" holds for every
   E and D case I checked against the page. But §21's cells let still-open readings be built (finding 1).
2. **Is the split safe to build in parallel?** Not as written. BidPicker.tsx is shared but unnamed, and the guard's
   R3 scans the posting files (finding 2). The bell section's Undo and settings files are unnamed (finding 4). The
   Users section's start is gated by K1 (finding 6). "Edit on 142 →" crosses U1 and K4 (finding 7). The test-file
   prefixes collide (finding 9). Ruling ranges and ports are missing (finding 5).
3. **What goes wrong first.** The posting chat, "at once" and cut from `main`, opens a checkout without §22 and the
   rulings it builds (finding 3, if they are not on `main`). In the batch, the Users chat sits idle until the E9b
   list and the lull pop-ups are put to him (finding 6). The first wrong thing built would be a reading in U2 or K6
   taken as his rule (finding 1).
4. **§19.12, §19.13 and §22 against the rest:** findings 1 (Display's readings), 8, 12, 13 and 14. The colours'
   store, Undo and gate follow the bell-switch pattern correctly, but the files it implies are unnamed (finding 4).
