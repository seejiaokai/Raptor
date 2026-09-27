# Evidence — `[POST-OUT-OUTCOMES]`: a posting out says which it is; suspend, enable, delete; the admin's member view (D229, D280, D283–D300) — 27 Sep 26

Branch `claude/post-out-outcomes` (cut from `claude/accounts-new-person`, PR #443; PR #444's posting code merged in,
`4f3c40cc`). Plan `docs/superpowers/plans/2026-09-27-post-out-outcomes-plan.md` (red-teamed twice by Fable 5.1 and Astra —
`docs/superpowers/specs/2026-09-27-post-out-outcomes-redteam-r{1,2}-{fable,astra}.md`; its Round 2 wins). Approved design
`docs/mock/post-out.html` (D299, trimmed per D300). Register `docs/superpowers/specs/2026-09-26-accounts-behaviour-register.md`
rows PO1–PO12. Built by Opus 5.5. Walk scenarios designed by Fable 5.1 and Astra, blind to each other
(`docs/superpowers/briefs/2026-09-27-post-out-outcomes-scenarios-{fable,astra}.md`). Walk scripts
`scripts/handpass/po-walk-{a,b,c}.mjs`; pictures `docs/img/handpass/2026-09-27-post-out-outcomes/{a,b,c}/`.

## 1. The eight questions and the tier
1 Money — YES: a deleted man earns no OIL from his cutoff; his OIL tracker row goes (earned leave, D25). 2 The published
record — YES: a delete on a published day to come (pending, the four fall), a day he flew never pending, the load of an
issued version. 3 Saved data — YES: the hidden mark (`deleted`, `deletedFrom`), `sanBy`, `archivedBy 'del'`, the
account's `offBy`, the posting's `poOutcome` / `poDone`. 4 A shared drawer — YES: a deleted man must vanish from every
list and picker; the four chips on three posting doors. 5 A new gesture or mode — YES: the chips, Delete's two taps,
Rename / Restore-as, the "he's back" prompt, the member-view switch. 6 A new surface — YES: those same controls. 7 Roles —
YES: who may delete, post out, restore, rename; the member view. 8 The warning list — NO (a deleted man leaves days to
come through the funnel; no rule changes). **Tier: FULL.** The server question (D202): `perms.ts` and data-model §11
changed together — `User` D for an admin; `person.delete`, `person.restore`, `lw.postout`, `lw.postoutRun` named with every
table they write — `perms.test.ts` and `perms-scan.test.ts` green.

## 2. The rulings swept
The plan's §The rules sweep, and in its Round 1 "the rulings the plan forgot": D229, D280, D281, D283, D284, D285, D286,
D287, D290, D292, D294, D295, D297, D298, D299, D300; D301, D302; with D44, D45, D103, D186 (nothing on a published day
changes unseen), D2 / D142 (OIL from the latest published version), D166, D200, D201, D204, D214, D217, D226, D56, D90,
D138. **Clashes settled by the newer ruling (D90):** D297 narrows D287 (the published record stays true); D292 replaces D166
(3)'s "no preview as a member" — its stale text corrected in the rules doc, the screen contracts, the Drawer and the four
editor sheets' comments (D201); D286 narrows the one-callsign rule (PID-01).

## 3. The roll-call — every place the change reaches (the plan's 33 rows)
**Walked** = on the running app, a picture in the folder; **Test** = a named unit test; **No-because** = its reason.

| # | Place | Result | How |
|---|---|---|---|
| 1 | The bid sheet's PO, desktop + phone | chips, one line, "Post out"; Delete asks twice | Walked a01, a02, c10 · Test po.test.tsx |
| 2 | An existing posting's Post out sheet | the same chips, commit on change; SANS taken back; Undo post out; the armed Delete backs out | Walked a13–a15, c07 · Test po.test.tsx |
| 3 | The drag selection's PO | the same chips and line (`sel-po-*`) | Test selectsheet.test.tsx (the old suite, green) · **not walked** (§8) |
| 4 | The pass — a date come at confirm; a date to come arriving | each outcome once; `poDone`; a hand Enable not re-suspended | Walked a03, a11, a16 · Test postout-outcomes.test.ts (clock moved) |
| 5 | Admin → Users row + editor | "suspended"; Suspend / Enable; Delete account, two taps; own row closed; last admin refused | Walked a04, a09, b03, b04, c13 · Test accounts-ui.test.tsx |
| 6 | The sign-in of a suspended / a deleted account | "Your access is suspended…"; a deleted one → Request access | Walked a06, a22 |
| 7 | Quals table, CSV, Archived list | a deleted man on none; an overseas man on Archived | Walked a05, a18 · Test quals-archived.test.tsx · CSV **not walked** (the same roster filter) |
| 8 | Quals Archived: Rename; Restore (free); Restore (taken) | inline rename; restore; "Hex is taken…" box, "Hex 2", one step | Walked a07, c11, c12 · Test quals-archived.test.tsx |
| 9 | The back prompt on Quals | after Restore / Enable; Check → his row outlined; Later | Walked a07, a08, c12 · Test quals-archived.test.tsx, accounts-ui.test.tsx |
| 10–11 | Approve / the one add with an archived-only callsign | New person allowed | Test callsign.test.ts, roster-add.test.ts, accounts-newperson.test.tsx (Part A) |
| 12 | Crew palette, board crew, Available crew, day ⓘ | deleted man absent | Walked b05 (the aircrew list without Hex) · the roster filter (`archived` rides the mark) |
| 13 | ALL AVAIL | by date: counted before his cutoff, never from it | Test postout-outcomes.test.ts (availableFor) |
| 14 | Inputs: add, filter, row editor | never offered for a new input; the filter's "Deleted" group finds his kept inputs; his own row shows his name | Test quals-archived.test.tsx · the row editor **not walked** (§8) |
| 15 | Sign-off boxes | not offered; his signature on a day to come cleared | Test person-delete.test.ts |
| 16 | A past day holding him | his puck; nothing pending for the delete | Test person-delete.test.ts (published and not) |
| 17 | A day to come, unpublished | he is gone from every kind of slot | Walked b06 · Test person-delete.test.ts (every kind) |
| 18 | A day to come, published | issued face unchanged; working copy without him; "1 pending"; the four fall | Walked b05, b07, b08 |
| 19 | A stashed week / a parked plan to come | gone there too | Test person-delete.test.ts |
| 20 | Load a published version / switch a plan on a day to come | he is left out; the message says so | Walked b09 · Test person-delete.test.ts |
| 21 | Undo after a delete | never brings him back; the greyed button says why | Walked b10 · Test timeline.test.ts |
| 22 | His inputs: past / spanning / future (and spanning with its row landed on a day to come — R6) | kept / ended the day before, still accepted / gone | Test person-delete.test.ts |
| 23 | Leave War grid: months he was here; after | his row with leave; no row | Walked a19, a20 |
| 24 | Leave War OIL tracker | no row for him | Test (the `gone` guard) · **not walked** (§8) |
| 25 | OIL pass on a published day to come | no credit for him | Test (the `creditable` date rule) |
| 26 | Planning calendar pucks | a gap from his date | Test person-delete.test.ts |
| 27 | Tracker Students card | **no-because:** `[POST-OUT-TRACKER]` — the Tracker's "course still running" is his to define (question 5) | — |
| 27a | Tracker "+ Add" roster | a deleted man not offered | by construction: `peoplewire.ts` skips an archived body, and the mark sets `archived` (Fable) |
| 34 | A posting that must wait (the last admin; a stored week) | the sheet says so first; nothing half done; his account row says why | Walked d01–d03 · Test postout-outcomes.test.ts (R1, R2) |
| 28 | Leave War with a SANS posting, Show SANS off / on | old place, hatched / (to come) hatched with its door; (run) SANS group | Walked a12, c06, c07 · Test postout-outcomes.test.ts |
| 29 | The badge (desktop), the drawer switch (phone) | admin: both ways; member: none | Walked c01, c02, c05, c08, c09 · Test memberview.test.tsx |
| 30 | In the member view | no Admin, no Edit Schedule, no posting door; his admin step's Undo says "switch back" | Walked c02–c04 |
| 31 | A reload after each | every mark, account, posting and outcome kept | Walked a23, b11 |
| 32 | Post in button | "Post in" | Test pi.test.tsx |
| 33 | Help, Logic, every screen | no "switched off", "Archive on PO date", "Post out from" on screen | Searched the app's strings: only in code comments |

## 4. The door check
Each outcome chosen on the bid sheet and the Post out sheet (a01–a02, a10, a13–a14, c06–c07), un-chosen (a14), changed after
it ran (a14), Undo post out after SANS (a15); Delete from Admin → Users (b03–b04) and from a posting (a16); Suspend (a04 by
the posting), Enable by Restore (a07–a09); Restore free (a07) and taken (c11–c12); Rename (unit); Check his quals (a08), Later
(unit); the member-view switch both ways on both widths (c01–c05, c08–c09); sign out and in (a06, a22).

## 5. The walk — what it found (every one fixed with a test red first, or disposed of)
The walk scripts assert the right behaviour; each finding below was reproduced before it was fixed.

| # | Found | By | Disposition |
|---|---|---|---|
| W1 | **An endless loop:** the posting pass, woken while another command was delivering, queued its command and at once refreshed, which re-ran it — for ever (three posting tests in a row hung) | the unit suite | FIXED — a queued pass is never re-queued; the command re-checks each posting when it runs (`sync.ts runPoOutcomes`) · the old suite's trio is the reproducer |
| W2 | **A delete was not saved** for the week on screen: a reload put the deleted man back on every day to come of that week | walk B (b11, first run) | FIXED — both delete doors take the schedule's save step · person-delete.test.ts, postout-outcomes.test.ts (the saved copy; red without) |
| W3 | Loading a published version onto a day to come would bring a deleted man back | Fable (scenario 1) | FIXED — the load strips him and says "Hex left out — he has been deleted" · walk b09 · person-delete.test.ts (red without) |
| W4 | A SANS posting made while Show SANS is on lost its posting record when it ran — never to be taken back; and before its date it showed nowhere | Fable (scenario 3) | FIXED — a SANS posting shows like any until it has run; the record is updated in place · walk c06–c07 · postout-outcomes.test.ts |
| W5 | A hand SANS tick after the outcome did not drop the posting's mark — taking the posting back would undo the admin's own tick | Fable (scenario 6) | FIXED (`quals-write.ts`) · postout-outcomes.test.ts (red without) |
| W6 | "Undo post out" when a roster man now holds his callsign closed and did nothing | Fable (scenario 2) | FIXED — it says so, and where to go · postout-outcomes.test.ts |
| W7 | An admin could delete HIMSELF by posting himself out with Delete (the pass deleted the signed-in admin) | Fable (scenario 5) | FIXED — refused with the Admin → Users words · postout-outcomes.test.ts (red without) |
| W8 | A deleted man's past input: the row editor's person box drew another man's name; the filter could not find his kept inputs | Fable (scenario 7) | FIXED — "Hex (deleted)" in his rows; a "Deleted" group in the filter · quals-archived.test.tsx (red without) |
| W9 | The last-admin hold was said only once, in a passing message | Fable, Astra (scenario 1) | FIXED on the three posting sheets (`po-blocked`…) and, after the code reads (R2), on his account row too · po.test.tsx, postout-outcomes.test.ts · walk D |
| W10 | Tapping the armed Delete chip again on the Post out sheet turned the posting into "nothing else" | the builder, writing the test | FIXED · po.test.tsx (red without) |
| W11 | The Delete chip and the "Tap again" button carried the same test name | the builder | FIXED (`postout-delete-go`) |
| W12 | **Phone:** Quals' Restore-as box (and Rename's) ran off the right edge of a 390px screen | walk C (c11, first run) | FIXED (`.qarchrow` wraps) · re-walked c11 |
| W13 | The greyed Undo button said just "Undo" when only steps that would bring back a deleted man were left | the builder | FIXED — its hover says why · timeline.test.ts |
| W14 | A posting out is not a step of the Undo button (the Leave War's Undo stays grey after one) | walk C (probing) | **Not changed** — the posting sheet's "Undo post out" is its undo; believed as before this build, **not checked against `main`** — on the look card |

Errors seen in the page's console during the walks: **none**.

## 6. The code reads (Fable 5.1 and Astra, blind to each other, with this sheet in hand)
Brief `docs/superpowers/briefs/2026-09-27-post-out-outcomes-read-brief.md`; reports
`docs/handpass/2026-09-27-post-out-outcomes-{fable,astra}-read.md`. **Both: FIX FIRST.** Every finding below was fixed
with a test red first (break tests in §7) — none ruled away, none filed.

| # | Finding | By | Disposition |
|---|---|---|---|
| R1 | A posting's Delete skipped the stored-week check Admin → Users' delete runs — a delete with a week still holding him | Astra 1, Fable 4 | FIXED — the same check in the pass (scan and command); `applyDelete` refuses inside the command if a week became unreadable in between |
| R2 | An Overseas posting for the last admin archived him first, then found his account could not be suspended — half done; said only once, by its sentence | Astra 2 | FIXED — a posting that cannot be done whole does nothing (`poHeldReason`, one answer for the pass, the three sheets and his account row); said once per posting; runs when the reason goes · walk D |
| R3 | A SANS man the war does not show (Show SANS off), deleted: his past Leave War row was lost | Astra 3, Fable 3 | FIXED — kept for the months he was here when he has a past there (a war record or an input), either order |
| R4 | Post out / Undo post out were recorded as a generic Leave War edit, not the posting command | Astra 4 | FIXED — always `lw.postout` |
| R5 | Edit aircrew and the counter form stayed open with live controls after the switch to the member view | Astra 5 | FIXED — closed on the switch; not reopened on the way back |
| R6 | A request spanning the cutoff, its row on a day to come, was left "taken off" — gone from the days before; a published day he flew read pending | Fable 1 | FIXED — the kept part stays accepted |
| R7 | Undo post out left the posting's account suspension when the archive was made by hand | Fable 2 | FIXED — the take-back route (as moving the date already was) |
| R8 | `applyDelete` could run outside a command | Fable 5 | FIXED — refuses outside one |
| R9 | A posting's Delete could delete the person signed in without a word | Fable 6 | FIXED — "You have been deleted by your posting out — please sign out" |

**Their explicit negatives, in short** (both reports carry the full lists): the delete is one command and now saved
whole; issued versions are never rewritten; the load belt; ALL AVAIL and OIL by date; the four new command types and
§11; `switchRoleInForce` gated on the account; Undo passes over a step that would bring him back; the take-back touches
only what the posting made; the callsign index; the words as ruled.

## 7. Break tests
**The code reads' fixes** (a script undid each in turn, ran its test, restored the file): R6 spanning request, R2 the
last admin waits, R1 the stored-week check, R3 the hidden SANS man's row, R4 the posting command, R9 the self-delete
message, R5 the member-view editors — **all red when undone.** (R7 rides R4's take-back route; its own test pins it.)
**The walk's fixes:** each fix went red with its line removed, then green: the load belt; the SANS-to-come window; the hand SANS tick; the
self-delete refusal; the Inputs "Deleted" group; both delete doors' save step; the armed-Delete back-out; the chips' Undo
post out wording. **One is a belt, said so:** updating the posting record in place (`markPostingDone`) does not go red on
its own once the SANS window is fixed — it stays as a safety belt. The endless loop's reproducer is `poarchive.test.ts`'s
take-back group (three tests in a row hung before the fix; the new "posting written inside another command" test does
not reproduce it and is labelled so).

## 8. What was NOT walked, and why
- The drag selection's PO (row 3) — the same `OutcomeChips` component and the old selection tests; the three doors share
  one body. The Inputs row editor on a deleted man's row (row 14) — pinned by a unit test of the filter, not pictured.
- The OIL tracker's missing row, the OIL pass, ALL AVAIL by date, the planning calendar, the stash and parked plans — unit
  tests (the delete's reach is a model sweep; the walk proves the model is saved and drawn).
- A posting pass running under a member's session on boot (Fable 4) — the pass is a system projection whatever the
  session; unit-tested sessionless. The change history names the signed-in person for the sweep's emptied seats — on the
  look card.
- The Tracker (row 27) — not built, `[POST-OUT-TRACKER]`.
- The guest view, the print and the CSV of a published day after a delete — not walked; they print the ISSUED version,
  which the delete never touches (Fable, sound by construction).
- A tap on a deleted man's greyed day to come opens nothing and says nothing (by design — his posting is final); an admin
  can still add leave or an award on his PAST days (as for any posted-out man). Both on the look card (10).
- A Post IN (`setPostIn`) is still written as a plain Leave War edit, not a command of its own — as before this build;
  not raised by the reviewers for Post in, noted here.

## 9. The gates
**The final run, on the fixed code** (after the code reads' fixes and walk D — commit `90524122`; only documents changed
after it), under the shared lock, browser tests on port 4191, 27 Sep 26 ~06:05–06:25: **unit 6,469 passed (399 files) ·
build passed · the original's checks 728 passed, 0 failed · browser tests 478 passed, 48 skipped, 0 failed · the Tracker
smoke 443 passed, 0 failed · rulecheck passed (171 rulings, PO1–PO12 all named) · docsize passed** (`OVER by 94, deferred
(D29)`). The earlier green run (before the reads' fixes, 6,461 unit) is superseded by this one; a run lost to a port
another server held (4186) is not counted (`docs/gates-and-deploy.md`).

**Re-run after #444's final code was merged in** (27 Sep 26 ~11:30, commit `1293a898`). This branch had carried #444
only as far as `7b6c4a21`; #444's later code-read fixes (a click on the spot of "Move…", straight away, is a double-click
and lands nothing — D262) and its cherry-picked `[LW-MOVE-CI-RED]` test fix were missing, and GitHub went red on the
event-move unit test and the three desktop Move browser tests. The unit test failed alone locally too; the run above
passed it only because the loaded suite spread the two clicks apart. Bisected: this branch's Part A green, #444's final
head green, #444 at `7b6c4a21` red by itself. After the merge, under the lock, browser tests on port 4191: **unit 6,481
of 6,482 (400 files) — the one is `[LW-FIGSEL-SLOW]`, the filed load-only timeout, 12/12 when its file runs alone ·
build passed · the original's checks 728 / 0 · browser tests 478 passed, 48 skipped, 0 failed · the Tracker smoke
443 / 0 · rulecheck passed · docsize passed.** GitHub runs no checks on the PR until `main` is merged in (#445 made it
conflict — records only); that happens at this branch's turn, last.

**The final run, after `main` was merged in** (27 Sep 26 ~13:40, commit `c5c1e921` — #445, #444 and #443 merged before
it; the app's code merged by itself), under the lock, port 4191: **unit 6,543 passed (403 files) · build passed · the
original's checks 728 / 0 · browser tests 478 passed, 48 skipped, 0 failed · the Tracker smoke 443 / 0 · rulecheck
passed · docsize passed.** GitHub on the same commit: every job green, the three desktop Move tests and the event-move
test among them.

## The Walk line
`Walk: docs/handpass/2026-09-27-post-out-outcomes.md · 50 pictures (A 23, B 11, C 13, D 3; the re-walk 47 more in
rewalk/) · 35 roll-call rows · 14 orders and doors · MISSING: 23 fixed (W1–W13, R1–R9, the account-row placement) / 0
ruled / 1 filed ([POST-OUT-TRACKER]) · 1 noted for him (W14)`

## 10. His look — the look card
**What to try (about five minutes, on the preview link):** Leave War → tap Hex on today → Post out: the four chips, the one
line, "Post out". Choose Overseas Sqn → Hex leaves Quals for the Archived list, his account reads "suspended". Quals →
Archived → Restore: "Hex is back — quals and CAT as he left them" → Check his quals. Admin → Users → another man → Delete
account → it asks again → second tap. Tap your name badge ("Saber · Admin") → you are a member until you tap it again.

**The questions (each built to the default shown until you say otherwise):**
1. **A posting with no chip chosen** (tap the chosen one again) = "off the manpower, nothing else" — the only way to
   record a transfer until Transfer is built. *Built: yes.* **His answer (D303): "1 keep".**
2. **A "Delete" button on Quals' Archived rows?** Today a man archived by hand with no account has no delete door
   (Restore him, then post him out with Delete). Adding it changes the approved mock-up. *Built: no.*
3. **Which "today" a delete counts from:** the calendar date (built) — so deleting someone now leaves him on the July
   demo days, which the app draws around its own "today" (13 Jul). *At the database step the two are the same.*
   **His answer (D304): "it should delete on the real calendar date" — as built.**
4. **Enable on its own** (Admin → Users) lets an archived man sign in and asks you to check his quals, but does not put
   him back on the roster — Restore does that. *Built so.* **His answer (D305):** the admin gives access back (Restore
   does both in one tap), and he wants the man himself able to update his own quals — which a restored member already can
   (D149); the note telling HIM so is put to him (answer pending).
5. **The Tracker:** D299 says "his place on a course still running — goes". The Tracker has no idea of "still running";
   what should it mean — or leave his name on his courses for now? *Not built.*
6. **SANS on the date:** his whole Leave War row moves into the SANS group, earlier months included (the approved
   picture). *Built so.*
7. **Overseas and the past:** archiving a man makes his published days before the posting date read "1 pending" (as
   today). Keep? *Kept.*
8. **Undo and postings:** a posting out is not a step of the Undo button — its own "Undo post out" takes it back (the
   Leave War's Undo stays grey after one). Keep? *Kept, as before.*
9. **The last admin:** a posting that would archive, suspend or delete the last admin who can sign in does nothing
   at all until another admin can — never half done. The posting sheet says so before you confirm, and his account row
   on Admin → Users says why. *Built so.* **His answer (D306): "4 ok".**
10. **An admin may still add leave or OIL on a deleted man's past days** (the past keeps his record). Wanted? *Allowed.*
11. **Enable on a man who was only suspended by hand** (never archived) also shows "he's back". Keep, or only after an
    overseas posting? *Shows.* **His answer (D307): "5 ok".**
