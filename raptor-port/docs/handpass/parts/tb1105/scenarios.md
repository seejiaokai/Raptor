# Scenario design — "Undo post out" takes back the posting's bell lines (struck through) and the SANS purple line

The FULL bug check of `claude/postout-bell-look` at 248a13bf5 ([NOTICE-UNDO-RETRACT] step 1, [PO-SANS-PUCK-EDGE] — D1693,
D1697–D1699). Written 5 Nov 26 by a fresh Opus scenario designer who did not write the code (D6, D1594), from its brief;
kept here whole in substance so the walk and the readers start from it. Its two suspected faults (12, 13) were confirmed
and fixed red-first at aeedfbd77 (`src/leavewar/postout-takeback.test.ts`, the describe "the scenario designer's two
suspected faults").

**Setup.** Seed Mon 16 Nov. Saber = ad/a, Hex = hex/x (made admin on Admin → Users first), Ranger = us/us. Move the clock
with page.clock. Make one write before any reload (§7.7). Every scenario at 1536×864 and at 402×874 in WebKit, a picture
after each tap (§7.10). The drawing: `docs/mock/2026-11-05-taken-back-sans/`, pictures 2, 4 and 8.

## A. Scenarios

1. **Plain-user round (§7.0a).** Saber opens the Leave War, taps Ranger's day, More → Post out, SANS for 16 Nov, confirms;
   closes the sheet four ways (✕, Escape, a tap outside, the phone's swipe); reopens it and presses Undo post out. Then
   the grid, the bell, Admin → Users, Balances, Approvals and the day panel, and back by each tab.
2. **Read, then taken back (SANS).** Clock past 16 Nov. Hex taps his "Ranger · Mon 16 Nov / Posted out · now SANS" line
   (Admin → Users, Ranger ringed). Then Saber presses Undo post out. Hex's bell lights with one unread line
   "~~Posted out · now SANS~~ · taken back · Saber" — the strike drawn, the line wrapping rather than cutting "taken back".
   Saber's bell gets nothing. Ranger's row: no purple line, no greyed days, the SANS tick gone.
3. **Not read.** As 2, Hex never opens it: after the Undo his bell has neither line.
4. **Read by "Mark all read"** instead of a tap: as 2.
5. **Roles swapped.** Hex presses Undo; Saber had read his line: Saber's ends "· taken back · Hex".
6. **The other outcomes.** Overseas Sqn ("archived, account suspended"; after the Undo Ranger signs in again as us/us).
   Off the manpower (worked out per admin, not stored). Delete: the sheet offers no Undo once it has run.
7. **Taps on the taken-back line** from the Leave War grid, Balances, Approvals, the schedule, Inputs and Admin: each opens
   Admin → Users at Ranger's row, ringed, not under the sticky header (lesson 5); back to the Leave War by every route —
   drawn at once, no striped days (lesson 10). Ranger deleted by hand first: the tap opens nothing.
8. **Member view.** Hex taps his name badge: the posting line and the taken-back line leave the bell and its count; back,
   both return as he left them.
9. **Reload, and the top bar.** Reload after the Undo: nothing changes. The top bar's Undo / Redo right after an Undo post
   out change nothing (D350).
10. **Undo pressed twice** quickly on the phone: one taken-back line.
11. **Undo, post again, run again (SANS):** a new unread "Posted out" line; Hex reads it, Saber undoes again: a second
    taken-back line, the first still there.
12. **Off the manpower, undone and set again for the same date** (Hex taps another line between, and not): the new line
    unread. *Confirmed fault — fixed at aeedfbd77.*
13. **The posting's date moved after it ran**, then Undo post out: the old day's line taken back too. *Confirmed fault —
    fixed at aeedfbd77.*
14. **The outcome changed after it ran** (SANS → Overseas), then Undo: no "Posted out" line left standing.
15. **Off the manpower undone more than 14 days after its date**: a taken-back line if Hex had read it? If none, it differs
    from the stored outcomes — record it and put it to him.
16. **Restore is not an undo.** Ranger archived (Overseas): the sheet's Undo refused when his callsign is taken; Restore on
    Admin → Users with a post-in date keeps Hex's posting line.
17. **Two tabs** (a store gains a writer, §6): tab B opened first; in tab A an input saved that tells someone; in tab B a
    posting with a read line undone; reload both: tab A's line survives; and the Undo really took (the sheet closes
    silently on a refusal).
18. **The changes window** after an Undo post out: one posting entry, no stray lines.
19. **The SANS line on each kind of man.** Posted out as SANS before and after his date; "+ SANS" off and on (after the
    date, shown once — where?); a SANS-group man; Overseas Sqn (no line); a man already SANS posted out to Overseas
    (line); SANS on a WSO, ground crew, an SXO, an OCU man, a man whose chip lists quals, the signed-in man's own ringed
    row; the phone's frozen column; Rearrange with its drag picture; zoomed out at 1536 and 2560; a pinch part-way down.
    Count the purple pixels in each name (lesson 22). A long callsign's fade on the phone never hides the line. No "SANS"
    tag anywhere.
20. **The chip under the line.** On a SANS man whose chip lists quals, tap the chip's right edge (the line sits over its
    last 4px): the quals list must open, not the figures sheet — on the phone.
21. **The Leave War's own taken-back lines** cannot be reached in one browser (the Undo list clears at sign-out — the M4
    walk); carried by unit tests (`ui/halfampm.test.tsx`, `m4bell.test.ts`); the bell's drawing is scenario 2's. Note: a
    line "LL approved again" taken back reads struck "LL approved", without "again".

## B. Roll-call gaps it named
- **Balances, Approvals (and "also" lines), the day panel** draw the schedule's own puck (`sync.ts puckHtml`): the line only
  for a man already SANS — a man posted out as SANS before his date has it on the grid only (as the schedule's week and
  board). Show him side by side; record his answer.
- **The OIL tracker's name list** keeps its own badge: "must not, because D1698 covers the grid" — picture it.
- **The person window header, the bid and posting sheets, the selection sheet:** plain text, no puck — must not.
- **Undo post out ignores a refusal** (the sheet just closes) — the command now writes bell lines too.
- **Notice-kind branches:** only the bell list reads the words; the tap goes through `postOf`; the member gate covers
  `poback`; the posting pass's check rightly leaves it out — no gap.

## C. §7.11 lessons that apply
1 (one state only): 2–4, 8, 9, 11–15 · 3 (feedback): 2, 10 · 5 (what stands over a ringed row): 7 · 8 (the drawing beside
the build): 2, 19 · 9 (every kind of puck, measured): 19, 20 · 10 (the way back to a hidden page): 7 · 11 (zoomed out, wider
screen): 19 · 12 (a window opened from every page): 7 · 13, 15 (pinch, pinned bars): 19 · 19 (each way to close a window
over a window): 1 · 22 (judged by the pixels): 2, 19. Not applicable: 2, 6, 7, 14, 16, 18, 20, 21.
