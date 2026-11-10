# Night 3's working-guide changes — the fresh, blind Opus read (10 Nov 26, chat 53)

*(Its final reply, saved by the host, condensed only in layout; brief `2026-11-10-night3-guides-read-brief.md`, on
`a6909d3cc` of `claude/night3-guides`. Blind to Astra. Read-only.)*

**1. Meaning (D1743 and the calendar lines).** D1743 is spent: its window ended Mon 9 Nov 26 19:00; its open point is
answered by D1770, which also carries "called without asking him each time"; his Claude-allowance aim stays with D1033;
"chats side by side" was only a way to spend both allowances inside the window. Every rewritten line keeps what the live
rulings require (D1734, D1738, D1739, D1761, D1763, D1770) — bug-check.md, doc-structure.md, how-we-work.md (three lines),
guide-full.md; nothing dropped that is not spent, nothing added; D1770 still stated under Models and readers. No live
file states the window as current. The calendar lines check out: D567–D585 all on `main`; D610's line keeps "nothing
deleted", which D614's mark leaves standing; no live file names the calendar as on hold.

**2. Lessons 49, 50, 52.** 52 correct (D1322 calls set C's magenta pink, so "magenta included" is his). 50 keeps to D1313
with one small unmarked reading (L2). 49 still overreaches (M2). No reword loses anything he said.

**3. Lessons 25–30.** Each cited sheet opened. 25, 26, 27, 28, 30: each records him finding the fault after a walk that
should have caught it, a kind no earlier lesson covers, a check a later walk can carry out (25: oil-walk §11 "Why THIS
walk missed it"; 26: "Why the [HUMAN-RETEST] walk missed F-A"; 27: calendar check §17, §20, board-side-width §7b, "up to
38px" right, "2 Sep 26" backed by ui-contracts; 28: list-dates-picker §1; 30: m2-looks). 29: M1.

**4. D70.** Nothing contradicts a guide or a live ruling; no safeguard dropped; 30 repeats §7.10 and 28 §7.2, both
justified as pointers.

## Findings
- **M1 (Medium) — lesson 29.** The sheet (m1-open-dates §16) records that M1's code read had already found the stale
  "today" at midnight, filed as [LW-M1-READ-LEFTOVERS] item 3 for M2, before he met it (D1266's row says so); and
  `ui/dayclock.ts`, `dayclock.test.ts` are under `src/leavewar/ui/`. Fix: "M1's code read had found it and filed it,
  older than M1, for M2 ([LW-M1-READ-LEFTOVERS] item 3); no walk kept a page open across midnight, so nothing showed it
  would meet him the next morning." and the paths `src/leavewar/ui/dayclock.ts`, `src/leavewar/ui/dayclock.test.ts`.
- **M2 (Medium) — lesson 49** states the rule for the whole app though D1309 is the Leave War's, then lets colours be
  shared "elsewhere". Fix: "On the Leave War every kind gets a colour clearly its own — an OIL taken, the other leave and
  an overseas duty above all: no two kinds share a colour, and none are so close that a glance on a phone mixes them.
  *(That the same holds wherever a colour names a kind in the app, and that where colours run short a second sign — a
  fill, an outline, a letter — is added beside the colour, never in its place, are the agent's readings, not his
  words.)*"
- **L1 — lesson 26:** 807px was the ordinary chart's error; Edit chart layout's was 56px (the sheet's §2). Fix: "807px
  off on a phone in the ordinary chart, 56px in Edit chart layout."
- **L2 — lesson 50:** "name-and-figure pairs" is D1313's agent reading. Fix: "the manning rows run side by side … each
  row kept whole …", the reading parenthetical adding "that each row stays a name-and-figure pair".
- **L3 — D1770's row** names "the allowance line — D1770", which no longer cites it. Fix: "(Models and readers; the
  Impeccable line — D1770)".
- **L4 — the backlog** ([CAL-JOB-LEFT] (1) and its reads-owed row) still read as open. *(Host: already updated on
  `claude/night3-leftovers`, which this reader could not see.)*
- **L5 — §7.11 layout:** the italic note before lesson 25 renders as part of lesson 24 (blank lines needed); the head
  says "newest first" but the list runs oldest first. Fix: "numbered in the order written (lessons 25–30 are older finds,
  swept in on 10 Nov 26)".

**The host, 10 Nov 26:** every finding reproduced; M1, M2 (with Astra's 2), L1, L2, L3, L5 fixed on `claude/night3-guides`; L4 already done on `claude/night3-leftovers`.
