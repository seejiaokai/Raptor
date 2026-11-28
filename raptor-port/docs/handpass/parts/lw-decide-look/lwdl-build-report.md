REPORT lw-decide-look

**Status:** built, tested and pushed. No pull request opened. Two things need your call before this goes to him (point 1 under Departures, and the docs points under Unsure).

**Commit pushed:** 35674d625 on `claude/lw-decide-look-197`, cut from origin/main. It has no upstream; I pushed with an explicit refspec. The worktree guard refused the `git config branch.*` lines because they write the shared config, so I created the branch with `--no-track` instead. It can never push to main by default.

**Files changed (all under `raptor-port/`):**
- `src/leavewar/ui/SheetActions.tsx`: new `DecideMark`, the drawn tick or cross. It is an inline SVG in `currentColor`, using the drawing's own paths, with class `dec-ic` and `data-mark`. The head comment now describes the one decided look.
- `src/leavewar/ui/bidhelpers.ts`: new `decideLook(state, mine)`. It returns ` lit dec-ring` for the decided button, ` dec-off` for the other one, and nothing while waiting. It sits here rather than in `SheetActions.tsx` because the lint check flags a non-component export in a component file.
- `src/leavewar/ui/BidPicker.tsx` (one-day window and drag window), `DayList.tsx`, `SelectSheet.tsx`, `ApprovalsPage.tsx`: use `decideLook` and `DecideMark`. The picked-days sheet only gets the marks, because a picked range is never one decided state.
- `src/leavewar/ui/bidpicker.css`:
  - The resting edge is now the words' colour at 45%.
  - New block "THE DECIDED LOOK" is the one recipe for all four places:
    - the decide buttons become inline-flex;
    - `.dec-ic` is 14px with a 5px gap;
    - `.dec-ring` is the lit leave button's ring (2px accent outline, 2px offset, no glow);
    - `.dec-off` is grey words #7d8794 on the plain edge.
  - Phone rules:
    - Under 600 wide: the mark is 12px and the window's decide words 11.5px, as the drawing has them. The button is also stretched to the row's height.
    - Approvals' phone line: the mark is 9px with a 2px gap.
- `src/leavewar/ui/approvals.css`: the resting edge is his green or red at 45%. His drawing colours from D1427 are kept.
- Tests:
  - `src/leavewar/ui/litdecide.test.tsx` has a new D2881 block. It pins the decided button carrying `dec-ring` and the other `dec-off` (still pressable), a drawn mark in every state and no typed glyph, a second tap sending the entry back to waiting, and nothing ringed over a picked range. It covers the one-day window and the day's list.
  - `src/leavewar/m4page.test.tsx` covers the same for Approvals, including that the line stays put.
  - `src/leavewar/ui/selectsheet.test.tsx` checks the marks and that nothing is ever ringed or grey there.
- `docs/ui-contracts.md`: both deciding passages updated to the built look, citing D2881. No file was added or renamed, so `file-map.md` is unchanged.

**Where the look now appears:** the one-day bid window, the drag window (only ever waiting), the day's list, the picked-days sheet (only ever waiting), and the Approvals list on desktop and phone.

**Checks:**
- Touched and related unit tests: 7 files, 138 passed. These include the two source-scanning tests (`src/engine/inputs-readers.test.ts`, `src/state/perms-scan.test.ts`).
- The other test files that press the decide buttons: 15 files, 290 passed. An earlier run of 10 files, 247 passed.
- `npm run build`: passed. I ran it only once the checks lock was free; another chat held it for a while.
- `npm run lint:changed`: no new finding across 12 files.
- `npm run docsize`: OK.
- In the real bundle at 1536 and 390, every decide button's words and mark stand inside its edge. The window's row stays 32 tall and Approvals' row stays 36 tall.

**Screenshots** (each place waiting, approved and refused). All are in `C:\Users\User\AppData\Local\Temp\claude\7882e100a472846f\0e31387a-f363-4549-8d4c-24087fed540d\scratchpad\shots\`:
- `bid-pending-desktop.png`, `bid-approved-desktop.png`, `bid-refused-desktop.png`, `bid-pending-phone.png`, `bid-approved-phone.png`, `bid-refused-phone.png`
- `daylist-approved-pending-desktop.png`, `daylist-approved-refused-desktop.png`, `daylist-approved-pending-phone.png`, `daylist-approved-refused-phone.png`
- `select-pending-desktop.png`, `select-pending-phone.png`
- `approvals-pending-desktop.png`, `approvals-decided-desktop.png`, `approvals-lines-desktop.png`, `approvals-pending-phone.png`, `approvals-decided-phone.png`, `approvals-lines-phone.png`
- The phone pictures again at his iPhone's 402 width: the same names with `-phone402`, for example `approvals-lines-phone402.png`.

**Departures from the drawing (the drawing only covers the bid window):**
1. **Approvals on a phone conflicts with D1441.** Approvals' phone buttons are only as wide as their words, so any mark beside the words squeezes the request's dates.
   - At his 402, with a 9px mark, a half-day date such as "10 Feb AM ›" stays on one line, measured in WebKit. A 12px mark broke it.
   - At 390, any mark puts those dates on two lines (they still fit inside the buttons' height, so the row does not grow). Without the mark they fitted on one line.
   - The mark on Approvals' phone line is small (see `approvals-lines-phone.png` and `approvals-lines-phone402.png`).
   - D2881 asks for the mark everywhere; D1441 says the date stays on one line at his phone's width. D2881 does not clearly cover this, so it is his question.
2. **Desktop Approvals buttons are wider.** Approve is 114 wide with its mark (about 100 before) and Refuse is 101, so the pair is slightly uneven. Height and row are unchanged, and nothing moves on a press because the longer word's room is still kept. The width change goes against the brief's "size unchanged".
3. **The window's decide words are 11.5px under 600 wide.** This is the drawing's own phone rule. At full size the tick sat 2px from the edge at 390. The row is still 32 tall.

**Unsure or left undone:**
- D2881, the drawings and their D2881 wording are not on main; they are only on `claude/leave-points-notifications-7a2f04`.
  - I read the rulings and the drawings from that branch.
  - I did **not** edit `.claude/rules/decisions/leave-war.md`, because the "… not built [D2880, D2881]" line does not exist on main. Dropping "not built" still needs doing on that branch, or after both have merged.
  - My `ui-contracts.md` edits cite D2881 too; the document check accepted that.
  - That branch also edits the same two `ui-contracts.md` passages, so the later merge will clash there. Keep this branch's "built" wording.
- The 402 checks ran in Playwright's WebKit on Windows. His iPhone's own font may differ, so the Approvals phone date fit is worth checking on his phone.
- No walk, reviewer read or Fable/Astra scenario design was run here; the bug-check tiering is still owed by the host.
- The "Rulings" line is the host's to fill. No new ruling was made in this job.