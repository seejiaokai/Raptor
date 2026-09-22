# [OIL-SEATS-CAN-EARN] — the plan, before any red-team (22 Sep 26)

**Status: DRAFT, not yet built, not yet red-teamed.** The standing order puts this at **FULL** tier
(money — D25 makes earned leave money for the tier question — plus a new gesture, a new surface and
a shared drawer). Handoff §6 and the order §4a both say: **red-team this plan across BOTH providers
before a line is written**, build on Opus high, WALK the running app, then both providers read the
finished code, blind to each other.

This document is the thing to attack.

---

## 1. What the change is, in one paragraph

The two placeholder pucks — **ALL** and **ALL AVAIL** — stop being an OIL-mode curiosity and become
an ordinary property of the schedule. Wherever one may be dropped it says how many people would be
available to attend, whether or not the day earns OIL, and it offers the OIL switch on the same
footing as every other seat, switched **off** by default. At the same time the four kinds that are
wholly inert today — **SC SPARE, AVALON lines, AVALON duty desks, BB lines**, including blocks minted
from an AVALON template — gain the same door: a switch, defaulting off. And the one case that has no
honest answer — a seat with no times, zero length, cancelled or ⓘ — is **refused with its reason
printed**, never a silent absence.

## 2. The rulings it carries

| Ruling | What it binds |
|---|---|
| **D24** (+ **D35**) | SC SPARE, AVALON lines, AVALON desks, BB lines OFFER the switch, default OFF. D35: **the switch reaches a block minted from an AVALON template too**, not only the no-earn default. |
| **D27** | The pucks are a SCHEDULING feature: dropped anywhere they work out who would attend and SHOW THE COUNT, with OIL Earn off. |
| **D28** | Every seat can earn; the DEFAULT decides whether it does; the admin can always override. Nothing earns by default that does not earn today. |
| **D31** | A seat the rules cannot MEASURE offers no switch and says why on screen. The one boundary on D28. |
| **D32** | ONE LIST: wherever a puck may LAND it must also OFFER the switch. Landing and earning are the same decision. |
| **D33** | The pucks are refused on **flying-line cockpit seats only**. Everywhere else they land — sim seats, sim passengers, a duty desk's own position, the extra-people line beside any row, ground rows, common programme rows. |
| **D36** | **DO NOT WIDEN THE AVAILABILITY WINDOW.** A flying man is free up to his STEP and again from DEKIT. The 3-hour report and the 2-hour debrief do NOT block him. See §5a — this one nearly went the wrong way. |
| **D37** | The count STAYS, on every seat the puck can land on, but must read as **what it is** — who has nothing else on the programme at that time — not as a promise. Taps through to the names. |

D33 sets aside the recommendation in the walk sheet §11a (a short explicit earning list, duty desks
off). **§11a's recommended shape is superseded; its cost analysis is not** — every earning seat is a
money surface forever, and that still governs how carefully each one is walked.

## 3. What was read, and the four findings that shape the build

Everything below was read off the code today, not recalled.

### F1 — the default is ON, so "let them in" would pay them

`ui/oilmode.ts oilItemOn` and `engine/oilev.ts itemOn` both answer *"does this event earn?"* the same
way: **true unless an explicit `0` is stored** for that item. So the naive version of half one —
delete the three skips in `engine/oil.ts` so the exempt kinds enter the walk — makes SC SPARE, AVALON
and BB **earn immediately, by default**. That is the exact opposite of D24 and D28's "nothing earns by
default that does not earn today", and its failure mode is silent money.

**So the item mark has to become three-state**: unset → *the kind's own default*; `1` → on; `0` → off.
Today it is two-state (`0` or absent) and the default is hard-wired true.

### F2 — the earn rule is written twice, in two files

`oilItemOn` (what the screen draws) and `itemOn` (what the money reads) are the same rule in two
bodies. **This is the exact shape of a defect the walk already found** — D18's second man was drawn
inert by one body and paid by the other. Adding a default-by-kind to a rule that exists twice means
writing the new default twice, and the two will drift.

**Consolidate first, extend second.** One exported function in the engine, used by the mode and by
the money, landed and green BEFORE any default-by-kind is added.

### F3 — the silent drop is one helper, not six call sites

`engine/oil.ts` has `put` (resolves one id, **drops anything that is not a person**) and `putWho`
(expands a sentinel, then hands its extras straight to `put`). Only the ground row's and the common
programme's primary seats use `putWho`. Everything else — flying lines, sims, sim passengers, duty
desks, **and the extra-people line of every row type** — uses `put`. That is the owner's Sunday desk:
the puck sat in the extras, and the day wrote no key for it at all.

**Fix it in `put`, not at the call sites.** Fold the expansion into the one helper so a future call
site cannot reintroduce the hole. Six patched call sites is the enumerate-around-it shape D28 was
written to avoid.

### F4 — placement is unrestricted today, and the refusal must be visible

There is no restriction anywhere: `engine/slots.ts setSlotVal` writes any id into any seat, and
`isSpecial` removes both pucks from every validation and availability path. So a placeholder can sit
in a cockpit seat right now, the aircraft draws as crewed, nobody is on it, and nothing warns. D33
closes this, and the refusal has to be an answer on screen — **a drop that is silently swallowed is
the same class of defect as a credit that is silently dropped.**

## 4. The roll-call — every place each new thing must appear

Built from the six seat types the code actually has. **No blank cells**; this is the table that would
have caught the owner's find, and it must be re-marked against the running app during the walk.

| Seat | Takes a puck (D33)? | Count shows (D27) | Switch offered (D32) | Default |
|---|---|---|---|---|
| Flying line — either cockpit seat, any wave kind | **Refused, with reason** | n/a | n/a | n/a |
| Sim — front and rear seat | Yes | must | must | off |
| Sim — passenger slots | Yes | must | must | off |
| Duty desk — its own position | Yes | must | must | off |
| Ground programme row — the who | Yes (works today) | must | must | off |
| Common programme row — the who | Yes (works today) | must | must | off |
| **The extra-people line beside ANY row** | Yes | must | must | off |

**The wording is part of the roll-call, not a polish step (D37).** Every cell marked "must" in the
count column has to read as a starting point a scheduler can correct, not as a fact. A bare number
beside a puck reads as authoritative; this one is "who has nothing else on the programme at that
time". Same wording on every seat, or the roll-call has a blank cell.

And, separately, the four exempt kinds (D24/D35), which are about REAL people, not the pucks:

| Kind | Today | After |
|---|---|---|
| SC SPARE line | skipped before anyone enters the walk | reaches the walk, switch offered, default off |
| AVALON flying line | ditto | ditto |
| AVALON duty desk | ditto | ditto |
| BB flying line | ditto | ditto |
| A duty block MINTED from an AVALON template (D20 half two, D35) | default holds, switch absent | **switch offered too** — same seat, one answer |

**Unmeasurable seats (D31)** — no times, zero length, cancelled, ⓘ — appear in no row above: they
refuse the switch and print the reason. `oilCapableItems` already computes exactly this set from the
walk itself, so the refusal reads off the same body the money does and cannot drift.

## 5. The order of work

Each step lands green before the next starts. Steps 1 and 2 change no behaviour, which is the point —
they make the behaviour changes small enough to reason about.

1. **Consolidate the earn rule** (F2). One function, two callers, no behaviour change. Prove it by
   deleting the duplicate and watching the existing suite stay green.
2. **Make the item mark three-state** (F1). Unset → default → and the default is still "on" for
   everything, so again no behaviour change. This is the seam every later step hangs off.
3. **Default-off by kind.** The exempt kinds and the placeholder seats default off; everything else
   defaults on. Now deleting the three skips in `engine/oil.ts` is safe — and only now.
4. **Let the exempt kinds into the walk** (D24/D35), including the template-minted path, which gets
   its own test with a control, the way D20's second half was pinned.
5. **Fold sentinel expansion into `put`** (F3). This is the owner's found defect and the money half.
   Red first: a test that reproduces his Sunday desk and fails.
6. **Refuse the pucks on cockpit seats** (D33), with the reason on screen.
7. **Show the count outside the mode** (D27). The largest drawing job: the count lives inside the OIL
   mode's decoration today and has to become an ordinary property of the puck on every seat above.
   Separate "who is available" (a read, any day) from "what it earns" (earning days only) —
   `oilSentinelPeople` currently returns nothing unless the day earns.
8. **Refusal wording for unmeasurable seats** (D31), and the count's own wording (D37). One pass, one
   set of words, checked on every seat in §4 — the two wordings are read side by side on the same
   screens and must not contradict each other.
9. `[OIL-UNDO-WORDS]` — one string — folded in if convenient.

## 5a. THE TRAP THAT ALMOST GOT BUILT — read this before touching availability

The owner asked whether the pucks account for debrief timing. Reading the code found a genuine
disagreement: the availability answer pads a sortie by **step (1h) before take-off and dekit (30m)
after landing**, while the OIL earning rules use **report (3h) and debrief (2h)**, and the warning
list separately raises "Not enough time to attend the debrief" across land+2h. Three windows, one
sortie.

**The agent recommended widening availability to include the debrief. That was WRONG**, and only the
owner's knowledge of how the squadron actually schedules caught it:

- An ops brief is deliberately slotted between the flight brief and step — 1520–1620 against a 1620
  step — precisely so the available men can attend. Those men ARE available.
- A debrief is moved by management: land, attend an ops brief, debrief afterwards. That man is
  available from dekit.

Widening the window would have marked men unavailable for the very events the squadron builds around
them. **D36 settles it: the narrow window is correct and is not to be "fixed".** The three windows
are not a defect — they answer three different questions, and only one of them is availability.

**The method lesson**, and it is the same one the owner's ALL AVAIL find produced: a disagreement
between two bodies of code is a QUESTION, not a verdict. Reading the code shows which numbers
differ; only someone who runs the squadron can say which one is right.

## 6. The risks worth attacking

- **The freeze.** An issued day stores the people behind a puck at publication. Every newly-earning
  seat has to be walked through that freeze, and its failure is silent: a man paid or not paid, no
  error, nothing on screen. This is the single highest-risk part of the change.
- **Turning a switch on for a seat that earns nothing** — the switch must not appear where
  `oilCapableItems` says the day cannot measure, or a published day costs a real amendment for a
  decision that moves no money.
- **Existing data.** A placeholder already sitting in a cockpit seat in the demo data. Dev-phase rule
  applies: clear it, do not build a migration. Check the seed before assuming it is clean.
- **The count on an issued day must not change under the reader** — it reads the frozen list.
- **Two pucks, not one.** ALL and ALL AVAIL are byte-for-byte the same semantics; every test needs
  both, or one will be wired and the other forgotten.

## 7. The checks — FULL tier

Rules sweep; the other provider designs the scenarios (ask what is MISSING, not whether the code is
wrong); this roll-call re-marked against the running app; the door check on the new refusal; the full
walk at both widths; break tests; the owner's Sunday desk seeded into the demo data as a permanent
fixture; **both** providers read the finished code with the evidence sheet in hand; re-walk what the
fixes touch; the sheet with its pictures; then his look.

**The walk goes BEFORE the reads.** And the seventh line §10 gained from the owner's find applies
here directly: **the roll-call must cover where a thing can be PUT, not only where the fixture
already has it.** Every row of §4 must be created by hand during the walk, not found in the seed.
