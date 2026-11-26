# Admin → Users across squadrons, designed nicely — the new order, the folds and a jump bar (a fresh Fable; chat 188, 26 Nov 26)

You are a fresh Fable (latest, high). His words, through the design skill: *"could you think of a way to design it
nicely?"* — "it" is Admin → Users as he has just ruled it, with a way to jump to each heading. He is not technical,
reads on an iPhone; schedulers work mostly at a desk (D820). You design and draw on the real app; you build nothing.

## His rulings this hour (full rows by the shell: `grep -h '^| D2650 |' .claude/decisions-full/*.md`)
- **D2650:** the squadron's own people first, then Incoming and Outgoing, then "From other squadrons"; each of those
  three a heading that folds, open by default. Its readings in the row (the other squadrons' headings stay folded, D2628;
  "View only" one folded line; Outgoing before Incoming as he wrote; a folded heading keeps its count) are the agent's,
  to put to him — draw them that way and say so.
- **D2647:** one search box at the very top, filtering every group; a group with no match hides.
- **His question, answered with a recommendation, not ruled:** "Is there a way to kind of have a way to navigate with a
  left bar where you click to go directly to the title?" The host recommended: on a desktop, the page's headings listed
  under "Users" in Admin's own left column (Users · Squadrons · Squadron config · Data · Display), one click jumping there,
  the one in view lit as he scrolls; on a phone, a row of small jump buttons under the search ("People 60 · Incoming 1 ·
  Outgoing 1 · Other squadrons 4"), a tap jumping there and opening it if folded. Better ideas welcome — that is the job.
- Also: D2641, D2643, D2625, D2628, D2629, D2635, D2646, D2649; the People & accounts page
  `.claude/rules/decisions/people-accounts.md` §Many squadrons; the screen-design rulings `.claude/rules/decisions/design.md`
  (nothing pinned leaks, one mark one look, no glow, a page's controls one row); the guide
  `raptor-port/docs/design-practices.md` §9 (lessons 68, 103, 104).

## Where and how
- Folder `C:\Users\User\projects\Raptor-msq`, branch `claude/msq-b1-screens-135` (`git -C`; never switch, commit or push).
- Load the design skill first: Skill tool, `impeccable`, args `shape and design Admin → Users' navigation for many squadrons — target raptor-port`; Operate mode.
- The served app `http://localhost:4700/` (this folder's `dist`; check first; do not rebuild or stop it). The round-6
  drawings and their script you build on: `raptor-port/scripts/handpass/n176/draw-r6-users.mjs`, `words-r6-users.mjs`,
  pictures `raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/drawn/u6-*`; the report
  `raptor-port/docs/superpowers/briefs/2026-11-26-msq-r6-users-draw-report.md`; the words review
  `…-r6-fable-review-report.md`. **Another fresh Fable is redesigning the posting sheet right now** (`p6-*`,
  `draw-r6-posting*.mjs`): it owns the sheet; you own the page around it. Do not draw the sheet; where a row opens to
  "Post out…", stop at the button.
- Your files only: pictures `drawn/j6-*` (whole + `-crop`, desktop 1536, phone 402×874, scale 2), scripts
  `n176/draw-r6-nav*.mjs`, words `n176/words-r6-nav.mjs`. Violet dashed rings (2px `#8B5CF6`) round what is new since
  round 6's drawings. Every part the app's own (lesson 68), measured; any new part named as new, with its reason.

## Do
1. Critique round 6's u6 pictures against the new order: what reads badly once the own people come first.
2. One or two directions for the whole page — order, folds, the top search, and the jump navigation on desktop and
   phone — each drawn: the page as Kestrel (149's admin, 10 people) sees it, and as Hunter on 142 (60 people) where
   the jumps matter; a jump pressed (the heading reached, lit); a fold closed; a search typed ("Bol") with the groups
   filtered. Mind smooth motion (D991) and less motion.
3. A recommendation with its cost and the rulings it touches (D754).
4. Open every picture you make.

## Report
Whole to `raptor-port/docs/superpowers/briefs/2026-11-26-msq-r6-users-nav-report.md`: critique, each direction with its
pictures, the recommendation, every new word (a second fresh Fable reviews them, D2441), a `FACT` line per picture, what
you could not draw. Reply with a summary under 250 words.
