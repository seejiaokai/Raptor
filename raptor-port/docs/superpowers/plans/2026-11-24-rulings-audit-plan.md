# The rulings audit — plan (his D2567; backlog [READINGS-LAPSE-FIX] step 2, [UNASKED-READINGS-SWEEP] folded in)

Written 24 Nov 26 by a fresh Fable planner. Opus helpers do the audit; Fable reviews their findings; the host reproduces
them and puts them to him. **Approved 24 Nov 26, its core first (D2610): steps A and B, slices 1–5 and 9, the
code-comment readings, Fable's read of every finding, the host's reproduction; low-harm questions in one list.** **Reading only: nothing in the app, a drawing or a rule changes without his answer.** The
method fix (step 1 of the backlog item, `2026-11-24-readings-lapse-fix-plan.md`) is a separate job; this plan does not
touch the working guides. **This audit covers the readings, designs and words made so far; the rule for a reading in a
future drawing, wording or question is the method-fix plan's, stated there once.**

## 0. For him, in plain words

You found that the SANS reminder counted more than you meant, because a builder guessed what one word covered and never
asked you. This audit looks for every other guess like it. About thirteen helpers each take one part of the app — OIL,
the published schedule, who may do what, inputs and SANS, the Leave War, the Tracker, the bell — and compare three things
with what you ruled: what the app does, the words it shows people, and the drawings not yet built. They also read every
note a builder left saying "this is my reading". A second, fresh reader checks what they find, and I confirm each one in
the app. Then the real differences come to you a few at a time, worst first, each with when it happens, a named example,
a picture and a recommendation. Nothing changes until you answer.

## 1. What is audited, and how big it is (counted 24 Nov 26 on this branch)

| Kind | Where | Count |
|---|---|---|
| (c) Builders' readings in code comments | `raptor-port/src`, phrases: "his to change", "agent's reading", "our/builder's reading", "reading of", "not (yet) ruled", "until he rules", "his call", "assumed", "for now", "TBC", "provisional" | "his to change": 40 lines in 27 files (11 non-test lines, of which about 7 are readings and 4 are the phrase used in another sense); all phrases: about 440 lines — ui 122, leavewar 78, state 45, engine 188 (mostly "assumed" in ported text — step A keeps only the comments the port added), others 5; about 200 outside tests, about 130 once the ported text is out |
| (c2) Readings recorded in the rulings' full rows | `.claude/decisions-full/*.md` | "agent's reading" about 1,010 times; "told to him" about 310; "not checked with him" / "not put to him" / "not told" about 26. These are occurrences, not readings sorted one by one; roughly 700 carry no word either way |
| (b) Bell lines | `raptor-port/docs/notifications-register.md` — built (B rows), ruled-not-built, proposed | about 30 rows; each also has its words in the source |
| (b) Other words on screen | hints, warnings, refusals, notes, rule text, empty states, tooltips in `src/ui`, `src/leavewar/ui`, `src/tracker`, `src/state` (refusal reasons) | not countable by grep alone (233 long tooltip/label attributes; the rest are text in the screens) — step A builds the list; expect 600–900 strings |
| (a) Drawings | `raptor-port/docs/mock/` | 115 entries; about 35 dated 4–24 Nov |
| (a) Specs, plans, briefs | `raptor-port/docs/superpowers/` | 210 / 131 / 1,042 — only those of unbuilt or part-built work are in scope (step A lists them; expect 25–40) |
| (a) Ruled, not built | the area pages' "not built" lines | 32 (scheduler 21, inputs 4, leave-war 4, others 3), plus the register's not-built rows |
| The yardstick | area pages `.claude/rules/decisions/*.md` (367 KB), full rows (1,689 rows), `DECISIONS-ARCHIVE.md` (536 lines) | — |

**Left out, with the reason:** drawings and specs of screens already built and since changed (the app is audited, not
its old drawing); briefs of finished jobs (1,000 of them — history); the working guides and rule files (step 1's job);
the Tracker's syllabus data.

**Branches:** the audit reads `main`'s app. Words and designs that live only on an open branch (the SANS words job, pull
request 825, with D2564's build) are read on that branch by the slice that owns them, and marked so. Before a helper
calls anything unruled it searches the open branches' rulings files too.

## 2. The steps

**Step A — the lists (one cheap-model helper, mechanical; the host spot-checks 20 lines of each).** Writes three lists to
`raptor-port/docs/superpowers/briefs/2026-11-24-rulings-audit-inventory.md`:
1. every comment matching the phrases above, with file, line and three lines of context, tagged by area from its folder
   and subject; in `src/engine` only the comments the port added, the ported text left out; test files included (lesson 32: the reading was also written as an expected result);
2. every string a person can read, by screen, with file and line — built by a script that pulls text and label
   attributes from the screen files and the refusal-reason tables, plus the register's rows;
3. the in-scope designs: each drawing dated 4 Nov on, each ruled-not-built line with its drawing or spec if any, each
   spec or plan whose backlog item is still open.
It also runs a first sort of the full rows' readings — each reading by itself, never a whole row at once (one row can
hold a reading told and another never told: D2338): *the row says told*, *the row says not told*, or *silent*. The sort
only orders the work; no reading is settled by it.

**Step B — the question list (Fable, about an hour, before the helpers start).** The lesson's core: where two surfaces
answer the same question about a person, their rules are set side by side. Fable writes the list of such questions from
the area pages — for example: is he available / busy / planned that day; does this day earn OIL, and for whom; is this
day published, amended, signed; who may edit, who only view; what counts toward a cap or a limit; who is told, and when;
is he in this squadron today. Each question names every surface that answers it (from `feature-impact.md` and the
roll-call lists). Expect 25–40 questions. Each goes to the slice that owns it; slice 12 takes those crossing areas.

**Step C — the slices (Opus helpers, high thinking, fresh, each blind to the others).** Sized so the area page, the
slice's list and the rows it must open fit one context; a helper that passes about 60% full stops, saves its file and
names what is left, and a second helper takes the rest.

| # | Slice | Reads | Items (est.) |
|---|---|---|---|
| 1 | OIL — what earns, the pending mark, the wait, asks, the OIL page and editor | oil page; scheduler and leave-war lines citing OIL | 70 words, 6 designs, 10 comments, 5 questions |
| 2 | The published record — publish, amend, sign, plans, undo of a publish, day lock | scheduler page (those sections) | 90 words, 8 designs, 20 comments, 6 questions |
| 3 | Who may do what — sign-in kinds, member / guest / no sign-in, refusal reasons, two-squadron guards | people-accounts page; scheduler and leave-war permission lines; `data-model.md` §11 | 80 words, 10 designs (multi-squadron rounds), 35 comments, 6 questions |
| 4 | The schedule's day — rows, seats, duty desks, the crew list, the warning list and its words, caps | scheduler page (the rest) | 150 words, 6 designs, 40 comments, 6 questions |
| 5 | Inputs and SANS — the input window and cards, the SANS calendar, availability, the reminder | inputs page; scheduler's SANS lines | 120 words, 8 designs, 35 comments, 6 questions |
| 6 | Leave War, grid and filing — cells, bids, approvals, the select sheet | leave-war page (first half) | 110 words, 5 designs, 30 comments, 4 questions |
| 7 | Leave War, balances and the link to the schedule — balances, medical and other kinds' short forms, sync | leave-war page (second half) | 80 words, 3 designs, 25 comments, 3 questions |
| 8 | Tracker | tracker page | 60 words, 4 designs, 2 comments, 2 questions |
| 9 | The bell — every line, built, ruled-not-built and proposed: who is told, when, the words, the tap | the register; every area's notification lines | 30 lines × 4 points |
| 10 | Top bar, Admin, Insights, the legend, app-wide words | design page; how-we-work §App-wide product rules | 90 words, 4 designs, 10 comments |
| 11 | The rows' readings marked *not told* or *silent* — scheduler, inputs, oil | full rows | about 330 |
| 12 | The same — leave-war, people-accounts, tracker, design, how-we-work §App-wide; plus the cross-area questions | full rows | about 350, 5 questions |
| 13 | Tests whose expected result is a reading — the test files in list 1, and each walk scenario list of the last three weeks that states a rule in its own words | list 1 (test lines); `briefs/` scenario lists 4–24 Nov | about 240 lines, 15 lists |

Slices 11–12 are triage, not a full check: a reading that only repeats the ruling, or is about how the agent works, is
passed in one line; a reading that decides who may act, what counts, what earns or who is told is checked in full —
*the row says told* included, since told is not answered (§3 step 5).

## 3. What a helper does with each item

1. **Say what the item claims**, in one plain sentence: what the app does, the string says, the drawing shows or the
   comment reads — from the code or the picture itself, never from a comment or a spec about it.
2. **Find the rulings by subject, not phrasing** — the thing governed ("SANS reminder", "own row", "duty desk"), with the
   shell's grep across every area page, every full-rows file, the archive and the backlog; open each full row
   (`grep -h '^| D149 |' .claude/decisions-full/*.md`). Later ruling wins; note a replaced one.
3. **Compare word by word.** For each word of the ruling that could cover more or less than one thing ("planned",
   "available", "busy", "on the schedule", "his own", "published", "a scheduler", "that day"), write what the ruling's
   row says it covers and what the item makes it cover. Where the row does not say, that is the finding.
4. **Set it beside its neighbours.** For each of the slice's questions from step B, a small table: each surface, the rule
   it applies, the ruling it rests on. Any difference between two surfaces is a finding unless a ruling names it.
5. **For a reading, find where it stands with him — each reading by itself, never a row at once.** Three searches: the
   row's own words, the questions and mock-up pages, his later rulings on the subject. It is one of:
   - **approved** — his answer to it is on record (his words quoted, or a later ruling that states it). His "as
     recommended" to wording that merely used the word is not an answer to what the word covers;
   - **contradicted** — a later ruling of his says otherwise (then the item is a MISMATCH if the app still follows it);
   - **disclosed, unanswered** — put to him as a statement or question (the row says "told", or a page showed it), no
     answer found. Not settled;
   - **never put to him** — only in a code comment, a spec, a brief, or a closing report or evidence sheet in passing.
6. **Classify:**
   - **MATCH** — does what the ruling says; where it rests on a reading, only an *approved* one;
   - **MISMATCH** — the app, string or drawing differs from the ruling, or two surfaces differ with no ruling for it;
   - **OPEN READING** — the item rests on a builder's choice of meaning that is *never put to him* or *disclosed,
     unanswered* (right or wrong), the standing named;
   - **NO RULING** — nothing found that governs it, and the item states or enforces a rule: who may act, what counts,
     what earns, who is told and when. A plain label, a heading or a description of what a control does is not one.
7. **Do not fix, do not recommend a build, do not judge the code's quality.** One line of "what he would likely be asked"
   is all.

## 4. The record

Each slice writes `raptor-port/docs/superpowers/briefs/2026-11-24-rulings-audit-<slice>.md` (slices named `oil`,
`published`, `permissions`, `day`, `inputs-sans`, `lw-grid`, `lw-balances`, `tracker`, `bell`, `app-wide`, `rows-a`,
`rows-b`, `tests`). Three parts:

**Findings** — one row each, everything but MATCH:

| Id | Class | The item (what a person sees or the app does) | Where (file:line, or picture path) | Ruling(s) and his words quoted | The difference, in one sentence | The reading's standing (approved / contradicted / disclosed, unanswered / never put — and where searched) | Harm (OIL / published record / permission / told wrongly / wording only) | The question it would become |
|---|---|---|---|---|---|---|---|---|

**Side-by-side tables** — one per step-B question.

**Coverage ledger** — one line per item checked, MATCH included (`item · class · ruling`), and a closing count:
items in the list, items checked, items left and why. A slice with no ledger did not happen.

## 5. What every brief says is not a finding

- A problem that exists only in data already stored, where the code is right from now on (D56) — both must be true.
- Anything of the shape "a scheduler who is not an admin" (D785). A member, a guest and a person with no sign-in stay in.
- (Not an exclusion:) a difference from a ruling inside the rules engine is a finding like any other, with its harm —
  the engine's bodies being word-for-word ports limits who may edit them and how, not what is reported. Only the ported
  comment text is out of list 1.
- A drawing or spec of something since rebuilt differently on his word; an archived ruling's old wording.
- Code tidiness, performance, a missing test.
- The helper is told nothing of the other slices' findings, and the brief states each rule only by pointing at its row —
  never restated in the brief's own words (lesson 32).

## 6. Fable's review, and the host's reproduction

- **Fable, a fresh helper, reads every finding** (not a sample — expected 60–150 across the slices) and marks each REAL,
  NOT REAL or UNSURE. Real means: the ruling quoted is the latest on the subject; the item was read from the code or
  picture itself; the difference would change what a person sees, may do, earns or is told — or his answer could; for an
  OPEN READING, the three searches were made and Fable's own search agrees on its standing.
- **Fable samples the MATCH lines**: 10% of each ledger, and every line touching OIL, a published record or a
  permission. Two wrong matches in a slice's sample sends that slice back to a fresh helper.
- **Fable merges duplicates** across slices and groups findings that are one decision.
- **The host reproduces each REAL finding before it counts:** for built behaviour, in the running app on his PC with a
  named case, and a picture; for a string, the screen showing it; for a drawing, the picture beside the ruling; for an
  open reading, the case on each side of the reading shown. Not reproduced: dropped, with the reason kept in the file.
- **The host then settles and groups before anything goes to him:** a MISMATCH a clear, current ruling already answers
  is not a question — it is filed as a fault to fix (told to him in one list); findings that are one decision become
  one question; what is left is counted, and the number of rounds is estimated from that count and told to him.
- **Each real OPEN READING is marked in its ruling's full row** in the form the method-fix plan sets (its §C1,
  "READING, NOT ASKED"), so that plan's list of open readings shows it until he answers. A record mark, not a rule
  change; if §C1 is not yet live, the marks wait in the findings file and are written the day it is.
- The combined list: `raptor-port/docs/superpowers/briefs/2026-11-24-rulings-audit-findings.md` — every real finding
  with its state (fault filed / in round n / waiting, why / answered, ruling), so nothing deferred or unsure is lost;
  each backlog-worthy item filed in `OUTSTANDING.md`.

## 7. How they reach him

- Rounds of at most four questions (the design guide's cap, D541) on a questions page, newest at the top, in plain words, no ruling numbers or file names.
- Each question, in this order: when it happens in real life — who is doing what, at what point, how often (D2439); a
  worked example with a named case; a picture of the real app on the device the case is about, the place marked, cut to
  it (D853, D1222, D1951); what the app does today and what his ruling's words say; a recommendation.
- One decision a question; none that depends on another's answer.
- **Order by harm:** OIL earned or lost wrongly → a published record shown or changed wrongly → someone able to do or
  see what he should not → someone told the wrong thing or not told → a reading disclosed but never answered,
  the app doing as disclosed → a wrong word with no wrong behaviour → drawings not yet built (these can also wait for
  each feature's own design round, each tracked in the combined list until then).
- A finding where the app plainly breaks a clear ruling and harms people now is told to him at once and fixed as a fault,
  not held for a round. A wording-only mismatch with a clear ruling is listed for him in one batch, not a question each.
- Each answer is recorded as a ruling before any work; the build is filed; the code comment is rewritten to cite it.

## 8. Cost, and what could be dropped

| Step | Who | Rough time |
|---|---|---|
| A — the lists | 1 cheap-model helper + host spot-check | 45 min |
| B — the question list | Fable | 1 h |
| C — 13 slices, four at a time | 13 Opus helpers (allow 3 more for slices that overflow) | 45–75 min each; about 4–5 h on the clock |
| Review | 1 fresh Fable helper (2 if findings pass 150) | 1.5–2 h |
| Reproduction and pictures | the host | 2–4 h, by the number of real findings |
| Rounds to him | the host | at most four questions each; the number estimated after the host settles and groups (§6) — if 60–150 real findings stand, expect 10–25 rounds over weeks, unless he takes the lower-harm ones as a list |

About 16 helpers and 10–13 hours of work before the first round; a heavy job — the weekly allowance is read first and
he is told the figure. No walk is owed: nothing under the app's source changes; the app is run only to take pictures.

**If he wants it smaller, in the order to drop:**
1. slice 13 (tests and scenario lists) — the lapse fix's new brief rules cover future ones;
2. the *silent* and *told* readings in slices 11–12 on low-harm subjects — keep those on OIL, published records,
   permissions and who is told, and the 26 the rows themselves say were not told;
3. slice 10 and slice 8 (app-wide words, the Tracker) — lowest harm;
4. the drawings (kind a) — checked instead when each feature's design round next comes to him;
5. Fable's sampling of MATCH lines outside OIL, published records and permissions.
**The core that should not be dropped:** steps A and B, slices 1–5 and 9, the code-comment readings, Fable's read of every
finding and the host's reproduction — about 8 helpers and 6–7 hours.

## 9. Order of start

Step A and step B together → slices 1, 2, 3, 9 (highest harm) → 4, 5, 6, 7 → 8, 10, 11, 12, 13 → review as each batch
lands, so the first round (OIL, published records) can reach him before the last slices finish.

## 10. The red team, round 1 (two blind readers — Astra and a fresh Opus, 24 Nov 26)

Reports: `../briefs/2026-11-24-readings-plans-redteam-astra.md`, `…-redteam-opus.md`. Only what concerns this plan.

| Finding | Verdict | Where fixed |
|---|---|---|
| Astra must-fix; Opus S4 — "a told reading counts as MATCH" turns disclosure into approval; row-wide tagging | Accepted | §3 steps 5–6: each reading by itself, four standings; MATCH only on *approved*, with evidence of his answer; a mention in a closing report or evidence sheet is *never put*; step A's sort only orders work; slices 11–12 check *told* ones too |
| Astra must-fix — an engine difference loses finding status | Accepted | §5: a finding with its harm; the port rule limits edits, not detection |
| Astra should-fix; Opus M3 — rounds of 3–5 break the cap of four and cannot hold 60–150 findings | Accepted | §7: at most four; §6: the host settles what a ruling already answers, groups, then estimates the rounds; the combined list tracks every deferred item; §8 gives the honest range |
| Opus M3 — NO RULING so wide every string qualifies | Accepted | §3 step 6: only an item that states or enforces a rule |
| Opus S5 — no link back to the method fix | Accepted | §6: each real open reading marked in its row in that plan's §C1 form, once §C1 is live |
| Opus S6 — list 1 noisy with ported engine text | Accepted | §1 and step A: only the comments the port added |
| Opus M2; Astra (plan 1) — future drawings and words fall between the plans | Accepted as a boundary: that rule is the method-fix plan's to state, once (D2460); this plan covers what exists | the head of this plan |
| Counts — "his to change" 40 not 38; full rows 1,689 not about 1,780 | Accepted, re-counted | §1 |
| Astra — the counts are occurrences, not readings | Accepted | §1, said so |

None rejected.
