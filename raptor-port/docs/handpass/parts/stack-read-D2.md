# Stack read — piece D2: the Tab route (`8d6ffffe`) and the phone ⋯ Insights menu (`2f7ad9b1`) — 5 Oct 26

Reader: Opus 5.5, read only. Code read as it stands at `bcc69fc8` (no later piece changed `schedule-tab.ts`, `textedit.ts`,
`EditWeek.tsx`, `ScheduleInsightsMenu.tsx` or `Drawer.tsx`; `SchedBoard.tsx` and `Shell.tsx` gained only the failed-save band).
Nothing was run. "main" below is `de470db5`.

**How the route works, in one paragraph (so the tables can be short).** `Shell.tsx` already had one document `keydown`
listener (`textedit.ts routeKeyDown`). It now first calls `schedule-tab.ts routeScheduleTab`: if the key is a plain Tab or
Shift+Tab, the caret is in a live schedule text box on Edit Schedule (week day or the open board), the day is not a look at
an older version and not in OIL Earn mode, it lists that day's live text boxes in DOM order, picks the neighbour, calls
`source.blur()` (which fires the existing save — `routeFocusOut` for the week's boxes and the board's four contenteditable
kinds, the native `change` → `board.ts boardChange` for the board's `<input>`/`<textarea>`), refreshes the neighbour's text
from the model (`textedit.ts refreshTextDestination`), focuses it and scrolls it clear of anything covering it. With no
neighbour it looks for the next "ordinary control" inside the same day (week) or inside `#schedBoard` (board). Both editors
still refuse to repaint while a caret is in a text box; the commit added a "pending paint" that runs when the caret leaves
text altogether (`EditWeek.tsx`, `SchedBoard.tsx`). So **during a run of Tabs nothing in the dense day is redrawn** — every
question about "focus after the redraw" reduces to the moment the run ends.

---

## 1. Roll-call

### Thing A — a text box on the Tab route

Columns: **ON THE ROUTE** (is it in the collected list) · **USABLE** (Tab / Shift+Tab move through it and the value left
behind is saved once, an unchanged one writes nothing) · **SAME PIXELS** (what else is painted there).

| # | Place / kind of box | On the route | Usable | Same pixels |
|---|---|---|---|---|
| A1 | Week — wave label (`wl:`) | YES — `html.ts dayHTML` → `ted()`; `WEEK_TEXT [data-txt]` | YES — `routeFocusOut` data-txt branch → `txtSet` → `commitText` | wave grip, "· NIGHT", In-time/Rally read-out, standalone tag |
| A2 | Board — wave title | NO, because it is a `<select data-wsel>` (an ordinary control, D551) | NO, same reason — native Tab reaches it only after the route's exit | — |
| A3 | Week + Board — In-time / Rally lines (`data-itline`) | YES — `html.ts intimesInner`, shared by `board.ts` | YES — own branch; a cleared line deletes itself and the survivors are renumbered in place (new in this commit); unchanged line guarded by the fold compare | ✕ button beside each line, the live "out of order" words (`data-reporting-feedback`) |
| A4 | Week — flying line callsign, mission, brief, take-off, landing (`ff:`), shared once per formation | YES — DOM order cs → msn → br → to → ld = flow B | YES — time boxes: new guard compares displayed forms, so an untouched `0745` is not rewritten as `07:45` | blue suggested-brief ghost above B (`.bsug`, click only), `.badtm` edge + warning address on TO/LD, AL marks |
| A5 | Board — the same five, REPEATED on every aircraft row | YES — `board.ts boardHTML`; `BOARD_TEXT [data-bfld]` | YES — native `change` fires only when typed in; repeated twins refreshed on arrival | suggested-brief ghost, AL marks, row grip, CX/■/+/✕ cluster |
| A6 | Week — SC / AVALON / BB standby line | YES for cs, msn, start, end, remarks; **NO B box, because** the week never draws B on a standby line (settled seam, scheduler.md §Board behaviour) | YES | MAIN/SPARE badge (`saRoleHTML`, a button) in the remarks cell |
| A7 | Board — SC / AVALON / BB standby line | YES incl. the B box (the SC in-time) | YES | MAIN/SPARE badge; no stores, no Area strip |
| A8 | Week + Board — aircraft Remarks (`fr:`) | YES | YES for an unchanged or ordinary remark; see lead 2 for text holding a doubled space | D529 "Choose / Change mission role" button and the Blue/Red question are inserted under the formation by `mission-role-offer.ts` while this box is the caret's |
| A9 | Board look at a published version — read-only Remarks (`data-role-remarks`) | NO, because it is read only (D551) — excluded by `textField` | NO | — |
| A10 | Week + Board — stores text (`data-bombs`) | YES | YES — writes only when the text differs; green "saved" flash kept | store chips, the C button (skipped by the route) |
| A11 | Week + Board — Area and Area time (`data-area`, `data-atime`) | YES, after the formation's aircraft | YES **by Tab** (refreshed on arrival, so the derived window is current); **MISSING for a click or the phone keyboard's arrows** — lead 1 | AL marks; derived text until typed over |
| A12 | Traffic (`tr:`) | NO, because it is a pop-up (`AirPop`) and pop-ups stay closed (D551) | NO — inside it Tab is the browser's own | — |
| A13 | Week + Board — duty block label (`dl:`) and duty rows (`dr:` role, start, end, remarks) | YES | YES — Board role box opens its pick-list on a click only (`board.ts` `data-rolepick`), never on focus | role pick-list (if he opened it by click it stays open while Tab moves on — same on main) |
| A14 | Week + Board — sim rows (`sr:` label, start, end, remarks) and sim notes (`sn:`) | YES | YES — single line kept: `txtSet` folds a line break, Enter commits | passenger / seat pucks |
| A15 | Week + Board — ground rows (`gr:`) incl. a row that came from a request | YES | YES, except **MISSING: an unchanged-pass guard for text that is not whitespace-normal** — lead 2 (a request's remark with two spaces) | ⓘ info mark, LATE chip, CX/flag tags |
| A16 | Week + Board — Common Programme rows (`ap:` item, detail [week only], start, end, remarks) | YES | YES | crew pucks |
| A17 | Week + Board — the day's overall notes (`dn:`) | YES | YES | note ✕ / public toggle buttons |
| A18 | Week + Board — the four section notes (`pn:` `dtn:` `sn:` `gn:`) | YES (week `.blknote`, board `textarea.sb-nbox`) | YES | "show on View-only" toggle (`data-notepub`) right after it — the usual exit control |
| A19 | Week + Board — a request's own times and remarks in Personal Inputs / Unavailable (`data-inp` / `data-ifld`) | YES when the section is open; a folded section is skipped (`rendered()`) | YES; the save can open the OIL question window behind the moved caret — **MISSING: the route does not stand down** — lead 5 | type button (opens the edit window), LATE chip, Accept / Undo buttons |
| A20 | Available crew, SANS availability cards | NO, because they hold no typing box | NO | pucks carry `tabindex="0"`, so they ARE "ordinary controls" for the exit |
| A21 | The Blue/Red question and the "Choose mission role" button (D529) | NO, because they are buttons, not text (D551) — excluded in `textField` and in `ordinaryTarget` | NO — never focused by the route, never asked by an unchanged pass; reachable by pointer only (same as before this piece) | sits under the formation's Area strip |
| A22 | Day's last box → "next ordinary control" (D553), week | **MISSING** when no button or puck follows the last box inside that day: the key is swallowed and focus goes to the page body (`routeScheduleTab` calls `preventDefault` before it knows there is a target) — lead 3 | — | — |
| A23 | The exit control after a run that changed something | **MISSING**: nothing puts focus back after the repaint that follows the exit — always on the board (`#sbBoard` is rewritten whole), on the week when the control's own block changed — lead 3 | — | — |
| A24 | Board on a phone — day arrows / calendar excluded from the exit | **MISSING** in fact: `ordinaryTarget` excludes `[data-btab],[data-bprev],[data-bnext],[data-bweek]`, attributes that exist nowhere; the real ones are `#sbPrevDay`, `#sbNextDay`, `#sbCal`, `data-sbtab`, `data-sbweek` (only the last two are covered, by `#sbDays`). No reachable failure found (other controls always sit nearer) — see negatives | — | — |
| A25 | A box entered by a CLICK or by the phone keyboard's ‹ › arrows after its twin changed | **MISSING** refresh — lead 1 | writes the old words back | — |
| A26 | View-only Sched | NO, because nothing there is editable (No Edit-mode toggle; `scopeOf` needs `CURPAGE==='editsched'`) | NO | — |
| A27 | Next-week peek | NO, because `peek.ts` never emits an editable; the exit is bounded to the day | NO | — |
| A28 | A look at an older version / a saved plan (week and board) | NO, because `DPREV.has(di)` ends the route and `.pv-frozen` boxes are excluded (D550) | NO | preview banner |
| A29 | Published day, working copy | YES — it is editable as pending changes | YES — a changed box is marked, counted and drops the sign-offs through the existing writers; the day's own head and marks are redrawn only when the run ends | ALn tags, sign-off strip, "N pending" button |
| A30 | OIL Earn mode on (board) | NO, because `oilModeOn(di)` ends the route; the board is read only there | NO | — |
| A31 | History mode on / the changes window or ALL AVAIL window open | YES (they do not block the schedule) | YES; a box under a floating window is scrolled to the centre and then 20% further on every arrival (`routeScheduleTab` reveal) — walk item | the window, gold dots |
| A32 | Phone layout; board's Desktop layout on a phone | YES with a hardware keyboard | YES; the on-screen keyboard's arrows send no Tab key, so they keep the browser's order — NO, because D545 is about "tab … pressed on the keyboard" | parked crew drawer excluded from the exit |
| A33 | Member, guest, admin's member view, no access | NO, because `canEditSched()` is false and no box is drawn editable | NO | — |
| A34 | Print, CSV, Insights, Logic, Inputs page and calendar, Medical view, Leave War, OIL tracker, Tracker, sign-in card, phone drawer, every pop-up window | NO, because none of them draws a box with the route's attributes (searched: only `html.ts`, `board.ts`, `board-html.ts` emit them) and the route needs Edit Schedule | NO — their own Tab handling is untouched (negatives) | — |

### Thing B — the way to Insights and to "Pick a date" on a phone

| # | Place / person | Shows the ⋯ | Insights reachable | Pick a date reachable | Same pixels |
|---|---|---|---|---|---|
| B1 | Phone, Edit Schedule (admin) | YES — `Shell.tsx` `<ScheduleInsightsMenu page="editsched">` after the highlight toggle | YES — ⋯ → Insights | YES — the calendar icon (`.filt-cal`) | menu drops under the toolbar over the legend/banner; at ≤355px it hangs from the button's right edge |
| B2 | Phone, View-only Sched (admin, admin's member view, member) | YES | YES | YES — calendar icon | same |
| B3 | Phone, Scheduler Board | NO, because the board keeps its own ⋯ (D349, D481) and the week menu is switched off while a board is open (`SBDAY==null`) | YES — board ⋯ → Insights | YES — board calendar icon | — |
| B4 | Phone, Inputs / Quals / Logic / Admin / Help / Leave War / Tracker | NO, because D558's row: the drawer's shortcuts go and "other tabs … now route through a schedule page" | NO from that page — two taps via View-only Sched | NO from that page — same | — |
| B5 | Phone drawer | NO — WEEK block removed (`Drawer.tsx`), Menu then Account | — | — | — |
| B6 | Desktop and a phone held sideways wider than 820px | NO, because the menu is phone-only (D558); the top bar's Insights button and the week strip show there | YES — top bar | YES — week strip calendar | — |
| B7 | Guest | NO, because a guest runs the separate `GuestApp` with no Shell, no drawer and no Insights — unchanged from main | NO (never had it) | — | — |
| B8 | Signed in with no access (waiting screen) | NO — no Shell | NO | NO | — |

**MISSING cells: 6** (A11/A25 are one fault counted once; A15, A19, A22, A23, A24).

---

## 2. Door check

**A text box on the route.** Actions the data allows: move on (Tab), move back (Shift+Tab), commit and stay out (Enter),
put back (Escape), leave the day's text (Tab on the last box / Shift+Tab on the first).

| State | Admin, desktop | Admin, phone | Admin's member view · member · guest · no access |
|---|---|---|---|
| Day not published | all five: YES | YES with a hardware keyboard; on-screen arrows = browser order (A32) | no control and no write path — consistent (`perms`/`canEditSched` refuse at `routeFocusOut` and `boardChange`) |
| Published, nothing waiting | YES — the first changed box makes it "1 pending" and drops the four sign-offs (D103), shown when the run ends | same | same |
| Published, changes waiting | YES; putting a value back clears its mark inside the same save (`commitText` runs `reconcileIssuedMarks`) | same | same |
| Look at an older version / a plan | NO control, NO write (`DPREV` guard in `scopeOf`, in `boardChange`; frozen markup) — consistent | same | same |

No state found where the write path accepts a Tab-driven save but the box is not drawn, or the reverse. Board `Escape` in a
time `<input>` still does nothing special (only `<textarea>` restores) — unchanged from main, D544 says keep.

**The ⋯ menu.** Open: tap, Enter/Space, arrow keys. Choose: Insights. Close: tap outside (`pointerdown` on the document),
Escape (focus back to ⋯), tap ⋯ again, focus leaving it, page change, week change, sign-out, a board opening, the drawer /
calendar / Insights opening, a resize past 820px (the component returns nothing and the open flag is dropped, so coming back
does not reopen it). Every one has code (`ScheduleInsightsMenu.tsx`). Same doors for admin and member; none for a guest (B7).

---

## 3. Orders

| Order | What the rulings require | What the code does (by reading) |
|---|---|---|
| Tab then Shift+Tab over unchanged boxes | back where he started, nothing saved | YES — each arrival is refreshed from the model, each leave compares before writing |
| Edit + Tab, then Shift+Tab back | first value saved once; the box shows the saved (normalised) value | YES — refresh heals `800` to `08:00` on return |
| Edit A + Tab, edit B + Tab, Undo, Undo | two steps, B then A | YES — one `sched.text` command per box (week), one `sched.mutate` per box (board) |
| Edit a time so the brief is cleared (`txtSet` clears a brief after the new take-off), Shift+Tab to B | B empty, one step | YES — the clear rides the same command; B refreshed on arrival |
| Clear an In-time line + Tab, type in the next line + Tab | the right line is saved | YES — survivors renumbered at once in `routeFocusOut` |
| Before publishing | no marks (a draft day shows none) | YES |
| After publishing: change a box by Tab | ALn tag, "1 pending", sign-offs fall, "Not yet signed" | YES in the model at once; on the day itself only when the run ends (the top bar and amendments box, which are React, update at once) |
| After publishing: pass through every box unchanged | 0 pending, sign-offs hold | YES except lead 2 (doubled spaces) and, outside the Tab key, lead 1 |
| After an amendment / after Unpublish | same as the two rows above on the new version | nothing version-specific in the route |
| Redo | restores the Tab-saved value | YES — ordinary timeline |
| Reload | every value left by Tab is there | YES — saved inside the command at the blur, not at the deferred repaint |
| Sign out / in | undo list cleared, values stay | nothing route-specific; `bumpNav` cancels a pending paint |
| Second week | route works on the newly loaded week; no paint from the old one lands | YES — `navGen` checked in both pending paints |
| Storage reset | nothing of the route is stored | YES — no new stored state |
| ⋯ open → page change → back | closed | YES — scope compare (page, week, session, board revision) |
| ⋯ → Insights → close | Insights closes, focus returns to ⋯ | YES — `modalReturn` |

---

## 4. Leads, most serious first

### Lead 1 — Outside the Tab key, a box still showing the OLD copy of something just changed writes the old words back
**Main does the same.** The piece added the cure (`refreshTextDestination`) but called it from one place only — the Tab route.

*Steps (certain by reading, mouse; the phone keyboard's ‹ › arrows take the same path but must be walked on his iPhone):*
1. Edit Schedule, desktop. A formation that shows a derived airspace window, e.g. `1240-1405`. Type take-off `1255`, then
   **click straight into that formation's Area time cell**, then click on empty page. *Expected:* the window follows to
   `1255-1405`, nothing typed is stored. *Code:* the day is not repainted while a caret is in text (`EditWeek.tsx` effect),
   so the cell still reads `1240-1405`; on leaving, `routeFocusOut` (`data-atime` branch) compares that text with the
   model's new derived value, sees a difference and stores `1240-1405` as a typed override. The window is now frozen and
   wrong, with an extra history line; on a published day an extra pending change.
2. A leave shown on Monday and Tuesday. Change its remark on Monday's row, click straight into the same remark on
   Tuesday's row, click away. *Expected:* the new remark stays. *Code:* `data-inp` branch — Tuesday's cell holds the old
   text, differs from the model, `setInpField` writes the OLD remark back. The edit is silently undone.
3. A request accepted to Ground, its row also open in Personal Inputs. Change its remark in Personal Inputs, click into
   the Ground row's Remarks, click away → the Ground row gets the old remark back (`data-txt` branch → `txtSet`).

*Ruling:* D45/D103 (nothing changes without him acknowledging it; a spurious pending change wipes the sign-offs), and the
Tab plan's own TAB05 ("no-op / freshness").
*Fix:* (1) in `textedit.ts` export `routeFocusIn(e)`: find `closest(ALL_TEXT)` (export that selector from
`schedule-tab.ts`), return unless `canEditSched()` and `CURPAGE==='editsched'`, then call `refreshTextDestination(el)`;
(2) in `refreshTextDestination` make the In-time branch compare before it rewrites (`sameInner`), so a click's caret is not
disturbed; (3) in `Shell.tsx` register `document.addEventListener('focusin', routeFocusIn)` beside the three existing
listeners and remove it in the cleanup; (4) tests, failing first: the three step lists above on the week, step 1 on the
board (board Area time is also a contenteditable). The Tab route's own `refresh(next)` can stay.

### Lead 2 — An untouched text box whose stored words hold a doubled space is "changed" by passing through it
**Main does the same** (click-through, and native Tab). A whole-day Tab tour now makes it likely.

*Steps:* Inputs page: file a personal request with the remark `Dental review.  Back by 1400` (two spaces — a common typing
habit; the form only trims the ends, `inputedit.tsx` commit). Accept it to Ground; publish the day with its four
sign-offs. On Edit Schedule Tab through the day without typing. *Expected (D103, D529's "passing through … never"):*
0 pending, sign-offs hold. *Code:* the Ground row's Remarks is a `data-txt` box holding the request's remark as filed
(`overlay.ts requestRowFields`). `routeFocusOut` hands its text to `txtSet`, which folds runs of spaces
(`slots.ts txtSet`, `replace(/\s+/g,' ')`), finds the folded text differs from the stored text, writes it and marks it.
Result: "1 pending", the sign-offs fall, a history line whose before and after look identical, one Undo step. The same
happens to any box filled by a writer that does not go through `txtSet` (duty and wave template text keeps inner doubled
spaces too — `dutytpl.ts`, `wavetpl.ts` trim the ends only).
*Fix:* in `textedit.ts routeFocusOut`, `data-txt` branch, before `txtSet`: for a non-time key, fold both sides the way
`txtSet` does (collapse whitespace, trim, `—` → empty) and if they are equal, `heal(tx, txtGet(p))` and return — the same
shape as the time guard added in this commit. Test: the steps above; command count, pending count and sign-offs unchanged.
(New data would be hurt, so the demo-data exclusion does not apply.)

### Lead 3 — "Tab goes on to the next ordinary control" (D553) often ends on nothing
Two mechanisms, both by reading; Astra's R2 recorded "BODY focus" after the final Tab and passed it.
- **(a) No later control in the day (week).** `routeScheduleTab` calls `preventDefault()` and blurs before it knows a
  target exists; `ordinaryTarget` searches only inside the day. On the seeded Monday the last box (the last Unavailable
  remark) has nothing after it — the unit test asserts `document.activeElement === document.body`. He presses Tab and the
  caret simply vanishes.
- **(b) The control is redrawn a moment later.** After a run in which anything was saved, leaving text triggers the held
  repaint. On the board `SchedBoard.tsx` rewrites `#sbBoard` whole, so a focused button or puck inside it is destroyed and
  focus drops to the page; on the week `dayswap.ts` replaces the block the control sits in when that block changed (the
  usual case: the note just typed and its "show on View-only" toggle are one block). Where the next Tab then starts is the
  browser's choice — possibly the top of the board, which would read as a loop.
*Main:* no route; native Tab landed on a puck or button and lost it the same way.
*Fix:* in `routeScheduleTab`, when there is no `next`: do not focus at once. Remember the source's address (its
`data-txt` / `data-bfld` / `data-inp` / `data-ifld` / `data-itline` / `data-bombs` / `data-area` / `data-atime` value),
blur, then after two `setTimeout(0)` turns (past `txtCommit`'s timer and the settle paint) re-check `sameScope`, re-find
the day (`#eWeek > .day[data-day="…"]`, not the held node — a whole-day swap replaces it) and the box by that address,
run `ordinaryTarget` from it and focus the result only if focus is still on the body. For (a) decide with him whether an
empty result should let the browser's own Tab through (move `preventDefault` after the target is known) — that reaches
the next day's controls in one press instead of two.
*Walk:* on the week and the board, at desktop and phone width: change one box, Tab to the end, press Tab once more —
where is the focus ring? press Tab again — where does it go?

### Lead 4 — What he sees during a run: the day does not update until he leaves text
Not a wrong save; a consequence of "never repaint under the caret" that the route turns from a moment into the normal
state. Type a take-off that creates a clash and Tab on: the day's warning list, the puck rings, the ALn tags, the day's
"N pending", the sign-off strip and the blue suggested brief stay as they were until Enter, Escape, a click, or the end of
the day — while the top bar's Undo and the amendments box (React) change at once. On main Tab landed on a puck after two
or three boxes, so the day redrew often. *Ruling at stake:* D502/D509 ("explained while editing"), D97 (the marker's
wording), D45. *Fix, if he wants it:* none cheap — repainting the blocks that do not hold the caret is a `dayswap.ts`
change (skip the block containing `document.activeElement`) and needs its own plan. **Put it to him as a look, not a bug.**

### Lead 5 — A save that opens a window leaves the caret, and further Tabs, behind it
*Steps:* a duty-type request on a weekend day that can earn; on Edit Schedule change its start time in Personal Inputs and
press Tab. `setInpField` saves and `askOilIfPending` opens the request's window with the OIL question
(`inputedit.tsx`). The window is drawn by React after the key handler ends, so the route has already put the caret in the
next box; the window has no focus of its own, and more Tabs keep walking and saving behind it.
*Main:* the first hop is the same; the continued walk is new. *Fix:* in `scopeOf` return null while a blocking window is
up (the app's modal surround is on screen and does not contain the source); and give that window focus when it opens.
*Walk:* confirm the steps; also the medical-clash and upchit confirmations.

### Lead 6 — The reveal may jerk the page for a wrapped one-line box
`routeScheduleTab` treats a box as "covered" when the element at the centre of its bounding rectangle is not the box. A
long Remarks on the week is an inline span that wraps; the centre of its rectangle can fall on a neighbour (the stores
chips, the MAIN/SPARE badge), which would centre the page and then push it a further 20% on every arrival, though the
box was in plain view. Geometry — cannot be settled by reading. *Fix if seen:* test the first client rectangle
(`getClientRects()[0]`) instead of the bounding box. *Walk:* Tab into a two-line Remarks and into a wrapped callsign
(D367) on the week at phone and desktop width; watch for a jump.

**No lead found against the phone ⋯ menu.**

---

## 5. Explicit negatives — checked, nothing found

- **The save happens once.** Week: `blur()` → one `focusout` → one branch of `routeFocusOut` → `commitText` (one
  `sched.text` command); the deferred `afterSchedMutate` is a backstop that finds nothing. Board: one native `change` →
  `boardChange` → `txtSet` → `afterSchedMutate` (one command). The route itself contains no writer.
- **An unchanged box writes nothing** for: every time box on the week (new display-form guard), every board
  `<input>`/`<textarea>` (the browser fires no `change`), In-time lines (fold compare), stores, Area, Area time (when
  reached by Tab), a request's times and remarks (trimmed compare). Exceptions are leads 1 and 2 only.
- **A time box holding an odd stored form** (`0745`, or unreadable text): week — guard returns before `txtSet`, no toast,
  no write; board — the refresh shows the raw text where the builder showed blank, display only, no `change`.
- **The redraw cannot pull the next box out from under the caret mid-run:** every repaint of the week and the board goes
  through the two effects, both skip while `editingText()`; `editingText` now also knows the board's request boxes
  (`data-ifld`). React flushes after the key handler returns, by which time the caret is in the destination.
- **A destination that no longer exists** after the blur → the route stops with focus on the body; it never focuses a
  detached node (`isConnected`, `textField` re-checked).
- **Rows reindexed by the save:** only a cleared In-time line does that on this route; handled in place. Nothing on the
  route sorts or adds a row (the Ground Programme's time sort is at draw time and does not move model positions).
- **D529:** an unchanged Remarks never asks (the offer compares the formation's context before and after); a changed one
  asks a tick later, under the formation, and the caret stays in the next box; the question's buttons are never focused
  by the route and never count as the "next ordinary control", so focus cannot strand on them.
- **Enter and Escape** — every existing branch of `routeKeyDown` is untouched and runs when the route declines.
- **Modified keys, composing input, an already-handled key** — the route declines (`ctrlKey/altKey/metaKey`,
  `isComposing`, `defaultPrevented`).
- **Other pages and windows:** the route needs `CURPAGE==='editsched'` and a box carrying one of eight attributes that
  only the week and board builders emit. The Tracker's dialog trap (`Modals.jsx trapTab`), the Leave War's sheet trap
  (`Sheet.tsx`), the Inputs form, the request window, Logic, Admin and the sign-in card carry none; no new document
  listener was added (the `keydown` listener predates the piece).
- **The hidden week behind an open board** is never entered (`scope.root` is `#sbBoard`); **the parked crew drawer** on a
  phone is skipped by the exit; **the next day** is never entered by the route.
- **The dead selectors of row A24:** searched for any path where a board day arrow or the calendar is the nearest
  preceding control on a phone — the sign-off strip and the board's own controls always sit nearer. No failure; the
  selector should still be corrected to `#sbPrevDay,#sbNextDay,#sbCal`.
- **⋯ menu:** closes on outside tap, Escape, page / week / session / board change, resize; does not reopen after a resize
  back; is not drawn on desktop, for a guest, or over the board; the button's place does not depend on the highlight
  chips (they open on a second line); 320px handled by the ≤355px rule; nothing sticky in the week sits above it (the
  week has no sticky day head; the top bar and its failed-save band are a separate layer above the toolbar, and the menu
  hangs below its button). Opening it with a caret in a week box saves that box by the ordinary blur. Reading Insights
  from it changes nothing stored.
- **Drawer:** only the WEEK block went; navigation, the waiting badge, Account, the member-view switch and Log out are
  as on main.
- **What he was told about the other tabs:** D558's full row and the spec (§Insights flow, last paragraph) both record
  that the removal also takes the two shortcuts off every other tab and that those users go through a schedule page. The
  row quotes only his "Looks good"; whether that sentence was on his screen I cannot tell from the repo.
- **Top bar order (D348/D349), "the phone board's top bar is ONE row", button sizes (D487):** neither commit touches the
  top bar or the board's bar; the only size change is the phone search box, which now shrinks (max 135px) to make room —
  a box, not a button.

---

## 6. Only the running app can show — and what the walk must do

1. **His iPhone's keyboard arrows** (lead 1): change a take-off, use ‹ › to reach Area time and past it — is the old
   window stored?
2. **Safari / iPad with a keyboard, board:** type a callsign, Tab, press Done, reopen — saved? (The route trusts the
   browser to fire `change` on a scripted blur; `boardTab` in the same file does not trust it and re-fires by hand.)
3. **Lead 3's two exits, lead 5's window, lead 6's jump**, as written above.
4. **The three cases Codex checked only in a mounted test:**
   - *Stale session* — the app has no link between browser tabs (no `storage` listener anywhere in `src`), so signing
     out in a second tab does NOT change the first; the guard can only be met through this tab's own controls, and each
     of those takes the caret out of the box first. So walk the two real ways: type in a week box, then (i) tap the name
     badge to switch to the member view, (ii) Log out from the menu. Expect, each time: the typed text saved once by the
     ordinary blur while he was still an admin, the page leaving Edit Schedule, no error, and after switching back a
     working route. There is nothing further a browser can show for this guard.
   - *Draft preview* — board, a day with a saved plan: put the caret in a live box, open the plan's 👁 look, press Tab
     anywhere on the frozen face (expect the browser's own Tab, nothing saved); "Back to live copy", Tab again (route back).
   - *Middle deletion* — a wave with three In-time / Rally lines: clear the middle one, Tab, type in the line that
     followed, Tab; then Shift+Tab twice. Check the first and last lines hold the right words, two history lines, two
     Undo steps restore all three, a reload keeps it; on the week and on the board.
5. **Where the exit lands by design:** on the week Shift+Tab from the first box lands on that day's first sign-off picker
   (an arrow key there changes who signed); forward it can land on a request's Accept / Undo button. Both are "the next
   ordinary control" as D553/D555 word it — worth his eye once.
6. **The Blue/Red question cannot be reached with the keyboard** from the text run (it never could by Tab; the mouse or a
   tap answers it). Ruled by D551 as built; say so if he asks.

---

## 7. What I did NOT read, and why

- **The evidence archives, pictures and walk drivers** (`…schedule-tab-evidence*.zip`, the index JSONs,
  `scripts/handpass/*`) — builder's proof, not the shipped code; I read the sheet and Astra's R2 report instead.
- **The Tab plan, its r1 and its challenge, Astra's R1 report, the Insights plan / scenarios / challenge / Astra read** —
  skimmed through the sheet's and R2's summaries only; the spec for each was read whole. A defect they already list
  could be repeated above without credit.
- **`interactions.ts` beyond the In-time add/delete and brief-accept handlers, `html.ts` beyond the builders that emit a
  routed box** — the commit does not touch them; I read what the route depends on.
- **`commitInputEdit` in full, `mission-roles.ts`, the command layer** — followed only as far as "one command, one
  history line"; their own correctness belongs to other pieces.
- **Stylesheets** beyond the menu's own rules and the phone toolbar — layout is the walker's job.
- **Real Safari / iOS behaviour** — cannot be read; listed in §6.
- **`npm` anything** — the brief forbids it.
