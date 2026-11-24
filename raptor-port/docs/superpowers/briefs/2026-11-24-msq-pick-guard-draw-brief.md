# [MSQ-PICK-GUARD] step 2 — draw the refusal note and the refresh note on the real screens (chat 166, 24 Nov 26)

You are a helper drawing mock-up pictures for the owner (not technical) to approve BEFORE anything is built (D1625).
Change no file under `raptor-port/src`; commit nothing; do not start, stop or rebuild the app — the host serves the
built app of branch `claude/msq-b1-screens-135` at `http://localhost:4700/`. Work in `C:\Users\User\projects\Raptor-msq`.

Read first: the backlog item `[MSQ-PICK-GUARD]` in `OUTSTANDING.md`; the press report
`raptor-port/docs/superpowers/briefs/2026-11-24-msq-pick-guard-press-report.md` (what today's app does — its scripts in
`raptor-port/scripts/handpass/n166/` show how to sign in, open each window and pick a squadron; reuse them); the
mock-up guide `.claude/skills/brainstorming/mockups-on-the-real-app.md` (if present; else search `.claude/skills` for
"mockups-on-the-real-app"); the design rulings `.claude/rules/decisions/design.md` (search it for "Blocked" and "note").

## How to draw (the app's own parts — D1496)
Every picture is the REAL app driven by a script to the case's state, then the new note added on top, in the app's own
look:
- **The refusal note** is the app's existing grey "Blocked:" note (D1667, D1668): call `window.toast(text, 'blocked')`
  in the page (the app exposes it) — it draws the real note with the red no-entry sign and bold "Blocked:". Nothing
  else on screen changes: the window stays open, the squadron stays as it was. Where the press opened a list (the
  squadron list), close it as the built guard would (the pick did not happen) — say in the caption what was pressed.
- **The refresh note** is new: a shade over the whole app and one card in the middle, built from the app's OWN question
  card (find the markup and classes of an existing one in the running page — e.g. the Tracker's "You have unsaved
  chart edits…" card, or the input's "This input has unsaved changes…" ask card — and clone it with `page.evaluate`),
  with its title, body and ONE button, "Refresh", styled as that card's main button. Nothing else on the card.
- Pictures at deviceScaleFactor 2; desktop 1536×864 and phone 402×874 (`isMobile`, touch). Each picture also cropped
  to what it is about (the note and the window or control it concerns), with the rest of the screen dimmed if a whole
  screen is needed (D1222). Open every picture you take before you call it done.

## The words (settled — drafted by Opus, adjusted by a fresh Fable, D2441; use them exactly)
- R1 a squadron pick with a window open: "Blocked: close the open window, then pick 149."
- R2 the member-view switch with a window open: "Blocked: close the open window, then switch to the member view."
- R3 a bell line leading to another squadron, a window open: "Blocked: close the open window, then press this line again."
- T1 the Tracker's question at the member-view switch (the pick's question card, its words changed): "You have unsaved
  chart edits on “2026”. Save them before switching to the member view?" — Stay · Discard them · Save them.
- F1 his own move at midnight: title "You are 149's from today"; body "Your move to 149 took effect at midnight. Refresh
  and sign in again to carry on. Anything you hadn't saved is lost."; button "Refresh".
- F2 a right taken away: title "Your access has changed"; body "An admin changed what you can do here. Refresh and sign
  in again to carry on. Anything you hadn't saved is lost."; button "Refresh".
- F3 the Tracker failing part-way through a switch: title "The switch to 149 didn't finish"; body "The Tracker stopped
  part-way. Refresh and sign in again. Anything you hadn't saved is lost."; button "Refresh".

## The pictures — each a pair: TODAY (from the press, re-taken by your script) and AFTER (with the note)
1. Desktop: an Input window open (typed words in it), the bar's squadron picker pressed for 149 → R1.
2. Desktop: the same window, the member-view switch pressed → R2.
3. Phone: Leave War's My leave window open (the phone's picker is reachable over it), the ☰ squadron list pressed → R1
   (see where the note sits on a phone).
4. Desktop: an Input window open, the bell list opened and a line leading to the other squadron pressed → R3. Check
   the risk Fable named: is the bell list itself still showing when the note appears? If so, say so in the caption.
5. Desktop: the Tracker with an unsaved chart edit, the member-view switch pressed → T1.
6. Desktop and phone: his move at midnight with an Input window open (press report E1's way, its clock stand-in) →
   TODAY the greyed window and "This change could not be saved." band; AFTER the shade and the F1 card over it.
7. Desktop: F2 over an Input window (no today picture: this build cannot notice another tab's change — say so).
8. Desktop: F3 on the Tracker page, today's buttonless "Couldn't finish upgrading your Tracker data" panel vs the F3
   card.
Name the pictures `p<n>-<d|p>-<today|after>.png` (and `-crop` for crops) in
`raptor-port/docs/mock/2026-11-24-msq-pick-guard/drawn/`; the scripts as `raptor-port/scripts/handpass/n166/draw-*.mjs`,
each printing `FACT` lines of the words actually on screen in each picture (so the host can re-run and check).

## Your hand-back — your final message (a report file is refused; do not try)
Under 500 words: one line per picture (name · what it shows · the words on screen, from the FACT lines), anything that
would not draw and why, and anything you saw that the owner should know (a note covered, cut off, or unreadable).
