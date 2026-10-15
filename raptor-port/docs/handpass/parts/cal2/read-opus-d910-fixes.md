# Calendar step two — the fresh, blind Opus read of the D910 fixes (round 1 of the fixes, 15 Oct 26, night)

**What was read:** the working-tree diff that fixed the five findings of `read-opus-d910.md`, by a second fresh Opus
reader that wrote none of it and had not seen the first read (the order §5, "a fix is new code"; D790, D903). Read
only; it ran nothing. Its whole report is kept in the chat; the findings and the disposition of each are here.

## Findings, and what was done

| # | Finding (the reader's) | Disposition |
|---|---|---|
| R1 | The dates box now fills the row's leftover width (`flex:1 1 0`), and the outside-press check asks whether the press is inside that box — so a tap on the row's blank stretch beside the dates button no longer closed the pop-up (the standing rule: a click-open popup closes on a click outside it, 4 Sep 26). | **FIXED**: only the box's button and pop-up take a press (`.inputs-top>.inrange{pointer-events:none}`, its children `auto`) — a tap on the blank stretch falls to the row and closes the pop-up. Pinned: `e2e/inputs-calendar.spec.ts` "D910 — a phone …" (a tap on the blank row closes the pop-up). |
| R2 | The dates button's finger-sized press area (its `::after`, 4px past its edge — D698) was clipped by `overflow:hidden` on the button (older than these fixes, kept by them). | **FIXED**: the button clips nothing; the label inside cuts itself. Pinned: the same test (a finger 3px above the dates button meets it). |
| R3 | The new browser test walked the calendar "next" only, so from January 2027 (the pop-up opens on the default window's month, by the real date) it would fail with no code change. | **FIXED**: it walks each date's month either way, reading the calendar's own month, as the unit test does. |
| R4 | The short form printed the year twice for two months of the same other year ("4 Jan 2027–1 Feb 2027"). | **FIXED**: what the two dates share is said once — "4 Jan–1 Feb 2027"; every earlier expected label unchanged. Pinned: `inputslist.test.tsx` "two months of the same other year name the year once" (red on the round before). |

**Notes taken:** with the dates pop-up open, Enter on the filter button (no tap outside) left both open on a phone —
now opening the filters closes the pop-up on a phone, as opening the dates closes the filters (pinned:
`inputslist.test.tsx` "opening the filters closes the dates pop-up, by keyboard too"). **Notes left as they are:** at
701–820 wide an admin's open "Default window" editor makes the pop-up wider on one line (still on the screen); a
one-day window reads "15 Oct → 15 Oct" in the long form (as it always did) and "15 Oct" in the short; the walk
scripts' `innerText` reads of the dates button (not gates).

The round's own fixes are small (two style lines, one label function, one test's walk) and each is pinned by a test that
failed on the round before; a third narrow read is the agent's call against the order's cap of about three rounds —
see the sheet §11.
