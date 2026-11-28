# [OIL-LATER-PASSES-ON] — scenario design brief (chat 210, 28 Nov 26)

SCENARIO DESIGN — blind, read-only. You are one of two designers; you will not see the other's list, and you must not
read HANDOFF.md, any evidence sheet under raptor-port/docs/handpass/, the red-team reports in
raptor-port/docs/superpowers/briefs/2026-11-27-oil-later-redteam-*.md, or the plan's own test list. Change no file.

Your job is to hunt for what is MISSING — the cases the builder did not think to test — not to review the code. You are
designing the walk of the running app (a person pressing real controls in the built app, phone and desktop) and the
break tests beside it.

## The repo and the change
Repo: the folder you are given, branch `claude/oil-later-209`. The change is the two commits on top of `main`
(`git log --oneline main..HEAD`; `git diff main...HEAD -- raptor-port/src`). The owner is not technical; the app is a
squadron's flying schedule. Each day has four sign-off boxes (CUR CK, SKED CK, PLANNED BY, APPROVED BY); a day is
published once all four are signed. A weekend or holiday day can earn OIL (time off banked) for people on an input
(a request such as a Training) whose OIL question is answered Yes. Pressing a sign-off box on a day with an unanswered
OIL question opens the day's OIL list before the name is recorded.

## The owner's rulings it builds (copied from the full rows)
- **D2800 (26 Nov 26):** "Later on a day's OIL list means 'not my call': each next press of any of the day's four
  sign-off boxes opens the list again until someone answers; an OIL answer does not clear the names already signed; Save
  with rows left unpicked leaves them as Later does." His use: a scheduler without authority presses Later, so
  management, signing a later box (usually APPROVED BY), sees the question and answers it.
- **D2801 (26 Nov 26), as narrowed and widened by D2868 and D2869:** the answer to an OIL question leaves the names
  already signed whether it is given on the sign-off list, on the input's own "OIL?" sign or from a bell line.
- **D2868 (27 Nov 26):** "On a published day too, the answer to an OIL question that stood open when the names were
  signed leaves them signed; the day still shows the change waiting until the amendment is published." Narrows D103
  ("any change that shows as pending wipes the sign-offs") and AM11 for that one answer.
- **D2869 (27 Nov 26):** "An OIL answer changed after a name was signed clears the names signed over it; only the
  answer to a question that stood open when they signed leaves them." The door it is given at does not matter. His
  question was put as: all four have signed; then Saber changes his own No to Yes — the names are cleared.
- **D2859 + D2867 — the list's foot line:** no answer picked: "Later: Ace signs, and the next sign-off asks again";
  some picked (not all): "Save: the next sign-off asks the rest"; on the last of the four boxes with none picked:
  "Later: Ace signs, and OIL stays unanswered for now"; on the last box with some picked: "Save: the rest stays
  unanswered for now"; every row picked: no line. Later pressed after picks throws them away and saves nothing.
  (Ace = whoever is signing.)
- Unchanged and still in force: ✕ or Escape on the list signs nothing, and the next press asks again (D2299); a
  missing time refuses a signature first ([END-TIME-GUARD]); the publish note names an input left unanswered at
  publish (D2294); any OTHER change on a published day wipes the sign-offs, and putting it back restores them (D103,
  AM11); a Logic-page value change that moves someone's OIL the names were signed over clears them (D592 (4)).
- **The host's readings (treat as questions, not requirements):** (a) an answer to a question open at signing,
  answered and then changed again before anyone re-signs, still leaves those names (they were never signed over an
  answer); (b) Save writes the answers before the held name, so the last signer's own answer is one his name was signed
  over — a later change to it takes his name down while the Later names stay.

## Area rulings to read
`.claude/rules/decisions/oil.md`, `.claude/rules/decisions/scheduler.md` (the sign-off and published-day lines). A
ruling's full row: `grep -h '^| D2869 |' .claude/decisions-full/*.md`. Note: these rulings may be newer than the
copy you hold; the text above is authoritative for D2800–D2869.

## Not a finding (D56)
A problem that lives only in data already stored (for example a signature given by an older build reading unsigned
once) is not a finding: the demo data is cleared before the database step. Only if new data would be hurt too is it
real.

## What to hand back
A numbered list of scenarios, most valuable first, at most 30. Each: **the setup** (what day, which inputs, who signs
which box and how, published or not), **the steps** a person takes in the app (which screen, which control), and an
**EXPECTED** line naming its source (a ruling above, or "RECORD exactly what it shows" where no ruling settles it).
Cover every place a sign-off box is drawn (the Scheduler Board day, Edit Schedule's week, the phone board) and every
door an OIL answer can be given at (the sign-off list, the input window's "OIL?", the Inputs page's OIL decision, a bell
line, a member answering his own input), saved plans of a day, Undo and Redo, a several-day input, a published version
loaded back, the count of changes waiting and the publish button. Mark each scenario WALK (pressed in the app) or TEST
(a break test in code). State each scenario the moment you have it. End with a list of anything in the rulings you
believe contradicts itself or that the build cannot satisfy.
