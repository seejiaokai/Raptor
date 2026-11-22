# Night of 22–23 Nov 26, job 4 — the builder's report (the bell's Show buttons and grey mark)

Saved as it arrived (chat 149's helper; commit `d947c411a`, branch `claude/msq-b1-screens-135`).

**Built.** (1) The Show buttons (p3a, p3c, f5a; D2198, D2202, D2321): anyone whose bell can show more than one squadron's
lines — a new reader `state/bellsqn.ts bellSquadrons(pid)`: his home plus every squadron whose `adminLineAudience` holds
him (a master admin every squadron, a Plan holder his Plan squadrons, a View holder none) — gets "Show" and one filter
chip (`.fchip`) per squadron by number at the left of the list's foot, on / off from `bellShows`; a press calls
`setBellSquadron`, the lines follow at once, no Undo step; one squadron no row; many, one row sliding sideways, never
wrapping (`.bl-sqns`). `ui/topbits.tsx BellShowRow`, `02-shell.css`. (2) The grey mark (p3b): `state/belltap.ts
lineSqnMark` — the line's squadron number when not his home today, nothing for his own-account lines; drawn `.bl-sqn`
(the `.acc-sqn` recipe) 6px after the name; a line stored without a squadron reads as his home (no mark).

**Tests:** `src/ui/msq-bell-show.test.tsx` 6 — 5 red first, 6/6 green (Saber 142 on / 149 off; pressing 149 shows its line
marked, saved, no Undo step, off again hides it; saved across sign-out and in; Hunter with Plan of 149 on at start, his
own "Given Plan…" line unmarked; Ranger / Hunter alone / Kestrel no row (a guard, green before too); eight squadrons
eight buttons, only 142 on). **Checks:** 13 bell-related files under the lock 199/199 (with perms-scan,
edit-rights-readers, noglow-css), pageload 26/26, upconfirm 5/5; build; code check no new finding (two fixed in code);
docsize.

**Measured** (`scripts/handpass/n149/measure-job4.mjs`, 1536 Chromium and 402 WebKit, the drawing's construction beside the
built one): p3a, p3b list, foot, row, "Show" and every chip to 0px (chips 44×28, 6px apart); marks 31×13.5, 8.5px, 6px
after the name, 7px before the date; p3c as drawn; f5a the row runs 72px past the edge with nothing unread, as drawn; the
switch held over a real reload. **Fixed while measuring:** eight squadrons with unread lines squeezed "Mark all read" onto
two lines — it stays one line now, the row gives way. **Left:** the drawings show no "Mark all read" (their data had
nothing unread); with it present the row ends before it, the cut falling where its width puts it.

**Words in no drawing:** none. **Its decisions for his look:** the buttons by number, as the Schedules menu; "↓ 3 more"
just after the row; only his own-account lines spared the mark (a 149 input he is named in still shows "149"); the chips'
focus ring drawn inside each chip. Left as written: `notifications-register.md` lines 25–26's older "not built" wording,
superseded by its new "Since 23 Nov 26" sentence.
