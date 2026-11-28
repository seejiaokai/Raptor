# Walker B — D2573 walk (a SANS man struck on a flying seat with no times yet), chat 179, 25 Nov 26

Build walked: `D:/raptor-work/c179-build`, served on port 4882; its page named `index-DmZtA8E3.js` (checked at the start). Clock
15 Jul 2026 09:00 unless a step moved it. Every scenario in a fresh browser world, Saber signed in, Ranger posted out as SANS from
Fri 17 Jul through the Leave War (⋯ → Post out → SANS, the sheet read "On 17 Jul: becomes SANS."). Ipman's callsign on screen is
**Jester** (id `ipman`). Sizes: desktop 1536×1000 Chromium; phone 402×874 WebKit, touch, 3x.

**Result: 0 FAIL in the final runs. Every scenario PASS or RECORDED as the brief asks. No console errors, page errors or failed
requests in any scenario.** (3 FAILs in the first desktop run were the script's own, fixed and re-walked — see "Script faults".)

## Where everything is

- Scripts: `C:/Users/User/projects/Raptor/raptor-port/scripts/handpass/sns-w1B.mjs` (the walk), `sns-w1B-lib.mjs`,
  `sns-w1B-env.mjs`, `sns-w1B-fit.mjs` (the 402-wide fit measure), `sns-w1B-probe.mjs` / `-probe2.mjs` / `-probe3.mjs` (route
  proofs). Run: `SZ=d|p SNSB_RUN=run1 [ONLY=f3,f7] node scripts/handpass/sns-w1B.mjs` from `raptor-port/`.
- Pictures (cited run): `C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-11-25-sans-notimes-strike/B/run1/`
  (832 files; the phone's tap-at-once pictures in its `taps/`), and `.../B/run2/` (77 files: the desktop re-walk of A-S09 and
  A-S19). Picture names: `<scenario>-<step>-<desktop|phone>.png`; `-clip-` pictures are cut round the puck or the SANS Avail list.
- **Not cited:** `B/run1/as09-*-desktop.png` and `B/run1/as19-*-desktop.png` are the first desktop attempt (the script faults
  below) — the cited desktop pictures for those two are in `B/run2/`. `B/try1/`, `B/probe*/` are route proofs.
- Raw logs: `D:/raptor-work/c179-walk/B/` — `run1-d.log` (desktop, all), `run2-d.log` (desktop re-walk A-S09, A-S19),
  `run1-p.log` (phone F3, F3b), `run1-p2.log` (phone, the rest, one process a scenario), `fit-p.log`, `probe*.log`. Per-scenario
  results as JSON beside the pictures (`results-<scn>-<size>.json`).

## The table

D = desktop, P = phone. "Ranger's words" R17 = "SANS from Fri 17 Jul: no availability filed. File it on the Inputs page's SANS tab."

| Ids | Size | Result | What the screen said | Pictures (B/run1 unless noted) |
|---|---|---|---|---|
| F3 = A-S11 | D, P | PASS | Ranger tapped into blank flights Sat 18 and Mon 20 (no times anywhere); schedule left on week 13 Jul. Ranger's bell: "You're SANS from Fri 17 Jul." / "You're planned on Sat 18, Mon 20 Jul with nothing filed. Tap to file for availability." — each date once. Tap opened Inputs → SANS, July, the Sat 18 day window; the list closed. Saber then picked the RCP of the same Sat 18 flight: Ranger struck, R17 printed — on the Board and on Edit Schedule's crew panel. | f3-f3-bell-*, f3-f3-tap-tapped-*, f3-f3-rcp-armed-clip-*, f3-f3-ercp-earmed-clip-* |
| F3b (A-S11's second half: seats made before the posting) | D, P | PASS | Same bell words; Ranger struck R17 on the Sat 18 RCP. | f3b-f3b-bell-*, f3b-f3b-rcp-armed-clip-* |
| F6 = A-S08 (four worlds: Fly all day; Fly 08:00–10:00 Ranger / 08:00–12:00 Jester; OFT only; AMT only — filed by Saber for both on Sat 18) | D, P | PASS | Blank Sat 18 FCP picked on Edit Schedule's crew panel: Ranger and Jester plain, no reason, counted free ("SANS Avail · 2 free") in all four. After 13:00–14:00 typed: Fly all day — both plain; window — "SANS — available 08:00–10:00 only" / "SANS — available 08:00–12:00 only"; OFT only and AMT only — "SANS — not offering Fly" (count "0 free"). No reload needed anywhere. | f6{all,win,oft,amt}-f6*-b-earmed-clip-*, -t-earmed-clip-* |
| F7 = A-S13 | D, P | PASS | SC, AVALON, BB added on Sat 18; every formation's times cleared (read back blank). MAIN and SPARE, FCP and RCP of each: no "no availability filed" for Ranger, Jester or Marlin (Ranger and Jester plain; Marlin only "WSO — cannot fly front seat" on FCP). AVALON and BB ticked FLIES, times blank: the same. Control (RECORDED, not a finding): SC MAIN with 07:00–13:00 typed strikes Ranger R17 and Jester "SANS — no availability filed for today" (known, D2576–D2578 not built). | f7-f7-SC-MAIN-p-sans-clip-*, f7-f7-AVALON-FLIES-p-flies-*, f7-f7-BB-FLIES-*, f7-f7-SC-MAIN-timed-* |
| F8 = A-S10 | D, P | PASS | Wed 15: Thu 16 blank FCP — Ranger in "Pilots · 27 free", plain; Fri 17 and Sat 18 blank FCPs — struck R17, the same words as a timed Sat 18 seat. Edit Schedule crew list, Fri 17, nothing picked: struck, no reason line (D2420). Page left open across midnight (clock run to Fri 17 00:00, no reload): Thu plain; Fri, Sat and the timed seat all "SANS — no availability filed for today". Reopened at Fri 17 09:00: the same. | f8-f8-{wed,mid,fri}-{Thu,Fri,Sat}-armed-clip-*, f8-f8-wed-unpicked-elist-* |
| F12 = A-S12 | D, P | PASS | Ranger on a blank Sat 18 flight: bell "…planned on Sat 18 Jul…". His line cancelled (CX, "WX"): bell empty, not lit. Cancelled blank line's FCP and cancelled timed line's FCP: Ranger struck R17 on both, same words (D2568 "as built"). Un-cancelled: Sat 18 back. A second uncancelled blank flight that day, first cancelled again: Sat 18 stays. | f12-f12-bell{0,1,2,3}-*, f12-f12-cxblank-armed-clip-*, f12-f12-cxtimed-armed-clip-* |
| F13 = A-S22 | D, P | PASS | (c) Ranger tapped in, the Board's Undo ("Undo — a change to the schedule") empties the seat; picked again, the list is as before (struck R17, "SANS Avail · 0 free"), no stale note; Redo puts him back. (a) Jester struck "SANS — no availability filed for today"; Quals untick → Jester in "Pilots · 29 free", plain. A-S22: a pilot ticked SANS by hand, no posting (the script chose Saber, the first unticked FCP pilot) → struck "SANS — no availability filed for today". (b) Posting moved to Sun 19 → Sat 18 plain in his column; moved back to Fri 17 → struck R17; Undo post out → plain. | f13-f13-c-undone-*, f13-f13-c1-armed-clip-*, f13-f13-a{0,1}-armed-clip-*, f13-f13-t1-*, f13-f13-m19-*, f13-f13-m17-*, f13-f13-undone-* |
| F14 | D | PASS | Week of 20 Jul, Mon 20 blank FCP: Ranger struck with R17 — the same sentence as his hover title in the unpicked list that day ("Ranger — " + R17). Same on the Board. | f14-f14-unpicked-elist-*, f14-f14-earmed-clip-*, f14-f14-board-armed-clip-* |
| F15 | D | PASS | Ranger (signed in himself) filed Fly all day Sat 18 only. Saber: Sat 18 blank FCP plain; Sun 19 struck R17. Bell before seating: empty. Seated on both: bell "…planned on Sun 19 Jul…" only. | f15-f15-18-earmed-clip-*, f15-f15-19-earmed-clip-*, f15-f15-bell1-* |
| A-S09 | D (B/run2), P (B/run1) | PASS | Each time read on the Board with Ranger's crew puck pressed (selection proved on, other places lit): nothing filed — struck R17, no green ring on the blank seat; Fly filed Sat 18 — plain, "SANS Avail · 1 free", green ring; filing deleted — struck, no ring; top bar Undo on Inputs ("Undo — Ranger's SANS Availability", note "Undid: …") — plain, ring; Redo — struck, no ring. Moved to Sun 19 (its window says "To change its dates, delete it and add it again on the SANS calendar." — so delete, then add on Sun 19): Sat 18 struck, no ring; Sun 19 plain. No reload needed. | run2/as09-as09-{0..5}-armed-clip-desktop, -rings-desktop; run1/as09-*-phone |
| A-S14 (sims, RECORD) | D, P | RECORDED + PASS (bell) | Untimed OFT (Sat 18) and AMT (Sun 19), every place armed (front, rear, "+"): Ranger NOT struck, no reason, in SANS Avail ("6 free" on the OFT — every unfiled SANS pilot plain). Bell with Ranger in both: "…planned on Sat 18, Sun 19 Jul…" — PASS (D2568). Timed 13:00–14:00 rows: Ranger struck R17 on every place. **So with no times the crew list and his bell disagree on sims — the owner's open question Q1, unchanged by this build.** | as14-as14-oft-dataslots5oft0p-armed-*, as14-as14-amt-*, as14-as14-bell-*, as14-as14-oft-timed-* |
| A-S17 | D, P | PASS | Posting, two blank lines, Ranger on the first, made through the controls. Weeks changed and back: second line's FCP — struck R17. Reloaded, signed in: both lines kept with no times, Ranger still seated; re-picked — struck R17. Saber filed Fly Sat 18, reloaded: filing kept, Ranger plain. His bell: no reminder for Sat 18 (only "SANS Availability · Sat 18 Jul · You were added · Saber"). | as17-as17-0-*, as17-as17-reloaded-*, as17-as17-{1,2}-armed-clip-*, as17-as17-bell-* |
| A-S19 | D (B/run2), P (B/run1) | PASS | One Sat 18 filing naming Ranger and Marlin (SANS WSO): Ranger plain on FCP, Marlin plain on RCP. Saber took only Ranger out (Save, note "Input updated", people now Marlin): Ranger struck R17, Marlin plain. A Sun 19-only filing for Ranger: Sat 18 still struck. Ranger seated: his bell names Sat 18. | run2/as19-as19-{1,2,3}-{fcp,rcp}-armed-clip-desktop, run2/as19-as19-bell-desktop; run1/as19-*-phone |
| Plain-user round | D, P | PASS / RECORDED | Saber: Edit Schedule; Board Sat 18 → + Wave → Flying wave; seat tapped — Ranger struck R17, "SANS Avail · 0 free"; his name tapped — placed; take-off 13:00, landing 14:00 typed; Board Undo ("Undid: a landing time") takes the landing back, Redo ("Redid: a landing time") restores it; ✓ Done closes the board (Edit Schedule shown); Board reopened; the day's warning list: 1 row, none about SANS. Ranger: bell "You're SANS from Fri 17 Jul. / You're planned on Sat 18 Jul…"; tap opened the SANS calendar on the Sat 18 day window; its ✕ closed it. | plain-pl-{0..12}-* |
| Fit at 402 wide | P | PASS | Blank Sat 18 FCP and RCP picked: every printed reason line (12 men) inside the SANS Avail list — Board drawer 131–388 px, Edit Schedule crew panel 119–392 px; Ranger's long sentence wraps to two lines inside it. | fit-fit-{b,e}-{p,w}-*sans-clip-phone.png |

## FAILs

None in the final runs.

## Seen in passing (walker A's area — leads, not findings; not judged by me)

- **The note after a tap-to-plan on a weekend blank flight is the OIL line, not the SANS sentence.** Tapping Ranger into the blank
  Sat 18 FCP (and Sun 19) left the note "the WAVE 1 line has no usable times, so nobody on it earns OIL for this day"; on the
  Mon 20 blank flight the same tap left "Ranger — SANS from Fri 17 Jul: no availability filed. File it on the Inputs page's SANS
  tab." With two blank lines on Sat 18: "the WAVE 1 line and the WAVE 4 line have no usable times, so nobody on them earns OIL for
  this day (+1 more)". Seats with Ranger seated before the posting (F3b, Mon 20): "Ranger planned". Astra's S02 expects an existing
  warning to take the note's place, so this may be as designed — walker A's F1/A-S02 judges it. Pictures:
  `f3-f3-seat5w0-note-clip-*`, `f3-f3-seat0w2-note-clip-*`, `f12-f12b-seat5w3-note-clip-desktop.png`.

## Console errors

None. Every scenario's "console / page errors / failed requests" check passed at both sizes (run1-d, run1-p, run1-p2, run2-d, fit).

## Script faults (the first desktop run; fixed and re-walked — not the app's)

1. **A-S09's ring read** — run1 desktop as09.1 and as09.3 FAILed "no ring". Cause: a press on a crew puck toggles the selection
   (probe3), and my reader left Ranger selected between reads, so the next press switched him off (0 places lit on the whole board).
   Fixed: the reader clears a leftover selection first, proves the selection is on and that other places are lit before judging,
   and switches it off after. Re-walked: `B/run2` (desktop), run1-p2 (phone) — PASS.
2. **A-S09's move** — tried to change the saved filing's date in its own window; the window says "To change its dates, delete it
   and add it again on the SANS calendar." (`run1/as09-as09-move-form-desktop.png`). Re-walked by that door (delete, add on Sun 19).
3. **A-S19** — stopped with a timeout: the helper that opens a filing reads the SANS month, and the script had not opened the SANS
   tab first (`run1/as19-ERR-desktop.png`). Fixed and re-walked — PASS both sizes.

## What I could not reach, or did differently

- **Fable's F6 named Mon 13 for Jester's filing;** with the clock on Wed 15, Mon 13 is past, so both men's filings were walked on
  Sat 18 (Ranger and Jester together, four worlds). Fable's 08:00–12:00 window kept for Jester, Astra's 08:00–10:00 for Ranger.
- **A-S10's "bell" part** — not walked (Ranger was not seated in F8's world). The bell before/after his date is covered by F3, F12, A-S14.
- **A-S22's hand-ticked pilot** — the script took the first unticked FCP pilot, which was Saber himself (the signed-in admin). Result
  stands (struck with the ordinary words), but another pilot would read more naturally.
- **A-S19 "each member's reminder"** — only Ranger's bell was read; Marlin is SANS by tick with no posting, which gets no reminder
  as built (D2340's reading), so his was not checked.
- **The phone run's single process hung closing WebKit** after F3b (26 min, no error); I stopped that one process (by its id) and ran
  the remaining phone scenarios one process each — all finished. Some older WebKit/Playwright processes stay on the PC; I could
  not tell mine from the other walk's, so I left them.
- The board element stays in the page (hidden) after ✓ Done; "board closed" in the plain round is judged from its picture
  (`plain-pl-7-done-*`: Edit Schedule shown).

Server on 4882 stopped at the end. Nothing committed, pushed or switched; no build, browser-test file or unit suite run.
