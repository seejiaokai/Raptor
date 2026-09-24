# [HUMAN-RETEST] the amendment system — the FULL-tier evidence sheet (24 Sep 26)

Branch `claude/amendment-retest` (cut from `main` at `bff76c1b`). The order this follows:
`raptor-port/docs/bug-check-order.md`. The rules it tests against:
`raptor-port/docs/superpowers/specs/2026-09-24-amendment-behaviour-register.md` (the register — every rule he has
settled, clashes resolved by D90). Pictures: `raptor-port/docs/img/handpass/2026-09-24-amendment/`. Walk
scripts: `raptor-port/scripts/handpass/am/` (shared helpers `am-lib.mjs`).

## 0. Where this stands (kept current — read this first after a compaction or in a new chat)

- **Done:** the register (the rules sweep); both scenario designs; the roll-call walk; four parallel walkers (W1–W4,
  reports in `parts/`); every finding fixed red first or filed (§3) — code commits `7c69bd58` (F1–F5) and `767799ae`
  (the walkers' findings); the host's re-walk of F1–F5 (§12).
- **Next:** the gates on the new build → Fable + Astra final code reads (brief:
  `docs/superpowers/briefs/2026-09-24-amendment-final-read-brief.md`) → fix → re-walk what `767799ae` and the read
  fixes touched → the look card → push.
- **He is away (~6 h from 24 Sep 26, early afternoon):** questions go to `OUTSTANDING.md` and the handoff block,
  never a stop. Never merge; push the branch at the end.

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
| W1-2 | A man taken off a duty desk, a Common Programme row or a sim seat leaves NO mark, pending or issued, on any surface; an emptied cockpit seat is unmarked on the board and, while pending, on the week | W1 roll-call R3/R5/R7 | AM19 | **OPEN — filed** `[AMEND-EMPTY-SEAT-MARK]`: needs a look for an emptied list seat (none exists), and the view week is held byte-identical to the original app; counted, listed in History and in the AL's diff meanwhile |
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
| W4-F3 | Load AL1 onto the working copy left an un-accepted input "removed"; its "→ Ground" then did nothing, silently | W4 | the load replaces content; no silent control | **FIXED** `767799ae`; red first |
| W4-F4 | An input filed under Unavailable had no way back from its row | W4 | AM14 | **FIXED** `767799ae`; red first |
| W4-F5 | Four OIL advisories printed their internal code as their heading | W4 | plain wording | **FIXED** `767799ae` — headings, and a line each on the Logic page |
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
| R1 | Edit week — day head (tag, plans selector, pending, Not yet signed, Publish day / AL, Unpublish, ⓘ) | | | | |
| R2 | Edit week — the sign-off strip (4 selects, Clear, the state line) | | | | |
| R3 | Edit week — cells: flying seat pucks, callsign / times / mission, notes, Common Programme, duty rows, sims, ground | | | | |
| R4 | Scheduler board (desktop) — its sign strip (same builder as R1/R2) | | | | |
| R5 | Scheduler board (desktop) — cells of every kind | | | | |
| R6 | Scheduler board (phone) — strip and cells | | | | |
| R7 | View-only week — a published day's issued face (tag, picker "as issued" / "Working draft") | | | | |
| R8 | View-only week — the working-draft peek of a published day | | | | |
| R9 | View-only week — an unpublished day with plans (the plans picker) | | | | |
| R10 | The Amendments panel (edit page) | | | | |
| R11 | The ⓘ day panel (both pages) | | | | |
| R12 | History / the changes list and its hover bubble | | | | |
| R13 | The next-week peek (a published day in the next week) | | | | |
| R14 | A preview of an issued version (week + board): the read-only bar, Load onto working copy, Back | | | | |
| R15 | A preview of a plan (view page) | | | | |
| R16 | The plans menu and the plan editor (rename / delete) | | | | |
| R17 | The export (CSV) and the print | | | | |
| R18 | The Leave War — the OIL cells a published weekend lands | | | | |
| R19 | The warnings list on a published day (edit and view) | | | | |
| R20 | The top bar's Undo / Redo at each amendment boundary | | | | |
| R21 | The Inputs page / + Add — a request filed on a published day | | | | |
| R22 | The ALL AVAIL window opened from a published day (issued crowd vs today's) | | | | |

## 5. The door check

*(Every action the book allows → the control that does it, in every state — filled from the scenario lists and
the walk.)*

## 6. Orders walked

**S0 — the survey walk** (`am-01-basics.mjs`, desktop, admin, Monday; pictures `survey/`):
sign 4 → Publish day → tag ORIG, the sign-offs spent ("4 to sign"), an Unpublish button appears ·
edit a day note → "1 pending", "Not yet signed", the note DOTTED in AL1's colour, "Publish AL1" locked
until signed · sign 4 → "Published at Original · 1 change to publish — Publish AL1" · Publish AL1 → tag AL1
(cyan), the note SOLID in AL1's colour, sign-offs spent · Unpublish → tag back to ORIG, the change back to
"1 pending", "Publish AL1" offered again (same label), the retracted AL1 kept in the retired log · the view page
then shows "Original — as issued". **No errors.** Every step matched the register (AM8–AM11, AM18–AM19,
AM24, AM32–AM34).

## 7. Scenario dispositions (Fable + Astra)

*(filled when their lists are back)*

## 8. Every finding, dispositioned — red first

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

## 10. Gates

## 11. The two code reads

## 12. Re-walk after the fixes

## 13. His five-minute look (the card handed to him)

*(Draft — finalised when the re-walk is done.)* On the branch's Vercel link, signed in as admin, Edit Schedule:

1. **Make one amendment.** On Monday: sign the four boxes, tap **Publish day** (the tag reads ORIG). Change one
   time. Expect: the time dotted in cyan, "1 pending", **"Not yet signed"** beside the tag — on the week AND when
   you open Monday's scheduler board (the board used not to show it).
2. **Sign and publish AL1.** Expect the tag AL1 (cyan) and the time solid cyan. Open **ⓘ** on Monday: it should
   agree with the day ("AL1 · 1 item"; no unpublished edit).
3. **Take it back quietly.** Change the time back to what it was, then tap **Unpublish**. Expect: the tag back
   to ORIG and **no dotted mark on the time** (it used to leave a phantom one); "Publish AL1" offered again only
   if something still differs.
4. **View-only Sched.** Monday shows what was issued; the picker's "Working draft — not issued" shows your
   working copy with its stamp.
5. **Your phone.** Open Monday's board: the same "Not yet signed", "N pending" and Unpublish as on the desktop.
</content>
</invoke>
