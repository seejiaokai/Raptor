# Amendment system — hands-on re-test scenario design (Fable 5.1, 24 Sep 26)

Read-only. Nothing edited, nothing run. Read in full: the behaviour register, the three rulings files and the executor rule, `engine-rules.md` §Publishing / §Version snapshots / §Drafts / §Auth / §History / §The edit log, `ui-contracts.md` §Amendment marks / §Version preview / §version chip / §Sign-off pills, `undo-contract.md` §4, the `[AMEND]` `[EOD]` `[GLOBAL-UNDO]` `[HUMAN-RETEST]` `[PUB-UNAVAIL]` `[CRP-FLAG]` `[FLAG-EXPORT]` backlog items, the global-undo design §6, the plans-selector red-team and follow-ups, and the code: `publish.ts`, `drafts.ts`, `canonical.ts`, `sched-commit.ts`, `history.ts`, `view.ts`, `store.ts` (session/role/week), `disclosure.ts`, `undo/timeline.ts`, `html.ts` (the day head, the preview bar, sign-off, ⓘ), `board.ts` (sign strip, plans menu, switchDraft), `board-html.ts` and `html.ts` `alAttr` sites, `SchedBoard.tsx`, `ALPanel.tsx`, `interactions.ts` (every amendment door), `Shell.tsx` (sign change, view pickers, export), `HistoryModal.tsx`, `DraftsModal.tsx`, `peek.ts`, `export.ts`, `printpdf.ts`, `leavewar/sync.ts` (`desiredOilCells`, `oilCreditBidAgainst`, `runOilPass`), `scheduler.css` (the AL palette, `.alpanel`), and the test inventories named in the brief plus `e2e/step4-leavewar.spec.ts`.

Two things settled before the scenarios, because they shape them:

- **Q1 (register) is answered by the code: PSF-001 is built.** `publish.ts:281-282` (`filingKey`) is in `currentBind` (`:833`), and `signBoundOk` compares `fil` (`:855`). The `[AMEND]` backlog line is stale. Scenario 10 proves it in the app.
- **The register's AM21 source text is stale.** `engine-rules.md:2364-2365` says "A reorder-and-back shows two reorders (each move counts)". The canonical diff (`canonical.ts:230-238`, "from ACTUAL order, so move-and-move-back nets to nothing — P2-R2-01") and `dayHasChanges` (`publish.ts:346`) say the opposite, and AM20 (the owner's "swap it back… it shouldn't register") agrees with the code. Test against AM20: a reorder-and-back leaves nothing to publish.

---

## 1. The roll-call — every place the app draws an amendment thing

Legend for the three columns: **Show** = what the place draws for that thing · **Act** = the gesture the person has on it there · **Painted over** = what else sits on the same pixels. Every cell filled; "none" means I checked and there is nothing.

### 1a. Edit week — day head (`html.ts:1406-1436`, desktop and phone, same string)

| Thing | Show | Act | Painted over |
|---|---|---|---|
| Published day | `<section class="day dok">`; sign-off strip under the head; "Publish day" beak gone | none on the state itself | the day head row shares space with dow/date, Templates, plans selector, `.dhver`, 4×4 badge, `.dstat` |
| Issued version (ORIG/ALn) | `verTagHTML` `.verchip` grey ORIG / coloured ALn, left of the 4×4 badge; names the LIVE current version even under a preview | none (status only); the plans menu lists each issued version | `.dhver` also carries the "Not yet signed" chip |
| Working copy | the day body itself; plans selector label "Live working copy" / plan name | edit any cell; Templates; plans menu | — the body is the schedule; marks ride the cells |
| Pending change | dotted outline/underline in the next AL's colour (`data-alp/aln`, `alAttr`) on the cell; head chip "N pending" (canonical delta, `:1260`) | edit the cell back → mark clears (reconcile) | the cell's own value, warning rings, OIL green edge, selection blue, the History hover bubble title |
| Issued change mark | solid `data-alc` tint/underline + ALn tag on the cell, title "Changed at ALn" | none | same as above |
| Removal / reorder / input filing | **no cell** (removal, reorder); an accepted input shows as a ground row; the filing is only counted ("N pending") | delete/drag/accept/un-accept | the head chip counts them with the field edits |
| Sign-off (×4) | `signoffHTML` pills, green when signed, blank when the binding broke; status line "N to sign" / "Signed — this day can be published" / "Published at ALn · N changes to publish — Publish ALn" / "Published at ALn — no changes to publish"; "Clear" button | `<select data-sign>` per pill; Clear | pills wrap on the phone; the status line is text under them |
| Saved plan | plans selector label = plan name; menu lists plans with ● on the live one, ✎ pencil | tap = switch instantly; ✎ = rename/delete; "+ Alt Plan" | selector label clamps at 150px (tooltip carries the full name) |
| Retired (unpublished) version | **nothing anywhere** — `SCHED.retired` has no reader in `src/ui` | none | none |
| "N pending" | `.dpend` chip in `.dstat` | none (tooltip only) | shares `.dstat` with ⓘ, Publish ALn, Unpublish |
| Version tag | `.verchip` | none | see Issued version |
| "Not yet signed" | `.nysmark` in `.dhver`, only when `!PV && notYetSigned(di)` (`:1409`) | none | beside the version tag |
| Day's OIL | not in the head; the sign-off status/delta counts an OIL-block change as one item; the day's OIL line is the board's/week's OIL strip (other feature) | OIL Earn mode (board) | n/a |
| Unpublish | `.dbeak.dunpub` "Unpublish" / amber "Withdraw — confirm" when armed; only edit surface, published, not previewing | one tap (two when OIL is bid against) | last item of `.dstat` |
| Publish ALn | `.dbeak.dalpub`, locked until signed, hidden under a preview | tap | between ⓘ and Unpublish |
| ⓘ | `.dinfobtn` | opens the day panel | first in `.dstat` after the pending chip |

### 1b. Edit week — cells (`html.ts` alAttr sites `:453,507,646,1097,1501,1631,1637,1638`)

Every editable string (`ted`), every seat, note blocks, in-times, the SC role cell (`st:`), area/time cells wear `alAttr`. **Show**: dotted (pending) / solid (issued). **Act**: edit, drag, right-click clear. **Painted over**: warning rings/chips, crew-rest trace ring, OIL green edge + count chip, "you"/selected fills, LATE chip on input rows, cx/flag tags in the remarks cell. Not marked because they have no cell: a removed row, a reorder, an input filing, an OIL-block change, a wave's `standalone/noconf`, a duty block's "For wave".

### 1c. Scheduler board — desktop and phone (`board.ts:386-411` sign strip; `board-html.ts` + `board.ts` alAttr sites)

| Thing | Show | Act | Painted over |
|---|---|---|---|
| Published day / version tag / plans / N pending / Publish ALn / Unpublish / ⓘ | `.sb-pub` = `planSelectorHTML + verTagHTML + dayStatHTML` — identical builders to the week | identical doors (document-level `routeClick`) | on the phone `.sb-pub` sits under the four sign pills in one scroller; on desktop above the Live Checks column |
| Sign-off (×4) | `signoffHTML(di,true)` (full: names the missing roles) | selects; Clear | `#sbSignBar` |
| Pending / issued marks | flying line cs/msn/br/to/ld, `st:`, `fr:` remarks, area/time, in-times (`board.ts:175-322`); notes, common-programme seats and times, duty/sim/ground boxes and seats (`board-html.ts:183-801`) | edit, drag, mbtn | OIL strip/chip, warning chips, "you" purple, cx tags |
| **"Not yet signed"** | **not drawn** — `boardSignHTML` composes `dayStatHTML` only; `.nysmark` is emitted in `dayHTML`'s head (`html.ts:1409`), which the board never calls | none | none |
| Removal / reorder / input filing | no cell; the Personal Inputs panel shows accept/un-accept controls (`data-acc`) | ✕/drag/`data-acc` | — |
| Saved plan | selector label; menu | switch / rename / delete / + Alt Plan | — |
| Retired version | nothing | none | none |
| Day's OIL | the OIL Earn mode (green edges, count chips); "what this day earns changed" only in the Amendments panel | OIL Earn toggle (disabled under preview) | the marks share the seat |
| Undo / Redo | `#sbUndo/#sbRedo`, label from `undoState()` ("publishing a day", "publishing an amendment", "taking a published day back") | tap | the board top bar |

### 1d. View-only week — issued face (`html.ts:139-174`, `viewDayHTML :199`)

| Thing | Show | Act | Painted over |
|---|---|---|---|
| Published day | frozen snapshot (`PV+PVQ+OFW`), class `issued`, official flags | none | official warnings overlay (CRP-FLAG part 2) |
| Issued version | `.verchip`; picker `<select data-vwork>` "ALn — as issued" | pick "Working draft — not issued" | picker sits in `.dstat` |
| Working copy | hidden until picked | pick | — |
| Pending change | **none** (chip = delta of snapshot vs itself = 0; no dotted marks) | none | — |
| Issued change mark | solid `data-alc` from the snapshot's own changes slice | none | flags overlay |
| Sign-off | not drawn (`ed` false) | none | — |
| Saved plan | hidden once published (AM31) | none | — |
| Retired version | nothing | none | — |
| "Not yet signed" | never (AM24) | none | — |
| Day's OIL | the OIL count chip on a placeholder puck (opens the AvailWindow in the issued world) | tap the chip | the puck |
| Unavailable list | **reads LIVE inputs** (`html.ts:1515` per `[PUB-UNAVAIL]`) — NOT frozen (AM43 NOT BUILT) | none | — |
| Next-week peek | next week's **stashed working days**, no version tag, no marks (`peek.ts:257-263`) — filed under `[FLAG-EXPORT]` ("the next-week peek's label") | click loads that week | trailing columns on desktop only |

### 1e. View-only week — "Working draft — not issued" peek (`VWORK`)

Show: live render with `.dprev-bar.work` "Viewing Working draft — not issued · the issued schedule is ALn", amber "Working draft" stamp, "N pending" chip, `.nysmark`, neutral dashed hint on pending cells (not the AL-coloured dotted mark), issued solid marks. Act: none but switching back. Painted over: the stamp shares `.dstat`; the bar sits above the body. A draft day (never published) shows the plans-only picker (`viewDraftSelHTML`) and a `d:` preview with "👁 Viewing plan … read-only" and no Switch button.

### 1f. Amendments panel (`ALPanel.tsx`, mounted only on the edit page `Shell.tsx:561`; **`display:none` under 820px** `scheduler.css:1726`)

| Thing | Show | Act | Painted over |
|---|---|---|---|
| Published day with changes | "N day(s) with changes to publish"; per day "Mon · N changes · N removals · N reorders · N input filings · what this day earns changed" + "Publish ALn" (locked unsigned or previewing) | Publish ALn | desktop only |
| Pending on unpublished days | "Changes are on unpublished days — publish the day first" (whenever `pendCount()>0` and no published day has a delta, `:25`) | "Discard marks" (`disabled={!np}`, `:27`) | — |
| Issued version | one `.al-tag` per AL: "AL1 Mon · N items · … · appr X", tooltip with all four signers | none | tags wrap |
| Removal/reorder/filing | counted in both lists | — | — |
| Retired version | not listed (spliced out of `SCHED.als`) | none | — |
| Sign-offs | in the tag tooltip; the lock on the button | — | — |
| Day's OIL | "what this day earns changed" | — | — |

### 1g. ⓘ day panel (`dayInfoHTML :1966`)

Show: "✓ Published — APPROVED · at ALn" / "Draft — not yet published"; **"N unpublished edits" from `dayPendCount` (raw marks, `:1968`)**; "AL versions covering Mon" = one chip per `SCHED.als` record with item count (no approver); issues (live WARN). Act: warning rows jump. Painted over: modal. Retired versions: absent. Sign-offs: absent.

### 1h. History — the changes list and the hover bubble (`HistoryModal.tsx`, `histbubble.ts`)

Show: field edits with who/when/from→to; sentences for "loaded onto the working copy", "switched to plan", "Plan created", accept/un-accept, undo/redo; the bubble title carries "Changed at ALn" / "Edited — goes out as ALn" off `alAttr`. **No line for Publish day, Publish ALn, Unpublish** (they mint no key and call no `logAction`). Act: rows jump to the cell. Painted over: the modal; bubble over the cell. Session-only, cleared on logout (footnote says so).

### 1i. Preview of an issued version or a plan (edit surfaces `html.ts:1382-1405`, board `SchedBoard.tsx:204-232`; view page `d:` only)

Show: read-only frozen body inside `.preview`/`.pv-frozen`, `.dprev-bar` tinted in the version's colour: "👁 Viewing the issued ALn — read-only…", "← Back to live copy", "Load onto working copy" → armed "Discard N edits & load — confirm" + "Keep editing"; a plan: "👁 Viewing plan B", "Switch to this plan" (edit surfaces). The selector reads amber "👁 ALn"; the version tag still names the live version; the head chip = live discard count (`PVND`). Act: the three buttons; everything else inert (no `data-slot`, disabled fields, Templates/Sort all/OIL disabled, Publish AL hidden, Unpublish hidden, sign strip absent). Painted over: no warnings (never validated).

### 1j. Plans menu (`board.ts:1575-1647`)

Show: editable copies (● live), "Issued · read-only" rows (● the previewed), "+ Alt Plan", "✎ Manage plans", the note "This day is published — the issued versions don't change. Switching plans marks the differences as the next AL." Act: switch / preview / dup / manage. Retired versions: absent from `dayVersions`.

### 1k. Export CSV / print (`export.ts:45-62`, `printpdf.ts:117-119`, buttons `Shell.tsx:528-541`, edit page only)

Show: the **published** version of each approved day (working copy for a draft day), per-day "Published ALn / Working draft — not yet signed" label, the whole loaded week (AM50 PARTLY BUILT — not this re-test). Act: buttons on the edit toolbar (admin-only page). Marks, pending, plans, retired: absent by design.

### 1l. Leave War OIL cells (`sync.ts:910-1017` `desiredOilCells`, `:1200` `runOilPass`)

Show: `FO*`/`HO*` auto credit from the **resolved issued snapshot** of the day's current version (`dayCurVerIn` → `daySnapIn`; unapproved day → nothing; unresolvable → protected, credit stands). Act: none from here; changes only through publish/unpublish/undo. Painted over: bid cells, clash marks "!". Pending change: invisible (AM47). Retired version: invisible. Unpublish's warn reads `oilCreditBidAgainst` (`:1164-1198`: **only if the withdrawal would push the ledger below zero**).

### 1m. Warnings list

Edit week/board: live WORKING warnings. View page: OFFICIAL flags for the issued face (CRP-FLAG part 2). Preview: none. Pending/issued marks: not shown here. `[CRP-FLAG]` remainder is backlog.

### 1n. Other places found

- **Undo/Redo buttons + bubble** (Shell topbar, board bar): label "publishing a day / an amendment / taking a published day back"; refusal toasts "A day on this week was published after that change — take the published day back first…", "You can't undo that — it was someone else's change." (`timeline.ts:378-396, 507, 531`).
- **Toasts**: "Mon published — APPROVED", "Published AL1 · N items on Mon only · approved by X · N days with changes still held", "No changes to publish on Mon", "Sign off … before publishing AL1", "All signed — no changes to publish right now" (R2), the OIL "Heads up…" warn, "That day can't be unpublished right now."
- **AvailWindow** carries the version it was opened in; closes on unpublish/undo (`view.ts:841-842`).
- **Templates picker** on a published day: two-pick confirm "replaces your unpublished edits".
- **DraftsModal** note wording changes register once published.

---

## 2. The door list

States: **A** admin · **M** member · **V** admin viewing as member (= M everywhere; `toggleRole` throws the page back to View-only Sched, closes the board, keeps DPREV/UNPUBARM/undo history) · **Ph/Dt** phone/desktop (same HTML; the Amendments panel is the one desktop-only surface) · day states: **D** draft · **P0** published nothing pending · **P+** published with changes · **PV** previewing · **PL** has plans · **U** after unpublish · **UN** after undo of a publish · **W$** published weekend with OIL bid against.

| Action the data allows | Control | A | M/V | Ph | D | P0 | P+ | PV | PL | U | UN | W$ |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Sign a role | `select[data-sign]` (week `ed`, board strip) | yes | no control rendered; handler has no gate (`Shell.tsx:164-176`) | yes | yes | yes (R2 toast) | yes | strip absent | per plan | yes | yes (cleared by undo) | yes |
| Clear sign-offs | "Clear" | yes | n/a | yes | yes | yes | yes | absent | per plan | yes | yes | yes |
| Publish day (Original) | `data-beak`, locked unsigned | yes | no | yes | yes | n/a | n/a | n/a | publishes the live plan | after unpublishing ORIG: yes, reissues ORIG | yes | yes |
| Publish ALn | `data-alpub` (head/strip), panel button (desktop) | yes | no | head only (panel hidden) | n/a | **none** | yes if signed | hidden/locked | yes | yes (same label) | yes | yes |
| **Reissue same label with zero delta** (`correcting`, `publish.ts:703`) | **no control** — button needs `nd>0` (`html.ts:1312`), panel needs `dayHasChanges` | — | — | — | — | — | — | — | — | **gap** | — | — |
| Unpublish latest version | `data-unpub` (head/strip) | yes | no | yes | n/a | yes | yes | hidden | yes | peels the next one down | yes | two-tap "Withdraw — confirm" |
| Unpublish an OLDER version | **no control** — by rule (AM34); engine refuses `seq!==top` | — | — | — | — | — | — | — | — | — | — | — |
| Undo/Redo across a publish | Undo (topbar/board) | yes | refused with reason | yes | yes | yes | barrier behind a later publish | yes | yes | yes | yes | yes (e2e covers) |
| Preview an issued version | plans menu "Issued · read-only" | yes | no | yes | n/a | yes | yes | switch version | yes | yes | yes | yes |
| Back to live | `data-golive` (bar), menu live row | yes | n/a | yes | — | yes | yes | yes | yes | yes | yes | yes |
| Load a version onto the working copy | `data-restore`, two-tap when `dayDiscardCount>0` | yes | no | yes | n/a | yes (no-op toast if current & clean) | yes | only from a preview | yes | yes | yes | yes |
| Create plan / switch / rename / delete | menu + DraftsModal | yes | no (modal self-hides on V) | yes | yes | yes | yes | dup drops the preview | yes | yes | yes | yes |
| Delete the live plan | **no** — by rule | — | — | — | — | — | — | — | — | — | — | — |
| Discard pending on a draft day | panel "Discard marks" (desktop) | yes | no | **no** (panel hidden) | yes | see §5-1 | see §5-1 | yes | yes | yes | yes | yes |
| Discard working-copy edits on a published day | Load the CURRENT version (two-tap) | yes | no | yes | n/a | n/a | yes (content only; a filing change stays) | yes | yes | yes | yes | yes |
| View issued vs working (viewer) | `select[data-vwork]` (view page) | yes | **yes** | yes | plans picker instead | yes | yes | n/a | hidden once published | ORIG face | plans picker (draft) | yes |
| Look at a plan (viewer, draft day) | `select[data-dver]` | yes | yes | yes | yes | — | — | — | yes | yes | yes | — |
| Accept / un-accept an input | `data-acc` | yes | no ("Only a scheduler can accept inputs") | yes | yes | yes → 1 filing | yes | inert | yes | yes | yes | yes |
| File a request (member) on a published day | Inputs page | yes | yes | yes | — | lands pending on the working copy (AM41) | same | — | — | — | — | — |
| Export CSV / print the published version | edit toolbar | yes | no page | yes | working copy | issued | issued | issued | issued | issued/ORIG | draft | issued |
| See the issued AL list with approvers | Amendments panel | yes | no | **no** (hidden ≤820px) | — | yes | yes | yes | yes | AL gone | AL gone | yes |
| See a retired issuance | **no screen reads `SCHED.retired`** | — | — | — | — | — | — | — | — | — | — | — |

**Controls drawn that do nothing (or lie):**
1. **"Discard marks"** in the Amendments panel is enabled whenever any pending key exists (`pendCount()`, `ALPanel.tsx:15,27`) but `discardPending` clears only never-published days (`publish.ts:720-723`) and toasts "Pending marks cleared" regardless. With pending only on published days: enabled, click, toast, nothing happens.
2. The panel's sentence "Changes are on unpublished days — publish the day first" fires whenever `pendCount()>0` and no published day has a delta (`:25`) — also when the only pending keys are on a PUBLISHED day (a file-then-unfile `inp:` key; the stale marks in §5-3).

---

## 3. Ranked failure scenarios (40; the top 15 in full)

Ranking: least-shared / most specialised surface first, and confirmed-by-code before predicted. "Disprove" = what the walker photographs that would mean the app is wrong.

### S1 — Unpublish an AL after one of its changes was already reverted: the phantom dotted mark (CONFIRMED path, §5-3)
Setup (edit week, desktop): sign Mon, Publish day. Change a flying line's take-off 08:00→08:30 and a note. Sign, Publish AL1 (tag AL1 cyan). Now edit the take-off back to 08:00 → its dotted mark clears (reconcile), the note stays issued-solid. Head: "1 pending" (the time differs from AL1).
Action: tap **Unpublish** (no OIL, one tap).
Expected: tag ORIG; the note wears a DOTTED AL1 mark (differs from ORIG); the take-off cell wears **no** mark (08:00 = ORIG); head "1 pending"; sign line "Published at ORIG · 1 change to publish — Publish AL1"; Amendments panel "Mon · 1 change".
Disprove: the take-off cell is dotted while the head says "1 pending" (i.e. two dotted cells, one count) — and the mark only clears after some unrelated edit. Also photograph the board for the same cells.

### S2 — "Discard marks" on a week whose only pending edits are on published days (CONFIRMED, §5-1)
Setup (desktop edit page): publish Mon; edit one cell on Mon; no other day touched. Panel reads "1 day with changes to publish · Mon · 1 change".
Action: tap **Discard marks**.
Expected (by rule F-01): the button should be disabled — there is nothing it may clear.
Disprove: the button is enabled, the toast says "Pending marks cleared", and Mon still shows "1 pending" with the dotted cell. Then the inverse: make one edit on a DRAFT day too, tap Discard — the draft day clears, Mon does not, toast the same.

### S3 — The ⓘ panel and the head chip disagree (CONFIRMED, §5-2)
Setup A (OIL-only change): publish Saturday (weekend). Board → OIL Earn → switch one man off an earning desk → leave the mode. Head chip "1 pending"; panel "Sat · 1 change · what this day earns changed".
Action: open ⓘ on Saturday (week head or view page).
Expected (AM23): "1 unpublished edit".
Disprove: no "unpublished edit" chip at all in the ⓘ status line.
Setup B (file-then-unfile): on published Mon accept an `Other` input to Unavailable, then un-accept it. Head chip: nothing pending; sign line "no changes to publish".
Disprove: ⓘ says "1 unpublished edit", and the Amendments panel's "Discard marks" is enabled with "Changes are on unpublished days — publish the day first".

### S4 — Phone edit week day head at 390px with everything lit
Setup: iPhone width. Published Mon with one pending edit, signed, with a plan (Plan B live), OIL bid against not needed.
Action: photograph Mon's head; tap each control: plans selector, ⓘ, "Publish AL1", "Unpublish", the sign pills, "Clear".
Expected: version tag left of the 4×4 badge; "Not yet signed" visible; "1 pending"; every button ≥ tappable and not overlapping the badge or the date; the sign pills wrap under the head; the plan name clamps with the full name in the tooltip.
Disprove: any control clipped, hidden behind the badge, wrapped off-screen, or a tap that lands on the neighbour (e.g. Unpublish fires when aiming at Publish AL).

### S5 — "Not yet signed" is never drawn on the board (CONFIRMED absent, §5-5)
Setup: publish Mon; one edit; open the board on Mon (desktop, then phone).
Expected (AM24, the board IS the working copy): the marker beside the version tag in `.sb-pub`, as on the week head.
Disprove: the board sign strip shows AL tag, "1 pending", "Publish AL1", "Unpublish" — and no "Not yet signed" while the week head, one page away, shows it. (The status line "Published at ORIG · 1 change to publish" is present; record whether the owner counts that as enough.)

### S6 — The Amendments panel is gone on a phone (CONFIRMED, §5-4; his call)
Setup: two published days each with a change (Mon, Tue); two ALs already issued (Mon AL1, Tue AL1). Phone width, edit page.
Action: scroll the whole edit page; then open ⓘ on Mon.
Expected if the phone is meant to have the same doors: somewhere on the phone the "2 days with changes to publish" summary and the issued-AL list with "appr X".
Disprove: no such surface; the ⓘ lists "AL1 · N items" without who approved it; the only publish door is each day's head button. Record; the register has no line on this — put it to him (Q3 below).

### S7 — Walk the money: publish, amend, unpublish, undo on a weekend
Setup: Saturday 18 Jul, `plasma` on the duty; open the Leave War, note his OIL balance and cell.
Actions and expectations in order (photograph the LW cell after each):
1. Sign + Publish day → `FO*` lands, balance +1.
2. Board → take plasma OFF the desk (or OIL Earn switch him off) → sign → Publish AL1 → `FO*` gone, balance back.
3. Unpublish AL1 (tag → ORIG) → `FO*` back (credited from ORIG's snapshot), balance +1.
4. Undo (the unpublish) → AL1 back, `FO*` gone.
5. Undo again (the AL1 publish) → sign-offs cleared, marks pending, ORIG current, `FO*` back.
6. Redo twice → AL1 current, `FO*` gone; sign-offs stay cleared after redo.
Disprove: any step where the LW cell lags until a reload; a step where the balance moves without the cell; sign-offs still green after an undo of a publish; the version tag and the LW disagreeing about which version pays.

### S8 — "Withdraw — confirm": the bid-against warn
Setup: publish Saturday crediting plasma; on the Leave War, spend that credit (a bid drawing him to zero). Back on the edit week.
Action: tap Unpublish once.
Expected (AM37): toast "Heads up — Saturday's OIL credits are bid against…", button becomes amber "Withdraw — confirm"; second tap withdraws; LW shows the clash "!" in the gap; republish restores.
Disprove: single tap withdraws with no warn. Then the narrower case (§5-9, check only): give plasma a SECOND credit elsewhere so his balance stays ≥0 without Saturday's — tap Unpublish: by the code it withdraws on one tap with no warn although the credit is bid against. Photograph; ask him whether "bid against" means "would go negative".

### S9 — Sign then edit / edit then sign, across surfaces, and the revert
Setup: published Mon at ORIG, all four signed on the BOARD (green). Close the board.
Action A: on the WEEK change a time → all four pills blank on the week; open the board → blank there; line "4 to sign".
Action B: change the time back → the four names return on both surfaces without re-picking (AM11 restore); sign line "Published at ORIG — no changes to publish".
Action C: edit first, then sign the four → line "Published at ORIG · 1 change to publish — Publish AL1"; the R2 toast must NOT fire (it fires only when nothing is pending).
Action D: sign the four on a P0 day → toast "All signed — no changes to publish right now", no Publish button anywhere (head, strip, panel).
Disprove: a name survives an edit on one surface but not the other; the revert does not bring them back; the R2 toast fires with pending changes.

### S10 — Accept an input then publish; publish then accept (AM14 / AM41; settles Q1)
Setup: published Tue, signed. A member's `Other` input on Tue sits unaccepted in Personal Inputs.
Action A: accept it to the ground programme → head "1 pending", panel "Tue · 1 change · 1 input filing", the four sign pills blank (the filing axis broke the binding), "Publish AL1" locked.
Action B: sign, Publish AL1 → the ground row wears the AL1 tint; panel tag "AL1 Tue · 1 item · 1 input filing".
Action C: un-accept the same row → "1 pending · 1 input filing" again; pills blank.
Action D (member path): log in as member, file a new leave input for Tue on the Inputs page; log in as admin → Tue reads "1 pending" and lists the filing; the view page's issued face is unchanged (AM41); the **Unavailable list on the issued face** — record what it shows (AM43 NOT BUILT: expected to change silently today; not a defect, photograph it).
Disprove: Publish AL1 enabled on the pre-filing signatures (Q1 false → real defect); the member's filing leaves no pending on the working copy.

### S11 — Switch plan then load a version; load a version then switch plan
Setup: Mon published, then amended to AL1 (a note changed). "+ Alt Plan" → Plan A (stowed = the day as it was), Plan B live. On Plan B change a time; sign Plan B.
Action A: switch to Plan A → sign pills blank (Plan A never signed; AM12); head "0 pending" (A equals AL1); menu → Issued · read-only → ORIG → "Load onto working copy" (two-tap? no: A has nothing pending → one tap) → Plan A now holds ORIG content; head "1 pending" (the note differs from AL1); version tag still AL1; view page still shows AL1 (AM6); History line "Mon: Original loaded onto the working copy — viewers still see AL1 until you publish".
Action B: switch to Plan B → head "1 pending" (the time), pills green again (Plan B's own signatures; base AL1 unchanged); switch back to A → ORIG content still there.
Action C: from Plan B, preview AL1, tap Load → since B has a pending edit: "Discard 1 edit & load — confirm" / "Keep editing"; tap Keep editing → arm cleared; tap Load again → armed; navigate (Back to live) → arm cleared.
Disprove: the tag or the view page moves before a publish; pending count wrong after either order; a plan's signatures leak onto the other; the confirm shows "Discard 0 edits".

### S12 — Unpublish with plans, and the stowed plan's old signatures (Q4)
Setup: published Mon at ORIG. Sign all four on the live day. "+ Alt Plan" → Plan B live (both plans now carry the signatures, bound to base ORIG). On Plan B change a note; sign B; Publish AL1 (from B). Tag AL1.
Action A: switch to Plan A → A's diff vs AL1 = the note back → "1 pending"; A's pills: blank (its binding says base ORIG ≠ AL1).
Action B: Unpublish AL1 → tag ORIG; sign cleared on the live plan (A).
Action C: look at Plan A's pills now — by the binding rule they come back GREEN (content = ORIG digest, base = ORIG again). Photograph. AM34 says unpublish clears the day's sign-offs; AM11 says content restored restores names. Record which happens; it goes to him as Q4.
Action D: switch back to B → B's marks vs ORIG: the note dotted (AL1 colour, since nextSeq is 1 again); "Publish AL1" offered once signed.
Disprove: the marks on B after the unpublish do not match "1 pending" (S1's phantom in the plans shape); the version tag reads anything but ORIG.

### S13 — Lifecycle boundaries: reload, change week and back, log out/in as the other role, view-as flip
Setup: Mon at AL1 with one pending edit; Tue unpublished-then-corrected (Unpublish ORIG, edit, not yet republished — `correcting` set); a preview open on Wed (AL1 issued); Unpublish armed on Saturday (OIL bid against).
Actions / expectations:
1. **Reload** → Mon AL1 + pending intact; Tue still DRAFT with its edit; Wed's preview gone (view state); Sat's arm gone. Tue's "Publish day" reissues the ORIGINAL label (verId seq 0) — the ⓘ afterwards lists no AL, tag ORIG.
2. **Change week and back** → same as reload for the model; previews/arms cleared; Undo still has entries (undo across the week jump loads the week — observe the snap).
3. **Log out, log in as member** → view page: Mon "AL1 — as issued" face; picker offers "Working draft"; ⓘ shows "1 unpublished edit" (live data — the known limitation, record it); Undo button: enabled with the admin's label, tap → "You can't undo that — it was someone else's change." (D148 NOT BUILT: the list did not clear on sign-out — record, not a defect).
4. **Log back in as admin** → Undo still lists the earlier entries (same note).
5. **View as member** on the edit page with Wed previewing and Sat armed → lands on View-only Sched; flip back → Wed still previewing (DPREV survives — fine); on the edit page tap Sat's Unpublish ONCE → it withdraws without repeating the warn (UNPUBARM survived the flip, §5-8). Photograph.
Disprove: a published record lost on reload; a preview or arm surviving a week change; the member seeing dotted marks or "Not yet signed" on the issued face.

### S14 — Phone ↔ desktop, same session: the preview bar and the confirm at 390px
Setup: desktop edit week, Mon at AL1 with 3 pending edits; preview ORIG; tap Load → armed ("Discard 3 edits & load — confirm" + "Keep editing"). Narrow the window to 390px (or open the phone board on Mon and do the same there).
Expected: both buttons visible and tappable, the bar wraps, "← Back to live copy" reachable; on the board the same bar in `#sbWarn` at the top of the scroller.
Disprove: a button off-screen, the count reading "0", or the second tap landing on Keep editing.

### S15 — Removal + reorder + filing on a published day; then unpublish
Setup: Mon published (ORIG). On the board: delete one flying line, drag a wave to another position, accept an input to the ground programme.
Expected: head "3 pending"; panel "Mon · 3 changes · 1 removal · 1 reorder · 1 input filing"; no cell wears the removal; the moved wave wears no mark (a reorder has no cell); sign → Publish AL1 → panel tag "AL1 Mon · 3 items · 1 removal · 1 reorder · 1 input filing · appr X"; ⓘ "AL1 · 3 items".
Action: Unpublish AL1 → tag ORIG; head "3 pending" again (the working copy keeps the deletion, the order and the filing); the view page shows ORIG WITH the deleted line.
Then: drag the wave back → head "2 pending" (order nets out — AM20); ⓘ — record its number (raw marks would say 4).
Disprove: the removal vanishes from the count after the unpublish; "Publish AL1" not offered although the delta is 3; the view page's ORIG face missing the line.

### S16–S40 (short form)

- **S16** Publish day → Undo → Redo (weekend, the e2e's shape but through the buttons on the phone board): after Undo the head reads dashed DRAFT, sign pills blank; after Redo ORIG, pills still blank.
- **S17** The barrier: edit A on Mon, Publish AL1, edit B; Undo → B; Undo → refused "…published after that change — take the published day back first". Unpublish AL1 → Undo now reverses the unpublish (not A). Record the exact order the timeline walks.
- **S18** "Load onto working copy" of the CURRENT version with nothing pending → toast "Mon is already at AL1", preview closes, no undo entry added.
- **S19** Under a preview, every write door is dead: Templates/Sort all/OIL Earn disabled on the board; Publish AL absent (head, strip) and locked (panel); Unpublish absent; no sign strip; right-click on a seat does nothing; drag does nothing; "+ Alt Plan" from the menu drops the preview.
- **S20** Viewer's byte-frozen face: admin edits Mon; member (fresh login) sees the issued face unchanged, picks "Working draft — not issued" → edit visible under the amber stamp with "1 pending" and "Not yet signed"; picks back → frozen again.
- **S21** After Unpublish AL1, the view page reads "ORIG — as issued", tag ORIG, no trace of AL1 (silent by AM35 — record only); the ⓘ says "No amendment has touched this day yet".
- **S22** Two days, per-day numbering: Mon AL1 and Tue AL1 both offered; publish Mon → toast "…1 day with changes still held"; Tue still AL1 (not AL2).
- **S23** Withdraw a signer's SCHEDULER appointment on Quals after he signed SKED CK → the name stays shown, the line reads "1 to sign", publish locked (AM16).
- **S24** Rename/delete a plan while the view page previews it (`d:`) → the preview drops on the next paint; delete down to one → selector "Live working copy" (B1); the survivor keeps its signatures.
- **S25** Apply a day template on a published day → first pick toasts "replaces your unpublished edits… pick it again to confirm"; second pick applies; pending = diff vs issued; AL tints gone from unrelated rows.
- **S26** OIL Earn on a published Saturday: switch a man off → "what this day earns changed" → sign → AL1 → LW cell cleared for him only.
- **S27** D45/D44: member files leave for a man behind an ALL AVAIL puck on a published Saturday → working copy "1 pending" (membership frozen), signatures NOT blanked; the issued face's count chip unchanged.
- **S28** Export CSV and print after edits on a published day → the published content, the day labelled "Published AL1"; a draft day labelled "Working draft — not yet signed"; whole week (AM50 — record only).
- **S29** Quiet correction round trip: Unpublish AL1 → fix → sign → "Publish AL1" (same label) → panel lists AL1 once, ⓘ once, view page "AL1 — as issued".
- **S30** Unpublish the Original of a day with plans → DRAFT tag, the view page's plans picker returns for viewers (AM31), "Publish day" → ORIG again.
- **S31** Peel order (the 11 Sep "BUG 1"): Mon at AL2 → Unpublish → tag AL1, marks of AL2 re-open, the button's tooltip now names AL1; Unpublish again → ORIG; again → DRAFT. Never a state where the tag names a version the ⓘ list lacks.
- **S32** Correction netting to zero (§5-7): Unpublish AL1, revert the working copy to ORIG content exactly → no Publish button anywhere, line "no changes to publish", AL1 gone. Record.
- **S33** Reorder-and-back (AM20 vs the stale engine-rules line): drag a duty block down, drag it back → head "0 pending", panel silent; ⓘ — record; Discard marks — record.
- **S34** Type into a board time box and tap "Publish AL1" without blurring → the blur commits first, the binding breaks, the publish refuses "Sign off … before publishing AL1". Disprove: the AL goes out with the old value or on the stale signature.
- **S35** History after the whole walk: lines for loads/switches/accepts, none for publish/AL/unpublish; hover bubble titles "Changed at AL1" / "Edited — goes out as AL2". Record.
- **S36** Eight ALs on one day: tag and marks for AL8 both orange (the CSS catch-all `scheduler.css:1631` and `alColor` agree) — photograph AL7 vs AL8.
- **S37** Member on the phone view page: the `data-vwork` select in the day head at 390px — reachable, not clipped by the 4×4 badge.
- **S38** AvailWindow opened from the issued face's count chip → Unpublish that day → the window closes; opened from a `d:` plan preview → switch to that plan → closes.
- **S39** Next-week peek on the VIEW page as a member: after the admin edits next week (stashed, unpublished) the peek shows the WORKING content with no label (filed `[FLAG-EXPORT]`; photograph, do not refile).
- **S40** Publish AL from the Amendments panel while the week head is scrolled to another day → the toast names the right day; the head of that day updates without a scroll.

---

## 4. Explicit negatives — checked and found nothing

- **The AL colour palette past AL7**: `scheduler.css:1631` gives every `data-alc/aln` orange first, then 1–7; `alColor()` hands AL8+ the last entry. Tag, marks, preview bar agree.
- **`retired` / `correcting` persist**: both in `schedFields` (`history.ts:24`) and restored (`:103`), so a reload keeps the issuance log and the same-label flag.
- **Preview leaks**: DPREV/RESTARM/UNPUBARM/VWORK are all in `VIEW_RESET` for session and week (`view.ts:757-786`); `setPage` drops `d:` previews on entering the edit page (`:483`); prunePreviews runs on unpublish (`sched-commit.ts:554`), on histApply and on week switch.
- **Publish AL under a preview**: hidden in `dayStatHTML` (`:1312`), locked in the panel (`ALPanel.tsx:54-56`), stale click guarded in the handler (`interactions.ts:818`), and `commitUnpublish` refuses under DPREV (`sched-commit.ts:546`).
- **Unpublish gates**: admin only, not previewing, quarantine, latest only — all re-checked in the engine (`publish.ts:766-772`) not just the renderer.
- **Discard count authority**: `dayDiscardCount` read on the live day before the swap on the week (`html.ts:87`), the board (`SchedBoard.tsx:221`) and the handler (`interactions.ts:919`) — one number.
- **The two builders**: `planSelectorHTML`/`verTagHTML`/`dayStatHTML` are shared verbatim by the week head and the board strip — no phone/desktop or week/board fork to drift.
- **Per-plan signatures**: stowed and restored with the blob, rev re-stamped on dup/collapse (`drafts.ts:56-72, 181-204, 261-268, 516`).
- **Marks on the board cover every field the week marks** (`board.ts:175-322`, `board-html.ts:183-801`): line cs/msn/br/to/ld, remarks, SC role, area/time, in-times, notes, common programme, duty/sim/ground boxes and seats. The wave label on the board is marked via `markEdit('wl:…')` (`board.ts:1170`).
- **Sign change write path**: unreachable by a member today (the `<select data-sign>` renders only with `ed` or inside the admin-only board; `toggleRole` closes the board), though the handler itself carries no gate (`Shell.tsx:164-176`) and the command permission is `anyone` — note for the auth step, not a walk finding.
- **OIL from the latest published version** (AM46/D142): `desiredOilCells` resolves `dayCurVerIn`→`daySnapIn` for the live week and every stash; unapproved → no credit; unresolvable → protected, never a draft (`sync.ts:957-1008`).
- **e2e already walks**: publish a weekend, the bid kept, undo/redo of the publish from the Leave War (`step4-leavewar.spec.ts:500-535`). Don't repeat it as new; S7 extends it with AL + unpublish.
- **Quarantine, EOD, CRP-FLAG remainder, whole-week export**: out of scope per the brief; not walked.

---

## 5. Defects — confirmed vs predicted, and the exact fix

**5-1. "Discard marks" enabled when it can clear nothing, and its toast lies.** CONFIRMED: `ALPanel.tsx:15` (`np = pendCount()` — every pending key), `:27` (`disabled={!np}`), `publish.ts:720-724` (`discardPending` skips keys on days with an Original; toasts "Pending marks cleared" unconditionally). Fix: (1) in `publish.ts` add `export function discardableCount(){ const orig=SCHED.orig||{}; return Object.keys(SCHED.pending).filter(k=>!orig[keyDay(k)]).length; }`; (2) in `discardPending` count what it deletes and toast `Pending marks cleared (${n})`, or "Nothing to clear — the changes are on published days" when `n===0`; (3) in `ALPanel.tsx` replace `disabled={!np}` with `disabled={!discardableCount()}` and drive the `al-pend` sentence (`:25`) off the same count: `discardableCount() ? 'Changes are on unpublished days — publish the day first' : 'No pending changes'`. Pin with a test: pending on a published day only → button disabled, sentence "No pending changes".

**5-2. The ⓘ panel counts raw marks; the head counts the canonical delta.** CONFIRMED: `html.ts:1968` (`dp=dayPendCount(di)`) vs `:1260` (`nd = ok ? dayDelta(di).length : dayPendCount(di)`). Breaks AM23 on an OIL-only change (chip 1, ⓘ 0), a file-then-unfile (chip 0, ⓘ 1), a reorder-and-back (chip 0, ⓘ 2), and after 5-3. Fix: `html.ts:1968` → `const ok=dayApproved(di), dp=ok?dayDelta(di).length:dayPendCount(di);` and change the chip text on a published day to "N change(s) to publish" to match the head's tooltip. Test: the three cases above read the same number in `dayInfoHTML` and `dayStatHTML`.

**5-3. Unpublishing an AL re-opens its marks without reconciling them against the version that becomes current.** CONFIRMED path: `publish.ts:782-788` sets `SCHED.pending[k]=1` for every key AL n changed whose row still resolves, regardless of whether the live value now equals the prior version's; `commitUnpublish` defers only `prunePreviews/reflow/histPush` (`sched-commit.ts:554`); `reconcileIssuedMarks` runs only from the mutation epilogue (`view.ts:1094`) and `commitText` (`textedit.ts:55`). Symptom PREDICTED (S1): a dotted mark on a cell that equals ORIG, while the head/sign line/panel (all `dayDelta`) say otherwise, until an unrelated edit. Fix in `unpublishDay`, AL branch, after `SCHED.cur[di]=prior` (`:793`): replace the manual re-open loop and the `added` restore (`:782-791`) with `rebaseDayPending(di)` (`drafts.ts:304` — recomputes pending/added/changes as the true diff vs the new current snapshot, keeps `inp:` keys, reinstalls the prior version's tints). Import it into `publish.ts` (drafts already imports publish — move `rebaseDayPending`'s call behind a `HOOKS` seam or call it from `commitUnpublish` right after `unpublishDay` returns, inside the command, which avoids the cycle: `const id=unpublishDay(...); if(id&&dayApproved(di)) rebaseDayPending(di);`). Keep `rec.added` on the record for the Original-retract path only. Test: publish AL1 (time+note), revert the time, unpublish → `SCHED.pending` holds the note key only.

**5-4. The Amendments panel does not exist on a phone.** CONFIRMED: `scheduler.css:1726` `@media (max-width:820px){.alpanel{display:none}}`; no phone substitute lists the issued ALs with their approver or the "N days with changes" summary. No ruling found either way (the 11–12 Aug phone rule covers the BOARD's top bar only). His call — **Q3**. If he wants it: drop the rule and let `.alpanel` stack (`.al-pubday` already wraps); or, cheaper, fold the "appr X" into the ⓘ panel's `dip-al` chips (`html.ts:1982-1983`: append `a.sign?.[a.di]?.appr`).

**5-5. "Not yet signed" is drawn on the week head only, never on the board.** CONFIRMED absent: emitted in `dayHTML` (`html.ts:1409`); `boardSignHTML` (`board.ts:408-410`) composes `planSelectorHTML+verTagHTML+dayStatHTML` without it. Defect status PREDICTED from AM24's wording ("shows on the working copy of a published day") — the 16 Sep change reached one of the two working-copy surfaces. Fix: move the marker into `verTagHTML`'s tail (`html.ts:244-255`): `+ ((!PV&&notYetSigned(di))?'<span class="nysmark" …>Not yet signed</span>':'')` and delete the inline copy at `:1409` so both surfaces draw it from one body. Test in `pubsweep.test.tsx` §9 cross-surface: the board strip contains `.nysmark` when the week head does.

**5-6. Stale rule text.** CONFIRMED: `engine-rules.md:2364-2365` ("A reorder-and-back shows two reorders") contradicts `canonical.ts:230-238` and AM20. Fix: reword to "A reorder-and-back nets to nothing (the ORDER axis compares actual order); the two `mov:` marks are inert and never reach the delta." No code.

**5-7. No door for the same-label reissue on an empty delta.** CONFIRMED: the engine allows it (`publish.ts:703-704`, `correcting`), the head button needs `nd>0` (`html.ts:1312`), the panel needs `dayHasChanges` (`publish.ts:645`). Low: the day is at the corrected content under the prior label. If he wants the door: in `dayStatHTML` compute `const corr=!!(SCHED.correcting&&SCHED.correcting[di])` and offer the button when `(nd||corr)`, title "Reissue ALn — the correction matches the previous version"; same term in `pendingPublishDays`.

**5-8. The Unpublish arm survives a page change and the view-as flip.** CONFIRMED: `UNPUBARM` is cleared by `setDayPreview` (`view.ts:815`) and the session/week resets (`:786`), not by `setPage` (`:429-499`) or `toggleRole` (`store.ts:368-380`). Minor (the warn was shown once; the second tap still needs the same button). Fix: in `setPage`, beside `if(p!==CURPAGE)setAvailWin(null);` add `if(p!==CURPAGE)setUnpubArm(null);` (and `RESTARM=null`, which has the same doctrine "any navigation cancels it").

**5-9. The bid-against warn is narrower than AM37's words.** CONFIRMED: `sync.ts:1194-1195` warns only when the ledger without this credit goes below zero (reviewer-agreed, Fable#5/Codex GU-P2-009). Not claimed as a defect — **Q5** for him: does "bid against" mean "a bid draws on it" or "he would go negative"? No fix until he answers.

**5-10. Undo of a publish does not append the issuance to `retired` or set `correcting`.** CONFIRMED: `sched-commit.ts:300-308` (comment: the forward button writes `retireIssued`; the undo path defers the audit line to Step 5). AM32 says undo "runs the same unpublish", AM4 says every issuance is kept. Invisible on any screen today (no reader of `retired`), silent by AM35 — record as a rule/code gap (**Q6**) for the database step, not a walk finding.

**5-11. Stowed-plan signatures can revive after an unpublish (S12).** PREDICTED from `currentBind` (`publish.ts:833`: `base: dayCurVer(di)`) and `draftSelect` restoring the blob's `signBind` (`drafts.ts:267-268`): a plan signed at base ORIG reads valid again once AL1 is unpublished and the day is back at ORIG, though AM34 says unpublish clears "that day's sign-offs". Whether that is wrong is **Q4** for him (AM11 pulls the other way). If he wants them cleared: in `unpublishDay` also blank `sign/signBind` on every entry of `SCHED.drafts[di]`.

**Questions to file (not asked mid-run):** Q3 (5-4 phone panel), Q4 (5-11 plan signatures after unpublish), Q5 (5-9 meaning of "bid against"), Q6 (5-10 undo path vs the retired log). Q1 is closed by the code (fix the `[AMEND]` line); Q2 (D148 sequencing) is unchanged — S13 records what the app does today.
