# [HUMAN-RETEST] the amendment system — the FULL-tier evidence sheet (24 Sep 26)

Branch `claude/amendment-retest` (cut from `main` at `bff76c1b`). The order this follows:
`raptor-port/docs/bug-check-order.md`. The rules it tests against:
`raptor-port/docs/superpowers/specs/2026-09-24-amendment-behaviour-register.md` (the register — every rule he has
settled, clashes resolved by D90). Pictures: `raptor-port/docs/img/handpass/2026-09-24-amendment/`. Walk
scripts: `raptor-port/scripts/handpass/am/` (shared helpers `am-lib.mjs`).

## 0. Where this stands (kept current — read this first after a compaction or in a new chat)

- **Done:** the register (the rules sweep); the scenario brief; the walk helpers; the survey walk (§6 S0).
- **Running / next:** Fable + Astra scenario design → the fanned-out walk → fixes → gates → the two code reads →
  re-walk → the look card.
- **He is away (~6 h from 24 Sep 26 night):** questions go to `OUTSTANDING.md` and the handoff block, never a
  stop. Never merge; push the branch at the end.

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

## 3. Findings so far (running list — dispositions in §8)

| # | finding | found by | rule | status |
|---|---|---|---|---|
| F1 | The scheduler board never drew "Not yet signed" — the week head did, for the same working copy | roll-call R4 (desktop + phone); Fable 5-5; Astra F1 | AM24 | **FIXED** `7c69bd58` — one shared body (`nysMarkHTML`) for both surfaces; red first |
| F2 | The ⓘ day panel and the plan-switch message counted raw marks; the head counts the real difference — an OIL-only change read "nothing pending" beside "Publish AL1", a filing round trip left "1 unpublished edit" | Fable 5-2; Astra F2 + rank 5 | AM23 | **FIXED** `7c69bd58` — `dayShownPendCount`, one count for all three; red first |
| F3 | "Discard marks" was offered, and said "Pending marks cleared", when every mark sat on a published day and nothing could be cleared | Fable 5-1; Astra F3 | F-01 (Phase 2) | **FIXED** `7c69bd58` — offered only when it can clear something; says how many; red first |
| F4 | Unpublishing AL1 re-opened a change that had already been put back to the Original's value as a dotted mark (the phantom) | Fable 5-3 (walk S1) | AM20 | **FIXED** `7c69bd58` — the re-opened marks are reconciled inside the unpublish command; red first |
| F5 | An armed "Withdraw — confirm" (and "Discard N edits & load") survived a page change and the View-as-member flip, so the second tap after coming back skipped the warning | Fable 5-8; Astra rank 33 | the confirms' own "any navigation clears" rule | **FIXED** `7c69bd58`; red first |
| — | The Amendments panel is hidden on a phone (≤820px) — the day head's Publish AL and the ⓘ panel carry it there, but not the approver list | roll-call R10 phone; Fable 5-4 | none found | see §8 (a question or a deliberate phone choice) |

*(the walkers' own findings are added as their reports land)*

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

## 10. Gates

## 11. The two code reads

## 12. Re-walk after the fixes

## 13. His five-minute look (the card handed to him)
</content>
</invoke>
