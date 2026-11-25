# The guard rail's questions page, version 3 — a fresh Fable's review, red team and design read (chat 175, 25 Nov 26)

He asked: *"fable can u review the artifact on what we have discussed so far and what do u think makes more sense and feel
free to improve it, red team it and suggest. including using /impeccable for design improvement. user interface"*.
You are that fresh Fable. You did not write this page or its recommendations; read it cold.

## Who he is
The owner of RAPTOR, a squadron scheduling app (multi-squadron now: squadrons 142 and 149 in the demo). He is not
technical. He answers questions on this page from his iPhone, often over Remote Control. Read
`.claude/rules/plain-language.md` and `.claude/rules/decisions/how-we-work.md` §Showing him, asking him — every word you
propose for him follows them: plain words, the app's own names, a worked example, a recommendation, a picture.

## What to read (in `C:\Users\User\projects\Raptor-msq`, branch `claude/msq-b1-screens-135`)
- The page: `raptor-port/docs/mock/2026-11-25-msq-pick-guard-q2/page.html` (published as
  https://claude.ai/artifact/QpPTfwiib8u5Mao2GoEXYB, version 3), its pictures in `today/` and `drawn/` beside it — open the
  pictures a question rests on.
- His rulings of today, full rows: `grep -h '^| D259[6-9] \|^| D262[0-4] |' .claude/decisions-full/*.md` — D2596, D2597
  (windows with nothing to edit close by themselves at a pick), D2598 (Admin → Users' half-done states count; "Add a
  person" gets a Cancel that clears everything), D2599 ("Add a person" at the top of Admin → Users), D2620 (the squadron
  number at the top left flashes twice, fading, whenever the squadron changes), D2621 (A17: another squadron's Inputs page
  never lists his own inputs; a bell line switches first), D2622 (separate squadrons, separate views, unless a man is
  deliberately planned onto another), D2623 (bug reports one list, split by squadron for an admin), D2624 (C1: every bell
  line wears its squadron number when more than one squadron is shown). And the guard rail's own: D2403, D2405,
  D2590–D2595.
- The People & accounts page `.claude/rules/decisions/people-accounts.md` (§Many squadrons and the guard-rail lines),
  the screen-design rulings `.claude/rules/decisions/design.md`, `.claude/rules/ui-design.md`,
  `raptor-port/docs/design-practices.md` (search it by heading; do not read it whole).
- The evidence behind group C: `raptor-port/docs/superpowers/briefs/2026-11-25-msq-separate-views-rollcall-code.md`,
  `…-rollcall-rulings.md`, `…-press-p6.md`.

## Still open in the chat (not on the page yet)
1. He floated a colour code for the bell instead of numbers: a colour on the left of each line, each squadron's "Show"
   button a matching colour. The agent recommended plain numbers (colour already means input type, warning, unread here;
   colour needs a key; colour cannot stand alone; each squadron would need a colour setting), with a middle option — the
   grey number softly tinted by squadron, its Show button the same — and offered to draw both.
2. C5: he asked whether each bug report's title line should simply carry its squadron number. The agent agreed (one list,
   newest first, the bell's grey number style) and asked whether each squadron's admins see only their own reports (a
   master admin all) or every admin sees all, each tagged.
3. D2620's readings, not yet put: does the number flash at sign-in too, with less motion on, its timing.
4. Not yet drawn: "Add a person" at the top with its Cancel; the flash; the bell numbers; the badge (C7).

## Your job
1. **Red team** every open recommendation on the page (groups C, A and B) and items 1–3 above: is it the right design
   for him (intuitive, the same everywhere, fewer places for a bug — his D754), does it contradict any of his rulings,
   does it lose anything, is there a simpler shape? Say where you agree and where you would recommend differently, with
   the reason and the cost. A finding needs a concrete case (a named person, a press, what goes wrong).
2. **The page as a page** — load the design skill: call the Skill tool with skill `impeccable` (a project skill), and
   apply its critique to this questions page as an interface for him on an iPhone: order, what he reads first, wording,
   density, how a question and its picture sit together, what could be cut. Keep his standing page rules (what to look at
   first at the very top, one line a question with its recommendation, new-since-last-round highlighted, plain words, no
   ruling numbers or codes in the text — D1237, D1363, D2159, D2164).
3. **The app's interface for what is coming** — with the same skill, suggest the best look for the things he has ruled
   and that will be drawn: the bell's squadron number on every line (and your view on colour), the squadron number's two
   fades at the top left, "Add a person" at the top with Cancel, the name badge naming View or Plan, the bug report's
   squadron mark. Within the app's own look (`raptor-port/docs/design-practices.md`, `.claude/rules/decisions/design.md`:
   no glow, one mark one look, smooth motion, his iPhone).
4. **Improve it:** write an improved version of the page to
   `C:\Users\User\AppData\Local\Temp\claude\e2bface01731fdd2\3f35f52f-80e8-41e0-a951-e8a0fa3cf3ab\scratchpad\fable-review\page.html`
   (pictures referenced by the same relative paths `today/…`, `drawn/…`; do not copy them). Change wording, order and
   layout as you judge best; never drop a question or a fact; mark anything you would change in a recommendation so the
   host can see it.

## Limits
Read-only in the repository: change no file there, commit and push nothing, do not publish any artifact, do not start or
rebuild the app (an app served at http://localhost:4700/ may be used to look, read-only, if you need it). The words you
propose for screens are drafts for him to approve.

## Report
Write the full report to
`C:\Users\User\AppData\Local\Temp\claude\e2bface01731fdd2\3f35f52f-80e8-41e0-a951-e8a0fa3cf3ab\scratchpad\fable-review\report.md`
and return the same text as your final reply: (1) the recommendations you would change, each with case, reason, cost;
(2) the ones you agree with, one line each; (3) the page critique and what your improved page changes; (4) the interface
suggestions for the coming pieces; (5) anything the page misses.
