# Pictures for his questions — round 2 and round 3 of the Leave War's bid windows (24 Oct 26)

Made by `raptor-port/scripts/handpass/lw-r2r3-questions.mjs` on the built app served at port 4180 (branch
`claude/lw-m3-placing-leave`), each size in a fresh browser on real storage, every fixture placed through the app's own
controls and checked before its picture. Phone = 402 × 874 at 3× (his iPhone's size); desk = 1440 × 900 at 1×.
Each picture is cut to what its question is about; the place is marked with a dashed cyan box (a dashed cyan rule where
a row was taken away) and a label on the picture says "Today:" (real — nothing added but the mark and the label) or
"Drawn:" (the app's own nodes and classes, changed on the page). Passing notes were hidden. No fixture failed: nothing is
NOT DONE.

| Picture | Q | Real / drawn | What it shows | What the drawing touched that the question did not name |
|---|---|---|---|---|
| `q1-ref-approved-phone.png`, `-desk` | Q1 | real | Drifter, Fri 6 Nov: a pending LL approved from its window, the window opened again. Approve is lit (stronger green fill, solid green edge, near-white words) and LL wears the cyan ring. The look the drawing copies was read here. | — |
| `q1-today-refused-phone.png`, `-desk` | Q1 | real | Drifter, Wed 4 Nov: a pending LL refused from its window, the window opened again. Nothing is lit: Refuse wears its everyday look and no leave button is ringed. (The app does tell a screen reader that Refuse is pressed, but nothing shows it.) Marked: the actions row and the leave buttons. | — |
| `q1-drawn-refused-phone.png`, `-desk` | Q1 | drawn | The same window with Refuse lit and LL ringed. | Refuse's lit look is Approve's recipe in Refuse's own red: fill red at 45%, a solid red edge and near-white words (#FFF2F3). The app has no lit red yet, so these values are a design choice. LL's ring is the app's own lit class. |
| `q1-today-daylist-phone.png`, `-desk` | Q1 | real | Drifter, Thu 5 Nov: an approved morning LL, and an afternoon LL refused from the day's list. The day opens the list, and the refused entry's Refuse is not lit. Marked: the refused entry. | — |
| `q1-drawn-daylist-phone.png`, `-desk` | Q1 | drawn | The same list with the refused entry's Refuse lit. | The day's list. The question named the one-day window, and the list is drawn too because both windows have one actions row (D1330). The red values are the same as above. |
| `../rewalk/found-daylist-edge-phone.png` (moved there: the re-shoot of Q1 on the fixed build, 7524a8388, replaced the q1 pictures) | — | real | **Not a question: a fault seen.** On the phone, each entry's actions row and its Remarks/Document row end 8 px past the line where the title's ✕ and the entries end (measured: 385 against 377 on the 402-wide screen; the window's border is at 390). On the desktop they line up (987 = 987). Marked: the strip they overhang, and the ✕. | — |
| `q2-today-a-phone.png`, `-desk` | Q2 | real | Ranger signed in as the member (us/us). He taps his approved LL on Tue 10 Nov, which the admin placed approved with "Wedding" typed. The older remarks window opens: a DOCUMENT row, then a REMARKS label above a light box holding "Wedding", then its own Save. Marked: the labelled rows, and Save. | The brief said "a light one-line box". It is a tall box: 68 px, about three lines, at both sizes. |
| `q2-today-b-phone.png`, `-desk` | Q2 | real | He taps Wed 21 Oct, which is before today and so closed for him, holding his pending LL. The closed-day window opens: YOUR BID (LL, whole day, pending), the pending note, DOCUMENT, REMARKS (a light one-line box and its "till 21 Oct" tick), SELECTED with Delete, then CSE and OD. Marked: the Document and Remarks rows. | — |
| `q2-ref-bidrow-phone.png`, `-desk` | Q2 | real | Where the clone comes from: his own bid window on an open day, Mon 14 Dec. The admin opened December for bidding for this picture. It has the one row: the dark Remarks box, the "till 14 Dec" tick and Document. | December was opened for bidding (`od-month-2026-12`) only so this window could be shown. |
| `q2-drawn-a-phone.png`, `-desk` | Q2 | drawn | The remarks window with its two labelled rows replaced by the bid window's one row, cloned from the picture above: "Wedding", "till 10 Nov", Document. | Save is removed too: the bid window's row saves itself when the box is left, so the drawing has no Save. The label says "no Save". |
| `q2-drawn-b-phone.png`, `-desk` | Q2 | drawn | The closed-day window with its Document and Remarks rows replaced by the one row: an empty "Remarks" box, "till 21 Oct" and Document. Delete is kept. | Only the two words rows were replaced. The YOUR BID row, the pending note, SELECTED · Delete and CSE · OD are left as they are. |
| `q3-today-empty-phone.png`, `-desk` | Q3 | real | Drifter has two pending LL bids, Tue 8 and Wed 9 Dec; the first carries "Wedding". A drag over the two days opens the drag window, and its Remarks box is empty. Marked: the row. | — |
| `q3-today-typed-phone.png`, `-desk` | Q3 | real | "Exercise" typed into the drag window's box. When the window was then closed with ✕, the 8 Dec bid still said "Wedding" (read from what was saved). | — |
| `q3-drawn-a-phone.png`, `-desk` | Q3 | drawn | Drawn A: the box shows the bids' own words, "Wedding". | The two bids hold different words: 8 Dec says "Wedding" and 9 Dec has none. The drawing shows the first day's words, so which bid's words the row shows when they differ is still open. |
| `q3-drawn-b-phone.png`, `-desk` | Q3 | drawn | Drawn B: the Remarks row is not drawn. A dashed rule marks where it stood, between the actions row and Duration. | — |
| `r1-today-window-phone.png`, `-desk` | R1 | real | Drifter, Mon 30 Nov, holding an approved morning LL. The window lights AM in Duration and rings LL. Marked: the Duration row and OD. What OD does was first read on Fri 27 Nov set up the same way, so the label says what was seen. | — |
| `r1-today-cell-phone.png` | R1 | real | After OD is pressed in that window: a whole-day OD, drawn full height on the left, and the morning LL in the top right corner of the same day. | The desktop copy was dropped: at the desktop's 1× the day's cell is about 20 px across. |
| `r2-today-od-phone.png` | R2 | real | Tue 15 Dec. Required P was typed equal to Available P (28), then an OD was filed for Drifter from the one-day window. Available P went 28 → 27 and turned red. **A bubble does appear**, under the Manning button: "This bid turns Available P red." No bubble was up while the window was open, before OD was pressed. Marked: the bubble, and Available P. | The question expected no bubble here. |
| `r2-today-bid-phone.png` | R2 | real | For comparison, Thu 17 Dec set up the same way, with a pending LL bid placed for Ridge (the row under Drifter). The same words appear, "This bid turns Available P red.", in the bubble at the foot of the screen with Show ›, because the Manning button had scrolled out of view. Marked: the bubble. | Ridge on a second weekday, as the brief allowed. On 15 Dec Available P was already red, and a bid only raises the bubble when it makes a row worse. |
| `r3-today-before-phone.png`, `-desk` | R3 | real | The Inputs page's SANS calendar, December, the week of 7–13 Dec. On Thu 10 Dec, Required P was set to Available P + 2 (30 against 28), and pilots still needed reads 2 (WSOs "–"). Marked: the still-needed figures. | — |
| `r3-today-after-phone.png`, `-desk` | R3 | real | After a whole-day UNA placed on Drifter on 10 Dec from the Leave War (Available P 28 → 27), pilots still needed reads 3, and the figure turned from yellow to orange. | — |

Readings the labels were built from:

- Q1: the approved Approve's fill was rgba(87, 201, 122, 0.45).
- R2: Available P on 15 Dec went 28 → 27, and the cell is classed "under".
- R3: the SANS figure on 10 Dec went "2 –" → "3 –".
- No console errors, page errors or failed requests were seen at either size.
