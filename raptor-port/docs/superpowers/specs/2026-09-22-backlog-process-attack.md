# FABLE'S ATTACK ON D29 — the backlog process fix (22 Sep 26)

Commissioned under `docs/bug-check-order.md` **§4 rank 4**: *"Attacking the method itself, after a
defect escapes. One drafts, the other attacks. Outsiders change the checking system; the builder
defends the process that missed it."* A defect had escaped — a trim script destroyed two filed items,
one of them a ruling's recorded home — and the agent that wrote the defect had then written the fix.
The owner called it: *"I think need fable to help do this."*

These are Fable's findings, ranked as it ranked them, with its fix instructions. Not a verbatim
transcript. **It edited nothing.** Where it corrected the agent, that is marked.

---

## What it cleared — the explicit negatives

- **The archive move is lossless at BYTE level**, not merely by count: 54 headings at HEAD = 46 live
  + 8 archived; all 81 non-blank removed lines appear verbatim in `OUTSTANDING-ARCHIVE.md`; the
  archive holds no body text that was not in HEAD. **This is the check the agent should have run** —
  see F8.
- D-numbers D1–D29 contiguous, no duplicates.
- Four of the eight archived items carry no forward fact lacking another home (`[SEC-ALTIP]`,
  `[TRK-IMPORT]`, `[AMEND-SEL-FOLLOWUPS]`, and `[LW-OPEN]` whose ruling is in `CLAUDE.md` §Stable
  decisions; `[INP-CSID]`'s is in `engine-rules.md`).
- `[REPO-CLEANUP]` correctly stayed live (it says "do not re-run").
- Both files are CRLF throughout and `docsize.mjs` counts `\n` only, so line endings do not skew
  ceilings.
- Anti-patterns NOT committed: #14 (no ceiling raised), #15 (this attack is the sanctioned step),
  #12.

---

## F1 — HIGH, cheap. Nothing detects a destroyed item; the next one is found by luck again

`docsize.mjs` counts lines only. `npm run docsize` is **not** in `npm test`, not in any git hook, and
not in CI — `deploy.yml` has `paths-ignore: '**.md'`, so **a docs-only PR runs zero checks**. A pull
request deleting half the backlog merges unexamined. All three D29 rules reduce temptation; none
detects a bad script.

**Fix.** Add an inventory pass to `docsize.mjs`: parse `^### \[([A-Z][A-Z0-9-]+)\]` from the live and
archive files into one list; read the HEAD versions via `git show`; FAIL, naming each id, when an id
present at HEAD is absent from the union, when an id appears twice, when any non-blank archive line
from HEAD is missing now (the archive is append-only), or when any non-blank line of a block that
left the live file is absent from the archive — **that last one catches truncation and duplication,
which a heading count cannot see.** Then a CI job with `paths: ['**.md', …docsize.mjs]`, and a
`.claude/hooks/backlog-guard.sh` wired as a **Stop** hook, because Stop fires at turn end whatever
made the edit — a python or Bash script included, which a PostToolUse(Edit|Write) hook never sees.

## F2 — HIGH, cheap. D29 named two homes that do not carry it; four live texts say the opposite

D29's "Where it lives now" claimed the three rules were in `OUTSTANDING.md` §Maintaining and that
`docsize.mjs`'s ceiling was ratcheted down. **Neither was true when the row was written.** The
§Maintaining block still said "move the item to Done"; `docsize.mjs` was unmodified. Meanwhile four
always-read texts still order the old behaviour, none marked superseded, no clash flagged (which the
20 Sep rules-sweep order requires): the memory `outstanding-tasks-file`, `.claude/rules/
record-decisions.md` line 37 (which lists `OUTSTANDING.md` as a legitimate home for a ruling —
contradicting rule 2), `doc-budget.md` §3 "prune on write", and docsize's own failure text "or lower
something else in the same change".

**This is the lapse `record-decisions.md` exists to stop, committed by the entry written to stop it.**

**Fix.** Rewrite §Maintaining; correct all four texts, dated, naming what they supersede; delete "or
lower something else in the same change" from the gate's message; amend the D29 row to what is true;
and add a homes check (F6) so a row can never again claim a home it lacks.

**Status: the D29 row is corrected. The four texts and §Maintaining are NOT yet done** — they are
the docs pass rule 3 demands.

## F3 — HIGH, cheap. The incentive is intact, and D29 would have made it worse

Measured: **seven of eight gated files sit at ZERO headroom** — CLAUDE.md 1539/1539, HANDOFF.md
961/961, the four rules files each at their own limit. Yet `CLAUDE.md` requires a new known issue to
add lines to HANDOFF.md *in the same PR*, and the bug-check order §7.6 requires a MISSING to be filed
in `OUTSTANDING.md`. Either mandatory addition trips the gate inside a fix. **And D29 instructed the
eighth file's ceiling be ratcheted down to its new size — i.e. to zero headroom — recreating the
exact pressure it exists to remove.** Worse: rule 3 was already broken by the commit that restored
the destroyed items, which compressed two further items.

**Fix.** In `docsize.mjs`, detect whether the change touches `raptor-port/src`. Over ceiling **and** a
code change → print `OVER by n — code change: do NOT trim here (D29); deferred to its own pass` and
**exit 0**. Over ceiling and docs-only → exit 1, because that IS the trim pass. Give the files that
must accept entries during a fix declared headroom. Assert that a ceiling constant may change only in
a commit touching no `raptor-port/src` file. Add `docsize: OK | OVER by n, deferred (D29)` as a legal
value in the order §9, and a closing-report line `Docs: OUTSTANDING n items (+a −b, −b all in
ARCHIVE) · DECISIONS D<x>–D<y> · homes OK` — a field that cannot be filled without running F1.

**The ratchet clause of D29 is withdrawn on this finding.**

## F4 — MEDIUM, cheap. The classification archived a fact with no other home. Live instance

`[TRK-LEDGER]` carried an inherent data corner — *a record deleted seconds after migration on an
already-full store can be re-copied; resume without a durable ledger cannot tell "not copied" from
"copied then deleted"*. Grepped the tracker docs, the data schema and `src/tracker/`: **no other
copy.** It has zero imperative words, so a phrase scan scores it 0 — the dangerous direction, and it
had already happened. Also: `[OIL-XWEEK-DENY]`'s "the prune stays as the guard for exactly those two
cases" is a keep-this instruction phrased as a statement; `[OIL-AWARD-ADD]`'s "One half is NOT done"
evades a `NOT DONE` regex; and two headings lie outright — `[TRK-SMOKE]` says "NOT merged" but its
commit is on `main`, and `[ARCH-STACK-4]` says "IN REVIEW, HOLDING" but merged in PR #422. **A
heading-word classifier reads text nobody maintains.** Plus a CRLF trap: an end-anchored status regex
matches nothing on these files, and the natural "fix" of normalising line endings rewrites all 1,092
lines, in which a whole-file diff hides a destroyed item.

**Fix.** Change the test from "no forward instruction" to **"every fact a later session would need
has a pointer in a tier-2 doc or a code comment — write the pointer, then move"**. Heading words are
never the criterion. Add `.gitattributes` pinning CRLF and a header line saying a script edits bytes
and never normalises. Correct the two lying headings.

**Status: the `[TRK-LEDGER]` fact is rescued into `docs/tracker/known-gaps.md`.** The rule change,
the `.gitattributes` and the two headings are not done.

## F5 — MEDIUM, cheap. Duplicate ids, a phantom id, dangling pointers, and no committed mover

`### [GLOBAL-UNDO]` and `### [S4-BUGHUNT]` each appear **twice**, so a mover keyed by id finds the
first — for S4-BUGHUNT that is the OPEN item, leaving the merged one. `## Done` sits between two item
headings, so "span to the next `### [`" swallows a section heading. `**[ID]**` in the priority list
matches before any heading. `[LW-WEEKDAY-WORK]` is named in the owner's order and **has never had a
heading** — a phantom no inventory counts. And the archive header says "never append by hand", which
for a live destination means "write a script", and none is committed.

**Fix.** Rename the second headings (`[GLOBAL-UNDO-REV6]`, `[S4-BUGHUNT-MERGED]`); give
`[LW-WEEKDAY-WORK]` a heading or unbracket it; commit
`raptor-port/scripts/backlog-archive.mjs <ID>` that refuses a non-unique id, spans to the next `^##`
at **either** level, refuses unless `--homes <file>` names where the forward facts went, appends by
bytes preserving CRLF, runs the F1 inventory, and prints every remaining reference to that id for
hand repair.

**Status: the five dangling references the move created are fixed.** The renames, the phantom and
the mover are not done.

## F6 — MEDIUM, cheap. Rule 2 was not applied to its own trigger

`[OIL-AWARD-ADD-RULING]` still has **no D-number**, and its body describes "what the app does today
(wrong under this ruling)" — false since PR #423, so it reads as live and is stale. `[S4-BUGHUNT]`
carries two more owner rulings with no D-number, including *"OIL may be credited by hand on ANY day"*.

**It also corrected the agent:** D29 claimed the award ruling "existed in no other file". Wrong — it
is **N16** in the one-absence behaviour register. The real point is narrower and survives: its only
homes are a tier-3 spec and the backlog, so no session reads it.

**Fix.** Add D-rows for the award ruling, for "credited by hand on ANY day", and for the two unbuilt
S4 rulings, each naming its real home. Structural: for every `| D<n> |` row, assert each backticked
path exists, and for rows added since HEAD that each named file is also in `git diff --name-only
HEAD` — **which would have failed D29 today, on both false homes.**

**Status: the D29 correction is made. The missing D-rows are not.**

## F7 — LOW–MEDIUM, medium cost. The same move is scheduled for DECISIONS.md, unguarded

`docsize.mjs` says that when `DECISIONS.md` reaches 150 lines "the oldest decisions move to a dated
section of their own" — the same span-move, on the file rule 2 makes the only home of rulings.
`rulecheck.mjs` carries a hand-copied rules map, so a destroyed register row makes nothing red: the
baseline fails only when the unnamed set GROWS. And `HANDOFF.md` has a second backlog of ~207 lines
at zero headroom, also touched by the destroying commit.

**Fix.** Extend F1 to assert D-numbers contiguous and none lost against HEAD, and that every id in
`rulecheck`'s map exists as a heading in its register. Decide whether HANDOFF's open list is the
backlog or not — two backlogs doubles the surface.

## F8 — LOW, cheap. The agent's own verification was blind to most of the failure

"51 before, the same 51 plus two new" is a **heading count**. Passes 1 and 2 of the bad script
*duplicated* text with no heading change; only pass 3 deleted headings. A heading count passes a file
in which every body is doubled.

**Fix.** The body-level comparison in F1, quoted in the closing report's `Docs:` line.

---

## Anti-patterns the fix itself committed, per Fable

- **#4 the comment that vouches** — D29's home column, and the evidence sheet's "docsize OK" recorded
  over the destructive trim.
- **#3 the warning aimed at the future** — rule 3 written forward, with no roll-call of the four
  EXISTING trim-now instructions. The order says write a hazard as a roll-call of what exists and run
  it the day you write it.
- **#8 green means done** — a heading count offered as proof of restoration.
- **#18 blank-cell approval**, in part — no recorded table of which finished items stayed live and
  why, though about a dozen did, including `[GLOBAL-UNDO]`, which wears DONE while carrying seven
  open deferrals.

## Its suggested order

1. **F1 + F3** — the gate changes, one docs/scripts pass, ~1 h. These make everything else
   enforceable.
2. **F2 + F6** — the docs-only correction pass, ~45 min, done under the new gate.
3. F4 items 1/3/4 and F5 items 1–2, ~30 min.
4. F5's mover and F7 when the next archive pass is actually due.

## What was done, and what is owed

**22 Sep 26:** the `[TRK-LEDGER]` fact rescued into `docs/tracker/known-gaps.md`; the D29 row
corrected; the five dangling references repaired.

**23 Sep 26, branch `claude/docs-guard` — steps 1–3 of the order, done:** F1, F3, F2, F6, F4 items
1/3/4 and F5 items 1–2, as written above, with three measured differences: the backlog files were
LF, not CRLF, by then (LF is what `.gitattributes` pins); `[ARCH-STACK-4]` merged in PR #421, not
#422; and a third duplicate id (`[OIL-SEATS-CAN-EARN]`) had appeared since, now renamed. The
"Status:" lines above describe 22 Sep 26.

**23 Sep 26, same branch — step 4, done on the owner's "Ok do it" (D83, which moves it forward
from "when the next archive pass is due"):** the mover `scripts/backlog-archive.mjs`, and F7 — no
D-number lost or doubled (gaps allowed, D78), every `rulecheck` id still heads a register entry,
and `HANDOFF.md`'s open list declared NOT a backlog, to be emptied into `OUTSTANDING.md` by
`[DOC-TRIM]` rather than moved in bulk here. Two things measured on the way: B9 and H5 are written
only in the clash-check spec, never in the register that names it as their source (the check reads
both); and `[DOC-TRIM]` itself still said "ratchet" and "prune on write" — a fifth trim-on-touch text
F2's roll-call of four had missed, now corrected. **Nothing owed. `[DOCS-GUARD]` is closed.**
