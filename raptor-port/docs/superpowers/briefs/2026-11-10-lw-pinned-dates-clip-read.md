# Code read — the Leave War's pinned dates trimmed by a clip path (D1963) — brief, 10 Nov 26

Read only. Change no file, commit nothing, push nothing. Return a report.

## The change
Branch `claude/lw-frozen-bar-stutter`, against `origin/main`: `git diff origin/main...HEAD -- raptor-port/src raptor-port/e2e`.
Two files: `raptor-port/src/leavewar/ui/matrix.css` (three rules) and `raptor-port/e2e/leavewar.spec.ts` (one new test).

On the owner's iPhone the Leave War's pinned dates row (`.mxfixed`, testid `sticky-head`; its track `.mxfixed-track`; the
year-wide dates layer `.mxfixed-anim`; the still corner `.mxfixed-frozen`) goes blank while the page is sprung past its
foot. He compared two ways of trimming the dates on his phone and chose this one (his ruling D1963,
`.claude/decisions-full/leave-war.md`): where the dates follow the grid by the scroll itself (`.lw-sda`), the box no
longer trims by `overflow`, and the track trims by `clip-path: inset(0)`; while two fingers pinch (`.lw-pinching`) the
clip path is lifted as the overflow was. No PC browser shows the blank, so nothing here can prove the cure; the read is
for what the change could BREAK.

## What to look for
1. Anything that relied on `.lw-sda .mxfixed` or its track having `overflow: hidden` — a child drawn outside the box now
   showing (left of the corner, right of the card, above or below the row), a shadow, a rounded corner no longer cut, a
   stacking or scroll-container change (an `overflow: hidden` box is a scroll container; `position: sticky`,
   `scrollIntoView`, scroll-driven timelines and `scrollLeft` writes inside it may have depended on that).
2. The pinch: the order and weight of the rules — does `.lw-sda .mxfixed.lw-pinching` still get `overflow-x: clip`, and
   does the track's clip path lift, in every state (`lw-pinsda`, Rearrange mode, reduced motion)?
3. The path where `.lw-sda` is absent (browsers without scroll-driven animation): is it untouched?
4. Does the new test hold what it says, and could it pass on a build that leaks dates outside their strip?
5. Quals' pinned heading (`raptor-port/src/ui/scheduler/05-quals.css`, `.qfixed`) was deliberately left alone. Say if
   the change makes the two diverge in a way that matters.

## Not findings
- Anything that lives only in data already stored (the store is demo data, cleared before the database step — D56).
- A scheduler who is not an admin (D785).
- That the blank or the swipe-down flash still happens on an iPhone — known and ruled (D1961, D1963).

## The report
Each finding: the exact lines, a concrete failure a person would meet (which screen, which size, which gesture), its
cause, and the exact fix, step by step. Write each claim so it could be made a failing test. If you find nothing, say
what you checked. Last, a tidiness note: three questions of the changed lines only (is anything duplicated, is anything
dead, does a comment say why) — filed, not fixed.
