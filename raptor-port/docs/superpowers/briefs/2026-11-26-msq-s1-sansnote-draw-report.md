# Section 1 (the guard rail): the SANS calendar settings note drawn beside the approved Inputs one (report, chat 198, 26 Nov 26)

Brief: `2026-11-26-msq-s1-sansnote-draw-brief.md`. No file under `raptor-port/src` or `raptor-port/e2e` was changed, no build was run, nothing was committed or pushed. The built app already in `raptor-port/dist` was served on port 4741 and stopped by its port afterwards. Port 4741 is confirmed free.

## Pictures made (all new, in `raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/drawn/`)

| Picture | What it shows |
|---|---|
| `s1-cal-sanssettings-alt-p.png` + `-crop.png` | Phone, 402x874, WebKit at 2x. The Calendar fills the screen over SANS calendar settings, which has an unsaved change. At the foot, ringed teal and dashed: "**Blocked:** close the Calendar, save or cancel SANS calendar settings, then pick 149." (two lines). |
| `s1-cal-sanssettings-d.png` + `-crop.png` | Desktop, 1536x864, Chromium at 2x. The Calendar window sits on the left and SANS calendar settings on the right, side by side. The settings window shows the unsaved change ("Thursday", Save lit). Just under the squadron picker, ringed: "**Blocked:** save or cancel SANS calendar settings, then pick 149." (one line). |
| `s1-cal-sanssettings-side-p.png` | One picture with two phones, both cut to the same part of the screen: the Calendar's last two weeks and its foot, where the note stands (y 555 to 874 of a 402x874 screen). Left is the approved `s1-cal-settings-alt-p.png`, labelled "Approved — Inputs calendar settings". Right is the new picture, labelled "New — SANS calendar settings". It is drawn at 2x, and nothing else on it is marked. |

## The presses that got there

Saber (`ad`/`a`) signs in on the seeded app, on 142. The presses then run in this order:

1. Inputs, then the SANS tab.
2. The SANS calendar's gear, which opens "SANS calendar settings".
3. Under "Late cut-off for SANS commitments" (it stands as "A weekday"), the weekday list is moved from Wednesday to Thursday. The window's line changes from "due by the end of Wed 2 Dec" to "…Thu 3 Dec". Save lights, and nothing is saved.
4. "Calendar…" is pressed. Both windows are then open:
   - On the phone, the Calendar covers the settings window entirely.
   - On the desktop, the two windows stand side by side.
   - The change is still held in both cases.
5. The squadron list is opened and closed again without a pick: ☰ on the phone, the bar's picker on the desktop. The note is then raised.

There were no page errors, console errors or failed requests.

## How the note was drawn: the Inputs drawing's own recipe

The helper bodies are copied unchanged into `raptor-port/scripts/handpass/n198/sansnote-lib.mjs`. The originals hard-code port 4700, and their world set-up uses a form box that no longer exists. The recipe:

- **The note:** the app's own note, raised by `window.toast(text, 'blocked')`, with its fade stopped. Only its place is changed. The note functions come from `n175/draw-lib.mjs`.
- **Its place:**
  - On the phone, the app's foot place (12px each side, 26px up). It is lifted above any control its words name; here it met none.
  - On the desktop, 8px under the top bar, left edge on the squadron picker's left edge.
- **The ring and pictures:** a teal dashed ring (2px #0D9488, 4px clear). The picture pairs and crop boxes are the same as `n191/draw-s1-notes.mjs` used for its case `settings` and for "words gap 1a" (`cal-settings-alt-p`).
- **The press:** `refusePick`, which opens and closes the list, comes from the same script.
- **Sizes:** the same as the Inputs drawing (phone 402x874 WebKit, desktop 1536x864 Chromium, both at 2x).

The script is `raptor-port/scripts/handpass/n198/draw-sansnote.mjs`. The words are written in it as D2741 gives them. `probe-sansset.mjs` in the same folder was a one-off look at the settings window's boxes.

## What differs from the Inputs drawing besides the window and its name

- **The unsaved change is a different control.** In Inputs calendar settings, the recipe's "first number box" was the late cut-off's days. In SANS calendar settings, the first number boxes are the day colours ("Yellow from"), and the late cut-off stands as "A weekday" with two lists. To change the late cut-off as the brief asks, I moved its weekday list one day on (Wednesday to Thursday) instead of adding one to a number. My first run went by the Inputs recipe unchanged and raised "Yellow from" from 1 to 2. That run was thrown away and the pictures redrawn. The presser's script (n194) also changed the first box it found, which here is a colour box.
- **The note itself:**
  - Its place, box and line breaks are the same: phone 12,798 378x50, two lines, breaking after "SANS" where the Inputs one breaks after "Inputs"; desktop 20,65, one line.
  - The desktop note is a little narrower (403px) because "SANS" is shorter than "Inputs".
- **What the note covers:** in both drawings it covers no control its words name.
  - On the phone it lies over the Calendar's empty foot below the last week, as the Inputs one does. The side-by-side picture shows the same rows and the same place.
  - On the desktop it lies over the top-left corner of the Calendar window's title ("Calendar / admins only"), as the approved Inputs desktop note does.
- **The page behind (desktop only):** the SANS calendar's own top row (Highlight, gear) stands behind, where the Inputs one has Calendar / List, the filters and search. That is the window behind, as expected.
- **The data:** the Inputs drawing used chat 176's three-squadron world (142, 149, 150). This one uses the seeded app, as the brief allows, so the squadron list opened and closed held 142 and 149 only. The list is closed in the pictures, so nothing visible differs. The top bar reads "142 ▾ TALON" in both.

## What I could not do

Nothing in the brief was left undone.
