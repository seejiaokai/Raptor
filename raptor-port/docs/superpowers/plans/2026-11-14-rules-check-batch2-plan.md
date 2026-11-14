# The rules check's small batch — plan (chat 76, 14 Nov 26)

Backlog item: `[RULES-CHECK-FIXES]` (its "Left to build" sentence). Branch `claude/rules-check-batch2`, cut from `main` at
`9cc49fcca` (pull request 762 merged and live). Written by chat 76 after reading the code; nothing built yet. Chat 76
stopped at 72% of its window after the reading, so the build, the check and the reads go to a fresh chat (the checklist's
step 3, chats A and B). **Merge nothing until his "merge live".**

## The five parts

| # | Ruling | What changes | Where it is in the code now |
|---|---|---|---|
| 1 | D2009 | The Logic page's check names "On leave + flying" → "On leave + planned", "Downchit + flying" → "Downchit + planned" | `src/engine/validate.ts` `WCODE.LEAVE_FLY`, `WCODE.DNIF_FLY` (line ~25). **Roll-call first:** `WCODE[...]` is also read by the warning list (`ui/html.ts` ~1201, ~1221, ~2606), the board (`ui/board.ts` ~515), Insights (`ui/insights-html.ts` ~56) and the Logic page (`ui/logic-html.ts` `lgChkName`). The ruling's reading: only the Logic page's name changes; the day's own warning ("On leave but tasked — BRIEFING") stays. So find out whether those other readers print the name where a warning has no `msg` of its own; if they do, decide (and say in the sheet) whether the name change there is the same fix or must be kept off — the ruling says one name, true on every row. Check stored versions do not freeze the name (a published day's frozen warnings). |
| 2 | D2010 | Crew-rest warning where the last flight's landing was not typed (blank or "TBD", D1990): "Mon took off 12:00 with no landing typed, +2h debrief assumed → ended 14:00 → crew rest clear at 02:00", never "landed" | `src/engine/validate.ts` ~652–656: `landed=prevFlyLd[id]`, the tail string. Needs a flag carried beside `prevFlyLd` saying the landing was borrowed from the take-off (`events.ts` ~331: `toMin(f.ld\|\|f.to)` — the borrow; a "TBD" landing reads the same since D1990). The ruling's reading: the same words wherever the borrowed take-off is shown as a landing — the roll-call finds every such place (the crew-rest trace on the previous day's puck, the next-week peek, the phantom Monday in `weekctx.ts`, the Logic page's worked example if any). Engine file: the change is the behaviour change only, its compressed style kept. |
| 3 | D2015 | The Logic page's note under the changed-settings strip | `src/ui/LogicPage.tsx` ~443: "A published day keeps its printed B and its OIL until it is published again." New words written to the design guide §1, §1a, §1b (open them whole), saying a changed setting reaches a published day from that day's next amendment; shown to him as built, his to change. Keep it true for part 4's outcome and for the open question below. Fix its code comment too (it says the same old thing). |
| 4 | D2014 | A published day's OIL keeps the "Full day of OIL" it was published under: changing it on the Logic page no longer makes a published earning day read "1 pending" or drop its four sign-offs by itself; the new value reaches the day from its next amendment | below |
| 5 | D2024 | The project guide's "no rule versioning" line corrected | `raptor-port/CLAUDE.md` §Product invariants (~line 233) and its full text in `raptor-port/docs/guide-full.md` (search "rule versioning"). Since D2005 each published version keeps every Logic setting its checks read; since part 4, its OIL's full-day line too. A working-guide change: read by Astra and a fresh, blind Opus reader, each blind to the other, while he is awake, before his "merge live" (D2024, D1761, D1770). Also the comment in `src/engine/rules.ts` ~100 and `faceattrs.ts` `KEPT_RULE_KEYS`' comment, which call the OIL threshold "a question waiting for the owner". |

## Part 4, how it works today and the design (the agent's technical call)

**Today (read 14 Nov 26):** each published earning day's frozen OIL block keeps three Logic values, `rv` = report lead,
debrief, full-day line (`engine/oilev.ts` `OilEvidence.rv`, frozen at publication; `oilKeptVals`). The credit and the
published face already read those kept values (`oilAmount`, `oilDayWork`; `leavewar/sync.ts` ~1838), so the published OIL
itself never moved. But `publish.ts oilRuleDelta` → `oilev.ts oilRuleShift` compares the kept three against TODAY's three
and, where a man's record would differ, adds ONE pending entry `oilrv:<di>` — so a change of "Full day of OIL" makes the
day read "1 pending", drops the four sign-offs (D103), and (because `validate.ts untouchedKept` counts `dayDeltaCore`)
makes the day stop being judged by its kept D2005 settings. The working copy's OIL Earn figures read the live block,
whose `rv` is always today's (`oilev.ts oilEvidenceNow` → `rv: oilRuleValsNow()`), so OIL Earn shows the new amount at
once. Pending words: `ui/pendlist.ts oilRuleWords` (lists every one of the three values that differ). Sign-off binding:
`publish.ts oilRvBoundOk` (uses `oilRuleValsNow`).

**D2014 overrides D592 (5 Oct 26) for the full-day line only** — the later ruling wins; name both in the sheet. The
report lead and debrief keep D592's as-built behaviour (a change reads pending at once): **D2014's row says the other OIL
settings were not asked about — any that also reach a published day at once are put to him, not changed.** They do; so
that is a question for him (below), and they stay as built.

**The design — "the values the day's next publication would be worked out from" (`next`):** report lead and debrief:
today's (as built). Full-day line: the issued block's kept value while NOTHING ELSE waits on the day; today's once
anything else waits — the same rule D2005/D2013 use for every other setting ("once anything waits on the day, Edit
Schedule shows its next amendment checked by the new settings").
1. `oilRuleShift(day, ev, to?)` takes the target values (default today's — every other caller unchanged).
2. In `publish.ts`: "something else waits" = any of the content diff, the two input axes, the `oil:` entry, the
   lead/debrief shift (`oilRuleShift` with `{now lead, now debrief, kept full}`), and — at the `dayDelta` level only —
   `warnDelta` and `hideDelta`. **Never call `dayDeltaCore` from inside it** (recursion through `oilDelta`): build the
   pieces in `dayDeltaIn` directly. In `dayDeltaCore` (what `untouchedKept` and `officialDiverges` read — the validator
   must never depend on its own output) the threshold is decided on the core pieces; in `dayDelta` add the threshold
   entry when the core held it but a warning or hide change waits. So a threshold-only change: no entry, no pending, the
   sign-offs stand, the day still judged by its kept settings (no D2005 cascade).
3. Publishing: a publication needs a non-empty `dayDelta`, so "something else waits" is always true then, and freezing
   the live block with today's three (as now) is exactly what the pending list told. Check an Unpublish + Publish AL1 and
   a first publish too.
4. The live block's `rv` (OIL Earn's figures on the working copy, and the signature's `orv`): a hook from publish into
   oilev (oilev cannot import publish) returns the kept full-day line for a published day nothing else waits on, else
   null (today's). Cheap test first: only when the issued block's kept full-day line differs from today's. A re-entry
   guard (the hook's own work calls `oilEvidence` for the `oil:` key, whose value does not depend on `rv`).
5. `oilRvBoundOk` compares against `next`, not raw today's. `pendlist.ts oilRuleWords` lists only the values that differ
   from `next` and compares to `next`.
6. `faceattrs.ts KEPT_RULE_KEYS`: leave the threshold out of the D2005 copy — the OIL block's own `rv` is its one source
   (no second copy); fix the comments that call it an open question (`oil.ts` head, `rules.ts`, `faceattrs.ts`,
   `oilev.ts` `rv` doc).
7. Records: `docs/engine-rules.md` (publishing / OIL), `docs/ui-contracts.md` if the pending list's words change, the
   scheduler page's "Not built yet" lines for D2009, D2010, D2014, D2015, D2024 moved to built when built (the page's
   own shape; its size is a hard limit — D1932), OIL's page line D592 narrowed by D2014 (OIL's page is at its hard
   limit — a tightening of wording, or his word), `[RULES-CHECK-FIXES]` updated.

**A question for him (D2014's row), with pictures:** a change of the default rally ("Nominal report before T/O") or the
flight debrief still makes a published weekend that earns OIL read "1 pending" and drop its sign-offs at once (D592,
as built). Should those two also wait for the day's next amendment, as "Full day of OIL" now does? Recommended: yes, for
one rule across the Logic page (D754) — his to rule; not built until he does.

## How it is checked

Tier **FULL** (the order §5): YES to money (OIL, D25), the published record (pending, sign-offs), saved data (what a
version freezes), the warning list (parts 1 and 2). The batch is one check sized by its riskiest part (D485).
- The rules sweep: D2009, D2010, D2014, D2015, D2024 and every ruling they touch — D592, D48, D142, D45, D103, D98,
  D2005, D2013, D186, D1990, D2002, D2022 — each checked on the running build.
- Scenarios designed by a reader who did not build it (Astra; a fresh Opus reader if Astra cannot run) — §4.
- The roll-call (§6, §2a): every place the two check names print; every place a crew-rest "landed" prints; every place a
  published day's OIL shows (the published face, OIL Earn on the working copy and on View-only, the Leave War credit and
  its grid, the OIL tracker, the pending list and its count, the sign-off line, the changes window, the publish button,
  print and export).
- A walk sized by §7.0 and the walk ledger, Sonnet walkers each in their own world, the host opening every deciding
  picture; the plain-user round; the everything day. The scenario the D2005 check could not walk — a published earning
  weekend across a Logic change, end to end — walked by pressing the app's own controls (§7.0), with the before / after
  credit read on the Leave War.
- Red-first tests for each part; a break test per surface; `oilworkstart*.test.ts`, `published-day-logic-reads.test.ts`,
  `oil*.test.ts`, `rulesfirst-*.test.ts`, the Logic page's tests and the pending-list tests run as touched.
- Two blind reads of the finished code: Astra and a fresh Opus reader, same brief, neither seeing the walk's report.
- Part 5's own two reads (a working-guide change).
- GitHub's run green on the last pushed commit; the evidence sheet `docs/handpass/2026-11-14-rules-check-batch2.md`
  with its `Walk:` line; then his look and "merge live".
- About 3–5 hours of agent time by the order's table (not measured for this kind).
