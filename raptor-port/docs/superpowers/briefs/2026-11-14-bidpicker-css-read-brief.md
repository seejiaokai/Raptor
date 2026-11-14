# Code read — job 1 of the night of 14 Nov 26: the bid sheet's style rules moved inside the Leave War's wrapper

You are one of two blind readers of finished code. Read only; change nothing, commit nothing.

**Repo:** C:\Users\User\projects\Raptor. **Branch:** `claude/lw-bidpicker-css-1114b`. The change under review is ONE commit,
`237317147` (`git show 237317147`); the other commits on the branch (`fe3f5c45b`, `6be3429d4`) are notes only — ignore them.

**What it claims:** in `raptor-port/src/leavewar/ui/bidpicker.css`, all 202 rules that stood after the close of the
`#page-leavewar { … }` wrapper now stand inside it; the wrapper guard (`raptor-port/src/ui/css-wrapper-css.test.ts`,
`raptor-port/src/ui/css-wrapper-outside.json`) now allows 0 rules outside; NOTHING a person sees changes. Moving a rule
inside the wrapper raises its specificity, so where two rules compete for one element the winner can flip; the builder
says it found 20 such places by simulating the cascade over the old build and kept each outcome (dead declarations
deleted, two rules lowered with `:where()`), each marked "MOVED INSIDE" in the stylesheet, and that computed styles of
9,802 elements in 78 states (desktop 1536x864, iPhone 402x874) are identical before and after
(`raptor-port/docs/img/handpass/2026-11-14-bidpicker-css/diff-before-vs-after.txt`; the capture script
`raptor-port/scripts/handpass/lw-bidpicker-css-capture.mjs`).

**Your question:** is there any element, in any state a person can reach, whose look changes because of this commit?
Hunt where the builder's 78 states could not reach: states not captured (hover, focus, focus-visible, active, disabled,
:has(), media queries for other widths — 360, 430–700, 701–1100, landscape — reduced motion), rules whose competitor lives
in ANOTHER stylesheet (other Leave War files, `scheduler.css`, the shared window/sheet styles), `!important`, nesting or
`&` inside the wrapper, `@media`/`@supports` blocks moved inside, keyframes, selectors that began with `#page-leavewar`
and lost the prefix, and the declarations the builder DELETED as "dead" — is each truly dead in every state? Also: does
the guard test still catch a rule appended after the wrapper (try reasoning with a concrete example), and were the two
test files changed (`deletesure`, `eventslist`) weakened or only re-pointed at the same values?

**A finding counts only with:** a concrete element and state, what it looks like before and after, the rule pair that
causes it, and the fix. Write each claim so it could be turned into a failing test. No finding about data already stored
(the store is demo data, cleared before the database step — D56).

**Then, separately, a tidiness note** on the changed lines only (filed, not fixed): three questions — is anything
written twice, is anything left that no longer applies, is anything harder to read than it needs to be. No size numbers.

**Report:** findings first (or "no finding"), each numbered with severity; then the tidiness note; short.
