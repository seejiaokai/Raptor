# The guard rail's questions page, round 5 — a fresh Fable's design review and red team (chat 187, 25 Nov 26)

He asked, before answering the page: *"a fresh Fable reviews the round-5 questions page and its drawings through the
design skill (/impeccable) — critique for my phone, red-team every recommendation against my rulings and against Build
1's plan, fix in one batch, republish at the same link — before I answer it."* You are that fresh Fable. You did not
write this page, its drawings or its recommendations; read them cold. The host republishes; you fix.

## Who he is
The owner of RAPTOR, a squadron scheduling app (multi-squadron: 142, 149 and, on this page, 150). He is not technical.
He answers this page on his iPhone, often over Remote Control. Every word you write for him follows
`.claude/rules/plain-language.md` and `.claude/rules/decisions/how-we-work.md` §Showing him, asking him: plain words, the
app's own names, when it happens in real life first (who, doing what, how often), a worked example, a recommendation,
a picture of the real app cut to what the question is about; no ruling numbers, review codes or record words in the
text; an action never written as if it were a person.

## What to read (in `C:\Users\User\projects\Raptor-msq`, branch `claude/msq-b1-screens-135` — use `git -C`)
- **The page:** `raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/page.html` — live, unchanged, at
  https://claude.ai/artifact/QpPTfwiib8u5Mao2GoEXYB. Pictures beside it: `today/`, `drawn/`, and `q2/…` (the q2 page's
  pictures, at `raptor-port/docs/mock/2026-11-25-msq-pick-guard-q2/`). **Open every picture a question rests on** (the
  Read tool shows images) — the drawings are half of what he asked you to review: is each cut to what matters, legible
  on a phone, the change plainly marked, the words in it the same as the page's words, nothing drawn that he ruled
  otherwise? The words used in the drawings: `raptor-port/scripts/handpass/n176/words.mjs`; how each was drawn:
  `raptor-port/scripts/handpass/n176/draw-*.mjs`; the drawer's report `raptor-port/docs/superpowers/briefs/2026-11-25-msq-q3-draw-report.md`;
  the fresh Fable word reviews `…/2026-11-25-msq-q3-words-fable.md`, `…-words2-fable.md`; the presser's facts
  `…/2026-11-25-msq-q3-press-k.md`.
- **Build 1's plan:** `raptor-port/docs/superpowers/plans/2026-11-25-msq-pick-guard-build1.md` — large; read §8 (the
  questions), §17 (his answers folded, with the readings and clashes), §18 (Part G, what rides Build 1), §19 (Build 1V);
  search the rest by heading.
- **The plan's third read, all four reports** (they already name places where page and plan disagree — check them, do
  not take them on trust): `raptor-port/docs/superpowers/briefs/2026-11-25-msq-pick-guard-build1-read3-{astra,opus,fable,security}.md`.
  In particular Fable 1 and Opus F-i (the page and the plan disagree on E4, E5, E6, E7, E9; N9 closed), Fable 2 (the SANS
  reminder line), Opus F-a, F-b and security S3 (three new questions for him — these go on the page later, after the
  plan's fold; do not add them now, but say if any changes a recommendation already on the page).
- **His rulings, full rows** (`grep -h '^| D2596 |' .claude/decisions-full/*.md`, one number at a time or a range
  pattern): D2402, D2403, D2405, D2590–D2599, D2620–D2637 — today's answers to rounds 3 and 4 are D2620–D2636. And
  the area pages: `.claude/rules/decisions/people-accounts.md` (§Many squadrons and the guard-rail lines),
  `.claude/rules/decisions/design.md`, `.claude/rules/ui-design.md`, `raptor-port/docs/design-practices.md` (by heading).
- **One rule from another branch that binds this page (his D2611, not yet on this branch):** until the checking fix of
  the readings review is live, *a reading of his words* — anything the plan or page understands him to mean where he did
  not say — *goes to him as its own question with a worked example, never built or worded on.* His D2610 adds: *a
  low-harm question comes in one list he can take whole, never round after round.* E9 bundles ten readings in one item
  with no examples, and "D" items carry readings too (e.g. E9's "the fade runs at a move at midnight"; D5's "None stays
  lit"). Judge the page against both rules.

## Your job
1. **Red team every recommendation on the page** (E1–E9, D1–D12, the "Told" boxes, the two "Found at the last page's
   review" lines; group B only where it now clashes with something): is it what he ruled, or a reading presented as his
   rule? Does it agree with Build 1's plan as it stands (§17–§19)? Is it the right design for him — intuitive, the same
   everywhere, fewer places for a bug (his D754), worked through to the second and third step (D2140)? Is any fact on the
   page stated unchecked or contradicted by the presser's facts or the reads? A finding needs a concrete case (a named
   person, a press, what goes wrong) and its fix.
2. **The page as a page, on his iPhone** — load the design skill first: call the Skill tool with skill `impeccable`,
   and apply its critique (critique / clarify / distill) to this page as an interface he answers from a phone at
   about 390px wide: what he reads first, order, density, how each question and its pictures sit together, the reply
   bar, the films, what could be cut without losing a question, a fact, a reason or a consequence. Keep his standing
   page rules: what to look at now at the very top, one line a question with its recommendation (D1237, D1363); only
   what is new since the last round highlighted (D2159) — this round everything is new, so say how that should show;
   plain words, no codes (D2164); every question first says when it happens (D2439); pictures for a question show only
   what it is about (D1222) and are the device the question is about (D1951).
3. **The drawings:** for each, keep / fix. A fix names the drawing, what is wrong, and exactly what the redraw changes
   (words, crop, mark, size) — an Opus drawer will redraw from your list with the scripts above; you do not redraw.
4. **Fix the page in one batch:** write the improved page, complete and self-contained (the same head, styles, reply bar
   and script as today's page, improved as you judge), to
   `raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/page-r5b.html` — the only file you may create or change in the
   repository. Pictures by the same relative paths. Never drop a question or a fact; where you change a recommendation,
   mark it on the page in the existing "changed in review" style and say why in one plain line beside it; where a
   drawing is to be redrawn, keep the old picture and put the drawer's note in an HTML comment beside it.

## Limits
Change nothing in the repository but that one new file; commit and push nothing; publish nothing; do not start or
rebuild the app. The words you propose for screens are drafts for him to approve. Use the shell's `grep` for the full
rows (the Grep tool hides long lines).

## Report
Write the full report to
`C:\Users\User\AppData\Local\Temp\claude\37df10f156419f1e\38887e70-46fe-4e07-a4f2-4602e03ccf9c\scratchpad\fable-review\report.md`
and return the same text as your final reply: (1) each recommendation you would change, with case, reason, cost and the
ruling or plan section it rests on; (2) the ones you agree with, one line each; (3) the readings found on the page and how
you put them (by D2611 / D2610); (4) the page critique and what `page-r5b.html` changes; (5) the drawings: keep / fix
list, each fix exact; (6) anything the page misses or states wrongly.
