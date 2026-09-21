# HANDOFF — every reviewer finding and every job is built; the WALK is what is left (22 Sep 26, overnight)

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

**Gates after the last commit:** unit **5438 passed / 0 failed** (333 files) · build green ·
reference parity **728 / 0** · rulecheck **OK** · docsize **OK** · tracker smoke **425 / 0** · e2e
run at the end of the session.

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
