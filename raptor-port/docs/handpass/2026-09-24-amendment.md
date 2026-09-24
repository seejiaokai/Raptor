# [HUMAN-RETEST] the amendment system — the FULL-tier evidence sheet (24 Sep 26)

Branch `claude/amendment-retest` (cut from `main` at `bff76c1b`). The order this follows:
`raptor-port/docs/bug-check-order.md`. The rules it tests against:
`raptor-port/docs/superpowers/specs/2026-09-24-amendment-behaviour-register.md` (the register — every rule he has
settled, clashes resolved by D90). Pictures: `raptor-port/docs/img/handpass/2026-09-24-amendment/`. Walk
scripts: `raptor-port/scripts/handpass/am/` (shared helpers `am-lib.mjs`).

## 0. Where this stands (kept current — read this first after a compaction or in a new chat)

- **Done — the whole FULL tier:** the register (the rules sweep); both scenario designs; the roll-call walk; four
  parallel walkers (W1–W4, reports in `parts/`); every finding fixed red first or filed (§3) — `7c69bd58` (F1–F5),
  `767799ae` (the walkers' findings) and the code reads' commit after it; the gates on the final code (§10); Fable's
  and Astra's final code reads (§11); the re-walk, three rounds (§12); his look card (§13).
- **Waiting on him:** his five-minute look and his "merge live" (the branch is pushed; never merged by the agent);
  six questions, each filed with a recommendation (§3).

## 1. The eight questions → FULL

| # | question | answer | why |
|---|---|---|---|
| 1 | Money (earned leave counts, D25) | **YES** | a published weekend's OIL comes from its latest published version (D142); publish, amend, unpublish and undo all move it on the Leave War |
| 2 | The published record | **YES** | the whole feature: publish, sign, amend, unpublish, the issued copy, saved versions |
| 3 | Saved data | **YES** | the book (issued versions, marks, signatures, plans, the retired log) persists with the week and must survive a reload and a week change |
| 4 | A shared drawer | **YES** | the amendment mark is painted by one routine on every kind of cell on the week, the board, the peek |
| 5 | A new gesture or mode | **YES** (re-test of existing doors) | Unpublish, the plans menu, Load onto working copy, the two-tap confirms |
| 6 | A new surface | NO — a re-test | but every existing surface is walked |
| 7 | Roles | **YES** | admin publishes / signs / unpublishes; a member reads; the view-as-member flip |
| 8 | The warning list | **YES** | "Not yet signed", the flags on a published day, the sign-off state line |

**Tier: FULL** (YES to 1, 2, 3, 7, 8). What FULL means here, told to him in the handoff: the rules sweep (the
register); Fable and Astra design the scenarios; the roll-call and the door check; the full walk at phone and
desktop, fanned out across parallel walkers; fixes, each red first; the gates; Fable and Astra read the code,
blind to each other, with this sheet in hand; a re-walk of what the fixes touched; his five-minute look.

## 2. Scope rulings this session

- **D90 (24 Sep 26, recorded before the work):** where two of his rules conflict, the newer wins, and each clash is
  named — register §Z.
- **What is NOT a finding (D56):** harm living only in data already stored (the pre-Phase-2 "locked week" books,
  old saved formats). EOD is deferred and not walked (register AM52).
- **D148 (undo reverses only your own changes) is decided and NOT built.** `[GLOBAL-UNDO]` says "build it with the
  amendment or change-recording work". The agent's call, stated here so he can correct it: it is built in the
  **change-recording re-test**, next in his order (D147) — it is a change to the ONE undo for the whole app
  (schedule, Leave War, Tracker), which is that re-test's subject, not this one's. This walk still records what
  undo does today at the amendment boundaries (after a sign-out, as the other role) so that re-test starts from
  evidence.

## 3. Every finding (walkers W1–W4 in `parts/2026-09-24-amendment-w{1..4}.md`; the host's roll-call; both scenario reads)

| # | finding | found by | rule | status |
|---|---|---|---|---|
| F1 | The scheduler board never drew "Not yet signed" — the week head did, for the same working copy | roll-call R4; Fable 5-5; Astra F1; W1-6 | AM24 | **FIXED** `7c69bd58` — one shared body (`nysMarkHTML`); red first |
| F2 | The ⓘ panel and the plan-switch message counted raw marks; the head counts the real difference | Fable 5-2; Astra F2 + rank 5; W1-7; W2-F3, W2-F4; W4-P1 | AM23 | **FIXED** `7c69bd58` — `dayShownPendCount`; red first |
| F3 | "Discard marks" offered (and "Pending marks cleared") when nothing could be cleared; the panel's sentence claimed changes | Fable 5-1; Astra F3; W1-5 | F-01, AM25, AM15b | **FIXED** `7c69bd58`; red first |
| F4 | Unpublish re-opened a change already put back as a dotted mark (the phantom) | Fable 5-3; W1-1 | AM20 | **FIXED** `7c69bd58`; red first |
| F5 | An armed "Withdraw — confirm" / "Discard N edits & load" survived a page change and the View-as-member flip | Fable 5-8; Astra 33; W2-F5; F-w3-3; W4-F6 | the confirms' "any navigation clears" | **FIXED** `7c69bd58`; red first |
| W1-1b | …and the next publish froze any stale dotted mark into the issued record as "changed at ALn" (the count came from the real difference) | W1-1 (the re-issue half); S31 second shape | AM20, AM19 | **FIXED** `767799ae` — marks reconciled before an AL goes out; red first (proved red without the fix) |
| W1-2 | A man taken off a duty desk, a Common Programme row or a sim seat leaves NO mark, pending or issued, on any surface; an emptied cockpit seat is unmarked on the board and, while pending, on the week | W1 roll-call R3/R5/R7 | AM19 | **OPEN — filed** `[AMEND-EMPTY-SEAT-MARK]`: needs a look for an emptied list seat (none exists), and the view week is held byte-identical to the original app; counted, listed in History and in the AL's diff meanwhile. **Ruled 24 Sep 26: leave it — no mark (D91)**, after he saw the mock-up |
| W1-3 | The view page's ISSUED face read "1 pending" after a filing-only change — to members too — and its ⓘ "1 unpublished edit" | W1 (S15, S3B2) | AM24, AM5 | **FIXED** `767799ae`; red first |
| W1-4 = W4-F2 | Taking an issued input off and accepting it again left "2 pending · 1 removal", sign-offs cleared, "Publish AL2" live — for a day identical to what was issued | W1 S3B; W4 | AM20 | **FIXED** `767799ae` — re-accept restores the issued row; red first |
| W2-F1 | The board lost its plans selector and version tag while an issued version was looked at | W2 | AM28 | **FIXED** `767799ae`; red first |
| W2-F2 | A day template applied to a published day counts every row removed and re-added (31 changes for identical content) and takes the day's accepted inputs off the programme | W2 | AM20, AM23 | **OPEN — a question for him**, filed `[AMEND-TEMPLATE-PUBLISHED]` (refuse on a published day / keep matching rows and accepted inputs / leave) |
| W2-F6 | On the view page's working-draft peek a pending puck that also wears a red ring showed no pending hint | W2 | AM19 | **FIXED** `767799ae` (the puck in a pending seat wears a dashed outline) — re-walk pending |
| W2-F7 | On the desktop board the ALL AVAIL window, opened from a preview, docks over the preview bar ("Load onto working copy" hidden) | W2 | R14 painted-with | **OPEN — filed** `[AVAILWIN-PREVIEW-BAR]` (low; it can be dragged aside) |
| W2-F8 | The plan editor came back over View-only Sched, where its Select does nothing | W2; Astra rank 30 | door check | **FIXED** `767799ae`; red first |
| F-w3-1 | Undo past an undone publish handed back the sign-offs it spent — all four through another day's sign-off — and "Publish day" worked unsigned | W3 | AM34, AM32, AM39c; GU5-005 | **FIXED** `767799ae` (parked plans too); red first |
| F-w3-2 | Redo stuck: "redo that first", which no control can do | W3 | AM39b | **FIXED** `767799ae` — a new change drops the undone steps it replaced from Redo; red first |
| F-w3-4 | Edit history's footnote said the schedule clears on reload | W3 | AM49 | **FIXED** `767799ae` |
| F-w3-5 | Edit history's sentence lines ran off the right edge | W3 | AM49 | **FIXED** `767799ae` (CSS) — re-walk pending |
| F-w3-6 | Four green sign-off names and just "1 to sign": nothing said which signer no longer counts | W3 | AM16, AM15b | **FIXED** `767799ae`; red first |
| W4-F1 | A holiday declared on the Leave War after publishing: the day's advisory appeared only after a reload | W4 | AM47 | **FIXED** `767799ae`; red first |
| W4-F3 | Load AL1 onto the working copy left an un-accepted input "removed"; its "→ Ground" then did nothing, silently | W4 | the load replaces content (design of record, P2-REREVIEW-08); no silent control | **FIXED — the silent control** (`767799ae`: "→ Ground" says the input is already on the programme). The load's filing is the design: a first attempt to re-file the input also turned plan-switch removals into fresh inputs (Fable #2) and was taken out — **a question for him**, `[AMEND-LOAD-FILING]` |
| W4-F4 | An input filed under Unavailable had no way back from its row | W4 | AM14 | **FIXED** `767799ae`; red first |
| W4-F5 | Four OIL advisories printed their internal code as their heading | W4 | plain wording | **FIXED** `767799ae` — headings, and a line each on the Logic page |
| A1 | A two-tap confirm ("Withdraw — confirm", "Discard N edits & load") survived a board day step and a board close and reopen — one tap then withdrew the day's OIL | Astra final read #1 | the confirms' "any navigation clears" | **FIXED** (a board day change is a navigation); red first — pre-existing on `main`, half-fixed by F5 |
| A2 | The ⓘ beside the view page's ISSUED face totalled the working copy's waves, aircraft, duties, ground items and crew — to members too | Astra final read #2 | AM5, AM24 | **FIXED** (the panel reads the face's own world — the issued snapshot and its official flags); red first — pre-existing |
| FB1 | A hand reorder of the ground programme on a published day was counted ("1 reorder") but left the four sign-offs valid — publishable on signatures given for the old order | Fable final read #1 | AM10, AM11 | **FIXED** (the sign-offs also bind the order the ground programme is shown in); red first — pre-existing; its mirror (a false re-sign after "Sort") filed in `[AMEND-SMALL-SEEN]` |
| FB2 | **A regression from `767799ae`:** the W4-F3 re-file made a removed input FRESH after a plan switched away and back — flagging and re-landing itself | Fable final read #2 | AM43b | **FIXED** by taking the re-file out (the reconcile is `main`'s again); red first |
| FB3 | **A regression from `767799ae`:** the view page's pending hint, as an outline on the puck, hid the sanctioned-late (dashed) and crew-rest (dotted) rings | Fable final read #3 | AM19, AM51 | **FIXED** (the hint sits on the seat around the puck, view page only); a stylesheet guard, red first; the same clash on the EDIT surfaces is pre-existing — filed `[AMEND-MARK-RING-CLASH]` |
| FB4 | An Unpublish made by mistake, with nothing to correct, cannot be re-issued once Undo is gone (AM15 hides the button) | Fable final read #4 | AM15 vs the correcting flag | **a question for him**, `[AMEND-REISSUE-DOOR]` |
| FB5 | A re-accepted issued input went back at its issued index — under a hand-set order or after an earlier removal that read as "1 reorder" | Fable final read #5 | AM20 | **FIXED** (it goes back before the first surviving row that followed it); red first — new in `767799ae` |
| — | The Amendments panel is hidden on a phone; no phone surface names who approved an AL | roll-call R10; Fable 5-4; W1 Q-b | none | **a question**, filed `[AMEND-PHONE-APPROVER]` |
| — | "Not yet signed" beside four still-valid sign-offs and an open "Publish AL1" (D45 keeps them valid) | W4 P6 | AM24 vs D45 | **a question** (wording), filed `[AMEND-NYS-WORDING]` |

Seen in passing and filed, not amendment rules: the phone Leave War figure sheet jumps the grid to 1 January (W4 P2);
the bid sheet says a weekend LL costs a day (W4 P3); a phone drag-off removes silently (W4 P5); Saturday's "Published
AL1" toast is replaced at once by the OIL warning, and Unpublish says nothing (W1); Undo of a time change says "a note
on the schedule" (W1, for the change-recording re-test); five-letter callsigns drawn "…" on the edit week, the solid
"AL1" tag clipped at 390px, the desktop week's left arrow over the first sign-off pill (W1); AL7 and AL8 the same
orange (W1 Q-a). All in `[AMEND-SMALL-SEEN]`.

## 4. The roll-call — every place the app draws amendment state

The THINGS: a published day and its version tag · the working copy · a pending change (dotted) · an issued change
(solid, AL colour) · a removal / reorder / input filing · the four sign-offs · a saved plan · an unpublished
(retired) version · the "N pending" count · "Not yet signed" · the day's OIL. Columns: **SHOWS** it? · can the
person **ACT** on it there? · what else is **PAINTED** on the same pixels. Filled by the walk (§6); a blank cell is
not allowed at the end.

| # | place | shows | act | painted with it | walked |
|---|---|---|---|---|---|
| R1 | Edit week — day head | YES: tag (DRAFT dashed, ORIG grey, AL1–AL8 coloured), plans selector, "N pending" (the true count), "Not yet signed" (published + changes only), Publish day / Publish ALn (only with something to publish, locked until signed, title names what is missing), Unpublish (published, not previewing, names the version), ⓘ | YES: plans menu, Publish, Unpublish (one tap on a weekday; two taps where OIL moves), ⓘ | Templates, the 4×4 badge; wraps to two rows on a phone, nothing clipped at 390 | W1 both widths (every scenario) |
| R2 | Edit week — the sign-off strip | YES: four selects, Clear, the state line in all four wordings; now names a signature that stopped counting (F-w3-6) | YES: pick; Clear; an edit blanks all four, a revert restores them; three of four locks every door | wraps two-up on a phone | W1 (S9, Astra 11, 20), W3 (S23) — both |
| R3 | Edit week — cells | YES for every text cell (dotted in the next AL's colour; solid + "ALn" once issued) and a swapped seat puck. **MISSING:** an emptied duty / Common Programme / sim seat, and an emptied cockpit seat while pending (W1-2 → `[AMEND-EMPTY-SEAT-MARK]`). No cell by design for removals, reorders, filings — counted | YES: edit, right-click clear, drag | warning rings, OIL green edge, "you" fill, selection; the phantom (W1-1, fixed) | W1 both |
| R4 | Board (desktop) — sign strip | YES as R1/R2 (same builders); "Not yet signed" was MISSING (F1, fixed) | YES: sign, Clear, Publish ALn, Unpublish, ⓘ, plans menu | the history line above, the live checks below | W1 desktop; host roll-call |
| R5 | Board (desktop) — cells | YES for every text cell and a swapped seat. **MISSING:** emptied cockpit / sim / duty / programme seats (W1-2, filed) | YES: type, right-click, drag grips, + Line, ✕, Personal Inputs | OIL mode pucks, warning chips | W1 desktop |
| R6 | Board (phone) — strip and cells | as R4 + R5 at 390px, the same MISSINGs; strip wraps; drags work from the grip | as R4/R5 | as R5 | W1 phone |
| R7 | View-only week — issued face | YES: tag, "<version> — as issued", the frozen issued content, solid issued marks, the issued version's own warnings, the ALL AVAIL chip; NO pending mark, "Not yet signed" or unpublished value — except "1 pending" after a filing-only change and the ⓘ's live count (W1-3, fixed); nothing where a man was taken off a desk (W1-2, filed) | the picker; ⓘ; the chip opens the window on the issued version; no write door (0 found, as member, admin-as-member, admin) | the official warnings and flag rings over the frozen content | W1, W2, W3 — both widths, admin and member |
| R8 | View-only week — the working-draft peek | YES: bar "Viewing Working draft — not issued · the issued schedule is <version>", "Working draft" stamp, "Not yet signed", "N pending", live content, neutral pending hints; a pending puck under a warning ring lost its hint (W2-F6, fixed) | back to "as issued"; ⓘ; nothing writable | the stamp wraps on a phone | W2, W3 — both, admin and member |
| R9 | View-only week — an unpublished day with plans | YES: the plans-only picker, DRAFT tag, "Draft" stamp, the draft's own count | pick a plan (→ R15) or back to live | nothing overlaps at either width | W2 — both |
| R10 | The Amendments panel (edit page) | desktop YES: "N days with changes to publish", per day the kinds and its own Publish ALn (locked unsigned / under a preview, with the reason), issued AL tags with the approver; "Discard marks" and its sentence were wrong (F3, fixed); the day label touched its button (fixed). Phone: hidden — a question (`[AMEND-PHONE-APPROVER]`) | Publish ALn publishes that day only, even off screen (S40); Discard clears draft days only | the week's toolbar | W1 desktop; phone recorded |
| R11 | The ⓘ day panel (both pages) | YES: status, "AL versions covering …", tasking, issues; its count was the raw marks (F2, fixed) and, on the view page's issued face, the working copy's (W1-3, fixed) | rows jump to warnings; Close | a modal over the page | W1, W3 — week, board, view page, both widths |
| R12 | History / the changes list | YES: value edits (before → after, who, when), sentence lines for loads and plan switches, NO line for publish / unpublish / undo (AM35); the footnote was wrong (F-w3-4, fixed); sentence lines were cut off (F-w3-5, fixed) | All days / day only; By time / Grouped; a value row jumps to the detail | modal (desktop) / bottom sheet (phone) | W3 — both |
| R13 | The next-week peek | desktop: next week's WORKING copy, unlabelled, no tag, no marks (known `[FLAG-EXPORT]`); phone: not drawn, by design | a click loads that week (not walked) | a 50% veil; inert pucks | W3 desktop, admin and member |
| R14 | A preview of an issued version (week + board) | YES: the frozen version, the bar in its colour, Back, Load / two-tap confirm, Keep editing; the board lost its plans selector and tag (W2-F1, fixed) | Back, Load, Keep editing, "+ Alt Plan"; every write door dead; the panel's Publish locked | the desktop board's ALL AVAIL window covers the bar (W2-F7, filed `[AVAILWIN-PREVIEW-BAR]`) | W2, W1 — both |
| R15 | A preview of a plan (view page) | YES: "👁 Viewing plan <name> — read-only", DRAFT, the plan's content, no warnings | the picker only | nothing overlaps | W2 — both |
| R16 | The plans menu and the plan editor | YES: the menu (live ●, copies, issued versions read-only, withdrawn ones gone, "+ Alt Plan", "✎ Manage plans"); the editor (tabs, name, Delete with its reason, Select, Done) | switch (its toast miscounted an OIL-only difference — W2-F3, fixed), look, rename, delete, Undo of a delete; the editor came back over View-only Sched (W2-F8, fixed) | the menu drops over the head (full width on a phone); the editor covers the top bar | W2, W1 — both |
| R17 | Export (CSV) and print | YES: the ISSUED version of each published day, a draft day's working copy, the print's stamps; flying lines only (AM50 PARTLY BUILT) | the toolbar's two icons at both widths; Undo unchanged (AM36) | the print carries "RESTRICTED" top and bottom | W4 (S28, Astra 6) — both |
| R18 | The Leave War — OIL cells | YES: FO* / HO* from the latest PUBLISHED version, moving at once on publish, AL, unpublish, undo, redo; an undecided bid kept under the credit; amber ! on a clash | the tap list / bid sheet; the war's Undo/Redo drive the one timeline | bids, filed leave, the balance column | W4 (S7, S8, S26, S27, AM48c) — both |
| R19 | The warnings list on a published day | YES: edit face = the working copy's, an issued warning the copy clears struck "goes away once signed"; the issued face = the issued version's; a Leave War holiday reached it only after a reload (W4-F1, fixed); two OIL advisories headed by their code (W4-F5, fixed) | review / collapse; ✕ hides a check (edit only) | the red strip under the head; flag rings | W4 — both |
| R20 | Undo / Redo at each amendment boundary | YES: titles and "Undid: …" bubbles on the edit page, the board and the Leave War; Undo of a publish = Unpublish, sign-offs cleared, OIL withdrawn; Redo → published, sign-offs cleared — but an older Undo handed the spent sign-offs back (F-w3-1, fixed) and Redo could stick (F-w3-2, fixed) | Undo / Redo; an off-week undo snaps to its week; the list survives a week change and a sign-out (D148 not built — the change-recording re-test) | the refusal toasts | W3 — both, all three surfaces |
| R21 | The Inputs page / + Add — a request on a published day | YES: an activity input lands on the working copy as pending (never on the issued face); a leave goes to Unavailable on the working copy and the issued face at once (AM43 NOT BUILT); the LATE chip | the form; the board's → Ground, → Unavail, Undo — no way back out of Unavailable (W4-F4, fixed), → Ground dead after a load (W4-F3, fixed), re-accept made a phantom amendment (W4-F2, fixed) | the Personal Inputs / Unavailable panels, the sign-off strip clearing | W4, W1 — both |
| R22 | The ALL AVAIL window from a published day | YES: issued face "who was free when this day was issued — <version>" with the frozen crowd; the working copy "who is free as things stand now" | tap the count chip → the window; ✕ | the puck and its chip; the window floats over the schedule | W4, W2 — both |

## 5. The door check

Every action the amendment book allows → the control that does it, in each state (from both scenario designs and the
walks; the rows are the walkers' checks, both widths unless named).

| action | where the control is | refused / hidden when | walked |
|---|---|---|---|
| sign a role (×4), Clear | the week's day head strip; the board's strip (desktop and phone) | view page; under a preview (the board strip keeps only the plans selector and tag — W2-F1); a member; an unappointed name is not offered | W1 S9, Astra 11 / 20; W3 S23 |
| Publish day (first issue) | day head; board strip | locked until all four sign (title names who is missing); gone once issued | W1, W3 |
| Publish ALn | day head; board strip; the Amendments panel (desktop) | hidden with nothing to publish (AM15); locked unsigned; locked under a preview, with its reason | W1 S34, S40; W2 S19 |
| Unpublish | day head; board strip | not under a preview; only the latest version (AM34); two taps where OIL is bid against — the arm dropped by any navigation (F5, A1) | W3, W4 S8, W1 S31 |
| Load onto working copy | a preview's bar (week and board) | two taps when unpublished edits would go — the arm dropped by any navigation | W2 S14, A27 |
| + Alt Plan, switch, rename, delete a plan | the plans menu; the plan editor (Edit Schedule only — W2-F8) | a delete of the live plan refused with its reason; renames refused blank / duplicate | W2 S24, S30, A5 |
| Discard marks | the Amendments panel (desktop) | offered only when a never-published day has marks (F3) | W1 S2 |
| Undo / Redo | top bar, the board, the Leave War | someone else's change; behind a later publish of that day (says: tap Unpublish); Redo of a step a new change replaced (dropped, F-w3-2) | W3 S16, S17, R20 |
| issued face / Working draft | the view page's picker | — (read-only both ways; nothing writable, as member, admin-as-member and admin) | W2, W3 |
| → Ground, → Unavail, Undo on an input | the board's Personal Inputs / Unavailable rows; the week | view page; a filed-Unavailable input now has its Undo (W4-F4); "→ Ground" on an input already on the programme says so (W4-F3) | W4 S10 |
| OIL Earn on a published day | the board's OIL mode | view page; a member | W4 S26 |

**Roles:** a member — and the admin viewing as a member — reaches none of the write doors above: 0 writers found on
the view page (W3), and both code reads found no path through a stale control, the keyboard or a document-level click.

## 6. Orders walked

**S0 — the survey walk** (`am-01-basics.mjs`, desktop, admin, Monday; pictures `survey/`):
sign 4 → Publish day → tag ORIG, the sign-offs spent ("4 to sign"), an Unpublish button appears ·
edit a day note → "1 pending", "Not yet signed", the note DOTTED in AL1's colour, "Publish AL1" locked
until signed · sign 4 → "Published at Original · 1 change to publish — Publish AL1" · Publish AL1 → tag AL1
(cyan), the note SOLID in AL1's colour, sign-offs spent · Unpublish → tag back to ORIG, the change back to
"1 pending", "Publish AL1" offered again (same label), the retracted AL1 kept in the retired log · the view page
then shows "Original — as issued". **No errors.** Every step matched the register (AM8–AM11, AM18–AM19,
AM24, AM32–AM34).

**The four walkers' orders** (each report's §2/§3 carries the row per order, with its pictures): both orders of every
gesture pair the scenarios name — an input taken off then put back AND added then taken off (W1 S3 B / B2, W4 F2);
sign-then-edit AND edit-then-sign, on the week AND the board (W1 S9); edit, publish, put back, then Unpublish (W1 S1)
and the three-deep peel AL2 → AL1 → ORIG → DRAFT (W1 S31, W3 S35); undo then redo across each boundary — publish,
AL, unpublish — and undo from another week (W3 S16, S17); unpublish then undo, and undo then unpublish (W3); a
plan switched in before and after a publish, deleted and undone (W2 S24, S30); a preview opened then the page, week,
role or plan changed under it (W2 S14, W3 S13); a Leave War holiday declared before and after the publish (W4 S7,
R38); leave filed for a man behind an ALL AVAIL puck before and after its publish (W4 S27). Every order at desktop
1440×900 and phone 390×844 unless the report says a surface exists at one width only.

## 7. Scenario dispositions (Fable + Astra)

Both designs are kept whole: `2026-09-24-amendment-fable-scenarios.md` (S1–S40) and `…-astra-scenarios.md` (its ranks). **Every one of Fable's forty was walked**, split by subject: W1 (marks, counts, publish) S1 S2 S3 S5 S6 S9 S15 S22 S31 S32 S33 S34 S36 S40; W2 (plans, previews, the view page) S4 S11 S12 S14 S18 S19 S24 S25 S30 S37 S38; W3 (unpublish, undo, the lifecycle, roles) S13 S16 S17 S20 S21 S23 S29 S35 S39; W4 (inputs, OIL, the Leave War, export) S7 S8 S10 S26 S27 S28. Astra's ranks rode with them (W1: 2 3 4 11 12 13 16 17 18 20 34 35 39; W3: 7 14 25 26 31 32 33; W4: 1 6 10 15 21 22 36 38; W2 the plan and preview ranks, 5 27 30 among them). Each report carries every scenario's row — expected (the register line), observed, PASS / FAIL, pictures; every FAIL is a finding in §3.

## 8. Every finding, dispositioned — red first

Each finding's disposition is its row in §3: a fixed one names its commit and was proved by a test that failed
first (each named for its register rule, so the rule-coverage gate sees it); a filed one names its backlog item.
The red-first tests: `src/ui/amendretest.test.tsx` (most of them), `src/state/undo-wire.test.ts` (the Undo sign-offs,
parked plans, Redo), `src/undo/timeline.test.ts` (Redo abandonment), `src/state/unpublish-commit.test.ts` (parked-plan
sign-offs on Unpublish), `src/leavewar/amendretest-lw.test.ts` (the holiday advisory), `src/engine/signbind.test.ts`
(the ground order in the sign-off binding). Two fixes were found by the code reads to have gone wrong and were
corrected the same day (FB2, FB3) — the regressions are named in §3, not hidden.

## 9. NOT walked, and why

- EOD — deferred, not built (register AM52).
- A version that reached a shared database (the logged correction line, AM35) — there is no shared database.
- Two people at once (two admins, two browsers) — D148's multi-user half and the stale-writer lease (AM-09) need
  the shared database; one browser cannot show another's live edits.
- The pre-Phase-2 "locked week" books — old stored data only (D56).
- **The everything-case is NOT in the demo seed** (§7.1 asks for it): the seed week must stay unpublished, because
  the byte-for-byte comparison with the original app (`tfin.js` 728/0, `html.test.ts`) is pinned on those days.
  It lives instead as a recipe that builds it through the app's own controls in about a minute
  (`scripts/handpass/am/am-fixture.mjs`), and his look card (§13) starts with the few taps that make one published
  day with an amendment.

- **A real phone** — every phone run is Chromium at 390×844 driven by a mouse pointer, not a finger or Safari
  (bug-check order §7.9). The sign-off pills are invisible selects stretched over each pill so an iPhone tap opens
  them: only a real device proves it — on his look card.
- **Walked differently from the letter, because the letter is unreachable:** Fable S24 (rename / delete while the
  view page looks at the plan — the editor lives on Edit Schedule and entering it drops the view page's preview);
  S38's plan half (switching plans is on Edit Schedule, and the page change closes the window first, D66); S13 (the
  fixture's Wednesday is never published — Thursday used); Fable S3 B as written (no unaccepted "Other" on a published
  weekday — both orders walked with what exists; the "→ Unavail" route itself was not).
- **Not driven:** clicking a next-week peek column to load that week (R13); the Edit history after a sign-out (the
  reload was walked); the OIL_NO_PERIOD and OIL_STALE_HOLIDAY headings (read in the code; fixed with the other two);
  a member's own undoable change (the demo war's bidding window gives a member no sheet in July); the member path of
  S27 (filed by the admin; the member path walked in S10); a short screen (a phone on its side, a 700px laptop).

## 10. Gates

**The final run — on the code of `dad65327` (every fix, the code reads' included), watched, 24 Sep 26, one gate at a
time with nothing else running on the PC:** unit **5855 / 5855** (360 files) · build clean · tfin **728 / 0** · e2e
**469 passed**, 48 skipped (on its own port, 4190, so it built and served this code) · smoke **442 / 0** · rulecheck OK
(AM19, AM28, AM34, AM39b, AM39c, AM47 off its baseline — now named by tests) · docsize OK (`OUTSTANDING.md` 2 lines over
its tripwire — the gate defers that to a documents-only pass, D29). **The first run**, on `767799ae`: unit 5849 / 5849,
the rest as above; its one red on the way — the Logic page's guard that every check the engine raises is written up
there fired on the four OIL checks given plain headings (W4-F5) — was fixed before it (a line each on the Logic page).

**The two local-only browser checks, on the same final build:** `npm run probes:adapted` 6 / 6 (129 checks) · `npm run perf`
4 / 0 (the week 5134 nodes against its 5450 ceiling, the board 1024 against 1150; timings reported, not gated). Two
tooling faults found on the way and fixed: the adapted probes were hard-wired to the old container's browser and could
not run on this PC at all (they now use the repo's fallback, as `perf-port.cjs` already did); and audit-async's step 3
had looked for an accepted input's row under its content key since the 13 Sep 26 switch to the input's id, so it
could never pass — unnoticed because the probes could not run here.

## 11. The two code reads

Fable 5.1 and Astra (GPT-5.6), both at high effort, read-only, blind to each other (Astra's report was moved out of the
repo until Fable had finished), with the brief `docs/superpowers/briefs/2026-09-24-amendment-final-read-brief.md`
(including its "what changed after it was first written" section) and this sheet in hand. Reports, whole:
`2026-09-24-amendment-fable-final-read.md`, `2026-09-24-amendment-astra-final-read.md`. **Astra: 2 findings, both
pre-existing, both fixed (A1, A2). Fable: 5 findings — two regressions from this branch's own fixes (FB2, FB3, both
fixed), two pre-existing (FB1 fixed; FB4 a question), one new count-only slip (FB5, fixed).** Where they met: both
read the undo and sign-off fixes (`pulledBackDays`, redo abandonment, parked plans) and found nothing — explicit
negatives from both; both read every other count of unpublished changes and found none still reading the raw marks;
both found no member path to a write. Where they differed: Astra read the arms and found the board-step gap (A1)
where Fable judged it harmless because the armed face stays drawn on that same day — fixed anyway, since the rule is
"any navigation clears"; Fable found the two regressions Astra's pass did not. Fable's observations, kept: the `del:`
tombstone left after an input round trip is read by nothing; a redo of a sign-off an undone later publish had spent
draws no name (the fix's intent); a new scheduler change now drops every undone step on that week from Redo (the
classic undo stack — before, they were refused instead).

## 12. Re-walk after the fixes

**Round 1 — F1–F5 (`7c69bd58`)**, the host's `hr-01-fixes.mjs` on a separate fixed build: desktop 15 / 15, phone
11 / 11, no console errors (pictures `rewalk/`).

**Round 2 — the walkers' fixes (`767799ae`)**, every walker's OWN scripts re-run on the new build at both widths,
from a temporary copy that saves to `rewalk2/` so the original failure pictures stay as walked (observation #239):
**873 checks passed, 33 failed, no console errors; 390 pictures.** The 33, each accounted for:
- **28 — W1-2, not fixed, filed** (`w1-10-rollcall`, 14 per width): an emptied duty / Common Programme / sim /
  cockpit seat still carries no mark — `[AMEND-EMPTY-SEAT-MARK]`.
- **2 — `w2-03` S19** (desktop and phone): "no sign strip on the board under a preview" — W2-F1's fix deliberately
  keeps the plans selector and the tag in that strip (no sign-offs, no publish or unpublish, as the same log shows);
  the check predates the finding. Picture `rewalk2/w2/d-42-S19-board-preview-original.png`, looked at.
- **3 — the load's filing** (`w4-10` check 17 at both widths; `w2-09` A27): "a load puts back content, not filings"
  (the design of record) — `767799ae` had re-filed the input on a load. That re-file is now TAKEN OUT (Fable #2), so
  these checks assert today's behaviour again; the question is `[AMEND-LOAD-FILING]`.
Every finding the walkers raised and `767799ae` fixed PASSES on the new build at both widths: the phantom mark and
the false "changed at AL1" (W1-1: `w1-s01`, `w1-s31`, `hr-01`), the counts (F2/W1-7: `w1-s03`, `w1-s15`, `w1-s33`),
the issued face's count (W1-3: `w1-v01`), the input put-back (W1-4/W4-F2: `w1-s03b`, `w4-10`), the Undo sign-off
traps and Redo (F-w3-1/2: `w3-05`), the confirms on navigation (F-w3-3: `w3-02`), the history footnote and wrap
(F-w3-4/5: `w3-01`, `w3-07`), the sign line (F-w3-6: `w3-06`), the Leave War holiday (W4-F1: `w4-08`), the
Unavailable way back (W4-F4: `w4-00d`), the check headings (W4-F5: `w4-11`), the plan editor and preview strip
(W2-F1/F8: `w2-02`, `w2-03`), the money walk (`w4-02`, `w4-06`).

**Round 3 — the code reads' fixes (`dad65327`)**, on the final build — the bundle the gates ran — no console errors in
any run: the host's new `scripts/handpass/am/hr-02-reads.mjs` **11 / 11 at each width** (a hand reorder of the ground
programme on a published day blanks the four sign-offs and leaves no open Publish AL — Fable #1; the ⓘ beside the
issued face counts the issued version, 9 ground items, while the Working-draft peek counts the working copy's 10 —
Astra #2; pictures `rewalk2/hr2-{desktop,phone}/`); `hr-01` desktop 15 / 15; `w3-05` (the Undo sign-off traps)
8 / 8; `w2-09` 14 / 14 — the load keeps the filing, as designed, which its A27 check asserts; `w4-10` 8 / 9 at each
width — its one FAIL, check 21 ("the day reads as issued again" after a load), is exactly the state
`[AMEND-LOAD-FILING]` asks him about; `w2-01b` close-ups 6 / 8 — its two FAILs measure the pending hint ON THE PUCK,
where it no longer is by design (Fable #3): the pictures `rewalk2/w2/d-10-…` and `d-10b-…`, looked at, show the neutral
dashed hint around the seat, and on the flagged pending puck (Echo) BOTH his red ring and the hint. Not re-walked in
the app, pinned by tests only: Astra #1 (a board day change drops an armed confirm — reaching an armed Unpublish needs a
weekend with an OIL bid against it) and Fable #2 / #5 (a plan round trip; a re-accept under a hand-set order).


## 13. His five-minute look (the card handed to him)

On the branch's Vercel link, signed in as admin, Edit Schedule. About five minutes; a real phone for step 6.

1. **Make one amendment.** Monday: sign the four boxes, tap **Publish day** (the tag reads ORIG). Change one time.
   Expect: the time dotted in cyan, "1 pending", **"Not yet signed"** beside the tag — on the week AND on Monday's
   scheduler board (the board used not to show it).
2. **Sign and publish AL1.** Expect the tag AL1 (cyan) and the time solid cyan. Open **ⓘ** on Monday: "AL1 · 1 item",
   and no unpublished edit.
3. **Take it back quietly.** Change the time back to what it was, tap **Unpublish**. Expect: the tag back to ORIG and
   **no dotted mark on the time** (it used to leave one, and the next publish then wrote a false "changed at AL1" into
   the issued record).
4. **Undo cannot hand back sign-offs.** Friday: sign all four. Saturday: sign CUR CK. Friday: **Publish day**. Now
   press **Undo** twice. Expect: Friday back to a draft with all four boxes empty and "Publish day" locked, and
   Saturday's CUR CK gone. (It used to put Friday's four names back, so Friday could go out with nobody re-signing.)
   Then **Redo** once: Saturday's CUR CK comes back, Friday stays unsigned.
5. **View-only Sched.** Monday shows exactly what was issued, with no "pending" beside it — for a member too. Its
   picker's "Working draft — not issued" shows your working copy, clearly stamped.
6. **Your phone.** Open Monday's board: the same "Not yet signed", "N pending" and Unpublish as on the desktop; tap a
   sign-off box and check the name list opens (only a real iPhone proves that).

**His look, 25 Sep 26:** step 6 confirmed on his own iPhone ("For 6 yes" — the board shows "Not yet signed", "2 pending" and
Unpublish, and the sign-off name list opens). Three points raised on the way, each reproduced on this branch the same
night: a moved puck counts 2 pending (as designed — the count is the rows that differ from the issued day, AM23; put to
him with a recommendation to keep it); Edit history on Edit Schedule jumps to the board (on `main` too — D107,
`[HIST-JUMP-STAYS]`); the grey ORIG tag should stand out (D108, `[ORIG-TAG-STANDOUT]`). None is a defect of this branch;
the two rulings are items 12–13 of the amendment batch. The card's two questions below were answered since (D96, D97).

**Two questions ride with the card** (filed, nothing waits on them): should applying a day template to an already
published day be refused, or keep what matches (`[AMEND-TEMPLATE-PUBLISHED]`)? And should "Not yet signed" read
differently when the four sign-offs are still valid (`[AMEND-NYS-WORDING]`)? The two from this morning stand too:
`[AMEND-D45-FILING]` and `[AMEND-PHONE-APPROVER]`.
