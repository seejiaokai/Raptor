# The readings lapse — the fix to the method (his D2567) — plan, 24 Nov 26

**By:** a fresh Fable planner, for [READINGS-LAPSE-FIX] step 1. **Not built, not read, not approved.** The audit
(step 2, with [UNASKED-READINGS-SWEEP]) is a plan of its own; §C8 says what this plan hands it.
**Read for it:** the bug-check order's §7.11 lesson 32, §4 ("Before a brief leaves"), §6, §9, §12 and its checklist; the
full rows D2338, D2390, D2394, D2564–D2567; the first build's comment (commit `62a898654`,
`src/leavewar/sansunfiled.ts`); the read brief `briefs/2026-11-24-sans-words-read-brief.md` §1;
`.claude/rules/raptor-executor.md`; `DECISIONS.md`'s steps. **Not opened:** the walks' scenario lists and the evidence
sheet — what they held is taken from lesson 32.

## A. The diagnosis, layer by layer

The one cause under all of it: **a reading had no form anything downstream is made to read.** A ruling has a row, a
number, a gate. A builder's reading had a sentence in a code comment — and every later layer takes its rule from the
rulings' rows, where the word "planned" stood alone and looked settled.

| Layer | What it did | The precise gap |
|---|---|---|
| 1. The build (22 Nov) | Read "planned" as "named on any row", wrote "(his to change)" in a comment. The same comment lists other readings as "told to him (D2338's row)" — this one was not among them. | The builder's rule says stop on a *material* missing requirement; nothing says what to do with one judged small. No field of the builder's closing report asks for readings, so leaving it out cost nothing. The app already answered the question two ways (the crew list's strike: seats and sims; ALL AVAIL: every row) — picking one was a product choice, made silently. |
| 2. The record | D2338's row never held the reading. The next day D2390 and D2394 ("every SANS man planned with nothing filed") reused the word in wording he approved "as recommended". | A row has a place for "the agent's readings, told to him", none for a reading **not** told. His later approvals then stood on the word, and it gained his authority by repetition. |
| 3. The readers' brief (24 Nov) | §1 copied "planned with nothing filed" from the rows — as the order requires — and listed "the builder's readings" of **that round only**, with: "a fault is code that breaks its own reading, or a reading that breaks a ruling's words". | (a) The list was made from the host's memory of its own round; a reading two days and one chat older was not on it. (b) The brief told readers to hold the code **to** the reading, not to judge the reading. Four blind readers, four rounds: none was asked the question. |
| 4. Scenario design | The designers did put him on a ground row and a duty desk — the right cases. Their expected result was "it counts". | The order's rule that every expected result names its source was met on paper: the source was the ruling. Nothing says a ruling is a source only for what its words say. |
| 5. The walks (w5–w13) | Judged pass or fail against the expected result, as designed. | None of their own — a walker is not asked to question the expected line. No change proposed here. |
| 6. The roll-call and the rulings sweep | Listed where the bell line is drawn; checked the build against the rulings' words. | The roll-call asks "where is this thing drawn", never "where else does the app answer this same question, and by what rule". The two answers were never set side by side. |

Why "many layers" was really one: layers 3 to 5 are not independent of layer 1. Each inherits the rule from the same
rows, so a gap in the rows is invisible to all of them at once. Only layer 6 looks at the app instead of the rows.

## B. The cheapest catch points, ranked

1. **The build.** One question to him with one example ("Ranger is on Wednesday's range brief only — should his bell
   ask him to file?"), minutes, before a single reader or walker was paid for. Depends on the builder noticing he
   made a reading.
2. **The roll-call.** About fifteen minutes: the reminder's rule beside the crew list's and the warning's. The only
   catch that works when the builder did **not** notice — so it is the backstop, and ranks above the brief.
3. **The readers' brief.** One listed reading, read by four readers. Cheap, but only as good as the list — hence a
   script makes the list (C7), not the host's memory.
4. **Scenario design.** Costs nothing extra — the cases were already there — but comes last and can only mark the
   case "show him", not settle it.

## C. The changes

Seven small edits and one script. **No always-loaded file changes** (the every-chat rules gain no bytes): the build
rule loads with any source file, the rest is read by section at its step. Each rule is stated once; the others point.

### C1. The form a reading takes — `DECISIONS.md`, step 1, "In the row:"

The one place, because it is where a row's shape is already ruled.

- **Before:** "…and says where, or "not checked"; in the home cell backticks are for files only…"
- **After:** "…and says where, or "not checked"; a reading of yours not yet put to him — what a word of his covers,
  or a case his words do not name, that a person would see — is written `**READING, NOT ASKED (<date>): <what was
  built>; the other way: <…>.**`, and leaves only by his ruling (step 2's NARROWED or ANSWERED mark); in the home
  cell backticks are for files only…"

### C2. The builder's rule — `.claude/rules/raptor-executor.md`, §Approved specification, and its footer

The one place, because it is the builder's policy, loaded with every source file and named for Codex in `AGENTS.md`.

- **Before:** "Implement the approved behaviour using the existing architecture. Do not invent scheduling rules,
  APIs, schemas, fields or requirements."
- **After:** the same, then one new paragraph: "Where his words do not settle something a person would see — what a
  word covers, a case they do not name — a comment is not the record. Build the reading the app already uses for the
  same question and say where; if the app answers it two ways, that is the example to show him. Mark it in the
  ruling's full row (`DECISIONS.md` step 1), tag the code `READING D<n>`, list it in the footer. It goes to him with
  a worked example before the code is read — unattended, parked — and never merges unasked."
- **Footer, before:** `Open items: unresolved issues, blockers, or none`
- **Footer, after:** that line, then `Readings: each reading not asked, with its ruling — or none`

### C3. The brief and the expected result — `bug-check-order.md` §4, "Before a brief leaves", bullets 1 and 2

The one place: it already rules what a brief's promise and an expected result may rest on.

- **Bullet 1, add at its end:** "Every brief — a reader's, a scenario designer's, a walker's — lists each reading not
  asked on the rulings it names and in the files changed (`npm run readings`), both ways, for the reader to judge
  which he would mean; never as part of the promise, and never "a fault only where the code breaks its own reading"."
- **Bullet 2, add after "(the mark and the changes list)":** "A ruling is a source only for what its words say: an
  EXPECTED that rests on a reading not asked is written RECORD, with a case on each side of the reading, each marked
  "the reading's case — shown to him", never a pass."

### C4. The roll-call's new row — `bug-check-order.md` §6, the rows by kind (after "A part drawn inside another surface…")

- **Add:** "- **A new answer to a question the app already answers about a person** (is he planned, away, counted,
  owed, allowed) lists every place that answers it, each one's rule in a line beside the ruling's words; a difference
  is MISSING until he rules it (§7.11 lesson 32)."
- **Checklist, step 8, the list of rows — before:** "…a part drawn inside another surface by a different owner."
  **After:** "…a part drawn inside another surface by a different owner, a second answer to a question the app
  already answers."

### C5. Lesson 32, folded — `bug-check-order.md` §7.11, and the checklist's missing line

The case stays whole (his words and each case stay there). Only the lesson sentence shrinks, now that its four rules
each have a home; and the checklist gains the one-liner lesson 32 never had — without it the sizing step, which goes
through the checklist's list, cannot see the lesson.

- **Before:** "**Lesson:** where two surfaces answer the same question about a person, the roll-call sets their rules
  side by side, and a difference is a finding until he rules it; a builder's reading of what a ruled word covers goes
  to him with a worked example before the build is read; a readers' brief names each such reading as a reading to
  judge, never as part of the rule; and the scenarios hold a case on each side of the reading, each marked as the
  reading's case to show him, never as a pass (here, a SANS man on a ground row only)."
- **After:** "**Lesson:** a reading is marked, listed and asked, never left in a comment — the builder's rule
  (`.claude/rules/raptor-executor.md` §Approved specification), the brief's and the scenarios' (§4, "Before a brief
  leaves"), the roll-call's row for a second answer to one question (§6), §12's box (here, a SANS man on a ground row
  only)."
- **Checklist, add after line 31:** "32. A ruled word the build had to read, or a question the app already answers
  elsewhere: each place's rule side by side; a case on each side of every reading not asked, marked to show him —
  never a pass."

### C6. The step that cannot be skipped — `bug-check-order.md` §12

- **Add after "Applicable rulings listed; any clash flagged and resolved.":** "- [ ] No reading not asked on what
  this change builds (`npm run readings`) — each put to him with a worked example, in his look at the latest."

### C7. The script — `raptor-port/scripts/` (a small build job, Opus)

- `npm run readings`: lists every `READING, NOT ASKED` mark in the full rows and every `READING D<n>` tag under
  `src`, optionally narrowed to named rulings or files — the list C3 and C6 paste, never retyped.
- Inside the document check that already runs at every turn's end and on GitHub: **fail** on a `READING D<n>` tag
  whose row carries no mark (a reading living only in code — this lapse exactly); print `Readings not asked: <n>`.
- A self-test case for each, written to fail before the check exists. No change to the app.

### C8. Handed to the audit's plan — not part of this change

- The 40 "his to change" comments in 27 source files (and the 60-odd "the agent's reading" ones): each is found told
  to him, or is put to him in a small round with when it happens and an example, then rewritten to cite his answer or
  to carry the tag and the row mark. The sweep's "11 files" undercounts; the audit should search both phrases.
- Readings made outside a build — in a mock-up or in words drafted for the app — have no builder's footer. Whether
  the words' reviewer (a fresh Fable) should be given the same list is for the audit's plan to say.

### Read class and order

| Change | Class | Reads | Goes live |
|---|---|---|---|
| C1 `DECISIONS.md` steps | a rule that governs the agent | Astra, then a fresh, blind Opus — one round, narrow brief: does each line say what lesson 32 meant, contradict a ruling, drop a safeguard, add bulk | his "merge live" |
| C2 the builder's rule file | a rule file | the same two | his "merge live" |
| C3, C4, C5, C6 the bug-check order and its checklist | a working guide; C5 also rewrites a lesson (meaning check) | the same two | his "merge live" |
| C7 the script | code under scripts, no app change | Astra's code read and a fresh, blind Opus read; its own tests; no walk | his "merge live" (it adds a check) |
| This plan, the backlog and handoff entries, the ruling's row | notes | none | with the pull request |

One pull request, C7 with the guides (C3 and C6 name its command). The plan itself is an important plan: its red team
is Astra and a fresh Opus before anything is edited. Sizes: C5 gives back about 350 characters to the order; C3, C4
and C6 take about 900; a limit crossed is raised and named, never met by cutting.

## D. For the owner — in plain words

**What went wrong.** Your ruling said the SANS reminder lists days a man is "planned". The builder had to decide what
"planned" covers, chose "on any row of the day", and wrote that choice only in a note inside the code, which nobody is
made to read. Every later check took the rule from your recorded words, where "planned" looked settled — so the
readers, the test designers and the walkers all checked the app against the builder's choice, believing it was yours.
One gap, repeated at every layer.

**What will change.**
1. A builder who has to interpret one of your words records it beside your ruling, marked "not asked", and puts it
   to you with a worked example before anyone checks the work.
2. An automatic check lists every open interpretation and fails if one is hidden in the code alone.
3. Every checker is handed that list and told to question it; tests that depend on it are marked "show him", never
   "pass".
4. Where the app already answers the same question elsewhere, the two answers are compared before the walk.
5. Nothing is called ready for "merge live" with an interpretation you have not seen.

**What it costs you.** Nothing to do but approve. You will get a few more short questions, earlier.
