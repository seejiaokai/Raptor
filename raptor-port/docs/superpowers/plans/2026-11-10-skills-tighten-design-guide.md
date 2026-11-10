# [SKILLS-TIGHTEN] step 1 — the design guide: what would leave, what would be said shorter (10 Nov 26, chat 56)

His D1975: the skills written here and the design guide are tightened — the same rules in fewer words, none dropped —
and what no longer applies is taken out, moved whole to an archive; the design guide first. This file is the list put
to him BEFORE anything changes. Nothing in `raptor-port/docs/design-practices.md` has been edited.

**Status:** the guide read whole by chat 56 on `main` at `c8fc76429`; the list below put to him 10 Nov 26; his answers
to the two questions in §E are awaited. The rewrite is not started.

## A. Measured

- The guide is 870 lines, 137,131 bytes, about 45,900 tokens (`docsize --reads`, chat 56).
- §9, his design lessons, is lines 672–847: 66,925 bytes — 49% of the guide, about 22,400 tokens — and
  `.claude/rules/ui-design.md` has it read WHOLE for every design job, with the head and §0. It holds 81 lessons,
  about 830 bytes each on average. His D941 set a lesson as "one line: the lesson in terms of the app he intends, its
  date and its ruling".
- Each section in bytes, measured by the duplicate fresh chat (raptor-7c) before it stood down: head 2,409 · §0 6,183
  · §1 10,465 · §1a 6,507 · §1b 16,118 · §2 3,134 · §3 4,210 · §4 8,410 · §5 2,256 · §5a 1,601 · §6 1,598 · §7 624 ·
  §8 3,144 · §9 66,926 · the sources table and "Changing this guide" 3,546 (about a third of a token to the byte).
  Inside §9 the "other places" tails are about 15,500 bytes and the fresh readers' notes about 700.
- `OUTSTANDING.md` names a lesson by its number only 9 times, so most lessons' "other places it may apply" lists are
  NOT filed in the backlog, though §0 step 3 says the list is filed with `[UI-SLEEK-PASS]`: they live only in §9.

## B. What no longer applies — moved whole to `raptor-port/docs/archive/` (no rule in any of it)

Each is history, a story, or text stated twice. A move never rewords (D138).

1. Head, lines 26–27: "D805–D809, D812 and D813 were recorded on the Inputs batch's branch … reach this branch when
   that one is live" — that branch went live in October; D805's row is in the full rows.
2. §0 step 2: "(16 Oct 26: the first lesson gained a reason he never gave …)" and "(Until 16 Oct 26 he was asked each
   time …)" — how the rule came about; the rule stands without them.
3. §0's closing paragraph, and the same kind of sentence in §1 (D846's three tests, D850's feedback rule) and §4 (the
   two long brackets under "One mark, one look" and "No mark glows"): which words were his, which began as the agent's
   reading, and that he approved them (D847, D855, D876, D887). The approval and his words are in each ruling's full
   row; "No mark glows" also lists every place that lost its glow — built history.
4. §1's "Its wider use (D835)" paragraph — stated on the How we work page (§Design, last line); a pointer stays.
5. §1a's and §8's dated stories in brackets (14 Oct 26 the dead note; 13 Oct 26 the half-width notes; 13 Oct 26 the
   writer who could not see a second reading; 13 Oct 26 the gap reasoned away; 17 Oct 26 the 13 events; 21 Oct 26 the
   arrow that moved 3px) — each rule keeps its test; the story goes.
6. §1a and §1b test 2: "The wordings he approved on 13 Oct 26 (D827, D829, D830) are rechecked … before any of them
   is built", said twice — chat 57 (raptor-5c) checked: the recheck is done and approved (D837–D839;
   `[SKILL-FUSION-WRITING]` says so), so both sentences leave. (Its check, not re-run by chat 56.)
7. §1b's head: which outside guides were read word for word and which through a fetch tool — the sources table at the
   guide's end says it again.
8. §1b's table "Three of the app's notes, as this guide would say them" — worked examples headed "On screen on
   13 Oct 26"; TO CHECK whether those notes still read so. Kept only if a reader finds a test unclear without it.
9. §9's head: the 22 Oct renumbering story; and inside the lessons every "(Checked by a fresh reader, … )" note and
   every "Until D996–D997 later that day …" account of a wording since overtaken.
10. "Changing this guide": the first draft's readers and the writing guide's three reads of 13–14 Oct 26 — history; the
    rule (who reads a change, D1761) stays.

Found by chat 57 (raptor-5c), which read the guide whole too and checked each against the full rows and the code —
its checks, to be re-run by whoever makes the change:

11. §5's "One exception, his (D987): the Tracker's finger glide bounces at an end" — D992 replaced the glide with the
    phone's own scrolling, so the exception names motion the app no longer makes.
12. Lesson 2's "Both wait for his answer (the night of 16–17 Oct 26, question 2)" — neither wording it names is in the
    app any more.
13. §4 "No mark glows": "and so did the faint wash … until D1614 took it away" — history; the rule is now "every
    page's background is the claw's plain dark".
14. §1's "§1, §1a and §1b together are THE WRITING GUIDE … used every time" and §1a's "ITS STANDING USE (D833)" say
    the same thing twice — one stays.
15. §9 is headed "newest first" but is not in that order (93, 89, 92, 82, 77, 81 …) — put right in the rewrite.

Found by the duplicate fresh chat (raptor-7c), checked by it the same day:

16. §1b test 10: "the word list when `[WORD-LIST]` is written" — `raptor-port/docs/word-list.md` exists; the line
    should name it.
17. §1b's three-notes table (item 8 above): two of the three are built as the guide words them; the third now reads
    "Blocked: this week was published by an older version of the app, so it can't be edited. Nothing was saved." — so
    its "On screen on 13 Oct 26" column is no longer what is on screen.
18. §2's date-calendar row: "(built 14 Oct 26 … the sweep's K1, K2: D830)" — a story.
19. The guide's pointers to `[GUIDE-ONE-MARK]`, `[GUIDE-DRAG-RULES]`, `[ARROWS-STAY-PUT]`, `[ASK-AT-THE-CONTROL]`,
    `[KEYBOARD-SCROLL]` and `[SKILL-FUSION-JAKUB]` name items now in `OUTSTANDING-ARCHIVE.md` — each pointer dropped or
    marked finished. Of D827, D829 and D830 (item 6): D829 is replaced by D837, D830 spent, D827 narrowed by D1177.
20. Still true, so it stays: the head's line that `DESIGN.md` is not written.

Estimated: about 4,000 tokens outside §9.

## C. §9 — each lesson back to the one line D941 set

Proposed shape of a lesson: its number, date and ruling · his words, quoted short or closely paraphrased (D1417) · the
lesson · where a lesson narrows or is narrowed by another, that pointer · anything of the agent's own still marked as
its reading, in a clause, not a paragraph.

What leaves each lesson, moved whole, lesson by lesson, to ONE new file searched when needed
(`raptor-port/docs/archive/design-lessons-detail-2026-11-10.md`, keyed by lesson number, named in §9's head and from
`[UI-SLEEK-PASS]`, so §0 step 3's "filed with the whole-app pass" becomes true):
- "His case" — the screen and the drawing the correction was made on;
- "Other places it may apply, suggested and not changed" — a to-do list of suggestions, not a rule; some are built
  since;
- the long form of the agent's readings, the fresh reader's notes, and answers since given ("His pick, D1509 …").

Estimated: §9 from about 22,400 tokens to 8,000–11,000. With §B and §D the guide goes from about 45,900 to roughly
27,000–30,000, and what every design job must read whole (head, §0, §9) from about 26,000 to about 12,000–14,000.
These are estimates until the rewrite is measured by `docsize --reads`.

## D. Said in fewer words — same rules (the rewrite; each change read for meaning)

- §0 item 1's ruling list and §0's three steps — long sentences carrying quotes twice.
- §1's D846 and D850 points — the longest two bullets of the guide; the three tests and the three cases stay, numbered.
- §1b test 2 (the dash) and test 12 (machine-written habits, with its long list of the outside tool's rules NOT
  applied) — the longest tests; every branch of the order stays.
- §3 "A page's controls are one row", §4 "One mark, one look" and "No mark glows" — each also stated on the
  screen-design rulings page (`.claude/rules/decisions/design.md`, which says the guide "holds the wording"): the
  guide keeps the full wording, shorter; the page's line is not touched in this job.
- `.claude/rules/ui-design.md` (loads by itself with every file of the app, about 3,100 tokens): its short form's
  point 2, "Words", restates §1, §1a and §1b at length — tightened in the same job, as a working guide (the same two
  readers).

## E. His to decide

1. **Lessons to one line each** (§C) — his D941 set that shape; his case, the other places and the readers' notes move
   whole to a file that is searched. Recommended: yes.
2. **Lessons about one screen only, already built and already a rule on that screen's own page** — for example lesson
   81 (the claw 7px nearer TALON), 76 (an input never creates a Leave War period), 74 (no browser sideways bar on Edit
   Schedule), 71 (the Events list's edit and cross icons), 67 (Leave War names drawn as pucks), 4 and 3 (the Medical
   card, the "till" date). Recommended: these leave §9 for the archive — each only after a reader confirms its rule is
   stated on a page that loads with that screen's work; about 10–15 of the 81. A lesson that teaches something beyond
   its own screen stays. (He may strike any lesson — D941.)

## F. Left alone

- The sources table (licences — MIT attribution) and "Not taken from any of them".
- §2's keyboard table, §4's colour table, §5, §5a, §6, §7 — already short.
- Any wording he ruled (D587, D783 and the like) and every rule's substance.
- The outside skills (Impeccable, the task observer, the superpowers set) — the job's last step asks him.

## G. Method and reads

- Order of the work: (1) the checks marked TO CHECK in §B; (2) the moves of §B and §C by
  `backlog-archive.mjs --move` where the text moves byte for byte, `docsize --moves` listing what left; (3) the
  rewrites of §C's lines and §D; (4) measured by `docsize --reads`.
- A guide change: read by Astra and a fresh, blind Opus reader, each blind to the other, for whether any meaning
  changed (D1761, D1738); live only on his "merge live" (D1737). No size target (D141); nothing a job must read is cut
  (D68).
- Session-handoff and overnight follow, the same way, after the design guide.
