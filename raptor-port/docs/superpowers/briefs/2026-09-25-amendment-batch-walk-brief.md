# Brief — walk the amendment batch in the running app (25 Sep 26, FULL tier)

You are one of three walkers, each on your OWN browser world (a fresh Playwright browser context — its storage is its
own). You drive the REAL production build already served at **http://localhost:4173** (do NOT rebuild, do NOT start
or stop a server, do NOT edit anything under `raptor-port/src`, do NOT commit). The standing order you are working
under: `raptor-port/docs/bug-check-order.md` §7 (the walk) — a walk that left no picture did not happen.

## What was built (the batch)
Read `raptor-port/docs/superpowers/specs/2026-09-25-amendment-batch.md` (the 14 items and their rulings) and
`raptor-port/docs/superpowers/plans/2026-09-25-amendment-batch-plan.md`. The rulings are rows D91–D111 in
`.claude/rules/decisions/scheduler.md`. The screen contracts as built: `raptor-port/docs/ui-contracts.md`
§Amendment marks on screen and §The pending list, the one jump, and what the day head says.

## How to drive it
- Reuse the walk helpers: `raptor-port/scripts/handpass/am/w2-lib.mjs` (re-exports `am-lib.mjs` and `../lib.mjs`):
  `openHi({width,height,who:'a'|'m',state,dpr})` opens a logged-in page (`who:'m'` is the member), `editWeek`,
  `signDay(page, di)`, `publishDay`, `publishAL`, `unpublish`, `head(page, di)`, `board(page, di)`, `closeBoard`,
  `go(page,'viewsched'|'editsched')`, `lookAt(page, di, /Original/)` (preview a version), `pvTap`, `clip`, `screen`,
  `check(id, ok, detail)` / `note` / `summary`. Read the lib before writing. Set `HP_SHOTS` to your own picture folder
  BEFORE importing the lib. The saved everything-week is `STATE` (a published Monday etc.); a fresh world is
  `state: null` (the seed week, nothing published).
- Make every fixture through the app's own controls (sign-off selects, Publish day, Publish AL, drags or the
  seat-arm-then-pick, typing in cells). `window.*` reads are fine for the evidence table; writes through `window` only
  where the app's own control cannot reach the state — and SAY so in the report (that is itself a finding: a missing
  door). Do not sign in again mid-fixture (it reloads).
- Widths: desktop 1440×900 (DPR 1 for "real size" pictures), phone 390×844 (DPR 3). Watch the browser's error list
  (the lib collects `errors`) — any error is a finding.
- Write your script(s) as ASSERTIONS OF THE RIGHT BEHAVIOUR (a PASS means correct), under
  `raptor-port/scripts/handpass/am/b-<you>-*.mjs`, pictures under
  `raptor-port/docs/img/handpass/2026-09-25-amendment-batch/<you>/`. LOOK at every picture you take.
- A scripted gesture that fails is looked at on its picture before it is called a defect.

## What to hand back (your final message)
1. A table: every check id, PASS/FAIL, what the screen said, the picture file.
2. Every FAIL / surprise as a finding: steps to reproduce, expected, seen, picture, and your read of the cause (file
   and function if you can find it) — do not fix it.
3. Explicit negatives: what you checked and found right.
4. What you could NOT walk and why.
Plain English. Also write the same report to `raptor-port/docs/handpass/parts/2026-09-25-amendment-batch-<you>.md`.

## What is NOT a finding (owner, D56)
A problem whose harm exists only in data already stored, when the code is correct going forward. The whole store is
demo data, cleared before the database step.

---

## Walker B1 — the counting, the list, the jump, the marker, the signatures (items 14, 7, 8, 9, 12, 5)
Surfaces: the edit week and the board, desktop AND phone; View-only Sched's working-draft peek for the marker.
1. **One count (D109).** On a published day (publish one yourself), make each through the app: a man moved from one
   duty desk to an empty one (expect 1); then another man put into the desk he left (2); a swap of two pilots (2); a
   man moved from a desk's holder to its extras line; two men taken off one Common Programme crowd (2); a time
   change (1); a remark (1); a row removed; a reorder. After each, read EVERY count and assert they agree: the day
   head's "N pending", the board strip's, the ⓘ day panel's "N unpublished edits", the sign-off line ("N changes to
   publish", once signed), the Amendments panel line (desktop), the "Discard N edits" on a preview's Load button,
   and — after Publish AL — the toast "Published ALn · N items", the Amendments history and the ⓘ panel's "N items".
2. **The pending list (D99, D100, D104).** Tap "N pending ▾" on the week head and on the board strip, desktop and
   phone: the list opens, head "Waiting to go out as ALn · N changes", one row per change, the move reads
   "<man>: <from> → <to>", callsigns never ids, no raw "␟" or JSON on screen, who/when for changes made in this
   sitting, "earlier" after a reload, a long list (make 15+ changes) scrolls INSIDE the window, closes on a tap
   outside and on Escape. It must NOT be a button on View-only Sched, under a preview, or on a draft day.
3. **The jump (D107).** From the pending list AND from Edit history (the top-bar Edit history on Edit Schedule):
   tap a change → on Edit Schedule the view goes to that change ON THE WEEK and marks it — the board must NOT open;
   on a phone the week steps to that day. From the board's own Edit history / pending list, the board jump (bubble
   pinned). A traffic change says it has no place; a removed row says so.
4. **Signatures (D103).** Sign all four on a published day with a change waiting; then make another change → the
   four blank; put it back → they return. Do the same with a change in who is behind an ALL AVAIL puck if you can
   make one through the app (a leave filed on Inputs for a man behind it). Plans: sign Plan B, switch to Plan A →
   unsigned; back → signed.
5. **The marker (D97).** "Not yet signed" while unsigned; "Not yet published" once all four are valid; gone after
   publishing; never on the issued face; the working-draft peek shows it.

## Walker B2 — the marks, the rings, the seal, the Signed line (items 1, 2, 13, 3)
Surfaces: the edit week, the board, View-only Sched issued face AND its working-draft peek; desktop (DPR 1 AND 3)
and phone; admin AND member (`who:'m'`) on View-only Sched.
1. **Tags, not rings (D92, D93).** Build a published day at AL2 or AL3 where changed pucks also carry warning rings
   (an amber advisory, a red clash, the dotted crew-rest cause, a dashed late show if you can). Assert with computed
   style on the PUCK: no box-shadow / outline in an AL colour; the warning ring's own stroke intact; a solid ALn tag
   (`.seat[data-alc]::after`) on a published change; a hollow dotted tag (`.seat[data-aln]::after`) on a waiting
   one — on EVERY kind of seat: flying FCP/RCP, SC seats, a duty desk, a duty extra, a sim seat, a sim passenger, a
   ground row, a Common Programme crowd. Times/areas/remarks keep their own cell marks. Take DPR-1 pictures (real
   size) — including the view page's working-draft peek with a waiting change on a man wearing a dotted ring.
2. **Board rings (D94).** A man whose day causes tomorrow's crew-rest breach: dotted ring WITH its CR caption on the
   board as on the week; a sanctioned late show: dashed on both. Every board seat kind.
3. **The ORIG seal (D111).** On the edit week head, the board strip, View-only Sched, desktop and phone, beside an
   AL3 (green) and an AL4 (white) day and a DRAFT day: the tick disc + "ORIG", faint wash, thin light outline; must
   not read as AL4 or a warning; no grey left anywhere.
4. **The Signed line (D95, D102).** Publish a day's Original signed by four people, then AL1 signed by four OTHER
   people (the lib's `signDay` picks by index — pick different names per version). Assert: View-only Sched issued
   face names AL1's four (member and admin alike); the working-draft peek names the published version's; the edit
   week names the version the working copy sits on — NOT the live sign-off boxes (half-sign the next issue to prove
   it); previewing the Original (plans menu) names the Original's four on the week AND the board strip; a parked plan
   preview shows no line; phone: names only (no role labels); a draft day: no line.

## Walker B3 — the doors, the load, the keyboard, the bubble, and a regression sweep (items 4, 6, 11, 10)
Surfaces: the board and the edit week, desktop and phone.
1. **Templates (D96).** Save a day as a template; on a PUBLISHED day open Templates from the board AND from the
   week's Templates button: every template is drawn disabled, the reason on screen, saving still works; a tap does
   nothing but say why; on a DRAFT day a template applies as before.
2. **The load (D98).** On a published day with an accepted request (a Personal Input accepted onto the programme):
   take it off the programme, then preview the issued version and "Load onto working copy": the request is back on
   the programme and the day reads 0 pending; the confirm read "Discard N edits" with N counting it. A request filed
   AFTER the version: load → it reads fresh again. If you can make one through the app, a request spanning two
   published days (Mon–Tue): loading Monday must not change Tuesday, and the message says it was left as filed.
3. **The phone keyboard (item 11).** Phone board, History on and off: focus a Common Programme name near the bottom;
   emulate the keyboard by shrinking the visual viewport (CDP `Emulation.setVisibleSize` or
   `page.setViewportSize` with a shorter height) — nothing of the week behind must show; the board fills what is
   visible. Put in the report that the real proof is his iPhone.
4. **The History bubble (D105).** Edit one detail 12+ times; board History mode: desktop hover shows the story, the
   pointer can move INTO the bubble and wheel-scroll its list without it vanishing; phone tap + "all N changes"
   expands, the list scrolls with a finger; the tap still arms / edits underneath (the History contract).
5. **Regression sweep.** Publish day, Publish AL, Unpublish (and its re-publish), plan switch, Undo/Redo of a
   publish, the Amendments panel publish button — each once, desktop, with the error list watched. Anything that no
   longer works is a finding.
