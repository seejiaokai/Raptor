# HANDOFF — the WALK IS DONE; three defects found and fixed, one item is the owner's call (22 Sep 26)

**This supersedes the overnight copy below, which asked for the walk.** It has been done: the door
was found, all seven built jobs were driven in the real app, and the seven screen-level wording items
are settled. The evidence sheet is `raptor-port/docs/handpass/2026-09-22-oil-walk.md` — read that
first; it carries the `Walk:` line, the re-marked roll-call and what was NOT walked.

## What the walk changed

| | |
|---|---|
| **The door** | The board's PERSONAL INPUTS panel ships FOLDED and draws no rows, so the request's edit button was absent rather than hidden. `openInputs` in `scripts/handpass/lib.mjs` opens it, with both traps written down |
| **Found and fixed** | Undo's boundary was wired only to the page's Undo, which the board covers — so it could never fire; a live claim row said "nothing here can earn" beside a puck saying a man earns; D18's second man was paid and drawn inert with no switch; D19's way out was missing on the board |
| **Wording settled** | 8 fixed ("✓ OIL done", measured at 390px) · 9 fixed (the viewer's own stripe) · 11 fixed (the board's count) · 13 fixed · **10 and 17 were never defects** — the message element fades rather than being removed, so the earlier pass mis-measured them |
| **The owner's call** | **Item 12** — 71 tap targets at 390px, median 15px tall, all under 44px. No cheap fix; three options and a recommendation filed as `[OIL-PHONE-TARGETS]` in `OUTSTANDING.md` |
| **Rulings recorded** | **D24** (SC spare, AVALON and BB become creditable, default still nothing — queued, NOT built here) and **D25** (OIL is earned leave, not pay) |

## What happened AFTER the walk — he opened the app and found a fifth thing

**He found a money defect the walk missed** (walk sheet §11, §11a): put ALL AVAIL on a **duty desk**
and it credits NOBODY, silently. Measured — the day pays only the named people, and no key is written
for the sentinel at all. Cause: `engine/oil.ts` has two helpers; `putWho` expands a sentinel, `put`
drops anything that is not a person, and only the Common Programme and Ground Programme PRIMARY seats
use `putWho`. **PRE-EXISTING on `main`** (checked by diff, not assumed) but newly consequential.

**Why the walk missed it:** anti-pattern 2, testing where it works. Every ALL AVAIL row walked was
one the demo seed already had — which happened to be one of the two places it is honoured. He put one
somewhere new within minutes. The method gained a line for it (§10 item 6).

**Four rulings came out of that exchange**, and they reshape the next job:

| | |
|---|---|
| **D26** | The phone tap targets are RULED "leave it" — he settles OIL on his phone easily, and the agent's inference that 15px made it unusable was wrong. `[OIL-PHONE-TARGETS]` closed as ruled. |
| **D27** | ALL AVAIL / ALL are a SCHEDULING feature — dropped anywhere they work out who is available and SHOW THE COUNT, with OIL Earn OFF. |
| **D28** | **ONE PRINCIPLE: every seat can earn, the DEFAULT decides, the admin can always override.** This supersedes his own earlier lean AND the agent's per-seat allow-list, and merges D24 with the ALL AVAIL fix into ONE change: `[OIL-SEATS-CAN-EARN]`. |
| still open | whether a seat the rules cannot MEASURE (no times, zero length, cancelled, ⓘ) is switchable too. Agent's view: stays refused — no window, so a credit would be invented. |

**Also fixed here: a real test defect, not the "flaky" label it was hiding behind.**
`src/ui/stsaved.test.tsx` asserted on a 1400ms WALL-CLOCK window, and three of its tests read a
window opened earlier — one across a test boundary. Its own recorded timings were 1557ms and 2439ms,
longer than the window. Reproduced by stalling 1500ms; fixed by freezing the clock; the fix survives
a 2500ms stall. `HANDOFF.md`'s "flaky under load" note was about a DIFFERENT fault (fixed 10 Sep, and
all 69 mounting files carry its guard) — one label had accumulated two faults and was hiding the
second. Separately: under three concurrent gates the suite sheds ~37 tests to TIMEOUTS (35 test, 3
hook), which is starvation. **Do not run the unit gate beside the browser gates.**

## What is left before "merge live"

1. His five-minute look, pictures first — `docs/img/handpass/2026-09-21-oil/`.
2. Nothing else on this branch. Every reviewer finding was closed, every job is driven, item 12 is
   ruled, and the ALL AVAIL defect is PRE-EXISTING and tracked separately — it does not block this.

## The next chat

**`[OIL-SEATS-CAN-EARN]`, at FULL tier, in a FRESH chat** — D24 + D27 + D28 as one change, on his
principle. Opus high to build; Fable AND Codex to read it, because it decides what men are owed.
Pick branch `main` if this has merged, otherwise `claude/oil-auto-remove-design`.

---

# (superseded) HANDOFF — every reviewer finding and every job is built; the WALK is what is left

**Branch `claude/oil-auto-remove-design`, PR #424. Nothing merged. Holding for the owner's
"merge live".** This replaces the earlier copy of this file, which asked for the reviews to be read
and acted on. They have been.

## Read these, in this order, and nothing else first

1. **`raptor-port/docs/superpowers/specs/2026-09-22-oil-fixplan-settled.md`** — §2 is the job list.
   It opens with the findings queue (owner's D23) and then the numbered jobs.
2. **`raptor-port/docs/handpass/2026-09-21-oil.md`** — the evidence sheet. §6 is the original fix
   list; rows 1, 2 and 3 are struck through because the reviews overturned them. §9 records a
   mis-diagnosis that nearly shipped.
3. `raptor-port/docs/handpass/README.md` — how to re-run any scenario in seconds, the traps, and
   **the one door that is still not found** (bottom of the file).

The two reviews themselves, if you need the reasoning behind a fix:
`…/2026-09-22-oil-jobs12-codereview-fable.md` and `…-codex.md`.

## What is DONE

| Job / finding | State |
|---|---|
| **1 — a request handed to another man pays him nothing** | **BUILT.** `b034398`, `351c600` |
| **2 — a multi-day request pays nothing on the day it was answered for** | **BUILT.** `eb28f2c` |
| **7 — one switch drawn per aircraft row instead of per formation** | **BUILT.** `07f7a86` |
| **8 — a second man on a request row earns (D18)** | **BUILT.** `35b786e` |
| Fable **F3** — every published weekend would have flagged on upgrade | **FIXED.** `195943e` |
| Codex **rank 1** — an issued day whose row was cancelled would have started PAYING | **FIXED.** `3df527d` |
| Codex **rank 4** — the same repair's other two halves: the key, and the signature | **FIXED.** `efc993f` |
| Codex **rank 2** / Fable **F1** — `[OIL-XWEEK-DENY]` | **FIXED.** `26f9de5` |
| Codex **rank 3** / Fable **F2** — `[OIL-XWEEK-ELSEWHERE]` | **FIXED.** `7045067` |
| Codex **ranks 5 and 6** — the calendar drag and the in-place time cells never asked | **FIXED.** `4c892ba` |
| **6 — a weekend no leave war period covers (D19)** | **BUILT.** `8b16a03` — also closes Codex M8 |
| **5 — the mode is actually read-only, and Undo stops at its door** | **BUILT.** `27c1882` |
| **4 — a day that stopped being a holiday says so** | **BUILT.** `d8a73f2` |
| **9 — the wording batch**, four of it | **PART BUILT.** `1521506` — see below for what is left |
| Fable **F7** — the anchor day misread across a New Year | fixed in passing, inside `7045067` |
| Fable **F4** | closed independently by job 8's own test |

**No reviewer finding is open.** Every part was proved RED first through its own production
function; what each does is in the commit messages, which are the best short account of the
reasoning and are written for you.

**Gates after the last commit:** unit **5439 passed / 0 failed** (333 files) · build green ·
reference parity **728 / 0** · rulecheck **OK** · docsize **OK** · tracker smoke **425 / 0**.

**e2e:** run twice in full — 446/1 then 445/2, a DIFFERENT Leave War test failing each time and
every one of them passing on its own in seconds. Run the two Leave War projects by themselves and it
is **310 / 1**, the single failure being the scrubber test already filed as `[LW-SCRUBBER-FLAKY]`,
which also fails on `main`. It is the saturated-box timing family, not this branch; the filed entry
now names the family rather than the one test.

## What is NOT done, and must not be reported as done

- **THE APP HAS NOT BEEN WALKED SINCE JOB 2.** Everything above is machinery, proved by tests and
  by two code reads. The standing order is explicit that this is not a bug check: `.claude/rules/
  bug-check.md`, "a code review plus green tests is NOT a bug check". The walk is owed before this
  can be reported ready for "merge live", and the closing report needs its `Walk:` line.
- **The last step of job 1 is not walked** — changing a request's holder in the real dialog and
  watching the question come up for the new man. Steps 1–4 drive clean. The blocker is that the
  request's edit button is not in the DOM on the board the driver opens; the search so far is at
  the bottom of `docs/handpass/README.md`. **Find that door first**: it unblocks every remaining
  scenario that edits a request.
- **Job 2 is not walked at all.** Same door problem — a multi-day request can only be filed from
  the Inputs page (the board's form has no date field; that is finding 18).

**How to fire Codex here**, because the first attempt got it wrong: `codex exec --full-auto` is
REFUSED by this harness. Run it READ-ONLY and capture the answer instead, which needs no settings
change at all: `codex exec -s read-only --output-last-message <file> "<the brief>"`, then write that
file into `docs/superpowers/specs/` yourself. The lesson: when the harness refuses a command, the
question is not "how do I get this allowed" but "can the same job be done with less power".

## What is left

### 1. THE WALK — and it is the whole of what stands between this and "merge live"

Nothing on this branch has been driven in the app since job 2. Everything above
is machinery, proved by tests and read by two models. The standing order is
explicit that this is not a bug check.

### 2. The rest of the wording batch — seven items, ALL of them screen-level

These are findings 8–13 and 17 in `docs/handpass/parts/blocks-g.md`. Every one
of them needs the app on screen, at both widths, and none can be settled by
reading code — which is why they were left rather than guessed at:

| # | What | Why it needs the app |
|---|---|---|
| 9 | the viewer's OWN puck never draws its green stripe — "this is you" styling wins | which rule wins is a paint question |
| 11 | the board never shows the count beside ALL AVAIL; the week does | a missing number on one surface |
| 12 | every tappable puck in the mode is 15px tall on a phone — 48 of them | a finger test, at 390px |
| 13 | a claim row's NAME says "nothing on this row can earn" while the puck beside it says he earns a full day | both are on screen together; the fix depends on what D18 changed underneath |
| 8 | two buttons reading "✓ Done" at once — the board's and the mode's | **the label's own code comment forbids lengthening it without re-drawing the comp at 390px.** Do that first |
| 10 | "tap to see each one" on the count chip does nothing | either make the tap work or take the promise out |
| 17 | no toast or acknowledgement after any OIL gesture | a feel question |

**Already done and not to be re-opened:** finding 15 (an empty Saturday no longer
nags) — the reminder was narrowed to days with money waiting on them.

**"Off day" (finding 16) is settled by D21 and needs NO code** — only the written
contract, which was corrected.

## Filed, deliberately not fixed here

- `[POSTOUT-LOST]` — a posted-out man walks back into the squadron on a reload. Not an OIL defect;
  it reaches the crew picker, ALL AVAIL and the manning counts.
- `[OIL-RELINK-XWEEK]` — Fable F8, pre-existing: a request landed in a stashed week keeps the OLD
  man on its row, and the same request can land twice across weeks.

## The owner's rulings

`DECISIONS.md` **D19**, **D20**, **D21**, **D22** and **D23** (a reviewer's open findings outrank
the planned job list). Nothing new since D23.

## The closing report must carry

`Walk:` and `Rulings:`. A change at this tier cannot be reported ready for "merge live" without
both — and on this branch, not without the app having been driven.
