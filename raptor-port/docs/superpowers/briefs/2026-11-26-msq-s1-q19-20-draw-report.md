# Section 1 (the guard rail) — the drawings for questions 19 and 20: the drawer's report (chat 204, 26 Nov 26)

Drawn to `2026-11-26-msq-s1-q19-20-draw-brief.md` and the orchestrator's five additions. No file under `raptor-port/src`
changed. Nothing committed or pushed. The checks lock was taken for the build and the pictures, then released. Nothing
is left serving on port 4741.

## How it ran

- **Build:** `npm run build` (PASS), with the checks lock taken. **Preview:** `npx vite preview --port 4741`, stopped by
  its port after the last picture. The browsers were Chromium for the desktop and WebKit with touch for the phone, at 2×.
  Each used the repo's own browser fallback.
- **Three squadrons:** each picture's browser starts from the demo data, and Saber makes 150 first, as
  `n191/draw-s1-notes.mjs` did. The steps are Admin → Squadrons → "+ New squadron" → 150, Home base, first admin
  Kestrel · 149 → Save. The picker then lists 142, 149 and 150. `n176`'s saved world could not be reused: it was saved
  on port 4700, and a browser keeps saved data per address.
- **How the note was raised: by the app's own code, from the real state.**
  - No door raises the note yet (K4–K6). The built bundle also drops the seam's ask and say, because nothing calls them.
  - So the script adds one line to the served index chunk, in its own browser only:
    `window.__n204 = { open: <whatIsOpen>, say: <guardSay> }`. The two names are read off the built file by their shapes;
    this run found `UO` and `hF` in `index-Btbd0ju9.js`.
  - After the presses, the script asks the app's own `whatIsOpen()` what refuses. It hands that answer to the app's own
    `guardSay(refusal, 'pick', 'u149', { from })`.
  - So the words are `guardWords`' and the place is `toastAt` / `placeToast`'s. The script changes only the note's fade:
    it holds the note at full opacity so it can be photographed.
  - Before the note, the squadron list is opened and closed again with nothing picked (the picker on a desktop).
- **The recommended pictures:** the words after "Blocked:" are swapped inside the note's own element. A resize event is
  then sent, and the app's own listener places the note again. Its look and place rules are unchanged.
- **The mark:** the note is ringed teal dashed (2px, 4px clear), as before. Nothing else is ringed.
- **Console errors, page errors and failed requests:** none in any run.
- Scripts: `raptor-port/scripts/handpass/n204/q-lib.mjs`, `draw-q19.mjs`, `draw-q20.mjs` and `q-probe.mjs` (a first look).
  Logs: `raptor-port/.tmp/n204-q19-20/log-q19.txt` and `log-q20.txt`.

## Question 19 — DIFFERS FROM THE BRIEF: no finger on a phone reaches this state

**What I found on the phone (402×874), pressed as the brief wrote it.** Saber made 150, then ☰ → Tracker → Info →
"+ Set lull period" → tapped the 1st. The pop-up read "Start 01/11/26 — now pick the last day", and `whatIsOpen()` said
the Tracker's window refuses.

The pop-up lays its grey shade over the whole screen. The Flow chart tab, ☰ and the bell are all covered: the tab is
covered by the pop-up's shade, and ☰ and the bell are covered too. n191's drawer found the same on 26 Nov. A tap on the
Flow chart tab lands on the shade, and the shade **closes the pop-up**: afterwards nothing was open and nothing refused.
So a phone can never leave this pop-up behind the Flow chart tab. The words-owed test passes in the test world because
that world does not load the stylesheet.

**The one way presses do reach it: a desktop window made narrow.**
- Saber on a desktop 1536 wide opens the same pop-up on the Info panel and taps the 1st. Here too the shade covers the
  picker.
- Then the window is made 1000 wide, under the Tracker's own 1050 phone-layout width. The Tracker switches to its Flow
  chart / Info / Show All tabs with **Flow chart showing**. The pop-up and its shade are hidden behind it, and the
  squadron picker is free.
- `whatIsOpen()` still says the Tracker's window refuses. The note is raised under the picker, because 1000 wide is not
  the phone's foot layout (620 or less): "Blocked: close the open window on the Tracker, then pick 149."
- A tablet turned from landscape to portrait would be another real way there. Not tried.

**Pictures** (in `raptor-port/docs/mock/2026-11-26-msq-questions/q19-20/`):
| Picture | What it shows |
|---|---|
| `q19-built.png` / `-crop` | desktop narrowed to 1000: Flow chart showing, Info beside it, the note as built under the "142 ▾" mark |
| `q19-recommended.png` / `-crop` | the same, "Blocked: close the open window on the Tracker’s Info tab, then pick 149." |
| `q19-info-lull.png` / `-crop` | desktop 1536, before narrowing: what "the open window" is — the "Set lull period" calendar over the page, the first day picked, the Info panel at the right |
| `q19-phone-lull.png` / `-crop` | the phone: the same pop-up with its shade over the tabs and ☰ — why a phone never gets here (no ring) |

Seen, each one:
- The note is one line, on screen and not cut off. It covers the left part of the Tracker's own toolbar row (the crew,
  course and syllabus pickers). That is where the app's rule puts it: 8px under the bar, on the picker's left edge.
- The crops show the "142 ▾" mark, the note and both tabs.

## Question 20 — reached as written, all five

A desktop at 1536×864, Saber with 150 made first. Each case ran in its own fresh browser.
| Case | Steps | `whatIsOpen` | As built (the app's words) | Recommended (swapped in) |
|---|---|---|---|---|
| (a) | Squadrons → "+ New squadron" → 151 typed → Users | `newsqn` | Blocked: save or cancel the new squadron, then pick 149. | …the new squadron on Squadrons, then pick 149. |
| (b) | Squadrons → 142's row → Place changed → Users | `sqnmove` | Blocked: save or cancel the open row, then pick 149. | …the open row on Squadrons, then pick 149. |
| (c) | Users → "+ Add a person" → "Nova" typed → Squadrons | `addperson` | Blocked: add or cancel the new person, then pick 149. | …the new person on Users, then pick 149. |
| (d) | (Request access as "Newface" for 142, signed out) Users → Give access → Role Member → Admin → Squadrons | `giveaccess` | Blocked: finish or cancel giving access, then pick 149. | …giving access on Users, then pick 149. |
| twin | Users → Ace's row → a letter typed into Sign-in → Squadrons | `userrow` | Blocked: save or cancel the open row on Users, then pick 149. | (his ruled words; one picture) |

What differed from the brief:
- (b): the Place list offers only "Home base" and "+ New place…", because the demo has one place. So "its place changed"
  means "+ New place…" was picked, as the test kit does.
- (d): Users then shows a "1" badge and "1 waiting for access", which is true of that state.

**Pictures:**
- (a) and (c): whole screen and crop, once with each wording — `q20a-built`, `q20a-recommended`, `q20c-built`,
  `q20c-recommended` (`.png` and `-crop.png`).
- (b), (d) and the twin: the crop only — `q20b-built-crop`, `q20b-recommended-crop`, `q20d-built-crop`,
  `q20d-recommended-crop`, `q20twin-built-crop`.
- Every crop shows the "142 ▾" mark, the ringed note under it, and Admin's Users and Squadrons buttons, with the
  section showing lit.

Seen, each one:
- Every note is one line, under the picker, and covers nothing it names.
- The whole screens show the other section open: Users' list in (a), Squadrons' list in (c), where 150 shows as "0
  people".
- **One real thing to know:** the note stands over the page's own "Admin" title.
  - The shorter notes leave its last letters showing at their right end: "n" after (c)'s note, "in" after (b)'s and
    (d)'s.
  - This is where the app places the note today, not a fault of the drawing.
  - It is worth a glance from whoever reviews the note's place, since the guide's lesson on parts peeking past a box
    may apply.

## Draft cards for the questions page

**Question 19 — the Tracker's window you can no longer see**
- *When it happens:* an admin on a desktop or laptop starts setting a student's lull period on the Tracker's Info panel,
  then makes the browser window narrow before finishing. The Tracker folds into its tabs and shows the Flow chart. Then
  he picks another squadron. This is rare: it needs a narrowed window. On a phone it cannot happen, because the
  pop-up's grey cover blocks everything until it is closed.
- *What he sees today:* "Blocked: close the open window on the Tracker, then pick 149."
- *Recommended:* "Blocked: close the open window on the Tracker’s Info tab, then pick 149." With the Flow chart
  showing, he cannot see the window at all; naming the Info tab tells him where to find it.
- *Other answer:* keep "…on the Tracker", as it is today.
- *Pictures:* `q19-built-crop`, `q19-recommended-crop` (each with its whole screen for a tap), `q19-info-lull-crop`
  (what the open window is); `q19-phone-lull` if he asks why the phone is left out.

**Question 20 — a half-finished form on Admin when he has moved to the other section**
- *When it happens:* an admin starts something on Admin's Squadrons or Users and has not saved it, then clicks the other
  section and picks another squadron. The four cases are:
  - a new squadron with its number typed;
  - a squadron's place being changed;
  - a new person with a callsign typed;
  - an access request with its role changed.
  
  It happens now and then while he is setting things up.
- *What he sees today:*
  - "Blocked: save or cancel the new squadron, then pick 149."
  - "…the open row…"
  - "Blocked: add or cancel the new person, then pick 149."
  - "Blocked: finish or cancel giving access, then pick 149."
  
  None of them says which section the unfinished thing is on.
- *Recommended:* add where it is, as he already ruled for a person's row on Users ("…save or cancel the open row on
  Users, then pick 149"):
  - "…the new squadron on Squadrons…"
  - "…the open row on Squadrons…"
  - "…the new person on Users…"
  - "…giving access on Users…"
  
  The section is hidden, so the note should say where to go; this also matches his ruled wording.
- *Other answer:* keep the plain words as they are.
- *Pictures:* `q20a-built-crop` with `q20a-recommended-crop`, and `q20c-built-crop` with `q20c-recommended-crop` (each
  with its whole screen); `q20b-…-crop` and `q20d-…-crop` side by side; `q20twin-built-crop` as his ruled wording today.

## What could not be drawn, and why

- **Question 19 on a phone:** no press reaches it, as set out above. It is drawn on a desktop window narrowed to 1000
  wide, and the phone picture shows why the phone is left out.
- Nothing else was left undrawn.
