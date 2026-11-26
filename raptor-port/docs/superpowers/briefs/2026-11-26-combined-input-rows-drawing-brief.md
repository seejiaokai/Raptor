# Drawing brief — the combined-row job, for his look (chat 190, 26 Nov 26)

**For:** a fresh Opus helper (his rule: Opus draws; a fresh Fable then adjusts the words, D2441). Draw on the REAL
running app, never a hand-made picture: read `.claude/skills/brainstorming/mockups-on-the-real-app.md` whole first, and
`raptor-port/docs/walk-scripts.md` §2 and §5 (the machine's traps). Nothing under `raptor-port/src` changes.

## What he has ruled (the plan `../specs/2026-11-26-combined-input-rows.md` §His answers; full rows by
`grep -h '^| D2777 |' .claude/decisions-full/*.md` in Git Bash)
- D2777: an input for several people is ONE row on the schedule's Unavailable list too (today a row a man) — a group
  leave, an overseas duty, a course, an Attach; medical alone stays a row per man (D2775).
- D2772, D2779: every input row works as a sim row — a drop on a man's puck replaces him, an EXTRA EMPTY PLACE adds;
  nothing asked, no note.
- D2776: a drop on a medical row is refused with a short note saying why (always one man's).
- D2773: a drop on a Personal Inputs line is refused, pointing to the input's row on the Ground Programme.
- D2778: on the Leave War a group leave changes as one; a man's box of it is MARKED AS SHARED.

## The frames — each "today" beside "proposed", at desktop 1536×864 (Chromium) and his iPhone 402×874 (WebKit, touch, 3×)
Stage through the app's own controls (served build `http://localhost:4190/`, sign in `ad` / `a`): on the Inputs page,
"+ Input", "Several people", an OD for Ranger and Hex (and a third man) on Wed 15 – Fri 17 Jul; an ATT C for one man the
same day; a Personal input for two people, one accepted onto the programme and one left waiting. Assert each on screen
before drawing.
1. **Edit Schedule, the Unavailable list:** today's two rows of the OD → ONE row: its pucks side by side (wrapping
   downward if they do not fit, D743), one title, time, remark and one Reject, and an extra empty place at the end —
   cloned from the Ground Programme row's own empty "+ add" place, nothing restyled. The medical row below stays one man's.
2. **The Scheduler Board**, desktop and its phone layout: the same row.
3. **A drop refused on a medical row:** the app's grey refusal note (the "Blocked:" look — find it on the running app by
   a refused change, e.g. a placeholder dropped on a flying line), words drafted: "Blocked: a medical is always one
   person's." Picture it where the note shows after a drop.
4. **A drop refused on a Personal Inputs line:** the same note — for a line whose input is on the Ground Programme,
   "Blocked: drop him on this input's row on the Ground Programme."; for one waiting or rejected (no Ground row),
   "Blocked: put this input on the programme first." (both drafts).
5. **The Leave War grid:** the OD's (or a group LL's — file one on the Inputs page for three) boxes on each man's row,
   wearing a shared mark. Draw the mark as the Inputs calendar already marks a shared bar — it leads with its count
   (find a shared input's bar on the Inputs calendar and copy its look); it must add no height to a grid row. Draw it
   on every shared entry the war shows, not only leave. Phone and desktop.
6. **A tap on that box on the war:** today's window; proposed: the same war window, its line for the group leave a
   button "Change for all 3" (draft) that opens the input's own window over the war, the grid still behind it.

For each frame: a picture today, a picture proposed, the place marked (an outline on the element, a numbered tag in
its `::before`), cropped to what matters (D1222). List every place the app differed from this brief, and every new word
you drew (for Fable's adjustment). Commit nothing; save the injection script and pictures in
`raptor-port/docs/mock/2026-11-26-combined-row/` (script `draw-combined-row.mjs`, pictures `img/`), the script printing a
version line, its build and picture folders taken from its arguments.

## The report
Write it with the Write tool to the file named in your prompt: each frame — the pictures' file names, what was drawn,
what is real and what drawn in; the list of differences; the new words. Hand back one line.
