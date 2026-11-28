READ lw-decide-look

Scope: the whole diff of `claude/lw-decide-look-197` (commit 35674d625) in `C:\Users\User\projects\Raptor\.claude\worktrees\agent-a1fbc1caadb289d7a`, every caller of `decideLook`, `DecideMark`, `dec-ring`, `dec-off` and `dec-ic`, and the rows D2881, D2880, D1361, D1427, D1421, D1428, D1435, D1441, D1330, D1355, D842 and D1544.

How I checked: I measured the cascade with the branch's own built stylesheets, which are already in its `dist` folder and include this change. I loaded them into a small test page that copies the window's action row, and ran it in WebKit (iPhone 13) and Chromium (Pixel 5) at 402, 390, 375 and 360 wide. These are Windows letters, not Apple's. I built nothing and changed no file in the repo. The only files I wrote are scratch scripts in `C:\Users\User\AppData\Local\Temp\claude\7882e100a472846f\0e31387a-f363-4549-8d4c-24087fed540d\scratchpad\lwdl-measure\`.

## Findings

**1. Medium-low. On a narrow phone, "Approved" and its tick run past the button's edge.**
- **Who meets it:** an admin on a phone 375 wide or less. He opens an approved leave's one-day window, or the day's list, and the lit Approve's tick and the last letter of "Approved" sit on or past the edge. The same happens to a lit "Refused" one step later.
- **Measured** (the distance from the tick to the inner edge, and from the word's end to the inner edge; equal on both sides because the content is centred):

| Width | WebKit | Chromium |
|---|---|---|
| 402 | 4.1px clear | 4.2px clear |
| 390 | 2.6px clear | 2.7px clear |
| 375 | 0.7px clear | 0.8px clear |
| 360 | 1.2px past the edge | 1.0px past the edge |

- **Before this change** (no mark, 12.5px words) the 375 phone had about 2.2px each side. So the tick moves this past his ruling D1387, "a button's words always stand inside the button".
- **His iPhone:** Apple's wider letters (the memory note on his iPhone) will eat part of the 4px at 402. Nothing measured that.
- **Cause:** `raptor-port/src/leavewar/ui/bidpicker.css`:
  - line 1958: the phone mark, 12px plus a 4px gap;
  - line 1960: 11.5px words;
  - line 1946: `inline-flex` with centring, inside `.bp-acts`, four even columns with 4px side padding (line 1920);
  - line 278: the inherited `letter-spacing: .04em`.
- **Fix:** inside the `@media (max-width: 600px)` block, add `.bidsheet .bp-acts > .dchip.dec { letter-spacing: 0; padding-left: 2px; padding-right: 2px; }`. That frees about 7.5px, enough for about 2.5px clear at 360. Then pin it with a phone geometry test. Do not widen the columns: D1330 says four even columns.

**2. Low-medium. On desktop Approvals, Approve grows from 100 to 114 wide and Refuse to 101.**
- **Against the rulings:** D2881 says "Size … unchanged", and D1427 says Approvals keeps its built size.
- **Who meets it:** an admin on desktop Approvals. The pair is no longer one width, and Approve's left edge moves about 15px left on every line.
- **The drawing check:** the standing check `raptor-port/scripts/drawcheck/specs/appr-scroll.mjs` (lines 111 and 115 compare "its Approve" and "its lit Approved" by place and size) will now report about a 14px difference. D1494 says that check stays red until it is fixed or he rules to keep it.
- **Where it is recorded:** the commit message and `ui-contracts.md` record the growth. I found no sign it was put to him as a departure (D1424).
- **Cause:** `raptor-port/src/leavewar/ui/approvals.css:118` (`min-width: 100px; padding: 0 12px`) plus the 14px mark and 5px gap (bidpicker.css:1949) inside the longer word's width (D1435).
- **Fix, either of:**
  - keep 100: on desktop only, `.appr-btns > .appr-ok, .appr-btns > .appr-no { padding: 0 5px }`, or a 12px mark with a 4px gap and 6px padding;
  - or put the 114 to him, with its picture, as a named departure, and re-record the drawing check.

**3. Low. Keyboard focus is invisible on the decided button, and on Approvals a focused grey button wears the "picked" ring.**
- **What happens:** `.dec-ring` (bidpicker.css:1950) is the same 2px cyan ring, offset 2px, that keyboard focus draws.
  - Approvals: `approvals.css:27`, `.appr-ok:focus-visible` draws the same ring.
  - Bid window and day's list: the ring replaces the browser's own focus ring.
- **Measured:** the lit button's outline is identical focused or not (`solid 2px rgb(59,198,232), offset 2px` both ways). An unlit window button gets the browser's ring.
- **Who meets it:** an admin at a desk who tabs onto the decided Approve sees no change. On Approvals, tabbing onto the grey Refuse puts the decided look's own ring on it, so two buttons side by side are ringed. D842, "Double blue ring", is his precedent for this: a picked answer with the keyboard on it shows one slightly thicker ring.
- **Fix:** `.bidsheet .dchip.dec.dec-ring:focus-visible, .appr-btns > .dec-ring:focus-visible { outline-width: 3px; }`. That is (1,4,0) and (1,3,0) with the page's id, so it beats `.appr-ok:focus-visible`. The focused grey one then reads apart by its fill. Better still, for Approvals' grey one: `.appr-btns > .dec-off:focus-visible { outline-offset: 0 }`, so it never wears the decided ring.

**4. Low. Approvals on a phone: a half-day date now wraps at 390, and maybe at 402 for wider months.**
- **At 390:** the 9px mark and 2px gap on each button take 22px from the dates. The commit says such a date takes two lines below about 400.
- **The older probe:** `raptor-port/scripts/handpass/lw-m4-btnwidth.mjs` fails any wrap at 390 or wider, so it will now fail at 390.
- **Already put to him:** this looks like question 4 on the build sheet. I only saw that commit's title on the notes branch; I read nothing of it.
- **At 402 too:** the case measured, "10 Feb AM ›", is not the widest. In the same engine:
  - "28 May PM ›" and "24 Aug PM ›" measure 76.5px;
  - "10 Feb AM ›" measures 75.0px;
  - the commit says the room at 402 is "76 wide", so the wider months may wrap even at his iPhone's 402.
- **Cause:** `bidpicker.css:1966`, plus `approvals.css:160` (the date column takes what the two buttons leave).
- **Fix:**
  - re-measure at 402 with a May or Aug half-day date;
  - if it wraps, drop the mark from the phone line only (`.appr-l1 .appr-btns .dec-ic { display: none }`) or narrow the gap to 1px, and put it to him with the 390 question;
  - update the probe to match whatever he rules.

**5. Low. The tests would pass on a broken look.**
- **What they check:** `litdecide.test.tsx`, `m4page.test.tsx` and `selectsheet.test.tsx` check class names and the mark's tag only. jsdom loads no stylesheet.
- **What nothing checks in a real browser:** the ring is drawn, the grey colour wins the cascade (it does, but only through nesting specificity), or the mark and word stay inside the edge.
- **So:** finding 1 passes every test.
- **Fix:** one phone browser test that opens an approved leave's window and the day's list at 360, 375, 390 and 402. It asserts:
  - the lit button's computed outline is 2px solid in the accent colour;
  - the other button's colour is rgb(125,135,148);
  - the mark's left and the word's right each stand at least 1px inside the border box.

**6. Low, to check against the drawing.** On a phone the decide words are 11.5px while Move and Delete beside them stay 12.5px, so one row mixes two letter sizes. D2881 says the words are unchanged. The commit says the drawing (E3-*-phone) shows this. I could not open the drawing (it is on the chat-194 branch), so the walk should check it against that picture.

## Checked and fine
- **What each state shows:** `decideLook` gives nothing while waiting (pending, null, an unknown state), " lit dec-ring" for its own state and " dec-off" for the other.
  - Bid window: `span ? null : decide?.state`, so a range is never lit.
  - Approvals: `r.lit`.
  - Day's list: a war-approved leave always lit; a bid by `c.state`. Requests there are only pending or refused, which `said()` agrees with.
  - The picked-days sheet is never lit, as D1361 and the ruling say.
- **Free half:** the bid window gets no decide row on a free half (Matrix.tsx:4854 passes no decide).
- **The buttons still work as before:** the change is look only. The other button stays pressable everywhere (no new disabled state). A second tap on the lit one still goes to pending, both in the window (`again`) and in the day's list. The click actions are untouched (D1428). An Approvals line just decided stays put (D1421, tested).
- **Held buttons:** a held Approve (D1544 and D1550) is grey plus disabled at 45% with its reason as the title. A stale Approvals line keeps both off, and the grey one at 40% (approvals.css:126 still applies to `.dec-off`).
- **Cascade, measured:**
  - Both stylesheets are nested under the page's id, so `.appr-btns > .dec-off` beats `.appr-ok`. The grey wins: rgb(125,135,148), with the plain edge.
  - Lit Approvals keeps his drawing's colours, #3FBF6F with #06210F words (D1427).
  - Window lit: #57C97A. The edge at rest is at 45%.
  - No hover rule anywhere recolours these buttons.
  - The ring is never clipped: the window has 12px padding, the day's list does not clip, the Approvals scroll box has 18px at the right, and gaps of 6px or more take the 4px ring.
- **Stylesheet load:** ApprovalsPage does not import bidpicker.css, but the whole Leave War is one downloaded part of the app, so both stylesheets always load together.
- **Width does not change when a button lights:** the mark is present in every state, and Approvals keeps the longer word's width (D1435).
- **Screen readers:** the mark is aria-hidden and unfocusable, so button names and the `toHaveText` checks are unchanged.

## Tidiness note (filed, not fixed — D489)
- **Duplicated:** `lit` and `dec-ring` always travel together, two class names for one state. The day's list calls `decideLook('approved', 'approved')`, which is a constant. The Approvals grey and ring rules live in bidpicker.css, which Approvals never imports, so someone reading approvals.css must look in another file for its decided look.
- **Misreadable names:** `dec-off` reads as "disabled" or "switched off", but the ruling is that it stays pressable. `dec-other` or `dec-unpicked` would say what it is.
- **Untrue comments:**
  - The head of `SheetActions.tsx` (lines 17–18) says the buttons draw "their mark and their state from HERE". The state comes from `decideLook` in `bidhelpers.ts`; only the mark comes from there.
  - The `ui-contracts.md` and bidpicker.css lines say "Approved" "stands clear inside the edge at 390". That holds by 2.6px at 390, but not at 375 or 360 (finding 1).
