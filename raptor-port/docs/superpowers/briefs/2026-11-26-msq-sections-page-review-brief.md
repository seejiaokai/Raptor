# Brief — a fresh Fable reviews the four section pages before he sees them (chat 191, 26 Nov 26)

You wrote none of these pages. Review them through the design skill (Skill tool, `impeccable`), for **his iPhone**,
and fix what you find in one batch, then rebuild. He is not technical; each page is his last look before a section is
built, so a page that misleads him means he approves a build he did not mean.

## The pages

`raptor-port/scripts/handpass/n191/page/body-s{1,2,3,4}.html` (the bodies — what you edit), assembled by
`node raptor-port/scripts/handpass/n191/page/build.mjs <N>` into
`raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/section-<N>.html` (the frame `head.html` / `tail.html` there is
shared; change it only for a fault on every page). Folder `C:/Users/User/projects/Raptor-msq` (`git -C`; no switch,
no commit). To see a page at a phone's width the browser pane refuses local files: use Playwright the way
`raptor-port/scripts/handpass/n188/page/check390.cjs` does (a copy with a viewport line, 390 px) — no sideways scroll,
the reply bar answers when Differently is pressed, no script error; take screenshots of each page's top and of two
questions, and open them.

## What to check, per page

1. **Every recommendation against his rulings** (`.claude/rules/decisions/*.md`; full rows
   `grep -h '^| D2652 |' .claude/decisions-full/*.md`) and against Build 1's plan §21 and §24 for that section
   (`raptor-port/docs/superpowers/plans/2026-11-25-msq-pick-guard-build1.md`, by section) — a page recommending what the
   plan holds the other way, or stating an agent's reading as his rule, is a fault.
2. **Every question first says when it happens in real life** (who, doing what, how often — D2439); one decision a
   question; an example each; no ruling numbers, review codes or file names in the text (D2164).
3. **Pictures:** each beside its words, cut to what it is about, phone for a phone question (D1222, D1951); approved vs
   new drawing marked truly (compare with the drawers' reports `…/briefs/2026-11-26-msq-s<N>-draw-report.md`).
4. **The top** says what to look at now, open questions first (D1237); the reply bar's default reads
   "Section N: go, as recommended".
5. **Words on the page** are short and plain; the new line on section 3, "Blocked: save your colour change or put it
   back, then pick 149.", gets your words read (D2441) — keep or adjust with a reason.
6. Anything across the four pages that disagrees (the same thing named two ways, one page saying another section does
   something it does not).

## Report

`raptor-port/docs/superpowers/briefs/2026-11-26-msq-sections-page-review.md`: per page, what you changed and why, and
what you would put to him that is not on the page. The transcript may be lost — the file is the report. Reply short
with each page's build check line.
