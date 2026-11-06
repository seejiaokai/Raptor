# The Tracker tidy ([TRK-STANDALONE-LEFTOVERS], D1538) — scenarios for the walk (fresh Opus scenario designer, 5 Nov 26)

Read for this: `git diff c7ddf441b..HEAD -- raptor-port/src`; `src/tracker/storage.js`, `undo-bridge.js`, `Header.jsx`,
`TrackerPage.tsx`, `core.js` (save corner `saveWords`/`saveFailed`, `handleUndoKey`, `prefGet/prefSet` under `ocuLocal:`),
`src/boot.ts` (`bootBody` plugs `trackerTarget(wb)` first), `src/main.tsx` (hands the saver to the doorway after the boot;
renders only after it), `src/storage/boot.ts chooseBackend`, `src/storage/browser.ts` (LEGACY `ocu:` import, old keys
left in place), `src/ui/Shell.tsx` (the pair, `pairOn`, the Tracker kept mounted by `trEver`, the page download),
`src/ui/topstate.ts trackerUndoEngine`, `src/tracker/role.js`; `.claude/rules/decisions/tracker.md` §Architecture;
`docs/tracker/known-gaps.md` head; the builder's report; `docs/bug-check-order.md` §7.0a, §7.11.

## What the change can and cannot reach — the designer's reading, for sizing

- **Nothing a person sees should change.** The pair the change removed was never drawn inside Raptor (the flag that hid it was
  set as the page's code loaded, before any drawing). So the walk is a *confirmation* walk: its job is to prove the pair still
  lives — once, in the top bar — in every Tracker mode and size, and that every save still lands where it did.
- **The doorway's only behaviour change** is the case "no target plugged in": it used to write the browser's storage under
  `ocu:`, now it keeps records in memory. Every running-app path found goes through `bootApp → bootBody → setStorageImpl(
  trackerTarget(wb))` before anything is drawn, on every backend (browser; memory for `?fresh=1`, dev, tests and a browser
  whose storage cannot be touched). Nothing in the app calls `setStorageImpl(null)`; a sign-out does not unplug it (the
  module stays loaded; `role.js` only ends the Tracker's session); a failed boot draws no app at all, only its card; the
  page-download Retry *reloads* the app, so it boots again. **I found no path to the doorway before the plug or after an
  unplug** — the scenarios below are built to break that claim in the running app, not to assume it.
- **What a walk can see of the doorway:** which keys appear in the browser's storage. The rule to assert: Tracker records
  appear only under `raptor:tracker/`; **no key whose name starts with exactly `ocu:` is created or changed** by any step.
  `ocuLocal:` keys (the bar hidden, the course and student a person reopens on — `core.js prefGet/prefSet`) are EXPECTED and
  are not the doorway: the walker must not count them as a failure (`ocu:` followed by anything except `Local`).
- **The save corner** ("● saved" and its words at the Tracker bar's far right, `#saveStat`) now gets the saver through the
  renamed setter. A wrong wiring would show "● saved" beside Raptor's "Not saved — keep this page open · Retry".
- **Forcing a failed save** (the fixture earlier walks used — `docs/handpass/2026-10-05-codex-stack-check.md`, the
  "forced quota exceeded"): an init script wraps `Storage.prototype.setItem` so that, while `window.__failSaves` is true, a
  write of a `raptor:` key throws a `QuotaExceededError`; the walk flips the flag with `page.evaluate`. This forces only the
  browser's refusal — the app's own route to "Not saved" — so it is allowed as the fixture (§7.7: the state cannot be reached
  by a control). Every step after it is pressed on screen.
- **Storage snapshots:** "list storage" below means `Object.keys(localStorage)` with each value's length and a hash, taken
  before and after a step and diffed; a picture of the diff (a short table) goes on the sheet with the screen pictures.

Sizes: **D** = desktop 1536×864 at 125% scaling as his PC (memory note), Chromium; **P** = iPhone 402×874, touch, WebKit;
**L** = the same phone on its side, 874×402, WebKit. Roles: **A** = `ad` (admin), **M** = `us` (member). Every step watches
console errors, page errors and 4xx (the forced quota error of the fixture excepted, named). On a phone, every tap gets a
picture within ~100 ms of the lift as well as the settled one (D1281).

---

## The scenarios

### Saves land where they should

**S1 — An ordinary Tracker session saves under `raptor:tracker/` and nowhere under `ocu:` (D, A; then P, M).**
New browser profile (empty storage), the built site, not `?fresh=1`. Sign in. List storage (baseline). Open the Tracker
(first visit). Mark an event DCO in the marking pop-up; add a failure on another and set its "Failed on" date; type a "Last
flown currency" day in the Info panel; + Add a student from the roster picker; move the course pick to another course and
back. List storage after each of the five. **Right:** each change adds or changes keys only under `raptor:tracker/` (and
`ocuLocal:` for the course/student pick); not one key beginning `ocu:` (not `ocuLocal:`) exists at any point; the corner
shows its words ("● saved" or the change's words) after each. Reload (F5): every one of the five is back on screen, the same
course and student open. **Why:** this is the doorway's whole job; it proves the plug is in on the real browser backend
for every kind of Tracker write (marks, dates, students, the per-person pick).

**S2 — A reload inside the save's short wait keeps the change (D, A).**
Mark an event, then within about 100 ms press F5 (script: the click then `page.reload()` at once). Also: mark, then close
the tab and reopen the site. **Right:** the mark is there after both. **Why:** the Tracker's write lands in Raptor's
whiteboard and is flushed by the unload guard; if anything in the Tracker were writing beside the whiteboard (the old
`ocu:` way) it would have its own timing and could be lost or doubled.

**S3 — `?fresh=1` keeps the session in memory and leaves the browser's storage untouched (D, A).**
On a browser that already holds a stored world (after S1), list storage, then open `/?fresh=1`, sign in, open the Tracker,
mark two events, add a student, Export (see S9). List storage. **Right:** the storage list is byte-for-byte the same as
before (no `raptor:tracker/` change, no `ocu:` key, no `ocuLocal:` change either is acceptable — note whether `ocuLocal:`
moved, since those writes bypass the backend: report what is seen, it is not this change's); the Tracker works through the
session. Then open `/` without `?fresh=1`: the stored world from S1 is back, without the fresh session's marks. **Why:** the
memory backend is a route the builder names as plugged; if the doorway ever fell to its unplugged case here, the session
would still work but would quietly diverge from the rest of the app's memory (two stores) — S3 also checks the marks show
on the Tracker's own screens AND that undo (S11) works in this mode.

**S4 — A browser whose storage cannot be touched (D, A; P, M).**
Init script: make reading `window.localStorage` throw (`Object.defineProperty(window, 'localStorage', { get() { throw new
DOMException('denied', 'SecurityError') } })`) — the "Safari private / locked-down" case the removed code's own comment
named as its reason. Load, sign in, open the Tracker, mark an event, open Show All, Export. **Right:** the app boots (the
boot chooses its memory store), the Tracker opens with its charts, the mark shows and undoes, no page error or console error
from the Tracker (its view-preference reads swallow their own errors), the corner does not show an error. **Why:** this was
the one reason the old doorway had its own fallback; the walk proves the boot's fallback now carries it. (Whether the app
should tell a person "this browser won't keep your work" is not this change — see Set aside.)

**S5 — An old `ocu:` record is never read by the running Tracker (D, A).**
After S1 (so the one-time import of old keys has long run on this browser), plant by script ONE key `ocu:v3:courses` (or the
course-list key the doorway uses, read from storage after S1 — the same name without `raptor:tracker/`) holding a course
list with one extra course named `ZZ-OCU-PROBE`. Reload, sign in, open the Tracker, open the course pick. **Right:**
`ZZ-OCU-PROBE` appears nowhere (course pick, File menu, Show All); the planted key is still there unchanged after a mark
and a reload (nothing writes it). **Why:** the direct proof that no path in the running app reads or writes the doorway's
old prefix. (A planted key is data, not a fixture of a state — it tests the code's reading going forward, not stored data.)

### The save corner follows Raptor's saver

**S6 — A save that fails while the Tracker is open (D, A; P, M).**
On the Tracker, mark an event (corner: words). Set `__failSaves = true`. Mark another event, then type a date. **Right:**
Raptor's band "Not saved — keep this page open" with Retry shows; the Tracker corner draws nothing — judged by a crop of the
corner's pixels, not only by the element (§7.11 lesson 22) — on both sizes; no "● saved" anywhere on the bar. Press Retry
while still failing: the band stays, the corner stays silent. Set `__failSaves = false`, press Retry: the band goes, the
corner's last words come back. Reload: both changes are there. **Why:** the renamed setter is the only thing that tells the
corner; wired wrong, the corner says saved beside the band (the fault [TRK-SAVE-FAIL-SAYS-SAVED] fixed). Includes the "same
warning twice" order (§7.11 lesson 16): fail, Retry-fail, then succeed.

**S7 — A save that failed BEFORE the Tracker was ever opened (first visit) (D, A).**
Fresh sign-in, do not open the Tracker. On Edit Schedule (or Inputs) set `__failSaves = true` and make one change there
through its controls — the band shows. Now open the Tracker for the first time (its code downloads now). Mark an event.
**Right:** from its first frame the corner shows no "● saved" while the band stands; Retry with the block lifted brings the
band down and the corner's words back. **Why:** the corner's "has the saver failed?" is read once when the Tracker's code
loads, then on each change of the saver; this is the only order where it must already be failed at that first read.

**S8 — A save that fails while the Tracker is kept hidden (keep-mounted), and the way back (D, A; P, A).**
Open the Tracker, mark an event (corner: words). Go to Inputs. Set `__failSaves = true`; file an input. Wait 3 s on Inputs.
Return to the Tracker by its tab (and, on the phone, by its menu entry). **Right:** on the first frame back (§7.11 lesson
10) the corner draws nothing; the chart is drawn without a touch. Lift the block, Retry from the Tracker page: the band goes,
the corner's words come back. Repeat with the order reversed: fail on the Tracker, go to Inputs, Retry there, come back —
the corner's words are back. **Why:** the hidden Tracker must still hear the saver; a listener lost while hidden would
leave the corner wrong on return.

### File ⇪ Import and ⤓ Export

**S9 — Export, change, Import, reload (D, A; P, M once).**
File ⤓ Export (a whole backup). Open the downloaded file and check it parses and names the charts and students (the result
of a download is seen — §7.11 lesson 18). Then on screen: mark two events, rename a ball's typed detail (hours) in Edit
chart layout and ✓ Save changes, move one ball. File ⇪ Import the file. **Right:** the charts come back as in the file
(the ball's position), event details typed in the file are the file's and no shipped wording is put back over a detail
(D122); student marks follow the import's rule; list storage — every changed key under `raptor:tracker/`, none under
`ocu:`. Reload: the imported state stands. **Why:** Import is the doorway's biggest burst of writes (many keys at once);
it is the one route his charts survive by (D120), so a current-format round trip that loses anything is the highest finding.

**S10 — Import into an empty Tracker (D, A).**
On a `?fresh=1` session (so nothing stored is harmed) delete courses through the File menu until the Tracker shows its
empty screen ("Import a file…"). Import the S9 file from that button. **Right:** the charts and students appear; the top
bar's ↶ shows what it would take back (or stays greyed, as the import's rule is — record which); no console error. Repeat on
the real browser backend in a second, fresh profile and reload: the imported charts survive, under `raptor:tracker/`.
**Why:** the empty-store path is where the Tracker starts with no records at all — the moment a missing plug would show
first.

### The one Undo / Redo pair, in the top bar

**S11 — The pair is in the top bar once, and nowhere on the Tracker's bar (D, A and M; P, A and M; L, M).**
Open the Tracker. **Right:** exactly one `#trUndoBtn` and one `#trRedoBtn` on the page, both inside the app's top bar, in
Edit Schedule's place and look (D347 — put a crop beside Edit Schedule's pair at the same size); none on the Tracker's own
bar (`header .controls`), its menus or the Edit chart layout strip; both greyed with "Nothing to undo"; on the phone,
icon-only, in the order Undo · Redo · sync dot · bell (D348), not covering the Tracker's tabs (Flow chart / Info / Show
All); on L the top bar is one row with the page names in the side menu (D1643) and the pair still in it, inside the screen.
Mark an event: ↶ lights, its tooltip "Undo the mark on <event> for <student>" (desktop hover). Press ↶: the mark goes,
↷ lights; ↷ puts it back. Do the same with Ctrl+Z, Ctrl+Y and Ctrl+Shift+Z (desktop). **Why:** the removal must not have
taken the only pair with it at any size; the member check covers D121 (same access) — a member's Tracker carries the pair.

**S12 — The pair in every Tracker mode (D, A; P, A).**
In turn, with a change made inside each mode and undone from the TOP BAR pair:
(a) Edit chart layout — drag a ball (once slowly, once a quick flick, §7.11 lesson 2), ↶ puts it back; on the phone open
the strip's panel (it drops down over the chart) and check by picture that it does not cover the top bar's pair; ✓ Save
changes, then ↶ and ↷ again. On L (under ~500px tall) Edit chart layout folds to one row with Tools ▾ (D373): open Tools ▾
over the chart, check the top bar's pair (one row on a sideways phone, D1643) is still on screen and pressable, ↶ a drag.
(b) the marking pop-up open on an event (it leaves the page working) — press the top bar ↶ while the pop-up is up: record
what the pop-up then shows, and that it never shows a grade the chart no longer has (§7.11 lesson 4); press Ctrl+Z with the
pop-up open (keyboard focus on a pop-up button, not a text box).
(c) Show All open — change a typed field there and save; close it by each way (its ✕, Escape, a tap outside — §7.11
lesson 19); ↶ lights and takes the change back.
(d) Legend and, as admin, ⚙ flex settings open — note whether the top bar is reachable over their scrim; close each by each
way; the pair's state after is right.
(e) the Tracker's bar hidden with its ^ and shown again (lesson 17): the top bar pair stays, the page no wider than the
window.
**Right:** in every mode there is one pair, in the top bar, and it takes back exactly the last Tracker change. **Why:** each
mode draws its own strip or window; the removed pair lived in the bar these modes reshape, so a mode is where a gap would
show.

**S13 — Ctrl+Z inside a text box is the box's own (D, A).**
Type in the Find event box, the student search in + Add, a date box in the Info panel, and a Show All field; press Ctrl+Z in
each. **Right:** the box's own text undo; the chart's last change is NOT taken back; the top bar ↶ still lit. **Why:**
`handleUndoKey` must keep ignoring text boxes now that the pair's only home is outside the Tracker.

**S14 — Two separate histories while the Tracker dozes (keep-mounted) (D, A).**
Open the Tracker, mark an event. Go to Inputs, file an input. On Inputs press the top bar ↶ and Ctrl+Z: **Right:** the
input is taken back, the Tracker mark is NOT (check by returning). Back on the Tracker the top bar ↶ is lit with the mark's
tooltip and takes it back; Ctrl+Z on the Tracker does not take back the Inputs change. Then the reverse, and once via the
bell or Quals → Tracker. **Why:** the pair's ids and engine switch with the page; the Tracker's keyboard listener must sleep
while the page is hidden. A hidden Tracker catching Ctrl+Z would silently undo a chart mark from another page.

**S15 — First visit: the pair before the Tracker's code has loaded (D, A; P, A).**
Fresh sign-in; throttle the network (slow 3G) and open the Tracker. **Right:** while the loading claw shows, the top bar
pair is greyed and a press does nothing and throws nothing; once the chart is drawn, a mark lights ↶. **Why:** the pair is
drawn from a bridge the Tracker's code fills only at the end of its start; the in-between must be safe.

### Sign-out, sign-in, and a failed page download

**S16 — Sign out with unsaved chart edits, from another page (D, A; P, A).**
In Edit chart layout move a ball, do NOT press ✓ Save changes. Go to Edit Schedule. Logout. **Right:** the Tracker comes to
the front with Save / Discard / Stay (D129). Stay → nothing lost, still signed in. Logout again → Save: list storage, the
move is under `raptor:tracker/`. Sign in as `us`: the chart shows the move; the top bar ↶ on the Tracker is greyed — the
member cannot undo the admin's change (F10, the session ends at logout); the corner shows no stale words. Repeat with
Discard: the ball is back where it was, after a reload too. Do once more starting the Logout from Inputs and from the
Leave War (§7.11 lesson 12). **Why:** sign-out/in is the one moment the Tracker's session is torn down inside one page
load; it must not unplug the doorway or leave the old person's pair or corner behind.

**S17 — Sign in as another person without a reload, then write (D, M then A).**
Sign in `us`, open the Tracker, mark an event. Logout (no unsaved edits — no question). Sign in `ad` in the same tab, open
the Tracker. **Right:** the mark `us` made is shown; `ad` marks another event; list storage — both under
`raptor:tracker/`, none under `ocu:`; reload, both there. **Why:** a remount after sign-in is the likeliest place for a
fresh copy of the Tracker to meet an unplugged doorway (if any).

**S18 — The Tracker's page download fails, Retry reloads (D, A; P, A).**
Sign in, make one change on Edit Schedule. Block the Tracker's page files (route abort on the Tracker chunk). Press the
Tracker tab: the "couldn't download" card with Retry. Unblock. Retry. **Right:** the app reloads (the earlier change still
there — Retry first waits for a save that waits), the sign-in reopens the Tracker (D1635) and it draws; mark an event,
list storage — under `raptor:tracker/`; the top bar pair works. Also: a failed download while a save has failed
(`__failSaves`) — record what Retry says. **Why:** the brief asks whether any retry route reaches the Tracker without the
boot; Retry here is a full reload — the walk confirms it.

### The plain-user round (D1557, §7.0a)

**S19 — An ordinary Tracker session, start to finish (D, A; then P, M).**
Sign in. Open the Tracker. Pick a course and a student from the bar's dropdowns. + Add a student from the roster picker
(close the picker once by its ✕/Cancel, once by a tap outside, once by Escape, then add). Set his course start. Mark three
events (DCO, a failure with its date, N.A.); open the marking pop-up and close it each way. Open the Info panel, the
down-days window from its number, the Legend, Show All, Find event — close each by each of its ways (lesson 19). Undo two
marks from the top bar, redo one. Hide the Tracker's bar and show it. File ⤓ Export; File ⇪ Import the same file. Go to
Edit Schedule and back; Inputs and back. Reload. Sign out and in. **Then every other place that should show the result:**
the Tracker after the reload (same course, student, marks, dates); Show All's table for that student; the student's Info
panel (Last flown, currency bars); the course pick's list; and — the one place outside the Tracker that reads it — the
person's window from the roster for that student (record whether it names his Tracker course, and that nothing there
changed). **Right:** each result shows where it should; the corner's words follow each save; no console error; one pair,
top bar only. **Why:** what a person actually does, pressing every opener and closer — the round that would catch a
change "nobody meant to make visible" becoming visible.

---

## §7.11 lessons — applies / covered by

1. State × reading — **applies**: the corner (saved / failed / failed-before-load / failed-while-hidden / recovered) and the
   pair (greyed / lit / tooltip; before load) — S6, S7, S8, S11, S15.
2. Gesture at one speed — **applies lightly** (a drag undone): S12(a) drags slow and quick.
3. Feedback never looked for — **applies**: the corner's words returning after Retry, ↶ lighting — S6, S8, S11.
4. Press behind an open window — **applies**: the marking pop-up leaves the page working; top bar ↶ pressed under it — S12(b).
5. Box brought into sight vs what covers it — **applies narrowly**: the Edit chart layout strip's dropdown panel vs the top
   bar pair on a phone — S12(a); no keyboard box changed.
6. Only the real phone draws — **does not apply**: nothing is handed to the phone; the iPhone's held tap state is pictured
   per D1281 in S11/S12 at P.
7. Mechanism tuned to a model — **does not apply**: no motion steered.
8. Approved drawing — **applies only as D347's "Edit Schedule's place and look"**: the pair cropped beside Edit Schedule's — S11.
9. List alignment — **does not apply**: no list drawn or changed.
10. Way back to a hidden page — **applies**: the Tracker is kept mounted; a change while hidden (a failed save, another
    history), wait past idle, return by each route, first frame pictured — S8, S14.
11. Reading depending on fit — **does not apply** (no reading from screen size); the short screen L is walked in S11.
12. Window opened from one page only — **applies**: the D129 logout question opened from Edit Schedule, Inputs, Leave War — S16.
13. Pinch at the top only — **does not apply**: no pinch touched.
14. Keyboard walk's boxes from memory — **applies to Ctrl+Z only**: the text boxes listed in S13 are taken by searching the
    Tracker's `input`/`textarea` (Find event, + Add search, Info dates, Show All fields), not from memory.
15. Pinned bar's fill — **does not apply**: the top bar is untouched.
16. Warning cleared only by a change of value — **applies by analogy**: the same failure twice (Retry while still failing)
    then success — S6.
17. Control that changes a page's width — **applies lightly**: the bar's ^ hide/show with the pair — S12(e).
18. Print / download — **applies**: Export's downloaded file opened and read back by Import — S9, S10.
19. Window over a window closed every way — **applies**: Show All, Legend, flex settings, the pop-up, + Add's picker — S12, S19.
20. Gesture walked once slowly — **does not apply** beyond S12(a).
21. Test browser's touch taken for his phone's — **does not apply**: no gesture changed; no phone-only line is expected.
22. Shown by being there, not drawn — **applies**: the corner's silence and the pair's greyed look judged on cropped pixels — S6, S11.

## Considered and set aside

- **+ Add's "Student callsign:" prompt with nobody on the roster to offer.** The change touched only its comments; the code
  is byte-identical and pinned by a unit test through the real roster projection; reaching it in the app needs a shared
  store built with a ground-crew first admin or every aircrew archived. The roster picker's ordinary path is in S19.
- **The legacy `ocu:` one-time import itself** (old keys brought in on a browser's first boot). Unchanged code, and a
  start-up converter of older stored data — not a finding under D56/D120. S5 checks only that the running Tracker never
  reads that prefix going forward.
- **A failed boot (the "could not load its data" card) and the newer-version card.** No app is drawn, so the Tracker cannot
  be reached; their Retry/Reload is a full reload, which boots and plugs again.
- **The dev server (`vite`, memory) and unit tests with no boot.** The dev server runs the same `bootApp` (its backend is
  memory, as `?fresh=1`, walked in S3); a unit test is not a walk.
- **Whether a browser that cannot keep anything should say so** (S4). The memory fallback's silence predates this change;
  if the walk shows a misleading "● saved" there, file it as its own item, not this change's finding.
- **Two tabs of the app open at once.** Each tab has its own whiteboard; the change does not alter how two tabs meet.
- **`[TRK-IMPORT-ONE-GROUP]` and `[TRK-FIRST-ORDER-PLACE]`** — known, filed for the database step (D983); S9/S10 record
  what Import's undo does without chasing them.
- **The test-only edits (JSON copies → structuredClone).** No running-app path; GitHub's run carries them.
- **The two standalone-only copies left (the Tracker's glyph drawings, its palette).** Not changed here; the builder filed them
  as a job of their own.
