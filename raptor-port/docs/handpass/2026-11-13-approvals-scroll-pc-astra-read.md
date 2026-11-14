# Astra's code read — Approvals scrolling inside itself on a PC (13 Nov 26, at 0a1802567)

Saved as it arrived, read only by the host after the fresh read had reported too; the brief: §11 of `2026-11-13-approvals-scroll-pc.md`.

One confirmed regression, medium priority. I reviewed the requested version without changing files or reading the other reviewer’s report.

1. **Crossing 700px resets the open calendar’s month.**

   Open Approvals, press “Pick dates…”, and browse from January to April without selecting a date. Narrow the window below 700px, then widen it again. The calendar returns to January, so the person must find April again.

   **Cause:** [ApprovalsPage.tsx:497](C:/Users/User/projects/Raptor/raptor-port/src/leavewar/ui/ApprovalsPage.tsx:497) switches between two different parent structures. React destroys and recreates the calendar at each crossing. Its month is local state, initialised at [DateCal.tsx:200](C:/Users/User/projects/Raptor/raptor-port/src/ui/DateCal.tsx:200).

   **Evidence and confidence:** High. An in-memory check using the real page and calendar reproduced this. On main, April remained April through both width changes and the calendar stayed mounted. In this version, it became January and the calendar was replaced.

   **Exact fix:**
   - Keep the calendar under the same mounted parent at both widths. For example, keep one wrapper and use `display: contents` on the phone, applying scrolling and sizing only on desktop.
   - Preserve the existing phone appearance and whole-page scrolling.
   - Extend the width-change test: browse to another month, cross 700px both ways, and assert that the calendar retains that month. Also cover an open month/year chooser. The current test checks sizing and structure with the calendar closed, so it misses this regression.

What I checked and found sound:

- The shared height calculation preserves the previous Balances calculation, including fractional-height handling.
- Hiding Approvals removes its fitted height and body adjustment; unmounting removes the body adjustment too. These passed the in-memory check.
- A scroll event while hidden does not overwrite the saved list position. The check restored the saved position correctly.
- Navigation keeps the OIL tracker over the existing Approvals visit. Balances and Approvals remain mutually exclusive.
- The desktop calendar now sits inside the scroller and opening it resets that scroller to the top.
- The selector inventory found no live consumer relying on the headings’ former location inside the list.

The short-list test measures only the assigned page height, but the new browser test separately measures the card’s edge across month choices. Neither is presented as proof of fractional-height browser behaviour.

Browser verification was unavailable because the browser connection failed. I therefore did not independently verify real 125% geometry, narrow-window painting, or overlay/left-side scrollbar behaviour. I did not rerun the repository suites.

Tidiness: the shared height helper removes duplication. Apart from the parent switch identified above, I found no unnecessary complication or unused addition.

Rulings: none this session.

