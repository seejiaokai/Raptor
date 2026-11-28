# Seven drafted on-screen wordings — a different fresh Fable's review (D2441; chat 187, 25 Nov 26)

A fresh Fable reviewing the guard rail's round-5 questions page drafted seven wordings for the app (its report:
`raptor-port/docs/superpowers/briefs/2026-11-25-msq-q3-page-fable-review-report.md`, §1 and §6.8; the page using them:
`raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/page-r5b.html`). His rule (D2441): the words people read in the app
are drafted, then a *different* fresh Fable reviews and adjusts them before they reach him. You are that reviewer; you
did not write them. Work in `C:\Users\User\projects\Raptor-msq` (`git -C`, branch `claude/msq-b1-screens-135`),
read-only.

## The seven, with where each shows
1. "Blocked: save or cancel Inputs calendar settings, then pick 149." — the grey refusal note when Saber, with Inputs
   settings changed and not saved and the Calendar open beside it, picks 149 (page E1).
2. "Blocked: close the open window, then press Undo again." — the grey note when Saber presses Undo of "+ New squadron"
   with a window open (page E7).
3. "Someone new" — a button on the "Add a person" form, under the note "142 has an archived Jester: Pilot, CAT B,
   archived 25 Nov 26. Is this him?", answering that it is not him; the form's own "Add person" stays greyed until it is
   answered (page D8).
4. "A new Jester. 142's admin is told when he is added." — the line that replaces that note once "Someone new" is
   pressed (page D8).
5. "views 149" — in a closed row of a 142 man on 149's Admin → Users page: "Anvil [142]" / "Pilot · CAT IP · views 149"
   (page D5).
6. "No sign-in" — what such a row opens to when the man has no sign-in (Cancel only) (page D5).
7. "Hunter · 142" — a name from another squadron in a sign-off box (PLANNED BY), the browser's own drop-down list,
   which cannot show the app's grey number box (page D12).

## Check each against
The grey notes' existing pattern: `raptor-port/scripts/handpass/n176/words.mjs` and the earlier words reviews
`raptor-port/docs/superpowers/briefs/2026-11-25-msq-q3-words-fable.md`, `…-words2-fable.md`,
`…/2026-11-25-msq-pick-guard-words3-fable.md`; the screen-design rulings `.claude/rules/decisions/design.md`
(§Saving and the notes), `.claude/rules/ui-design.md`; plain words (`.claude/rules/plain-language.md`); an action
never written as if a person; the app's own names; the full rows of D2598, D2625, D2629, D2632, D2633 (`grep -h '^| D2633 |'
.claude/decisions-full/*.md`). Does each say what happens and what to do, in as few words as the pattern uses, match
its siblings, and could he misread it?

## Report
Return, as your final reply (no file): for each of the seven — keep, or your adjusted words — with one line of reason.
Then anything in the seven's situations that still has no words. Change no file.
