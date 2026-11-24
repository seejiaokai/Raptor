# Scenario design — the hidden ?timing readout (fresh Fable, blind)

Branch `claude/app-speed-readout-161` at `81f62f830`, read in `C:/Users/User/projects/Raptor-speed`. Read only: no file
changed, nothing built, served or run. I opened no other reader's report, no evidence sheet, no walk report and not the
`HANDOFF.md` block for this branch; no handoff block was pasted into my context.

Read whole: `src/ui/timing.ts`, `TimingReadout.tsx`, `timingtext.ts`, `timing.css`, `main.tsx`, `Login.tsx`, `logout.ts`,
`pagedownload.ts`, `pageload.tsx`, `pageclaw.ts`, `FloatWindow.tsx`, `floatwin.ts`, `winorder.ts`, `App.tsx`,
`22-float-windows.css`; the diff of `state/view.ts`; the parts of `Shell.tsx`, `state/store.ts`, `boardescape.ts`,
`leavewar/ui/Sheet.tsx`, `toast.ts`, `17-save-status.css` that meet the window; every caller of `setPage`; the plan's
§How it was measured; the full rows of D2481 and D2483. Test names only of the three new test files.

Everything below marked CODE is from reading, not from running — each is written so the walk proves or kills it.

---

## A. What I believe is already wrong in the code (most damaging first)

### F1 — CODE, high confidence. The Leave War's and the Tracker's first-open time stops while the loading claw is still up
`TimingReadout.tsx` `pageShown` (the line `return !!s && s.classList.contains('on') && !s.querySelector('.pgclaw:not(.gone)')`)
looks for the claw INSIDE the page's section. The claw is never there: `pageclaw.ts raisePageClaw` does
`document.body.appendChild(el)`. So for the two separately downloaded pages the test is true the moment the section
gets `on` — one frame after the tap, with the download still on the wire and the claw over an empty page.
- What he would read: "Leave War, first time: under 0.1 s" (and no "downloaded N KB", because `downloadedSince` is read
  at that same too-early moment). The plan's own figures for these are 1.7–3.2 s at 4× slow-down. These are the two
  slowest pages and the very figures the next speed fix is chosen by.
- The plan's script uses the right test (`document.querySelector('.pgclaw:not(.gone)')`, document-wide) — the readout's
  comment says "the same end the speed notes' scripts use", and it is not.
- Fix, exact:
  1. In `pageShown`, replace the claw test with a document-wide one for that page:
     `!document.querySelector('.pgclaw[data-page="' + p + '"]:not(.gone)')` (the claw carries `data-page`).
  2. Also require the section not be marked busy: `!s.hasAttribute('aria-busy')` (`pageclaw.ts busy()` sets it for the
     claw's whole life and clears it as the claw starts to go) — belt and braces, one attribute read.
  3. Add a unit test first that fails today: a section `#page-leavewar.on`, a `.pgclaw[data-page=leavewar]` appended to
     `document.body`; a page mark; frames run; expect NO row; then add `gone` to the claw; frames; expect the row.
  4. Decide F1b with it (below), since the fix changes what a failed download shows.
- F1b (question, no ruling): once fixed, a FAILED download ends the wait when the "Couldn't open the Leave War" card
  shows (claw gone) and writes "Leave War, first time: 3.2 s" — a time for a page that never opened. Today it also writes
  a row (near zero). Recommend: no row when `#page-<p> [data-testid="page-load-fail"]` is what is on screen — or a row
  whose value says it did not open; the words are his (D2441's route).

### F2 — CODE, high confidence on the logic, timing-dependent in practice. A mark made before the readout's own file has arrived is timed to the moment the file arrives
`timing.ts timingSink` replays waiting marks later; `take()` then starts `timeUntil(kind, m.t, …)` with the OLD `t`. If the
person pressed Sign in (or opened pages) before `TimingReadout`'s file came down, the week is already drawn when the
replay runs, so the row reads `now − t` = the real time PLUS however long the readout's download took. Several waiting
page marks collapse into one row (each `timeUntil('page')` replaces the last), also inflated.
- Reachable on exactly the computer this is for: a slow line, a saved password, Enter pressed at once.
- Fix, exact: in `timingSink`, hand `take` a second argument `late = true` for replayed marks. In `take`: `boot` and
  `first` as now (they are points, not waits); a late `signin` sets `M.lastSignin` and leaves the row "not yet" — or a
  new value "not timed" (words his); a late `page` only does `M.seen.add(m.page)`, no row. Unit test first: marks
  `signin` then `page` made before `timingSink`, week already "shown" → expect no figure.

### F3 — CODE, high confidence. "Sign in pressed → week shown" can report a time that includes minutes spent on another page
The sign-in wait (`timeUntil('signin', …, weekShown)`) is never cancelled. If the week is not on screen two frames after
sign-in — he taps another page before the week is drawn (seconds on the slow computer), or the sign-in lands elsewhere
(Retry's reopen sends him to the Leave War or Tracker, `Login.tsx` `setPage(back)`) — the wait keeps polling for up to
120 s and fires the first time he returns to View-only Sched: "took 47.0 s".
- Also in the reopen case: the landing page's mark falls inside `SIGNIN_LANDING_MS` (50 ms) and is dropped, so the
  landing on the Leave War is timed by NOTHING, the page is not put in `seen`, and his next visit to it is labelled
  "first time" though it is the second. And whether the mark falls inside 50 ms depends on how long `resetSession` took
  — on a slow computer it may not, giving a different shape of output on the very machine being measured.
- Fix, exact: (1) in `take`, on any page mark that is NOT dropped as the landing, cancel a pending sign-in wait:
  `watches.signin = (watches.signin || 0) + 1`. (2) Replace the 50 ms rule with a fact: keep `M.landing = true` from
  the `signin` mark until the first macrotask after it (`setTimeout(() => { M.landing = false }, 0)`); a page mark while
  `landing` is the sign-in's own. (3) If that landing page is not `viewsched`, cancel the week wait and time THAT page
  from the sign-in press, as the sign-in's row or a page row (his words). Tests first for each.

### F4 — CODE, medium. A page wait left hanging writes a row that includes time spent signed out
`resetSession(null)` calls `setPage('viewsched')`; from any other page that is a page mark, and the wait polls
`#page-viewsched.on`, which does not exist on the sign-in card. Normally sign-out reloads and it dies. When a save is
still waiting (`logout.ts`: no reload), or `App.tsx` resets a session that was switched off or deleted, the page stays;
a sign-in within 120 s then completes that old wait: "View-only Sched, opened before: 38.0 s".
- Fix: in `take`, a `signin` mark cancels any pending page wait (`watches.page++`); and/or a page mark made while there
  is no session is not watched. Test first.

### F5 — CODE, high confidence. On a computer, with the switch, the window takes the caret out of the Username box as the app opens
`FloatWindow.tsx` moves the keyboard into a window as it mounts (`n.focus({ preventScroll: true })`). The readout mounts
one tick after the sign-in card, whose Username box is `autoFocus` ("the caret waits there so a person types straight
away"). So with `?timing` on a computer he types his username into nothing. If the readout's file is slow, the caret is
pulled out mid-word — out of the password box too. (Folded on a phone: no window, no theft.)
- This is harm only with the switch, but it is the first thing he does in the measuring session.
- Fix, exact (no change to the shared window): in `TimingReadout`, capture `document.activeElement` in a
  `useState(() => …)` initialiser on first render; in a `useLayoutEffect(…, [])` (a parent's runs after the child
  `FloatWin`'s), if `startOpen` and that element is still connected and is not `body`, `focus({ preventScroll: true })`
  it back. Reopening from the corner button keeps today's behaviour (the keyboard goes into the window he asked for).
  Browser test first: load `?timing` at 1366 wide, type at once, expect the characters in `#luser`.

### F6 — CODE, medium. "downloaded N KB" can be another page's download
`downloadedSince(t0)` adds every script and style that STARTED after the tap. On a desktop the Leave War is fetched in
the background about 2 s after his hands stop (`Shell.tsx` PRE-WARM). Open Inputs for the first time just then and the
row reads "Inputs, first time · downloaded 137 KB" — Inputs downloads nothing. The reverse too: a pre-warmed Leave War
reads "first time" with no download and a short time, though its 137 KB came down unseen.
- Fix: only a page that has a download of its own may carry the tag — `leavewar`, `tracker` (the same set as
  `pagedownload.ts REOPENABLE`); better, count only files `pageFiles(list, src)` names. For a pre-warmed first open,
  say so in the tag (words his), or the two "first time" kinds get compared as one.

### F7 — CODE, high confidence; developer-facing words. "at 125% zoom" and the screen size are wrong on a scaled display
Copy all writes `Window: … at ${devicePixelRatio × 100}% zoom` and `Screen` from `screen.width × screen.height`.
`devicePixelRatio` is Windows' display scaling times the browser's zoom. His own PC runs at 125% scaling: at 100% browser
zoom it will say "125% zoom", and a 1920×1080 screen reads "1536×864". A phone reads "300% zoom". The office computer's
real zoom and screen are exactly what a developer would act on.
- Fix: label it for what it is — e.g. "picture scale 1.25 (display scaling × browser zoom)" and "Screen 1536×864 in
  page units" — words are his to pass; or drop "zoom". Pin in `timingtext.test.ts`.

### F8 — CODE, medium. Copy all that fails says nothing
`copyOut` returns false when both ways are refused; the button just stays "Copy all". He then pastes whatever was in
his clipboard before to the developer — an old or unrelated text taken as the figures. Its test only pins that it
"does not claim Copied". Expected by me: a visible "Could not copy — select the text below" with the text in a box he
can select. No ruling: put to him with a picture (D1625 — it is something new he would see).
- Smaller: the old way's hidden box takes the keyboard and is removed, so the keyboard is left nowhere after a copy.

### F9 — CODE, medium. A wait that spans a hidden tab or a minimised window counts the hidden time
Frames stop while the tab is hidden; a page asked for just before he switches tabs is "drawn" when he comes back:
"Edit Schedule: 64.0 s". Fix: on `visibilitychange` to hidden, cancel every pending wait (bump both `watches`); a row
never timed is better than a wrong one.

### Smaller, from reading
- F10. "Brief freezes: 12 · 3.4 s in all" has no span — since the address was opened, over 1 minute or 40? The copied
  text carries the clock time of the copy but not how long the app had been open. Recommend one line in Copy all:
  "App open for 4 min". (Words his.)
- F11. "App files used" and "Kept from an earlier visit" count the readout's own two files — figures a visit without
  the switch would not have. Small; either leave them out (`/TimingReadout|timing/` on the file name is brittle — better
  `e.startTime` of the import, or accept and say so in the plan).
- F12. Sign-out RELOADS the page (`logout.ts`), and so does Retry on a failed page: every row is gone and start-up is
  measured afresh. Not a fault — but his instructions must say "Copy all BEFORE you sign out", or he loses the minute.
- F13. `secs()` under 50 ms gives "at under 0.1 s" on the start-up rows ("Site answered: at under 0.1 s" — every local
  walk will show it). Pinned mock-up words; flag only.

---

## B. The roll — every place the thing should, or must not, be

| Where | Should there be a sign / a mark? | What I found in the code |
|---|---|---|
| Address without `?timing` | nothing drawn, nothing fetched, no mark kept | `timingMark` returns at once; `import('./ui/TimingReadout')` only behind `timingOn()`; `watchFreezes` only if ON — HAS IT (S2 proves it) |
| `?timing`, `?x&timing`, `?timing=1` | on | regex covers; `?TIMING`, `?timings`, `#timing` are OFF — RECORD |
| App's code starts | mark `boot` | `main.tsx boot()` — has it |
| First screen drawn | mark `first` | `BootClawGone` — has it; the four boot-failure screens never make it, so the window never appears there — must not/acceptable, RECORD |
| Sign in accepted | mark `signin` | `Login.tsx` — has it; taken after `signIn()` returns (a lookup, negligible — checked) |
| Access screens (asked / waiting / switched off) | no week will come | mark is made anyway; wait runs 120 s, row stays "not yet" — acceptable, see S16 |
| Top bar's page names | page mark | `Shell.tsx nav → setPage` — has it |
| Phone ☰ drawer | page mark | `Drawer.tsx → setPage` — has it |
| Bell / notices → Inputs, Help | page mark | `topstate.ts → setPage` — has it |
| Welcome back "Check my quals" | page mark | has it |
| OIL day list → Inputs; Leave War ↔ Inputs jumps; schedule → Leave War | page mark | all through `setPage` — has it |
| Undo that lands on another page | page mark | `undo-wire.ts → setPage` — has it |
| Admin door (`adminopen.ts`) | page mark | has it |
| Member view switch / access change sends Edit Schedule or Admin → View-only Sched | page mark | has it |
| Sign-out | must NOT leave a wait running | MISSING a cancel — F4 |
| Sign-in landing (fresh; after Retry's reopen) | timed once, not twice | fresh: has it. Reopen: MISSING — F3 |
| Retry → reload | fresh start | reload wipes all (F12); `?timing` stays in the address — S13 |
| Browser back button | — | the app keeps no history entries (no `popstate`/`history.` in the shell): Back leaves the app. RECORD (S24) |
| Scheduler Board, Inputs' table/calendar/medical, Admin's tabs, a week change, a Tracker course | not pages | no mark, no row — must not, because they are not pages; say so in his instructions |
| Loading claw (Leave War, Tracker) | time must run to its going | MISSING in effect — F1 |
| Failed-download card | no time for a page that did not open | has a time — F1b |
| Desktop pre-warm of the Leave War | must not be mis-credited | MISSING — F6 |
| Storage (local, session, cookies) | nothing written | nothing in the four files writes any; the window's place is kept in memory only (`winorder.ts`) — HAS IT (S3) |
| Anything about a person | never | rows and Copy all hold times, sizes, page names, browser, screen, the PC's clock — no name, callsign, role, squadron — HAS IT (S3) |
| Escape | folds the front window | joins the app's one order (`forward('timing')`) — S19 |
| Other code that asks "is any movable window up?" | should not change the app | `boardescape.ts` (board's Escape stands aside), `leavewar/ui/Sheet.tsx:590` (blocking sheet drawn on its raised layer), `toast.ts:92` (phone note moves to the top) — all three now answer yes while the Timing window is OPEN — S19, S20, S21 |

---

## C. Scenarios, ranked — most damaging first

Run on the BUILT app (the dev server's hundreds of files make the file rows meaningless). "Slow" = CPU 4× in the
browser's tools; "weak line" = its Slow 4G. Phone = 390×844; desktop = 1366×768 and his 1536-wide at 125% scaling.
Seeded admin and a seeded member.

**S1 — Leave War and Tracker, first open, against a stopwatch (F1).**
Setup: desktop, `?timing`, cache cleared, weak line, slow CPU; sign in and tap Leave War within 2 s (before the
pre-warm). Record the screen. Action: note when the claw goes; read the newest row. Repeat for Tracker; repeat both on
the phone.
Expected: the row's time ≥ the time the claw stood, within 0.2 s of the recording, and "first time · downloaded about
137 KB" (Tracker about 123 KB) — the plan's figures; the row appears only after the claw has gone.
Disproves: the row appears while the claw is still up; it reads "under 0.1 s" or any figure shorter than the claw; no
"downloaded" tag.

**S2 — Without the switch nothing is different (D2481).**
Setup: the same build, address with no `?timing`; network panel open, cache off; then again with `?savefail` only.
Action: load, sign in, open every page, sign out. In the console: `document.getElementById('timingRoot')`,
`document.querySelector('.timing-pill, .timingwin')`; list `performance.getEntriesByType('resource')` names.
Expected: no file whose name holds `TimingReadout` or `timing` is requested; both queries null; the count and names of
script and style files at start equal `main`'s build (compare the two `dist/index.html` and `page-files.json`: no new
shared file, no `modulepreload` of the readout); the sign-in caret in Username; Escape, toasts and windows as on `main`.
Disproves: any extra request, element, or a file split differently from `main` (a shared file moved because the readout
imports the window).

**S3 — With the switch nothing is saved and nothing names a person (D2481).**
Setup: `?timing`, storage panel open; snapshot local storage, session storage, cookies, IndexedDB before. Action: drag
the window, fold, reopen, Copy all, open pages, reload. Expected: storage identical but for the app's own writes (diff
key by key against a run without the switch); after reload the window is back at its corner (its place not kept);
Copy all's text holds no username, callsign, role or squadron number — read it whole as admin and as member.
Disproves: any key added; a place remembered across reload; any personal word.

**S4 — Every figure against an outside measure (the worst failure is a wrong figure).**
Setup: desktop, slow CPU, `?timing`, performance recording on. Action: one pass of sign-in and each of the nine pages,
first and second time. Compare each row with the recording (tap → first frame with the page's content and no claw) and
with the plan's script on the same build.
Expected: each within 0.2 s or 15%; "Site answered" = the navigation's response start; "App loaded" < "Sign-in shown".
RECORD exactly what View-only Sched and Edit Schedule show against the recording: the test is only "the section is on",
so anything a page draws after its first two frames is not counted — if the week's days arrive later than the row says,
that is a finding.
Disproves: a row shorter than the recording by more than that (drawn later than claimed) or longer (counts the
readout's own work).

**S5 — Sign in, then leave before the week is drawn (F3).**
Setup: desktop, slow CPU 6×, `?timing`. Action: press Sign in and tap Inputs at once; wait 30 s; tap View-only Sched.
Expected: "Sign in pressed → week shown" never shows a figure near 30 s — "not yet" (or his words for "not timed").
Disproves: "took 30.x s".

**S6 — Retry's reload and the sign-in that lands on the Leave War (F3).**
Setup: phone, `?timing`; block the Leave War's file; open Leave War → the card; unblock; Retry; sign in.
Expected: lands on the Leave War; RECORD the sign-in row and whether a Leave War row exists. Then Inputs, then Leave
War again: its tag should be "opened before". Then View-only Sched: the sign-in row must not fill in with a long time.
Disproves: "took" with the seconds since sign-in; the second Leave War visit tagged "first time"; `?timing` gone from
the address after the reload.

**S7 — The readout's file arrives late (F2).**
Setup: desktop, `?timing`; hold only the `TimingReadout` file for 10 s (request blocking with delay, or throttle that
URL). Action: sign in at once, open Edit Schedule, then Inputs; let the file come.
Expected: no row and no sign-in figure that includes the 10 s; rows for pages opened before it came are absent or
marked untimed; and the caret is not pulled out of a box he is typing in when the window appears.
Disproves: "took 10.x s"; one Inputs row of about 8 s; the window appearing takes the keyboard mid-typing.

**S8 — Typing straight away on a computer (F5).**
Setup: desktop, `?timing`, fresh load. Action: without clicking, type the username, Tab, password, Enter.
Expected: signed in — "the caret waits there so a person types straight away" (Login's standing rule); the window is
open at the bottom-right (D2483). Compare the same keys without the switch.
Disproves: Username empty; the keys went nowhere; `document.activeElement` is the Timing window.

**S9 — The pre-warm's download credited to another page (F6).**
Setup: desktop, cache cleared, weak line, `?timing`. Action: sign in, hands off 2 s, then at once open Inputs (first
time). Then open Leave War.
Expected: Inputs: "first time" with no "downloaded". Leave War: RECORD (pre-warmed: "first time", fast, no download —
is that the figure he wants called "first time"?).
Disproves: Inputs "downloaded 1xx KB".

**S10 — A page left before it finished; a page asked for twice.**
Setup: phone, weak line, `?timing`. Action: tap Leave War, and while the claw is up tap Quals; later tap Leave War.
Also: A → B → A inside half a second on a slow CPU; tap the page already open.
Expected: no Leave War row for the abandoned visit; Quals' row is Quals' own time; the later Leave War row — RECORD
tag and time (its file came down while he was away; "first time" without a download). The page already open: no row.
Disproves: a Leave War row from the abandoned tap; Quals' time including the Leave War's; two rows for one tap.

**S11 — A download that fails (F1b).**
Setup: phone and desktop, `?timing`, Leave War's file blocked. Action: open Leave War → card. Retry with the file still
blocked (card returns). Desktop: let the pre-warm fail hidden, then open the page.
Expected: RECORD exactly what row the card produces; my reading: none, or one that says it did not open. The window
and the corner button stay usable over the card and over Retry's claw; the card's Retry is not covered by the window
at 1366×768 (window bottom-right, card centre).
Disproves: "Leave War, first time: 0.x s" with nothing to tell a failure from a fast open (a developer would read it
as a fast page).

**S12 — Sign out with a save waiting, sign in again (F4).**
Setup: desktop, `?savefail&timing`; make a change on Edit Schedule so the failed-save band is up; sign out (no reload
happens); wait 40 s; sign in.
Expected: no View-only Sched row of about 40 s; the sign-in row is this sign-in's own; the window sits clear of the
"Not saved" band and its Retry on the sign-in card and in the app.
Disproves: "View-only Sched, opened before: 40.x s".

**S13 — First visit and a repeat visit (the kept-files rows).**
Setup: desktop Chrome, then Edge, Firefox, Safari on an iPhone. (a) cache cleared, load `?timing`; (b) reload; (c)
close the tab, open again; (d) after a new build is served.
Expected against the network panel's own "from cache" column: (a) "Kept from an earlier visit: 0 of N"; (b),(c) N of N
or the panel's count; Copy all's "Asked the site again…" = the panel's count of 304 answers; "App files used N · KB" =
the panel's script+style count and compressed size (F11: two of them are the readout's). A page's first-time tag has
no "downloaded" when its file came from the cache.
Disproves: kept > 0 on a cleared first visit; a count that differs from the panel; a 0 or blank where the browser gives
nothing (must read "not given by Safari" / "by Firefox" — D2483).

**S14 — Rows where the browser gives no figure (D2483).**
Setup: Safari (Mac or iPhone), Firefox, Chrome on an iPhone, an in-app browser if one is to hand. Action: read every
row and Copy all.
Expected: Brief freezes and Longest freeze "not given by Safari" (Firefox: "by Firefox"); memory "not given by …";
never blank, never 0, never "none" for a figure that was not measured; a browser it cannot name: "not given by this
browser" and "· not known". RECORD what Chrome on an iPhone is called (it is Safari's engine under Chrome's name).
Disproves: "none", "0", "undefined", "NaN", "null" anywhere.

**S15 — His 125% display, and a phone (F7).**
Setup: Chrome started at 125% device scale, browser zoom 100%; then browser zoom 150%; a phone.
Action: Copy all. Expected: RECORD the "Window … at N% zoom" and "Screen" lines beside the true zoom and the true
screen. Disproves (my reading): "125% zoom" at a browser zoom of 100%; "300% zoom" on a phone.

**S16 — Sign-in that does not reach the app; wrong password.**
Setup: `?timing`. Action: a wrong password; a name on no list (the ask-for-access screen); then a good sign-in.
Expected: the wrong password changes no row; on the access screen the sign-in row stays "not yet" and the window is
still there and usable; the later good sign-in shows its own time, not one from the earlier press.
Disproves: a time measured from the first press.

**S17 — Does the window slow what it measures? (a time that includes the readout's own drawing.)**
Setup: desktop, slow CPU. Action: five passes of View-only Sched ↔ Edit Schedule with the window open, five folded,
five with the plan's script on the address without the switch.
Expected: the three medians within the spread the plan shows (about ±0.2 s). The open window re-draws on every change
in the app (`FloatWin` listens to the app's signal and re-measures its place each time) — this is where a cost would
show.
Disproves: open consistently slower than folded, or either slower than no switch.

**S18 — The window itself: drag, fold, reopen, long list, small screens (D2483).**
Setup: desktop 1366×768 and 1024×600; phone 390×844 and 320×568. Action: at start — open bottom-right on a computer,
folded bottom-left on a phone ("Timing"); ✕ folds to the corner button, which then reads "Timing 1.2 s" (the newest
page); the button reopens it where he left it; drag by the bar to each corner and half off each edge; open 30+ pages
so the list is full; rotate the phone; narrow the desktop window under 620 and back.
Expected: bar, ✕ and Copy all always reachable; the body scrolls, the window never taller than the screen; the list
keeps the newest 30; the title's second line "This computer only. Shown because the address ends in ?timing" readable
in full, not cut. RECORD what the window covers at its starting place on each page (the week's right-hand arrow, the
pinned scroll bar's right arrow at the foot, Edit Schedule's right-hand panel) and what the folded button covers at
the bottom-left on each page on a phone and a desktop (the pinned scroll bar's left arrow; a phone's foot bars).
Disproves: ✕ or Copy all off screen; a control of the app that cannot be reached with the window folded.

**S19 — Escape, with the window open all session (computer).**
Setup: desktop, `?timing`, window open. Action, one Escape each, keyboard in the place named: (a) nothing else open,
keys on the page; (b) typing in a cell on Edit Schedule; (c) a seat armed; (d) ALL AVAIL open after the Timing window;
then press Copy all and Escape again; (e) the Changes window; (f) the bell's list; (g) the ☰ drawer; (h) a blocking
question; (i) the Scheduler Board open; (j) an input's own window on the Inputs page with text typed; (k) a Leave War
sheet.
Expected (the design guide §2: Escape closes what opened last; one Escape, one thing): in (b) the cell's own Escape,
window stays; in (c)–(k) the thing opened last answers and the Timing window stays, unless he pressed the Timing
window after it; in (a) it folds. RECORD each. Then the same list with the window folded: exactly as without the
switch.
Disproves: one Escape closes two things; Escape folds the Timing window and leaves a question, menu or armed seat up
that was opened after it; the board cannot be closed by Escape at all while the window is open (its Escape stands
aside for any movable window — it should take the second press).

**S20 — Over and under the app's other layers.**
Setup: desktop and phone, window open, then folded. Action: open the ☰ drawer, the bell's list, a day's bubble, the
Insights window, a blocking question, the Scheduler Board, ALL AVAIL and Changes together, an Inputs day window, the
Inputs editor; raise a note; `?savefail` for the "Not saved" band and the OIL band.
Expected: drawer, bubble, modal and their veils lie over the window and the button (window 410/411, button 409,
drawer 440, modal 470); the board (400) lies under them, so both stay usable on the board; a press on the Timing
window or on another movable window brings that one to the front and both ✕ stay reachable; the bands at the top are
never covered; on a phone, with the window open, a note moves to the top of the screen (as for any window) and with it
folded the note at the foot and the corner button do not hide each other's words — RECORD with a picture.
Disproves: the window over a blocking question; a note unreadable behind the button; a band or its Retry covered.

**S21 — The Leave War's blocking sheets with the window open.**
Setup: desktop and phone, `?timing`, window open, Leave War. Action: open each blocking sheet (an event, a bid, "Open
for bidding", Holidays) and inside each any picker, calendar or question it opens.
Expected: every one drawn and pressable above its sheet, exactly as with the window folded. (A blocking sheet is put on
its raised layer whenever any movable window is up — `Sheet.tsx:590` — so with the Timing window open that is always.)
Disproves: a picker or question that comes up behind its sheet, only when the window is open.

**S22 — Copy all.**
Setup: desktop Chrome on `https`, on plain `http` to a LAN address (no clipboard there), with the clipboard permission
denied, with the page not focused; Safari on an iPhone. Action: press Copy all; paste into a text box.
Expected: the pasted text is the window's rows word for word plus the developer's lines, stamped "24 Nov 26 14:05, this
computer's clock"; the button reads "Copied" for 2 s. Where refused: RECORD — today the button does nothing visible
(F8). Press it again after opening another page: the paste holds the new row (not a stale copy).
Disproves: "Copied" shown and the paste is something else; a silent failure taken for a success; stale rows.

**S23 — A member and an admin.**
Setup: both, phone and desktop. Action: each opens every page they have; the admin uses the member-view switch while on
Edit Schedule (sent to View-only Sched).
Expected: the same rows and words for both; the forced move to View-only Sched makes one row; no row names a page the
member cannot open; nothing in the window differs by who is signed in.
Disproves: a missing row for a real page change; any wording that tells who is signed in.

**S24 — Every door to a page makes exactly one row.**
Setup: admin, desktop and phone. Action: top bar names; ☰ drawer; the bell's notice that opens Inputs; Help; "Check my
quals"; the OIL day list's row → Inputs; Leave War → Inputs and back; the schedule's link to the Leave War; Undo of a
step made on another page; the Admin door. Then the browser's Back button — RECORD (the app keeps no history; Back
should leave the app, and coming forward again is a fresh start or the same page restored).
Expected: one row a door, named as the app names the page, newest first.
Disproves: a door with no row (a missing call), or two rows.

**S25 — A hidden tab (F9).**
Setup: desktop. Action: tap Edit Schedule and switch to another tab within the same half second; return after 30 s.
Also load `?timing` in a background tab and come to it after 30 s.
Expected: no row near 30 s; RECORD the start-up rows of the background load. Disproves: "Edit Schedule: 30.x s".

**S26 — Long use.**
Setup: desktop, `?timing`, ten minutes of ordinary work with the window open. Expected: the freeze rows move at most
twice a second and never make typing in a cell stutter; RECORD the freeze count beside the minutes open (F10).
Disproves: the window's own re-drawing shows as freezes in a performance recording.

---

## D. Checked and found nothing

- Without the switch: `timingMark` and `timingSink` return on their first line; the freeze watcher is not made; the
  readout is a dynamic import behind `timingOn()`; `timing.css` is imported only by the readout. `state/view.ts` now
  imports `ui/timing.ts`, which imports nothing — no import loop.
- No write to local or session storage, cookies or IndexedDB in the four new files; the window's place lives in
  `winorder.ts` memory only.
- Nothing about a person in any row or in Copy all.
- `signIn()` is a table lookup: marking after it returns loses nothing measurable.
- A wrong password makes no mark. A tap on the page already open makes no mark (`p!==CURPAGE`).
- The window cannot grow off the top of a desktop screen: it stands on `bottom:16px` under the windows' own
  `max-height: 100vh − 120px`, and its body scrolls; on a phone `100dvh − 24px`.
- The claw (layer 50) and the Scheduler Board (400) are under the window and the button; drawer and modal over them.
- The failed-save rule that lowers a window at its default spot names only the Changes and ALL AVAIL windows; it does
  not reach this one, and this one starts at the foot, clear of the band.
- Production draws the first screen once; the double `first` mark is the dev server's only.
- The marks cost: one comparison per `setPage` without the switch.
- The data exclusion: nothing here touches stored data; I raise no finding of that kind.

## E. Questions the walk cannot settle (his, or the host's reading)

1. A failed download: a row, no row, or a row that says so? (F1b)
2. A sign-in that lands on the Leave War after Retry: is its time the sign-in's? (F3)
3. A pre-warmed Leave War's first open: "first time", or its own tag? (F6)
4. What Copy all says when it cannot copy. (F8 — something new he would see: a mock-up first.)
5. The "zoom" and "Screen" words. (F7)
6. The host's reading of where a time ends ("the second frame after the page is the one on screen with no claw") holds
   for the two downloaded pages once F1 is fixed; for the seven others it ends two frames after the page is switched
   on, whatever the page draws later — S4 says whether that is the moment he would call "open".
