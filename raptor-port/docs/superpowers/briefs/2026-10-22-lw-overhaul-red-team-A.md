# Red team of the Leave War overhaul — reader A, the design (22 Oct 26)

Impeccable's critique lens on the guide, in one context (the target is pictures). Top rows judged from r4-*. Taps
start with the Leave War open.

## Findings, most serious first

**1. "My leave" list and the person window draw one person's leave two ways.** `r6-visit-A-phone-list`: tall cards,
the state a coloured framed word, "approved by Saber · 08:40", new-dots; no documents, balances, year, course or medical
lines; about 5 a screen. `r6-person-phone-member`: one-line rows, the state a plain word, a paperclip, a year picker,
balances on top; about 8 a screen. *Fix:* one window. A tap on "My leave" opens his own person window. Rows use its
line (box · dates · days · state · paperclip, lined up, lesson 29). Only a row that is new since his last visit gets the
cyan dot and a second, muted "who, when" line. A deleted leave shows struck through for that one visit. The title is his
puck (lesson 25). The same row also serves the day panel's "Away" list and the entry window. Taps: 1 → 1; rows a
screen: 5 → 8.

**2. The bid window's Document row cannot be reached.** A tap on a leave button writes the bid and closes the window
(`leavewar/ui/BidPicker.tsx`, `setCell` then `onClose`). Document is drawn under the buttons (`p-w7`, `r4b-win-B`).
*Fix:* Document above "Which leave"; a file picked first goes onto the bid that the leave tap writes. Taps with a form:
5 and the picker (place, reopen, Document, pick) → 3 and the picker.

**3. A member typing his official balance gets a wrong figure.** The official system counts approved leave only. The
window's box holds "left", which already counts his waiting bids (D1153), and his opening figure is worked out from it
(`state/store.ts setBalance` counts every bid not refused). Typing 14.5 with 5 days waiting adds 5 days, and leave placed
afterwards is wrong too, so D56 does not cover it. **Question for him:** while it is edited, the box shows and takes the
balance before waiting bids, with "before your 2 waiting (5 days)" under it. At rest there is still one figure (D1153).

**4. "Approve all" approves 15 people and rings 15 bells in one tap, and it is green.** The guide asks "sure?" where a
press touches other people or many things. *Fix:* the app's own "tap again" ask, inside the button ("Approve 15 — tap
again"); one Undo stays. Taps 3 → 4. The line buttons are filled green and red, but green already means the live
period, open dates, OIL and holidays, and red a clash (§4). *Fix:* "Approve all" in the main-button look; Approve and
Refuse plain, Refuse with red words.

**5. Windows sit over what they are about.** On a desktop, Approvals and the person window open in the middle of the
grid, covering 19–30 Jan, the days their lines name. On a phone, the bid window covers a tapped row in the lower half.
*Fix:* on a desktop, open docked to the grid's right edge (still draggable, D641), and "Show on grid" scrolls the day into
the open part and rings it. On a phone, the grid first scrolls the cell above the window, as for the keyboard (D1048).

**6. A member's phone shows the first name 460 of 844 points down (54%), 42 more than today.** The extra is the new "My
leave" line, while row 1 now holds only "View" (`r4-phone-member` against `t-phone-member`). Under Safari's bars about
four people show. **Questions for him:** (a) Manning's fold is remembered for each person, and a member opens folded,
saving about 70 points (today it always opens unfolded — `Matrix.tsx countsOpen`); the day panel and the bid line still
give the figures. (b) On a member's phone, "My leave" fills row 1's empty right half, saving 42 points; this narrows
D1141 and D678.

**7. Gestures that fight.** (a) Pinch (D1117) against selecting. A finger held 180 ms, or a slow slide after 140 ms,
arms a selection (`select.ts HOLD`, `SLOWARM`). A pinch's first finger is often held that long. *Fix:* a second finger
cancels a selection that is arming or armed. (b) "Open for bidding" months sit in two rows on a phone, so a drag from Jun
to Jul passes over Sep–Dec (D1169). *Fix:* the stretch runs from the first month to the one under the finger, in
calendar order, never along the path. **Question for him:** a drag that starts on an open month closes the months.

**8. "Approve what I enter" does not show its effect where he taps.** Ticked, a tap on a member's row approves the leave
and rings the member's bell, but the buttons look the same either way. *Fix:* the buttons speak look F: filled
(approved) while ticked, hollow and dashed (waiting) when not, and always for a member. "if you bid" becomes "if
placed"; a WSO's line reads Avail W.

**9. The admin's bid window wraps on a desktop.** CL sits alone, and +OIL · PO · PI make a row with no label
(`r4b-win-B`, lesson 26). *Fix:* two even rows of four, as on the phone (lesson 28); the admin's three get the label
"Also".

**10. The balance lock is set in Settings but seen in the person window.** *Fix:* a padlock on the Balances heading:
a toggle for an admin, a plain padlock for a member. Taps 2 → 1.

**11. A phone Approvals card is four lines (about 95 points), 3 a screen, so 15 waiting is 5 screens.** *Fix:* two lines.
Line 1: puck · box · dates · paperclip · Approve · Refuse. Line 2: the figures, under column headings drawn once.

**12. Smaller ones.** "+ SANS" sits under "ADD FROM QUALS" though SANS is not a qual, so keep "ADD A GROUP". Settings
lost its pointer to ⇅ Rearrange. REQ P and REQ W will rename (D1193) but are not underlined as tappable (lesson 27). The
day panel lists plain names (lesson 25). Management cannot be added until a Quals column exists, and Settings does not
say so. The pictures give Ranger 14.5 on the line and 9.5 in the window: the build shows one figure. **Question for
him:** on a phone, two "+" sit three rows apart (new period, zoom in); the zoom pair could become magnifiers.

## Taps (with the fixes)

One day 2 · half day 3 · range 2 gestures (drag-select) or 4 · balances 1 · next leave 0 · correct a balance 2 and
typing · bid with a document 3 and the picker · what changed 0 to see, 1 to read · open dates 2–4 · decide one 2 ·
decide a month 4 · approve while placing 2 · rename a row or set amber and red 3–4 · lock balances 1 · Management: a
Quals column and a tick a man, then ⚙ → "+ Management" · import holidays 6 · add an event 3.

## Checked and sound

Approvals in one place on both widths; a second line the same for everyone, fitting 390 (D1196). Opening a quarter
in 4 taps. The day panel's stacked figures. The cell halves and look F. The new Settings' labelled rows. Balances as a
button. The one Document button. "New" reuses the bell's dot. No glow. No window touches the grid's speed rules.
