# Section 1 (the guard rail) — the drawings for question 29, report (chat 204, 27 Nov 26)

Drawn by an Opus drawing helper in its own copy, at commit `fe89f19e7` (after `a48f6b23e`). No file under
`raptor-port/src` changed; nothing committed. Script: `raptor-port/scripts/handpass/n204/draw-q29.mjs` (it reuses
`q2425-lib.mjs`). Pictures: `raptor-port/docs/mock/2026-11-26-msq-questions/q29/`. Each picture was taken at 2×, with the
teal dashed ring. Every picture was opened and looked at. No page errors and no console errors came up in any run.

## How it ran

- **The checks lock.** The question 27 drawer held it, and then another chat held it for a short build. This helper waited
  for both and built under the lock (`gatelock exec … npm run build`), which took the lock and released it itself. The
  preview ran on port 4741; it was stopped by its port, and the lock was left free. The `node_modules` junction was
  removed at the end.
- **The world.** Every picture used one world, made once by presses and then copied into each fresh browser:
  1. Saber (`ad`/`a`) made 150 on Admin → Squadrons, with Kestrel as its first admin. That puts three squadrons in the
     picker: 142, 149 and 150.
  2. **Kestrel had no right in 142 in the seed**, so Saber gave him Plan of 142 on Admin → Users. Saber first had to
     pick 149, because Kestrel's row is not on 142's Users. After saving, the app said "Saved", and Kestrel's row reads
     "also plans 142, 150".
  3. **149's demo week had no "Who's available" count to press.** So Kestrel, at a desk, dragged ALL AVAIL from the crew
     panel onto Monday's SDO, beside Merlin, on 149's Edit Schedule. That puts the count "5" on the week. Pressing the
     cell's "+ add" did nothing, because the cell already holds a man, so the drag was used. This is one schedule change
     on 149's working copy; Monday shows "1 change".
- **Kestrel's password** is `a9` (the seed). **Osprey's sign-in** is `us9`.
- **The grey note** was the app's own. The real squadron pick raised it, with no probe. The only help was to hold its
  fade (its see-through level kept at full) so it could be pictured. Its words, place and look are the app's.
- **The phone** is WebKit at 390×844 with touch, standing in for his iPhone. On a phone the pick goes through ☰ and its
  squadron list, which reads "142 Full access · 149 Your squadron · 150 Full access".

## The pictures

**1. 29-row-today — the real app as it is today**
- Files and sizes:
  - `q29-row-today-desktop.png` (desktop) and its crop `q29-row-today-desktop-crop.png`
  - `q29-row-today-phone.png` (phone) and its crop `q29-row-today-phone-crop.png`
- Caption: Kestrel, 149's admin, opens Osprey's row on Admin → Users and types "osprey" in its sign-in box without
  saving. He then picks 142 from the squadron menu. The pick is refused. 149 stays in view, the row stays open with
  "osprey" still in it, and a grey note says exactly: **"Blocked: save or cancel the open row, then pick 142."**
- Where the note sits:
  - On a desktop it sits under the squadron picker, top left. It partly covers the page's "Admin" heading, which is the
    app's own placing.
  - On a phone it sits at the foot of the screen, over the lower edge of the open row; the sign-in box still shows
    "osprey".
- The note is ringed. The desktop crop keeps the note, the top bar's "149" and Osprey's open row with "osprey" in sight.
  The phone crop is nearly the whole screen, since the note is at the foot and the row runs above it.

**2. 29-row-proposed — the proposal, reached by Cancel and then the pick**
- Files and sizes:
  - `q29-row-proposed-desktop.png` (desktop) and `q29-row-proposed-desktop-crop.png`
  - `q29-row-proposed-phone.png` (phone) and `q29-row-proposed-phone-crop.png`
- Caption: how the proposal would look. Kestrel opens Osprey's row and types "osprey", then picks 142. The pick goes
  through: 142 is in view on Admin → Users (142's list, "People · 61"). There is no note, and Osprey's row has gone with
  its typing.
- **Reached here by real presses: the row's Cancel, then the pick of 142.** The app does not yet do this by itself.
- The squadron number in the top bar, "142", is ringed. The list stays scrolled where Cancel left it, so the top of the
  Users panel is above the frame.

**3. 29-window-today and 29-window-proposed — the real app as it is today, and the proposal: the same**
- Files and sizes:
  - before the pick: `q29-window-open-desktop.png` and its crop (desktop); `q29-window-open-phone.png` and its crop (phone)
  - after the pick: `q29-window-after-desktop.png` and its crop (desktop); `q29-window-after-phone.png` and its crop (phone)
- Caption, before: Kestrel on 149's Edit Schedule presses the "5" beside ALL AVAIL on Monday's SDO. "Who's available"
  opens and lists 5: Harrier, Condor, Raven, Shrike and Gannet. The window is ringed.
  - On a desktop it opens at the right.
  - On a phone it opens as a sheet over the lower page, so its picture and its crop are the same.
- Caption, after: he picks 142. The window closes by itself, the pick goes through, and 142's Edit Schedule is in view
  with no note. The "142" in the top bar is ringed; the crop is that number alone.
- **Today and the proposal are the same here:** a window that only shows things simply closes (his ruling of 25 Nov). So
  one pair of pictures serves both answers.

## What went differently from the brief

- Kestrel had to be given Plan of 142 first, as the brief allowed.
- The count that opens "Who's available" had to be made first: ALL AVAIL was dragged onto Monday's SDO, as set out above.
  That added one change to 149's working copy.
- Nothing was forced through the developer's bridge. Nothing else was drawn.
