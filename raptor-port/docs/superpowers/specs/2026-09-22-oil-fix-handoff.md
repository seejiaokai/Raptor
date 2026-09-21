# HANDOFF — every reviewer finding is closed; four jobs left (22 Sep 26, overnight)

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
| Fable **F7** — the anchor day misread across a New Year | fixed in passing, inside `7045067` |
| Fable **F4** | closed independently by job 8's own test |

**No reviewer finding is open.** Every part was proved RED first through its own production
function; what each does is in the commit messages, which are the best short account of the
reasoning and are written for you.

**Gates after the last commit:** unit **5400 passed / 0 failed** (330 files) · build green ·
rulecheck **OK** · docsize **OK** · tracker smoke **425 / 0**. NOT re-run since: parity, e2e.

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

## The jobs left, in order

Shapes are settled in `…-oil-fixplan-settled.md` §2 — do not re-derive them.

1. **Fix 6 — a weekend no leave period covers.** Owner's ruling **D19**: name the missing period and
   offer to create it. This reaches the Leave War and is bigger than the others around it.
2. **Fix 5 — the mode must be read-only.** Shut the two panels and the palette drag. **Sign and
   Publish stay open** (both reviewers). **Undo is NOT one of the doors to shut** — it already
   reverses an OIL tap correctly and that is worth keeping. The rule is a BOUNDARY: opening the
   mode marks the spot, Undo walks back OIL decisions freely down to it, and reaching past it
   closes the mode first. Measurement behind it is in the settled plan under fix 5.
3. **Fix 4 — a holiday taken off a published day** needs the mirror of the advisory the forward
   case has.
4. **Fix 9 — the wording batch**, about fourteen, one red test at a time. **Leave "Off day" alone**
   — D21 settled it and only the written contract changes, not the code. Folded into this batch:
   - **fix 3**, which turned out to be only wording — the pending item says "the OIL decisions on
     this day changed" when no scheduler decided anything. Do NOT suppress the mark (§9).
   - **Fable F5** — the same sentence, plus the inert puck tooltip, which says "nothing measurable
     to earn from here" when the real reason is a cancelled row on another day.
   - **Fable F6** — after a dismissed sheet the only sign is inside the mode; the Inputs page row
     carries no mark and the bell is per-member, so the scheduler who made the change sees nothing.

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
