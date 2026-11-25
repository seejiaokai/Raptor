# Walker w1 — ALL AVAIL counts a man posted out as SANS who is planned with us (22 Nov 26, chat 141)

Brief: `docs/superpowers/briefs/2026-11-22-allavail-sans-posted-walk-brief.md`; scenarios: `…-scenarios-astra.md`.
Build: `raptor-port/dist` from commit `100fa3bb7`, served on port **4393** (4391 held by another chat). Stopped by its port at
the end. Browser clock installed before load: **Wed 15 Jul 26 09:00** (logged before each step that relies on it: "Wed Jul
15 2026 09:00"). Desktop: Chromium 1536×864. Phone: WebKit 402×874, isMobile, hasTouch, scale 3, real taps, a picture
within ~100 ms of every tap (`<run>/taps/`) and the settled one.

Scripts: `scripts/handpass/asp-w1-lib.mjs` (helpers copied from `frf-w1.mjs`, `sfd-w1-lib.mjs`, `aa-B-lib.mjs`,
`lw-m5b-walk-w1.mjs`), `asp-w1-s1.mjs` (S1 + S16 + S17 + S20 on one world), `asp-w1-s5.mjs` (part a: S5 + S7; part b:
S5's put-back in a fresh world), `asp-w1-s6.mjs`, `asp-w1-s2.mjs`. Pictures:
`docs/img/handpass/2026-11-22-allavail-sans-posted/w1/<run>/` — one folder per run, emptied at its start. Result files:
`…/w1/results-*.json`.

**Final runs cited** (earlier attempts' folders were overwritten by these): s1-desktop `asp-w1-s1 v3`; s1-phone `v5`;
s5/s5b both sizes `asp-w1-s5 v1`; s2 both sizes `asp-w1-s2 v1`; s6-desktop `asp-w1-s6 v1`; s6-phone `v2`.
Script faults met and fixed on the way (none the app's): the board element stays in the page when closed (board check now
reads its Done); the week's sign line read from the wrong block; the phone's OIL Earn is the day bar's button
(`data-oilmode`), not the bar's ⋯ menu; a reload in WebKit was read before the page came back.

Every fixture was made through the app's own controls: the board's + Item, typing and taps (rows, ALL AVAIL, Hex); the
Leave War's cell → ⋯ → Post out → SANS → Post out; ⚙ Settings' "+ SANS" and the SANS group's ✕; the four sign-off boxes
and Publish; OIL Earn and a tap on Hex's seat; the Inputs calendar's + Input and its OIL question; the row's ✕ and the
board's Undo. `window.*` was only READ (results named "read from …" where used).

## Counts

| | |
|---|---|
| Steps recorded (both sizes) | 162 |
| PASS | 136 |
| FAIL | **0** |
| RECORDED (scenario says RECORD) | 10 |
| Other notes (facts logged, not judged) | 16 |
| NOT WALKED | 0 of my eight scenarios, at either size |
| Pictures | 216 settled + 241 just-after-tap (phone) = 457 |
| Errors (console, page, 4xx, failed requests, native dialogs) | none, in every final run |

## Table — one row per step and size (D = desktop, P = phone)

Pictures are under `w1/`; `s1-desktop/05-…` means `w1/s1-desktop/05-s1-05-board-availwin-desktop.png` (the numbered
file whose step id matches). Where D and P read alike, one row says both.

### S1 — posted out as SANS from Wed 15 Jul, the main fixture, "+ SANS" off, Publish, both ways, another week

| Step | Size | Did | Screen said | Verdict | Picture |
|---|---|---|---|---|---|
| premise | D P | signed in ad / a | Hex = `rocky`, WSO, not SANS; today Wed 15 Jul 09:00; week 13–19 Jul | PASS | — |
| s1-01 | D P | Sat board: + Item, SQN EVENT, 10:00, 17:00, tap the row, tap ALL AVAIL | row SQN EVENT 10:00–17:00, ALL AVAIL | PASS | `01-s1-01-event-row` |
| s1-02 | D P | + Item on Ground Programme: BRIEFING 08:00–09:00, tap row, tap Hex | BRIEFING 08:00–09:00, Hex | PASS | `02-s1-02-briefing-row` |
| s1-03 | D P | Leave War: Hex's 15 Jul → ⋯ → Post out → SANS → Post out | sheet line "On 15 Jul: becomes SANS."; he is SANS from 15 Jul | PASS | `03-s1-03-postout-sheet` |
| s1-04 | D P | Leave War grid | no SANS group ("+ SANS" off) | PASS | `04-s1-04-lw-no-sans-group` |
| s1-05 | D P | board, count chip tapped | chip **45**; window "Who's available 45", WSOs · 17, **Hex listed with the purple SANS line** | PASS | `05-s1-05-board-availwin` |
| s1-05b | D P | window's ✕ | window closed | PASS | `06-s1-05b-win-closed` |
| s1-06 | D P | OIL Earn on (desktop bar; phone day bar), chip tapped | tabs "Who's available 45 · Who earns OIL 45 of 45"; Hex's seat earning | PASS | `07-s1-06-oilearn-window` |
| s1-07 | D P | four sign-off boxes, Publish day | nothing pending; "SIGNED ORIG CUR CK Ace SKED CK Anvil PLANNED Basher APPROVED Bolt" (phone: names only) | PASS | `08-s1-07-published` |
| s1-08 | D P | chip after Publish | 45, Hex in | PASS | `09-s1-08-board-availwin-published` |
| s1-09 | D P | Leave War, Hex, Sat 18 Jul | **FO\*** | PASS | `10-s1-09-lw-fo` |
| s1-10 | D P | Edit Schedule, Sat, "+ SANS" off, chip | 0 pending, signed ORIG, 45, Hex in (purple) | PASS | `11-s1-10-off-editsched-sat`, `12-…-availwin` |
| s1-11 | D P | ⚙ Settings → "+ SANS" | SANS group on the grid; Hex's cell FO\* | PASS | `13-s1-11-on-settings`, `14-s1-11-lw-cell-sans-on` |
| s1-12 | D P | Edit Schedule Sat, "+ SANS" on | 0 pending, signed ORIG, 45, Hex in | PASS | `15-s1-12-on-editsched-sat`, `16-…-availwin` |
| s1-13 | D P | ⚙ → the SANS group's ✕ | group gone; cell FO\* | PASS | `17-…-settings`, `18-…-lw-cell-sans-off` |
| s1-14 | D P | Edit Schedule Sat, "+ SANS" off | 0 pending, signed ORIG, 45, Hex in | PASS | `19-…`, `20-…` |
| s1-15 | D P | board › from Sunday to 20 Jul week, "+ SANS" on there, board ‹ back | 20 Jul → 13 Jul week, group on | PASS | `21-s1-15-on-away-settings` |
| s1-16 | D P | Edit Schedule Sat, "+ SANS" on, after the week change | 0 pending, signed ORIG, 45, Hex in, cell FO\* | PASS | `22-…`, `23-…` |
| s1-17 | D P | "+ SANS" off, Sat again | 0 pending, signed ORIG, 45, Hex in, cell FO\* | PASS | `25-…`, `26-…`, `27-s1-17b-lw-cell` |

### S16 — reload (same world, after S1)

| Step | Size | Did | Screen said | Verdict | Picture |
|---|---|---|---|---|---|
| s16-01 | D P | reload with "+ SANS" off, sign in | 0 pending, signed ORIG, 45, Hex in, cell FO\*; no SANS group | PASS | `s1-<size>/01-s16-01-…`, `02-…`, `03-s16-01b-lw` |
| s16-02 | D P | "+ SANS" on, reload | SANS group still on the war | PASS | `05-s16-02-lw-after-reload` |
| s16-03 | D P | Sat after that reload | 0 pending, signed ORIG, 45, Hex in, cell FO\* | PASS | `06-s16-03-…`, `07-…` |

### S17 — sign out, sign in as ad again ("+ SANS" was on)

| Step | Size | Did | Screen said | Verdict | Picture |
|---|---|---|---|---|---|
| s17-01 | D P | Logout (phone: side menu) → ad / a | 0 pending, signed ORIG, 45, Hex in, cell FO\*; SANS group still on | PASS | `s1-<size>/01-s17-01-…`, `02-…`, `03-s17-01b-lw` |

### S20 — the member us / us

| Step | Size | Did | Screen said | Verdict | Picture |
|---|---|---|---|---|---|
| s20-01 | D P | View-only Sched, Sat, count chip | chip 45, "(who was free when this day was issued)"; window 45, Hex in, purple line — the admin's people | PASS | `01-s20-01-member-viewsched-window` |
| s20-02 | D P | top bar | no Edit Schedule control drawn (so no board, no OIL Earn). On the phone the side menu was closed, so this read is weak there — the desktop's is the real check | PASS | `02-s20-02-member-topbar` |
| s20-03 | D P | Leave War: ⚙ looked for; tap on Hex's Sat cell | no ⚙; after the tap no ⋯ and no Post out; cell FO\* | PASS | `03-s20-03-member-hex-cell` |
| s20-04 | D P | OIL tab, Hex's name | balance "2", 18 Jul lines listed, no credit controls | PASS | `04-s20-04-member-oil-tracker` |

### S5 — Hex's briefing taken off the published Saturday (part a), and put back (part b, a fresh world)

Fixture (fx-01 to fx-04, every run of S5, S5b, S6): the two rows, the posting from 15 Jul, the four sign-offs, Publish
(window 45, Hex in), cell FO\* — PASS at both sizes in every run.

| Step | Size | Did | Screen said | Verdict | Picture |
|---|---|---|---|---|---|
| s5-01 | D P | board: the BRIEFING row's ✕ | Hex named on nothing; **"2 pending"**, "Not yet signed" | PASS | `s5-<size>/05-s5-01-briefing-off` |
| s5-02 | D P | board chip | 44, Hex **not** in | PASS | `06-s5-02-board-window-working` |
| s5-03 | D P | "+ SANS" on; Leave War; Edit Schedule Sat | group on; cell **FO\*** still; 2 pending, Not yet signed; window 44, no Hex | PASS | `12-…-settings`, `13-…-lw-cell`, `14-…`, `15-…` |
| s5-04 | D P | "+ SANS" off; same reads | group off; FO\*; 2 pending; 44, no Hex | PASS | `16-…`–`19-…` |
| s5b-01 | D P | (fresh world) the BRIEFING row's ✕ | 2 pending, Not yet signed | PASS | `s5b-<size>/05-s5b-01-off` |
| s5b-02 | D P | board's Undo | RECORD: briefing back; **0 pending**, "Not yet signed" gone, "SIGNED ORIG Ace Anvil Basher Bolt" line back; the next-issue sign-off boxes blank as on any published day; chip 45, Hex in | RECORDED | `06-s5b-02-put-back` |
| s5b-03 | D P | Edit Schedule Sat after it | RECORD: 0 pending, signed ORIG, 45, Hex in | RECORDED | `07-…`, `08-…` |

### S7 — the count opened from three places while S5's change waits (inside the S5 part a run)

| Step | Size | Did | Screen said | Verdict | Picture |
|---|---|---|---|---|---|
| s7-01 | D P | Scheduler Board chip | working copy: 44, no Hex | PASS | `s5-<size>/07-s5-02b-board-window-working` |
| s7-02 | D P | board's plans menu ("Live working copy ▾") → "Original · read-only — look, don't change", chip | 45, Hex in, "(who was free when this day was issued)" | PASS | `08-s5-03-plans-menu`, `09-s5-04-look-published-window` |
| s7-02b | D P | plans menu → back to the live copy | "Live working copy ▾" | note | `10-s5-05-back-live` |
| s7-03 | D P | View-only Sched chip | 45, Hex in (published face) | PASS | `11-s5-06-viewsched-window` |

### S6 — earning on the event switched off, amended; on again, amended again; both ways after each

| Step | Size | Did | Screen said | Verdict | Picture |
|---|---|---|---|---|---|
| s6-01a | D P | OIL Earn, chip, "Who earns OIL" tab, tap Hex's seat | seat on → off ("Hex earns nothing from SQN EVENT."); Who's available still 45 with Hex | PASS | `s6-<size>/05-…earn-before`, `06-…earn-after`, `07-…avail-tab` |
| s6-01b | D P | four sign-offs, Publish AL1 | before 1 pending; after 0, "SIGNED AL1 …" | PASS | `08-s6-01b-al-published` |
| s6-01c | D P | Leave War cell | RECORD: **HO\*** | RECORDED | `09-s6-01c-lw-cell` |
| s6-01d/e | D P | "+ SANS" on, then off; Edit Schedule Sat | 0 pending, 45, Hex in, both ways | PASS | `10-`–`15-` |
| s6-02a | D P | OIL Earn, chip ("44 of 45 earn"), tap Hex's seat | off → on; Who's available 45 with Hex | PASS | `16-`–`18-` |
| s6-02b | D P | four sign-offs, Publish AL2 | 1 pending → 0, "SIGNED AL2 …" | PASS | `19-s6-02b-al-published` |
| s6-02c | D P | Leave War cell | RECORD: **FO\*** | RECORDED | `20-s6-02c-lw-cell` |
| s6-02d/e | D P | "+ SANS" on, then off | 0 pending, 45, Hex in, both ways | PASS | `21-`–`26-` |
| s6-03 | D P | — | RECORD: cell FO\* → HO\* → FO\* through ORIG, AL1, AL2 | RECORDED | — |

### S2 — an Event input for ALL AVAIL in place of the event row

| Step | Size | Did | Screen said | Verdict | Picture |
|---|---|---|---|---|---|
| s2-01 | D P | Inputs calendar → 18 Jul → + Input → Event, ALL AVAIL, 10:00–17:00 → Add → OIL question "This input falls on Sat 18 Jul, a non-working day (weekend/PH). Does it deserve FO, a full day of OIL?" → Yes: credit FO → Add | filed; read from the app's input list: ALL AVAIL, Event, 10:00–17:00, OIL FO for 18 Jul | PASS | `s2-<size>/01-s2-01a-input-window`, `03-s2-01c-filed` |
| s2-02 | D P | board: BRIEFING 08:00–09:00, Hex | the input stands on the Common Programme as "EVENT … ALL AVAIL 45 … SQN EVENT W1" | PASS | `04-s2-02-board-rows` (desktop's view is the Ground Programme; the Common row shows in `07-…`) |
| s2-03 | D P | posting as S1 | "On 15 Jul: becomes SANS." | PASS | `05-s2-03-postout-sheet` |
| s2-04 | D P | input row's chip, before Publish | 45, Hex in, purple line | PASS | `06-s2-04-window-before` |
| s2-05 | D P | sign, Publish day, chip | 0 pending, signed ORIG; 45, Hex in | PASS | `07-s2-05-published-window` |
| s2-06 | D P | Leave War cell | FO\* | PASS | `08-s2-06-lw-cell` |
| s2-07 | D P | "+ SANS" on, Edit Schedule Sat | 0 pending, signed ORIG, 45, Hex in, FO\* | PASS | `09-`–`11-` |
| s2-08 | D P | "+ SANS" off | the same | PASS | `12-`–`14-` |

## FAILs

None. (Five first-run script stops are listed under "Final runs cited" — each was the script's, each fixed, each
scenario then walked whole at that size.)

## Errors seen

None in any final run: no console error, page error, 4xx, failed request or native dialog, at either size.

## Leads to check — not findings (seen in passing, not read against the rulings or reproduced)

1. On the Leave War with "+ SANS" off, Hex's row after his SANS posting shows a yellow line on 15 Jul and the posting
   hatch with "PO" on every day from 16 Jul (`s1-desktop/10-s1-09-lw-fo-desktop.png`), FO\* standing on Sat 18 Jul over it.
   D283 says his leave is untracked there; whether "PO" on each day is the drawn look for a SANS posting is for the host.
2. Taking the briefing off read **"2 pending"**, not 1 (S5, both sizes). I did not open the list to read its two lines.
3. The Edit Schedule pictures of the Saturday are scrolled so the day's title row sits above the frame; the "SIGNED ORIG …"
   line and the sections show, the pending figure was read from the page. The board pictures (`…-07-published`,
   `…-08-board-availwin-published`) show the day's whole sign block.

## The lessons of §7.11 — which step covers each, or why not

1 state × reading table — the published Saturday read in every state: "+ SANS" off / on / off, after a week change,
reload ×2, sign-in again, member, working copy vs published copy vs plans-menu look (S1, S5, S7, S16, S17, S20). ·
2 drag/swipe speed — no drag or swipe in my scenarios. · 3 what tells the person it happened — the window, the sign line,
the pending chip and the Leave War cell pictured after each press. · 4 a window leaving the page working — the ALL AVAIL
window: not pressed behind in my scenarios (w2's plain-user round). · 5 a box moved into sight — the window's pucks are
read, not moved; not applicable. · 6 handing something to the phone itself — none. · 7 frame-by-frame motion — none. ·
8 an approved drawing — no new screen. · 9 list headings against figures — not a list change; the window's PILOTS · 28 /
WSOS · 17 against 45 pictured. · 10 page hidden and shown again — the Leave War and schedule left and returned many times,
the week left and returned (s1-15); not idle waits. · 11 depends on how much fits — no. · 12 every page a window opens
from — the count window opened from the board, Edit Schedule, View-only Sched (admin and member) and the plans-menu look
(S7), closed by its ✕ each time (Escape not pressed in my runs — w2's round). · 13 pinch — none. · 14 keyboard walk — none. · 15 bars over scrolling areas — none
changed. · 16 after a refusal — none raised. · 17 show/hide controls — "+ SANS" pressed both ways and back several times,
the grid read after each. · 18 print/download — none. · 19 a window closed each way — the ALL AVAIL window by its ✕ (s1-05b and every read)
only; the ⚙ sheet by its ✕ (phone and desktop, WebKit touch). · 20 gesture by hand — none. · 21 what only his phone
shows — the purple line on a 3x WebKit picture; nothing motion-bound. · 22 checked by what is drawn — the window's pucks
read from the drawn window, and opened in the pictures. · 23 what a tap opens — the count chip opens the ALL AVAIL window
(D38); a member's tap on another man's cell opens no posting door (S20). · 23b side-by-side boxes — no new layout. ·
24 against the top bar / screen-size change — none.

## Not walked

Nothing of S1, S5, S6, S7, S2, S16, S17, S20 was left unwalked at either size.
