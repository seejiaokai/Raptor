# [OIL-SEATS-CAN-EARN] — the plan, REWRITTEN after round 1 (22 Sep 26)

**Status: REWRITE, awaiting round 2. Not built.** Round 1 returned **REVISE from both providers** —
Fable 5.1 (7 must-fix, 9 should-fix) and Codex/GPT-6 Astra (7 findings, 4 high), independently and
blind to each other. Nothing was rejected. Four findings changed the plan's SHAPE, so this is a
rebuild, not a patch.

**Read first:** `2026-09-22-oil-seats-can-earn-review-log.md` (both reviews, the host's disposition
on every finding, where they agreed and diverged) and `2026-09-22-oil-seats-can-earn-review-fable.md`
(Fable verbatim, because its fix specs are step-by-step and the builder implements from those words).

Tier **FULL** under `raptor-port/docs/bug-check-order.md` §5: money (D25 — earned leave is owed),
a new gesture, a new surface, a shared drawer. Build on Opus high, WALK the running app, then both
providers read the finished code blind to each other. **The walk goes before the reads.**

**§9 lists every round-1 finding and where it is now handled.** Round 2 should check that table
first: a finding with no row there has been lost.

---

## 1. What the change is

The two placeholder pucks — **ALL** and **ALL AVAIL** — stop being an OIL-mode curiosity and become
an ordinary property of the schedule. Wherever one may be dropped, it says how many people would be
available to attend, whether or not the day earns OIL, and **it credits those people exactly as if
their names had been typed there** (D43). At the same time the four kinds that are wholly inert
today — SC SPARE, AVALON lines, AVALON duty desks, BB lines, and a duty block minted from an AVALON
template — gain a switch, defaulting OFF. And a seat with nothing the rules can measure is **refused
with its reason printed**, never a silent absence.

## 2. The rulings it carries

| Ruling | What it binds |
|---|---|
| **D24** (+**D35**) | SC SPARE, AVALON lines, AVALON desks, BB lines OFFER the switch, default OFF — and the switch reaches a block minted from an AVALON template too. |
| **D27** | The pucks are a SCHEDULING feature: dropped anywhere they work out who would attend and show the count, whether or not the OIL mode is on. |
| **D28** | Every seat can earn; the DEFAULT decides whether it does; the admin can always override. Nothing earns by default that does not earn today. |
| **D31** | A seat the rules cannot MEASURE offers no switch and says why on screen. |
| **D32** | ONE LIST: wherever a puck may LAND it must also OFFER the switch. |
| **D33** | The pucks are refused on **flying-line cockpit seats only**. |
| **D36** | **DO NOT WIDEN THE AVAILABILITY WINDOW** — step to dekit. See §5a; this one nearly went the wrong way. |
| **D37** | The count reads as **what it is** — who has nothing else on the programme at that time — not as a promise. |
| **D42** | An overnight line earns **the day it sits on**; the day the hours spill into earns nothing from it. |
| **D43** | **The placeholder pucks are ON by default, everywhere they can land** — like named people. Only the four exempt KINDS default off. |

**D43 supersedes** the "placeholder defaults off" reading of D27, the previous version of this plan
(its §5 step 3), and **both reviewers' recommendations**. It is simpler than either and it closes the
review's worst finding outright — see §6.

**Two ruling CLASHES this change must resolve out loud, not silently:**

- **D33 vs the 13 Aug 26 "plant first, warn after" rule.** Every door in this app plants and then
  warns; D33 asks for a hard refusal. Newest wins. **This change carves the first hard refusal out
  of that rule, and §5 step 2 says exactly where** — placeholder ids on flying keys, nothing else.
- **D24 vs the SC formation's shape.** MAIN and SPARE share one item address (§3 C1), so "SC SPARE
  offers the switch, default OFF" cannot be an item-level switch. Settled in §4: the default rides
  the SPAN, and an activated spare is credited by tapping the man.

## 3. What the code actually does

Everything here was read off the source. **Round 1 confirmed all four original findings and
corrected four claims** — the corrections are C1–C4 and were the host's own errors.

### The four, confirmed by both reviewers

- **F1 — the earn default is ON.** `oilItemOn` (`ui/oilmode.ts`) and `itemOn` (`engine/oilev.ts`)
  both return true unless an explicit `0` is stored, and `oilEarnedWork` passes a hard `true` as the
  default. **Deleting the exempt-kind skips without doing anything else would pay SC SPARE, AVALON
  and BB immediately** — silent money, the opposite of D24.
- **F2 — that rule is written twice**, and (Fable's nuance) the two read **different sources**: the
  mode reads the live `DAYS[di].oild`, the money reads `ev.d`, the frozen copy. They agree today only
  because publishing swaps one for the other. **Consolidate onto the EVIDENCE, not the live day.**
- **F3 — the silent drop is one helper.** `put` resolves one id and drops anything that is not a
  person; only the ground row's and the Common Programme's PRIMARY seats use `putWho`, which expands.
  Flying seats, sims, sim passengers, duty desks and **every extras array** use `put`. That is the
  owner's Sunday desk.
- **F4 — placement is unrestricted.** `setSlotVal` writes any id into any seat; `slotBar` accepts a
  placeholder on its first line; `isSpecial` removes both pucks from every validation and
  availability path (~30 sites). A placeholder in a cockpit draws as crewed with nobody on it.

### The four corrections round 1 forced

- **C1 — an ITEM default cannot work.** One `item` is stamped per ROW, and every occupant takes it:
  a duty row's named man and an ALL AVAIL in its extras share one address, as do a formation's MAIN
  and SPARE seats. There is no item-level way to give them different defaults. **The default must
  ride the SPAN.** (Codex OSE-01 from a mixed row, Fable M3 from the missing default source — two
  reviewers, opposite directions, same answer. Treat as certain.)
- **C2 — `oilCapableItems` does NOT exclude zero-length flying lines.** The report/debrief padding is
  applied BEFORE the length test, so a line taking off and landing at the same minute yields a
  positive five-hour window, reads as capable and can pay. A wording-only step would leave D31
  broken. (OSE-06.)
- **C3 — "the extra-people line beside ANY row" is not a real surface.** Flying keys take no `.xN`
  suffix, nothing renders extras for them, and drag refuses roster drops below cockpit seats. On the
  Common Programme the "extras" are the `who` list itself, which already expands. **The drops that
  actually lose the puck are: ground `more`, duty `id` and `more`, sim `p`/`w`/`pax`/`more`.**
  (OSE-07, Fable C.)
- **C4 — there are FOUR exempt-kind skips in `engine/oil.ts`, not three.** The fourth is in
  `dayOilBlind`, which is what makes a desk with no times speak at publish. Lift it with the others
  or write down why an AVALON desk stays silent. (Fable S2.)

### Three routes the original plan did not know about

- **The accepted-input claim path is separate money.** `dayOilWork` skips `g.src` ground rows
  entirely; their extras are gathered by `landedExtras`, which explicitly rejects specials, and paid
  through the input loop. **Folding expansion into `put` never reaches them.** (OSE-02, Fable S1.)
- **The mode cannot open a placeholder into real pucks** except on ground rows and the Common
  Programme. Everywhere else it draws an inert puck, so a man cannot be taken off the crowd
  individually — the item switch is the only door. Register OIL8 requires it. **The whole
  `[ALL-AVAIL-WINDOW]` design (D38) assumes individual pucks can be tapped.** (Fable M5.)
- **A swap is TWO independent writes.** `ui/drag.ts` does `setSlotVal(target, a); setSlotVal(from, b)`.
  A refusal inside the writer lets the second write run: the person is duplicated, the placeholder is
  lost, and the caller reports success. (OSE-04.)

## 4. The design, settled

**The default rides the SPAN.** `OilWork` gains `dflt: boolean`. In `dayOilWork`, a span is stamped
`false` when it comes from an `ac.spare` seat, a standalone wave that is not SC (AVALON/BB), or a
duty wave where `saExemptKind(dw.sa)`. **Everything else is `true`, including people a placeholder
expands to** (D43 — the placeholder needs no rule of its own; it inherits the seat's).

**The item mark becomes three-state.** `OilDecisions.items` widens from `Record<string,0>` to
`Record<string,0|1>`; `itemOn` returns `false` (blanket or `0`), `true` (`1`) or `undefined`;
`earnsFrom` becomes: item `false` → no; an explicit person decision wins next; item `true` → yes;
otherwise **the span's own default**. So with no marks at all, a shift's MAIN earns and its SPARE
does not, from one address.

**An activated spare is credited by tapping the man** (Fable M2 option A). No new address, and D24's
words — "the admin can just easily click credit OIL" — are satisfied. *Fallback if the walk shows
this reads badly:* give spare aircraft rows their own item off the aircraft rid, with the switch on
the MAIN/SPARE badge.

**The refusal is preflighted, not thrown from inside the writer.** `sentinelSeatOK(key, id)` answers
before anything is written; the drag and armed-placement callers check **both** destinations of a
swap and reject the whole operation with one reason; `setSlotVal`/`fillSlot` return a boolean and
write nothing on refusal (before `noteChange`, or a pending mark with no change reaches the next
amendment as an unexplained item). `slotBar` supplies the words so the drag ghost and the drop
message carry them for free, and the palette's placeholder row draws them struck out with the reason
when a cockpit is armed. **A non-expanding belt stays on the flying branch of `dayOilWork`** for data
that arrived by copy — a day template or a parked plan bypasses both doors.

**The count on a published day: LIVE where the day cannot earn, FROZEN where it can** — and the
count says which ("who has nothing else on today" vs "as issued"). **Host's arbitration between the
two reviewers**, recorded with its reason: Codex wanted membership frozen on every publication and
bound into the signature, which is safer in the abstract but would make every issued day read
"pending amendment" the moment anyone files ordinary leave that week — for a number that owes nobody
anything. That devalues the amendment mark, which *is* money-bearing. D37 also frames the count as a
starting point a scheduler can correct, not a promise. **Round 2 should attack this specifically.**

## 5. The order of work

Each step lands green before the next. **The refusal ships before the expansion, never after**, or a
cockpit placeholder briefly starts earning (Fable M4, which reordered the original plan).

1. **Consolidate the earn rule onto the EVIDENCE.** One function; the mode and the money both call
   it. No behaviour change — prove it by deleting the duplicate and watching the suite stay green.
2. **The placement refusal** (D33), preflighted per §4, with its reason on every door: drag, armed
   placement, the swap's both ends, and the palette's placeholder row. Plus the non-expanding belt on
   the flying branch. **This ships before step 5.**
3. **Span defaults and the three-state item mark** (§4). Land it with every `dflt` set `true` and the
   suite green — that proves the "no behaviour change" claim — then stamp the four exempt kinds
   `false` in the same step's second commit.
4. **Let the exempt kinds into the walk** (D24/D35), **all four skips** (C4), including the
   template-minted path, pinned by a test with a control the way D20's second half was.
5. **Expand the placeholder everywhere it can land** — the owner's Sunday desk. Red first: a test
   that reproduces it and fails. Covers ground `more`, duty `id`/`more`, sim `p`/`w`/`pax`/`more`
   (C3 — not "any row").
6. **The accepted-input claim path**, its own step because it is its own money route: resolve and
   freeze placeholder extras from the claim's authoritative window, preserve the requester's own
   answer, and update `landedExtras`, eligibility, decision pruning and switch presentation together.
   **Do not simply remove the `src` exclusion** — that would pay requesters through the unconditional
   schedule path.
7. **Open a placeholder into real pucks in the mode** on duty rows, sim rows and extras (OIL8), so a
   man can be taken off a crowd individually.
8. **Capability excludes a zero-length WRITTEN interval** (C2): validate `to`/`ld` before the padding
   is added, and derive both capability and the visible refusal reason from that one validation.
   Overnight intervals stay legitimate (D42), and D36's availability window is untouched.
9. **Show the count outside the mode** on every seat in §7, live-or-frozen per §4, memoised per
   (day, version) — this moves from weekend-in-mode to every day, every seat, every repaint, so it
   must cite `docs/performance.md` Part 1 and keep the chip as the tap target (Fable S4, S7).
10. **The wording pass** — the refusal (D31), the count (D37), and the mixed-default item switch,
    whose two current titles are not exhaustive once one item holds both default-on and default-off
    spans (Fable S8). One pass, one vocabulary, read side by side on the same screens.
11. `[OIL-UNDO-WORDS]` — one string — folded in if convenient.

## 5a. THE TRAP THAT ALMOST GOT BUILT — read before touching availability

The owner asked whether the pucks account for debrief timing. The code has **three** windows for one
sortie: availability pads **step (1h) → dekit (30m)**; the OIL rules use **report (3h) → debrief
(2h)**; and the warning list separately objects to anything inside land+2h.

**The agent recommended widening availability to include the debrief. That was WRONG**, and only the
owner's knowledge of how the squadron schedules caught it: an ops brief is deliberately slotted
between the flight brief and step — 1520–1620 against a 1620 step — precisely so the available men
can attend, and management moves a debrief to AFTER an ops brief. Both men ARE available. Widening
the window would have marked them unavailable for the very events the squadron builds around them.

**D36 settles it: the narrow window is correct and is not to be "fixed".** The three windows are not
a defect — they answer three different questions, and only one of them is availability. Fable checked
and found no violation in this plan; the belt is that the flying branch must never hand its
report→debrief window to the expansion.

**The method lesson, and it is the same one the owner's ALL AVAIL find produced:** a disagreement
between two bodies of code is a QUESTION, not a verdict. Reading the code shows which numbers differ;
only someone who runs the squadron can say which one is right.

## 6. The risks worth attacking

**The publication freeze**, still the serious one. It holds for every seat whose span carries a
non-empty item, and fails silently in four places this plan must close: a rid-less row (item `''` is
never frozen); a non-earning day (§4's arbitration); the claim path (step 6); and the flying branch
if it ever expands (step 2's belt). Its failure mode is confirmed silent — the specific path is the
Leave War's reverse sweep removing cells with nothing on screen.

**What D43 REMOVED from this section, and it was the worst item in it.** Round 1's headline finding
was that switching the two currently-paying seats OFF would recompute already-issued Saturdays and
delete landed credits with no amendment. **Nothing is switched off, so that path cannot be taken** —
no data reset, no upgrade guard, no before/after published-credit test. The exempt kinds pose no
equivalent risk: they earn nothing today and default off, so an issued day computes identically.

**Still live:** don't offer a switch where the day cannot measure, or a published day costs a real
amendment for a decision that moves no money. ALL and ALL AVAIL are two pucks with identical
behaviour — every check needs both, or one gets wired and the other forgotten. And an expected side
effect to name rather than discover: every new placeholder seat makes an issued day read "pending"
the moment anyone files an input for that date. Correct, pre-existing, now multiplied.

## 7. The roll-call — corrected

**No blank cells.** Re-marked against the running app during the walk, and every row **created by
hand** — where a thing can be PUT, not where the fixture already has it. That omission is how the
owner found the original defect.

| Seat | Takes a puck (D33) | Count shows | Switch offered | Default | Opens into pucks (OIL8) |
|---|---|---|---|---|---|
| Flying line — either cockpit seat, any wave kind | **Refused, with reason** | n/a | n/a | n/a | n/a |
| Sim — front and rear seat | Yes | must | must | **on** | must |
| Sim — passenger slots | Yes | must | must | **on** | must |
| Sim — `more` | Yes | must | must | **on** | must |
| Duty desk — its own position | Yes | must | must | **on** | must |
| Duty desk — `more` | Yes | must | must | **on** | must |
| Ground row — the who | Yes (works today) | must | must | **on** | has it |
| Ground row — `more` | Yes | must | must | **on** | must |
| Common Programme — the who list | Yes (works today) | must | must | **on** | has it |
| Ground row from an ACCEPTED REQUEST (`src`) | see step 6 | must | must | **on** | must |
| Next-week peek | draws a bare puck, no chip | **must not** — it is a peek, not the day | n/a | n/a | n/a |

The four exempt KINDS, which are about real people, not the pucks:

| Kind | Today | After |
|---|---|---|
| SC SPARE aircraft row | skipped before anyone enters the walk | reaches the walk, span defaults **off**, credited per man |
| AVALON flying line | ditto | ditto, switch offered |
| AVALON duty desk | ditto | ditto, switch offered |
| BB flying line | ditto | ditto, switch offered |
| Duty block minted from an AVALON template (D20 half two, D35) | default holds, switch absent | **switch offered too** — same seat, one answer |

**Roles:** the count is a READ a member sees on View-only Sched; the switch is the admin's. Both
halves enforced at the page and the write path, never the nav.

**The Leave War side, which round 1 found missing entirely:** the OIL tracker figure per man; the
FO/HO cell on the date; the clash strip when one of the crowd has leave that day; and the reverse
sweep when a switch is turned off after publication plus an amendment. A cross-app change walked on
one side only is what the standing order forbids.

## 8. The checks — FULL tier

Rules sweep; the other provider designs the scenarios; this roll-call re-marked in the running app;
the door check on the new refusal **in both orders**; the full walk at both widths; break tests; the
owner's Sunday desk seeded as a permanent fixture — **not in the frozen parity week** (Sunday 19 Jul
is inside `13/07/2026`; use `20/07/2026` or keep it script-planted, and verify which days `tfin.js`
compares before seeding); **both** providers read the finished code with the evidence sheet in hand;
re-walk what the fixes touch; the sheet with its pictures; then the owner's look.

**The walk goes BEFORE the reads.** Round 1 was a plan review — it read code and ran nothing. The
class of defect that has repeatedly reached the owner, a surface never wired up, is still only
findable by driving the app.

## 9. Round-1 findings → where each is handled

| Finding | Where it now lives |
|---|---|
| Codex OSE-01 / Fable M3 — item default cannot work | §3 C1, §4 (span default), §5 step 3 |
| Codex OSE-02 / Fable S1 — claim path is separate money | §3, §5 step 6, §7 row |
| Codex OSE-03 — issued evidence reinterpreted | §6 — **closed by D43**, nothing switches off |
| Codex OSE-04 — a swap is two writes | §4 (preflight), §5 step 2 |
| Codex OSE-05 / Fable M6 — no frozen membership on a non-earning day | §4 — host's arbitration, live vs frozen; **round 2 should attack this** |
| Codex OSE-06 — zero-length flying lines pass capability | §3 C2, §5 step 8 |
| Codex OSE-07 / Fable C — "extras beside ANY row" is not real | §3 C3, §7 (rows named exactly) |
| Fable M1 — the ruling clash and retrospective credit deletion | **closed by D43**, §2 and §6 |
| Fable M2 — MAIN and SPARE share one address | §4 (tap the man), fallback recorded |
| Fable M4 — the fold makes a cockpit puck earn; plant-then-warn clash | §2 (clash named), §4, §5 step 2 |
| Fable M5 — the mode cannot open a crowd into pucks | §3, §5 step 7, §7 column |
| Fable M7 — Leave War absent | §7 |
| Fable S2 — four skips, not three | §3 C4, §5 step 4 |
| Fable S3 — seed and parity | §8 |
| Fable S4 — performance | §5 step 9 |
| Fable S5 — overnight | **closed by D42**, §2 |
| Fable S6 — next-week peek | §7 row |
| Fable S7 — tap-target collision | §5 step 9 |
| Fable S8 — mixed-default item wording | §5 step 10 |
| Fable S9 — issued days read "pending" | §6 |

**Unresolved and deliberately so:** OSE-05/M6's remedy. The host chose live-on-non-earning; both
reviewers' positions are in the log. This is the one place round 2 is being asked to disagree.
