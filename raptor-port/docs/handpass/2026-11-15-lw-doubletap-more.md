# Evidence sheet — the Leave War's double-tap guard on six more windows ([LW-DOUBLETAP-MORE-WINDOWS]; `claude/lw-doubletap-more`, pull request 781; chat 81, the night of 15 Nov 26, job 3)

## 1. The eight answers and the tier
Money, the published record, saved data, a shared drawer, a new surface, roles, the warning list: NO — the change only decides whether a second tap reaches the grid; every write still goes through the same controls. A new gesture or mode: YES (how a tap is taken). **Tier: WALK.**

## 2. The rulings that apply
- D1984: the Events list's ✕ over the bell. Leave it.
- D1985: a window closed by a tap beside it, then the same spot again, opens the day. Leave it.
- D1281: a picture right after each phone tap.
- D1557: the plain-user round.
- D785: a scheduler is an admin.

The code keeps all of them (both reads, known points (a)–(c)).

## 3. The roll-call (window × way of closing — guarded / not needed, because…)
**Guarded:**
- the selection panel: ✕, Apply, Clear;
- the rename form: ✕, Save, Cancel;
- the phone number pad: Done, and Next on the last flying date;
- the day panel: ✕;
- an under-manned row;
- the move banners, a record's and an event's: Confirm, Cancel;
- New period: ✕, Create;
- Open for bidding: ✕, on a desktop or tablet;
- added by the reads: the slim "Back to Approvals" bar's ✕, and the Calendar window's ✕ (⚙ → Calendar…).

**Not needed:**
- The desktop figure editor: it closes only by a key or a press outside.
- The day panel's ‹ ›: the panel stays up.
- Open for bidding on a phone: it fills the screen, so no grid lies under its ✕. It is armed anyway.
- The document viewer: it closes onto the person window, which is still under its ✕.

**A close with no tap — a key, a swipe, a press outside — arms nothing.** Escape from the pad once did arm the guard. That was Astra's F1, now fixed.

## 4. The door check
The guard eats only a click whose target lies inside the grid's table. No window, banner, list or the day panel is drawn inside that table, so a hand-over never eats a tap on the new window (both reads).

## 5. The five sizing lines (D607)
1. **Type:** C, a new way a tap is taken.
2. **What only a walk could find here:** the real finger timing on each window's controls at a phone's size, WebKit's taps, the tablet, a desktop mouse, and what must still get through.
3. **The ledger:** the 11 Nov walk of the same guard (one Sonnet walker, about 13 min) found 0 faults in the change. Its reads found one, a close without a tap.
4. **Chosen:** one Sonnet walker, scripted, on the served build.
   - Sizes: a phone at 402 by real touch (WebKit for six windows), a tablet at 820, a desktop at 1536 by mouse.
   - Cases: each window × each way it closes, at 120 and 350 ms; what must still get through, including a close by Escape followed by a tap (the last ledger's lesson); a hand's ways; a member; the plain-user round.
   - Then a re-walk of what the fixes touched.
5. **Row:** added to `docs/walk-ledger.md`.

## 6. The lessons of §7.11 that apply
- 4: the window that leaves the page working — the selection panel (M3e).
- 19: every way each window closes, touch in WebKit, and a desktop.
- 20: a hand's ways (M4).
- 21: what only his phone shows — the real iPhone finger, named for his look.
- 30: a picture within about 100 ms of the lift.

The rest do not apply (no list measured, no drawing, no today reading).

## 7–12. The walk, the cases, the pictures, the errors, what was not walked
- **The walk:** `parts/2026-11-15-lw-doubletap-more-walk.md` — 315 pictures in `img/handpass/2026-11-15-lw-doubletap-more/run1/`, no FAIL.
- **The re-walk:** `parts/2026-11-15-lw-doubletap-more-rewalk.md` — 77 pictures in `…/rewalk/`, all PASS.
- **Errors:** none in either.
- **Not walked:**
  - the selection panel in WebKit (its long-press drag is driven only in Chromium; the unit and browser tests hold it);
  - a close by pinch;
  - the member's under-manned list (no red days in his demo world).
- **Pictures opened by the host:** `run1/chromium-under-row-g120-fast.png`, `run1/m4-day-x-gap700-settled.png`, `run1/m3c-menu.png`, `rewalk/R1-padDigit-quick.png`.

## 10. The break tests
- The key check forced true: both Escape tests failed.
- The slim bar's and the Calendar window's open state zeroed: their unit and browser tests failed.
- The window-press entries removed: the same tests failed.

The outputs are in the night's scratch folder (`fix-break*`).

## 13. The gate counts
On the PC, after the fixes (`65e90282c`):
- the whole unit suite: 834 files, 14,424 passed, 20 skipped, 0 failed. The first run had one failure in an older load-sensitive test, the event window's Save then Delete; it passed 32/32 three times alone, and it is filed.
- build: green.
- code check: no new finding.
- both double-tap browser files: 33 passed (the desktop ones skip by design).

GitHub's run is read before the morning report.

## 14. The reads
- Astra and a fresh, blind Opus reader: `superpowers/briefs/2026-11-15-lw-doubletap-more-coderead-{astra,opus}.md`.
- A narrow fresh Opus read of the fixes: `…-coderead-narrow.md` — no findings.

## 15. What was found, and each disposition
**Fixed, each red first:**
- Astra F1 (new): Escape from the number pad reused an earlier press.
- Opus F1 (older, the same kind): the slim Approvals bar's ✕.
- Found while checking: the Calendar window's ✕.
- The test gaps both reads listed.

**Filed** (`[LW-DOUBLETAP-LEFTOVERS]`):
- the tidiness notes;
- the under-manned list that hides but stays open;
- the first-ever period's Create;
- a Required close delayed past a second;
- the load-sensitive event-window test;
- a finger landing a move then a tap near it, now covered only by a mouse case;
- two document notes (the seam file's list of who reads the war through `sync.ts`, and `performance.md` §E).

## 16. `Walk:` line
**Walk:**
- **Walk:** one Sonnet walker, 315 pictures — phone by touch (Chromium and WebKit), tablet, desktop, member, plain-user round — no fault. Re-walk of the fixes: 77 pictures, all pass.
- **Reads:** Astra plus a fresh Opus reader found one new fault (Escape from the pad) and two older windows of the same kind; all three fixed red first. The narrow read found nothing.
- **His look:** a quick double tap on the Required pad's Done, the day panel's ✕ and the slim Approvals bar's ✕ on his iPhone.
