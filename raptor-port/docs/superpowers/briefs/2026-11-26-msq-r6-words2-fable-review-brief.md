# Round 6's two new designs — a second fresh Fable reviews and adjusts their words (chat 190, 26 Nov 26)

You are a fresh Fable (latest, high). You did not write or draw any of this. The owner is not technical and reads on
his iPhone; schedulers work mostly at a desk. The rule you serve: the words people read in the app are drafted, then a
different fresh Fable reviews and adjusts them before they reach him (D2441). Every reading of his words goes to him as
its own question with a worked example, never worded on silently (D2611).

## The two designs (each drawn by a different fresh Fable through the design skill, on the real app)
1. **The posting sheet, redesigned** (his D2648: "can we redesign this post out page. Likewise for leave war. It's so
   ugly"). Report: `raptor-port/docs/superpowers/briefs/2026-11-26-msq-r6-posting-sheet-report.md` (read its §4 and
   "After the host's look"). Words: `raptor-port/scripts/handpass/n176/words-r6-posting.mjs`. Pictures
   `raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/drawn/p6-*` (direction C recommended: `p6-{d,p}-C-war`,
   `-C-users`, `-C-war-overseas`, `-C-postin`; A and B for comparison). Script `draw-r6-posting.mjs` (and
   `draw-r6-posting-today.mjs` for today's, which needs no re-run).
2. **Admin → Users' order, folds and jumps** (his D2650, D2647, and his question about a left bar to jump to each
   heading). Report: `…/briefs/2026-11-26-msq-r6-users-nav-report.md` (its §7 lists every new word, §5 the open
   points). Words: `raptor-port/scripts/handpass/n176/words-r6-nav.mjs`. Pictures `drawn/j6-*` (direction A
   recommended). Script `draw-r6-nav.mjs` (`ONLY=149,142,mid,jump,fold,search`, `DIRS=A,B,p`).

Both reuse round 6's words (`words-r6-users.mjs`, already reviewed by a fresh Fable — its report
`…/briefs/2026-11-26-msq-r6-fable-review-report.md`); do not re-review those unless a new word now clashes with one.

## Where and how
- Folder `C:\Users\User\projects\Raptor-msq`, branch `claude/msq-b1-screens-135` (`git -C` it; never switch, commit
  or push). The served app is `http://localhost:4700/` (this folder's build; do not rebuild or stop it).
- Load the design skill first (Skill tool, `impeccable`, args `clarify — UX copy of two drawn designs, for a phone —
  target raptor-port`). A helper has nobody to ask: skip its questions to the user and say so.
- His rulings, full rows by the shell: `grep -h '^| D2648 |' .claude/decisions-full/*.md` — D2648, D2650, D2647,
  D2641, D2643, D2634, D2628, D2629, D2625, D300, D294, D1462, D2441, D2611. The People & accounts page
  `.claude/rules/decisions/people-accounts.md` §Many squadrons; the screen-design rulings `.claude/rules/decisions/design.md`;
  plain words `.claude/rules/plain-language.md`; the guide's lessons `raptor-port/docs/design-practices.md` §9.

## Do
1. **Every word new in these two designs** — the posting words marked NEW or newly placed (the titles "Post out" /
   "Post in" now in the sheet's head in place of the day, the label order, "To"), and every word in the nav report's
   §7 (the jumps, "Others" on the phone, the count written "People 60" against the heading's "People · 60", the fold
   marks, "also views 142", "On this page"). For each: **keep, or adjust**, with the reason in a few words. Watch for:
   the app's own names for things; one wording per fact across both designs and round 6; words that promise what the
   app will not do; what fits a 402px phone and a 375px one; a title that still tells him which day and which man.
2. **Apply your adjustments** to the two words files only, re-run the drawing script for each picture a change
   touches, and open every re-made picture (each `-crop`, cropped to what changed). No drawing may carry a word of its
   own. Do not redesign what he has ruled or what the designers drew; if you think a design choice is wrong in its
   words' meaning, say so in the report — do not redraw it.
3. **Name the readings** — any place a word decides something he has not ruled (for example "Others" on the phone, the
   title naming the act rather than the day) — each as one short question with an example and your recommendation,
   for the host to put on the page.

## Report
Write the whole report to `raptor-port/docs/superpowers/briefs/2026-11-26-msq-r6-words2-fable-review-report.md`:
each word kept or changed (old → new, why), the pictures re-made and opened, the readings for him (§3), anything found
and not fixed. Reply with a short summary (under 250 words).
