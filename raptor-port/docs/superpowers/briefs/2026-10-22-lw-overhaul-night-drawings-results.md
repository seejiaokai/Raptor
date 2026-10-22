# The night drawings — the three helpers' reports (night of 21–22 Oct 26)

Saved as they arrived (brief: `2026-10-22-lw-overhaul-night-drawings.md`). Pictures in
`raptor-port/docs/mock/lw-overhaul/full/r6-*.png`; scripts `full-r6-person.mjs`, `full-r6-visit.mjs`,
`full-r6-settings.mjs`. Each helper changed nothing outside the mock folder.

## 1. The person window — D1201, D1203

**Pictures:** `r6-person-phone-member` (Ranger on himself: every balance, editable, his leave one line a request) ·
`r6-person-phone-member-years` (year drop-down: 2026 and ahead ✓, 2025, 2024) · `r6-person-phone-editing` (LVE tapped
→ a box, figure selected) · `r6-person-phone-locked` (member's view once locked) · `r6-person-phone-other` (Ranger
opening Anvil's, read only) · `r6-person-desk-admin` (Saber on Ranger's, locked, still editable) · `r6-person-lock-A`
(one lock for everyone, a "Balances locked" toggle in today's Settings) · `r6-person-lock-B` (a lock per person, on each
window). Needs the staged squadron at `LWMOCK_OUT/out/state.json` (copied from the earlier chat's scratch).

**Design:** (1) balances grid, five columns — LVE spanning two, OIL, CCL, FCL; then PL, EL, CL, MED across two — same
grid on desktop (window 560 wide; lesson 28); each code its look-F box (D1175, lesson 25); left large, used small; LVE's
used line splits LL · OL; left already counts waiting bids (D1153). (2) an editable figure has a thin input border
(lesson 27). (3) OIL not editable (reading — Q2). (4) MED days used only, outlined unfilled surface. (5) year picker,
this year and ahead by default (D1148). (6) his leave one line a request, aligned columns (lesson 29): box (filled /
dashed / grey struck), dates, days, state word, a paperclip where a document is. Editing: one tap selects, typing
replaces (lesson 9, D1080); Enter / Done saves, Escape restores; no passing note (D850). Locked: a small lock and
"Locked" by the Balances heading, borders gone. Admin: same window, lock shown, still editable. Someone else's window:
today any member taps any callsign and gets that man's full figures read only (D1008) — followed.

**Taps:** member checks CCL 1; member corrects LVE 2 + type; admin locks all: A 2 (⚙, toggle), B 2 per man (~100).

**Readings (not ruled):** the typed figure is the balance left (the app works the opening back, as "Set" does); OIL
not typed, a tap opens the OIL tracker; MED not editable; a medical line reads "Filed"; box first then dates; a
document is a paperclip only (D1159's reading said a file chip); "N used" on each tile; no subtitle; balances one figure
each until [LEAVE-YEAR], the year picker filters the list only; lock and changes in the change history (not drawn);
Ranger's list is invented demo data.

**Questions:** Q1 one lock for everyone or per man — recommended A (2 taps vs ~100). Q2 may a member type his own OIL
figure — recommended no (OIL is earned or awarded, D400, D402).

**For the red team:** D1201's reading says all seven editable but OIL comes from credits; the Figures/Balances drawer and
this grid show the same numbers twice — labels must agree; a dense line fits only a paperclip; "My leave" (D1141) and
this window should be one window (drawn so); the lock needs one home with the Settings redesign; the keyboard-up state
is undrawn.

## 2. "Since your last visit" — D1199

**Pictures:** `r6-visit-bell-today-phone` (the bell today: "Nothing new" — a war decision tells him nothing yet) ·
`r6-visit-A-phone` ("My leave" ends "● 3 new"; the Open chip wears the dot — bidding opened since) ·
`r6-visit-A-phone-list` (one tap: his list, "● 3 new", approved line with the bell's cyan unread dot "approved by Saber ·
08:40", refused dotted, a deleted leave struck "Deleted" this visit only) · `r6-visit-A-phone-grid` (tap a line: grid on
19–21 Jan, the blue just-added ring; "new" gone, bell out) · `r6-visit-A-phone-admin` ("Approvals 15 ● 3 new", fits at
390) · `r6-visit-A-desk` (same, same place — lesson 28) · `r6-visit-A-desk-approvals` (Approvals opens on a "New 3"
chip; "15 waiting · 3 new since you last looked, Wed 7 Jan 16:40"; new lines dotted; "Also since you last looked ·
nothing to decide": a withdrawn bid and an Inputs-page leave, each "Show on grid ›"; "Approve all 3") ·
`r6-visit-B-phone` / `-desk` (B: a cyan dot on each changed cell, that visit only) · `r6-visit-C-phone` (C: nothing new,
the bell's three lines as D1142 words them).

**Recommended A — "new" shows where each person already looks.** The member's count is his unread Leave War bell lines;
read status stays in the bell's one per-person record, so reading in either place clears both. What A adds: it sits
beside his balance and each request's state; it shows a deleted leave (no cell to show it); a tap lands with the
existing ring. Clears: opening the list reads the war's lines; dots stay while open, gone on close. Admin: a per-person
"last opened Approvals" time drives "New" (as the changes window's "new to you", D170, D338); clears on close. The mark
is the bell's own cyan unread dot — no new colour. B is weak (out of view unseen, no cell for a deleted leave, a new
mark on the dense grid). C is honest for members but gives admins nothing.

**Taps:** member learns of an approval — A 0 to see, 1 to read, 2 to the grid; C 1 / 2; B 0 if in view. Admin, new since
yesterday — A 1; today 1 plus comparing dates, and withdrawn bids / Inputs-page leave show nowhere.

**Readings:** opening "My leave"'s list reads the war's bell lines; Approvals opens on "New" while anything is new; the
Open chip's dot assumes a new member bell line "Bidding open · dates · who" (not in D1142 — to the notifications
register); a deleted leave listed struck for one visit; "● N new" cyan; the landing ring reuses D854.

**Questions:** Q1 A, B or C — recommended A. Q2 should members' bells say when bidding opens or closes — recommended yes.

**For the red team:** admins' bells hear nothing of withdrawn bids or Inputs-page leave (A covers it only in
Approvals); "Approve all" with the "New" view — the count changes with the view (check D1197); the Open chip's dates
would need to show a widening.

## 3. The Settings window — D1205

**Found:** the pink "1 NEW Events…" in his phone picture is a mock-up mark from round 2 (`full-win-b.mjs`,
`full/p-w12-desk-settings.png`), not the app; today's window has only "Calendar…".

**Pictures:** `r6-settings-today-phone` / `-desk` (today's, marked 1–12 for what goes or moves) · `r6-settings-new-phone`
/ `-desk` (proposed, same numbers) · `r6-settings-new-phone-fit` (at his iPhone height, middle of the screen — D997:
content 840 against 818, scrolls 22px; today 1006 against 770) · `r6-settings-new-desk-who` (a group's count opens who
is in it).

**Design — labelled rows, label left, controls right (lesson 26):** (1) subtitle goes; (2) YEAR: Calendar… and the new
Events… (D1155) — holidays by file stay on the Calendar window's Holidays list; (3) MANNING: Required P · Required W ·
Available P · Available W (phone "Req P"…), then ＋ Counter — each name opens that row's own window (rename D1193; amber
and red D1190, D1191, D1202 — the points stay in the row's window, one home; Settings is a second way in since the
Manning block can fold); (4) EVENT ROWS "− 2 ＋", the refusal on "−" kept; (5) Show SANS becomes "+ SANS" among the
add chips, hidden by the SANS row's ✕, "shown · counted" badge kept; (6) BALANCES: Lock balances, one switch (D1203),
on look of D882; (7) Reset order to the foot beside "Back to the standard groups", its state "In default order" /
"Arranged by hand", still asks once; (8) each group's count a button "12 ▾" opening who is in it — the hint goes;
(9) Management first, kind QUAL, colour pickable (D1200); (10) "Everyone else" a pinned last row with its count;
(11) "ADD A GROUP" + hint → "ADD FROM QUALS"; (12) Who wins keeps "follows the page", "— rarely needed" goes. No link to
Open for bidding (its chip is the one way in). Desktop 560 → 680 wide.

**Words removed (D846, to put to him):** "counters, rows & groups" · "Day flying, night flying or no fly for each date,
and the year's holidays." (kept as hover text on desktop) · "COUNTERS & ROWS" · "Show SANS" / "✓ SANS shown" ·
"Showing SANS puts them on the roster as their own group at the very bottom, and on the days they are available they
count toward the manning numbers like everyone else." · "ROSTER ORDER" · "people are rearranged on the grid with ⇅" ·
"In the default order — each group as listed below, pilots above WSOs, then by CAT and callsign." (and the "Arranged by
hand…" sentence) · "GROUPS — SHOWN, TOP TO BOTTOM" → "GROUPS" · "drag ⠿ to reorder · tap a name for who is in it · tap
a colour square to change it" · "Anyone no group above claims is shown under Everyone else, always last." · "ADD A
GROUP" + "the qualification options — grows as the squadron adds Quals" · "— rarely needed".

**Taps:** add SNR 2; hide SANS 2 (same as today); Available P's amber 3 from the grid, 4 through Settings.

**Readings:** labelled rows and "YEAR"; count-as-button; the resets together; "+ SANS"; one lock; wider desktop; no
bidding link; the open-group panel's notes left as they are.

**Questions:** Q1 Show SANS as "+ SANS" hidden by its ✕ — recommended yes (changes the switch whose on look D882
ruled). Q2 amber / red in the row's own window, Settings' names a second way in — recommended yes.

**For the red team:** Q1 touches D882; D997's full row says the Leave War's own sheets were not read into "the middle
of the screen" — needs his word; the lock's one home; the pictures show today's page top; Rearrange (⇅) has no pointer
in Settings any more.
