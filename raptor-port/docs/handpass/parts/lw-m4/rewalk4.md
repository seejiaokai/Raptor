# M4 re-walk 4 — D1444 (phone top of Approvals) and D1445 (slim bar fill), 28 Oct 26

Build served frozen on 4173 (index-DsQE-OWg.js). Chromium, fresh world, phone 402 / 390 / 360 x 874 by finger (touch events), desktop 1536 x 860 at 1.25. Scripts `scripts/handpass/lw-m4-rw4-h1.mjs`, `-h2.mjs`, `-h2b.mjs`, `-h4.mjs`. Pictures `docs/img/handpass/2026-10-27-lw-m4/rewalk4/`. Drawing compared: `d1439/demo-402-pair.png` (right half).

| Step | Verdict | Pictures | What they show |
|---|---|---|---|
| H1 phone 402 top | PASS | h1-top-402.png | Title line "Approvals  6 pending  +2 in JAN - DEC 27 ›"; row 1 New 0, All, Jan, Feb only; row 2 Pick dates… left and Approve all 6 right. Same as the drawing's right half. |
| H1 tap the link | PASS | h1-link-q.png, h1-after-link.png | The other period opens: View reads JAN - DEC 27, "2 pending", chips All, Apr, May, link now "+6 in JAN - DEC 26 ›". |
| H2 a bid in a month with none: its chip appears in place | PASS | h2-0-start.png, h2-1-chip-appears.png | Member's Mar bid; back as admin: chips Jan, Feb, Mar (Mar after Feb), "7 pending · 1 new", Mar bid line. |
| H2 tap the Mar chip | PASS | h2-2-pick-q.png, h2-2-picked.png | Mar lit; the list holds that one line only. |
| H2 delete the bid, chip not picked | PASS | h2-4-replaced.png, h2-5-deleted-unpicked.png | Member deletes his Mar bid; back as admin: Mar chip gone, Jan and Feb only, 6 pending. |
| H2 delete while Mar is picked | observed (no verdict asked) | h2b-1-picked.png, h2b-2-deleted-while-picked.png | Chip STAYS while picked, drawn dim and lit; the line stays with "No longer there" in red, Approve / Refuse greyed, Approve all 0, header 6 pending. Tapping All then drops the chip. See note. |
| H3 phone 390 | PASS | h1-top-390.png (geometry) | Same top; every chip one line (heights 36); link on title's line; no sideways scroll. |
| H3 phone 360 | PASS | h1-top-360.png | Same top, nothing cut, no chip on two lines, link on the title's line at 360 (it had room). Column heading "LOWEST AVAIL" takes two lines (expected). |
| H4 phone slim bar | PASS | h4-phone-dates-q.png, h4-phone-bar.png, h4-phone-bar-zoom.png | Computed fill rgb(22, 27, 34), edge 1px rgb(42, 49, 58); "Approvals 6 pending", plain cyan "Back ▴" (no border), plain "✕". 8 in, 46 tall. |
| H4 desktop slim bar | PASS | h4-desk-bar.png, h4-desk-bar-zoom.png | Fill rgb(22, 27, 34); compact, centred (338 x 44); same words, plain cyan Back ▴, plain ✕. |
| H5 desktop top | PASS | h5-desktop-top.png | All twelve month chips; link "+2 pending in JAN - DEC 27 ›"; unchanged. |

Counts: PASS 10, FAIL 0, NOT WALKED 0 (plus one observation).

## Notes
- The delete-while-picked case was reached two ways. By screen controls (the grid's own Delete as admin) the page was left, and returning to Approvals showed the pick reset to All and the Mar chip gone — it cannot be done with Approvals open and a month picked. With Approvals open and Mar picked, the bid was cleared with the app's test hook (window.lwSetCell with an empty code) — a direct data change, not a pressed control — and shows the chip staying (dimmed) until another filter is tapped.
- Time stamp "28 Oct 05:33" in PLACED is the real clock; irrelevant.
- No console errors, page errors or 4xx on the runs.

## Faults
None.
