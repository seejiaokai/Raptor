# [HUMAN-RETEST] the amendment system — walker w2: saved plans, looking at an issued version, "Load onto working copy", the view page (24 Sep 26)

**Walked:** the production build served at `http://localhost:4173` (the `dist/` of 13:58, i.e. the source BEFORE the
host's fix commit `7c69bd58` of 14:29), on the everything week (`docs/handpass/2026-09-24-amendment-week.json`), each
script in its own browser context, at **desktop 1440×900 and phone 390×844**. Admin unless stated; the member runs
signed in as `us`. **No console errors, page errors or failed requests in any run.**
**Scripts** (each an assertion of the right behaviour — re-running one IS the re-walk): `raptor-port/scripts/handpass/am/w2-*.mjs`
(shared helpers `w2-lib.mjs`). **Pictures:** `raptor-port/docs/img/handpass/2026-09-24-amendment/w2/` — 93, every
one looked at (prefix `d-` desktop, `p-` phone).
**Rule ids** are the register's (`docs/superpowers/specs/2026-09-24-amendment-behaviour-register.md`); scenario ids are
Fable's S-numbers with Astra's rank beside them.

`Walk: docs/handpass/parts/2026-09-24-amendment-w2.md · 93 pictures · 6 roll-call rows (R7 R8 R9 R14 R15 R16) + the week head, board strip and plans editor they sit in · 22 scenarios, both orders where the scenario has two · MISSING: 8 findings (3 already fixed in 7c69bd58, not yet re-walked on a fixed build; 5 open) + 2 questions for him`

---

## 1. Findings — every FAIL

Numbered W2-F… so they never collide with the host's F1–F5.

| id | what is wrong, in one line | rule | size | state |
|---|---|---|---|---|
| **W2-F1** | On the **scheduler board**, while you look at an issued version, the plans selector and the version tag disappear (the week keeps them) | AM28 | medium-low | **open** |
| **W2-F2** | A **day template applied to a published day** marks every row as changed even when nothing changed, and un-files the day's accepted inputs | AM20, AM23 | medium | **open** |
| **W2-F3** | **Plan-switch message** says "matches Original — nothing pending" when the plan differs only in who earns OIL | AM23 (Astra 5) | medium | fixed in `7c69bd58` — not re-walked by me |
| **W2-F4** | The **ⓘ day panel's count** disagrees with the day head (OIL-only change: none vs "1 pending"; after a template: 137 vs 51) | AM23 | medium | fixed in `7c69bd58` — not re-walked by me |
| **W2-F5** | An armed **"Discard N edits & load — confirm"** survives a trip to View-only Sched and back | the confirm's own rule (view.ts) | low | fixed in `7c69bd58` — not re-walked by me |
| **W2-F6** | On the **view page's working-draft peek**, a pending puck that also wears a red warning ring shows no pending hint | AM19 / ui-contracts §Amendment marks | low | **open** |
| **W2-F7** | On the **desktop board**, the ALL AVAIL window opened from a preview docks right over the preview bar — "Load onto working copy" hidden, "← Back to live copy" mostly covered | UI (R14 painted-with) | low | **open** |
| **W2-F8** | The **plan editor comes back over View-only Sched** after the admin's View-as-member round trip; its "Select" then does nothing and says nothing | door check (a dead control) | low | **open** |

### W2-F1 — the board loses its plans selector and version tag while you look at an issued version
- **Start:** the everything week, admin, Edit Schedule, desktop (and again at 390px).
- **Steps:** open Monday's scheduler board → in its publish strip tap the white plans selector → "Issued · read-only" → **Original**.
- **Screen says:** the board shows the Original read-only with the bar "👁 Viewing the issued Original — read-only … ← Back to
  live copy · Load onto working copy" — but the whole publish strip is gone: **no plans selector (no amber "👁 Original"), no
  AL1 tag, no pending chip.** To look at AL1 instead you must go back to live first and pick again. The week, at the same
  moment, keeps the amber "👁 Original" selector, the AL1 tag and "1 pending" (d-41 vs d-42; p-47 vs p-48).
- **Register says:** AM28 — "one white button per day whose label is what you are looking at — … or amber '👁 AL2' while
  looking at an issued version"; the selector is shared verbatim by the week head and the board strip (A5).
- **Every time**, both widths (`w2-03-preview.mjs s19` and `s19p`).
- **Where:** `src/ui/board.ts:386-387` — `boardSignHTML(di, pv)` returns `''` when previewing; `src/ui/SchedBoard.tsx:207`
  calls it with `pv=true`. That early return is older than the 15 Sep redesign that moved the selector and the tag into this
  strip. (The sign-off pills belong hidden under a preview; the selector, the tag and the pending chip do not.) The host's
  `7c69bd58` added "Not yet signed" to this same strip but leaves the early return, so this is still open.

### W2-F2 — a day template on a published day counts every row as changed
- **Start:** the everything week, admin, Edit Schedule, desktop.
- **Steps (identity case):** Tuesday (published Original, nothing pending) → **Templates** → "+ Save this day as a template"
  (toast `Saved as "Template 1"`; close the template manager) → Tuesday → **Templates** → **Template 1**.
- **Screen says:** `Applied "Template 1" to Tuesday's working draft — publish AL1 to issue it`; the day reads **"31 pending"**,
  "Not yet signed", the checks read "4 to clear once signed", and the Amendments panel **"Tue · 31 changes · 15 removals · 1
  input filing"** — for a day whose content is exactly what was issued (d-80). Undo puts it back.
- **Second case:** Tuesday's template applied to Monday (published AL1, one pending change) — after the two-pick confirm it reads
  **"51 changes · 32 removals · 3 input filings"** (d-82, p-82): every Monday row counts as removed, every template row as added,
  and Monday's three accepted inputs (the Fly-with, the Meeting, the Appointment) are **taken off the programme** — they appear
  only as "input filings" in the panel.
- **Register says:** AM20 — "a pending mark means differs from what was issued, not was touched"; AM23 — the count is of
  **real** differences. **What it would do:** publish that as the next AL and it claims every row was removed and re-added,
  and members' accepted requests quietly leave the programme.
- **Every time** (`w2-07-template.mjs`).
- **Where:** `src/engine/daytpl.ts:250` (`stripRowIds(nd)` gives every template row a new identity) then `:262`
  (`rebaseDayPending`, whose structural diff in `src/engine/drafts.ts:397-418` is by identity) — every issued row reads as gone
  and every template row as new; `:253` (`reconcileDayFiling`) un-files the day's accepted inputs because the template's rows
  carry no link to them.

### W2-F3 — the plan-switch message miscounts an OIL-only difference (Astra rank 5) — fixed in `7c69bd58`
- **Start:** the everything week, admin, desktop. **Steps:** Saturday → plans selector → "+ Alt Plan" (Plan A = the issued
  Original, Plan B live) → Saturday's board → **OIL Earn** → tap one man's green seat (switched him off) → leave the mode →
  close the board. Head "1 pending", "Not yet signed", "Publish AL1"; panel "Sat · 1 change · what this day earns changed".
  → plans selector → Plan A (toast "…matches Original — nothing pending", right) → plans selector → **Plan B**.
- **Screen says:** `Switched to "Plan B" — this is now the live Saturday · matches Original — nothing pending` — beside "1
  pending" and an offered "Publish AL1" (d-96, d-97). **Register:** AM23, one count everywhere. **Every time.**
- **Where (as walked):** `src/ui/board.ts:1547` counted raw marks (`dayPendCount`); an OIL decision makes none. The host's
  `7c69bd58` switches this message to `dayShownPendCount`. **Re-walk on a fixed build:** `node w2-09-oil-plan-and-filing.mjs a5`.

### W2-F4 — the ⓘ day panel's count disagrees with the head — fixed in `7c69bd58`
- Same start as W2-F3: ⓘ on Saturday says nothing about an unpublished edit while the head says "1 pending". And after
  W2-F2's Monday template, the head says **51 pending**, ⓘ says **137 unpublished edits** (both widths).
- **Where (as walked):** `src/ui/html.ts:1968` (`dp=dayPendCount(di)`, the raw marks). `7c69bd58` uses `dayShownPendCount`.
  **Re-walk:** `w2-09 … a5` and `w2-07-template.mjs`.

### W2-F5 — the armed "Discard N edits & load — confirm" survives a page change — fixed in `7c69bd58`
- **Start:** the everything week. Monday: edit the day note and the first line's area → "3 pending" → plans selector →
  Original → **Load onto working copy** → armed "Discard 3 edits & load — confirm" + "Keep editing" → go to View-only Sched →
  back to Edit Schedule: the preview is still open **and still armed**. The confirm's own rule (the comment in `view.ts`
  above `RESTARM`) is "any navigation cancels it". Low: the armed button still names what it will do.
- **Where (as walked):** `setPage` (`src/state/view.ts:429-499`) did not clear it. `7c69bd58` now clears it there.
  **Re-walk:** `node w2-03-preview.mjs s14`.

### W2-F6 — the view page's pending hint is painted over on a puck that wears a warning ring
- **Start:** the everything week, desktop. Tuesday's board → right-click the first line's WSO seat (clears it) → tap the empty
  seat → pick a man who is busy elsewhere (the walk got **Echo**, who then wears a red "C" ring) → close the board.
- **Screen says:** on Edit Schedule the puck wears the red ring **and** the dotted AL1-cyan pending outline (d-09b). On View-only
  Sched → Tuesday → "Working draft — not issued" it wears **only the red ring — no pending hint** (d-10b). A man without a ring
  shows the thin neutral beige hint correctly (d-10).
- **Register / contract:** AM19 and ui-contracts §Amendment marks — "the view-only page keeps the neutral dashed hint for a
  published day's pending edit". **Every time** (`w2-01b-closeup.mjs`).
- **Where:** `src/ui/scheduler.css:1661` draws the hint as a box-shadow; `:1143` `.puck.boxred{box-shadow:…!important}`
  replaces it. Low: the day's "N pending", "Not yet signed" and the amber stamp still say something is pending.

### W2-F7 — on the desktop board the ALL AVAIL window covers the preview bar
- **Start:** the everything week, desktop 1440×900. Saturday's board → plans selector → Original → tap the **30** chip on FAMILY
  DAY's ALL AVAIL.
- **Screen says:** the window opens docked top-right (`scheduler.css:6095`, right 16px / top 96px) exactly over the board's
  preview bar — **"Load onto working copy" completely hidden, "← Back to live copy" mostly covered** (d-92). It can be dragged
  aside by its grip, which the walk then did. On the week (d-90) and on the phone board (p-92) nothing is covered. **Every
  time.** Low.

### W2-F8 — the plan editor returns over View-only Sched after the View-as-member round trip (Astra rank 30)
- **Start:** the everything week, desktop. Thursday → plans selector → ✎ beside **Plan B** → the plan editor opens. The editor's
  backdrop blocks a click on the role button, but the keyboard reaches it: Tab until "Admin" is focused → Enter.
- **Screen says:** member view — the editor is gone and no plan, publish, unpublish, sign or load door is visible (**right**,
  d-29). Press "Member" again → admin: **the plan editor reappears over View-only Sched** (d-30); its **Select** does nothing and
  shows no message (d-31). Rename and Delete in it would work.
- **Every time.** **Where:** the editor's open state survives the role flip and the page change (`src/ui/DraftsModal.tsx:43`
  only hides it while the role is member); Select calls `switchDraft`, which returns silently off the edit page
  (`src/ui/board.ts:1533-1534`). `7c69bd58` clears the confirm arms on a page change, not the editor. Low.

---

## 2. Questions for him — recorded, not judged

**W2-Q1 (Fable's Q4, S12): after an Unpublish, a STOWED plan's old sign-offs come back valid.**
- Tuesday, both plans signed at the Original → Plan B edited, signed, published as AL1 → **Unpublish** (Plan B live). The live
  plan's sign-offs are cleared (AM34 — right). Switch to the stowed **Plan A**: its four names are **green again** — "Published
  at Original — no changes to publish" (d-61, p-61).
- The variant that makes it matter (`w2-05-unpublish-plans.mjs s12x`, d-65): Plan A carries **its own** change, signed before AL1
  existed → Plan B published as AL1 → Unpublish → switch to Plan A: four green names, "Published at Original · 1 change to
  publish — Publish AL1", and **"Publish AL1" is enabled on signatures given before AL1 went out and was withdrawn**. AM34 says
  an unpublish "clears that day's sign-offs (re-sign to republish)"; AM11 says content put back brings the names back. Which
  wins for a plan that was parked at the time is his call.

**W2-Q2 (AM23): with an input filing pending, one day shows two different counts.** Tuesday with two edits and one input taken
off the day reads **"4 pending"** on the live copy; open the Original's preview and the same chip reads **"3 pending"** (d-98),
because under a preview the chip shows what a load would discard, and a load keeps filings by design (`publish.ts`
`dayDiscardCount`). The load itself is right — "Discard 3 edits & load — confirm", then "3 unpublished edits replaced", and the
filing stays (d-99). AM23 asks for one number everywhere; with a filing pending the head, the confirm and the panel cannot all
agree, so which number the preview chip shows is a question, not a defect.

---

## 3. Scenario by scenario

| scenario | what I drove | expected (rule) | observed | result | pictures desktop / phone |
|---|---|---|---|---|---|
| **Plans menu wording** (brief) | the menu on Mon (AL1 + pending), Thu (Original + plans), Wed (never published), Sun (AL1 unpublished) | published note "This day is published — the issued versions don't change. Switching plans marks the differences as the next AL."; live row "live now — differences from AL1 go out as AL2"; unpublished "live now — this is what publishes"; only issued versions listed, a withdrawn one not (AM28, AM34) | exactly that on all four days; Sun lists only Original (the withdrawn AL1 is not offered); ✎ per plan; "✎ Manage plans" only when plans exist | PASS | d-20 d-21 d-22 / p-20 p-21 p-22 |
| **R7/R8 the view page** (brief) | Mon and Tue issued faces, then "Working draft — not issued"; close-ups at 3× | issued face frozen, tagged, "as issued" picker; working peek labelled (bar, amber stamp, "Not yet signed", "N pending"), pending marks NEUTRAL not AL-coloured (AM5, AM19, AM22, AM24) | issued face: AL1 tag, the issued take-off 12:40 (not the unpublished 07:45), the issued area "EAST · SOUTH" (not "EAST"), solid AL1 mark on the note, no pending, official flags. Working peek: bar "Viewing Working draft — not issued · the issued schedule is AL1", dashed amber "Working draft" stamp, "Not yet signed", "1 pending", live values. **Pending marks: a cell gets a neutral dashed beige box, a puck a thin neutral beige ring, a text cell nothing — never the AL colour** (edit week: dotted AL1 cyan). Seats inert. | PASS, except **W2-F6** | d-02…d-06, d-09, d-09b, d-10, d-10b, d-11 / p-01…p-06 |
| **"← Back to live copy"** (brief) | tapped on the week bar and the board bar, both widths | returns to the live copy on both surfaces (AM28) | both clear the preview; the board's publish strip and Publish AL2 come back | PASS | d-41 d-42 / p-47 p-48 |
| **S4** | phone 390: Mon with Plan B (a 24-letter name), signed, AL1 + 1 pending; every head control measured and pressed at its own centre | nothing clipped or overlapping; tag left of the 4×4; pills wrap; long name clamped with the full name in the tooltip; a tap lands on its own control | all 15 controls inside the screen, uncovered, no overlaps; tag left of 4×4; pills in two rows; name clamped ("WET WEATHER CONTINGE…"), full name in the tooltip; selector → menu, ⓘ → panel, Clear → cleared, **Publish AL2 → AL2** (not Unpublish), **Unpublish → back to AL1, 1 pending**. Sizes recorded: ⓘ 16×16, Clear 38×17, the rest 22–23px tall (no rule; D26 precedent) | PASS | — / p-70 p-71 p-72 p-73 |
| **S11 + Astra 9** | Mon back to AL1 → "+ Alt Plan" → Plan B edited (08:15) and signed → A: look at Original, Load → B → A → B: Load AL1 (two taps, Keep editing, re-arm, Back, re-open) → A → B | each plan keeps its own content and sign-offs; load changes only the live plan; viewers stay on AL1; the two-tap confirm and "Keep editing" (AM6, AM12) | exactly that, both widths: A loads the Original in one tap (toast names "viewers still see AL1"), B keeps 08:15 and its green names, A keeps the Original's note, B's load replaces 1 edit; the view page reads "AL1 — as issued" throughout; the Edit history records the loads and switches. The arm clears on Keep editing / Back / picking another version / a week change | PASS, except **W2-F5** (the arm survives a page change) | d-50 d-51 d-52 / p-50 p-52 p-44 |
| **S12** | Tue: sign, "+ Alt Plan", edit and publish B as AL1; switch; Unpublish with **B live** (A stowed) and, separately, with **A live** | Unpublish → Original current, the live plan's sign-offs cleared, AL1's change pending again on B (AM33, AM34, AM37c); the stowed plan's sign-offs: **record** | as expected in both orders; B's note dotted in AL1's colour, "Publish AL1" locked until signed; the view page reads "Original — as issued" with no trace of AL1. **Recorded:** the stowed Plan A's names come back green — see **W2-Q1** | PASS + Q1 | d-60 d-61 d-65 / p-60 p-61 |
| **S14** | Mon with 3 pending → Original → Load (armed) → narrow the same session to 390 → Keep editing, re-arm, page change, Back, re-open, switch the preview to AL1; then the phone board: arm, measure, confirm | both buttons visible, tappable, not overlapping at 390; the board's bar at the top; the count right (AM6, AM23) | the week's armed bar keeps all three buttons on screen, uncovered, apart; the phone board the same (bar at the top of the board); the count "3" matches the head; the second tap loads, tag stays AL1, the view page stays on AL1 | PASS | d-43 / p-44 p-45 p-46 |
| **S18** | Tue at Original, nothing pending → Original → Load; Mon at AL1 (after discarding) → AL1 → Load | "… is already at …", the preview closes, no undo step (AM6) | "Tuesday is already at Original" / "Monday is already at AL1", preview closed, the undo button unchanged, nothing in the book changed | PASS | d-40 / p-40 |
| **S19** (+ Astra 37) | Mon signed live, then the Original's preview on the week and on the board; tap / right-click / drag / type at it; the Amendments panel | every write door dead; Publish AL hidden and the panel's button locked; no flags on a past version (AM25, AM28, AM37c, AM51c) | week: no Publish AL, Unpublish, sign strip, Templates, seat, drop zone or editable text; board: Templates and Sort all disabled, no sign strip, no live field; seat taps and right-clicks inert, a palette drag onto a frozen seat changes nothing, typing changes nothing; the panel's "Publish AL2" is **locked** with "Return to the live copy of Mon before publishing — you're viewing a past version"; no warnings list and no flag rings (the live day has 2 lists / 18 rings); "+ Alt Plan" from the menu drops the preview | PASS, except **W2-F1** | d-41 d-42 / p-47 p-48 |
| **S24** | View page: look at Wed Plan A → Edit → rename it "Dry option" → view page → look at it → Edit → delete down to one → view page (both widths) | the new name everywhere, no stale preview; down to one → "Live working copy" and no plans picker for viewers (AM29, AM31) | exactly that; entering Edit drops the view page's plan preview by design (no stale "Switch" bar) | PASS (literal form not reachable — §7) | d-27 d-28 / p-27 p-28 |
| **S25** | save Tue as a template; apply it to Tue (identity); apply it to Mon (AL1 + pending): first pick, page change, pick, pick | first pick arms with the right words; a navigation re-arms; the confirming pick applies; the pending count = real differences from the issued version (AM20, AM23) | the confirm is right (arms, re-arms after a page change, applies on the confirming pick, Undo restores exactly) — **but the counts are not: W2-F2** (31 pending on unchanged content; 51 on Mon with 32 removals and 3 input filings) and **W2-F4** (ⓘ 137 vs head 51) | FAIL | d-80 d-81 d-82 / p-81 p-82 |
| **S30** | Thu (Original, Plan A live, Plan B) → Unpublish → the menu → the view page (admin and member) → Plan B's preview → sign + Publish day | DRAFT; the view page's plans picker returns for viewers; Publish day → the Original again (AM31, AM33, AM37c) | DRAFT, "Publish day" locked until signed, the menu loses its published note and issued rows; the view page shows "Plan A ●, Plan B" for the admin **and a member**; Plan B's preview reads "Viewing plan Plan B — read-only", DRAFT; republished as **ORIG** (same label), plans hidden again | PASS | d-62 d-63 / p-62 p-63 |
| **S37** | a member at 390 on the view page, Monday | the issued/working picker reachable, clear of the badge (AM5, AM31) | picker on screen, uncovered, no overlap; "Working draft — not issued" labelled with "Not yet signed" and "1 pending"; no write door | PASS | — / p-74 p-75 |
| **S38** | the ALL AVAIL window opened from: the week's Original preview, the board's Original preview, the view page's issued face, the view page's Plan A preview; then Back, Unpublish, a page change, a plan switch | the window closes when its version goes, and on a page change (D66) | opened on the right version each time (its footer "who was free when this day was issued — Original"); **closes on Unpublish** (week and board, both widths, two taps with the OIL heads-up); a page change closes it first everywhere else | PASS, except **W2-F7** | d-90…d-95 / p-90…p-94 |
| **Astra 5** | see W2-F3 | the switch message agrees with the head (AM23) | "matches Original — nothing pending" beside "1 pending" | FAIL (**W2-F3**, **W2-F4**) | d-96 d-97 |
| **Astra 9** | folded into S11 (both orders, distinct plan contents) | only the live plan changes; the viewer stays on AL1 | as expected | PASS | d-50 d-52 / p-50 p-52 |
| **Astra 23** | Wed: sign B (names X), switch, sign A (names Y), back and forth ×4; edit A and put it back | each plan restores its own four names; a revert brings names back (AM11, AM12) | exactly that; B untouched throughout | PASS | d-64 |
| **Astra 24** | Fri: "+ Alt Plan" ×2 → A/B/C; sign C; rename B; a duplicate, a blank and a 40-letter name; delete the live one; delete down to one; Undo | names checked with a reason; live plan undeletable; down to one → "Live working copy"; the survivor keeps its sign-offs (AM29) | exactly that, both widths ("Another plan on this day already has that name", "A plan needs a name", capped at 24, Delete disabled "switch to another plan first", the empty editor, "Signed — this day can be published" kept, Undo brings the plan back) | PASS | d-23…d-26 / p-23…p-26 |
| **Astra 27** | Tue: 2 content edits + an accepted input taken off → Original → Load (two taps) | the confirm counts only the content it discards; the filing stays | head 4, confirm "Discard 3 edits", toast "3 unpublished edits replaced", afterwards "1 pending · 1 input filing" and the input still off the day | PASS + **W2-Q2** | d-98 d-99 |
| **Astra 29** | Wed's Plan A preview on the view page | never looks published | DRAFT tag, "Draft" stamp, no ORIG/AL tag, no flags | PASS | d-08 d-63 / p-08 p-63 |
| **Astra 30** | see W2-F8 | the member flip removes every writer | removed (right); the admin flip back brings the editor back with a dead Select | PASS for the member, **W2-F8** after | d-29 d-30 d-31 |
| **Astra 37** | the Original's preview (week, board) and a plan preview (view page) | no newly computed flags on a read-only version (AM51c) | none on either (the live days show theirs) | PASS | d-41 d-08 / p-47 p-08 |

---

## 4. The roll-call rows

| # | place | SHOWS | ACT | PAINTED WITH | walked |
|---|---|---|---|---|---|
| **R7** | View-only week — a published day's issued face | the frozen issued content (class `issued`), the version tag (ORIG grey / AL1 cyan …), the picker "`<version>` — as issued" (default) + "Working draft — not issued", the issued solid AL marks, the **official** warnings of the issued version (Mon: 14 issues vs 17 on the working copy), the ALL AVAIL count chip. **No** pending chip, pending mark, "Not yet signed" or unpublished value | pick "Working draft — not issued"; ⓘ; tap a puck (selection only); the count chip opens the window on the issued version. No write door (0 found; seats inert) | the official warnings box and flag rings over the frozen content; the tag, 4×4 badge and picker share the head row (no overlap at 390, S37) | w2-01, w2-06 S37, w2-08 S38-C — d-02 d-11 d-94 / p-02 p-74 p-94 |
| **R8** | View-only week — the working-draft peek | bar "Viewing Working draft — not issued · the issued schedule is `<version>`", the dashed amber "Working draft" stamp, "Not yet signed", "N pending", the tag, the live content and live warnings; pending marks **neutral** (cells dashed beige, pucks a thin beige ring, text none); issued marks solid | pick back "as issued"; nothing else (seats keep their address but a tap arms nothing and a right-click clears nothing) | **a pending puck that wears a warning ring loses its hint (W2-F6)**; at 390 the stamp wraps to its own line, the bar to two lines — tidy | w2-01, w2-01b, w2-06 — d-03…d-06 d-09…d-10b / p-03…p-06 p-75 |
| **R9** | View-only week — an unpublished day with plans | the plans-only picker ("Plan A", "Plan B ●"), DRAFT tag, "Draft" stamp, the draft's own "N pending" chip; a published day with plans shows only the issued/working picker; after the Original is unpublished (S30) the plans picker returns, for a member too | pick a plan (→ R15) or "Plan B ●" (back to live) | the picker shares the head row with DRAFT, 4×4, ⓘ and "Draft" — no overlap at either width. Note: a viewer sees "1 pending" on a draft day with scheduler wording in its tooltip (§6) | w2-01, w2-05 S30, w2-02 S24 — d-07 d-28 d-63 / p-07 p-28 p-63 |
| **R14** | A preview of an issued version (week + board) | **week:** the frozen version, the bar in the version's colour ("👁 Viewing the issued `<version>` — read-only. This is what was sent out; it never changes."), "← Back to live copy", "Load onto working copy" / armed "Discard N edits & load — confirm" + "Keep editing"; the amber "👁 `<version>`" selector; the tag still names the live version; "N pending" = what a load would discard; no flags. **board:** the same bar where the live checks sit and the frozen board — **but no plans selector, no tag, no pending chip (W2-F1)** | Back (both surfaces), Load (one tap / two-tap), Keep editing, "+ Alt Plan" from the menu (drops the preview); every write door dead on both surfaces, the Amendments panel's Publish locked with its reason | **desktop board: the ALL AVAIL window covers the bar (W2-F7)**; on a previewed day the date opens the ⓘ panel instead of the board (§6); **W2-Q2** (the chip's number under a preview) | w2-03, w2-04, w2-08, w2-09 — d-40…d-43 d-52 d-92 d-98 / p-40 p-44…p-48 p-52 p-92 |
| **R15** | A preview of a plan (view page) | bar "👁 Viewing plan `<name>` — read-only" (no Switch button, no Back button — the picker is the way back), DRAFT tag, "Draft" stamp, the plan's content, no warnings list, no flag rings; its count chip opens the window "who is free as things stand now — Plan A" | the picker only | nothing overlaps at either width; entering Edit Schedule drops it by design | w2-01, w2-05 S30, w2-02 S24, w2-08 S38-D — d-08 d-27 d-63 d-95 / p-08 p-27 p-63 |
| **R16** | The plans menu and the plan editor | **menu:** "Plans — `<Day>`", the published note, the editable copies (live ●, its caption naming the next AL), others "tap to make it the live day", ✎ each, "Issued · read-only" versions (withdrawn ones absent), "+ Alt Plan", "✎ Manage plans". **editor:** a tab per plan (● live), the name box (24 max), a note whose wording follows publish state, Delete plan (disabled on the live plan, with its reason), Select, Done; the empty state after the collapse | switch (toast with the difference count — **wrong for an OIL-only difference, W2-F3**), look, "+ Alt Plan", rename (duplicate / blank refused with reasons), delete (down to one → "Live working copy"), Undo of a delete | the menu drops over the head/strip (full width on a phone); the editor covers the top bar (the keyboard still reaches the role button behind it); **the editor returns after a View-as-member round trip with a dead Select (W2-F8)** | w2-02, w2-04, w2-05, w2-06, w2-09 — d-20…d-26 d-29…d-31 / p-20…p-26 p-71 |

---

## 5. Explicit negatives — checked and right

- The issued face never shows an unpublished value, a pending mark, a pending chip or "Not yet signed" (Mon take-off 12:40 not 07:45, Tue area "EAST · SOUTH" not "EAST"), at both widths, for an admin and a member.
- The working peek is always labelled (bar + stamp + "Not yet signed" + count) and has no live write door; its pending marks never take the AL colour.
- The plans picker exists only on unpublished days; a published day's plans are hidden from viewers; unpublishing the Original brings the picker back, for a member too; republishing reissues the **Original** label.
- A plan preview never wears published clothes and shows no flags (Astra 29/37).
- Under an issued preview, no write door works on the week or the board, by tap, right-click, drag or typing; the panel's Publish is locked with its reason; Publish AL and Unpublish are absent.
- "← Back to live copy" works on both surfaces at both widths; "+ Alt Plan" from a preview drops the preview.
- "Load onto working copy": one tap when there is nothing to discard; two taps otherwise; "Keep editing" cancels; the arm clears on Back, on picking another version and on a week change; the confirm's number equals the head's; the viewer keeps the issued version; the Edit history records every load and switch; loading the current version with nothing to discard changes nothing and adds no undo step.
- Plans: each keeps its own content and its own four sign-offs across switches and loads in both orders (S11, Astra 9, 23); the lifecycle's refusals all give a reason (Astra 24); the survivor of a collapse keeps its sign-offs; Undo restores a deleted plan.
- Unpublish with plans (both orders) brings the version under back, clears the live plan's sign-offs and re-opens the withdrawn change as pending; the view page shows no trace of the withdrawn AL (AM35).
- The phone head with everything lit (S4): 15 controls, none clipped, covered or overlapping; each press lands on its own control.
- The ALL AVAIL window names the version it was opened on and closes when that version is unpublished, on the week and the board, at both widths.
- The template confirm: first pick arms with the right sentence, a page change re-arms, Undo restores the day exactly.
- No console error in any run.

---

## 6. Observations — not findings of mine, passed on

- **For the host's helpers:** `am-lib.mjs`'s `toastText` looked for `.toast`/`#toast`; the app's toast is `#toastEl` (the host has since fixed it). `w2-lib.mjs` `installToasts` records every toast with an observer.
- **R12 (Edit history, another walker's row):** the longest line ("… · 1 unpublished edit replaced") runs past the dialog's right edge and is cut (d-51).
- **S5 (another walker's):** on the served build the phone board strip shows no "Not yet signed" (p-46) — the host's `7c69bd58` adds it.
- **R9 wording:** a viewer (member too, d-29) sees "1 pending" on a never-published day; its tooltip says "publish the day before publishing an AL" — scheduler words on the view page. Not in the register; raise only if he cares.
- **Under a preview a day's date opens the ⓘ panel, not the board**, so the board cannot be opened on a previewed day from the week (go back to live first). By design as far as I can tell.
- **Unpublish shows no toast** (the tag changing is the only feedback); the OIL heads-up toast does show when credits are bid against.
- **CSS inference, NOT walked (for the R3/R5 walker):** on the edit surfaces a pending puck's dotted outline has a stronger selector than the outline-drawn warning rings (`.puck.boxdash`, `.puck.boxdot`), so a pending puck with a sanctioned-late (dashed) or trace (dotted) ring may lose that ring. The solid red ring (a shadow) survives, as d-09b shows.
- **Phone tap targets** on the day head: ⓘ 16×16px, Clear 38×17px (recorded; the owner ruled small OIL-mode targets fine, D26).
- **Focus is not held inside the plan editor** — the keyboard reaches the top bar behind it (that is how Astra 30's flip was reached).

---

## 7. Not walked, and why

- **S24 as literally written** ("rename / delete while the view page looks at the plan"): not reachable. The editor lives on Edit Schedule; entering that page drops the view page's plan preview by design (`view.ts` `setPage`); the view page has no Undo. Walked instead: rename and delete, then back to the view page (both widths).
- **S38's plan half as literally written** ("opened from a plan preview → switch to that plan with the window open"): not reachable — switching plans is on Edit Schedule and the page change closes the window first (D66). Walked: open from the plan preview, pick the live plan on the view page (the window stays — its plan still exists), go to Edit (closes), switch (no window).
- **The money:** Saturday's unpublish in S38 withdraws its OIL; the Leave War cells were not read — not in my list (S7/S8 belong to other walkers).
- **A re-walk of W2-F3/F4/F5 on a fixed build:** the shared server still serves the 13:58 build; my saved world is tied to port 4173, so my scripts cannot load it on the host's other port without re-saving the fixture there. The scripts named above are the re-walk once a fixed build is served.
- **A real iPhone:** everything above ran in Chromium at 390×844. The sign-off pills are invisible dropdowns stretched over each pill so a tap on the label opens them in iPhone Safari — only a real device proves that; it belongs on his look card.

---

## 8. Re-running

From `raptor-port/scripts/handpass/am/` with the build served on 4173: `node w2-01-view.mjs`, `node w2-01b-closeup.mjs`,
`node w2-02-plans.mjs [menu|life|s24|a30] [desktop|phone]`, `node w2-03-preview.mjs [s18|s19|s19p|s14]`,
`node w2-04-plans-load.mjs`, `node w2-05-unpublish-plans.mjs [s12|s12x|s30|a23] [phone]`, `node w2-06-phone-head.mjs [s4|s37]`,
`node w2-07-template.mjs`, `node w2-08-availwin.mjs [week|board|view|plan] [desktop|phone]`,
`node w2-09-oil-plan-and-filing.mjs [a5|a27]`. Each prints PASS / FAIL per check and exits non-zero on a FAIL.
