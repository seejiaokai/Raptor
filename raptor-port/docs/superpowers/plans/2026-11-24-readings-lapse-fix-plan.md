# The readings lapse — the fix to the method (his D2567) — plan, 24 Nov 26

**By:** a fresh Fable planner, for [READINGS-LAPSE-FIX] step 1. **Revised after red-team round 1 (§E). Not built, not
approved.** The audit (step 2, with [UNASKED-READINGS-SWEEP]) is a plan of its own; §C8 says what this plan hands it.
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
| 1. The build (22 Nov) | Read "planned" as "named on any row", wrote "(his to change)" in a comment. The same comment lists other readings as "told to him (D2338's row)" — this one was not among them. | The builder's rule says stop on a *material* missing requirement; nothing says a reading of his word is one. No field of the builder's closing report asks for readings. The app already answered the question two ways (the crew list's strike: seats and sims; ALL AVAIL: every row) — picking one was a product choice, made silently. |
| 2. The record and the words | D2338's row never held the reading. The next day D2390 and D2394 ("every SANS man planned with nothing filed") reused the word in wording he approved "as recommended". | A row has a place for "the agent's readings, told to him", none for a reading **not** told. No rule makes a drawing, wording or question state the reading it rests on, so his approvals stood on the word and it gained his authority by repetition. |
| 3. The readers' brief (24 Nov) | §1 copied "planned with nothing filed" from the rows — as the order requires — and listed "the builder's readings" of **that round only**, with: "a fault is code that breaks its own reading, or a reading that breaks a ruling's words". | (a) The list came from the host's memory of its own round; a reading two days and one chat older was not on it. (b) Readers were told to hold the code **to** the reading, not to judge it. (c) Nobody was asked what the code makes each ruled word cover. |
| 4. Scenario design | The designers did put him on a ground row and a duty desk — the right cases. Their expected result was "it counts". | The order's rule that every expected result names its source was met on paper: the source was the ruling. Nothing says a ruling is a source only for what its words say. |
| 5. The walks (w5–w13) | Judged pass or fail against the expected result, as designed. | None of their own. No change proposed. |
| 6. The roll-call and the rulings sweep | Listed where the bell line is drawn; checked the build against the rulings' words. | The roll-call asks "where is this thing drawn", never "where else does the app answer this same question, and by what rule". |

Why "many layers" was really one: layers 3 to 5 inherit the rule from the same rows, so a gap in the rows is invisible
to all of them at once. Only layer 6 looks at the app instead of the rows.

## B. The cheapest catch points, ranked

1. **The build — or, earlier still, the drawing or wording put to him.** One question with one example ("Ranger is on
   Wednesday's range brief only — should his bell ask him to file?"), before a reader or walker is paid for. Depends
   on someone noticing a reading was made.
2. **The roll-call.** About fifteen minutes: the reminder's rule beside the crew list's and the warning's. Works when
   nobody noticed — but only where another surface answers the same question.
3. **The readers' brief.** Once it asks what the code makes each ruled word cover, it is the one catch for a reading
   nobody noticed and no other surface answers.
4. **Scenario design.** Costs nothing extra — the cases were already there — but comes last and can only mark the
   case "show him".

## C. The changes

One rule, stated once (C1); four pointers to it (C2, C2a); three edits to the bug-check order (C3–C6); one script
(C7). The every-chat rules gain one pointer line and nothing else.

### C1. The rule, once — `DECISIONS.md`, a short block after the three recording steps

The one place: a reading is the counterpart of a ruling, and every role that meets one — designer, writer, builder,
reader — already comes here to record or to check.

- **Add:** "**A reading — what a word of his covers, or a case his words do not name, that a person would see — is his
  to settle, whoever meets it: drawing, wording, building, reading or walking.** It is never built on, drawn as
  settled or folded into other wording: it goes to him as its own question, with a worked example and how the app
  answers the same question elsewhere — at the latest named as a reading inside the thing he is asked to approve.
  Until he answers, the ruling's full row carries `**READING, OPEN (<date>, asked | not asked): <one way>; the other:
  <…>.**`, code already built on it carries `READING D<n>`, and `npm run readings` lists both. It leaves only by his
  ruling (step 2's mark); his approval of wording that only repeats the word does not settle it."

### C2. The builder's pointer — `.claude/rules/raptor-executor.md`, §Approved specification, and its footer

The existing stop is kept and now names this case; neighbouring behaviour frames the question, never answers it.

- **Before:** "When a material requirement is missing, contradictory, or conflicts with a documented invariant: stop
  the affected work and report **BLOCKED**, naming the decision needed."
- **After:** "When a material requirement is missing, contradictory, or conflicts with a documented invariant — a
  reading of his words among them (`DECISIONS.md`, "A reading"): stop the affected work and report **BLOCKED**, naming
  the decision needed. How the app answers the same question elsewhere goes into the question; it never settles it."
- **Footer, after `Open items: …`, add:** `Readings: each open reading met or found, with its ruling — or none`

### C2a. The other pointers — design, the app's words, and anything put to him

- `.claude/rules/ui-design.md`, point 1, **add at its end:** "· a drawing or mock-up that rests on a reading names
  it, with a worked example (`DECISIONS.md`, "A reading")".
- The same file, point 2, **before:** "…reviewed and adjusted by a fresh Fable helper (D2441);" **after:** "…reviewed
  and adjusted by a fresh Fable helper (D2441), who is given `npm run readings` for the rulings the words rest on and
  names any reading the words would settle (`DECISIONS.md`, "A reading");".
- `.claude/rules/record-decisions.md`, §The check, **add one bullet** (the only always-loaded addition — it is where
  "before you put any choice to him" is already ruled): "- A word of his that what you put to him reads one way is a
  reading: `DECISIONS.md`, "A reading"."

### C3. The brief and the expected result — `bug-check-order.md` §4, "Before a brief leaves"

The existing line about readings is extended; no second line is added.

- **Before:** "- A plan's brief lists the builder's own readings as targets, each to be ruled supported / contradicted
  / the owner's to decide — and every file the plan treats by its shape…"
- **After:** "- A brief — a plan's, a code reader's, a scenario designer's — lists every open reading on the rulings
  it names and in the files changed (`npm run readings`, never from memory) as targets, each to be ruled supported /
  contradicted / the owner's to decide, never as part of the promise; and it asks what the code or plan makes each
  ruled word in the promise cover, so a reading nobody listed is found — and every file the plan treats by its
  shape…" (the rest unchanged).
- **The EXPECTED bullet, add after "(the mark and the changes list)":** "A ruling is a source only for what its words
  say: an EXPECTED that rests on an open reading is written RECORD, with a case on each side of it, each marked "the
  reading's case — shown to him", never a pass."

### C4. The roll-call's new row — `bug-check-order.md` §6, the rows by kind (after "A part drawn inside another surface…")

- **Add:** "- **A new answer to a question the app already answers about a person** (is he planned, away, counted,
  owed, allowed) lists every place that answers it, each one's rule in a line beside the ruling's words; a difference
  is MISSING until he rules it (§7.11 lesson 32)."
- **Checklist, step 8, the list of rows — add at its end:** ", a second answer to a question the app already answers".

### C5. Lesson 32, folded — `bug-check-order.md` §7.11, and the checklist's missing line

The case stays whole. Only the lesson sentence shrinks, now its rules have homes; and the checklist gains the
one-liner lesson 32 never had — without it the sizing step, which goes through the checklist's list, cannot see it.

- **Before:** "**Lesson:** where two surfaces answer the same question about a person, the roll-call sets their rules
  side by side, and a difference is a finding until he rules it; a builder's reading of what a ruled word covers goes
  to him with a worked example before the build is read; a readers' brief names each such reading as a reading to
  judge, never as part of the rule; and the scenarios hold a case on each side of the reading, each marked as the
  reading's case to show him, never as a pass (here, a SANS man on a ground row only)."
- **After:** "**Lesson:** a reading is his to settle, never left in a comment (`DECISIONS.md`, "A reading"); the brief
  lists the open ones and asks for the unlisted, and a scenario resting on one is shown to him, never passed (§4,
  "Before a brief leaves"); the roll-call sets a second answer to one question beside the first (§6); §12's box
  (here, a SANS man on a ground row only)."
- **Checklist, add after line 31:** "32. A ruled word the build had to read, or a question the app already answers
  elsewhere: each place's rule side by side; a case on each side of every open reading, marked to show him — never a
  pass."

### C6. The step that cannot be skipped — `bug-check-order.md` §12

- **Add after "Applicable rulings listed; any clash flagged and resolved.":** "- [ ] `npm run readings` shows no
  reading "not asked" on what this change builds or words — each already put to him (`DECISIONS.md`, "A reading")."

### C7. The script — `raptor-port/scripts/` (a small build job, Opus)

- `npm run readings`: lists every `READING, OPEN` mark in the full rows and every `READING D<n>` tag under `src`,
  optionally narrowed to named rulings or files.
- Inside the document check that runs at every turn's end and on GitHub, two failures: (a) a `READING D<n>` tag whose
  row carries no open mark; (b) **on lines a branch adds under `src`**, a comment that speaks of a reading in free
  words — "his to change", "agent's / builder's / build's reading", "until he rules", "not put to him" — with no
  `READING D<n>` tag in the same comment. Added lines only, so the 40 old comments block nothing; the audit clears
  them. It prints `Readings open: <n> (<m> not asked)`.
- **Its first test is the 22 Nov comment itself,** pasted whole as an added line: it must fail (b).
- **What it is, honestly:** a consistency check on readings somebody wrote down. A reading made with no words about
  it at all passes it; those are C3's question to the readers and C4's row.

### C8. Handed to the audit's plan — not part of this change

- The 40 "his to change" comments in 27 source files (11 outside tests) and the "agent's reading" ones: each found
  answered by him, or put to him, then rewritten to cite his answer or to carry the tag and the row's open mark — the
  audit's host marks each unasked reading it files (C1), so the list holds it until he answers.

### Read class and order

| Change | Class | Reads | Goes live |
|---|---|---|---|
| C1 `DECISIONS.md` | a rule that governs the agent | Astra, then a fresh, blind Opus — one round, narrow brief: does each line say what lesson 32 meant, contradict a ruling, drop a safeguard, add bulk | his "merge live" |
| C2, C2a the builder's rule file, the design rule file, the recording rule file | rule files (one always loaded) | the same two | his "merge live" |
| C3, C4, C5, C6 the bug-check order and its checklist | a working guide; C5 rewrites a lesson (meaning check) | the same two | his "merge live" |
| C7 the script | code under scripts, no app change | Astra's code read and a fresh, blind Opus read; its own tests; no walk | his "merge live" (it adds a check) |
| This plan, the backlog and handoff entries, the ruling's row | notes | none | with the pull request |

One pull request, C7 with the guides (C1, C3 and C6 name its command). Sizes: C5 gives back about 300 characters to
the order; C3, C4 and C6 take about 800; a limit crossed is raised and named, never met by cutting.

## D. For the owner — in plain words

**What went wrong.** Your ruling said the SANS reminder lists days a man is "planned". The builder decided for himself
what "planned" covers — any row of the day — and wrote that only in a note inside the code, which nobody is made to
read. Every later check took the rule from your recorded words, where "planned" looked settled, so every checker judged the
app against the builder's choice, believing it was yours. One gap, repeated at every layer.

**What will change.**
1. Whoever has to interpret one of your words — drawing a screen, writing the app's words or building — stops and
   asks you, with a worked example. Approving a sentence that merely repeats the word no longer counts.
2. Each such open question is recorded beside your ruling until you answer, and an automatic check lists them.
3. Every checker gets that list, and also hunts for interpretations nobody wrote down.
4. Where the app already answers the same question elsewhere, the two answers are compared.
5. Nothing is called ready for "merge live" with an interpretation you have not seen.

**What it costs you.** Only your approval. You will get a few more short questions, earlier.

## E. The red team, round 1 (Astra and a fresh, blind Opus — `briefs/2026-11-24-readings-plans-redteam-*.md`)

| Finding | Verdict | Where |
|---|---|---|
| C2 let a builder build the neighbouring answer first (Astra must-fix; Opus minor: says nothing when the app answers two ways) | **Accepted.** | C2 rewritten: the existing stop kept and extended to name a reading; the neighbour frames the question only. |
| Drawings, the app's words and questions put to him were covered by neither plan (both, must-fix) | **Accepted — this plan owns it.** | The rule is stated once, role-neutral, in C1 ("whoever meets it"; "his approval of wording that only repeats the word does not settle it"); pointers in C2 and C2a; layer 2 of §A now names the gap. |
| The check would have passed the original "his to change" comment; the claim "this lapse exactly" was wrong (both) | **Accepted.** | C7 (b) fails free-text reading phrases on added lines; its first test is the 22 Nov comment; the claim is replaced by "what it is, honestly". |
| C3 added a second list beside "A plan's brief lists the builder's own readings as targets" (Astra) | **Accepted.** | C3 now extends that line; the addition to bullet 1 is dropped. |
| C2 ("before the code is read") and C6 ("in his look at the latest") disagreed (Opus S1) | **Accepted.** | One moment, in C1 only: before it is built on, at the latest named inside the thing he approves; C6 now reads "each already put to him". |
| Readers saw only listed readings; one nobody noticed escaped (both) | **Accepted.** | C3: the brief asks what the code makes each ruled word cover; §B rank 3 says why. |
| Walkers were given the list though layer 5 proposes no change (Opus S3) | **Accepted.** | Walkers dropped from C3. |
| C2's paragraph too long for a rule (Opus minor) | **Accepted.** | Now one clause and one sentence. |
| The checklist's line 32 restates C3 (Opus minor) | **Rejected.** | The checklist's lessons list is one line per lesson by design ("one line each of what to check"); without it the sizing step cannot see lesson 32. |
| The audit should mark each unasked reading it files (Opus S5, on the audit plan) | **Accepted here as the link.** | C1's mark has two states (asked / not asked); C8 says the audit's host writes it. |

Not taken up here: the findings on the audit plan alone (its "told" test, engine differences, round sizes, the width
of "no ruling", its counts).
