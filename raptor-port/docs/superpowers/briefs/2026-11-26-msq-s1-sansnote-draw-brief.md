# Section 1 (the guard rail) — draw the SANS calendar settings note on a phone, beside the approved Inputs one (chat 198, 26 Nov 26)

**Why.** His D2741 (26 Nov 26): on a phone, where the Calendar opened from SANS calendar settings fills the screen
and hides that window's unsaved change, a refused squadron pick names the Calendar first — **"Blocked: close the
Calendar, save or cancel SANS calendar settings, then pick 149."** — exactly as he approved for Inputs calendar
settings (D2729 Q3); on a desktop the plain **"Blocked: save or cancel SANS calendar settings, then pick 149."** The
words are his. The note is not built yet (the guard rail's step K3 builds it), and his rule D1625 says anything new he
will see is drawn on the real app and shown first. This job makes that drawing. **You draw; you build nothing in the
app** — no file under `raptor-port/src` or `raptor-port/e2e` changes.

## What he approved for Inputs — the pictures to match

`raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/drawn/`: `s1-cal-settings-alt-p-crop.png` (phone, the note
naming the Calendar first — the approved one), `s1-cal-settings-p-crop.png` (phone, the plain words — not chosen),
`s1-cal-settings-d-crop.png` (desktop, the plain words under the squadron picker). Open all three with the Read tool.
They were drawn by `raptor-port/scripts/handpass/n191/draw-s1-notes.mjs` (its case `settings`, and the "words gap 1a"
block for the phone's other wording), with `draw-s1-lib.mjs` and the words in `words-s1.mjs` (`sansSettings`,
`calThenSettings`). Read those three scripts first: your drawing uses **the same way of drawing the note** — the same
box, type, colours and place — so the SANS picture differs from the Inputs one only in the window behind and the
window's name in the words.

Read also `.claude/skills/brainstorming/mockups-on-the-real-app.md` and, in `raptor-port/docs/walk-scripts.md`, only
the traps you need.

## What to make

Saber on 142, on a phone (the same phone size the Inputs drawing used — read it from the script): the SANS calendar →
its gear → "SANS calendar settings" → the late cut-off changed and **not saved** → its "Calendar…" button pressed, so
the Calendar fills the screen over the settings window (the presser confirmed this happens: its pictures
`b-sans-settings-changed-p.png`, `b-sans-calendar-over-settings-p.png` in
`raptor-port/docs/img/handpass/2026-11-26-msq-s1-k0p/`, and its script `raptor-port/scripts/handpass/n194/k0p-b-settings.mjs`
shows the presses). Then the note drawn as the Inputs drawing drew it, with the SANS words.

1. `s1-cal-sanssettings-alt-p.png` and `-crop.png` — phone, the Calendar over SANS calendar settings, the note
   "Blocked: close the Calendar, save or cancel SANS calendar settings, then pick 149." where the approved Inputs
   picture has its note.
2. `s1-cal-sanssettings-d.png` and `-crop.png` — desktop (the Inputs drawing's desktop size), the SANS settings window
   and the Calendar side by side, the plain note "Blocked: save or cancel SANS calendar settings, then pick 149."
   under the squadron picker, as the Inputs desktop picture has it.
3. `s1-cal-sanssettings-side-p.png` — **one picture, two phones side by side**, cut to the same part of the screen
   (the foot of the Calendar with the note): left, the approved Inputs picture, labelled "Approved — Inputs calendar
   settings"; right, yours, labelled "New — SANS calendar settings". Twice the sharpness. Nothing else marked.

Put the pictures in `raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/drawn/` (beside the Inputs ones). Put your
script(s) in a new folder `raptor-port/scripts/handpass/n198/` — copy what you need from n191 / n194 rather than
editing those folders.

## How to run — no build, port 4741

- The built app is already in `raptor-port/dist` (built an hour ago on this branch). **Do not run `npm run build`** —
  another helper is changing source files in this working copy right now, and the checks lock is held by another
  chat. If `dist` is missing or will not serve, stop and say so.
- Serve it yourself on **port 4741** (check the port is free first: PowerShell `Get-NetTCPConnection -LocalPort 4741`),
  with `npx vite preview --port 4741 --strictPort` from `raptor-port/` in the background, and stop it **by its port**
  when you finish; confirm the port is free. The n191 scripts serve port 4700 and build their world through a form
  box that no longer exists — do not use their world set-up; sign in on the seeded app (`ad` / `a` is Saber, the
  admin; see `raptor-port/CLAUDE.md` "Signing in for a walk"), or use n194's `k0p-lib.mjs` helpers. Only one squadron
  is needed on screen; the note's words name 149, as the approved drawing's do.
- Use the repo's own browser fallback for Playwright (`raptor-port/CLAUDE.md`), never a hard-coded path.
- Open every picture you make and look at it: the note's words whole and not cut, the note not over a control it
  names, the two phones in the side-by-side cut to the same place.

House traps: write any multi-line script to a file and run the file; send long output to a file and read its tail;
no `jq`; run node / npx from `raptor-port/` by its full path inside the command. Do not commit or push. Change no file
outside the two folders named above and your report.

## Report → `raptor-port/docs/superpowers/briefs/2026-11-26-msq-s1-sansnote-draw-report.md`

The pictures made (names), what each shows, the presses that got there, how the note was drawn and that it is the
Inputs drawing's own recipe; anything in the SANS picture that differs from the Inputs one besides the window and its
name (for instance the note's place, its line breaks, a control it sits on); anything you could not do. End your
reply with the report's path and a five-line summary.
