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
| Quals, a keyboard press on the cell | refused | | the walk |
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

*(to fill)*

## 6. The walk

*(to fill)*

## 7. The reads

*(to fill)*

## 8. What the check found, and each disposition

*(to fill)*

## 9. Gates

*(to fill)*

## 10. What was NOT walked, and why

*(to fill)*
