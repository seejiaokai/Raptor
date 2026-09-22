# The two final code reads, reconciled — [OIL-SEATS-CAN-EARN]

**Bug-check order §4 rank 2 and §4a.** This change touches money (OIL is earned
leave), an issued record, four signatures and persistence, so one inspector is
not enough. **Fable 5.1 and Astra/Codex each read the branch independently and
blind to each other**; neither saw the other's report, and neither was told what
the other was looking at. The brief both were given is
`../briefs/2026-09-22-oil-seats-final-read-brief.md`. Their reports are beside
this file, verbatim and unedited.

**Every finding below was reproduced through the production route before it was
acted on**, per §4's own rule. Two were not what the reviewer said they were, and
both are recorded with the evidence.

---

## They agree, and that is the strongest result here

Two frontier models, reading blind, returned **the same four defects**. Neither
found anything the other missed on the branch's own code.

| # | The defect | Fable | Codex | Status |
|---|---|---|---|---|
| 1 | A nought-minute SC / AVALON / BB **shift** pays nobody, and the new advisory says it "still earns from the report and debrief" | F1 · MEDIUM | 2 · High | **FIXED** this session |
| 2 | A **post-IN date** thrown away on every reload | F2 · MEDIUM | 1 · High | **Already fixed** at `0901ef08`, before either report arrived |
| 3 | The **next-week peek** never got D49's mark | — | 3 · Medium | **Already fixed** at `b05d6f52` |
| 4 | The warning's **tap lights nothing** when the line is already on screen | — | 4 · Low | **Already fixed** at `e28b7234` |

Three of the four were already closed when the reports landed — found by reading
around the fixes and by re-running the walk's own scripts. That is not luck and
it is not a reason to spend less on the reads: **the one they found that I had
not is the one with money behind it.**

### The one that was live: a shift is not a sortie

D49 is a ruling about a **sortie**: the man reported three hours before and
debriefed two hours after, so the half day is real work whatever the written
times say. A **standalone** wave — SC MAIN, SC SPARE, AVALON, BB — has no such
padding; its window IS the written window. Typed 08:00–08:00 it measures
nothing, offers no switch and pays nobody, which is D31 working as ruled.

What was wrong was the screen. The same advisory fired on it, on the line and in
the list, saying the day *"still earns from the report and debrief"* — true of a
sortie, false of a shift — while the day's "nobody earns OIL" list did not name
it. On the wave the squadron works most weekends, a man's day silently earned
nothing and every surface said the opposite. That is exactly the class of defect
the owner asked to be warned about on 20 Sep 26.

**Reproduced first**, through `dayOilCredits`, `oilCapableItems`, `dayOilBlind`
and `validate` on a minted SC wave: no credit, no switch, blind list empty,
advisory present with the sortie sentence. Two assertions red, three controls
green.

**Fixed** in `engine/validate.ts` (one predicate, two sentences, chosen by
`isStandalone`), `engine/oil.ts` (`dayOilBlind` names a nought-minute shift),
the three renderers, and the Logic page's own row. Pinned across **every
standalone kind and a SPARE as well as a MAIN**, which is wider than either
reviewer asked for — a test that walks one kind tests one kind.

---

## Where a reviewer was wrong, and how it was settled

**Codex, on the boot path — AND THIS SECTION HAD IT BACKWARDS.** Its negatives
said *"the boot comments are stale — `initStore` has already enabled the command
router"*; Fable said the opposite; this file first recorded Fable as right.
**It was wrong, and so was the measurement behind it.** `lwHistInit` is called
TWICE — once at the end of `initStore`, and again from `main.tsx` after the boot
sync — and only the second was checked. The first one sets `LW_READY`, so the
router IS on when the demo world installs. **Codex was right.**

The code was never wrong: `lwSyncTurn(() => locked(persistNotify))` files the
capture as a reconciliation either way. What was wrong was the COMMENT beside it,
which asserted the opposite of the truth, and the claim in this document that a
reviewer had erred. Both are corrected, and the correction is left visible rather
than quietly overwritten — a comment that vouches for a lifecycle it has not
checked is the anti-pattern this project already has a name for, and it was
committed here while writing up two reviews that exist to catch exactly that.

**The lesson kept:** "settle it by measuring" is only worth as much as the
measurement. Checking one of two call sites and stopping is the same error as
grepping for two named entries and stopping (D53).

**Fable, on its own fix for F6.** Its one-liner —
`if (LW_READY) lwSyncTurn(persistNotify)` — does not do what its reasoning says.
The router's gate is `HIST.lock || cmdIsCommitting()`, not the turn flag, so at
idle it still fell straight through to `lw.edit`, and the turn's trailing
projection never armed because `LW_TURN_WROTE` is only set on the coalesced
branch. **The test is what showed it**: written on `lwCanUndo` it passed with the
routing removed (an assertion watching an ingredient, not the behaviour), so it
was rewritten on the change stream's own envelope TYPE, where it failed. The
working shape is `lwSyncTurn(() => locked(persistNotify))` — the same pairing
`sync.ts` already uses for `runOilPass`.

**F6 itself is real and is fixed**, belt and note: an after-boot capture is now
filed as a reconciliation, and `undo/timeline.ts`'s deferred-set comment records
that lifting the `lw.postouts` deferral makes §10.1's re-lay mandatory rather
than tidy — otherwise an undo would restore the record without the person and
the next roster change would silently re-capture the window the admin had undone.

---

## What was NOT acted on, and why

- **Fable F3 (LOW)** — on a saved-plan preview the chip and its tap disagree
  about which list it is. Real, narrow, and about wording on a surface
  `[ALL-AVAIL-WINDOW]` (job 2) replaces. **Filed**, not fixed here.
- **Fable F4 (LOW)** — the second spare sim seat leaves a hole in the stored crew
  array. Worth checking against the existing trailing-blank trim before changing
  anything; the array shape is `slots.ts`'s contract, not this change's.
  **Filed.**
- **Fable F5 (LOW)** — an already-issued weekend carrying a placeholder reads
  "1 pending" the moment this ships. **Correct behaviour** (D44: the crowd is
  part of what a day is issued with, and a day issued before the record existed
  has nothing to compare), but the register promises silence for such a day.
  The wording of that promise needs the owner's eye, not a code change. **Filed
  as a question.**
- **Fable F8 (LOW, pre-existing)** — a placeholder that reaches a cockpit by
  copy draws the jet as crewed and pays nobody. **D47 names this and belts the
  money deliberately**; the screen half is one advisory away and is a product
  call, not a defect against the plan. **Filed.**
- **Fable F7 (INFO)** — the posting-window fix reaches fresh browsers only. True,
  recorded in `[POSTOUT-LOST]` and in §6a of the evidence sheet, and said plainly
  to the owner rather than letting the walk's numbers stand in for what he will
  see.

## The FOLLOW-UP round — the five commits that landed after the first reads

Both providers read them, again blind to each other. Fable appended its section
to its own report; Codex's is
`2026-09-22-oil-seats-final-read-codex-followup.md`. **They converged again**,
and between them they found a fault in every commit of that batch — including one
in the fix for their own first-round finding.

| What | Fable | Codex | Done |
|---|---|---|---|
| The new hard warning says "SC has **no times**" about a line with two typed times, and the publish message calls a flying shift **"the SC desk"** | G1 · LOW | 3 · P2 | **Fixed** — flying rows are named "the SC shift" / "the RAP 1 line", and both sentences say "no usable times". The wrapper's `^the ` test was the whole mechanism, and the flying branch was the only one not using it |
| `data-warnkey` emitted on a **frozen version preview**, so a live warning could light a box in last week's paper | G2 · LOW | 2 · P2 | **Fixed** on the week AND the board; the highlight pass also skips `.pv-frozen`/`.preview`. The MARK stays — the line went out that way |
| A focus that **outlives its warning** leaves the week dimmed with nothing lit — reached by doing what the warning asks | G3 · LOW | 2 · P2 (second half) | **Fixed** in `warnFocusMap`, matched on code+key not index. Measured: dimmed 80 → 80 before, 80 → 0 after |
| My widened storage reader accepts **any string as a date** — "June 15" sorts after every real date, so the man reads as not yet arrived all year | — | 1 · P2 | **Fixed** — the reader now demands the same `yyyy-mm-dd` shape the writer promises |
| The Logic page's rule **contradicted itself** — its lead still said every equal-time line earns | — | 4 · P2 | **Fixed** — the lead distinguishes a sortie from a shift in its first sentence |
| The belt test asserted only "no `lw.edit`", which an off-stream persist also satisfies | G4 · LOW | 5 · P3 | **Fixed** — it asserts exactly one `lw.sync` |
| The shift sentence was **unpinned on the peek** — the loop walked three surfaces, the roll-call says four | G5 · LOW | — | **Fixed** |
| My boot comment **said the opposite of the truth** | — | 5 · P3 | **Fixed**, and the claim in this document corrected above |

**Nothing HIGH or MEDIUM in either follow-up.** Between them: every commit in
that batch carried something, and the two most serious were both in code written
to fix a reviewer's own finding — which is the argument for the second round, not
against it.

## Limits of these reads, stated

- **Codex could not run tests** — its sandbox denied Vitest its temporary
  directories, so its report is source, ruling and call-site inspection, not a
  green-test claim. It says so itself.
- **The tree moved under both of them.** Four commits landed while they read
  (`b05d6f52`, `e28b7234`, `0901ef08`, `0ef1df31`). Fable deliberately did not
  read `e28b7234`; Codex read none of the four. A follow-up brief covering
  exactly those four exists and each reviewer gets it.
- **Neither drove the app.** That is the walk's job and it was done first, which
  is §4a's own ordering.
