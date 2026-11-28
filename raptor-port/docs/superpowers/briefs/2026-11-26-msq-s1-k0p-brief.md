# Section 1 (the guard rail) — the presser: K2a beside its drawings, and K0's presses (chat 194, 26 Nov 26)

You drive the **built** app in a real browser and report what a person sees. You change **no file under
`raptor-port/src` or `raptor-port/e2e`**. You write walk scripts, pictures and one report.

**Working rules.** Only in `C:/Users/User/projects/Raptor/.claude/worktrees/chat-156-handoff-a6d8d7` (branch
`claude/msq-s1-guard-6ae5e1`); never cd above it, never another worktree, never git stash / commit / push / switch /
merge. Read `raptor-port/docs/walk-scripts.md` before writing any script (how a walk script is written here, and the
traps), and `raptor-port/CLAUDE.md` §Build & verify (signing in, the browser fallback for a new Playwright script).
Scripts go in `raptor-port/scripts/handpass/n194/`, written with the Write tool, never typed into the command line;
the earlier drawers' scripts in `raptor-port/scripts/handpass/n191/` already sign in, make squadron 150 and Hunter's
rights through the app's own controls and take cropped pictures at twice the sharpness — reuse their library, do not
re-invent it. Pictures go in a NEW folder, `raptor-port/docs/img/handpass/2026-11-26-msq-s1-k0p/`.

**The checks lock and the port.** Another chat builds on this PC. Before you build or serve:
`node raptor-port/scripts/gatelock.mjs take "claude/msq-s1-guard-6ae5e1 — K2a's look and K0's presses, port 4741"`
(from the repo root; wait for `gatelock: taken`, the call's timeout 600000). Check port 4741 is free. Then
`cd "<the folder>/raptor-port" && npm run build && npx vite preview --port 4741` (the preview in the background) and
drive `http://localhost:4741/`. **Release the lock the moment your last picture is taken**
(`node raptor-port/scripts/gatelock.mjs release`), and stop the preview by its PORT (PowerShell
`Get-NetTCPConnection -LocalPort 4741` → `Stop-Process`), never by a command-line pattern. Say in the report that
both were done.

**Sizes.** A desktop at 1536 × 864, and his iPhone's size, 390 × 844 with touch, each at twice the sharpness. Three
squadrons always: 142, 149 and 150; Saber (master admin, sign-in `ad` / `a`), Hunter (142's admin, Plan of 149, View of
150), Ranger (142's member, `us` / `us`), Kestrel (149's admin), Mako (150's admin).

**How to look.** Open every picture you save with the Read tool before you describe it — a picture nobody opened was
not looked at. Report what the screen shows, measured where the brief asks for a measure; never a guess, never "looks
right". Watch console errors and page errors on every step and list any.

## Part 1 — "+ Add a person" on Admin → Users, beside its drawings (K2a, built)

The drawings he approved (`raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/drawn/`): closed, desktop
`s3-8-d-column-crop.png` (the top row only; the column and jumps in it are another section's); closed, phone
`s2-10-p-waiting-crop.png` (the button full width under the search row; the jumps are another section's); open,
desktop `s1-add2-a-d-crop.png`; open, phone `s1-add2-a-p-crop.png`. For each of the four, a picture of the build cut
to the same part, **laid side by side with its drawing in one image**, and a list of every difference in place, size,
colour or text alignment over about 2px, each measured. Then, on both sizes:
1. The top row: the search, Filter and "+ Add a person" — each box's left, top, width and height; are the three one
   height and on one line (desktop)? On the phone: the search and Filter one row, the button full width under them.
2. Open the form: the opener is gone; the search's width before and after (it should widen into the opener's place);
   the heading "ADD A PERSON" against the page's other headings ("Waiting for access") — same size, weight, colour,
   letter spacing?
3. "Add person" and "Cancel": each box measured, and beside them the Save · Cancel pair of an opened person's row on
   the same page — the two pairs should be the same height, the same gap, on one line; side by side on the phone too.
4. Cancel: the form gone, empty when opened again, and the keyboard's focus on "+ Add a person" (picture the ring).
   The same with Escape. Escape with the Post in calendar open: the calendar closes first and the form stays; a second
   Escape closes the form.
5. Type a callsign, open Filter over the open form, close it: the form and its typing still there. Type in the
   search with the form open: the form and its typing still there.
6. Add a person (callsign, seat, CAT) on 149 as Hunter: he appears in 149's list, the form stays open and empty; a
   passing note says what today's says. There is **no Home squadron box** — for Hunter on 142 and 149, for Saber on
   all three.
7. From Quals, "+ Add person": Admin → Users opens with the form open and the cursor in Callsign/Name (desktop).
8. What stands under the open form: the builder put the page's separator line between the form and "Waiting for
   access" (the drawing does not show that part) — picture it on both sizes.
9. On the phone with the keys up (tap the callsign box): are "Add person" and "Cancel" reachable by scrolling, and
   does anything jump?

## Part 2 — K0's presses

A. **The Tracker's two lull pop-ups** ("Set lull period — <student>", "Copy <student>'s lull periods to", on the Info
   tab). Signed in as Saber on 142's Tracker: open each; picture it (does the shade cover the whole screen, the top bar
   too?); try to reach the squadron picker in the top bar **by the keys** (Tab / Shift+Tab until the focus leaves the
   pop-up; Enter if it lands on the squadron button). Can a squadron be picked while the pop-up is up? Yes or no, with
   the picture that shows it. The same for the name badge (the member-view switch) and the bell.
B. **Inputs calendar settings under the Calendar on a phone, and its SANS twin.** On the phone: Inputs → the settings
   window, change the late cut-off without saving, open the Calendar from there — picture it (the Calendar over the
   settings window). Then the SANS calendar's settings window: can the Calendar be opened from it or over it the same
   way, with a change not saved? Yes or no, pictured.
C. **Quals' Done with words left in "Add qualification":** Edit, type "LOW LEVEL", press Done without Add; press Edit
   again — are the words back? Pick 149 (Saber), press Edit there — are the words in 149's box?
D. **150's "+ Input" Person list** as Saber with 150 picked: picture the opened list; who is offered (Saber himself?
   an archived man?).
E. **A Retry that lands:** open the app with `?savefail` on the address (it refuses every save in that tab), make one
   change on Edit Schedule, see "Not saved"; remove the refusal as the app's own notes say (read
   `raptor-port/docs/gates-and-deploy.md` or search the code for `savefail`) or reload without it if that is the only
   way, press Retry where it applies — what does Undo's hover name say is on top afterwards? If this cannot be pressed
   as described, say exactly why.
F. **The five Leave War windows of the owner's question — one cropped, marked picture each, on the desktop, and on the
   phone where it looks different** (these go to the owner, so: cut to the window, twice the sharpness, the window's
   title ringed in teal, nothing else marked): (1) "Leave filed on the Inputs page" (or its twin "OIL the app
   credited"); (2) "Your OIL award"; (3) "Open for bidding" as a member sees it (Ranger); (4) a person's window —
   another man's, as a member sees it; (5) "OIL TRACKER" as a member sees it. How each is opened is in
   `raptor-port/docs/superpowers/briefs/2026-11-26-msq-s1-k0-c-report.md` §6 (the file and component of each); if the
   demo has no record that opens one, make it through the app's own controls and say how.

## The report

`raptor-port/docs/superpowers/briefs/2026-11-26-msq-s1-k0p-report.md`: one section per numbered or lettered item —
what was pressed, what the screen showed, the picture's file name, each measure; a table of every difference from a
drawing; the console and page errors; what could not be pressed and why; that the lock was released and the preview
stopped. End your reply with that path and a ten-line summary, faults first.
