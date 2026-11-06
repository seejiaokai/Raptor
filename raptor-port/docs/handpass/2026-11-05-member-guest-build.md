# The member / guest build — the bug check (5 Nov 26)

`claude/member-guest-checks`, pull request 638 — his four approved items from the morning of 5 Nov 26, built as one batch
(D1087, D485): **1** the screen after asking for access, the pass ([ACCESS-WAIT-LOOK] — D1650, D1654, D1656); **2** the
"Not saved" band's strip look everywhere, the OIL bar alike ([SAVEBAND-LOOK] — D1655); **3** the band on the access screens,
the guest page and the sign-in ([GUEST-SAVE-WARNING] — D1657); **4** a member's own Scheduler tick on Quals read only
([MEMBER-SCHED-TICK] — D1651). Commits `af8be973e` (4) and `6dd252ef3` (1–3) on top of the check of the night
(`handpass/2026-11-05-member-guest.md`). Pictures: `docs/img/handpass/2026-11-05-member-guest-build/` — `look/` (the
host's look beside the drawings), `walk/` (the Sonnet walk), `rewalk/`. Parts: `docs/handpass/parts/mgb1105/`.

## 1. The eight questions and the tier

| # | Question | Answer |
|---|---|---|
| 1 | Money (OIL) | NO — the OIL bar's look changes, not what it asks or credits |
| 2 | The published record | NO — the Scheduler tick decides who may SIGN, but who signs is unchanged for an admin; a member could not sign before either |
| 3 | Saved data | NO new field; YES that a member's command that changes `quals.sched` is now refused at the commit gate (a write that saved before no longer saves) |
| 4 | A shared drawer | YES — the band's words and Retry (`SaveStatus.tsx Warning`) are drawn in the top bar, the board's bar, the Leave War's OIL tracker (grid and settings), and now the sign-in, access and guest screens; the OIL bar in the top bar and the board's bar |
| 5 | A new gesture or mode | NO — Retry, Answer OIL and OK are the same buttons |
| 6 | A new surface | YES — the waiting screen's pass is a new card |
| 7 | Roles | YES — who may tick Scheduler (D1651); and what a waiting person and a guest are shown |
| 8 | The warning list | NO |

**Tier: FULL** (questions 3 and 7), **with a security read (D1411)** — the change touches who may do what. The server
question (§5) is carried by `perms.test.ts` and `perms-scan.test.ts` (both green); §11's Person and QualMark notes now name
the Scheduler tick as the admin's (no letters changed).

**The rulings swept:** D1651 (narrows D1510, D149) · D785 (a scheduler is always an admin) · D218 (callsign) · D1650, D1654,
D1656 (the pass) · D1655 (the strip, the OIL bar alike) · D1657 (the band on the three screens) · D587, D841 (the band's
height, place, amber line; a window or sheet has none) · D840 (the OIL bar one line always) · D887 (no glow) · D221, D204 (the
waiting screen's guest button) · D225 (initials never required) · D1625 (anything new is drawn first — all four were) ·
D1495 (the drawing check) · D1557 (the plain-user round) · D1281 (a picture right after each phone tap).
**Clash found: none.** One reading named to him: "the OIL bar restyled alike" — its Answer OIL button made solid amber like
Retry (it was the app's cyan under D840's drawing).

## 2. The roll-call

**The thing: the failed-save band** (`Warning` — the sign, "Not saved" bold, "keep this page open", Retry).

| Place | Has the new look? | Retry works there? | What else is on those pixels |
|---|---|---|---|
| The top bar, every page (Shell) — desktop and phone | has it (`.topbar > .savestat.failed`) | | the page under the bar moves down; the CREW tab, the week arrows, the two movable windows move with it |
| The board's own bar (`SchedBoard` `SaveBand`) — phone, desktop, the phone's Desktop layout (sticky) | has it (`.saveband`) | | the board's bar buttons |
| The Leave War's OIL tracker, grid and settings (`OilTracker` `SaveBand` ×2) | has it | | the tracker's head |
| The Medical view opened full (`MedicalView` `SaveBand`) | has it — but no screen opens it (D620) | — | — |
| The sign-in screen (`Login`) | has it — NEW (`.saveband.is-screen`) | | the screen moved down (`.login.band-up`) |
| Request access, the waiting screen, the suspended screen (`AccessScreen`) | has it — NEW | | the screen moved down |
| The guest page (`GuestApp`) | has it — NEW, the guest bar's last line | | the week strip moves down |
| The Tracker's own save note (shares the class `savestat`) | must NOT change — it is the Tracker's own note in its row; the new rules are scoped to `.sv-msg` / `.saveband`, which it does not have | — | — |
| A window, a sheet, the phone's menu | must NOT — a short visit (D587) | — | — |

**The thing: the OIL bar** (`OilWaitSheet` `Bar` — the sign, "Not swapped" bold, "OIL not answered", Answer OIL, OK).

| Place | Has the new look? | Its buttons work? | What else |
|---|---|---|---|
| The top bar (`OilBar`), with and without the "Not saved" band above it | has it | | |
| The board's own bar (`OilBand`) — desktop, phone, the Desktop layout | has it | | |
| The Medical view full (`OilBand`) | has it — no screen opens it | — | — |
| Each wording: Not swapped / added / moved / put back / filed / un-cancelled / changed | the split reads each (`oilwait.ts WAIT_WORDS`) | | |

**The thing: the screen after asking for access** — one card in each state: guest switch on (View the schedule) / off; a
pilot or WSO with initials and CAT; no initials (D225); personnel (no CAT); a 14-letter callsign; desktop and phone;
the band up; Sign out.

**The thing: a man's Scheduler tick** — every door that changes `quals.sched`:

| Door | A member on his own row | An admin | Proved by |
|---|---|---|---|
| Quals, the Scheduler cell (press, both sizes) | reads only, refused with "Only an admin can appoint a scheduler" | ticks any row | `quals.test.tsx` D1651; the walk |
| Quals, a keyboard press on the cell | no keyboard door — the cells take no tab stop and no key (unchanged; the scenario designer's row 5) | | — |
| The admin in member view (D292), his own row | reads only, as Management | editable again back in the admin view | walk B S16 |
| Who READS the tick — SKED CK / PLANNED BY / APPROVED BY (`engine/publish.ts`) | — | follows an admin's untick (17 names to 16) and re-tick | walk B S15 |
| The Quals write (`quals-write.ts updatePersonField`) | refused | | `quals-write.test.ts` D1651 |
| The commit gate (`perms.ts ownershipViolation`) — any command of his that changes it | rolled back | stands | `quals-write.test.ts` "Scheduler: rolled back" |
| His own CAT change (recalculates his quals) | done, the tick kept | | `quals-write.test.ts` (the CAT case) |
| Admin → Users, the Leave War, a posting | no member door; the posting pass changes only `san` | | code: only `QualsPage` and `UsersPanel` (callsign) call the write |
| Removing the Scheduler column (an admin's, Quals' ✕) | not his | | unchanged |

## 3. The sizing step (§7.0)

- **Type of change:** E (a look in several places — the band, the OIL bar), B (the pass, a new card), H (who ticks Scheduler).
- **What only a walk could find here:** the band's new look where each surface draws it (a sticky band on the panning
  board, the OIL tracker's head, the screens with no bar) and what it covers; the band and the OIL bar up together; the OIL
  bar's one line on a phone with the sign added; the pass at both sizes in each of its states; the Scheduler cell's refusal
  as a member SEES it (the title, the note), by mouse, by touch and by the keys.
- **What the ledger says:** look changes (E) find their faults in the places a surface draws itself apart and at the
  phone's width; role changes (H) in what the screen shows after a refused press — the gate itself is tested.
- **The walk chosen:** the host's scripted look beside the drawings (done, `look/`, 12 PASS); one Sonnet walker on the frozen
  build for every roll-call row above at both sizes, with a picture right after each phone tap (D1281), the plain-user
  rounds (D1557) of a stranger asking for access and of a member on Quals, and the OIL bar raised by a real drag; the drawing
  check (D1495) on the pass and the band; repeated wordings of the OIL bar carried by `oilwait.test.tsx` (its words) — one
  walked.
- **Its row:** added to `docs/walk-ledger.md` at the close.

## 4. The host's look beside the drawings

`scripts/handpass/mgb-look.mjs` on the frozen build of `6dd252ef3`, phone (WebKit 402 × 874) and desktop (Chromium 1536):
12 PASS, 0 FAIL, no browser errors.

| Picture | Drawing | What the host saw |
|---|---|---|
| `look/B1-editsched-band-phone.png`, `-desk` | `docs/mock/2026-11-05-save-band/img/look1-*.png` | matches: the sign, "Not saved" bold amber, "keep this page open" quieter, Retry solid amber at the right, the wash fading, the amber line under it; 36px; words 14px / 20px from the left edge, Retry the same from the right |
| `look/W4-waiting-phone.png`, `W4-waiting-crop-desk.png` | `docs/mock/2026-11-05-access-wait/img/C-diag-phone.png`, `C-desk.png` | matches: the pass, the fade from the top left over the whole card, the tear with its notches, the steps, the read-only line, the two buttons, "Signed in as" small |
| `look/W1-waiting-band-*.png` | `docs/mock/2026-11-05-member-guest/img/Q1-waiting-proposed-*.png` | the band across the top, the screen moved down (the logo 80px / 200px down, nothing covered — the drawing laid it over the logo; the ruling says nothing covered, and the build follows the ruling) |
| `look/G1-guest-band-*.png` | `…/Q1-guest-proposed-*.png` | the band as the guest bar's last line, the week strip under it |
| `look/S1-signin-band-*.png` | (the ruling, no drawing of its own) | the band on the sign-in after signing out with the save still failing |

## 5. The drawing check (D1495)

Part lists `scripts/drawcheck/specs/access-wait.mjs` (22 parts) and `save-band.mjs` (6 parts); the four drawings recorded
on a build of `42df6337b` (the files these screens are drawn from are the same on `main` and the drawing branch), each
replay identical to the approved picture; WebKit states measured in WebKit (the tool gained it — its self-test 12/12 and
M5a's report reproduced exactly). Records `docs/mock/2026-11-05-access-wait/drawcheck/`, `docs/mock/2026-11-05-save-band/drawcheck/`.

| Run | Pass phone | Pass desktop | Band phone | Band desktop |
|---|---|---|---|---|
| 1 — the frozen build of `6dd252ef3` (`drawcheck-access-wait/`, `drawcheck-save-band/`) | the fields' space under them 13px tighter than drawn, all below 13px higher | the same, plus the three below | 0 | 0 |
| 2 — after the fix (`drawcheck-access-wait-2/`, `drawcheck-save-band-2/`) | 0 | 3 parts, all kept with their reasons | 0 | 0 |

**Put back to the drawing (D1424, while built):** the space under Initials / Seat / CAT, 13px as drawn (`.pass-fields`).
**Kept, with reasons (the spec's `accepted`):** the card's and the pass top's fill on the desktop — `C-desk.png` was drawn
before his fade was settled; D1654 / D1656 put the fade over the whole card (`C-diag-phone.png`, which the phone matches with
no difference); Sign out's edge and word colour on the desktop — the drawing was taken with the pointer resting on it (its
hover look), not a design difference. **Not checked:** the tear's notches and the steps' joining lines (drawn by the stylesheet
round the parts; seen matching by eye), the inside of the claws, the band across the top of the access screens (no drawing in
the strip look — the walk carries it), hover / pressed / focus looks, the sideways phone (no drawing).

## 6. The walk

The scenario design (a fresh, blind Opus reader): `parts/mgb1105/scenario-design.md` — 10 roll-call rows added (taken into §2
where they are rows), 20 scenarios, the §7.11 mapping. Two Sonnet walkers on the frozen build of `6dd252ef3`, phone WebKit
402 × 874 by touch, desktop Chromium 1536, and the sideways phone, 320 and 375 where named. Reports `parts/mgb1105/walk-a.md`,
`walk-b.md`; pictures `walk-a/`, `walk-b/`. No browser error in either.

| Walker | Scenarios | PASS | FAIL | RECORDED | NOT WALKED |
|---|---|---|---|---|---|
| A — the access screens, the band where there is no top bar, the guest page | S1–S9, S13 (sign-in), S18, S19 | 7 | 1 (S2) | 4 (S1, S4, S6, S8) | 1 (S9) |
| B — the band in the app, the OIL bar, Quals | S10–S17, S20 | 8 | 0 | 1 (S11) | 0 |

The host opened the pictures behind every FAIL and RECORDED row (S2, S4, S11 reproduced — §8).

## 7. The reads

Two fresh, blind Opus readers of `2fb6d6c54` (D790; Codex out, D1594 — the job is on `[NO-ASTRA-LIST]`), each handed the
evidence sheet and the scenario design, neither shown the other's report.

| Reader | Report | Found | Disposition |
|---|---|---|---|
| The code read (the finder's brief, absences first) | `parts/mgb1105/read-opus.md` | F1 the access screens' contract still described the old waiting screen; F2 the pass under a failed save (= §8 #5); F3 the callsign re-fitted only on a window resize (a card narrowed by a scroll bar, under about 400 wide on a desktop); a gap: the band at 320 unmeasured; tidiness: three comments no longer true, "GND → Personnel" and the claws' path written twice | F1 **FIXED** (`ui-contracts.md`, D201); F2 the question in §11; F3 **FIXED** (the fit watches the card's width too); 320 **measured** — fits with about 24px to spare in both engines (`look/B3-band-320-*.png`; a wider-letters stand-in did not take, so his iPhone's letters at 320 are unproven — his phone is 402 wide); the comments **made true**; the two repeats **filed, not fixed** (D489) |
| The security read (holes only, D1411) | `parts/mgb1105/read-security.md` | none — the Scheduler tick holds at the screen, the write and the commit gate; no other door, actor, replay, recompute, import or member-view route reaches it; Retry flushes only saves already queued under their own authors; the waiting screen's text is drawn as text | O1 (a test tying the gate's admin-only list to §11) — carried by `quals-write.test.ts`'s gate cases for Management and Scheduler; O2 (queued saves carry no author — on `main` already; the database step's design waits for unsent changes at sign-out, `data-model.md`) — nothing to build now |

The fixes (§8 #1–#4) rewrite a little logic (the callsign's fit) and a layout rule each; each is pinned by its own red-first
browser test and re-walked (§6, `rewalk/`); no narrow read of the fix round — the agent's judgement: no refusal turned into a
skip, no write path changed.

## 8. What the check found, and each disposition

| # | Found by | What | Disposition |
|---|---|---|---|
| 1 | walk A, S2 | a phone on its side: the request form's and the pass's TALON logo cannot be scrolled to (the column centred, taller than the screen) | **FIXED** red first (`e2e/geometry.spec.ts` "a phone on its side…", red at −97) — centred by auto margins above the phone width; the request form's half an older fault this build made likelier (the pass is taller) |
| 2 | walk A, S4 | a 14-letter callsign breaks mid-name on the pass | **FIXED** red first (`e2e/geometry.spec.ts` "the pass sets a 14-letter callsign…") — an outright fault (D1426): the name steps down to fit its line, never below 16px |
| 3 | walk B, S11 | the board's Desktop layout on a sideways phone: the OIL bar's Answer OIL off the screen at the far pan | **FIXED** red first (`e2e/oilwait.spec.ts` phone on its side) — older: the walker's script shows the same on the build before this one (`42df6337b`); rides this batch (D490) |
| 4 | the drawing check | the pass's space under its fields 13px tighter than drawn | **FIXED** — put back to the drawing (D1424) |
| 5 | walk A, S1; the scenario designer's row 1 | under a failed save the pass still ticks "Request sent" and reads "Waiting for an admin", the "Not saved" band above it | put to him (D1625), drawn; **his answer D1664 ("As recommended")** — BUILT red first (`ui/accounts-ui.test.tsx` D1657 block: the mark and step 1 read "Not sent yet" while the band is up, the approved look back after Retry); pictured beside the drawing `look-d1664/W1-waiting-band-*.png`; the drawing check of the pass still green (`drawcheck-access-wait-3/`); the pass moved into its own piece (`WaitingPass`) for the code check |
| 6 | walk A, S6 | a stranger signing in again with the guest switch on lands on the guest page, not the pass | not a fault — as built and pinned (D204, D221; `accounts-ui.test.tsx` "a fresh sign-in with the switch on is already the guest view") |
| 7 | walk A, S8 | the guest page may now show the passing "Saving…" note under its bar (it mounts the bar's own `SaveStatus`) | not a fault — the same note every page's bar shows, letting presses through; none appeared in the walk |
| 8 | walk B, S12 | in the Leave War's OIL tracker the strip is inset by the sheet's padding | not a fault — as before (the band is a line of that sheet's column, D587), the look only changed |
| 9 | walk A, S9 | the band at a cold start with a save group unfinished | NOT WALKED — the forced refusal does not survive a reload; the start-up path is the saver's own, unchanged (`storage/boot.ts`) |

## 9. Gates

While the repo is public GitHub's run of the pull request is the full gate set (D1086): green on `6dd252ef3` (the build) and
`2fb6d6c54`; the last pushed commit's run is in the closing report. On his PC: the touched unit files (quals-write 67, quals,
SaveStatus, accounts-ui, accounts-newperson, perms, oilwait, oilconfirm-look — all green), the browser files
`save-note`, `oilwait`, `oil-uncancel-load` (72 passed after the last fix) and the new `geometry` tests; `lint:changed` —
no new finding; `docsize` OK.

## 10. What was NOT walked, and why

- **S9, the band at a cold start** with a save group left unfinished — the forced refusal does not survive a reload; the
  start-up path is the saver's own and unchanged (`storage/boot.ts`).
- **His iPhone's real keyboard over the sign-in boxes with the band up** (S3) and **his iPhone's letters at 320 wide** — only
  his phone draws them: on his look card.
- **The drawing check's blind spots** (§5): the tear's notches, the steps' joining lines, the claws' inside — seen by eye.

**Walk:** `docs/handpass/2026-11-05-member-guest-build.md` · 220 pictures · 12 surfaces (the top bar, the board's bar, the
OIL tracker's grid and settings, the sign-in, Request access, the waiting screen, the suspended screen, the guest page, Quals,
Edit Schedule's sign-off lists, the board's Desktop layout) · 20 scenarios and the plain-user rounds of a stranger and a member ·
MISSING: 4 fixed red first, 1 put to him, 0 filed.

## 11. Questions for him — both answered 5 Nov 26: "As recommended" (D1664 built; D1665 filed as [NOTSAVED-REFUSAL-LOOK])

1. **The pass under a failed save** (§8 #5): it still ticks "Request sent" and reads "Waiting for an admin" under the "Not saved"
   band. Recommended: until the save lands, the mark and step 1 read "Not sent yet" in the band's amber, and the approved look
   comes back by itself when Retry succeeds. Pictures `docs/mock/2026-11-05-member-guest-build/img/Q1-pass-today-*.png`,
   `Q1-pass-proposed-*.png`.
2. **"Not saved" one design across the whole app** (his D1663, said during the check): the band already wears the strip in all six
   kinds of place (`docs/mock/2026-11-05-member-guest-build/img/D1663-band-everywhere-phone.png`); the other "not saved" words are
   refusals of one change (a Leave War figure box, the grades sheet, the schedule's refused change, a document too big to store) —
   whether they take a common look of their own is put to him.

## 12. His look

Done on his iPhone with the `?savefail` test switch (D1666), 5 Nov 26: *"Ok looks good merge live"*.
