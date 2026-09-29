# Evidence sheet — a drag below zero asks first (29 Sep 26)

Branch `claude/lw-drag-flaky-tests-batch-c0719b`. The item: `[LW-DRAG-BELOW-ZERO]` — his ruling **D418** (29 Sep 26, "Drag
asks too"): a drag across days on the Leave War that would take someone below zero asks once first, as a one-day bid does.
The same branch fixes two flaky tests (`[INPUTSCAL-TAP-FLAKY]`, `[LW-WINDOW-PRUNE-FLAKE]`) — test-only, no app change, §8.
Pictures: `docs/img/handpass/2026-09-29-lw-drag-below-zero/`. Walk script: `scripts/handpass/lwdz-walk.mjs` (its
PASS/FAIL lines: `docs/handpass/parts/2026-09-29-lw-drag-below-zero.txt`).

## 1. The eight questions and the tier — WALK

1. Money / earned leave — **NO**: no balance, charge or write changes. The fill writes exactly what it wrote before; the
   change adds a question BEFORE the write, and reads the balance to decide whether to ask. (The one-day sheet's ask now
   reads the balance by the column's own charging rule — §4 — which changes when a question is shown, never a number
   stored.)
2. The published record — NO (the Leave War's fill writes requests; no publish, sign or amendment path touched).
3. Saved data — NO (nothing new stored; the sheet's ask is sheet state).
4. A shared drawer — NO (one sheet; the words are shared by two sheets — roll-call below).
5. A new gesture or mode — **YES**: a second tap of the same leave now confirms on the drag sheet.
6. A new surface — NO (a note on an existing sheet).
7. Roles — NO (admin and member fill as before; both are asked — walked).
8. The warning list — NO.

**WALK.** Gates · the door check · the walk of the touched sheet at both widths and a member · the new gesture in both
orders · a break test · this sheet.

## 2. The rulings kept

D418 (the change). D264 / D331 (the two sheets share one format and look — so the ask is drawn under Which leave, as the
one-day sheet draws its own; first cut drew it at the foot, moved after looking at the pictures). D335 (the one-day sheet's
picked range — its ask reads the same number). D260 / D332 (Delete's own confirm — Delete drops the leave's ask). D333
(a member fills his own row while bidding is open — asked by his own callsign). The standing rule that a balance may run
negative and is never refused (the one-day confirm's own comment, §Counters) — still a question, never a refusal. D87
(the flaky tests wait on what they need). D56 (nothing here is stored-data-only).

## 3. The roll-call — every place a leave fill can take a balance below zero

| Surface | Asks before going below zero? | Walked / pinned by |
|---|---|---|
| The one-day sheet, one day | has it (unchanged) | `bidding.test.tsx` "a bid that would go below zero asks once"; walk D5 (Monday) |
| The one-day sheet, a picked range (D335) | has it — now counted by the charging rule (a weekend costs nothing) | `charge.test.ts` "withFill", `state/balanceafter.test.ts`; walk D5 (Saturday — no ask, costs nothing) |
| The drag-selection sheet, one man | **has it — NEW** | `selectsheet.test.tsx`; `e2e/leavewar.spec.ts` "a drag that would go below zero asks once"; walk D1, P1 (phone) |
| The drag-selection sheet, several men | **has it — NEW**, one ask naming each | `selectsheet.test.tsx`; walk D3 |
| The drag-selection sheet, a member's own row | **has it — NEW** | walk D6 |
| A move (Move on either sheet, the move banner) | must not — a move lands the same days elsewhere, it spends nothing new (weekday to weekday), and the store's move rules own a landing | not in D418 |
| A decision (Approve / Ack / Refuse) | must not — a decision on an existing bid does not change the balance's draw (a pending bid already draws in full) | not in D418 |
| The OIL tracker / the balance bar (+ / − on the figures) | must not — those are the admin setting a balance, not spending one | not in D418 |
| The Inputs page (a leave filed there) | not in D418 — his ruling names the war's drag against the war's one-day bid; the Inputs page shows no Leave War balance (no "below zero" words anywhere under `src/ui`) | not in D418 |
| An OIL award (+OIL) | must not — an award adds, never spends | — |

## 4. What changed in how the number is worked out

Both sheets now ask ONE question: the store's `balanceAfterFill(person, dates, code)` (through `Matrix.tsx balanceAfter`) —
the balance column's own figure (`balanceOf`, or OIL's FIFO-and-expiry ledger) read of the wars as they are and as the fill
would leave them (`engine/counters.ts withFill`: each day rebuilt the way `setCell` changes it, the other half kept), over
only the days the store would write (`cellProblem`). It asks only when the balance ends below zero AND lower than it
started (`goesBelow`), and the second tap goes ahead only for what the ask said (leave, days, figures); any other control
drops it. The one-day sheet counted `amount × days` before — so a Fri–Mon range asked "takes him to -1" of a fill that left
+1. The words are one body, `ui/belowzero.ts`, and name the balance as its column does ("LVE", where the one-day sheet used
to say "ANNUAL").

**The first cut, and what Astra's read found in it (29 Sep 26, §10).** The first cut SUBTRACTED a spend from today's balance,
the spend worked out by laying the new days OVER the man's own. Astra found four real defects in it — an afternoon beside a
held morning dropped the morning (so a fill to -0.5 went unasked: a regression on the one-day sheet, which had counted it);
an ask stayed armed across How many / How much / Decide; OIL's expiry is not linear, so a day that used an about-to-expire
credit asked falsely; and a man already in the red was asked about a fill that cost nothing. All four fixed, each red first
(§6).

## 5. The walk — `lwdz-walk.mjs`, the built bundle on :4193, 20 checks, 20 PASS, no console errors (the final build, after §10's fixes)

| Step | Order walked | What the screen said | Picture |
|---|---|---|---|
| D1 | drag Drifter Tue 6 – Thu 8 Jan, FCL (balance 0) → FCL again | "That takes Drifter to -3 FCL. Tap the same leave again to go ahead." — nothing written; second tap writes three FCL, his figures sheet reads FCL -3 | `D1-ask`, `D1-written` |
| D2 | the other order: ask on FCL → tap LL | LL written at once, no ask (his LVE covers it) | `D2-other-leave-writes` |
| D3 | drag across Drifter and Ridge, 3–4 Feb, FCL; then ✕ | "That takes Drifter to -5 FCL and Ridge to -2 FCL. …" — one ask; closing writes nothing | `D3-one-ask-two-men` |
| D4 | ask on FCL → Delete → FCL | Delete shows its own "Delete 3 days for Drifter? Tap Delete again."; the next FCL asks afresh; the LL stays | `D4-ask-delete-ask` |
| D5 | one-day sheet: Hunter Sat 10 Jan FCL, then Mon 12 Jan FCL | Saturday writes at once, FCL unchanged at 0 (a weekend costs nothing); Monday asks "-1 FCL" | `D5-saturday-no-ask`, `D5-monday-asks` |
| D6 | the member (Ranger), his own row 20–21 Jan, FCL → FCL | "That takes Ranger to -2 FCL. …"; second tap writes | `D6-member-ask` |
| D7 | Hunter: a morning of FCL on Tue 20 Jan (asks "-0.5", go ahead), then a one-day drag on the same day, PM, FCL | "That takes Hunter to -1 FCL. …" — the morning counted (Astra F1; the first cut would have written it unasked) | `D7-afternoon-beside-morning` |
| D8 | Hunter, now at FCL -0.5: a drag on Sat 24 Jan, FCL | written at once, no ask; FCL stays -0.5 (a weekend costs nothing — Astra F4) | `D8-red-weekend-no-ask` |
| P1 | phone 390 × 844, hold-and-drag by finger (CDP touch) Static 3–5 Mar, FCL → FCL | the ask whole on the screen, under Which leave; second tap writes | `P1-phone-ask`, `P1-phone-written` |

Looked at: every picture above. The ask sits under the leave buttons at both widths (after the move, §2), reads whole on the
phone, and the two-man sentence fits one line on the desktop.

## 6. The break tests

| Wire broken on purpose | Went red |
|---|---|
| The drag sheet's balance question unplugged in the grid (`wouldLeave={undefined}` on `SelectSheet`) | `e2e/leavewar.spec.ts` "a drag that would go below zero asks once" |
| The one-day sheet's question unplugged (`wouldLeave={undefined}` on `BidPicker`) | `bidding.test.tsx` — both "asks once" tests |
| The old `SelectSheet.tsx` put back (red first) | `selectsheet.test.tsx` — the four ask tests |
| The one-day ask keyed by the leave alone, and not dropped on a range change (Astra F2) | `bidding.test.tsx` "widening to a range after the ask asks again" |
| The drag sheet's ask not dropped by How much or Decide (Astra F2) | `selectsheet.test.tsx` — the two "drops the ask" tests |
| The first cut's arithmetic (a new day laid OVER the old, subtracted from today's balance — Astra F1, F3, F4) | `state/balanceafter.test.ts` — the half beside a half, OIL expiry, already-red cases (each fails on a subtraction: the half reads 0 spend, the OIL day reads -1, the red man is asked) |

## 7. Not walked, and why

- A published war and a closed war — the drag sheet fills only while it may write (the admin at any stage — his fill
  there goes through the same `fill`, unit-tested); the ask does not depend on the stage.
- An OIL fill on the drag — the OIL figure reads through the tracker (FIFO + expiry) in the shared `balanceAfter`, the
  same line the one-day sheet already used; pinned by `bidding.test.tsx` (OIL at 0), not re-walked on the drag.
- The owner's iPhone (WebKit): the ask is plain text in the sheet's existing note style; nothing layout-new.

## 8. The two flaky tests (test-only)

- `[INPUTSCAL-TAP-FLAKY]` — **cause found and reproduced**: each tap was a press and a lift in two separate awaited steps,
  and REAL time passed between them. Past caldrag's 180 ms hold a chip was picked up (its lift then asks
  `elementFromPoint`, which jsdom lacks — the "is not a function" seen on three branches); past the calendar's 450 ms
  hold-to-add a day cell opened the add form instead of the day's popover (the fourth branch's "click target exists").
  A deliberate 250 ms / 500 ms pause between the two reproduced both, error text and all. Fix: one `tap()` — press and
  lift in ONE synchronous step, so no timer can fire between them; 16 taps converted; 39 / 39.
- `[LW-WINDOW-PRUNE-FLAKE]` — **cause found and reproduced**: on the desktop the grid fills toward the whole year in the
  background; on a busy PC the fill reached January before the test pressed JAN, the jump only scrolled, nothing was
  dropped (correctly) and the wait for December to leave ran out. A 9 s pause before the press reproduced it (all twelve
  months drawn). Fix: the premise (January drawn?) is read in the same synchronous page step as the press, and each outcome
  asserted for what it is (D87). Normal run 2 / 2 (desktop, phone); with the 9 s pause, pass.

## 9. The gates

The final run, under the PC lock, on the fixed build (29 Sep 26): unit **7017 / 7017** (434 files) · build clean · tfin
**728 / 0** · e2e **509 passed, 0 failed**, 49 skipped (both once-flaky tests inside it, green) · smoke **445 / 0** · rulecheck OK
· docsize OK. The first run (before §10's fixes) had failed only the two `counters.test.tsx` tests that pinned the old
arithmetic and the word "ANNUAL" — both rewritten to their purpose (a range counts its WORKING days; the balance is named
"LVE"), not loosened.

`Walk: docs/handpass/2026-09-29-lw-drag-below-zero.md · 12 pictures · 3 surfaces (the drag sheet, the one-day sheet, the
phone) · 10 orders · MISSING: 0 (one older look gap filed, [LW-SEL-HALF-LABELS])`

## 10. The code read — Astra (Codex, gpt-5.6-sol, high), after the walk, finder brief (order §4)

One reader: the change touches two sheets and two roles, no money, record, permission or storage (§1), so one — Astra first
(D353). Its report named four findings; each was reproduced by a test that failed on the first cut, then fixed:

| # | Finding | Disposition |
|---|---|---|
| F1 (high) | An afternoon beside a held morning dropped the morning from the "after" count, so the fill could reach -0.5 unasked — a regression on the one-day sheet, which had counted it; also the half that completes a pilot's 15th full day | **confirmed-new, fixed**: `withFill` rebuilds each day's view the way `setCell` changes it (the other half kept); `charge.test.ts` "withFill" (half beside half, both LVE, another counter, the 15th-day half), `balanceafter.test.ts`; walk D7 |
| F2 (medium) | The ask stayed armed across How many / the range / How much / Decide — one tap then wrote a different fill | **confirmed (the one-day half pre-existing, the drag half new), fixed**: the ask is a token of what it said (leave, days, figures) and every other control drops it; `bidding.test.tsx`, `selectsheet.test.tsx` |
| F3 (medium) | OIL's expiry is not linear: a day using a credit about to expire was asked about ("-1") though the tracker stays at 0 | **confirmed (pre-existing on the one-day sheet), fixed**: `balanceAfterFill` reads the tracker's own ledger of the wars as the fill would leave them; `balanceafter.test.ts` |
| F4 (low) | A man already in the red was asked about a fill that costs nothing ("takes him to -2" of a Saturday) | **confirmed (pre-existing on the one-day sheet), fixed**: `goesBelow` — below zero AND lower than before; `balanceafter.test.ts`, `selectsheet.test.tsx`; walk D8 |

Its explicit negatives, kept: no other door fills leave across days (every multi-day write goes through `setCellRange` or
`setCells`); Approve and Move spend nothing new; no timezone path added; the LVE wording is right; the note is never lost
when the leave row is absent; the one-act tap still drives the real pointer path, and the hold tests keep their own fake
clocks; the JAN branch is not vacuous. The report, whole: `docs/superpowers/specs/2026-09-29-lw-drag-below-zero-astra-read.md`.
