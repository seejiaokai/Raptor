**Two phone Balances regressions need correction and browser reproduction before acceptance.** I found no defect in the changed OIL saving path or the saved period name.

I reviewed the supplied export and change against the four promises. This was a blind, read-only code review: I changed nothing, ran no tests, and viewed no browser results or other reviewer’s report. The omitted handoff was not read. The findings below are supported by the code; their visible outcomes still need reproduction using the exact inputs described.

1. **[P2] Figures can show through the pinned name column on a phone.**

   **Setup and action:** At a phone viewport of **402 × 874**, open Balances with a short callsign such as Bane and **No grade**, at normal zoom. Slide the figures sideways.

   **What the person would see:** The dark backing behind each pinned name can end before the name column ends. Scrolling figures and headings can therefore appear inside the space reserved for names, with different coverage widths on different rows.

   **Cause:** The new phone alignment rule gives **every** heading and row child `justify-self: start`. That includes the pinned name heading and name cells. Their backgrounds previously stretched across the first grid column; they now shrink to their contents. Keeping `align-self: stretch` only preserves their height.

   The affected rule is in [the phone alignment styles](C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/412624af-f93d-4b92-b143-0d2f8a03fb43/scratchpad/read-copy/repo/raptor-port/src/leavewar/ui/balances.css:189).

   **Exact fix:**

   1. Keep left alignment for the numerical columns.
   2. After the new alignment rule, restore horizontal stretching specifically for the pinned heading and name cells:
      ```css
      .bp-zoom.bal .bp-cols > span:first-child,
      .bp-zoom.bal .bp-row > .bp-who {
        justify-self: stretch;
      }
      ```
   3. Preserve their existing opaque backgrounds, sticky positioning and stacking order.
   4. Use the grid’s width rather than adding a separate fixed width, so the correction follows pinch zoom.

   **Exact proof input I would run:** Use Bane with No grade; viewport **402 × 874**, zoom **1**, horizontal scroll positions **0, 100 and 220**. Measure both pinned elements against the **132px first grid track**, and inspect screenshots while figures pass behind them. Repeat as an unlocked member, a locked member, and after pinching out and back in.

   **Failure observation:** Either pinned element is narrower than its grid track, or a scrolling figure appears within that track. The corrected result must cover the full track throughout.

2. **[P2] Focusing a balance box can leave its pending tag cut off.**

   **Setup and action:** Give Bane a newly submitted, unapproved **½-day PL request**. On phone Balances, slide the PL box near the right edge, then tap it.

   **What the person would see:** The editable box is visible, but its amber pending tag can extend beyond the screen. The existing “bring this box and its pending figure into sight” behaviour no longer covers the whole figure.

   **Cause:** The changed tag is absolutely positioned **12px beyond its box**. The existing focus handler still measures the containing cell’s ordinary bounding rectangle, which excludes that overflow. With the box ending 4px inside the scroller, the tag can end **8px outside it** at normal zoom.

   The new positioning is in [the pending-tag styles](C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/412624af-f93d-4b92-b143-0d2f8a03fb43/scratchpad/read-copy/repo/raptor-port/src/leavewar/ui/balances.css:137); the missed consumer is [the focus-reveal calculation](C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/412624af-f93d-4b92-b143-0d2f8a03fb43/scratchpad/read-copy/repo/raptor-port/src/leavewar/ui/BalancesPage.tsx:579). Extra padding after the final column does not correct focus handling in a middle column such as PL.

   **Exact fix:**

   1. In the existing focus handler, find the focused box’s containing cell.
   2. Measure that cell and its pending tag, when present.
   3. Use the union of their left and right edges for the reveal calculation.
   4. Keep the existing clearance from the pinned names and the scroller’s right edge.
   5. Strengthen the browser test with the deliberate edge position below; focusing a completely offscreen box may let the browser scroll far enough to hide the defect.

   **Exact proof input I would run:** In a fresh **1–31 January 2028** period, give Bane **2 days PL** and submit **PL, PM, 14 January 2028**, with automatic approval off. At **402 × 874**, zoom **1**, position `bal-PL-bane` so its right edge is exactly **4px inside** `bal-scroll`. Tap the visible centre of the input and wait two animation frames. Measure `bal-opd-PL-bane`.

   **Failure observation:** The tag’s right edge exceeds the scroller’s right edge. After correction, the whole box and tag must lie inside the available area, clear of the names. Repeat with keyboard focus and at a second zoom level.

The following are the explicit negatives and coverage boundaries from the code read. “Nothing found” here means no additional code defect identified, not a browser pass.

| Promise and surfaces traced | Result |
|---|---|
| **OIL award editor:** awards created through the grid and through the tracker’s award form; active awards and awards shown through Archive | I checked these and found nothing. They reach the shared award editor. The amount, half, reason and given-by reach the ledger update; the award date remains immutable. |
| **OIL opening routes:** top-row OIL from Grid, Balances and Approvals; a person’s OIL link in Balances; OIL from the person window, including My leave | I checked each route and found no missing use of the changed editor. Person-specific and everyone views converge on the same tracker. |
| **OIL roles and related objects:** admin/member access, period state, automatic credits, opening balances and corrections | I found no new permission bypass. Members do not receive award editing. Automatic credits and opening balances are not editable awards; corrections deliberately retain their separate editor. |
| **New period:** ordinary New period, Create first period, the Holidays uncovered-range action, and the waiting-holiday action | I checked each route and found nothing. They use the shared form; supplied dates also generate the name. The Holidays form retains its raised overlay placement. |
| **Period-name saving and readers:** automatic name, manual override, clearing, date changes, creation, selected-period display and other period-name consumers | I found no missing save call or stale alternate name source. Creation stores the displayed name, then selects the created period. Role and overlap checks remain in place. Clearing resumes automatic naming on the next date change, as the brief specifies. |
| **Balances:** desktop table, phone grid, LVE and CCL/FCL/PL/EL/CL; editable and read-only rows; member lock; person and OIL links | Apart from findings 1–2, I found nothing. Both layouts use the shared pending-tag renderer. LVE pending loses the minus while the war-balance calculation remains separate. Read-only widths are explicitly restored. |
| **Balances neighbours:** Days taken, person-window tiles, grouping, searching and phone pinch calculation | I found no additional changed behaviour. The new alignment is scoped to Balances; person-window tiles are excluded. Pinch minimum still derives from the rendered column width. Actual fit and read-only text alignment remain browser checks. |
| **Grid hover:** empty, whole-day, half-day and multiple-entry person cells; own row and other rows; admin/member and read-only periods | I checked these and found nothing. The selector reaches the shared person-day cell, without needing separate calls for its contents. |
| **Grid exclusions and competing marks:** names, headings, counters, events, selected cells, drag selection, move landing, just-added ring and row-rearrangement landing | I found no missing exclusion in the changed rule. Stronger marks are excluded, the own-row lines are preserved, and the new ring adds no fill. The rule is restricted to hover-capable devices. |

The writer/reader chains I traced were:

- **Balances:** stored balances and requests → existing figure calculations → desktop/phone rows → editable box or read-only figure. The changed tag introduced the missed focus-reveal dependency in finding 2.
- **OIL:** grid/tracker award creation → ledger entry → shared tracker editor → validated ledger update → persisted state and OIL calculations. No accounting calculation changed.
- **Period names:** ordinary or prefilled form → automatic/manual name → period creation → persisted period → period selector and other name displays.
- **Hover:** existing cell and interaction classes → CSS ring. There is no new data writer or event handler.

For the remaining proof checks, I would run these exact inputs, starting with the specialised surfaces and saved data:

| Priority | Exact input and action | Required result; observation that disproves correctness |
|---|---|---|
| **1 — OIL saved fields** | Fix today at **17 November 2026**. Create a fresh **½-day PM** award for Bane dated **17 November 2026**, reason **“Weekend duty”**, given by **“Duty officer”**. Change to **AM**, reason **“Revised duty”**, given by **“Operations”**; save, close, reopen and reload. | All four edited values survive; date remains 17 November. Any changed date, lost field or wrong half disproves correctness. |
| **2 — OIL layout and transitions** | On that award, enter amounts **0.5 → 1 → 2.5 → 0.5 → 3**. At 0.5 choose PM. Arm Delete once, then cancel editing. Run at **1440 × 900** and **402 × 874**. Repeat on a freshly created award subsequently made spent and shown through Archive. | Date, text fields and action buttons keep their positions. AM/PM space is blank outside 0.5. Delete’s width does not change. Cancellation changes no saved fields. |
| **3 — OIL guards** | Try amount **0.75**, then an empty required reason. Cancel. Switch to member and reopen through each OIL route. | Invalid saves are refused without changing the award; the member has no editing gesture. |
| **4 — First and prefilled periods** | In an isolated empty world, create **15 January–10 March 2027** through Create first period. Separately open each Holidays route with **1 December 2026–28 February 2027** prefilled. | Names are respectively **JAN - MAR 27** and **DEC 26 - FEB 27**. A blank or different initial name disproves correctness. |
| **5 — Name action order and persistence** | In separate clean cases choose **15–20 January 2027**, then extend to **10 March 2027**. Type **“Exercise window”**, change the end to **30 April**, clear the name, then change the end to **31 May**. Create and reload. Also close and reopen the form. | Names progress **JAN 27 → JAN - MAR 27 → Exercise window → JAN - MAY 27**. Reload preserves the saved name; reopening does not inherit a cancelled manual override. |
| **6 — Balance presentation** | Fresh LVE pending **1.5**, PL pending **0.5**, CL pending **1**, and zero pending for another kind. Compare admin, unlocked member and locked member at both viewports; pinch until every column fits. | Correct unsigned amber tags, no tag for zero, correct heading/group boundaries, and read-only figures aligned with editable figures. Apply both finding-specific edge tests above. |
| **7 — Hover precedence** | Mouse over an empty day, whole-day entry, half-day entry and two-entry day on own and another row. Repeat with a selected cell, active drag, move landing, just-added mark and row-rearrangement landing; repeat in a read-only period. Then use touch-only **402 × 874** emulation. | Eligible desktop cells show the thin hollow cyan ring; stronger marks remain intact. Names/events do not gain it. Touch leaves no new hover ring. |

The added tests cover useful ordinary cases, including award layout transitions and period-name changes. They do not replace the two deliberately positioned phone checks above. I did not execute them or claim their results.

**Tidiness, filed only:** The new phone column definition is added below an older definition with the same selector, leaving the earlier Balances track list overridden. Consolidate those definitions when fixing the phone styles so there is one authoritative column list. I found no other clear misleading name or dead changed code worth filing; the shared pending-tag component and name formatter are appropriate reuse.

**Rulings: none this session.**