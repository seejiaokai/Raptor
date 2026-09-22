# [OIL-SEATS-CAN-EARN] — build handoff, steps 1–4 done, 5–11 to go

**Written 22 Sep 26, at a clean committed checkpoint.** Branch
`claude/oil-seats-can-earn`, pushed. Working tree clean. Nothing merged to
`main` — the owner has NOT said "merge live", and must not be asked to until the
FULL-tier walk is done.

## Read these, in this order, before writing any code

1. `2026-09-22-oil-seats-can-earn-plan.md` — **the approved plan. §5 is the
   order of work and it is not to be resequenced.** Its §2 carries three ruling
   clashes and how each was settled; its §9 lists every review finding and where
   it lives.
2. `2026-09-22-oil-seats-can-earn-review-fable.md` — Fable verbatim. **The
   builder implements from these words**; its fix specs are step-by-step and
   condensing them loses the point.
3. `2026-09-22-oil-seats-can-earn-review-log.md` — both reviews, every
   disposition, where the two reviewers agreed (treat those as certain).
4. `2026-09-22-oil-seats-behaviour-register.md` — **the list the rules sweep
   walks in the running app.** Extend it as each step lands.
5. `../../bug-check-order.md` — the standing order. This change is **FULL** tier;
   the eight answers are in the step-1 report and in §8 of the plan.

## What is BUILT (steps 1–4)

| Step | What landed | Tests |
|---|---|---|
| **1** | The earn rule reads the day's EVIDENCE, not the live day (F2 — the two copies read different sources). Split into `itemMasked` (the four guards) and `itemMark` (the switch's 0/1/undefined). `OilDecisions.items` widened to `0\|1`. Memoised inside `oilReadPass`, opened by `dayHTML` and `boardHTML` only. | `ui/oilmode.test.tsx` (4 pins at the foot) |
| **2** | D33/D47 — ALL and ALL AVAIL refused on flying cockpit seats, **preflighted** (`sentinelSeatOK`) at drag, armed placement, both ends of a swap, the `[data-fill]` targets; `setSlotVal`/`fillSlot` return a boolean belt. One sentence, `SENTINEL_JET_BAR`. Palette row struck out with the reason printed. Money belt: the flying branch never asks the expander. | `engine/oilseat-refusal.test.ts`, `ui/oilseat-refusal.test.tsx` |
| **3a** | `OilWork.dflt` — the default rides the SPAN. `spanDefault(day, ev, person, item)` is the ONE body the screen and the money both read. `earnsFrom` gains the `1`. `itemState` (on/off/mixed). The toggle cycle that can actually write a `1`. `oilOffReason`'s fifth state (`never`). Five switch sentences. `oilDayWork` memoised in the same pass. | `engine/oilspandefault.test.ts`, `ui/oilswitch.test.tsx` |
| **3b** | The four exempt kinds stamped `dflt:false` — **both** spare flags (`f.spare` AND `ac.spare`, Codex OSE-R2-02). Dormant until step 4. | (proved by step 4) |
| **4** | All FOUR skips lifted (the plan counted three; Fable S2 found the fourth in `dayOilBlind`). The exempt kinds reach the walk, default off, offer the switch, and can be credited by the item mark `1` or by an `allow` on one man. | `engine/oilexempt.test.ts` |

**Gates at the checkpoint:** vitest **5514/5514** · build + typecheck OK ·
reference parity **728/0** · rulecheck OK. The two browser gates
(`npm run test:e2e`, `npm run smoke:tracker`) have **NOT** been run this session
— run them before the PR.

## What is LEFT (steps 5–11), verbatim from the plan's §5

5. **Expand the placeholder everywhere it can land** — the owner's Sunday desk.
   **Red first.** Covers ground `more`, duty `id`/`more`, sim `p`/`w`/`pax`/`more`
   (C3 — *not* "any row"; flying keys take no `.xN` and the Common Programme's
   extras are the `who` list, which already expands). **Keep the flying branch
   non-expanding** — `engine/oilseat-refusal.test.ts`'s "never hands its window
   to the expander" is what goes red if you forget, and it also guards D36.
   Step 5 also pins §6's rid-less row: `put` never expands for an empty item.
6. **The accepted-input claim path** — its own money route. **BOTH the primary
   name box AND the extras** (Codex OSE-R2-04; the first rewrite covered only
   the extras). Resolve and freeze from the claim's authoritative window,
   preserve the requester's own answer, update `landedExtras`, eligibility,
   decision pruning and switch presentation together. **Do NOT simply remove the
   `src` exclusion** — that pays requesters through the unconditional schedule
   path. D46 keeps this path.
7. **Open a placeholder into real pucks in the mode** on duty rows, sim rows and
   extras (OIL8), so a man can be taken off a crowd individually.
8. **Capability excludes a zero-length WRITTEN interval** (C2): validate `to`/`ld`
   BEFORE the report/debrief padding. **THIS CHANGES HISTORICAL MONEY and needs
   its own guard** (Codex OSE-R2-03) — an issued Saturday flight taking off and
   landing at the same minute pays a half day today and would pay nothing after.
   Old issued evidence must be held to the rule it was issued under, and the
   correction must show in the amendment comparison.
9. **Show the count outside the mode** on every seat in §7, **frozen per D44**.
   ONE resolver behind all four readers, taking an **issued-or-working context**
   (OSE-T-02 — never fall back to live inside an issued version; say "membership
   not recorded" for a historical gap). **The chip must carry its VERSION**
   (OSE-R2-05). Cite `docs/performance.md` Part 1; the memo already landed at
   step 1.
10. **The wording pass** — the refusal (D31) and the count (D37). The switch's
    five titles already shipped at step 3.
11. `[OIL-UNDO-WORDS]` — one string, if convenient.

**Then, and only then:** the roll-call re-marked in the running app → the door
check in both orders → **the WALK** at both widths with pictures → fix → both
providers read the finished code with the evidence sheet → re-walk what the
fixes touched → the evidence sheet → the owner's look → his "merge live".
**The walk goes BEFORE the two code reads.**

## Decisions made THIS session that are not in the plan's original text

- **D47 (owner): "keep the refusal."** Recorded in `DECISIONS.md` and carried by
  `docs/ui-contracts.md` §Arm-and-plant. What settled it: arming an empty seat
  asks *who can fly THIS seat* (seat, qual, SC currency, crew rest, busy,
  absences); the puck asks only *who has nothing else on at that time*, so on a
  front seat it would gather WSOs, men not SC current and men who would break
  crew rest, and pay them all. **Do not re-propose downgrading it to a warning.**
- **A third ruling clash**, found during step 2 and not predicted by either
  review: the 13 Aug "a placeholder puck arms its seat" shortcut was pinned on a
  COCKPIT seat. Resolved in the plan's §2 and re-proved on a duty desk.
- **Six existing tests were updated, none weakened.** Five proved "AVALON earns
  nothing" by ABSENCE from the raw walk and now prove it by the DEFAULT; the
  sixth used AVALON as its example of "ineligible", and the example moved while
  OIL7 and OIL28 stayed intact (the ⓘ row is now the control).

## Traps this session actually hit — do not re-learn them

- **`dayOilCredits` / `dayOilSpans` are NOT the money.** They are the raw walk
  and are exposed only on the probe bridge. The money is `oilEarnedWork`. After
  step 4 the raw walk includes the exempt kinds; the money still does not pay
  them. Check which one a failing test is asserting on before changing anything.
- **The seed Saturday already carries flying, duty and sim work.** Any assertion
  of the form "nobody earns" or "this is the last earning item" needs the day
  stripped first, and the test must say which property forced that.
- **An arm does not survive an `act()` boundary in a fresh jsdom harness.** Arm
  and place inside ONE `act`. (Whether the real app holds the arm across a
  repaint is a WALK question — put it on the walk list.)
- **`view.DPREV` is view state and survives a `DAYS` reset**; a day listed in it
  refuses every arm silently.
- **Every scripted edit must assert its anchor matched.** A silent no-op costs a
  debugging cycle pointed at the wrong file.
- The build's tsconfig is stricter than `tsconfig.json` — run `npm run build`,
  not just `npx tsc --noEmit`.

## The owner's open question for the walk

Crediting an activated SC spare is done **by tapping the man** (Fable M2 option
A). If the walk shows that reads badly, the recorded fallback is to give spare
aircraft rows their own item off the aircraft rid, with the switch on the
MAIN/SPARE badge. **That is a walk finding to put to him, not a decision to
take.**
