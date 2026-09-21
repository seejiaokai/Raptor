# [OIL-AUTO-REMOVE] + [ALL-AVAIL-REDEF] — the BUILD session's handoff (21 Sep 26)

**Status: BUILT, gates green, HELD for the owner's "merge live".**
Branch `claude/oil-auto-remove-design`, PR https://github.com/seejiaokai/Raptor/pull/424.

The design is `2026-09-21-oil-auto-remove-decisions.md`. The rulings the build had
to obey are `2026-09-21-oil-behaviour-register.md` (29 of them, ids OIL1–OIL29 plus
the carried OIL30–OIL39). This file is what the CHAT held that neither of those
does: what was decided while building, what was found, and what is still open.

---

## 1. What is open, and it is the owner's to answer

### O-1 — the green bar: the man's DAY, or only the events that COUNTED? (RAISED 21 Sep 26, UNANSWERED)

The owner, on being shown that an ⓘ info-only row still draws a man's green bar:
*"I thought the green should show for individual pucks on individual events?"*

This reopens **§2.10 / OIL21**, which rules the bar is the man's DAY figure repeated
on every puck he wears that day, never what one event earned. That ruling is
load-bearing: an OIL figure exists only per day (FO = a full day off in lieu), the
measure is first-start-to-last-end across the whole day including gaps, and the
repetition is what stops a man on four DASH rows reading as four full days.

Two readings were put to him, with a recommendation:

- **(a) RECOMMENDED — draw the bar only on the events that COUNTED towards his
  day.** Still his day figure, but withheld on any row that gave him nothing: an ⓘ
  row, a row whose item is switched off, a person the admin denied, a row with no
  written times. Green on a row then means "this row counted towards his day", the
  schedule agrees with what the mode shows when a puck is tapped off, and the ⓘ
  confusion goes away at the root. A man on four rows where two counted shows the
  bar twice, which is honest.
- **(b) NOT recommended — a real per-event figure** ("this event was two hours, so
  HO"). It invents a number the rule does not have, and four rows would read as
  four separate part-days.

**If (a) is confirmed, the change is small and local.** `ui/oilmode.ts oilBarOf`
currently returns the man's day figure whenever he has one. It would take the item
key as well (the seat renderers already resolve one — `oilItemOfKey` for the week
and the board, `OILITEM` for the board's row walk) and return null unless that man
has a surviving span on THAT item — which is exactly what `oilEarnedWork(day, ev)`
already computes per person with `w.item` on every span. Pin it with a test in
`ui/oilmode.test.tsx` beside the existing OIL20/OIL21 ones, and correct OIL21's
wording in the register, in `docs/ui-contracts.md` §OIL on the schedule and in
`docs/engine-rules.md`. Nothing in the engine or the credit path moves — this is a
display rule only.

### O-2 — ground crew earning OIL: ANSWERED "leave it"

They ride the Leave War roster (his 18 Aug 26 ask), so a ground-crew man a
scheduler NAMES on a weekend row earns from that row, and always has. He is
correctly OUT of the ALL AVAIL expansion. Put to the owner 21 Sep 26; his answer
was **leave it**. Recorded so it is never "fixed" as a bug.

### O-3 — the ALL AVAIL count chip counts each man's DAY: ANSWERED "leave it"

So a row switched off can still read "1 of 45 earn" if that man earns elsewhere
that day. It is that way because the bar means the same thing, and the two must not
disagree on one puck. Put to the owner; his answer was **leave it**. NOTE: if O-1
lands as (a), this should be re-examined in the same pass — the chip and the bar
would then both mean "counted on this row" and could stay in step.

---

## 2. What the build DECIDED that the design did not spell out

Each of these is implemented and commented in place; listed here so a reviewer
knows they were choices, not accidents.

1. **A SANS man's eligibility and the timing clash are separate tests.** "Planned on
   our programme that day" makes him eligible for ALL AVAIL at all; the ordinary
   "his own tasking overlaps this event" exclusion then applies to him like anyone
   else. So a SANS man flying at exactly the event's hours is still out of it.
2. **The OIL axis normalises an absent value to ''** in the signature binding, where
   the filing axis forces a re-sign. A binding written before the block existed
   carries no oil field, and on a day that earns nothing there is nothing it could
   have failed to promise.
3. **`daySnap` now mints row ids before taking the snapshot.** engine/rowids.ts
   always claimed "one walk before every baseline and SNAPSHOT" and only histPush
   and loadWeek did it. It matters now because every OIL decision is addressed by a
   row id; an id-less row would freeze a decision-less, sentinel-less item.
4. **A snapshot with NO evidence block PROTECTS its date** — the landed credit
   stands, nothing new is derived. Same doctrine the pass already applied to an
   unresolvable snapshot, and the reason the cutover reset exists.
5. **The board goes read-only for schedule editing inside OIL mode.** One gesture
   must not have two meanings on the same pixel.
6. **A row with no `rid` has no item address** — it cannot be marked individually
   (the day blanket still covers it) rather than taking a positional address a
   reorder would move under it.

---

## 3. What the RULES WALK found (all fixed, all pinned)

Driven in the built bundle against the register, phone and desktop.

1. **A published day was quietly rewriting itself.** `oilEvidence` handed back the
   LIVE decisions object, which `daySnap` then froze — so marking another man on a
   published Saturday changed the issued document, the delta read "no change", and
   the day could never be amended. 5328 unit tests missed it because every fixture
   REPLACED `oild` where the board MUTATES it. Fixed by copying; the new test
   mutates in place.
2. **The mode could not reach the Unavailable block**, so overseas duty — the one
   OIL-earning claim with no row on the programme — could not be taken off at all,
   and its earner's bar showed nowhere.
3. **A hidden SANS man's credit fell on the floor.** The owner's answer ("There's no
   way to credit OIL to SANs even when they are hidden?") is that hiding is a
   display choice and must not forfeit money. A credit lives on the person and the
   date, so it lands while he is hidden and his row arrives carrying it.
4. **"✓ Done with OIL" overflowed a 390px screen** — caught by the pre-build comp.
5. **The phone's top bar gained a second row** — caught by the geometry gate. The
   desktop-only buttons were hidden but still CHILDREN of the bar, so they measured
   as a row. Fixed in the markup with a `display:contents` wrapper; the gate's
   assertion was right and is untouched.

**A pre-existing failure, verified not ours:** `npm run perf`'s behavioural check B
("an edit on day 1 rewrites only day 1") fails on the pre-change commit too —
confirmed by stashing. Its DOM ceilings pass.

---

## 4. Where the work is

| | |
|---|---|
| the evidence block, the decision algebra, the serialisation | `src/engine/oilev.ts` |
| the item-address grammar, and the walk that stamps it | `src/engine/oil.ts` |
| freezing it, the delta axis, the signature binding | `src/engine/publish.ts` |
| stripping it from every clone back to a working copy | `src/engine/drafts.ts` |
| who an ALL AVAIL puck stands for | `src/leavewar/sync.ts` (`availableFor`, `creditable`, `creditFrom`) |
| the mode, the figures, the day bar | `src/ui/oilmode.ts` |
| the green edge and the sentinel chip | `src/ui/html.ts` (`puck`'s 7th argument, `oilSeatDeco`) |
| the board's rows, switches and seats | `src/ui/board.ts`, `src/ui/board-html.ts` |
| the cutover reset | `src/storage/reset.ts` (schema 5) |
| tests | `src/engine/oilev.test.ts`, `src/ui/oilmode.test.tsx`, `src/leavewar/oilsync.test.ts` |

---

## 5. THE NEXT JOB: a cross-provider bug check

The owner's standing rule is that the model which wrote the code never reviews it.
This was built on **Opus 5**, so the check goes to **Fable 5.1 (high)** and **Astra
(Codex, high)**, both, and the reviewer must return exact, step-by-step fix
instructions per finding rather than a direction (his standing rule).

**Where to point them, in priority order:**

1. **§9's four answers were never independently reviewed** — the design's own red
   team stopped at the owner's two-round cap. They are the three-state decision
   (§9.1), the ONE aggregate delta address (§9.2), the derive/freeze boundary and
   what publication freezes (§9.3), and the cutover's real scope (§9.4). Give these
   the most attention; they are the least-checked part of the design.
2. **The aliasing class of bug.** One was found by hand (§3 above). Ask explicitly:
   is any other part of the evidence handed back by reference, and does any other
   fixture set state by a route production code does not use?
3. **The freeze boundary.** Does anything still read live INPUTS, the live roster or
   the live day for MONEY on a published day? `creditFrom` is meant to be the only
   door.
4. **The delta axis.** Can an OIL change ever be publishable but produce no item, or
   produce an item but no delta? Can it survive a draft switch, a recovery, an undo
   and a week load?
5. **The cutover.** Is there any path where an old snapshot with no evidence block
   credits or sweeps rather than protecting?
6. **The ALL AVAIL redefinition.** Is any caller left that resolves a sentinel a
   different way, and can the new exclusions ever empty a row the owner meant to
   fill?

---

## 6. If it is "merge live"

Gates, all green at the last commit: 5328 unit · build · parity 728/0 · e2e 447 ·
tracker smoke 425 · `npm run rulecheck` OK. Then merge on green, wait for Pages,
load the real page, look at a weekend day, and send ONE notification.

**Tell him at the merge:** the first load after this goes live CLEARS the demo data
— the weeks including their published days, the inputs and the Leave War, re-seeded
together. He agreed to it ("ok reset") knowing the scope.
