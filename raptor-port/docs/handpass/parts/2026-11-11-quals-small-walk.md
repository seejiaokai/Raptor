# The walk of the two small Quals fixes — the walker's report (11 Nov 26, chat 64, job 3)

The Sonnet walker's hand-back, saved as it arrived (its brief: `docs/superpowers/briefs/2026-11-11-quals-small-walker-brief.md`).
Branch `claude/quals-small-1111`, the app built from `7765901d1`, served on port 4391 (stopped after). Nothing in the
checkout was edited except pictures. The sheet: `docs/handpass/2026-11-11-quals-small.md`.

**Browsers:** Chromium for desktop 1280×800, the short screen 1280×600, and the phone 402×874 (scale 3, touch). Phone
drags were real CDP fingers. WebKit at the phone's size was run for A1, A2, A6 and B1/B8 only: a real finger drag
cannot be driven in WebKit there (the Touch constructor throws "Illegal constructor"), so B3 in WebKit is NOT RUN for
the drag.

**Set-up:** the seeded men who hold a sign-in are casper (15th of 34 on the Pilots tab), bane (18th), rocky (a WSO) and
stiff (the admin); on the 800px desktop none can be put off screen. For "far down" the walker gave vinci (shown on
screen as "Zenith", the last pilot) a sign-in through Admin → Users, then Suspend, Enable and "Check his quals" — the
app's own door. The prompt raised "Zenith can sign in again" and the Check button appeared.

## Results (pc = 1280×800, ph = phone; positions are the page's scroll in px)

- **A1 pc / ph / WK: PASS.** Landed at 524 (pc), 434 (ph), 467 (WK). His row outlined and clear of the top bar and the
  pinned heading (pc: row top 613 against the pinned heading's foot 127; ph: 687 against 73). The outline as painted: a
  2px cyan inset line on the row's cells (rgb(60,198,230)). Pictures `a-pc4/A1-pc-1`, `a-phone/A1-phone-1`.
- **A2 pc / ph / WK: PASS.** With him off screen at 0 (row top 1137 pc, 1121 ph), none of these moved the page: a sort
  ×2, the filter typed then cleared, entering Edit, a tick on another man, an untick, entering Edit quals, a drag (the
  table's own heading and a pinned one), leaving Edit. The outline stayed on him each time. (The first tick and untick
  were made outside Edit, where a tick does nothing; redone in Edit — `a8-pc/A2-pc-5`, `-6`, the same on `a8-phone` —
  the page stayed at 0.) A sort can re-flow his row (row top 1137 → 263 → 978) but the page never jumped to him.
- **A3 pc / ph: OBSERVED.** The outline was still on after 65 s, and after scrolling away and back. It was never seen
  to end.
- **A4 pc / ph: PASS.** A second Check for the same man went 0 → 524 (pc), 0 → 434 (ph). For a different man (casper)
  the page stayed at 0 because his row was already in view (top 687 pc, 671 ph). A different man off screen: NOT RUN.
- **A5 pc: PASS.** Raised by Archive then Restore of bane on Admin → Users, then Logout and sign-in as `us` (Enable
  alone does not raise the note). The note showed; "Check my quals" opened Quals with his row outlined and in view (0,
  row top 694). Pictures `a5-pc3`. Phone NOT RUN (no time).
- **A6 pc / ph: PASS.** Tick the top man, scroll to the foot, Undo: the page went to 0 and the row was outlined
  (`a6-pc2/A6-pc-1`). Then a tick elsewhere at the foot: the page stayed at 677 (pc) / 587 (ph). Redo with the row in
  view: stayed at 0. Redo with it out of view: 677 → 0. WK: Undo at the foot 847 → 0, outlined.
- **A7 pc / ph: OBSERVED.** Undo pressed on Edit Schedule: the app switches to Quals at 0 and outlines the changed row,
  which was in view. Then a tick elsewhere on Quals: no jump.
- **A8 pc / ph: OBSERVED, recorded without judgement.** (a) The filter does NOT survive leaving Quals: typed "dj", went
  to Admin and back — the box was empty, all 34 rows showed. (b) Sent to Zenith, then typed "ace" (hides him, 1 row
  shown), then pressed Check: the page stayed at 0, nothing outlined (his row is not drawn), the filter stayed "ace"
  (`a8-pc/A8-pc-2`, `-3`). (c) Cleared the filter: his row came back OUTLINED but the page did NOT go to him — at 0, his
  row off screen (`a8-pc/A8-pc-4`). The Check button was gone, so a second ask could not be made.
- **A9 pc / ph: OBSERVED.** Leave to Logic and return: no outline (it did not survive leaving the page), the page at its
  top. Reload: back to the sign-in; after signing in the app opens on View-only Sched; on Quals no outline, no scroll.
- **A10 short screen 1280×600: PASS.** Landed at 724; row top 413–440, clear of the bar (103) and the pinned heading
  (127). An Edit tick and untick left the page at 0 with his row off screen.
- **B1 pc — the copies.** The table's own heading row: one row, 11 moving headings. The pinned copy
  (`[data-testid=qsticky-head]`, box 20,103, 1240×26): 11 moving headings (SANS … TF) plus the still name, initials,
  flight and CAT headings, and Remarks at the right. A frozen corner (`.qfixed-frozen`, hidden from screen readers) at
  the left on the phone (present in WK too). Phone: the pinned box's top 49, height 26. Picture `b-pc/B1-pc-3`.
- **B2 pc: PASS.** The pinned SANS heading pressed and dragged three columns right: one lift frame, one landing mark
  (on the pinned Scheduler heading), the order changed in both the pinned row and the table (read scrolled up), the page
  stayed at 320. Undo restored the order, Redo re-applied it, the page did not move. A drag left worked. A press and
  release lifted nothing. A drop on itself changed nothing and left Undo greyed. Slow (40 steps), a flick (2 steps) and
  the edge scroll all worked: the sideways scroll under the drag reached 201 for both the pinned and the table's own
  heading, and the pinned row stayed in step (lefts equal 403 / 481 / 551 / 653). Pictures `b-pc/B2-pc-4`, `B2-pc-8`,
  `b3/B2-pc-1`, `-2`.
- **B3 phone (Chromium, a finger): PASS for the drag.** A finger on a pinned heading: one lift frame, the landing mark
  on the heading under the finger, the column moved, the page's place unchanged (`b-phone4/B2-phone-5`,
  `b-phone4/B3-phone-4-early-100ms`). The pinned cells stayed opaque mid-drag (`b-phone/…12`). The page under the
  finger, pinned against the table's own heading — identical: a vertical flick starting on either heading scrolls
  nothing in Edit quals, and a 120px sideways swipe moves the table only 24px (329 → 305) in both. **OBSERVED:** a drag
  with 40px of vertical wobble lifted nothing on the pinned heading; not compared with the table's own heading.
- **B4 pc:** the ✕ in a pinned heading does nothing (11 columns before and after). The ✕ in the table's own heading
  removes the column at once, with no question (11 → 10); Undo brings it back. A press on the still name heading in the
  pinned row sorts by callsign, as the table's own does. Phone: not checked (the script was unreliable).
- **B5 pc / ph: PASS.** In view, a drag on a pinned heading lifts nothing and the order is unchanged; a tap on a pinned
  heading sorts by it, exactly like a tap on the table's own.
- **B6 pc: PASS.** The member `us`: Edit works, "Edit quals" is not there, the pinned row has no draggable heading and
  no ✕; a drag lifts nothing and the order is unchanged.
- **B7 pc: PASS** (the filter "a" typed, a pinned drag moved a column). Phone NOT RUN: the filter shortens the page to
  1056px and the pinned copy hides. The sort-on case NOT RUN.
- **B8 pc / ph / WK: PASS.** After a pinned drag, at the page's foot and again at the top, three pinned headings' left
  edges equal their columns' cells exactly (phone 74/74, 152/152, 254/254; WK 148/148, 225/225, 295/295). At the top
  the pinned copy is hidden, as designed.
- **B9:** Export after a pinned drag: PASS — the file's heading row follows the new order. The Leave War's quals list:
  NOT RUN (not reached).
- **The plain-user round, pc / ph: PASS.** The filter "ra" gave Cobra, Kraken, Ranger. The tabs Pilots / WSOs /
  Personnel / All gave 34 / 24 / 3 / 61 rows. Tick, untick, Undo and Redo behaved. Pressing two columns left only the
  second sorted. Adding a column "TEST QUAL" made 12 columns, and its ✕ removed it. Pressing a column's words opens no
  rename box, so rename is NOT RUN. Done returns the Edit button. Export gave its file. "+ Add person" goes to Admin.
  Pictures `p-pc`, `p-phone`.
- **Not run:** the other places a tick shows (the Admin → Users row, a seat's qual warning on Edit Schedule), B3's
  finger drag in WebKit, A5 and B6 on the phone, rename.

**Errors:** no page errors, console errors, failed requests or 4xx in any run.

**Pictures:** in per-run folders under `docs/img/handpass/2026-11-11-quals-small/`. The citable runs: `a-pc4`,
`a-phone`, `a6-pc2`, `a6-phone`, `a8-pc`, `a8-phone`, `a5-pc3`, `a10`, `b-pc`, `b-phone4`, `b3`, `wk2`, `p-pc`,
`p-phone`. The walker's earlier and failed attempts (other folders) are not kept in the repo.

**Scripts** (the session's scratch folder, `job3/walk/`): `j3w-lib.mjs`, `j3w-a2.mjs`, `j3w-a6.mjs`, `j3w-a8.mjs`,
`j3w-a5.mjs`, `j3w-a10.mjs`, `j3w-b.mjs`, `j3w-b3.mjs`, `j3w-b9.mjs`, `j3w-plain.mjs`, `j3w-wk.mjs`.
