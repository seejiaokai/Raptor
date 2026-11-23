# D2381 mock-up: a View holder sees only View-only Sched and Help, and the ☰ menu shows the squadron in view (23 Nov 26)

Pictures of the real app (twice the sharpness). The proposed look is drawn by changing the page in the browser just before
each picture; the app itself is unchanged. A thin ring in the app's cyan marks each new or changed part. The cyan outline
round the bell in the desktop bars is the app's own (unread lines), not a ring. Scripts:
`raptor-port/scripts/handpass/n149/mock2381/` (k1-desktop.mjs, k2-phone.mjs, klib.mjs).

- 1a-ranger-149-topbar-today.png · Ranger (member of 142, given View of 149 by Saber) with 149 picked: the top bar offers View-only Sched, Inputs, Quals, Logic, Leave War, Tracker and Help · desktop 1536 × 864 · today
- 1b-ranger-149-topbar-proposed.png · the same bar with only View-only Sched and Help (ringed); "149 ▾", the bell, Insights, Logout and his name badge as today · desktop 1536 × 864 · proposed
- 1c-hunter-149-topbar-today.png · Hunter (admin of 142, View of 149) with 149 picked: View-only Sched, Inputs, Quals, Logic, Leave War, Tracker, Help and Admin · desktop 1536 × 864 · today
- 1d-hunter-149-topbar-proposed.png · the same bar with only View-only Sched and Help (ringed); his Admin tab gone too; the right side as today · desktop 1536 × 864 · proposed
- 2a-menu-149-today.png · Ranger's ☰ menu with 149 picked: MENU lists all seven of his pages; nothing says which squadron is in view · phone 402 × 874 · today
- 2b-menu-149-proposed.png · the same menu with a new first section SQUADRON: "149", grey "View only", ▾ (ringed); MENU with only View-only Sched and Help (ringed); ACCOUNT as today · phone 402 × 874 · proposed
- 3a-menu-home-142-today.png · Ranger at home with 142 picked: his ☰ menu, MENU with every page he has, then ACCOUNT · phone 402 × 874 · today
- 3b-menu-home-142-proposed.png · the same menu with SQUADRON first: "142", grey "Your squadron", ▾ (ringed); the full MENU as today · phone 402 × 874 · proposed
- 4a-menu-squadron-row-opened-proposed.png · the SQUADRON row pressed: it opens in place inside the menu, ▾ turned ▴, listing 142 "Your squadron" and 149 ticked "View only" as the Schedules menu does (ringed); picking one closes the menu · phone 402 × 874 · proposed
- 5a-one-squadron-topbar-desktop.png · Ranger before he was given View of 149 (one squadron): "142" with no ▾, so no Schedules menu · desktop 1536 × 864 · today (proposed the same)
- 5b-one-squadron-topbar-phone.png · the same on his phone: ☰ and "142" with no ▾ · phone 402 × 874 · today (proposed the same)
- 5c-one-squadron-menu-phone.png · his ☰ menu with one squadron: MENU then ACCOUNT, no SQUADRON section, as the top bar has no ▾ · phone 402 × 874 · today (proposed the same)
- 6a-820-menu-149-today.png · a desktop 820 wide, where the page names fold into ☰: Ranger's menu with 149 picked, all seven pages · desktop 820 × 864 · today
- 6b-820-menu-149-proposed.png · the same at 820: SQUADRON "149" "View only" ▾ (ringed); MENU with only View-only Sched and Help (ringed); ACCOUNT as today · desktop 820 × 864 · proposed
- 7a-roles-table-today.png · Admin → Users, Ranger's opened row, "What each role allows" (as Saber): the View column reads "read" for View-only Sched and Logic, "—" for every other page · desktop 1536 × 864 · today
- 7b-roles-table-proposed.png · the same table with Logic's View cell now "—" (ringed); View-only Sched stays "read"; Help is not a row of the table, so nothing else changes · desktop 1536 × 864 · proposed

## Version B of the SQUADRON section (asked for 23 Nov 26): chips, one tap, the menu stays open

Under SQUADRON, one row of the bell's Show-row chips (the same look and size: 44 × 28, 6px apart), the squadron in view
"on"; under it one grey line naming the access in view in the Schedules menu's words. One tap on a chip picks that
squadron; the menu stays open and its MENU list changes at once. Only for people with more than one squadron, as in A.
Script: `k3-version-b.mjs`.

- b1-menu-149-chips-proposed.png · Ranger with 149 picked: chips 142 off and 149 "on", the grey line "149 · View only" (ringed); MENU with only View-only Sched and Help (ringed); ACCOUNT as today. Pairs with A's 2b · phone 402 × 874 · proposed (B)
- b2-menu-after-tapping-142-proposed.png · just after one tap on the 142 chip: the menu still open, 142 now "on", the line "142 · Your squadron", and every page back in MENU at once (ringed). A has no match: there it took two taps and closed the menu · phone 402 × 874 · proposed (B)
- b3-menu-home-142-chips-proposed.png · Ranger at home on 142: chips 142 "on" and 149 off, the line "142 · Your squadron" (ringed); the full MENU as today. Pairs with A's 3b · phone 402 × 874 · proposed (B)
- b4-menu-saber-eight-chips-proposed.png · Saber, a master admin, with eight squadrons (142, 149 and 150 to 155, made by "+ New squadron"): the chips stay one row, cut off at the menu's edge, sliding sideways, never wrapping; 142 "on", the line "142 · Your squadron" (ringed) · phone 402 × 874 · proposed (B)
- b4b-menu-saber-eight-chips-slid-proposed.png · the same row slid to its end: 150 to 155 in view; the line still names the squadron in view · phone 402 × 874 · proposed (B)
- b5-ranger-149-topbar-proposed.png · Ranger's top bar with 149 picked: the same as A's 1b, since the desktop still picks the squadron at the top left with "149 ▾"; only View-only Sched and Help (ringed) · desktop 1536 × 864 · proposed (B, the same as A)

## Version C of the ☰ menu (his idea after his look, 23 Nov 26): the TALON mark, then B's chips

The menu opens with the top bar's own TALON mark (the claw, "TALON", the squadron number above it), the same size and
colours as at the top left of his phone; right under it B's chips and grey line, with no "SQUADRON" label; then MENU and
ACCOUNT as today. One squadron: the mark alone. **No rings on these pictures:** each is clean, as the built app would
look. Script: `k4-version-c.mjs`.

- c1-menu-149-proposed.png · Ranger with 149 picked: the TALON mark reading 149, the chips 142 off and 149 "on", the grey line "149 · View only"; MENU with only View-only Sched and Help; ACCOUNT as today · phone 402 × 874 · proposed (C)
- c2-menu-home-142-proposed.png · Ranger on 142: the TALON mark reading 142, the chips 142 "on" and 149 off, the grey line "142 · Your squadron"; the full MENU and ACCOUNT as today · phone 402 × 874 · proposed (C)
- c3-menu-saber-eight-proposed.png · Saber, a master admin, with eight squadrons (142, 149, 150 to 155): the TALON mark reading 142, the chips in one row cut off at the menu's edge, sliding sideways, never wrapping; 142 "on", the line "142 · Your squadron"; MENU and ACCOUNT as today · phone 402 × 874 · proposed (C)
- c4-menu-one-squadron-proposed.png · Ranger before he had View, one squadron: the TALON mark alone reading 142, no chips and no grey line; MENU and ACCOUNT as today · phone 402 × 874 · proposed (C)
- c5-menu-149-version-b-unringed.png · version B's b1 again with no rings, to set beside c1: SQUADRON, the chips 142 off and 149 "on", the grey line "149 · View only"; MENU with only View-only Sched and Help; ACCOUNT as today · phone 402 × 874 · proposed (B, for comparison)

## Version D of the ☰ menu (his D2382 and D2383, 23 Nov 26): the TALON mark as the squadron drop-down, the access under it

The menu opens with the top bar's own mark and its ▾ ("149 ▾"), in the bar's own button look; a tap opens the Schedules
menu's rows right under it, inside the menu (tick, number, grey label); a pick switches the squadron and the menu stays
open (the agent's reading). Under the mark one grey line says the access to the squadron in view ("149 · View only").
No chips, no "SQUADRON" label. One squadron: the mark alone, no ▾, the grey line still shown (the agent's reading of
D2383, put to him). No rings. Script: `k5-version-d.mjs`.

- d1-menu-149-closed-proposed.png · Ranger with 149 picked, the drop-down closed: "149 ▾", the grey line "149 · View only"; MENU with only View-only Sched and Help; ACCOUNT as today · phone 402 × 874 · proposed (D)
- d2-menu-149-open-proposed.png · the same after one tap on the mark: the list open under it, 142 "Your squadron", 149 ticked "View only"; the mark in its pressed look; the grey line and MENU under the list · phone 402 × 874 · proposed (D)
- d3-menu-after-picking-142-proposed.png · just after picking 142 there: the list closed, the menu still open, "142 ▾", "142 · Your squadron", every page back · phone 402 × 874 · proposed (D)
- d4-menu-saber-eight-open-proposed.png · Saber, a master admin, with eight squadrons (142, 149, 150 to 155), the list open: eight rows, 142 ticked "Your squadron", the rest "Full access"; the grey line "142 · Your squadron"; MENU and ACCOUNT under them · phone 402 × 874 · proposed (D)
- d5-menu-one-squadron-proposed.png · Ranger with one squadron: the mark alone ("142", no ▾), the grey line "142 · Your squadron"; MENU and ACCOUNT as today · phone 402 × 874 · proposed (D)
