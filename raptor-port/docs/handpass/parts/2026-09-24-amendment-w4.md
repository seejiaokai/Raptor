# [HUMAN-RETEST] the amendment system — walker w4: the money and inputs on a published day (24 Sep 26)

Walker **w4** of the fanned-out walk (brief: `raptor-port/docs/superpowers/briefs/2026-09-24-amendment-walker-brief.md`).
Subject: **OIL on the Leave War** (earned leave — time off banked, never pay, D25) and **inputs landing on a
published day**. Judged against the LIVE lines of the register
(`raptor-port/docs/superpowers/specs/2026-09-24-amendment-behaviour-register.md`); scenario numbers are Fable's
(`raptor-port/docs/handpass/2026-09-24-amendment-fable-scenarios.md` §3) and Astra's ranks
(`raptor-port/docs/handpass/2026-09-24-amendment-astra-scenarios.md` §3).

**The rig.** The production build already served at `http://localhost:4173` (not rebuilt, not restarted). **That
bundle predates the host's fix commit `7c69bd58`** (14:29): two things seen here are already fixed in the source
(marked "fixed in source" below). Every script opens the everything week
(`raptor-port/docs/handpass/2026-09-24-amendment-week.json`) in its own browser context, admin unless it says
member, desktop `1440×900` and phone `390×844`. Everything was driven through the app's own controls; `window.*`
was read only to record what the book holds. Scripts: `raptor-port/scripts/handpass/am/w4-*.mjs` (helpers
`w4-lib.mjs`); each prints PASS / FAIL per check, so re-running a script **is** the re-walk. Pictures:
`raptor-port/docs/img/handpass/2026-09-24-amendment/w4/` (file names below; `-desktop-` / `-phone-` in each name).
**No console errors, page errors or failed requests in any run.**

## 1. The FAILs at a glance

| # | what the screen does | rule | widths | reproduces |
|---|---|---|---|---|
| **F1** | A holiday declared on the Leave War for an **already-published** day: the day shows "1 pending" at once, but its warning list only says *"This day started earning OIL after it was published — publish it again so the OIL lands"* **after the page is reloaded** | AM47 ("…the day says so"); brief: a lag until a reload is a finding | both | every time |
| **F2** | Un-accept, then re-accept, an input whose row was **issued**: the day reads **"2 pending · 1 removal"** though it is identical to the issued version, the four sign-offs come back, and **"Publish AL2" is live** for that phantom change | AM20, AM21 (and AM11 vs AM14) | both | every time |
| **F3** | Un-accept, then **Load AL1 onto the working copy**: the row comes back but the input stays "removed" — the day reads "1 pending · 1 input filing" — and the input's **"→ Ground" does nothing** (no message, no change) | Fable's door list ("the load replaces the content only"); house rule: a control never silently does nothing | both | every time |
| **F4** | An **"Other" filed under Unavailable** has no Undo / → Ground on its row (board or week); the only ways back are the top-bar Undo straight away, deleting the input, or changing its type | AM14 ("putting it back restores them"); roll-call door rule | both | every time |
| **F5** | Two OIL advisories print their **internal code as the heading**: "OIL_UNPUBLISHED" (a weekend not yet published) and "OIL_STALE_DAY" (a holiday declared after publishing) | AM47 / AM48b (the reminder he asked for); plain wording | both | every time |
| F6 | *(minor — no register line; **fixed in source** `7c69bd58`)* the armed "Withdraw — confirm" survives leaving the page: warned, go to the Leave War, come back, one tap withdraws | Fable §5-8 / Astra 33 | both | every time on this bundle |

Not FAILs, recorded for him: **Q5** (the narrow "bid against" case, §3.2 C); **AM43** (NOT BUILT — the issued face's
Unavailable list changes silently, §3.6); **"Not yet signed" beside four valid sign-offs** under D45 (wording, §3.5).

## 2. Totals per walk (last run of each)

| script | what | desktop | phone |
|---|---|---|---|
| `w4-01-s7-money.mjs` | S7 + Astra 15 C | 57 PASS · 0 FAIL | 57 PASS · 0 FAIL |
| `w4-02-s8-withdraw.mjs` | S8 (+ Astra 33 in passing) | 11 PASS · 1 FAIL (F6) | 11 PASS · 1 FAIL (F6) |
| `w4-03-s26-oilearn.mjs` | S26 | 10 PASS · 1 FAIL (the ⓘ panel, not mine — §6) | 9 PASS · 1 FAIL (same) |
| `w4-04-bid-publish.mjs` | AM48c + Astra 15 A/B/C + Astra 1 | 62 PASS · 0 FAIL | 62 PASS · 0 FAIL |
| `w4-05-s27-allavail.mjs` | S27 + Astra 21 + R22 | 16 PASS · 0 FAIL | 15 PASS · 0 FAIL |
| `w4-06-s10-inputs.mjs` | S10 + Astra 22 + Astra 10 + R21 + AM43 | 16 PASS · 2 FAIL (F2, F4) | 15 PASS · 2 FAIL (F2, F4) |
| `w4-10-reaccept.mjs` | F2 / F3 in isolation | 5 PASS · 4 FAIL (F2, F3) | 6 PASS · 3 FAIL (F2, F3) |
| `w4-07-s28-export.mjs` | S28 + Astra 6 + R17 | 12 PASS · 0 FAIL | 12 PASS · 0 FAIL |
| `w4-08-r38-holiday.mjs` | Astra 38 | 7 PASS · 1 FAIL (F1) | 7 PASS · 1 FAIL (F1) |
| `w4-09-r36-warnings.mjs` | Astra 36 + R19 | 7 PASS · 0 FAIL | 7 PASS · 0 FAIL |
| `w4-11-warn-titles.mjs` | R19 headings | 1 PASS · 2 FAIL (F5) | 1 PASS · 2 FAIL (F5) |
| `w4-00d-unavail-door.mjs` | F4 in isolation | 1 PASS · 1 FAIL (F4) | 1 PASS · 1 FAIL (F4) |
| `w4-00e-phone-figsheet.mjs` | seen in passing (§6) | 2 PASS · 0 FAIL | 1 PASS · 1 FAIL |

Probes that only record (no verdicts): `w4-00-probe.mjs`, `w4-00b-whobids.mjs`, `w4-00c-warnprobe.mjs`, `w4-00f-ph-why.mjs`.

## 3. The scenarios

### 3.1 S7 (+ Astra rank 15 branch C) — walk the money on the published Saturday

**Setup.** Everything week; Saturday 18 Jul issued as its Original; Fable (`plasma`) on the SDO desk 08:00–18:00,
his Saturday box `FO*`, OIL figure 1. **Steps** (each followed by: the edit week's Saturday head, the view page's
Saturday, Fable's Leave War box and his OIL figure from his figure sheet, all photographed): Unpublish the Original →
sign four + Publish day → take Fable off the desk (desktop: right-click; phone: drag the puck onto his row's own text)
→ sign + Publish AL1 → Unpublish AL1 → Undo → Undo → Redo → Redo → reload. Desktop undoes from the top bar; the
phone undoes from **the Leave War's own Undo/Redo**, so the box is watched changing in place.

| step | tag · viewer | Fable's box · OIL | expected (rule) | result |
|---|---|---|---|---|
| baseline | ORIG · ORIG | FO* · 1 | AM46 | PASS |
| Unpublish Original (two taps — §3.2 A says why) | DRAFT · none | — · 0 | AM37c, D142 | PASS |
| sign + Publish day | ORIG · ORIG | FO* · 1; sign-offs spent | AM8, AM10 | PASS |
| Fable off the desk (working copy) | ORIG · ORIG, "2 pending", "Not yet signed" | FO* · 1 (unchanged) | AM47 | PASS |
| sign + Publish AL1 | AL1 · AL1 | **HO\*** · 0.5 | AM46 — AL1 pays; he is now free all day and the FAMILY DAY crowd frozen at AL1 holds him (D44), so a half day, not the desk's full day | PASS |
| Unpublish AL1 | ORIG · ORIG, "2 pending", sign-offs cleared | FO* · 1 | AM37c, AM34 | PASS |
| Undo (the unpublish) | AL1 · AL1 | HO* · 0.5 | AM39 | PASS |
| Undo (the AL1 publish) | ORIG · ORIG, pending, sign-offs cleared | FO* · 1 | AM39, AM39c | PASS |
| Redo | AL1 · AL1, sign-offs cleared | HO* · 0.5 | AM39c | PASS |
| Redo | ORIG · ORIG, pending | FO* · 1 | AM39 | PASS |
| reload | ORIG · ORIG, pending | FO* · 1 | persistence | PASS |

**No lag anywhere:** every box matched its version tag on first read; on the phone the Leave War's own Undo/Redo
changed the box in place (FO* → HO* → FO* …). Fable's "Redo twice → AL1" in the scenario text is one step off: the
second Redo re-applies the unpublish, so Original is current — the app agrees with the timeline. The toast on every
Saturday publish says *"Saturday 18 Jul: the SXO and OPS DESK desks have no usable times, so nobody on them earns
OIL"* (AM48d / D81 — right). Pictures: `s7-{desktop,phone}-NN-<step>-{edit,view,lw}.png`, `s7-*-03a-board-after-removal.png`,
`s7-phone-*-in-place-*.png`.

### 3.2 S8 — "Withdraw — confirm" when a weekend's credit is already spent

**A. Saturday as saved.** The first tap on Unpublish **warns and arms** ("Heads up — Saturday's OIL credits are bid
against on the Leave War…", the button turns amber "Withdraw — confirm"). That is right by AM37: two men credited on
Saturday have that half day already used — Wisp by the OIL he took on 14 Jul, Outlaw by his opening debt. The OIL
tracker spends the **oldest credit first and, with no expiry set, a credit earned later backs an earlier debit**, so
neither row lists a Saturday credit with anything left (`s8-*-A1-tracker-wisp.png`, `s8-*-A2-tracker-outlaw.png`).
Consequence worth knowing: on this week **every** Unpublish of Saturday takes two taps. PASS.
Then Astra rank 33 / Fable §5-8: with the warning armed, go to the Leave War and come back, tap once — **the day is
withdrawn with no second warning** (the button still read "Withdraw — confirm" on return, so it was visible) → **F6**,
already fixed in source (`src/state/view.ts:452-457`, commit `7c69bd58`). `s8-*-A3-*`, `s8-*-A4-*`.

**B. Sunday and Dash — the real case.** Sunday credits only Dash (`FO*`, balance 3.5). OIL bids for Dash on 3, 4, 5
Aug (whole days) and 6 Aug (morning) through the bid sheet take him to exactly 0. First tap on Sunday's Unpublish:
warning + "Withdraw — confirm" (AM37) PASS; second tap: withdrawn, Sunday's box empty, Dash at −1 PASS; republish:
`FO*` back, Dash at 0 PASS. Fable's "LW shows the clash '!' in the gap": nothing is marked on the August bids — the
only sign is the red −1 figure (recorded; no register line promises a mark). `s8-*-B1…B7`.

**C. The narrower case (Q5 — recorded, not judged).** Give Dash a hand award (+1 FO) dated Wed 22 Jul. His August OIL
still draws on Sunday's credit (oldest first — the tracker then shows only "+1 15 Aug FLT 1 left"), but without
Sunday he would still be at 0, so **Unpublish withdraws on one tap with no warning**; afterwards his balance reads 0
and the tracker shows the later credits covering the August bids. `s8-*-C1…C5`. This is Fable's Q5 exactly: does
"bid against" mean "a bid draws on it" or "he would go below zero"?

### 3.3 S26 — OIL Earn on the published Saturday: one man off → an amendment → his box only

Board → OIL Earn (desktop: the bar's "OIL Earn"; phone: the day's own "OIL Earn" button) → tap Fable's puck on the
SDO desk (toast *"Fable earns nothing from SDO"*) → leave the mode. The day reads **"1 pending"** (AM48a / D24) PASS;
the Amendments panel says **"Sat · 1 change · what this day earns changed"** (AM25) PASS (desktop; the panel is hidden
on a phone). **Nothing moved on the war before publishing** (AM47) PASS. Sign + Publish AL1: of every man's Fri / Sat /
Sun boxes, **only Fable's Saturday changed** (`FO*` → empty) and his figure fell to 0 (AM46, AM48) PASS at both widths.
The ⓘ day panel said "No amendment has touched this day yet" with no unpublished-edit count while the head said
"1 pending" — that is Fable S3 / Astra 4, another walker's scenario, **fixed in source** `7c69bd58` (§6).
`s26-{desktop,phone}-1…8.png` (`-6-dayinfo` is the ⓘ panel).

### 3.4 AM48c + Astra rank 15 (A, B, C) + Astra rank 1 — a weekend that earns for a man with an undecided bid

A = Fable (the SDO), B = Cotter (`spanner`, ground crew, nothing on Saturday). Unpublish the Original; A files an
undecided **LL** bid for 18 Jul on the war; then:

| step | tag · viewer's SDO | A's box · tap list | B | rule | result |
|---|---|---|---|---|---|
| Publish day | ORIG · Fable | **FO\* !** · "FO — OIL earned (Duty)…" **and** "LL — local leave · bid, not decided yet [Approve Ack Refuse Clear]" | — | **AM48c: bid KEPT, day FLAGGED**; toast *"…Fable's LL bid on 18 Jul now sits on published work — the day is flagged, the bid is still live"* | PASS |
| Unpublish (rank 15 B) | DRAFT | LL (the bid alone) | — | credit off, bid kept | PASS |
| Publish day again | ORIG | FO\* ! · one bid line | — | not doubled | PASS |
| Undo the publish (rank 15 C) | DRAFT | LL | — | AM39 | PASS |
| Redo | ORIG | FO\* ! · one bid line | — | exactly once | PASS |
| AL1: A off the desk (rank 1) | AL1 · nobody | HO\* ! (the FAMILY DAY crowd frozen at AL1 holds him) · the bid | — | AM46, D44 | PASS |
| AL2: B on the desk | AL2 · Cotter | HO\* ! · the bid | **FO\*** | AM46 | PASS |
| Unpublish AL2 (two taps — §3.2 A) | **AL1** · nobody; working desk still Cotter, "1 pending", Cotter's seat dotted | HO\* ! · the bid | — | AM37c (the AL2-shaped copy pending against AL1) | PASS |
| Unpublish AL1 | ORIG · Fable, "2 pending" | FO\* ! · the bid | — | AM37c | PASS |
| Undo that second unpublish | **AL1** (not AL2) · nobody | HO\* ! · the bid | — | Astra rank 1 | PASS |

**The bid was never deleted or doubled; after every step the version tag, the viewer's face, the marks and both
men's boxes agreed.** The register's note on AM48c is settled by the walk: **the code keeps the bid** — the Leave War
architecture text still says the opposite (§6 P4). Placing the Saturday LL bid, the bid sheet asked *"That takes
Fable to -1 ANNUAL"* though a weekend LL charges nothing (§6 P3). `bid-{desktop,phone}-NN-<step>-{edit,view,lw,lw-taplist}.png`.

### 3.5 S27 + Astra rank 21 + roll-call R22 — leave for a man behind the ALL AVAIL puck on the published Saturday

Sign the four on the published Saturday with nothing to publish → toast *"All signed — no changes to publish right
now"* (AM15b) and no Publish button (AM15) PASS. The ALL AVAIL window from the issued face's count chip: FAMILY DAY
10:00–14:00, *"who was free when this day was issued — Original"*, **30**, Ghost listed. File **LL for Ghost on 18 Jul**
on the Inputs page (the toast: *"Ghost is recorded as working 10:00–14:00 on 18 Jul — this LL is filed anyway and
flagged for someone to resolve"*). Then:

| check | expected (rule) | observed | result |
|---|---|---|---|
| the day | pending mark (AM42 / D44) | "1 pending"; panel "Sat · 1 change · what this day earns changed" | PASS |
| the four sign-offs | **stay valid** (AM13 / D45, Astra 21) | Ace / Anvil / Anvil / Anvil; line "Published at Original · 1 change to publish — Publish AL1"; **Publish AL1 open without signing again** | PASS |
| issued face's count chip | unchanged (AM42) | 30, Ghost still in the issued crowd | PASS |
| working-draft peek and board | today's crowd | 29, *"who is free as things stand now"*, Ghost out | PASS |
| the war before AL1 | the credit stands until republished (AM47) | box shows **LL !** (his filed leave outranks the credit on the box face, amber ! = clash); OIL figure still 0.5; the tap list still lists the HO credit | PASS (after the check was corrected to read the money, not the box face) |
| Publish AL1 on the earlier signatures | allowed (D45) | published; Ghost's credit gone; AL1's issued crowd 29 without him | PASS |

Wording for him (not a FAIL): the day head says **"Not yet signed"** right beside four still-valid sign-offs and an open
"Publish AL1" (`s27-desktop-2-edit-after-leave.png`). By AM24 the mark means "differs from what was issued" (the app
also says "new once signed" for "once published"), so it is the rule working — but it reads as a contradiction under
D45. `s27-{desktop,phone}-0…8.png`.

### 3.6 S10 + Astra rank 22 + Astra rank 10 + R21 + AM43 — inputs on a published day

Tuesday 14 Jul (issued Original), Friday 17 Jul (draft). Hex (`rocky`) is the person on the inputs.

| step | expected (rule) | observed | result |
|---|---|---|---|
| sign the four with nothing to publish | the note (AM15b) | "All signed — no changes to publish right now" | PASS |
| Inputs page: an **Other** for Hex, Tue 10:00–11:00 | lands on the working copy as pending (AM41); issued face frozen | "2 pending", panel "Tue · 2 changes · 1 input filing"; the row on the working programme, not on the issued face | PASS |
| the signatures given before it | cleared; Publish locked (AM14, AM11) | four blank; "Publish AL1" locked | PASS |
| Undo the landing | still a filing change (AM14) | "1 pending · 1 input filing", input dormant | PASS |
| → Ground, sign, Publish AL1 | the row goes out, AL1-tinted (AM21b) | AL1; the row on the issued face, solid AL1 mark; panel "AL1 Tue · 2 items · 1 input filing · appr Anvil" | PASS |
| sign on AL1, then un-accept (Astra 22) | fresh signatures required | four blank; "Publish AL2" locked | PASS |
| → Ground again | back exactly as issued (AM20); names back (AM11) | names back **but "2 pending · 1 removal" and "Publish AL2" live** | **FAIL — F2** |
| un-accept, then Load AL1 onto the working copy (rank 10) | the Inputs record kept; content replaced | record kept (PASS); but the input stays dormant beside AL1's row: "1 pending · 1 input filing"; → Ground then does nothing | **FAIL — F3** (isolated in `w4-10-reaccept.mjs`) |
| a second Other → Undo → **→ Unavail** | filing-only change needs signatures (AM14) | "2 pending · 2 input filings", four blank | PASS |
| the door back out of Unavailable | an Undo / → Ground on the row | the row offers only its type label (the edit dialog) and the LATE chip | **FAIL — F4** |
| Friday (draft): file first, then publish (rank 10 A) | part of the Original, nothing pending | ORIG, nothing pending, the row on the issued face | PASS |
| **member** (View-as Ranger) files LL on Tue on the Inputs page | accepted | filed | PASS |
| AM43 (NOT BUILT) — issued face's Unavailable | recorded, not judged | the member's own view and the admin's view of the **issued** Tuesday list "LL: Ranger" at once (also the Other filed under Unavailable); nothing pending for the leave | recorded |

`s10-{desktop,phone}-*.png`, `reacc-{desktop,phone}-*.png`, `unavdoor-{desktop,phone}-*.png`. (A first S10 run
before the script's door fix left extra pictures — `s10-*-3-unavail-*`, `-3b-*`, `-4a-*`, `-4b-*`, `-4-al1-*`,
`-5-unaccepted-*`, `-5b-*`, `-7-fri-issued`, `-8-*`: superseded, kept for the host to drop.)

### 3.7 S28 + Astra rank 6 + roll-call R17 — export and print after working-copy edits

Monday: AL1 issued, working copy's VL take-off 07:45 (pending AL2). Tuesday: renamed its first flying line to
**W4LEAK** on the working copy ("1 pending"). Export CSV and Print at both widths:
- CSV (`142-schedule.csv`, 5,685 bytes): Monday's VL take-off **12:40** (AL1's), never 07:45; Tuesday reads **VL**,
  no W4LEAK anywhere — AM50 PASS. Whole week, flying lines only (AM50 PARTLY BUILT — not a finding).
- Print: *"142 — Flying Programme · Mon 13 Jul – Sun 19 Jul · Generated … · published schedule"*; per-day stamps
  **"PUBLISHED — AL1"** (Mon), **"PUBLISHED — ORIGINAL"** (Tue, Thu, Sat), **"WORKING DRAFT — NOT YET SIGNED"** (Wed)
  — PASS; no working-copy value printed — PASS. Friday and Sunday (no flying lines) are **not printed at all** (§6 P7).
- Undo before and after: *"Undo — a note on the schedule"*, enabled — unchanged (AM36) PASS; the working copy still "1 pending" PASS.
- Both buttons reachable at 390px. Toasts: "CSV downloaded", *"Print dialog opened — choose "Save as PDF""*.
`s28-{desktop,phone}-1-tue-renamed.png`, `-2-print-page.png` (the print page rendered from the very HTML the app
hands the print dialog), `-3-after-export.png`.

### 3.8 Astra rank 38 — a holiday declared on an already-published ordinary day

Tuesday (issued Original, an ordinary day) → the Leave War's event row for 14 Jul → "PH". **No credit lands** (AM47)
PASS; the day reads **"1 pending"**, panel **"Tue · 1 change · what this day earns changed"** PASS. **But the warning
list does not say it**: 4 issues · 2 warnings, none about OIL. After a **reload** the same day reads 6 issues ·
3 warnings including *"This day started earning OIL after it was published — publish it again so the OIL lands"* and
*"the ground programme has no usable times — nobody on it earns OIL for this day"* → **F1**. Sign + Publish AL1 → the
toast *"Tuesday 14 Jul: the ground programme has no usable times, so nobody on it earns OIL"* (D81), and **19 of the
21 men on Tuesday's lines and desks are credited** (FO\*/HO\*) PASS; the advisory is gone after AL1 PASS.
`r38-{desktop,phone}-1…6.png`, `-4-edit-after-ph.png` (before the reload) vs `-4b-edit-after-reload.png` (after).

### 3.9 Astra rank 36 + R19 — a working-copy fix of an issued cross-day warning

The everything week already carries one: Outlaw lands 20:45 on Monday and flies Tuesday's 08:40 VL → a crew-rest
breach on Tuesday. Take Outlaw off Monday's evening line **on Monday's working copy** (Monday is at AL1):
- edit week Tuesday: the breach is **struck through, "goes away once signed"** (AM51) PASS;
- view page, **issued** Tuesday: the breach stays — checked against Monday's published AL1 (AM51, AM51b) PASS;
- view page, working-draft peek: struck, "goes away once signed" (AM51e) PASS;
- the member's issued Tuesday shows the same breach as the admin's (AM51e) PASS.
(The first phone run's drag dropped Outlaw onto another line's seat — a swap, toast "Tally is a WSO — cannot fly FCP"
— the driver's miss, looked at before judging; re-driven by dropping the puck on his own line's text: PASS.)
`r36-{desktop,phone}-1…5.png`.

## 4. The findings in full

**F1 — a holiday declared after publishing reaches the day's warning list only after a reload.** *Start:* everything
week, admin, Edit Schedule. *Steps:* Leave War → the event row cell for Tue 14 Jul → type "PH" → Apply → Edit
Schedule → open Tuesday's warning strip. *Screen:* "1 pending" (live) but no OIL advisory; reload → *"This day started
earning OIL after it was published — publish it again so the OIL lands"* appears. *Register:* AM47 — a holiday
declared after publication waits for a republication **and the day says so**. Every time, both widths
(`w4-08-r38-holiday.mjs`, `w4-00f-ph-why.mjs` records the codes before/after). *Why, as far as I looked:* a Leave War
write re-runs the OIL pass (`src/leavewar/sync.ts:1444`, the `lwSubscribe` lane) but never the scheduler's checks;
the advisory is added only by `validate()` (`src/engine/validate.ts:1273`), which runs on scheduler writes. So the
explanation of an unexplained "1 pending" is exactly the thing that lags. The same lane feeds any Leave War change
that alters what a day earns (an Off day tag, a PH removed → `OIL_STALE_HOLIDAY`) — not driven, same path.

**F2 — un-accept then re-accept an issued input row: a phantom amendment, publishable on old signatures.** *Start:*
Tuesday issued; file an Other for Hex on Tue on the Inputs page (it lands); sign; Publish AL1. *Steps:* sign the four
on AL1 (nothing to publish) → board → Personal Inputs → Undo on the input → → Ground. *Screen:* "2 pending",
"Published at AL1 · 2 changes to publish — Publish AL2", **four sign-offs named, Publish AL2 enabled**, panel
"Tue · 2 changes · 1 removal" — while the day is identical to AL1 (`reacc-desktop-A2-after-reaccept-edit.png`).
*Register:* AM20 (a pending mark means "differs from what was issued" — change it back and it clears); AM21 (a
removal is a real item only when something issued is gone); and AM11 vs AM14 pull apart here: the names come back
because the content matches, while the day still claims two changes. *Consequence:* the scheduler sees two changes he
did not make, and one tap publishes an AL2 recording a removal that never happened. Every time, both widths
(`w4-10-reaccept.mjs` A, `w4-06-s10-inputs.mjs`). *Why:* `unacceptInput` removes the issued row and records its
deletion (`src/engine/slots.ts:597-615`); `acceptInput` pushes a **new** row (`src/engine/slots.ts:402-457`), which gets
a new identity, so the comparison sees "issued row removed + new row added" instead of "put back".

**F3 — after "Load onto working copy", the input is stuck and "→ Ground" is dead.** *Start:* as F2 up to AL1.
*Steps:* Undo on the input → plans menu → AL1 (read-only) → "Load onto working copy" → "Discard 1 edit & load —
confirm" → → Ground on the input. *Screen:* the toast says AL1 was loaded; the ground row is back (AL1's own row), but
the input stays faded/"removed" with its → Ground / → Unavail buttons, the day reads "1 pending · 1 input filing" and
**→ Ground does nothing** — no toast, no change (`reacc-desktop-B2-accept-after-load.png`). *Register / doors:*
Fable's door list — loading replaces the content only, the filing stays; the house rule that a control never silently
does nothing. *Consequence:* a day that is back to its issued content still carries a pending filing change that no
control on screen can clear (only publishing it, which would issue "input removed" while the input's row is on the
programme). Every time, both widths. *Why:* `acceptInput` refuses when a row with this input's id is already on a day
(`src/engine/slots.ts:435`, "this EXACT input already has a landing") and the accept handler shows nothing when it
refuses (`src/ui/interactions.ts:517`); `reconcileLandedAcc` (`src/engine/slots.ts:519`) only repairs inputs with no
filing state, never a "removed" one.

**F4 — no door back out of Unavailable for an "Other".** *Start:* Tuesday issued. *Steps:* file an Other for Hex →
board → Personal Inputs → Undo → → Unavail. *Screen:* toast *"Hex's Other filed under Unavailable"*; the input leaves
Personal Inputs and appears under Unavailable with only its type label (opens the edit dialog: Delete / Cancel / Save
and the type list) and the LATE chip — **no Undo, no → Ground** (`unavdoor-desktop-1-unavailable-row.png`,
`s10-*-7c-unavail-row-on-board.png`). *Register:* AM14 ("…filed under Unavailable … putting it back restores them"
— there must be a way to put it back); the engine supports it (`unacceptInput` handles a filed input). *Consequence:*
a mis-tap on → Unavail on a published day becomes a pending filing change that can only be reversed by the top-bar
Undo right away, by deleting the man's input, or by changing its type. Every time, both widths. *Why:* the accept
control is drawn only in the Personal Inputs group, and that group drops filed inputs (`src/ui/board-html.ts:712`,
`src/ui/html.ts:1829`); the Unavailable group draws no accept control (`src/ui/html.ts:1833`).

**F5 — two OIL advisories show their internal code as the heading.** *Steps:* (a) Unpublish Saturday (two taps) →
open its warning strip: *"OIL_UNPUBLISHED — This day is not published yet, so nobody earns their OIL for it — publish
it before the day is out"*; (b) the F1 steps + a reload: *"OIL_STALE_DAY — This day started earning OIL after it was
published…"* (`wt-{desktop,phone}-1-sat-draft-warnings.png`, `-2-tue-ph-warnings.png`). Every other warning has a
plain heading ("Crew rest (<12h)", "Long work day", "No OIL earned — a row has no usable times"). *Register:* AM47,
AM48b (the reminder he asked for is this advisory); the plain-wording rule. *Why:* `src/engine/validate.ts:20-32`
(`WCODE`) has no entry for `OIL_UNPUBLISHED` or `OIL_STALE_DAY` (nor, by reading, `OIL_NO_PERIOD` /
`OIL_STALE_HOLIDAY`), and the list falls back to the code (`wlbl(WCODE[w.code] || w.code)`).

**F6 — (fixed in source) the armed Withdraw survives a page change.** Steps and pictures in §3.2 A. Re-walk with
`w4-02-s8-withdraw.mjs` on the next build.

## 5. Roll-call rows R17, R18, R19, R21, R22 (evidence sheet §4)

| # | place | SHOWS | ACT | PAINTED WITH | walked |
|---|---|---|---|---|---|
| R17 | Export (CSV) and print | the **issued** version of each published day (Mon AL1's 12:40, never the working 07:45; Tue "VL", never W4LEAK); a draft day's working copy; print stamps "Published — AL1" / "Published — Original" / "Working draft — not yet signed"; flying lines only, whole week (AM50 PARTLY BUILT); a day with no flying lines is absent. No marks, pending, plans or sign-offs | the edit toolbar's two icons (admin's edit page), reachable at 1440 and 390; toasts "CSV downloaded" / "Print dialog opened…"; Undo unchanged (AM36) | the toolbar row: week window, highlighter; the print carries "RESTRICTED" top and bottom | S28, Astra 6 — both widths |
| R18 | Leave War OIL cells | FO\* / HO\* per man per day from the **latest published version**, moving at once on publish, AL, unpublish, undo, redo (no lag; in place from the war's own Undo/Redo); an undecided bid kept under the credit; amber **!** on a clashing day; the box face shows ONE code (filed leave outranks a credit); the OIL figure (figure sheet) and the tracker (oldest credit first) | tap → the tap list (credit + bid with Approve / Ack / Refuse / Clear) or the bid sheet (+OIL award, PO, PI); the war's Undo/Redo drive the one timeline | bids, filed leave, the amber !, the balance column (+LVE by default), the open-bidding box; the toast strip at the foot | S7, S8, S26, S27, AM48c, Astra 1 / 15 / 38 — both widths |
| R19 | Warnings list on a published day (edit and view) | edit face: the working copy's warnings, an issued warning the working copy clears **struck "goes away once signed"**; view page issued face: the issued version's (the crew-rest breach stays); working-draft peek: the working copy's; member = admin face. **MISSING:** a Leave War PH reaches the list only after a reload (F1); two OIL advisories headed by an internal code (F5) | tap to review / collapse; ✕ hides a check (edit only) | the red strip under the day head; the red ring on the flagged puck (Outlaw on the issued face) | Astra 36, 38; S7 (D81 toast) — both widths |
| R21 | Inputs page / + Add — a request on a published day | an activity input (Other) lands on the working copy as pending ("2 changes · 1 input filing"), never on the issued face; a leave goes to Unavailable on the working copy **and on the issued face at once** (AM43 NOT BUILT) with no pending mark; the LATE chip; the "…filed anyway and flagged" toast for a man recorded as working | the Inputs page form (admin picks the person; a member files for himself); the board's Personal Inputs: → Ground, → Unavail, Undo. **MISSING:** no way back out of Unavailable (F4); → Ground dead after a load (F3); re-accept makes a phantom amendment (F2) | the Personal Inputs / Unavailable panels, the LATE chip, the clash warnings, the sign-off strip clearing | S10, S27, Astra 10 / 22 — both widths |
| R22 | ALL AVAIL window from a published day | issued face: *"who was free when this day was issued — Original"*, 30, the frozen crowd (Ghost in after his leave); working copy (view page Working draft, the board): *"who is free as things stand now"*, 29, Ghost out; after AL1: *"— AL1"*, 29 | tap the count chip → the window (pilots left, WSOs right); ✕ closes | the ALL AVAIL puck and its count chip in the FAMILY DAY row; the window floats over the schedule | S27, Astra 21 — both widths |

## 6. Seen in passing (outside my list)

- **P1 — the ⓘ day panel misses an OIL-only change** (Fable S3 / Astra 4): "No amendment has touched this day yet",
  no unpublished-edit count, beside "1 pending" (`s26-desktop-6-dayinfo.png`). **Fixed in source** `7c69bd58`.
- **P2 — phone Leave War: a man's figure sheet sends the grid back to 1 January.** Tap a callsign on the phone → the
  grid behind jumps to JAN 01 and stays there after the sheet closes (July is no longer drawn); the desktop keeps its
  place (`w4-00e-phone-figsheet.mjs`; `figsheet-phone-1…3.png`). Not an amendment rule — a Leave War item to file.
- **P3 — the bid sheet overstates a weekend LL.** Placing an LL bid for Fable on Sat 18 Jul asked *"That takes Fable to
  -1 ANNUAL"*; his LVE figure stayed 0 afterwards (a weekend LL charges nothing). Leave War; to file.
- **P4 — stale text about AM48c.** `.claude/rules/decisions/leave-war.md:259` §Architecture: *"publishing a weekend/PH day
  replaces a clashing bid inside the publish command"*; `src/state/sched-commit.ts:508` (the comment above
  `publishGate()`): *"weekend / PH work replaces a clashing leave bid"*. The walk shows the code **keeps** the bid and
  flags the day (§3.4). The newer ruling (AM48c, 20–21 Sep 26) wins; the two texts need marking.
- **P5 — a phone drag-off says nothing.** Right-click removal toasts "Fable removed"; the phone's drag-off removal
  (drop the puck on the row's text) removes silently. Minor.
- **P6 — "Not yet signed" beside four valid sign-offs** under D45 (§3.5) — wording, for him.
- **P7 — the print and CSV list flying lines only**, so a published day with no flying (Sunday) is absent from the
  printed programme, and the print's header says "published schedule" while Wednesday prints as a working draft
  (its own stamp is right). AM50 is PARTLY BUILT; noted, not a finding here.

## 7. Explicit negatives — checked and found right

- The money follows the version tag at every step of publish / AL / unpublish / undo / redo / reload, at both widths,
  with no lag (S7, Astra 1, 15); a working-copy change never moves the war before publishing (S7, S26, S27, Astra 38).
- Unpublish of the latest version only; AL2 peels to AL1, AL1 to the Original; Undo of the second unpublish restores
  AL1, never AL2 (AM34, AM37c, Astra 1).
- Sign-offs: spent by every publish; cleared by a content or filing change; restored when the change is put back
  (except F2); kept under an availability-only change (D45); the "All signed — no changes to publish right now" note
  and no Publish button on a day with nothing to publish (AM15, AM15b).
- An undecided bid is kept and the day flagged on every publish; the bid is never deleted or doubled (AM48c).
- OIL Earn changes only the man switched off, only on that day (AM48).
- The frozen ALL AVAIL crowd on the issued face vs today's crowd on the working copy (AM42 / D44).
- Export and print carry the issued values and label each day's version; neither touches Undo (AM36, AM50).
- The issued face keeps its issued warnings while the working copy's fix is struck "goes away once signed" (AM51).
- No console errors, page errors or failed requests in any run.

## 8. What I could NOT walk, and why

- EOD (deferred, AM52) and a correction logged by a shared database (AM35) — neither exists.
- The Amendments panel on a phone — it is hidden at 390px, which is his open question (Fable §5-4, another walker's
  scenario); my phone runs record "(the panel is hidden on a phone)" and read the day head instead.
- The member path of S27: the leave for Ghost was filed by the admin through the Inputs page's person picker (the
  member path was walked in S10, part 4, for Ranger's own leave).
- `OIL_NO_PERIOD` and `OIL_STALE_HOLIDAY` headings — read in the code (same fallback as F5), not driven.
- A real phone: every phone run is Chromium at 390×844 driven by a mouse (pointer events), not a touch screen or Safari
  (bug-check order §7.9); the drag-off door is proven only in Chromium.
- The bundle at :4173 predates `7c69bd58`, so the host's five fixes are not re-walked here (F6 and P1 re-walk on the
  next build with `w4-02` and `w4-03`).

## 9. Pictures I opened and looked at

`probe/p-desktop-lw-plasma`, `probe/p-phone-lw-plasma`, `probe/p-phone-lw-plasma-fig`; `s7-desktop-04-…-edit` (first
run — the head hidden under the bar; framing fixed and the desktop walk re-run), `s7-desktop-06-unpublished-al1-edit`
(re-run), `s7-desktop-05-published-al1-{lw,view}`, `s7-phone-04-amended-working-copy-edit`,
`s7-phone-07-undo1-unpublish-undone-lw`; `s8-desktop-A1-tracker-wisp`, `s8-desktop-A4-sat-tap-after-leaving-and-returning`,
`s8-desktop-B3-sun-first-tap`, `s8-desktop-B6-lw-aug-after-withdraw`, `s8-desktop-C2-tracker-dash-award`;
`s26-desktop-3-oilmode-after-tap`, `s26-desktop-6-dayinfo`; `bid-desktop-04-published-with-bid-lw-taplist`,
`bid-desktop-11-al2-unpublished-{edit,view}`; `s27-desktop-2-edit-after-leave`, `s27-desktop-3-issued-window-after`,
`s27-desktop-4-working-window`; `s10-desktop-3-unavail-board` (first run); `unavdoor-desktop-1-unavailable-row`;
`reacc-desktop-A2-after-reaccept-edit`, `reacc-desktop-B2-accept-after-load`; `s28-desktop-2-print-page`;
`r38-desktop-4-edit-after-ph`, `r38-desktop-4b-edit-after-reload`; `r36-desktop-2-edit-after-fix`,
`r36-desktop-3-view-issued`; `wt-phone-1-sat-draft-warnings`; `figsheet-phone-3-after-close`. The rest are the
walk's record: every check behind them is in the script output, and they were not each opened.
