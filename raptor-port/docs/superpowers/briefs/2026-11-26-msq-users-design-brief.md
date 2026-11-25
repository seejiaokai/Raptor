# Admin → Users for many squadrons — a fresh Fable thinks it through as a whole (chat 187, 26 Nov 26)

His words (D2641): *"fable can u help me think E8, the way we design this is it good for multiple sqn work in the
future? Like it makes sense to be able to move personnel around, 1 look u know who from external have control or view
of your schedule. Post then out to other sqns or post them in etc"*. You are that fresh Fable, latest, high. He is not
technical and reads on his iPhone; plain words, the app's own names, a worked example each, a recommendation, pictures
of the real app (`.claude/rules/plain-language.md`; `.claude/rules/decisions/how-we-work.md` §Showing him).

## Read (in `C:\Users\User\projects\Raptor-msq`, branch `claude/msq-b1-screens-135`; `git -C`, read-only except your page)
- The E8 explainer he was shown: `raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/e8-story.html` (live at
  https://claude.ai/artifact/VcwUbgU3cUbVXf4HL8NqUT) and the round-5 page `…/q3/page.html` (E8, D4, D5, D7, D8, E9g).
- The drawings in `…/q3/drawn/` (open what you judge on): e4a, e4b-r, e4b2, e4b3, e5-d-primary-top(-r), e8j, e8j2, e6*.
- His rulings, full rows (the shell: `grep -h '^| D2641 |' .claude/decisions-full/*.md`): D2641, D2634 (postings on
  Admin → Users), D2633 and D2632 (the Transfer step; an archived callsign), D2629, D2631, D2635 (folded headings),
  D2625 (a man of another squadron's short row), D2626 (Plan given by its own admins or a master admin), D2622 (separate
  squadrons, separate views), D2270, D2191, D2197, D2306, D2087, D309, D310; and the People & accounts page
  `.claude/rules/decisions/people-accounts.md` §Many squadrons.
- Build 1's plan `raptor-port/docs/superpowers/plans/2026-11-25-msq-pick-guard-build1.md` §19 (Build 1V) and §8.4
  (three new questions), by heading. The backlog's Transfer step: search `OUTSTANDING.md` for "Transfer".
- Load the design skill first (Skill tool, `impeccable`; target `raptor-port`), shape and critique lenses.

## Think
1. **One look: who from outside holds View or Plan of a squadron.** Today and as drawn, where would Kestrel (149's
   admin) see that Hunter (142) plans 149 and Bolt (142) views it? Is it findable at one look? Propose the right place
   and form (a block at the top of the squadron's own list, a filter, a line under the heading …), with how he ends it.
2. **Moving people:** posting out to another squadron and posting in (D2634, the Transfer step D2633), where they sit on
   Admin → Users, how a man in transit shows on both squadrons' pages, who may do which half.
3. **E8 and the folded groups:** does the recommended E8 ("the tick goes; Edit on 142 →") fit 1 and 2, or does a better
   overall shape make it fall away? Name what holds up with five or more squadrons and what breaks.
4. A recommendation for the whole page, its cost, which of his rulings it changes (D754: the right design, never the
   closest to today), and what must be drawn before it is built (D1625).

## Write
A page for him: `raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/users-design.html` (self-contained like
`e8-story.html`: its own `<title>`, styles from that file, pictures by `drawn/…` paths; words, no codes or ruling
numbers; the recommendation first, then each part with its example; mark what is new and needs drawing). That is the
only file you may create. Return as your final reply a short report (under 300 words): the recommendation, what it
changes, what must be drawn, any ruling it clashes with.
