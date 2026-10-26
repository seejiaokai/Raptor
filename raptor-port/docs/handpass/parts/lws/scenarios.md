# The Leave War small fixes — the scenario designer's report (21 Oct 26)

A fresh, blind Opus helper (the order's §5, FULL: "the other model designs the scenarios"; ChatGPT is out, D761 — so a
fresh Opus, never Fable, D903). It read the rulings, `ui-contracts.md` and the screens' source to see how each surface is
reached; it did not read the diff, the branch log or the three new test files, and changed no file. Its report, as
returned (the host's dispositions are in the evidence sheet, `../../2026-10-21-leavewar-small.md` §13):

---

Sizes: S is about 2 min, M about 5 min, L about 10 min or more. Sign in as admin ad/a unless a step says otherwise. Run
every scenario at desktop 1400×900; those marked "phone" also at 390×844. Do the member scenarios BEFORE any delete, and
never delete `us`, because later steps need that login.

**Order the walker needs first: a Delete posting dated in the future.** Pick a man with an account who is not `us`, has no
leave in the coming weeks and has a seat on some future schedule day. Call him H. On his row, tap a day → PO → chip
"Delete" → date = today + 10 → "Post out" → "Tap again to delete H". His days from that date are now struck. Tapping a
struck day opens the Post out sheet: "PO from" box, four chips, one line, Undo post out (PO), and "Place leave or OIL here
instead…".

### Item 7 — the Post out sheet's date asks before a delete (D1102)

1. **(M, phone + desktop) Move the date to today.** Open H's Post out sheet → date box → pick TODAY. Expected: the box and
   the line both show today, "Tap again to delete H" appears, and H still exists. Close with ✕ and reopen: the box shows
   today + 10, with no "Tap again". Admin → Users still lists H with the amber "posting out … · Delete" tag.
2. **(S) Yesterday also asks; tomorrow does not.** Repeat 1 with yesterday: it asks. Then pick TOMORROW: no ask. The date
   saves at once (box, line and the Admin → Users tag all show tomorrow) and H is not deleted. Put the date back to
   today + 10 afterwards.
3. **(S) Picking the date that already stands.** Pick today + 10 again: nothing changes and there is no ask.
4. **(M) Confirm the delete.** Repeat 1, then tap "Tap again to delete H". Expected: the sheet goes and H's row leaves the
   war; H is gone from Admin → Users, Archived included; his sign-in fails; a past schedule day he flew still shows his
   puck; a future day he was on shows the seat empty (a published day reads pending); the top-bar Undo does NOT bring him
   back (D350) and leaves no half state. Run this only once, at the end of the item 7 set.
5. **(S) Ask, then pick another past date.** Ask with today, then pick yesterday: the box and line show yesterday and it
   still asks. Tap → the delete is saved dated yesterday (check H's struck-from day).
6. **(S) Ask, then pick a future date.** Ask with today, then pick today + 20. Record exactly what happens. The brief says
   the posting stays "as it was". The contract's wording ("a date still to come … is saved") suggests today + 20 is saved,
   with no ask and no delete. The host must say which is right. Either way: no delete, and no "Tap again" left on screen.
7. **(S) A chip while asked.** Ask with today, then tap "Overseas Sqn". Expected: the ask goes, the box goes back to
   today + 10, and the outcome is STILL Delete (the line says delete). A second tap of Overseas Sqn then changes the
   outcome normally, with the date still today + 10. Repeat with the selected Delete chip itself and with SANS: each only
   backs out.
8. **(S) The Delete chip's ask, then the date (stored outcome Overseas Sqn).** Tap Delete (it arms "Tap again"), then pick
   a FUTURE date. Expected: the arm goes, the date saves, the outcome stays Overseas, and no delete. Then arm Delete again
   and pick TODAY. Record the result: by the code's reading the arm goes and the date saves at once with Overseas, so he
   is archived and his account suspended at that one tap. That is reversible, but flag it if the host thinks the armed
   Delete should carry into the date ask.
9. **(S) Undo post out while asked.** Ask with today → "Undo post out (PO)". Expected: the posting is gone entirely (his
   days un-struck, the Admin → Users tag gone) and he is not deleted. Then the top-bar Undo puts the Delete posting back
   at today + 10, not at today.
10. **(S) "Place leave or OIL here instead…" while asked.** Expected: the leave sheet opens for that day. Close it and
    reopen the Post out sheet: today + 10, no ask, H intact.
11. **(M, phone + desktop) Leave the page while asked.** Ask with today, then go to another page and come back. If the
    sheet is still up: it shows today + 10 and no "Tap again". One tap anywhere must not delete. Repeat with the Delete
    chip armed (stored outcome Overseas): disarmed on return.
12. **(S) The admin's member view while asked.** Ask, then tap the role badge to the member view. The sheet goes. Switch
    back to admin: no sheet, or a fresh one without the ask. Not deleted.
13. **(S) Reload while asked.** Posting unchanged.
14. **(S, desktop) Another man while asked.** Tap a different man's struck day. The first tap only closes the sheet
    (scrim). The next opens his sheet with no ask, and its "Tap again" names HIM if armed — never the old one.
15. **(S) Undo, and a second tab.** Ask with today, then press the top-bar Undo (if it can be reached past the scrim). If
    the posting under the sheet changes, "Tap again to delete H" must not stay live on a posting that is no longer a
    Delete. Second tab: ask in tab 1; in tab 2, Admin → Users → change or remove H's posting. Back in tab 1, tap "Tap
    again". Record the result; a delete of a posting already taken back is a FAIL.
16. **(M) The last-admin hold.** Make `ad` the only admin who can sign in. Post `ad` out: Delete, future date. Move the
    date to today → ask → tap. Expected: the held note shows, `ad` is not deleted and stays signed in, and the date saved
    is today. Note whether the button saying "Tap again to delete ad" over a held delete reads as a promise it won't keep.
    Restore the admins afterwards.
17. **(S) A refused date while asked.** Ask with a past date EARLIER than H's post-in date. Tap → the refusal sentence
    shows, the box goes back to today + 10, and H is not deleted. Note: it asked "delete" for a date it then refused.
18. **(S) An archived man's sheet.** For a man archived on Admin → Users with a posting, the sheet is read-only: box
    disabled, no chips, the "Restore on Admin → Users" sentence. No ask is possible.
19. **(S) Member.** Sign in as `us`; tap a struck day of another man and one of your own (if any). No Post out sheet, no
    chips, no Delete. On a drag selection, no PO row.
20. **(M, phone + desktop) The other two Post out doors** (a man not posted out): the leave sheet's PO: Delete + today →
    "Post out" → arms "Tap again to delete X". Change the date: disarmed. Change the chip: disarmed. Arm again → leave
    the page → come back. The drag-selection PO: the same steps. Expected: an arm left across a page switch is taken
    back. The code suggests it is NOT, so this is likely a FAIL — report it either way. With two men selected, PO must
    not be offered.

### Item 6 — the phone draws a man's row when the month is pressed

21. **(L, phone) The original fault.** Admin → Users → add new person N with a post-in of 1 Oct → archive N → Restore with a
    post-in of 1 Nov. The Leave War page stays away the whole time. Then Leave War → press Nov: N's row is there, in the
    right group. Press Oct: compare with the desktop for October — phone and desktop must draw the same men for each month.
22. **(M, phone) Other changes made while the page is away**, each followed by return → press the affected month, phone
    matching desktop: (a) move a post-in later, Oct to Dec; (b) earlier, Dec to Oct; (c) a posting out with PO from 1 Nov:
    a row in Oct, none in Nov; (d) PO from 2 Nov: a row in Nov; (e) tick a man SANS with Show SANS off: his row leaves
    its group; (f) delete a man; (g) rename a callsign; (h) file clearing leave for a posted-out man in a month after his
    PO: his row appears in that month (the display span).
23. **(M, phone) A swap with the same count.** While away, archive man A AND restore man B into the same group. On return
    to the same month, A is gone and B is drawn, even though the number of rows is unchanged.
24. **(S, phone) Show SANS on the page itself** with a SANS man: his row moves in and out of the SANS group. The group
    heading counts follow.
25. **(M, desktop + phone) The frozen name column and the headings.** After 21–23: every name sits beside its own day row;
    each group heading's count equals the rows drawn under it for that month; no empty band, no row without a name.
26. **(S, phone) Swiping between months** after a change made while away: the rows change only at month boundaries.

### Item 2 — Reset order

27. **(M, phone + desktop) A difference only for a man not drawn.** In Rearrange, drag a man P with a PO before the months
    on screen to a non-default place, so the order differs only for him. ⚙ → "Reset order" is greyed. Bring P's months on
    screen: the line becomes active. Edges: PO from the 1st of the first month on screen → greyed; the 2nd → active. A
    post-in after the last month on screen → greyed. A posted-out man with clearing leave in a month on screen → active.
    SANS man with Show SANS off → greyed; on → active.
28. **(S) A hidden man between two drawn ones.** Default order A, X (not drawn), B. The hand order A, B, X → greyed. B, X, A
    → active.
29. **(S) Reset with a man not drawn.** When active, Reset (two taps) also puts the men not drawn back in default order.
30. **(M, phone + desktop) Leave the page while armed.** Tap once ("Really reset?") → leave the page → come back. The sheet
    shows "↺ Reset order", and one tap only arms again. Also: armed → close the sheet → reopen: unarmed. Also: armed, then
    the order turns default by another route and non-default again → never a live "Really reset?".
31. **(S) Other armed questions across a page switch:** the counter window's "Really delete?", the OIL tracker's "Really
    delete?", and the PO arms in scenario 20. Report each one.

### Item 1 — the drag-selection sheet's half-day chips

32. **(M, phone + desktop)** Drag across 3 days of one man → How much AM. Every "Which leave" chip reads like the one-day
    sheet's AM chips ("<LL"), never "*LL" or "LL*"; PM the same; Full plain. Every leave type. Fill AM LL by drag on one
    man and by the one-day sheet on another: the cells look the same, and the one-day sheet reopened on either shows the
    same chip selected. Then Move and Delete one half-day block; the below-zero ask (D418) still names the right leave.
    Member `us` dragging on his own row: the same labels.

### Item 8 — the clash note names the man

33. **(M, desktop strip + phone slim line) A SANS man with Show SANS off.** Show SANS on, give SANS man S a war bid on a
    date, Show SANS off. On the Inputs page, file a different leave for S on that date. The clash note shows S's callsign,
    never an internal id. On the phone, open the list: the names column lines up. Tap the row: it goes where its
    instruction says, with no error.
34. **(S) An archived man.** Make a clash for man A, archive A on Admin → Users, return: his callsign shows.
35. **(S) A deleted man with a clash on a past date.** Record what prints. His callsign or nothing is fine; an internal id
    or blank text is a FAIL.
36. **(S) A renamed man.** Rename a man with a clash: the note follows the new callsign.

### Break tests

- B1. The drag sheet's chips print the stored code → the drag-sheet half-label test.
- B2. Reset order judges the whole roster → the posted-out-only-difference test.
- B3. Remove the Settings sheet's page-leave listener → the "armed reset taken back" test.
- B4. Remove the Delete-date ask → the "moved to today deletes at one tap" test.
- B5. Make "today or earlier" strictly "earlier" → a TODAY-edge test. If none goes red, that test is missing.
- B6. Make "Tap again" save the stored date instead of the date picked → the confirm-saves-picked-date test.
- B7. Let a chip tapped while asked commit its outcome → the chip-backs-out test.
- B8. Remove the Post out sheet's page-leave listener → the page-leave test.
- B9. Phone row measure goes back to count-only → a swap test (scenario 23).
- B10. The clash note prints the id again → the clash-name test.
- B11. Undo the bridge's viewer pin → the bridge pin test (harness only).

### What I think may be missing

1. No rulings row for D1102 anywhere (only `ui-contracts.md` and the commit message cite it).
2. The brief and the contract disagree on a future date picked while asked (scenario 6).
3. The other delete arms are not taken back on a page switch (the leave sheet's and drag selection's "Tap again to delete
   X", the counter's and the OIL tracker's "Really delete?").
4. The ask is not checked again when the posting changes underneath (Undo, or a second tab — scenario 15).
5. "Tap again to delete" is shown for deletes that will not run: a refused date (17) or the last-admin hold (16).
6. An armed Delete chip followed by a past date archives the man at once with the old outcome, at one tap (scenario 8) —
   older behaviour; flag it for the owner's view, not as a regression.
7. Item 6's one known case may not be all: the same-count swap (23) and the display-span leave (22h).
