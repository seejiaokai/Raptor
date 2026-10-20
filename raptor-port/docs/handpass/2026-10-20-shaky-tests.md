# Bug check — the shaky-tests batch (D994's small fixes, Checks and tooling, 20 Oct 26): `[CI-E2E-FLAKES-1020]`, `[BOARD-TAB-FOLD-BOARD]`, `[LW-WINDOW-PRUNE-FLAKE-2]`, `[LW-SCRUBBER-FLAKY]`

Branch `claude/shaky-tests-batch-ea7fc2`, cut from `main` at pull request 551; pull request 552. Built 20 Oct 26 by Opus,
one area (the browser checks, and the one board fold they had blocked), one check (D1087). His pick: the R box first —
"find out whether the app really loses the time" — and a picture of the R box on a phone first
(`docs/img/handpass/2026-10-20-shaky-tests/01-rbox-phone-board.jpg`, sent to him before the work). The investigation ran on a
throwaway branch, `claude/debug-rbox-linux` (never merged): a debug workflow on GitHub's Linux machines and an event log
of the page printed for the failing test.

## 0. What each item was, what was found, and what it is now
| Item | Found | Now |
|---|---|---|
| `[CI-E2E-FLAKES-1020]` (2) — the R box phone test: a cleared take-off, "1300", Enter, the save stayed empty (GitHub only) | **Not the app.** An event log of the page on 24 Linux machines (four rounds of six), each running the test's share twice, caught it 9 times, on 6 of the machines (a failing machine often failed both tries): the simulated finger's tap on the EMPTY take-off box gave it the focus, but the browser left the typing caret in the landing box before it; the four keys then reached no box — no input event at all, so the box stayed empty on screen and nothing could be saved. A 4-second wait showed the caret never came; the same events passed on the same machine's next try; between the tap and the keys the app ran no script that moves a caret, a focus or a value (each such call was logged). The first 40 repeats of the test alone on Linux, and every run on his PC, never met it. | The test's tap puts the caret where the tap should have, only when the browser left it out (`caretFollows`, logged when it fires), never by a second press (D1047's one-tap state). Verified: every raptor share three times on separate machines, retries off — green. |
| `[CI-E2E-FLAKES-1020]` (1) — the D555 Tab-order test timed out (GitHub only) | Not a fixed wait, and no box was never reached: the test's own work. It asked the browser about each of a surface's ~210 typing elements twice (visible? typeable?) — about 860 round trips — and walked the week and the board in one test: 29.4 s of its 30 on `main`'s run of 20 Oct 26. | The same two questions asked inside the page in one call (`typeable`, at all six places of the file), and one test a page: 9.4 s alone on his PC became about 4 s each; on GitHub 7–16 s. |
| `[BOARD-TAB-FOLD-BOARD]` — on the Scheduler Board "1000" typed and left by Tab still read "1000", though 10:00 was saved (before: `docs/img/handpass/2026-10-20-standby-batch/before/01-board-take-off-after-tab.png`) | It had been taken back out because the R box test went red with it in; that test's failure is the simulated tap above, which happens without the fold too. | Put back as built on 20 Oct 26 (`board.ts boardChange`: the box left reads the time as saved, an input's own start / end too, never while the box holds the caret); its unit test and RB15 with it. Walk pictures `walk/01`, `05` (10:00 at once). |
| `[LW-WINDOW-PRUNE-FLAKE-2]` — the Leave War month-window test, about one full run in two on a busy PC | The filed theory (a prune waiting for an idle PC) was wrong: a jump to January drops December **in its own draw**, and on a desktop the fill then draws December back, a month a beat. A poll that started late met December legitimately back. Proved: a 3-second pause after the jump made the old check fail 2 of 2. | The drop is read at the jump's own draw (a MutationObserver installed with the press). |
| `[LW-SCRUBBER-FLAKY]` — the scrubber test timed out on a saturated PC (last seen 22 Sep 26, before the test was rewritten on 23 Sep) | Its three waits were polls on the right condition, each with its own 4- or 9-second cap — the wall clock a saturated PC outlasted. | `timeout: 0` — only the test's limit bounds them (D87). 12 of 12 at four times slowed on his PC; the Leave War sets green on Linux. |

## 1. The tier — the eight questions (the order's §5)
1. Money (OIL): **NO** — nothing earns differently. 2. The published record: **NO**. 3. Saved data: **NO** — the fold
changes what the box shows after the save, not what is saved. 4. A shared drawer: **YES** — the time box's save is shared
by every time box on the board (as the standby batch judged the same fold). 5. A new gesture: **NO**. 6. A new surface:
**NO**. 7. Roles: **NO**. 8. The warning list: **NO**. → **WALK**, sized SMALL: one change on screen, built and walked
once already (the standby batch); the host alone, one scripted walk of the built bundle.

## 2. The roll-call — every place a time box on the board is left
| Place | Has it / must not, because… |
|---|---|
| A flying line's R, B, TO, LD (board, desktop and phone) | has it — TO, LD walked (D1, D2, P1, P2); R and B by the unit test |
| An input's own start / end in Personal Inputs (board) | has it — walked (D5, P5) |
| A standby line's START / END (board) | has it — the same `ff:` time keys (the standby batch's walk) |
| The week's boxes and input cells | has it — LIVE since pull request 547 (`textedit.ts`), untouched here |
| A box still holding the caret (the window losing focus, Enter) | must not — rewriting under the caret would lose the place being typed (D3: Enter leaves "1300" in the box, saved 13:00; D4: Escape still puts 13:00 back) |
| A save the board refused (a time it cannot read) | must not — the existing revert sets the saved value back (`else f.value = txtGet(p)`), untouched |

## 3. The walk
`scripts/handpass/walk-shaky-tests.mjs` on the built bundle, the board opened by its own button, every time typed by a real
press and real keys; desktop 1440 × 900 by mouse, phone 402 × 874 by finger. D1/P1 "1000" + Tab: saved 10:00, the box reads
10:00, the caret on the landing · D2/P2 the landing's time selected, "1135", a press on the remarks: 11:35 · D3/P3 the R box
test's own step — cleared by one tap and Backspace, Tab (saved ""), tapped empty, "1300", Enter: saved 13:00 · D4/P4 "9" then
Escape: 13:00 back · D5/P5 an input's own start "1015" + Tab: 10:15. **10 PASS / 0 FAIL**, no console errors, no page errors,
no 4xx. Pictures `docs/img/handpass/2026-10-20-shaky-tests/walk/` 01–08, opened. (The first run's D2 / P2 were the script's
own: it typed into a box reached by Tab, which arms nothing — D1047 — so "14:051135" was refused; the step now selects the
time first, as a person would.)

## 4. The gates
- His PC: the touched browser files — `rallybox` 19 / 19 (1 skipped), `schedule-tab` 29 / 29 (2 skipped), the two Leave War
  tests 12 / 12 at four times slowed, `undo-wire.test.ts` 50 / 50.
- GitHub, the investigation branch with this batch's code: every raptor share on three separate machines and the Leave War
  desktop and phone sets — 15 jobs, retries off, all green.
- GitHub's run of pull request 552 on the first push (`2e7085d35`): green, every leg. After the read's fix below:
  `undo-wire.test.ts` 51 / 51 (the new case red first), every test file related to `board.ts` and `textedit.ts`
  206 / 206 files, 3,945 tests; the type check clean; GitHub's run of the fix push is the full check (D902, D1086).

## 5. The read
One fresh, blind Opus read of the diff (D790), asked for what is missing as well as wrong. It cleared the board's time
fold, the tap helper (it acts only when the caret is missing and never presses again, so D1047's one-tap state is
untouched; its selection test is right for a box and for a typing cell), the one-call box finder (Playwright's own
reading of visible, document order kept, the split D555 starting from the same state) and the Leave War test (the check
and the press in one page task; no hang). Its leftover risk, said plainly: if the app itself ever left a tapped box
focused without its caret, the phone tests would no longer catch it — the helper's console line is the only sign.

**F1 (medium) — fixed, red first.** One man's row of an input that holds two (on the Unavailable list, `iid~person`)
saves a time typed there into a record of his own, cut out of the shared one; the fold then read the time back off the
SHARED record, so his End box showed 10:00 when 11:30 was saved for him (before this batch it showed "1130": untidy but
true). The week's twin of the fold, LIVE since pull request 547, had the same fault. Both now fold the time typed — what
the save stored — not a record's time (`board.ts boardChange`, `textedit.ts routeFocusOut`); the unit case is a
two-man input on both surfaces (`undo-wire.test.ts`). The fix is two lines of the same shape as the code it replaces,
re-walked (below), and read by no second reader: the order's narrow re-read is for a fix that rewrites logic (§5).

**The re-walk** (`WALK_DIR=walk2`, the fixed build): 10 PASS / 0 FAIL, no browser errors.

Walk: host, scripted, 10 PASS / 0 FAIL, then the re-walk 10 PASS / 0 FAIL; desktop 1440 + phone 402; 8 + 8 pictures and the standby batch's before picture; browser errors none.
