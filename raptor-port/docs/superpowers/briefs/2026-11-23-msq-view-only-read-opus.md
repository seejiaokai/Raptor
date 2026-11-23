# The fresh blind Opus read — a squadron he only views, and the ☰ menu's squadron drop-down (23 Nov 26, HEAD cd94a4e8e)

Brief: `2026-11-23-msq-view-only-read-brief.md`. Three faults; the landing otherwise traced right on every path (bell
lines, "Check my quals", the Tracker's sign-out question, picks, the member-view switch, midnight), the re-entry from
inside notify safe, no way in found.

- **F1 (moderate):** a landing hides an open Leave War window (and D2323's band "This is 149's. You picked 150 — close this
  to go on.") behind a tab no longer offered — Hunter, Plan of 149, on 149's Leave War with a man's window open, switches
  to the member view (or picks a squadron he only views): the page jumps to View-only Sched, the window and his words out
  of sight, the war held on 149. Cause `state/store.ts` landOnOfferedPage and enterSquadron's landing ignore `holdNow()`.
  Fix: skip the landing while the page is the Leave War and `holdNow() === 'war'`; the window's close notifies and the
  landing runs then. Test: `setWarWindowsProbe(() => 1)`, switch to the member view, the page stays `leavewar`; probe 0,
  notify, `viewsched`. (A transient departure from D2381 to name to him.)
- **F2 (low):** one outside tap closes the squadron list and the ☰ menu together (`DrawerSquadron`'s pointerdown closes
  the list, the same press's click reaches `Drawer`'s outside-click). Fix: the surround's click does nothing while the list
  is open. Test: open the list, pointerDown + click on `#drawer`, `DRAWER` still true.
- **F3 (low):** the ☰ list's keys differ from the top bar's: Tab out leaves it open (no `onBlur`), Arrow Down on the
  button does not open it (no `onKeyDown`). Fix: copy both from `SquadronMenu`.

Tidiness (filed, not fixed): `DrawerSquadron` repeats `SquadronMenu`'s open state, outside press, Escape and arrow keys
almost word for word (F3's drift); the landing on View-only Sched done twice (enterSquadron and landOnOfferedPage);
`Drawer.tsx`'s header "every action closes the drawer" no longer true (D2384); the access line wears `drawer-acct`;
`pageOffered` recomputes the squadron list per call.
