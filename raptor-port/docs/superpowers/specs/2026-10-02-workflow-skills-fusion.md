# Five recommended skills, read at the source — what we fuse, where, and what we skip (D486, 2 Oct 26)

**The ruling (D486):** of the five skills the article recommends, none is installed whole; their best practices are
fused into our own guides — the harder questioning into the planning step, and a one-off code-tidiness audit before
the database step, delivered as a report for him to rule on. Open jobs: `OUTSTANDING.md` `[SKILL-FUSION]`,
`[CODE-TIDY-AUDIT]`. **Nothing here is built yet.** §1–§2 are what he agreed; §3–§5 are PROPOSALS from the source
read, each marked — not ruled until he says so.

**The article:** codelynx.dev/posts/best-skills-to-code-with-ai — its order: Grill Me → APEX → Impeccable → Make
Interfaces Feel Better → Thermo-Nuclear Code Quality Review.

**What was read (2 Oct 26, each repo's default branch that day, the skill's own text — not the article's summary):**

| Skill | Source | Licence | Size |
|---|---|---|---|
| Grill Me | `mattpocock/skills` — `skills/productivity/grill-me/SKILL.md` (one line: "call `grilling`") and `skills/productivity/grilling/SKILL.md` | MIT | 28 lines |
| APEX | `melvynx/aiblueprint` — `agents-config/skills/apex/SKILL.md`, and of its 16 step files `step-01-analyze`, `step-05-examine`, `step-10-verify` (the other 13 NOT read) | none stated on the repo | 28 + ~220 lines read |
| Impeccable | already vendored here, v4.1.1 (`.claude/skills/IMPECCABLE-VENDORED.md`) | Apache 2.0 | — |
| Make Interfaces Feel Better | `jakubkrehel/make-interfaces-feel-better` — `SKILL.md` (its five reference files — typography, surfaces, animations, icons, performance — NOT read) | MIT | 187 lines |
| Thermo-Nuclear Code Quality Review | `cursor/plugins` — `thermos/skills/thermo-nuclear-code-quality-review/SKILL.md`, its sibling `thermo-nuclear-review`, the `thermos` wrapper and the code-quality subagent | MIT (`thermos/LICENSE`, © 2026 Cursor) | 192 + 95 lines |

A fused passage that copies wording from an MIT source carries its credit line in the guide's vendoring note
(`SUPERPOWERS-VENDORED.md` change 3 is the pattern). APEX states no licence: take ideas from it, never its text.

**Why not wholesale (the reasoning he agreed):** each installed skill is one more instruction competing with the
rules already in force (plain language, the bug-check order, "merge live"); APEX in particular would give a chat a
second, lighter way to call work tested. And the source read found that three of the five are NOT what the article
says they are — see each section.

---

## 1. The harder questioning → the planning step (`.claude/skills/brainstorming/SKILL.md`) — AGREED

**What the source really is.** Not "relentless questions". It is one method: treat the plan as a TREE of decisions,
each decision hanging off the ones before it; ask, in one ROUND, every question that can be asked now without
guessing an answer not yet given; give a recommended answer with each; wait; the answers unblock the next round;
finish only when no branch is left silently assumed. Facts are never asked of the person — the agent looks them up,
and does not hold the other questions while it looks.

**What our planning step already does:** explores first; asks; proposes two or three approaches with a
recommendation; a hard stop before any build until he approves. **What it lacks:** a rule for WHEN the questioning
is finished, and a recommended answer on every question. And one clash: it says ONE question per message — the
source says the whole round at once.

**The fusion (five lines' worth, into "Understanding the idea"):**
1. **Map the decisions as a tree before the first question**, and say how many branches there are.
2. **Search the rulings first** (`record-decisions.md` §Read it before you ask him anything, D53): a branch he has
   already ruled is CLOSED, cited by number, never asked again. This is ours; the source has no memory.
3. **Ask by rounds, not one at a time:** every question that depends on no open answer goes in one message — at
   most four (the question tool's limit, and a phone screen), each with the recommended answer first and one line
   of consequence. He already answers this way ("i agree with all"; four answers to one look card). A question that
   depends on another still open waits for the next round. *This replaces upstream's "only one question per
   message" for him.*
4. **Only product choices go to him** (`plain-language.md`): a technical branch the agent decides and states, with
   its reason; a fact the agent looks up.
5. **Done means the tree is empty:** the design lists every branch with who settled it — his ruling (number), his
   answer this round, or the agent's call (reason). A branch with none of the three is the stop sign.

**Not taken:** the source's emoji question format; its sub-agent for every fact (ours reads the file itself unless
the search is wide).

## 2. The code-tidiness audit → a one-off report before the database step — AGREED

**What the source really is.** A reviewer's rubric for ONE CHANGE (a pull request's diff), not an audit of a whole
app: is there a restructure that makes whole branches, helpers or layers DISAPPEAR while behaviour stays the same
(its "code judo"); did this change push a file past 1,000 lines; did it bolt a special case into a busy flow; did it
write a new helper where one exists; is the logic in the layer that owns it. It demands a FEW high-conviction
findings over a long list, and its remedy order starts with deleting, not rearranging.

**So the one-off audit is our adaptation of it** — the same questions put to the standing code:

- **Scope, by evidence, not by reading everything.** The app's code without tests is about 6.6 MB — roughly 1.7
  million tokens to read once. Nineteen files are over 1,000 lines, and the largest are also the most changed
  (commits touching each in the 30 days to 2 Oct 26):

  | File | Lines | Changes in 30 days |
  |---|---|---|
  | `src/tracker/app/core.js` | 6,666 | 83 |
  | `src/ui/scheduler.css` | 6,684 | 70 |
  | `src/leavewar/state/store.ts` | 4,644 | 60 |
  | `src/leavewar/ui/Matrix.tsx` | 4,701 | 46 |
  | `src/ui/html.ts` | 2,240 | 60 |
  | `src/engine/publish.ts` | 1,471 | 60 |
  | `src/leavewar/sync.ts` | 2,070 | 56 |
  | `src/state/store.ts` | under 1,000 | 63 |

  The audit reads the files that are BOTH large and often changed, largest first, and stops there.
- **The reader:** one, Astra first (D353 — a side question; it runs on his ChatGPT account, so it is light work
  under D484). Never the model that wrote the code (D67).
- **The brief carries:** the source's questions; D56 (a problem only in stored demo data is not a finding); the
  architecture already ruled — one command layer over stable ids (`raptor-port/CLAUDE.md`), D144 (architecture
  first); "report at most ten, each one a restructure that DELETES something"; and for each: what disappears, what
  must behave the same, the tests that already pin that behaviour, the ones that would have to be written first,
  and the bug-check tier the restructure would need.
- **What comes back to him:** a short plain-words report, ranked by what it saves against what it risks. **Nothing
  is restructured on the audit's word** — each restructure is his call, is built with related work (D485), and
  gets the check its size needs. A restructure of the published record, earned leave, permissions or saved data is
  FULL tier like any other change there.
- **Placed:** before `[DB-STEP]` (D473 — the table format is written from this code, so its shape should be
  settled first).

**His question — would this cut the code and so save tokens on checks and reviews?** Partly, and less than it
sounds:
- **It saves on BUILDING and on the CODE READS.** To change one line in a 4,700-line file, the builder and each
  reviewer load the whole file — about 60,000 tokens a time, and the big files are opened most. Splitting a file by
  job saves more than deleting lines: the reader opens only the part that matters.
- **It does not touch the biggest cost.** The walkers — who click through the built app and read no code — cost
  about 1.9 million tokens for one full check (D476). Batching the checks (D485) and the cheaper-walker trial
  (D480) are where that is saved.
- **The restructure itself costs.** Splitting a large file is a real change with a real bug check. It pays back
  only on files that keep being changed — which is why the audit ranks by change count.
- **The cheap, lasting half is the guard in §3**, not the audit.

## 3. PROPOSAL — the same rubric as a standing guard on every change (not yet ruled)

The source is built for this, and it costs almost nothing: the final code read is already reading the change. Three
lines added to the reviewer's brief in `raptor-port/docs/bug-check-order.md` §4, reported as their own short list
so they never crowd out a defect:
- did this change push a file past 1,000 lines, or grow one already past it by more than about 100 — could the new
  part live in its own file;
- did it add a special case inside an already busy flow, where the rule belongs in one place;
- did it write a new helper where the app already has one.

A finding here is never a blocker by itself (the source makes it one; for us only a defect blocks) — it is filed,
or fixed if small. This is what stops the large files growing back after an audit.

## 4. PROPOSAL — five items from Make Interfaces Feel Better, as a checklist beside Impeccable (not yet ruled)

**What the source really is.** Nineteen concrete rules, most about motion and icons in a different kind of app
(Tailwind and an animation library, which this app does not use — *corrected 2 Oct 26 by Astra's review: this line first said the app mostly does not use React; it does, in about 170 files, and the source also supports plain stylesheets*). Installing it whole would bring
rules that do not apply. Five do, and matter on his iPhone:
- **equal-width digits on any number that changes or sits in a column** (hours, counts, OIL balances) — the app
  uses this in 5 files today, so most tables do not have it;
- **a tap target of at least 44 × 44 on a phone**, never two overlapping;
- **never animate "all"** — name the properties (the app has none today: keep it so);
- **no animation on something done many times a minute** (moving a puck), and motion never the only signal;
- **a nested rounded corner = the inner corner plus the gap.**

And its report shape, worth taking for any look-and-feel review: a table of what WAS and was NOT inspected, and a
short "considered but rejected" list — the same honesty as the roll-call's "no blank cells".
It never changes a look he approved from a mock-up: a finding against an approved picture goes to him.
**The buttons keep their size (D487, 2 Oct 26 — "im ok with how the size of the buttons are now"):** these checks REPORT, they
never resize. A control that is hard to hit on a phone is offered a larger invisible touch area around a button that looks
the same; any visible change is a picture to him first.

## 5. PROPOSAL — three ideas from APEX the bug-check order does not say in so many words (not yet ruled)

APEX stays uninstalled: it is a whole second build-and-check workflow with its own saved state, and ours is
stricter where it counts (the roll-call; the walk before the inspection; two readers on risky work). Three of its
sentences are sharper than ours and could each become one line in `bug-check-order.md`:
- **"Evidence is spent by a later change"** — a picture or a passed check taken before a fix proves nothing about
  the build after it (ours says re-walk what the fixes touched; this says why, and covers the gates too).
- **"A weaker kind of evidence never proves a stronger claim"** — a code read cannot stand in for a test, nor a
  test for a walk (ours says it by anti-pattern; this is the rule under it).
- **Before planning, every important statement is marked Verified / Assumed / Unknown** — the planning step's
  version of "a code comment is never evidence".

## 6. How it gets built

1. `[SKILL-FUSION]` — §1, and whichever of §3–§5 he approves: a documents-only change to the planning skill and
   the order. After the reset (D484), a fresh chat, its own branch, Opus 5.5. Both Fable and Astra read the changed
   guide before he approves it (D70); upstream text copied gets its credit line.
2. `[CODE-TIDY-AUDIT]` — §2: Astra's read can run before the reset (D484 allows what Astra can do); the report to
   him; each restructure he approves becomes its own backlog item.

## 7. Astra's review of the three proposals (2 Oct 26 — asked for by him before he answers)

One read-only run (`gpt-5.6-sol`, high reasoning); its report, whole: `raptor-port/docs/superpowers/briefs/2026-10-02-skills-fusion-astra-review.md`.
The host checked its main claims against the files (the phone top bar's measured contract in `scheduler.css`; Impeccable's
own 44 × 44 check; the order's §3 sentence on evidence; React's use) — each held. **The host agrees with all three verdicts.**

| Proposal | Astra | What changes |
|---|---|---|
| §3 the tidiness guard | **Adopt with changes** | Drop the "1,000 lines, or about 100 more" numbers — the second was this spec's invention, and a number becomes a target (D141). Ask instead three things of the CHANGED lines only: a new responsibility put into an already busy file; a feature-only branch put into a shared flow; a helper that already exists. Never applied to `src/engine/` (verbatim ports — no tidying). No extra reader (D353). A note is FILED for his ruling, never fixed during the final read — a fix there spends that read's evidence. Astra's wording and its place (the order's §4) are in its report. |
| §4 the look-and-feel checks | **Adopt with changes** | Impeccable already checks tap targets under 44 × 44, tabular digits and motion. New are only: never animate "all"; the nested-corner rule; and the honest report shape. **A control under 44 is NOT a finding by measurement alone** — the phone's top bar is deliberately 30 high so it fits one row (his own ruling of 24 Aug 26), and an invisible larger touch area there would overlap its neighbours. Only a demonstrated missed tap or an overlap is reported (D487 stands). Two real candidates found for equal-width digits: the Leave War's manning counts, and the Tracker's Complete / Done / Remaining figures — to be looked at on screen, not yet confirmed. |
| §5 the three evidence rules | **Reject** | All three are already said: fresh evidence (`verification-before-completion`), a weaker check never standing in for a stronger (the order's §3), fixes followed by gates and a re-walk (the order's §5), checked against assumed (`raptor-port/CLAUDE.md` §Product bar). Repeating them adds words, not protection. **Withdrawn by the host.** |

**One better fusion Astra found, from APEX (a fourth proposal, not yet ruled):** one sentence in the order's §4 — a reviewer's
claim is not a finding unless it names a concrete way it fails (or the ruling it breaks), the changed code that causes it,
and the smallest safe fix; a style preference or a guess is not a finding. It cuts false findings, which cost his time.

**HIS ANSWER (D489, 2 Oct 26 — "1. yes"):** the guard as Astra rewrote it, the narrowed look-and-feel checks, and Astra's
"what counts as a finding" rule are APPROVED — what goes in; the wording is still read by Fable and Astra and approved by him
(D70). The evidence rules (§5) are not added. §3 and §4 above are as first proposed: build from this section and Astra's report.

**Other corrections from the review:** the source asks for equal-width digits only on numbers that CHANGE (extending it to
every column was this spec's); APEX has a fourth label, "untrusted", that §5 left out. Every measurement in §2 was re-checked
by Astra and is right.
