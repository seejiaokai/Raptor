# [OIL-SEATS-CAN-EARN] — the BREAK TESTS

Bug-check order §8.4: *for every surface the roll-call marks as wired, break that wire once on
purpose and watch a named test go red. If nothing goes red, that surface has no test, by proof.*

Branch `claude/oil-seats-can-earn`. 38 breaks run, one at a time, each reverted before the next.
Every run was `npx vitest run <file>` — **no build was run at any point**, so nothing this block did
could reach the served bundle in `dist/`.

**Tally: 35 RED · 2 GREEN (findings) · 1 inconclusive · 1 surface not run.**

---

## The findings — surfaces with no red test

### F1. The Common Programme row does not open its crowd, and nothing notices

**What was broken (one sentence).** On the board's Common Programme row, the OIL earn mode was made
to draw the row's people the ordinary way instead of opening a placeholder into the men behind it —
so inside the mode an ALL AVAIL on the Common Programme stays one inert body and no individual man
can be taken off it.

**Result: GREEN across the entire unit suite — 3,301 tests, 209 files.**

`ui/oilrowpucks.test.tsx`, `ui/oilcount.test.tsx` and `ui/oilwords.test.tsx` all stayed green. So did
everything else. One test did fail in the full-suite run — `ui/inputscal.test.tsx`, "a real
pointerdown+pointerup on an input chip sets INPEDIT to that EXACT record" — and it was checked twice
in isolation, with the break in place and without it, passing both times. **It is a flake under
full-suite load, not a catch** (see F3).

**Why it matters.** The same break on the other three surfaces turns red immediately: the duty desk
(4 tests), the sim row (4 tests) and the ground row (3 tests) each have their own assertions. The
Common Programme is the one surface of the four with none — and it is one of the three surfaces the
owner found unwired by hand on 21 Sep 26. The plan's roll-call §7 marks the Common Programme's who
list as **"has it"** under *Opens into pucks (OIL8)*; that mark is not backed by a test.

**Which test should have caught it.** `ui/oilrowpucks.test.tsx` — it has a describe block per surface
(`a DUTY DESK opens its crowd (OIL8)`, `a SIM ROW opens its crowd (OIL8)`) and no block for the
Common Programme.

### F2. The signature key can be made to carry availability again — D45's main half is not pinned against it

**What was broken.** The signature's key was made to carry who was behind each puck, which is exactly
what D45 forbids: *"A change in availability NEVER invalidates a signature."*

**Result: GREEN across 1,914 tests** (`src/engine`, `src/undo`, `src/state`).

The test named for the rule — `engine/oilmembership.test.ts` › "a man files leave and every signature
still stands" — passes either way. On its fixture (a day with no input claims) the back-compat path
inside the signature check forgives the difference, so the assertion cannot tell the fix from the
regression.

**But the axis as a whole IS pinned.** Removing the OIL axis from the signature check entirely turns
two tests red: `engine/oilmembership.test.ts` › "THE CONTROL: a changed OIL DECISION still does take
the signature down", and `engine/oilev.test.ts` › "THE CONTROL — a day job 2 changed the money on
must be signed again". So the finding is narrow and specific: the axis exists and is watched, but the
**content** of the key a signature binds to is not — the one test that reads that key compares it
against a value computed from the same function, so it moves with any change to it and can never
detect one.

**Which test should have caught it.** `engine/oilmembership.test.ts` › "a man files leave and every
signature still stands", on a fixture that carries an input claim as well as a puck.

### F3. A flaky test, found on the way past

`ui/inputscal.test.tsx` › "a real pointerdown+pointerup on an input chip sets INPEDIT to that EXACT
record" failed once in a full-suite run and passed twice in isolation, with and without an unrelated
break in place. It is a pointer-event test and the file takes ~14s under parallel load. Not part of
this change; recording it because it cost a round of checking here and will cost the next person one.

---

## What was NOT run, and why

**The words (step 10, D37-which-answer / D31) — `ui/oilwords.test.tsx`. NOT RUN.**
Its wires are `oilSentinelList` and the chip caption, which live in `src/ui/oilmode.ts` and
`src/ui/html.ts`. Both files are being edited in this same working tree by another worker applying
walk fixes, and were declared off limits mid-block. Skipped rather than risk their work a third time.
**This surface still needs its break test.**

---

## The table — one row per break

| # | Surface / ruling | What was broken, in one sentence | Test file run | Result | The test that caught it |
|---|---|---|---|---|---|
| 1a | Jet refusal (D33/D47) | The preflight was made to allow a placeholder on a cockpit seat | `engine/oilseat-refusal.test.ts` · `ui/oilseat-refusal.test.tsx` | **RED** (8) | "a placeholder is refused on a cockpit seat and allowed everywhere else"; "a roster drag onto a cockpit is refused and says why"; "A SWAP IS REFUSED WHOLE — neither end is written"; "with a cockpit armed, the placeholder row is struck out"; "slotBar gives the refusal for a cockpit"; "fillSlot passes the refusal up" |
| 1b | The writer's own belt (D33) | The refusal was removed from inside the writer, leaving only the doors | same | **RED** (1) | "setSlotVal leaves the seat, the pending mark and the edit log untouched" |
| 2a | Span default (D43) — the crowd inherits | The people a placeholder expands to were made to default ON whatever the seat says | `engine/oilspandefault.test.ts` | GREEN | — |
| 2a+ | same break, widened | as above | 17 OIL files (240 tests) | **RED** (1) | `engine/oilexpand.test.ts` › "the crowd INHERITS the seat's default, so an AVALON desk's crowd earns nothing (D43 + D24)" |
| 2b | Span default — the shared resolver | `spanDefault` was made to answer yes for every man on every item | `engine/oilspandefault.test.ts` · `ui/oilswitch.test.tsx` · `ui/oilmode.test.tsx` | GREEN | — |
| 2b+ | same break, widened | as above | whole engine + OIL UI (1,773 tests) | **RED** (1) | `engine/oilexempt.test.ts` › "A DESK MINTED FROM AN AVALON TEMPLATE IS THE SAME SEAT, SO IT GETS THE SAME ANSWER (D35)" |
| 3a | Exempt flying waves reach the walk (D24) | AVALON and BB waves were skipped before the walk again | `engine/oilexempt.test.ts` | **RED** (3) | "a AVALON line reaches the walk, earns nothing, and can be switched on"; "a BB line reaches the walk…"; "AN OVERNIGHT LINE EARNS THE DAY IT SITS ON (D42)" |
| 3b | Exempt duty desks reach the walk (D24/D35) | AVALON desks were skipped before the walk again | `engine/oilexempt.test.ts` | **RED** (2) | "an AVALON desk reaches the walk, earns nothing, and can be switched on"; "A DESK MINTED FROM AN AVALON TEMPLATE… (D35)" |
| 3c | The SC SPARE default | The formation-level spare flag was dropped, leaving only the aircraft one | `engine/oilexempt.test.ts` | **RED** (1) | "the FORMATION-level spare flag counts too (Codex OSE-R2-02)" |
| 4a | Placeholder on a **duty desk's own seat** | That seat was put back on the non-expanding writer, so a placeholder counts nobody | `engine/oilexpand.test.ts` | **RED** (4) | "A DUTY DESK — the owner's Sunday desk, in the seat itself" |
| 4b | Placeholder in a **duty desk's extras** | as above, for the extras line | `engine/oilexpand.test.ts` | **RED** (1) | "A DUTY DESK's extras line" |
| 4c | Placeholder in a **sim front seat** | as above | `engine/oilexpand.test.ts` | **RED** (2) | "A SIM SEAT — p"; "THE FREEZE WROTE THE CROWD DOWN" |
| 4d | Placeholder in a **sim rear seat** | as above | `engine/oilexpand.test.ts` | **RED** (1) | "A SIM SEAT — w" |
| 4e | Placeholder in a **sim passenger slot** | as above | `engine/oilexpand.test.ts` | **RED** (1) | "A SIM's passengers" |
| 4f | Placeholder in a **sim extras line** | as above | `engine/oilexpand.test.ts` | **RED** (1) | "A SIM's extras line" |
| 4g | Placeholder in a **ground row's extras** | as above | `engine/oilexpand.test.ts` | **RED** (1) | "A GROUND ROW's extras line — its main seat already expanded, its extras did not" |
| 4h | Placeholder in the **Common Programme's extras** | as above | `engine/oilexpand.test.ts` | **RED** (1) | "THE COMMON PROGRAMME's extras line — the last one that silently dropped it" |
| 5a | The request row's crowd (D46) | The crowd on an accepted request row was never paid at all | `engine/oilclaimcrowd.test.ts` · `ui/oilclaimcrowd.test.tsx` | **RED** (10) | "IN THE EXTRAS LINE under the row"; "IN THE NAME BOX itself (Codex OSE-R2-04)"; "AN ISSUED DAY KEEPS THE PEOPLE IT WENT OUT WITH (D44)"; +7 |
| 5b | A placeholder on a request row (D46) | A placeholder on that row was made to gather nobody | same | **RED** (13) | as above, plus `ui/` "the placeholder opens into REAL pucks, not one inert body"; "AN ALL-DAY REQUEST still draws its crowd" |
| 5c | The requester's own answer (D18) | The man who filed the request was no longer held out of the crowd | same | **RED** (4) | "he is never paid TWICE, even though the crowd names him"; "his own NO stands while the crowd still earns" |
| 5d | The freeze on a request row (D44) | An issued day was made to re-resolve its crowd live instead of reading its own written-down record | `engine/oilclaimcrowd.test.ts` · `ui/oilclaimcrowd.test.tsx` · `engine/oilsent.test.ts` · `ui/oilcount.test.tsx` | **RED** (2) | "AN ISSUED DAY KEEPS THE PEOPLE IT WENT OUT WITH (D44)"; "THE TAP READS THE ISSUED LIST, not whoever happens to be free now" |
| 6a | Crowd opens into pucks (OIL8) | The mode was made never to open a placeholder into the men behind it | `ui/oilrowpucks.test.tsx` · `ui/oilclaimcrowd.test.tsx` | **RED** (10) | "a placeholder ON the desk draws the men behind it, each one tappable"; "ONE MAN IS TAKEN OFF, and the rest of the desk is untouched"; +8 |
| 6b | OIL8 on the **duty desk row** | That row alone was put back to drawing only named men | `ui/oilrowpucks.test.tsx` | **RED** (4) | "a placeholder ON the desk draws the men behind it"; "a desk with NO WRITTEN TIMES cannot resolve a crowd, and says so" |
| 6c | OIL8 on the **sim row** | as above | `ui/oilrowpucks.test.tsx` | **RED** (4) | "a placeholder in a SEAT"; "a placeholder among the PASSENGERS"; "a placeholder on the EXTRAS line"; "one man is taken off a sim crowd on his own" |
| 6d | OIL8 on the **ground row** | as above | `ui/oilrowpucks.test.tsx` · `ui/oilclaimcrowd.test.tsx` | **RED** (3) | "the placeholder opens into REAL pucks, not one inert body"; "tapping one man takes HIM off" |
| **6e** | **OIL8 on the Common Programme row** | **as above** | **`ui/oilrowpucks` · `ui/oilcount` · `ui/oilwords`, then all 3,301 unit tests** | **GREEN — F1** | **none** |
| 7a | The count resolver (D27/D44) | The resolver was made never to find the day's written-down crowd | `engine/oilsent.test.ts` · `ui/oilcount.test.tsx` | **RED** (12) | "it hands back the people the day wrote down"; "a change in who is available never moves a block that has been written"; "A WEEKDAY carries it — this is where it never appeared before"; +9 |
| 7b | The "it does not know" answer (D44) | An old issued day was made to invent an answer instead of saying it has no record | `engine/oilsent.test.ts` · `ui/oilcount.test.tsx` · `ui/oilwords.test.tsx` | **RED** (1) | "AN OLDER ISSUED BLOCK SAYS SO, rather than having an answer invented for it (OSE-T-02)" |
| 7c | The count chip on every seat (D27) | The chip was made never to draw on any seat | `ui/oilcount.test.tsx` · `ui/oilwords.test.tsx` | **RED** (10) | "A WEEKDAY carries it"; "it reads as WHAT IT IS, never as a promise about OIL (D37)"; "on an ISSUED page it is the list the day went out with"; +7 |
| 7d | The chip's version stamp (D44, the tap) | The chip stopped carrying the version it was drawn in | `ui/oilcount.test.tsx` · `ui/oilwords.test.tsx` | **RED** (2) | "the chip carries the version it came from, so its tap can find it again"; "on an ISSUED page it is the list the day went out with" |
| 8a | The pending mark on membership (D44) | A change in who was behind a puck stopped moving the publication comparison | `engine/oilmembership.test.ts` · `engine/oilev.test.ts` | **RED** (5) | "ON A WEEKDAY, which is the half that did not exist before"; "and on a WEEKEND, exactly as it always did"; "OIL24 — who an ALL AVAIL puck stood for cannot change under the reader" |
| 8b | Membership on an earns-nothing day (D44) | A day that pays nobody stopped comparing its crowd at all | same | **RED** (2) | "ON A WEEKDAY, which is the half that did not exist before"; "a man files leave and every signature still stands" |
| **8c** | **D45 — availability must never take a signature down** | **The signature's key was made to carry membership again** | **`src/engine` · `src/undo` · `src/state` (1,914 tests)** | **GREEN — F2** | **none** |
| 8d | D45's opposite half — a changed OIL decision must invalidate | The OIL decisions were stripped out of the signature's key | same (1,914) | GREEN — **inconclusive** | none — but the edit did string surgery on a key whose decision segment can itself contain the separator, so the break may not have been what was intended. **Re-run properly before trusting this row.** |
| 8e | The OIL axis of the signature check | The OIL axis was removed from the signature check entirely | same (1,914) | **RED** (2) | "THE CONTROL: a changed OIL DECISION still does take the signature down"; "THE CONTROL — a day job 2 changed the money on must be signed again" |
| 9 | **The words (D37-which-answer / D31)** | — | — | **NOT RUN** | wires live in two off-limits files (see above) |
| 10a | Undo names an OIL decision | Undo was made to call an OIL decision "a change to the schedule" again | `undo/oilundo.test.ts` | **RED** (2) | "taking ONE MAN off an event does not read as 'a change to the schedule'"; "switching a whole ROW off reads the same way" |
| 10b | The OIL command's own type | An OIL decision was routed back onto the catch-all mutation backstop | `undo/oilundo.test.ts` · `ui/oilundo.test.tsx` · `ui/oilundo-button.test.tsx` | **RED** (2) | as above |
| 11 | The nought-minute sortie warning (D49) | The advisory was made never to fire on a same-take-off-and-landing line | `engine/oilflighttimes.test.ts` | **RED** (2) | "a line taking off and landing at the same minute is flagged, on the line"; "it speaks on a WEEKDAY too" |
| 11b | D49's other half | A flying line with crew and no readable times stopped being named | `engine/oilflighttimes.test.ts` | **RED** (4) | "it is named beside the desks, in the same list"; "and it reaches the day's own warning strip"; "a line with a take-off and no landing is the same answer"; "a line with no callsign is named by its wave" |
| 11c | **The owner's ruling itself (D49)** | A nought-minute sortie was made to STOP earning — the "fix" both reviewers asked for and the owner overruled | `engine/oilflighttimes.test.ts` · `engine/oil.test.ts` · `engine/oilexempt.test.ts` | **RED** (2) | "take-off and landing at the same minute pays the man his half day"; "the line still offers its earn switch — it is not an event that cannot earn" |

---

## The weaker findings — a ruling named by no test of its own

§8.4's second class: a break that turns red only a test whose **name does not mention the ruling**.

1. **D43's "the crowd inherits the seat's answer"** is pinned in `engine/oilexpand.test.ts`, not in
   `engine/oilspandefault.test.ts` — the file the behaviour register names first for D43. That file's
   own D43 test, "people a PLACEHOLDER expands to inherit the seat's default, not one of their own",
   uses a ground row, whose answer is ON. It asserts the crowd's default is `true`, which is equally
   satisfied by "inherits" and by "always yes", so it cannot tell the rule from its absence. It is
   the *convenient day* anti-pattern (§10.7) in one assertion.

2. **`spanDefault`** — built deliberately as the ONE body the screen and the money share, so they
   cannot answer separately (Fable R2-1 / Codex OSE-R2-01) — has exactly **one** assertion standing
   behind it in the whole 1,773-test engine suite, and it is in `engine/oilexempt.test.ts` under a
   heading about D35 template desks. `oilspandefault.test.ts` contains a test literally called
   "spanDefault answers off the span the money will actually use" which passes when `spanDefault` is
   hardwired to yes — again because its fixture is a ground row.

3. **The freeze (D44)** is pinned in `engine/oilclaimcrowd.test.ts` and `ui/oilcount.test.tsx`;
   `engine/oilsent.test.ts` stayed green when an issued day was made to re-resolve its crowd live.

No break in this block turned red a test that asserts only on `dayOilCredits` or `dayOilSpans` — the
raw walk rather than the money. Every catch named above lands on `oilEarnedWork`, the evidence block
or a screen.

---

## What this block did to the working tree, stated plainly

**Two of the coordinator's uncommitted walk fixes were destroyed by this block and had to be
re-applied.** The first restore method used `git checkout -- <file>` after each break, which reverts
a file to its last commit — and on `src/ui/oilmode.ts` (breaks 6a, 7c) and `src/ui/html.ts`
(break 7d) that threw away another worker's uncommitted edits along with the break. It happened
before the off-limits instruction arrived and is recorded here because the sheet should carry it.

Every break from that point on was restored by writing back an in-memory byte copy of whatever was on
disk before the break — never git — and each restore was verified by reading the file back and
comparing it to that copy. All 13 later breaks reported `restore verified: IDENTICAL`.

At the close of this block the only modified files under `raptor-port/src` are the coordinator's own
three (`ui/html.ts`, `ui/oilmode.ts`, `ui/scheduler.css`) plus their new untracked test file. No file
this block touched is left changed.

**No build was run.** Every check was `npx vitest run <file>`, which transforms in memory; `dist/`
was never written, so the bundle the other three walkers were driving was never affected.
