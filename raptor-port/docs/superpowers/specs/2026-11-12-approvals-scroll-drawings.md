# Approvals scrolling like Balances — the drawings and the questions (12 Nov 26)

Backlog item [APPROVALS-SCROLL-INSIDE]; his ruling D1986 (11 Nov 26): *"can u make the approvals scroll similar to the
balances as well"*. Drawings only: nothing in the app has changed. Pictures: `raptor-port/docs/img/mock/2026-11-12-approvals-scroll/`
(each says on itself whether it shows today's app or a drawing; the yellow marks show the place that changes). Made by
`raptor-port/scripts/handpass/appr-scroll-draw.mjs` on the real page, the change laid over it, so every part is the app's own.

## Look at these first

1. **On your PC: should the Approvals page fit the screen, with only the list scrolling, as Balances does?**
   Recommended: yes. Pictures 1 (scrolled part-way: today above, the drawing below), 2 (at the top) and 3 ("Back to
   Approvals", the approved line still lit, the new dots).
2. **On your iPhone: A or B?** A is the same as your PC: the title, the chips and the column headings stay, and only the
   list scrolls. B is as today: the whole page scrolls. Recommended: A. Picture 5 (A and B side by side), picture 6 (A
   after "Back to Approvals").
3. **A short list that does not fill the screen: should the card still reach the foot of the screen, empty below the
   last request?** Recommended: yes, as the Balances card does, so the card's edge stays put when you pick a month.
   Pictures 4 (PC: today and the drawing) and 6 (iPhone: the two on the right).

## What the drawings show

- **Today:** the page is as tall as its list. Scroll it and the whole window moves: the tab row, the title, the date
  chips, Approve all and the column headings all go out of sight (pictures 1 and 5).
- **The drawing:** the page fills the screen under the tab row, as the Balances page does. The title, the date chips,
  Approve all and the column headings stay in place, and only the list of requests scrolls, inside the card. The window
  behind it does not move. The last row at the card's foot is cut, under the same soft fade the Balances card has, so
  it is plain there is more below. The title already says how many are pending.
- **Kept as they are:** the "Back to Approvals" bar on the grid; Back returns you to the same place in the list; an
  approved or refused line stays lit; the blue dots on new requests and the "New" count (pictures 3 and 6). On the
  phone the request lines have no dot today, only the "New" count, and that does not change.

## Why A is recommended on the phone

The Balances page already scrolls inside itself on the phone, so the two pages would work alike on both devices.
Approve all, the chips and the column headings also stay in reach while you work down a long list. The cost: about six
requests are in view at once instead of about nine, because the title, the chips and the headings keep their room.

## Sizes

Your PC: 1536 wide, a window 733 tall at 125% (as measured for the Balances fix). Your iPhone: 402 × 874. Pictures are
at twice the screen's sharpness. The requests are the demo's eleven plus a few more filed for the drawing: three by a
member, so the new dots show, and six by the admin.
