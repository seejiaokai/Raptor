# Fable — which changes the one Undo should and should not take back (28 Sep 26)

*(Fable 5.1's report, saved as delivered. The brief: `2026-09-28-change-recording-undoable-list-brief.md`; Astra's
independent answer beside it: `…-undoable-list-astra.md`.)*

Read-only. Read the brief, the rulings (how-we-work D148–D350, scheduler.md, leave-war.md, oil.md, tracker.md), undo-contract.md, the register AM32–AM39d, both scenario reports, the builder's plan, and the code cited below. Nothing run. Findings first; the brief is not restated.

## 1. Missing from the list (on neither side)

**M1. "OK, seen" on a Leave War notice → NEVER (a seen mark).** When leave filed on the Inputs page replaces a man's bid, the war leaves him a notice; "OK, seen" on the day's list clears it (`raptor-port/src/leavewar/ui/DayList.tsx:212` → `ackReplacement`, `raptor-port/src/leavewar/state/store.ts:2844-2867`). It commits as `lw.ack`, a user command of the cut-over `lw` module (`store.ts:1189`), so today it IS an Undo step — the only "seen" mark that is. A member who dismisses the note and then presses Undo meaning to take back the bid he just placed gets the note back instead, with the bubble "a change to the leave board". Belongs with list #2: add `lw.ack` to the plan's B1 `NOT_STEPS` set.

**M2. Admin → Data → "Clear edit history…" → NEVER — and it is the one thing that erases.** It permanently removes change-history lines in a period (`raptor-port/src/ui/AdminPage.tsx:279-288`, `raptor-port/src/ui/inputedit.tsx:1586-1602`); the log is written raw, outside the command layer (AdminPage's own comment: "Permanent for real even today — the edit log was never inside the undo snapshot"), so Undo can never bring the lines back; only the one line "Edit history cleared — N entries", dated today, remains. Sits against list #6 ("never erases one") and D338 (1) (one record for the squadron): the record is permanent except for this control. Name it on the never side (it asks twice). Whether an admin should be able to erase the squadron's history at all is his call — say it to him.

**M3. Admin → Data → "Clear old clutter…" → already taken back; unnamed.** Removes old calendar pucks and day notes in a period as ONE step (`inputedit.tsx:1552-1578`, `writeInputsBatch`), so one Undo restores them all — right side. But its bubble reads "a batch of inputs" (`raptor-port/src/undo/describe.ts:33`) for something that touched no input; give it a phrase (plan B8).

**M4. Saved plans (a plan parked, brought out, renamed, deleted) → already taken back; unnamed.** Drafts ride the day's record (`raptor-port/src/engine/drafts.ts` header; `sched.draft.rename` / `sched.draft.delete`, `raptor-port/src/state/sched-commit.ts:396-397`), so every plan gesture is a schedule step today. Name it under "a schedule edit" so he is not surprised that Undo switches his plan back.

**M5. Renaming an ARCHIVED man (Admin → Users, archived row → Save name) → undoable with the cutover; unnamed.** A people-only write (`raptor-port/src/ui/UsersPanel.tsx:360-366, 388` → `updatePersonField`). Put it beside the Quals callsign change with the same refusal — a roster man or a placeholder now holds the old name (plan B5-1 already tests any `people/<id>` image whose callsign differs, so it covers this; `raptor-port/src/state/roster-add.ts:69-80`).

**M6. The Tracker → its own Undo; the list says nothing about it.** The one Undo never reaches the Tracker (`trk.*` closures are not cut over); the Tracker's own pair takes back chart edits and a student's marks and dates, and deliberately NOT adding/removing/renaming students, courses or charts, event details, or an Import — each asks first or has Restore (`raptor-port/src/tracker/app/core.js:2649-2670`; D128, D131); its history clears on ✓ Save changes and when the chart changes (`core.js:2663-2665`). D349 (2) puts that pair in the same top-bar place, so he will see two same-looking pairs with different reach — one line on the list says which is which.

**M7. A document attached to a medical input → never its own step.** `docAdd` is not a command and no remove exists (`raptor-port/src/state/docs.ts:90`; `docs.test.ts:35`); the document goes and comes back with its input's Undo/Redo (D299 keeps the file). Name it so nobody expects Undo to detach a photo.

**M8. Small naming gaps, all on the right side already:** the war's event lines on a day are edited on the day, not in ⚙ (`store.ts:2913, 2957` — the list names only "event rows" under ⚙); the board's "Sort all" is one schedule step (`raptor-port/src/ui/board.ts:693-707`); the admin's member-view switch is looking around, list #5 (`raptor-port/src/state/store.ts:380-393`).

## 2. On the wrong side

**W1. `lw.ack` (M1)** — the only one. Everything else reads right for a scheduler, a member (his own bids, inputs and Quals row) and an admin in the member view.

## 3. The stage — KEEP it undoable, with its own words

Facts: the stage is one field on the war's period record (`lw.war/<id>`, `store.ts:1052-1055`), written by `advanceStage` / `reopenStage` through the ordinary war save (`store.ts:3662-3691`); nothing else moves with it — bids, decisions and approved leave stay (`raptor-port/src/leavewar/engine/stages.ts:19-22`). It shares its record with the bid window, the war's name and its day events, so those chain in order. Publishing the war is not a boundary like the schedule's publish: no snapshot, no sign-off, no OIL. It only (a) stops members bidding (`stages.ts:90-92`), (b) shows the "moved" stripe (`raptor-port/src/leavewar/ui/Matrix.tsx:3493`), (c) at Published opens the remarks tap on a member's own approved leave (`Matrix.tsx:331-333, 3503`) and freezes approved leave against admin moves (`store.ts:2698, 4158`).

**What a member sees if kept (as today):** the admin's Undo after "Bidding closed" → his strip reads OPEN FOR BIDDING again, his bid box works, the "Bidding on" window reappears (`raptor-port/src/leavewar/ui/Chrome.tsx:365`), the moved stripes vanish until it closes again; every decided bid stays decided. After "Published" undone → his approved leave loses its remarks tap and the admin can move approved leave again; the leave itself is untouched. Exactly what the strip's own ← button does (`Chrome.tsx:347-356`) — one tap either way.

**If not undoable:** the member sees the same, because the admin uses ← instead. The difference is the admin's: "approve, close bidding, Undo" would then un-approve while the war stays closed — an admin who closed by mistake and pressed Undo takes back a decision instead. Undo reversing the newest thing he did is the less surprising rule, and nothing is erased either way.

**Two conditions:** (1) give the stage its own type and words (`lw.stage`, the plan's B2 sketch): "Undid: closing bidding" / "publishing the war" / "reopening bidding" — today's "a change to the leave board" (`describe.ts:44`) does not tell him bidding just reopened for everyone; (2) the look card says an Undo after a stage move reopens or re-closes the war for every member at once (in the database era, live on their screens).

## 4. Refusals the "new" list has not named

**R1. A sign-in name another account has since taken** — undo of a sign-in rename, or of a change that frees a name later given to another man. The loader dedupes silently (plan B5-2 lists it; the brief's list does not). "That sign-in name is now in use — change one of them first."
**R2. One person, one account** — undo of a puck change when another account now points at the old man. Same body, same sentence shape.
**R3. An account, or a Quals image, of a man since DELETED** — a Delete is final (D287); plan B4 covers it. While the delete's entry sits in the list the coarse-record conflict blocks it anyway (`raptor-port/src/undo/timeline.ts:464-470`); after a sign-out the belt is what stands.
**R4. A consequence under list #1 (settled — named, not reopened):** every add-with-sign-in, Give access as New person, Archive (suspends the account), Restore (enables it) and Delete writes the ONE `settings/accounts` record and the man's `people/<id>`, so it FREEZES the Undo of every earlier account change, and of every earlier Quals change on that man, made in the same session — "A later change touches the same thing and can't be undone yet" (`timeline.ts:459-470`). The way back is the button that made it (Enable, Restore). He should hear this once.

## 5. Explicit negatives — checked, agree

- Seen marks (`changes.seen`, `access.seen`, `person.backSeen`) and a waiting man's `access.request` → never (plan B1); a member's `changes.seen` would stick his Undo (my S2) — agreed.
- The posting pass is a cause-less projection, never a step (`timeline.ts:138-150`); its barrier freezes earlier account changes — accepted as strict (plan §8).
- Navigation: `lw.current` is nav-only (`timeline.ts:165-168`); LATE marks, highlights, search, History on/off, version previews, the board's layout switch and Quals "Enable editing" are view state with no command.
- The change history writes raw (`elog` not in `SETTINGS_KEYS`, `raptor-port/src/state/people-settings-commit.ts:61-71`); an undo adds a line (`raptor-port/src/state/undo-wire.ts:154`), never erases one — except M2.
- Every settings key is on the list: rules, stores, cxreasons, the four template keys, qualcols, lookahead (a squadron setting, not a viewer's — `raptor-port/src/engine/lookahead.ts:1-5`), secdefault/wavedefault, accounts/accessreqs/guestview, changeseen.
- Every account intent is classified (`raptor-port/src/state/accounts.ts:74-84`): access.approve/decline, account.add/update, guestview.set → new; person.add, account.addNew, access.approveNew, person.archive/restore/delete, lw.postout → #1; access.seen, person.backSeen → #2; access.request → #3; lw.postoutRun → #4.
- Leave War: bids, decisions, moves, awards, balances, policy, window, war create/rename, ⚙ — all `lw.*` user commands on cut-over collections; `lw.postouts` stays deferred (`timeline.ts:346`); a war created then undone falls back to the first war (`store.ts:349`).
- The coarse records (`settings/accounts`, `lw.config/all`, `lw.war/<id>`) make same-record steps undo in order — correct-but-strict, as the plan says.
- Owner rule D56: nothing above is a stored-data-only finding.
