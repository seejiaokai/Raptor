# [HUMAN-RETEST] the amendment system — walker w3 (24 Sep 26)

**Subject:** Unpublish, undo / redo across a publish, the lifecycle boundaries (reload, week change, sign-out /
sign-in, the admin's "View as member" flip, resize) and the two roles. Fable S13, S16, S17, S20, S21, S23, S29, S35,
S39; Astra ranks 7, 14, 25, 26, 31, 32, 33 (added by the host mid-walk). Roll-call rows R7, R8, R12, R13, R20.

**The bundle walked:** the shared production build at `http://localhost:4173`, built 24 Sep 26 13:58
(`assets/index-BqXG0LAY.js`). It is OLDER than the host's fix commits `7c69bd58` (14:29) and `dd469b4d` (15:01) —
see F-w3-3 and §6. **World:** the everything week (`docs/handpass/2026-09-24-amendment-week.json`), a fresh browser
context per script (and per case where a clean world matters). **Widths:** desktop 1440×900 and phone 390×844,
every script both. **Errors:** no console error, page error or failed request in any run.

**Scripts** (`raptor-port/scripts/handpass/am/`, each prints PASS/FAIL per check, so re-running it IS the re-walk;
`node <script> [desktop|phone]`, both widths when no argument):

| script | covers |
|---|---|
| `w3-lib.mjs` | helpers: toast capture (every message, repeats included), sign-out/sign-in, the View-as flip, Undo/Redo on whichever surface shows, view-page reads, week change, Leave War reads/pictures |
| `w3-01-reload-week.mjs` | S13 steps 1–2 + Astra 14 (reload, week change), Astra 32 (weekday), AM39b snap |
| `w3-02-roles.mjs` | S13 steps 3–5, S20, Astra 14/25/33, D148 evidence, AM32 (Unpublish after a sign-out), resize |
| `w3-03-viewer.mjs` | S20 cell level, Astra 26, S21, S29, S39 |
| `w3-04-undo-publish.mjs` | S16 (the board's Undo/Redo) + its money, S17, Astra 7 (both routes) |
| `w3-05-undo-traps.mjs` | the two Undo traps found in S16/S17, each in the fewest taps (F-w3-1, F-w3-2) |
| `w3-06-quals.mjs` | S23 (a draft day and an amendment) |
| `w3-07-history.mjs` | S35 |
| `w3-08-peel.mjs` | Astra 31 (peel AL2 → AL1 → Original), Astra 32 (weekend) |
| `w3-00*-probe*.mjs` | read-only probes used to plan the walk (not part of the re-walk) |

**Pictures:** `raptor-port/docs/img/handpass/2026-09-24-amendment/w3/` — 117 walk pictures (`w3-0N-<width>-…`), every one
opened and looked at; plus 7 probe pictures (`probe-…`). **Source line numbers** in this report are from the working
tree as it stood at ~15:20 on 24 Sep 26 (after the host's commits `7c69bd58` and `dd469b4d`).

**Final run** (all scripts, both widths, after the last script edit): w3-01 35/1 · 35/1 · w3-02 20/3 · 20/3 ·
w3-03 26/0 · 23/0 · w3-04 25/0 · 25/0 · w3-05 5/3 · 5/3 · w3-06 10/1 · 10/1 · w3-07 8/1 · 8/1 · w3-08 16/0 · 16/0
(pass/fail, desktop · phone).

---

## 1. The findings (every FAIL, one line)

| id | what the screen does | against | sev. | both widths | status |
|---|---|---|---|---|---|
| **F-w3-1** | After Undo takes a publish back (sign-offs cleared, as the rules say), the NEXT Undo — "Undid: a sign-off" — puts the pre-publish sign-offs back: 3 of 4 on the same day; **all 4 on a different day**, whose "Publish day" then works with nobody re-signing | AM34, AM32, AM39c; global-undo design GU5-005 | high | yes | new |
| **F-w3-2** | Redo gets stuck: enabled, titled "Redo — a sign-off", and every press says "An earlier undone change touches the same thing — redo that first." — which no control can do | AM39b | medium | yes | new |
| **F-w3-3** | An armed "Withdraw — confirm" survives a page change (Edit → Inputs → Edit) and the View-as-member flip; after the flip ONE tap withdrew Saturday's OIL credits with no fresh warning | Astra 33, Fable 5-8; AM37 | medium (money) | yes | **fixed in source by `7c69bd58`, not in the walked build — re-walk `w3-02`** |
| **F-w3-4** | The Edit history footnote says "It clears when you reload or log out — the schedule does the same." The schedule does NOT clear (proved: reload and sign-out keep every version, pending change, sign-off, plan and bid) | AM49; the persistence facts in `raptor-port/CLAUDE.md` | low | yes | new |
| **F-w3-5** | Edit history sentence lines are cut off at the right edge — phone 2 of 4 lines, desktop 1 — losing the part that matters ("…viewers still see AL1 un…", "…1 difference from Ori…") | AM49 (R12) | low–medium | yes | new |
| **F-w3-6** | A signer's SCHEDULER tick withdrawn on Quals: the week shows four GREEN names and just "1 to sign"; nothing on the week says which role is short (the board says "1 to sign · SKED CK"; the desktop week only in the locked button's hover text; a phone has no hover) | AM15b (correct behaviour must not read as a bug), AM15 | low | yes | new |
| (known) | The next-week peek on the view page shows a PUBLISHED next Monday's unpublished working edit, unlabelled, to a member — while next week's own page shows the issued Original | AM5 | — | desktop only (no peek on a phone) | **already filed `[FLAG-EXPORT]` ("label the next-week peek working-vs-signed") — not re-filed** |

---

## 2. Per scenario — setup, steps, expected / observed / verdict, pictures

### S13 + Astra 14 — the lifecycle boundaries (`w3-01`, `w3-02`)

**Setup (both widths), through the app's own controls:** Monday AL1 + one pending change (fixture) + PARTIAL
sign-offs (CUR CK Ace, SKED CK Anvil → "2 to sign"); Tuesday's Original pulled back with ONE tap (Astra 32 —
weekday, no OIL) → DRAFT, then corrected (day note → "TUE CORRECTED NOTE"); Thursday's issued Original PREVIEWED
(plans menu → "Original · read-only"; the selector reads "👁 Original"); a Leave War OIL bid for Saber on Tue 21 Jul
(spends his Saturday credit) → Saturday's Unpublish tapped ONCE → amber "Withdraw — confirm" + toast "Heads up —
Saturday's OIL credits are bid against on the Leave War. Unpublishing withdraws them until you republish. Tap again
to confirm." (AM37 PASS); view page Monday on "Working draft — not issued" (labelled, AM5 PASS).
Pictures: `w3-01-{desktop,phone}-a-thu-preview`, `-b-sat-armed`, `-c-view-mon-working`, `-d-history-before-reload`.

| boundary | expected | observed | verdict |
|---|---|---|---|
| **Reload** | durable survives; transient clears | Monday AL1 + "1 pending" + "2 to sign" (Ace, Anvil); Tuesday DRAFT with its correction and still "correcting" its Original; Wed on Plan B, Thu on Plan A; the Leave War bid kept — ALL survived. Thu's preview, Sat's arm, the Working choice, the Edit history ("No changes yet") and Undo (disabled) — ALL cleared. Lands on View-only Sched | PASS (AM4/AM11/AM12/AM29; Astra 14) |
| Tuesday republished after the reload | same label (AM33) | "Publish day" → **ORIG** (not AL1); ⓘ "No amendment has touched this day yet"; correction flag closed; view "Original — as issued" with the correction | PASS (AM33, AM35) — `w3-01-*-g-tue-dayinfo-after-reissue`, `-h-view-tue-reissued` |
| **Week change and back** | model kept; transient cleared; Undo kept | Monday/Tuesday unchanged; Thu preview, Sat arm and the Working choice cleared; Undo still "Undo — publishing a day" | PASS — `w3-01-*-i-next-week` |
| Undo pressed on the OTHER week | takes you to the change (AM39b) | loads the week of Jul 13, Tuesday back to DRAFT, bubble "Undid: publishing a day"; Redo → ORIG, sign-offs still "4 to sign", "Redid: publishing a day" | PASS (AM39, AM39b, AM39c) — `w3-01-*-j-undo-snapped-tue` |
| **Sign out → the member** | issued face, no writers | lands on View-only Sched, no Edit tab, no Unpublish/Publish/sign-off/plans menu anywhere (0 writers); Monday "AL1 — as issued" | PASS (AM17, AM5) — `w3-02-*-a-member-mon-issued` |
| **Sign back in as admin** | durable kept | every day as before; Undo still offers "Undo — publishing a day" (D148 NOT BUILT — §5) | PASS / recorded |
| **View as member** with a preview open and Saturday armed | lands on View-only; nothing writable | lands on View-only Sched, badge Member, no Edit tab; Monday's issued face by default, 0 writers | PASS (Astra 25) — `w3-02-*-f-viewas-member-mon` |
| … and back to admin | Thursday's preview: survives by design (Fable "fine") | still "👁 Original" (across a plain page change it was not read separately) | recorded |
| … Saturday's arm | cancelled by the navigation (Astra 33; the code's own doctrine "cleared by any navigation") | **still "Withdraw — confirm"; ONE tap withdrew Saturday** (Saber, Piston, Ridge, Basher, Reaper, Anvil emptied on the Leave War) with no fresh warning | **FAIL → F-w3-3** — `w3-02-*-g-sat-after-flip` |
| **Resize** desktop → phone → desktop (and back the other way) | nothing changes | every day's tag, plan, pending count, sign line, preview and buttons identical before / at the other width / after | PASS (Astra 14) — `w3-02-*-i-after-resize` |

### S16 — Publish day → Undo → Redo on the phone board (and the desktop board) (`w3-04` world 1–2)

Friday (a draft) on the scheduler board: sign all four → "Publish day" → ORIG, toast "Friday published — APPROVED".
The board's own Undo (`#sbUndo`, titled "Undo — publishing a day") → **DRAFT** (dashed), sign-offs blank ("4 to sign"),
"Publish day" locked, bubble "Undid: publishing a day". Redo → **ORIG**, sign-offs STILL blank, "Redid: publishing a
day". PASS (AM39, AM39c) at both widths — `w3-04-*-a-board-fri-published`, `-b-…-after-undo`, `-c-…-after-redo`.
Walking on back with Undo: "Undid: a sign-off" ×4 → but the FIRST of those shows **"1 to sign · APPROVED BY" — three
names came back** (→ F-w3-1). `w3-04-*-d-board-fri-walked-back`.

**The money (Saturday, on the board):** the fixture Saturday is already bid against, so Unpublish took its two taps
(warning, then confirm). Leave War after each step — start FO*/HO* · Unpublish → all empty · sign + Publish day →
back · board Undo ("Undid: publishing a day", Saturday DRAFT) → empty · Redo ("Redid: publishing a day", ORIG) → back.
PASS (AM46, AM39, AM39c) both widths — `w3-04-*-e1-lw-sat-after-unpublish`, `-e2-…-after-undo-of-publish`,
`-e3-…-after-redo`.

### S17 — the order the one timeline walks (`w3-04` world 3, clean world)

Tuesday: edit A (day note) → sign ×4 → Publish AL1 → edit B (programme item). Undo ×8:
1 "Undid: a note on the schedule" (B) · 2 "Undid: publishing an amendment" → ORIG, 1 pending, "Publish AL1", sign-offs
cleared (= Unpublish, AM39) · 3 "Undid: a sign-off" → **"1 to sign" — three signatures back (F-w3-1)** · 4–6 "Undid: a
sign-off" → 2, 3, 4 to sign · 7 "Undid: a note on the schedule" (A) · 8 Undo disabled. Redo walks it back up in exact
reverse and lands AL1 with B pending ("Publish AL2"). Variant: Unpublish AL1 → then Undo → "Undid: taking a published day
back" → AL1 again (not an older edit). PASS for the order (AM39). **The refusal "…published after that change…" never
appeared**: a plain Undo walk always takes the publish back first, so it never needs to reach behind it (its wording
fix in `dd469b4d` could not be seen on screen). `w3-04-*-f-s17-after-walk`.

### S20 + Astra 25 — the viewer's frozen issued face vs the working-draft peek (`w3-02`, `w3-03`)

As the member (sign-out → us/us) AND as the admin viewing as member, both widths: Monday opens on **"AL1 — as issued"**
— no pending chip, no "Not yet signed", no dotted mark, 0 writers; the changed flying line shows the issued times
(VL BFM 10:20 / 12:40 / 14:05). "Working draft — not issued" → amber dashed bar "Viewing Working draft — not issued ·
the issued schedule is AL1", "Working draft" stamp, "1 pending", "Not yet signed", the line shows the working times
(05:25 / 07:45) with a neutral hint (title "Edited — goes out as AL2"). Back to "as issued" → frozen again. The member
also sees the admin's just-published Friday as "Original — as issued". PASS (AM4, AM5, AM19, AM24, AM51e).
Pictures: `w3-02-*-a/b`, `w3-03-*-a2-view-working-row-closeup` vs `-b2-view-issued-row-closeup`.

### Astra 26 — the viewer's Working choice across leaving the page (`w3-03`)

Chosen Working → Inputs → back: still Working, still clearly labelled (stamp + bar) — allowed by Astra 26. It does NOT
leak onto the edit week or the board strip (no "Working draft" stamp there; `w3-03-*-c-board-mon-while-viewer-on-working`).
The next person after a sign-out starts on "AL1 — as issued". Cleared by reload and week change (w3-01). PASS.

### S21 — after Unpublish AL1 (`w3-03`)

Monday (AL1 + a pending time change): Unpublish, one tap → **ORIG**, "2 pending" (AL1's note re-opened + the time),
"Publish AL1", sign-offs cleared. ⓘ (edit and view page): "✓ Published — APPROVED · 2 unpublished edits · No
amendment has touched this day yet". Amendments panel: "Mon · 2 changes · Publish AL1", no AL1 tag. View page:
"Original — as issued", tag ORIG, the Original's note ("EP: ENGINE FIRE ON TAKE OFF"), no AL1 mark. PASS (AM34,
AM35, AM37c). `w3-03-*-d-edit-mon-after-unpublish`, `-e-…dayinfo…`, `-f-view-mon-original-after-unpublish`, `-g-…`.

### S29 — the quiet correction round trip (`w3-03`)

Fix (note → "MON NOTE — AL1 CORRECTED") → sign → "**Publish AL1**" → toast "Published AL1 · 2 items on Mon only ·
approved by Anvil · 1 day with changes still held" → tag AL1; the book has ONE Monday AL1; the pulled-back AL1 kept in
the retired log (AM4); panel "AL1 Mon · 2 items · appr Anvil" once (desktop); ⓘ "AL1 2 items" once; view "AL1 — as
issued" carrying the correction. PASS (AM33, AM3, AM4, AM35). `w3-03-desktop-h-panel-after-correction`,
`w3-03-*-i-…`, `-j-view-mon-al1-corrected`.

### S23 — withdraw a signer's SCHEDULER tick after he signed (`w3-06`)

Friday signed CUR CK Ace · SKED CK Anvil · PLANNED BY Basher · APPROVED BY Bolt ("Signed — this day can be
published"). Quals → Enable editing → Anvil's SCHEDULER tick off → Save changes. Friday: Anvil still shown on SKED CK
(and still offered), "1 to sign", "Publish day" locked ("Sign off SKED CK before publishing Friday"); tick back → signed
again. The same on Monday's amendment ("Publish AL2" locks and unlocks). PASS (AM16). **But** all four pills stay green
and the week's line names no role — F-w3-6. Pictures: `w3-06-*-a-quals-sked-signer-untick`, `-b-fri-after-withdrawal`,
`-g-board-fri-after-withdrawal` (the board: "1 to sign · SKED CK").

### S35 — History after the whole walk (`w3-07`)

Session: Publish day (Fri) · edit + Publish AL1 (Tue) · Unpublish (Tue) · preview Original → "Load onto working copy"
(two taps; Mon had a pending change) · switch Thursday to Plan B · "+ Alt Plan" on Friday · Undo + Redo.
The Edit history then lists 4 lines: the day-note edit (before → after, "Admin · 24/9 15:09"); "Monday: Original loaded
onto the working copy — viewers still see AL1 until you publish · 1 unpublished edit replaced"; "Switched to "Plan B" —
this is now the live Thursday · 1 difference from Original pending"; "Plan "Plan B" created — a copy of the day as it
stood". **No line for Publish day, Publish AL1, Unpublish or Undo/Redo** (Unpublish silent by AM35; the others by the
list's design — recorded). Mark titles: issued "Changed at AL1", pending "Edited — goes out as AL1 / AL2" (PASS).
The board's History bubble on Tuesday's note (hover desktop / tap phone): "DAY NOTE · ORDERS: FLYING ORDERS SECTION 3
→ S35 TUESDAY CHANGE · Admin · 24/9 15:09" (PASS, AM49). Sentence lines clipped → F-w3-5; the footnote → F-w3-4.
`w3-07-*-a-edit-history`, `-b-board-history-bubble`.

### S39 — the next-week peek on the view page (`w3-03`)

Admin: next Monday (20 Jul) signed + published (ORIG), then its note edited ("NEXT MON WORKING EDIT", 1 pending). Back
on Jul 13, view page, desktop: the peek ("NEXT WEEK — CLICK A DAY TO LOAD IT", dimmed) shows **the working edit**, no
version tag, no label — to the admin and to a member (`w3-03-desktop-k-view-peek-admin`, `-l-view-peek-member`).
Next week's own page shows the member "Original — as issued" without the edit (PASS, AM5). Phone: no peek drawn (by
design). Known — `[FLAG-EXPORT]`; not re-filed.

### Astra 7 — Unpublish-then-Undo vs Undo of the publish (`w3-04`, two fresh worlds)

Tuesday: note edit → sign → Publish AL1 (view "AL1 — as issued"). **Route A:** Unpublish → "ORIG | 1 pending | 4 to
sign | Publish AL1", the note dotted to go out as AL1, view "Original — as issued"; Undo ("Undid: taking a published
day back") → AL1 and "AL1 — as issued"; Redo → back to the unpublished state; sign → Publish → **AL1**. **Route B:**
Undo ("Undid: publishing an amendment") → the SAME screen as route A's Unpublish (identical head, identical mark,
viewer back on the Original); sign → Publish → **AL1**. PASS both widths (AM32, AM33). The book differs where no screen
reads it (§5, register Q6). `w3-04-*-g-astra7-A-unpublish-after`, `-g-astra7-B-undo-after`.

### Astra 31 — only the latest can be withdrawn; the peel (`w3-08`)

Monday signed → Publish AL2 (Original, AL1, AL2). Looking at AL1 (plans menu → "AL1 · read-only"): no Unpublish on the
day (an older version cannot be targeted). Unpublish → AL1 current, AL2's change pending as AL2, the button now "pull AL1
back", ⓘ lists AL1 only, view "AL1 — as issued" · Unpublish → ORIG, 2 pending as AL1, ⓘ "No amendment…", view
"Original — as issued" · Unpublish → DRAFT, "Publish day", no Unpublish, the view page shows a draft (no "as issued"
choice). At no step did the tag name a version the ⓘ list lacked. PASS (AM34, AM37c, AM3) both widths.
`w3-08-*-a-looking-at-al1-no-unpublish`, `-b/c/d-after-peeling-…`.

### Astra 32 — Unpublish with no OIL clash is ONE tap (`w3-01`, `w3-08`)

Tuesday (weekday) and Sunday (weekend; Dash's FO* credit not spent by anyone): one tap, no warning, straight to the
previous version; Sunday's FO* left the Leave War with it. PASS (AM37, AM46).

### Astra 33 — Unpublish with an OIL clash (`w3-01`, `w3-02`)

First tap arms + warns (PASS). A preview (of ANY day) and back → arm cancelled (PASS). Week change → cancelled (PASS).
Reload → cancelled (PASS). **Page change (Edit → Inputs → Edit) → still armed; View-as flip and back → still armed,
and the next single tap withdrew** — FAIL → F-w3-3 (fixed in source since; see §6).

---

## 3. Findings in full

### F-w3-1 — Undo brings back the sign-offs an undone publish cleared (HIGH)

**Start:** the everything week, admin, Edit Schedule, either width. **Steps (CASE S2, `w3-05`):**
1. Friday: sign all four (Ace · Anvil · Anvil · Anvil). 2. Saturday: sign CUR CK. 3. Friday: "Publish day" → ORIG.
4. Undo → "Undid: publishing a day"; Friday DRAFT, all four sign-offs blank (correct — AM34/AM32).
5. Undo (titled "Undo — a sign-off" — Saturday's) → "Undid: a sign-off".
**Screen:** Saturday's CUR CK goes — and **Friday shows all four names again, "Signed — this day can be published",
"Publish day" enabled**. Tapping it: "Friday published — APPROVED", with nobody having re-signed.
**CASE S1 (same day):** sign 4 → Publish day → Undo → Undo ("a sign-off") → Friday "1 to sign" with three names back.
The same jump shows up unprompted in S16's walk-back and S17's Undo order (0 → 3 signatures on "Undid: a sign-off").
**Register:** AM34 (unpublish clears that day's sign-offs — re-sign to republish), AM32 (Undo of a just-published day
runs the same unpublish), AM39c; the global-undo design GU5-005: "the restore does NOT put the pre-publish sg/sb back
… a published day that is pulled back always re-signs on republish, whether pulled back by Undo or by the button".
**Every time**, both widths (`w3-05` CASE S1 and CASE S2 fail at each width). Pictures: `w3-05-*-b-caseS1-after-second-undo`,
`-c-caseS2-friday-after-undoing-saturday`, `-d-caseS2-friday-republished-unsigned`.
**Where (my reading, not changed):** the sign-offs ride the week-wide book record `sched.book/<wk>`
(`src/state/sched-commit.ts:94-98`, fields `sg`/`sb`); the undo of a publish clears them in `schedPostRestore`
(`sched-commit.ts:317-321`) AFTER the restore, outside any recorded image — so the next Undo of ANY older command on
that week writes back that command's whole-book before-image, which still carries the pre-publish signatures.

### F-w3-2 — Redo stuck behind a message nobody can act on (MEDIUM)

**Start:** the everything week, admin, Edit Schedule. **Steps (CASE R, `w3-05`):** Friday: sign CUR CK → Undo →
Saturday: sign CUR CK → Undo → Redo. **Screen:** Redo is enabled and titled "Redo — a sign-off"; every press toasts
"An earlier undone change touches the same thing — redo that first." and changes nothing; Saturday's CUR CK never
comes back. There is no way to "redo that first" — Redo only ever offers the most recently undone change.
Met by accident in w3-04's first S17 run: after S16's walk-back, all 9 Redo presses were refused.
**Register:** AM39b (every Undo/Redo says what it did; a clash is refused whole "with a plain message" — this one
names an action no control offers). **Every time**, both widths. Picture: `w3-05-*-a-caseR-redo-stuck`.
**Where:** `src/undo/timeline.ts:402-411` (`redoConflict` refuses while an EARLIER undone entry shares a record) with
`:498-503` (`mostRecentlyUndone` always picks the latest). An undone change followed by a new change is never dropped
from the redo list; every sign-off on a week shares the one book record, so the deadlock is easy to reach.

### F-w3-3 — the armed "Withdraw — confirm" survived navigation (MEDIUM, money) — fixed in source, re-walk pending

**Start:** the everything week, admin; a Leave War OIL bid for Saber on Tue 21 Jul (Leave War → his cell → OIL) — or
none (the fixture Saturday is already bid against). **Steps:** Edit Schedule → Saturday "Unpublish" once (armed,
warning shown) → (a) Inputs → Edit Schedule: still "Withdraw — confirm"; or (b) the role badge / drawer "View as member"
→ badge / "Back to admin" → Edit Schedule: still armed → one tap → Saturday DRAFT, no warning, the Leave War credits
gone. Both widths, every time, on the walked build. **Against:** Astra 33; Fable 5-8; the code's own comment ("a one-shot
confirm cleared by any navigation"). Mitigation seen: the button's face stayed "Withdraw — confirm" (amber), so the
screen did say the next tap confirms. Pictures: `w3-02-*-g-sat-after-flip`, `-h-sat-after-page-change`.
**Status:** the host's commit `7c69bd58` ("a page change (and so the View-as-member flip) drops an armed 'Withdraw —
confirm'", `src/state/view.ts:452-457`) addresses it; the walked build predates it. **Re-walk: `node
scripts/handpass/am/w3-02-roles.mjs` against a build that carries `7c69bd58`** — its three Astra 33 checks must pass.

### F-w3-4 — the Edit history footnote says the schedule clears on reload (LOW)

**Screen:** "This browser, this sitting. It clears when you reload or log out — the schedule does the same."
(`src/ui/HistoryModal.tsx:155`). **Fact (walked):** a reload and a sign-out/sign-in keep every issued version, pending
change, partial sign-off, correction flag, plan and Leave War bid (w3-01, w3-02). A scheduler could read it as "my
unpublished work is lost when I reload". The first half is right (AM49: the list is this sitting only). Every time,
both widths. Pictures: `w3-01-*-f-history-after-reload`.

### F-w3-5 — Edit history sentence lines cut off (LOW–MEDIUM)

**Steps:** `w3-07`'s session, then the top bar's "Edit history". **Screen:** phone — "Switched to "Plan B" — this is now
the live Thursday · 1 difference from Ori…" and "Monday: Original loaded onto the working copy — viewers still see AL1
un…"; desktop — the load line ends "…· 1 unpublished edi". The lost words are the point of the line (who still sees
what, how many edits were replaced). Every time. Pictures: `w3-07-phone-a-edit-history`, `w3-07-desktop-a-edit-history`.
**Where:** `src/ui/scheduler.css:4007` `.hl-what{flex:0 0 auto}` also sizes the sentence rows (`.hl-what.struct`, :4010),
so they never shrink or wrap; the value rows use `.hl-chg{flex:1 1 auto;min-width:0;overflow-wrap:anywhere}`.

### F-w3-6 — which signature stopped counting? (LOW)

**Steps:** `w3-06` (S23). **Screen (week, both widths):** four green pills (Ace, Anvil, Basher, Bolt) and "1 to sign";
"Publish day" locked. The role is named only by the board's line ("1 to sign · SKED CK") and, on a desktop, the locked
button's hover text. On a phone, from the week, a scheduler cannot tell which of four green names to fix. AM16 itself
is met. Pictures: `w3-06-*-b-fri-after-withdrawal`, `w3-06-*-g-board-fri-after-withdrawal`.

---

## 4. Roll-call rows (evidence sheet §4)

| # | place | SHOWS | ACT | PAINTED WITH | walked |
|---|---|---|---|---|---|
| **R7** | View-only week — a published day's issued face | the version tag (ORIG grey / AL1 cyan / AL2 amber), the picker set to "<version> — as issued", the frozen issued content (Mon VL 10:20/12:40 while the working copy has 05:25/07:45), solid issued marks ("MON NOTE — AL1" AL1), the issued face's own warnings (14 issues · 6 warning vs the working face's 17 · 8); NO pending chip, NO "Not yet signed", NO dotted mark. After Unpublish AL1: "Original — as issued", the Original's content, no AL1 trace; after the quiet correction "AL1 — as issued" with the fix | pick "Working draft — not issued"; ⓘ (read-only; shows "N unpublished edits" — a live count, open to any viewer); nothing writable (0 writers, as member, admin-as-member and admin) | the head row: title · tag · 4X4 · picker · ⓘ (two rows on a phone); the warnings bar; lingering toasts at the bottom | yes — desktop + phone; admin, member, admin-as-member. `w3-02-*-a,f`, `w3-03-*-b,b2,f,j`, `w3-01-*-e,h` |
| **R8** | View-only week — the working-draft peek | amber dashed bar "Viewing Working draft — not issued · the issued schedule is AL1", "Working draft" stamp, "1 pending", "Not yet signed", the working content with a neutral hint on the changed cell (title "Edited — goes out as AL2"), the working face's warnings | back to "as issued"; ⓘ; nothing writable | the stamp and pending chip share the head; the bar above the body | yes — both widths, admin and member; survives leaving the page (still labelled); cleared by reload, week change, sign-out; never leaks to the edit week or board. `w3-02-*-b`, `w3-03-*-a,a2`, `w3-01-*-c` |
| **R12** | History / the changes list and its hover bubble | value edits (before → after, who, when); sentence lines for a load, a plan switch, a new plan; NO line for Publish day / Publish AL1 / Unpublish (silent, AM35) / Undo / Redo; mark titles "Changed at ALn" / "Edited — goes out as ALn"; the board's History bubble tells a detail's story (hover desktop, tap phone); footnote "…the schedule does the same" (**F-w3-4**) | All days / day only; By time / Grouped; a value row jumps to the detail; sentence rows are plain | sentence rows **cut off** at the right edge (**F-w3-5**); a toast over the sheet's foot on a phone; modal (desktop) / bottom sheet (phone) | yes — both widths. Cleared by a reload (walked); by a sign-out per the code (`resetSession` → `elogClear`), not opened after a sign-out. `w3-07-*-a,b`, `w3-01-*-d,f` |
| **R13** | The next-week peek | desktop: 7 dimmed trailing columns, "NEXT WEEK — CLICK A DAY TO LOAD IT"; next week's WORKING copy — a published day's unpublished edit shown, unlabelled; no version tag, no marks | a click loads that week (**not walked**) | a 50% veil over each column; inert pucks | yes — desktop, admin and member; phone: not drawn (0 columns, by design). Known `[FLAG-EXPORT]`. `w3-03-desktop-k,l` |
| **R20** | The top bar's (and board's, and Leave War's) Undo / Redo at each amendment boundary | titles "Undo — publishing a day / publishing an amendment / taking a published day back / a sign-off / a note on the schedule / a change to the leave board / a change to the schedule"; disabled when empty; bubbles "Undid: …" / "Redid: …"; the edit page (both widths, icons on a phone), the board (`#sbUndo/#sbRedo`), the Leave War (everyone, a member too) | Undo of Publish day → DRAFT, sign-offs cleared, OIL withdrawn; Redo → published, sign-offs still cleared, OIL back; Undo of Publish AL1 = Unpublish; Undo right after Unpublish → the AL back; Undo from another week snaps to the change's week; the list survives a week change and a sign-out (D148 not built), a reload empties it | refusal toasts ("You can't undo that — it was someone else's change.", "An earlier undone change touches the same thing — redo that first."); **F-w3-1** (sign-offs return), **F-w3-2** (Redo stuck) | yes — both widths, all three surfaces. `w3-01-*-j`, `w3-04-*`, `w3-05-*`, `w3-02-*-d` |

---

## 5. Recorded, not defects (the brief's "record exactly")

- **D148 (decided, NOT built).** After the admin publishes Friday and signs out, the member's only Undo (the Leave War's)
  is ENABLED and titled "Undo — publishing a day" — the admin's change; each press says "You can't undo that — it was
  someone else's change." (the same words every time). When the admin signs back in, Undo still offers "Undo — publishing
  a day" (the list did not clear on sign-out) and it works. `w3-02-*-d-member-lw-undo`. Not walked: "someone else has
  since changed the very same thing" (needs two people at once); a member's own undoable change (the demo war's bidding
  window is Jan–Mar 26, so a member's July cell opens no sheet — probe `w3-00d`).
- **Unpublish is a standing action (AM32).** After sign-out and sign-in, every published day still offers Unpublish, and
  it works on Friday, published in the previous sitting (one tap → DRAFT). PASS. `w3-02-*-e-admin-fri-unpublished-after-relogin`.
- **Register Q6 / Fable 5-10.** Route A (the Unpublish button) writes a retired-log entry and the "correcting" flag;
  route B (Undo of the publish) writes neither. No screen reads either; both routes reissue AL1.
- **AM39c's refusal wording** never showed on screen in a plain walk (see S17).
- The undo bubble for "+ Alt Plan" says "Undid: a change to the schedule" (the shared generic label — by design).
- **Fixture fact for the other walkers:** the saved everything-week Saturday is ALREADY bid against (a Saturday earner
  has spent past his balance), so its first Unpublish tap always arms "Withdraw — confirm" — no extra bid needed.
- A toast outlives a sign-out: the admin's "Friday published — APPROVED" still shows on the member's first screen, and
  the member's refusal fades on the admin's. Cosmetic (≤12 s).

## 6. Explicit negatives — checked and found right

Reload / week change / sign-out keep every durable thing and clear every transient one (table in §2), including partial
sign-offs and the "correcting" flag; a republish after a reload reuses the label; Undo snaps to the change's week.
The member and the admin-as-member never see a writer and always open on the issued face; the working draft is always
labelled and never leaks to the edit week or board. Unpublish: one tap without a clash (weekday and weekend), two taps
with one plus the warning, a preview / week change / reload cancel the arm, republishing restores the Leave War credits.
Unpublish AL1 → the version under it, its changes back to pending in the right AL colour, sign-offs cleared, viewer / ⓘ /
panel all back; the quiet correction reissues the same label with one record and the old issuance kept; the peel goes
AL2 → AL1 → Original → draft, only the latest can be withdrawn, and the tag, the ⓘ list and the viewer agree at every
step. S16 on the board and its money, S17's order, Astra 7's two routes, S23's appointment rule — all as the register
says. No console error in any run. **The host's source has moved since this build** (`7c69bd58`: board "Not yet
signed", one pending count, Discard marks, the phantom mark, the arm; `dd469b4d`: the barrier wording) — none of that
touches F-w3-1, F-w3-2, F-w3-4, F-w3-5 or F-w3-6 (read, not re-walked on a new build).

## 7. NOT walked, and why

- Two people at once (D148's "someone else changed the same thing since") — one browser, one session.
- A member's own undoable change — the demo war's bidding window (Jan–Mar 26) gives a member no sheet in July.
- A correction of a version a shared database registered (AM35's logged line) — no database.
- Clicking a peek column to load next week (R13 ACT).
- The Edit history opened after a sign-out (the reload case was walked).
- A real phone (Safari/WebKit) — Chromium at 390×844 only.
- Fable's S13 wanted "a preview open on Wed (AL1 issued)"; the fixture's Wednesday is never published, so the preview was
  opened on Thursday's issued Original instead.
