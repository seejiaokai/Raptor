# Phase 6 plan — round 2 dispositions, step (c) only (30 Sep 26)

Reports: `2026-09-30-db-readiness-phase6-redteam-r2-fable.md` (REVISE — F1–F6) and `…-r2-astra.md` (BLOCK — 1–3), blind to
each other. Round 2 read (c) v2 only; (a), (b), (d) are built.

**The one that changes the design — Astra 1 (BLOCK), confirmed by reading the code:** v2 works a request's effect out on
the day AS IT STANDS IN MEMORY, which after an earlier reconciliation is already overlaid. So a derived REMOVAL is not
reversible: a member deletes (or re-dates, or retypes) his request, the reconciliation removes its row from the week on
screen (nothing saved), he presses Undo — the request comes back, but its row is re-made as a NEW row (a new id, at the
end, without the scheduler's hand-set times and extras), or on a published day not at all; a reload, starting from the
stored day, shows the ORIGINAL row. **v3 needs a holder base:** for each day of the loaded week, the day as its holder
last committed it (the stored row, or the loaded / seed day) kept apart from the view; the week on screen is ALWAYS the
overlay applied to that base, never to an already-overlaid day. The base moves only when a command itself changes the
day (its touched days, captured at the end of the command's apply and applied in its after-command effect, so a refused
command moves nothing); a request's or a person's command never moves it; the after-command effect rebuilds the view from
the base. With it, the Undo above restores the exact row, and "right after" equals "after a reload" by construction.

| # | Finding | Disposition (for v3) |
|---|---|---|
| Astra 1 | The after-command overlay is destructive without a holder base | **Accepted — v3's core (above).** |
| Astra 2 | Marks must be a target-state calculation, not append-only; draft OG attribution | **Accepted in part.** On a published day, after the view is rebuilt, its pending marks are REBUILT from the live-versus-issued state (`rebaseDayPending`, generalised), which also clears a mark when an edit is taken back (A → B → A, Undo, delete → Undo). **Declined — draft-day OG for a request's change:** today's relink writes no keyed change line either (`markEdit(key)` carries no values), so a request's change has never shown an OG tag on an unpublished day; the request's own history line (`changelines.ts inputLines`) is its record — nothing is lost, and adding it is a feature, not this step |
| Astra 3 / Fable F6 | `kept` has no exit | **Accepted:** `kept` protects a row only while its request is gone, not an activity, filed under Unavailable, or not covering the day; once the same request covers the day again as an activity, `kept` clears and rule 4 applies (re-made if its fingerprint differs, id / place / extras kept); the row finder and the landing's "already has a row" test ignore a `kept` row on a day its request does not cover. A product reading at the D363 / D175 seam — on his look card |
| Fable F1 | A whole-day replacement must keep the version's `srcv`, not stamp the current fingerprint; the load door's strip by the current holder | **Accepted.** Step 2 BUILT (commit 3f847bdb — the load belt uses `hisLanded`). Step 1 in v3: a version's or a plan's row keeps the `srcv` it carries; rule 4 then re-makes what the request has since changed |
| Fable F2 | A landing on read has no cross-week one-row rule; the finder must read reconciled but UNLANDED rows (no recursion) | **Accepted:** the finder (`stashGroundBySrc`) = the saved week's rows with rules 1, 2, 3, 6 applied, no landing, no strip, memoised on (bytes, deleted signature, request revision); every landing on read (a saved week, a never-saved week — the seed door lands too) lands only when `rowElsewhere` finds no standing row and fails closed on an unreadable week |
| Fable F3 | Marks only — no history line from the overlay | **Accepted:** key-only `markEdit`, the removal through `unacceptInput`'s exact body; no `logEdit` / `logAction` in the overlay or the effect (subsumed by Astra 2's rebuilt marks on a published day) |
| Fable F4 | The after-command effect must reflow | **Accepted:** the effect ends with the baseline moved on and `HOOKS.reflow()` when it changed anything; its before / after messages said there |
| Fable F5 | `dayDiscardCount` must measure the day the load AND the reconciliation leave | **Accepted:** one pure body `dayAsLoadLeaves` (leave-out, `kept`, the current-holder strip, rules 1–4, the pure landing) used by the load door and the count |

**Where it stands:** (c) v3 = v2 + the holder base + the table above. The owner decides whether (c) v3 is built here now
or in a fresh chat (round 3 would be the last of his cap). (a), (b), (d) are unaffected: their derived changes are the
delete's strip and the OIL decision's reading, neither of which removes a holder's row in a way an Undo must restore —
the delete is never undone (D287), and an OIL decision is never removed by the read.
