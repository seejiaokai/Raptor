---
paths:
  - raptor-port/src/**
  - raptor-port/docs/mock/**
  - raptor-port/docs/ui-contracts.md
  - raptor-port/docs/design-practices.md
  - .claude/skills/impeccable/**
  - .claude/skills/brainstorming/mockups-on-the-real-app.md
  - raptor-port/docs/img/**
  - raptor-port/docs/handpass/**
  - raptor-port/e2e/**
---

# Screen design — how it works now

<!-- shape: page -->

Loads by itself whenever a chat reads a file of screen work (the `paths:` above): the app's code, the mock-ups, the screen
rules, the design guide and the design skill — the design guide's own paths (`.claude/rules/ui-design.md`) — and the
walks' pictures, evidence sheets and browser tests, where a fault on screen is judged.

Each line is a rule as it stands today; the numbers after it are the rulings that set it. His words, the readings he was
told, each ruling's date and the history are in the full rows, `.claude/decisions-full/design.md` — open the row before
acting on a rule's detail or asking him about it (`grep -h '^| D1626 |' .claude/decisions-full/*.md`, the shell; the
Grep tool hides a long row).

These rulings moved here from the general rulings on 1 Nov 26, in the trim of what every chat loads (D1554, D1735).
The rulings on how the agent works on design — pictures with every design question, mock-ups first, drawings checked,
the design guide's lessons, the design skill, what the app is meant to be — stay in How we work,
`.claude/rules/decisions/how-we-work.md`, loaded in every chat.

The design guide is `raptor-port/docs/design-practices.md`; each surface's contract, `raptor-port/docs/ui-contracts.md`.
The main rulings of other areas that bear on a screen's look are pointed to at the end, each stated on its own area's
file; the map of every ruling, and how to record or retire one: `DECISIONS.md`.

## The top bar — Undo and Redo, sync, the bell
- Every Undo / Redo pair sits in the app's top bar, in the same place, order and look as Edit Schedule's, on a desktop
  and a phone, on every page where a change the one Undo takes back is made — Edit Schedule, the Leave War, Inputs,
  Quals, Admin and Logic — and none on View-only Sched or Help, which change nothing; the Tracker's own pair sits there
  too, still taking back only the Tracker's own changes; the Scheduler Board keeps a bar of its own (below) [D347,
  D348].
- The group runs in the desktop's order on a phone too — Undo · Redo · (the changes clock, Edit Schedule only) · the
  sync dot · the bell, the bell at the far right — together at the bar's right end, the menu button and the mark pinned
  at its left [D348, D347].
- The changes clock stays on Edit Schedule only — his question answered no, as he allowed: its window is laid out by the
  schedule's days, and a change made on another page already shows in it as a line on its day [D348].
- On every page up to 1599 wide the top bar takes its compact look — Undo and Redo as their arrows only, their names on
  hover, the sync pill its dot alone — so Edit Schedule's bar, which carries the changes clock too, stays on one line at
  his PC's 1536 like every other page; every page's pair still looks the same [D1126, D347, D348].
- Undo and Redo leave the screen where it is when what they change is already in view — for a row, wholly on screen,
  clear of the top bar — and move to the change only when it is out of view, landing just under the top bar; the changed
  row or day is still outlined; an Undo of a change on another page still takes him to that page; a save of an input on
  the Inputs list follows the same rule [D672].
- Page by page, the agent's readings told to him, as built: Edit Schedule's week steps sideways only to a changed day off
  screen, the Scheduler Board changes day only for a change on another day, the Inputs calendar changes month only for
  one in another month; the Inputs list and Quals move only when the changed row is not wholly on screen; the Tracker's
  Undo moves nothing [D672].
- The top bar stays pressable over "Jump to a date", the day-details window and the document viewer, as over the Traffic
  window: the grey starts at the bar's foot, Undo and Redo work with the window open, any other bar button (a page name,
  the bell, ✓ Done) closes the window first, and Escape still closes it after an Undo; an input's own window, which holds
  typing not saved, and the question boxes, which exist to stop a change until answered, keep the bar covered [D1645].
- Help's and Admin's titles take the size and weight of Logic's page name — 18px, weight 700 on a desktop, 16px on a
  phone (the agent's reading) — and keep their place; the pages without a title stay without one [D1138].

## The page names beside TALON
- The page names, Edit Schedule to Admin, stand on the top bar's first row beside TALON wherever they all fit, the bar's
  buttons after them or on a row of their own to the right; where they do not all fit — a phone, a narrow desktop — they
  go into the side menu, unchanged, and the bar is one row; built as the mock-up of 4 Nov 26 draws them
  (`raptor-port/docs/mock/2026-11-04-topbar-names/`) [D1641, D1642, D1643].
- Whether they fit is measured on the screen in use, never set at one width — a member has two names fewer, and his
  iPhone's letters are wider than a PC's; the buttons (Undo, Redo, the sync dot, the bell, Insights, Logout, the role
  chip) keep their order at the right (the agent's reading) [D1641, D1642, D1643].
- On a phone held sideways the names always go into the side menu and the bar is one row, for everyone, even where a
  member's fewer names would fit, the side menu scrolling to its Account part; "held sideways" is the agent's reading — a
  touch screen with no fine pointer, wider than tall and under about 500 tall — so an iPad is measured as any screen
  [D1643, D1642].

## The Scheduler Board's own bar
- The board covers the top bar, so its own bar carries the same group laid out as Edit Schedule's — Undo · Redo ·
  History · Sync · the bell — then one way out, ✓ Done, its ✕ Close gone since it did exactly what Done does; Escape and
  a tap outside still close the board (the agent's reading) [D349, D481].
- On a desktop Sort all stays a button, before Undo, and Insights stands beside the bell; on a phone Sort all, the
  Phone / Desktop layout switch and Insights sit behind one ⋯ button in the bar's second row, beside the highlighter,
  which still opens its own row; the ⋯ menu closes on a tap outside it (the agent's reading) [D349, D481].

## Icons and marks — one drawn icon for one thing
- One thing has one icon throughout the app, drawn by the app so every device shows it alike — never a typed symbol or an
  emoji his iPhone would draw in its own colours — each drawn icon in its button's own colour; the icons are line icons
  but the one solid pencil (the agent's reading, told to him) [D1134, D1509, D1707].
- Every pencil is the one solid pencil of his picture — filled, eraser at the top left, tip at the bottom right — never
  the ✏ emoji, the line pencil included; only a ✎ inside a sentence of help text, or after an edited chart's name in the
  Tracker's Syllabus list, stays typed; its places are listed in the full row [D1134].
- The one settings gear everywhere is the Leave War's drawn line gear, the ⚙ symbol gone wherever it stood (the Inputs and
  SANS calendars, the OIL tracker, the Tracker's flex settings, the board's flying-waves gear), in its button's colour —
  white on the Inputs, SANS, Tracker, OIL tracker and board rows, grey on the Leave War — each keeping its button's size;
  the OIL tracker's 📅 becomes Edit Schedule's line calendar (How we work's D1508) [D1509, D1707, D1508].
- On the Scheduler Board and the Leave War the typed marks are drawn line icons: every ⇅ (Sort all, Auto sort, Rearrange
  the grid, Done) the Tracker's Reorder mark, Templates a page of blocks, Reset order an arrow turning back, the phone
  menu's layout switch a phone and a screen; ⇄ Move keeps its arrow, the board's Undo and Redo the top bar's arrows
  [D1703, D1793].
- OIL has one mark of its own, a ticket — a day off held — on the board's OIL Earn and the Leave War's OIL tab, in place
  of ◧ and the plain clock, so a clock means only History; on a phone the board's day bar shows the desktop's marks
  before Templates and OIL Earn — the page of blocks and the ticket — on one row, the buttons keeping their height
  [D1704, D1703, D1793].
- Four more typed marks take drawn line marks, as drawn (in the pictures round's build): the 👁 on a look at a published
  version the wave templates window's line eye; the Inputs calendar's ⤢ and ⤡ two new marks, arrows out and arrows in —
  a departure named to him, today's ⤡ pointing out on the other slant; the Tracker's ↺ Restore and a hidden warning's ↺
  the Reset arrow; the ✕ that hides a warning stays typed [D1792].
- The board's OIL Earn wears no clock while History's clock stands on its bar; the agent's reading, lesson 70's other
  half: a new mark a person could mistake for another on its bar or page is redrawn before it is built; the reset arrow
  (Reset order, Reset layout, a hidden warning) is History's arrow without the clock, meaning "put back" wherever it
  stands, kept — he tells it apart [D1700, D1704, D1792, D1793].
- Every search box looks like the Edit Schedule week's — a grey line magnifier inside the box at its left, the box as tall
  as the buttons beside it — on the Scheduler Board, Quals, Logic, Admin, the Inputs list and the Tracker, each keeping its
  own words since each finds something different; the agent's readings, told to him: the coloured emoji magnifier goes
  everywhere, and the Tracker's ✕ that clears its search stays [D1127].

## Controls, arrows and rows
- Arrows on either side of words that change — a day, a month, a count — keep their place as the words change: the
  words get the room their longest value needs, never a cut word (the agent's reading), so the arrow pressed again and
  again never moves — his standing rule that a control tapped again and again never moves under the finger; every ‹ ›
  pair was swept — the schedule, the Inputs, SANS and Medical calendars, the Calendar window, a document viewer, the
  Leave War and the Tracker; the design guide's §3 and lesson 16 carry it [D1122].
- A page's controls are one row, as the design guide's §3 words it: the buttons that belong to the page in view stand in
  the one row under the top bar and the page's tabs, at that row's button height, even when it holds one button; a fold
  is not a button; the places it named were the Medical tab, Quals' "Export to Excel" and Logic's "Edit rules" [D926].
- The boxes and buttons whose font line the browser had dropped show the app's letters at the size and weight each line
  meant, as drawn — the board's cancel box and its reasons list, an input's own window (its boxes, a member's fixed name,
  Several people, the groups' All), the opened day's note + and + people — the measured shifts (the cancel box 4px
  taller on a desktop, the window's boxes 2px) part of what he approved [D1680].
- The agent's readings of it, told to him: all nine such lines are written out, the ninth (the old day pop-up's boxes)
  changing nothing seen, and a stylesheet check keeps a font line naming "inherit" from coming back [D1680].

## Menus, the keyboard and focus
- Every menu of actions takes the Scheduler Board's look, plain rows in one panel — the board's and Edit Schedule's ⋯,
  the Leave War window's ⋯, the Tracker's File and two pencil menus, the bell's list copying it — rows 38 tall, Grant OIL
  keeping its green; what each item does is unchanged; menus of choices — the board's Templates and + Wave — stay as they
  are [D1706].
- On the Scheduler Board its small menus (+ Block, Templates, the plans selector, a jet's stores, + Wave, the duty role
  list), its day and week chips and Edit Schedule's day name are reached and pressed by the keyboard: a menu opened by
  Enter or the down arrow puts the keys on its first item, the arrows moving through it, Escape closing it back to its
  button; Tab stays inside the board while it is open, and Escape closes the Sort all box [D1646].
- The keyboard's ring is the app's cyan focus ring, for the keys only, never after a click; under the keys an item of the
  board's or the week's ⋯ menu keeps its raised row and wears the cyan ring, and the board's + Block and Templates
  buttons wear it in place of the browser's own — + Wave, the plans selector, a jet's stores and the duty role box checked
  in the same job (in the pictures round's build) [D1646, D1771].

## Questions raised at the control
- A question raised by pressing a control appears right at that control, a small card hanging from it and pointing at
  it, because the hand is already there — never at the window's foot; one raised by a key with no control (Escape) hangs
  from the control that does the same thing, the ✕; "similar" — a confirmation or choice put up because a control was
  pressed — is the agent's reading [D1626, D1627, D1628].
- Built so, and only these, every other question staying as today (the "press again" buttons and the sheets among them):
  the input window's "Close it and lose them?" (its ✕ and Escape), "Open the other input and lose them?", "Delete this
  input for all N people?" and "Take yourself out of this input?"; the Delete key's "Delete this input for all N
  people?" on an input's card in the opened day, hanging from that card; and the Leave War posting's delete [D1626,
  D1627, D1628].
- The posting's delete hangs from its Delete chip, its PO from date and the Post out button in the one-day sheet and the
  drag sheet; it keeps its two steps — the press, then Delete in the card — the second the card "Delete <name>?" with
  Delete and Cancel, Cancel putting the outcome or the date back [D1627, D1628].
- A question designed from now on follows the rule — the design guide's lesson 77 and the design skill's principle 7
  (`raptor-port/docs/PRODUCT.md`) carry it; that the narrowing leaves new designs to it is the agent's reading [D1626,
  D1627, D1628].

## Saving — the "Not saved" band
- A failed save's warning is a band of its own along the bottom of the top bar — the page moves down one line, nothing is
  covered — in look 1, the strip: a drawn warning sign, "Not saved" in bold and "keep this page open" quieter, read from
  the left, and Retry a solid amber button at the right; the line under it is the band's own amber, never the top bar's
  cyan edge; the passing "Saving…" note stays as it is [D587, D841, D1655].
- The same band sits under the bar of every full-screen surface that covers the top bar — the Scheduler Board and, the
  agent's extension told to him, the Inputs calendar, the Medical view and the Leave War's full-screen OIL tracker, a
  working surface; a window, a sheet or the phone's menu is a short visit and gets none, the bar's own band there when it
  closes [D587, D841].
- The "Not saved" design is one design across the whole app: the band wears the strip wherever it shows — the top bar of
  every page, the guest bar, the board's bar, the OIL tracker, the sign-in and the access screens; the "OIL not
  answered" bar, one height with it (36, the buttons too), is restyled alike; a refusal of one change takes a look of its
  own (below) [D1663, D1665, D1667, D1655, D841].
- When a save has failed the band shows on the screen after asking for access, the guest page and the sign-in screen
  too, the page moved down under it, so a stranger whose request was not saved is never told it was sent; the pass there
  reads "Not sent yet" in the band's amber — its mark and its first step, the dot an amber ring with "!", the rest plain
  (the agent's reading, as drawn) — its look coming back by itself once the save lands [D1657, D1664].
- A window he has resized but never moved moves down below the band, as a window not yet placed does, so the band and
  its Retry are never covered; a window he has moved keeps its place [D1523, D587, D841].
- The test switch `?savefail` on the app's address refuses every save in the one tab opened with it, so the band, its
  Retry and the pass's "Not sent yet" can be seen on his iPhone; the agent's readings: reading still works, so the app
  opens as usual, and Retry is refused again while it is on; without it the app saves as always and nobody else is
  touched — opening the link without it ends the test, what that tab could not save lost [D1666].

## Refusals — "Blocked:"
- A refusal of one change is not a failed save: the schedule's refused change and its "not yours to make", a Leave War
  figure box and its passing note, the Grades window and a document too big to store take one matching look of their
  own, apart from the band's (`raptor-port/docs/mock/2026-11-05-notsaved-refusal/`, round 2) [D1665, D1667, D1668].
- It opens with the bold word "Blocked:", the rest after the colon in quieter words — never "Not saved", the band's
  alone, and never "Refused", which names a leave bid or an access request turned down; the schedule's general refusal
  reads "Blocked: nothing was kept"; a document too big to store keeps its own words, in the same note [D1667, D1668,
  D1665].
- Its look is the app's plain grey note, only the "no entry" sign in red and "Blocked:" in bold white — not a red box, so
  red keeps meaning a change kept that clashes; the cost he was told: on the Balances page the other refusals ("Type a
  whole number…") stay red tags beside a grey "Blocked" one [D1668, D1667].
- The schedule's refusal of a change that carries its own reason takes the grey note too — "Blocked: <reason>. Nothing
  was saved…" — the words after the reason as they were, made a sentence ("for anyone: take that person off the list, or
  change it" where the input holds several people) [D1669, D1667, D1668].

## Loading — the claw
- While the app starts it shows the blue talon logo drawn as a claw scratch — the left claw first, top to bottom, then
  the middle, then the right, then all three whole, repeating — each claw drawn along its own line, 0.42 s each, 0.16 s
  apart, held whole 0.55 s, then faded and drawn again; the sign-in's light round it, 72px, the claw alone; still for a
  reader who asked for less motion [D1591, D1605, D1607, D1610, D1611, D1615].
- It adds nothing to the load: drawn by the browser from the logo's own lines in the first page the phone receives, no
  animation library (motion.dev only if it added nothing — the agent's reading), and gone the moment the app is up,
  fading without waiting for its round to end [D1591, D1605, D1607, D1610, D1611, D1615].
- The start-up claw shows on every start, from its first moment, with no 0.3 s wait, even when the app is up a moment
  later; the agent's reading, for the build: it starts 0.2 s into its round, so the first frame already shows part of it
  [D1615, D1605].
- The claw also shows over a page that opens slowly, in the blank moment before it is drawn, never adding to its time:
  one overlay for the whole app over the page area under the top bar, the bar staying in view and in reach; the same claw,
  timing and light, from the tap with no wait; only the pages measured to go blank raise it — the Leave War and the
  Tracker, on their first open after sign-in — so a page that opens at once never shows it [D1607, D1610, D1611].
- Every page's background is the claw's plain dark, the faint blue wash at the top of a page gone everywhere, so the
  moment before a slow page's claw and the claw look the same and the claw simply appears; nothing raises it early, so no
  time is added; the sign-in logo's light is a separate thing and stays [D1614, D887].
- While the Leave War or the Tracker is still downloading after 8 seconds, a quiet grey line "Still loading…" shows
  under the claw, going with it when the page arrives; it is told to a screen reader as the claw's words are (the agent's
  reading) [D1632].
- When the Leave War's or the Tracker's own download fails, only that page shows a card — "Couldn't open the Leave War"
  (or the Tracker), "It didn't download. Check your signal, then retry." and Retry — copying the Tracker's "No course
  yet" card, the top bar staying; the whole app never goes blank; a failed background fetch on a desktop shows nothing
  until the page is opened, then the card [D1631, D1633, D1638].
- Retry fetches the page's files again and, once they have come, reloads the app — everything saved kept, the sign-in
  asked again until the database step, the Undo list empty — then reopens the page that failed by itself once he is
  signed in, from a note kept in that tab only until the reopen, never in the address; it holds after the move too, a
  reload still starting on the first page [D1633, D1638, D1635].
- No words are added to the card or the sign-in for it (the agent's reading); the update check and the stylesheet
  re-fetch built for a retry in place are gone (the agent's reading) [D1635, D1633, D1638].
- When Retry cannot fetch the files — no signal, a file cut off, or a save still waiting — it does not reload: the claw
  holds at least one full round, about 1.3 s, and the card comes back, still signed in, the keyboard back on Retry in the
  app's cyan focus ring, so the press reads as tried [D1638, D1636].

## The name TALON and the access screens
- The app is called TALON (Training, Availability, Leave & Ops Nexus), not RAPTOR, everywhere it names itself for a
  person — the screens, the sign-in, the top bar, the tab's title, prints, PDFs, exports and the help text; the talon
  logo stays; the agent's reading: the code's own names, its folders and the saved data's keys (`raptor:` …) keep
  theirs, and the project's documents keep "Raptor" as the project's name [D1590, D1606].
- As built: the sign-in and access screens' word and its line "Training · Availability / Leave & Ops Nexus", the top
  bars' "142 TALON", the tab title, the start-up failure messages, the spoken names; the Leave War's "Raptor-owned" words
  read "filed on the Inputs page"; a home-screen name TALON (the agent's reading, checked only in the page); the web
  address, his setting, stays "raptor" until the move to Power Apps [D1606, D1590].
- On the sign-in and the access screens the claw sits 7px nearer "TALON" (his option B): the word's left padding, which
  only balanced the letter spacing after its last letter, becomes a pull-in on its right, so the pair stays centred and
  reads as one mark [D1608].
- The screen after asking for access is redesigned in the TALON look, cooler and more welcoming, as he chose: on top look
  B's pass — the claws, a "Waiting for an admin" mark, his callsign large, his initials, seat and CAT — its blue fade from
  the top left laid over the whole card, thinning out across the tear, the pass and the foot one surface, the dashed tear
  the only divider [D1649, D1650, D1654, D1656].
- Under it look A's foot: the three steps (request sent, an admin approves, you're on the schedule), the read-only line,
  View the schedule and Sign out, "Signed in as …" small at the foot (the agent's reading, shown in the drawing); the
  heading "Your request is with the admins", the strip of the week with his puck and "You'll be able to sign in…" are
  gone; what its buttons do is unchanged [D1650, D1656, D1649].
- The drawing of record: `raptor-port/docs/mock/2026-11-05-access-wait/img/C-diag-phone.png`, with `C-phone.png` and
  `C-desk.png`; a fade is never cut off abruptly partway across what it tints (the design guide's lesson 82) [D1656,
  D1654].

## On a phone
- On a phone the page itself never zooms: only the grids that zoom by their own pinch — the Leave War grid and its OIL
  tab, Quals, the Scheduler Board's desktop layout — zoom, and a pinch anywhere else does nothing; the agent's readings:
  a double tap no longer zooms the page either, the phone's own larger-text setting is untouched, and on a desktop the
  browser's Ctrl + / − cannot be switched off and stays [D1567].
- Inside a Power Apps code app the page sits in the host's own frame, which may set its own zoom — not checked; found
  out when the app is first put there [D1567].

## Words on screen and feedback
- The app's screens are not wordy: a label, a hint or a line of small print earns its place or goes — fewer words on
  screen, the same information — though a sentence a person would say may cost a word or two (the writing guide's order,
  the scheduler's D836) [D726, D836].
- The agent's readings, told to him: it weighs on every screen's design; it is about words on screen, never removing what
  a man needs in order not to make a mistake — such a word is shortened or moved behind the screen's "How this works"
  fold; nothing built is reworded on its strength alone — a change of wording is shown to him on a picture first [D726,
  D836].
- Feedback for an action is designed into the screen itself: the result is the feedback — a thing added appears, in view,
  wearing the just-added mark, a changed value shows changed, a removed thing is gone with Undo lit — and a passing note
  is raised only for what is important and not intuitive, or complicated; the design guide's §1 states its three cases
  [D850].
- A note is still raised where the result is out of view, where the press did something the person cannot see or carries
  a warning, and whenever it failed or was refused; the "Saving…" and "Not saved" signs are not this rule's; a note
  already built that only says what the screen shows is put to him as a delete candidate, never deleted unasked [D850].

## The design guide's standing rules
- One mark, one look (the guide's §4): the just-added mark is the plain blue ring, no glow, for about six seconds, on the
  edge of the thing added — a row's controls outside it; a line, row or wave ringed round itself; any table row one box; no other flash over
  it; a new kind of mark his to rule; a taken suggested brief or rally wears it as a short flash, about a second (not
  built), and on the Leave War a day brought into view wears the Leave War's cyan [D876, D1038, D1449].
- No mark in this app glows (the guide's §4): a ring, stripe, box, line, panel, dot or button is drawn as it is; a shadow
  in its own colour or a pale band round it (a halo) is a glow, a dark shadow under a window or a menu is depth; the
  balance bar's and move banner's band and the fast sync dot's and Admin → Users' dots' bands are gone; a new on/off
  control takes the filter chip's "on" look unless he rules otherwise; a new glow is his to rule [D887, D1614].
- The app's own sign is not a mark: the sign-in logo keeps its light, as the loading claw does; the page's faint wash,
  once kept with it, is gone [D887, D1614].
- Dragging (the guide's §5A): one drop, one landing line, in one place; a thing carried to the edge of what it sits in
  scrolls it, at the edge distance and speed the app already uses, on for a reader who asked for less motion [D895].
- Nothing pinned leaks: a bar, or any part that stays put while what is under it scrolls, shows none of that content
  behind it or through a gap at its edges, at every zoom and every scroll position, since a pinned part reads as a solid
  surface — on a phone and a desktop, a heading row included, each check of a screen with a pinned part made zoomed in and out and scrolled on his iPhone's engine (the
  agent's reading); the desktop week's ‹ › arrows are its one exception (the scheduler's D1522) [D1518, D1522].

## Settled — leave as they are
- Tab and Shift+Tab out of a board menu, as built: the board's string-drawn menus close on a Tab past their end and give
  the keys back to their button; the ⋯ menu lets Tab move on to the next control and closes, as the week's ⋯ does;
  Shift+Tab from its first item back onto ⋯ leaves it open [D1772].
- The keyboard batch's three details the mock-up did not draw, as built: the cyan ring on the board menus' small
  buttons; Enter on the calendar button with "Jump to a date" open closing and reopening it in place (a mouse click only
  closes it); after "Don't add" on the OIL question, the keys on "Answer OIL" in the bar — his "leave it", read as kept
  as built [D1652].
- The app's four legends: Edit Schedule's "Legend" fold, alone on its row as built, the Leave War's and the Tracker's
  Legend buttons opening the same panel, and the Inputs and SANS calendars' colour key always in view — a long legend
  behind a button or the fold, a key of two or three colours in view [D1701, D926].
- The claw's round: its three claws drawn, held, faded and drawn again from nothing, with its short dark moment between
  rounds — the overlapping next round not built, and a walk does not treat that moment as a fault, only a first frame's
  [D1617].
- The start-up claw does not glide onto the logo: today's plain 0.2 s fade where it stands while the first screen
  appears, both logos briefly on screen ("No change", the mock-up's label for today's look — the agent's reading, told to
  him) [D1618].
- The failed-download card's words, "It didn't download. Check your signal, then retry.", though an app update since the
  tab opened is the other cause — Retry cures that too; the cause-neutral "Retry to load it again" is not taken [D1637].
- The Leave War figure box's grey "Blocked" tag hangs from its own box's left edge on a phone as on a desktop, opening to
  the right so it covers no next row's arrow, still giving no reason, as built; the drawing's phone tag, 53px to the
  right, is not kept, the drawing check's difference accepted [D1670].
- The board's bar and every top bar's pair: the undo-topbar mock-up, `raptor-port/docs/mock/undo-topbar.html` (version
  4), approved as drawn, is the design of record — on a phone the sync pill its dot alone wherever the pair shows; a
  changes button for each page an idea filed, not built (`[HIST-PER-PAGE]`) [D349, D481, D347, D348].
- The band, look 1: `raptor-port/docs/mock/2026-11-05-save-band/img/look1-*.png`; the keyboard and windows batch:
  `raptor-port/docs/mock/2026-11-05-keys-windows/` [D1655, D1645, D1646].

## From other areas (each stated on its own area's file)
- How we work's: every calendar icon is Edit Schedule's line calendar, drawn by the app, never 📅; button sizes never
  change without his word; anything new a person will see is drawn as a mock-up first [D1508, D487, D1625].
- The scheduler's: up to 1599 wide on a desktop the board's own bar draws Undo, Redo and History as icons, their names on
  hover, and sync as its dot, as every top bar does; wider, the words come back; the board on a phone is left as it is
  [D1130].
- The scheduler's: over the board a window not yet moved opens just below the board's own bar, so the bell, Insights and
  ✓ Done stay in reach [D1106].
- The scheduler's: on a phone on its side the board's Calendar, title, day strip and search scroll away with the list
  while its bar of buttons stays at the top [D1780, D1800].
- The scheduler's: the bar that stays after an unanswered OIL question ("Not swapped — OIL not answered · Answer OIL ·
  OK") takes the band under the top bar, always one line, under the "Not saved" warning when both are up [D831, D840,
  D841].
- The scheduler's: the desktop week's ‹ › arrows stay see-through — a slim tab, 14 wide and 70 tall, sliding out to the
  full arrow when the pointer comes near, frosted as the old arrow was at rest [D1522, D1526, D1527].
- The scheduler's: the just-added ring began as the board's plain blue ring with no glow, a note ringed round its own box;
  the board's other glows went, each keeping its ring [D860, D877].
- The scheduler's: a picked answer with the keyboard on it shows one ring, the keyboard's on its own edge; the one date
  calendar's picked date is a plain disc, ringed only while a keyboard is on it [D842, D824].
- The scheduler's: a week whose saved copy cannot be read refuses a change in the grey "Blocked:" note [D1785].
- The scheduler's: on Edit Schedule a man carried to the week's side moves it one day at a time, the drag rule taking a
  day's step [D1529].
- The Inputs pages': the "Schedule updated" note after the board's ✓ Done is gone, nothing in its place; "Input updated"
  goes where the changed input is in view; a puck's drop raises no note [D854].
- The Inputs pages': an input window's ✕ asks the same question as Escape when anything is not saved; Cancel still closes
  at once [D1622].
- The Inputs pages': the title box's pencil sits inside the box at its right end, the app's one solid pencil [D919,
  D1134].
- The Inputs pages': the settings icon reads as a gear, never like a Sun, which means day flying there; the Inputs
  calendar's filters and gear move as one group [D635, D1702, D1708].
- The Inputs pages': four more drags follow the edge — the SANS calendar's pick across days, the Tracker's select box and
  ⇅ Reorder list, the people picker [D900].
- The Leave War's: undo and redo leave its grid where it is when the day they change is on screen [D670, D672].
- The Leave War's: its Balances page, the first case of nothing pinned leaking, shows nothing of its rows behind or
  through its bar; its pinned dates row and Quals' header take the row's place in the same frame [D1519, D1789, D1850].
- The Leave War's: a pinch zooms its grid only, the frozen dates and names growing with it, its OIL tab alike; no key
  zooms the grid on a desktop, where the browser's Ctrl + / − zooms the whole page [D1282, D1285, D1286].
- The Leave War's: its glows gone — the open-bidding box, his own row's ring, today's card, a SANS stripe's and the
  landing line's light; Rearrange and Show SANS "on" as the filter chip [D881, D882].
- The Leave War's: in the "Open for bidding" window each open stretch carries a calendar icon, not a pencil [D1172].
- The Tracker's: its typed marks are line icons — its bar's and menus', each tool of Edit chart layout, Merge and Unmerge
  in words, the lull's × the drawn ✕ — its pencils the app's one solid pencil [D1132, D1135, D1705, D1134].
- The Tracker's: its "Delete course" question and an import's note drop their typed ↺ and ⇅ marks [D1860].
- The Tracker's: on a phone its Find strip's ✕ empties the box and puts Find away, the ✕ staying in the box [D1791].
- The Tracker's: its "● saved" in a browser that refuses to keep anything is drawn for him with its next batch [D1660].
- People and accounts': the waiting screen's "View the schedule" shows only while the admins' guest switch is on, off by
  default [D221, D204].
