# The member / guest build — the fresh, blind Opus code read (5 Nov 26)

Reader: a fresh Opus, blind to every other reader. Read-only: no file changed but this one. Read at `2fb6d6c54`
(`git diff 42df6337b..2fb6d6c54 -- raptor-port/src raptor-port/e2e`), with the rulings' full rows (D1650, D1651, D1654,
D1655, D1656, D1657), the evidence sheet and the scenario design in hand. Unit tests run: `quals-write.test.ts`,
`quals.test.tsx`, `SaveStatus.test.tsx`, `accounts-newperson.test.tsx`, `accounts-ui.test.tsx` — 5 files, 186 tests, all
pass. No build and no browser test run (not allowed by the brief).

**Bottom line: no code fault found that would hurt new data or a person using the app.** One stale contract document
(the access screens' section of `ui-contracts.md` still describes the old waiting screen), the already-known product
question about "Request sent ✓" under a failed save (confirmed, still open), one small timing gap in the callsign fit
(practically unreachable), and a tidiness note.

## Findings

### F1 — LOW (records, a wrong line) — `docs/ui-contracts.md` §The access screens and the guest view (line ~6947) still describes the waiting screen as it was

- **Setup → action → what goes wrong:** the next chat that changes the access screens opens the contract (the doc map
  sends it there) and reads that the waiting screen is "what he asked, one line `#accAsked`: 'You asked for access as
  **Viper** (JKB · Pilot · CAT C).', 'an admin will answer it'". The build now draws the pass (D1650, D1656): `#accAsked` is
  the callsign alone, the summary sentence and the heading are gone, the three steps and "Signed in as …" at the foot are
  new. The band's own section (§The failed-save warning, line ~11695–11707) was updated; this section was not.
- **Cause:** D201 (fix what the older rule leaves behind) — the section that names the waiting screen's parts was missed.
- **Fix:**
  1. In `docs/ui-contracts.md` §The access screens and the guest view, replace the **Waiting** clause
     (`(#accessWaiting — what he asked, one line #accAsked: … "an admin will answer it"; …)`) with: the pass (D1650,
     D1654, D1656) — the claws and "Waiting for an admin" (`.pass-state`), his callsign large on one line (`.pass-cs`,
     `#accAsked`, stepped down to fit, never below 16px — `AccessScreen.tsx PassCallsign`), his initials / seat / CAT
     (`.pass-fields`, a blank one left out — D225, personnel no CAT), the tear (`.pass-tear`), the three steps
     (`.pass-steps`, the middle one `aria-current="step"`), the read-only line and "View the schedule" `#accGuest` only
     while the guest switch is on (D221), Sign out `#accOut`, "Signed in as …" small last (`.pass-who`, `#accName`); the
     fade from the top left over the whole card.
  2. Keep the old wording as a `*(Was, 26 Sep 26 …)*` note in the same paragraph, as the section already does for
     the request form.
  3. Add one line there that the three access screens carry the failed-save band across their top (D1657), pointing to
     §The failed-save warning.

### F2 — LOW (a product question, already found as the evidence sheet's #5 — confirmed, still open) — `src/ui/AccessScreen.tsx:120–124`

- **Setup → action → what goes wrong:** the browser refuses to save (quota full) → a stranger fills Request access and
  presses it → the waiting screen shows the "Not saved — keep this page open · Retry" band across the top AND, under it,
  the pass with step 1 ticked "✓ Request sent" and "Waiting for an admin". D1657's own words are "so a stranger whose
  request was not saved is never told it was sent"; the old screen's "with the admins" is exactly what that ruling cured,
  and the new step 1 says it again.
- **Cause:** the steps are fixed markup (`<li className="done">…Request sent</li>`) that never reads `useSaveFailed()`,
  though the component already holds `failed` (line 82).
- **Fix (only once he rules — D1625, it changes what he sees, so a drawing first):** the evidence sheet's §11 must carry
  the question with a picture of the band over the ticked step. The likely build, for the drawing: when `failed`, step 1
  is not `done` but `now` with its words "Not sent yet" (or "Sending…"), step 2 not current, and `.pass-state` reads "Not
  sent yet" — all from the `failed` already in scope; Retry's success returns it to the approved look by itself (the
  subscription re-renders). Pin it in `accounts-ui.test.tsx`'s D1657 block ("the request was not saved: the waiting
  screen says so") by asserting the step's words while the band is up. Until he rules, nothing changes.

### F3 — VERY LOW (a timing gap, practically unreachable) — `src/ui/AccessScreen.tsx:51–65` `PassCallsign`

- **State × event table** (the fit holds a font size between events):

  | Event | Re-fits? |
  |---|---|
  | first draw, a new callsign | yes (`useLayoutEffect`, deps `[cs]`) |
  | window resize, phone turned | yes (`resize` listener) |
  | a re-render with the same callsign (the store's version moving) | no, and need not: React writes no `style`/`className` it does not own, so the size and `pass-cs-wrap` stay |
  | the band coming up or going (`.login.band-up`) | no — the card's width does not change |
  | the card's width changing with no window resize (a classic scroll bar appearing on `.login` once the column overflows) | **no** |
- **Concrete case:** a desktop window under ~400 wide with classic (non-overlay) scroll bars, the pass just fitting the
  height; the band comes up, `.login` loses 36px of height, a scroll bar appears and takes ~15px of `.login`'s width — the
  card narrows by ~3px (the phone rule's 18px side padding leaves 364 for a 352 card), with no `resize` event; a name fitted
  to the last pixel is then clipped by up to 3px at the card's edge (`overflow:hidden`). Phones use overlay scroll bars,
  so his iPhone never meets it.
- **Fix (optional, cheap):** in the same layout effect, also watch the heading itself —
  `const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(fit); ro?.observe(n)` and
  `ro?.disconnect()` in the cleanup — the same pattern `SaveStatus.tsx useFollowTheBar` uses. Guard against the observer
  firing on its own font-size change: compare `n.clientWidth` with the width the last fit ran at and return early when
  equal. Not worth a build on its own; take it if the pass is touched again.

## The roll-call, read for ABSENCE (what I enumerated, and where each sign and gesture lives)

**The failed-save band (D1655 look, D1657 places).** Every place `Warning` is drawn: the top bar (`Shell.tsx:398`
`SaveStatus`), the guest bar (`GuestApp.tsx:48`, NEW), the board's bar (`SchedBoard.tsx:718` `SaveBand active={open}`), the
Leave War's OIL tracker ×2 (`OilTracker.tsx:437, 736`), the Medical view opened full (`MedicalView.tsx:291`, no screen opens
it), the sign-in (`Login.tsx:42`, NEW, `screen`), the three access screens (`AccessScreen.tsx:85`, NEW, `screen`). No other
copy of the words exists in `src` (searched "keep this page open" / "Not saved": the others are box refusals in the Leave
War's balances and grades sheets and the input window's refusal toast — not the band). The Tracker's own `savestat` note
carries none of `.sv-msg` / `.saveband` / `.oilband`, so the new rules do not reach it. **Nothing missing.**

**The screens with no top bar (D1657).** `App.tsx:54–57` is the whole list: no session → `Login`; pending or off →
`AccessScreen` (request form, waiting pass, suspended — all three go through the one `screen()` wrapper, so all three carry
the band and `band-up`); guest → `GuestApp` (has a bar, so the bar's own band). Everything else mounts `Shell`. **Nothing
missing.** The cold-start case (an unfinished save group → `Postman initialFailed` → status `failed` before the first
render, `main.tsx:38` wiring the source) reads correctly from the code: the sign-in would show the band at once, and its
Retry flushes through the same `source.flush()`.

**The OIL bar (D1655 "alike").** Drawn by one `Bar` (`OilWaitSheet.tsx`) in the top bar and the board's bar (and the
unused Medical view); its text comes only from `oilwait.ts WAIT_WORDS[...].not` (`setOilBar` has one non-null writer,
`oilwait.ts:102`), each wording with exactly one " — ", so the split always yields the sign form. **Nothing missing.**

**The pass (D1650, D1654, D1656).** Each part present and in order (pinned by `accounts-newperson.test.tsx`): claws +
"Waiting for an admin", callsign large, fields with blanks dropped, tear with notches, the three steps, the read-only line
and View the schedule only with `guestEntry()`, Sign out, "Signed in as" last; the fade on the whole card
(`#accessWaiting .login-card.acc-pass`, an id rule, so the phone's `.login-card` rules cannot override it). **Nothing
missing** beyond F2's open question.

**The Scheduler tick (D1651) — every writer and reader of `quals.sched`.** Writers in `src` (searched
`quals.sched` / `quals[k] =`): the start-up seed (`engine/people.ts:236–237`, demo people — D56), and the one Quals write
(`quals-write.ts:70`). Doors into that write: the Quals cell press (`QualsPage.tsx:514`) and Admin → Users' callsign box
(`UsersPanel.tsx:365`, callsign only). The Quals write refuses a member's `sched` tick before anything moves (line 55);
the commit gate refuses any member command whose own-row `people` change flips `!!quals.sched` (`perms.ts:376`, read at
`perms.ts:~1178`). I checked that the stored people rows the gate compares are whole person snapshots including `quals`
(`people-settings-commit.ts:176–183`), so the gate does see the field (and the test proves it with the gate's own words).
His CAT change keeps the tick (`deriveQuals` merges the stored `quals` over its defaults — `people.ts:148–168`). The screen:
the cell reads only with its reason (`QualsPage.tsx:252–253`); an admin in member view (D292) is a member to
`mayTickScheduler`, so his own cell reads only too. Readers: `isScheduler` (`people.ts:375`) — the sign-off lists.
**Nothing missing.**

## What each changed path no longer runs

- **The waiting screen** no longer prints `requestSummary` (the one line "(JKB · Pilot · CAT C)") nor the heading "Your
  request is with the admins". No test, probe or walk in `src`, `e2e`, `probes` still looks for either (searched). Admin →
  Users still uses `requestSummary` (`UsersPanel.tsx:180`).
- **The bands** no longer draw the ⚠ text glyph (`.sv-ico`, gone from code and CSS) nor the right-aligned layout
  (`justify-content:flex-end` → `space-between` / `flex-start` + `margin-right:auto`). The OIL bar's "Answer OIL" is no
  longer the app's cyan (named to him in the evidence sheet).
- **The sign-in and access screens** above 481 wide no longer centre with `align-items:center`; they centre by auto
  margins while the column fits and start at the top when it does not — the same picture when it fits.
- **The Quals write** no longer lets a member's `sched` tick through; nothing else in it changed.

## State × event — the three things that hold state or listen

| Thing | Events | Verdict |
|---|---|---|
| `PassCallsign` fit | see F3 | sound but for F3's no-resize width change |
| The band's measured place (`useFollowTheBar`, `Bar` placement) | unchanged code; the guest bar now uses it — `closest('.topbar')` finds `.topbar.guestbar`, the `ResizeObserver` follows its height | sound |
| The save-failed subscription (`useSaveFailed`, `SaveBand`'s `cover` count) | Login → AccessScreen → GuestApp / Shell hand-overs: each unmount's cleanup (`cover(-1)`) runs before the next screen's mount effects; a newly mounted `SaveStatus` that rendered while the count was still 1 is corrected by React's own snapshot check on subscribe, so the top bar's Retry is never left `inert` | sound |

## Explicit negatives (checked, nothing found)

- **The band across the top of a screen with no bar:** `.saveband.is-screen` is `position:fixed`; `.login` has no
  transform, filter or contain, so the band's box is the screen, not `.login`, and `.login`'s `overflow:auto` cannot clip
  it; `.login.band-up{top:36px}` (0,2,0) beats `.login{inset:0}` (0,1,0), so the page moves down by exactly the band. The
  phone's 44px top padding and the desktop's 24px both stay under it.
- **Escaping the top bar's own copy (`inert`) on the screens without a bar:** harmless — there is no bar copy there, and
  the hand-overs balance (above).
- **The guest bar's band:** gets the room (`.topbar.save-failed` padding, both widths), the amber line under it
  (`.topbar.save-failed` border colour), and the phone bar's sideways scroll box cannot clip a `position:fixed` band.
- **Colours and variables the new CSS reads** (`--accent-ink`, `--panel`, `--bg`, `--edge-2`, `--band-wash`,
  `--band-sign`) are all defined at the root.
- **The OIL bar's one line (D840):** the new sign is a fixed 16px and does not shrink with `--oil-fit`; the fit loop
  measures the real line (sign included) and steps the rest down, so it still reaches one line — walked at 320/375 (S10)
  and pinned by `oilwait.spec.ts` at its sizes. The hidden dash (`.sv-sep`, absolute and clipped) adds no width.
- **The "Not saved" band at 320 wide (not walked — named as a gap, not a finding):** by my estimate the strip's line
  (sign 16 + two 9px gaps + "Not saved" bold + "keep this page open" + Retry + side padding) is within a few pixels of 320
  in the test browser's letters, so an iPhone SE-width phone with Apple's wider letters may ellipsize the quieter words
  ("keep this page o…"). The old look ellipsized the whole line at about the same width, so this is not new, and his
  iPhone (402) is clear. `e2e/save-note.spec.ts` runs at 320 but never asks whether the words are cut — worth one assert
  (`.sv-rest` `scrollWidth <= clientWidth`) at 320 if he cares about the smallest phones.
- **The pass's notches** are filled with plain `--bg` while the sign-in keeps its faint wash at the top; at the tear's
  height the wash is at its faint edge, so no visible mismatch is expected (the look matched the drawing by eye).
- **Escape / keyboard on the pass:** nothing new to open or close; View the schedule and Sign out are ordinary buttons,
  inside `pass-foot`'s 20px padding, so their focus rings are not clipped by the card's `overflow:hidden`.
- **Security (D1411):** no member door to `quals.sched` beyond the Quals write; the commit gate catches any other command;
  the posting pass may change only its outcome's own fields (`postingPassViolation`, unchanged); a pending or guest
  person is refused by `mayEditQualsOf` first (tested). The admin's demotion of a scheduler to member leaves his tick (an
  admin's act, D785 says the app is not built for it) — outside this change.
- **Tests:** the five unit files above, 186 tests, pass at `2fb6d6c54`.

## The tidiness note (three questions of the changed lines — filed, not fixed; never the rules engine)

1. **Duplicated where one home exists:**
   - The "GND → Personnel" seat word is now written twice — `AccessScreen.tsx:113` and `accounts.ts requestSummary`
     (line 241) — because `SEATS` labels GND "Personnel (ground crew)". One small `requestSeatWord(r)` beside
     `requestSummary` would serve both.
   - The claws' path: the new `CLAWS` constant in `AccessScreen.tsx` is a second local home; the same path string is
     still typed out in `GuestApp.tsx`, `Login.tsx`, `Shell.tsx` and `pageclaw.ts` (five copies).
2. **Dead:** nothing dead in the changed lines (`.sv-ico` left code and CSS together; `requestSummary` still has a reader).
3. **Misleading names and comments:**
   - `accounts.ts:238–239` — "the waiting screen and Admin → Users read this one body": the waiting screen no longer does.
   - `17-save-status.css:87` — "'Answer OIL' keeps the app's accent, the one thing to press": it is solid amber now
     (lines 99–101 say so).
   - `SaveStatus.tsx:43` — `useSaveFailed`'s doc line "Shell asks": the sign-in, the access screens and the guest page ask
     too.
   - `#accAsked` (`AccessScreen.tsx:64`) now names the callsign heading, not "what he asked"; kept for the tests, but the
     name no longer says what it holds.
