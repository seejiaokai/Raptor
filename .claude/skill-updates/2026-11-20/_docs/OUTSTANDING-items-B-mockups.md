# Backlog additions from group B-mockups (skill-notes review of 20 Nov 26)

## Priority-list line (the checking tools' area, beside [CHECK-TOOLS-HARDEN])

- [CSS-SCOPE-GUARD] — a rule begun at `body`, `html` or `:root` inside a page's wrapper fails the stylesheet check — small, no look from him.

## The item

### [CSS-SCOPE-GUARD] A rule begun at `body`, `html` or `:root` inside a page's wrapper matches nothing (skill notes 728 and 967; filed 20 Nov 26 by the skill-notes review)
**What:** a stylesheet that wraps itself in its page (`#page-leavewar { … }`, native nesting) turns a rule written inside
the wrapper as `body …`, `html …` or `:root …` into "a body inside the page", which never matches: nothing is drawn and
no error is raised. Met twice: 27 Oct 26 (M4, a `body:has(…) .bidsheet` fix, two builds lost — note 728) and 17 Nov 26
(chat 100, the grid's hover ring moved from an injected drawing into `matrix.css`; unit tests and a code read passed, only
a browser test of the computed style caught it — note 967). The guide lines now warn (`.claude/skills/brainstorming/mockups-on-the-real-app.md`
§The Method step 6, "From the picture to the build"; the comments in `matrix.css` and `approvals.css`), so the next step is a
check, not more words.
**The check:** extend `raptor-port/src/ui/css-wrapper-css.test.ts` ([CSS-WRAPPER-GUARD]'s test, which already parses every
stylesheet wrapped in its page) with a second rule: inside a wrapper block, at any depth (an `@media` or nested block
included), a selector whose first compound is `html`, `body` or `:root` — with or without a state (`body.x`, `body:has(…)`) —
fails, its message naming the file, the selector and the two ways that work (written from the page with `&…`, or placed
after the wrapper's close as a state of `body`, rule 3 of that test). Proved red first by putting the 17 Nov 26 rule back
in a copy of `matrix.css`.
**Place:** with the next Leave War or Tracker batch (D490), or any job that touches a wrapped stylesheet; no app change, so
no walk beyond the test's own red-then-green.

## Priority-list line (the checking tools' area)

- [ASK-PAGE-CHECK] — a script run on a mock-up or questions page before it is published to him: codes, ruling numbers and record words, and one "look at now" list — small, no look from him.

## The item

### [ASK-PAGE-CHECK] A check run on a page before it is put to him (skill notes 968 and 973; filed 20 Nov 26 by the skill-notes review)
**What:** two rules for the pages put to him keep being broken by hand, each after it was ruled. (1) A questions page shows
only what is still open, newest first (D1237, D1363; D1237's reading: rebuilt at every new version): met again over chats
97–100, when four rounds each added one more "Newest" block on top and answered items stayed below until he asked for the
page to be made readable (note 968 — the third meeting, after 22 and 25 Oct 26). (2) Every such page is in plain words — no
review codes (H2, F16), ruling numbers inside sentences or record words ("narrows") in its text or on its pictures' tags
(D2164, D2185): round 7's page and its picture tags carried the findings' codes (note 973).
**The check:** `raptor-port/scripts/askpage-check.mjs <page source>`, run on the page's HTML source before every publish
(the mock-up guide's Showing It to name it once built): fails on (a) a code of one or two capitals and digits, or a ruling
number, in the visible text — outside a small grey reference after an item (D2164's reading) — and on a picture tag whose
words are anything but a number or "New"; (b) a short list of record words kept beside the script (narrows, supersedes,
greyed, REFLECTED, ACTIONED); (c) more than one top "look at now" list, or an item marked answered or replaced still on the
page. It prints each hit with its line; a hit kept on purpose carries a marker comment. The page is still read by eye — the
script catches only what words can.
**Place:** with the next design round put to him ([MULTI-SQN-DESIGN]'s next batch), built before that round's page goes
out; no app change.
