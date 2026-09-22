# [OIL-SEATS-CAN-EARN] — the plan, REWRITTEN after round 1 (22 Sep 26)

**Status: BUILDABLE. Two rounds plus a targeted check of the fold, all folded in.** Two rounds, both
providers, independently and blind to each other. **Round 1:** Fable 7 must-fix + 9 should-fix,
Codex 7 (4 high) — four changed the plan's SHAPE. **Round 2, on the rewrite:** Codex 5 (4 high),
Fable 5 must-fix + 4 should-fix — and **three of Codex's five were errors the host introduced while
fixing round 1**, which is the argument for the second round having existed. Nothing was rejected in
either round. The owner then settled four questions (D43–D46), two of which closed findings outright.

**The round cap is reached — there is no round 3.** The owner asked for ONE targeted check of the
delta instead: did round 2 get folded in correctly, and does anything new appear. After that the
next checks are a different kind — both providers reading the finished CODE, and the WALK.

**Read first:** `2026-09-22-oil-seats-can-earn-review-log.md` (both reviews, the host's disposition
on every finding, where they agreed and diverged) and `2026-09-22-oil-seats-can-earn-review-fable.md`
(Fable verbatim, because its fix specs are step-by-step and the builder implements from those words).

Tier **FULL** under `raptor-port/docs/bug-check-order.md` §5: money (D25 — earned leave is owed),
a new gesture, a new surface, a shared drawer. Build on Opus high, WALK the running app, then both
providers read the finished code blind to each other. **The walk goes before the reads.**

**§9 lists every finding from BOTH rounds and where each is handled.** Check that table first: a
finding with no row there has been lost. Round 2 found exactly that — two findings marked handled
were handled in name only.

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
| **D44** | **Who was behind a puck is FROZEN at publication on EVERY day**, earning or not. Issued = frozen; working copy = live; the difference is the pending mark. |
| **D45** | **A change in availability NEVER invalidates a signature.** The pending mark is the whole mechanism, the same on every day. **The principle under it is a standing test:** nothing on a published schedule may change without the scheduler acknowledging it. |
| **D46** | **The placeholder is allowed on an accepted REQUEST row and credits by default — no exception to D43 anywhere.** Removing the puck removes the crediting (immediately when unpublished; on re-issue when published). |

**D43 supersedes** the "placeholder defaults off" reading of D27, the previous version of this plan
(its §5 step 3), and **both reviewers' recommendations**. It is simpler than either and it closes the
review's worst finding outright — see §6. **D27, D28, D32 and D33 now carry that amendment in
`DECISIONS.md`**; Fable R2-5 caught that they did not, which was the host breaking the owner's own
rule about correcting stale text in the same change.

**D46 rejects Fable R2-4 and the host's agreement with it.** Both wanted the puck refused on a
request row; the owner took the no-carve-outs answer after checking that removing a puck removes its
crediting. So step 6 KEEPS its third freeze path rather than losing it.

**D44 and D45 fit together, checked:** because the list is frozen, a change in availability alone
never moves a credit — the issued day keeps paying the people it was issued with. Money moves only
on a re-issue, and a re-issue is signed through the ordinary amendment flow. So credits can never
move without a signature behind them, which is why D45 leaves no hole.

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

**The default rides the SPAN — and the predicate covers BOTH spare flags.** A span is stamped
`false` for `f.spare` **and** `ac.spare` (the old exclusion checks both; the rewrite named only one,
Codex OSE-R2-02), a standalone wave that is not SC, and a duty wave where `saExemptKind(dw.sa)`.

**The item mark becomes three-state — as TWO functions, not one** (Fable R2-2). Consolidating a
three-valued answer into the existing callers would break them: six of them treat it as a boolean,
and `!undefined` is true, so every puck would go inert and every item tap would toast "masked".
So step 1 lands **`oilItemMasked(di,item): boolean`** (blanket or `0`) for the four guards —
semantics unchanged — and **`oilItemMark(di,item): 0|1|undefined`** for the switch. Plus
**`itemState(di,item): 'on'|'off'|'mixed'`** for drawing, because an SC shift legitimately holds
both. `earnsFrom`: item `false` → no; an explicit person decision next; item `true` → yes; otherwise
the span's own default.

**Nothing writes the `1` today** — `toggleOilItem` only writes `0` or deletes, so an AVALON line
could never be switched ON and D24's switch would draw and do nothing. The cycle becomes: unset-on
→ `0`; unset-off or mixed → `1`; `1` → `0`; `0` → delete.

**The MODE's own default must move with the money's** (Fable R2-1, the sharpest finding of round 2,
and the same defect Codex OSE-R2-01 found from the opposite end). The rewrite changed `earnsFrom`
and left `itemDefaultFor`, which returns `true` with no claim. Traced: a default-off SPARE man draws
GLOWING while the money pays him nothing, and his tap writes `deny` for a credit he never had —
`allow` is unreachable, **so D24's only door would not exist**. Fix: a shared `spanDefault(day, ev,
person, item)` in the engine, read by `itemDefaultFor` AND `oilEarnedWork`, so screen and money
cannot disagree. And `toggleOilPerson` must compare against the **effective** default under the item
mark (`mark === 1 ? true : spanDefault`), or a man on a line forced on can never be taken off.

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

**The count is FROZEN at publication on EVERY day, earning or not (D44).** The issued version keeps
the people it was issued with; the working copy shows the live answer; the difference raises the
ordinary pending mark, and the scheduler amends or publishes the EOD version.

**This REVERSES the host's arbitration, and the reversal is recorded rather than quietly swapped.**
The host had chosen live-on-a-non-earning-day, arguing that a pending mark for a number owing nobody
anything would devalue a mark that does carry money. The owner overruled it with a fact the code
could not supply: **the squadron reviews every change at the close of the day and issues an EOD
version as the record of what actually happened**, so that pending mark is the SIGNAL their process
runs on, not noise — and a change in who was available IS something that happened.

**So Codex OSE-05 was right and the host was wrong.** Membership becomes a first-class snapshot
value, **recorded on every publication and inside the PUBLICATION COMPARISON — but NOT inside the
signature binding** (D45; the fold got this wrong, carrying Codex's round-1 remedy whole while the
owner had rejected half of it. Caught by the targeted check, OSE-T-03, and it was executable rather
than cosmetic — the key used for signature binding already includes membership, so an
availability-only change would have invalidated a signature the owner said it must not). **Two
projections, not one:** the publication comparison carries membership on every day; the signature
projection excludes an availability-only membership change while still invalidating on a changed OIL
decision or anything else approval-relevant.
**Fable's R2-3 fix 1 is superseded** — do NOT record membership "only where it is money-bearing".
**Fable's correction 1 still holds and is exactly the owner's own description:** frozen in the
ISSUED version, live on the WORKING copy, the difference showing as the pending mark. **Fable's
correction 2 still holds:** one resolver behind all four readers
(`oilSentinelSummary`, `oilSentinelList`, `oilSentinelPeople`, `oilRowPeople`), or the chip says 27
and the tap says "Nobody is behind this puck on this day". **And the chip must carry its version**
(Codex OSE-R2-05), or the frozen promise dies on the tap.

**But the resolver is NOT "frozen if present, else live" — that would break D44 on the snapshots
that already exist** (OSE-T-02). A non-earning day records an EMPTY membership today, and older
issued duty and sim placeholders have no entry at all; falling back to live would let an ISSUED
version change its own count when someone files leave, which is the one thing D44 forbids. **So the
resolver takes an explicit issued-or-working context.** Working copy → resolve live. Issued → the
recorded list, and where a historical snapshot recorded none, say **"membership not recorded"** and
leave the existing credit semantics alone until it is re-issued. **Live availability is never
substituted into an issued version.**

**Second time the owner's knowledge of the PROCESS corrected the agent's reasoning about the code.**
D36 was the first — see §5a, whose lesson is now twice-earned.

## 5. The order of work

Each step lands green before the next. **The refusal ships before the expansion, never after**, or a
cockpit placeholder briefly starts earning (Fable M4, which reordered the original plan).

1. **Consolidate the earn rule onto the EVIDENCE, as the TWO functions §4 names**, and **memoise
   here, not at step 9** (Fable R2-7): the mode's check is O(1) today off the live day; on the
   evidence it builds the whole block per call, and it is called per row and per puck.
   **BUT NOT keyed on (day identity, store version)** — that is unsafe and would break this step's
   own "no behaviour change" claim (OSE-T-01). The day is mutated IN PLACE and the version only
   advances at notify, while the post-mutation epilogue runs VALIDATION first — and validation asks
   whether the day would earn. A cache filled by the previous paint would answer with the pre-change
   evidence, so switching off the last earning item could leave an obsolete OIL warning standing.
   **So: the authoritative calculation stays uncached through mutation, validation, signing and
   publication, and the cache lives inside an explicit read-only render pass** — or, if one cache is
   preferred, an invalidation generation advanced before the first post-mutation read, with this step
   naming that boundary rather than leaning on the notify version. Prove it by priming the cache,
   toggling the last earning item, and checking the evidence AND the validation before notify runs —
   plus undo and snapshot rendering.
2. **The placement refusal** (D33), preflighted per §4, with its reason on every door: drag, armed
   placement, the swap's both ends, and the palette's placeholder row. Plus the non-expanding belt on
   the flying branch. **This ships before step 5.**
3. **Span defaults, the two item functions, and the shared `spanDefault`** (§4). Land it with every
   `dflt` set `true` and the suite green — but **the proof must include the MODE rendering and the
   person default, not only the money** (Fable R2-2: a green suite that never opens the mode proves
   nothing). Then stamp the exempt kinds `false` in the same step's second commit. **Ship the switch
   wording WITH this step, not at step 10** (Fable R2-10): from here the switch has five states and
   `oilOffReason` needs its fifth — otherwise the mode spends steps 4–10 telling the admin a man
   "earns nothing from this event — tap to put him back on it" about a man who was never on it.
4. **Let the exempt kinds into the walk** (D24/D35), **all four skips** (C4), including the
   template-minted path, pinned by a test with a control the way D20's second half was.
5. **Expand the placeholder everywhere it can land** — the owner's Sunday desk. Red first: a test
   that reproduces it and fails. Covers ground `more`, duty `id`/`more`, sim `p`/`w`/`pax`/`more`
   (C3 — not "any row").
6. **The accepted-input claim path**, its own step because it is its own money route. **BOTH the
   primary name box AND the extras** — the rewrite covered only the extras, and a placeholder can sit
   in either (Codex OSE-R2-04; this was Fable S1 handled in name only). Resolve and freeze from the
   claim's authoritative window, preserve the requester's own answer, and update `landedExtras`,
   eligibility, decision pruning and switch presentation together. **Do not simply remove the `src`
   exclusion** — that would pay requesters through the unconditional schedule path. **D46 keeps this
   path**: the crowd credits by default here like anywhere else.
7. **Open a placeholder into real pucks in the mode** on duty rows, sim rows and extras (OIL8), so a
   man can be taken off a crowd individually.
8. **Capability excludes a zero-length WRITTEN interval** (C2): validate `to`/`ld` before the padding
   is added, and derive both capability and the visible refusal reason from that one validation.
   Overnight intervals stay legitimate (D42), and D36's availability window is untouched.
   **THIS STEP CHANGES HISTORICAL MONEY and needs its own guard** (Codex OSE-R2-03): an issued
   Saturday flight with take-off and landing at the same minute pays a half day today and would pay
   nothing afterwards, because the money is recomputed from the frozen day and the reverse sweep then
   deletes the credit with no amendment. Old issued evidence must be held to the rule it was issued
   under, and the correction must be visible in the amendment comparison — an old signature must not
   authorise changed money. Prove it: an old zero-length snapshot keeps its credit until an explicit
   correction; a new one is refused with D31's reason; publishing the correction moves the Leave War
   cell. Valid-flight and placeholder snapshots as controls.
9. **Show the count outside the mode** on every seat in §7, **frozen per §4 (D44)** — this moves
   from weekend-in-mode to every day, every seat, every repaint (memo landed at step 1), so it must
   cite `docs/performance.md` Part 1 and keep the chip as the tap target (Fable S4, S7).
   **ONE RESOLVER behind all four readers** — `oilSentinelSummary`, `oilSentinelList`,
   `oilSentinelPeople`, `oilRowPeople` (Fable correction 2), or the chip says 27 and the tap says
   "Nobody is behind this puck on this day". It takes an **issued-or-working context** and never
   falls back to live inside an issued version (OSE-T-02). **And the chip must carry its VERSION**
   (Codex OSE-R2-05): the snapshot is installed only while the HTML is generated, so a tap re-reads
   live evidence and an issued day can show one number and list another.
10. **The wording pass** — the refusal (D31) and the count (D37), which must say whether it is the
    issued list or the live one. The switch's five titles shipped at step 3. One vocabulary, read
    side by side on the same screens.
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

**The publication freeze**, still the serious one. Its failure mode is confirmed silent — the path
is the Leave War's reverse sweep removing cells with nothing on screen. Three of the four holes are
closed by steps of this plan: the non-earning day by D44, the claim path by step 6, the flying branch
by step 2's belt. **The fourth — a rid-less row — is closed BY CONSTRUCTION** and should be pinned
rather than listed as open (Fable R2-8): every painted row is minted an id by the mutation, load,
publish and draft paths alike. Step 5 pins it: `put` never expands for an empty item, and a rid-less
row credits nobody.

**What D43 removed, and what it did NOT.** Round 1's headline finding was that switching the two
currently-paying seats OFF would recompute already-issued Saturdays and delete landed credits with no
amendment. **Nothing is switched off, so THAT route is closed.**

**The host then over-claimed — three times — that "an issued day computes identically", and it has
been holed three times. The claim is deleted rather than re-qualified.** What is actually true:

- **Step 8 changes historical money by a different route** (Codex OSE-R2-03): a zero-length flight on
  an issued day pays today and would pay nothing afterwards. **Step 8 carries its own guard and its
  own before/after test.**
- **Steps 4–5 change the amendment BOOK, not the money** (Fable R2-3): an issued day gains a live
  membership entry the frozen block lacks, so it reads pending. Correct under D44/D45 — and it is a
  NAMED EXPECTATION here, because the walk would otherwise report it as a defect. **On an exempt desk
  the same pending mark appears and no credit does** — under D44 the mark follows the membership, not
  the money, so that is correct rather than the anomaly the rewrite called it.
- **Lifting the fourth skip** makes existing AVALON desks with a man and no times warn at publish.
  Screen, not money.
- **The before/after published test is RESTORED**, in the additive direction: publish a Sunday desk
  with the old reader, run the new one, assert the issued credit holds, the day reads pending, and a
  re-issue moves the money. **Exempt-desk variant: PENDING WHEN MEMBERSHIP DIFFERS, and no credit
  while earning stays off** — not "no pending, no money", which was a leftover of the
  money-bearing-only rule D44 replaced (OSE-T-04). **Under D44 the pending mark follows the
  MEMBERSHIP, never the money.**

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

**A SURFACE axis, which round 1's table lacked entirely** (Fable R2-9): board at phone and desktop,
edit week, view week, **the version preview — the only place "as issued" is visible, so it MUST be
walked**, the CSV export (flying seats only — a written NO-because), and the next-week peek.

**Control rows, so the walk can tell a change from a coincidence:** an SC-template desk (not exempt)
that earns today and must still earn; a cockpit holding a placeholder that arrived by COPY, which
must credit nobody; and the mixed SC shift's switch at both widths.

**One layout question the walk must answer rather than assume:** where 27 opened pucks go in a sim
row's people cell at phone width.

**And a second "free" count sits on the same screen:** the Available-crew panel says "Pilots · N
free" from a different body than the puck's count. Two answers to one word, in view at once — a D37
wording item, not a defect.

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

### Round 2

| Finding | Where it now lives |
|---|---|
| Codex OSE-R2-01 / Fable R2-1 — the read changed, the write did not; a default-off man draws glowing and cannot be credited | §4 (`spanDefault` shared by screen and money; effective default in the person toggle), §5 step 3. **Both reviewers, opposite ends, one defect — treat as certain.** |
| Codex OSE-R2-02 — the span predicate omitted formation-level `f.spare` | §4 (both flags named) |
| Codex OSE-R2-03 — step 8 changes historical money | §5 step 8 (its own guard and test), §6 |
| Codex OSE-R2-04 — half of the claim finding lost: the primary name box | §5 step 6 (both seats) |
| Codex OSE-R2-05 — the chip carries no version, so the tap re-reads live | §5 step 9 |
| Fable R2-2 — three-state breaks six boolean callers; nothing writes the `1` | §4 (two functions + `itemState`), §5 steps 1 and 3 |
| Fable R2-3 — "computes identically" is false for the amendment book | §6 (the claim deleted, the expectations named, the test restored) |
| Fable R2-4 — the placeholder on a request row | **closed by D46** — allowed, credits by default, no carve-out |
| Fable R2-5 — D43 not written into the rulings it supersedes | **FIXED** — D27, D28, D32, D33 annotated in `DECISIONS.md` |
| Fable R2-7 — memoise at step 1, not step 9 | §5 step 1 |
| Fable R2-8 — the rid-less row is closed by construction | §6, pinned at step 5 |
| Fable R2-9 — roll-call still missing a surface axis and controls | §7 |
| Fable R2-10 — wording moved too late | §5 step 3 (the switch's five titles ship there) |
| Fable correction 1 — frozen in the issued version, live on the working copy | §4 — and it is exactly the owner's own description |
| Fable correction 2 — one resolver behind all four readers | §5 step 9 |

### Targeted check on the fold (not a third round)

The owner capped the rounds and asked for one bounded check of the delta. It **confirmed all five
round-2 fixes are substantively specified** and found four more — **three the host's own errors in
the fold, two of those direct contradictions of the owner's own rulings.**

| Finding | Where it now lives |
|---|---|
| OSE-T-01 — the memo's invalidation is unsafe: the day is mutated in place, the version advances only at notify, validation runs first | §5 step 1 — uncached through mutation, validation, signing, publication |
| OSE-T-02 — "frozen if present, else live" lets an ISSUED version change its own count, which D44 forbids | §4 and §5 step 9 — explicit issued-or-working context, "membership not recorded" for a historical gap |
| OSE-T-03 — the fold still put membership inside the SIGNATURE binding, which D45 rejects, and it was executable | §4 — two projections: comparison yes, signature no |
| OSE-T-04 — "exempt desk: no pending" is a leftover of the rule D44 replaced | §5 step 8 and §6 — the mark follows membership, not money |

**What this says about the fold, plainly:** the host recorded D44 and D45 correctly in the record and
then left text contradicting both in the plan. That is the same failure Fable caught at R2-5, in the
other direction — the ruling written down, the document not made to match. **A ruling is not carried
by being recorded; it is carried by every document that acts on it.**

**OSE-05/M6 was SETTLED by the owner (D44): frozen everywhere.** The host's contrary arbitration and
its reversal are both kept in §4, because a reversed call that leaves no trace is how a later session
re-derives the wrong answer. **Note what that episode shows about model review:** Fable tested the
host's position and found it held; Codex declined to re-argue it when explicitly invited. Both left a
wrong answer standing. Only the owner had the fact that settled it — the squadron's end-of-day
process. **That is the second time (D36 was the first), and it is why §5a exists.**
