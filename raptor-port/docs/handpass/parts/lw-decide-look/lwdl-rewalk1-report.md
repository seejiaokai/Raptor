REWALK lw-decide-look

Fix round 1 fixes all three faults I reported (the two keyboard rings and the narrow-PC overflow). Nothing in the walked areas failed. Two things are left for his call: the keyed grey button is told apart only by its edge ring and grey fill, and at 402 "28 May PM ›" drops its "›" to a second line.

**What was walked.** Build 6c602adc7. Its build output is from 13:33:14, after the last source change (13:33:03); the commit itself was made at 13:42, and nothing was rebuilt. It was served on 127.0.0.1:4192.
- For item 4 I also served current main (828040611; it gained only unrelated changes since this branch's base) and the first commit 35674d625. Both were built on D: with the checks lock free.
- All servers are stopped and the D: worktree is removed. Nothing was committed or pushed, and no source file was changed. No page or console errors in any run.
- I opened every picture named below myself.
- One thing to know about the pictures: my item-3 reruns reused the first walk's script names, so they overwrote the first walk's `AP-A-desk-*`, `AP-H-*` and `AP-I-*` pictures. Those files now show fix round 1. Everything else from this round carries the `rw1-` prefix (47 files), plus `first\` and `main\` sub-folders for item 4.

## 1. The keyboard on a decided button (F1/F2, A4)

| Place | Sizes | Verdict | Measured | Pictures |
|---|---|---|---|---|
| Bid window | desk 1536, WebKit 402 (Tab), Chromium 402 touch (Tab) | PASS | Lit, no keys: 2px cyan, offset 2. Lit with keys: **3px** cyan, offset 2, still one ring. Grey with keys: 2px app cyan, **offset −1** (on its own edge), not the browser's white. | rw1-KEY-{desk,p402,c402}-W1-keys-on-lit, W2-keys-on-grey |
| Day's list | same | PASS | Same three readings. Shift+Tab reaches the grey Approve. | rw1-KEY-*-L1, L2 |
| Approvals | same | PASS | Same three readings, so Approvals' own focus ring no longer copies the decided ring. | rw1-KEY-*-A1, A2, A3 |

**Can a person tell from the picture alone which is decided and where the keys are? Yes:**
- The decided one keeps its solid fill and its ring stands off the button with a dark gap.
- The keyed grey one has a grey fill and the cyan sits on its own edge, with no gap.

Two things for his look (REPORT):
- With the keys on the lit button, the only change is the ring going from 2px to 3px. It is visible zoomed in but subtle at normal size (compare W1 with the first walk's WIN-desk-3-approved-zoom).
- With the keys on the grey button, both buttons in the pair show cyan. They are told apart by the gap and the fill, not by colour (rw1-KEY-desk-A2-keys-on-grey, rw1-KEY-p402-L2-keys-on-grey).

## 2. Narrow phones: the window and the day's list (WebKit, scale 3)

The lit one's gap is the space between its mark and the left edge, and between its last letter and the right edge.

| Width | Window and list, all four states | Lit one's gap, each side | Four even columns | Row (Approve, Refuse, Move / Delete) | Mark |
|---|---|---|---|---|---|
| 360 | PASS | "Approved" 2.7px, "Refused" 6.8px | 73 each | 30.3 / 30 (window) and 30.3 (list), one row, unchanged | 11px |
| 375 | PASS | 4.5 / 8.7 | 76.8 each | same | 11px |
| 390 | PASS | 5.4 / 9.6 | 80.5 each | same | 12px |
| 402 | PASS | 6.9 / 11.1 | 83.5 each | same | 12px |

- Nothing is clipped at any width, and the window and the list read identically.
- The 11px mark at 375 and 360 is the named departure from the drawing's 12px. Picture: rw1-NARROW-side-by-side-360-375-390-402.png (approved and refused at all four widths). Per-width pictures: rw1-NARROW-p{360,375,390,402}-{W,L}-{approved,refused}.

## 3. Desktop Approvals back to 100 wide

| Scenario | Verdict | Measured, compared with main |
|---|---|---|
| F7/A1, 1536: boxes across states | PASS | Every line: Approve 100×36 with its left edge at 1071, Refuse 100×36 at 1179, identical waiting, approved and refused. Main also has 1071 / 1179, width 100. Mark 12px. "Approved" has 7.7px each side; the waiting "Approve" sits 7.7 / 12.2 because its span keeps the longer word's width (centred off by about 2px, worth noting only). |
| F23, 1536 and 1100 | PASS | 1536: no sideways scroll, right edges 1171 / 1279 (= main). 1100: the list scrolls sideways 1146 against 1040, the same as main (the first commit was 1154). Edges 1059 / 1167 (= main). No date wraps. |
| F22, PC at 125% | PASS | 1070.8 + 100 / 1178.8 + 100 on every line, one column. The faint edge shows on all four sides in the picture. Ring cyan all round. |

Pictures: AP-A-desk-*, AP-H-desk-H-list, AP-H-d1100-H-list, AP-I-pc125-I1/I2/I3. These are the overwritten files mentioned at the top. The comparisons are main\AP-H-*, main\AP-A-desk-*.

The one failing line in the 1536 run ("line 10 ring cut at the bottom by 10.5px") was measured while the last line sat partly below the list's fold. Scrolled to the foot it is whole (AP-A-desk-A4-last-line-at-foot), so it is not a finding.

## 4. GitHub's failed check (leavewar.spec.ts:9241): does anything show past the pinned headings now? **No.**

- **What the test drives.** The Approvals page on a narrow PC: 1000×733, member `us` signed in, the war's role set to admin, viewer unpinned. It scrolls the list to 60/0, 120/0, 200/0 and 120 down / 200 sideways, and fails if any line's Approve or Refuse shows past the end of the pinned headings.
- **How I reproduced it.** By hand in Chromium, with the test's own reading, in the app's letters and again in forced Verdana (close to the Linux machine's wider DejaVu letters).
- **First commit 35674d625: reproduces GitHub's failure exactly.** At 120 down / 200 sideways, two Refuse buttons stand past the headings' end (headings end at 967):
  - app letters: Refuse spans 875–975 (lines 1136 wide against headings 1128);
  - Verdana: Refuse spans 881–990.
  - Pictures: first\rw1-NARROWPC-d1000-app-y120-x200.png and first\rw1-NARROWPC-d1000-verdana-y120-x200.png. The Refuse column runs past the headings' end, and a stub of it shows at the top right.
- **New build 6c602adc7:** no leak at any of the four positions, in either set of letters. Lines are 1128 wide, the same as the headings; buttons are 100/100. Pictures: rw1-NARROWPC-d1000-{app,verdana}-y*-x*.png.
- **Main:** no leak either, same geometry. Pictures: main\rw1-NARROWPC-d1000-*.

So that check should pass on GitHub now. I did not run the e2e file itself.

## 5. Approvals' phone line at 402, a May half-day date: REPORT

- I made "28 May PM" through the bid window (PM, LL, then back to pending).
- At 402, **"28 May PM ›" does not stay on one line**: the "›" drops to a second line. The dates block is 30px tall (two lines), the row is still 36px, and the buttons are 77 / 68 wide.
- Picture: rw1-MAY-p402-may-line.png.
- Main was not walked for this date. Main's phone buttons were 11px narrower each, so it likely fit there, but that is untested.

## Where things are

- Pictures: C:\Users\User\projects\Raptor\.claude\worktrees\agent-a1fbc1caadb289d7a\raptor-port\docs\img\handpass\2026-11-28-lw-decide-look\ — `rw1-*` files, plus `first\` and `main\` sub-folders for item 4.
- Scripts are in C:\Users\User\AppData\Local\Temp\claude\7882e100a472846f\0e31387a-f363-4549-8d4c-24087fed540d\scratchpad\lwdl\ (rw1.mjs and narrow-side.py are new this round; lib.mjs and walk-appr.mjs were reused). They still need copying to `scripts\handpass\lwdl-*.mjs`, which I am not allowed to do.
- Logs, same folder: log-rw1.jsonl, log-rw1-main.jsonl, log-rw1-first.jsonl, and rw1-*.txt.

Duration: about 25 minutes, 13:46 to 14:11.