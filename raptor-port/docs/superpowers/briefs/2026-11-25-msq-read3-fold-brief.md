# [MSQ-PICK-GUARD] Build 1's plan — folding the third and last read in, as §20 (chat 187, 25 Nov 26)

You are a fresh Fable helper (high risk: the squadron guard, permissions, saved records). The plan's third blind read is
done — four readers, each blind to the others. The cap on review rounds is three: there is no fourth round. Your job is
to fold every finding into the plan so it says what will be built, ready for the owner's go. You write ONE file:
`raptor-port/docs/superpowers/plans/2026-11-25-msq-pick-guard-build1.md`, in `C:\Users\User\projects\Raptor-msq`
(branch `claude/msq-b1-screens-135`), by full path — your shell may start in another folder, which you must not write
to. Change nothing under `raptor-port/src`; commit, push and press nothing; do not touch
`raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/` (another helper is redrawing pictures there, and the host owns
the questions page).

## What to fold
1. **The four round-3 reports, whole:** `raptor-port/docs/superpowers/briefs/2026-11-25-msq-pick-guard-build1-read3-{astra,opus,fable,security}.md`.
   The weightiest, as the host summarised them (the reports win): HIGH — `mayGivePlanOf` passes an admin moved into the
   squadron who is only its member there (security S1, Fable 4: judge by `adminNow` and home that day, on the rows
   before the command); the Inputs List's pinned row carries his own 142 input onto 149's page after a pick (Opus F-e);
   Undo can end or lower Plan after its maker lost the right (Astra, security S4, Fable 3 — HIGH by two readers);
   hiding a foreign man's fields does not narrow what Save sends (Astra: a foreign row's save carries only the page
   squadron's access line, re-checked at Save); the Calendar's imported holiday sheet missing from the guard (Astra,
   conditional on E1). MEDIUM — page and plan disagree on E4, E5, E6, E7, E9 (Fable 1, Opus F-i); the new bell lines
   need gate rules (S2); the SANS reminder's line lands a Plan holder on another squadron's SANS calendar (Fable 2);
   D2621 must not apply on his home page (Fable 5); bug reports' home, Undo and gate (S5, Fable 6, Opus F-f); Quals'
   "Add qualification" box is typed work (Opus F-c); folding a heading or the Add form throws away a change (Opus F-h);
   the new lines' taps (Fable 8, Opus F-g). Every finding gets a verdict — taken (where in the body), taken in part, or
   judged false (with the reason, checked against today's code on this branch, never from a report alone).
2. **The questions page's design review, done tonight:** `raptor-port/docs/superpowers/briefs/2026-11-25-msq-q3-page-fable-review-report.md`
   — its §6.2 (page against plan: the plan must take the page's recommendations, each shaped for either answer —
   E4, E5, E6, E7, E9b, N9 closed — and the new items: E1's settings-window rule, D5's opened row, D10 answering V-Q4,
   E8 answering V-Q1 by retiring the tick, D8's bell line at the add) and its §6.5–§6.6. The page's recommendations
   are still **unanswered** by the owner: fold each as a switch point shaped for either answer, the page's
   recommendation marked as the default the build takes on "as recommended" — never as his ruling.
3. **The second words review:** `raptor-port/docs/superpowers/briefs/2026-11-25-msq-q3-r5b-words-fable.md` — its
   adjusted words go into the words table marked `[WNS]` (drafts until he approves them); its "What still has no words"
   list becomes the plan's list of words to draw before the build (D1625). Its gap 2a is a real fault in joining the
   refusal leads to "then press Undo again": fold its fix.
4. **Three new questions for him** (they go on the page after this fold; the host words them): a Plan holder passing
   Plan on in two steps (security S3); "Add a person" on 149's page offering 142 and 150 as Home (Opus F-a, against
   D2622); the search matching a hidden sign-in on another squadron's page (Opus F-b). Write each in the plan as a
   switch point with its recommendation and the case it rests on, so the host can put them.

## How
- Fold into the body where each is built (the doors, the words table, the tests, the twin paths, §7, §10, §13, §14),
  not as notes on top. Then add **§20 — the third read, folded (25 Nov 26)**: a table, one row per finding — reader and
  number, severity, verdict, where it now lives. Shorten §15 and §16 to a line each pointing at the body where they only
  narrate what the body says; keep every finding's substance. Drop no rule.
- **The security reader's S1 fix** gets one more read by the security reader alone, as a check of that fix only (the
  host's reading of D1411 — tell the host which lines it should read).
- His rulings, full rows: `grep -h '^| D2626 |' .claude/decisions-full/*.md` (the shell; the Grep tool hides long rows).
  The ones this touches most: D2403, D2405, D2590–D2599, D2620–D2637, D2191, D2306, D2270. Nothing is built on a
  reading of his words: name each **(reading)** so the host puts it to him (his D2611 — on another branch, binding now:
  a reading goes to him as its own question with a worked example).
- Re-estimate §13's size if the fold moves it, and say by how much.
- §10's closing step keeps D2636: the first report after Build 1 reminds him of group B and builds none of it.

## Report
Return as your final reply (no report file): what each finding's verdict was (the §20 table, short); the findings you
judged false and why; what moved in the size; the three new questions as you wrote them; the lines for the security
reader's check of S1; anything you could not settle.
