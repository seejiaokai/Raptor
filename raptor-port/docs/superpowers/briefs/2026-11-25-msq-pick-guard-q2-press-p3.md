# [MSQ-PICK-GUARD] the second questions page — presser P3's report: where the note stands, and Logout (chat 175, 25 Nov 26)

Brief: `2026-11-25-msq-pick-guard-q2-press-brief.md` §P3. An Opus helper; saved whole from its hand-back by the host. The host's re-run is recorded in the evidence of the questions page.

---

# P3: where the note stands, and Logout (today's app at :4700, chat 175)

Nothing under `src` was changed and nothing was committed. Scripts are in `raptor-port/scripts/handpass/n175/` (`p3-*.mjs`, with their own `p3-lib.mjs`; there is no shared `lib.mjs`). Deciding pictures are in `raptor-port/docs/mock/2026-11-25-msq-pick-guard-q2/today/p3-*.png`, each with a `-crop`; logs are in `raptor-port/.tmp/n175/p3/`. Sizes: d is Chromium 1536×864; p (402×874), ps (874×402) and t (768×1024) are WebKit with touch, all at scale 2. Saber (ad) is on 142 throughout.

## 1. Where the grey "Blocked:" note stands (p3-note)
The note says "Blocked: close the open window, then pick 149." Every case drew it on one line. It takes no presses (pointer-events none), so whatever is under it can still be pressed.

| Size | Case | Squadron control (picker / ☰) | Note: place, box (x,y,w,h) | What it lies over | Picture |
|---|---|---|---|---|---|
| p | a. none | free / free | foot, 12,811,378,37 | nothing | p3-note-a-p |
| p | b. Input window | **covered by the window's title strip** (the bell is under its ✕) | **top**, 12,10,378,37 | the window's ✕ (64% of it) | p3-note-b-p |
| p | c. My leave | free / free | foot, 12,811,378,37 | two page name rows (Outlaw, Diesel) | p3-note-c-p |
| p | d. Inputs settings | free / free | **top**, 12,10,378,37 | **the squadron picker (100%), ☰ (97%), Undo, Redo, Sync, bell (94%)** | p3-note-d-p |
| p | e. Calendar | free / free | **top**, 12,10,378,37 | same as d | p3-note-e-p |
| ps | a–e | free / free, name badge free, all five | foot, 278,339,319,37 (not the phone width) | b: **the Input window's Delete (100%)**; c: 5% of three "Saber" leave lines; d: two calendar days; a, e: nothing | p3-note-*-ps |
| t | a–e | free / free, all five | foot, 225,961,319,37 | nothing | p3-note-*-t |
| d | a–e | picker, badge, bell free | foot, 608,800,320,38 | nothing | p3-note-*-d |

The note goes to the top only at p, and only while a shell window is open (b, d, e). My leave (c) is a Leave War sheet, so at p the note stays at the foot. At ps and t the app does not use its phone layout: the window does not cover the bar, and the note is the desktop's 319 px box at the foot.

## 2. The ☰ menu after a pick (p3-menu)

| Size | Presses | Result | Picture |
|---|---|---|---|
| p, ps, t | ☰, the squadron line, then 149 | Bar changes to 149. **The menu stays open**, both 0.3 s and 1.5 s after the pick, showing "149 · Full access". | p3-menu-p-after-pick (also -ps, -t) |

## 3. Logout while a change is "Not saved" (p3-logout-save)

| Size | Presses | What the screen said and did | His change | Pictures |
|---|---|---|---|---|
| d, p | An input's Remarks edited, Save → the "Not saved — keep this page open" band with Retry. Then Logout (top bar at d; ☰ → Logout at p, both free). | **Nothing asked.** The sign-in card comes up under the band, which stays with Retry live. The page does not reload. The card says only USERNAME / PASSWORD / Sign in. | Held, not saved | -1-after-logout |
| d, p | Sign in pressed (ad / a) | The button reads "Signing in…" and is greyed. The line under it reads "The last change has not saved yet — check the connection. Sign in waits until it saves." **Not signed in.** | still held | -2-signin-pressed |
| d, p | Stand-in lifted, Retry pressed | The band goes, **the page reloads** (one load) and the card reads "Saved. Press Sign in again." with the name "ad" kept. Not signed in. | **Saved**: the words are now in the input's own stored record | -3-after-retry |

## 4–5. Logout over a window with typing, at d (p3-logout-win)

| Case | Logout reachable? | Pressed: what happened | Typing | Picture |
|---|---|---|---|---|
| Add a holiday, a name typed | free | **Nothing asked.** Signed out, page reloaded. | lost (not in storage) | p3-logout-holiday-d-1/2 |
| Place a bid, AM chosen, no leave pressed | **No. Covered by the bid sheet's shade.** | not pressed | — | p3-logout-bid-d-1-open |
| Place a bid, LL pressed | LL places the bid at once: the sheet closes and the 15 Dec cell shows "LL" | Logout free → nothing asked, signed out | bid saved before Logout | p3-logout-bidll-d-* |
| The day's OIL list, one Yes chosen ("1 OF 2 ANSWERED", Save live) | free | **Nothing asked.** Signed out, reloaded. | answer lost | p3-logout-oil-d-1/2 |
| Tracker marking window (an event pressed) | free | Nothing asked. Signed out. | it has no box to type in | p3-logout-trkmark-d-* |
| Tracker → Edit details, Name typed | **No. Covered by the details box's shade.** | not pressed | — | p3-logout-trk-d-1-open |
| Input window, Remarks typed, no chart edits (H6) | free | **No question.** Signed out, reloaded. | **lost unasked** | p3-logout-input-d-1/2 |
| Admin → Users row, sign-in box typed (N5) | free | Nothing asked. Signed out, reloaded. | lost | p3-logout-admin-d-1/2 |

## 6. Logout on a phone with a window open, at p (p3-logout-phone)

| Window | ☰ reachable? | After ☰ | Picture |
|---|---|---|---|
| Input window | **No. Covered by the window's title strip.** There is no Logout in the bar at this size. | — | p3-logout-phone-input-p |
| My leave | free | Menu opens, Logout free; the sheet stays open behind | p3-logout-phone-myleave-p |
| Inputs settings | free | Menu opens, Logout free | p3-logout-phone-gear-p |
| Place a bid | free at its middle | **The tap opens no menu, and the sheet closes.** Logout not reached. | p3-logout-phone-bid-p |

## What surprised me
1. With Inputs settings or the Calendar open on a phone, the note goes to the top and lies over the very squadron control it names, and over ☰, Undo, Redo and the bell. Those controls can still be pressed through it.
2. On a phone on its side (874 wide), the note lies over the open Input window's Delete button.
3. After a pick from ☰, the menu stays open at p, ps and t.
4. Logout with a failed save asks nothing. The change is not lost: the sign-in waits, Retry saves it, then the page reloads and says "Saved. Press Sign in again."
5. Logout over an Input window holding typed words (no chart edits) signs out at once and loses the words, with no question.
6. In Place a bid, pressing a leave places the bid at once. Before that, the sheet's shade covers Logout on a desktop, and on a phone a tap on ☰ just closes the sheet.

## Stand-ins
- Note (case 1): raised by the app's own `window.toast(text,'blocked')`. No press raises it today.
- Failed save (case 3): browser storage refuses every write, installed just before Save and lifted before Retry (save-d's way).
- OIL list set-up: a Training input for two free men on Fri 17 Jul 2026, filed through the Inputs calendar by presses (isr-A-lib's fileOn, copied), then a holiday added over it by presses. The set-up moves between pages with the app's own `window.go`.
- On the phone sizes, words are put into boxes through the box's own input event, not typed (typing zooms the page).

## Not pressed
- Case 4 "a Tracker remark": the marking window has no remark box. I pressed it with nothing changed, and separately typed in Edit details' Name box.
- The bid with typed Remarks was not pressed (AM chosen instead). The shade covers Logout either way.
- Cases 4 and 5 at p: not asked; case 6 covers the phone.
- I opened these deciding pictures: note b-p, d-p, b-ps, b-t-crop; menu-p; logout-save-d-2; logout-bid-d-1-crop; logout-input-d-2-crop; logout-trk-d-1-crop; logout-phone-bid-p. The rest were checked by their FACT lines only.

## Re-run order (from the repo root)
1. `p3-note.mjs p`, then `ps`, `t`, `d`
2. `p3-menu.mjs p`, then `ps`, `t`
3. `p3-logout-save.mjs d`, then `p`
4. `p3-logout-win.mjs d` (cases holiday, bid, bidll, oil, trk, trkmark, input, admin; the order in the earlier tables is by topic)
5. `p3-logout-phone.mjs p`

`p3-probe.mjs` only found controls.
