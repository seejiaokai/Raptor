FIXED lw-decide-look

**Commit pushed:** 6c602adc7 on `claude/lw-decide-look-197`. It sits on top of 35674d625, pushed alone by explicit refspec. No pull request edits, and HANDOFF.md is untouched.

**Each fix, with its measurement:**

1. **Keyboard ring** (walk F1/F2, Astra 1, Opus 3; D842, D1646, D1771, D2881). All rules are in bidpicker.css "THE DECIDED LOOK":
   - **Decided button with the keys on it:** one cyan ring, 3px, offset 2px. Without the keys it stays 2px.
   - **Grey button, or any waiting decide button, with the keys on it:** the app's cyan ring, 2px, at offset −1px, so it sits on the button's own edge. This replaces the browser's white ring.
   - The selectors outweigh Approvals' own `.appr-ok:focus-visible`.
   - **Measured, identical at 360, 375, 390, 402 (WebKit) and 1536 (Chromium), in the window and in Approvals:**
     - keys on the grey one: `solid 2px rgb(59,198,232) off -1px`, while the lit one stays `2px off 2px`;
     - keys on the lit one: `solid 3px … off 2px`.
   - **In a browser started at 125%:** 2.4 against 1.6 (lit with keys against grey with keys).
   - **For your eye:** with the keys on the grey button, both buttons in the pair show a cyan outline. The lit one's is outside its edge; the grey one's is on its edge. That is what you specified, but look at `fix1-window-keys-on-grey-360.png` before putting it to him.

2. **Desktop Approvals back to 100 wide** (Astra 2, Opus 2):
   - The side padding goes from 12 to 3, and the mark is 12px with a 4px gap (approvals.css). Letter spacing was already 0 there.
   - Every Approve, Refuse, Approved and Refused button measures 100 wide in every state, at 1536 and at 125%.
   - The smallest clearance of the mark and word inside the edge is 6.73px at 1536 and 6.94px in a Chromium started at 125% (`--force-device-scale-factor=1.25`).
   - Arial's wider letters leave about 4px.
   - The standing drawing check `scripts/drawcheck/specs/appr-scroll.mjs` is GREEN: all 5 views, 0 differences. It carries its older warning that the record was not taken from the approved picture.
   - Approvals' phone line is unchanged, as you asked.

3. **Narrow phone, the window and the day's list** (Opus 1; D1387):
   - Under 600 wide the decide buttons get `letter-spacing: 0` and 2px side padding. The four columns stay even (D1330).
   - That alone was not enough: in Arial at 360 the clearance was 0.67px. Side padding does not help, because the content is centred in a fixed-width column.
   - So under 380 wide the mark is 11px with a 3px gap. This departs from the drawing's 12px/4px only on 375 and 360 phones; 390 and 402 keep the drawing's sizes.
   - **Clearance in WebKit, both sides, the tightest case being lit "Approved":**

     | Width | Clearance |
     |---|---|
     | 360 | 1.66px (was 1.2px past the edge) |
     | 375 | 3.53px |
     | 390 | 4.41px |
     | 402 | 5.91px |

   - Button height stays 30.3 in WebKit, the same as the walk measured.

4. **Real-browser test:** new `e2e/decidelook-leavewar.spec.ts`. It runs in the lw-desktop project only and sets each width itself (360, 402 and 1536), using Arial as the other specs do. It asserts:
   - the lit button's outline is 2px solid accent, and 3px with the keys on it;
   - the grey button's colour is rgb(125,135,148);
   - a focused grey button's outline is cyan and its offset is not 2px;
   - the mark's left and the word's right each stand at least 1px inside the edge;
   - desktop Approvals buttons are 100 wide, before and after deciding.

   It covers the window (approved and refused), the day's list (approved morning and refused afternoon) and Approvals. **Red first:** on the old build all 3 tests failed for the three reasons above (the browser's `auto 1px` ring; −1.17px at 360; 102 wide in Arial). **Green after:** 3 passed. Both runs were under the checks lock, released after each, against a preview I served on port 4473, now stopped.

**Comments and documents corrected:**
- The head comment of `SheetActions.tsx` now says the mark comes from there and the classes from `bidhelpers.ts`.
- The wording "stands clear inside the edge at 390" is replaced, in both `ui-contracts.md` and `bidpicker.css`.
- Approvals' desktop width in `ui-contracts.md` is back to 100.
- The Approvals phone-line text in both files now says what happens at 360 (three lines, row 45 tall; main: two lines, 36), named as his pending call.
- `docs/file-map.md` lists the new spec.

**Checks:**
- Touched unit tests, including the two source-scanning tests: 7 files, 138 passed.
- `npm run build`: passed (taken when the lock was free).
- `npm run lint:changed`: no new finding (13 files).
- `npm run docsize`: OK.
- Browser spec: 3 of 3 passed.
- Approvals drawing check: GREEN.

**Pictures:** 22 new files with the `fix1-` prefix in `C:\Users\User\projects\Raptor\.claude\worktrees\agent-a1fbc1caadb289d7a\raptor-port\docs\img\handpass\2026-11-28-lw-decide-look\`, left uncommitted as you asked:
- `fix1-window-approved-{360,390,402,1536-x2}.png`
- `fix1-window-keys-on-lit-{360,390,402,1536-x2}.png`
- `fix1-window-keys-on-grey-{360,390,402,1536-x2}.png`
- `fix1-daylist-{360,390,402,1536-x2}.png`
- `fix1-approvals-keys-on-lit-1536-x2.png`, `fix1-approvals-keys-on-grey-1536-x2.png`, `fix1-approvals-lines-1536-x2.png`
- `fix1-pc125-approvals-{keys-on-lit,keys-on-grey,lines}-1229.png`, from the Chromium started at 125%

The probe script I used is `C:\Users\User\AppData\Local\Temp\claude\7882e100a472846f\0e31387a-f363-4549-8d4c-24087fed540d\scratchpad\clear.mjs`.

**Not done or open:**
- Approvals' phone line is unchanged and waits for his answer. At 360 it still takes three lines and grows to 45 tall.
- The 375 window pictures were measured but not saved, since you asked for 360, 390, 402 and 1536.
- On the branch's first commit, the GitHub "Deploy to GitHub Pages" run had failed, while "Secrets scan" and "Docs guard" passed. I did not look into it. The new push had not yet started runs when I checked.
- The day's list at 1536 was pictured approved only, not under the keys; the keyboard rules are shared and were measured in the window.
- All measurements are WebKit and Chromium on Windows, not his iPhone's own letters.