# Walk brief — the merge round: the Board's sections written around the caret, with one man's row of a shared leave (chat 183, 25 Nov 26)

You are one of two walkers. You drive the RUNNING app in a scripted real browser, on two frozen builds side by side,
and report what the screen and the store say. You do not read code to find bugs, you do not fix anything, you do not
build, commit, push or edit any source, test or document other than the files named for you below.

**Read first, whole:** `raptor-port/docs/walk-scripts.md` (how walk scripts and briefs are written here, and every trap).

## Where and on what

- Work only in `C:/Users/User/projects/Raptor-r4/raptor-port` (branch `claude/r4-walk-faults-170` with `main` brought
  in; commit `0ff30dbdf`). Run every script from that folder.
- **The two builds, frozen — never rebuilt, never written:** the merged branch `D:/rw4/r183/build-merged-0ff30dbdf`
  (bundle `index-B9okpSpf.js`) and `main` `D:/rw4/r183/build-main-1993bed86` (bundle `index-DCU_WN_H.js`). Every
  scenario is run on BOTH, the same script unchanged, and your table gives both results beside each other. `main` is
  the control: where an EXPECTED line says "as on main today", `main`'s run is the answer.
- **The recipe — routes the host ran today and saw pass on both builds:** `scripts/handpass/shr-a-a1.mjs` and
  `scripts/handpass/r4wf-w2-w3.mjs` (a leave filed for Ranger and Hex through the Inputs page's own window, the Board
  opened on Wed 15 Jul, a box of Ranger's row typed with Tab, the store and the screen read, a picture cut to the
  section). Build on their library: `scripts/handpass/shr-a-lib.mjs` (over `wr4-lib.mjs`) — `world`, `fixture`,
  `openBoard`, `read` (store + screen + caret + agree), `boxSel`, `rowSel`, `typeIn`, `pressAt`, `pic`, `away`,
  `reload`. Settings: `WR4_OUT=<picture folder> WR4_NEW=<build folder> SZ=desk|phone ENG=chromium|webkit
  SHR_BUNDLE=<that build's bundle name>`. Other routes that passed today on the merged build, to borrow from:
  `shr-a-a7.mjs` (`SUB=b`: a shared overseas duty and Reject on a held row; `SUB=d`: his puck then a name),
  `shr-a-a6.mjs` (Undo / Redo), `r4wf-w2-a2.mjs` (a section dragged by its grip), `r4wf-w2-b.mjs` (the Blue/Red
  question open, and a box's place on screen measured), `r4wf-w2-a.mjs` (an ALL AVAIL input; the long word).
  `shr-b-b6.mjs` publishes a day through its four sign-offs — the host did not run it today; prove its first steps on
  today's screen before building on it. A control you name must come from a passing run, never from reading source.
- **Sizes:** desktop 1440×900 Chromium; phone 402×874 with touch, WebKit (his iPhone's size and engine).
- **"A press that keeps the caret"** (several scenarios need it): on his iPhone a tapped button leaves the caret in
  the box it was in. In the test browsers a tap in WebKit usually does the same; Chromium takes it. After every such
  press read `document.activeElement` and say in the row whether the caret was still in the box. If it cannot be kept
  after three tries, the row is "COULD NOT BE MADE", with what you tried.
- **Machine traps:** write every script to a file with the file tool, then run the file — never inline in the shell.
  Never send a script's rewrite and its run in one step. Each script prints a version line. Save as UTF-8.
- **Your own files only** (prefix and folders given at the end): scripts `scripts/handpass/<prefix>-*.mjs`; pictures
  `docs/img/handpass/2026-11-25-r4-walk-faults/merge/<prefix>/<scenario>-<build>-<size>-<engine>/`; scratch
  `.tmp/<prefix>/`; your report. Write nothing else. Do not `git add`, commit or push.
- **Stop rule:** three failed attempts at one gesture → stop that scenario, report it "COULD NOT BE MADE" or "NOT
  WALKED" with the reason, go on. Send your report ONCE, after stopping every script and browser you started.

## Judging

- A row with an EXPECTED line is **PASS** or **FAIL**; "RECORD" rows say exactly what the screen and the store show, on
  each build. A FAIL names: the build(s), the exact presses, what was expected with its source, what was seen (store
  lines and the picture's file). Say for every FAIL whether `main` shows the same.
- After every step read the store (`window.INPUTS`, as `shr-a-lib.mjs store` does) as well as the screen; one picture
  per assertion that matters, cut to the section judged; on the phone a picture right after a tap as well as settled.
- Watch page and console errors; list any.
- **Not a finding:** a problem that lives only in data already stored; anything about a scheduler who is not an admin
  (there is none); an end typed before a start being saved on an Unavailable row (his decision of 11 Aug 26 — the
  shared-row walk's A5). Three things already filed (`OUTSTANDING.md` `[SHARED-ROW-HELD-LEFTOVERS]`): a box typed where
  his part cannot be found saves nothing and says nothing; the history bubble on a held row; the Leave War remark
  window's fallback — if you meet one, name it as that, not as new.

## What is being checked

Two changes now run together. **A** (this branch): while the caret is in a box of the Scheduler Board, every SECTION
of the day except the one holding the caret is rewritten at once, and a section the caret has just left is rewritten
the moment the caret lands in a box of another section; the box he is typing in never moves, never loses its value,
caret or Tab route (`docs/ui-contracts.md`, "While the caret is in a text box"; D551–D555, D597). **B** (`main`, live):
on the Unavailable list an input holding several people is a row a man (D737); a change on one man's row gives him an
input of his own, and every later change, button or drag on his row reaches HIS input, never the others'
(`docs/ui-contracts.md`, the own-part contract; D737, D739). The designers' lists these scenarios come from, with each
scenario's full text: `docs/superpowers/briefs/2026-11-25-r4-walk-faults-merge-scenarios-fable.md` (X1–X10) and
`…-merge-scenarios-astra.md` (M1–M11). **Read your scenarios' full text there**; the lines below are the host's
checked EXPECTED lines and they win where they differ.

The fixture unless a line says otherwise: a leave (LL) for Ranger + Hex on Wed 15 Jul, timed as the scenario says,
filed through the Inputs page's own window (`fixture`); "three men" adds Outlaw.

### Share A — the phone, and presses that keep the caret (phone WebKit first; desktop Chromium where a line says)

| # | Scenario | EXPECTED (source) |
|---|---|---|
| X1 (a) | Ranger's End `1000`, Tab; tap a Ground Programme remark box, type nothing; tap Hex's Start, type nothing; a press of top-bar Undo that keeps the caret; type `0900`, Tab; tap blank; read the Inputs page too | After Undo: ONE leave, both men, as filed. After `0900`: **Hex alone** on a leave of his own at 09:00 and Ranger unchanged, or a refusal in words with the box put back (D737; the own-part contract "never the others'"). FAIL: one leave, both men, 09:00 |
| X1 (a′) | The same with "tap blank space" in place of the Ground box (the route that needs no change of A) | The same EXPECTED. Run on BOTH builds — this row tells whether X1 (a) is new with the merge or already on `main` |
| X1 (b) | As (a) but the caret goes into RANGER's Start before Undo; then `0900`, Tab | Reaches Ranger's part, or refused in words and the box put back (the own-part contract). If nothing is saved and nothing said with `09:00` left in the box: that is `[SHARED-ROW-HELD-LEFTOVERS]` (1) — say so, and say how many presses it took |
| X1 (c) | After the Undo of (a): tap Hex's puck, then Outlaw in the crew list | "… instead of Hex" and Outlaw on Hex's part; RECORD the note's words. FAIL: Ranger replaced |
| X1 (d) | Three men: cut Ranger, then Hex, visit the Ground box, caret into Outlaw's row, Undo once (caret kept), type a time | The typed time reaches Outlaw alone, or a refusal in words. FAIL: it lands on another man's leave |
| X4 | Shared overseas duty (as `shr-a-a7` SUB=b), Personal Inputs open: Ranger's End `1000`, tap his Remark box; Reject on Ranger's row keeping the caret; measure the Remark box's top before and after; type `x` in the still-standing Remark box; Reject on it again keeping the caret; tap blank. Second pass: Personal Inputs folded | Hex's duty and row untouched throughout (own-part contract); the box he is in moves ≤1px (A's promise); after the caret leaves: one Personal Inputs line for Ranger, one Unavailable row for Hex. RECORD: how Ranger's old row reads while it stands, where `x` was saved, the second Reject's words |
| M2 | X4's first pass carried on (Astra's M2): with Ranger's duty now under Personal Inputs, press its Ground button there; change its Ground Programme End to `1100`; tap a box of another section | Ranger alone moves and reads 11:00 on the Ground Programme and under Personal Inputs alike; Hex stays under Unavailable with his filed times (own-part contract; D739). FAIL: a missing or doubled row for Ranger, or Hex changed |
| X6 | Ranger's End `1000`, tap his Remark box; tap his puck; tap a Ground Programme remark box; picture; tap Outlaw in the crew list | RECORD whether tapping the box puts the armed puck down. If it stays armed: the ring is on Ranger's row and Outlaw takes RANGER's place on Ranger's own leave; Hex untouched (own-part contract). FAIL: Hex replaced, or the ring on Hex's row |
| X7 | Cut Ranger (End `1000`, Tab); tap a Ground remark box; Undo, Redo, Undo keeping the caret; tap Ranger's Start, `0900`, Tab | After each press the Unavailable rows read the stored state at once, Ranger above Hex (A's promise; the shared-row sheet's row order); at the end two leaves, never three; Hex's times never moved |
| X8 (a) | Shared overseas duty, nothing changed yet: type `0900` in Ranger's Start and do not leave it; Reject on Ranger's row keeping the caret; tap blank | RECORD exactly what moved to Personal Inputs and whose start became 09:00. FAIL only if something of HEX's changed by a box or button on Ranger's row (D737) |
| X9 | A shared overseas duty on a weekend day with OIL answered Yes; caret in Ranger's End; press "OIL Earn" keeping the caret; type `1000`, Tab | RECORD everything, both builds. The host judges |
| X10 | After a cut, type 60 letters with no space in Ranger's End, Tab into the next section's box. Phone 402 WebKit, and Chromium at 320 wide | The note's words stay inside its border (this branch's promise — FAIL on `main` is expected and is the old fault); the box heals to HIS end (own-part contract); Unavailable shows his row in place |
| M9 | A shared ALL-DAY leave; Available crew dragged above Unavailable by its grip; type `1800` in Ranger's Start, tap his End and type at once. Phone WebKit, and desktop Chromium | Ranger's box moves ≤1px on screen when the section above it is rewritten, and keeps what is typed (A's promise); Ranger's saved end is 23:59 (the shared-row sheet: a start typed on an all-day leave); Hex still all day. RECORD what Available crew shows for Ranger before and after |

### Share B — desktop first (Chromium), phone WebKit where a line says

| # | Scenario | EXPECTED (source) |
|---|---|---|
| X2 | Shared overseas duty, Ranger the LAST row of Unavailable and Unavailable the last section with boxes: Start `0900` Tab, End `1100` Tab, Remark `own` Tab; read `document.activeElement`; Tab once more. Control: a one-man duty | RECORD where the focus is after each Tab on both builds; FAIL only if the merged build differs from `main` for the worse (the focus on the page body where `main` keeps it on a control), or the remark is not on Ranger's own duty |
| X3 | Three men (rows Ranger, Hex, Outlaw); Hex seated on a flying line the leave overlaps if the day allows. Hex's Start `0900`, then WITHOUT Tab click a Ground Programme remark box — picture at once and after 1s; click Hex's End, `1100`, click the Ground box again; Outlaw's Remark `C`, click an Overall notes line; click blank. Desktop Chromium, then phone WebKit | One click puts the caret in the box clicked (A's promise; D551–D555); the Unavailable rows read what is saved the moment the caret is in the other section, in the order Ranger, Hex, Outlaw; at the end three leaves — Ranger alone on the first, Hex 09:00–11:00, Outlaw's own with "C" — never a fourth, never a time on another man's (own-part contract). RECORD Available crew and the warning count at each picture |
| X5 | Ranger the FIRST Unavailable row; Personal Inputs folded. Ranger's Start `0900`, Shift+Tab; picture; Tab; Tab; `1100` in his End, Tab | The caret is in a box after every key (D551–D555) — the same boxes as on `main`; on the way back his Start reads 09:00 and his End HIS end; 11:00 is saved on the same own leave — two leaves in all |
| X8 (b) | Desktop mouse: type `0900` in Ranger's Start of a shared overseas duty, do not leave it; click Reject on Ranger's row once | One press does its job on HIS duty; Hex's untouched. RECORD if a second press is needed, on both builds |
| M1 | Shared leave 08:00–12:00; an ALL AVAIL Meeting 10:00–11:00 filed through the Inputs page; on the Board read the Common Programme row's count (open its window if it has one, and read the names). Ranger's leave Start `1130`, Tab into his End | With the caret still in Ranger's row: RECORD the count and the names on both builds; on the merged build the Common Programme row and Available crew must agree with each other and with what they read after the caret leaves (A's promise). Ranger's box keeps the caret |
| M3 | A shared Meeting for Ranger + Hex 08:00–12:00 (it lands on the Ground Programme and under Personal Inputs); Personal Inputs open. Clear the Meeting's Ground Programme End; click directly into its Personal Inputs Start, type `0900`, Tab | ONE input, both men, throughout (D739 — a time typed on a shared input's row changes it for everyone); RECORD the times saved after each step; every box of both rows agrees with the store once the caret has left, and on the merged build the Ground Programme row agrees while the caret is still under Personal Inputs (A's promise) |
| M8 | Wed published through its four sign-offs with the shared leave on it. Ranger's Start `0900`, then click a Ground Programme box, type nothing; open the changes count and press Ranger's change; open the window from his row's leave name; close the Board; the member's view of the day (`us`/`us`) | The window is Ranger's own leave (own-part contract); the issued schedule the member sees keeps the published times (the published copy is frozen until an amendment is published). RECORD the changes count and what the press on Ranger's change does, on both builds |
| M10 | The M9 set-up on desktop: after Ranger's Start `1800`, drag his puck from Available crew into an empty front seat of an earlier wave (mouse) | RECORD whether Ranger is offered in Available crew and what the drop does; FAIL only if either leave changes because of the drop, or the drag acts on Hex |
| M11 | As `r4wf-w2-b.mjs` (Blue/Red tracking on, a question open in the flying section), but the typing is on Ranger's row of a shared leave under Unavailable: Ranger's Start `1800`, into his End; measure his box; then answer Blue. Desktop Chromium, phone WebKit | The question is still open after the rewrite and the answer lands on its formation; Ranger's box moves ≤1px (A's promise, the sheet's §18); Ranger cut out, Hex untouched |

## Your report

One file, written as you go: a table — scenario, build, size and engine, PASS / FAIL / RECORD / COULD NOT BE MADE / NOT
WALKED, what the screen and the store said in one or two lines, the picture's path — then each FAIL in full, then page
errors, then what you did not walk and why, then every script you wrote and the command that ran it. Your hand-back
message is five lines at most: the report's path, counts by verdict, each FAIL in one line.
