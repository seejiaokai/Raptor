# The Leave War small fixes — the FULL bug check (21 Oct 26, the night's job 2)

Branch `claude/leavewar-small-1021`, cut from `main` at b3db0675f, pull request 556. D994's small fixes for one area (the
Leave War), one branch, one check (D485, D1087): **[LW-SEL-HALF-LABELS]**, **[LW-SETTINGS-SMALL]**,
**[LW-HARNESS-VIEWER-PIN]**, **[LW-ROWS-STALE-NOTES]**, **[LW-DOZE-GUARDS]**, **[LW-PHONE-AWAY-ROW-MISSING]**,
**[PO-MOVE-DATE-DELETE-ASK]** (D1102 built — a person deleted for good, so the tier is FULL), **[BATCH-14OCT-LEFTOVERS]**
part (c). Built and checked unattended (D596); one fresh Opus helper per job (D1103).
Pictures: `docs/img/handpass/2026-10-21-leavewar-small/` (`repro/` the host's reproductions, `w1/` and `w2/` the walk).

## Questions waiting for him
None that stop the merge. Two new things for his look (§14): the Legend's half-day lines now read "<LL" / "LL>" ("The
arrow — a half day"), new words, his to strike; and the Post out sheet's date ask (D1102), built as he ruled.

## 1. The eight questions and the tier
1. Money (OIL): **NO, with a reason.** Nothing here changes what a man is credited or charged: the half-day chips print
   the same stored code; Reset order and the grid's rows are display; the clash note's name is words. A delete removes a
   man's future OIL as it always did (D299) — the delete itself is unchanged, only when it is asked.
2. The published record: **NO, with a reason.** No publish, sign-off or amendment path is touched; a delete's effect on
   published days (D297, D299) is the existing pass, unchanged.
3. Saved data: **YES.** A person deleted for good (D287) — the date ask decides whether a tap saves a posting and runs a
   delete. And the grid's row set after a saved roster change.
4. A shared drawer: **YES.** The grid's row set (one sequence the real grid and the frozen name column both read); the
   half-day chips (two sheets, one look — D264); the clash note (desktop strip and phone list, one name lookup).
5. A new gesture or mode: **YES.** The Post out sheet's date box gains a two-tap state (D1102); three armed questions now
   end on leaving the page.
6. A new surface: **NO, with a reason.** No new screen, sheet or kind of row; the date ask reuses the sheet's own
   "Tap again to delete" button.
7. Roles: **NO, with a reason.** Every posting door is an admin's, unchanged (`canEditRow`, the Post out sheet drawn only
   for an admin); Reset order an admin's; the bridge is the developer's PC only. `perms.test.ts` ran green.
8. The warning list: **NO, with a reason.** The clash note is the war's own strip, not the schedule's warning list; its
   wording is unchanged (D837), only the name in it.
**Tier: FULL** (question 3 — a person deleted for good).

## 2. Rulings swept (every one that applies)
D287 (a man leaving flying for good is deleted; the delete asks twice) · D1102 (the date that sets a delete off asks twice
too; a future date saves at once; backing out leaves the posting as it was — on the records branch, recorded 21 Oct 26) ·
D290, D297, D299 (kept as a hidden mark; flown days keep his puck; the past kept) · D229, D294, D298, D300, D303 (the four
outcomes, their chips and one line) · D306 (the last admin who can sign in is never deleted by a posting) · D310, D322,
D323 (one door; Archive on Admin → Users is "posted out from today"; Restore there) · D308, D320 (a post-in date; every
stint kept) · D350 (the one undo does not take back a delete or a posting) · D264, D331 (the two sheets share one format
and look) · D160, D274 (Reset order in ⚙ Settings, as built) · D159 (the desktop opens at zoom 1) · D166 (the war follows
the signed-in person) · D827, D837 (the clash note's design and words) · D56 (stored demo data is not a finding) · D790,
D903 (a fresh blind Opus read; no Fable).

## 3. The roll-call
| # | Place | SHOWS | USABLE | Same pixels |
|---|---|---|---|---|
| R1 | the drag-selection sheet's "Which leave" chips, How much AM / PM / Full (desktop, phone) | "<LL" / "LL>" / "LL", every type | the fill writes the stored code | the sheet over the grid |
| R2 | the one-day sheet's chips (the reference, unchanged) | "<LL" / "LL>" | — | — |
| R3 | ⚙ Settings → Reset order's line, judged over the men drawn in the months on screen (desktop, phone) | greyed / lit, the hint below | two taps | — |
| R4 | Reset order's "Really reset?" across a page switch | taken back | one tap after return only arms | — |
| R5 | the phone grid's rows after a roster change made with the page away (Admin → Users add, archive, restore) | his row in the month he is in | — | the frozen name column |
| R6 | the desktop grid's rows, the same change | his row | — | — |
| R7 | the frozen name column (the same row sequence) | names beside their rows | — | — |
| R8 | the group headings' counts | the rows drawn under each | — | — |
| R9 | the Post out sheet's date box, a Delete posting, a date today or earlier (desktop, phone) | the date picked in the box and the line; "Tap again to delete <cs>" | the second tap saves and deletes | the sheet over the grid |
| R10 | the same, a date still to come | saved at once, no ask | — | — |
| R11 | the same, a chip / ✕ / leaving the page while asked | back to the date that stands | — | — |
| R12 | the bid sheet's PO, an armed "Tap again to delete" across a page switch | taken back | — | — |
| R13 | the drag selection's PO, the same | taken back | — | — |
| R14 | downstream of a delete: Admin → Users (gone), a future day's seat (empty), a flown day (puck kept) | as D297, D299 | — | — |
| R15 | the clash strip (desktop): a man with no war row | his callsign | its instruction link | — |
| R16 | the phone's clash list: the same | his callsign in the names column | its row button | — |
| R17 | the OIL tracker's roster (reads the roster, not the month window) | must not change: untouched | — | — |
| R18 | the developer's-PC bridge (`w.raptorRole`, `w.lwSetViewer`) | no screen — carried by a test | — | — |

## 4. The door check
The Post out sheet: reached by an admin's tap on a struck (posted-out) day; its date box (the app's calendar), its four
chips, ✕, "Undo post out (PO)", "Place leave or OIL here instead…". The other two posting doors: the one-day sheet's PO
(a day of a man not posted out → PO), the drag selection's PO (one man's cells). Reset order: ⚙ on the grid's top row. The
roster change: Admin → Users (add with a post-in, the row's Archive, the Archived group's Restore with a post-in).

## 5. Sizing the walk (D607)
1. **The type of change:** G (a delete — saved data, final) and C (the date box's two-tap state; three armed questions that
   end on leaving the page) for item 7; D (one row sequence read by the grid and the frozen column; one name lookup read by
   the desktop strip and the phone list) for items 6 and 8; E / D for item 1 (one chip row, drawn by two sheets); C for
   item 2's arm. Items 3, 4 and 5 have no surface (a test bridge, words in comments, a check that closed with no change).
2. **What only a walk could find here:** the date box's calendar and the ask on a real phone and desktop, the line and the
   button reading the date picked; the back-outs done with real presses; the delete's downstream on Admin → Users and the
   schedule; an armed question across a real page switch (the page kept mounted, the sheet left open); the phone grid's
   rows after a roster change made on Admin → Users with the page away; the half-day chips on both sheets side by side;
   the clash note for a man with no row on both layouts.
3. **What the ledger says:** C walks find order-of-action faults the tests missed in about half the rows; D walks find a
   surface left behind in most; G walks find the save path's gaps when a reload is part of the walk. A row of type A in a
   display rule found nothing beyond its tests.
4. **The walk chosen:** two Sonnet 5.5 walkers (D787), in parallel, each on its own fresh world against the exact build
   (`npx vite preview --port 4292`, built at 7b9264cc7), both widths — **W1** item 7 (the designer's scenarios 1–3, 5–7, 9,
   11, 14, 17, 19, 20, then 4 last; 12 and 16 by the host's reading of the code: see §10), **W2** items 1, 2, 6, 8
   (scenarios 21, 22 (a) (c) (h), 23, 25, 27, 30, 32, 33, 34). Carried by tests (named in §7): the today / yesterday edge,
   the chip back-outs one by one, the stale ask after a change underneath, the bridge pin, the half-labels' every type.
   The check lock is taken for the fanned-out walk.
5. **After the walk:** its row is in `docs/walk-ledger.md`.

## 6. The orders walked
The walkers' tables are kept whole: `parts/lws/w1.md` (W1, 27 PASS, 0 FAIL) and `parts/lws/w2.md` (W2, 31 PASS, 2 FAIL —
§13). In short:
| Order | Size | Result |
|---|---|---|
| Hex's Delete posting (31 Oct) → the date box → today: the box and the line read today, "Tap again to delete Hex"; ✕ and reopen: 31 Oct, no ask; Admin → Users still "posting out … · Delete" | both | PASS |
| yesterday asks; tomorrow saves at once, no ask; the date that stands — nothing | both / desktop | PASS |
| asked, then a date still to come (10 Nov): saved at once, no ask, no delete — box, line, Admin → Users tag, grid | desktop | PASS |
| asked, then a chip (Overseas, the lit Delete, SANS): only backs out; the box back to 31 Oct; the outcome still Delete | both | PASS |
| asked → "Undo post out (PO)": the posting gone, Hex intact | desktop | PASS |
| asked → another page → back: no "Tap again", 31 Oct; the Delete chip armed → another page → back: disarmed | both | PASS |
| asked on Hex → a tap on another man's struck day: the first tap closes, the next opens his, no ask | desktop | PASS |
| a date before Probey's post-in: (walk) asked, then refused at the tap — **the read's L1**; (re-walk) refused at once, no ask, nothing saved | both | FIXED, PASS |
| member Ranger: no Post out sheet, no chips, no PO on a drag | desktop | PASS |
| the one-day sheet's PO and the drag selection's PO: an armed "Tap again to delete" → another page → back: taken back; a date or chip change disarms; two men selected: no PO | both | PASS |
| asked with yesterday → "Tap again to delete Hex": deleted, dated yesterday; gone from Admin → Users; the past week keeps his puck; the top-bar Undo greyed (D350) | both | PASS |
| a man added on Admin → Users with a post-in in October, archived, restored for November, the page away → November draws him, October his first stint, phone = desktop | both | PASS |
| a later post-in (Dec), a posting out from 1 Nov, leave filed for a posted-out man in Dec — each with the page away | both | PASS |
| a swap with the same count (A archived, B restored, one group) | both | PASS |
| the name column level with its rows, every heading's count = its rows, no empty band | both | PASS |
| Reset order: Torch (drawn in January only) dragged → lit in January, greyed in March, lit again in January; PO from the 1st / 2nd of the first month; a later post-in; a posted-out man with leave on screen; Show SANS off / on | both | PASS |
| Reset order armed → another page → back: "↺ Reset order", one tap only arms; armed → close → reopen: unarmed | both | PASS |
| Reset order armed → the grid scrolled to March under the open sheet → back (**the read's L2**) | desktop | FIXED, PASS (re-walk) |
| the drag sheet's chips AM "<LL … <CL", PM "LL> … CL>", Full plain — every type; the same as the one-day sheet's; a drag fill and a one-day fill look the same; Move and Delete of a half-day block; the below-zero ask names the leave; member Ranger the same | both | PASS |
| the Legend's half-day lines (**the read's L3**) | both | FIXED, PASS (re-walk) |
| a clash for a SANS man with Show SANS off: "Zenith"; for an archived man: "Piston"; the phone list's columns aligned | both | PASS |
| that clash's link tapped for the rowless man: opens nothing | both | FAIL — older, filed (§13 W-2) |

## 7. Cases carried by a test
- The date ask's edges — today asks, an earlier day asks, a date to come saves at once, a non-Delete posting saves a past
  date at once; the second tap saves the PICKED date and deletes (deletedFrom = today); a chip, ✕, a date to come picked
  while asked; leaving the page; the posting changed under the question; the bid sheet's and the drag selection's arms on
  leaving the page — `leavewar/ui/postout-date-delete.test.tsx` (the real sheet in the wired world, the app's calendar
  pressed; the delete run by the sync's own pass).
- Reset order over the men drawn; leaving the page takes "Really reset?" back — `leavewar/roster.test.ts` (the store's
  answer with a row test), `leavewar/ui/settingssheet.test.tsx` (the sheet, the page signal flipped as the Shell flips it).
- The phone's row set after a roster change, both ways round — `leavewar/ui/rowwindow.test.tsx` (the grid's own measure
  over stated geometry, one month in view; the dates moved by the store's posting writer).
- The half-day chips' words — `leavewar/ui/movestandard.test.tsx` (the drag sheet rendered, How much pressed).
- The clash name on both layouts — `leavewar/clashwayout.test.tsx` (both real stores, a real clash).
- The bridge's role switch keeps the pin — `probe-bridge-viewerpin.test.ts` (the bridge's own globals).

## 8. Break tests
Each fix broken once on purpose (the fix taken out, or one line of it), a named test red — the red-first runs before each
fix, and the designer's breaks run after: B1 the chips print the stored code → `movestandard.test.tsx` "[LW-SEL-HALF-LABELS]"
red ("*LL"); B2 / B3 Reset order over the whole roster, no page-leave listener → `roster.test.ts` and the three
`settingssheet.test.tsx` tests red; B4 the date always saved → five `postout-date-delete.test.tsx` tests red (the first:
"not deleted at one tap"); B5 "today or earlier" made strictly earlier → six red (the first: today asks); B6 the second tap
saves the standing date, not the picked → "the first tap on today asks…" red; B7 a chip while asked commits → "backing out
— a chip" red; B8 the sheet's page-leave listener removed → "leaving the Leave War while asked" red; the stale-ask effect
and the other two doors' listeners removed → three red; B9 the row signature back to the last measured →
`rowwindow.test.tsx` red ("November: his row"); B10 the clash name back to the id → `clashwayout.test.tsx` red; B11 the
bridge's carry removed → `probe-bridge-viewerpin.test.ts` red; the read's L1 / L2 / L3 removed → their three tests red.

## 9. Errors seen
None — no page error, console error or failed request in any walker's run, the host's reproductions or the re-walk.

## 10. What was NOT walked, and why
- A deleted man's seat on a schedule day still to come: the demo world's only week (13–19 Jul) is past, so no future day
  carries him; carried by `leavewar/postout-outcomes.test.ts` PO5 ("a day to come loses him, a day he flew does not" — the
  real posting pass, called through `postOut`, not the screen). The past week keeping his puck was walked.
- The designer's 8 (an armed Delete chip, then a past date: the chip's arm goes and the stored outcome saves — older, as
  before), 10, 12, 13, 15 (a second tab), 16 (the last-admin hold: the held note shows beside the question, as the chip's
  existing arm — older), 18 (an archived man's read-only sheet, older) — the read covered each in its negatives; 22 (b),
  (d)–(g), 24, 26, 28, 29, 31, 35, 36 — the row set is one signature for every change (22 a, c, h and 23 walked), and 31
  is filed ([LW-ARMS-PAGE-LEAVE-REST]).
- The top-bar Undo of a posting (designer 9's second half): greyed for a posting and a delete (D350), so there is nothing
  to press.
- Items 3, 4, 5 have no surface: the bridge (a test), comments, a check closed with no change (its measurement scripts
  `scripts/handpass/lws-doze5.mjs`, `lws-doze5b.mjs`).
- R17, the OIL tracker's roster: untouched by the change (it reads the roster, not the month window).
- Safari on his iPhone itself.

## 11. Gates
GitHub's run of the pull request (D1086): green on the first push (f3344d92c) and on 7b9264cc7 — build, the original's
checks, unit (raptor 6 shares, leavewar 4), geometry (raptor 4, lw-desktop 2, lw-phone), the Tracker's smoke; the run on
the last pushed commit: the closing report. On his PC: the touched tests (23 files, 412 tests, then the read's three files,
54 tests), the typecheck and build, the walk's build.
`Docs: OUTSTANDING 120 items (+3 −7, −7 all in ARCHIVE) · DECISIONS D1–D1097 · homes OK`
`docsize: OVER by 2, deferred (D29)` — `.claude/rules/shipping.md`, which this branch does not touch (as on `main`).

## 12. The model reads
- **The scenario designer:** a fresh, blind Opus (`parts/lws/scenarios.md`) — 36 scenarios, 11 breaks, 7 "may be missing".
- **The fresh, blind Opus read** of the finished code, this sheet in hand: `parts/lws/read.md` — no high or medium, 3 low,
  all fixed with tests red first and re-walked (§13).
- No Astra or Sol 6.1: ChatGPT is out (D761), so this job goes on `[NO-ASTRA-LIST]`. No Fable (D903).

## 13. Findings and dispositions
| # | Found by | What | Disposition |
|---|---|---|---|
| H-1 | the host's test on main's code | a Delete posting's date moved to today deleted the man at one tap | FIXED — D1102 built; `postout-date-delete.test.tsx`, red first |
| H-2 | the host's reproduction (390 × 844) | the phone's missing row: the measure compared with the rows it last measured, not the rows drawn | FIXED — the signature recorded after every render, a repaint counter; `rowwindow.test.tsx`, red first |
| H-3 | the host's measurement | [LW-DOZE-GUARDS]: the guards can run while the page dozes, and read the current layout (the grid's width followed a resize made while away; the bidding box re-measured on return is the same); a war change while dozing costs 0 ms | CLOSED, no change |
| S-1 | the designer (20, "may be missing" 3) | the one-day sheet's and the drag selection's armed "Tap again to delete" survived a page switch | FIXED — the same listener; tests red first; walked |
| S-2 | the designer ("may be missing" 4, 15) | the date question stayed after the posting changed under it | FIXED — it goes when the date or outcome changes; test red first |
| S-3 | the designer ("may be missing" 2, 6) | the brief and the contract disagreed on a future date picked while asked | SETTLED — D1102's reading (1): saved at once; the comment and the contract corrected |
| S-4 | the designer ("may be missing" 1) | no rulings row for D1102 on this branch | RECORD — it is on the night's records branch (`claude/night-records-1021`), recorded before the build; the two merge together |
| S-5 | the designer ("may be missing" 6) | an armed Delete chip, then a past date, saves the stored outcome at once | RECORD — older, as before the change (the arm goes with the date) |
| W-1 | W2 (30) | an Undo dispatched by script under the Settings sheet's scrim left "Really reset?" live | RECORD — not reachable by a person (the scrim covers the button; a phone press closes the sheet); and the read's L2 fix now takes the arm back whenever the line greys |
| W-2 | W2 (33) | a clash link for a man with no war row opens nothing | FILED — `[LW-CLASH-ROWLESS-TAP]` (older) |
| W-3 | W2 (in passing) | a half-day OIL credit printed "*HO" in a clash and "HO*" on its box; the one-day sheet reopened on an AM box lights "Whole day" | FILED — `[LW-HALF-DAY-WORDS-LEFT]` (older) |
| W-4 | W1 (17) | the question was asked for a date the save then refused | FIXED as the read's L1 |
| R-1 | the read (L1, low) | the same as W-4 | FIXED — the refusal asked first (`refusedAt`); test red first; re-walked |
| R-2 | the read (L2, low) | an armed "Really reset?" kept over a greyed line fired on one tap when it lit again | FIXED — taken back when the line greys; test red first; re-walked |
| R-3 | the read (L3, low) | the Legend still taught "*LL" / "LL*" | FIXED — "<LL" / "LL>"; test red first; re-walked; new words on his card |
| R-4 | the read (older, in passing) | four other armed questions on the war still wait across a page switch | FILED — `[LW-ARMS-PAGE-LEAVE-REST]` |
| R-5 | the read (older) | Reset order counts a folded group's men though they are not drawn | RECORD — what "the men drawn" means for a folded group is the day rows; the line follows the rows, as the read says, a matter of reading |
| N-1 | the host (item 4) | D261's full row names `Matrix.tsx` for `cellOpenable`, now in `MatrixRows.tsx` | NOT EDITED — a full rulings row is not this job's to change; listed for the coordinator |
The read's fixes are each a few lines (a guard, an effect, two words), so no narrow read of the fixes (order §5). **The
re-walk** of what they touched (`scripts/handpass/lws/rewalk.mjs`, pictures `w2/rw-*`): L1 both widths, L2 desktop, L3 both
widths — 7 / 7 PASS.

## 14. His look — the card
On the preview's Leave War, as admin: (1) tap a man's day → PO → Delete, a date ten days on → Post out → "Tap again to
delete". Tap one of his struck days → the Post out sheet → set the date to today: it asks "Tap again to delete <name>" and
deletes only on that tap; a date still to come saves at once. (2) On a phone: Admin → Users, add a man with a post-in this
month, Archive him, Restore him with a post-in next month; on the Leave War press next month — his row is there. (3) The
Legend → "The arrow — a half day": "<LL" AM, "LL>" PM — **new words, his to strike.**

## Walk line
`Walk: docs/handpass/2026-10-21-leavewar-small.md · 96 + 88 + 6 re-walk pictures · 16 surfaces · 22 orders · MISSING: 2 fixed before the walk (the other doors' arms, a stale question), 3 fixed from the read (a refused date asked, an arm over a greyed line, the Legend), 3 older filed · read: 3 low, fixed`
