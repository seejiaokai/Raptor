# Chat 28 — the code read of the "Not kept" band (D1901) and the Tracker's magnifier (D1900)

**One brief, two readers, blind to each other:** Astra (Codex) and a fresh Opus reader that did not write the code.
Read-only: change no file, commit nothing. Do not open any other reader's report, the walk's evidence sheet
(`raptor-port/docs/handpass/2026-11-08-chat28-not-kept.md`), the walkers' reports (`raptor-port/docs/handpass/parts/chat28/`)
or the pictures (`raptor-port/docs/img/handpass/2026-11-08-chat28-not-kept/`). Write your whole report to the file your
launch names, and nothing else.

## What to read — a fixed commit, not the working tree

The working tree may change while you read. **Read the code at the commit your launch names** (branch
`claude/chat28-not-kept`) against its base `535fdc94f` (the `main` last brought in):

```
git diff 535fdc94f <commit> -- raptor-port/src
git show <commit>:raptor-port/src/ui/SaveStatus.tsx
```

The changed files: `src/storage/boot.ts` (`storageRefused`, the `?nostore` switch), `src/main.tsx` (hands the flag on),
`src/ui/savestatus-source.ts` (`readBand`: 'failed' first, else 'nokeep'), `src/ui/SaveStatus.tsx` (the band in the bar
and `SaveBand`, the room via `useBandUp`), `src/ui/scheduler/17-save-status.css`, the band's callers `src/ui/Shell.tsx`,
`src/ui/GuestApp.tsx`, `src/ui/Login.tsx`, `src/ui/AccessScreen.tsx`; the Tracker's corner `src/tracker/storage.js`
(`storageKept`) and `src/tracker/app/core.js` (`saveWords`); the magnifier `src/tracker/components/Glyphs.jsx`
(`SrchGlyph` now `SrchIcon`), `Header.jsx`, `Modals.jsx`, `ShowAllPanel.jsx`, `SrchGlyph.jsx` (deleted),
`src/ui/icons.tsx` (`SrchIcon` takes a class); comments only in `src/tracker/tracker.css` and `src/ui/pen.ts`; the tests
`src/storage/boot.test.ts`, `src/ui/SaveStatus.test.tsx`, `src/tracker/storage.test.ts`,
`src/tracker/trk-batch-store.test.ts`. Read their callers and neighbours at the same commit as you need: every caller
of `SaveBand`, `SaveStatus`, `useBandUp`, `readBand` (the Scheduler Board `SchedBoard.tsx`, the OIL tracker
`OilTracker.tsx`, the medical view `MedicalView.tsx`, `Shell.tsx`, `GuestApp.tsx`); every CSS rule that selects
`.savestat`, `.saveband`, `.save-failed`, `.band-up`, `.nokeep`, `.failed`; the storage boot's callers; the failed-save
path (`?savefail`, D1666) and the access screen's "Not sent yet" pass (D1664); the Tracker's `#saveStat`.

**The rules to hold it to** (none of `.claude/rules/` loads by itself for Codex — open each): the screen-design page
`.claude/rules/decisions/design.md` (its "Saving — the Not saved band" section: D1901, D1655, D1657, D1664, D1666,
D1667, D587, D841; and D1900, D1127 in "From other areas") and the full rows
(`grep -h '^| D1901 |' .claude/decisions-full/*.md`, the same for each); the Tracker's rulings
`.claude/rules/decisions/tracker.md` (D1900) and architecture `.claude/rules/seams/tracker.md` (the three seams, the
storage doorway); the scheduler's `.claude/rules/decisions/scheduler.md` (D840, D841 — the band under the top bar);
`.claude/rules/raptor-executor.md`; the backlog items `OUTSTANDING.md` §[TRK-NOSTORE-SAVED] and §[TRK-COPIES-TIDY].

## The promise

- **D1901 (8 Nov 26), his answer "option A" to chat 20's drawing:** in a browser that refuses storage, a band under the
  top bar on every page — the drawn warning sign, **Not kept** in bold, "this browser loses your work on a reload"
  quieter, **no Retry** — in the "Not saved" strip's look (D1655), the page moved down under it as that band does (D587;
  D1657 for the screens without a top bar); the Tracker's corner shows nothing ("saved" / "saving") while it is up. A
  failed save's "Not saved" band still wins over it. A browser that keeps, and `?fresh=1`, show nothing new. The
  access screen's pass reads "Not sent yet" only for a failed save (D1664), never for "Not kept".
- **`?nostore`** — the agent's own test switch (no ruling yet; it will be named to him): makes any browser behave as
  one that refuses storage, so his iPhone can see the band. It must touch storage not at all, and a longer word
  (`?nostorex`) must not be the switch.
- **Nothing stored changes:** the store chosen is the same as before in every case (memory where storage was refused);
  only a flag beside the choice is new.
- **D1900:** the Tracker's search magnifier is the app's own (`SrchIcon`), its handle as long as every other search box's
  (D1127); the Tracker's own shorter drawing goes. Nothing else of the Tracker's Find changes.

## What to look for

1. **A place the band should show and does not, or shows wrongly** — a page, a full-screen surface, a bar-less screen,
   a window or the phone's side menu; a place whose room under the bar is keyed to a failed save only, so the band covers
   the page's first line, a pinned row or a window's head; the band two lines tall or cut on a narrow phone.
2. **The flag:** set where it should not be (a plain browser, `?fresh=1`, the test modes that pick memory on purpose, a
   storage that throws only on write — a full disk — rather than on read), or missed where it should be; anything
   `?nostore` reads or writes in storage; the order against a failed save (both at once, a failed save clearing, a
   Retry that succeeds).
3. **The Tracker corner:** "saved" or "saving" still shown beside the band; an error hidden; the corner wrong in a
   browser that keeps. The Tracker's seams: does any new import cross the boundary beyond the three seams, or pull the
   Tracker's engine into every visit (the lazy chunk; the no-import guard on `tracker/role.js`, `people.js`)?
4. **The magnifier:** any visible change beyond the drawing — size, colour, place, the input's padding — on the Tracker's
   Find box (desktop and phone), the Show All panel, the modals; anything else that drew `SrchIcon` changed by its new
   optional class.
5. **The tests:** does each changed test guard what it claims, or is any weakened?

**Not a finding (D56):** a problem that lives only in data already stored, with the code correct going forward.
**Not a finding (D785):** a scheduler who is not an admin. A claim is a finding only with a concrete failure, its cause
and its fix — write each as a test that would fail, where you can. Rank by severity. End with a **tidiness note**: three
questions of the changed lines (is anything left that only a standalone Tracker needed; is anything duplicated that one
source could carry; is any comment now untrue) — filed, not fixed, never the rules engine.
