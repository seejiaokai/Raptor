# Astra's report — the design guide's tightening (10 Nov 26, chat 58)

Read-only, by `codex exec -s read-only` on the brief `2026-11-10-design-guide-tighten-read-brief.md`, started at commit
`82899c758`, blind to the fresh Opus reader's read. **Count: 1 meaning change · 2 of lost detail.** The host (chat 58)
set each beside the old wording: all three hold. Findings 2 and 3 were also the Opus reader's and were already fixed
(commit `027b4012c`, in the original's own words); finding 1, lesson 64's PLACED column, was Astra's alone and is fixed
in the commit that adds this file. Its report, as returned:

---

1. **Lesson 64 widens a specific alignment exception.** “A phone’s last column may stay at the right edge” replaces an exception specifically for Approvals’ PLACED column. A future designer could now right-align another list’s final column against the lesson’s general rule. Replace that clause with: **“the phone’s PLACED column in Approvals may stay at the right edge.”** This preserves the scope of D1438.

2. **Lesson 23 loses the condition that preserves approval status.** The shortened agent reading allows colour to identify kinds of leave but drops “where it stands being shown another way.” A later restyle could distinguish leave kinds while making approved and pending entries indistinguishable. Replace the parenthesis with: **“(The agent’s reading: colour may then tell the kinds of leave apart, with its state shown another way; the same may hold for other grids read at a glance — the Inputs and SANS calendars.)”**

3. **Lesson 39 loses its link to the bid-window exception.** Removed lesson 50 explicitly narrowed both lessons 20 and 39. The replacement reference appears only beside lesson 20, leaving the word-and-figure layout lesson without its exception. A future designer could miss the requirement to keep the bid window’s day line horizontal. Add: **“Narrowed for the Leave War bid windows’ day line by D1313 (the Leave War’s page): its rows run side by side on one line.”**

All 68 retained lessons were compared with their complete originals. Apart from these findings, their substantive rules and attribution survive. Lesson 20 correctly replaces its reference to lesson 50; lesson 35’s reference to lesson 5 belonged to the suggestions deliberately moved out.

§0: clean; all three correction steps, the fresh-reader safeguards and approval boundaries remain.

§1: clean; the writing guide’s scope, deletion tests, protected text and feedback exceptions remain.

§1a: clean; the safeguards in tests 0, 1 and 9 remain.

§1b: clean; the joining order, naming rule and exceptions to the outside writing advice remain. The removed worked examples are unnecessary to understand the retained tests.

§2: clean; the date-calendar row makes an existing approved keyboard command explicit.

§3: clean; the arrows’ position remains reserved by the layout across changing values and different lettering.

§4: clean; the ring’s boundaries, exceptions, reduced-motion behaviour and prohibition on glow remain.

§5: clean; the Tracker’s bounce exception correctly survives through the phone’s own scrolling, including with reduced motion.

§5a: clean; removing approval history changes no dragging rule.

§6–§7: clean; no substantive change found.

§8: clean; reporting, pictures, completeness checks and approval requirements remain.

“Changing this guide”: clean; independent reading, the lesson-line exception and “merge live” remain.

**Short checklist, point 2:** no separate finding. The shortened examples and references do not remove an operative safeguard; reading the complete writing sections remains explicit.

**Archives and removed lessons:** the original wording is preserved. Spot checks of removed lessons 93, 50 and 5 confirm that their rules remain on the pages named. No unsupported new rule or unnecessary bulk found.

**Scope:** this report concerns the committed version present at review start. Later edits appeared during the read and are outside this report. I opened no other reader’s report, changed no file and committed nothing. No app walk or tests were needed for this document review.

Rulings: none this session.

**Count: 1 meaning change · 2 lost-detail findings.**
