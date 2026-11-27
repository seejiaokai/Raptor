# Section 1 (the guard rail) — the drawings for questions 30 and 31, report (chat 204, 27 Nov 26)

**NOT RUN: no picture was taken.** The checks lock was held the whole time by another chat ("claude/sans-warnlines-185 —
chat 208 walk build + walk", taken by hand at 04:20). This helper checked it every 10 seconds for about 31 minutes, from
the lock's 19th minute to its 50th, and it never came free. Nothing was built and no server was started. The
`node_modules` junction was made and then removed. No file under `raptor-port/src` changed, and nothing was committed.

The copy is at commit `f692bfd6e`, which comes after `76bdd9c7f`.

## Ready to run

The script is written: `raptor-port/scripts/handpass/n204/draw-q30-31.mjs`. It reuses `q2425-lib.mjs`, and its shape is
`draw-q29.mjs`'s. To run it:
1. Take the lock.
2. Build (`npm run build`).
3. Serve with `npx vite preview --port 4741`.
4. Run `node raptor-port/scripts/handpass/n204/draw-q30-31.mjs`.

The script has never run, so its selectors are untested. Where it differs from the brief, and why:

- **No screen saves a move of squadron.** The posting sheet is not built, and nothing in the app calls the move door.
  So Nasty's move (142 → 149) and Osprey's move (149 → 150), each from Thu 16 Jul, are written into the browser's saved
  data as setup, the way `draw-q25.mjs` and the walk libraries do it. The brief's "Admin → Users, Nasty's row, a move"
  cannot be done.
- **The clock.** The page clock is set, in Singapore time: the world is made on Wed 15 Jul 2026 at 09:00, and every
  picture is taken on Thu 16 Jul at 09:00. That is the first day of both moves, as the K10 tests reach it.
- **Whose bell gets the line.** A change to an input is told to the people in it and to the person who filed it, never
  to anyone else (the bell's code for an input's line). So, for Kestrel's bell to get the line, **Kestrel files** the
  Training for Osprey (Mon 27 Jul, through "+ Input"), and **Saber changes it** (149 picked, its Remarks typed). In the
  brief's order, with Hunter or Saber filing it, Kestrel's bell would get nothing.
- **Kestrel's right in 150.** Saber makes 150 with Kestrel as its first admin, as the earlier drawings did. That puts
  three squadrons in the picker and gives Kestrel his right in 150.
- **q30-149-proposed** is drawn by hiding the card on the page (its display only), with the crop on the section that held it.

## Question 31: what the proposal would do for someone who only VIEWS 150 (from the code)

The proposal is that the line enters the input's own squadron, 150, instead of the squadron the line was written for,
149. The code was read at `state/belltap.ts` (`enterForLine`), at `ui/topstate.ts` (`openNotice` and
`openInputOnPage`), and at the page door in `state/store.ts` (`ownPageRefused`, `setPage` and `ownFirst`).

For Hunter, who holds only View of 150, it would go like this:

1. **Entering 150 is refused.** His own pages may be 150's only if 150 is his home, he is a master admin, or he is an
   admin of 150 (a Plan holder). A View holder is none of these. So nothing is entered.
2. **The tap still goes on.** After a refused entry, the code stops only for a posting's line, a Leave War line or a
   holiday's line. A line about an input goes on: it is marked read, the bell's list closes, and the Inputs page is asked
   for.
3. **He lands on his own squadron's Inputs.** If 150's View-only Sched is in view, it does not offer Inputs, so the page
   door first brings back his own squadron (142, or 149 where his Plan lets him pick it). It then opens Inputs there.
4. **The Training's window opens there.** It opens over a page that is not 150's.

So the line neither opens 150's View-only Sched nor opens nothing. **It opens a 150 record on another squadron's Inputs
page.** That is the same fault in another form:
- today, the window is live, and every save is refused by the save's own check;
- with K10's root switched on, the window is held from the moment it opens: greyed, under "This is 150's. You picked
  142 — close this to go on."

The bell's own notes say that a line whose squadron his pages may not be "opens nothing", but for an input's line the
code does not do that. If he wants such a line to open nothing, or to open only View-only Sched, the proposal needs a
rule of its own for View holders.
